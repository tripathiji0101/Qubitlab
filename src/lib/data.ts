import { getProjectCurriculum } from "./curriculumData.ts";

export type Level = {
  n: number;
  role: string;
  title: string;
  algorithm: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  duration: string;
  xp: number;
  status: "completed" | "active" | "locked";
  progress: number;
  slug: string;
  mission: string;
  concepts: string[];
  gates: string[];
  video?: string;
  image?: string;
  visualKey?: string;
  lessonsCount?: number;
};

export const levels: Level[] = [
  {
    n: 1, role: "Security Analyst", title: "Quantum Key Distribution", algorithm: "BB84 Protocol",
    difficulty: "Beginner", duration: "45 min", xp: 500, status: "active", progress: 0, slug: "bb84",
    mission: "Secure Alice and Bob's communication channel and detect any eavesdropper listening in.",
    concepts: ["Superposition", "Measurement bases", "No-cloning"], gates: ["H", "X", "Z", "Measure"],
  },
  {
    n: 2, role: "Logic Designer", title: "Instant Database Verification", algorithm: "Deutsch–Jozsa",
    difficulty: "Beginner", duration: "50 min", xp: 650, status: "locked", progress: 0, slug: "deutsch-jozsa",
    mission: "Determine in a single query whether a black-box function is constant or balanced.",
    concepts: ["Phase kickback", "Interference", "Oracles"], gates: ["H", "X", "CNOT", "Measure"],
  },
  {
    n: 3, role: "Data Architect", title: "Unstructured Quantum Search", algorithm: "Grover's Algorithm",
    difficulty: "Intermediate", duration: "1h 10m", xp: 900, status: "locked", progress: 0, slug: "grover",
    mission: "Find a marked item in an unsorted database quadratically faster than any classical search.",
    concepts: ["Amplitude amplification", "Oracles", "Diffusion"], gates: ["H", "X", "Z", "CZ", "CNOT"],
  },
  {
    n: 4, role: "Logistics Engineer", title: "Supply Chain & Route Optimizer", algorithm: "QAOA",
    difficulty: "Advanced", duration: "1h 40m", xp: 1200, status: "locked", progress: 0, slug: "qaoa",
    mission: "Encode a combinatorial optimization problem and tune a variational circuit to solve it.",
    concepts: ["Variational circuits", "Cost Hamiltonians", "Parameter tuning"], gates: ["RX", "RY", "RZ", "CNOT"],
  },
  {
    n: 5, role: "Quantum AI Engineer", title: "Automotive Customer Classifier", algorithm: "Quantum Neural Network",
    difficulty: "Advanced", duration: "2h 15m", xp: 1500, status: "locked", progress: 0, slug: "qnn",
    mission: "Build a parameterized quantum circuit that classifies customer data with a hybrid model.",
    concepts: ["Feature maps", "Ansätze", "Hybrid training"], gates: ["RY", "RZ", "CNOT", "Measure"],
  },
  {
    n: 6, role: "Communications Specialist", title: "Quantum Teleportation", algorithm: "Quantum Teleportation Protocol",
    difficulty: "Intermediate", duration: "55 min", xp: 850, status: "locked", progress: 0, slug: "teleportation",
    mission: "Master the quantum teleportation protocol: transfer an unknown quantum state using entanglement and classical communication.",
    concepts: ["Entanglement", "Bell states", "Measurement", "Classical communication", "No-cloning theorem", "Conditional corrections"],
    gates: ["H", "X", "Z", "CNOT", "Measure"],
  },
  {
    n: 7, role: "Quantum Algorithm Engineer", title: "Quantum Fourier Transform", algorithm: "Quantum Fourier Transform (QFT)",
    difficulty: "Advanced", duration: "60 min", xp: 1000, status: "locked", progress: 0, slug: "qft",
    mission: "Master the Quantum Fourier Transform and understand how quantum interference transforms phase information.",
    concepts: ["Fourier transform", "Quantum interference", "Phase", "Hadamard gates", "Controlled phase rotations", "QFT circuit structure"],
    gates: ["H", "RZ", "CNOT", "SWAP", "Measure"],
  },
  {
    n: 8, role: "Quantum Algorithm Engineer", title: "Hidden Pattern Detection", algorithm: "Simon's Algorithm",
    difficulty: "Advanced", duration: "65 min", xp: 1100, status: "locked", progress: 0, slug: "simon",
    mission: "Discover a hidden binary pattern inside a black-box function using quantum parallelism and interference, demonstrating an exponential quantum advantage over classical querying.",
    concepts: ["Quantum oracle", "Superposition", "Interference", "Hidden strings", "Linear equations", "Measurement", "Quantum advantage"],
    gates: ["H", "CNOT", "Measure"],
    video: "/assets/simon-algorithm.mp4",
  },
  {
    n: 9, role: "Quantum Optimization Scientist", title: "Molecular Energy Explorer", algorithm: "Variational Quantum Eigensolver",
    difficulty: "Advanced", duration: "70 min", xp: 1250, status: "locked", progress: 0, slug: "vqe",
    mission: "Estimate the lowest energy state of a quantum system by combining a parameterized quantum circuit with a classical optimization loop.",
    concepts: ["Variational principle", "Parameterized circuits", "Ansatz", "Expectation values", "Hamiltonians", "Classical optimization", "Ground-state energy", "Hybrid quantum-classical computing"],
    gates: ["H", "RX", "RY", "RZ", "CNOT", "Measure"],
  },
  {
    n: 10, role: "Quantum Cryptography Specialist", title: "Factorization Challenge", algorithm: "Shor's Algorithm",
    difficulty: "Expert", duration: "80 min", xp: 1500, status: "locked", progress: 0, slug: "shor",
    mission: "Understand how quantum period finding can transform integer factorization and reveal why large-scale quantum computers threaten widely used public-key cryptography.",
    concepts: ["Integer factorization", "Modular arithmetic", "Period finding", "Quantum Fourier Transform", "Phase estimation", "Continued fractions", "Classical post-processing", "Cryptographic security"],
    gates: ["H", "X", "CNOT", "RZ", "Measure"],
  },
  {
    n: 11, role: "Quantum Reliability Engineer", title: "Protect the Qubit", algorithm: "Quantum Error Correction",
    difficulty: "Expert", duration: "75 min", xp: 1400, status: "locked", progress: 0, slug: "error-correction",
    mission: "Learn how quantum error-correcting codes protect fragile quantum information from bit-flip and phase-flip errors without directly measuring the encoded quantum state.",
    concepts: ["Quantum noise", "Bit-flip errors", "Phase-flip errors", "Ancilla qubits", "Syndrome measurement", "Three-qubit repetition code", "Error detection", "Error correction", "Fault tolerance", "Decoherence"],
    gates: ["H", "X", "Z", "CNOT", "Measure"],
  },
  {
    n: 12, role: "Quantum Computing Researcher", title: "Quantum Linear Systems", algorithm: "HHL Algorithm",
    difficulty: "Expert", duration: "85 min", xp: 1700, status: "locked", progress: 0, slug: "hhl",
    mission: "Explore how quantum phase estimation and controlled rotations can encode information about the solution of a linear system into a quantum state.",
    concepts: ["Linear systems", "Hamiltonian simulation", "Quantum phase estimation", "Controlled rotation", "Ancilla qubit", "Eigenvalues", "Quantum state encoding", "Condition number", "Quantum linear algebra"],
    gates: ["H", "X", "RY", "RZ", "CNOT", "Measure"],
  },
];

export const challenges = [
  { id: "bell", title: "Build a Bell State", algorithm: "Entanglement", difficulty: "Beginner", xp: 100, best: 0, attempts: 0, done: false, tone: "cyan" as const,
    statement: "Create a maximally entangled two-qubit Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2." },
  { id: "grover-oracle", title: "Implement Grover's Oracle", algorithm: "Grover", difficulty: "Intermediate", xp: 300, best: 0, attempts: 0, done: false, tone: "blue" as const,
    statement: "Mark the target state |11⟩ using a phase oracle, then apply the diffusion operator." },
  { id: "ghz", title: "Prepare a GHZ State", algorithm: "Entanglement", difficulty: "Intermediate", xp: 250, best: 0, attempts: 0, done: false, tone: "violet" as const,
    statement: "Extend entanglement across three qubits to build a GHZ state." },
  { id: "qaoa-opt", title: "Optimize a QAOA Circuit", algorithm: "QAOA", difficulty: "Advanced", xp: 500, best: 0, attempts: 0, done: false, tone: "magenta" as const,
    statement: "Reduce the depth of a MaxCut QAOA circuit while preserving the approximation ratio." },
  { id: "teleport", title: "Quantum Teleportation", algorithm: "Protocols", difficulty: "Intermediate", xp: 350, best: 0, attempts: 0, done: false, tone: "blue" as const,
    statement: "Teleport an arbitrary single-qubit state using entanglement and classical communication." },
  { id: "qft", title: "Three-Qubit QFT", algorithm: "Transforms", difficulty: "Advanced", xp: 450, best: 0, attempts: 0, done: false, tone: "cyan" as const,
    statement: "Construct the Quantum Fourier Transform over three qubits with controlled-phase gates." },
];

export const leaderboard = [
  { rank: 1, name: "Mei Tanaka", level: 5, xp: 24810, challenges: 41, eff: 96, you: false },
  { rank: 2, name: "Diego Ramírez", level: 5, xp: 23120, challenges: 38, eff: 94, you: false },
  { rank: 3, name: "Priya Nair", level: 4, xp: 21440, challenges: 35, eff: 91, you: false },
  { rank: 4, name: "Lucas Weber", level: 4, xp: 19980, challenges: 33, eff: 89, you: false },
  { rank: 5, name: "Sofia Rossi", level: 4, xp: 18650, challenges: 31, eff: 90, you: false },
  { rank: 6, name: "Alex Chen (You)", level: 2, xp: 12450, challenges: 14, eff: 87, you: true },
  { rank: 7, name: "Noah Kim", level: 2, xp: 11890, challenges: 13, eff: 82, you: false },
  { rank: 8, name: "Amara Okafor", level: 2, xp: 11020, challenges: 12, eff: 85, you: false },
];

export const badges = [
  { name: "First Qubit", tone: "cyan" as const, earned: false, desc: "Placed your first gate" },
  { name: "Superposition Master", tone: "blue" as const, earned: false, desc: "Built 10 superposition circuits" },
  { name: "Entanglement Explorer", tone: "violet" as const, earned: false, desc: "Created a Bell state" },
  { name: "Grover Solver", tone: "magenta" as const, earned: false, desc: "Solve the Grover challenge" },
  { name: "QAOA Optimizer", tone: "blue" as const, earned: false, desc: "Optimize a variational circuit" },
  { name: "Quantum AI Engineer", tone: "cyan" as const, earned: false, desc: "Complete Level 5" },
];

export const historyItems: Array<{
  project: string;
  algorithm: string;
  sdk: string;
  score: number;
  date: string;
  depth: number;
  status: string;
}> = [];

export const skillRadar = [
  { skill: "Superposition", value: 0 },
  { skill: "Entanglement", value: 0 },
  { skill: "Quantum Gates", value: 0 },
  { skill: "Algorithms", value: 0 },
  { skill: "Optimization", value: 0 },
  { skill: "Quantum ML", value: 0 },
];

export const progressSeries = [
  { week: "W1", classAvg: 12, top: 20 }, { week: "W2", classAvg: 24, top: 38 },
  { week: "W3", classAvg: 33, top: 52 }, { week: "W4", classAvg: 41, top: 63 },
  { week: "W5", classAvg: 52, top: 71 }, { week: "W6", classAvg: 58, top: 80 },
  { week: "W7", classAvg: 66, top: 88 },
];

export const conceptDifficulty = [
  { concept: "Superposition", fail: 12 }, { concept: "Entanglement", fail: 34 },
  { concept: "Phase kickback", fail: 41 }, { concept: "Oracles", fail: 28 },
  { concept: "Amplitude amp.", fail: 46 }, { concept: "Variational", fail: 52 },
];

export const atRisk = [
  { name: "Sarah Bloom", progress: 68, failed: 12, concept: "Entanglement", risk: "Medium", action: "Review Bell States" },
  { name: "Tom Alvarez", progress: 41, failed: 19, concept: "Phase kickback", risk: "High", action: "Assign DJ walkthrough" },
  { name: "Yuki Sato", progress: 74, failed: 8, concept: "Oracles", risk: "Low", action: "Encourage Grover attempt" },
  { name: "Omar Haddad", progress: 33, failed: 23, concept: "Amplitude amp.", risk: "High", action: "1:1 office hours" },
];

export const assignments = [
  { title: "Bell State Warm-up", algorithm: "Entanglement", difficulty: "Beginner", due: "Sep 12", submitted: 24, total: 30, status: "Open" },
  { title: "Deutsch–Jozsa Lab", algorithm: "Deutsch–Jozsa", difficulty: "Beginner", due: "Sep 18", submitted: 8, total: 30, status: "Open" },
  { title: "Grover Search Project", algorithm: "Grover", difficulty: "Intermediate", due: "Sep 25", submitted: 0, total: 30, status: "Draft" },
];

export const submissions = [
  { name: "Mei Tanaka", score: 98, correctness: 100, efficiency: 96, attempts: 1, status: "Passed" },
  { name: "Diego Ramírez", score: 91, correctness: 100, efficiency: 82, attempts: 2, status: "Passed" },
  { name: "Sarah Bloom", score: 64, correctness: 80, efficiency: 48, attempts: 5, status: "Needs review" },
  { name: "Tom Alvarez", score: 0, correctness: 0, efficiency: 0, attempts: 3, status: "Failed" },
];

export const difficultyTone: Record<string, "ok" | "warn" | "danger"> = {
  Beginner: "ok", Intermediate: "warn", Advanced: "danger",
};

export type ProjectSection = {
  t: string;
  body?: (l: Level) => string;
  list?: string[];
};

export type ActivityType = "PREDICT" | "BUILD" | "EXPERIMENT" | "IDENTIFY" | "DEBUG";
export type ActivityStatus = "NOT_STARTED" | "IN_PROGRESS" | "CORRECT" | "INCORRECT" | "COMPLETED";

export interface ActivityOption {
  id: string;
  label: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface MissionActivity {
  id: string;
  type: ActivityType;
  title: string;
  phaseOrder?: number;
  prompt: string;
  contextCode?: string;
  options: ActivityOption[];
  hint?: string;
  explanation: string;
  whatIfQuery?: string;
  reflectionPrompt?: string;
  reflectionOptions?: ActivityOption[];
}

export type ProjectContent = {
  sections: ProjectSection[];
  hints: string[];
  successCriteria: string[];
  activities?: MissionActivity[];
};

export const projectContent: Record<string, ProjectContent> = {
  _default: {
    activities: [
      {
        id: "default-act-1",
        type: "PREDICT",
        title: "Single Qubit Superposition",
        phaseOrder: 1,
        prompt: "What will the quantum state be after applying a Hadamard ($H$) gate to the ground state $|0\rangle$?",
        options: [
          { id: "a", label: "$|0\rangle$", isCorrect: false, explanation: "Hadamard transforms basis states into superpositions." },
          { id: "b", label: "$|1\rangle$", isCorrect: false, explanation: "An X gate flips |0⟩ to |1⟩, not H." },
          { id: "c", label: "$|+\rangle = \frac{|0\rangle + |1\rangle}{\sqrt{2}}$", isCorrect: true, explanation: "Hadamard creates an equal superposition with equal 50% probabilities." },
          { id: "d", label: "$|-\rangle = \frac{|0\rangle - |1\rangle}{\sqrt{2}}$", isCorrect: false, explanation: "Applying H to |1⟩ produces |-⟩." }
        ],
        hint: "Remember that H creates an equal amplitude superposition from computational basis states.",
        explanation: "Applying H to $|0\rangle$ produces the symmetric state $|+\rangle$."
      }
    ],
    sections: [
      { t: "Mission", body: (l) => l.mission + " In the field, a failure here means an attacker could silently intercept every message — your circuit is the line of defense." },
      { t: "What You Will Learn", list: ["How quantum superposition encodes information", "Reading measurement outcomes across bases", "Why the no-cloning theorem enables detection", "Translating a protocol into gates and code"] },
      { t: "Algorithm Overview", body: () => "You'll prepare qubits in randomly chosen bases, transmit, measure, and reconcile a shared key — detecting eavesdropping through the disturbance it inevitably introduces." },
      { t: "Expected Outcome", body: () => "A working circuit whose measurement statistics reveal, above a noise threshold, whether the channel was compromised." },
    ],
    hints: [
      "Start every qubit line by choosing a basis with a Hadamard.",
      "A mismatch between preparation and measurement basis scrambles the bit — that's the point.",
      "Ask the Copilot to explain phase kickback if a gate feels like it does nothing.",
    ],
    successCriteria: [
      "Circuit compiles without errors",
      "Detects eavesdropping above 25% error",
      "Uses ≤ 8 gates",
      "Correct measurement basis logic",
    ],
  },
  bb84: {
    activities: [
      {
        id: "bb84-act-1",
        type: "PREDICT",
        title: "Photon Basis Encoding",
        phaseOrder: 1,
        prompt: "Alice prepares a photon in $|0\rangle$ (Z rectilinear basis) and applies a **Hadamard ($H$)** gate to switch to the diagonal (X) basis. What quantum state is sent across the quantum channel?",
        options: [
          { id: "a", label: "$|0\rangle$ (unchanged)", isCorrect: false, explanation: "The H gate rotates computational basis states into superpositions." },
          { id: "b", label: "$|1\rangle$ (bit flipped)", isCorrect: false, explanation: "A bit flip requires a Pauli X gate." },
          { id: "c", label: "$|+\rangle = \frac{|0\rangle + |1\rangle}{\sqrt{2}}$", isCorrect: true, explanation: "H|0⟩ creates the diagonal state |+⟩ with zero relative phase." },
          { id: "d", label: "$|-\rangle = \frac{|0\rangle - |1\rangle}{\sqrt{2}}$", isCorrect: false, explanation: "H|1⟩ creates |-⟩ with a π relative phase." }
        ],
        hint: "The Hadamard unitary maps |0⟩ ↦ |+⟩ and |1⟩ ↦ |-⟩.",
        explanation: "Applying $H$ to $|0\rangle$ creates the diagonal superposition state $|+\rangle$."
      },
      {
        id: "bb84-act-2",
        type: "IDENTIFY",
        title: "Basis Mismatch & Measurement Probability",
        phaseOrder: 2,
        prompt: "Alice sends $|+\rangle$. Bob chooses the rectilinear ($Z$) basis to measure. What is the probability that Bob records a classical bit value of 0?",
        options: [
          { id: "a", label: "0% (impossible)", isCorrect: false, explanation: "|+⟩ contains non-zero amplitude in both |0⟩ and |1⟩." },
          { id: "b", label: "50% (completely random)", isCorrect: true, explanation: "|⟨0|+⟩|² = |1/√2|² = 1/2 (50%). When measurement basis mismatches, results are purely random." },
          { id: "c", label: "100% (deterministic)", isCorrect: false, explanation: "Measurement in a conjugate basis cannot yield a deterministic outcome." },
          { id: "d", label: "25%", isCorrect: false, explanation: "Amplitudes are 1/√2, so probability is (1/√2)² = 50%." }
        ],
        hint: "Calculate the Born rule probability: $P(0) = |\langle 0 | + \rangle|^2$.",
        explanation: "Measuring a diagonal state in the rectilinear basis collapses onto $|0\rangle$ or $|1\rangle$ with equal 50% probability."
      },
      {
        id: "bb84-act-3",
        type: "EXPERIMENT",
        title: "Eavesdropper Disturbance & Sifting",
        phaseOrder: 3,
        prompt: "If an eavesdropper (Eve) intercepts photons and measures them in a random basis before resending them to Bob, what happens to Alice and Bob's key agreement?",
        options: [
          { id: "a", label: "Eve copies the photons without disturbing them", isCorrect: false, explanation: "The No-Cloning Theorem strictly forbids copying unknown quantum states." },
          { id: "b", label: "Eve introduces a ~25% error rate (QBER) in the sifted key, exposing her presence", isCorrect: true, explanation: "Whenever Eve guesses the wrong basis, she collapses the state and scrambles Bob's measurement." },
          { id: "c", label: "The transmission speed doubles", isCorrect: false, explanation: "Eavesdropping introduces noise and latency." }
        ],
        whatIfQuery: "What happens if an eavesdropper measures the qubit?",
        reflectionPrompt: "By quantum mechanics, measurement in the wrong basis causes irreversible state collapse. Did Eve's interference alter the measurement statistics?",
        explanation: "Eve cannot observe photons without collapsing their superposition. A QBER above 11% triggers Alice and Bob to abort the exchange."
      }
    ],
    sections: [
      { t: "Mission", body: (l) => l.mission + " You will generate a provably secure shared cryptographic key between Alice and Bob using single photons and quantum measurement bases." },
      { t: "What You Will Learn", list: [
        "How quantum superposition encodes secret bits in photons",
        "The difference between rectilinear (+ / Z) and diagonal (× / X) bases",
        "Why the quantum no-cloning theorem prevents eavesdropping (Eve)",
        "How basis sifting and quantum bit error rate (QBER) calculations verify channel security",
      ]},
      { t: "Algorithm Overview", body: () => "Alice encodes classical random bits into quantum states chosen at random from rectilinear (|0⟩, |1⟩) or diagonal (|+⟩, |−⟩) bases. Bob measures each qubit using a randomly chosen basis. After transmission, Alice and Bob publicly announce their chosen bases over a classical channel and discard results where their bases disagreed (sifting). Any eavesdropping by Eve introduces measurable error (>11%), alerting Alice and Bob to abort the exchange." },
      { t: "Expected Outcome", body: () => "A working QKD simulation where Alice and Bob share an identical key when no eavesdropper is present, and detect Eve when QBER exceeds the security threshold." },
    ],
    hints: [
      "Use Hadamard gates to transform between the computational (Z) basis and diagonal (X) basis.",
      "Measure in the same basis Alice used to ensure 100% correlation.",
      "When bases mismatch, the measurement outcome is completely random (50/50).",
    ],
    successCriteria: [
      "Qubits prepared in correct superposition or basis state",
      "Measurement applied in appropriate basis",
      "Key sifting isolates matching basis results",
      "Eavesdropper disturbance detected above threshold",
    ],
  },
  "deutsch-jozsa": {
    activities: [
      {
        id: "dj-act-1",
        type: "IDENTIFY",
        title: "Phase Kickback Mechanism",
        phaseOrder: 1,
        prompt: "The ancilla qubit is initialized in $|-\rangle = \frac{|0\rangle - |1\rangle}{\sqrt{2}}$. When an oracle $U_f |x\rangle |y\rangle = |x\rangle |y \oplus f(x)\rangle$ is queried, how does the ancilla affect the input register?",
        options: [
          { id: "a", label: "It imprints a phase factor $(-1)^{f(x)}$ onto $|x\rangle$ without altering the ancilla", isCorrect: true, explanation: "Phase kickback exploits the eigenvalue -1 of the |−⟩ state under bit-flips." },
          { id: "b", label: "It flips the bits of the input register |x⟩", isCorrect: false, explanation: "The input register bits are not flipped; only their phase is modified." },
          { id: "c", label: "It collapses the superposition to a classical bitstring", isCorrect: false, explanation: "Unitary evolution preserves coherent superposition." }
        ],
        hint: "Evaluate $U_f |x\rangle |-\rangle = |x\rangle \frac{|0 \oplus f(x)\rangle - |1 \oplus f(x)\rangle}{\sqrt{2}}$.",
        explanation: "When $f(x)=1$, $|-\rangle$ picks up a $-1$ factor, which is 'kicked back' to the input query state as $(-1)^{f(x)} |x\rangle$."
      },
      {
        id: "dj-act-2",
        type: "PREDICT",
        title: "Constant Function Interference Readout",
        phaseOrder: 2,
        prompt: "If $f(x)$ is a **constant** function (e.g. $f(x) = 0$ for all $x$), what will the input register measure after the final Hadamard transform?",
        options: [
          { id: "a", label: "Deterministically $|00\dots0\rangle$ with 100% probability", isCorrect: true, explanation: "Constructive interference focuses 100% of the probability amplitude onto |00...0⟩." },
          { id: "b", label: "Deterministically $|11\dots1\rangle$", isCorrect: false, explanation: "|11...1⟩ is only measured for specific balanced functions." },
          { id: "c", label: "A random distribution across all states", isCorrect: false, explanation: "Deutsch-Jozsa is fully deterministic with zero randomness in the final measurement." }
        ],
        hint: "All phases $(-1)^{f(x)}$ are identical, so the final Hadamard layer acts like $H^{\otimes n} H^{\otimes n} = I$.",
        explanation: "For constant functions, all relative phases cancel, constructively interfering entirely on the all-zeros $|00\dots0\rangle$ state."
      },
      {
        id: "dj-act-3",
        type: "DEBUG",
        title: "Target Ancilla Preparation Debug",
        phaseOrder: 3,
        prompt: "A student designs a Deutsch-Jozsa circuit but omits the Pauli $X$ gate on the ancilla before applying $H$, leaving the ancilla in $|+\rangle$ instead of $|-\rangle$. What happens?",
        options: [
          { id: "a", label: "Phase kickback fails because $U_f |x\rangle |+\rangle = |x\rangle |+\rangle$ (eigenvalue is +1, so no phase is kicked back)", isCorrect: true, explanation: "|+⟩ has eigenvalue +1 under bit flips, so no phase differences are generated." },
          { id: "b", label: "The circuit inverts its answer", isCorrect: false, explanation: "Without eigenvalue -1, no phase information is transferred." },
          { id: "c", label: "The circuit fails to compile", isCorrect: false, explanation: "The circuit compiles, but the quantum algorithm computes the wrong output." }
        ],
        hint: "Recall: phase kickback requires an eigenvalue of -1, which only $|-\rangle$ provides.",
        explanation: "Without $X$ before $H$, the ancilla is in $|+\rangle$. Since $X|+\rangle = |+\rangle$, no $(-1)$ sign is generated, and interference fails completely."
      }
    ],
    sections: [
      { t: "Mission", body: (l) => l.mission + " You will determine whether an unknown black-box Boolean function is constant (returns same value for all inputs) or balanced (returns 0 for half and 1 for half) with a single quantum evaluation." },
      { t: "What You Will Learn", list: [
        "How quantum parallelism evaluates all 2ⁿ inputs simultaneously",
        "The physics of phase kickback: using an ancilla in |−⟩ to imprint function values as phases",
        "How constructive and destructive interference separate constant from balanced functions",
        "Why Deutsch–Jozsa provides a deterministic exponential speedup over classical querying",
      ]},
      { t: "Algorithm Overview", body: () => "Initialize n input qubits to |0⟩ and an ancilla qubit to |1⟩. Apply Hadamard gates across all qubits, putting the input register in equal superposition and the ancilla in |−⟩ = (|0⟩ − |1⟩)/√2. The oracle U_f kicks back the function value into the phase: |x⟩|−⟩ → (-1)^f(x)|x⟩|−⟩. A final layer of Hadamard gates on the input register causes interference: if f is constant, all amplitude concentrates in |0...0⟩; if balanced, destructive interference guarantees amplitude in |0...0⟩ is exactly 0." },
      { t: "Expected Outcome", body: () => "A working circuit where measuring all-zeros |0...0⟩ definitively indicates a constant function, while any non-zero measurement proves the function is balanced." },
    ],
    hints: [
      "Prepare the ancilla qubit in |1⟩ with an X gate before applying the Hadamard.",
      "Phase kickback relies on the ancilla being in the (|0⟩ - |1⟩)/√2 state.",
      "Apply Hadamard gates to all input qubits before and after the oracle.",
    ],
    successCriteria: [
      "Input qubits initialized with Hadamard gates",
      "Ancilla prepared in state |−⟩ for phase kickback",
      "Oracle unitary correctly wired",
      "Final Hadamard layer applied to input qubits",
      "Output distinguishes constant (|00⟩) vs balanced (≠|00⟩)",
    ],
  },
  grover: {
    activities: [
      {
        id: "grover-act-1",
        type: "IDENTIFY",
        title: "Diffusion Operator Geometric Action",
        phaseOrder: 1,
        prompt: "What geometric transformation does the Grover diffusion operator $D = 2|s\rangle\langle s| - I$ perform on the register state amplitudes?",
        options: [
          { id: "a", label: "Inversion of each amplitude about the mean amplitude", isCorrect: true, explanation: "D reflects every amplitude α_x about the average amplitude μ, amplifying the marked state." },
          { id: "b", label: "A random permutation of amplitudes", isCorrect: false, explanation: "The diffusion operator is an exact deterministic unitary reflection." },
          { id: "c", label: "Projective measurement onto the computational basis", isCorrect: false, explanation: "Diffusion is a reversible unitary transformation, not a measurement." }
        ],
        hint: "Consider the average amplitude $\mu$. The transformation maps $\alpha_x \mapsto 2\mu - \alpha_x$.",
        explanation: "The diffusion operator reflects all amplitudes about their mean. Since the oracle made the marked state negative, reflection about the mean drives its amplitude highly positive."
      },
      {
        id: "grover-act-2",
        type: "PREDICT",
        title: "Optimal Iterations for N=4",
        phaseOrder: 2,
        prompt: "In a 2-qubit database ($N = 4$) with $M = 1$ marked item, how many Grover iterations $R \approx \frac{\pi}{4}\sqrt{N/M}$ are required for 100% success probability?",
        options: [
          { id: "a", label: "Exactly 1 iteration", isCorrect: true, explanation: "For N=4, one Grover rotation rotates the state vector exactly to the marked target state." },
          { id: "b", label: "2 iterations", isCorrect: false, explanation: "2 iterations over-rotates the state vector past the target state." },
          { id: "c", label: "4 iterations", isCorrect: false, explanation: "Classical search takes up to 4 queries, but Grover takes only 1." }
        ],
        hint: "The angle of rotation is $\theta = \arcsin(1/\sqrt{4}) = \pi/6$. A single rotation of $2\theta = \pi/3$ lands on $\pi/2$ (100%).",
        explanation: "For $N=4$, exactly 1 Grover iteration yields 100% probability of measuring the marked state."
      },
      {
        id: "grover-act-3",
        type: "EXPERIMENT",
        title: "Impact of Removing the Diffusion Operator",
        phaseOrder: 3,
        prompt: "What happens if you run the Grover oracle without applying the diffusion operator?",
        options: [
          { id: "a", label: "Probabilities remain flat (25% each) because phase flips alone do not change measurement probabilities", isCorrect: true, explanation: "|-a|² = |a|². Without diffusion, phase flips cannot be observed in standard measurement." },
          { id: "b", label: "The target item probability reaches 100%", isCorrect: false, explanation: "Diffusion is required to amplify the amplitude." },
          { id: "c", label: "The circuit outputs only |00⟩", isCorrect: false, explanation: "The superposition amplitudes retain identical magnitude." }
        ],
        whatIfQuery: "What happens if I remove the diffusion operator?",
        reflectionPrompt: "Phase inversion marks a state with a negative sign, but does not alter measurement magnitude until diffusion reflects about the mean. Did removing diffusion destroy the search advantage?",
        explanation: "Phase flips alone do not alter probabilities ($|-1/2|^2 = |1/2|^2$). The diffusion operator is essential to convert phase marks into measurable probability amplification."
      }
    ],
    sections: [
      { t: "Mission", body: (l) => l.mission + " You will construct Grover's search algorithm to locate a marked entry in an unsorted database with quadratic speedup (O(√N) queries instead of O(N))." },
      { t: "What You Will Learn", list: [
        "How oracle operations flip the phase of marked target states",
        "The geometric interpretation of Grover's diffusion operator (reflection about the average)",
        "How repeated rotations in the 2D subspace amplify target probability to near 100%",
        "The optimal number of iterations: R ≈ (π/4)√N",
      ]},
      { t: "Algorithm Overview", body: () => "Initialize all qubits in an equal superposition with Hadamard gates. The search loop alternates between two operations: (1) Phase Oracle U_ω, which flips the sign of the marked item (|ω⟩ → -|ω⟩), and (2) Diffusion Operator D = 2|s⟩⟨s| - I, which reflects all amplitudes about their mean. Each iteration rotates the state vector closer to the target state |ω⟩." },
      { t: "Expected Outcome", body: () => "A multi-qubit circuit that measures the marked target state with probability greater than 90% after the optimal number of Grover iterations." },
    ],
    hints: [
      "Initialize all qubits with H gates to create the uniform superposition state |s⟩.",
      "The oracle must invert the phase of only the target basis state.",
      "Construct the diffusion operator using H gates, X gates, multi-controlled Z, and final H gates.",
    ],
    successCriteria: [
      "Uniform superposition created on all wires",
      "Phase oracle correctly marks the target state",
      "Diffusion operator reflects amplitudes about the mean",
      "Target state probability exceeds 90%",
    ],
  },
  qaoa: {
    activities: [
      {
        id: "qaoa-act-1",
        type: "IDENTIFY",
        title: "Cost vs Mixer Hamiltonian Roles",
        phaseOrder: 1,
        prompt: "In QAOA, which operator layer encodes the graph problem's objective function into quantum phases?",
        options: [
          { id: "a", label: "Cost Hamiltonian $e^{-i\gamma C}$ (diagonal in computational basis)", isCorrect: true, explanation: "The problem Hamiltonian applies ZZ phase rotations corresponding to edge cuts." },
          { id: "b", label: "Transverse Mixer Hamiltonian $e^{-i\beta B} = \prod_j e^{-i\beta X_j}$", isCorrect: false, explanation: "The mixer Hamiltonian drives transitions between bitstrings." },
          { id: "c", label: "Initial Hadamard state preparation layer", isCorrect: false, explanation: "Hadamards initialize the uniform superposition." }
        ],
        hint: "The cost function $C(z)$ depends on classical bit assignments $z \in \{0, 1\}^n$.",
        explanation: "The Cost Hamiltonian evaluates graph cuts through diagonal $Z$-interactions, imparting phases proportional to cut weights."
      },
      {
        id: "qaoa-act-2",
        type: "PREDICT",
        title: "QAOA Initial Superposition State",
        phaseOrder: 2,
        prompt: "Before applying alternating cost and mixer layers, what state must the register be initialized in?",
        options: [
          { id: "a", label: "The uniform superposition $|+\rangle^{\otimes n} = \frac{1}{\sqrt{2^n}}\sum_x |x\rangle$", isCorrect: true, explanation: "All QAOA circuits start in the ground state of the mixer Hamiltonian." },
          { id: "b", label: "The classical all-zeros state $|00\dots0\rangle$", isCorrect: false, explanation: "Starting in |00...0⟩ biases the optimization." },
          { id: "c", label: "A single random computational basis state", isCorrect: false, explanation: "Quantum parallelism requires an unbiased initial superposition." }
        ],
        hint: "Applying an $H$ gate to each qubit produces the symmetric ground state of $-\sum X_i$.",
        explanation: "Initializing all qubits in $|+\rangle$ ensures equal exploration of all candidate graph partitions."
      }
    ],
    sections: [
      { t: "Mission", body: (l) => l.mission + " You will solve a combinatorial graph optimization problem (Max-Cut) using the Quantum Approximate Optimization Algorithm." },
      { t: "What You Will Learn", list: [
        "Mapping NP-hard graph partitioning into an Ising spin Hamiltonian",
        "How alternating cost and mixer unitary layers simulate adiabatic evolution",
        "The role of variational angles (γ, β) and hybrid classical optimization",
        "Evaluating approximation ratios on near-term NISQ quantum computers",
      ]},
      { t: "Algorithm Overview", body: () => "QAOA prepares an equal superposition state, then alternates p layers of: (1) Cost Hamiltonian evolution e^(-iγC), which applies two-qubit ZZ interactions proportional to edge weights, and (2) Mixer Hamiltonian evolution e^(-iβB), which applies transverse X rotations to all qubits. The measured bitstrings evaluate cut values, and a classical optimizer tunes parameters (γ, β) to maximize the expected cut value." },
      { t: "Expected Outcome", body: () => "A parameterized circuit whose measurement samples concentrate on the optimal vertex cuts of the problem graph." },
    ],
    hints: [
      "For each edge (u, v) in the graph, apply a CNOT, RZ(2γ), and CNOT sequence.",
      "Apply RX(2β) gates on all qubits for the transverse mixer layer.",
      "Increase circuit depth p for higher approximation accuracy.",
    ],
    successCriteria: [
      "All qubits initialized in |+⟩ state",
      "Problem Hamiltonian ZZ interactions applied for each graph edge",
      "Transverse mixer RX rotations applied to all qubits",
      "High-probability measurements correspond to optimal graph cut",
    ],
  },
  qnn: {
    activities: [
      {
        id: "qnn-act-1",
        type: "IDENTIFY",
        title: "Quantum Feature Map Encoding",
        phaseOrder: 1,
        prompt: "What is the primary function of the quantum feature map $U_{\Phi}(x)$ in a Variational Quantum Classifier?",
        options: [
          { id: "a", label: "Non-linearly embeds classical data vectors $x$ into quantum Hilbert space", isCorrect: true, explanation: "Feature maps map classical inputs into high-dimensional quantum states where linear separation is possible." },
          { id: "b", label: "Computes classical loss gradients", isCorrect: false, explanation: "Gradients are calculated classically using parameter-shift rules." },
          { id: "c", label: "Directly performs projective readout", isCorrect: false, explanation: "Readout occurs at the end of the parameterized ansatz." }
        ],
        hint: "Think of quantum kernels: embedding data into quantum states enables computing high-dimensional inner products.",
        explanation: "The feature map translates classical coordinates into quantum statevectors via parameterized rotations ($R_y, R_z$) and entanglement."
      },
      {
        id: "qnn-act-2",
        type: "DEBUG",
        title: "Zero Parameter Frozen Ansatz",
        phaseOrder: 2,
        prompt: "In a parameterized quantum circuit (ansatz), what happens if all variational parameters $\theta$ are frozen at zero?",
        options: [
          { id: "a", label: "The parameterized layers act as identity operators ($I$), preventing the network from learning", isCorrect: true, explanation: "Ry(0) = I and Rz(0) = I. With zero angles, variational layers do not rotate statevectors." },
          { id: "b", label: "The network trains exponentially faster", isCorrect: false, explanation: "Without trainable parameters, optimization cannot adjust the decision boundary." },
          { id: "c", label: "The circuit collapses into classical logic", isCorrect: false, explanation: "The circuit remains quantum, but with zero expressive degrees of freedom." }
        ],
        hint: "Evaluate $R_y(0)$ and $R_z(0)$.",
        explanation: "Rotation gates with angle $\theta = 0$ reduce to identity matrices $I$, eliminating all trainable expressive capacity."
      }
    ],
    sections: [
      { t: "Mission", body: (l) => l.mission + " You will train a hybrid Quantum Neural Network / Variational Quantum Classifier to classify non-linearly separable data." },
      { t: "What You Will Learn", list: [
        "Quantum feature maps: encoding classical data into Hilbert space using non-linear unitary embeddings",
        "Parameterized variational circuits (ansatz) using single-qubit rotations and entangling gates",
        "Measuring parity and expectation values to produce classification predictions",
        "Parameter-shift rules and gradient descent in hybrid quantum-classical ML",
      ]},
      { t: "Algorithm Overview", body: () => "Classical feature vectors x are embedded into quantum states via a feature map circuit U_Φ(x). A parameterized ansatz circuit W(θ) rotates and entangles the state. Measuring the Pauli-Z expectation value on the readout qubit yields a prediction ŷ = sgn(⟨Z⟩). The classical computer computes the loss and updates weights θ via gradient descent." },
      { t: "Expected Outcome", body: () => "A trained quantum classification model achieving high accuracy on the target classification dataset." },
    ],
    hints: [
      "Use RY and RZ rotations with non-linear functions of input features for data encoding.",
      "Alternate single-qubit rotations with CNOT entanglement layers in the ansatz.",
      "Read out predictions from expectation values of the first qubit.",
    ],
    successCriteria: [
      "Quantum feature map embeds classical inputs into state space",
      "Parameterized ansatz provides sufficient expressive power",
      "Expectation value readout maps to target classes",
      "Circuit achieves target classification accuracy",
    ],
  },
  teleportation: {
    activities: [
      {
        id: "teleport-act-1",
        type: "IDENTIFY",
        title: "Bell Pair Creation Unitaries",
        phaseOrder: 1,
        prompt: "Which sequence of two gates applied to $|00\rangle$ creates the maximally entangled Bell pair $|\Phi^+\rangle = \frac{|00\rangle + |11\rangle}{\sqrt{2}}$?",
        options: [
          { id: "a", label: "$H$ on control qubit, then $CNOT$ targeting the second qubit", isCorrect: true, explanation: "H creates (|0⟩+|1⟩)/√2 on wire 0; CNOT flips wire 1 whenever wire 0 is 1, creating (|00⟩+|11⟩)/√2." },
          { id: "b", label: "Two independent $H$ gates", isCorrect: false, explanation: "Two H gates create an unentangled product state (|00⟩+|01⟩+|10⟩+|11⟩)/2." },
          { id: "c", label: "Pauli $X$ on both qubits, followed by $Z$", isCorrect: false, explanation: "Pauli gates do not create entanglement." }
        ],
        hint: "$H|00\\rangle = \\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}}|0\\rangle \\xrightarrow{CNOT} \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}$.",
        explanation: "A Hadamard followed by a CNOT entangles two unentangled qubits into the canonical Bell pair."
      },
      {
        id: "teleport-act-2",
        type: "PREDICT",
        title: "Conditional Pauli Correction Readout",
        phaseOrder: 2,
        prompt: "Alice performs Bell basis measurement on her two qubits and records classical bitstring $m_1 = 1, m_0 = 0$. Which correction operator must Bob apply to his qubit to recover the exact input state $|\psi\rangle$?",
        options: [
          { id: "a", label: "Pauli $Z$ gate", isCorrect: true, explanation: "Alice's measurement 10 implies a phase flip occurred, which Bob corrects by applying Z." },
          { id: "b", label: "Pauli $X$ gate", isCorrect: false, explanation: "Outcome 01 requires an X correction." },
          { id: "c", label: "Both $X$ and $Z$ gates ($XZ$)", isCorrect: false, explanation: "Outcome 11 requires both X and Z." },
          { id: "d", label: "Identity (no operation)", isCorrect: false, explanation: "Outcome 00 requires no correction." }
        ],
        hint: "The 4 measurement outcomes map to: $00 \mapsto I, 01 \mapsto X, 10 \mapsto Z, 11 \mapsto XZ$.",
        explanation: "Measurement result $10$ indicates Bob's qubit is in $Z|\psi\rangle$. Applying a Pauli $Z$ ($Z^2 = I$) restores $|\psi\rangle$."
      }
    ],
    sections: [
      { t: "Mission", body: (l) => l.mission + " You will construct the standard three-qubit teleportation circuit, measure Alice's qubits, and apply Bob's conditional corrections to recover the original state." },
      { t: "What You Will Learn", list: [
        "How entanglement enables quantum state transfer",
        "The role of Bell pairs in the teleportation protocol",
        "Why measurement and classical communication are both required",
        "How conditional X and Z corrections reconstruct the original state",
        "Why teleportation does not violate the no-cloning theorem",
        "Why quantum teleportation cannot transmit information faster than light",
      ]},
      { t: "Algorithm Overview", body: () => "The quantum teleportation protocol uses three qubits: q[0] holds the unknown state |ψ⟩ = α|0⟩ + β|1⟩, q[1] is Alice's half of a shared Bell pair, and q[2] is Bob's half. Alice creates entanglement between q[0] and q[1] using CNOT, applies a Hadamard to q[0], then measures both qubits to obtain two classical bits. She sends these bits to Bob, who applies conditional X and Z corrections on q[2] to reconstruct the original quantum state. The original state on q[0] is destroyed by measurement, ensuring no violation of the no-cloning theorem." },
      { t: "Expected Outcome", body: () => "A working three-qubit circuit that teleports an arbitrary single-qubit state from q[0] to q[2]. After measurement and conditional corrections, Bob's qubit q[2] should contain the original state |ψ⟩. Alice's qubit q[0] should be in a definite classical state, confirming the original was destroyed." },
    ],
    hints: [
      "Start by creating the Bell pair: H on q[1], then CNOT from q[1] to q[2].",
      "The CNOT from q[0] to q[1] entangles the unknown state with Alice's Bell qubit.",
      "The Hadamard on q[0] before measurement is essential — it enables the protocol to work for any input state.",
      "Bob's corrections depend on Alice's two measurement results: X for the q[1] result, Z for the q[0] result.",
    ],
    successCriteria: [
      "Bell pair correctly created between q[1] and q[2]",
      "Unknown state entangled with Alice's Bell qubit via CNOT",
      "Hadamard applied to q[0] before measurement",
      "Both of Alice's qubits measured",
      "Correct conditional X/Z corrections applied to q[2]",
    ],
  },
  qft: {
    activities: [
      {
        id: "qft-act-1",
        type: "PREDICT",
        title: "Computational Zero Under QFT",
        phaseOrder: 1,
        prompt: "What quantum state is produced when an $n$-qubit Quantum Fourier Transform is applied to the all-zeros state $|00\dots0\rangle$?",
        options: [
          { id: "a", label: "Equal superposition $\frac{1}{\sqrt{2^n}}\sum_k |k\rangle$ with all zero relative phases", isCorrect: true, explanation: "QFT|j⟩ = (1/√N)∑_k e^(2πijk/N)|k⟩. For j=0, e^0 = 1 for all basis states." },
          { id: "b", label: "The all-ones state |11...1⟩", isCorrect: false, explanation: "QFT produces superpositions, not single flipped basis states." },
          { id: "c", label: "A single state |00...1⟩", isCorrect: false, explanation: "Zero input maps uniformly across all frequency bins." }
        ],
        hint: "When $j = 0$, the phase factor $e^{2\pi i \cdot 0 \cdot k / N} = 1$ for all $k$.",
        explanation: "Applying QFT to $|0\rangle^{\otimes n}$ produces a uniform superposition identical to applying $H$ to every qubit."
      },
      {
        id: "qft-act-2",
        type: "IDENTIFY",
        title: "Bit-Reversal SWAP Purpose",
        phaseOrder: 2,
        prompt: "Why do standard QFT circuits place SWAP gates across reversed qubit pairs at the end of the circuit?",
        options: [
          { id: "a", label: "To reverse the qubit ordering to match standard most-significant-bit Fourier convention", isCorrect: true, explanation: "Natural QFT decomposition outputs the most significant phase bit on the lowest wire." },
          { id: "b", label: "To entangle the registers", isCorrect: false, explanation: "SWAP gates merely exchange wire locations." },
          { id: "c", label: "To measure the circuit", isCorrect: false, explanation: "SWAP is a unitary gate, not a measurement." }
        ],
        hint: "The recursive structure of controlled-phase gates yields binary fractions in reverse order.",
        explanation: "Controlled phase rotations naturally output binary fractions in reversed index order; SWAP gates restore the canonical order."
      }
    ],
    sections: [
      { t: "Mission", body: (l) => l.mission + " You will learn how the QFT circuit decomposes into Hadamard gates, controlled phase rotations, and SWAP gates — and understand why this transform is a critical subroutine in Shor's algorithm and Quantum Phase Estimation." },
      { t: "What You Will Learn", list: [
        "What the Fourier transform does and why it is fundamental",
        "How the Quantum Fourier Transform differs from the classical DFT",
        "Why quantum phase carries critical information in QFT",
        "How superposition and interference produce the Fourier transform",
        "The role of Hadamard gates and controlled phase rotations in the QFT circuit",
        "Why SWAP gates are needed to correct qubit ordering",
        "How to interpret the QFT output state",
        "How QFT powers Quantum Phase Estimation and Shor's algorithm",
      ]},
      { t: "Algorithm Overview", body: () => "The QFT circuit processes qubits sequentially: for each qubit q[k], a Hadamard gate creates an equal superposition, followed by controlled phase rotation gates with control qubits q[k+1], q[k+2], ..., q[n−1]. The rotation angles decrease exponentially (π/2, π/4, π/8, ...). After all qubits are processed, SWAP gates reverse the qubit order to match the standard Fourier transform convention. The result encodes the original amplitude information as relative phases between basis states." },
      { t: "Expected Outcome", body: () => "A working QFT circuit that transforms an n-qubit input state from the computational basis into the Fourier basis. The circuit should use Hadamard gates, controlled phase rotations with the correct angles (π/2^(j−k)), and SWAP gates for proper qubit ordering." },
    ],
    hints: [
      "Process qubits from most significant to least significant — apply H to q[0] first.",
      "The controlled phase rotation between q[k] and q[j] uses angle π/2^(j−k).",
      "After all Hadamard and controlled-phase operations, apply SWAP gates to reverse the qubit order.",
      "For a 3-qubit QFT: H on q[0], then CR(π/2) and CR(π/4), then H on q[1], then CR(π/2), then H on q[2], then SWAP q[0]↔q[2].",
    ],
    successCriteria: [
      "Hadamard gates applied to each qubit in the correct order",
      "Controlled phase rotations use correct angles (π/2^(j−k))",
      "All required controlled phase gates are present",
      "SWAP gates correctly reverse the qubit ordering",
      "Circuit produces the correct Fourier-transformed output state",
    ],
  },
  simon: {
    activities: [
      {
        id: "simon-act-1",
        type: "IDENTIFY",
        title: "Periodicity Orthogonality Condition",
        phaseOrder: 1,
        prompt: "In Simon's algorithm, what algebraic relationship connects every measured bitstring $y$ to the secret period $s$?",
        options: [
          { id: "a", label: "Modulo-2 dot product is zero: $y \cdot s = \sum_i y_i s_i \equiv 0 \pmod 2$", isCorrect: true, explanation: "Destructive interference eliminates any string y where y · s ≡ 1 (mod 2)." },
          { id: "b", label: "The measured string equals s directly ($y = s$)", isCorrect: false, explanation: "Simon's circuit outputs orthogonal vectors, not s itself." },
          { id: "c", label: "y ⊕ s = 1111", isCorrect: false, explanation: "The relationship is an inner product, not bitwise inversion." }
        ],
        hint: "Interference cancels all amplitudes with phase $(-1)^{y \cdot s} = -1$.",
        explanation: "Quantum interference ensures that only bitstrings orthogonal to $s$ under modulo-2 arithmetic ($y \cdot s \equiv 0 \pmod 2$) are measured."
      },
      {
        id: "simon-act-2",
        type: "PREDICT",
        title: "Possible Readouts for Period s = 11",
        phaseOrder: 2,
        prompt: "For a 2-qubit register with secret period $s = 11$, which measurement strings $y$ can be observed from the input register?",
        options: [
          { id: "a", label: "Only $00$ and $11$ ($00\cdot 11 = 0$, $11\cdot 11 = 1+1 \equiv 0 \pmod 2$)", isCorrect: true, explanation: "Both 00 and 11 satisfy the mod-2 orthogonality condition." },
          { id: "b", label: "Only $01$ and $10$", isCorrect: false, explanation: "For 01: 0(1)+1(1) = 1 (mod 2) ≠ 0. These undergo destructive interference." },
          { id: "c", label: "All four strings $00, 01, 10, 11$ equally", isCorrect: false, explanation: "Strings with y · s = 1 cancel out completely." }
        ],
        hint: "Test $y_0 s_0 + y_1 s_1 \pmod 2$ for each string with $s = 11$.",
        explanation: "Only strings $00$ and $11$ have $y \cdot 11 \equiv 0 \pmod 2$. Strings $01$ and $10$ have destructive interference."
      }
    ],
    sections: [
      { t: "Mission", body: (l) => l.mission + " You will learn how to initialize superposition with Hadamard gates, evaluate a quantum oracle, and use interference to extract a hidden string that would require exponentially many classical queries." },
      { t: "What You Will Learn", list: [
        "What the hidden string problem and Simon's promise are",
        "Why classical querying requires exponentially many function calls",
        "How a quantum oracle evaluates a function for all inputs simultaneously",
        "How Hadamard gates create an equal superposition of all inputs",
        "How measuring the output register affects the input register conceptually",
        "How the second set of Hadamard gates creates quantum interference",
        "The mathematical relationship y · s = 0 (mod 2) resulting from measurement",
        "How to solve the resulting system of linear equations to find the hidden string",
        "Why Simon's algorithm demonstrates a true exponential quantum advantage",
      ]},
      { t: "Algorithm Overview", body: () => "Simon's Algorithm uses two n-qubit registers, both initialized to |0...0⟩. Hadamard gates on the first register create an equal superposition of all inputs. The oracle U_f evaluates f(x) and stores it in the second register. Applying Hadamard gates to the first register again creates interference. Measuring the first register gives a string y such that the dot product y · s = 0 (mod 2). Running this circuit O(n) times generates enough linearly independent equations to solve for the hidden string s." },
      { t: "Expected Outcome", body: () => "A working Simon's algorithm circuit that identifies the hidden string s. The circuit must use Hadamard gates to prepare superposition and create interference, include an oracle implementing f(x), and output measurements that allow solving for s." },
    ],
    hints: [
      "Apply Hadamard gates to all qubits in the input register before the oracle.",
      "The oracle must entangle the input and output registers.",
      "Apply Hadamard gates to all qubits in the input register after the oracle.",
      "Measure the input register.",
      "Each measurement gives a string y where y · s = 0 (mod 2).",
    ],
    successCriteria: [
      "Input register initialized with Hadamard gates",
      "Quantum oracle correctly implemented",
      "Hadamard gates applied to input register after the oracle",
      "Input register measured",
      "Classical post-processing solves the linear equations to find s",
    ],
  },
  vqe: {
    activities: [
      {
        id: "vqe-act-1",
        type: "IDENTIFY",
        title: "Variational Principle Ground State Bound",
        phaseOrder: 1,
        prompt: "What mathematical principle guarantees that the measured energy $\langle \psi(\theta) | H | \psi(\theta) \rangle$ will never be lower than the true ground state energy $E_0$?",
        options: [
          { id: "a", label: "Rayleigh-Ritz Variational Principle", isCorrect: true, explanation: "For any normalized state |ψ⟩, ⟨ψ|H|ψ⟩ ≥ E_0 where E_0 is the lowest eigenvalue of H." },
          { id: "b", label: "Heisenberg Uncertainty Principle", isCorrect: false, explanation: "Heisenberg bounds measurement variances of conjugate observables." },
          { id: "c", label: "Quantum No-Cloning Theorem", isCorrect: false, explanation: "No-cloning applies to copying unknown states." }
        ],
        hint: "Expanding $|\psi\rangle = \sum c_i |E_i\rangle$, we have $\langle H \rangle = \sum |c_i|^2 E_i \ge E_0 \sum |c_i|^2 = E_0$.",
        explanation: "The Rayleigh-Ritz theorem guarantees that expectation values provide a rigorous upper bound on the ground state energy."
      },
      {
        id: "vqe-act-2",
        type: "EXPERIMENT",
        title: "Ansatz Expressibility Impact",
        phaseOrder: 2,
        prompt: "What happens if the parameterized quantum ansatz lacks sufficient depth or entangling gates to reach the Hamiltonian's true ground state subspace?",
        options: [
          { id: "a", label: "Optimization converges to an energy strictly higher than the true ground state energy", isCorrect: true, explanation: "The optimizer cannot find a state outside the subspace parameterized by the ansatz." },
          { id: "b", label: "The measured energy drops below the true ground state energy", isCorrect: false, explanation: "The variational principle forbids energies below E_0." },
          { id: "c", label: "The circuit fails to compile on quantum hardware", isCorrect: false, explanation: "The circuit compiles, but the variational approximation is suboptimal." }
        ],
        whatIfQuery: "What happens if I change the rotation parameters?",
        reflectionPrompt: "Classical optimization can only navigate within the state manifold reachable by the ansatz. Did changing parameters alter the expectation value?",
        explanation: "If the ansatz is not expressive enough, the true ground state lies outside its reachable manifold, bounding the best approximation above $E_0$."
      }
    ],
    sections: [
      { t: "Mission", body: (l) => l.mission + " You will learn how to implement a parameterized quantum circuit (ansatz) and optimize its parameters to find the ground state of a Hamiltonian." },
      { t: "What You Will Learn", list: [
        "The variational principle and ground state energies",
        "How to map physical problems into Hamiltonians",
        "What a parameterized quantum circuit (ansatz) is",
        "How expectation values are measured on a quantum computer",
        "The role of the classical optimizer in the VQE loop",
        "Challenges of noise and convergence in near-term hardware",
      ]},
      { t: "Algorithm Overview", body: () => "VQE starts by defining the Hamiltonian H. We choose a parameterized quantum circuit U(θ) and prepare the state |ψ(θ)⟩ = U(θ)|0⟩. The quantum computer measures the expectation value E(θ) = ⟨ψ(θ)|H|ψ(θ)⟩. This energy is fed into a classical optimizer, which updates the parameters θ to find a lower energy. This cycle repeats until the energy converges to a minimum, which serves as an estimate for the ground state energy." },
      { t: "Expected Outcome", body: () => "A working VQE loop that successfully optimizes a parameterized circuit to find the ground state of a given Hamiltonian. The circuit will need to apply parameterized rotations, measure expectation values, and use classical gradient descent or other optimization methods." },
    ],
    hints: [
      "Start with a simple ansatz, such as a layer of Ry rotations followed by CNOTs.",
      "Decompose the Hamiltonian into a sum of Pauli strings.",
      "Measure the expectation value of each Pauli string separately and sum them up.",
      "Use a classical optimizer to iteratively adjust your circuit parameters.",
    ],
    successCriteria: [
      "Parameterized quantum circuit successfully implemented",
      "Expectation value of the Hamiltonian correctly measured",
      "Classical optimizer successfully updates parameters",
      "Energy converges to the expected ground state value",
    ],
  },
  shor: {
    activities: [
      {
        id: "shor-act-1",
        type: "IDENTIFY",
        title: "Quantum Subroutine Providing Exponential Speedup",
        phaseOrder: 1,
        prompt: "Which quantum algorithm powers the exponential speedup inside Shor's polynomial-time factoring protocol?",
        options: [
          { id: "a", label: "Quantum Phase Estimation / Order Finding ($a^r \equiv 1 \pmod N$)", isCorrect: true, explanation: "Order finding finds the period r of f(x) = a^x mod N in polynomial time O((log N)³)." },
          { id: "b", label: "Grover's Amplitude Amplification", isCorrect: false, explanation: "Grover provides quadratic speedup, not exponential." },
          { id: "c", label: "Quantum Random Walk", isCorrect: false, explanation: "Quantum random walks do not solve order finding." }
        ],
        hint: "Factoring is reduced classically to finding the period $r$ of modular exponentiation.",
        explanation: "Quantum Phase Estimation finds the period $r$ exponentially faster than any known classical method."
      },
      {
        id: "shor-act-2",
        type: "IDENTIFY",
        title: "Classical Post-Processing Factor Recovery",
        phaseOrder: 2,
        prompt: "Once the quantum circuit extracts an even period $r$, which classical algorithm computes the non-trivial factors of $N$ from $\gcd(a^{r/2} \pm 1, N)$?",
        options: [
          { id: "a", label: "Euclidean Greatest Common Divisor (GCD) algorithm", isCorrect: true, explanation: "Euclid's algorithm efficiently computes gcd in logarithmic time O(log N)." },
          { id: "b", label: "Trial division", isCorrect: false, explanation: "Trial division takes exponential time." },
          { id: "c", label: "Fast Fourier Transform", isCorrect: false, explanation: "FFT is not used for factor extraction." }
        ],
        hint: "Computing $\gcd(x, N)$ is an efficient $O(\log N)$ classical operation known since antiquity.",
        explanation: "Euclid's algorithm extracts the non-trivial prime factors in fractions of a millisecond on a classical computer once $r$ is known."
      }
    ],
    sections: [
      { t: "Mission", body: (l) => l.mission + " You will learn how period finding solves integer factorization exponentially faster than classical computers." },
      { t: "What You Will Learn", list: [
        "The reduction of factoring to period finding",
        "Modular exponentiation and its role in the algorithm",
        "How quantum superposition evaluates the modular function",
        "How the Quantum Fourier Transform extracts period information",
        "The role of continued fractions in classical post-processing",
        "The implications of Shor's Algorithm for public-key cryptography",
      ]},
      { t: "Algorithm Overview", body: () => "To factor N, we choose a random a < N. We find the period r of the function f(x) = a^x mod N. A quantum circuit is initialized to |0⟩. Superposition is created in the first register, and the modular exponentiation U_f is applied to the second. Applying the QFT to the first register and measuring yields a phase related to the period. Classical continued fractions find r. If r is even, factors of N can be computed." },
      { t: "Expected Outcome", body: () => "A working quantum period finding subroutine that successfully extracts the period of a small modular exponential function using Quantum Phase Estimation principles, controlled modular multiplication, and the inverse QFT." },
    ],
    hints: [
      "The first register needs enough qubits to accurately represent the phase.",
      "The modular exponentiation must be applied conditionally based on the first register.",
      "Apply the inverse QFT to the first register before measurement.",
      "The measured value provides an estimate for s/r, where r is the period.",
    ],
    successCriteria: [
      "Quantum registers initialized correctly",
      "Controlled modular exponentiation correctly implemented",
      "Inverse QFT applied to the first register",
      "Measurement results correctly post-processed to find the period",
      "Period correctly used to find the factors of the target number",
    ],
  },
  "error-correction": {
    activities: [
      {
        id: "qec-act-1",
        type: "IDENTIFY",
        title: "Ancilla Syndrome Non-Destructive Readout",
        phaseOrder: 1,
        prompt: "Why does the 3-qubit bit-flip error correction code measure parity using ancilla qubits rather than measuring the data qubits directly?",
        options: [
          { id: "a", label: "Measuring data qubits directly would collapse the logical superposition $\alpha|000\rangle + \beta|111\rangle$", isCorrect: true, explanation: "Ancilla parity measurements extract error location without distinguishing |000⟩ from |111⟩." },
          { id: "b", label: "Direct measurement is physically impossible on quantum hardware", isCorrect: false, explanation: "Direct measurement is possible, but destroys superposition." },
          { id: "c", label: "Ancilla qubits prevent bit flips from ever occurring", isCorrect: false, explanation: "Ancillas detect errors; they do not physically prevent noise." }
        ],
        hint: "We want to know which qubit flipped without learning whether the logical state was $|0\rangle_L$ or $|1\rangle_L$.",
        explanation: "Syndrome measurement extracts the error without acquiring any information about $\alpha$ or $\beta$, preserving the logical qubit."
      },
      {
        id: "qec-act-2",
        type: "DEBUG",
        title: "Bit-Flip Error Recovery Gate",
        phaseOrder: 2,
        prompt: "Syndrome measurements determine that data qubit $q_0$ suffered an unwanted bit flip. Which unitary gate must be applied to $q_0$ to correct the error?",
        options: [
          { id: "a", label: "Pauli $X$ gate (since $X^2 = I$)", isCorrect: true, explanation: "Applying another Pauli X flips the bit back to its correct state." },
          { id: "b", label: "Pauli $Z$ gate", isCorrect: false, explanation: "Z corrects phase flips, not bit flips." },
          { id: "c", label: "Hadamard $H$ gate", isCorrect: false, explanation: "Hadamard turns a bit error into a phase error." }
        ],
        hint: "A bit flip is represented mathematically by the Pauli $X$ operator.",
        explanation: "Since $X \cdot X = I$, applying a Pauli $X$ gate restores the original encoded quantum state."
      }
    ],
    sections: [
      { t: "Mission", body: (l) => l.mission + " You will learn to use ancilla qubits for syndrome measurement to correct errors without destroying quantum superpositions." },
      { t: "What You Will Learn", list: [
        "Types of quantum errors (bit-flip and phase-flip)",
        "Why the no-cloning theorem prevents simple redundancy",
        "How to encode a logical qubit into multiple physical qubits",
        "How ancilla qubits are used for syndrome measurement",
        "How to interpret syndromes to identify and correct errors",
        "The requirements for fault-tolerant quantum computation",
      ]},
      { t: "Algorithm Overview", body: () => "In the three-qubit bit-flip code, a single logical qubit is encoded into three physical qubits using CNOT gates. When a bit-flip error occurs, the state changes. We use ancilla qubits to measure the parity between pairs of data qubits (the syndrome) without measuring the data qubits directly. The syndrome tells us exactly which qubit flipped, allowing us to apply an X gate to correct it." },
      { t: "Expected Outcome", body: () => "A working three-qubit bit-flip error correction circuit. The circuit will encode a logical state, simulate a bit-flip error on one physical qubit, perform syndrome measurements using ancilla qubits, and apply the correct recovery operation." },
    ],
    hints: [
      "Encode the state |ψ⟩ into a|000⟩ + b|111⟩ using two CNOT gates.",
      "Use ancilla qubits to measure the parity of qubits (1,2) and (2,3).",
      "The syndrome measurements will not collapse the superposition a|000⟩ + b|111⟩.",
      "Map the four possible syndrome outcomes to the four possible error states.",
    ],
    successCriteria: [
      "Logical qubit successfully encoded into three physical qubits",
      "Ancilla qubits correctly measure the error syndrome without destroying the state",
      "Syndrome correctly identifies the location of the error",
      "Recovery operation successfully restores the original encoded state",
    ],
  },
  hhl: {
    activities: [
      {
        id: "hhl-act-1",
        type: "IDENTIFY",
        title: "Hermitian Matrix Requirement",
        phaseOrder: 1,
        prompt: "In the HHL algorithm for solving $A\vec{x} = \vec{b}$, why must matrix $A$ be Hermitian ($A = A^\dagger$)?",
        options: [
          { id: "a", label: "So that $e^{iAt}$ is a unitary operator that can be physically simulated as a quantum gate during QPE", isCorrect: true, explanation: "Stone's theorem: e^(iAt) is unitary if and only if A is Hermitian." },
          { id: "b", label: "Because quantum states cannot represent non-Hermitian matrices", isCorrect: false, explanation: "Non-Hermitian matrices can be embedded into larger Hermitian matrices." },
          { id: "c", label: "So that matrix A contains only real integer numbers", isCorrect: false, explanation: "Hermitian matrices can contain complex values." }
        ],
        hint: "Quantum circuits can only implement unitary transformations $U$ where $U^\dagger U = I$.",
        explanation: "Quantum simulation requires unitary evolution. $e^{iAt}$ is unitary precisely when $A$ is Hermitian."
      },
      {
        id: "hhl-act-2",
        type: "PREDICT",
        title: "Eigenvalue Inversion Unitary",
        phaseOrder: 2,
        prompt: "How does the HHL algorithm invert the extracted eigenvalues $\lambda_j$ to encode $1/\lambda_j$ into quantum amplitudes?",
        options: [
          { id: "a", label: "Controlled $R_y$ rotation on an ancilla qubit with angle $\theta = 2\arcsin(C/\lambda_j)$", isCorrect: true, explanation: "Rotating |0⟩ ↦ √(1-(C/λ)²) |0⟩ + (C/λ) |1⟩ puts 1/λ into the amplitude of |1⟩." },
          { id: "b", label: "Applying an inverse Quantum Fourier Transform directly", isCorrect: false, explanation: "Inverse QFT uncomputes the clock register, but does not perform 1/λ inversion." },
          { id: "c", label: "Measuring the clock register in the computational basis", isCorrect: false, explanation: "Measurement collapses the superposition rather than inverting amplitudes." }
        ],
        hint: "A rotation of $|0\rangle$ by angle $2\arcsin(C/\lambda)$ gives amplitude $C/\lambda$ for state $|1\rangle$.",
        explanation: "A controlled $R_y$ rotation encodes the reciprocal eigenvalue $1/\lambda_j$ into the amplitude of the ancilla's $|1\rangle$ state."
      }
    ],
    sections: [
      { t: "Mission", body: (l) => l.mission + " You will learn how to extract eigenvalues and invert them using controlled quantum rotations." },
      { t: "What You Will Learn", list: [
        "The concept of encoding a classical vector into a quantum state",
        "How Hamiltonian simulation is used when A is a Hermitian matrix",
        "The role of Quantum Phase Estimation in extracting the eigenvalues of A",
        "How controlled rotations invert the eigenvalues",
        "The uncomputation step using the inverse QPE",
        "Critical caveats of HHL (state preparation, condition number, readout)",
      ]},
      { t: "Algorithm Overview", body: () => "HHL assumes A is a sparse, Hermitian matrix. We prepare the state |b⟩. We use QPE with U = e^(iAt) to extract the eigenvalues λ_j of A into a clock register. We then use a controlled-Ry rotation on an ancilla qubit, rotating by an angle proportional to 1/λ_j. Finally, we uncompute the QPE to disentangle the clock register. If the ancilla is measured as |1⟩, the main register contains the state |x⟩ proportional to A^(-1)|b⟩." },
      { t: "Expected Outcome", body: () => "A working HHL circuit for a small 2x2 linear system. The circuit must encode the input state, apply QPE to extract eigenvalues, perform the controlled rotation for eigenvalue inversion, and uncompute the QPE." },
    ],
    hints: [
      "A must be normalized so its eigenvalues can be represented in the clock register.",
      "The controlled rotation on the ancilla is the step that performs the actual inversion (1/λ).",
      "You must apply the exact inverse of your QPE circuit to uncompute the clock register.",
      "The solution state |x⟩ is only valid when you post-select the ancilla measurement on |1⟩.",
    ],
    successCriteria: [
      "Input vector correctly encoded into the quantum state |b⟩",
      "Quantum Phase Estimation correctly extracts the eigenvalues of A",
      "Controlled rotation correctly applies the inversion 1/λ",
      "Inverse QPE successfully uncomputes the clock register",
      "Post-selected state represents the correct solution to Ax = b",
    ],
  },
};

export interface LevelLesson {
  id: string;
  order: number;
  title: string;
  duration: string;
  xp_reward: number;
  description: string;
  completed: boolean;
  learningObjective?: string;
  explanation?: string;
  relevantConcept?: string;
  expectedUnderstanding?: string;
}

export function getProjectLessons(slug: string, levelNum: number, algorithm: string): LevelLesson[] {
  const curriculum = getProjectCurriculum(slug);
  if (curriculum && curriculum.phases && curriculum.phases.length > 0) {
    return curriculum.phases.map((p) => ({
      id: p.id,
      order: p.order,
      title: `${String(p.order).padStart(2, "0")} · ${p.title}`,
      duration: p.duration,
      xp_reward: p.xp_reward,
      description: p.explanation,
      completed: false,
      learningObjective: p.objective,
      explanation: p.explanation,
      relevantConcept: p.math,
      expectedUnderstanding: p.checkAnswer,
    }));
  }

  const titles = [
    "Quantum Concept & Physical Intuition",
    "Mathematical Foundations & State Space",
    "Circuit Topology & Wire Setup",
    "State Preparation & Superposition",
    `Core ${algorithm.split(" ")[0]} Operator`,
    "Phase Shifts & Quantum Interference",
    "Measurement Strategy & Basis Readout",
    "AI Tutor Socratic Circuit Debugging",
    "What-If Hypothesis & Fault Tolerance",
    "Final Circuit Synthesis & Mission XP",
  ];

  return titles.map((title, idx) => ({
    id: `${slug}-lesson-${idx + 1}`,
    order: idx + 1,
    title: `${String(idx + 1).padStart(2, "0")} · ${title}`,
    duration: `${5 + (idx % 4) * 2} min`,
    xp_reward: 50,
    description: `Phase ${idx + 1} of the ${algorithm} mission curriculum.`,
    completed: idx < 2, // First two phases completed/unlocked for immersion
  }));
}

export function getMissionActivities(slug: string): MissionActivity[] {
  const cleanSlug = slug === "qkd" ? "bb84" : slug;
  const content = projectContent[cleanSlug] ?? projectContent._default;
  return content.activities ?? [];
}
