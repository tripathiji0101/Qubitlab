"""Cirq quantum engine — statevector simulation via cirq.Simulator."""

import time
import math
import cmath
from typing import Optional

from app.schemas.circuit import PlacementIn, AmpResult, ProbResult
from app.services.quantum.base import QuantumEngine, EngineResult

try:
    import cirq
    import numpy as np
    HAS_CIRQ = True
except ImportError:
    HAS_CIRQ = False


class CirqEngine(QuantumEngine):
    @property
    def name(self) -> str:
        return "cirq"

    def simulate(
        self,
        placements: list[PlacementIn],
        qubits: int,
        shots: int = 1024,
        return_statevector: bool = True,
    ) -> EngineResult:
        if not HAS_CIRQ:
            return EngineResult(success=False, error="Cirq is not installed")

        try:
            start = time.perf_counter()

            q = cirq.LineQubit.range(qubits)
            gate_placements = sorted(
                [p for p in placements if p.g not in ("M", "B")],
                key=lambda p: (p.col, p.q),
            )

            ops = []
            for p in gate_placements:
                g = p.g
                if g == "H": ops.append(cirq.H(q[p.q]))
                elif g == "X": ops.append(cirq.X(q[p.q]))
                elif g == "Y": ops.append(cirq.Y(q[p.q]))
                elif g == "Z": ops.append(cirq.Z(q[p.q]))
                elif g == "S": ops.append(cirq.S(q[p.q]))
                elif g == "T": ops.append(cirq.T(q[p.q]))
                elif g == "RX": ops.append(cirq.rx(p.theta or math.pi / 2).on(q[p.q]))
                elif g == "RY": ops.append(cirq.ry(p.theta or math.pi / 2).on(q[p.q]))
                elif g == "RZ": ops.append(cirq.rz(p.theta or math.pi / 2).on(q[p.q]))
                elif g == "CNOT": ops.append(cirq.CNOT(q[p.q], q[p.q2]))
                elif g == "CZ": ops.append(cirq.CZ(q[p.q], q[p.q2]))
                elif g == "SWAP": ops.append(cirq.SWAP(q[p.q], q[p.q2]))

            circuit = cirq.Circuit(ops)
            sim = cirq.Simulator()
            result = sim.simulate(circuit)
            sv_data = result.final_state_vector

            amps: list[AmpResult] = []
            probs: list[ProbResult] = []

            for i, amp in enumerate(sv_data):
                # Cirq uses MSB ordering by default — match our LSB format
                label = "".join(str((i >> q_idx) & 1) for q_idx in range(qubits))
                probability = float(abs(amp) ** 2)
                phase = float(cmath.phase(complex(amp)))

                amps.append(AmpResult(
                    state=label,
                    re=round(float(amp.real), 6),
                    im=round(float(amp.imag), 6),
                    p=round(probability, 6),
                    phase=round(phase, 6),
                ))
                probs.append(ProbResult(
                    state=label,
                    p=round(probability * 100, 1),
                ))

            # Simulate counts
            counts: dict[str, int] = {}
            prob_array = np.array([abs(a) ** 2 for a in sv_data])
            prob_array = prob_array / prob_array.sum()  # normalize
            samples = np.random.choice(len(sv_data), size=shots, p=prob_array)
            for idx in samples:
                label = "".join(str((idx >> q_idx) & 1) for q_idx in range(qubits))
                counts[label] = counts.get(label, 0) + 1

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
