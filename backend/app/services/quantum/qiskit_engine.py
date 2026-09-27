"""Qiskit Aer quantum engine — the primary backend.

Converts frontend Placement[] → Qiskit QuantumCircuit → Aer simulation → normalized result.
"""

import time
import math
import cmath
from typing import Optional

from app.schemas.circuit import PlacementIn, AmpResult, ProbResult
from app.services.quantum.base import QuantumEngine, EngineResult

# Qiskit imports — these are runtime dependencies
try:
    from qiskit import QuantumCircuit
    from qiskit_aer import AerSimulator
    from qiskit.quantum_info import Statevector
    HAS_QISKIT = True
except ImportError:
    HAS_QISKIT = False


TWO_QUBIT = {"CNOT", "CZ", "SWAP"}
ROTATION = {"RX", "RY", "RZ"}


class QiskitEngine(QuantumEngine):
    @property
    def name(self) -> str:
        return "qiskit"

    def _placements_to_qc(self, placements: list[PlacementIn], qubits: int) -> "QuantumCircuit":
        """Convert frontend Placement[] to a Qiskit QuantumCircuit."""
        qc = QuantumCircuit(qubits, qubits)
        sorted_placements = sorted(placements, key=lambda p: (p.col, p.q))

        for p in sorted_placements:
            g = p.g
            if g == "M":
                if p.q < qubits:
                    qc.measure(p.q, p.q)
            elif g == "B":
                qc.barrier()
            elif g == "H":
                qc.h(p.q)
            elif g == "X":
                qc.x(p.q)
            elif g == "Y":
                qc.y(p.q)
            elif g == "Z":
                qc.z(p.q)
            elif g == "S":
                qc.s(p.q)
            elif g == "T":
                qc.t(p.q)
            elif g == "RX":
                qc.rx(p.theta or math.pi / 2, p.q)
            elif g == "RY":
                qc.ry(p.theta or math.pi / 2, p.q)
            elif g == "RZ":
                qc.rz(p.theta or math.pi / 2, p.q)
            elif g == "CNOT":
                qc.cx(p.q, p.q2)
            elif g == "CZ":
                qc.cz(p.q, p.q2)
            elif g == "SWAP":
                qc.swap(p.q, p.q2)

        return qc

    def simulate(
        self,
        placements: list[PlacementIn],
        qubits: int,
        shots: int = 1024,
        return_statevector: bool = True,
    ) -> EngineResult:
        if not HAS_QISKIT:
            return EngineResult(success=False, error="Qiskit is not installed")

        try:
            start = time.perf_counter()

            # Build circuit without measurements for statevector
            gate_placements = [p for p in placements if p.g not in ("M", "B")]
            qc_sv = self._placements_to_qc(
                [p for p in gate_placements],
                qubits,
            )

            amps: list[AmpResult] = []
            probs: list[ProbResult] = []
            counts: dict[str, int] = {}

            if return_statevector:
                # Statevector simulation (no measurements)
                qc_clean = QuantumCircuit(qubits)
                for p in sorted(gate_placements, key=lambda p: (p.col, p.q)):
                    g = p.g
                    if g == "H": qc_clean.h(p.q)
                    elif g == "X": qc_clean.x(p.q)
                    elif g == "Y": qc_clean.y(p.q)
                    elif g == "Z": qc_clean.z(p.q)
                    elif g == "S": qc_clean.s(p.q)
                    elif g == "T": qc_clean.t(p.q)
                    elif g == "RX": qc_clean.rx(p.theta or math.pi / 2, p.q)
                    elif g == "RY": qc_clean.ry(p.theta or math.pi / 2, p.q)
                    elif g == "RZ": qc_clean.rz(p.theta or math.pi / 2, p.q)
                    elif g == "CNOT": qc_clean.cx(p.q, p.q2)
                    elif g == "CZ": qc_clean.cz(p.q, p.q2)
                    elif g == "SWAP": qc_clean.swap(p.q, p.q2)

                sv = Statevector.from_instruction(qc_clean)
                sv_data = sv.data

                # Build amps and probs matching frontend format
                # Frontend uses LSB qubit ordering (q0 is rightmost in label)
                for i, amp in enumerate(sv_data):
                    # Label: binary string with q0 as least significant
                    label = "".join(str((i >> q) & 1) for q in range(qubits))
                    probability = abs(amp) ** 2
                    phase = cmath.phase(amp)

                    amps.append(AmpResult(
                        state=label,
                        re=round(amp.real, 6),
                        im=round(amp.imag, 6),
                        p=round(probability, 6),
                        phase=round(phase, 6),
                    ))
                    probs.append(ProbResult(
                        state=label,
                        p=round(probability * 100, 1),
                    ))

            # Shot-based measurement simulation
            qc_meas = self._placements_to_qc(placements, qubits)
            has_measurements = any(p.g == "M" for p in placements)
            if not has_measurements:
                qc_meas.measure_all(add_bits=False)
                # Re-add classical bits
                qc_meas = QuantumCircuit(qubits, qubits)
                for p in sorted(gate_placements, key=lambda p: (p.col, p.q)):
                    g = p.g
                    if g == "H": qc_meas.h(p.q)
                    elif g == "X": qc_meas.x(p.q)
                    elif g == "Y": qc_meas.y(p.q)
                    elif g == "Z": qc_meas.z(p.q)
                    elif g == "S": qc_meas.s(p.q)
                    elif g == "T": qc_meas.t(p.q)
                    elif g == "RX": qc_meas.rx(p.theta or math.pi / 2, p.q)
                    elif g == "RY": qc_meas.ry(p.theta or math.pi / 2, p.q)
                    elif g == "RZ": qc_meas.rz(p.theta or math.pi / 2, p.q)
                    elif g == "CNOT": qc_meas.cx(p.q, p.q2)
                    elif g == "CZ": qc_meas.cz(p.q, p.q2)
                    elif g == "SWAP": qc_meas.swap(p.q, p.q2)
                qc_meas.measure(list(range(qubits)), list(range(qubits)))

            sim = AerSimulator()
            job = sim.run(qc_meas, shots=shots)
            result = job.result()
            raw_counts = result.get_counts()

            # Convert Qiskit bit ordering to our label format
            for bitstring, count in raw_counts.items():
                # Qiskit returns MSB ordering, convert to our LSB format
                label = bitstring.replace(" ", "")[::-1][:qubits]
                counts[label] = counts.get(label, 0) + count

            elapsed = (time.perf_counter() - start) * 1000

            return EngineResult(
                success=True,
                amps=amps,
                probs=probs,
                counts=counts,
                execution_time_ms=round(elapsed, 1),
            )

        except Exception as e:
            return EngineResult(success=False, error=str(e))
