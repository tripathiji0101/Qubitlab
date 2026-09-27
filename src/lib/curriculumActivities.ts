// Interactive Quantum Learning Activities & Checkpoints
// Generated for all 12 quantum computing projects in QubitLab (144 total phases)

export type CircuitGateStep = {
  g: string;
  q: number;
  q2?: number;
  theta?: number;
};

export type CurriculumActivity =
  | {
      id: string;
      type: 'prediction';
      question: string;
      initialState?: string;
      options: string[];
      correctIndex: number;
      explanation: string;
      hints: string[];
      circuit?: { qubits: number; gates: CircuitGateStep[] };
    }
  | {
      id: string;
      type: 'multiple-choice';
      question: string;
      options: string[];
      correctIndex: number;
      explanation: string;
      hints: string[];
      circuit?: { qubits: number; gates: CircuitGateStep[] };
    }
  | {
      id: string;
      type: 'gate-prediction';
      question: string;
      initialState: string;
      gates: CircuitGateStep[];
      expectedState: string;
      options: string[];
      correctIndex: number;
      explanation: string;
      hints: string[];
      circuit?: { qubits: number; gates: CircuitGateStep[] };
    }
  | {
      id: string;
      type: 'statevector';
      question: string;
      expression: string;
      answer: string;
      options: string[];
      correctIndex: number;
      explanation: string;
      hints: string[];
      circuit?: { qubits: number; gates: CircuitGateStep[] };
    }
  | {
      id: string;
      type: 'circuit-analysis';
      question: string;
      circuitSummary: string;
      expectedObservation: string;
      options: string[];
      correctIndex: number;
      explanation: string;
      hints: string[];
      circuit?: { qubits: number; gates: CircuitGateStep[] };
    }
  | {
      id: string;
      type: 'code-completion';
      question: string;
      starterCode: string;
      expectedAnswer: string;
      options: string[];
      correctIndex: number;
      explanation: string;
      hints: string[];
      circuit?: { qubits: number; gates: CircuitGateStep[] };
    };

export interface CheckpointDefinition {
  title: string;
  conceptSummary: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface PhaseKnowledgeState {
  started: boolean;
  completed: boolean;
  activityAttempts: number;
  correctAttempts: number;
  checkpointPassed: boolean;
  hintsUsed: number;
  selectedOptionIndex?: number;
  lastAnsweredCorrectly?: boolean;
}

export const curriculumActivities: Record<string, CurriculumActivity> = {
  "bb84-phase-1": {
    "id": "bb84-phase-1",
    "type": "prediction",
    "question": "Suppose Alice transmits 1,000 single photons to Bob. Eve attempts an intercept-resend attack without knowing the chosen bases. What happens to Bob's error rate on the sifted key?",
    "options": [
      "Bob observes 0% error rate because Eve re-transmits identical photons.",
      "Bob observes approximately a 25% error rate on the sifted key due to basis mismatch collapses.",
      "Bob observes 100% error rate because all photons are destroyed in transit.",
      "Bob observes a 50% error rate across the entire communication channel."
    ],
    "correctIndex": 1,
    "hints": [
      "Eve guesses the wrong basis 50% of the time. When she measures in the wrong basis, she collapses the photon into that basis.",
      "When Bob measures a collapsed photon in Alice's original basis, he has a 50% chance of getting the opposite bit: 0.5 * 0.5 = 25%."
    ],
    "explanation": "Because Eve cannot clone the quantum state (No-Cloning Theorem), she must measure each photon in a guessed basis. In 50% of cases she picks the wrong basis, projecting the state. When Bob measures in Alice's basis, he obtains the wrong bit with probability 1/2, yielding an overall 25% Quantum Bit Error Rate (QBER) that immediately exposes Eve.",
    "circuit": {
      "qubits": 1,
      "gates": [
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "Z",
          "q": 0
        },
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "bb84-phase-2": {
    "id": "bb84-phase-2",
    "type": "gate-prediction",
    "question": "Starting with |0⟩ in QubitLab, you apply gate X. What is the resulting quantum state and its measurement probability in the computational basis?",
    "initialState": "|0⟩",
    "gates": [
      {
        "g": "X",
        "q": 0
      }
    ],
    "expectedState": "|1⟩",
    "options": [
      "State |0⟩ with P(0)=100%, P(1)=0%",
      "State (|0⟩ + |1⟩)/√2 with P(0)=50%, P(1)=50%",
      "State |1⟩ with P(0)=0%, P(1)=100%",
      "State |1⟩ with P(0)=50%, P(1)=50%"
    ],
    "correctIndex": 2,
    "hints": [
      "The Pauli X gate is the quantum NOT gate: X|0⟩ = |1⟩.",
      "Since the statevector is purely [0, 1]^T, measuring in the Z-basis yields |1⟩ deterministically."
    ],
    "explanation": "The Pauli X operator flips the computational basis states: X|0⟩ = |1⟩ and X|1⟩ = |0⟩. Its matrix [[0, 1], [1, 0]] transforms the state vector (1, 0)^T into (0, 1)^T, resulting in a 100% measurement probability for bit 1.",
    "circuit": {
      "qubits": 1,
      "gates": [
        {
          "g": "X",
          "q": 0
        }
      ]
    }
  },
  "bb84-phase-3": {
    "id": "bb84-phase-3",
    "type": "prediction",
    "question": "Alice prepares state |0⟩ and applies an H gate, producing |+⟩. If Bob measures this state in the standard Z-basis, what is the probability distribution?",
    "options": [
      "Deterministic 0 with 100% certainty",
      "Deterministic 1 with 100% certainty",
      "50% probability of 0, 50% probability of 1",
      "75% probability of 0, 25% probability of 1"
    ],
    "correctIndex": 2,
    "hints": [
      "Recall that |+⟩ = (|0⟩ + |1⟩)/√2.",
      "According to the Born rule, the probability of outcome 0 is |⟨0|+⟩|² = |1/√2|² = 1/2."
    ],
    "explanation": "The state |+⟩ is an equal superposition of |0⟩ and |1⟩ with amplitude 1/√2 each. Measuring in the computational Z-basis collapses the state with equal 50% probability to either 0 or 1, illustrating basis disturbance.",
    "circuit": {
      "qubits": 1,
      "gates": [
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "bb84-phase-4": {
    "id": "bb84-phase-4",
    "type": "multiple-choice",
    "question": "What is the inner product overlap |⟨+|0⟩|² between a state in the X-basis and a state in the Z-basis?",
    "options": [
      "0 (They are completely orthogonal)",
      "1 (They are completely identical)",
      "1/2 (They are mutually unbiased bases)",
      "1/√2"
    ],
    "correctIndex": 2,
    "hints": [
      "Calculate ⟨+|0⟩ where |+⟩ = (|0⟩ + |1⟩)/√2.",
      "⟨+|0⟩ = (1/√2)⟨0|0⟩ + (1/√2)⟨1|0⟩ = 1/√2. Squaring its absolute value gives 1/2."
    ],
    "explanation": "The computational basis { |0⟩, |1⟩ } and the Hadamard basis { |+⟩, |-⟩ } are mutually unbiased bases (MUBs). The transition probability between any state in one basis and any state in the other is always exactly 1/d = 1/2. This guarantees maximum uncertainty when measured in the wrong basis.",
    "circuit": {
      "qubits": 1,
      "gates": [
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "bb84-phase-5": {
    "id": "bb84-phase-5",
    "type": "statevector",
    "question": "Alice wants to send classical bit 1 in the X-basis (Diagonal basis). What sequence of gates must she apply to initial state |0⟩, and what statevector is produced?",
    "expression": "H X |0⟩ = H |1⟩ = |-⟩",
    "answer": "|-⟩ = (|0⟩ - |1⟩)/√2",
    "options": [
      "Apply X then H, producing |-⟩ = (|0⟩ - |1⟩)/√2",
      "Apply H then X, producing |+⟩ = (|0⟩ + |1⟩)/√2",
      "Apply only H, producing |+⟩",
      "Apply only X, producing |1⟩"
    ],
    "correctIndex": 0,
    "hints": [
      "In BB84, bit 0 in X-basis is |+⟩ = H|0⟩, while bit 1 in X-basis is |-⟩ = H|1⟩.",
      "To get |1⟩ first, Alice applies X. Then applying H gives H|1⟩ = (|0⟩ - |1⟩)/√2."
    ],
    "explanation": "To encode bit 1 in the Diagonal basis, Alice must prepare |-⟩. Starting from |0⟩, she applies gate X to produce |1⟩, then gate H to create |-⟩ = (|0⟩ - |1⟩)/√2. The statevector has amplitudes 1/√2 and -1/√2.",
    "circuit": {
      "qubits": 1,
      "gates": [
        {
          "g": "X",
          "q": 0
        },
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "bb84-phase-6": {
    "id": "bb84-phase-6",
    "type": "circuit-analysis",
    "question": "Bob receives a photon in state |+⟩. He chooses to measure in the X-basis. In a standard circuit simulator that only measures in the Z-basis, how does Bob measure in the X-basis?",
    "circuitSummary": "Bob applies H gate right before the Z-basis measurement.",
    "expectedObservation": "State |+⟩ is transformed to |0⟩, yielding bit 0 with 100% certainty.",
    "options": [
      "Apply gate Z before measurement",
      "Apply gate H before measurement, rotating X-basis into Z-basis",
      "Apply gate X before measurement",
      "Measure directly without any basis change gate"
    ],
    "correctIndex": 1,
    "hints": [
      "Since H |+⟩ = |0⟩ and H |-⟩ = |1⟩, the Hadamard gate maps the X-basis eigenstates into the Z-basis eigenstates.",
      "Standard quantum hardware physical detectors measure along the Z axis (computational basis)."
    ],
    "explanation": "Because quantum hardware measures along the computational Z-basis, measuring in any other basis requires a unitary basis transformation. Applying H before measurement maps |+⟩ to |0⟩ and |-⟩ to |1⟩, allowing standard detectors to read out the X-basis state.",
    "circuit": {
      "qubits": 1,
      "gates": [
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "bb84-phase-7": {
    "id": "bb84-phase-7",
    "type": "prediction",
    "question": "Alice prepares state |-⟩ (bit 1, X-basis). Bob accidentally chooses the Z-basis to measure. What is the probability that Bob measures bit 1?",
    "options": [
      "0%",
      "25%",
      "50%",
      "100%"
    ],
    "correctIndex": 2,
    "hints": [
      "|-⟩ = (|0⟩ - |1⟩)/√2.",
      "The probability of finding |1⟩ is |-1/√2|² = 1/2 = 50%."
    ],
    "explanation": "When Bob measures |-⟩ in the incompatible Z-basis, the state projects onto |0⟩ with probability 1/2 and |1⟩ with probability 1/2. Bob has a 50% chance of recording bit 1 and a 50% chance of recording bit 0.",
    "circuit": {
      "qubits": 1,
      "gates": [
        {
          "g": "X",
          "q": 0
        },
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "bb84-phase-8": {
    "id": "bb84-phase-8",
    "type": "multiple-choice",
    "question": "During the public sifting phase of BB84, what information do Alice and Bob exchange over the public classical channel?",
    "options": [
      "The secret bit values they sent and received",
      "Only the measurement bases they used for each photon, keeping the bit values secret",
      "The exact photon polarization angles in degrees",
      "Their private RSA cryptographic keys"
    ],
    "correctIndex": 1,
    "hints": [
      "If they revealed the bit values, Eve listening on the public channel would learn the key.",
      "They only need to know when their bases matched."
    ],
    "explanation": "Alice and Bob announce only the list of bases used (e.g. Z, X, X, Z...) over the authenticated classical channel. They discard all events where their bases differed. Because no bit values are transmitted, Eve gains zero information about the sifted key bits.",
    "circuit": {
      "qubits": 1,
      "gates": [
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "bb84-phase-9": {
    "id": "bb84-phase-9",
    "type": "prediction",
    "question": "If Alice sends 200 photons and Eve intercepts all of them with random basis guesses, approximately what fraction of the sifted key bits will contain errors?",
    "options": [
      "0% (no errors)",
      "Approximately 25% (QBER ≈ 0.25)",
      "Approximately 50%",
      "100% (complete corruption)"
    ],
    "correctIndex": 1,
    "hints": [
      "On the sifted key, Alice and Bob used the same basis.",
      "Eve guessed the wrong basis 50% of the time, and when she did, Bob had a 50% chance of getting the wrong bit: 0.5 * 0.5 = 0.25."
    ],
    "explanation": "Eve chooses the wrong basis 50% of the time. When she re-sends her measurement result, Bob measures in Alice's basis and receives an erroneous bit with probability 1/2. Thus, the expected Quantum Bit Error Rate on the sifted key is 50% * 50% = 25%.",
    "circuit": {
      "qubits": 1,
      "gates": [
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "Z",
          "q": 0
        },
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "bb84-phase-10": {
    "id": "bb84-phase-10",
    "type": "code-completion",
    "question": "In Qiskit, Alice prepares a qubit in the X-basis with bit 0. Which line of code implements this preparation?",
    "starterCode": "from qiskit import QuantumCircuit\nqc = QuantumCircuit(1, 1)\n# TODO: prepare |+⟩ (bit 0 in X-basis)",
    "expectedAnswer": "qc.h(0)",
    "options": [
      "qc.x(0)",
      "qc.h(0)",
      "qc.z(0)",
      "qc.rx(0, Math.PI)"
    ],
    "correctIndex": 1,
    "hints": [
      "Initial state is |0⟩.",
      "Applying the Hadamard gate H to |0⟩ produces |+⟩."
    ],
    "explanation": "In Qiskit, applying `qc.h(0)` to the default ground state |0⟩ creates the superposition state |+⟩ = (|0⟩ + |1⟩)/√2, which represents bit 0 in the diagonal X-basis.",
    "circuit": {
      "qubits": 1,
      "gates": [
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "bb84-phase-11": {
    "id": "bb84-phase-11",
    "type": "multiple-choice",
    "question": "If Alice and Bob compare a test sample of 40 sifted bits and find 0 errors, what is the probability that an eavesdropper intercepted all photons without being detected?",
    "options": [
      "50%",
      "25%",
      "(3/4)^40 ≈ 0.00001 (0.001%)",
      "0% (mathematically impossible)"
    ],
    "correctIndex": 2,
    "hints": [
      "Each intercepted sifted bit has a 3/4 chance of passing undetected.",
      "For 40 independent bits, the probability is (1 - 0.25)^40."
    ],
    "explanation": "Because each intercepted bit has a 1 - 0.25 = 0.75 probability of matching by chance, the probability of Eve escaping detection across 40 sampled bits is (0.75)^40 ≈ 1.005 × 10^-5, or about 1 in 100,000, giving Alice and Bob near-absolute confidence in channel security.",
    "circuit": {
      "qubits": 1,
      "gates": [
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "bb84-phase-12": {
    "id": "bb84-phase-12",
    "type": "prediction",
    "question": "Once Alice and Bob verify that the QBER is well below the threshold (e.g. < 11%), what do they do with the remaining unrevealed sifted key bits?",
    "options": [
      "They discard them and restart the transmission.",
      "They use them as a One-Time Pad (OTP) key to encrypt secret messages with unconditional security.",
      "They send them to Eve to negotiate a shared decryption key.",
      "They publish them on the public internet as a cryptographic signature."
    ],
    "correctIndex": 1,
    "hints": [
      "BB84 is a Key Distribution protocol, not a direct messaging protocol.",
      "Combining a truly random quantum key with the One-Time Pad yields Shannon's information-theoretic security."
    ],
    "explanation": "The established secret random key is combined with the classical One-Time Pad: Ciphertext = Message ⊕ Key. By Shannon's theorem, an OTP with a truly random, single-use quantum key provides information-theoretic security that no supercomputer can break.",
    "circuit": {
      "qubits": 1,
      "gates": [
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "dj-phase-1": {
    "id": "dj-phase-1",
    "type": "prediction",
    "question": "For an n-qubit Boolean function f: {0,1}^n -> {0,1}, how many queries does a classical deterministic algorithm require in the worst case to be 100% certain whether f is constant or balanced?",
    "options": [
      "1 query",
      "n queries",
      "2^(n-1) + 1 queries",
      "2^n queries"
    ],
    "correctIndex": 2,
    "hints": [
      "A balanced function outputs 0 for exactly half the inputs (2^(n-1)) and 1 for the other half.",
      "If a classical algorithm queries 2^(n-1) inputs and sees all 0s, the very next query could still be 0 (constant) or 1 (balanced)."
    ],
    "explanation": "A classical deterministic algorithm could evaluate 2^(n-1) inputs and observe the same value (e.g. all 0s). It cannot conclude whether the function is constant or balanced until it checks the (2^(n-1) + 1)-th input, requiring exponential queries O(2^n).",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "H",
          "q": 1
        }
      ]
    }
  },
  "dj-phase-2": {
    "id": "dj-phase-2",
    "type": "multiple-choice",
    "question": "If f(x) is a balanced function on 3 qubits (8 total inputs), how many inputs x yield f(x) = 0 and how many yield f(x) = 1?",
    "options": [
      "8 yield 0 and 0 yield 1",
      "4 yield 0 and 4 yield 1",
      "2 yield 0 and 6 yield 1",
      "1 yields 0 and 7 yield 1"
    ],
    "correctIndex": 1,
    "hints": [
      "By definition, a balanced function is 50/50 split across its domain.",
      "Total inputs N = 2^3 = 8."
    ],
    "explanation": "By definition, a balanced function produces output 0 for exactly half of its inputs and 1 for the other half. For n=3, 2^3 = 8 inputs, so exactly 4 inputs yield 0 and 4 inputs yield 1.",
    "circuit": {
      "qubits": 3,
      "gates": [
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "H",
          "q": 1
        },
        {
          "g": "H",
          "q": 2
        }
      ]
    }
  },
  "dj-phase-3": {
    "id": "dj-phase-3",
    "type": "statevector",
    "question": "Applying H^⊗2 to initial state |00⟩ produces what statevector in QubitLab?",
    "expression": "H^⊗2 |00⟩",
    "answer": "1/2(|00⟩ + |01⟩ + |10⟩ + |11⟩)",
    "options": [
      "1/√2 (|00⟩ + |11⟩)",
      "1/2 (|00⟩ + |01⟩ + |10⟩ + |11⟩)",
      "1/2 (|00⟩ - |01⟩ - |10⟩ + |11⟩)",
      "|00⟩"
    ],
    "correctIndex": 1,
    "hints": [
      "(H|0⟩) ⊗ (H|0⟩) = (1/√2)(|0⟩ + |1⟩) ⊗ (1/√2)(|0⟩ + |1⟩).",
      "Multiplying the coefficients: (1/√2) * (1/√2) = 1/2 for all 4 basis states."
    ],
    "explanation": "The tensor product of two Hadamard gates transforms |00⟩ into an equal superposition of all 4 computational basis states, each with amplitude 1/2 and measurement probability |1/2|² = 25%.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "H",
          "q": 1
        }
      ]
    }
  },
  "dj-phase-4": {
    "id": "dj-phase-4",
    "type": "gate-prediction",
    "question": "To prepare the ancilla qubit for phase kickback in Deutsch-Jozsa, which gate sequence must be applied to initial state |0⟩?",
    "initialState": "|0⟩",
    "gates": [
      {
        "g": "X",
        "q": 1
      },
      {
        "g": "H",
        "q": 1
      }
    ],
    "expectedState": "|-⟩",
    "options": [
      "H then X, producing |+⟩",
      "X then H, producing |-⟩ = (|0⟩ - |1⟩)/√2",
      "Only gate H, producing |+⟩",
      "Only gate X, producing |1⟩"
    ],
    "correctIndex": 1,
    "hints": [
      "The ancilla must be in the |-⟩ state so that the XOR operation kicks back a (-1)^f(x) phase.",
      "|-⟩ = H|1⟩ = H(X|0⟩)."
    ],
    "explanation": "Applying gate X transforms |0⟩ to |1⟩. Then applying H creates |-⟩ = (|0⟩ - |1⟩)/√2. This state is an eigenstate of the addition modulo 2 operator with eigenvalue (-1)^f(x).",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "X",
          "q": 1
        },
        {
          "g": "H",
          "q": 1
        }
      ]
    }
  },
  "dj-phase-5": {
    "id": "dj-phase-5",
    "type": "prediction",
    "question": "Consider the standard quantum oracle U_f |x⟩|y⟩ = |x⟩|y ⊕ f(x)⟩. What is the result when the ancilla qubit is in the state |y⟩ = |-⟩?",
    "options": [
      "U_f |x⟩|-⟩ = |x⟩|+⟩",
      "U_f |x⟩|-⟩ = (-1)^f(x) |x⟩|-⟩",
      "U_f |x⟩|-⟩ = |x ⊕ f(x)⟩|-⟩",
      "U_f |x⟩|-⟩ = |x⟩|0⟩"
    ],
    "correctIndex": 1,
    "hints": [
      "If f(x) = 0: |0 ⊕ 0⟩ - |1 ⊕ 0⟩ = |0⟩ - |1⟩ = |-⟩ = (+1)|-⟩.",
      "If f(x) = 1: |0 ⊕ 1⟩ - |1 ⊕ 1⟩ = |1⟩ - |0⟩ = -(|0⟩ - |1⟩) = (-1)|-⟩."
    ],
    "explanation": "When the ancilla is in state |-⟩, the oracle evaluation |y ⊕ f(x)⟩ changes the overall sign by (-1)^f(x). Because the ancilla remains completely unchanged in |-⟩, this phase is 'kicked back' onto the input register state |x⟩.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "X",
          "q": 1
        },
        {
          "g": "H",
          "q": 1
        },
        {
          "g": "CNOT",
          "q": 0,
          "q2": 1
        }
      ]
    }
  },
  "dj-phase-6": {
    "id": "dj-phase-6",
    "type": "circuit-analysis",
    "question": "For a 1-qubit input function f(x) = x (which is balanced), what physical gate acts as the oracle U_f between input q0 and ancilla q1?",
    "circuitSummary": "A CNOT gate with control on q0 and target on ancilla q1.",
    "expectedObservation": "Phase kickback flips the relative phase of |1⟩, changing |+⟩ to |-⟩.",
    "options": [
      "A Hadamard gate on q0",
      "A CNOT gate with control on input q0 and target on ancilla q1",
      "A Pauli Z gate on ancilla q1",
      "A SWAP gate between q0 and q1"
    ],
    "correctIndex": 1,
    "hints": [
      "The oracle must compute |x⟩|y ⊕ f(x)⟩. When f(x) = x, this is |x⟩|y ⊕ x⟩.",
      "The controlled-NOT gate flips the target bit if and only if the control bit is 1."
    ],
    "explanation": "The CNOT gate computes |x, y ⊕ x⟩. When ancilla q1 is in |-⟩, the CNOT gate kicks back a phase of (-1)^x onto q0: |0⟩|-⟩ -> |0⟩|-⟩, and |1⟩|-⟩ -> -|1⟩|-⟩.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "X",
          "q": 1
        },
        {
          "g": "H",
          "q": 1
        },
        {
          "g": "CNOT",
          "q": 0,
          "q2": 1
        }
      ]
    }
  },
  "dj-phase-7": {
    "id": "dj-phase-7",
    "type": "prediction",
    "question": "In 1-qubit Deutsch-Jozsa with f(x) = x, the state of q0 after phase kickback is |-⟩ = (|0⟩ - |1⟩)/√2. What is the state of q0 after the final Hadamard gate?",
    "options": [
      "|0⟩",
      "|1⟩",
      "|+⟩",
      "|-⟩"
    ],
    "correctIndex": 1,
    "hints": [
      "Recall that H |0⟩ = |+⟩, H |1⟩ = |-⟩.",
      "Because H is self-inverse (H = H^†), applying H to |-⟩ returns |1⟩."
    ],
    "explanation": "The Hadamard transform is its own inverse: H² = I. Therefore, H|-⟩ = |1⟩. Because the measured bit is 1 (non-zero), the algorithm deterministically concludes that f is balanced in exactly one query!",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "X",
          "q": 1
        },
        {
          "g": "H",
          "q": 1
        },
        {
          "g": "CNOT",
          "q": 0,
          "q2": 1
        },
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "dj-phase-8": {
    "id": "dj-phase-8",
    "type": "statevector",
    "question": "In general n-qubit Deutsch-Jozsa, what is the mathematical expression for the amplitude of the all-zero state |00...0⟩ after the final Hadamard transform?",
    "expression": "⟨0...0 | \\psi_{final}⟩ = (1/2^n) \\sum_{x} (-1)^{f(x)}",
    "answer": "(1/2^n) \\sum_{x} (-1)^{f(x)}",
    "options": [
      "(1/2^n) ∑_x (-1)^{f(x)}",
      "(1/√2^n) ∑_x f(x)",
      "∑_x (-1)^{f(x)}",
      "0 always"
    ],
    "correctIndex": 0,
    "hints": [
      "Each of the 2^n terms has an amplitude contribution of 1/√2^n from preparation and 1/√2^n from the final Hadamard.",
      "(1/√2^n) * (1/√2^n) = 1/2^n."
    ],
    "explanation": "The final state before measurement has amplitude c_0 = (1/2^n) ∑_x (-1)^{f(x)} on the |0...0⟩ state. If f is constant, all terms have the same sign and add up to ±1. If f is balanced, exactly half are +1 and half are -1, canceling out to exactly 0.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "dj-phase-9": {
    "id": "dj-phase-9",
    "type": "multiple-choice",
    "question": "If you measure the input register of an n-qubit Deutsch-Jozsa circuit and observe outcome '00...0' with probability 1.0, what does this mathematically prove about the black-box function f?",
    "options": [
      "The function f is guaranteed to be balanced.",
      "The function f is guaranteed to be constant.",
      "The function f is non-linear.",
      "The function f has an even parity of ones."
    ],
    "correctIndex": 1,
    "hints": [
      "For a balanced function, the amplitude of |00...0⟩ is identically 0.",
      "Only a constant function exhibits 100% constructive interference at |00...0⟩."
    ],
    "explanation": "For a constant function, (-1)^f(x) is identical for all x, so constructive interference concentrates 100% of the probability amplitude on |00...0⟩. For a balanced function, this amplitude is strictly 0. Therefore, seeing |00...0⟩ proves f is constant.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "dj-phase-10": {
    "id": "dj-phase-10",
    "type": "circuit-analysis",
    "question": "A student builds a Deutsch-Jozsa circuit in QubitLab but accidentally applies a final Hadamard gate to the ancilla qubit before measuring. What error occurs?",
    "circuitSummary": "Final H applied to ancilla wire q1.",
    "expectedObservation": "The ancilla qubit is irrelevant to the decision; the decision must be read strictly from the input register.",
    "options": [
      "The circuit blows up and cannot compile.",
      "The student measures the ancilla instead of the input register, confusing ancilla state with the function classification.",
      "The input register amplitudes are inverted.",
      "The oracle function is erased."
    ],
    "correctIndex": 1,
    "hints": [
      "The algorithm's result is encoded in the interference pattern of the input register qubits.",
      "The ancilla qubit was merely a catalyst for phase kickback."
    ],
    "explanation": "In Deutsch-Jozsa, the classification decision is strictly extracted by measuring the input register qubits. The ancilla qubit serves only as a helper for phase kickback and should either be discarded or left unmeasured.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "X",
          "q": 1
        },
        {
          "g": "H",
          "q": 1
        },
        {
          "g": "CNOT",
          "q": 0,
          "q2": 1
        },
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "dj-phase-11": {
    "id": "dj-phase-11",
    "type": "code-completion",
    "question": "In Qiskit, how do you verify if the measurement counts of the input register indicate a constant function?",
    "starterCode": "# counts = {'00': 1024}\nif '???' in counts and len(counts) == 1:\n    print('Function is CONSTANT')",
    "expectedAnswer": "'0' * n",
    "options": [
      "'0' * n",
      "'1' * n",
      "'01'",
      "'10'"
    ],
    "correctIndex": 0,
    "hints": [
      "The all-zeros bitstring of length n represents |00...0⟩.",
      "In Python, `'0' * n` produces '00' for n=2 or '000' for n=3."
    ],
    "explanation": "If the only measured bitstring is all zeros ('0' * n), constructive interference has occurred, proving the oracle function is constant. Any other measured bitstring indicates a balanced function.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "dj-phase-12": {
    "id": "dj-phase-12",
    "type": "prediction",
    "question": "Why is the Deutsch-Jozsa algorithm considered a milestone in quantum computing even though the problem itself has little direct commercial application?",
    "options": [
      "It was the first algorithm to crack RSA encryption.",
      "It provided the first deterministic proof that a quantum algorithm can solve a problem exponentially faster than any classical deterministic algorithm.",
      "It proved that quantum computers do not need error correction.",
      "It eliminated the need for quantum measurement."
    ],
    "correctIndex": 1,
    "hints": [
      "Consider the query complexity: 1 quantum query vs 2^(n-1) + 1 classical queries.",
      "Exponential separation: O(1) vs O(2^n)."
    ],
    "explanation": "Deutsch-Jozsa established the mathematical foundation of quantum advantage: evaluating global properties of a function via quantum interference in O(1) queries versus O(2^n) classical queries, inspiring Shor and Grover.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "X",
          "q": 1
        },
        {
          "g": "H",
          "q": 1
        },
        {
          "g": "CNOT",
          "q": 0,
          "q2": 1
        },
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "grover-phase-1": {
    "id": "grover-phase-1",
    "type": "prediction",
    "question": "In an unsorted database of N = 1,000,000 items, how many queries does a classical search need on average compared to Grover's algorithm?",
    "options": [
      "Classical: 500,000 queries; Grover: ~785 queries",
      "Classical: 1,000,000 queries; Grover: 1 query",
      "Classical: 500,000 queries; Grover: 500,000 queries",
      "Classical: 20 queries; Grover: 10 queries"
    ],
    "correctIndex": 0,
    "hints": [
      "Classically, an unsorted search requires checking N/2 items on average.",
      "Grover's algorithm runs in (π/4) * √N iterations: (π/4) * 1,000 ≈ 785."
    ],
    "explanation": "Classically, finding a marked item in an unsorted database requires examining N/2 = 500,000 items on average. Grover's algorithm achieves a quadratic speedup, requiring only (π/4)√N ≈ 0.785 × 1,000 ≈ 785 quantum oracle queries.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "H",
          "q": 1
        }
      ]
    }
  },
  "grover-phase-2": {
    "id": "grover-phase-2",
    "type": "statevector",
    "question": "For N = 4 items (2 qubits), you initialize state |00⟩ and apply H to both qubits. What is the initial amplitude of each basis state?",
    "expression": "|\\psi_0⟩ = H^⊗2 |00⟩ = 1/2(|00⟩ + |01⟩ + |10⟩ + |11⟩)",
    "answer": "1/2 (0.5)",
    "options": [
      "1/4 (0.25)",
      "1/2 (0.50)",
      "1/√2 (0.707)",
      "1.0"
    ],
    "correctIndex": 1,
    "hints": [
      "The amplitude is 1/√N where N = 2^2 = 4.",
      "1/√4 = 1/2 = 0.5."
    ],
    "explanation": "Equal superposition across N = 2^n states assigns an amplitude of 1/√N to every computational basis state. For n=2, 1/√4 = 1/2 = 0.5, giving each state an initial detection probability of |1/2|² = 25%.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "H",
          "q": 1
        }
      ]
    }
  },
  "grover-phase-3": {
    "id": "grover-phase-3",
    "type": "prediction",
    "question": "Suppose the marked item is |w⟩ = |11⟩. What does the phase oracle U_w do to the statevector (0.5, 0.5, 0.5, 0.5)^T?",
    "options": [
      "Flips |00⟩ to -0.5, leaving others at 0.5",
      "Flips |11⟩ to -0.5, leaving others at 0.5: (0.5, 0.5, 0.5, -0.5)^T",
      "Sets |11⟩ to 1.0 and all other amplitudes to 0",
      "Inverts all amplitudes to -0.5"
    ],
    "correctIndex": 1,
    "hints": [
      "The Grover oracle operator is U_w = I - 2|w⟩⟨w|.",
      "It reflects the target state across the origin, multiplying its amplitude by -1 while leaving non-target states untouched."
    ],
    "explanation": "The phase oracle marks the target state |w⟩ by multiplying its amplitude by -1. For target |11⟩, the amplitudes become |00⟩: 0.5, |01⟩: 0.5, |10⟩: 0.5, and |11⟩: -0.5.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "H",
          "q": 1
        },
        {
          "g": "CZ",
          "q": 0,
          "q2": 1
        }
      ]
    }
  },
  "grover-phase-4": {
    "id": "grover-phase-4",
    "type": "circuit-analysis",
    "question": "In a 2-qubit circuit, which single standard two-qubit gate implements the phase oracle for target state |11⟩ without needing an ancilla qubit?",
    "circuitSummary": "Controlled-Z (CZ) gate between q0 and q1.",
    "expectedObservation": "The CZ gate flips the sign of |11⟩ to -|11⟩ while leaving |00⟩, |01⟩, |10⟩ unchanged.",
    "options": [
      "CNOT gate",
      "Controlled-Z (CZ) gate",
      "SWAP gate",
      "Hadamard gate on q0"
    ],
    "correctIndex": 1,
    "hints": [
      "CZ acts as diag(1, 1, 1, -1) in the computational basis.",
      "It introduces a -1 phase if and only if both control and target qubits are 1."
    ],
    "explanation": "The Controlled-Z (CZ) unitary matrix is diag(1, 1, 1, -1). Since it applies a π phase shift (-1) exclusively to |11⟩, it acts as the exact phase oracle for target state |11⟩ in 2-qubit Grover search.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "H",
          "q": 1
        },
        {
          "g": "CZ",
          "q": 0,
          "q2": 1
        }
      ]
    }
  },
  "grover-phase-5": {
    "id": "grover-phase-5",
    "type": "multiple-choice",
    "question": "After the oracle marks |11⟩, the statevector is (0.5, 0.5, 0.5, -0.5). What is the mean (average) amplitude across all 4 states?",
    "options": [
      "0.5",
      "0.25",
      "0.0",
      "-0.25"
    ],
    "correctIndex": 1,
    "hints": [
      "Mean = (0.5 + 0.5 + 0.5 - 0.5) / 4.",
      "1.0 / 4 = 0.25."
    ],
    "explanation": "The average amplitude is (0.5 + 0.5 + 0.5 - 0.5) / 4 = 1.0 / 4 = 0.25. Because the target amplitude (-0.5) is well below this average, the diffusion operator will reflect it across the mean into a large positive amplitude.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "H",
          "q": 1
        },
        {
          "g": "CZ",
          "q": 0,
          "q2": 1
        }
      ]
    }
  },
  "grover-phase-6": {
    "id": "grover-phase-6",
    "type": "statevector",
    "question": "The diffusion operator performs inversion about the mean: α'_i = 2μ - α_i. If the mean is μ = 0.25 and the target amplitude is α_{11} = -0.5, what is the new amplitude α'_{11}?",
    "expression": "α'_{11} = 2(0.25) - (-0.5) = 0.5 + 0.5 = 1.0",
    "answer": "1.0",
    "options": [
      "0.5",
      "0.75",
      "1.0",
      "0.0"
    ],
    "correctIndex": 2,
    "hints": [
      "Calculate 2 * 0.25 = 0.5.",
      "Then subtract (-0.5): 0.5 - (-0.5) = 1.0."
    ],
    "explanation": "Inversion about the mean computes α'_i = 2μ - α_i. For the target state: 2(0.25) - (-0.5) = 0.5 + 0.5 = 1.0. For the non-target states: 2(0.25) - 0.5 = 0.0. The target state amplitude has grown to 1.0, achieving 100% success probability!",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "H",
          "q": 1
        },
        {
          "g": "CZ",
          "q": 0,
          "q2": 1
        },
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "H",
          "q": 1
        },
        {
          "g": "X",
          "q": 0
        },
        {
          "g": "X",
          "q": 1
        },
        {
          "g": "CZ",
          "q": 0,
          "q2": 1
        },
        {
          "g": "X",
          "q": 0
        },
        {
          "g": "X",
          "q": 1
        },
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "H",
          "q": 1
        }
      ]
    }
  },
  "grover-phase-7": {
    "id": "grover-phase-7",
    "type": "gate-prediction",
    "question": "What is the standard gate decomposition of the 2-qubit Grover diffusion operator D = 2|s⟩⟨s| - I?",
    "initialState": "|\\psi⟩",
    "gates": [
      {
        "g": "H",
        "q": 0
      },
      {
        "g": "H",
        "q": 1
      },
      {
        "g": "X",
        "q": 0
      },
      {
        "g": "X",
        "q": 1
      },
      {
        "g": "CZ",
        "q": 0,
        "q2": 1
      },
      {
        "g": "X",
        "q": 0
      },
      {
        "g": "X",
        "q": 1
      },
      {
        "g": "H",
        "q": 0
      },
      {
        "g": "H",
        "q": 1
      }
    ],
    "expectedState": "|11⟩",
    "options": [
      "H -> X -> CZ -> X -> H on all qubits",
      "X -> H -> CNOT -> H -> X",
      "Z -> H -> Z -> H",
      "CNOT -> H -> CNOT"
    ],
    "correctIndex": 0,
    "hints": [
      "D = H^⊗n (2|0⟩⟨0| - I) H^⊗n.",
      "The reflection around |00⟩ is implemented by X gates wrapping a controlled phase flip, sandwiched between H gates."
    ],
    "explanation": "The diffusion operator D = H^⊗n (2|0⟩⟨0| - I) H^⊗n is synthesized by applying H to all qubits, wrapping a phase flip on |00⟩ with X gates and CZ, and returning to the computational basis with H gates.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "H",
          "q": 1
        },
        {
          "g": "X",
          "q": 0
        },
        {
          "g": "X",
          "q": 1
        },
        {
          "g": "CZ",
          "q": 0,
          "q2": 1
        },
        {
          "g": "X",
          "q": 0
        },
        {
          "g": "X",
          "q": 1
        },
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "H",
          "q": 1
        }
      ]
    }
  },
  "grover-phase-8": {
    "id": "grover-phase-8",
    "type": "multiple-choice",
    "question": "In the geometric 2D visualization of Grover search, each Grover iteration rotates the state vector by what angle toward the target state?",
    "options": [
      "θ = arcsin(1/√N)",
      "2θ where θ = arcsin(1/√N)",
      "π/2 radians",
      "4θ"
    ],
    "correctIndex": 1,
    "hints": [
      "Two reflections in a 2D plane produce a rotation by twice the angle between the reflection axes.",
      "The angle between the initial state and the non-target subspace is θ = arcsin(1/√N)."
    ],
    "explanation": "A Grover iteration is the product of two reflections: reflection across |w⟩ and reflection across |s⟩. By the Cartan-Dieudonné theorem, the composition of two reflections separated by angle θ produces a pure rotation by angle 2θ in the 2D plane.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "grover-phase-9": {
    "id": "grover-phase-9",
    "type": "prediction",
    "question": "For N = 4 (2 qubits), how many Grover iterations are required to achieve exactly 100% probability of measuring the target state?",
    "options": [
      "1 iteration",
      "2 iterations",
      "3 iterations",
      "4 iterations"
    ],
    "correctIndex": 0,
    "hints": [
      "For N=4, sin(θ) = 1/√4 = 1/2, so θ = 30° (π/6).",
      "After 1 iteration, the total angle is θ + 2θ = 3θ = 90° (π/2), which aligns exactly with the target state!"
    ],
    "explanation": "For N=4, θ = arcsin(1/2) = 30°. One iteration adds 2θ = 60°, rotating the state to 30° + 60° = 90° (pure target state |w⟩). Exactly 1 iteration yields 100% probability. Applying a second iteration would rotate the state past the target, reducing success probability to 25%!",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "H",
          "q": 1
        },
        {
          "g": "CZ",
          "q": 0,
          "q2": 1
        },
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "H",
          "q": 1
        },
        {
          "g": "X",
          "q": 0
        },
        {
          "g": "X",
          "q": 1
        },
        {
          "g": "CZ",
          "q": 0,
          "q2": 1
        },
        {
          "g": "X",
          "q": 0
        },
        {
          "g": "X",
          "q": 1
        },
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "H",
          "q": 1
        }
      ]
    }
  },
  "grover-phase-10": {
    "id": "grover-phase-10",
    "type": "prediction",
    "question": "What happens if a developer runs 2 Grover iterations on a 2-qubit (N=4) search problem?",
    "options": [
      "The probability increases from 100% to 200%",
      "Over-rotation occurs: the state vector rotates past |w⟩, dropping success probability back to 25%",
      "The circuit decoheres instantly",
      "The quantum state collapses without measurement"
    ],
    "correctIndex": 1,
    "hints": [
      "Grover search is a periodic rotation in a 2D plane.",
      "At 1 iteration the angle is 90° (sin²(90°)=1). At 2 iterations the angle is 90° + 60° = 150° (sin²(150°)=0.25)."
    ],
    "explanation": "Because Grover iterations rotate the statevector in a circle, applying more iterations than R ≈ (π/4)√N causes 'over-rotation'. For N=4, a second iteration rotates the state vector to 150°, reducing target probability from 100% back to 25%!",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "H",
          "q": 1
        },
        {
          "g": "CZ",
          "q": 0,
          "q2": 1
        },
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "H",
          "q": 1
        },
        {
          "g": "X",
          "q": 0
        },
        {
          "g": "X",
          "q": 1
        },
        {
          "g": "CZ",
          "q": 0,
          "q2": 1
        },
        {
          "g": "X",
          "q": 0
        },
        {
          "g": "X",
          "q": 1
        },
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "H",
          "q": 1
        },
        {
          "g": "CZ",
          "q": 0,
          "q2": 1
        },
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "H",
          "q": 1
        },
        {
          "g": "X",
          "q": 0
        },
        {
          "g": "X",
          "q": 1
        },
        {
          "g": "CZ",
          "q": 0,
          "q2": 1
        },
        {
          "g": "X",
          "q": 0
        },
        {
          "g": "X",
          "q": 1
        },
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "H",
          "q": 1
        }
      ]
    }
  },
  "grover-phase-11": {
    "id": "grover-phase-11",
    "type": "code-completion",
    "question": "In Qiskit, which function from `qiskit.circuit.library` provides an optimized multi-controlled Z gate or Grover diffusion operator?",
    "starterCode": "from qiskit.circuit.library import GroverOperator\n# grover_op = GroverOperator(oracle)",
    "expectedAnswer": "GroverOperator",
    "options": [
      "GroverOperator",
      "SearchAmplifier",
      "QuantumOracle",
      "DiffusionGate"
    ],
    "correctIndex": 0,
    "hints": [
      "Qiskit's standard library provides a unified operator named after the algorithm creator.",
      "It combines the oracle and the standard diffusion operator."
    ],
    "explanation": "Qiskit provides the `GroverOperator(oracle)` class in `qiskit.circuit.library`, which automatically generates the oracle query and the corresponding diffusion operator reflection.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "grover-phase-12": {
    "id": "grover-phase-12",
    "type": "multiple-choice",
    "question": "If there are M multiple marked items in a database of size N, how does the optimal number of Grover iterations scale?",
    "options": [
      "O(N / M)",
      "O(√(N / M))",
      "O(N)",
      "O(M √N)"
    ],
    "correctIndex": 1,
    "hints": [
      "The initial angle is increased because the target subspace is larger: sin(θ) ≈ √(M/N).",
      "The required rotation to reach π/2 is (π/4) / θ ≈ (π/4)√(N/M)."
    ],
    "explanation": "With M marked targets, the overlap of the initial uniform state with the target subspace is sin(θ) = √(M/N). Thus, the state reaches the target subspace in R ≈ (π/4)√(N/M) iterations, providing an even faster search.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "qaoa-phase-1": {
    "id": "qaoa-phase-1",
    "type": "prediction",
    "question": "In the Max-Cut problem on an undirected graph G=(V,E), what is the goal of partitioning vertices into two sets S and S'?",
    "options": [
      "Minimize the number of vertices in S",
      "Maximize the number of edges that have one endpoint in S and the other in S'",
      "Find the shortest path connecting all vertices",
      "Color all vertices with distinct colors"
    ],
    "correctIndex": 1,
    "hints": [
      "An edge (u, v) is 'cut' if u and v are assigned to opposite sets.",
      "Max-Cut seeks the vertex partition that maximizes the total cut weight/count."
    ],
    "explanation": "Max-Cut seeks to partition the vertices of a graph into two disjoint subsets S and S' such that the number of edges connecting vertices in S to vertices in S' is as large as possible. This problem is NP-hard.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "H",
          "q": 1
        }
      ]
    }
  },
  "qaoa-phase-2": {
    "id": "qaoa-phase-2",
    "type": "statevector",
    "question": "For a single edge connecting qubits 0 and 1, the cost operator term is (I - Z_0 Z_1) / 2. If qubits are in state |01⟩, what is the eigenvalue of this term?",
    "expression": "C|01⟩ = ((I - Z_0 Z_1)/2)|01⟩",
    "answer": "1 (The edge is cut)",
    "options": [
      "0 (Edge is not cut)",
      "1 (Edge is cut)",
      "-1",
      "1/2"
    ],
    "correctIndex": 1,
    "hints": [
      "Recall Z|0⟩ = +|0⟩ and Z|1⟩ = -|1⟩.",
      "Z_0 Z_1 |01⟩ = (+1)(-1)|01⟩ = -1|01⟩. Then (1 - (-1)) / 2 = 2/2 = 1."
    ],
    "explanation": "For opposite bits (0 and 1), Z_0 Z_1 evaluates to -1. Therefore, (I - Z_0 Z_1)/2 evaluates to (1 - (-1))/2 = +1, contributing 1 to the cut count. For identical bits (00 or 11), Z_0 Z_1 = +1, yielding (1 - 1)/2 = 0.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "X",
          "q": 1
        }
      ]
    }
  },
  "qaoa-phase-3": {
    "id": "qaoa-phase-3",
    "type": "gate-prediction",
    "question": "What initial state preparation is applied to all n qubits in QAOA before applying the cost and mixer layers?",
    "initialState": "|0⟩^⊗n",
    "gates": [
      {
        "g": "H",
        "q": 0
      },
      {
        "g": "H",
        "q": 1
      }
    ],
    "expectedState": "|+⟩^⊗n",
    "options": [
      "Apply X to all qubits to create |1⟩^⊗n",
      "Apply H to all qubits to create equal superposition |+⟩^⊗n",
      "Apply Z to all qubits",
      "Leave qubits in ground state |0⟩^⊗n"
    ],
    "correctIndex": 1,
    "hints": [
      "The initial state must be the ground state of the mixer Hamiltonian H_M = -∑ X_i.",
      "The ground state of -X is |+⟩ = H|0⟩."
    ],
    "explanation": "QAOA starts in the equal superposition state |+⟩^⊗n = H^⊗n |0⟩^⊗n. This is the highest-symmetry state and the exact ground state of the standard transverse-field mixer Hamiltonian H_M = -∑ X_i.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "H",
          "q": 1
        }
      ]
    }
  },
  "qaoa-phase-4": {
    "id": "qaoa-phase-4",
    "type": "circuit-analysis",
    "question": "How is the two-qubit ZZ interaction unitary U_ZZ(2γ) = e^{-i γ Z_i Z_j} implemented using standard quantum gates?",
    "circuitSummary": "CNOT(i -> j) followed by RZ(2γ) on j, followed by CNOT(i -> j).",
    "expectedObservation": "The CNOT gates compute the parity into qubit j, RZ applies the phase, and the second CNOT uncomputes the parity.",
    "options": [
      "H -> CNOT -> H",
      "CNOT(i -> j) -> RZ(2γ) on j -> CNOT(i -> j)",
      "SWAP -> RX(2γ) -> SWAP",
      "CZ -> RY(2γ) -> CZ"
    ],
    "correctIndex": 1,
    "hints": [
      "To apply a phase dependent on the parity x_i ⊕ x_j, compute parity onto target j.",
      "Apply RZ(2γ) to rotate target j, then uncompute with another CNOT."
    ],
    "explanation": "The standard CNOT-RZ-CNOT gadget implements e^{-i γ Z_i Z_j}. The first CNOT maps |x_i, x_j⟩ to |x_i, x_i ⊕ x_j⟩. The RZ gate applies phase e^{-i γ (-1)^{x_i ⊕ x_j}}, and the second CNOT restores the second qubit.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "CNOT",
          "q": 0,
          "q2": 1
        },
        {
          "g": "RZ",
          "q": 1,
          "theta": 0.5
        },
        {
          "g": "CNOT",
          "q": 0,
          "q2": 1
        }
      ]
    }
  },
  "qaoa-phase-5": {
    "id": "qaoa-phase-5",
    "type": "prediction",
    "question": "What gate does the mixer unitary U(M, β) = e^{-i β H_M} = ∏_i e^{-i β X_i} apply to each individual qubit?",
    "options": [
      "RZ(2β)",
      "RX(2β)",
      "RY(2β)",
      "Pauli Z"
    ],
    "correctIndex": 1,
    "hints": [
      "e^{-i θ/2 X} is the definition of the single-qubit RX(θ) rotation gate.",
      "Here θ/2 = β, so θ = 2β."
    ],
    "explanation": "Because H_M = ∑ X_i and all single-qubit X operators commute, e^{-i β ∑ X_i} = ∏_i e^{-i β X_i}. In quantum circuits, e^{-i (2β/2) X} is realized directly by the single-qubit rotation gate RX(2β) on every qubit.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "RX",
          "q": 0,
          "theta": 0.8
        },
        {
          "g": "RX",
          "q": 1,
          "theta": 0.8
        }
      ]
    }
  },
  "qaoa-phase-6": {
    "id": "qaoa-phase-6",
    "type": "multiple-choice",
    "question": "In depth-1 QAOA (p=1), how many classical continuous parameters are tuned by the classical optimization algorithm?",
    "options": [
      "1 parameter (γ)",
      "2 parameters (γ and β)",
      "2^n parameters",
      "n parameters"
    ],
    "correctIndex": 1,
    "hints": [
      "One angle for the cost Hamiltonian layer, and one angle for the mixer layer.",
      "γ controls the problem phase shift, and β controls the quantum superposition mixing."
    ],
    "explanation": "At depth p=1, QAOA requires tuning exactly two continuous variational parameters: γ (for the cost Hamiltonian unitary) and β (for the mixer Hamiltonian unitary). For depth p, there are 2p parameters.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "H",
          "q": 1
        },
        {
          "g": "CNOT",
          "q": 0,
          "q2": 1
        },
        {
          "g": "RZ",
          "q": 1,
          "theta": 0.6
        },
        {
          "g": "CNOT",
          "q": 0,
          "q2": 1
        },
        {
          "g": "RX",
          "q": 0,
          "theta": 0.4
        },
        {
          "g": "RX",
          "q": 1,
          "theta": 0.4
        }
      ]
    }
  },
  "qaoa-phase-7": {
    "id": "qaoa-phase-7",
    "type": "statevector",
    "question": "What is the mathematical definition of the objective function that the classical optimizer maximizes in QAOA?",
    "expression": "F_p(\\gamma, \\beta) = \\langle \\psi(\\gamma, \\beta) | H_C | \\psi(\\gamma, \\beta) \\rangle",
    "answer": "The expectation value of the Cost Hamiltonian ⟨H_C⟩",
    "options": [
      "The expectation value ⟨ψ(γ, β)| H_C |ψ(γ, β)⟩",
      "The probability of state |00...0⟩",
      "The trace of the density matrix",
      "The number of gates in the circuit"
    ],
    "correctIndex": 0,
    "hints": [
      "QAOA searches for the parameters that maximize the expected cut value.",
      "In quantum mechanics, the expected value of an observable H_C in state |ψ⟩ is ⟨ψ|H_C|ψ⟩."
    ],
    "explanation": "The objective function is F_p(γ, β) = ⟨ψ(γ, β)| H_C |ψ(γ, β)⟩ = ∑_z C(z) P(z), which is the statistical expectation value of the cut value across the sampled quantum measurement distribution.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "qaoa-phase-8": {
    "id": "qaoa-phase-8",
    "type": "circuit-analysis",
    "question": "In a 2-qubit system with 1 edge (0,1), what are the two optimal bitstrings that solve the Max-Cut problem?",
    "circuitSummary": "Two vertices connected by an edge. Cut is maximized if vertices have opposite bits.",
    "expectedObservation": "Bitstrings '01' and '10' both cut the edge, achieving cut value = 1.",
    "options": [
      "'00' and '11'",
      "'01' and '10'",
      "Only '00'",
      "Only '11'"
    ],
    "correctIndex": 1,
    "hints": [
      "Max-Cut places connected vertices in opposite sets.",
      "Bit 0 in set S, bit 1 in set S'."
    ],
    "explanation": "For a single edge between vertices 0 and 1, placing vertex 0 in set S and vertex 1 in set S' gives bitstring '01'. The reverse partition gives '10'. Both bitstrings cut the edge, yielding the maximum cut value 1.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "H",
          "q": 1
        },
        {
          "g": "CNOT",
          "q": 0,
          "q2": 1
        },
        {
          "g": "RZ",
          "q": 1,
          "theta": 1.57
        },
        {
          "g": "CNOT",
          "q": 0,
          "q2": 1
        },
        {
          "g": "RX",
          "q": 0,
          "theta": 0.785
        },
        {
          "g": "RX",
          "q": 1,
          "theta": 0.785
        }
      ]
    }
  },
  "qaoa-phase-9": {
    "id": "qaoa-phase-9",
    "type": "prediction",
    "question": "Which type of classical optimization algorithm is commonly used in QAOA when evaluating expectation values on noisy, finite-shot quantum hardware?",
    "options": [
      "Exact symbolic differentiation",
      "Gradient-free optimization algorithms such as COBYLA, Nelder-Mead, or SPSA",
      "Gaussian elimination",
      "Linear regression"
    ],
    "correctIndex": 1,
    "hints": [
      "Shot noise makes numerical finite-difference gradient estimates noisy.",
      "COBYLA and SPSA are robust to statistical sampling noise."
    ],
    "explanation": "Because expectation values are estimated from finite measurement shots, the cost landscape is noisy. Derivative-free optimizers (like COBYLA) or simultaneous perturbation stochastic approximation (SPSA) are standard because they handle statistical noise effectively.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "qaoa-phase-10": {
    "id": "qaoa-phase-10",
    "type": "multiple-choice",
    "question": "What is the 'approximation ratio' α of QAOA for Max-Cut?",
    "options": [
      "α = Expected Cut / Maximum Possible Cut",
      "α = Number of qubits / Number of edges",
      "α = γ / β",
      "α = Execution time on quantum / Execution time on classical"
    ],
    "correctIndex": 0,
    "hints": [
      "The approximation ratio measures how close the expected solution is to the true global optimum.",
      "0 ≤ α ≤ 1."
    ],
    "explanation": "The approximation ratio α = ⟨C⟩ / C_max measures the quality of the solution found by QAOA relative to the optimal cut. For 3-regular graphs at p=1, QAOA provably guarantees α ≥ 0.6924, outperforming random guessing (0.5).",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "qaoa-phase-11": {
    "id": "qaoa-phase-11",
    "type": "code-completion",
    "question": "In Qiskit, which module provides pre-built optimization algorithms and QAOA implementations?",
    "starterCode": "# from qiskit_algorithms import QAOA\n# from qiskit_algorithms.optimizers import COBYLA",
    "expectedAnswer": "qiskit_algorithms",
    "options": [
      "qiskit_algorithms",
      "qiskit.finance",
      "qiskit.transpiler",
      "qiskit.providers"
    ],
    "correctIndex": 0,
    "hints": [
      "In modern Qiskit (v1.0+), algorithmic routines reside in a dedicated algorithms package.",
      "`qiskit_algorithms` contains VQE, QAOA, and classical optimizers."
    ],
    "explanation": "In Qiskit, variational algorithms like QAOA and VQE, along with classical optimizers like COBYLA and SPSA, are maintained in the `qiskit_algorithms` library.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "qaoa-phase-12": {
    "id": "qaoa-phase-12",
    "type": "prediction",
    "question": "As the circuit depth p approaches infinity (p -> ∞), what does the adiabatic theorem guarantee about the state produced by QAOA?",
    "options": [
      "The state decoheres into thermal noise.",
      "The state converges with 100% fidelity to the exact optimal ground state of the Cost Hamiltonian (the exact Max-Cut).",
      "The state becomes uniformly random.",
      "The state becomes trapped in a barren plateau."
    ],
    "correctIndex": 1,
    "hints": [
      "QAOA can be viewed as a Trotterized approximation of continuous quantum adiabatic computation.",
      "Adiabatic evolution starting from the mixer ground state maps continuously to the cost ground state."
    ],
    "explanation": "By the Quantum Adiabatic Theorem, as p -> ∞ and the parameters follow an adiabatic schedule, QAOA simulates continuous adiabatic passage with zero Trotter error, guaranteeing convergence to the exact global maximum of the problem.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "H",
          "q": 1
        },
        {
          "g": "CNOT",
          "q": 0,
          "q2": 1
        },
        {
          "g": "RZ",
          "q": 1,
          "theta": 1.57
        },
        {
          "g": "CNOT",
          "q": 0,
          "q2": 1
        },
        {
          "g": "RX",
          "q": 0,
          "theta": 0.785
        },
        {
          "g": "RX",
          "q": 1,
          "theta": 0.785
        }
      ]
    }
  },
  "qnn-phase-1": {
    "id": "qnn-phase-1",
    "type": "prediction",
    "question": "An n-qubit quantum state lives in a Hilbert space of dimension 2^n. How does this compare to classical linear models?",
    "options": [
      "A classical model cannot represent non-linear data at all.",
      "A linear boundary in 2^n-dimensional quantum Hilbert space corresponds to a highly non-linear boundary in the original classical feature space.",
      "Quantum states only support 1D lines.",
      "Quantum state dimensions grow linearly with n."
    ],
    "correctIndex": 1,
    "hints": [
      "Think of the classical kernel trick (e.g. SVMs with RBF kernels).",
      "Mapping input x into a 2^n-dimensional state |Φ(x)⟩ allows linear hyperplanes to separate non-linear clusters."
    ],
    "explanation": "By embedding classical data into a 2^n-dimensional complex Hilbert space via a quantum feature map U_Φ(x), a simple linear measurement hyperplane can separate classes that were intricately tangled and non-linear in classical space.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "RY",
          "q": 0,
          "theta": 0.5
        },
        {
          "g": "RY",
          "q": 1,
          "theta": 1.2
        }
      ]
    }
  },
  "qnn-phase-2": {
    "id": "qnn-phase-2",
    "type": "gate-prediction",
    "question": "In single-qubit angle encoding, input feature x_0 ∈ [0, π] is encoded by applying an RY gate to |0⟩. If x_0 = π, what is the resulting state?",
    "initialState": "|0⟩",
    "gates": [
      {
        "g": "RY",
        "q": 0,
        "theta": 3.14159
      }
    ],
    "expectedState": "|1⟩",
    "options": [
      "State |0⟩",
      "State |1⟩",
      "State |+⟩",
      "State |-⟩"
    ],
    "correctIndex": 1,
    "hints": [
      "RY(θ) = [[cos(θ/2), -sin(θ/2)], [sin(θ/2), cos(θ/2)]].",
      "For θ = π: cos(π/2) = 0 and sin(π/2) = 1. Applying to [1, 0]^T gives [0, 1]^T = |1⟩."
    ],
    "explanation": "RY(θ)|0⟩ = cos(θ/2)|0⟩ + sin(θ/2)|1⟩. When θ = π, cos(π/2) = 0 and sin(π/2) = 1, rotating the qubit cleanly from |0⟩ to |1⟩. Thus x_0 = π is mapped directly to basis state |1⟩.",
    "circuit": {
      "qubits": 1,
      "gates": [
        {
          "g": "RY",
          "q": 0,
          "theta": 3.14159
        }
      ]
    }
  },
  "qnn-phase-3": {
    "id": "qnn-phase-3",
    "type": "circuit-analysis",
    "question": "What is the purpose of entangling CNOT gates in a parameterized quantum neural network ansatz?",
    "circuitSummary": "Parameterized single-qubit rotations followed by entangling CNOT gates.",
    "expectedObservation": "Entanglement enables correlations between different features that cannot be represented by independent single-qubit rotations.",
    "options": [
      "To reset all qubits to zero",
      "To create quantum entanglement and cross-feature correlations between qubits",
      "To increase classical clock speed",
      "To prevent measurement collapse"
    ],
    "correctIndex": 1,
    "hints": [
      "Without entangling gates, the quantum state is a simple tensor product of independent qubits: |ψ_1⟩ ⊗ |ψ_2⟩.",
      "CNOT creates non-local correlations that enable expressive decision boundaries."
    ],
    "explanation": "Single-qubit rotation gates act independently on individual features. Entangling gates (such as CNOT or CZ) create quantum correlations across multiple qubits, allowing the network to capture complex non-linear feature interactions.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "RY",
          "q": 0,
          "theta": 0.8
        },
        {
          "g": "RY",
          "q": 1,
          "theta": 1.4
        },
        {
          "g": "CNOT",
          "q": 0,
          "q2": 1
        }
      ]
    }
  },
  "qnn-phase-4": {
    "id": "qnn-phase-4",
    "type": "statevector",
    "question": "In a binary classification QNN, the model output is the expectation value y_pred = ⟨Z_0⟩ ∈ [-1, +1]. If measurement yields P(0) = 0.8 and P(1) = 0.2, what is y_pred?",
    "expression": "⟨Z⟩ = (+1)P(0) + (-1)P(1)",
    "answer": "+0.6",
    "options": [
      "+0.8",
      "+0.6",
      "+0.4",
      "-0.6"
    ],
    "correctIndex": 1,
    "hints": [
      "The Pauli Z operator has eigenvalues +1 for |0⟩ and -1 for |1⟩.",
      "Expectation = (+1)(0.8) + (-1)(0.2) = 0.8 - 0.2 = 0.6."
    ],
    "explanation": "⟨Z⟩ = ∑ λ_i P(i) = (+1)(0.8) + (-1)(0.2) = +0.6. Because y_pred > 0, the QNN assigns the input to Class 0 with confidence proportional to the magnitude 0.6.",
    "circuit": {
      "qubits": 1,
      "gates": [
        {
          "g": "RY",
          "q": 0,
          "theta": 0.927
        }
      ]
    }
  },
  "qnn-phase-5": {
    "id": "qnn-phase-5",
    "type": "multiple-choice",
    "question": "What is the Parameter-Shift Rule used to calculate analytical gradients on quantum hardware?",
    "options": [
      "∂⟨O⟩/∂θ = (⟨O⟩_{θ + π/2} - ⟨O⟩_{θ - π/2}) / 2",
      "∂⟨O⟩/∂θ = (⟨O⟩_{θ + 0.001} - ⟨O⟩_θ) / 0.001",
      "∂⟨O⟩/∂θ = ⟨O⟩²",
      "∂⟨O⟩/∂θ = 0 always"
    ],
    "correctIndex": 0,
    "hints": [
      "Standard finite-difference methods suffer from hardware shot noise when Δθ is small.",
      "The parameter-shift rule evaluates the circuit at macro shifts of ±π/2 to obtain the exact analytical derivative."
    ],
    "explanation": "For gates generated by Pauli operators (e.g. RX, RY, RZ), the exact mathematical gradient is ∂⟨O⟩/∂θ = (⟨O⟩_{θ+π/2} - ⟨O⟩_{θ-π/2}) / 2. This allows computing exact gradients on physical quantum processors without numerical approximation error.",
    "circuit": {
      "qubits": 1,
      "gates": [
        {
          "g": "RY",
          "q": 0,
          "theta": 1.0
        }
      ]
    }
  },
  "qnn-phase-6": {
    "id": "qnn-phase-6",
    "type": "prediction",
    "question": "What is the 'Barren Plateau' problem in variational quantum machine learning?",
    "options": [
      "The quantum hardware runs out of cryogenic coolant.",
      "The gradients of the cost function vanish exponentially with the number of qubits, making optimization via gradient descent impossible.",
      "The classical optimizer gets stuck in an infinite loop.",
      "Qubits lose entanglement instantaneously."
    ],
    "correctIndex": 1,
    "hints": [
      "In deep random quantum circuits, the state vectors disperse uniformly across the vast Hilbert space (Haar measure).",
      "The variance of the gradient shrinks as O(1/2^n)."
    ],
    "explanation": "McClean et al. (2018) proved that for deep, unstructured parameterized circuits, the variance of the gradient decays exponentially as Var[∂C/∂θ] ~ O(2^{-n}). On large systems, gradients become undetectable against shot noise, paralyzing training.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "H",
          "q": 1
        }
      ]
    }
  },
  "qnn-phase-7": {
    "id": "qnn-phase-7",
    "type": "circuit-analysis",
    "question": "To mitigate barren plateaus and improve QNN trainability, which architectural choice is recommended?",
    "circuitSummary": "Using problem-specific shallow ansätze, local observables, and identity-initialized parameters.",
    "expectedObservation": "Local cost functions have non-vanishing polynomial gradients.",
    "options": [
      "Use 500 completely random CNOT gates on all qubits.",
      "Use shallow layers, local observables (measuring single qubits instead of global operators), and symmetry-preserving ansätze.",
      "Do not use any gates at all.",
      "Measure all qubits simultaneously with global parity operators."
    ],
    "correctIndex": 1,
    "hints": [
      "Global cost functions (comparing across all 2^n states) always suffer from barren plateaus.",
      "Local cost functions evaluating single-qubit observables maintain non-vanishing gradients in shallow circuits."
    ],
    "explanation": "Cerezo et al. demonstrated that using local observables (such as single-qubit Z_i instead of global Z_1 ⊗ ... ⊗ Z_n) in combination with shallow circuit depths ensures polynomial gradient scaling, avoiding barren plateaus.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "RY",
          "q": 0,
          "theta": 0.5
        },
        {
          "g": "CNOT",
          "q": 0,
          "q2": 1
        }
      ]
    }
  },
  "qnn-phase-8": {
    "id": "qnn-phase-8",
    "type": "statevector",
    "question": "Given target label y = +1 and QNN prediction y_pred = +0.6, what is the Mean Squared Error (MSE) loss L = (y_pred - y)²?",
    "expression": "L = (0.6 - 1.0)² = (-0.4)²",
    "answer": "0.16",
    "options": [
      "0.40",
      "0.16",
      "0.04",
      "0.25"
    ],
    "correctIndex": 1,
    "hints": [
      "0.6 - 1.0 = -0.4.",
      "(-0.4)² = 0.16."
    ],
    "explanation": "The loss is L = (y_pred - y)² = (0.6 - 1.0)² = (-0.4)² = 0.16. The classical optimizer uses the parameter-shift gradient to update the ansatz angles θ to decrease this loss toward 0.",
    "circuit": {
      "qubits": 1,
      "gates": [
        {
          "g": "RY",
          "q": 0,
          "theta": 1.0
        }
      ]
    }
  },
  "qnn-phase-9": {
    "id": "qnn-phase-9",
    "type": "prediction",
    "question": "In hybrid classical-quantum training, what portion of the computation is executed on classical hardware versus quantum hardware?",
    "options": [
      "Classical: Statevector simulation; Quantum: Classical optimizer updates",
      "Quantum: Quantum state preparation and observable evaluation; Classical: Loss computation and parameter optimization updates",
      "Everything is run on quantum hardware; classical computers are not used",
      "Everything is run on classical hardware"
    ],
    "correctIndex": 1,
    "hints": [
      "Quantum processors act as specialized coprocessors (QPUs) evaluating difficult quantum expectations.",
      "Classical CPUs run the optimizer (e.g. Adam, SPSA) to update parameter vectors."
    ],
    "explanation": "In variational hybrid algorithms, the QPU prepares states U(θ)|0⟩ and samples expectation values. The classical CPU computes the loss function, calculates gradients via parameter-shift rules, and runs optimization updates.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "qnn-phase-10": {
    "id": "qnn-phase-10",
    "type": "code-completion",
    "question": "In Qiskit Machine Learning, which class evaluates quantum neural networks based on circuit observables?",
    "starterCode": "# from qiskit_machine_learning.neural_networks import EstimatorQNN",
    "expectedAnswer": "EstimatorQNN",
    "options": [
      "EstimatorQNN",
      "SamplerCNN",
      "QuantumPerceptron",
      "TensorQubit"
    ],
    "correctIndex": 0,
    "hints": [
      "Qiskit uses the Estimator primitive to compute expectation values.",
      "The neural network class built on top of the Estimator is named EstimatorQNN."
    ],
    "explanation": "`EstimatorQNN` from `qiskit_machine_learning.neural_networks` takes a parameterized quantum circuit and observable operators, providing forward and backward passes compatible with PyTorch.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "qnn-phase-11": {
    "id": "qnn-phase-11",
    "type": "multiple-choice",
    "question": "What is 'data re-uploading' in single-qubit and few-qubit Quantum Neural Networks?",
    "options": [
      "Reloading the dataset from a hard drive after every epoch",
      "Interleaving layers of data encoding gates U(x) with trainable processing layers W(θ) multiple times",
      "Backing up circuit parameters to cloud storage",
      "Copying quantum states using CNOT"
    ],
    "correctIndex": 1,
    "hints": [
      "Pérez-Salinas et al. (2020) proved a single qubit can approximate any continuous function if data is re-encoded repeatedly.",
      "Interleaving encoding U(x) and trainable W(θ) increases the Fourier frequency spectrum of the QNN."
    ],
    "explanation": "Data re-uploading alternates feature encoding gates U(x) and parameterized gates W(θ) across multiple layers. This allows even low-qubit quantum models to express high-frequency Fourier series and fit complex classification boundaries.",
    "circuit": {
      "qubits": 1,
      "gates": [
        {
          "g": "RY",
          "q": 0,
          "theta": 0.5
        },
        {
          "g": "RZ",
          "q": 0,
          "theta": 1.2
        },
        {
          "g": "RY",
          "q": 0,
          "theta": 0.5
        },
        {
          "g": "RZ",
          "q": 0,
          "theta": 0.8
        }
      ]
    }
  },
  "qnn-phase-12": {
    "id": "qnn-phase-12",
    "type": "prediction",
    "question": "When does a Quantum Neural Network demonstrate potential advantage over classical deep learning?",
    "options": [
      "On simple tabular business datasets with 10 features",
      "On quantum-native datasets, physical quantum simulations, and tasks possessing group-theoretic symmetries hard for classical kernels",
      "Only when the number of qubits exceeds 1,000,000",
      "QNNs always outperform classical deep learning on all datasets"
    ],
    "correctIndex": 1,
    "hints": [
      "Classical deep learning is highly optimized for images, text, and tabular data.",
      "Quantum models excel when calculating inner products in Hilbert spaces generated by discrete logarithms or quantum Hamiltonians."
    ],
    "explanation": "Provable quantum learning advantages arise when classifying data generated by quantum processes (e.g. quantum phase transitions, molecular spectra) or problems related to discrete logarithms and cryptographic group actions that are classically intractable.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "teleport-phase-1": {
    "id": "teleport-phase-1",
    "type": "prediction",
    "question": "Can quantum teleportation be used to transmit quantum information faster than the speed of light (superluminal communication)?",
    "options": [
      "Yes, because entanglement collapses instantaneously across any distance.",
      "No, because Bob cannot reconstruct the state until he receives 2 classical bits from Alice, which travel at or below light speed.",
      "Yes, provided vacuum fiber cables are used.",
      "No, because quantum states cannot exist across distances greater than 1 meter."
    ],
    "correctIndex": 1,
    "hints": [
      "Until Bob receives Alice's classical measurement bits, his reduced density matrix is the maximally mixed state I/2.",
      "Special relativity is strictly preserved by the requirement of classical communication."
    ],
    "explanation": "Although entanglement collapse is instantaneous, Bob's qubit is left in one of 4 scrambled states {I, X, Z, XZ}|ψ⟩. Bob has zero knowledge of which correction to apply until Alice transmits her 2 classical bits over a standard classical channel.",
    "circuit": {
      "qubits": 3,
      "gates": [
        {
          "g": "H",
          "q": 1
        },
        {
          "g": "CNOT",
          "q": 1,
          "q2": 2
        }
      ]
    }
  },
  "teleport-phase-2": {
    "id": "teleport-phase-2",
    "type": "gate-prediction",
    "question": "What gate sequence prepares the maximally entangled Bell state |Φ^+⟩ = (|00⟩ + |11⟩)/√2 on qubits 1 and 2?",
    "initialState": "|00⟩",
    "gates": [
      {
        "g": "H",
        "q": 1
      },
      {
        "g": "CNOT",
        "q": 1,
        "q2": 2
      }
    ],
    "expectedState": "(|00⟩ + |11⟩)/√2",
    "options": [
      "X on q1 then H on q2",
      "H on q1 followed by CNOT with control q1 and target q2",
      "H on both q1 and q2",
      "SWAP between q1 and q2"
    ],
    "correctIndex": 1,
    "hints": [
      "H on q1 creates (|0⟩ + |1⟩)/√2 on q1.",
      "CNOT copies the basis state of q1 into q2, transforming |00⟩ -> |00⟩ and |10⟩ -> |11⟩."
    ],
    "explanation": "Applying H to q1 transforms |00⟩ to (|00⟩ + |10⟩)/√2. The subsequent CNOT(1 -> 2) flips q2 whenever q1 is 1, creating the entangled Bell pair (|00⟩ + |11⟩)/√2.",
    "circuit": {
      "qubits": 3,
      "gates": [
        {
          "g": "H",
          "q": 1
        },
        {
          "g": "CNOT",
          "q": 1,
          "q2": 2
        }
      ]
    }
  },
  "teleport-phase-3": {
    "id": "teleport-phase-3",
    "type": "statevector",
    "question": "An unknown qubit |ψ⟩ = α|0⟩ + β|1⟩ is combined with the Bell pair (|00⟩ + |11⟩)/√2 on qubits 1 and 2. What is the total 3-qubit statevector before any operations?",
    "expression": "|\\Psi_0⟩ = (\\alpha|0⟩ + \\beta|1⟩) \\otimes \\frac{|00⟩ + |11⟩}{\\sqrt{2}}",
    "answer": "1/√2 [α|000⟩ + α|011⟩ + β|100⟩ + β|111⟩]",
    "options": [
      "1/√2 [α|000⟩ + α|011⟩ + β|100⟩ + β|111⟩]",
      "α|000⟩ + β|111⟩",
      "1/2 [|000⟩ + |111⟩]",
      "αβ |010⟩"
    ],
    "correctIndex": 0,
    "hints": [
      "Distribute (α|0⟩ + β|1⟩) across (|00⟩ + |11⟩)/√2.",
      "α|0⟩(|00⟩ + |11⟩) = α|000⟩ + α|011⟩. β|1⟩(|00⟩ + |11⟩) = β|100⟩ + β|111⟩."
    ],
    "explanation": "Tensor product expansion yields |Ψ_0⟩ = 1/√2 [α|000⟩ + α|011⟩ + β|100⟩ + β|111⟩]. The first qubit belongs to the state to be teleported, the second belongs to Alice, and the third belongs to Bob.",
    "circuit": {
      "qubits": 3,
      "gates": [
        {
          "g": "H",
          "q": 1
        },
        {
          "g": "CNOT",
          "q": 1,
          "q2": 2
        }
      ]
    }
  },
  "teleport-phase-4": {
    "id": "teleport-phase-4",
    "type": "circuit-analysis",
    "question": "What two gates does Alice apply to her two qubits (q0 and q1) to perform a Bell-basis measurement?",
    "circuitSummary": "CNOT from q0 to q1, followed by H on q0.",
    "expectedObservation": "Maps the 4 Bell states onto the 4 computational basis states.",
    "options": [
      "SWAP between q0 and q1, followed by Z",
      "CNOT with control q0 and target q1, followed by Hadamard on q0",
      "H on both q0 and q1",
      "X on q0 and Z on q1"
    ],
    "correctIndex": 1,
    "hints": [
      "To measure in the Bell basis, invert the Bell state preparation circuit.",
      "Bell prep is H then CNOT; reverse is CNOT then H."
    ],
    "explanation": "Because Bell states are prepared via H then CNOT, measuring in the Bell basis requires applying the adjoint: CNOT(0 -> 1) followed by H on q0. This rotates the 4 entangled Bell states into the 4 standard computational basis states.",
    "circuit": {
      "qubits": 3,
      "gates": [
        {
          "g": "H",
          "q": 1
        },
        {
          "g": "CNOT",
          "q": 1,
          "q2": 2
        },
        {
          "g": "CNOT",
          "q": 0,
          "q2": 1
        },
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "teleport-phase-5": {
    "id": "teleport-phase-5",
    "type": "prediction",
    "question": "After Alice's CNOT and H gates, what are the 4 possible measurement bitstrings Alice can observe on qubits q0 and q1?",
    "options": [
      "Only '00'",
      "'00', '01', '10', and '11', each with equal 25% probability",
      "Only '00' and '11'",
      "'01' and '10' only"
    ],
    "correctIndex": 1,
    "hints": [
      "The 4 Bell states are orthonormal and equally weighted.",
      "Each outcome occurs with probability 1/4 = 25% regardless of the values of α and β."
    ],
    "explanation": "Alice's measurement yields one of 4 outcomes: '00', '01', '10', or '11', each occurring with probability 1/4 = 25%. Alice's measurement result is completely random and contains zero information about α or β.",
    "circuit": {
      "qubits": 3,
      "gates": [
        {
          "g": "H",
          "q": 1
        },
        {
          "g": "CNOT",
          "q": 1,
          "q2": 2
        },
        {
          "g": "CNOT",
          "q": 0,
          "q2": 1
        },
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "teleport-phase-6": {
    "id": "teleport-phase-6",
    "type": "statevector",
    "question": "If Alice measures outcome '00' on qubits q0 and q1, what is the state of Bob's qubit q2?",
    "expression": "|\\psi_B⟩ = \\alpha|0⟩ + \\beta|1⟩",
    "answer": "α|0⟩ + β|1⟩ (Identical to original |ψ⟩ without any correction needed)",
    "options": [
      "α|0⟩ + β|1⟩",
      "α|1⟩ + β|0⟩",
      "α|0⟩ - β|1⟩",
      "|0⟩"
    ],
    "correctIndex": 0,
    "hints": [
      "When m_0 = 0 and m_1 = 0, Bob's state has no Pauli errors.",
      "Identity operator I applied: |ψ_B⟩ = I|ψ⟩."
    ],
    "explanation": "When Alice measures '00', Bob's qubit is projected into α|0⟩ + β|1⟩. Bob needs to apply no correction (or the Identity gate I), and his qubit immediately matches Alice's original state |ψ⟩.",
    "circuit": {
      "qubits": 3,
      "gates": [
        {
          "g": "H",
          "q": 1
        },
        {
          "g": "CNOT",
          "q": 1,
          "q2": 2
        },
        {
          "g": "CNOT",
          "q": 0,
          "q2": 1
        },
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "teleport-phase-7": {
    "id": "teleport-phase-7",
    "type": "multiple-choice",
    "question": "If Alice measures outcome '01' (q0=0, q1=1), Bob's qubit is α|1⟩ + β|0⟩. Which single quantum gate must Bob apply to restore |ψ⟩ = α|0⟩ + β|1⟩?",
    "options": [
      "Gate Z",
      "Gate X",
      "Gate H",
      "Gate Y"
    ],
    "correctIndex": 1,
    "hints": [
      "Bob needs to swap the amplitudes of |0⟩ and |1⟩.",
      "X|1⟩ = |0⟩ and X|0⟩ = |1⟩."
    ],
    "explanation": "Because Bob holds α|1⟩ + β|0⟩, applying the Pauli X (bit-flip) gate maps |1⟩ -> |0⟩ and |0⟩ -> |1⟩, successfully reconstructing the target state α|0⟩ + β|1⟩.",
    "circuit": {
      "qubits": 3,
      "gates": [
        {
          "g": "H",
          "q": 1
        },
        {
          "g": "CNOT",
          "q": 1,
          "q2": 2
        },
        {
          "g": "CNOT",
          "q": 0,
          "q2": 1
        },
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "X",
          "q": 2
        }
      ]
    }
  },
  "teleport-phase-8": {
    "id": "teleport-phase-8",
    "type": "multiple-choice",
    "question": "If Alice measures outcome '10' (q0=1, q1=0), Bob's qubit is α|0⟩ - β|1⟩. Which quantum gate must Bob apply to restore |ψ⟩?",
    "options": [
      "Gate X",
      "Gate Z",
      "Gate H",
      "Gate S"
    ],
    "correctIndex": 1,
    "hints": [
      "Bob's state has a phase error on |1⟩.",
      "Z|0⟩ = |0⟩ and Z|1⟩ = -|1⟩, which inverts the negative sign."
    ],
    "explanation": "Bob holds α|0⟩ - β|1⟩. Applying the Pauli Z (phase-flip) gate leaves |0⟩ unchanged and multiplies |1⟩ by -1: Z(α|0⟩ - β|1⟩) = α|0⟩ - β(-|1⟩) = α|0⟩ + β|1⟩.",
    "circuit": {
      "qubits": 3,
      "gates": [
        {
          "g": "H",
          "q": 1
        },
        {
          "g": "CNOT",
          "q": 1,
          "q2": 2
        },
        {
          "g": "CNOT",
          "q": 0,
          "q2": 1
        },
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "Z",
          "q": 2
        }
      ]
    }
  },
  "teleport-phase-9": {
    "id": "teleport-phase-9",
    "type": "circuit-analysis",
    "question": "If Alice measures outcome '11' (q0=1, q1=1), Bob's qubit is in state α|1⟩ - β|0⟩. Which gates must Bob apply?",
    "circuitSummary": "Both X and Z gates applied to Bob's qubit: X then Z (or Z then X).",
    "expectedObservation": "Bit flip fixes amplitudes, phase flip fixes sign.",
    "options": [
      "Only X",
      "Only Z",
      "Apply X then Z (or Z then X with phase adjustment)",
      "Do nothing"
    ],
    "correctIndex": 2,
    "hints": [
      "Both a bit flip (q1=1) and a phase flip (q0=1) have occurred.",
      "Applying X transforms α|1⟩ - β|0⟩ to α|0⟩ - β|1⟩. Then applying Z yields α|0⟩ + β|1⟩."
    ],
    "explanation": "Outcome '11' indicates both bit-flip and phase-flip errors. Applying gate X swaps the basis states to α|0⟩ - β|1⟩, and subsequent application of gate Z fixes the sign, completing the recovery: Z X (α|1⟩ - β|0⟩) = α|0⟩ + β|1⟩.",
    "circuit": {
      "qubits": 3,
      "gates": [
        {
          "g": "H",
          "q": 1
        },
        {
          "g": "CNOT",
          "q": 1,
          "q2": 2
        },
        {
          "g": "CNOT",
          "q": 0,
          "q2": 1
        },
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "X",
          "q": 2
        },
        {
          "g": "Z",
          "q": 2
        }
      ]
    }
  },
  "teleport-phase-10": {
    "id": "teleport-phase-10",
    "type": "prediction",
    "question": "What happened to Alice's original qubit state |ψ⟩ during the teleportation protocol?",
    "options": [
      "It was copied, so both Alice and Bob now possess identical copies of |ψ⟩.",
      "It was destroyed upon Alice's Bell-basis measurement, satisfying the No-Cloning Theorem.",
      "It was transformed into light energy and vanished.",
      "It traveled backward in time."
    ],
    "correctIndex": 1,
    "hints": [
      "The No-Cloning Theorem forbids creating two copies of an arbitrary unknown quantum state.",
      "Teleportation is a state transfer, not duplication."
    ],
    "explanation": "Alice's Bell-basis measurement irreversibly projects and collapses her original qubit into a random classical state. The state |ψ⟩ ceases to exist at Alice's location before reappearing at Bob's location, perfectly honoring the No-Cloning Theorem.",
    "circuit": {
      "qubits": 3,
      "gates": [
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "teleport-phase-11": {
    "id": "teleport-phase-11",
    "type": "code-completion",
    "question": "In Qiskit, how are conditional corrections implemented based on classical register bits `c0` and `c1`?",
    "starterCode": "# qc.x(2).c_if(c1, 1)\n# qc.z(2).c_if(c0, 1)",
    "expectedAnswer": "c_if",
    "options": [
      "c_if",
      "if_classical",
      "apply_when",
      "conditional_gate"
    ],
    "correctIndex": 0,
    "hints": [
      "Qiskit Circuit instructions support the `.c_if(classical_register, value)` method.",
      "It applies the gate only if the classical register holds the specified integer."
    ],
    "explanation": "In Qiskit, classical feed-forward corrections are executed using `.c_if()`, such as `qc.x(2).c_if(c1, 1)` and `qc.z(2).c_if(c0, 1)`, executing dynamic circuit operations conditioned on mid-circuit measurement.",
    "circuit": {
      "qubits": 3,
      "gates": [
        {
          "g": "H",
          "q": 1
        }
      ]
    }
  },
  "teleport-phase-12": {
    "id": "teleport-phase-12",
    "type": "prediction",
    "question": "Why is quantum teleportation a foundational building block for quantum repeaters and distributed quantum computing?",
    "options": [
      "It allows teleporting heavy physical atoms across continents.",
      "It allows transferring quantum states between distant quantum processors without physical photons traversing lossy optical fiber directly (entanglement swapping).",
      "It eliminates the need for quantum error correction.",
      "It increases classical internet bandwidth."
    ],
    "correctIndex": 1,
    "hints": [
      "Photons traveling through optical fibers suffer exponential attenuation over 100+ km.",
      "Teleportation combined with entanglement purification allows extending entanglement indefinitely across repeater nodes."
    ],
    "explanation": "Optical fibers absorb photons exponentially over distance. By establishing entangled pairs across intermediate repeater segments and performing entanglement swapping (teleportation of entanglement), quantum states can be transmitted across global distances without photon loss.",
    "circuit": {
      "qubits": 3,
      "gates": [
        {
          "g": "H",
          "q": 1
        },
        {
          "g": "CNOT",
          "q": 1,
          "q2": 2
        }
      ]
    }
  },
  "qft-phase-1": {
    "id": "qft-phase-1",
    "type": "prediction",
    "question": "What is the computational complexity of the classical Fast Fourier Transform (FFT) on N = 2^n elements compared to the Quantum Fourier Transform (QFT)?",
    "options": [
      "Classical FFT: O(N log N) = O(n 2^n) operations; QFT: O(n²) quantum gates",
      "Classical FFT: O(1); QFT: O(N²)",
      "Classical FFT: O(n²); QFT: O(2^n)",
      "Both algorithms require O(N log N) operations"
    ],
    "correctIndex": 0,
    "hints": [
      "N is the dimension of the statevector: N = 2^n.",
      "Classical FFT requires O(N log N) = O(2^n · n). QFT requires only O(n²) gates, which is exponentially fewer operations."
    ],
    "explanation": "Classical FFT requires O(N log N) = O(n 2^n) arithmetic operations. The Quantum Fourier Transform performs the exact discrete Fourier transform on amplitudes in only O(n²) quantum gates, representing an exponential speedup in circuit complexity.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "qft-phase-2": {
    "id": "qft-phase-2",
    "type": "statevector",
    "question": "For a single qubit (n=1, N=2), what is the action of the QFT on the computational basis state |j⟩?",
    "expression": "QFT |j⟩ = 1/√2 (|0⟩ + e^{2πi j / 2} |1⟩) = 1/√2 (|0⟩ + (-1)^j |1⟩)",
    "answer": "Identical to the single-qubit Hadamard gate H",
    "options": [
      "Pauli X gate",
      "Hadamard gate H",
      "Pauli Z gate",
      "Phase gate S"
    ],
    "correctIndex": 1,
    "hints": [
      "When j=0: 1/√2 (|0⟩ + |1⟩) = |+⟩.",
      "When j=1: 1/√2 (|0⟩ - |1⟩) = |-⟩. This is the exact definition of H."
    ],
    "explanation": "For a 1-qubit system, QFT |0⟩ = (|0⟩ + |1⟩)/√2 and QFT |1⟩ = (|0⟩ - |1⟩)/√2. This matches the single-qubit Hadamard operator H = 1/√2 [[1, 1], [1, -1]] exactly.",
    "circuit": {
      "qubits": 1,
      "gates": [
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "qft-phase-3": {
    "id": "qft-phase-3",
    "type": "multiple-choice",
    "question": "What is the unitary matrix representation of the phase rotation gate R_k used in the QFT circuit?",
    "options": [
      "R_k = diag(1, e^{2πi / 2^k})",
      "R_k = diag(1, -1)",
      "R_k = [[0, 1], [1, 0]]",
      "R_k = diag(e^{iθ}, e^{-iθ})"
    ],
    "correctIndex": 0,
    "hints": [
      "R_k applies a phase shift proportional to 2π / 2^k to state |1⟩.",
      "For k=2, e^{2πi/4} = e^{iπ/2} = i, which is the S gate."
    ],
    "explanation": "The controlled rotation gate R_k is defined as diag(1, e^{2πi / 2^k}). For k=1 it is Z (phase π), for k=2 it is S (phase π/2), and for k=3 it is T (phase π/4).",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "RZ",
          "q": 1,
          "theta": 1.57
        }
      ]
    }
  },
  "qft-phase-4": {
    "id": "qft-phase-4",
    "type": "circuit-analysis",
    "question": "In a 2-qubit QFT circuit, what is the sequence of gates applied to qubit 0 and qubit 1 before the final SWAP gate?",
    "circuitSummary": "H on q0 -> Controlled-R2(q1 -> q0) -> H on q1.",
    "expectedObservation": "Creates the product state with binary fraction phases.",
    "options": [
      "CNOT(0->1) then H on both",
      "H on q0, Controlled-R2(q1 -> q0), then H on q1",
      "X on q0, Z on q1",
      "H on q1, then SWAP"
    ],
    "correctIndex": 1,
    "hints": [
      "The top qubit q0 receives a Hadamard, then a controlled phase shift from the second qubit q1.",
      "Qubit q1 then receives its own Hadamard gate."
    ],
    "explanation": "The 2-qubit QFT applies H to the most significant qubit q0, followed by a controlled-R_2 (controlled-S) rotation from q1 onto q0, followed by H on q1. Finally, a SWAP gate reverses the wire order to match standard binary endianness.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "RZ",
          "q": 0,
          "theta": 1.57
        },
        {
          "g": "H",
          "q": 1
        },
        {
          "g": "SWAP",
          "q": 0,
          "q2": 1
        }
      ]
    }
  },
  "qft-phase-5": {
    "id": "qft-phase-5",
    "type": "prediction",
    "question": "Why is a SWAP gate network necessary at the end of the standard QFT circuit?",
    "options": [
      "Because the qubits lose coherence if they are not swapped.",
      "Because the recursive QFT circuit naturally produces the output qubits in reversed order relative to standard binary indexing.",
      "To erase error states.",
      "Because physical quantum hardware requires odd qubit indices."
    ],
    "correctIndex": 1,
    "hints": [
      "The first qubit q0 receives phase shifts corresponding to the least significant bits.",
      "SWAP gates reverse the order: qubit j is swapped with qubit n-1-j."
    ],
    "explanation": "The mathematical factorization of QFT naturally outputs the binary expansion in reverse order: bit j emerges on wire n-1-j. Applying ⌊n/2⌋ SWAP gates restores the canonical most-to-least significant bit ordering.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "SWAP",
          "q": 0,
          "q2": 1
        }
      ]
    }
  },
  "qft-phase-6": {
    "id": "qft-phase-6",
    "type": "statevector",
    "question": "In a 2-qubit QFT (N=4), applying QFT to state |00⟩ (j=0) produces what statevector?",
    "expression": "QFT |00⟩ = 1/2 \\sum_{k=0}^3 e^{2\\pi i (0)(k) / 4} |k⟩ = 1/2 (|00⟩ + |01⟩ + |10⟩ + |11⟩)",
    "answer": "1/2 (|00⟩ + |01⟩ + |10⟩ + |11⟩)",
    "options": [
      "|00⟩",
      "1/2 (|00⟩ + |01⟩ + |10⟩ + |11⟩) (Equal superposition with 0 phase)",
      "1/2 (|00⟩ - |01⟩ + |10⟩ - |11⟩)",
      "|11⟩"
    ],
    "correctIndex": 1,
    "hints": [
      "When j=0, e^{2πi(0)k/N} = e^0 = 1 for all k.",
      "Every amplitude is 1/√4 = 1/2 with phase angle 0."
    ],
    "explanation": "When transforming |00⟩, the frequency j=0 has no phase modulation. All terms have phase e^0 = 1, producing a uniform equal superposition with amplitude 1/2 across all 4 computational basis states.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "H",
          "q": 1
        }
      ]
    }
  },
  "qft-phase-7": {
    "id": "qft-phase-7",
    "type": "multiple-choice",
    "question": "How is the Inverse Quantum Fourier Transform (QFT†) synthesized from the forward QFT circuit?",
    "options": [
      "By taking the square of all matrices.",
      "By running the QFT circuit gates in reverse order and negating all controlled phase rotation angles (R_k -> R_k^†).",
      "By replacing all Hadamards with X gates.",
      "By resetting the register."
    ],
    "correctIndex": 1,
    "hints": [
      "For any unitary U = G_1 G_2 ... G_m, the adjoint is U^† = G_m^† ... G_2^† G_1^†.",
      "H is Hermitian (H^† = H), while R_k^† has angle -2π / 2^k."
    ],
    "explanation": "Because U is unitary, U^† is formed by inverting the gate order and taking the Hermitian conjugate of each gate. The SWAP gates are executed first, followed by Hadamards and controlled phase rotations with inverted angles -2π/2^k.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "SWAP",
          "q": 0,
          "q2": 1
        },
        {
          "g": "H",
          "q": 1
        },
        {
          "g": "RZ",
          "q": 0,
          "theta": -1.57
        },
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "qft-phase-8": {
    "id": "qft-phase-8",
    "type": "prediction",
    "question": "If an input register contains a periodic state with period r = 2 in a 4-state system: |ψ⟩ = (|00⟩ + |10⟩)/√2, what state does QFT produce?",
    "options": [
      "A periodic state with period 4",
      "A frequency spike at k = N/r = 4/2 = 2 (|10⟩) and k=0 (|00⟩)",
      "The state collapses to white noise",
      "|11⟩ with 100% probability"
    ],
    "correctIndex": 1,
    "hints": [
      "Fourier transforms convert time/spatial periodicity into sharp frequency domain peaks.",
      "The peaks occur at multiples of N/r = 4/2 = 2."
    ],
    "explanation": "The QFT acts as a frequency analyzer. A state with period r=2 produces constructive interference exclusively at frequency indices k that are integer multiples of N/r (namely k=0 and k=2). Measuring reveals the period!",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 1
        }
      ]
    }
  },
  "qft-phase-9": {
    "id": "qft-phase-9",
    "type": "code-completion",
    "question": "In Qiskit, which built-in class provides an n-qubit QFT circuit with optional SWAP and inverse flags?",
    "starterCode": "# from qiskit.circuit.library import QFT\n# qft_circ = QFT(num_qubits=3, inverse=False)",
    "expectedAnswer": "QFT",
    "options": [
      "QFT",
      "FourierTransformGate",
      "SpectralAnalyzer",
      "PhaseEstimator"
    ],
    "correctIndex": 0,
    "hints": [
      "The class in `qiskit.circuit.library` has the exact acronym of the algorithm.",
      "It takes `num_qubits`, `inverse`, and `do_swaps` as arguments."
    ],
    "explanation": "Qiskit's `qiskit.circuit.library.QFT` constructs the complete n-qubit QFT circuit, handling all recursive controlled-phase rotations and SWAP networks automatically.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "qft-phase-10": {
    "id": "qft-phase-10",
    "type": "multiple-choice",
    "question": "Why can't a classical user read out all 2^n Fourier coefficients of a QFT state directly in polynomial time?",
    "options": [
      "Because the coefficients are stored on quantum amplitudes; measuring the system yields only a single classical bitstring according to the Born rule probability.",
      "Because classical computers lack USB quantum ports.",
      "Because the coefficients are complex numbers.",
      "Because QFT destroys the quantum processor."
    ],
    "correctIndex": 0,
    "hints": [
      "A quantum statevector carries 2^n amplitudes, but measurement collapses the superposition.",
      "To reconstruct all 2^n amplitudes would require exponential repetitions (quantum tomography)."
    ],
    "explanation": "Although QFT transforms all 2^n amplitudes simultaneously in O(n²) gates, projective measurement yields only one basis state with probability |c_k|². QFT is useful when interference concentrates amplitude into a specific answer (like period finding in Shor).",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "qft-phase-11": {
    "id": "qft-phase-11",
    "type": "circuit-analysis",
    "question": "In Quantum Phase Estimation (QPE), where is the Inverse QFT (QFT†) applied?",
    "circuitSummary": "After controlled unitary powers U^{2^j} act on the eigenstate, QFT† is applied to the clock/counting register.",
    "expectedObservation": "Translates the phase kickback register into the binary representation of the phase θ.",
    "options": [
      "At the very beginning on the target register",
      "At the end of the counting/clock register, translating phase information into measurable computational basis states",
      "Inside the oracle",
      "QFT† is never used in QPE"
    ],
    "correctIndex": 1,
    "hints": [
      "Controlled-U gates encode eigenvalue phase information into the relative phases of the counting qubits.",
      "QFT† converts phase differences into computational basis amplitudes."
    ],
    "explanation": "Quantum Phase Estimation uses controlled-U operations to write the phase φ into the relative phases of the clock register: 1/√N ∑ e^{2πi φ k}|k⟩. Applying QFT† decodes this phase into basis state |2^n φ⟩, allowing direct measurement of the eigenvalue.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "H",
          "q": 1
        }
      ]
    }
  },
  "qft-phase-12": {
    "id": "qft-phase-12",
    "type": "prediction",
    "question": "Which major quantum algorithms directly rely on the Quantum Fourier Transform as their core computational engine?",
    "options": [
      "Only BB84",
      "Shor's algorithm, Quantum Phase Estimation, and HHL (Quantum Linear Systems)",
      "Only classical sorting algorithms",
      "None; QFT is purely theoretical"
    ],
    "correctIndex": 1,
    "hints": [
      "Any algorithm that solves period-finding, discrete logarithms, or eigenvalue estimation uses QFT.",
      "Shor's factoring algorithm and HHL rely fundamentally on QPE/QFT."
    ],
    "explanation": "QFT is the central mathematical engine of Shor's factoring algorithm, Quantum Phase Estimation, Kitaev's algorithm, and Hamiltonian simulation in HHL. It is the cornerstone of exponential quantum speedups.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "simon-phase-1": {
    "id": "simon-phase-1",
    "type": "prediction",
    "question": "In Simon's problem, the function f: {0,1}^n -> {0,1}^n is promised to satisfy f(x) = f(y) iff x ⊕ y ∈ {0^n, s}. What is the secret string s?",
    "options": [
      "An encryption key used by Eve",
      "A hidden non-zero n-bit period such that f(x) = f(x ⊕ s) for all inputs x",
      "The sum of all inputs",
      "A random prime number"
    ],
    "correctIndex": 1,
    "hints": [
      "The function is two-to-one with a hidden period s.",
      "x ⊕ s ⊕ s = x, so every output is paired with exactly two inputs: x and x ⊕ s."
    ],
    "explanation": "Simon's problem guarantees that f is a 2-to-1 function where each output value is produced by exactly two inputs separated by a hidden bitwise XOR period s: f(x) = f(x ⊕ s). If s = 0^n, the function is 1-to-1.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "simon-phase-2": {
    "id": "simon-phase-2",
    "type": "multiple-choice",
    "question": "By the classical Birthday Paradox, how many classical queries are required to find a collision f(x) = f(y) and uncover secret s with high probability?",
    "options": [
      "O(n) queries",
      "O(2^{n/2}) queries",
      "O(1) queries",
      "O(n²)"
    ],
    "correctIndex": 1,
    "hints": [
      "Finding collisions among N = 2^n items classically scales as the square root of the domain: √N.",
      "√(2^n) = 2^{n/2}."
    ],
    "explanation": "Classically, finding two inputs with the same output requires searching for a collision. By the birthday paradox, this requires Ω(2^{n/2}) function evaluations, which grows exponentially with input size n.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "simon-phase-3": {
    "id": "simon-phase-3",
    "type": "statevector",
    "question": "In Simon's algorithm, you prepare two n-qubit registers in state |0⟩^⊗n |0⟩^⊗n and apply H^⊗n to the input register. What state is created?",
    "expression": "|\\psi_1⟩ = 1/\\sqrt{2^n} \\sum_{x \\in \\{0,1\\}^n} |x⟩|0^n⟩",
    "answer": "Equal superposition over all 2^n inputs in the first register with ancilla at |0^n⟩",
    "options": [
      "Equal superposition of all inputs: 1/√2^n ∑_x |x⟩|0^n⟩",
      "Bell state (|00⟩ + |11⟩)/√2",
      "All-ones state |11...1⟩",
      "A random bitstring"
    ],
    "correctIndex": 0,
    "hints": [
      "H^⊗n applied to |0^n⟩ creates equal superposition of all 2^n n-bit strings.",
      "The ancilla register has no gates applied yet and remains |0^n⟩."
    ],
    "explanation": "Applying H^⊗n to the first register creates an equal superposition of all 2^n computational basis states with amplitude 1/√2^n each, while the second register remains in the ground state |0^n⟩.",
    "circuit": {
      "qubits": 4,
      "gates": [
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "H",
          "q": 1
        }
      ]
    }
  },
  "simon-phase-4": {
    "id": "simon-phase-4",
    "type": "circuit-analysis",
    "question": "After querying the oracle U_f |x⟩|0⟩ = |x⟩|f(x)⟩, what is the entangled state of the two registers?",
    "circuitSummary": "Input register superposed, ancilla register entangled with f(x).",
    "expectedObservation": "State is 1/√2^n ∑_x |x⟩|f(x)⟩.",
    "options": [
      "1/√2^n ∑_x |x⟩|0^n⟩",
      "1/√2^n ∑_x |x⟩|f(x)⟩",
      "|s⟩|s⟩",
      "|00...0⟩"
    ],
    "correctIndex": 1,
    "hints": [
      "The oracle computes f(x) into the second register for each branch of the superposition.",
      "Each input |x⟩ is entangled with its function output |f(x)⟩."
    ],
    "explanation": "Evaluating the oracle on the superposition entangles the two registers: |Ψ_2⟩ = 1/√2^n ∑_x |x⟩|f(x)⟩. Because f is 2-to-1, each distinct output f(x_0) appears in exactly two terms: |x_0⟩|f(x_0)⟩ and |x_0 ⊕ s⟩|f(x_0)⟩.",
    "circuit": {
      "qubits": 4,
      "gates": [
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "H",
          "q": 1
        },
        {
          "g": "CNOT",
          "q": 0,
          "q2": 2
        },
        {
          "g": "CNOT",
          "q": 1,
          "q2": 3
        }
      ]
    }
  },
  "simon-phase-5": {
    "id": "simon-phase-5",
    "type": "prediction",
    "question": "If you measure the second (ancilla) register and observe a specific value f(x_0), what state is the first (input) register projected into?",
    "options": [
      "|0^n⟩",
      "(|x_0⟩ + |x_0 ⊕ s⟩) / √2",
      "The single state |x_0⟩",
      "The secret string |s⟩"
    ],
    "correctIndex": 1,
    "hints": [
      "Only two inputs produce output f(x_0): x_0 and x_0 ⊕ s.",
      "Measuring the output collapses the input register to the superposition of those two inputs."
    ],
    "explanation": "Because f(x_0) = f(x_0 ⊕ s), measuring the ancilla collapses the input register into an equal superposition of the two pre-images: (|x_0⟩ + |x_0 ⊕ s⟩)/√2.",
    "circuit": {
      "qubits": 4,
      "gates": [
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "H",
          "q": 1
        }
      ]
    }
  },
  "simon-phase-6": {
    "id": "simon-phase-6",
    "type": "statevector",
    "question": "Applying H^⊗n to the collapsed state (|x_0⟩ + |x_0 ⊕ s⟩)/√2 yields what amplitude for any basis state |y⟩?",
    "expression": "⟨y | \\psi_3⟩ = \\frac{1}{2^{(n+1)/2}} [(-1)^{x_0 \\cdot y} + (-1)^{(x_0 \\oplus s) \\cdot y}]",
    "answer": "Non-zero if and only if y · s = 0 (mod 2)",
    "options": [
      "Zero if y · s = 1 (mod 2); Non-zero if y · s = 0 (mod 2)",
      "1.0 for all y",
      "Zero for all y",
      "Non-zero only when y = s"
    ],
    "correctIndex": 0,
    "hints": [
      "Notice (-1)^{(x_0 ⊕ s) · y} = (-1)^{x_0 · y} (-1)^{s · y}.",
      "Factoring out (-1)^{x_0 · y} leaves [1 + (-1)^{s · y}]. If s · y = 1, this cancels to 0!"
    ],
    "explanation": "The amplitude is proportional to [1 + (-1)^{y · s}]. If y · s = 1 (mod 2), the two terms destructively interfere to 1 + (-1) = 0! Destructive interference completely eliminates all bitstrings y that do not satisfy the orthogonality condition y · s = 0 (mod 2).",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "H",
          "q": 1
        }
      ]
    }
  },
  "simon-phase-7": {
    "id": "simon-phase-7",
    "type": "multiple-choice",
    "question": "What fundamental mathematical constraint is satisfied by every bitstring y measured at the end of Simon's algorithm?",
    "options": [
      "y = s",
      "y · s = 0 (mod 2) (The bitwise inner product mod 2 is zero)",
      "y · s = 1 (mod 2)",
      "y + s = 2^n"
    ],
    "correctIndex": 1,
    "hints": [
      "y · s = (y_0 s_0 ⊕ y_1 s_1 ⊕ ... ⊕ y_{n-1} s_{n-1}) mod 2.",
      "Only vectors orthogonal to s survive interference."
    ],
    "explanation": "Every measured bitstring y provides a linear constraint y · s = 0 (mod 2) over the finite field GF(2). By repeating the quantum circuit, we collect multiple linearly independent vectors y.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "simon-phase-8": {
    "id": "simon-phase-8",
    "type": "circuit-analysis",
    "question": "Suppose n = 2 and measuring Simon's circuit yields bitstring y = '11'. What does the equation y · s = 0 (mod 2) reveal about secret s = s_0 s_1?",
    "circuitSummary": "Constraint: 1·s_0 ⊕ 1·s_1 = 0 (mod 2).",
    "expectedObservation": "s_0 = s_1, meaning s must be '11' (since s is non-zero).",
    "options": [
      "s_0 = 0 and s_1 = 1",
      "s_0 ⊕ s_1 = 0 (meaning s_0 = s_1, so s must be '11')",
      "s must be '00'",
      "s is unconstrained"
    ],
    "correctIndex": 1,
    "hints": [
      "y · s = (1 · s_0 + 1 · s_1) mod 2 = s_0 ⊕ s_1 = 0.",
      "This implies s_0 = s_1. Since s ≠ '00', the only non-zero solution is s = '11'."
    ],
    "explanation": "The linear equation is s_0 ⊕ s_1 = 0, which means s_0 = s_1. Because Simon's problem assumes s ≠ 00, the secret period is uniquely determined to be s = '11'.",
    "circuit": {
      "qubits": 4,
      "gates": [
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "H",
          "q": 1
        },
        {
          "g": "CNOT",
          "q": 0,
          "q2": 2
        },
        {
          "g": "CNOT",
          "q": 0,
          "q2": 3
        },
        {
          "g": "CNOT",
          "q": 1,
          "q2": 2
        },
        {
          "g": "CNOT",
          "q": 1,
          "q2": 3
        },
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "H",
          "q": 1
        }
      ]
    }
  },
  "simon-phase-9": {
    "id": "simon-phase-9",
    "type": "prediction",
    "question": "How many linearly independent equation vectors y must a classical computer collect to solve for the secret string s of length n?",
    "options": [
      "2^n equations",
      "n - 1 linearly independent equations",
      "1 equation",
      "n² equations"
    ],
    "correctIndex": 1,
    "hints": [
      "In an n-dimensional vector space over GF(2), a subspace orthogonal to a 1D line has dimension n-1.",
      "Once n-1 linearly independent equations are found, s is the unique non-trivial null space vector."
    ],
    "explanation": "Because s is an n-bit string, n - 1 linearly independent equations y^(k) · s = 0 (mod 2) constrain s to a 1-dimensional subspace containing only {0^n, s}. Since s ≠ 0^n, this uniquely identifies s.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "simon-phase-10": {
    "id": "simon-phase-10",
    "type": "multiple-choice",
    "question": "Which classical algorithm solves the system of linear equations y^(k) · s = 0 (mod 2) in O(n³) classical steps?",
    "options": [
      "Dijkstra's shortest path algorithm",
      "Gaussian elimination over the finite field GF(2)",
      "Gradient descent",
      "K-Means clustering"
    ],
    "correctIndex": 1,
    "hints": [
      "The system is a standard linear system M s = 0 over modulo 2 arithmetic.",
      "Gaussian elimination row reduction using XOR operations solves it in O(n³) steps."
    ],
    "explanation": "Gaussian elimination over GF(2) (where addition is XOR and multiplication is AND) efficiently reduces the (n-1) × n matrix to echelon form in O(n³) classical operations, isolating the secret string s.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "simon-phase-11": {
    "id": "simon-phase-11",
    "type": "code-completion",
    "question": "In Python, how is the dot product modulo 2 between two bitstrings y and s calculated?",
    "starterCode": "def dot_product_mod2(y, s):\n    # return sum(int(a) * int(b) for a, b in zip(y, s)) ??? 2",
    "expectedAnswer": "%",
    "options": [
      "%",
      "//",
      "**",
      "&"
    ],
    "correctIndex": 0,
    "hints": [
      "The modulo operator in Python is `%`.",
      "Modulo 2 arithmetic checks if the sum is even (0) or odd (1)."
    ],
    "explanation": "In Python, `sum(int(a) * int(b) for a, b in zip(y, s)) % 2` computes the bitwise dot product modulo 2. If it equals 0, the equation y · s = 0 (mod 2) is satisfied.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "simon-phase-12": {
    "id": "simon-phase-12",
    "type": "prediction",
    "question": "What was the profound historical significance of Simon's algorithm (1994) in the history of quantum computing?",
    "options": [
      "It was the direct inspiration for Peter Shor's polynomial-time factoring algorithm.",
      "It replaced symmetric encryption.",
      "It showed quantum computers can only solve linear algebra.",
      "It proved P = NP."
    ],
    "correctIndex": 0,
    "hints": [
      "Peter Shor explicitly credited Simon's algorithm with teaching him how quantum period-finding works.",
      "Shor extended the group from (Z_2)^n in Simon to the cyclic group Z_r in Shor's algorithm."
    ],
    "explanation": "Simon's algorithm demonstrated the first provable exponential speedup for a black-box problem over randomized classical algorithms. Peter Shor realized that Simon's period-finding principle over (Z_2)^n could be generalized to modular exponentiation over Z_N, leading directly to his revolutionary factoring algorithm.",
    "circuit": {
      "qubits": 4,
      "gates": [
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "H",
          "q": 1
        }
      ]
    }
  },
  "vqe-phase-1": {
    "id": "vqe-phase-1",
    "type": "prediction",
    "question": "What is the primary goal of the Variational Quantum Eigensolver (VQE) in quantum chemistry and materials science?",
    "options": [
      "To simulate classical weather models",
      "To calculate the ground-state energy E_0 of a molecular Hamiltonian H",
      "To factor large RSA prime numbers",
      "To encrypt classical database records"
    ],
    "correctIndex": 1,
    "hints": [
      "Chemical reactions, molecular stability, and catalyst mechanisms are determined by the lowest energy state (ground state).",
      "VQE finds the lowest eigenvalue of the system's Hamiltonian."
    ],
    "explanation": "VQE is designed to determine the ground-state energy E_0 = min_ψ ⟨ψ|H|ψ⟩ of a quantum Hamiltonian. This allows chemists to predict molecular bond lengths, chemical reaction rates, and stable crystal structures.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "vqe-phase-2": {
    "id": "vqe-phase-2",
    "type": "multiple-choice",
    "question": "What does the Quantum Variational Principle state about the expectation value ⟨ψ(θ)| H |ψ(θ)⟩ for any trial state |ψ(θ)⟩?",
    "options": [
      "⟨ψ(θ)| H |ψ(θ)⟩ ≤ E_0 always",
      "⟨ψ(θ)| H |ψ(θ)⟩ ≥ E_0 (The expectation value is always an upper bound on the true ground state energy)",
      "⟨ψ(θ)| H |ψ(θ)⟩ = 0 always",
      "⟨ψ(θ)| H |ψ(θ)⟩ is an imaginary number"
    ],
    "correctIndex": 1,
    "hints": [
      "Any state can be expanded in energy eigenstates: |ψ⟩ = ∑ c_k |E_k⟩.",
      "Since E_k ≥ E_0 for all k, the weighted average ∑ |c_k|² E_k must be ≥ E_0."
    ],
    "explanation": "The Rayleigh-Ritz variational principle guarantees that for any parameterized state |ψ(θ)⟩, the energy expectation ⟨H⟩_θ is strictly greater than or equal to the true ground state energy E_0. Minimizing ⟨H⟩_θ approaches E_0 from above.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "vqe-phase-3": {
    "id": "vqe-phase-3",
    "type": "statevector",
    "question": "In quantum chemistry, a molecular Hamiltonian is decomposed as a sum of Pauli strings: H = ∑_i c_i P_i. For H = -1.0 Z_0 - 0.5 Z_1, what is the ground state energy E_0?",
    "expression": "H|00⟩ = (-1.0)(+1) + (-0.5)(+1) = -1.5",
    "answer": "-1.5 Hartree",
    "options": [
      "+1.5",
      "-1.5",
      "-0.5",
      "0.0"
    ],
    "correctIndex": 1,
    "hints": [
      "To minimize -1.0 Z_0 - 0.5 Z_1, we want Z_0 = +1 and Z_1 = +1.",
      "Basis state |00⟩ has Z_0|0⟩ = +1 and Z_1|0⟩ = +1. Then (-1.0)(1) + (-0.5)(1) = -1.5."
    ],
    "explanation": "State |00⟩ is the simultaneous eigenstate: Z_0|00⟩ = +|00⟩ and Z_1|00⟩ = +|00⟩. Substituting eigenvalues yields E = (-1.0)(+1) + (-0.5)(+1) = -1.5, which is the lowest possible energy (the ground state).",
    "circuit": {
      "qubits": 2,
      "gates": []
    }
  },
  "vqe-phase-4": {
    "id": "vqe-phase-4",
    "type": "circuit-analysis",
    "question": "What is an 'ansatz' in the context of VQE?",
    "circuitSummary": "A parameterized quantum circuit U(θ) that prepares trial state |ψ(θ)⟩ = U(θ)|0⟩.",
    "expectedObservation": "Ansatz structure determines expressibility, entanglement, and parameter space.",
    "options": [
      "A classical optimization subroutine",
      "A parameterized quantum circuit U(θ) designed to generate physically realistic trial wavefunctions",
      "A laser calibration device",
      "A measurement detector error mitigation table"
    ],
    "correctIndex": 1,
    "hints": [
      "The word 'ansatz' is German for 'educated guess' or trial ansatz.",
      "Examples include UCCSD (Unitary Coupled Cluster) and Hardware-Efficient ansätze."
    ],
    "explanation": "An ansatz is a parameterized quantum circuit architecture U(θ) used to explore the relevant subspace of Hilbert space. The parameters θ are tuned by the classical optimizer until the minimum energy is reached.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "RY",
          "q": 0,
          "theta": 0.5
        },
        {
          "g": "RY",
          "q": 1,
          "theta": 0.5
        },
        {
          "g": "CNOT",
          "q": 0,
          "q2": 1
        }
      ]
    }
  },
  "vqe-phase-5": {
    "id": "vqe-phase-5",
    "type": "multiple-choice",
    "question": "Quantum hardware only measures in the Z-basis. To measure the expectation value of a Pauli X term ⟨X_0⟩, what gate must be applied before measurement?",
    "options": [
      "Pauli Z gate",
      "Hadamard gate H (since H X H = Z)",
      "Pauli X gate",
      "S gate"
    ],
    "correctIndex": 1,
    "hints": [
      "The Hadamard gate diagonalizes the Pauli X operator: H |+⟩ = |0⟩ and H |-⟩ = |1⟩.",
      "Applying H rotates the X eigenbasis into the Z eigenbasis."
    ],
    "explanation": "Because H X H = Z, applying a Hadamard gate prior to computational Z-basis measurement maps the X eigenstates {|+⟩, |-⟩} onto {|0⟩, |1⟩}, allowing standard detectors to measure ⟨X⟩.",
    "circuit": {
      "qubits": 1,
      "gates": [
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "vqe-phase-6": {
    "id": "vqe-phase-6",
    "type": "prediction",
    "question": "To measure the expectation value of a Pauli Y term ⟨Y_0⟩, which basis transformation gates are applied before Z measurement?",
    "options": [
      "Gate X",
      "Gate S^† (or RZ(-π/2)) followed by Hadamard H",
      "Gate Z followed by X",
      "Two Hadamard gates"
    ],
    "correctIndex": 1,
    "hints": [
      "Y has eigenstates (|0⟩ ± i|1⟩)/√2.",
      "S^† removes the i phase, and H rotates to the computational basis: H S^† Y S H = Z."
    ],
    "explanation": "Because H S^† Y S H = Z, the basis transformation for Pauli Y consists of an S^† gate (or RZ(-π/2)) to remove the imaginary phase, followed by a Hadamard gate H to rotate into the Z-basis.",
    "circuit": {
      "qubits": 1,
      "gates": [
        {
          "g": "RZ",
          "q": 0,
          "theta": -1.57
        },
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "vqe-phase-7": {
    "id": "vqe-phase-7",
    "type": "statevector",
    "question": "A quantum circuit samples 1000 shots in the Z-basis for a single qubit, measuring outcome 0 750 times and outcome 1 250 times. What is the estimated expectation value ⟨Z⟩?",
    "expression": "⟨Z⟩ = (750 - 250) / 1000",
    "answer": "+0.50",
    "options": [
      "+0.75",
      "+0.50",
      "+0.25",
      "-0.50"
    ],
    "correctIndex": 1,
    "hints": [
      "⟨Z⟩ = (+1)P(0) + (-1)P(1).",
      "P(0) = 750/1000 = 0.75, P(1) = 250/1000 = 0.25. Expectation = 0.75 - 0.25 = 0.50."
    ],
    "explanation": "Outcome 0 has eigenvalue +1 and outcome 1 has eigenvalue -1. The statistical expectation is ⟨Z⟩ = (+1)(0.75) + (-1)(0.25) = +0.50.",
    "circuit": {
      "qubits": 1,
      "gates": [
        {
          "g": "RY",
          "q": 0,
          "theta": 1.047
        }
      ]
    }
  },
  "vqe-phase-8": {
    "id": "vqe-phase-8",
    "type": "multiple-choice",
    "question": "Why is the SPSA (Simultaneous Perturbation Stochastic Approximation) optimizer particularly well-suited for VQE on physical quantum hardware?",
    "options": [
      "It computes exact matrix inverses.",
      "It estimates the full multi-dimensional gradient using only 2 circuit evaluations per step, regardless of parameter count, and is highly robust to shot noise.",
      "It eliminates all noise from the physical processor.",
      "It works without running any quantum circuits."
    ],
    "correctIndex": 1,
    "hints": [
      "Standard gradient methods require 2p evaluations for p parameters.",
      "SPSA perturbs all parameters simultaneously in random ±1 directions, requiring only 2 evaluations per iteration."
    ],
    "explanation": "Spall's SPSA algorithm perturbs all parameters simultaneously, approximating the full gradient vector with only 2 evaluations per iteration. This drastically reduces quantum hardware execution time while tolerating shot noise.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "vqe-phase-9": {
    "id": "vqe-phase-9",
    "type": "circuit-analysis",
    "question": "In a 2-qubit minimal model of molecular Hydrogen (H_2), the trial ansatz is |ψ(θ)⟩ = cos(θ)|01⟩ + sin(θ)|10⟩. What physical property does this ansatz preserve?",
    "circuitSummary": "Preserves total particle/electron number (1 electron across 2 orbitals).",
    "expectedObservation": "Only states with 1 total excitation are explored.",
    "options": [
      "Total electron number conservation (particle number symmetry)",
      "Photon polarization",
      "Superluminal phase speed",
      "Infinite temperature limit"
    ],
    "correctIndex": 0,
    "hints": [
      "Notice both |01⟩ and |10⟩ have exactly one '1' bit.",
      "Chemical electrons cannot magically appear or disappear during ground state evolution."
    ],
    "explanation": "Chemical Hamiltonians commute with the total electron number operator N_e. Using a particle-conserving ansatz restricts the search to the physical subspace with the correct number of electrons, preventing the optimizer from wandering into unphysical states.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "X",
          "q": 0
        },
        {
          "g": "RY",
          "q": 1,
          "theta": 0.8
        },
        {
          "g": "CNOT",
          "q": 1,
          "q2": 0
        }
      ]
    }
  },
  "vqe-phase-10": {
    "id": "vqe-phase-10",
    "type": "code-completion",
    "question": "In Qiskit Nature, which algorithm class executes the ground state energy calculation using VQE?",
    "starterCode": "# from qiskit_algorithms import VQE\n# from qiskit_algorithms.optimizers import SLSQP",
    "expectedAnswer": "VQE",
    "options": [
      "VQE",
      "GroundStateSolver",
      "MolecularEigensolver",
      "QuantumChemistryEngine"
    ],
    "correctIndex": 0,
    "hints": [
      "The class name is the exact three-letter acronym of the algorithm.",
      "Maintained in `qiskit_algorithms`."
    ],
    "explanation": "Qiskit's `VQE` class in `qiskit_algorithms` takes an ansatz, a classical optimizer, and an Estimator primitive, automatically executing the hybrid optimization loop to find the ground state energy.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "vqe-phase-11": {
    "id": "vqe-phase-11",
    "type": "prediction",
    "question": "What is the standard chemical accuracy threshold required for quantum chemistry simulations to be predictive for practical chemical reactions?",
    "options": [
      "1 Hartree (627.5 kcal/mol)",
      "1 kcal/mol ≈ 1.6 milli-Hartrees (0.043 eV)",
      "100 eV",
      "0.1 eV"
    ],
    "correctIndex": 1,
    "hints": [
      "Reaction rates depend exponentially on activation energy via the Arrhenius equation: k ~ e^{-ΔG / RT}.",
      "An error of 1 kcal/mol changes predicted room-temperature reaction rates by about a factor of 5."
    ],
    "explanation": "Chemical accuracy is defined as 1 kcal/mol (≈ 1.594 mHa or 0.043 eV). Achieving this precision is necessary for accurate predictions of chemical equilibrium constants and catalytic reaction rates at room temperature.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "vqe-phase-12": {
    "id": "vqe-phase-12",
    "type": "prediction",
    "question": "Why is VQE considered one of the most promising candidates for demonstrating quantum advantage on near-term NISQ devices?",
    "options": [
      "Because it does not require deep circuits or fault-tolerant error correction; shallow ansätze can absorb some coherent errors into variational parameter shifts.",
      "Because it runs faster than light.",
      "Because chemistry algorithms do not use qubits.",
      "Because VQE can only be run on classical computers."
    ],
    "correctIndex": 0,
    "hints": [
      "Fault-tolerant quantum error correction requires millions of physical qubits.",
      "VQE uses short circuit depths and variational error resilience."
    ],
    "explanation": "VQE is error-resilient: small systematic gate calibration errors can be partially compensated for by the classical optimizer adjusting the variational parameters θ. This makes VQE uniquely suited for noisy intermediate-scale quantum (NISQ) processors.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "RY",
          "q": 0,
          "theta": 0.6
        },
        {
          "g": "CNOT",
          "q": 0,
          "q2": 1
        }
      ]
    }
  },
  "shor-phase-1": {
    "id": "shor-phase-1",
    "type": "prediction",
    "question": "Why does Shor's polynomial-time factoring algorithm pose an existential threat to modern public-key cryptography (such as RSA)?",
    "options": [
      "Because RSA security relies entirely on the classical computational hardness of factoring large composite integers N = p · q into prime factors.",
      "Because Shor's algorithm guesses all passwords simultaneously.",
      "Because Shor's algorithm destroys optical fiber networks.",
      "Because quantum computers can reverse any hash function in 1 step."
    ],
    "correctIndex": 0,
    "hints": [
      "RSA public keys are large numbers N = p · q (e.g. 2048 bits).",
      "The best classical algorithm (General Number Field Sieve) runs in sub-exponential time O(exp(c (log N)^{1/3})). Shor's algorithm runs in polynomial time O((log N)³)."
    ],
    "explanation": "RSA cryptography depends on the assumption that factoring large composite integers N = p · q is intractable for classical supercomputers. Shor's algorithm solves factoring in polynomial time O((log N)³), rendering 2048-bit RSA breakable once fault-tolerant quantum computers exist.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "shor-phase-2": {
    "id": "shor-phase-2",
    "type": "multiple-choice",
    "question": "How did Peter Shor reduce the problem of integer factoring to a problem that a quantum computer can solve efficiently?",
    "options": [
      "He reduced factoring to the Travelling Salesperson Problem.",
      "He reduced factoring to finding the period r of the modular exponential function f(x) = a^x mod N.",
      "He used Grover's search on all prime numbers.",
      "He mapped numbers to chemical Hamiltonians."
    ],
    "correctIndex": 1,
    "hints": [
      "If a^r ≡ 1 (mod N) and r is even, then (a^{r/2} - 1)(a^{r/2} + 1) is a multiple of N.",
      "Calculating greatest common divisors gcd(a^{r/2} ± 1, N) with Euclid's algorithm yields the factors."
    ],
    "explanation": "Euler and Gauss proved that factoring N reduces to finding the order (period) r of a chosen integer a coprime to N such that a^r ≡ 1 (mod N). While period finding is exponentially hard classically, quantum computers find periods in polynomial time.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "shor-phase-3": {
    "id": "shor-phase-3",
    "type": "statevector",
    "question": "Consider N = 15 and chosen coprime base a = 7. Compute the modular sequence f(x) = 7^x mod 15 for x = 0, 1, 2, 3, 4. What is the period r?",
    "expression": "7^0 mod 15 = 1, 7^1 mod 15 = 7, 7^2 mod 15 = 4, 7^3 mod 15 = 13, 7^4 mod 15 = 1",
    "answer": "r = 4",
    "options": [
      "r = 2",
      "r = 3",
      "r = 4 (since 7^4 mod 15 = 1)",
      "r = 15"
    ],
    "correctIndex": 2,
    "hints": [
      "7^0 = 1 mod 15.",
      "7^1 = 7 mod 15.",
      "7^2 = 49 = 3*15 + 4 = 4 mod 15.",
      "7^3 = 4*7 = 28 = 13 mod 15.",
      "7^4 = 13*7 = 91 = 6*15 + 1 = 1 mod 15. The sequence repeats every 4 steps!"
    ],
    "explanation": "The modular sequence is 1, 7, 4, 13, 1, 7, 4, 13... The sequence returns to 1 at x = 4, meaning the period is r = 4. Because r=4 is even, a^{r/2} = 7² = 49 ≡ 4 (mod 15). Then gcd(4 - 1, 15) = gcd(3, 15) = 3, and gcd(4 + 1, 15) = gcd(5, 15) = 5. The factors of 15 are 3 and 5!",
    "circuit": {
      "qubits": 4,
      "gates": [
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "H",
          "q": 1
        }
      ]
    }
  },
  "shor-phase-4": {
    "id": "shor-phase-4",
    "type": "circuit-analysis",
    "question": "Shor's quantum circuit uses two registers: a counting/clock register and a target/work register. What is the initial state of the counting register after the first layer of gates?",
    "circuitSummary": "H^⊗m applied to the counting register, while the work register starts in |1⟩.",
    "expectedObservation": "Creates equal superposition 1/√2^m ∑_{x=0}^{2^m-1} |x⟩|1⟩.",
    "options": [
      "State |0...0⟩",
      "Equal superposition of all 2^m integers: 1/√2^m ∑_x |x⟩",
      "State |1...1⟩",
      "The factor p"
    ],
    "correctIndex": 1,
    "hints": [
      "Hadamard gates applied to all m qubits in the counting register create an equal superposition of all possible exponents x.",
      "This enables evaluating modular exponentiation across all x in parallel."
    ],
    "explanation": "Applying H^⊗m to the counting register prepares the equal superposition 1/√2^m ∑_{x=0}^{2^m-1} |x⟩. The work register is initialized to |1⟩ (representing a^0 = 1).",
    "circuit": {
      "qubits": 4,
      "gates": [
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "H",
          "q": 1
        },
        {
          "g": "X",
          "q": 2
        }
      ]
    }
  },
  "shor-phase-5": {
    "id": "shor-phase-5",
    "type": "prediction",
    "question": "What is the unitary action of the modular exponentiation oracle U_f on state |x⟩|1⟩?",
    "options": [
      "|x⟩|1⟩ -> |x + 1⟩|1⟩",
      "|x⟩|1⟩ -> |x⟩|a^x mod N⟩",
      "|x⟩|1⟩ -> |x ⊕ a⟩|N⟩",
      "|x⟩|1⟩ -> |0⟩|0⟩"
    ],
    "correctIndex": 1,
    "hints": [
      "The oracle computes the modular power a^x mod N into the work register.",
      "This entangles each exponent x with its modular remainder."
    ],
    "explanation": "The modular exponentiation oracle maps |x⟩|1⟩ to |x⟩|a^x mod N⟩. The superposition becomes 1/√2^m ∑_{x=0}^{2^m-1} |x⟩|a^x mod N⟩, entangling every exponent with its modular value.",
    "circuit": {
      "qubits": 4,
      "gates": [
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "H",
          "q": 1
        },
        {
          "g": "X",
          "q": 2
        },
        {
          "g": "CNOT",
          "q": 0,
          "q2": 2
        }
      ]
    }
  },
  "shor-phase-6": {
    "id": "shor-phase-6",
    "type": "statevector",
    "question": "If measuring the work register yields a specific remainder y_0 = a^{x_0} mod N, what state is left on the counting register?",
    "expression": "|\\psi_{count}⟩ \\propto |x_0⟩ + |x_0 + r⟩ + |x_0 + 2r⟩ + \\dots",
    "answer": "A periodic comb of basis states spaced by period r",
    "options": [
      "A completely random state",
      "A periodic superposition of states |x_0 + k · r⟩ with period r",
      "A single state |x_0⟩",
      "The all-zeros state"
    ],
    "correctIndex": 1,
    "hints": [
      "All inputs x that produce output y_0 must differ by multiples of the period r.",
      "The remaining superposition is a comb with spatial period r."
    ],
    "explanation": "Because a^x mod N is periodic with period r, all exponents that produced remainder y_0 are of the form x_0 + k·r. Measuring the work register collapses the counting register into a periodic comb of states spaced exactly by r.",
    "circuit": {
      "qubits": 4,
      "gates": [
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "H",
          "q": 1
        }
      ]
    }
  },
  "shor-phase-7": {
    "id": "shor-phase-7",
    "type": "circuit-analysis",
    "question": "What gate block is applied to the counting register after modular exponentiation to extract the period from the periodic state comb?",
    "circuitSummary": "The Inverse Quantum Fourier Transform (QFT†).",
    "expectedObservation": "Constructive interference produces sharp peaks at multiples of 2^m / r.",
    "options": [
      "A layer of Pauli X gates",
      "The Inverse Quantum Fourier Transform (QFT†)",
      "A classical random number generator",
      "A Grover diffusion operator"
    ],
    "correctIndex": 1,
    "hints": [
      "The counting register holds a periodic state in the computational basis.",
      "QFT† acts as a frequency analyzer, converting spatial period r into frequency peaks."
    ],
    "explanation": "Applying QFT† to the periodic comb converts the spatial period r into sharp peaks in the Fourier domain. Constructive interference concentrates measurement probability around integers s · 2^m / r.",
    "circuit": {
      "qubits": 4,
      "gates": [
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "H",
          "q": 1
        },
        {
          "g": "SWAP",
          "q": 0,
          "q2": 1
        },
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "shor-phase-8": {
    "id": "shor-phase-8",
    "type": "prediction",
    "question": "Measuring the counting register after QFT† yields integer y. The measured phase is φ = y / 2^m ≈ s / r. Which classical algorithm efficiently extracts the unknown denominator r from the decimal fraction φ?",
    "options": [
      "The Continued Fractions Algorithm",
      "Bubble sort",
      "Gradient descent",
      "RSA keygen"
    ],
    "correctIndex": 0,
    "hints": [
      "Continued fraction expansions find the best rational approximations p/q to any real number in polynomial time.",
      "The denominator of the convergent gives the candidate period r."
    ],
    "explanation": "The Continued Fractions algorithm efficiently finds the best rational approximation s/r to the measured phase y / 2^m in polynomial time O(m²). The denominator of the convergent provides the candidate period r.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "shor-phase-9": {
    "id": "shor-phase-9",
    "type": "statevector",
    "question": "For N = 15 and candidate period r = 4, with base a = 7, compute gcd(a^{r/2} - 1, N) and gcd(a^{r/2} + 1, N). What factors of 15 are found?",
    "expression": "a^{r/2} = 7^2 = 49. 49 - 1 = 48, 49 + 1 = 50. gcd(48, 15) and gcd(50, 15)",
    "answer": "gcd(48, 15) = 3 and gcd(50, 15) = 5",
    "options": [
      "1 and 15",
      "3 and 5",
      "2 and 7",
      "4 and 9"
    ],
    "correctIndex": 1,
    "hints": [
      "7² = 49. 49 mod 15 = 4.",
      "gcd(4 - 1, 15) = gcd(3, 15) = 3.",
      "gcd(4 + 1, 15) = gcd(5, 15) = 5."
    ],
    "explanation": "With a^{r/2} ≡ 4 (mod 15), the two factors are gcd(4 - 1, 15) = gcd(3, 15) = 3, and gcd(4 + 1, 15) = gcd(5, 15) = 5. Both non-trivial prime factors of 15 (3 and 5) are successfully recovered!",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "shor-phase-10": {
    "id": "shor-phase-10",
    "type": "multiple-choice",
    "question": "What happens if a chosen base a randomly yields an odd period r, or a^{r/2} ≡ -1 (mod N)?",
    "options": [
      "The quantum computer permanently locks up.",
      "The classical post-processing test fails to produce non-trivial factors; the algorithm simply picks a new random base a and repeats.",
      "RSA becomes unbreakable.",
      "The factors are negative."
    ],
    "correctIndex": 1,
    "hints": [
      "Number theory guarantees that at least 50% of random bases a yield an even period with a^{r/2} ≠ -1 (mod N).",
      "If the conditions fail, picking a new random a solves the problem in a few trials."
    ],
    "explanation": "If r is odd or a^{r/2} ≡ -1 (mod N), gcd(a^{r/2} + 1, N) equals N or 1, giving trivial factors. Number theory proves that a random a succeeds with probability ≥ 1/2. On failure, we simply pick a new random base a and rerun.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "shor-phase-11": {
    "id": "shor-phase-11",
    "type": "code-completion",
    "question": "In Python, which function from the standard `math` library computes the Greatest Common Divisor used in Shor's classical post-processing?",
    "starterCode": "import math\n# factor = math.???(a**(r//2) - 1, N)",
    "expectedAnswer": "gcd",
    "options": [
      "gcd",
      "lcm",
      "factor",
      "mod_inverse"
    ],
    "correctIndex": 0,
    "hints": [
      "The Greatest Common Divisor function is `math.gcd(a, b)`.",
      "It runs Euclid's algorithm in O(log N) time."
    ],
    "explanation": "Python's `math.gcd(x, N)` implements Euclid's algorithm to compute the greatest common divisor in logarithmic time, completing the classical reduction of Shor's algorithm.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "shor-phase-12": {
    "id": "shor-phase-12",
    "type": "prediction",
    "question": "Why must educational demonstrations of Shor's algorithm (such as factoring N=15 in QubitLab) be clearly distinguished from full-scale cryptographic factoring of RSA-2048?",
    "options": [
      "Educational demonstrations use simplified, compiled modular circuits on 4-5 qubits with known factors; breaking RSA-2048 requires millions of fault-tolerant physical qubits, active error correction, and deep uncompiled modular multiplier circuits.",
      "Because RSA-2048 has already been broken by classical laptops.",
      "Because quantum computers can only factor numbers less than 20.",
      "There is no difference; QubitLab can factor 2048-bit RSA keys today."
    ],
    "correctIndex": 0,
    "hints": [
      "Factoring 15 uses a compilation shortcut that embeds knowledge of the answer into a handful of gates.",
      "Scaling to 2048 bits requires ~4,000 logical qubits, translating to ~4 million physical qubits under surface code error correction."
    ],
    "explanation": "Factoring N=15 on 4-5 qubits is an educational demonstration using pre-compiled modular arithmetic. Factoring RSA-2048 requires ~4096 logical qubits and billions of T gates, necessitating millions of fault-tolerant physical qubits that do not yet exist.",
    "circuit": {
      "qubits": 4,
      "gates": [
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "H",
          "q": 1
        },
        {
          "g": "X",
          "q": 2
        }
      ]
    }
  },
  "qec-phase-1": {
    "id": "qec-phase-1",
    "type": "prediction",
    "question": "Why is error correction fundamentally more difficult for quantum computers than for classical computers?",
    "options": [
      "Classical computers have no noise.",
      "Because quantum errors are continuous (any arbitrary phase or rotation error), and measuring a quantum state to inspect errors collapses the fragile superposition (No-Cloning Theorem).",
      "Because quantum hardware cannot be cooled.",
      "Because quantum errors only occur on weekends."
    ],
    "correctIndex": 1,
    "hints": [
      "Classical bits only suffer discrete 0 <-> 1 flips; you can duplicate them (repetition: 0 -> 000).",
      "Quantum states cannot be cloned, errors can be continuous phase angles, and measurement destroys superposition."
    ],
    "explanation": "Classical error correction simply duplicates bits (0 -> 000) and uses majority voting. Quantum information cannot be cloned (No-Cloning Theorem), errors form a continuous continuum of unitary rotations, and direct measurement collapses the state. QEC must detect errors without learning the data.",
    "circuit": {
      "qubits": 3,
      "gates": [
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "qec-phase-2": {
    "id": "qec-phase-2",
    "type": "multiple-choice",
    "question": "What are the two fundamental types of discrete Pauli errors that form a basis for all arbitrary single-qubit quantum errors?",
    "options": [
      "Bit-flip errors (Pauli X) and Phase-flip errors (Pauli Z)",
      "Hadamard errors and SWAP errors",
      "Classical voltage dips and thermal expansion",
      "Software compilation bugs and Python exceptions"
    ],
    "correctIndex": 0,
    "hints": [
      "Any 2x2 error matrix E can be expanded as E = c_0 I + c_1 X + c_2 Y + c_3 Z.",
      "Since Y = i X Z, discretizing and correcting X and Z errors automatically corrects all arbitrary continuous errors!"
    ],
    "explanation": "By the Pauli twirl and discretization of quantum errors, any arbitrary error matrix can be expanded in the Pauli basis {I, X, Y, Z}. Because Y = i X Z, correcting bit-flips (X) and phase-flips (Z) automatically corrects all continuous quantum noise.",
    "circuit": {
      "qubits": 1,
      "gates": [
        {
          "g": "X",
          "q": 0
        },
        {
          "g": "Z",
          "q": 0
        }
      ]
    }
  },
  "qec-phase-3": {
    "id": "qec-phase-3",
    "type": "gate-prediction",
    "question": "How is a single logical qubit |ψ⟩ = α|0⟩ + β|1⟩ encoded into the 3-qubit bit-flip code using physical qubits q0, q1, q2?",
    "initialState": "|\\psi⟩|00⟩",
    "gates": [
      {
        "g": "CNOT",
        "q": 0,
        "q2": 1
      },
      {
        "g": "CNOT",
        "q": 0,
        "q2": 2
      }
    ],
    "expectedState": "α|000⟩ + β|111⟩",
    "options": [
      "Apply H to all 3 qubits",
      "Apply CNOT from q0 to q1, and CNOT from q0 to q2, producing α|000⟩ + β|111⟩",
      "Apply X to q1 and q2",
      "Measure q0 and copy to q1 and q2"
    ],
    "correctIndex": 1,
    "hints": [
      "Logical |0_L⟩ = |000⟩ and logical |1_L⟩ = |111⟩.",
      "CNOT(0->1) and CNOT(0->2) entangle q0 with q1 and q2 without measuring q0."
    ],
    "explanation": "Starting from (α|0⟩ + β|1⟩)|00⟩, applying CNOT(0->1) yields α|000⟩ + β|110⟩. The second CNOT(0->2) yields α|000⟩ + β|111⟩. The information is non-locally distributed into quantum entanglement without cloning.",
    "circuit": {
      "qubits": 3,
      "gates": [
        {
          "g": "CNOT",
          "q": 0,
          "q2": 1
        },
        {
          "g": "CNOT",
          "q": 0,
          "q2": 2
        }
      ]
    }
  },
  "qec-phase-4": {
    "id": "qec-phase-4",
    "type": "statevector",
    "question": "Suppose physical qubit q1 experiences an unwanted bit-flip error (gate X on q1). What is the corrupted statevector of the 3-qubit code?",
    "expression": "X_1 (\\alpha|000⟩ + \\beta|111⟩)",
    "answer": "α|010⟩ + β|101⟩",
    "options": [
      "α|000⟩ + β|111⟩",
      "α|010⟩ + β|101⟩",
      "α|100⟩ + β|011⟩",
      "|000⟩"
    ],
    "correctIndex": 1,
    "hints": [
      "Pauli X flips the middle bit (qubit 1): 0 <-> 1.",
      "|000⟩ becomes |010⟩, and |111⟩ becomes |101⟩."
    ],
    "explanation": "A bit flip on qubit 1 transforms the encoded state α|000⟩ + β|111⟩ into α|010⟩ + β|101⟩. Notice that the amplitudes α and β remain intact; only the parity of qubit 1 relative to q0 and q2 has changed.",
    "circuit": {
      "qubits": 3,
      "gates": [
        {
          "g": "CNOT",
          "q": 0,
          "q2": 1
        },
        {
          "g": "CNOT",
          "q": 0,
          "q2": 2
        },
        {
          "g": "X",
          "q": 1
        }
      ]
    }
  },
  "qec-phase-5": {
    "id": "qec-phase-5",
    "type": "circuit-analysis",
    "question": "How does a syndrome measurement extract the error location without collapsing the logical amplitudes α and β?",
    "circuitSummary": "Two ancilla qubits measure parity observables Z_0 Z_1 and Z_1 Z_2 via CNOT gates.",
    "expectedObservation": "Measures relative parity between pairs of qubits, revealing which qubit flipped while leaving α and β intact.",
    "options": [
      "It measures all three data qubits in the Z-basis.",
      "It uses ancilla qubits to measure the parity operators Z_0 Z_1 and Z_1 Z_2 without measuring single-qubit data values.",
      "It resets the qubits to zero.",
      "It applies random unitary gates."
    ],
    "correctIndex": 1,
    "hints": [
      "Parity (Z_i Z_j) checks whether two bits are identical or opposite.",
      "Both |000⟩ and |111⟩ have even parity (+1), so measuring parity reveals zero information about whether the state was 0 or 1."
    ],
    "explanation": "Syndrome measurement uses ancilla qubits to evaluate parity observables Z_0 Z_1 and Z_1 Z_2. Because |000⟩ and |111⟩ have identical parity (+1), parity measurement yields zero information about the superposed state α|0_L⟩ + β|1_L⟩, preserving quantum superposition while pinpointing errors.",
    "circuit": {
      "qubits": 5,
      "gates": [
        {
          "g": "CNOT",
          "q": 0,
          "q2": 3
        },
        {
          "g": "CNOT",
          "q": 1,
          "q2": 3
        },
        {
          "g": "CNOT",
          "q": 1,
          "q2": 4
        },
        {
          "g": "CNOT",
          "q": 2,
          "q2": 4
        }
      ]
    }
  },
  "qec-phase-6": {
    "id": "qec-phase-6",
    "type": "multiple-choice",
    "question": "In the 3-qubit bit-flip code syndrome table, if ancilla measurements yield syndrome (s_1, s_2) = (1, 1), which qubit experienced the bit-flip error?",
    "options": [
      "No error occurred",
      "Qubit 0 flipped",
      "Qubit 1 flipped (since it is adjacent to both parities Z_0 Z_1 and Z_1 Z_2)",
      "Qubit 2 flipped"
    ],
    "correctIndex": 2,
    "hints": [
      "s_1 = 1 means q0 and q1 have opposite parity.",
      "s_2 = 1 means q1 and q2 have opposite parity.",
      "The common qubit in both failed parities is qubit 1."
    ],
    "explanation": "Syndrome (1, 0) indicates qubit 0 flipped. Syndrome (0, 1) indicates qubit 2 flipped. Syndrome (1, 1) indicates qubit 1 flipped because qubit 1 participates in both parity checks Z_0 Z_1 and Z_1 Z_2.",
    "circuit": {
      "qubits": 5,
      "gates": [
        {
          "g": "CNOT",
          "q": 0,
          "q2": 1
        },
        {
          "g": "CNOT",
          "q": 0,
          "q2": 2
        },
        {
          "g": "X",
          "q": 1
        }
      ]
    }
  },
  "qec-phase-7": {
    "id": "qec-phase-7",
    "type": "prediction",
    "question": "Once the syndrome measurement identifies that qubit 1 has experienced a bit flip, how is the error corrected?",
    "options": [
      "Apply a Hadamard gate to qubit 1",
      "Apply a Pauli X gate to qubit 1, flipping it back to its original state",
      "Discard all qubits and start over",
      "Apply a Pauli Z gate to all qubits"
    ],
    "correctIndex": 1,
    "hints": [
      "Pauli X is self-inverse: X² = I.",
      "Applying X to a bit-flipped qubit restores X(X|ψ⟩) = I|ψ⟩."
    ],
    "explanation": "Because X² = I, applying a targeted Pauli X gate to qubit 1 inverts the bit-flip error, restoring α|010⟩ + β|101⟩ back to the pristine logical state α|000⟩ + β|111⟩ with 100% fidelity.",
    "circuit": {
      "qubits": 3,
      "gates": [
        {
          "g": "CNOT",
          "q": 0,
          "q2": 1
        },
        {
          "g": "CNOT",
          "q": 0,
          "q2": 2
        },
        {
          "g": "X",
          "q": 1
        },
        {
          "g": "X",
          "q": 1
        }
      ]
    }
  },
  "qec-phase-8": {
    "id": "qec-phase-8",
    "type": "circuit-analysis",
    "question": "How is the 3-qubit Phase-Flip code constructed from the 3-qubit bit-flip code?",
    "circuitSummary": "By surrounding the data qubits with Hadamard gates: H^⊗3 before the noise channel and H^⊗3 after.",
    "expectedObservation": "Hadamards map phase-flips (Z) in the computational basis to bit-flips (X) in the Hadamard basis.",
    "options": [
      "By replacing all CNOT gates with SWAP gates",
      "By transforming the encoding to the Hadamard basis: |+_L⟩ = |+++⟩ and |-_L⟩ = |---> using H gates on all qubits",
      "By cooling the processor to absolute zero",
      "Phase flips cannot be corrected"
    ],
    "correctIndex": 1,
    "hints": [
      "H Z H = X.",
      "The Hadamard gate converts a phase-flip error Z into a bit-flip error X."
    ],
    "explanation": "Because H Z H = X, rotating the qubits into the Hadamard basis {|+⟩, |-⟩} transforms phase-flip errors into bit-flip errors. The standard 3-qubit bit-flip syndrome measurement is then applied in the X-basis.",
    "circuit": {
      "qubits": 3,
      "gates": [
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "H",
          "q": 1
        },
        {
          "g": "H",
          "q": 2
        }
      ]
    }
  },
  "qec-phase-9": {
    "id": "qec-phase-9",
    "type": "multiple-choice",
    "question": "What famous 9-qubit code concatenates the 3-qubit bit-flip code with the 3-qubit phase-flip code to protect against any arbitrary single-qubit error?",
    "options": [
      "The Shor 9-qubit Code (1995)",
      "The Grover Search code",
      "The RSA-9 code",
      "The BB84 repeating code"
    ],
    "correctIndex": 0,
    "hints": [
      "Peter Shor introduced the first quantum code that protects against both bit and phase flips.",
      "Each of the 3 qubits in the phase-flip code is itself encoded into a 3-qubit bit-flip code: 3 × 3 = 9 qubits."
    ],
    "explanation": "Peter Shor introduced the 9-qubit code in 1995. By encoding each of the 3 phase-flip code qubits into a 3-qubit bit-flip code, it simultaneously protects against arbitrary single-qubit bit-flip, phase-flip, and combined Y errors.",
    "circuit": {
      "qubits": 3,
      "gates": [
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "qec-phase-10": {
    "id": "qec-phase-10",
    "type": "prediction",
    "question": "What is the 'Threshold Theorem' in fault-tolerant quantum computing?",
    "options": [
      "Quantum computers can never exceed 100 qubits.",
      "If physical hardware gate error rates are below a rigorous threshold (typically ~1% for surface codes), quantum error correction can suppress logical error rates arbitrarily low with polynomial physical overhead.",
      "Quantum error correction only works above room temperature.",
      "Algorithms must run in under 1 second."
    ],
    "correctIndex": 1,
    "hints": [
      "If physical errors are too high, the gates in the error correction circuit introduce more errors than they fix.",
      "Below the fault-tolerance threshold, concatenating codes geometrically suppresses the logical error rate."
    ],
    "explanation": "The Quantum Threshold Theorem (Aharonov, Ben-Or, Kitaev, Preskill) proves that if physical hardware gate error rates are below a threshold (p < p_th ≈ 10^-2 for surface codes), arbitrary-length quantum computations can be executed with arbitrary fidelity.",
    "circuit": {
      "qubits": 3,
      "gates": [
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "qec-phase-11": {
    "id": "qec-phase-11",
    "type": "code-completion",
    "question": "In Qiskit, which add-on library provides topological quantum error-correcting codes and syndrome decoders?",
    "starterCode": "# from qiskit_qec.codes import RepetitionCode\n# from qiskit_qec.decoders import MatchingDecoder",
    "expectedAnswer": "qiskit_qec",
    "options": [
      "qiskit_qec",
      "qiskit_error_fixer",
      "qiskit_fault_tolerance",
      "qiskit_noise"
    ],
    "correctIndex": 0,
    "hints": [
      "The package dedicated to quantum error correction is `qiskit_qec`.",
      "It includes surface codes, repetition codes, and minimum-weight perfect matching decoders."
    ],
    "explanation": "`qiskit_qec` is Qiskit's open-source framework for exploring quantum error correction, implementing code families, syndrome graphs, and decoding algorithms.",
    "circuit": {
      "qubits": 3,
      "gates": [
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "qec-phase-12": {
    "id": "qec-phase-12",
    "type": "prediction",
    "question": "Why is the Surface Code the leading architecture for practical fault-tolerant quantum computers today?",
    "options": [
      "It only requires classical transistors.",
      "It requires only nearest-neighbor 2D grid qubit connectivity and has the highest known error threshold (~1%), making it compatible with superconducting and silicon hardware layouts.",
      "It eliminates the need for ancilla qubits.",
      "It works without running any syndrome measurements."
    ],
    "correctIndex": 1,
    "hints": [
      "Superconducting chips are planar 2D arrays.",
      "Surface codes do not require long-range physical connections between distant qubits."
    ],
    "explanation": "Topological surface codes require only local 2D square-grid connectivity and exhibit an exceptionally high fault-tolerance threshold (p_th ≈ 1%). This matches the physical constraints of superconducting transmon and silicon spin-qubit processors.",
    "circuit": {
      "qubits": 3,
      "gates": [
        {
          "g": "CNOT",
          "q": 0,
          "q2": 1
        },
        {
          "g": "CNOT",
          "q": 0,
          "q2": 2
        }
      ]
    }
  },
  "hhl-phase-1": {
    "id": "hhl-phase-1",
    "type": "prediction",
    "question": "What fundamental problem does the Harrow-Hassidim-Lloyd (HHL) algorithm solve?",
    "options": [
      "Sorting an unsorted database",
      "Solving the linear system of equations A x = b, producing a quantum state |x⟩ proportional to A^{-1}|b⟩",
      "Factoring prime numbers",
      "Simulating classical fluid dynamics with zero error"
    ],
    "correctIndex": 1,
    "hints": [
      "A is an N × N Hermitian matrix, b is a vector, and x is the solution vector.",
      "HHL produces a quantum state |x⟩ where amplitudes are proportional to the components of vector x."
    ],
    "explanation": "HHL (2009) solves the quantum linear systems problem A|x⟩ = |b⟩. For an s-sparse N × N matrix A with condition number κ, HHL outputs the quantum state |x⟩ = A^{-1}|b⟩ / ||A^{-1}|b⟩|| in time O(s² κ² log N), which is exponentially faster in dimension N than classical algorithms O(N s κ).",
    "circuit": {
      "qubits": 3,
      "gates": [
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "hhl-phase-2": {
    "id": "hhl-phase-2",
    "type": "multiple-choice",
    "question": "How is the input vector b = (b_1, ..., b_N)^T represented in the HHL quantum circuit?",
    "options": [
      "As classical voltage levels on wire pins",
      "As amplitudes of an n-qubit quantum state: |b⟩ = ∑_{i=0}^{N-1} b_i |i⟩ (where N = 2^n)",
      "As a list of Python floats stored in RAM",
      "As rotation angles on a single qubit"
    ],
    "correctIndex": 1,
    "hints": [
      "HHL encodes the N entries of vector b into the 2^n complex amplitudes of an n-qubit register.",
      "Preparing |b⟩ requires an efficient quantum state preparation routine."
    ],
    "explanation": "The normalized classical vector b is encoded into the amplitudes of an n-qubit quantum state |b⟩ = ∑_{i=1}^N b_i |i⟩. This quantum amplitude encoding compresses an N-dimensional vector into log₂(N) qubits.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "H",
          "q": 1
        }
      ]
    }
  },
  "hhl-phase-3": {
    "id": "hhl-phase-3",
    "type": "statevector",
    "question": "Any Hermitian matrix A has an orthonormal eigenbasis: A |u_j⟩ = λ_j |u_j⟩. If |b⟩ is expanded as ∑_j β_j |u_j⟩, what is the exact expression for the true solution state |x⟩?",
    "expression": "|x⟩ \\propto A^{-1}|b⟩ = \\sum_j \\beta_j A^{-1}|u_j⟩",
    "answer": "|x⟩ ∝ ∑_j (β_j / λ_j) |u_j⟩",
    "options": [
      "|x⟩ ∝ ∑_j (β_j · λ_j) |u_j⟩",
      "|x⟩ ∝ ∑_j (β_j / λ_j) |u_j⟩ (Each eigenstate amplitude is divided by its eigenvalue)",
      "|x⟩ ∝ ∑_j λ_j |u_j⟩",
      "|x⟩ ∝ |b⟩"
    ],
    "correctIndex": 1,
    "hints": [
      "Since A |u_j⟩ = λ_j |u_j⟩, the inverse operator satisfies A^{-1}|u_j⟩ = (1/λ_j)|u_j⟩.",
      "Applying A^{-1} to |b⟩ = ∑ β_j |u_j⟩ multiplies each component by 1/λ_j."
    ],
    "explanation": "Because A^{-1} has eigenvalues 1/λ_j on eigenstates |u_j⟩, the solution vector is |x⟩ = A^{-1}|b⟩ = ∑_j (β_j / λ_j) |u_j⟩. The core computational challenge of HHL is performing this eigenvalue inversion (1/λ_j) on quantum amplitudes.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "hhl-phase-4": {
    "id": "hhl-phase-4",
    "type": "circuit-analysis",
    "question": "What is the first major algorithmic subroutine executed in HHL?",
    "circuitSummary": "Quantum Phase Estimation (QPE) using Hamiltonian simulation e^{iAt} on the state |b⟩.",
    "expectedObservation": "Writes the eigenvalues λ_j into a clock register: ∑ β_j |λ_j⟩|u_j⟩.",
    "options": [
      "Grover diffusion",
      "Quantum Phase Estimation (QPE) using Hamiltonian simulation e^{i A t}",
      "Random measurement collapse",
      "Classical matrix inversion"
    ],
    "correctIndex": 1,
    "hints": [
      "To invert the eigenvalues λ_j, the circuit must first determine them.",
      "QPE simulates e^{iAt} to write the eigenvalues into an auxiliary clock register."
    ],
    "explanation": "HHL begins with Quantum Phase Estimation. By simulating the Hamiltonian e^{i A t} controlled by a clock register, the state |b⟩ = ∑ β_j |u_j⟩ is transformed into ∑ β_j |λ_j⟩|u_j⟩, extracting the eigenvalues into the clock register.",
    "circuit": {
      "qubits": 3,
      "gates": [
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "H",
          "q": 1
        }
      ]
    }
  },
  "hhl-phase-5": {
    "id": "hhl-phase-5",
    "type": "prediction",
    "question": "Once the eigenvalue λ_j is stored in the clock register, how does HHL perform the inversion 1/λ_j onto an auxiliary ancilla qubit?",
    "options": [
      "By applying a classical division instruction",
      "By applying a controlled rotation RY(2 arcsin(C / λ_j)) conditioned on the clock register, rotating the ancilla |0⟩ -> √(1 - (C/λ_j)²)|0⟩ + (C/λ_j)|1⟩",
      "By measuring the clock register",
      "By resetting all qubits to |0⟩"
    ],
    "correctIndex": 1,
    "hints": [
      "A rotation RY(2θ)|0⟩ produces cos(θ)|0⟩ + sin(θ)|1⟩.",
      "Setting sin(θ) = C / λ_j makes the amplitude of |1⟩ proportional to 1/λ_j."
    ],
    "explanation": "Conditioned on the clock register holding |λ_j⟩, a controlled rotation applies angle θ_j = arcsin(C / λ_j) to an ancilla qubit. The ancilla becomes √(1 - (C/λ_j)²)|0⟩ + (C/λ_j)|1⟩, successfully embedding 1/λ_j into the amplitude of |1⟩.",
    "circuit": {
      "qubits": 3,
      "gates": [
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "RY",
          "q": 2,
          "theta": 1.2
        }
      ]
    }
  },
  "hhl-phase-6": {
    "id": "hhl-phase-6",
    "type": "multiple-choice",
    "question": "Why is 'uncomputation' (applying Inverse Quantum Phase Estimation QPE†) mandatory after the controlled rotation?",
    "options": [
      "To cool down the quantum processor.",
      "To disentangle the clock register from the target qubits and ancilla, returning the clock register to |0...0⟩ so it can be discarded without collapsing the solution.",
      "To invert the matrix a second time.",
      "To delete classical memory."
    ],
    "correctIndex": 1,
    "hints": [
      "The clock register is entangled with the target and ancilla qubits: ∑ (C/λ_j)|λ_j⟩|u_j⟩|1⟩.",
      "If the clock register is measured or discarded while entangled, it collapses the superposition into a single eigenstate rather than the linear combination |x⟩."
    ],
    "explanation": "Without uncomputation, the clock register remains entangled with the eigenvalues. Applying QPE† uncomputes the clock register back to |0...0⟩, isolating the solution state |x⟩ = ∑ (β_j/λ_j)|u_j⟩ on the target register.",
    "circuit": {
      "qubits": 3,
      "gates": [
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "H",
          "q": 1
        }
      ]
    }
  },
  "hhl-phase-7": {
    "id": "hhl-phase-7",
    "type": "statevector",
    "question": "After uncomputation, the state is |Ψ⟩ = |0...0⟩_clock ⊗ [ |ψ_fail⟩|0⟩_anc + C (∑_j (β_j/λ_j)|u_j⟩) |1⟩_anc ]. What does the user do to extract the solution?",
    "expression": "P(|1⟩_{anc}) = C^2 \\sum |\\beta_j / \\lambda_j|^2 = C^2 ||x||^2",
    "answer": "Measure the ancilla qubit; if outcome is 1 (post-selection success), the register collapses to exact solution |x⟩",
    "options": [
      "Measure all qubits immediately in the Z-basis",
      "Measure only the ancilla qubit; if the outcome is |1⟩, post-selection succeeds and the target register is projected into |x⟩",
      "Discard the ancilla and assume outcome was 0",
      "Apply a Hadamard gate to all qubits"
    ],
    "correctIndex": 1,
    "hints": [
      "The target state |x⟩ is tagged by the ancilla qubit being in state |1⟩.",
      "Post-selecting on ancilla outcome |1⟩ projects the target register into |x⟩."
    ],
    "explanation": "The user measures the single ancilla qubit. If outcome |1⟩ is observed, the measurement post-selects the system onto the exact normalized quantum solution state |x⟩ = A^{-1}|b⟩ / ||A^{-1}|b⟩||. If outcome |0⟩ occurs, the run failed and is repeated.",
    "circuit": {
      "qubits": 3,
      "gates": [
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "RY",
          "q": 2,
          "theta": 1.0
        }
      ]
    }
  },
  "hhl-phase-8": {
    "id": "hhl-phase-8",
    "type": "circuit-analysis",
    "question": "What is the condition number κ of a matrix A, and how does it affect HHL performance?",
    "circuitSummary": "Condition number κ = λ_max / λ_min.",
    "expectedObservation": "If κ is very large (ill-conditioned matrix), success probability drops as O(1/κ²), requiring amplitude amplification.",
    "options": [
      "κ is the number of rows in A",
      "κ = λ_max / λ_min; the probability of post-selecting ancilla |1⟩ scales as O(1/κ²), meaning ill-conditioned matrices require more repetitions",
      "κ is the temperature of the chip",
      "κ has no effect on runtime"
    ],
    "correctIndex": 1,
    "hints": [
      "To prevent the rotation angle arcsin(C/λ) from exceeding 1, constant C must be chosen proportional to λ_min.",
      "The probability of obtaining |1⟩ on the ancilla is proportional to C² ~ 1/κ²."
    ],
    "explanation": "The condition number κ = λ_max / λ_min measures matrix sensitivity. Because C must be scaled by λ_min to keep rotation angles valid, the probability of measuring ancilla |1⟩ is proportional to 1/κ². Ill-conditioned systems require O(κ) amplitude amplification repetitions.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "hhl-phase-9": {
    "id": "hhl-phase-9",
    "type": "multiple-choice",
    "question": "Can a user directly read out all N entries of the classical solution vector x from the quantum state |x⟩ in polynomial time?",
    "options": [
      "Yes, by taking a screenshot of the quantum screen.",
      "No! Extracting all N classical components x_1, ..., x_N requires quantum state tomography, which requires at least O(N) measurements, completely destroying the exponential speedup.",
      "Yes, Qiskit prints all N entries in O(1) time.",
      "No, because |x⟩ does not contain numbers."
    ],
    "correctIndex": 1,
    "hints": [
      "This is known as the 'input/output caveat' of quantum algorithms (Aaronson, 2015).",
      "Measuring |x⟩ yields only a single random basis state |i⟩ with probability |x_i|²."
    ],
    "explanation": "This is the crucial caveat of HHL: the algorithm outputs a quantum state |x⟩, NOT a classical text file of numbers! Reading all N coordinates classically requires O(N) measurements, destroying the speedup. HHL provides an advantage only when estimating expectation values ⟨x|M|x⟩.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "hhl-phase-10": {
    "id": "hhl-phase-10",
    "type": "prediction",
    "question": "Under what condition does HHL provide a genuine exponential advantage over classical linear solvers?",
    "options": [
      "Always, for every matrix A and vector b.",
      "When matrix A is sparse and well-conditioned (κ = O(poly(log N))), state |b⟩ can be prepared in O(poly(log N)) gates, and the user only needs an expectation value ⟨x|M|x⟩ rather than all classical coordinates.",
      "Only when matrix A is diagonal with all 1s.",
      "Only when N < 4."
    ],
    "correctIndex": 1,
    "hints": [
      "HHL requires three conditions: efficient state prep of |b⟩, efficient Hamiltonian simulation of A (sparsity), and expectation value readout.",
      "If any condition fails, the exponential speedup is lost."
    ],
    "explanation": "Scott Aaronson formalised the four strict requirements for HHL quantum advantage: (1) state |b⟩ must be efficiently preparable, (2) A must be s-sparse and well-conditioned, (3) Hamiltonian simulation e^{iAt} must be efficient, and (4) the user desires a global observable ⟨x|M|x⟩.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "hhl-phase-11": {
    "id": "hhl-phase-11",
    "type": "code-completion",
    "question": "In Qiskit, which algorithm class in `qiskit_algorithms` implements the HHL linear solver?",
    "starterCode": "# from qiskit_algorithms import HHL\n# solver = HHL()",
    "expectedAnswer": "HHL",
    "options": [
      "HHL",
      "LinearSolver",
      "MatrixInverter",
      "QPE_Solver"
    ],
    "correctIndex": 0,
    "hints": [
      "The class name is the exact three-letter acronym of Harrow, Hassidim, and Lloyd.",
      "It is found in `qiskit_algorithms`."
    ],
    "explanation": "Qiskit implements the algorithm under the `HHL` class in `qiskit_algorithms`, orchestrating state preparation, Quantum Phase Estimation, controlled eigenvalue rotation, and uncomputation.",
    "circuit": {
      "qubits": 2,
      "gates": [
        {
          "g": "H",
          "q": 0
        }
      ]
    }
  },
  "hhl-phase-12": {
    "id": "hhl-phase-12",
    "type": "prediction",
    "question": "What is the educational purpose of the 2-qubit or 3-qubit HHL circuit demonstration in QubitLab?",
    "options": [
      "To replace commercial supercomputer linear algebra libraries today.",
      "To demonstrate the quantum mechanics of phase estimation, eigenvalue inversion, and post-selection on a tractable 2×2 or 4×4 matrix example.",
      "To factor 1024-bit RSA keys.",
      "To mine cryptocurrency."
    ],
    "correctIndex": 1,
    "hints": [
      "Small 2-qubit instances invert matrices like [[1, 0], [0, 2]] or [[1.5, 0.5], [0.5, 1.5]].",
      "The purpose is understanding the step-by-step quantum pipeline."
    ],
    "explanation": "Small educational instances of HHL demonstrate how Quantum Phase Estimation and controlled rotations work in harmony to invert matrix eigenvalues without pretending to be a scalable production linear solver.",
    "circuit": {
      "qubits": 3,
      "gates": [
        {
          "g": "H",
          "q": 0
        },
        {
          "g": "H",
          "q": 1
        },
        {
          "g": "RY",
          "q": 2,
          "theta": 1.2
        }
      ]
    }
  }
};

export const curriculumCheckpoints: Record<string, CheckpointDefinition> = {
  "bb84-phase-4": {
    "title": "Checkpoint 1: Non-Orthogonal State Discrimination",
    "conceptSummary": "You have mastered computational (Z) and diagonal (X) bases, their orthonormal properties, and why quantum mechanics prevents non-orthogonal states from being copied or measured without disturbance.",
    "question": "If a photon is prepared in state |+⟩ and measured in the Z-basis, can the receiver determine with certainty that the photon was originally |+⟩ rather than |-⟩?",
    "options": [
      "Yes, because outcome 0 always indicates |+⟩.",
      "No, because both |+⟩ and |-⟩ produce outcomes 0 and 1 with equal 50% probability in the Z-basis.",
      "Yes, because phase information is preserved during Z measurement.",
      "No, because photons cannot be measured."
    ],
    "correctIndex": 1,
    "explanation": "Both |+⟩ and |-⟩ have |⟨0|ψ⟩|² = 1/2 and |⟨1|ψ⟩|² = 1/2. Measuring in the Z-basis yields completely random outcomes for both states, destroying the phase distinction. To distinguish |+⟩ from |-⟩, one must measure in the X-basis."
  },
  "bb84-phase-8": {
    "title": "Checkpoint 2: Sifting & Public Channel Safety",
    "conceptSummary": "Alice and Bob discard basis mismatches. Because bases are announced only after all photons have been measured, an eavesdropper cannot retroactively adjust her measurements.",
    "question": "Why does Alice wait until Bob confirms receipt of all photons before publicly announcing her basis choices?",
    "options": [
      "To save internet bandwidth.",
      "Because if Alice announced her bases beforehand, Eve could measure every photon in the correct basis without creating any error.",
      "Because quantum states can only travel through optical fiber if bases are unknown.",
      "To synchronize the laser clocks."
    ],
    "correctIndex": 1,
    "explanation": "If Eve knew the bases in advance, she could measure each photon in Alice's exact basis and retransmit it, cloning the key undetected. Announcing bases after Bob measures forces Eve to guess bases blindly, inevitably triggering the 25% error rate."
  },
  "bb84-phase-12": {
    "title": "Checkpoint 3: Quantum Key Distribution Protocol Synthesis",
    "conceptSummary": "BB84 combines quantum physics (No-Cloning, state collapse) with classical cryptography (error estimation, privacy amplification, One-Time Pad) to guarantee unconditional security.",
    "question": "What is the primary physical law that prevents Eve from copying Alice's quantum state without alerting Bob?",
    "options": [
      "Heisenberg Uncertainty & The No-Cloning Theorem",
      "The Law of Universal Gravitation",
      "Shannon's Source Coding Theorem",
      "Moore's Law"
    ],
    "correctIndex": 0,
    "explanation": "The No-Cloning Theorem (Wootters, Zurek, and Dieks, 1982) proves that linearity in quantum mechanics forbids the creation of an identical copy of an arbitrary unknown quantum state. Any intercept-resend measurement irreversibly perturbs the state."
  },
  "dj-phase-4": {
    "title": "Checkpoint 1: Ancilla State Preparation",
    "conceptSummary": "Ancilla preparation transforms |0⟩ into |-⟩ = (|0⟩ - |1⟩)/√2 using gate sequence X followed by H.",
    "question": "What happens if a student accidentally forgets the X gate on the ancilla, applying only H|0⟩ = |+⟩ before the oracle?",
    "options": [
      "Phase kickback fails because |y ⊕ f(x)⟩ on |+⟩ yields (+1)^f(x) = +1, leaving no phase information on the input register.",
      "The circuit operates identically.",
      "The state blows up into infinite dimensions.",
      "The ancilla qubit is destroyed."
    ],
    "correctIndex": 0,
    "explanation": "Because |+⟩ = (|0⟩ + |1⟩)/√2, evaluating |0 ⊕ f(x)⟩ + |1 ⊕ f(x)⟩ always yields |0⟩ + |1⟩ = |+⟩ with a positive sign regardless of whether f(x) is 0 or 1. No (-1)^f(x) phase is created, and the algorithm fails completely."
  },
  "dj-phase-8": {
    "title": "Checkpoint 2: Quantum Interference & Global Property Extraction",
    "conceptSummary": "Deutsch-Jozsa demonstrates quantum parallelism: by superposing all inputs, a single query evaluates a global property (constant vs balanced) via constructive/destructive interference.",
    "question": "How many values of f(x) does a student learn individually after executing the Deutsch-Jozsa algorithm?",
    "options": [
      "All 2^n values",
      "Exactly half the values",
      "Zero individual values; only the global property (constant vs balanced) is extracted",
      "Exactly one random value"
    ],
    "correctIndex": 2,
    "explanation": "This is the essence of quantum algorithmic power: the interference pattern reveals a global property of the function (balanced vs constant) while providing zero information about any individual evaluation f(x)."
  },
  "dj-phase-12": {
    "title": "Checkpoint 3: Deutsch-Jozsa Synthesis & Circuit Assembly",
    "conceptSummary": "H^⊗n |0⟩^⊗n prep -> Ancilla |-⟩ -> U_f oracle -> H^⊗n interference -> Measure input register. |00...0⟩ means constant; any non-zero means balanced.",
    "question": "In a 3-qubit input Deutsch-Jozsa circuit, Bob measures '010'. What is the definitive conclusion?",
    "options": [
      "The function is constant.",
      "The function is balanced.",
      "The circuit encountered decoherence.",
      "The result is inconclusive; more queries are needed."
    ],
    "correctIndex": 1,
    "explanation": "Because '010' is not the all-zero state '000', the amplitude at |000⟩ is not 1. This guarantees that destructive interference canceled the all-zeros component, proving conclusively with 100% certainty that the function is balanced in just 1 query."
  },
  "grover-phase-4": {
    "title": "Checkpoint 1: Phase Inversion Oracle",
    "conceptSummary": "The Grover oracle does not flip a classical bit in an output register; it flips the mathematical phase of the target state: U_w |x⟩ = (-1)^[x==w] |x⟩.",
    "question": "If the oracle flips the phase of target state |w⟩ from +0.5 to -0.5, why doesn't an immediate measurement immediately find |w⟩ with higher probability?",
    "options": [
      "Because measurement probability is P(x) = |amplitude|², and |-0.5|² = |+0.5|² = 0.25 (probabilities are unchanged).",
      "Because the oracle destroys the qubit.",
      "Because negative probabilities are physically impossible.",
      "Because the phase flip only affects the ancilla."
    ],
    "correctIndex": 0,
    "explanation": "Born's rule takes the squared magnitude of the complex amplitude. Since |-0.5|² = 0.25, the measurement probability is identical before and after the oracle! The diffusion operator is required to convert this phase difference into an amplitude difference."
  },
  "grover-phase-8": {
    "title": "Checkpoint 2: Amplitude Amplification Geometry",
    "conceptSummary": "Grover's algorithm rotates the state in a 2D plane spanned by the non-target state |s'⟩ and target state |w⟩ by angle 2θ per iteration, where θ = arcsin(1/√N).",
    "question": "What geometric operation does the diffusion operator D = 2|s⟩⟨s| - I perform?",
    "options": [
      "A 90 degree rotation around the Z axis",
      "A reflection across the equal superposition state |s⟩ (inversion about the average amplitude)",
      "A projection that erases all non-target states",
      "A permutation of basis states"
    ],
    "correctIndex": 1,
    "explanation": "The diffusion operator reflects any statevector across the initial state |s⟩. Combined with the oracle's reflection across the target state |w⟩, the product of these two reflections is a pure rotation toward |w⟩ by angle 2θ."
  },
  "grover-phase-12": {
    "title": "Checkpoint 3: Quadratic Speedup & Optimality",
    "conceptSummary": "Grover search requires ~ (π/4)√N queries, which is provably optimal (Bennett, Bernstein, Brassard, Vazirani, 1997). Over-rotation must be avoided.",
    "question": "Why is Grover's O(√N) bound called a 'quadratic speedup'?",
    "options": [
      "Because the circuit uses 2 qubits.",
      "Because the number of queries is the square root of classical search complexity O(N).",
      "Because it squares the size of the database.",
      "Because the speedup only works for quadratic polynomials."
    ],
    "correctIndex": 1,
    "explanation": "Classical search requires O(N) operations. Grover search requires O(√N) operations. Since (√N)² = N, the speedup is quadratic (e.g. 10^12 operations reduced to 10^6 operations)."
  },
  "qaoa-phase-4": {
    "title": "Checkpoint 1: Problem Hamiltonian Formulation",
    "conceptSummary": "Combinatorial optimization problems are mapped into Ising spin Hamiltonians where classical bitstrings are eigenstates and cut values correspond to energy eigenvalues.",
    "question": "For a graph with edge (i, j), why does the term (I - Z_i Z_j)/2 evaluate to 0 when qubits i and j have the same bit value?",
    "options": [
      "Because Z|0⟩ = +|0⟩ and Z|1⟩ = -|1⟩; same bits give (+1)(+1)=1 or (-1)(-1)=1, making (1 - 1)/2 = 0.",
      "Because the CNOT gate cancels out.",
      "Because identical qubits cannot interact.",
      "Because the energy of the universe is conserved."
    ],
    "correctIndex": 0,
    "explanation": "Z_i Z_j evaluates to +1 for both |00⟩ and |11⟩. Thus (1 - 1)/2 = 0, contributing 0 to the cut count. For opposite bitstrings |01⟩ and |10⟩, Z_i Z_j = -1, yielding (1 - (-1))/2 = +1."
  },
  "qaoa-phase-8": {
    "title": "Checkpoint 2: The Variational Hybrid Feedback Loop",
    "conceptSummary": "QAOA alternates cost layers U(C, γ) and mixer layers U(M, β), with a classical optimizer updating parameters to maximize the expected cut value.",
    "question": "What role does the mixer unitary U(M, β) = ∏_i RX_i(2β) play in QAOA?",
    "options": [
      "It measures the qubits.",
      "It creates quantum interference between different partition bitstrings, allowing amplitudes to flow toward higher-cut states.",
      "It resets the qubits back to |00...0⟩.",
      "It cools the physical quantum processor."
    ],
    "correctIndex": 1,
    "explanation": "The cost layer applies phase shifts to bitstrings based on their cut values, but does not change state probabilities. The mixer layer applies transverse X rotations that drive interference among all configurations, converting phases into amplified probability amplitudes."
  },
  "qaoa-phase-12": {
    "title": "Checkpoint 3: QAOA Synthesis & Mission Execution",
    "conceptSummary": "You are ready to solve the Graph Partitioning mission in Quantum Studio by configuring CNOT-RZ-CNOT edge gadgets and tuning γ and β.",
    "question": "After running QAOA and measuring 1000 shots on the quantum computer, how do you extract the final classical graph partition?",
    "options": [
      "Average the measured bitstrings into a decimal number.",
      "Identify the most frequently measured bitstring(s) in the output histogram; their bit assignments define the partition.",
      "Run Grover's algorithm on the measurement counts.",
      "Invert the unitary matrix classically."
    ],
    "correctIndex": 1,
    "explanation": "The optimal parameters concentrate probability amplitude on the bitstrings that maximize the cut. In the measurement histogram, the tallest bars (e.g. '0101' and '1010') represent the optimal vertex assignments S and S'."
  },
  "qnn-phase-4": {
    "title": "Checkpoint 1: Quantum Feature Encoding",
    "conceptSummary": "Classical data vectors are embedded into quantum Hilbert space via parameterized unitary feature maps U_Φ(x).",
    "question": "Why is normalizing input feature values into an interval like [0, π] or [0, 2π] critical before feeding them into rotation gates?",
    "options": [
      "Because rotation gates are periodic with period 2π; unnormalized values (e.g. salary = 85,000) cause severe trigonometric aliasing.",
      "Because quantum computers can only process numbers less than 10.",
      "To prevent the qubits from overheating.",
      "Because Qiskit rejects numbers larger than 100."
    ],
    "correctIndex": 0,
    "explanation": "Single-qubit rotation gates like RY(θ) have periodic matrix elements cos(θ/2) and sin(θ/2). If features are not scaled into [0, π] or [0, 2π], two drastically different classical values can produce identical quantum states due to modulo 2π wrapping."
  },
  "qnn-phase-8": {
    "title": "Checkpoint 2: Quantum Gradients & The Parameter-Shift Rule",
    "conceptSummary": "Exact analytical derivatives ∂⟨O⟩/∂θ on quantum hardware are computed by evaluating expectation values at macroscopic shifts of ±π/2.",
    "question": "Why can't we use standard backpropagation (reverse-mode automatic differentiation) directly on physical quantum hardware?",
    "options": [
      "Because mid-circuit state vectors cannot be stored or inspected classically without collapsing the quantum state.",
      "Because quantum computers do not support Python.",
      "Because classical optimizers cannot read quantum memory.",
      "Because the chain rule does not apply in physics."
    ],
    "correctIndex": 0,
    "explanation": "Classical backpropagation requires caching intermediate layer activations during the forward pass. On physical quantum processors, extracting intermediate state vectors requires projective measurement, which collapses the superposition and destroys the computation."
  },
  "qnn-phase-12": {
    "title": "Checkpoint 3: Quantum Machine Learning Synthesis",
    "conceptSummary": "QNNs combine feature maps U_Φ(x), parameterized ansätze W(θ), observable expectation readout, and classical optimizer parameter updates.",
    "question": "What is the primary factor limiting the depth of QNN circuits on current NISQ hardware?",
    "options": [
      "Quantum decoherence and gate infidelities that wash out the signal into uniform white noise.",
      "A lack of classical RAM.",
      "The speed of light in optical cables.",
      "The operating temperature of the monitor."
    ],
    "correctIndex": 0,
    "explanation": "On NISQ hardware, two-qubit gate errors and decoherence cause deep circuits to decay into the maximally mixed state I/2^n, wiping out gradient signals and classification accuracy. Shallow circuits with high entangling efficiency are required."
  },
  "teleport-phase-4": {
    "title": "Checkpoint 1: Entanglement as a Teleportation Resource",
    "conceptSummary": "An entangled Bell pair |Φ^+⟩ = (|00⟩ + |11⟩)/√2 acts as a quantum channel connecting Alice and Bob before the teleportation protocol begins.",
    "question": "Can Alice and Bob use their pre-shared Bell pair to communicate a classical message without transmitting any physical signal?",
    "options": [
      "No, because local operations by Alice on her qubit leave Bob's reduced density matrix completely unchanged (No-Communication Theorem).",
      "Yes, Alice can send Morse code instantaneously by measuring her qubit.",
      "Yes, by flipping her qubit with X gates.",
      "Only on Tuesdays."
    ],
    "correctIndex": 0,
    "explanation": "The No-Communication Theorem proves that measuring or modifying one half of an entangled pair does not change the statistical distribution of any measurement Bob can perform locally. Classical bits must be transmitted to unlock the information."
  },
  "teleport-phase-8": {
    "title": "Checkpoint 2: Alice's Bell Measurement & Conditional Corrections",
    "conceptSummary": "Alice's Bell-basis measurement collapses the 3-qubit system into one of 4 states, leaving Bob with {I, X, Z, ZX}|ψ⟩.",
    "question": "If Alice measures outcome '10' (q0=1, q1=0), which Pauli operator does Bob apply to recover |ψ⟩?",
    "options": [
      "Pauli Z (phase flip)",
      "Pauli X (bit flip)",
      "Pauli Y",
      "Hadamard gate"
    ],
    "correctIndex": 0,
    "explanation": "When Alice measures '10', Bob's qubit is in state α|0⟩ - β|1⟩. Applying Pauli Z maps α|0⟩ - β|1⟩ to α|0⟩ + β|1⟩ = |ψ⟩."
  },
  "teleport-phase-12": {
    "title": "Checkpoint 3: Complete Teleportation Protocol Mastery",
    "conceptSummary": "Unknown state |ψ⟩ -> Bell pair -> CNOT + H -> 2 classical bits sent -> Bob applies X^m1 Z^m0 -> State |ψ⟩ reconstructed.",
    "question": "Why does quantum teleportation not violate the No-Cloning Theorem?",
    "options": [
      "Because Alice's original state is destroyed by her measurement, leaving only 1 copy of |ψ⟩ in existence at Bob's end.",
      "Because the state is cloned only temporarily.",
      "Because the No-Cloning Theorem only applies to classical computers.",
      "Because Bob gets an imperfect copy."
    ],
    "correctIndex": 0,
    "explanation": "The No-Cloning Theorem states that you cannot make a copy of an unknown state while keeping the original. In teleportation, Alice's measurement destroys her state. The state is transported, not duplicated."
  },
  "qft-phase-4": {
    "title": "Checkpoint 1: Product State Representation & Controlled Phase Rotations",
    "conceptSummary": "QFT factors into a product state of single-qubit rotations with binary fraction phases, implemented via Hadamards and controlled-R_k gates.",
    "question": "What angle does the controlled rotation gate R_3 apply to the target qubit when both qubits are in state |1⟩?",
    "options": [
      "2π / 2³ = 2π / 8 = π/4 radians (45 degrees)",
      "π radians (180 degrees)",
      "π/2 radians (90 degrees)",
      "0 radians"
    ],
    "correctIndex": 0,
    "explanation": "By definition, R_k applies a phase shift of 2π / 2^k to state |1⟩. For k=3, 2π/8 = π/4, which corresponds to the standard T gate rotation."
  },
  "qft-phase-8": {
    "title": "Checkpoint 2: Frequency Detection & Quantum Periodicity",
    "conceptSummary": "QFT transforms spatial periodicity into localized constructive interference peaks in the computational basis, revealing the hidden period.",
    "question": "If an n-qubit register holds a periodic state with period r (where r divides 2^n), how many non-zero basis state spikes appear after QFT?",
    "options": [
      "Exactly r spikes, spaced at integer multiples of 2^n / r",
      "Only 1 spike",
      "2^n spikes",
      "Zero spikes"
    ],
    "correctIndex": 0,
    "explanation": "The Fourier transform of a comb of spacing r is another comb of spacing N/r. The resulting distribution contains exactly r sharp spikes at values k = 0, N/r, 2N/r, ..., (r-1)N/r."
  },
  "qft-phase-12": {
    "title": "Checkpoint 3: QFT Synthesis & Algorithmic Applications",
    "conceptSummary": "QFT runs in O(n²) gates compared to classical FFT's O(n 2^n) operations, powering Shor's algorithm, phase estimation, and quantum linear solvers.",
    "question": "Why is the Inverse QFT (QFT†) rather than the forward QFT used at the end of Quantum Phase Estimation?",
    "options": [
      "Because controlled unitaries encode eigenvalues into phases (frequency space), and QFT† converts those phases back into computational basis states for readout.",
      "Because forward QFT does not work on simulators.",
      "Because QFT† uses fewer gates than QFT.",
      "Because eigenvalues are always negative."
    ],
    "correctIndex": 0,
    "explanation": "Controlled-U operations write the eigenvalue phase θ into the relative phase of the register. Applying the Inverse QFT decodes this phase into binary amplitudes on computational basis states, allowing a standard measurement to read out the eigenvalue directly."
  },
  "simon-phase-4": {
    "title": "Checkpoint 1: The 2-to-1 Entangled Oracle State",
    "conceptSummary": "Simon's oracle evaluates f(x) onto an ancilla register, creating 1/√2^n ∑_x |x⟩|f(x)⟩ where each distinct output pairs with {x, x ⊕ s}.",
    "question": "If f(01) = 10 and the secret string is s = 11, what other input x must also produce output f(x) = 10?",
    "options": [
      "x = 01 ⊕ 11 = 10",
      "x = 00",
      "x = 11",
      "x = 01"
    ],
    "correctIndex": 0,
    "explanation": "By Simon's promise, f(x) = f(x ⊕ s). Given x_0 = 01 and s = 11, the matching collision input is x = 01 ⊕ 11 = 10. Thus f(01) = f(10) = 10."
  },
  "simon-phase-8": {
    "title": "Checkpoint 2: The Orthogonality Condition y · s = 0 (mod 2)",
    "conceptSummary": "Constructive interference ensures that every measured bitstring y is orthogonal to the secret string s over GF(2): y · s = 0 (mod 2).",
    "question": "Can the all-zeros bitstring y = 00...0 be measured in Simon's algorithm?",
    "options": [
      "Yes, because 0 · s = 0 (mod 2) for any string s; however, it provides no information about s.",
      "No, 00...0 is forbidden by quantum mechanics.",
      "Yes, and it immediately reveals s.",
      "Only if s = 0."
    ],
    "correctIndex": 0,
    "explanation": "For y = 00...0, y · s = 0 is trivially satisfied for all s. Thus 00...0 has non-zero amplitude and can be measured, but because it is linearly dependent with everything, it provides zero constraints on s."
  },
  "simon-phase-12": {
    "title": "Checkpoint 3: Simon's Algorithm Synthesis & Quantum Advantage",
    "conceptSummary": "Simon requires O(n) quantum queries and O(n³) classical Gaussian elimination steps, achieving an exponential separation over classical Ω(2^{n/2}) queries.",
    "question": "Why cannot a classical randomized algorithm match Simon's O(n) query complexity?",
    "options": [
      "Because finding collisions among 2^n items classically requires checking at least Ω(2^{n/2}) queries by the Birthday Paradox.",
      "Because classical computers cannot do XOR operations.",
      "Because classical memory is too slow.",
      "Because Simon's problem has no classical solution."
    ],
    "correctIndex": 0,
    "explanation": "A classical algorithm treats f as a black box and can only detect s by finding a collision f(x) = f(y). By the birthday paradox, finding a collision among 2^n outputs requires Ω(2^{n/2}) queries, making polynomial classical scaling impossible."
  },
  "vqe-phase-4": {
    "title": "Checkpoint 1: The Variational Principle & Hamiltonian Representation",
    "conceptSummary": "A molecular Hamiltonian is written as a sum of Pauli strings H = ∑ c_i P_i. By the variational principle, ⟨ψ(θ)|H|ψ(θ)⟩ ≥ E_0.",
    "question": "If a student tests three parameter sets θ_A, θ_B, θ_C and gets energies -1.12 Ha, -1.16 Ha, and -1.05 Ha, which estimate is closest to the true ground state energy?",
    "options": [
      "-1.16 Ha, because the variational principle states that energy is always an upper bound, so lower is closer to E_0.",
      "-1.05 Ha",
      "-1.12 Ha",
      "None of them"
    ],
    "correctIndex": 0,
    "explanation": "Because ⟨H⟩_θ ≥ E_0 always, the lowest energy obtained (-1.16 Ha) is strictly the closest upper bound to the true ground state energy E_0."
  },
  "vqe-phase-8": {
    "title": "Checkpoint 2: Measuring Non-Commuting Pauli Observables",
    "conceptSummary": "Terms that do not commute cannot be measured simultaneously on the same shot; separate circuit runs with basis rotation gates are required.",
    "question": "Why can terms like Z_0 Z_1 and Z_0 I be measured from the same circuit execution, but Z_0 and X_0 cannot?",
    "options": [
      "Z_0 Z_1 and Z_0 I commute and share the computational measurement basis; Z_0 and X_0 do not commute and require different measurement bases.",
      "Because X gates are slower than Z gates.",
      "Because Z_0 is imaginary.",
      "Because only 1 qubit can be measured at a time."
    ],
    "correctIndex": 0,
    "explanation": "Pauli operators that commute (like Z_0 and Z_0 Z_1) share common eigenstates and can be evaluated from the same computational Z-basis measurement shots. Non-commuting operators like Z and X require distinct measurement bases (Z-basis vs X-basis via Hadamard)."
  },
  "vqe-phase-12": {
    "title": "Checkpoint 3: VQE Synthesis & Ground State Exploration",
    "conceptSummary": "Ansatz U(θ)|0⟩ -> Measure Pauli strings -> Sum weighted expectations -> Classical optimizer updates θ -> Convergence to ground state E_0.",
    "question": "What is the primary benefit of the hybrid quantum-classical architecture in VQE?",
    "options": [
      "It keeps the quantum circuit short and shallow, offloading parameter updates to classical computers and enabling execution on NISQ processors.",
      "It eliminates the need for quantum processors.",
      "It turns qubits into classical bits.",
      "It guarantees exact zero error."
    ],
    "correctIndex": 0,
    "explanation": "By delegating parameter optimization, gradient tracking, and convergence testing to classical CPUs, the quantum processor only needs to execute shallow state preparations and measurements, making VQE viable on noisy near-term hardware."
  },
  "shor-phase-4": {
    "title": "Checkpoint 1: The Reduction of Factoring to Order Finding",
    "conceptSummary": "Factoring integer N is solved by finding the period r of modular exponentiation a^x mod N, where a is coprime to N.",
    "question": "If N = 21 and we pick a = 2, we find 2^6 mod 21 = 64 mod 21 = 1. The period is r = 6. What are the candidate factor expressions?",
    "options": [
      "gcd(2³ - 1, 21) = gcd(7, 21) = 7, and gcd(2³ + 1, 21) = gcd(9, 21) = 3",
      "gcd(2 - 1, 21) = 1",
      "21 / 2 = 10.5",
      "r is odd so factoring fails"
    ],
    "correctIndex": 0,
    "explanation": "Because r=6 is even, a^{r/2} = 2³ = 8. Then 8 - 1 = 7, giving gcd(7, 21) = 7. And 8 + 1 = 9, giving gcd(9, 21) = 3. The prime factors of 21 are 3 and 7!"
  },
  "shor-phase-8": {
    "title": "Checkpoint 2: Phase Estimation & Continued Fractions",
    "conceptSummary": "QFT† decodes the periodic state into phase φ = s/r. Continued fractions extracts the exact integer period r.",
    "question": "Why can't we simply multiply the measured decimal phase by 2^m to find r directly?",
    "options": [
      "Because the measurement yields an integer y ≈ s · 2^m / r with statistical and truncation noise, requiring continued fraction rational approximation to isolate the integer denominator r.",
      "Because 2^m is imaginary.",
      "Because quantum measurements are classical bits.",
      "Because phase is always 0."
    ],
    "correctIndex": 0,
    "explanation": "Due to finite register size m, the peak y / 2^m is an approximation to the rational fraction s/r. Continued fractions finds the closest fraction with denominator r < N in polynomial time."
  },
  "shor-phase-12": {
    "title": "Checkpoint 3: Shor's Factoring Synthesis & Cryptographic Reality",
    "conceptSummary": "Superposition -> Modular exponentiation -> QFT† -> Phase measurement -> Continued fractions -> gcd(a^{r/2} ± 1, N) -> Factors p and q.",
    "question": "What is the primary technical obstacle preventing Shor's algorithm from breaking 2048-bit RSA keys on today's quantum computers?",
    "options": [
      "Lack of quantum error correction and fault tolerance; physical qubit error rates are too high to support the millions of gates required for 2048-bit modular exponentiation.",
      "Peter Shor lost the source code.",
      "Python does not support 2048-bit numbers.",
      "Quantum processors cannot connect to the internet."
    ],
    "correctIndex": 0,
    "explanation": "Breaking RSA-2048 requires maintaining quantum coherence across billions of gate operations. Without fault-tolerant quantum error correction and millions of physical qubits, noise corrupts the computation before the modular period can be evaluated."
  },
  "qec-phase-4": {
    "title": "Checkpoint 1: Quantum Error Discretization",
    "conceptSummary": "Any continuous quantum error can be expanded in the Pauli basis {I, X, Y, Z}. Correcting X (bit-flip) and Z (phase-flip) corrects all errors.",
    "question": "Suppose a qubit suffers a small continuous rotation error R_x(ε) = cos(ε/2)I - i sin(ε/2)X where ε = 0.05. How does QEC digitize this error?",
    "options": [
      "The syndrome measurement projects the state: with probability cos²(ε/2) ≈ 0.999 no error occurred, and with probability sin²(ε/2) ≈ 0.0006 a discrete Pauli X error occurred.",
      "The qubit is permanently damaged by 0.05 radians.",
      "The error accumulates continuously into infinity.",
      "QEC cannot fix continuous rotations."
    ],
    "correctIndex": 0,
    "explanation": "This is the magic of quantum error correction: measuring the discrete syndrome observable forces the continuous superposition error to collapse into either a discrete Pauli X error or the identity I. Continuous noise is digitized into discrete, correctable errors!"
  },
  "qec-phase-8": {
    "title": "Checkpoint 2: Syndrome Extraction Without Collapsing Data",
    "conceptSummary": "Ancilla qubits measure parity observables (e.g. Z_0 Z_1, Z_1 Z_2) to pinpoint error locations without measuring individual data qubits.",
    "question": "Why does measuring the observable Z_0 Z_1 reveal whether qubit 0 or qubit 1 flipped, without revealing whether the logical state is |0_L⟩ or |1_L⟩?",
    "options": [
      "Because both |000⟩ and |111⟩ are +1 eigenstates of Z_0 Z_1; the observable measures only relative parity, keeping the logical superposition intact.",
      "Because ancilla qubits are shielded from radiation.",
      "Because Z gates do not commute with measurement.",
      "Because parity is always even in physics."
    ],
    "correctIndex": 0,
    "explanation": "Z_0 Z_1 has eigenvalue (+1)(+1) = +1 on |000⟩, and (-1)(-1) = +1 on |111⟩. Because both basis states have identical parity, measuring the operator yields outcome +1 without disturbing the superposition α|000⟩ + β|111⟩!"
  },
  "qec-phase-12": {
    "title": "Checkpoint 3: Fault Tolerance & The Road to Logical Qubits",
    "conceptSummary": "Physical qubits are noisy; quantum error correction groups hundreds of physical qubits into a single protected logical qubit.",
    "question": "What is the difference between a physical qubit and a logical qubit?",
    "options": [
      "A physical qubit is a noisy hardware component (e.g. a superconducting transmon); a logical qubit is an error-protected quantum state encoded across an ensemble of physical qubits.",
      "Physical qubits are real; logical qubits are software simulations.",
      "Physical qubits only exist in laboratories.",
      "Logical qubits cannot perform quantum gates."
    ],
    "correctIndex": 0,
    "explanation": "A physical qubit is the actual imperfect hardware element (transmon, ion trap, spin qubit). A logical qubit is an abstract, highly resilient quantum state encoded across many physical qubits using an error-correcting code like the surface code."
  },
  "hhl-phase-4": {
    "title": "Checkpoint 1: Quantum Linear Systems Problem & Amplitude Encoding",
    "conceptSummary": "HHL solves A|x⟩ = |b⟩, encoding N-dimensional vectors into log₂(N) qubits with an exponential reduction in state space dimension.",
    "question": "If a classical computer takes O(N³) to invert an N × N matrix directly, how does HHL's O(s² κ² log N) scaling behave as N grows from 1,000 to 1,000,000,000?",
    "options": [
      "HHL scales logarithmically with dimension N (log N doubles), whereas classical O(N³) explodes by a factor of 10^18.",
      "HHL slows down exponentially.",
      "Both algorithms scale identically.",
      "HHL cannot run for N > 100."
    ],
    "correctIndex": 0,
    "explanation": "Because log₂(10^9) ≈ 30 while log₂(10^3) ≈ 10, the quantum runtime barely triples while classical cubic runtime increases by a factor of (10^6)³ = 10^18. This represents an exponential separation in matrix dimension N."
  },
  "hhl-phase-8": {
    "title": "Checkpoint 2: Eigenvalue Inversion via Controlled Rotations",
    "conceptSummary": "QPE extracts eigenvalues λ_j into a clock register; controlled RY rotations encode 1/λ_j onto an ancilla; QPE† uncomputes the clock register.",
    "question": "What is the mathematical consequence of uncomputing the clock register with QPE†?",
    "options": [
      "It restores the clock register to |0...0⟩, removing entanglement between the clock qubits and the target register while preserving the inverted amplitudes (C/λ_j) on |x⟩.",
      "It erases the answer.",
      "It rotates the target register by 180 degrees.",
      "It measures the target register."
    ],
    "correctIndex": 0,
    "explanation": "Uncomputation applies the inverse unitary QPE†, resetting the clock register to |0...0⟩ without disturbing the target register or the post-selection ancilla. This ensures the target register is in the pure coherent linear combination |x⟩."
  },
  "hhl-phase-12": {
    "title": "Checkpoint 3: HHL Synthesis & The Output Caveat",
    "conceptSummary": "HHL prepares quantum state |x⟩ = A^{-1}|b⟩ / ||A^{-1}|b⟩||. It provides exponential speedups for computing global expectations ⟨x|M|x⟩.",
    "question": "Why is HHL not a drop-in replacement for classical linear equation solvers in everyday engineering software?",
    "options": [
      "Because reading out the full classical vector x requires O(N) measurements, matrix A must be sparse, state |b⟩ must be easily preparable, and the matrix must be well-conditioned.",
      "Because HHL only works with complex numbers.",
      "Because linear equations are not useful in engineering.",
      "Because HHL is an analog algorithm."
    ],
    "correctIndex": 0,
    "explanation": "HHL produces the quantum state |x⟩, not a list of classical numbers. Recovering all classical coordinates requires O(N) shots, eliminating the speedup. HHL is intended for evaluating global quantum observables ⟨x|M|x⟩ or serving as a subroutine in quantum machine learning."
  }
};

/**
 * Returns the interactive activity associated with a given phase ID.
 */
export function getCurriculumActivity(phaseId: string): CurriculumActivity | undefined {
  if (!phaseId) return undefined;
  return curriculumActivities[phaseId];
}

/**
 * Returns the milestone checkpoint for a given phase ID, if defined.
 */
export function getCurriculumCheckpoint(phaseId: string): CheckpointDefinition | undefined {
  if (!phaseId) return undefined;
  return curriculumCheckpoints[phaseId];
}

/**
 * Safe local storage manager for phase knowledge state
 */
export function getPhaseKnowledgeState(slug: string, phaseOrder: number): PhaseKnowledgeState {
  const defaultState: PhaseKnowledgeState = {
    started: false,
    completed: false,
    activityAttempts: 0,
    correctAttempts: 0,
    checkpointPassed: false,
    hintsUsed: 0,
  };

  if (typeof window === 'undefined') return defaultState;

  try {
    const raw = localStorage.getItem("qubitlab_curriculum_state_" + slug);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    return parsed[phaseOrder] || defaultState;
  } catch {
    return defaultState;
  }
}

export function savePhaseKnowledgeState(
  slug: string,
  phaseOrder: number,
  stateUpdate: Partial<PhaseKnowledgeState>
): PhaseKnowledgeState {
  const current = getPhaseKnowledgeState(slug, phaseOrder);
  const updated: PhaseKnowledgeState = { ...current, ...stateUpdate };

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem("qubitlab_curriculum_state_" + slug);
      const parsed = raw ? JSON.parse(raw) : {};
      parsed[phaseOrder] = updated;
      localStorage.setItem("qubitlab_curriculum_state_" + slug, JSON.stringify(parsed));
    } catch {}
  }

  return updated;
}
