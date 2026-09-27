"""Framework-specific Python code generation from Placement[].

Mirrors the frontend genCode() function but runs server-side for clean API access.
"""

import math
from app.schemas.circuit import PlacementIn


def generate_code(placements: list[PlacementIn], qubits: int, framework: str) -> str:
    """Generate executable Python code from placements."""
    if framework == "pennylane":
        return _gen_pennylane(placements, qubits)
    elif framework == "cirq":
        return _gen_cirq(placements, qubits)
    return _gen_qiskit(placements, qubits)


def _th(p: PlacementIn) -> str:
    return f"{(p.theta or math.pi / 2):.2f}"


def _gen_qiskit(placements: list[PlacementIn], qubits: int) -> str:
    ops = sorted(placements, key=lambda p: (p.col, p.q))
    lines = []
    for p in ops:
        g = p.g
        if g == "CNOT": lines.append(f"qc.cx({p.q}, {p.q2})")
        elif g == "CZ": lines.append(f"qc.cz({p.q}, {p.q2})")
        elif g == "SWAP": lines.append(f"qc.swap({p.q}, {p.q2})")
        elif g in ("RX", "RY", "RZ"): lines.append(f"qc.{g.lower()}({_th(p)}, {p.q})")
        elif g == "M": lines.append(f"qc.measure({p.q}, {p.q})")
        elif g == "B": lines.append("qc.barrier()")
        else: lines.append(f"qc.{g.lower()}({p.q})")

    body = "\n".join(lines) if lines else "# add gates"
    return (
        f"from qiskit import QuantumCircuit\n"
        f"from qiskit_aer import AerSimulator\n"
        f"\n"
        f"qc = QuantumCircuit({qubits}, {qubits})\n"
        f"\n"
        f"{body}\n"
        f"\n"
        f"sim = AerSimulator()\n"
        f"result = sim.run(qc, shots=1024).result()"
    )


def _gen_pennylane(placements: list[PlacementIn], qubits: int) -> str:
    PL_MAP = {"H": "Hadamard", "X": "PauliX", "Y": "PauliY", "Z": "PauliZ", "S": "S", "T": "T"}
    ops = sorted(placements, key=lambda p: (p.col, p.q))
    lines = []
    for p in ops:
        g = p.g
        if g == "CNOT": lines.append(f"qml.CNOT(wires=[{p.q}, {p.q2}])")
        elif g == "CZ": lines.append(f"qml.CZ(wires=[{p.q}, {p.q2}])")
        elif g == "SWAP": lines.append(f"qml.SWAP(wires=[{p.q}, {p.q2}])")
        elif g in ("RX", "RY", "RZ"): lines.append(f"qml.{g}({_th(p)}, wires={p.q})")
        elif g in ("M", "B"): continue
        else: lines.append(f"qml.{PL_MAP.get(g, g)}(wires={p.q})")

    body = "\n    ".join(lines) if lines else "pass"
    return (
        f"import pennylane as qml\n"
        f"\n"
        f'dev = qml.device("default.qubit", wires={qubits})\n'
        f"\n"
        f"@qml.qnode(dev)\n"
        f"def circuit():\n"
        f"    {body}\n"
        f"    return qml.probs(wires=range({qubits}))"
    )


def _gen_cirq(placements: list[PlacementIn], qubits: int) -> str:
    ops = sorted(placements, key=lambda p: (p.col, p.q))
    lines = []
    for p in ops:
        g = p.g
        if g == "CNOT": lines.append(f"cirq.CNOT(q[{p.q}], q[{p.q2}])")
        elif g == "CZ": lines.append(f"cirq.CZ(q[{p.q}], q[{p.q2}])")
        elif g == "SWAP": lines.append(f"cirq.SWAP(q[{p.q}], q[{p.q2}])")
        elif g in ("RX", "RY", "RZ"):
            lines.append(f"cirq.r{g[1].lower()}({_th(p)}).on(q[{p.q}])")
        elif g == "M": lines.append(f"cirq.measure(q[{p.q}])")
        elif g == "B": continue
        else: lines.append(f"cirq.{g}(q[{p.q}])")

    body = ",\n    ".join(lines) if lines else "# empty"
    return (
        f"import cirq\n"
        f"\n"
        f"q = cirq.LineQubit.range({qubits})\n"
        f"circuit = cirq.Circuit([\n"
        f"    {body}\n"
        f"])\n"
        f"\n"
        f"sim = cirq.Simulator()\n"
        f"result = sim.simulate(circuit)"
    )
