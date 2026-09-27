"""Seed data — populates the database with initial levels, challenges, achievements,
and a demo student/instructor matching the frontend's hardcoded data."""

from app.core.database import async_session_factory
from app.core.security import hash_password
from app.core.logging import logger
from app.models.user import User
from app.models.learning import LearningLevel, Project, Lesson
from app.models.challenge import Challenge
from app.models.progress import Achievement, UserAchievement, UserConceptMastery, XPTransaction
from app.models.analytics import InstructorAssignment
from sqlalchemy import select, func


# ══════════════ LEVELS (matches data.ts levels[]) ══════════════

LEVELS = [
    {
        "n": 1, "role": "Security Analyst", "title": "Quantum Key Distribution",
        "algorithm": "BB84 Protocol", "difficulty": "Beginner", "duration": "45 min",
        "xp": 500, "slug": "qkd",
        "mission": "Your first mission as a Security Analyst: use quantum mechanics to generate a provably secure encryption key between two parties using the BB84 protocol.",
        "concepts": ["Superposition", "Measurement", "Basis states", "No-cloning theorem"],
        "gates": ["H", "X", "M"],
    },
    {
        "n": 2, "role": "Logic Designer", "title": "Deutsch–Jozsa Algorithm",
        "algorithm": "Deutsch–Jozsa", "difficulty": "Beginner", "duration": "50 min",
        "xp": 750, "slug": "deutsch-jozsa",
        "mission": "Design a quantum circuit that determines whether a function is constant or balanced in a single query — exponentially faster than any classical algorithm.",
        "concepts": ["Superposition", "Interference", "Oracle design", "Phase kickback"],
        "gates": ["H", "X", "Z", "CNOT"],
    },
    {
        "n": 3, "role": "Data Architect", "title": "Grover's Search",
        "algorithm": "Grover's Algorithm", "difficulty": "Intermediate", "duration": "60 min",
        "xp": 1000, "slug": "grover",
        "mission": "Build a quantum search engine. Construct Grover's algorithm to find a marked item in an unsorted database with quadratic speedup.",
        "concepts": ["Amplitude amplification", "Oracle", "Diffusion operator", "Quantum speedup"],
        "gates": ["H", "X", "Z", "CNOT", "CZ"],
    },
    {
        "n": 4, "role": "Logistics Engineer", "title": "Optimization with QAOA",
        "algorithm": "QAOA", "difficulty": "Advanced", "duration": "75 min",
        "xp": 1500, "slug": "qaoa",
        "mission": "Tackle a real-world logistics problem: solve the Max-Cut graph optimization problem using the Quantum Approximate Optimization Algorithm.",
        "concepts": ["Variational circuits", "Cost function", "Parameterized gates", "Classical-quantum loop"],
        "gates": ["H", "RX", "RY", "RZ", "CNOT", "CZ"],
    },
    {
        "n": 5, "role": "Quantum AI Engineer", "title": "Quantum Neural Network",
        "algorithm": "QNN / VQC", "difficulty": "Advanced", "duration": "90 min",
        "xp": 2000, "slug": "qnn",
        "mission": "Build a quantum neural network. Use parameterized quantum circuits (variational quantum classifiers) to classify data on a hybrid quantum-classical pipeline.",
        "concepts": ["Variational circuits", "Data encoding", "Quantum feature maps", "Hybrid training"],
        "gates": ["H", "RX", "RY", "RZ", "CNOT", "SWAP"],
    },
    {
        "n": 6, "role": "Communications Specialist", "title": "Quantum Teleportation",
        "algorithm": "Quantum Teleportation Protocol", "difficulty": "Intermediate", "duration": "55 min",
        "xp": 850, "slug": "teleportation",
        "mission": "Master the quantum teleportation protocol: transfer an unknown quantum state between two parties using entanglement and classical communication — without moving a single particle.",
        "concepts": ["Entanglement", "Bell states", "Measurement", "Classical communication", "No-cloning theorem", "Conditional corrections"],
        "gates": ["H", "X", "Z", "CNOT", "M"],
    },
    {
        "n": 7, "role": "Quantum Algorithm Engineer", "title": "Quantum Fourier Transform",
        "algorithm": "Quantum Fourier Transform (QFT)", "difficulty": "Advanced", "duration": "60 min",
        "xp": 1000, "slug": "qft",
        "mission": "Master the Quantum Fourier Transform: learn how quantum interference transforms phase information into measurable patterns and understand why QFT is fundamental to major quantum algorithms.",
        "concepts": ["Fourier transform", "Quantum interference", "Phase", "Hadamard gates", "Controlled phase rotations", "QFT circuit structure"],
        "gates": ["H", "RZ", "CNOT", "SWAP", "M"],
    },
    {
        "n": 8, "role": "Quantum Algorithm Engineer", "title": "Hidden Pattern Detection",
        "algorithm": "Simon's Algorithm", "difficulty": "Advanced", "duration": "65 min",
        "xp": 1100, "slug": "simon",
        "mission": "Discover a hidden binary pattern inside a black-box function using quantum parallelism and interference, demonstrating an exponential quantum advantage over classical querying.",
        "concepts": ["Quantum oracle", "Superposition", "Interference", "Hidden strings", "Linear equations", "Measurement", "Quantum advantage"],
        "gates": ["H", "CNOT", "M"],
    },
    {
        "n": 9, "role": "Quantum Optimization Scientist", "title": "Molecular Energy Explorer",
        "algorithm": "Variational Quantum Eigensolver", "difficulty": "Advanced", "duration": "70 min",
        "xp": 1250, "slug": "vqe",
        "mission": "Estimate the lowest energy state of a quantum system by combining a parameterized quantum circuit with a classical optimization loop.",
        "concepts": ["Variational principle", "Parameterized circuits", "Ansatz", "Expectation values", "Hamiltonians", "Classical optimization", "Ground-state energy", "Hybrid quantum-classical computing"],
        "gates": ["H", "RX", "RY", "RZ", "CNOT", "M"],
    },
    {
        "n": 10, "role": "Quantum Cryptography Specialist", "title": "Factorization Challenge",
        "algorithm": "Shor's Algorithm", "difficulty": "Expert", "duration": "80 min",
        "xp": 1500, "slug": "shor",
        "mission": "Understand how quantum period finding can transform integer factorization and reveal why large-scale quantum computers threaten widely used public-key cryptography.",
        "concepts": ["Integer factorization", "Modular arithmetic", "Period finding", "Quantum Fourier Transform", "Phase estimation", "Continued fractions", "Classical post-processing", "Cryptographic security"],
        "gates": ["H", "X", "CNOT", "RZ", "M"],
    },
    {
        "n": 11, "role": "Quantum Reliability Engineer", "title": "Protect the Qubit",
        "algorithm": "Quantum Error Correction", "difficulty": "Expert", "duration": "75 min",
        "xp": 1400, "slug": "error-correction",
        "mission": "Learn how quantum error-correcting codes protect fragile quantum information from bit-flip and phase-flip errors without directly measuring the encoded quantum state.",
        "concepts": ["Quantum noise", "Bit-flip errors", "Phase-flip errors", "Ancilla qubits", "Syndrome measurement", "Three-qubit repetition code", "Error detection", "Error correction", "Fault tolerance", "Decoherence"],
        "gates": ["H", "X", "Z", "CNOT", "M"],
    },
    {
        "n": 12, "role": "Quantum Computing Researcher", "title": "Quantum Linear Systems",
        "algorithm": "HHL Algorithm", "difficulty": "Expert", "duration": "85 min",
        "xp": 1700, "slug": "hhl",
        "mission": "Explore how quantum phase estimation and controlled rotations can encode information about the solution of a linear system into a quantum state.",
        "concepts": ["Linear systems", "Hamiltonian simulation", "Quantum phase estimation", "Controlled rotation", "Ancilla qubit", "Eigenvalues", "Quantum state encoding", "Condition number", "Quantum linear algebra"],
        "gates": ["H", "X", "RY", "RZ", "CNOT", "M"],
    },
]


# ══════════════ CHALLENGES (matches data.ts challenges[]) ══════════════

CHALLENGES = [
    {
        "slug": "bell-state", "title": "Create a Bell State",
        "statement": "Build a circuit that produces the Bell state (|00⟩ + |11⟩)/√2. When measured, qubits should be perfectly correlated — both |00⟩ or both |11⟩ with equal probability.",
        "algorithm": "Entanglement", "difficulty": "Beginner", "xp_reward": 100,
        "tone": "cyan", "qubit_count": 2,
        "allowed_gates": ["H", "X", "CNOT", "M"],
        "max_depth": 4, "max_gate_count": 3,
        "target_probabilities": {"00": 0.5, "11": 0.5},
        "expected_output_display": "|00⟩ and |11⟩ each at 50%",
        "requirements": ["Use exactly 2 qubits", "Achieve equal superposition of |00⟩ and |11⟩"],
        "hints": ["Start with H on q[0]", "Use CNOT to entangle"],
    },
    {
        "slug": "uniform-superposition", "title": "Uniform Superposition",
        "statement": "Put 2 qubits into a uniform superposition over all four basis states. Each state (|00⟩, |01⟩, |10⟩, |11⟩) should have equal probability of 25%.",
        "algorithm": "Superposition", "difficulty": "Beginner", "xp_reward": 75,
        "tone": "blue", "qubit_count": 2,
        "allowed_gates": ["H", "X", "Y", "Z", "M"],
        "max_depth": 3, "max_gate_count": 3,
        "target_probabilities": {"00": 0.25, "01": 0.25, "10": 0.25, "11": 0.25},
        "expected_output_display": "All 4 states at 25%",
        "requirements": ["Apply Hadamard to both qubits"],
        "hints": ["H on each qubit creates uniform superposition"],
    },
    {
        "slug": "phase-flip", "title": "Phase Flip Oracle",
        "statement": "Implement a phase oracle that flips the phase of the |11⟩ state. All other states should remain unchanged.",
        "algorithm": "Oracle Design", "difficulty": "Intermediate", "xp_reward": 150,
        "tone": "violet", "qubit_count": 2,
        "allowed_gates": ["H", "X", "Z", "CNOT", "CZ", "M"],
        "max_depth": 5, "max_gate_count": 4,
        "target_probabilities": {},
        "evaluation_type": "statevector",
        "expected_output_display": "Phase of |11⟩ flipped",
        "requirements": ["Only |11⟩ should acquire a phase of -1"],
        "hints": ["A CZ gate flips the phase when both qubits are |1⟩"],
    },
    {
        "slug": "ghz-state", "title": "3-Qubit GHZ State",
        "statement": "Create a 3-qubit GHZ state (|000⟩ + |111⟩)/√2. This is the maximally entangled state of three qubits.",
        "algorithm": "Entanglement", "difficulty": "Intermediate", "xp_reward": 200,
        "tone": "cyan", "qubit_count": 3,
        "allowed_gates": ["H", "X", "CNOT", "M"],
        "max_depth": 5, "max_gate_count": 4,
        "target_probabilities": {"000": 0.5, "111": 0.5},
        "expected_output_display": "|000⟩ and |111⟩ each at 50%",
        "requirements": ["Use 3 qubits", "Only |000⟩ and |111⟩ should appear"],
        "hints": ["H on q[0], CNOT from q[0] to q[1], CNOT from q[0] to q[2]"],
    },
    {
        "slug": "swap-test", "title": "SWAP Test",
        "statement": "Implement the SWAP test to compare two single-qubit states. Use an ancilla qubit to determine if the states are equal.",
        "algorithm": "Protocols", "difficulty": "Intermediate", "xp_reward": 175,
        "tone": "magenta", "qubit_count": 3,
        "allowed_gates": ["H", "X", "CNOT", "SWAP", "M"],
        "max_depth": 8, "max_gate_count": 6,
        "target_probabilities": {},
        "expected_output_display": "Ancilla measures |0⟩ for equal states",
        "requirements": ["Use ancilla qubit at q[0]"],
        "hints": ["H on ancilla, controlled-SWAP, H on ancilla, measure ancilla"],
    },
    {
        "slug": "grover-2qubit", "title": "Grover Search (2 qubits)",
        "statement": "Implement Grover's algorithm to search for the state |11⟩ in a 2-qubit system. After one iteration, |11⟩ should have the highest probability.",
        "algorithm": "Grover's Algorithm", "difficulty": "Advanced", "xp_reward": 300,
        "tone": "violet", "qubit_count": 2,
        "allowed_gates": ["H", "X", "Z", "CNOT", "CZ", "M"],
        "max_depth": 10, "max_gate_count": 12,
        "target_probabilities": {"11": 1.0},
        "expected_output_display": "|11⟩ amplified to ~100%",
        "requirements": ["One Grover iteration should be sufficient for 2 qubits"],
        "hints": ["Oracle: CZ to mark |11⟩", "Diffusion: H→X→CZ→X→H"],
    },
]


# ══════════════ ACHIEVEMENTS (matches data.ts badges[]) ══════════════

ACHIEVEMENTS = [
    {"name": "First Qubit", "description": "Run your first circuit", "tone": "cyan", "order": 1},
    {"name": "Entangler", "description": "Create a Bell state", "tone": "blue", "order": 2},
    {"name": "Bug Hunter", "description": "Debug a quantum circuit", "tone": "violet", "order": 3},
    {"name": "Speed Runner", "description": "Solve a challenge in under 2 minutes", "tone": "cyan", "order": 4},
    {"name": "Deep Diver", "description": "Complete Level 3", "tone": "magenta", "order": 5},
    {"name": "Quantum Master", "description": "Complete all levels", "tone": "violet", "order": 6},
]


# ══════════════ PROJECTS & LESSONS ══════════════

PROJECTS = {
    "teleportation": {
        "overview": "Quantum teleportation is a protocol that transfers an unknown quantum state from one qubit to another using a shared entangled pair and classical communication. Despite its name, quantum teleportation does not move physical matter or transmit information faster than light. Instead, it reconstructs the exact quantum state of a source qubit at a distant location, destroying the original in the process. This protocol is fundamental to quantum communication, quantum networks, and distributed quantum computing.",
        "learning_objectives": [
            "Explain what quantum teleportation is and what is actually transferred",
            "Identify the three qubits in the standard teleportation protocol",
            "Explain why a shared Bell pair is required",
            "Describe the role of the Hadamard gate and CNOT gate in the protocol",
            "Explain the two classical measurement bits and why classical communication is necessary",
            "Apply the conditional X and Z corrections to reconstruct the original state",
            "Explain why quantum teleportation does not violate the no-cloning theorem",
            "Describe practical applications and current limitations of quantum teleportation",
        ],
        "algorithm_overview": "The quantum teleportation protocol uses three qubits: q[0] holds the unknown state to be teleported, q[1] is Alice's half of a shared Bell pair, and q[2] is Bob's half. Alice entangles q[0] with q[1], applies a Hadamard gate, and measures both qubits to obtain two classical bits. She sends these bits to Bob, who applies conditional X and Z corrections on q[2] to reconstruct the original quantum state.",
        "expected_outcome": "After completing the protocol, Bob's qubit q[2] contains the exact quantum state that was originally on Alice's qubit q[0]. Alice's original state is destroyed by measurement, ensuring no violation of the no-cloning theorem. The protocol demonstrates that quantum information can be transferred using entanglement and classical communication.",
        "hints": [
            "Start by creating a Bell pair between q[1] and q[2] using H followed by CNOT.",
            "The CNOT from q[0] to q[1] entangles the unknown state with Alice's Bell qubit.",
            "The Hadamard on q[0] before measurement is essential — it enables the protocol to work for any input state.",
            "Bob's corrections depend on Alice's two measurement results: use X for the q[1] result and Z for the q[0] result.",
        ],
        "success_criteria": [
            "Bell pair correctly created between q[1] and q[2]",
            "Unknown state correctly entangled with Alice's Bell qubit",
            "Both of Alice's qubits measured",
            "Correct conditional X and Z corrections applied to Bob's qubit",
            "Bob's qubit contains the original quantum state",
        ],
    },
    "qft": {
        "overview": "The Quantum Fourier Transform (QFT) is the quantum analogue of the classical discrete Fourier transform. It transforms a quantum state from the computational basis into the frequency (Fourier) basis, encoding amplitude information into phase relationships between basis states. QFT is exponentially faster than its classical counterpart — an n-qubit QFT requires only O(n²) gates, compared to O(n·2ⁿ) operations for the classical FFT. QFT is not typically used as a standalone algorithm; instead, it is a critical subroutine inside major quantum algorithms including Quantum Phase Estimation, Shor's factoring algorithm, and quantum simulation protocols.",
        "learning_objectives": [
            "Explain what the Fourier transform does and why it is useful",
            "Describe the key differences between the classical DFT and the Quantum Fourier Transform",
            "Explain what quantum phase is and why it carries important information",
            "Describe how superposition and interference work together inside QFT",
            "Explain the role of Hadamard gates in creating superpositions within the QFT circuit",
            "Explain controlled phase rotation gates and why they are required",
            "Construct the QFT circuit step by step for a small number of qubits",
            "Explain why SWAP gates are needed at the end of the QFT circuit",
            "Interpret the output of a QFT circuit in terms of phase information",
            "Describe how QFT is used inside Quantum Phase Estimation and Shor's algorithm",
        ],
        "algorithm_overview": "The QFT circuit processes qubits sequentially. For each qubit q[k], a Hadamard gate creates an equal superposition, followed by a series of controlled phase rotation gates (controlled-Rz or controlled-phase) with control qubits q[k+1], q[k+2], ..., q[n-1]. The rotation angles decrease exponentially: π/2, π/4, π/8, etc. After all qubits have been processed, SWAP gates reverse the qubit order to match the standard Fourier transform convention. The result is a quantum state where the original amplitude information is encoded as relative phases between basis states.",
        "expected_outcome": "A working QFT circuit that correctly transforms an n-qubit input state from the computational basis into the Fourier basis. The circuit should use Hadamard gates, controlled phase rotations with the correct angles, and SWAP gates for proper qubit ordering. The output state should encode the input amplitudes as relative phases.",
        "hints": [
            "Process qubits from most significant to least significant — apply H to q[0] first.",
            "The controlled phase rotation between q[k] and q[j] uses angle π/2^(j-k).",
            "After all Hadamard and controlled-phase operations, apply SWAP gates to reverse the qubit order.",
            "For a 3-qubit QFT: H on q[0], then CR(π/2) and CR(π/4), then H on q[1], then CR(π/2), then H on q[2], then SWAP q[0]↔q[2].",
        ],
        "success_criteria": [
            "Hadamard gates applied to each qubit in the correct order",
            "Controlled phase rotations use the correct angles (π/2^(j-k))",
            "All required controlled phase gates are present",
            "SWAP gates correctly reverse the qubit ordering",
            "Circuit produces the correct Fourier-transformed output state",
        ],
    },
    "simon": {
        "overview": "Simon's Algorithm solves a specific black-box problem: given a function f(x) that is guaranteed to be two-to-one (meaning f(x) = f(y) if and only if x = y ⊕ s), find the hidden bitstring s. Classically, this requires exponentially many queries to the function in the worst case to find a collision. Simon's Algorithm solves this problem with only a linear number of quantum queries. This provides an exponential quantum advantage and was one of the first algorithms to demonstrate that quantum computers can be exponentially faster than classical computers for specific problems. It inspired Shor's algorithm for factoring.",
        "learning_objectives": [
            "Explain the hidden string problem and Simon's promise",
            "Understand why classical querying can require exponentially many queries",
            "Describe the function of the quantum oracle for Simon's problem",
            "Explain how Hadamard gates create an equal superposition of all inputs",
            "Understand how evaluating the oracle entangles the input and output registers",
            "Explain how measuring the output register affects the input register",
            "Describe how the second set of Hadamard gates creates quantum interference",
            "Understand the mathematical relationship y · s = 0 mod 2 resulting from measurement",
            "Explain how to solve the resulting system of linear equations to find s",
            "Understand why this algorithm demonstrates a true exponential quantum advantage",
        ],
        "algorithm_overview": "Simon's Algorithm uses two registers of n qubits, initialized to |0...0⟩. Hadamard gates are applied to the first register to create an equal superposition of all possible inputs. The quantum oracle U_f evaluates f(x) and stores the result in the second register. Measuring the second register (conceptually) collapses the first register into a superposition of two states: |x⟩ and |x ⊕ s⟩. Applying Hadamard gates to the first register again causes interference, yielding a state that, when measured, produces a string y such that the dot product y · s = 0 (mod 2). By running the circuit O(n) times, we obtain a system of linear equations that can be solved classically to find s.",
        "expected_outcome": "A working Simon's algorithm circuit that identifies the hidden string s. The circuit should correctly use Hadamard gates to prepare superposition and create interference, and include an oracle that implements the function f(x). Multiple runs should yield linearly independent equations to solve for s.",
        "hints": [
            "Apply Hadamard gates to all qubits in the input register before the oracle.",
            "The oracle must entangle the input and output registers.",
            "Apply Hadamard gates to all qubits in the input register after the oracle.",
            "Measure the input register.",
            "Each measurement gives a string y where y · s = 0 (mod 2).",
        ],
        "success_criteria": [
            "Input register initialized with Hadamard gates",
            "Quantum oracle correctly implemented",
            "Hadamard gates applied to input register after the oracle",
            "Input register measured",
            "Classical post-processing solves the linear equations to find s",
        ],
    },
    "vqe": {
        "overview": "The Variational Quantum Eigensolver (VQE) is a hybrid quantum-classical algorithm designed to find the ground state energy of a physical system, which corresponds to the lowest eigenvalue of the system's Hamiltonian. Because quantum circuits with relatively low depth can prepare complex ansatz states, VQE is considered one of the most promising algorithms for near-term quantum computers (NISQ devices). It combines a parameterized quantum circuit that prepares a state, quantum measurements that estimate the expectation value of the Hamiltonian, and a classical optimizer that updates the circuit parameters to minimize the energy.",
        "learning_objectives": [
            "Explain the variational principle and how it relates to finding ground state energies",
            "Understand how to map a physical problem into a Hamiltonian",
            "Describe what a parameterized quantum circuit (ansatz) is",
            "Explain how expectation values are measured on a quantum computer",
            "Understand the role of the classical optimizer in the VQE loop",
            "Identify the challenges of noise and convergence in near-term hardware",
        ],
        "algorithm_overview": "VQE starts by defining the Hamiltonian H of the system. We choose a parameterized quantum circuit U(θ), called the ansatz, and prepare the state |ψ(θ)⟩ = U(θ)|0⟩. The quantum computer measures the expectation value E(θ) = ⟨ψ(θ)|H|ψ(θ)⟩. This energy is fed into a classical optimizer, which updates the parameters θ to find a lower energy. This cycle repeats until the energy converges to a minimum, which serves as an estimate for the ground state energy.",
        "expected_outcome": "A working VQE loop that successfully optimizes a parameterized circuit to find the ground state of a given Hamiltonian. The circuit will need to apply parameterized rotations, measure expectation values, and use classical gradient descent or other optimization methods to update the parameters.",
        "hints": [
            "Start with a simple ansatz, such as a layer of Ry rotations followed by CNOTs.",
            "Decompose the Hamiltonian into a sum of Pauli strings (e.g., aZI + bIZ + cXX).",
            "Measure the expectation value of each Pauli string separately and sum them up.",
            "Use a classical optimizer to iteratively adjust your circuit parameters.",
        ],
        "success_criteria": [
            "Parameterized quantum circuit successfully implemented",
            "Expectation value of the Hamiltonian correctly measured",
            "Classical optimizer successfully updates parameters",
            "Energy converges to the expected ground state value",
        ],
    },
    "shor": {
        "overview": "Shor's Algorithm is a quantum algorithm for integer factorization that runs in polynomial time, exponentially faster than the best known classical algorithms. It relies on the insight that factoring can be reduced to the problem of finding the period of a modular exponential function. By using quantum superposition to evaluate the function for many inputs simultaneously and the Quantum Fourier Transform to extract the period, Shor's algorithm demonstrates the profound cryptographic implications of large-scale quantum computers.",
        "learning_objectives": [
            "Understand the reduction of factoring to period finding",
            "Explain modular exponentiation and its role in the algorithm",
            "Describe how quantum superposition is used to evaluate the modular function",
            "Explain how the Quantum Fourier Transform extracts period information",
            "Understand the role of continued fractions in classical post-processing",
            "Discuss the implications of Shor's Algorithm for public-key cryptography (e.g., RSA)",
        ],
        "algorithm_overview": "To factor a number N, we choose a random a < N. If gcd(a, N) > 1, we found a factor. Otherwise, we find the period r of the function f(x) = a^x mod N. A quantum circuit with two registers is initialized to |0⟩. Superposition is created in the first register, and the modular exponentiation U_f is applied to the second. Measuring the second register leaves the first in a periodic superposition. Applying the QFT to the first register and measuring yields a phase related to the period. Classical continued fractions find r. If r is even, factors of N can be computed.",
        "expected_outcome": "A working quantum period finding subroutine that successfully extracts the period of a small modular exponential function. The circuit will use Quantum Phase Estimation principles, incorporating controlled modular multiplication and the inverse QFT.",
        "hints": [
            "The first register needs enough qubits to accurately represent the phase.",
            "The modular exponentiation must be applied conditionally based on the first register.",
            "Apply the inverse QFT to the first register before measurement.",
            "The measured value provides an estimate for s/r, where r is the period.",
        ],
        "success_criteria": [
            "Quantum registers initialized correctly",
            "Controlled modular exponentiation correctly implemented",
            "Inverse QFT applied to the first register",
            "Measurement results correctly post-processed to find the period",
            "Period correctly used to find the factors of the target number",
        ],
    },
    "error-correction": {
        "overview": "Quantum Error Correction (QEC) is essential for building fault-tolerant quantum computers because qubits are extremely susceptible to noise and decoherence. Unlike classical bits, qubits cannot simply be copied due to the no-cloning theorem. QEC solves this by encoding the state of one 'logical' qubit into the entangled state of multiple 'physical' qubits. By measuring specific operators called 'syndromes' using ancilla qubits, we can detect and correct errors without measuring (and thus destroying) the logical quantum information.",
        "learning_objectives": [
            "Understand the types of quantum errors (bit-flip and phase-flip)",
            "Explain why the no-cloning theorem prevents simple redundancy",
            "Describe how to encode a logical qubit into multiple physical qubits",
            "Understand how ancilla qubits are used for syndrome measurement",
            "Explain how to interpret syndromes to identify and correct errors",
            "Discuss the requirements for fault-tolerant quantum computation",
        ],
        "algorithm_overview": "We start with the simple three-qubit bit-flip code. A single logical qubit |ψ⟩ = a|0⟩ + b|1⟩ is encoded into three physical qubits as a|000⟩ + b|111⟩ using CNOT gates. When a bit-flip error occurs on one qubit, the state changes. We use two additional ancilla qubits to measure the parity between pairs of data qubits (the syndrome) without measuring the data qubits directly. The syndrome tells us exactly which qubit flipped, allowing us to apply an X gate to correct it.",
        "expected_outcome": "A working three-qubit bit-flip error correction circuit. The circuit will encode a logical state, simulate a bit-flip error on one of the physical qubits, perform syndrome measurements using ancilla qubits, and apply the correct recovery operation.",
        "hints": [
            "Encode the state |ψ⟩ into a|000⟩ + b|111⟩ using two CNOT gates.",
            "Use ancilla qubits to measure the parity of qubits (1,2) and (2,3).",
            "The syndrome measurements will not collapse the superposition a|000⟩ + b|111⟩.",
            "Map the four possible syndrome outcomes to the four possible error states (no error, error on 1, 2, or 3).",
        ],
        "success_criteria": [
            "Logical qubit successfully encoded into three physical qubits",
            "Ancilla qubits correctly measure the error syndrome without destroying the state",
            "Syndrome correctly identifies the location of the error",
            "Recovery operation successfully restores the original encoded state",
        ],
    },
    "hhl": {
        "overview": "The HHL (Harrow-Hassidim-Lloyd) Algorithm solves systems of linear equations of the form Ax = b exponentially faster than classical algorithms under specific assumptions. It works by encoding the vector b as a quantum state |b⟩, and then applying a transformation proportional to the inverse of the matrix A. Because A is a matrix, HHL uses Hamiltonian simulation to apply e^(iAt) and Quantum Phase Estimation to extract the eigenvalues of A into an ancilla register, where a controlled rotation effectively inverts them.",
        "learning_objectives": [
            "Understand the concept of encoding a classical vector into a quantum state",
            "Explain how Hamiltonian simulation is used when A is a Hermitian matrix",
            "Describe the role of Quantum Phase Estimation in extracting the eigenvalues of A",
            "Understand how controlled rotations invert the eigenvalues",
            "Explain the uncomputation step using the inverse QPE",
            "Discuss the critical caveats of HHL (state preparation, condition number, readout)",
        ],
        "algorithm_overview": "HHL assumes A is a sparse, Hermitian matrix. We prepare the state |b⟩. We use QPE with U = e^(iAt) to extract the eigenvalues λ_j of A into a clock register, transforming the state into a superposition of |λ_j⟩|u_j⟩ (where u_j are eigenvectors). We then use a controlled-Ry rotation on an ancilla qubit, rotating by an angle proportional to 1/λ_j. Finally, we uncompute the QPE (apply inverse QPE) to disentangle the clock register. If the ancilla is measured as |1⟩, the main register contains the state |x⟩ proportional to A^(-1)|b⟩.",
        "expected_outcome": "A working HHL circuit for a small 2x2 linear system. The circuit must encode the input state, apply QPE to extract eigenvalues, perform the controlled rotation for eigenvalue inversion, and uncompute the QPE.",
        "hints": [
            "A must be normalized so its eigenvalues can be represented in the clock register.",
            "The controlled rotation on the ancilla is the step that performs the actual inversion (1/λ).",
            "You must apply the exact inverse of your QPE circuit to uncompute the clock register.",
            "The solution state |x⟩ is only valid when you post-select the ancilla measurement on |1⟩.",
        ],
        "success_criteria": [
            "Input vector correctly encoded into the quantum state |b⟩",
            "Quantum Phase Estimation correctly extracts the eigenvalues of A",
            "Controlled rotation correctly applies the inversion 1/λ",
            "Inverse QPE successfully uncomputes the clock register",
            "Post-selected state represents the correct solution to Ax = b",
        ],
    },
}

LESSONS = {
    "teleportation": [
        {
            "title": "Introduction to Quantum Teleportation",
            "order": 1,
            "xp_reward": 50,
            "duration_minutes": 5,
            "content": (
                "Quantum teleportation is a protocol that transfers an unknown quantum state from one location to another. "
                "Despite the name, quantum teleportation does not move physical matter or energy. What is actually transferred is the "
                "quantum state — the complete quantum information describing a qubit — from a sender (Alice) to a receiver (Bob).\n\n"
                "The protocol requires three ingredients: (1) an unknown quantum state that Alice wants to send, (2) a shared entangled "
                "pair of qubits (a Bell pair) between Alice and Bob, and (3) classical communication — Alice must send two classical bits "
                "to Bob after performing her measurements.\n\n"
                "Quantum teleportation is important because it enables quantum communication without directly transmitting fragile quantum "
                "states through a noisy channel. It is a foundational building block for quantum networks, quantum repeaters, and "
                "distributed quantum computing."
            ),
        },
        {
            "title": "Prerequisites",
            "order": 2,
            "xp_reward": 50,
            "duration_minutes": 6,
            "content": (
                "Before learning the teleportation protocol, you should understand these concepts:\n\n"
                "Qubit: The basic unit of quantum information. Unlike a classical bit (0 or 1), a qubit can exist in a superposition "
                "of both states simultaneously.\n\n"
                "Superposition: A qubit in superposition is in a combination of |0⟩ and |1⟩ states, described as α|0⟩ + β|1⟩ where "
                "|α|² + |β|² = 1.\n\n"
                "Measurement: Observing a qubit forces it to collapse into either |0⟩ or |1⟩. Measurement is irreversible and "
                "fundamentally changes the quantum state.\n\n"
                "Entanglement: Two qubits can be correlated in a way that has no classical equivalent. Measuring one instantly "
                "determines the state of the other, regardless of distance.\n\n"
                "Bell States: Maximally entangled two-qubit states. The teleportation protocol uses the Bell state "
                "(|00⟩ + |11⟩)/√2, created by applying H then CNOT.\n\n"
                "Hadamard Gate (H): Creates superposition. Transforms |0⟩ → (|0⟩ + |1⟩)/√2 and |1⟩ → (|0⟩ − |1⟩)/√2.\n\n"
                "CNOT Gate: A two-qubit gate that flips the target qubit if the control qubit is |1⟩. Essential for creating "
                "entanglement.\n\n"
                "Pauli-X Gate: The quantum equivalent of a classical NOT gate. Flips |0⟩ to |1⟩ and vice versa.\n\n"
                "Pauli-Z Gate: Applies a phase flip. Leaves |0⟩ unchanged but maps |1⟩ to −|1⟩.\n\n"
                "Classical Bits: Ordinary bits (0 or 1) transmitted through a classical communication channel. The teleportation "
                "protocol requires sending two classical bits from Alice to Bob."
            ),
        },
        {
            "title": "The Three Qubits",
            "order": 3,
            "xp_reward": 50,
            "duration_minutes": 4,
            "content": (
                "The standard quantum teleportation protocol uses exactly three qubits:\n\n"
                "q[0] — Alice's unknown state |ψ⟩: This is the qubit whose quantum state Alice wants to teleport to Bob. "
                "Alice does not need to know what state this qubit is in. It can be any arbitrary superposition α|0⟩ + β|1⟩.\n\n"
                "q[1] — Alice's half of the entangled Bell pair: This qubit is entangled with Bob's qubit q[2]. Alice holds "
                "this qubit locally.\n\n"
                "q[2] — Bob's half of the entangled Bell pair: This qubit is entangled with Alice's q[1]. Bob holds this qubit "
                "at his location, which may be far away from Alice.\n\n"
                "Why three qubits? The unknown state on q[0] cannot be directly copied (no-cloning theorem) or reliably transmitted "
                "through a noisy channel. Instead, the pre-shared entanglement between q[1] and q[2] acts as a quantum communication "
                "resource that enables the state transfer. At the end of the protocol, q[2] (Bob's qubit) contains the teleported state."
            ),
        },
        {
            "title": "Step 1 — Prepare the Unknown State",
            "order": 4,
            "xp_reward": 50,
            "duration_minutes": 4,
            "content": (
                "The protocol begins with an arbitrary unknown quantum state on q[0]:\n\n"
                "|ψ⟩ = α|0⟩ + β|1⟩\n\n"
                "Here α and β are complex numbers called probability amplitudes. They satisfy the normalization condition:\n\n"
                "|α|² + |β|² = 1\n\n"
                "The probability of measuring |0⟩ is |α|² and the probability of measuring |1⟩ is |β|².\n\n"
                "A critical point: Alice does not need to know the values of α and β to teleport the state. In fact, if Alice tried "
                "to measure q[0] to learn α and β, the measurement would destroy the superposition and collapse the qubit to either "
                "|0⟩ or |1⟩. This is precisely why teleportation is remarkable — it transfers the full quantum state without Alice "
                "ever learning what that state is."
            ),
        },
        {
            "title": "Step 2 — Create the Bell Pair",
            "order": 5,
            "xp_reward": 60,
            "duration_minutes": 5,
            "content": (
                "Before the teleportation can begin, Alice and Bob must share an entangled Bell pair. This is created by:\n\n"
                "1. Apply a Hadamard gate (H) to q[1]:\n"
                "   |0⟩ → (|0⟩ + |1⟩)/√2\n\n"
                "2. Apply a CNOT gate with q[1] as control and q[2] as target:\n"
                "   (|0⟩ + |1⟩)/√2 ⊗ |0⟩ → (|00⟩ + |11⟩)/√2\n\n"
                "The result is the Bell state (|00⟩ + |11⟩)/√2. This is a maximally entangled state: if you measure q[1] and get |0⟩, "
                "q[2] is guaranteed to be |0⟩, and if you measure q[1] and get |1⟩, q[2] is guaranteed to be |1⟩.\n\n"
                "In practice, this Bell pair would be created ahead of time and the two qubits distributed — Alice keeps q[1] and "
                "Bob takes q[2] to his location. The entanglement persists regardless of the distance between them.\n\n"
                "At this point the full three-qubit system is in the state:\n"
                "|ψ⟩ ⊗ (|00⟩ + |11⟩)/√2 = (α|0⟩ + β|1⟩) ⊗ (|00⟩ + |11⟩)/√2"
            ),
        },
        {
            "title": "Step 3 — Entangle the Unknown State",
            "order": 6,
            "xp_reward": 60,
            "duration_minutes": 6,
            "content": (
                "Now Alice performs two operations on her qubits (q[0] and q[1]):\n\n"
                "1. Apply CNOT with q[0] as control and q[1] as target:\n"
                "   CNOT(q[0], q[1])\n"
                "   This entangles the unknown state with Alice's half of the Bell pair.\n\n"
                "2. Apply a Hadamard gate (H) to q[0]:\n"
                "   H(q[0])\n"
                "   This changes the basis of q[0], enabling the measurement to extract the information needed for Bob's corrections.\n\n"
                "What do these operations accomplish? They effectively perform a Bell-basis measurement preparation. After these two "
                "gates, the information about the original quantum state |ψ⟩ becomes distributed across the entire three-qubit system. "
                "The unknown state is no longer localized on q[0] alone — it is spread across all three qubits through entanglement.\n\n"
                "This is the key insight: the CNOT and H gates transform the system so that Alice's subsequent measurement will "
                "project the system into one of four possible states, each of which leaves Bob's qubit in a state that is simply "
                "related to the original |ψ⟩ by a known correction."
            ),
        },
        {
            "title": "Steps 4 & 5 — Measurement and Classical Communication",
            "order": 7,
            "xp_reward": 70,
            "duration_minutes": 7,
            "content": (
                "MEASUREMENT:\n\n"
                "Alice measures both of her qubits — q[0] and q[1]. Each measurement yields a classical bit (0 or 1), giving Alice "
                "two classical bits of information. There are four equally likely outcomes: 00, 01, 10, or 11.\n\n"
                "This measurement fundamentally changes the quantum system. Alice's qubits collapse into definite classical states. "
                "The original quantum state |ψ⟩ on q[0] is destroyed by this measurement — it no longer exists on q[0]. However, "
                "the information about |ψ⟩ is not lost. Because of the entanglement, Bob's qubit q[2] is now in a state that is "
                "related to the original |ψ⟩ by a specific transformation that depends on Alice's measurement results.\n\n"
                "Why can't Alice just send the quantum state directly? Quantum states cannot be reliably copied (no-cloning theorem) "
                "and are extremely fragile — any interaction with the environment can destroy the superposition. Teleportation avoids "
                "this problem by using pre-shared entanglement.\n\n"
                "CLASSICAL COMMUNICATION:\n\n"
                "Alice sends her two classical measurement bits to Bob through an ordinary classical communication channel — a phone "
                "call, a text message, or any other classical means.\n\n"
                "This step is critical: without knowing Alice's measurement results, Bob cannot determine what correction to apply "
                "to his qubit. The quantum state on Bob's qubit is essentially scrambled until he receives Alice's classical bits.\n\n"
                "IMPORTANT: Because the protocol requires classical communication, quantum teleportation cannot transmit usable "
                "information faster than the speed of light. The classical bits must travel through a normal channel at or below "
                "light speed. Quantum entanglement alone, without classical communication, does not allow Bob to extract any useful "
                "information. This is a fundamental result in quantum mechanics."
            ),
        },
        {
            "title": "Step 6 — Conditional Corrections and Final State",
            "order": 8,
            "xp_reward": 70,
            "duration_minutes": 7,
            "content": (
                "CONDITIONAL CORRECTIONS:\n\n"
                "Once Bob receives Alice's two classical bits, he applies the appropriate correction gates to his qubit q[2]:\n\n"
                "• Alice measured 00 → Bob applies no correction. q[2] is already in state |ψ⟩.\n"
                "• Alice measured 01 → Bob applies the X gate (Pauli-X). This flips |0⟩ ↔ |1⟩.\n"
                "• Alice measured 10 → Bob applies the Z gate (Pauli-Z). This flips the phase: |1⟩ → −|1⟩.\n"
                "• Alice measured 11 → Bob applies both X and Z gates.\n\n"
                "The X gate corrects bit-flip errors (swapping the amplitudes α and β), while the Z gate corrects phase-flip "
                "errors (changing the relative sign between α and β). Together, these two simple single-qubit gates can undo any "
                "of the four possible transformations caused by Alice's measurement.\n\n"
                "FINAL STATE:\n\n"
                "After applying the appropriate correction, Bob's qubit q[2] is in the state:\n\n"
                "|ψ⟩ = α|0⟩ + β|1⟩\n\n"
                "This is exactly the original quantum state that was on Alice's q[0]. The teleportation is complete.\n\n"
                "Alice's original qubit q[0] no longer contains the state |ψ⟩ — it was destroyed by measurement and is now in "
                "a definite classical state (|0⟩ or |1⟩). The quantum information has been transferred, not copied."
            ),
        },
        {
            "title": "No-Cloning Theorem and Protocol Summary",
            "order": 9,
            "xp_reward": 60,
            "duration_minutes": 6,
            "content": (
                "NO-CLONING THEOREM:\n\n"
                "A common question: does quantum teleportation create a copy of the original state? No. The no-cloning theorem "
                "states that it is impossible to create an exact copy of an arbitrary unknown quantum state. Teleportation respects "
                "this theorem because:\n\n"
                "• The original state on Alice's q[0] is destroyed by measurement.\n"
                "• Bob receives the state on q[2].\n"
                "• At no point do two copies of |ψ⟩ exist simultaneously.\n"
                "• The quantum information is transferred, not duplicated.\n\n"
                "WHY CLASSICAL COMMUNICATION IS REQUIRED:\n\n"
                "Quantum entanglement alone is not sufficient. Without Alice's two classical bits, Bob's qubit is in a random "
                "mixture of states — he cannot extract any useful information. The classical communication step is what makes "
                "the protocol work, and it is also what prevents faster-than-light communication.\n\n"
                "COMPLETE PROTOCOL SUMMARY:\n\n"
                "1. Prepare the unknown state |ψ⟩ = α|0⟩ + β|1⟩ on q[0].\n"
                "2. Create a Bell pair: H on q[1], then CNOT(q[1], q[2]).\n"
                "3. Entangle the unknown state: CNOT(q[0], q[1]).\n"
                "4. Apply Hadamard: H on q[0].\n"
                "5. Measure q[0] and q[1] to obtain two classical bits.\n"
                "6. Send the two classical bits from Alice to Bob.\n"
                "7. Apply conditional corrections: X and/or Z on q[2].\n"
                "8. Bob's q[2] now contains the original state |ψ⟩."
            ),
        },
        {
            "title": "Applications and Limitations",
            "order": 10,
            "xp_reward": 60,
            "duration_minutes": 5,
            "content": (
                "REAL-WORLD APPLICATIONS:\n\n"
                "Quantum Communication: Teleportation enables the transfer of quantum information between distant parties without "
                "sending the fragile quantum state through a noisy channel.\n\n"
                "Quantum Networks: Teleportation is a key protocol for linking quantum processors in a quantum network, enabling "
                "distributed quantum computing.\n\n"
                "Quantum Repeaters: Long-distance quantum communication suffers from signal loss. Quantum repeaters use teleportation "
                "to extend the range of quantum communication by relaying entanglement across intermediate nodes.\n\n"
                "Distributed Quantum Computing: Teleportation allows quantum processors at different locations to share quantum states, "
                "enabling them to collaborate on computations that require more qubits than any single processor has.\n\n"
                "Quantum Internet Research: Researchers are actively working toward a quantum internet where quantum teleportation "
                "connects quantum devices worldwide.\n\n"
                "LIMITATIONS:\n\n"
                "• Requires entanglement: The protocol cannot function without a pre-shared entangled pair. Generating and distributing "
                "high-quality entanglement is technically challenging.\n\n"
                "• Requires classical communication: The two classical bits must be transmitted, limiting the speed to at most the "
                "speed of light. Teleportation does not enable faster-than-light communication.\n\n"
                "• Does not teleport matter: Only quantum information (the state) is transferred. No physical particles move.\n\n"
                "• Original state is destroyed: Alice loses the original quantum state upon measurement. This is a fundamental "
                "consequence, not a technical limitation.\n\n"
                "• Entanglement quality: In real systems, maintaining high-fidelity entanglement over long distances and time periods "
                "is extremely difficult due to decoherence and environmental noise."
            ),
        },
    ],
    "qft": [
        {
            "title": "Introduction to the Fourier Transform",
            "order": 1,
            "xp_reward": 50,
            "duration_minutes": 5,
            "content": (
                "The Fourier transform is one of the most important mathematical tools in science and engineering. It takes a signal "
                "— any function that varies over time or space — and decomposes it into its constituent frequencies.\n\n"
                "Consider a musical chord: when you hear several notes played simultaneously, your ear perceives a single complex "
                "sound. The Fourier transform reveals the individual notes (frequencies) that make up the chord, along with how "
                "loud each note is (amplitude) and when each note starts (phase).\n\n"
                "More formally, the Fourier transform converts a function from the time domain (or position domain) into the "
                "frequency domain. Each frequency component has two properties: an amplitude (how strong that frequency is) and "
                "a phase (how that frequency is shifted in time).\n\n"
                "The Discrete Fourier Transform (DFT) operates on a finite list of N numbers and produces N frequency "
                "components. The classical Fast Fourier Transform (FFT) algorithm computes this in O(N log N) operations. "
                "The Quantum Fourier Transform achieves the same mathematical transformation using only O(log²N) quantum gates, "
                "an exponential speedup — though extracting the full output requires measurement, which is probabilistic."
            ),
        },
        {
            "title": "From Classical Fourier Transform to QFT",
            "order": 2,
            "xp_reward": 50,
            "duration_minutes": 6,
            "content": (
                "The Quantum Fourier Transform (QFT) is the quantum analogue of the classical Discrete Fourier Transform (DFT). "
                "Both perform the same mathematical operation, but they differ fundamentally in how they represent and process data.\n\n"
                "CLASSICAL DFT:\n"
                "Input: a vector of N complex numbers (x₀, x₁, ..., x_{N-1}).\n"
                "Output: a vector of N complex numbers (y₀, y₁, ..., y_{N-1}).\n"
                "Each output yₖ = (1/√N) Σⱼ xⱼ · e^(2πijk/N).\n"
                "The classical FFT computes this in O(N log N) arithmetic operations.\n\n"
                "QUANTUM FOURIER TRANSFORM:\n"
                "Input: an n-qubit quantum state |x⟩ = Σⱼ xⱼ|j⟩ where N = 2ⁿ.\n"
                "Output: a quantum state |y⟩ = Σₖ yₖ|k⟩ with the same DFT relationship.\n"
                "The QFT circuit uses O(n²) = O(log²N) quantum gates.\n\n"
                "KEY DIFFERENCES:\n\n"
                "1. Exponential compression: The QFT operates on n = log₂(N) qubits, not N numbers.\n"
                "2. Superposition: All N amplitudes are processed simultaneously through quantum parallelism.\n"
                "3. Phase encoding: The result of a QFT is encoded in the relative phases of the quantum state, not "
                "directly readable as numbers.\n"
                "4. Measurement limitation: You cannot read all N output values — measurement collapses the state to a single "
                "basis state. This is why QFT is used as a subroutine inside larger algorithms that extract useful information "
                "from the phase structure without needing every individual value."
            ),
        },
        {
            "title": "Understanding Quantum Phase",
            "order": 3,
            "xp_reward": 50,
            "duration_minutes": 6,
            "content": (
                "Phase is one of the most important concepts in quantum computing, and it is central to how QFT works.\n\n"
                "A qubit in superposition is described as α|0⟩ + β|1⟩, where α and β are complex numbers. Every complex number "
                "can be written as r·e^(iθ), where r is the magnitude and θ is the phase angle.\n\n"
                "GLOBAL PHASE vs. RELATIVE PHASE:\n\n"
                "Global phase: Multiplying the entire state by e^(iθ) — e.g., e^(iθ)(α|0⟩ + β|1⟩). This has no measurable effect "
                "and is physically unobservable.\n\n"
                "Relative phase: The phase difference between components — e.g., α|0⟩ + e^(iφ)β|1⟩. This IS physically meaningful "
                "and affects measurement outcomes after interference.\n\n"
                "WHY PHASE MATTERS FOR QFT:\n\n"
                "The QFT encodes information as relative phases between basis states. Consider two states that look identical "
                "when measured in the computational basis:\n\n"
                "State A: (|0⟩ + |1⟩)/√2\n"
                "State B: (|0⟩ + e^(iπ)|1⟩)/√2 = (|0⟩ − |1⟩)/√2\n\n"
                "Both give 50/50 outcomes when measured directly. But they have different relative phases (0 vs. π), and the QFT "
                "can distinguish them by converting these phase differences into different amplitude patterns.\n\n"
                "The Hadamard gate is the simplest example: it converts relative phase into measurable amplitude differences. "
                "H applied to (|0⟩ + |1⟩)/√2 gives |0⟩, while H applied to (|0⟩ − |1⟩)/√2 gives |1⟩. The phase difference "
                "became a deterministic measurement outcome."
            ),
        },
        {
            "title": "Superposition and Interference",
            "order": 4,
            "xp_reward": 50,
            "duration_minutes": 5,
            "content": (
                "The QFT relies on two quantum phenomena working together: superposition and interference.\n\n"
                "SUPERPOSITION:\n\n"
                "A single qubit in superposition represents two values simultaneously. Two qubits represent four values. "
                "In general, n qubits represent 2ⁿ values simultaneously. The QFT exploits this to process all input values "
                "in parallel — this is the source of its exponential advantage over classical computation.\n\n"
                "INTERFERENCE:\n\n"
                "When two quantum amplitudes combine, they can add constructively (reinforcing each other) or destructively "
                "(cancelling each other out). This is quantum interference, and it is the mechanism by which the QFT produces "
                "its output.\n\n"
                "HOW THEY WORK TOGETHER IN QFT:\n\n"
                "1. Hadamard gates create superpositions, putting each qubit into a state that represents multiple values.\n"
                "2. Controlled phase rotations introduce specific phase shifts that depend on the input state.\n"
                "3. When the superpositions combine, interference causes certain frequency components to be amplified "
                "(constructive interference) and others to be suppressed (destructive interference).\n"
                "4. The result is a quantum state where each basis state's amplitude corresponds to a specific frequency "
                "component of the input — exactly the Fourier transform.\n\n"
                "This is analogous to how light waves passing through a prism interfere to separate white light into its "
                "component colors. The QFT circuit acts as a quantum prism for information."
            ),
        },
        {
            "title": "The Role of Hadamard Gates",
            "order": 5,
            "xp_reward": 60,
            "duration_minutes": 6,
            "content": (
                "The Hadamard gate is the fundamental building block of the QFT circuit. Understanding its role is essential "
                "to understanding how QFT works.\n\n"
                "WHAT THE HADAMARD GATE DOES:\n\n"
                "H|0⟩ = (|0⟩ + |1⟩)/√2\n"
                "H|1⟩ = (|0⟩ − |1⟩)/√2\n\n"
                "More generally, for a computational basis state |x⟩ where x is 0 or 1:\n"
                "H|x⟩ = (|0⟩ + (−1)ˣ|1⟩)/√2 = (1/√2) Σₖ (−1)^(xk)|k⟩\n\n"
                "This is exactly a 1-qubit Fourier transform! The Hadamard gate converts a single bit of information "
                "into a phase: the input value x becomes the phase factor (−1)ˣ on the |1⟩ component.\n\n"
                "ROLE IN THE QFT CIRCUIT:\n\n"
                "In the QFT circuit, each qubit receives exactly one Hadamard gate. The H gate on qubit q[k] creates an "
                "equal superposition that serves as the starting point for that qubit's contribution to the transform.\n\n"
                "After the Hadamard, controlled phase rotations refine the phase of each qubit based on the values of the "
                "other qubits. The Hadamard creates the superposition; the controlled rotations encode the frequency "
                "information.\n\n"
                "CONNECTION TO THE 1-QUBIT QFT:\n\n"
                "For a single qubit, the QFT is exactly the Hadamard gate. For n qubits, the QFT generalizes this by "
                "adding controlled phase rotations between qubits. You can think of the n-qubit QFT as n coupled 1-qubit "
                "Fourier transforms, where the coupling is provided by the controlled phase gates."
            ),
        },
        {
            "title": "Controlled Phase Rotations",
            "order": 6,
            "xp_reward": 60,
            "duration_minutes": 7,
            "content": (
                "After each Hadamard gate in the QFT circuit, a series of controlled phase rotation gates fine-tune the "
                "phases to produce the correct Fourier transform.\n\n"
                "WHAT IS A CONTROLLED PHASE ROTATION?\n\n"
                "A controlled-Rz(θ) gate (also written as CRₖ or controlled-phase gate) applies a phase rotation of angle θ "
                "to the target qubit, but only when the control qubit is |1⟩:\n\n"
                "If control = |0⟩: nothing happens.\n"
                "If control = |1⟩: the target qubit's |1⟩ component gets multiplied by e^(iθ).\n\n"
                "THE QFT ROTATION ANGLES:\n\n"
                "In the QFT circuit, after applying H to qubit q[k], controlled phase rotations are applied with:\n"
                "- Control: q[k+1], rotation angle: π/2¹ = π/2\n"
                "- Control: q[k+2], rotation angle: π/2² = π/4\n"
                "- Control: q[k+3], rotation angle: π/2³ = π/8\n"
                "- And so on...\n\n"
                "The rotation angle for the gate controlled by qubit q[j] on target q[k] is:\n"
                "θ = π/2^(j−k) = 2π/2^(j−k+1)\n\n"
                "WHY THESE SPECIFIC ANGLES?\n\n"
                "These angles come directly from the mathematical definition of the DFT. The DFT uses roots of unity: "
                "e^(2πi/N) where N = 2ⁿ. The controlled phase rotations encode the binary representation of the input "
                "into the phase of each output qubit. Each additional bit of the input requires a phase rotation that is "
                "half the angle of the previous one, corresponding to the binary place value of that bit.\n\n"
                "Together, the Hadamard gate and the controlled phase rotations on each qubit produce exactly one row of "
                "the DFT matrix — and processing all qubits produces the complete transform."
            ),
        },
        {
            "title": "Building the QFT Circuit",
            "order": 7,
            "xp_reward": 70,
            "duration_minutes": 7,
            "content": (
                "The QFT circuit has a regular, recursive structure. Here is how to build it step by step for 3 qubits "
                "(n = 3, N = 8).\n\n"
                "STEP 1 — Process q[0] (most significant qubit):\n"
                "1a. Apply H to q[0].\n"
                "1b. Apply controlled-R(π/2) with control=q[1], target=q[0].\n"
                "1c. Apply controlled-R(π/4) with control=q[2], target=q[0].\n\n"
                "After this step, q[0] contains a superposition whose phases encode information from all three input qubits.\n\n"
                "STEP 2 — Process q[1] (middle qubit):\n"
                "2a. Apply H to q[1].\n"
                "2b. Apply controlled-R(π/2) with control=q[2], target=q[1].\n\n"
                "STEP 3 — Process q[2] (least significant qubit):\n"
                "3a. Apply H to q[2].\n\n"
                "(No controlled rotations follow, because there are no remaining qubits.)\n\n"
                "STEP 4 — Reverse qubit order:\n"
                "4a. SWAP q[0] and q[2].\n"
                "(q[1] stays in place for an odd number of qubits.)\n\n"
                "GENERAL PATTERN:\n\n"
                "For n qubits, the QFT circuit processes qubit q[k] (for k = 0, 1, ..., n−1) by:\n"
                "1. Applying H to q[k].\n"
                "2. For each subsequent qubit q[j] where j = k+1, k+2, ..., n−1:\n"
                "   Apply controlled-R(π/2^(j−k)) with control=q[j], target=q[k].\n"
                "3. After all qubits are processed, SWAP qubits to reverse their order.\n\n"
                "The total gate count is n Hadamard gates + n(n−1)/2 controlled rotations + ⌊n/2⌋ SWAPs = O(n²) gates."
            ),
        },
        {
            "title": "Qubit Ordering and SWAP Gates",
            "order": 8,
            "xp_reward": 60,
            "duration_minutes": 5,
            "content": (
                "After applying all Hadamard and controlled phase gates, the QFT circuit produces the correct Fourier "
                "coefficients — but in reversed order. SWAP gates at the end fix this.\n\n"
                "WHY THE REVERSAL HAPPENS:\n\n"
                "The standard DFT convention places the lowest-frequency component at position 0 and the highest at "
                "position N−1. In the QFT circuit, the first qubit processed (q[0]) ends up encoding the highest-frequency "
                "component, while the last qubit (q[n−1]) encodes the lowest. This is because each qubit's Fourier "
                "coefficient depends on the subsequent qubits' controlled rotations, and q[0] accumulates the most phase "
                "information (from all other qubits).\n\n"
                "HOW SWAP GATES FIX IT:\n\n"
                "A SWAP gate exchanges the states of two qubits completely. To reverse the qubit order of an n-qubit register:\n"
                "- SWAP q[0] ↔ q[n−1]\n"
                "- SWAP q[1] ↔ q[n−2]\n"
                "- Continue until you reach the middle.\n\n"
                "For 3 qubits: SWAP q[0] ↔ q[2] (q[1] stays in place).\n"
                "For 4 qubits: SWAP q[0] ↔ q[3], then SWAP q[1] ↔ q[2].\n\n"
                "IMPLEMENTATION NOTE:\n\n"
                "A SWAP gate can be decomposed into three CNOT gates: CNOT(a,b), CNOT(b,a), CNOT(a,b). On hardware "
                "that doesn't support native SWAP, this decomposition is used. The total number of SWAP gates is ⌊n/2⌋.\n\n"
                "Some implementations of QFT omit the SWAP gates entirely and instead keep track of the reversed ordering "
                "in classical bookkeeping. This is valid when QFT is used as a subroutine and the subsequent operations "
                "can be adjusted to account for the reversed qubit order."
            ),
        },
        {
            "title": "Understanding the QFT Output",
            "order": 9,
            "xp_reward": 60,
            "duration_minutes": 6,
            "content": (
                "After the QFT circuit executes, the quantum state encodes the Fourier transform in its amplitudes and phases. "
                "Understanding what this output represents is crucial.\n\n"
                "WHAT THE OUTPUT STATE LOOKS LIKE:\n\n"
                "If the input is a computational basis state |j⟩, the QFT output is:\n"
                "QFT|j⟩ = (1/√N) Σₖ e^(2πijk/N)|k⟩\n\n"
                "This is an equal superposition of all basis states, but each basis state |k⟩ has a specific phase factor "
                "e^(2πijk/N) that depends on both the input j and the output index k.\n\n"
                "PHASE ENCODING:\n\n"
                "The key information is in the phases, not the amplitudes. Every output basis state has the same amplitude "
                "(1/√N), so measuring in the computational basis gives a uniformly random outcome. The information is encoded "
                "in how the phases relate to each other.\n\n"
                "WHY THIS IS USEFUL:\n\n"
                "Although you cannot directly read the phases by measuring, quantum algorithms use interference after the QFT "
                "to convert phase information into amplitude information that CAN be measured. This is the core idea behind:\n\n"
                "- Quantum Phase Estimation: applies QFT⁻¹ (inverse QFT) after controlled-U operations to convert an "
                "eigenvalue's phase into a measurable binary string.\n"
                "- Period finding: the QFT transforms a periodic state into a state whose measurement outcomes reveal the period.\n\n"
                "THE INVERSE QFT (QFT⁻¹):\n\n"
                "The inverse QFT reverses the transformation: it converts from the Fourier basis back to the computational "
                "basis. The inverse QFT circuit is simply the QFT circuit run in reverse, with all rotation angles negated. "
                "In practice, this means reversing the gate order and replacing each R(θ) with R(−θ)."
            ),
        },
        {
            "title": "Why QFT Matters",
            "order": 10,
            "xp_reward": 70,
            "duration_minutes": 7,
            "content": (
                "The Quantum Fourier Transform is not usually run as a standalone algorithm. Its importance comes from being "
                "a critical subroutine inside the most important quantum algorithms known.\n\n"
                "QUANTUM PHASE ESTIMATION (QPE):\n\n"
                "QPE estimates the eigenvalue of a unitary operator. Given a unitary U and an eigenvector |ψ⟩ such that "
                "U|ψ⟩ = e^(2πiφ)|ψ⟩, QPE estimates the phase φ. The algorithm works by:\n"
                "1. Creating a superposition of controlled-U operations that encode φ into relative phases.\n"
                "2. Applying the inverse QFT to convert those phases into a binary representation of φ.\n"
                "3. Measuring to read off the estimate of φ.\n\n"
                "Without QFT, there would be no efficient way to extract the phase information.\n\n"
                "PERIOD FINDING:\n\n"
                "Finding the period of a function — the smallest r such that f(x+r) = f(x) — is classically hard for certain "
                "functions. The QFT transforms a quantum state that has been prepared with the periodic structure of f into a "
                "state whose measurement outcomes cluster around multiples of N/r, revealing the period r.\n\n"
                "SHOR'S ALGORITHM:\n\n"
                "Shor's algorithm for integer factorization is perhaps the most famous quantum algorithm. It works by:\n"
                "1. Reducing factorization to period finding (a number theory result).\n"
                "2. Using quantum parallelism to evaluate the periodic function in superposition.\n"
                "3. Applying the QFT to extract the period from the quantum state.\n"
                "4. Using the period to compute the factors classically.\n\n"
                "The QFT is what gives Shor's algorithm its exponential speedup over the best known classical factoring "
                "algorithms. Without QFT, there is no known way to efficiently extract periods on a quantum computer.\n\n"
                "OTHER APPLICATIONS:\n\n"
                "QFT also appears in quantum simulation (simulating quantum systems), the hidden subgroup problem, quantum "
                "counting (estimating the number of solutions to a search problem), and quantum machine learning algorithms. "
                "It is one of the most fundamental and widely-used quantum subroutines."
            ),
        },
    ],
    "simon": [
        {
            "title": "The Hidden String Problem",
            "order": 1,
            "xp_reward": 50,
            "duration_minutes": 5,
            "content": (
                "Simon's Algorithm tackles a specific computational problem involving a 'black box' or oracle function.\n\n"
                "THE PROBLEM:\n\n"
                "You are given a function f(x) that takes an n-bit string as input and produces an n-bit string as output. "
                "You know that the function is either one-to-one (every input gives a unique output) or two-to-one (exactly "
                "two inputs give the same output). If it is two-to-one, there is a secret, non-zero binary string 's' such that:\n\n"
                "f(x) = f(y) if and only if x = y ⊕ s\n\n"
                "where ⊕ denotes the bitwise XOR operation.\n\n"
                "This condition is known as Simon's promise.\n\n"
                "YOUR GOAL:\n\n"
                "Your task is to determine whether the function is one-to-one or two-to-one, and if it is two-to-one, to "
                "find the hidden string 's'. In the case where the function is one-to-one, we can consider 's' to be the "
                "all-zero string (s = 00...0)."
            ),
        },
        {
            "title": "Why Classical Search Is Expensive",
            "order": 2,
            "xp_reward": 50,
            "duration_minutes": 6,
            "content": (
                "Before looking at the quantum solution, let's understand why this problem is difficult for classical computers.\n\n"
                "THE CLASSICAL APPROACH:\n\n"
                "Classically, the only way to find 's' is to query the function f(x) with different inputs until you find a "
                "collision — two different inputs x and y that produce the same output f(x) = f(y). Once you find a collision, "
                "you can easily calculate s = x ⊕ y.\n\n"
                "THE COST OF FINDING A COLLISION:\n\n"
                "There are 2^n possible inputs. If you query the function with a few inputs, the chance of finding a collision "
                "is very small. In the worst case, you might have to query just over half of all possible inputs to guarantee "
                "finding a collision. Even on average, you need to make about 2^(n/2) queries (this is related to the Birthday Paradox).\n\n"
                "EXPONENTIAL SCALING:\n\n"
                "As n grows, 2^(n/2) grows exponentially. For a 100-bit string, you would need around 2^50 queries, which is "
                "a massive number. This means the classical algorithm takes exponential time to solve the problem."
            ),
        },
        {
            "title": "Simon's Promise",
            "order": 3,
            "xp_reward": 50,
            "duration_minutes": 5,
            "content": (
                "The core of Simon's problem is 'Simon's promise', the strict mathematical structure of the function f(x).\n\n"
                "UNDERSTANDING XOR (⊕):\n\n"
                "The XOR operation is bitwise addition modulo 2. A crucial property of XOR is that if x ⊕ y = s, then "
                "x ⊕ s = y and y ⊕ s = x. Furthermore, x ⊕ x = 00...0 for any string x.\n\n"
                "THE TWO-TO-ONE MAPPING:\n\n"
                "Because of the condition f(x) = f(x ⊕ s), the 2^n possible inputs are paired up into 2^(n-1) pairs. Each "
                "pair of inputs (x and x ⊕ s) maps to a unique output. No other input maps to that output.\n\n"
                "This strict structure is what the quantum algorithm will exploit. The algorithm doesn't care what the actual "
                "output values are; it only cares about the relationship between the inputs that produce the same output."
            ),
        },
        {
            "title": "Building the Quantum Oracle",
            "order": 4,
            "xp_reward": 60,
            "duration_minutes": 7,
            "content": (
                "In a quantum algorithm, classical functions are implemented as quantum oracles. The oracle for Simon's "
                "Algorithm is a unitary operation U_f that evaluates the function f(x).\n\n"
                "THE ORACLE's ACTION:\n\n"
                "The oracle acts on two quantum registers, each with n qubits:\n"
                "- An input register (to hold x)\n"
                "- An output register (to hold the result)\n\n"
                "The oracle U_f performs the following transformation:\n"
                "U_f |x⟩|y⟩ = |x⟩|y ⊕ f(x)⟩\n\n"
                "Typically, the output register is initialized to |0...0⟩, so the action becomes:\n"
                "U_f |x⟩|0...0⟩ = |x⟩|f(x)⟩\n\n"
                "This operation must be reversible (unitary), which is why the output is XORed into the second register "
                "rather than simply overwriting it. In a real quantum computer, this oracle would be constructed using "
                "fundamental quantum gates like CNOTs and Toffolis to compute f(x)."
            ),
        },
        {
            "title": "Preparing Superposition",
            "order": 5,
            "xp_reward": 60,
            "duration_minutes": 5,
            "content": (
                "Simon's Algorithm begins by exploiting quantum superposition to evaluate the function f(x) for all possible "
                "inputs simultaneously.\n\n"
                "INITIALIZATION:\n\n"
                "We start with two n-qubit registers, both initialized to the all-zero state:\n"
                "|ψ_0⟩ = |0...0⟩|0...0⟩\n\n"
                "APPLYING HADAMARD GATES:\n\n"
                "We apply a Hadamard gate (H) to each qubit in the first register. This creates an equal superposition of "
                "all 2^n possible input strings:\n"
                "|ψ_1⟩ = (1/√(2^n)) Σ |x⟩|0...0⟩\n\n"
                "where the sum is over all x from 0 to 2^n - 1.\n\n"
                "EVALUATING THE ORACLE:\n\n"
                "Next, we apply the oracle U_f to both registers. Thanks to quantum parallelism, the oracle evaluates f(x) "
                "for all branches of the superposition at once:\n"
                "|ψ_2⟩ = (1/√(2^n)) Σ |x⟩|f(x)⟩\n\n"
                "The two registers are now entangled. The state of the second register depends on the state of the first."
            ),
        },
        {
            "title": "Quantum Interference",
            "order": 6,
            "xp_reward": 70,
            "duration_minutes": 8,
            "content": (
                "After the oracle is applied, we have a superposition of all |x⟩|f(x)⟩ pairs. The next step is to create "
                "interference to extract information about the hidden string 's'.\n\n"
                "CONCEPTUAL MEASUREMENT:\n\n"
                "To understand the interference, imagine measuring the second register. You would observe some output z = f(x). "
                "Because f is two-to-one, there are exactly two inputs that produce z: x and x ⊕ s. The first register would "
                "collapse into an equal superposition of these two inputs:\n"
                "(1/√2) (|x⟩ + |x ⊕ s⟩)\n\n"
                "(Note: The algorithm works whether or not you actually measure the second register; it is usually left unmeasured.)\n\n"
                "APPLYING HADAMARD GATES AGAIN:\n\n"
                "Now, we apply a Hadamard gate to each qubit in the first register. The action of n Hadamard gates on a basis "
                "state |x⟩ is:\n"
                "H^⊗n |x⟩ = (1/√(2^n)) Σ (-1)^(x·y) |y⟩\n\n"
                "where x·y is the bitwise dot product modulo 2 (e.g., if x=11 and y=10, x·y = 1*1 + 1*0 = 1).\n\n"
                "When H^⊗n acts on the state (|x⟩ + |x ⊕ s⟩), the amplitudes for each possible state |y⟩ interfere. The new "
                "amplitude for state |y⟩ is proportional to:\n"
                "(-1)^(x·y) + (-1)^((x⊕s)·y) = (-1)^(x·y) * (1 + (-1)^(s·y))\n\n"
                "This interference is the core of the algorithm."
            ),
        },
        {
            "title": "Measuring the Quantum State",
            "order": 7,
            "xp_reward": 60,
            "duration_minutes": 6,
            "content": (
                "Let's analyze the interference pattern created by the second set of Hadamard gates.\n\n"
                "THE AMPLITUDE EQUATION:\n\n"
                "The amplitude for any state |y⟩ in the first register is proportional to (1 + (-1)^(s·y)).\n\n"
                "CONSTRUCTIVE AND DESTRUCTIVE INTERFERENCE:\n\n"
                "This expression reveals two possible cases for each |y⟩:\n"
                "1. If s·y = 1 (mod 2), then (-1)^(s·y) = -1. The amplitude becomes 1 - 1 = 0. This is complete destructive interference.\n"
                "2. If s·y = 0 (mod 2), then (-1)^(s·y) = 1. The amplitude becomes 1 + 1 = 2. This is constructive interference.\n\n"
                "THE RESULT OF MEASUREMENT:\n\n"
                "Because the amplitudes for states where s·y = 1 are exactly zero, those states will never be observed. When "
                "we measure the first register, we are guaranteed to measure a string 'y' such that:\n\n"
                "y · s = 0 (mod 2)\n\n"
                "Every time we run the circuit, we get a random string 'y' that satisfies this equation. The quantum algorithm "
                "doesn't give us 's' directly, but it gives us a piece of mathematical information about 's'."
            ),
        },
        {
            "title": "Turning Measurements into Linear Equations",
            "order": 8,
            "xp_reward": 60,
            "duration_minutes": 7,
            "content": (
                "A single run of Simon's circuit gives us one string 'y' such that y · s = 0 (mod 2). This is a linear equation "
                "where the bits of 'y' are known coefficients and the bits of 's' are the unknown variables.\n\n"
                "THE LINEAR EQUATION:\n\n"
                "If y = y_1 y_2 ... y_n and s = s_1 s_2 ... s_n, the equation y · s = 0 (mod 2) means:\n"
                "(y_1 * s_1) ⊕ (y_2 * s_2) ⊕ ... ⊕ (y_n * s_n) = 0\n\n"
                "MULTIPLE RUNS:\n\n"
                "To find the n bits of 's', we need a system of n-1 linearly independent equations (since we know s ≠ 00...0, "
                "unless the function is one-to-one, which we can check later). We achieve this by running the entire quantum "
                "circuit multiple times.\n\n"
                "Each run produces a new string y_i, giving us a new equation:\n"
                "y_1 · s = 0\n"
                "y_2 · s = 0\n"
                "...\n"
                "y_k · s = 0\n\n"
                "We keep running the circuit until we have collected n-1 linearly independent strings y_i. It turns out that "
                "we only need to run the circuit about O(n) times to get enough independent equations with high probability."
            ),
        },
        {
            "title": "Recovering the Hidden String",
            "order": 9,
            "xp_reward": 60,
            "duration_minutes": 6,
            "content": (
                "Once we have collected n-1 linearly independent strings y_1, y_2, ..., y_{n-1}, the quantum part of the "
                "algorithm is complete. The final step is entirely classical.\n\n"
                "SOLVING THE SYSTEM:\n\n"
                "We have a system of linear equations modulo 2. We can solve this system using standard classical techniques, "
                "such as Gaussian elimination. Gaussian elimination modulo 2 is very efficient and can easily be performed on "
                "a classical computer.\n\n"
                "THE SOLUTION:\n\n"
                "Solving the system yields a unique non-zero solution for 's'.\n\n"
                "VERIFICATION:\n\n"
                "To verify the solution, we classically query the oracle with a random input x and with x ⊕ s.\n"
                "- If f(x) = f(x ⊕ s), then our found 's' is correct, and the function is two-to-one.\n"
                "- If f(x) ≠ f(x ⊕ s), it means the function was actually one-to-one all along (which corresponds to s = 00...0).\n\n"
                "This hybrid approach — using a quantum computer to generate equations and a classical computer to solve them — "
                "is a common pattern in quantum algorithms."
            ),
        },
        {
            "title": "Why Simon's Algorithm Matters",
            "order": 10,
            "xp_reward": 70,
            "duration_minutes": 8,
            "content": (
                "Simon's Algorithm may seem like it solves an artificial problem, but its historical and theoretical significance "
                "is immense.\n\n"
                "EXPONENTIAL QUANTUM ADVANTAGE:\n\n"
                "Simon's Algorithm was the first algorithm to demonstrate a provable, exponential speedup over any classical "
                "algorithm for a specific problem. \n"
                "- Classical cost: ~2^(n/2) queries\n"
                "- Quantum cost: ~O(n) queries\n"
                "This proved that quantum computers exist in a different complexity class than classical computers.\n\n"
                "THE INSPIRATION FOR SHOR'S ALGORITHM:\n\n"
                "Peter Shor was inspired by Simon's Algorithm. He realized that the technique of using the Hadamard transform "
                "(or more generally, the Quantum Fourier Transform) to extract hidden periodicities could be applied to more "
                "useful problems. Simon's problem is essentially finding the 'period' of a function over a Boolean hypercube. "
                "Shor extended this to finding periods over integers, which led directly to his algorithm for factoring large "
                "numbers.\n\n"
                "A FOUNDATIONAL CONCEPT:\n\n"
                "The core idea of Simon's Algorithm — preparing a superposition, evaluating a function, and using interference "
                "to extract global properties of that function — is the blueprint for many advanced quantum algorithms. It teaches "
                "us that quantum computers are not just 'faster classical computers', but machines that can fundamentally change "
                "how we approach computation."
            ),
        },
    ],
    "vqe": [
        {
            "title": "The Ground-State Problem",
            "order": 1,
            "xp_reward": 50,
            "duration_minutes": 5,
            "content": (
                "Many important problems in chemistry and physics involve finding the ground-state energy of a molecular or quantum system. "
                "The ground state is the lowest energy state, and it determines the stable structure of molecules, chemical reaction rates, "
                "and material properties.\n\n"
                "Classically simulating quantum systems becomes exponentially difficult as the number of particles increases, because the "
                "state space grows exponentially. VQE is designed to tackle this problem using near-term quantum computers."
            ),
        },
        {
            "title": "Hamiltonians",
            "order": 2,
            "xp_reward": 50,
            "duration_minutes": 6,
            "content": (
                "In quantum mechanics, the total energy of a system is represented by an operator called the Hamiltonian (H). "
                "The eigenvalues of the Hamiltonian represent the possible energy levels of the system.\n\n"
                "To use VQE, we must map our physical problem (like a molecule's energy) into a Hamiltonian expressed as a sum of "
                "tensor products of Pauli matrices (Pauli strings). For example, a simple Hamiltonian might look like "
                "H = c0*I + c1*Z + c2*X, where c0, c1, c2 are classical coefficients."
            ),
        },
        {
            "title": "The Variational Principle",
            "order": 3,
            "xp_reward": 60,
            "duration_minutes": 7,
            "content": (
                "VQE relies on the Variational Principle, which states that the expectation value of the Hamiltonian for any valid "
                "quantum state is always greater than or equal to the true ground-state energy.\n\n"
                "Mathematically: E = ⟨ψ|H|ψ⟩ ≥ E0\n\n"
                "This means if we can prepare various states |ψ⟩ and measure their energies, the lowest energy we find is our best "
                "estimate of the ground-state energy. We can reframe the physics problem as an optimization problem: find the state "
                "|ψ⟩ that minimizes ⟨ψ|H|ψ⟩."
            ),
        },
        {
            "title": "Parameterized Quantum Circuits",
            "order": 4,
            "xp_reward": 50,
            "duration_minutes": 6,
            "content": (
                "How do we prepare different states |ψ⟩ to test? We use a Parameterized Quantum Circuit (PQC), which contains gates "
                "whose operations depend on classical parameters (θ). For example, an RX(θ) gate rotates a qubit by an angle θ.\n\n"
                "By tuning these parameters, we can steer the quantum computer to prepare different states: |ψ(θ)⟩ = U(θ)|0⟩. "
                "The PQC serves as a tunable quantum 'black box' that generates trial states."
            ),
        },
        {
            "title": "Choosing an Ansatz",
            "order": 5,
            "xp_reward": 60,
            "duration_minutes": 7,
            "content": (
                "The specific architecture of the PQC is called the 'ansatz' (an educated guess). A good ansatz must be expressive "
                "enough to approximate the true ground state, but shallow enough to run successfully on noisy quantum hardware.\n\n"
                "Hardware-efficient ansatze use gates native to the specific quantum computer (like RY rotations and CNOTs). "
                "Chemistry-inspired ansatze (like UCCSD) use circuits based on electron excitations. Choosing the right ansatz "
                "is a critical part of VQE research."
            ),
        },
        {
            "title": "Expectation Values",
            "order": 6,
            "xp_reward": 60,
            "duration_minutes": 7,
            "content": (
                "Once the state |ψ(θ)⟩ is prepared, the quantum computer must measure its energy. Since the Hamiltonian is a sum "
                "of Pauli strings (H = Σ c_i P_i), we measure the expectation value of each Pauli string separately: "
                "⟨P_i⟩ = ⟨ψ(θ)|P_i|ψ(θ)⟩.\n\n"
                "We repeat the circuit and measurement many times (shots) to get a statistical estimate of each ⟨P_i⟩. Finally, "
                "a classical computer calculates the total energy by summing the weighted results: E(θ) = Σ c_i ⟨P_i⟩."
            ),
        },
        {
            "title": "The Classical Optimizer",
            "order": 7,
            "xp_reward": 60,
            "duration_minutes": 7,
            "content": (
                "After the quantum computer estimates the energy E(θ), a classical optimizer (running on a standard CPU) takes over. "
                "Its job is to decide how to adjust the parameters θ to find a lower energy for the next run.\n\n"
                "Optimizers can be gradient-free (like COBYLA or SPSA) or gradient-based. The optimizer looks at the history of "
                "parameters and energies and suggests a new set of parameters θ_new, which are sent back to the quantum computer."
            ),
        },
        {
            "title": "The Hybrid VQE Loop",
            "order": 8,
            "xp_reward": 70,
            "duration_minutes": 8,
            "content": (
                "VQE is a hybrid algorithm that loops between quantum and classical resources:\n\n"
                "1. CPU sends parameters θ to the QPU.\n"
                "2. QPU prepares the ansatz state |ψ(θ)⟩ and measures Pauli expectation values.\n"
                "3. CPU calculates total energy E(θ).\n"
                "4. CPU runs an optimization algorithm to generate new parameters θ.\n"
                "5. Repeat until E(θ) converges (stops changing significantly).\n\n"
                "This hybrid approach offloads the hard part (representing the large state space) to the QPU, and the optimization "
                "to the CPU."
            ),
        },
        {
            "title": "Convergence and Noise",
            "order": 9,
            "xp_reward": 60,
            "duration_minutes": 8,
            "content": (
                "Because current quantum computers are noisy (NISQ), the energy measurements have inherent variance and systematic errors. "
                "This noise can confuse the classical optimizer, preventing it from converging to the true minimum.\n\n"
                "VQE has a natural resilience to certain types of systematic errors (like over-rotation of gates) because the classical "
                "optimizer can learn to 'compensate' for the hardware's quirks. However, error mitigation techniques are still often "
                "required for accurate chemistry results."
            ),
        },
        {
            "title": "VQE Applications and Limitations",
            "order": 10,
            "xp_reward": 70,
            "duration_minutes": 9,
            "content": (
                "VQE is primarily used for quantum chemistry (finding molecular ground states) and materials science. It can also be "
                "adapted for optimization problems and machine learning.\n\n"
                "While VQE is promising, practical advantage depends heavily on the problem, hardware, ansatz, optimizer, noise, and implementation. "
                "We do not yet know if VQE on near-term hardware will outperform classical chemistry methods (like Density Functional Theory) "
                "for industrially relevant molecules, but it remains a critical stepping stone toward fault-tolerant quantum simulation."
            ),
        },
    ],
    "shor": [
        {
            "title": "Why Integer Factorization Matters",
            "order": 1,
            "xp_reward": 50,
            "duration_minutes": 5,
            "content": (
                "Integer factorization is the process of breaking down a composite number into its prime factors. For example, "
                "the factors of 15 are 3 and 5.\n\n"
                "While multiplying two large primes together is computationally easy, finding those primes if you only know their "
                "product is incredibly difficult for classical computers. This 'one-way' mathematical asymmetry is the foundation "
                "of modern public-key cryptography, particularly the RSA algorithm, which secures internet communications worldwide."
            ),
        },
        {
            "title": "Classical Factorization",
            "order": 2,
            "xp_reward": 50,
            "duration_minutes": 6,
            "content": (
                "Classically, factoring scales exponentially (or sub-exponentially) with the size of the number. If you add one digit "
                "to a prime number, the time it takes to factor the product increases significantly. The best known classical algorithm, "
                "the General Number Field Sieve, would take millions of years on supercomputers to factor a 2048-bit RSA key.\n\n"
                "Shor's Algorithm completely changes this math, scaling polynomially. If a fault-tolerant quantum computer is built, "
                "it could factor the same 2048-bit key in hours or days."
            ),
        },
        {
            "title": "Modular Arithmetic",
            "order": 3,
            "xp_reward": 50,
            "duration_minutes": 6,
            "content": (
                "To understand Shor's algorithm, we need modular arithmetic (clock arithmetic). The expression 'a mod N' means the "
                "remainder when 'a' is divided by 'N'.\n\n"
                "Shor's algorithm focuses on the function f(x) = a^x mod N.\n"
                "If we pick N = 15, and a = 7, let's look at the sequence as x increases:\n"
                "7^1 mod 15 = 7\n"
                "7^2 mod 15 = 49 mod 15 = 4\n"
                "7^3 mod 15 = 343 mod 15 = 13\n"
                "7^4 mod 15 = 2401 mod 15 = 1\n"
                "7^5 mod 15 = 7... and the sequence repeats."
            ),
        },
        {
            "title": "From Factoring to Period Finding",
            "order": 4,
            "xp_reward": 60,
            "duration_minutes": 7,
            "content": (
                "Shor's brilliant insight was connecting factoring to finding the repeating pattern in modular exponentiation. "
                "In our previous example, the sequence 7, 4, 13, 1 repeated every 4 steps. This length (4) is the 'period' (r).\n\n"
                "Number theory proves that if you can find the period 'r' of a^x mod N (where 'a' is a random guess co-prime to N), "
                "and if 'r' is even, you can find the factors of N using the greatest common divisor: gcd(a^(r/2) ± 1, N).\n\n"
                "Factoring is hard, but if we can find the period, factoring becomes easy. However, finding the period classically is also hard."
            ),
        },
        {
            "title": "Quantum Superposition",
            "order": 5,
            "xp_reward": 50,
            "duration_minutes": 6,
            "content": (
                "The quantum part of Shor's algorithm solves the period finding problem. We start with two quantum registers initialized to |0⟩. "
                "We apply Hadamard gates to the first register (the counting register) to create an equal superposition of all possible inputs 'x'.\n\n"
                "If the register has n qubits, we now have a superposition of all integers from 0 to 2^n - 1. We are preparing to evaluate "
                "the modular function for all possible inputs simultaneously."
            ),
        },
        {
            "title": "Modular Exponentiation",
            "order": 6,
            "xp_reward": 60,
            "duration_minutes": 7,
            "content": (
                "Next, we apply a quantum oracle U_f that performs the modular exponentiation. It takes the superposition of inputs |x⟩ in the "
                "first register and writes the result |a^x mod N⟩ into the second register.\n\n"
                "The state becomes a massive entangled superposition: Σ |x⟩|a^x mod N⟩.\n\n"
                "Because the function is periodic, many different inputs |x⟩ map to the same output in the second register. For example, "
                "|0⟩, |r⟩, |2r⟩, |3r⟩ all map to |1⟩."
            ),
        },
        {
            "title": "Quantum Period Finding",
            "order": 7,
            "xp_reward": 70,
            "duration_minutes": 8,
            "content": (
                "Imagine we measure the second register (we don't strictly have to, but it helps conceptually). We get some random result, say '4'. "
                "Because of entanglement, the first register collapses into a superposition of only the inputs that produced '4'.\n\n"
                "These inputs are exactly separated by the period 'r'. The first register is now in a periodic superposition: |x0⟩ + |x0+r⟩ + |x0+2r⟩...\n\n"
                "We have the period encoded in the quantum state, but measuring it directly would just give us one random x value, destroying the "
                "periodic information. We need to extract 'r'."
            ),
        },
        {
            "title": "QFT and Phase Information",
            "order": 8,
            "xp_reward": 70,
            "duration_minutes": 8,
            "content": (
                "To extract the period without destroying it, we apply the Quantum Fourier Transform (QFT) to the first register. "
                "The QFT converts periodicity in the computational basis into phase information.\n\n"
                "Just as a classical Fourier transform finds the frequencies in a sound wave, the QFT analyzes the periodic peaks in our "
                "quantum state. It causes destructive interference for most states and constructive interference for states that are multiples "
                "of (Total States / period).\n\n"
                "When we measure the first register after the QFT, we get a value 'y' which is very close to a multiple of (2^n / r)."
            ),
        },
        {
            "title": "Continued Fractions and Factoring",
            "order": 9,
            "xp_reward": 60,
            "duration_minutes": 7,
            "content": (
                "The measurement 'y' from the quantum computer gives us the fraction: y / (2^n) ≈ s / r, where 's' is some random integer. "
                "The quantum algorithm is finished, and classical post-processing takes over.\n\n"
                "We use a classical algorithm called the 'Continued Fractions Expansion' to find the closest fraction s/r. This reveals our "
                "period 'r'.\n\n"
                "Once we have 'r', we check if it is even. If so, we compute gcd(a^(r/2) + 1, N) and gcd(a^(r/2) - 1, N). These calculations "
                "reveal the prime factors of N, successfully breaking the encryption!"
            ),
        },
        {
            "title": "Shor's Algorithm and Cryptography",
            "order": 10,
            "xp_reward": 70,
            "duration_minutes": 9,
            "content": (
                "Shor's Algorithm is profoundly important, but there is a major caveat: a fault-tolerant quantum computer capable of running it "
                "for large numbers (like a 2048-bit RSA key) does not yet exist. It requires millions of physical qubits to correct errors and "
                "maintain coherence long enough to perform the modular exponentiation.\n\n"
                "Furthermore, Shor's algorithm only breaks cryptography based on factoring (RSA) or discrete logarithms (ECC). It does not "
                "make all cryptography insecure. The world is already transitioning to Post-Quantum Cryptography (PQC) — new classical mathematical "
                "algorithms that are believed to be resistant to quantum attacks."
            ),
        },
    ],
    "error-correction": [
        {
            "title": "Why Qubits Are Fragile",
            "order": 1,
            "xp_reward": 50,
            "duration_minutes": 5,
            "content": (
                "Classical bits are robust. The voltage representing a '1' in a computer chip can fluctuate slightly, but it will "
                "still be read as a '1'. Qubits, however, represent information in continuous probability amplitudes and phases.\n\n"
                "Even the slightest interaction with the outside world (heat, electromagnetic radiation, cosmic rays) can slightly "
                "alter these amplitudes or phases. Over time, these tiny errors accumulate, completely destroying the quantum information."
            ),
        },
        {
            "title": "Quantum Noise",
            "order": 2,
            "xp_reward": 50,
            "duration_minutes": 6,
            "content": (
                "The general term for this loss of quantum information is 'decoherence'. Quantum noise can be mathematically modeled "
                "as unintended quantum gates acting on our qubits.\n\n"
                "While noise can take many complex forms, a foundational theorem of quantum error correction states that if we can "
                "correct two specific types of errors — bit-flips (X errors) and phase-flips (Z errors) — we can correct any arbitrary "
                "single-qubit error."
            ),
        },
        {
            "title": "Bit-Flip Errors",
            "order": 3,
            "xp_reward": 50,
            "duration_minutes": 5,
            "content": (
                "A bit-flip error is the quantum equivalent of a classical bit flipping from 0 to 1, or 1 to 0.\n\n"
                "Mathematically, it is equivalent to an unintended Pauli-X gate acting on the qubit.\n"
                "If the state is |0⟩, a bit-flip turns it into |1⟩.\n"
                "If the state is |1⟩, a bit-flip turns it into |0⟩.\n"
                "If the state is a superposition α|0⟩ + β|1⟩, it becomes α|1⟩ + β|0⟩."
            ),
        },
        {
            "title": "Phase-Flip Errors",
            "order": 4,
            "xp_reward": 50,
            "duration_minutes": 6,
            "content": (
                "A phase-flip error has no classical equivalent. It flips the relative phase between the |0⟩ and |1⟩ states.\n\n"
                "Mathematically, it is equivalent to an unintended Pauli-Z gate.\n"
                "If the state is |0⟩, a phase-flip does nothing (it remains |0⟩).\n"
                "If the state is |1⟩, a phase-flip turns it into -|1⟩.\n"
                "If the state is α|0⟩ + β|1⟩, it becomes α|0⟩ - β|1⟩. This completely changes the interference pattern of the qubit."
            ),
        },
        {
            "title": "Why Classical Redundancy Is Not Enough",
            "order": 5,
            "xp_reward": 60,
            "duration_minutes": 7,
            "content": (
                "Classically, we protect data using redundancy (e.g., copying a '1' to '111'). If one bit flips to '101', we can take "
                "a majority vote to correct it back to '111'.\n\n"
                "We cannot do this in quantum computing for two reasons:\n"
                "1. The No-Cloning Theorem: It is impossible to perfectly copy an unknown quantum state. We cannot just copy α|0⟩ + β|1⟩.\n"
                "2. Measurement destroys superposition: If we measure the qubits to take a 'majority vote', we collapse the superposition, "
                "destroying the very quantum information we are trying to protect."
            ),
        },
        {
            "title": "The Three-Qubit Bit-Flip Code",
            "order": 6,
            "xp_reward": 60,
            "duration_minutes": 7,
            "content": (
                "Peter Shor solved this problem by encoding the information of one 'logical' qubit into the entangled state of three 'physical' qubits.\n\n"
                "Instead of copying the state, we use two CNOT gates to entangle our data qubit with two initialized |0⟩ qubits.\n"
                "The state α|0⟩ + β|1⟩ becomes the entangled state α|000⟩ + β|111⟩.\n\n"
                "This is not three independent copies; it is a single, highly entangled state spanning three physical qubits."
            ),
        },
        {
            "title": "Encoding Quantum Information",
            "order": 7,
            "xp_reward": 60,
            "duration_minutes": 6,
            "content": (
                "Let's trace the encoding circuit. We have data qubit (q0) in state α|0⟩ + β|1⟩, and two blank qubits (q1, q2) in state |0⟩.\n\n"
                "1. Apply CNOT with q0 as control and q1 as target. State becomes: α|00⟩|0⟩ + β|11⟩|0⟩.\n"
                "2. Apply CNOT with q0 as control and q2 as target. State becomes: α|000⟩ + β|111⟩.\n\n"
                "The logical |0⟩_L is now |000⟩, and logical |1⟩_L is |111⟩."
            ),
        },
        {
            "title": "Syndrome Measurement",
            "order": 8,
            "xp_reward": 70,
            "duration_minutes": 8,
            "content": (
                "If a bit-flip occurs on one physical qubit, say q0, the state becomes α|100⟩ + β|011⟩. How do we know q0 flipped without measuring it?\n\n"
                "We use 'ancilla' (helper) qubits to measure the *parity* (agreement) between pairs of physical qubits, rather than their actual values.\n"
                "We use CNOT gates to extract the parity of (q0, q1) into one ancilla, and (q1, q2) into another ancilla. We then measure the ancillas.\n\n"
                "This measurement gives us a 'syndrome' — a classical signature of the error — without collapsing the α/β superposition."
            ),
        },
        {
            "title": "Detecting and Correcting Errors",
            "order": 9,
            "xp_reward": 70,
            "duration_minutes": 8,
            "content": (
                "The two ancilla measurements give us four possible syndromes:\n"
                "- 00: All qubits agree. No error occurred.\n"
                "- 11: (q0,q1) disagree and (q1,q2) disagree. q1 must have flipped.\n"
                "- 10: (q0,q1) disagree, (q1,q2) agree. q0 must have flipped.\n"
                "- 01: (q0,q1) agree, (q1,q2) disagree. q2 must have flipped.\n\n"
                "Based on this classical syndrome, we can apply an X gate to the exact physical qubit that flipped, restoring the state back to "
                "α|000⟩ + β|111⟩."
            ),
        },
        {
            "title": "Fault Tolerance and Limitations",
            "order": 10,
            "xp_reward": 70,
            "duration_minutes": 9,
            "content": (
                "The three-qubit code only corrects bit-flips. It cannot correct phase-flips. To correct both, we need more qubits, such as Shor's "
                "9-qubit code, or the modern Surface Code.\n\n"
                "Furthermore, error correction only works if the physical error rate is below a certain 'threshold'. If errors happen too frequently, "
                "the extra gates required for encoding and measuring will introduce more errors than they fix. Achieving this threshold is the primary "
                "engineering challenge in building fault-tolerant quantum computers today."
            ),
        },
    ],
    "hhl": [
        {
            "title": "Classical Linear Systems",
            "order": 1,
            "xp_reward": 50,
            "duration_minutes": 6,
            "content": (
                "A linear system is a set of equations like:\n"
                "3x + 2y = 7\n"
                "x - y = 1\n\n"
                "We can write this in matrix form as Ax = b, where A is the matrix of coefficients, x is the vector of unknown variables, "
                "and b is the vector of constants.\n\n"
                "Solving this means finding x = A^(-1)b. Classically, the best algorithms take time proportional to the number of variables (N). "
                "For massive systems in machine learning or physics, N can be millions or billions, making classical solutions very slow."
            ),
        },
        {
            "title": "Why Linear Algebra Matters",
            "order": 2,
            "xp_reward": 50,
            "duration_minutes": 5,
            "content": (
                "Linear algebra is the mathematical language of almost all modern computation. From rendering 3D graphics, to training deep "
                "neural networks, to simulating fluid dynamics, to optimizing supply chains, the core computational bottleneck is often solving "
                "massive systems of linear equations.\n\n"
                "The HHL algorithm promises an exponential speedup (solving in time proportional to log(N)) for specific types of linear systems, "
                "which could theoretically revolutionize these fields."
            ),
        },
        {
            "title": "Encoding the Input State",
            "order": 3,
            "xp_reward": 60,
            "duration_minutes": 7,
            "content": (
                "To use HHL, we cannot just load the classical vector 'b' into memory like a normal computer. We must encode 'b' into the "
                "amplitudes of a quantum state |b⟩.\n\n"
                "If b = [b0, b1, b2, b3], we must prepare a state |b⟩ = b0|00⟩ + b1|01⟩ + b2|10⟩ + b3|11⟩ (normalized so the amplitudes square "
                "to 1).\n\n"
                "This step itself is highly non-trivial. For an arbitrary vector 'b', preparing this state can take O(N) time, destroying the "
                "exponential speedup. HHL assumes there is an efficient way to prepare |b⟩ (like a QRAM)."
            ),
        },
        {
            "title": "Hamiltonian Simulation",
            "order": 4,
            "xp_reward": 60,
            "duration_minutes": 7,
            "content": (
                "HHL assumes the matrix A is Hermitian (A = A†). Because it is Hermitian, we can treat A like a Hamiltonian representing the "
                "energy of a physical system.\n\n"
                "According to quantum mechanics, a state evolves over time according to the operator U = e^(-iAt). This is called Hamiltonian "
                "simulation.\n\n"
                "HHL requires that A is 'sparse' (most of its entries are zero), which allows us to efficiently simulate this time evolution "
                "e^(-iAt) on a quantum computer using a relatively small number of quantum gates."
            ),
        },
        {
            "title": "Quantum Phase Estimation",
            "order": 5,
            "xp_reward": 70,
            "duration_minutes": 8,
            "content": (
                "We need to invert the matrix A. The inverse of A has the exact same eigenvectors as A, but its eigenvalues are inverted (1/λ).\n\n"
                "HHL uses Quantum Phase Estimation (QPE) to find the eigenvalues of A. We apply QPE using the unitary operator U = e^(iAt). "
                "If we write our state |b⟩ in the basis of A's eigenvectors (|u_j⟩), QPE calculates the corresponding eigenvalue λ_j and stores "
                "it in a separate 'clock' register.\n\n"
                "The state becomes a superposition of: |λ_j⟩|u_j⟩."
            ),
        },
        {
            "title": "Extracting Eigenvalue Information",
            "order": 6,
            "xp_reward": 60,
            "duration_minutes": 7,
            "content": (
                "After QPE, our quantum computer holds a superposition where the clock register contains a binary representation of the eigenvalues λ_j, "
                "entangled with the corresponding eigenvectors |u_j⟩ in the main register.\n\n"
                "This is a remarkable state. We have essentially diagonalized the massive matrix A in superposition, and we have direct access to "
                "its eigenvalues as binary strings that we can compute with."
            ),
        },
        {
            "title": "Controlled Rotation",
            "order": 7,
            "xp_reward": 70,
            "duration_minutes": 8,
            "content": (
                "To apply the inverse matrix A^(-1), we need to multiply each eigenvector |u_j⟩ by 1/λ_j.\n\n"
                "We do this using an extra 'ancilla' qubit. We apply a controlled-Ry rotation to the ancilla, where the angle of rotation depends "
                "on the value stored in the clock register (λ_j).\n\n"
                "Specifically, we rotate the ancilla so its amplitude of being |1⟩ is proportional to C/λ_j (where C is a normalizing constant). "
                "This step effectively 'inverts' the eigenvalue."
            ),
        },
        {
            "title": "Uncomputation",
            "order": 8,
            "xp_reward": 60,
            "duration_minutes": 7,
            "content": (
                "We have successfully applied the 1/λ_j factor to our state, but our clock register is still entangled with the main register, "
                "which ruins the quantum state for further use.\n\n"
                "To fix this, we perform 'uncomputation'. We run the exact inverse of the QPE circuit (QPE†). This perfectly un-does the "
                "eigenvalue extraction, returning the clock register to the |00...0⟩ state and safely disentangling it from our solution."
            ),
        },
        {
            "title": "Measuring the Solution State",
            "order": 9,
            "xp_reward": 60,
            "duration_minutes": 7,
            "content": (
                "Finally, we measure the single ancilla qubit. If we measure |0⟩, the algorithm failed, and we must restart.\n\n"
                "If we measure |1⟩, the main register collapses precisely into the state |x⟩ = A^(-1)|b⟩. The quantum state now represents "
                "the exact solution to our massive linear system!\n\n"
                "This technique of forcing a specific outcome to collapse the state is called 'post-selection'."
            ),
        },
        {
            "title": "HHL Assumptions and Limitations",
            "order": 10,
            "xp_reward": 80,
            "duration_minutes": 10,
            "content": (
                "While HHL is theoretically groundbreaking, it has severe limitations in practice:\n\n"
                "1. State Preparation: We must be able to efficiently load |b⟩ into quantum state.\n"
                "2. Sparsity: A must be sparse to simulate e^(iAt) efficiently.\n"
                "3. Condition Number: The ratio of A's largest to smallest eigenvalue cannot be too large, or the post-selection will almost always fail.\n"
                "4. Readout: The output is a quantum state |x⟩. We cannot read out all N components of x without running the algorithm O(N) times, "
                "destroying the speedup. We can only efficiently extract global properties of x (like its length, or overlap with another vector).\n\n"
                "HHL does not provide a magical speedup for all linear systems, but rather for a specific, restricted class of problems where quantum data "
                "can be natively processed."
            ),
        },
    ],
}


async def _backfill_projects_and_lessons(session):
    """Idempotently insert Project and Lesson records for levels that have data defined."""
    from app.models.learning import Project, Lesson
    added_projects = 0
    for level_slug, proj_data in PROJECTS.items():
        # Check if project already exists for this slug
        existing = await session.execute(
            select(Project).where(Project.slug == level_slug)
        )
        if existing.scalar_one_or_none():
            continue

        # Find the level
        level_q = await session.execute(
            select(LearningLevel).where(LearningLevel.slug == level_slug)
        )
        level = level_q.scalar_one_or_none()
        if not level:
            continue

        # Create project
        project = Project(
            level_id=level.id,
            slug=level_slug,
            overview=proj_data["overview"],
            learning_objectives=proj_data["learning_objectives"],
            algorithm_overview=proj_data["algorithm_overview"],
            expected_outcome=proj_data["expected_outcome"],
            hints=proj_data["hints"],
            success_criteria=proj_data["success_criteria"],
        )
        session.add(project)
        await session.flush()  # get project.id

        # Create lessons
        for lesson_data in LESSONS.get(level_slug, []):
            session.add(Lesson(
                project_id=project.id,
                title=lesson_data["title"],
                content=lesson_data["content"],
                order=lesson_data["order"],
                xp_reward=lesson_data["xp_reward"],
                duration_minutes=lesson_data["duration_minutes"],
            ))
        added_projects += 1

    if added_projects:
        await session.commit()
        logger.info("Backfilled %d project(s) with lessons", added_projects)


async def seed_if_empty():
    """Seed the database if it's empty."""
    async with async_session_factory() as session:
        # Check if already seeded
        count = await session.execute(select(func.count(LearningLevel.id)))
        if count.scalar() > 0:
            # Backfill any new levels that were added after initial seed
            existing = await session.execute(select(LearningLevel.n))
            existing_ns = {row[0] for row in existing.all()}
            added = 0
            for lv in LEVELS:
                if lv["n"] not in existing_ns:
                    session.add(LearningLevel(**lv))
                    added += 1
            if added:
                await session.commit()
                logger.info("Backfilled %d new learning level(s)", added)
            else:
                logger.info("Database already seeded, skipping")
            # Always check for missing projects/lessons
            await _backfill_projects_and_lessons(session)
            return

        logger.info("Seeding database...")

        # Seed levels
        for lv in LEVELS:
            session.add(LearningLevel(**lv))

        # Seed challenges
        for ch in CHALLENGES:
            session.add(Challenge(**ch))

        # Seed achievements
        for ach in ACHIEVEMENTS:
            session.add(Achievement(**ach))

        # Create demo student (matches Login.tsx defaults)
        demo_student = User(
            email="alex@university.edu",
            password_hash=hash_password("quantum123"),
            name="Alex Chen",
            role="student",
            avatar_initials="AC",
            experience_level="intermediate",
            xp=12450,
            current_level=2,
            streak=7,
        )
        session.add(demo_student)

        # Create demo instructor
        demo_instructor = User(
            email="instructor@university.edu",
            password_hash=hash_password("quantum123"),
            name="Dr. Sarah Kim",
            role="instructor",
            avatar_initials="SK",
            experience_level="advanced",
            xp=0,
            current_level=1,
            streak=0,
        )
        session.add(demo_instructor)
        await session.flush()

        # Create additional students for leaderboard
        other_students = [
            ("Elena Vasquez", "EV", 18200), ("Marcus Johnson", "MJ", 15800),
            ("Aisha Patel", "AP", 14200), ("Tobias Müller", "TM", 13100),
            ("Mei-Ling Wang", "MW", 11900), ("Omar Al-Rashid", "OA", 10500),
            ("Sofia Andersson", "SA", 9800), ("James O'Brien", "JO", 8900),
            ("Priya Sharma", "PS", 7600), ("Lucas Dubois", "LD", 6400),
        ]
        for name, initials, xp in other_students:
            email = name.lower().replace(" ", ".").replace("'", "") + "@university.edu"
            session.add(User(
                email=email, password_hash=hash_password("quantum123"),
                name=name, role="student", avatar_initials=initials,
                experience_level="intermediate", xp=xp,
                current_level=min(5, max(1, xp // 3000)),
                streak=max(0, (xp // 1000) - 2),
            ))

        # Create demo instructor assignments
        session.add(InstructorAssignment(
            instructor_id=demo_instructor.id,
            title="Grover Search Project",
            algorithm="Grover's Algorithm",
            difficulty="Intermediate",
            xp_reward=300,
            allowed_gates="H, X, Z, CNOT, CZ",
            status="Open",
            total_students=30,
        ))
        session.add(InstructorAssignment(
            instructor_id=demo_instructor.id,
            title="Bell State Lab",
            algorithm="Entanglement",
            difficulty="Beginner",
            xp_reward=150,
            allowed_gates="H, X, CNOT",
            status="Open",
            total_students=30,
        ))

        await session.commit()
        logger.info("Database seeded successfully: %d levels, %d challenges, %d users",
                     len(LEVELS), len(CHALLENGES), 2 + len(other_students))

        # Seed projects and lessons
        await _backfill_projects_and_lessons(session)
