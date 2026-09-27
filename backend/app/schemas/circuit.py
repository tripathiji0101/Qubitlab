"""Circuit and simulation schemas matching frontend data shapes."""

from pydantic import BaseModel, Field
from typing import Optional


# ── Frontend-compatible placement (source of truth for circuit wire) ──

class PlacementIn(BaseModel):
    """Matches the frontend Placement type exactly."""
    id: str
    g: str  # gate name: H, X, CNOT, etc.
    col: int  # moment/column
    q: int  # primary qubit
    q2: Optional[int] = None  # second qubit for 2-qubit gates
    theta: Optional[float] = None  # rotation param


# ── Canonical circuit (internal representation) ──

class CanonicalGate(BaseModel):
    id: str
    type: str  # H, X, Y, Z, S, T, RX, RY, RZ, CX, CZ, SWAP, M, B
    targets: list[int]
    controls: list[int] = []
    parameters: list[float] = []
    moment: int = 0


class CanonicalCircuit(BaseModel):
    qubits: int
    classical_bits: int = 0
    gates: list[CanonicalGate] = []
    measurements: list[dict] = []


# ── Simulation request/response ──

class SimulationRequest(BaseModel):
    placements: list[PlacementIn]  # accept frontend format
    qubits: int = 2
    framework: str = "qiskit"  # qiskit/pennylane/cirq
    backend: str = "aer"
    shots: int = Field(default=1024, ge=1, le=100000)
    return_statevector: bool = True


class AmpResult(BaseModel):
    """Single amplitude — matches frontend { state, re, im, p, phase }."""
    state: str
    re: float
    im: float
    p: float
    phase: float


class ProbResult(BaseModel):
    """Single probability — matches frontend { state, p }."""
    state: str
    p: float  # percentage 0-100


class SimulationResponse(BaseModel):
    success: bool = True
    execution: dict = {}  # framework, backend, shots, execution_time_ms
    circuit_info: dict = {}  # qubits, classical_bits, gate_count, depth
    amps: list[AmpResult] = []  # statevector amplitudes
    probs: list[ProbResult] = []  # probability percentages
    counts: dict[str, int] = {}  # measurement counts
    bloch_spheres: list[dict] = []
    qsphere: list[dict] = []
    errors: list[dict] = []


# ── Circuit CRUD ──

class CircuitCreate(BaseModel):
    name: str = "Untitled Circuit"
    qubits: int = 2
    placements: list[PlacementIn] = []
    sdk: str = "Qiskit"
    project_slug: Optional[str] = None


class CircuitUpdate(BaseModel):
    name: Optional[str] = None
    qubits: Optional[int] = None
    placements: Optional[list[PlacementIn]] = None
    sdk: Optional[str] = None


class CircuitResponse(BaseModel):
    id: str
    name: str
    qubits: int
    classical_bits: int
    placements: list[dict]
    sdk: str
    project_slug: Optional[str]
    version: int
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}


# ── Code generation ──

class CodeGenRequest(BaseModel):
    placements: list[PlacementIn]
    qubits: int = 2
    framework: str = "qiskit"


class CodeGenResponse(BaseModel):
    framework: str
    language: str = "python"
    code: str


# ── Circuit validation ──

class ValidationError(BaseModel):
    code: str
    message: str
    gate_id: Optional[str] = None


class ValidationResponse(BaseModel):
    valid: bool
    errors: list[ValidationError] = []


# ── Quantum IDE Code Execution ──

class CodeExecutionRequest(BaseModel):
    code: str
    framework: str = "qiskit"  # qiskit | pennylane | cirq | native
    shots: int = Field(default=1024, ge=1, le=100000)
    backend: str = "aer_simulator"
    return_statevector: bool = True


class CodeExecutionError(BaseModel):
    code: str
    message: str
    line: Optional[int] = None
    col: Optional[int] = None
    snippet: Optional[str] = None


class CodeExecutionResponse(BaseModel):
    success: bool
    framework: str
    qubits: int = 2
    placements: list[PlacementIn] = []
    execution: dict = {}
    circuit_info: dict = {}
    amps: list[AmpResult] = []
    probs: list[ProbResult] = []
    counts: dict[str, int] = {}
    bloch_spheres: list[dict] = []
    qsphere: list[dict] = []
    output: str = ""
    errors: list[CodeExecutionError] = []

