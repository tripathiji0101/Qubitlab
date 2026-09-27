/**
 * Standard starter templates for Quantum IDE frameworks.
 * All examples are verified against the real quantum execution engines.
 */

export interface CodeTemplate {
  id: string;
  name: string;
  description: string;
  code: string;
}

export const STARTER_TEMPLATES: Record<string, CodeTemplate[]> = {
  Qiskit: [
    {
      id: "bell_state",
      name: "Bell State (|Φ+⟩)",
      description: "Creates maximally entangled 2-qubit Bell pair: (|00⟩ + |11⟩) / √2",
      code: `from qiskit import QuantumCircuit

# Initialize a 2-qubit Quantum Circuit
qc = QuantumCircuit(2)

# Put qubit 0 into superposition
qc.h(0)

# Entangle qubit 0 with qubit 1
qc.cx(0, 1)
`,
    },
    {
      id: "superposition",
      name: "Single Qubit Superposition",
      description: "Applies Hadamard gate to create |+⟩ state",
      code: `from qiskit import QuantumCircuit

qc = QuantumCircuit(1)
qc.h(0)
`,
    },
    {
      id: "ghz_state",
      name: "3-Qubit GHZ State",
      description: "Greenberger–Horne–Zeilinger entangled state: (|000⟩ + |111⟩) / √2",
      code: `from qiskit import QuantumCircuit

qc = QuantumCircuit(3)
qc.h(0)
qc.cx(0, 1)
qc.cx(1, 2)
`,
    },
    {
      id: "phase_rotation",
      name: "Phase Rotation Circuit",
      description: "Applies parameterized RX and RZ rotations",
      code: `import math
from qiskit import QuantumCircuit

qc = QuantumCircuit(2)
qc.h(0)
qc.rz(math.pi / 4, 0)
qc.cx(0, 1)
qc.rx(math.pi / 2, 1)
`,
    },
  ],

  PennyLane: [
    {
      id: "bell_state",
      name: "Bell State (|Φ+⟩)",
      description: "Entangled Bell state executed on default.qubit device",
      code: `import pennylane as qml

# Initialize PennyLane device
dev = qml.device("default.qubit", wires=2)

@qml.qnode(dev)
def circuit():
    # Superposition on wire 0
    qml.Hadamard(wires=0)
    # Entangle with wire 1
    qml.CNOT(wires=[0, 1])
    return qml.probs(wires=range(2))
`,
    },
    {
      id: "superposition",
      name: "Superposition",
      description: "Single qubit superposition in PennyLane",
      code: `import pennylane as qml

dev = qml.device("default.qubit", wires=1)

@qml.qnode(dev)
def circuit():
    qml.Hadamard(wires=0)
    return qml.probs(wires=[0])
`,
    },
    {
      id: "ghz_state",
      name: "3-Qubit GHZ State",
      description: "Tripartite entanglement in PennyLane",
      code: `import pennylane as qml

dev = qml.device("default.qubit", wires=3)

@qml.qnode(dev)
def circuit():
    qml.Hadamard(wires=0)
    qml.CNOT(wires=[0, 1])
    qml.CNOT(wires=[1, 2])
    return qml.probs(wires=range(3))
`,
    },
  ],

  Cirq: [
    {
      id: "bell_state",
      name: "Bell State (|Φ+⟩)",
      description: "Entangled Bell pair simulated with cirq.Simulator",
      code: `import cirq

# Define 2 qubits on a line
q = cirq.LineQubit.range(2)

# Build Bell circuit
circuit = cirq.Circuit([
    cirq.H(q[0]),
    cirq.CNOT(q[0], q[1])
])

sim = cirq.Simulator()
result = sim.simulate(circuit)
`,
    },
    {
      id: "superposition",
      name: "Superposition",
      description: "Single qubit Hadamard with Cirq",
      code: `import cirq

q = cirq.LineQubit.range(1)
circuit = cirq.Circuit([
    cirq.H(q[0])
])

sim = cirq.Simulator()
result = sim.simulate(circuit)
`,
    },
    {
      id: "ghz_state",
      name: "3-Qubit GHZ State",
      description: "3-qubit GHZ state with Cirq",
      code: `import cirq

q = cirq.LineQubit.range(3)
circuit = cirq.Circuit([
    cirq.H(q[0]),
    cirq.CNOT(q[0], q[1]),
    cirq.CNOT(q[1], q[2])
])

sim = cirq.Simulator()
result = sim.simulate(circuit)
`,
    },
  ],

  Native: [
    {
      id: "bell_state",
      name: "Bell State (|Φ+⟩)",
      description: "Native QubitLab circuit representation",
      code: `# QubitLab Native Quantum Circuit
from qubitlab import QuantumCircuit

qc = QuantumCircuit(2)
qc.h(0)
qc.cx(0, 1)
`,
    },
    {
      id: "superposition",
      name: "Superposition",
      description: "Native single-qubit Hadamard",
      code: `from qubitlab import QuantumCircuit

qc = QuantumCircuit(1)
qc.h(0)
`,
    },
  ],
};

export function getDefaultStarterCode(framework: string): string {
  const templates = STARTER_TEMPLATES[framework] || STARTER_TEMPLATES.Qiskit;
  return templates[0]?.code || "";
}
