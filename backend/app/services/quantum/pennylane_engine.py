"""PennyLane quantum engine — statevector + probabilities via default.qubit."""

import time
import math
import cmath
from typing import Optional

from app.schemas.circuit import PlacementIn, AmpResult, ProbResult
from app.services.quantum.base import QuantumEngine, EngineResult

try:
    import pennylane as qml
    import numpy as np
    HAS_PENNYLANE = True
except (ImportError, AttributeError, Exception):
    HAS_PENNYLANE = False


class PennyLaneEngine(QuantumEngine):
    @property
    def name(self) -> str:
        return "pennylane"

    def simulate(
        self,
        placements: list[PlacementIn],
        qubits: int,
        shots: int = 1024,
        return_statevector: bool = True,
    ) -> EngineResult:
        if not HAS_PENNYLANE:
            return EngineResult(success=False, error="PennyLane is not installed")

        try:
            start = time.perf_counter()

            dev = qml.device("default.qubit", wires=qubits)
            gate_placements = sorted(
                [p for p in placements if p.g not in ("M", "B")],
                key=lambda p: (p.col, p.q),
            )

            @qml.qnode(dev)
            def circuit():
                for p in gate_placements:
                    g = p.g
                    if g == "H": qml.Hadamard(wires=p.q)
                    elif g == "X": qml.PauliX(wires=p.q)
                    elif g == "Y": qml.PauliY(wires=p.q)
                    elif g == "Z": qml.PauliZ(wires=p.q)
                    elif g == "S": qml.S(wires=p.q)
                    elif g == "T": qml.T(wires=p.q)
                    elif g == "RX": qml.RX(p.theta or math.pi / 2, wires=p.q)
                    elif g == "RY": qml.RY(p.theta or math.pi / 2, wires=p.q)
                    elif g == "RZ": qml.RZ(p.theta or math.pi / 2, wires=p.q)
                    elif g == "CNOT": qml.CNOT(wires=[p.q, p.q2])
                    elif g == "CZ": qml.CZ(wires=[p.q, p.q2])
                    elif g == "SWAP": qml.SWAP(wires=[p.q, p.q2])
                return qml.state()

            state = circuit()
            sv_data = np.array(state)

            amps: list[AmpResult] = []
            probs: list[ProbResult] = []

            for i, amp in enumerate(sv_data):
                label = "".join(str((i >> q) & 1) for q in range(qubits))
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

            # Simulate counts from probabilities
            counts: dict[str, int] = {}
            prob_array = np.array([abs(a) ** 2 for a in sv_data])
            samples = np.random.choice(len(sv_data), size=shots, p=prob_array)
            for idx in samples:
                label = "".join(str((idx >> q) & 1) for q in range(qubits))
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
