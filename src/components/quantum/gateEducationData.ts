/**
 * Educational Metadata for Quantum Circuit Studio Gates
 *
 * Provides rigorous, pedagogically structured information for every gate
 * supported by QubitLab's circuit studio and simulation engines.
 */

export interface GateEducationInfo {
  id: string;
  symbol: string;
  name: string;
  category: "Single Qubit" | "Rotation" | "Multi Qubit" | "Measurement" | "Barrier";
  description: string;
  intuition: string;
  equation?: string; // LaTeX formatted
  matrix?: string; // LaTeX formatted matrix
  parameterExplanation?: string;
  matrixNote?: string;
}

export const GATE_EDUCATION_DATA: Record<string, GateEducationInfo> = {
  H: {
    id: "H",
    symbol: "H",
    name: "Hadamard Gate",
    category: "Single Qubit",
    description: "Transforms standard computational basis states (|0⟩, |1⟩) into balanced quantum superpositions and vice-versa.",
    equation: "H|0\\rangle = \\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}} = |+\\rangle, \\quad H|1\\rangle = \\frac{|0\\rangle - |1\\rangle}{\\sqrt{2}} = |-\\rangle",
    matrix: "\\frac{1}{\\sqrt{2}}\\begin{pmatrix} 1 & 1 \\\\ 1 & -1 \\end{pmatrix}",
    intuition: "Creates an equal 50/50 superposition when applied to |0⟩, acting as the primary gateway to quantum parallelism.",
  },
  X: {
    id: "X",
    symbol: "X",
    name: "Pauli-X Gate (NOT / Bit-Flip)",
    category: "Single Qubit",
    description: "Quantum analogue of the classical NOT gate. Rotates the statevector by π radians (180°) around the X-axis of the Bloch sphere.",
    equation: "X|0\\rangle = |1\\rangle, \\quad X|1\\rangle = |0\\rangle",
    matrix: "\\begin{pmatrix} 0 & 1 \\\\ 1 & 0 \\end{pmatrix}",
    intuition: "Flips the qubit's computational basis state: exchanges the amplitudes of |0⟩ and |1⟩.",
  },
  Y: {
    id: "Y",
    symbol: "Y",
    name: "Pauli-Y Gate",
    category: "Single Qubit",
    description: "Rotates the statevector by π radians (180°) around the Y-axis of the Bloch sphere, performing both a bit flip and a phase shift.",
    equation: "Y|0\\rangle = i|1\\rangle, \\quad Y|1\\rangle = -i|0\\rangle",
    matrix: "\\begin{pmatrix} 0 & -i \\\\ i & 0 \\end{pmatrix}",
    intuition: "Combines a bit-flip with an imaginary relative phase factor (±i), swapping basis states on the Y-equator.",
  },
  Z: {
    id: "Z",
    symbol: "Z",
    name: "Pauli-Z Gate (Phase-Flip)",
    category: "Single Qubit",
    description: "Leaves |0⟩ unchanged while inverting the sign of |1⟩ by applying a π (180°) phase flip.",
    equation: "Z|0\\rangle = |0\\rangle, \\quad Z|1\\rangle = -|1\\rangle",
    matrix: "\\begin{pmatrix} 1 & 0 \\\\ 0 & -1 \\end{pmatrix}",
    intuition: "Flips the relative quantum phase without modifying computational basis measurement probabilities.",
  },
  S: {
    id: "S",
    symbol: "S",
    name: "Phase S Gate (√Z)",
    category: "Single Qubit",
    description: "Applies a quarter-turn rotation of π/2 (90°) around the Z-axis of the Bloch sphere.",
    equation: "S|0\\rangle = |0\\rangle, \\quad S|1\\rangle = i|1\\rangle = e^{i\\pi/2}|1\\rangle",
    matrix: "\\begin{pmatrix} 1 & 0 \\\\ 0 & i \\end{pmatrix}",
    intuition: "Square root of Pauli-Z (S² = Z); advances the phase of |1⟩ by 90° along the equator of the Bloch sphere.",
  },
  T: {
    id: "T",
    symbol: "T",
    name: "Phase T Gate (π/8 Gate / √S)",
    category: "Single Qubit",
    description: "Applies an eighth-turn rotation of π/4 (45°) around the Z-axis of the Bloch sphere.",
    equation: "T|0\\rangle = |0\\rangle, \\quad T|1\\rangle = e^{i\\pi/4}|1\\rangle",
    matrix: "\\begin{pmatrix} 1 & 0 \\\\ 0 & e^{i\\pi/4} \\end{pmatrix}",
    intuition: "Square root of S (T² = S). Crucial non-Clifford gate required to achieve universal fault-tolerant quantum computation.",
  },
  RX: {
    id: "RX",
    symbol: "RX(θ)",
    name: "RX Rotation Gate",
    category: "Rotation",
    description: "Rotates the qubit statevector continuously around the X-axis of the Bloch sphere by angle θ.",
    parameterExplanation: "Controls rotation angle θ around the X-axis.",
    equation: "R_X(\\theta) = \\cos\\left(\\frac{\\theta}{2}\\right) I - i\\sin\\left(\\frac{\\theta}{2}\\right) X",
    matrix: "\\begin{pmatrix} \\cos(\\theta/2) & -i\\sin(\\theta/2) \\\\ -i\\sin(\\theta/2) & \\cos(\\theta/2) \\end{pmatrix}",
    intuition: "Continuously adjusts superposition between |0⟩ and |1⟩ with a tunable variational parameter, widely used in VQE and QAOA.",
  },
  RY: {
    id: "RY",
    symbol: "RY(θ)",
    name: "RY Rotation Gate",
    category: "Rotation",
    description: "Rotates the qubit statevector continuously around the Y-axis of the Bloch sphere by angle θ.",
    parameterExplanation: "Controls rotation angle θ around the Y-axis.",
    equation: "R_Y(\\theta)|0\\rangle = \\cos\\left(\\frac{\\theta}{2}\\right)|0\\rangle + \\sin\\left(\\frac{\\theta}{2}\\right)|1\\rangle",
    matrix: "\\begin{pmatrix} \\cos(\\theta/2) & -\\sin(\\theta/2) \\\\ \\sin(\\theta/2) & \\cos(\\theta/2) \\end{pmatrix}",
    intuition: "Generates arbitrary real-valued superpositions with zero imaginary components, ideal for state preparation.",
  },
  RZ: {
    id: "RZ",
    symbol: "RZ(θ)",
    name: "RZ Rotation Gate",
    category: "Rotation",
    description: "Rotates the qubit statevector continuously around the Z-axis of the Bloch sphere by angle θ.",
    parameterExplanation: "Controls relative phase rotation θ around the Z-axis.",
    equation: "R_Z(\\theta) = e^{-i\\theta/2}|0\\rangle\\langle 0| + e^{i\\theta/2}|1\\rangle\\langle 1|",
    matrix: "\\begin{pmatrix} e^{-i\\theta/2} & 0 \\\\ 0 & e^{i\\theta/2} \\end{pmatrix}",
    intuition: "Shifts the relative phase between |0⟩ and |1⟩ by angle θ while keeping computational basis probabilities invariant.",
  },
  CNOT: {
    id: "CNOT",
    symbol: "CNOT / CX",
    name: "Controlled-NOT Gate",
    category: "Multi Qubit",
    description: "Two-qubit entangling gate. Inverts target qubit q_target if and only if control qubit q_control is |1⟩.",
    equation: "|c, t\\rangle \\to |c, t \\oplus c\\rangle \\quad (|00\\rangle\\to|00\\rangle, \\; |10\\rangle\\to|11\\rangle)",
    matrix: "\\begin{pmatrix} 1 & 0 & 0 & 0 \\\\ 0 & 1 & 0 & 0 \\\\ 0 & 0 & 0 & 1 \\\\ 0 & 0 & 1 & 0 \\end{pmatrix}",
    intuition: "Fundamental building block for quantum entanglement; combined with Hadamard, creates Bell states (|00⟩+|11⟩)/√2.",
  },
  CZ: {
    id: "CZ",
    symbol: "CZ",
    name: "Controlled-Z Gate",
    category: "Multi Qubit",
    description: "Two-qubit symmetric entangling gate. Applies a phase-flip (-1) if and only if both control and target qubits are |1⟩.",
    equation: "CZ|11\\rangle = -|11\\rangle, \\quad CZ|xy\\rangle = |xy\\rangle \\; (xy \\neq 11)",
    matrix: "\\text{diag}(1, 1, 1, -1)",
    intuition: "Completely symmetric between control and target; essential in cluster state generation and quantum error correction stabilizers.",
  },
  SWAP: {
    id: "SWAP",
    symbol: "SWAP",
    name: "SWAP Gate",
    category: "Multi Qubit",
    description: "Exchanges the full quantum states of two qubits: |a⟩ ⊗ |b⟩ → |b⟩ ⊗ |a⟩.",
    equation: "\\text{SWAP}|01\\rangle = |10\\rangle, \\quad \\text{SWAP}|10\\rangle = |01\\rangle",
    matrix: "\\begin{pmatrix} 1 & 0 & 0 & 0 \\\\ 0 & 0 & 1 & 0 \\\\ 0 & 1 & 0 & 0 \\\\ 0 & 0 & 0 & 1 \\end{pmatrix}",
    intuition: "Routes quantum information across physical qubits when limited hardware coupling connectivity prevents direct two-qubit interaction.",
  },
  M: {
    id: "M",
    symbol: "M",
    name: "Measurement (Z-Basis)",
    category: "Measurement",
    description: "Projects the qubit's quantum superposition state onto |0⟩ or |1⟩ in the standard computational basis.",
    equation: "P(|0\\rangle) = |\\langle 0|\\psi\\rangle|^2, \\quad P(|1\\rangle) = |\\langle 1|\\psi\\rangle|^2",
    matrix: "M_0 = |0\\rangle\\langle 0|, \\quad M_1 = |1\\rangle\\langle 1|",
    intuition: "Extracts classical information from the quantum register, collapsing the wave function according to the Born rule.",
  },
  B: {
    id: "B",
    symbol: "Barrier",
    name: "Circuit Barrier",
    category: "Barrier",
    description: "Visual and logical divider that prevents quantum compiler passes from reordering or optimizing gates across it.",
    equation: "\\text{Logical identity operation: } \\mathbb{I}",
    matrix: "\\text{No physical hardware operation}",
    intuition: "Separates functional algorithmic stages (e.g. initialization, oracle, diffusion) for clarity, benchmarking, and timing synchronization.",
  },
};

/**
 * Format rotation angle theta as human-readable fraction of pi, radians, and degrees.
 */
export function formatGateTheta(theta: number = Math.PI / 2): {
  fraction: string;
  radians: string;
  degrees: string;
} {
  const normalized = ((theta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const deg = Math.round((normalized * 180) / Math.PI);

  // Common fraction detection
  let fraction = `${(normalized / Math.PI).toFixed(2)}π`;
  if (Math.abs(normalized - 0) < 0.01) fraction = "0";
  else if (Math.abs(normalized - Math.PI / 4) < 0.02) fraction = "π/4";
  else if (Math.abs(normalized - Math.PI / 2) < 0.02) fraction = "π/2";
  else if (Math.abs(normalized - (3 * Math.PI) / 4) < 0.02) fraction = "3π/4";
  else if (Math.abs(normalized - Math.PI) < 0.02) fraction = "π";
  else if (Math.abs(normalized - (5 * Math.PI) / 4) < 0.02) fraction = "5π/4";
  else if (Math.abs(normalized - (3 * Math.PI) / 2) < 0.02) fraction = "3π/2";
  else if (Math.abs(normalized - (7 * Math.PI) / 4) < 0.02) fraction = "7π/4";
  else if (Math.abs(normalized - 2 * Math.PI) < 0.02) fraction = "2π";

  return {
    fraction,
    radians: `${normalized.toFixed(3)} rad`,
    degrees: `${deg}°`,
  };
}
