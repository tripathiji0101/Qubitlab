"""Simulation and circuit CRUD endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
import math
import cmath

from app.core.database import get_db
from app.core.security import get_current_user_id, get_optional_user_id
from app.core.config import settings
from app.schemas.circuit import (
    SimulationRequest,
    SimulationResponse,
    CircuitCreate,
    CircuitUpdate,
    CircuitResponse,
    CodeGenRequest,
    CodeGenResponse,
    CodeExecutionRequest,
    CodeExecutionResponse,
    CodeExecutionError,
)
from app.services.quantum.validator import validate_circuit
from app.services.quantum.base import get_engine
from app.services.quantum.code_generator import generate_code
from app.services.quantum.code_parser import parse_and_validate_quantum_code
from app.models.circuit import Circuit, CircuitVersion
from app.models.simulation import SimulationResult


sim_router = APIRouter(prefix="/simulations", tags=["simulations"])
circuit_router = APIRouter(prefix="/circuits", tags=["circuits"])


# ═══════════════════════ SIMULATIONS ═══════════════════════


@sim_router.post("/run", response_model=SimulationResponse)
async def run_simulation(
    body: SimulationRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    # Validate
    validation = validate_circuit(
        body.placements, body.qubits,
        max_qubits=settings.MAX_QUBITS,
        max_depth=settings.MAX_CIRCUIT_DEPTH,
        max_gates=settings.MAX_GATES,
    )
    if not validation.valid:
        return SimulationResponse(
            success=False,
            errors=[{"code": e.code, "message": e.message} for e in validation.errors],
        )

    # Run simulation
    try:
        engine = get_engine(body.framework)
    except ValueError:
        engine = get_engine("qiskit")

    result = engine.simulate(
        body.placements, body.qubits, body.shots, body.return_statevector,
    )

    if not result.success:
        return SimulationResponse(
            success=False,
            errors=[{"code": "SIM_ERROR", "message": result.error or "Unknown error"}],
        )

    gate_count = len([p for p in body.placements if p.g not in ("M", "B")])
    depth = max((p.col for p in body.placements), default=0) + 1 if body.placements else 0

    # Persist result
    sim_record = SimulationResult(
        user_id=user_id,
        framework=body.framework,
        backend_name=body.backend,
        shots=body.shots,
        qubits=body.qubits,
        gate_count=gate_count,
        depth=depth,
        execution_time_ms=result.execution_time_ms,
        results_json={
            "amps": [a.model_dump() for a in (result.amps or [])],
            "probs": [p.model_dump() for p in (result.probs or [])],
            "counts": result.counts or {},
        },
    )
    db.add(sim_record)

    # Build Bloch sphere data
    bloch_spheres = []
    if result.amps:
        for q in range(body.qubits):
            alpha_sq = sum(a.p for a in result.amps if a.state[q] == "0")
            beta_sq = sum(a.p for a in result.amps if a.state[q] == "1")

            # Compute off-diagonal element ρ₀₁ of reduced density matrix
            # Group amplitudes by the state of all qubits EXCEPT qubit q
            zero_amps: dict[str, complex] = {}
            one_amps: dict[str, complex] = {}
            for a in result.amps:
                key = a.state[:q] + a.state[q + 1:]  # state label without qubit q
                c = complex(a.re, a.im)
                if a.state[q] == "0":
                    zero_amps[key] = c
                else:
                    one_amps[key] = c

            # ρ₀₁ = Σ_k  α_k* · β_k  (sum over matching basis states of other qubits)
            rho_01 = sum(
                zero_amps[k].conjugate() * one_amps[k]
                for k in zero_amps if k in one_amps
            )

            theta = 2 * math.acos(min(1.0, math.sqrt(max(0.0, alpha_sq)))) if alpha_sq > 0 else math.pi
            phi = cmath.phase(rho_01) if abs(rho_01) > 1e-10 else 0.0
            bloch_spheres.append({"qubit": q, "theta": round(theta, 3), "phi": round(phi, 3)})


    # Build QSphere data
    qsphere = []
    if result.amps:
        for a in result.amps:
            if a.p > 0.001:
                qsphere.append({
                    "label": a.state,
                    "amp": round(math.sqrt(a.p), 3),
                    "phase": round(a.phase, 3),
                })

    return SimulationResponse(
        success=True,
        execution={
            "framework": body.framework,
            "backend": body.backend,
            "shots": body.shots,
            "execution_time_ms": result.execution_time_ms,
        },
        circuit_info={
            "qubits": body.qubits,
            "classical_bits": body.qubits,
            "gate_count": gate_count,
            "depth": depth,
        },
        amps=result.amps or [],
        probs=result.probs or [],
        counts=result.counts or {},
        bloch_spheres=bloch_spheres,
        qsphere=qsphere,
    )


@sim_router.post("/run-code", response_model=CodeExecutionResponse)
async def run_code(
    body: CodeExecutionRequest,
    user_id: str = Depends(get_optional_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Safely parse, transpile, and execute quantum code via existing framework engines."""
    framework = body.framework.lower().strip()
    if framework not in ("qiskit", "pennylane", "cirq", "native"):
        return CodeExecutionResponse(
            success=False,
            framework=framework,
            errors=[
                CodeExecutionError(
                    code="UNSUPPORTED_FRAMEWORK",
                    message=f"Framework '{body.framework}' is not supported. Supported: Qiskit, PennyLane, Cirq, Native.",
                )
            ],
            output=f"Error: Framework '{body.framework}' is not supported.",
        )

    # 1. Safe AST parse and gate extraction
    parsed = parse_and_validate_quantum_code(
        body.code,
        framework=framework,
        max_qubits=settings.MAX_QUBITS,
        max_depth=settings.MAX_CIRCUIT_DEPTH,
    )

    if not parsed.success:
        err_msgs = [f"Line {e.line}: {e.message}" for e in parsed.errors]
        output_lines = [
            f"═══ Quantum IDE Execution Error ({framework.upper()}) ═══",
            *err_msgs,
        ]
        return CodeExecutionResponse(
            success=False,
            framework=framework,
            qubits=parsed.qubits,
            placements=parsed.placements,
            errors=[
                CodeExecutionError(
                    code=e.code,
                    message=e.message,
                    line=e.line,
                    col=e.col,
                    snippet=e.snippet,
                )
                for e in parsed.errors
            ],
            output="\n".join(output_lines),
        )

    # 2. Semantic circuit validation
    validation = validate_circuit(
        parsed.placements,
        parsed.qubits,
        max_qubits=settings.MAX_QUBITS,
        max_depth=settings.MAX_CIRCUIT_DEPTH,
        max_gates=settings.MAX_GATES,
    )
    if not validation.valid:
        err_msgs = [f"Validation Error [{e.code}]: {e.message}" for e in validation.errors]
        return CodeExecutionResponse(
            success=False,
            framework=framework,
            qubits=parsed.qubits,
            placements=parsed.placements,
            errors=[
                CodeExecutionError(code=e.code, message=e.message)
                for e in validation.errors
            ],
            output="\n".join([f"═══ Circuit Validation Failed ═══", *err_msgs]),
        )

    # 3. Execute via existing framework engine
    engine_key = "qiskit" if framework in ("qiskit", "native") else framework
    try:
        engine = get_engine(engine_key)
    except ValueError:
        try:
            from app.main import _register_engines
            _register_engines()
            engine = get_engine(engine_key)
        except Exception:
            engine = get_engine("qiskit")

    result = engine.simulate(
        parsed.placements,
        parsed.qubits,
        shots=body.shots,
        return_statevector=body.return_statevector,
    )

    if not result.success:
        return CodeExecutionResponse(
            success=False,
            framework=framework,
            qubits=parsed.qubits,
            placements=parsed.placements,
            errors=[
                CodeExecutionError(
                    code="SIM_ERROR",
                    message=result.error or "Simulation failed",
                )
            ],
            output=f"Simulation Error ({framework}): {result.error}",
        )

    gate_count = len([p for p in parsed.placements if p.g not in ("M", "B")])
    depth = max((p.col for p in parsed.placements), default=0) + 1 if parsed.placements else 0

    # 4. Persist result in DB (for authenticated users)
    if user_id and user_id != "guest-user":
        try:
            sim_record = SimulationResult(
                user_id=user_id,
                framework=framework,
                backend_name=body.backend,
                shots=body.shots,
                qubits=parsed.qubits,
                gate_count=gate_count,
                depth=depth,
                execution_time_ms=result.execution_time_ms,
                results_json={
                    "amps": [a.model_dump() for a in (result.amps or [])],
                    "probs": [p.model_dump() for p in (result.probs or [])],
                    "counts": result.counts or {},
                },
            )
            db.add(sim_record)
        except Exception:
            pass

    # 5. Compute Bloch sphere and QSphere data
    bloch_spheres = []
    if result.amps:
        for q in range(parsed.qubits):
            alpha_sq = sum(a.p for a in result.amps if a.state[q] == "0")
            zero_amps: dict[str, complex] = {}
            one_amps: dict[str, complex] = {}
            for a in result.amps:
                key = a.state[:q] + a.state[q + 1:]
                c = complex(a.re, a.im)
                if a.state[q] == "0":
                    zero_amps[key] = c
                else:
                    one_amps[key] = c

            rho_01 = sum(
                zero_amps[k].conjugate() * one_amps[k]
                for k in zero_amps if k in one_amps
            )

            theta = 2 * math.acos(min(1.0, math.sqrt(max(0.0, alpha_sq)))) if alpha_sq > 0 else math.pi
            phi = cmath.phase(rho_01) if abs(rho_01) > 1e-10 else 0.0
            bloch_spheres.append({"qubit": q, "theta": round(theta, 3), "phi": round(phi, 3)})

    qsphere = []
    if result.amps:
        for a in result.amps:
            if a.p > 0.001:
                qsphere.append({
                    "label": a.state,
                    "amp": round(math.sqrt(a.p), 3),
                    "phase": round(a.phase, 3),
                })

    output_summary = "\n".join([
        f"═══ QubitLab Quantum Execution ═══",
        f"Framework:       {framework.upper()}",
        f"Backend:         {body.backend}",
        f"Qubits:          {parsed.qubits}",
        f"Gates:           {gate_count}",
        f"Depth:           {depth}",
        f"Shots:           {body.shots}",
        f"Execution Time:  {result.execution_time_ms:.1f} ms",
        f"Status:          COMPLETED SUCCESSFULLY",
    ])

    return CodeExecutionResponse(
        success=True,
        framework=framework,
        qubits=parsed.qubits,
        placements=parsed.placements,
        execution={
            "framework": framework,
            "backend": body.backend,
            "shots": body.shots,
            "execution_time_ms": result.execution_time_ms,
        },
        circuit_info={
            "qubits": parsed.qubits,
            "classical_bits": parsed.qubits,
            "gate_count": gate_count,
            "depth": depth,
        },
        amps=result.amps or [],
        probs=result.probs or [],
        counts=result.counts or {},
        bloch_spheres=bloch_spheres,
        qsphere=qsphere,
        output=output_summary,
        errors=[],
    )



# ═══════════════════════ CIRCUITS ═══════════════════════


@circuit_router.post("", response_model=CircuitResponse, status_code=201)
async def create_circuit(
    body: CircuitCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    circuit = Circuit(
        user_id=user_id,
        name=body.name,
        qubits=body.qubits,
        classical_bits=body.qubits,
        placements_json=[p.model_dump() for p in body.placements],
        sdk=body.sdk,
        project_slug=body.project_slug,
    )
    db.add(circuit)
    await db.flush()

    return _circuit_response(circuit)


@circuit_router.get("", response_model=list[CircuitResponse])
async def list_circuits(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Circuit).where(Circuit.user_id == user_id).order_by(desc(Circuit.updated_at)).limit(50)
    )
    return [_circuit_response(c) for c in result.scalars().all()]


@circuit_router.get("/{circuit_id}", response_model=CircuitResponse)
async def get_circuit(
    circuit_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Circuit).where(Circuit.id == circuit_id, Circuit.user_id == user_id)
    )
    circuit = result.scalar_one_or_none()
    if not circuit:
        raise HTTPException(status_code=404, detail="Circuit not found")
    return _circuit_response(circuit)


@circuit_router.put("/{circuit_id}", response_model=CircuitResponse)
async def update_circuit(
    circuit_id: str,
    body: CircuitUpdate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Circuit).where(Circuit.id == circuit_id, Circuit.user_id == user_id)
    )
    circuit = result.scalar_one_or_none()
    if not circuit:
        raise HTTPException(status_code=404, detail="Circuit not found")

    # Save version before update
    version = CircuitVersion(
        circuit_id=circuit.id,
        version=circuit.version,
        qubits=circuit.qubits,
        placements_json=circuit.placements_json,
    )
    db.add(version)

    if body.name is not None:
        circuit.name = body.name
    if body.qubits is not None:
        circuit.qubits = body.qubits
        circuit.classical_bits = body.qubits
    if body.placements is not None:
        circuit.placements_json = [p.model_dump() for p in body.placements]
    if body.sdk is not None:
        circuit.sdk = body.sdk
    circuit.version += 1

    return _circuit_response(circuit)


@circuit_router.delete("/{circuit_id}", status_code=204)
async def delete_circuit(
    circuit_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Circuit).where(Circuit.id == circuit_id, Circuit.user_id == user_id)
    )
    circuit = result.scalar_one_or_none()
    if not circuit:
        raise HTTPException(status_code=404, detail="Circuit not found")
    await db.delete(circuit)


@circuit_router.post("/generate-code", response_model=CodeGenResponse)
async def generate_circuit_code(
    body: CodeGenRequest,
    user_id: str = Depends(get_current_user_id),
):
    code = generate_code(body.placements, body.qubits, body.framework)
    return CodeGenResponse(framework=body.framework, code=code)


def _circuit_response(c: Circuit) -> CircuitResponse:
    return CircuitResponse(
        id=c.id,
        name=c.name,
        qubits=c.qubits,
        classical_bits=c.classical_bits,
        placements=c.placements_json or [],
        sdk=c.sdk,
        project_slug=c.project_slug,
        version=c.version,
        created_at=c.created_at.isoformat() if c.created_at else "",
        updated_at=c.updated_at.isoformat() if c.updated_at else "",
    )
