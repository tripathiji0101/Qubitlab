import type {
  CurriculumActivity,
  CheckpointDefinition,
} from "./curriculumActivities.ts";
import {
  getCurriculumActivity,
  getCurriculumCheckpoint,
} from "./curriculumActivities.ts";


export interface CurriculumPhase {
  id: string;
  order: number;
  title: string;
  duration: string;
  xp_reward: number;
  objective: string;
  whyNecessary?: string;
  explanation: string;
  math?: string;
  circuitConnection?: { gate: string; role: string }[] | string;
  visualIntuition?: string;
  example?: string;
  predictionQuestion?: string;
  verification?: string;
  commonMistakes?: string[];
  checkQuestion?: string;
  checkAnswer?: string;
  prevConnection?: string;
  nextConnection?: string;
  qiskitCode?: string;
  activity?: CurriculumActivity;
  checkpoint?: CheckpointDefinition;
}

export interface ProjectCurriculum {
  projectId: string;
  algorithm: string;
  overview: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  totalDuration: string;
  phases: CurriculumPhase[];
}

export const projectCurricula: Record<string, ProjectCurriculum> = {
  bb84: {
    projectId: "bb84",
    algorithm: "BB84 Protocol (Quantum Key Distribution)",
    overview: "Generate an unconditionally secure cryptographic key between Alice and Bob using single-photon polarization bases and the quantum No-Cloning Theorem.",
    difficulty: "Beginner",
    totalDuration: "65 min",
    phases: [
      {
        id: "bb84-phase-1",
        order: 1,
        title: "Classical Communication & The Eavesdropping Problem",
        duration: "5 min",
        xp_reward: 50,
        objective: "Understand why classical cryptographic key exchange is vulnerable to passive eavesdropping and how quantum mechanics fundamentally changes security guarantees.",
        explanation: "In classical telecommunications, information is transmitted as streams of electrical pulses or laser light containing millions of photons per bit. An eavesdropper (Eve) can tap into the optical fiber, siphon off a minute fraction (e.g. 1%) of the light without disrupting the main signal, measure the bits, and leave Alice and Bob completely unaware of the compromise.\n\nModern asymmetric cryptography (like RSA and Diffie-Hellman) relies on computational hardness assumptions—specifically that factoring large integers or computing discrete logarithms is intractable for classical algorithms. However, Shor's quantum algorithm renders these assumptions obsolete. Quantum Key Distribution (QKD) was invented by Charles Bennett and Gilles Brassard in 1984 (BB84) to provide information-theoretic security based on the immutable laws of quantum physics rather than computational difficulty.",
        math: "In classical channels, an eavesdropper can duplicate information freely because copying classical states does not perturb the source: $\\text{Copy}(x) = (x, x)$. In quantum channels, measurement alters the quantum state, leaving physical evidence of interception.",
        circuitConnection: "In QubitLab, the quantum channel is modeled by transmitting single qubits across quantum wires, where any intermediate measurement gate collapses the superposition.",
        visualIntuition: "Think of classical communication as reading a newspaper aloud—anyone in the room can listen without silencing the speaker. Quantum communication is like transmitting delicate soap bubbles: any attempt to touch or measure a bubble pops it immediately, alerting the recipient.",
        example: "If Alice sends 100 classical bits over fiber, Eve can split 1% of the photon energy, copy all 100 bits perfectly, and Bob will receive 99% of the signal with zero bit errors. Alice and Bob will have no way of knowing their key was stolen.",
        commonMistakes: [
          "Assuming BB84 transmits encrypted secret messages directly. In reality, BB84 only establishes a shared secret random key. The key is subsequently used with a classical One-Time Pad (OTP) or AES-GCM to encrypt messages.",
          "Believing quantum cryptography allows faster-than-light communication. Classical reconciliation messages are strictly required, bounding transmission speed to the speed of light."
        ],
        checkQuestion: "Why can an eavesdropper tap a classical optical fiber without being detected, whereas tapping a quantum single-photon channel is always detected?",
        checkAnswer: "Classical signals contain billions of identical photons per bit; siphoning off a small fraction leaves the remaining photons intact without altering their data. Quantum signals use single photons whose state collapses upon measurement, introducing detectable errors.",
        nextConnection: "Now that we understand why classical channels cannot guarantee tamper-detection, let's explore how single qubits and computational bases represent information quantum mechanically.",
        qiskitCode: "# BB84 relies on single-qubit preparation and measurement\nfrom qiskit import QuantumCircuit\nqc = QuantumCircuit(1, 1)\n# Alice prepares a qubit in the computational basis\nqc.x(0)  # Bit 1\nqc.measure(0, 0)\nprint(qc)"
      },
      {
        id: "bb84-phase-2",
        order: 2,
        title: "Qubits & The Computational Basis (Z-Basis)",
        duration: "5 min",
        xp_reward: 50,
        objective: "Master the computational basis states |0⟩ and |1⟩, orthogonal state representation, and how single classical bits are encoded in quantum states.",
        explanation: "The fundamental unit of quantum information is the qubit. While a classical bit is strictly confined to the discrete values 0 or 1, a qubit's physical state vector $|\\psi\\rangle$ lives in a two-dimensional complex Hilbert space $\\mathbb{C}^2$.\n\nThe computational basis, also called the Rectilinear or $Z$-basis, consists of two orthonormal basis vectors denoted in Dirac ket notation as:\n$|0\\rangle = \\begin{pmatrix} 1 \\\\ 0 \\end{pmatrix}$ and $|1\\rangle = \\begin{pmatrix} 0 \\\\ 1 \\end{pmatrix}$.\n\nThese states are eigenstates of the Pauli $Z$ operator with eigenvalues $+1$ and $-1$ respectively: $Z|0\\rangle = +1|0\\rangle$ and $Z|1\\rangle = -1|1\\rangle$. Because they are orthogonal (their inner product $\\langle 0 | 1 \\rangle = 0$), a measurement in the $Z$-basis can distinguish between $|0\\rangle$ and $|1\\rangle$ with 100% certainty.",
        math: "The computational basis states are orthonormal:\n$$\\langle 0 | 0 \\rangle = 1, \\quad \\langle 1 | 1 \\rangle = 1, \\quad \\langle 0 | 1 \\rangle = 0$$\nAny pure qubit state can be written as:\n$$|\\psi\\rangle = \\alpha |0\\rangle + \\beta |1\\rangle, \\quad |\\alpha|^2 + |\\beta|^2 = 1$$",
        circuitConnection: "In QubitLab, every wire starts in the ground state $|0\\rangle$. Applying a Pauli $X$ (NOT) gate flips $|0\\rangle \\mapsto |1\\rangle$.",
        visualIntuition: "On the Bloch sphere, $|0\\rangle$ is located at the North Pole $(z = +1)$ and $|1\\rangle$ is located at the South Pole $(z = -1)$. Measuring along the $Z$-axis projects the state onto either pole.",
        example: "To encode a classical bit value '0' in the $Z$-basis, Alice leaves her qubit as $|0\\rangle$. To encode '1', Alice applies a Pauli $X$ gate to rotate $|0\\rangle$ to $|1\\rangle$.",
        commonMistakes: [
          "Confusing the probability amplitude $\\alpha$ with the measurement probability. The probability of measuring $|0\\rangle$ is $|\\alpha|^2$, not $\\alpha$.",
          "Assuming orthogonal states cannot be distinguished with certainty. In fact, orthogonal states can ALWAYS be distinguished deterministically by a single measurement in that basis."
        ],
        checkQuestion: "What is the inner product $\\langle 0 | 1 \\rangle$, and what does this value physically imply about measuring these two states?",
        checkAnswer: "The inner product is 0. This means the states are orthogonal, so measuring in the computational basis will distinguish between them with 100% accuracy and zero ambiguity.",
        nextConnection: "If Alice only used the computational basis, Eve could measure in that basis and copy every bit without detection. To prevent this, we must introduce a second, non-orthogonal basis: the Hadamard basis.",
        qiskitCode: "from qiskit import QuantumCircuit\nqc = QuantumCircuit(1)\n# Prepare state |1>\nqc.x(0)\nprint('Qubit prepared in state |1>')"
      },
      {
        id: "bb84-phase-3",
        order: 3,
        title: "Quantum Superposition & The Hadamard Gate",
        duration: "6 min",
        xp_reward: 50,
        objective: "Understand how the Hadamard gate generates equal quantum superpositions and creates the diagonal (X) basis states |+⟩ and |−⟩.",
        explanation: "Quantum superposition allows a qubit to exist simultaneously in a linear combination of basis states. The primary unitary operator that produces superposition from computational basis states is the Hadamard ($H$) gate.\n\nPhysically, the Hadamard gate performs a $90^\\circ$ rotation around the $Y$-axis followed by a $180^\\circ$ reflection across the $X$-axis. When applied to $|0\\rangle$, it creates the symmetric state $|+\rangle$, and when applied to $|1\\rangle$, it creates the anti-symmetric state $|-\\rangle$:\n$$H|0\\rangle = |+\\rangle = \\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}}, \\quad H|1\\rangle = |-\\rangle = \\frac{|0\\rangle - |1\\rangle}{\\sqrt{2}}$$\n\nIn both states, the probability of measuring 0 or 1 in the computational basis is $(1/\\sqrt{2})^2 = 1/2 = 50\\%$. The difference between $|+\\rangle$ and $|-\\rangle$ lies entirely in the relative phase: $|+\\rangle$ has a phase difference of 0 radians, whereas $|-\\rangle$ has a phase difference of $\\pi$ radians ($e^{i\\pi} = -1$).",
        math: "The Hadamard unitary matrix is:\n$$H = \\frac{1}{\\sqrt{2}}\\begin{pmatrix} 1 & 1 \\\\ 1 & -1 \\end{pmatrix}$$\nNotice that $H = H^\\dagger = H^{-1}$, meaning $H$ is Hermitian and self-inverse: $H^2 = I$. Applying $H$ twice returns the qubit to its original state.",
        circuitConnection: "Placing an $H$ gate on a $|0\\rangle$ wire produces $|+\\rangle$. Placing an $X$ gate followed by an $H$ gate on a wire produces $|-\\rangle$.",
        visualIntuition: "On the Bloch sphere, the Hadamard gate rotates the North Pole $(+z)$ to the positive $X$-axis $(+x = |+\\rangle)$ and the South Pole $(-z)$ to the negative $X$-axis $(-x = |-\\rangle)$.",
        example: "If a qubit is in state $|+\\rangle$ and measured in the $Z$-basis, the Born rule gives $P(0) = |\\langle 0 | + \\rangle|^2 = |1/\\sqrt{2}|^2 = 0.5$. The outcome is completely random (like an unbiased coin flip).",
        commonMistakes: [
          "Believing $|+\\rangle$ and $|-\\rangle$ have different probabilities when measured in the $Z$-basis. Both yield 50% probability of 0 and 50% probability of 1. Their distinction is purely in the relative phase.",
          "Thinking superposition means the qubit is secretly 0 or 1 before measurement. Until measured, the qubit is in a genuine coherent linear superposition."
        ],
        checkQuestion: "What is the mathematical result of applying the Hadamard gate twice in succession to the state |0⟩: H(H|0⟩)?",
        checkAnswer: "It returns |0⟩. Since H is unitary and self-inverse (H² = I), applying H to |+⟩ restores the computational ground state |0⟩.",
        nextConnection: "With both the Z-basis and X-basis defined, let's examine what happens when a measurement is performed in a basis different from the preparation basis.",
        qiskitCode: "from qiskit import QuantumCircuit\nqc = QuantumCircuit(1)\nqc.h(0)  # State is now |+>\nqc.h(0)  # State is restored to |0>\nprint('H^2 = I verified')"
      },
      {
        id: "bb84-phase-4",
        order: 4,
        title: "Quantum Measurement & Wavefunction Collapse",
        duration: "5 min",
        xp_reward: 50,
        objective: "Understand the Born rule, projective measurement, and irreversible state collapse in quantum mechanics.",
        explanation: "Quantum measurement is fundamentally non-classical. According to the projection postulate of quantum mechanics (von Neumann measurement), when a quantum system in state $|\\psi\\rangle$ is measured with respect to an orthonormal basis $\\{|m_i\\rangle\\}$, two things occur:\n\n1. **Probabilistic Outcome**: The probability of obtaining outcome $i$ is given by the Born rule: $P(i) = |\\langle m_i | \\psi \\rangle|^2$.\n2. **State Collapse**: Immediately following the measurement, the state vector irreversibly collapses onto the eigenstate corresponding to the observed outcome: $|\\psi\\rangle \\mapsto |m_i\\rangle$.\n\nAll prior superposition and phase information is destroyed. Any subsequent measurement in the exact same basis will yield outcome $i$ with 100% certainty, but the original superposition cannot be recovered.",
        math: "Given $|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle$, a measurement in the $Z$-basis has projector operators $P_0 = |0\\rangle\\langle 0|$ and $P_1 = |1\\rangle\\langle 1|$:\n$$P(0) = \\langle \\psi | P_0 | \\psi \\rangle = |\\alpha|^2, \\quad P(1) = \\langle \\psi | P_1 | \\psi \\rangle = |\\beta|^2$$\nPost-measurement state: $|\\psi'\\rangle = \\frac{P_i |\\psi\\rangle}{\\sqrt{P(i)}} = |i\\rangle$.",
        circuitConnection: "The meter symbol [M] in QubitLab represents projective measurement onto the computational Z-basis, converting quantum amplitudes into classical bits.",
        visualIntuition: "Imagine a spinning coin on a tabletop in dynamic motion (superposition). When your hand slaps it flat to the table (measurement), it is forced into either heads or tails. You cannot deduce how fast it was spinning from the resting coin.",
        example: "Alice prepares $|+\\rangle = \\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}}$. If Eve measures it with a Z-meter, it collapses to either $|0\\rangle$ (50% chance) or $|1\\rangle$ (50% chance). The original $|+\\rangle$ phase coherence is permanently erased.",
        commonMistakes: [
          "Assuming measurement can be made gentler or non-perturbing. In quantum mechanics, extracting information from non-commuting observables unavoidably perturbs the state.",
          "Confusing classical uncertainty (lack of knowledge about a fixed value) with quantum indeterminacy (a state having no definite value prior to measurement)."
        ],
        checkQuestion: "A qubit is in state |+⟩. An observer measures it in the Z-basis and records '0'. What is the quantum state of the qubit immediately after this measurement?",
        checkAnswer: "The state is |0⟩. The wavefunction has collapsed onto the measured eigenstate; it is no longer in state |+⟩.",
        nextConnection: "Now we combine the computational basis and the diagonal basis to understand non-orthogonal bases, the cornerstone of BB84 security.",
        qiskitCode: "from qiskit import QuantumCircuit\nqc = QuantumCircuit(1, 1)\nqc.h(0)\nqc.measure(0, 0)\nprint('Measurement collapses |+> into 0 or 1 with 50% probability')"
      },
      {
        id: "bb84-phase-5",
        order: 5,
        title: "Conjugate & Non-Orthogonal Bases (Z vs X)",
        duration: "6 min",
        xp_reward: 50,
        objective: "Understand mutually unbiased bases (MUBs), the Heisenberg uncertainty relation for Pauli operators, and why conjugate bases prevent simultaneous exact measurement.",
        explanation: "Two orthonormal bases $\\mathcal{B}_1 = \\{|u_1\\rangle, |u_2\\rangle\\}$ and $\\mathcal{B}_2 = \\{|v_1\\rangle, |v_2\\rangle\\}$ in a 2D Hilbert space are termed **mutually unbiased** (or conjugate) if the transition probability between any state in $\\mathcal{B}_1$ and any state in $\\mathcal{B}_2$ is equal to $1/2$:\n$$|\\langle u_i | v_j \\rangle|^2 = \\frac{1}{2} \\quad \\forall i, j \\in \\{1, 2\\}$$\n\nIn BB84, Alice and Bob use two mutually unbiased bases:\n- **Rectilinear ($Z$) Basis**: $\\mathcal{B}_Z = \\{|0\\rangle, |1\\rangle\\}$\n- **Diagonal ($X$) Basis**: $\\mathcal{B}_X = \\{|+\\rangle, |-\\rangle\\}$\n\nNotice that $|\\langle 0 | + \\rangle|^2 = 1/2$, $|\\langle 0 | - \\rangle|^2 = 1/2$, $|\\langle 1 | + \\rangle|^2 = 1/2$, and $|\\langle 1 | - \\rangle|^2 = 1/2$. If a state is prepared in the $Z$-basis and measured in the $X$-basis (or vice versa), the outcome provides zero information about the prepared bit and yields maximum entropy (a purely random result).",
        math: "The Pauli operators $Z$ and $X$ do not commute:\n$$[X, Z] = XZ - ZX = -2iY \\neq 0$$\nBy the Robertson-Schrödinger uncertainty relation: $\\Delta X \\Delta Z \\ge 1$. A quantum state cannot have definite values for both observable bases simultaneously.",
        circuitConnection: "To measure in the $X$-basis on hardware that only has standard $Z$-meters, apply a Hadamard gate $H$ immediately before the measurement: $H |+\\rangle = |0\\rangle$ (measured as 0) and $H |-\\rangle = |1\\rangle$ (measured as 1).",
        visualIntuition: "On the Bloch sphere, the $Z$-axis and $X$-axis are orthogonal to each other in 3D space. Being located on the $X$-axis means the $Z$-coordinate is 0, representing total uncertainty in the $Z$-basis.",
        example: "If Alice sends $|1\\rangle$ and Bob measures in the $X$-basis (by applying $H$ then measuring), Bob will get '0' (state $|+\\rangle$) 50% of the time and '1' (state $|-\\rangle$) 50% of the time.",
        commonMistakes: [
          "Believing 'non-orthogonal bases' means the vectors within a basis are not orthogonal. Within the Z-basis, |0⟩ and |1⟩ are orthogonal. Within the X-basis, |+⟩ and |-⟩ are orthogonal. The bases are non-orthogonal to each other.",
          "Thinking Bob can measure in both bases at the same time on a single photon. Measuring in one basis collapses the state, destroying any possibility of measuring the other basis."
        ],
        checkQuestion: "If a qubit is in state |1⟩ and measured in the X-basis, what is the probability of measuring 0?",
        checkAnswer: "The probability is 50% (or 0.5). Since |1⟩ = (|0⟩ - |1⟩)/√2 = (|+⟩ - |-⟩)/√2, |⟨+|1⟩|² = |-1/√2|² = 1/2.",
        nextConnection: "Now we assemble Alice's encoding strategy: mapping classical bits into one of four quantum states chosen across these two conjugate bases.",
        qiskitCode: "from qiskit import QuantumCircuit\n# To measure in X-basis: apply H before measurement\nqc = QuantumCircuit(1, 1)\nqc.h(0)  # Rotates X-basis states to Z-basis eigenstates\nqc.measure(0, 0)\nprint('X-basis measurement circuit ready')"
      },
      {
        id: "bb84-phase-6",
        order: 6,
        title: "Alice's Bit & Basis Encoding (The 4 States)",
        duration: "5 min",
        xp_reward: 50,
        objective: "Learn the 4-state BB84 encoding scheme mapping random classical bits (0 or 1) and random bases (Z or X) to physical quantum states.",
        explanation: "For every key bit, Alice generates two independent random classical bits:\n1. **Data bit** $b \\in \\{0, 1\\}$\n2. **Basis choice** $a \\in \\{Z, X\\}$\n\nShe then encodes the data bit into a single photon according to the following canonical mapping table:\n- If basis is $Z$ and bit is $0$: prepare $|0\\rangle$ (Identity gate)\n- If basis is $Z$ and bit is $1$: prepare $|1\\rangle$ (Pauli $X$ gate)\n- If basis is $X$ and bit is $0$: prepare $|+\\rangle$ (Hadamard $H$ gate)\n- If basis is $X$ and bit is $1$: prepare $|-\\rangle$ (Pauli $X$ followed by Hadamard $H$)\n\nAlice logs her classical bit and basis choice in private memory and sends the single photon across the quantum optical channel to Bob.",
        math: "The encoding function $E(b, a)$ produces:\n$$E(0, Z) = |0\\rangle, \\quad E(1, Z) = |1\\rangle$$\n$$E(0, X) = H|0\\rangle = |+\\rangle, \\quad E(1, X) = H|1\\rangle = |-\\rangle$$\nNone of the 4 states are universally orthogonal, ensuring that no single measurement can distinguish all four states with certainty.",
        circuitConnection: "In QubitLab, Alice's stage consists of optional X and H gates on qubit 0 to construct one of the four BB84 states.",
        visualIntuition: "Alice selects one of four points on the equator and poles of the Bloch sphere: North Pole (|0⟩), South Pole (|1⟩), Front (|0⟩+|1⟩)/√2, or Back (|0⟩-|1⟩)/√2.",
        example: "Alice rolls two random coins: bit=1, basis=X. She prepares $|-\\rangle$ by executing an $X$ gate followed by an $H$ gate on her qubit wire, then transmits it to Bob.",
        commonMistakes: [
          "Applying $H$ before $X$ when attempting to prepare $|-\\rangle$. $H$ on $|0\\rangle$ produces $|+\\rangle$, and $X$ on $|+\\rangle$ leaves $|+\\rangle$ unchanged! You must apply $X$ first to get $|1\\rangle$, then apply $H$ to obtain $|-\\rangle$.",
          "Publicly announcing the bit or basis before Bob has completed his measurement. The bases must remain secret until all photons are measured."
        ],
        checkQuestion: "To prepare the BB84 state for data bit '1' in the X basis, in what exact sequence must gates be applied to the ground state |0⟩?",
        checkAnswer: "First apply a Pauli X gate (to flip |0⟩ to |1⟩), then apply a Hadamard H gate (to transform |1⟩ into |-⟩).",
        nextConnection: "Now let's examine what Bob does when he receives the incoming single photon from the quantum channel.",
        qiskitCode: "from qiskit import QuantumCircuit\nqc = QuantumCircuit(1)\n# Encode bit=1, basis=X -> State |->\nqc.x(0)\nqc.h(0)\nprint('Alice successfully prepared state |->')"
      },
      {
        id: "bb84-phase-7",
        order: 7,
        title: "Bob's Measurement & Basis Selection",
        duration: "5 min",
        xp_reward: 50,
        objective: "Understand how Bob randomly chooses a measurement basis for each received qubit and records his raw measured bits.",
        explanation: "When Bob receives each incoming single photon, he does not know which basis Alice used to encode it. If Bob could know the basis in advance, he could simply match Alice's basis every time. However, to maintain security against an eavesdropper listening to classical announcements, Alice cannot communicate her basis until after Bob has finished measuring.\n\nTherefore, for each arriving photon, Bob independently and uniformly rolls a random coin to choose his measurement basis $b' \\in \\{Z, X\\}$:\n- If Bob selects the $Z$-basis: he measures the qubit directly with a standard computational basis detector.\n- If Bob selects the $X$-basis: he applies a Hadamard gate $H$ immediately before measuring in the computational basis.\n\nBob records his raw measurement outcome $b_{Bob} \\in \\{0, 1\\}$ and stores the pair $(b', b_{Bob})$ in his private classical register.",
        math: "When Alice's basis $a$ matches Bob's basis $b'$ ($a = b'$):\n$$P(b_{Bob} = b_{Alice}) = 1.0 \\quad (100\\% \\text{ deterministic agreement})$$\nWhen Alice's basis mismatches Bob's basis ($a \\neq b'$):\n$$P(b_{Bob} = 0) = 0.5, \\quad P(b_{Bob} = 1) = 0.5 \\quad (50\\% \\text{ completely uncorrelated})$$",
        circuitConnection: "In QubitLab, Bob's stage is placed after the quantum channel wire, consisting of an optional $H$ gate (if measuring in $X$) followed by the measurement operator [M].",
        visualIntuition: "Imagine Alice places a marble in one of two orientations (Vertical or Horizontal). Bob has two polarized filters (Vertical or Horizontal). If their filters match, the marble passes through predictably. If their filters mismatch, the marble deflects randomly.",
        example: "Alice sent bit 0 in basis X ($|+\\rangle$). Bob randomly chooses basis X. He applies H to $|+\\rangle$, obtaining $|0\\rangle$, and measures 0. Their bits agree perfectly with 100% certainty.",
        commonMistakes: [
          "Assuming Bob can determine whether he used the correct basis from the measurement outcome alone. Bob's measurement outcome is just a single bit (0 or 1); it contains no clue whether it resulted from a matched basis or a random collapse.",
          "Discarding mismatched results before communicating with Alice. Bob has no way of knowing which bases matched until Alice publicly announces her choices."
        ],
        checkQuestion: "If Alice sends |0⟩ (Z-basis) and Bob randomly chooses to measure in the X-basis, what outcome will Bob record?",
        checkAnswer: "Bob will record 0 or 1 with equal 50% probability, because measuring |0⟩ in the X-basis produces purely random results.",
        nextConnection: "With both Alice and Bob having completed transmission and measurement, they now perform the critical classical protocol step: basis sifting.",
        qiskitCode: "from qiskit import QuantumCircuit\nqc = QuantumCircuit(1, 1)\n# If Bob chooses X-basis, he applies H before measuring:\nqc.h(0)\nqc.measure(0, 0)\nprint('Bob measures in the X-basis')"
      },
      {
        id: "bb84-phase-8",
        order: 8,
        title: "Classical Channel & Basis Sifting",
        duration: "5 min",
        xp_reward: 50,
        objective: "Master the sifting protocol where Alice and Bob compare basis choices publicly and discard mismatched bits to distill the sifted key.",
        explanation: "Once all photons have been transmitted and measured, Alice and Bob communicate over an authenticated classical public channel (e.g. standard radio or internet).\n\nAlice publicly broadcasts the list of bases she used for each qubit (e.g., $Z, X, X, Z, \\dots$). Crucially, **she does NOT reveal her actual bit values** (0 or 1).\nBob listens to Alice's announcement and responds publicly for each index, stating whether his basis matched Alice's ($Yes$ or $No$):\n- If their bases **matched** ($a_i = b'_i$), both Alice and Bob keep the corresponding bit in their key register. On average, this occurs $50\\%$ of the time.\n- If their bases **mismatched** ($a_i \\neq b'_i$), both discard that bit entirely, because mismatched measurements yield random noise.\n\nThe resulting filtered sequence of bits is called the **Sifted Key**. In an ideal, noiseless channel without eavesdropping, Alice's sifted key and Bob's sifted key are completely identical.",
        math: "Let $N$ be the number of transmitted photons. Because basis choices are independent and uniform:\n$$P(a_i = b'_i) = P(Z, Z) + P(X, X) = \\frac{1}{4} + \\frac{1}{4} = \\frac{1}{2}$$\nThe expected length of the sifted key is:\n$$L_{sifted} = \\frac{1}{2} N$$",
        circuitConnection: "In classical post-processing in QubitLab, the sifting function filters the simulation results array, preserving only runs where `alice_basis === bob_basis`.",
        visualIntuition: "Think of two people guessing heads or tails simultaneously for 100 rounds. For the ~50 rounds where their guesses coincided, their recorded outcomes form an identical secret list.",
        example: "Alice sends 10 qubits with bases [Z, X, Z, Z, X, X, Z, X, Z, X]. Bob measures in [Z, Z, Z, X, X, Z, Z, X, X, X]. Their bases match at indices 0, 2, 4, 6, 7, 9 (6 out of 10). They discard indices 1, 3, 5, 8. The remaining 6 bits form their sifted key.",
        commonMistakes: [
          "Worrying that an eavesdropper listening to the classical basis announcement learns the key. Knowing *which basis* was used gives Eve zero information about *which bit* (0 or 1) was sent, because knowing the basis without having the uncollapsed photon is useless.",
          "Broadcasting the measured bit values instead of only the basis names. If bit values are broadcast, the key is obviously compromised!"
        ],
        checkQuestion: "If Alice and Bob transmit 1,000 photons in a noiseless channel, approximately how many bits will be retained in their sifted key?",
        checkAnswer: "Approximately 500 bits (50% of the total), because Alice and Bob independently choose between two bases at random, matching half the time.",
        nextConnection: "Now we introduce the threat model: what happens if an eavesdropper (Eve) attempts to intercept the qubits in transit?",
        qiskitCode: "# Sifting algorithm demonstration in Python\nalice_bases = ['Z', 'X', 'Z', 'Z', 'X']\nbob_bases   = ['Z', 'Z', 'Z', 'X', 'X']\nalice_bits  = [1, 0, 1, 1, 0]\nbob_bits    = [1, 1, 1, 0, 0]\n\nsifted_key_alice = [b for b, ab, bb in zip(alice_bits, alice_bases, bob_bases) if ab == bb]\nsifted_key_bob   = [b for b, ab, bb in zip(bob_bits, alice_bases, bob_bases) if ab == bb]\nprint('Sifted key matches:', sifted_key_alice == sifted_key_bob)"
      },
      {
        id: "bb84-phase-9",
        order: 9,
        title: "Eavesdropper Interception & The No-Cloning Theorem",
        duration: "6 min",
        xp_reward: 50,
        objective: "Understand why the No-Cloning Theorem forbids Eve from copying quantum states and how intercept-resend attacks inevitably introduce detectable errors.",
        explanation: "Why can't an eavesdropper (Eve) simply duplicate Alice's incoming photon, keep one copy in quantum memory, forward the other copy to Bob, and measure her copy after Alice announces the bases?\n\nThis is strictly forbidden by the **No-Cloning Theorem** (proved by Wootters, Zurek, and Dieks in 1982). Linear unitary quantum operations cannot create an identical copy of an arbitrary unknown quantum state: there is no unitary operator $U$ such that $U|\\psi\\rangle|0\\rangle = |\\psi\\rangle|\\psi\\rangle$ for all $|\\psi\\rangle$.\n\nBecause Eve cannot clone the photon, her only physical option is the **Intercept-Resend Attack**: Eve captures Alice's photon, guesses a measurement basis, measures the photon (collapsing it), and prepares a brand-new photon in her measured state to send to Bob. Whenever Eve guesses the wrong basis, she scrambles the polarization, irreversibly introducing quantum noise into Bob's measurements.",
        math: "Proof of No-Cloning: Suppose a unitary cloner exists such that $U|\\psi\\rangle|0\\rangle = |\\psi\\rangle|\\psi\\rangle$ and $U|\\phi\\rangle|0\\rangle = |\\phi\\rangle|\\phi\\rangle$. Taking the inner product of both sides:\n$$\\langle \\psi | \\phi \\rangle = (\\langle \\psi | \\phi \\rangle)^2$$\nThis equation holds only if $\\langle \\psi | \\phi \\rangle = 0$ or $1$. Thus, only orthogonal states can be cloned; arbitrary superpositions cannot!",
        circuitConnection: "In QubitLab, Eve's intercept-resend attack is modeled as an intermediate measurement gate followed by basis re-preparation situated between Alice's encoder and Bob's receiver.",
        visualIntuition: "Imagine a secret written in disappearing ink that vanishes forever the instant any light hits it. Eve cannot photograph it without illuminating it, which destroys the secret and leaves scorch marks that Bob will see.",
        example: "Alice sends $|+\\rangle$ (basis X, bit 0). Eve intercepts and guesses basis Z. Eve measures and gets $|0\\rangle$ (50% chance). Eve forwards $|0\\rangle$ to Bob. Bob measures in Alice's correct basis X. Bob gets $|-\\rangle$ (bit 1) with 50% probability! Alice sent 0, but Bob received 1—an error was created!",
        commonMistakes: [
          "Believing the No-Cloning Theorem prevents copying classical files. No-Cloning applies strictly to unknown quantum coherent states, not classical bit strings.",
          "Assuming Eve can avoid detection by measuring very weakly. Quantum estimation theory proves any information gain by an eavesdropper causes proportional state disturbance."
        ],
        checkQuestion: "Why can't Eve tap a quantum channel by creating a perfect clone of each photon and measuring it later?",
        checkAnswer: "The No-Cloning Theorem proves that unitary evolution cannot duplicate an arbitrary unknown quantum state. Any attempt to clone or measure introduces disturbance.",
        nextConnection: "Let's quantify the exact error rate that Eve's interception produces: the Quantum Bit Error Rate (QBER).",
        qiskitCode: "# Simulating Eve's disturbance on a qubit in |+>\nfrom qiskit import QuantumCircuit\nqc = QuantumCircuit(1, 1)\nqc.h(0)        # Alice prepares |+>\nqc.measure(0, 0) # Eve intercepts in Z basis -> collapses to |0> or |1>\nqc.h(0)        # Bob measures in X basis\nqc.measure(0, 0)\nprint('Eve introduces a 25% error rate on sifted bits')"
      },
      {
        id: "bb84-phase-10",
        order: 10,
        title: "Quantum Bit Error Rate (QBER) Calculation",
        duration: "6 min",
        xp_reward: 50,
        objective: "Calculate the exact theoretical error rate introduced by eavesdropping and learn the 11% security threshold for aborting key exchange.",
        explanation: "To detect eavesdropping, Alice and Bob sacrifice a small, randomly chosen subset of their sifted key bits by publicly comparing them over the classical channel.\n\nLet's calculate the theoretical error rate if Eve intercepts 100% of the photons:\n1. Eve has a 50% chance of guessing Alice's basis correctly. In this case, Eve causes 0% error.\n2. Eve has a 50% chance of guessing wrong. When Eve guesses wrong, she collapses the state into the wrong basis. When Bob measures in Alice's basis, he has a 50% chance of getting the wrong bit.\n3. Therefore, the probability of an error on any given sifted bit is:\n$$P(\\text{Error}) = P(\\text{Eve wrong}) \\times P(\\text{Bob error} | \\text{Eve wrong}) = \\frac{1}{2} \\times \\frac{1}{2} = \\frac{1}{4} = 25\\%$$\n\nIf Eve intercepts every photon, Alice and Bob will observe a **25% Quantum Bit Error Rate (QBER)** in their sifted sample! Even if Eve intercepts only a fraction $f$ of photons, she induces an error rate of $\\text{QBER} = 0.25 f$.",
        math: "The Quantum Bit Error Rate is defined as:\n$$\\text{QBER} = \\frac{N_{\\text{errors}}}{N_{\\text{sampled}}}$$\nAccording to the Csiszár-Körner theorem and Shor-Preskill security proof, unconditional secret key extraction is mathematically possible if and only if:\n$$\\text{QBER} < 11.0\\%$$\nIf $\\text{QBER} \\ge 11.0\\%$, Alice and Bob must abort the protocol and discard the key.",
        circuitConnection: "In QubitLab, the mission verification engine measures the simulated error rate between Alice's input bits and Bob's sifted output bits.",
        visualIntuition: "Think of an inspection seal on a secure delivery crate. If the tamper seal shows even a minor hairline fracture above the normal background noise threshold, the recipient rejects the shipment as compromised.",
        example: "Alice and Bob sample 200 bits of their sifted key. If they find 50 mismatched bits ($50/200 = 25\\%$), they know with mathematical certainty that Eve intercepted the transmission, and they abort.",
        commonMistakes: [
          "Assuming Alice and Bob keep the sampled verification bits in their final secret key. The bits revealed during error checking are permanently discarded, because they were broadcast publicly.",
          "Thinking a 0% error rate is possible on real-world hardware. Real optical fibers have dark counts and imperfect polarization optics, typically giving a baseline optical QBER of 1% to 3%."
        ],
        checkQuestion: "If Eve intercepts every photon on a quantum link using the intercept-resend attack, what is the expected error rate (QBER) in the sifted key?",
        checkAnswer: "25% (or 0.25). Eve guesses the wrong basis 50% of the time, and when she does, Bob's measurement in the correct basis yields the wrong bit 50% of the time (0.5 * 0.5 = 0.25).",
        nextConnection: "Once Alice and Bob verify that the QBER is safely below the 11% threshold, they must eliminate remaining noise and eradicate any partial information Eve might have gained.",
        qiskitCode: "# Calculate QBER from sampled bits\nsample_alice = [0, 1, 1, 0, 1, 0, 0, 1]\nsample_bob   = [0, 1, 0, 0, 1, 0, 0, 1]  # 1 bit flip at index 2\nerrors = sum(a != b for a, b in zip(sample_alice, sample_bob))\nqber = errors / len(sample_alice)\nprint(f'Sample QBER: {qber:.2%}')\nassert qber < 0.11, 'Aborting: QBER exceeds security threshold!'"
      },
      {
        id: "bb84-phase-11",
        order: 11,
        title: "Information Reconciliation & Privacy Amplification",
        duration: "5 min",
        xp_reward: 50,
        objective: "Understand classical post-processing steps: Cascade / LDPC error correction and universal hashing for privacy amplification.",
        explanation: "Even when $\\text{QBER} < 11\\%$, two practical issues remain before the key can be used:\n1. **Residual Errors**: Natural environmental noise might leave a 2% bit discrepancy between Alice and Bob's sifted keys.\n2. **Partial Leakage**: Eve might have intercepted a tiny fraction of photons (e.g. 5%), learning partial information without exceeding the abort threshold.\n\nAlice and Bob resolve these through two classical post-processing phases:\n- **Information Reconciliation**: Alice and Bob run an interactive error-correction algorithm (such as Cascade or Low-Density Parity-Check [LDPC] codes) over the classical channel. By exchanging parity checks of bit blocks, they locate and flip erroneous bits until their keys match with 100% agreement.\n- **Privacy Amplification**: Because Eve might have gained partial knowledge from her attacks and the parity exchanges, Alice and Bob compress the reconciled key using universal hash functions (e.g. Toeplitz matrices). If the reconciled key had length $K$ and Eve knows at most $t$ bits, the hashed key of length $M < K - t$ reduces Eve's mutual information to an exponentially negligible fraction.",
        math: "The asymptotic secret key rate $R$ achievable against general attacks is given by the Devetak-Winter formula:\n$$R = 1 - 2 h(e)$$\nwhere $e$ is the QBER and $h(e) = -e \\log_2 e - (1-e) \\log_2(1-e)$ is the binary entropy function. The key rate drops to exactly zero at $e \\approx 11.0\\%$.",
        circuitConnection: "In production QKD systems, these classical reconciliation and hashing routines execute on a paired classical server connected to the quantum key stream.",
        visualIntuition: "Imagine two matching 1,000-piece puzzles where 10 pieces are slightly misaligned. Alice and Bob check small sectors to align every piece (reconciliation). Then they melt down the 1,000 pieces into a solid 500-gram gold ingot (privacy amplification)—Eve's fragmented guesses are completely destroyed.",
        example: "Alice and Bob have a 1,000-bit sifted key with a 3% QBER. They reconcile errors by exchanging parity checks. They estimate Eve could have learned at most 200 bits of information. By hashing the 1,000 bits into a 600-bit key, Eve's expected knowledge of the final key is less than $2^{-50}$ bits.",
        commonMistakes: [
          "Assuming privacy amplification increases the key length. Privacy amplification compresses and shortens the key to squeeze out Eve's partial information.",
          "Believing error reconciliation reveals the entire key to an eavesdropper. Only parity information of blocks is revealed, and the exact amount of leaked parity is subtracted during privacy amplification."
        ],
        checkQuestion: "What is the primary mathematical purpose of privacy amplification in the BB84 protocol?",
        checkAnswer: "To compress the reconciled key using universal hash functions, reducing any partial information an eavesdropper might have acquired to an exponentially negligible level.",
        nextConnection: "We are now ready to assemble the complete end-to-end BB84 protocol into a fully functioning quantum circuit in QubitLab.",
        qiskitCode: "# Concept of privacy amplification: 2-universal hash compression\ndef simple_hash_parity(key_bits, seed_matrix):\n    # Compresses key bits using parity inner products\n    return [sum(k * s for k, s in zip(key_bits, row)) % 2 for row in seed_matrix]\nprint('Privacy amplification reduces Eve\\'s mutual information to near zero')"
      },
      {
        id: "bb84-phase-12",
        order: 12,
        title: "End-to-End BB84 Protocol & Circuit Synthesis",
        duration: "5 min",
        xp_reward: 50,
        objective: "Synthesize all 11 phases into a complete quantum circuit workflow and verify key generation in Quantum Studio.",
        explanation: "You have now mastered the physical and mathematical mechanisms underlying Quantum Key Distribution:\n1. **Alice** prepares qubits in random states $|0\\rangle, |1\\rangle, |+\\rangle, |-\\rangle$ using $X$ and $H$ gates.\n2. **The Channel** transmits photons across fiber or free-space, where any interception collapses superpositions.\n3. **Bob** measures in a randomly chosen basis ($Z$ directly, or $X$ via $H$ then measure).\n4. **Public Sifting** discards mismatched basis attempts over classical channels.\n5. **Security Verification** evaluates the QBER against the 11% threshold.\n6. **Reconciliation & Hashing** deliver an unconditionally secure One-Time Pad key.\n\nIn Quantum Studio, you will construct this circuit wire-by-wire, test different basis configurations, simulate an eavesdropper's disturbance, and verify that the simulator's measurement statistics prove channel security.",
        math: "Summary of BB84 security guarantees:\n$$\\text{No-Cloning} + \\text{State Collapse} + \\text{MUBs} \\implies \\text{Unconditional Security}$$\nUnlike classical RSA, BB84's security is guaranteed by the laws of quantum mechanics.",
        circuitConnection: "Circuit structure in QubitLab:\n- Wire $q_0$: Alice's encoder ($X$ and/or $H$ gates)\n- Mid-wire: Optional Eve interception ($M$ or $H+M$)\n- Wire end: Bob's decoder ($H$ if $X$-basis, then $M$ gate).",
        visualIntuition: "Inspect the Bloch sphere and Q-Sphere during execution. Notice how Alice's pure equatorial or polar states collapse onto computational eigenstates upon measurement.",
        example: "With your circuit complete, run 100 shots without Eve: QBER = 0%, 100% key match. Now insert an intercepting measurement gate: QBER spikes to ~25%, immediately triggering security alarm flags.",
        commonMistakes: [
          "Forgetting to verify the measurement basis alignment before evaluating sifted bit correctness.",
          "Placing multiple measurement gates along a wire without accounting for how the first measurement permanently resets the state."
        ],
        checkQuestion: "What three fundamental quantum principles combine to make BB84 secure against any eavesdropper, regardless of their computational power?",
        checkAnswer: "The No-Cloning Theorem, wavefunction collapse upon measurement, and the uncertainty principle of mutually unbiased (non-orthogonal) bases.",
        nextConnection: "Congratulations! You have completed the BB84 Curriculum. Enter Quantum Studio to build your circuit and claim your Mission 01 XP!",
        qiskitCode: "# Full single-qubit BB84 exchange\nfrom qiskit import QuantumCircuit\nqc = QuantumCircuit(1, 1)\n# Alice: bit=1, basis=X\nqc.x(0)\nqc.h(0)\n# Bob: chooses basis=X\nqc.h(0)\nqc.measure(0, 0)\nprint('BB84 full circuit compiled successfully!')"
      }
    ]
  },
  "deutsch-jozsa": {
    projectId: "deutsch-jozsa",
    algorithm: "Deutsch–Jozsa Algorithm",
    overview: "Determine deterministically in a single quantum query whether an unknown black-box Boolean function is constant or balanced, demonstrating an exponential separation over classical deterministic querying.",
    difficulty: "Beginner",
    totalDuration: "60 min",
    phases: [
      {
        id: "dj-phase-1",
        order: 1,
        title: "The Problem & Classical Query Complexity",
        duration: "5 min",
        xp_reward: 50,
        objective: "Understand the black-box Boolean function problem and why a classical deterministic algorithm requires 2^(n-1) + 1 queries in the worst case.",
        explanation: "Consider an unknown black-box function (an oracle) $f: \\{0, 1\\}^n \\to \\{0, 1\\}$ that takes an $n$-bit binary string as input and outputs a single bit, 0 or 1. We are guaranteed by a promise that the function belongs to one of two categories:\n1. **Constant**: The function outputs the exact same bit (either all 0s or all 1s) for every possible input string.\n2. **Balanced**: The function outputs 0 for exactly half ($2^{n-1}$) of the possible inputs and 1 for the other half ($2^{n-1}$).\n\nThe task is to determine whether $f$ is constant or balanced by querying the oracle.\n\nIn classical computing, how many queries are required in the worst case? If we query the oracle and receive '0' for the first input, then '0' for the second, then '0' for the third, we cannot yet conclude the function is constant—it could be balanced, with the '1's waiting in the unqueried half! To be 100% certain, a classical deterministic algorithm must query more than half of the $2^n$ inputs: exactly $2^{n-1} + 1$ queries.",
        math: "For an $n$-bit input, the total input space has size $N = 2^n$.\nClassical deterministic query complexity:\n$$Q_{classical} = 2^{n-1} + 1$$\nFor $n=3$, $Q = 2^2 + 1 = 5$ queries. For $n=64$, $Q = 2^{63} + 1 \\approx 9.22 \\times 10^{18}$ queries—requiring centuries of compute time!",
        circuitConnection: "In QubitLab, the oracle is an integrated unitary gate $U_f$ connecting the input register wires to an ancilla output wire.",
        visualIntuition: "Imagine an opaque bag containing $2^n$ billiard balls, promised to be either all white (constant) or exactly half white and half black (balanced). If you draw balls one by one and keep pulling white balls, you cannot prove the bag is all-white until you have inspected more than 50% of the entire bag.",
        example: "For $n=2$ (4 possible inputs: 00, 01, 10, 11), a classical algorithm must test $2^{2-1} + 1 = 3$ inputs in the worst case before it can guarantee the function is constant.",
        commonMistakes: [
          "Assuming a classical randomized algorithm cannot succeed faster with high probability. A randomized algorithm can indeed guess correctly with 75% confidence after 2 queries, but Deutsch-Jozsa provides a deterministic 100% guarantee in a single query.",
          "Thinking the algorithm determines *which* constant value (0 or 1) was returned. Deutsch-Jozsa only determines the *global property* (constant vs. balanced)."
        ],
        checkQuestion: "For an input size of n=8 bits (256 possible inputs), how many queries must a deterministic classical algorithm make in the worst case to be 100% certain the function is constant?",
        checkAnswer: "129 queries (2^(8-1) + 1 = 128 + 1). If the first 128 inputs all return 0, the 129th input could still return 1 (balanced) or 0 (constant).",
        nextConnection: "Now that we understand the exponential classical query barrier, let's explore how reversible quantum oracles are mathematically formulated.",
        qiskitCode: "# Classical verification would require looping through inputs\ndef is_constant_classical(f, n):\n    seen = set()\n    for x in range(2**(n-1) + 1):\n        seen.add(f(x))\n        if len(seen) > 1:\n            return 'Balanced'\n    return 'Constant'"
      },
      {
        id: "dj-phase-2",
        order: 2,
        title: "Constant vs. Balanced Boolean Functions",
        duration: "5 min",
        xp_reward: 50,
        objective: "Master the mathematical definition of Boolean functions, truth tables, and why global properties differ from individual point evaluations.",
        explanation: "A Boolean function $f: \\{0, 1\\}^n \\to \\{0, 1\\}$ maps binary strings of length $n$ to a single bit. Let's analyze the smallest non-trivial multi-qubit case, $n = 1$:\nThere are only $2^{2^1} = 2^2 = 4$ possible functions:\n1. $f_1(x) = 0$ for all $x$ $\\implies$ **Constant**\n2. $f_2(x) = 1$ for all $x$ $\\implies$ **Constant**\n3. $f_3(x) = x$ ($f(0)=0, f(1)=1$) $\\implies$ **Balanced**\n4. $f_4(x) = \\neg x$ ($f(0)=1, f(1)=0$) $\\implies$ **Balanced**\n\nNotice that two functions are constant and two are balanced. For $n=2$, there are $2^{2^2} = 16$ functions, of which 2 are constant ($f=0$ and $f=1$) and $\\binom{4}{2} = 6$ are balanced. Deutsch-Jozsa exploits the fact that whether a function is constant or balanced is a **global property** of the entire truth table.",
        math: "A function $f$ is constant if:\n$$\\sum_{x=0}^{2^n-1} f(x) = 0 \\quad \\text{or} \\quad \\sum_{x=0}^{2^n-1} f(x) = 2^n$$\nA function $f$ is balanced if:\n$$\\sum_{x=0}^{2^n-1} f(x) = 2^{n-1}$$",
        circuitConnection: "In quantum circuits, constant functions correspond to oracles that either do nothing (identity) or apply a global Pauli X to the target. Balanced functions correspond to CNOT or multi-controlled CNOT gates.",
        visualIntuition: "Think of an audio waveform. A constant function is a flat DC voltage (zero frequency). A balanced function oscillates between high and low with net zero DC bias.",
        example: "Consider $f(x_1, x_2) = x_1 \\oplus x_2$. The outputs for (00, 01, 10, 11) are (0, 1, 1, 0). Exactly two inputs give 0 and two give 1. This function is balanced.",
        commonMistakes: [
          "Assuming functions that are neither constant nor balanced can be given to the algorithm. The Deutsch-Jozsa algorithm relies on the promise that $f$ is strictly constant or balanced.",
          "Confusing the input register size $n$ with the number of possible inputs $2^n$."
        ],
        checkQuestion: "Is the 2-input Boolean function f(x1, x2) = x1 balanced or constant?",
        checkAnswer: "Balanced. The truth table is: f(00)=0, f(01)=0, f(10)=1, f(11)=1. Exactly two outputs are 0 and two are 1.",
        nextConnection: "To compute this function on a quantum computer, we must implement it reversibly as a unitary operator.",
        qiskitCode: "# Truth table check for balanced function f(x) = x0 ^ x1\ninputs = [(0,0), (0,1), (1,0), (1,1)]\noutputs = [x[0] ^ x[1] for x in inputs]\nprint('Outputs:', outputs)\nprint('Is balanced:', sum(outputs) == len(outputs) // 2)"
      },
      {
        id: "dj-phase-3",
        order: 3,
        title: "The Reversible Quantum Oracle (U_f)",
        duration: "5 min",
        xp_reward: 50,
        objective: "Understand reversible computation, why an ancilla qubit is required, and how the unitary oracle operator U_f is defined.",
        explanation: "Quantum mechanics is strictly reversible: any quantum operation not involving measurement must be described by a unitary matrix $U$ where $U^\\dagger U = I$. Classical Boolean functions like $f(x_1, x_2) = x_1 \\wedge x_2$ (AND) are irreversible: given output '0', you cannot determine whether the input was 00, 01, or 10 (information is erased, dissipating heat according to Landauer's Principle).\n\nTo compute an arbitrary Boolean function $f(x)$ on a quantum computer reversibly, we introduce an auxiliary target qubit called the **ancilla** $|y\\rangle$. The quantum oracle is defined as the $(n+1)$-qubit unitary transformation $U_f$:\n$$U_f |x\\rangle |y\\rangle = |x\\rangle |y \\oplus f(x)\\rangle$$\nwhere $\\oplus$ denotes addition modulo 2 (bitwise XOR).\n\nNotice that applying $U_f$ twice to any state returns the original state because $(y \\oplus f(x)) \\oplus f(x) = y \\oplus 0 = y$. Therefore, $U_f$ is its own inverse ($U_f^2 = I$), making it strictly unitary and reversible!",
        math: "The oracle unitary satisfies:\n$$U_f^\\dagger U_f = I, \\quad U_f = U_f^\\dagger$$\nIt preserves the query state $|x\\rangle$ in the input register while flipping the ancilla $|y\\rangle$ whenever $f(x) = 1$.",
        circuitConnection: "In QubitLab, the input register wires $q_0, \\dots, q_{n-1}$ control target gate(s) on the ancilla wire $q_n$. For example, a CNOT from $q_0$ to $q_n$ implements the balanced oracle $f(x) = x_0$.",
        visualIntuition: "Think of a carbon copy invoice. The input register is the original document; the ancilla is the carbon paper. The input is returned untouched, while the calculation result is stamped onto the ancilla.",
        example: "If $|x\\rangle = |10\\rangle$, $|y\\rangle = |0\\rangle$, and $f(10) = 1$, then $U_f |10\\rangle |0\\rangle = |10\\rangle |0 \\oplus 1\\rangle = |10\\rangle |1\\rangle$.",
        commonMistakes: [
          "Attempting to build an oracle with no ancilla qubit, such as $|x\\rangle \\mapsto |f(x)\\rangle$. This mapping is non-unitary and impossible because it destroys input information whenever $f$ is not a bijection.",
          "Measuring the ancilla inside the oracle. The oracle must remain purely unitary to preserve superposition and quantum interference."
        ],
        checkQuestion: "What is the result of applying the oracle U_f twice in succession: U_f(U_f |x⟩|y⟩)?",
        checkAnswer: "|x⟩|y⟩. Because (y ⊕ f(x)) ⊕ f(x) = y, the oracle is self-inverse (U_f² = I).",
        nextConnection: "Now we look at the input register preparation: using Hadamard gates to query all 2^n inputs simultaneously via quantum parallelism.",
        qiskitCode: "from qiskit import QuantumCircuit\n# 2-qubit system: q0=input, q1=ancilla\noracle = QuantumCircuit(2)\noracle.cx(0, 1)  # Implements f(x) = x\nprint('Reversible oracle U_f for f(x)=x constructed')"
      },
      {
        id: "dj-phase-4",
        order: 4,
        title: "Quantum Parallelism & Equal Superposition",
        duration: "5 min",
        xp_reward: 50,
        objective: "Learn how an n-qubit Hadamard transform creates an equal superposition of all 2^n basis states with equal probability amplitude.",
        explanation: "Before querying the oracle, we initialize all $n$ input qubits to the ground state $|0\\rangle^{\\otimes n}$ and apply a Hadamard gate to every wire:\n$$H^{\\otimes n} |0\\rangle^{\\otimes n} = \\left(\\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}}\\right) \\otimes \\cdots \\otimes \\left(\\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}}\\right) = \\frac{1}{\\sqrt{2^n}} \\sum_{x=0}^{2^n-1} |x\\rangle$$\n\nThis single layer of $n$ Hadamard gates creates an equal, uniform superposition of all $2^n$ computational basis states, each having identical real amplitude $1/\\sqrt{2^n}$.\n\nWhen this superposition enters the oracle $U_f$, linearity dictates that $U_f$ acts on all $2^n$ basis states simultaneously:\n$$U_f \\left( \\frac{1}{\\sqrt{2^n}} \\sum_{x=0}^{2^n-1} |x\\rangle |y\\rangle \\right) = \\frac{1}{\\sqrt{2^n}} \\sum_{x=0}^{2^n-1} |x\\rangle |y \\oplus f(x)\\rangle$$\nThis phenomenon is called **quantum parallelism**: a single physical oracle evaluation processes all $2^n$ inputs simultaneously!",
        math: "For $n=2$ qubits:\n$$H^{\\otimes 2}|00\\rangle = \\frac{1}{2}(|00\\rangle + |01\\rangle + |10\\rangle + |11\\rangle)$$\nEach of the 4 basis states has amplitude $1/2$ and probability $|1/2|^2 = 1/4 = 25\\%$.",
        circuitConnection: "In QubitLab, apply an $H$ gate to every input qubit line at column 0.",
        visualIntuition: "In QubitLab's Q-Sphere visualizer, applying $H^{\\otimes n}$ transforms a single point at the North Pole into $2^n$ identical points distributed with equal brightness across the sphere.",
        example: "With $n=3$, three Hadamard gates prepare a superposition of all 8 numbers from 0 to 7 ($000$ to $111$), each with amplitude $1/\\sqrt{8}$.",
        commonMistakes: [
          "Believing quantum parallelism allows you to measure all $2^n$ answers. Measuring the state collapses it to a single random value $x$. Parallelism is only useful if followed by quantum interference!",
          "Applying $H$ only to the first qubit. To achieve full superposition across the entire input space, every input wire must receive an $H$ gate."
        ],
        checkQuestion: "If you measure an n-qubit register immediately after applying H^(⊗n) to |0...0⟩, what is the probability of observing any specific bitstring x?",
        checkAnswer: "1/2^n (or 1/N). Every state has identical amplitude 1/√2^n, giving equal probability (1/√2^n)² = 1/2^n.",
        nextConnection: "If measuring collapses the superposition, how do we extract the global property? The answer is the crown jewel of quantum algorithms: Phase Kickback.",
        qiskitCode: "from qiskit import QuantumCircuit\nqc = QuantumCircuit(3)\nqc.h([0, 1, 2])  # Equal superposition of 8 states\nprint('3-qubit equal superposition prepared')"
      },
      {
        id: "dj-phase-5",
        order: 5,
        title: "Ancilla Preparation into the |−⟩ State",
        duration: "5 min",
        xp_reward: 50,
        objective: "Understand why the ancilla qubit must be initialized to |1⟩ before applying Hadamard, producing the crucial |−⟩ state.",
        explanation: "In phase 4, we saw that if the ancilla $|y\\rangle$ is in $|0\\rangle$, the oracle merely computes $|x\\rangle |0 \\oplus f(x)\\rangle = |x\\rangle |f(x)\\rangle$. If we measure now, we collapse to a single random input and its output—no better than classical guessing!\n\nTo unlock phase kickback, David Deutsch and Richard Jozsa introduced an ingenious trick: prepare the ancilla qubit in the anti-symmetric state $|-\\rangle$:\n$$|-\\rangle = \\frac{|0\\rangle - |1\\rangle}{\\sqrt{2}}$$\n\nHow do we create $|-\\rangle$? In QubitLab, all qubits start in $|0\\rangle$. If we apply $H$ directly to $|0\\rangle$, we get $|+\\rangle = (|0\\rangle + |1\\rangle)/\\sqrt{2}$. To obtain $|-\\rangle$, we must first flip the qubit to $|1\\rangle$ using a Pauli $X$ gate, and then apply the Hadamard $H$ gate:\n$$|0\\rangle \\xrightarrow{X} |1\\rangle \\xrightarrow{H} |-\\rangle = \\frac{|0\\rangle - |1\\rangle}{\\sqrt{2}}$$",
        math: "Action of gates on the ancilla wire:\n$$X|0\\rangle = |1\\rangle$$\n$$H|1\\rangle = \\frac{1}{\\sqrt{2}}\\begin{pmatrix} 1 & 1 \\\\ 1 & -1 \\end{pmatrix}\\begin{pmatrix} 0 \\\\ 1 \\end{pmatrix} = \\frac{1}{\\sqrt{2}}\\begin{pmatrix} 1 \\\\ -1 \\end{pmatrix} = \\frac{|0\\rangle - |1\\rangle}{\\sqrt{2}} = |-\\rangle$$",
        circuitConnection: "On the bottom ancilla wire $q_{\\text{ancilla}}$, place an $X$ gate at column 0, followed by an $H$ gate at column 1.",
        visualIntuition: "On the Bloch sphere, the $X$ gate flips the ancilla from the North Pole $(+z)$ to the South Pole $(-z)$. The subsequent $H$ gate rotates it to the negative $X$-axis $(-x = |-\\rangle)$.",
        example: "If a student forgets the $X$ gate and applies only $H$, the ancilla is in $|+\\rangle$. As we will see, phase kickback fails completely in $|+\\rangle$ because $(-1)^0 = (+1)^0 = +1$.",
        commonMistakes: [
          "Forgetting the $X$ gate before $H$ on the ancilla wire. This is the single most common student bug in Deutsch-Jozsa circuits!",
          "Putting the $X$ gate after the $H$ gate. $H$ followed by $X$ creates $|+\\rangle$, not $|-\\rangle$."
        ],
        checkQuestion: "What state is produced on a qubit initialized to |0⟩ if you apply an X gate followed by an H gate?",
        checkAnswer: "The state |-⟩ = (|0⟩ - |1⟩)/√2.",
        nextConnection: "Now let's examine what happens when the oracle acts on an input state |x⟩ with the ancilla in state |−⟩: Phase Kickback!",
        qiskitCode: "from qiskit import QuantumCircuit\nqc = QuantumCircuit(1)\nqc.x(0)  # Flip to |1>\nqc.h(0)  # Transform to |->\nprint('Ancilla qubit successfully prepared in state |->')"
      },
      {
        id: "dj-phase-6",
        order: 6,
        title: "The Phase Kickback Mechanism",
        duration: "6 min",
        xp_reward: 50,
        objective: "Master the mathematical physics of phase kickback: transferring function values from the ancilla into the relative phases of the input register.",
        explanation: "Phase kickback is one of the most powerful and fundamental mechanisms in all of quantum computing. It allows an eigenvalue of a target register to be 'kicked back' as a phase factor onto an input register.\n\nLet's evaluate the action of $U_f$ on a basis state $|x\\rangle$ when the ancilla is in $|-\\rangle$:\n$$U_f |x\\rangle |-\\rangle = U_f |x\\rangle \\left( \\frac{|0\\rangle - |1\\rangle}{\\sqrt{2}} \\right) = \\frac{U_f |x\\rangle |0\\rangle - U_f |x\\rangle |1\\rangle}{\\sqrt{2}}$$\nUsing the definition $U_f |x\\rangle |y\\rangle = |x\\rangle |y \\oplus f(x)\\rangle$:\n$$= \\frac{|x\\rangle |0 \\oplus f(x)\\rangle - |x\\rangle |1 \\oplus f(x)\\rangle}{\\sqrt{2}} = |x\\rangle \\left( \\frac{|f(x)\\rangle - |1 \\oplus f(x)\\rangle}{\\sqrt{2}} \\right)$$\n\nNow look closely at the term inside parentheses:\n- **Case 1**: If $f(x) = 0$:\n$$\\frac{|0\\rangle - |1\\rangle}{\\sqrt{2}} = |-\\rangle = (+1) |-\\rangle = (-1)^0 |-\\rangle$$\n- **Case 2**: If $f(x) = 1$:\n$$\\frac{|1\\rangle - |0\\rangle}{\\sqrt{2}} = -\\left(\\frac{|0\\rangle - |1\\rangle}{\\sqrt{2}}\\right) = -|-\\rangle = (-1) |-\\rangle = (-1)^1 |-\\rangle$$\n\nIn both cases, we can write the result compactly as:\n$$U_f |x\\rangle |-\\rangle = (-1)^{f(x)} |x\\rangle |-\\rangle$$\n\nThe ancilla qubit remains completely unchanged in $|-\\rangle$! The function evaluation $f(x)$ has been **kicked back** as an overall phase factor $(-1)^{f(x)}$ multiplying the input state $|x\\rangle$!",
        math: "The fundamental phase kickback identity:\n$$U_f |x\\rangle |-\\rangle = (-1)^{f(x)} |x\\rangle |-\\rangle$$\nNotice that $(-1)^{f(x)} = +1$ when $f(x)=0$, and $(-1)^{f(x)} = -1$ when $f(x)=1$. The Boolean output bit has been converted into a quantum relative phase!",
        circuitConnection: "The oracle $U_f$ acts across all wires, but the ancilla state $|-\\rangle$ factors out completely, leaving the input register in state $\\frac{1}{\\sqrt{2^n}}\\sum_x (-1)^{f(x)}|x\\rangle$.",
        visualIntuition: "Imagine a bicycle wheel. If you push on the pedal (input), the bicycle frame (ancilla) doesn't deform; instead, the torque kicks back into rotating the wheel (phase).",
        example: "If $f(0)=0$ and $f(1)=1$, then $U_f |0\\rangle |-\\rangle = +|0\\rangle |-\\rangle$ and $U_f |1\\rangle |-\\rangle = -|1\\rangle |-\\rangle$. The state of the input register becomes $(|0\\rangle - |1\\rangle)/\\sqrt{2} = |-\\rangle$!",
        commonMistakes: [
          "Thinking phase kickback alters the ancilla's bit value. The ancilla remains in the exact state $|-\\rangle$ throughout the entire operation.",
          "Assuming phase kickback works with $|+\\rangle$. If the ancilla is in $|+\\rangle$, $(|0\\rangle + |1\\rangle) \\to (|f(x)\\rangle + |1 \\oplus f(x)\\rangle) = +(|0\\rangle+|1\\rangle)$. The phase is always $+1$, so zero information is kicked back!"
        ],
        checkQuestion: "What is the quantum state of the system after applying U_f to the state |x⟩|-⟩?",
        checkAnswer: "(-1)^f(x) |x⟩|-⟩. The ancilla remains in state |-⟩, while the phase factor (-1)^f(x) is kicked back to the input state |x⟩.",
        nextConnection: "Now that every basis state $|x\\rangle$ in the superposition has acquired its phase $(-1)^{f(x)}$, we apply a final Hadamard layer to cause quantum interference.",
        qiskitCode: "# Demonstrating phase kickback with a CNOT (oracle for f(x)=x)\nfrom qiskit import QuantumCircuit\nqc = QuantumCircuit(2)\nqc.h(0)  # Input in |+>\nqc.x(1); qc.h(1)  # Ancilla in |->\nqc.cx(0, 1)  # Phase kickback flips |+> to |-> on q0!\nprint('Phase kickback successfully applied')"
      },
      {
        id: "dj-phase-7",
        order: 7,
        title: "Constructive & Destructive Interference",
        duration: "5 min",
        xp_reward: 50,
        objective: "Understand how amplitudes add constructively or cancel destructively based on their relative signs (+1 or −1).",
        explanation: "Quantum algorithms achieve computational advantages through **interference**. In classical probability theory, probabilities are always non-negative real numbers ($P_i \\ge 0$), meaning alternative paths always add up: $P_{total} = P_1 + P_2$.\n\nIn quantum mechanics, probability is the squared magnitude of an amplitude ($P = |\\alpha|^2$), and amplitudes can be positive, negative, or complex numbers. When multiple computational paths lead to the same final state $|y\\rangle$:\n- If their amplitudes have the same sign (e.g. $+1/2$ and $+1/2$), they reinforce each other: $\\alpha_{total} = 1$, giving $P = 100\\%$ (**Constructive Interference**).\n- If their amplitudes have opposite signs (e.g. $+1/2$ and $-1/2$), they cancel each other out completely: $\\alpha_{total} = 0$, giving $P = 0\\%$ (**Destructive Interference**).\n\nIn Deutsch-Jozsa, the phase kickback factor $(-1)^{f(x)}$ assigns either a positive sign ($+1$) or a negative sign ($-1$) to each branch of the superposition.",
        math: "The total state of the input register after the oracle is:\n$$|\\psi_2\\rangle = \\frac{1}{\\sqrt{2^n}} \\sum_{x=0}^{2^n-1} (-1)^{f(x)} |x\\rangle$$\nIf $f$ is constant, all signs are identical: $(-1)^{f(x)} = \\pm 1$ for all $x$.\nIf $f$ is balanced, exactly half the terms have sign $+1$ and half have sign $-1$.",
        circuitConnection: "The relative signs $(-1)^{f(x)}$ prepared by the oracle dictate how the subsequent final Hadamard gates will interfere.",
        visualIntuition: "Think of two sound waves. If two identical sound waves are played in phase (peaks align), the sound doubles in volume (constructive). If one is inverted $180^\\circ$ out of phase (peak meets trough), they produce complete silence (noise-canceling headphones).",
        example: "For $n=1$, if $f$ is balanced with $f(0)=0$ and $f(1)=1$, the state is $(|0\\rangle - |1\\rangle)/\\sqrt{2} = |-\\rangle$. The amplitudes are $+1/\\sqrt{2}$ and $-1/\\sqrt{2}$.",
        commonMistakes: [
          "Assuming negative amplitudes mean negative probabilities. Probability is $|\alpha|^2$, which is always non-negative. A negative amplitude is simply a phase angle of $\pi$ radians ($e^{i\pi} = -1$).",
          "Believing interference happens automatically without a basis rotation. Without the final Hadamard transform, the probabilities $|(-1)^{f(x)} / \sqrt{2^n}|^2 = 1/2^n$ would remain identical for all states!"
        ],
        checkQuestion: "What is the sum of all amplitude signs ∑_{x} (-1)^f(x) when f is a balanced function?",
        checkAnswer: "Zero (0). Because exactly half of the 2^n inputs have f(x)=0 (sign +1) and half have f(x)=1 (sign -1), the sum is 2^(n-1)(+1) + 2^(n-1)(-1) = 0.",
        nextConnection: "Now we apply the final Hadamard layer to convert these phase differences into measurable amplitude differences.",
        qiskitCode: "# Sum of signs for balanced function\nf_balanced = [0, 1, 1, 0]\nsigns = [(-1)**fx for fx in f_balanced]\nprint('Sum of signs:', sum(signs))  # Outputs 0"
      },
      {
        id: "dj-phase-8",
        order: 8,
        title: "The Final Hadamard Transform (H^⊗n)",
        duration: "5 min",
        xp_reward: 50,
        objective: "Understand how applying H^(⊗n) to the input register transforms phase information into population in the ground state |0...0⟩.",
        explanation: "How does a quantum computer convert phase information into measurable probabilities? By applying a final layer of Hadamard gates $H^{\\otimes n}$ to all $n$ input qubits!\n\nRecall the general formula for the multi-qubit Hadamard transform on any basis state $|x\\rangle$:\n$$H^{\\otimes n} |x\\rangle = \\frac{1}{\\sqrt{2^n}} \\sum_{y=0}^{2^n-1} (-1)^{x \\cdot y} |y\\rangle$$\nwhere $x \\cdot y = x_1 y_1 \\oplus x_2 y_2 \\oplus \\dots \\oplus x_n y_n$ is the bitwise inner product modulo 2.\n\nApplying $H^{\\otimes n}$ to our post-oracle state $|\\psi_2\\rangle = \\frac{1}{\\sqrt{2^n}} \\sum_{x} (-1)^{f(x)} |x\\rangle$ gives:\n$$|\\psi_3\\rangle = H^{\\otimes n} |\\psi_2\\rangle = \\frac{1}{2^n} \\sum_{y=0}^{2^n-1} \\left( \\sum_{x=0}^{2^n-1} (-1)^{f(x) \\oplus (x \\cdot y)} \\right) |y\\rangle$$\n\nNow, look specifically at the amplitude of the all-zeros state $|y\\rangle = |00\\dots0\\rangle$. For $y = 0$, the dot product $x \\cdot 0 = 0$ for all $x$, so $(-1)^{x \\cdot 0} = +1$. Therefore, the amplitude $C_{0}$ of the state $|00\\dots0\\rangle$ simplifies to:\n$$C_{0} = \\frac{1}{2^n} \\sum_{x=0}^{2^n-1} (-1)^{f(x)}$$",
        math: "Amplitude of the all-zeros state $|0\\dots0\\rangle$:\n$$C_{0\\dots0} = \\frac{1}{2^n} \\sum_{x=0}^{2^n-1} (-1)^{f(x)}$$\n- **If $f$ is constant** ($f(x) = c$ for all $x$):\n$$C_{0\\dots0} = \\frac{1}{2^n} \\sum_{x=0}^{2^n-1} (-1)^c = \\frac{1}{2^n} \\cdot (\\pm 2^n) = \\pm 1$$\n- **If $f$ is balanced** (equal 0s and 1s):\n$$C_{0\\dots0} = \\frac{1}{2^n} (2^{n-1}(+1) + 2^{n-1}(-1)) = 0$$",
        circuitConnection: "In QubitLab, place an $H$ gate on every input qubit wire immediately after the oracle block. Leave the ancilla wire untouched!",
        visualIntuition: "If $f$ is constant, all paths constructively converge onto $|00\\dots0\\rangle$. If $f$ is balanced, destructive interference completely cancels the amplitude of $|00\\dots0\\rangle$ to zero.",
        example: "For $n=1$, if $f(x)=0$ (constant), state is $|+\\rangle$. Applying $H$ gives $H|+\\rangle = |0\\rangle$ with 100% probability. If $f(x)=x$ (balanced), state is $|-\\rangle$. Applying $H$ gives $H|-\\rangle = |1\\rangle$ with 100% probability.",
        commonMistakes: [
          "Applying a Hadamard gate to the ancilla qubit at this stage. The ancilla has completed its job and should NOT be transformed or measured with the input register.",
          "Forgetting to apply $H$ to all input wires. If one wire is missed, interference will fail on that subspace."
        ],
        checkQuestion: "What is the probability amplitude of measuring |00...0⟩ after the final Hadamard transform if the function f is balanced?",
        checkAnswer: "Exactly 0. Destructive interference completely eliminates all amplitude for |00...0⟩.",
        nextConnection: "Now we analyze the final step: measuring the input register to make our deterministic decision.",
        qiskitCode: "from qiskit import QuantumCircuit\nqc = QuantumCircuit(2)\n# Final Hadamard layer on input qubits only\nqc.h(0)\nprint('Final Hadamard applied to input register')"
      },
      {
        id: "dj-phase-9",
        order: 9,
        title: "Measurement & Deterministic State Readout",
        duration: "5 min",
        xp_reward: 50,
        objective: "Understand how measuring the input register provides a 100% deterministic decision: all-zeros (|00...0⟩) means constant; any non-zero bitstring means balanced.",
        explanation: "After the final Hadamard transform, we measure the $n$ input qubits in the computational basis. Let's analyze the measurement probabilities:\n\n1. **If $f$ is Constant**:\nThe amplitude of $|00\\dots0\\rangle$ is $\\pm 1$. The Born rule gives:\n$$P(|00\\dots0\\rangle) = |\\pm 1|^2 = 1.0 = 100\\%$$\nBecause probabilities must sum to 1, the probability of measuring any other bitstring is exactly 0%!\n**Rule**: If you measure $00\\dots0$, the function is guaranteed to be **CONSTANT**.\n\n2. **If $f$ is Balanced**:\nThe amplitude of $|00\\dots0\\rangle$ is identically 0. The Born rule gives:\n$$P(|00\\dots0\\rangle) = |0|^2 = 0\\%$$\nTherefore, it is physically impossible to measure all zeros. The measurement MUST yield at least one bit with value '1'!\n**Rule**: If you measure anything other than all zeros (e.g. $00\\dots1, 01\\dots0$), the function is guaranteed to be **BALANCED**.\n\nThe algorithm is **100% deterministic**: there is zero probability of error, zero randomness, and no need to repeat the trial.",
        math: "Decision rule:\n$$\\text{Outcome} = \\begin{cases} |00\\dots0\\rangle & \\implies f \\text{ is CONSTANT} \\\\ \\neq |00\\dots0\\rangle & \\implies f \\text{ is BALANCED} \\end{cases}$$\nSuccess probability: $P_{\\text{success}} = 1.0$ (deterministic exact quantum algorithm).",
        circuitConnection: "In QubitLab, place measurement meters [M] on all $n$ input qubits at the final column. Do not measure the ancilla.",
        visualIntuition: "In QubitLab's probability bar chart: for a constant function, the bar for $|00\\dots0\\rangle$ reaches 100% height while all other bars are zero. For a balanced function, the $|00\\dots0\\rangle$ bar is completely empty.",
        example: "In a 3-qubit circuit ($n=2$ inputs), Bob runs the circuit and measures '10'. Because '10' is not '00', Bob instantly concludes with 100% certainty that $f$ is balanced.",
        commonMistakes: [
          "Thinking measuring '01' vs '11' means different things. ANY non-zero bitstring (01, 10, or 11) definitively proves the function is balanced.",
          "Measuring the ancilla and confusing its outcome with the function type. The ancilla's measurement outcome is irrelevant."
        ],
        checkQuestion: "If you run the Deutsch-Jozsa algorithm on a 4-qubit input register and measure the bitstring 0100, what is your conclusion?",
        checkAnswer: "The function is BALANCED. Because the outcome is not all-zeros (0000), it cannot be constant.",
        nextConnection: "Let's reflect on the profound complexity separation this algorithm proves between classical and quantum computing.",
        qiskitCode: "from qiskit import QuantumCircuit\nqc = QuantumCircuit(2, 1)\n# Measuring the input qubit q0 only\nqc.measure(0, 0)\nprint('Decision measurement wired')"
      },
      {
        id: "dj-phase-10",
        order: 10,
        title: "Why One Quantum Query Solves The Problem",
        duration: "5 min",
        xp_reward: 50,
        objective: "Understand how quantum mechanics achieves an exponential query advantage over classical deterministic algorithms through global interference.",
        explanation: "Why can a quantum computer solve in 1 query what requires $2^{n-1} + 1$ classical queries?\n\nThe secret is that the quantum computer does **not** evaluate and read out each individual function value $f(x)$ one by one. If it tried to read out values, quantum state collapse would force it into classical behavior.\n\nInstead, the quantum algorithm computes all $2^n$ values simultaneously into relative phases, and then uses quantum interference to compute a **global functional property** directly into a single observable amplitude ($C_{00\\dots0}$).\n\nThis was the first historical algorithm (published in 1992 by David Deutsch and Richard Jozsa) to demonstrate an **exponential separation** between the deterministic quantum query complexity $\\mathcal{Q}_{E}(f) = 1$ and the deterministic classical query complexity $\\mathcal{D}(f) = 2^{n-1} + 1$.",
        math: "Query complexity comparison:\n$$\\mathcal{Q}_{\\text{quantum}} = 1 \\quad \\text{vs.} \\quad \\mathcal{D}_{\\text{classical}} = 2^{n-1} + 1$$\nRatio of classical queries to quantum queries:\n$$\\text{Speedup} = \\frac{2^{n-1} + 1}{1} = \\mathcal{O}(2^n) \\quad (\\text{Exponential})$$",
        circuitConnection: "Notice that no matter how large $n$ is (whether $n=2$ or $n=100$), the circuit depth remains constant: 1 layer of Hadamards, 1 oracle call, 1 layer of Hadamards, and 1 measurement layer.",
        visualIntuition: "A classical computer is like a person walking through a maze checking each dead end sequentially. A quantum computer floods the entire maze with water at once: the interference pattern of the waves exiting the maze reveals the layout in a single moment.",
        example: "For $n=30$ bits: a classical computer must query the oracle at least $2^{29} + 1 = 536,870,913$ times. At 1 millisecond per query, this takes over 6 days of continuous execution. The quantum computer solves it in a single query taking under 1 microsecond.",
        commonMistakes: [
          "Claiming Deutsch-Jozsa has immediate commercial use. Deutsch-Jozsa is an oracle problem (black-box promise problem); its value is proving that quantum computers can achieve exponential speedups over classical computing.",
          "Overlooking that bounded-error classical randomized algorithms (BPP) can solve the problem with $O(1)$ queries with small probability of error. Deutsch-Jozsa proves separation for exact, deterministic algorithms (EQP vs P)."
        ],
        checkQuestion: "How many quantum queries does the Deutsch-Jozsa algorithm make to the oracle to determine if f is constant or balanced?",
        checkAnswer: "Exactly 1 quantum query, regardless of the input size n.",
        nextConnection: "Before building the final circuit, let's review common circuit bugs and debugging techniques.",
        qiskitCode: "# Demonstrating the query count difference:\nn = 10\nclassical_queries = 2**(n-1) + 1\nquantum_queries = 1\nprint(f'Classical: {classical_queries} queries | Quantum: {quantum_queries} query')"
      },
      {
        id: "dj-phase-11",
        order: 11,
        title: "Common Circuit Mistakes & Debugging",
        duration: "5 min",
        xp_reward: 50,
        objective: "Identify and resolve the three most frequent circuit construction bugs in Deutsch-Jozsa implementations.",
        explanation: "When students build Deutsch-Jozsa circuits in quantum simulators, three recurring bugs account for over 90% of all failures:\n\n1. **Omission of the Ancilla Pauli X Gate**:\nIf you apply $H$ directly to $|0\\rangle$ on the ancilla wire without first applying $X$, the ancilla enters $|+\\rangle$ instead of $|-\\rangle$. Because $(|0\\rangle + |1\\rangle)$ has eigenvalue $+1$ under bit flips, phase kickback fails ($(-1)^0 = +1$). No phase changes occur, and every function (even balanced ones) measures $|00\\dots0\\rangle$.\n\n2. **Applying a Final Hadamard to the Ancilla Wire**:\nThe final Hadamard layer belongs **strictly** on the input register qubits ($q_0, \\dots, q_{n-1}$). Applying $H$ to the ancilla rotates $|-\\rangle$ back to $|1\\rangle$. If you measure the ancilla, you learn nothing new; if you mistakenly include it in your output bitstring, it scrambles your answer.\n\n3. **Incorrect Control-Target Wiring in the Oracle**:\nIn balanced oracles, ensure the input register qubits act as **controls** and the ancilla acts as the **target**. Reversing the control and target flips the inputs instead of kicking back the phase.",
        math: "Debugging checklist:\n$$\\text{Check 1: Ancilla init} = H \\cdot X |0\\rangle = |-\\rangle \\quad (\\text{NOT } H|0\\rangle)$$\n$$\\text{Check 2: Final Hadamards} = H^{\\otimes n} \\otimes I_{\\text{ancilla}}$$\n$$\\text{Check 3: Measurement} = M^{\\otimes n} \\otimes I_{\\text{ancilla}}$$",
        circuitConnection: "In QubitLab, check your gate placements: column 0 has H on all input lines and X on the ancilla; column 1 has H on the ancilla; middle columns have the oracle; penultimate column has H on input lines only.",
        visualIntuition: "Use QubitLab's state vector inspector. Before the oracle, the ancilla must show amplitudes $+1/\\sqrt{2}$ on 0 and $-1/\\sqrt{2}$ on 1 (a relative phase difference of $180^\\circ$).",
        example: "Symptom: A balanced function circuit always measures '00' (claiming it's constant). Diagnosis: Inspect column 0 of the ancilla wire. If there is no red X gate before the blue H gate, add the X gate to restore phase kickback.",
        commonMistakes: [
          "Measuring before applying the final Hadamard layer. If you measure before the final Hadamards, you get random noise with 50% probability on all qubits!",
          "Confusing the ancilla wire with the input wires."
        ],
        checkQuestion: "What symptom occurs in a Deutsch-Jozsa circuit if the student forgets the X gate on the ancilla before the Hadamard gate?",
        checkAnswer: "Phase kickback fails completely, causing balanced functions to incorrectly output all-zeros (|00...0⟩) as if they were constant.",
        nextConnection: "Now you are ready to assemble and execute the complete Deutsch-Jozsa algorithm.",
        qiskitCode: "# Correct Deutsch-Jozsa structure template\nfrom qiskit import QuantumCircuit\nqc = QuantumCircuit(3, 2)  # 2 inputs, 1 ancilla; 2 classical bits\n# 1. State preparation\nqc.h([0, 1])\nqc.x(2); qc.h(2)\n# 2. Oracle (e.g. balanced f(x) = x0 ^ x1)\nqc.cx(0, 2); qc.cx(1, 2)\n# 3. Final Hadamards on inputs\nqc.h([0, 1])\n# 4. Measure inputs\nqc.measure([0, 1], [0, 1])\nprint(qc)"
      },
      {
        id: "dj-phase-12",
        order: 12,
        title: "Full Deutsch–Jozsa Algorithm & Circuit Synthesis",
        duration: "5 min",
        xp_reward: 50,
        objective: "Synthesize the complete Deutsch-Jozsa circuit in Quantum Studio and verify constant vs. balanced functions with 100% deterministic accuracy.",
        explanation: "Congratulations! You have mastered the complete theoretical, mathematical, and circuit principles of the Deutsch–Jozsa algorithm.\n\nLet's review the five stages of your circuit:\n1. **Initialization**: Input register initialized to $|0\\rangle^{\\otimes n}$; ancilla initialized to $|1\\rangle$ via Pauli $X$.\n2. **Superposition**: $H^{\\otimes (n+1)}$ applied across all wires, putting inputs in equal superposition and ancilla in $|-\\rangle$.\n3. **Oracle Query**: $U_f$ applies phase kickback, transforming $|x\\rangle \\mapsto (-1)^{f(x)}|x\\rangle$.\n4. **Interference**: $H^{\\otimes n}$ on the input register focuses constant functions onto $|00\\dots0\\rangle$ and destroys $|00\\dots0\\rangle$ for balanced functions.\n5. **Readout**: Measurement meters on the input register yield $|00\\dots0\\rangle$ (Constant) or $\\neq |00\\dots0\\rangle$ (Balanced) with 100% certainty.\n\nEnter Quantum Studio now to wire your circuit, run the simulator, and claim your Mission 02 XP!",
        math: "The complete unitary operator of the algorithm is:\n$$U_{\\text{DJ}} = (H^{\\otimes n} \\otimes I) \\cdot U_f \\cdot (H^{\\otimes n} \\otimes H X)$$\n$$U_{\\text{DJ}} |0\\dots0\\rangle |0\\rangle = \\begin{cases} \\pm |0\\dots0\\rangle |-\\rangle & \\text{if } f \\text{ is constant} \\\\ \\sum_{y \\neq 0} c_y |y\\rangle |-\\rangle & \\text{if } f \\text{ is balanced} \\end{cases}$$",
        circuitConnection: "In QubitLab, Mission 02 tests your circuit against both constant and balanced oracle configurations to verify that your circuit compiles and satisfies all success criteria.",
        visualIntuition: "Watching the state vector evolution from $|000\\rangle \\to |++-\\rangle \\to (-1)^{f(x)} |++-\\rangle \\to |00-\\rangle$ illustrates the elegance of quantum algorithms.",
        example: "With $n=2$ inputs, compile your circuit: for constant oracles, the outcome histogram shows 100% of counts on '00'. For balanced oracles, counts appear strictly on '01', '10', or '11' with zero counts on '00'.",
        commonMistakes: [
          "Measuring before compiling the circuit in the simulator.",
          "Using more gates than permitted by the mission criteria."
        ],
        checkQuestion: "What is the complete mathematical expression for the state of the input register immediately prior to measurement if f(x) is constant with f(x)=1 for all x?",
        checkAnswer: "-|00...0⟩. The amplitude is -1, so measuring gives |00...0⟩ with probability |-1|² = 100%.",
        nextConnection: "Proceed to Quantum Studio to build your circuit, complete Mission 02, and advance to Level 3: Grover's Algorithm!",
        qiskitCode: "# Execute complete Deutsch-Jozsa\nfrom qiskit import QuantumCircuit\nqc = QuantumCircuit(3, 2)\nqc.h([0, 1]); qc.x(2); qc.h(2)\nqc.cx(0, 2); qc.cx(1, 2)  # Balanced oracle\nqc.h([0, 1])\nqc.measure([0, 1], [0, 1])\nprint('Circuit ready for simulation in Quantum Studio!')"
      }
    ]
  },
  grover: {
    projectId: "grover",
    algorithm: "Grover's Search Algorithm",
    overview: "Search an unsorted database of N items with quadratic speedup O(√N) using amplitude amplification, phase marking, and the Grover diffusion operator.",
    difficulty: "Intermediate",
    totalDuration: "70 min",
    phases: [
      {
        id: "grover-phase-1",
        order: 1,
        title: "The Unstructured Search Problem & Classical Complexity",
        duration: "5 min",
        xp_reward: 50,
        objective: "Understand unstructured database search and why classical algorithms require O(N) operations in the worst and average cases.",
        explanation: "Imagine an unsorted database containing $N = 2^n$ records, exactly one of which contains a target 'marked' item $\\omega$. Because the database has no alphabetical, numerical, or hash-indexed structure, binary search cannot be used.\n\nIn classical computing, the only way to find $\\omega$ is linear brute-force search: check the first item, then the second, then the third, until the marked item is found.\n- In the worst case, the marked item is at the very end of the list, requiring $N$ queries.\n- On average, the marked item is found halfway through, requiring $N/2$ queries.\n\nTherefore, classical unstructured search has linear time complexity $\\mathcal{O}(N)$. If $N = 1,000,000$, a classical computer must inspect 500,000 items on average. Lov Grover discovered in 1996 that a quantum computer can find the marked item in only $\\mathcal{O}(\\sqrt{N})$ queries—a provable quadratic speedup!",
        math: "Classical search complexity:\n$$T_{\\text{classical}} = \\mathcal{O}(N) = \\mathcal{O}(2^n)$$\nGrover's quantum search complexity:\n$$T_{\\text{quantum}} = \\mathcal{O}(\\sqrt{N}) = \\mathcal{O}(2^{n/2})$$\nFor $N = 10^{12}$ (1 trillion items), $\\sqrt{N} = 10^6$ (1 million queries)—a speedup of six orders of magnitude!",
        circuitConnection: "In QubitLab, Grover's algorithm searches across $n$ qubit wires representing an item index space $N = 2^n$.",
        visualIntuition: "Think of a locksmith searching for the one key that opens a vault among 10,000 unlabelled keys. A classical locksmith must test 5,000 keys on average. Grover's quantum algorithm tests all keys simultaneously via interference and finds the key in roughly $\\frac{\\pi}{4}\\sqrt{10,000} \\approx 78$ attempts.",
        example: "For $n=4$ qubits ($N = 16$ items), a classical search requires 8 queries on average and 16 at worst. Grover's algorithm finds the marked item in $\\approx \\frac{\\pi}{4}\\sqrt{16} = \\frac{\\pi}{4}(4) \\approx 3$ iterations with over 96% success probability.",
        commonMistakes: [
          "Assuming Grover's algorithm provides an exponential speedup like Shor's algorithm. Grover provides a polynomial (quadratic) speedup $\\mathcal{O}(\\sqrt{N})$. However, Bennett, Bernstein, Brassard, and Vazirani (BBBV theorem) proved that $\\mathcal{O}(\\sqrt{N})$ is the absolute theoretical limit for any quantum search of an unstructured black box.",
          "Believing Grover's algorithm sorts the database. Grover does not sort data; it locates an item satisfying a specific Boolean predicate."
        ],
        checkQuestion: "If an unsorted database contains 1,000,000 items, approximately how many queries does Grover's algorithm need compared to classical linear search?",
        checkAnswer: "Grover needs approximately (π/4)√1,000,000 ≈ 785 queries, whereas classical search requires 500,000 queries on average (and 1,000,000 in the worst case).",
        nextConnection: "To understand how quantum interference amplifies the marked item, we must visualize Grover's state space as a 2D geometric plane.",
        qiskitCode: "# Comparing classical vs quantum search steps\nimport math\nN = 2**10  # 1024 items\nclassical_avg = N / 2\ngrover_steps = math.floor((math.pi / 4) * math.sqrt(N))\nprint(f'N={N}: Classical avg={classical_avg} | Grover={grover_steps} iterations')"
      },
      {
        id: "grover-phase-2",
        order: 2,
        title: "Geometric Picture of Grover's State Space",
        duration: "6 min",
        xp_reward: 50,
        objective: "Understand how the 2^n-dimensional Hilbert space is reduced to a 2-dimensional plane spanned by the marked state |w⟩ and the unmarked superposition |s'⟩.",
        explanation: "Although the full Hilbert space has dimension $N = 2^n$, Grover's algorithm takes place entirely within a two-dimensional subspace (a plane) spanned by two orthonormal basis vectors:\n1. The **marked target state** $|\\omega\\rangle$: the item we want to find.\n2. The **unmarked superposition state** $|s'\\rangle$: the normalized uniform superposition of all $N-1$ non-target states:\n$$|s'\\rangle = \\frac{1}{\\sqrt{N-1}} \\sum_{x \\neq \\omega} |x\\rangle$$\n\nNotice that $|\\omega\\rangle$ and $|s'\\rangle$ are orthogonal: $\\langle \\omega | s' \\rangle = 0$.\n\nWhen we initialize all $n$ qubits in equal superposition $|s\\rangle = H^{\\otimes n}|0\\rangle^{\\otimes n}$, we can decompose $|s\\rangle$ in this 2D basis as:\n$$|s\\rangle = \\sin(\\theta/2) |\\omega\\rangle + \\cos(\\theta/2) |s'\\rangle$$\nwhere the angle $\\theta$ is determined by the overlap $\\langle \\omega | s \\rangle = 1/\\sqrt{N}$:\n$$\\sin(\\theta/2) = \\frac{1}{\\sqrt{N}}$$\n\nWhen $N$ is large, $\\theta/2 \\approx 1/\\sqrt{N}$ is a tiny angle, meaning $|s\\rangle$ starts nearly parallel to the unmarked axis $|s'\\rangle$. Grover's algorithm rotates the state vector toward $|\\omega\\rangle$ by angle $\\theta$ in each iteration!",
        math: "Decomposition of the initial uniform state $|s\\rangle$:\n$$|s\\rangle = \\sqrt{\\frac{1}{N}}|\\omega\\rangle + \\sqrt{\\frac{N-1}{N}}|s'\\rangle$$\nFor $N \\gg 1$, the angle between $|s\\rangle$ and $|s'\\rangle$ is:\n$$\\theta/2 = \\arcsin(1/\\sqrt{N}) \\approx \\frac{1}{\\sqrt{N}}$$\nEach Grover step rotates the state by angle $\\theta = 2\\arcsin(1/\\sqrt{N})$.",
        circuitConnection: "Every gate in Grover's circuit preserves this 2D invariant subspace, ensuring that amplitudes of all unmarked states remain identical throughout.",
        visualIntuition: "Imagine a 2D clock face where the horizontal axis ($3$ o'clock) is the unmarked state $|s'\\rangle$ and the vertical axis ($12$ o'clock) is the target state $|\\omega\\rangle$. The initial state points almost horizontally at 3 o'clock. Each Grover iteration clicks the clock hand toward 12 o'clock!",
        example: "For $N=4$ ($n=2$), $\\sin(\\theta/2) = 1/\\sqrt{4} = 1/2$, so $\\theta/2 = 30^\\circ$ and $\\theta = 60^\\circ$. A single rotation of $60^\\circ$ moves the state from $30^\\circ$ to $30^\\circ + 60^\\circ = 90^\\circ$—exactly pointing at $|\\omega\\rangle$ with 100% probability in just 1 step!",
        commonMistakes: [
          "Thinking Grover's algorithm searches in a high-dimensional random walk. It is a strictly deterministic rotation in a 2-dimensional plane.",
          "Assuming all basis states rotate independently. All unmarked states maintain identical amplitudes, rotating together as the single composite vector $|s'\\rangle$."
        ],
        checkQuestion: "What two orthogonal quantum states define the 2D plane in which Grover's algorithm rotates?",
        checkAnswer: "The marked target state |ω⟩ and the uniform superposition of all unmarked states |s'⟩ = (1/√(N-1)) ∑_{x≠ω} |x⟩.",
        nextConnection: "Let's examine the first physical circuit step: preparing the uniform superposition state |s⟩ across all qubits.",
        qiskitCode: "# Calculate initial angle theta for N=16\nimport math\nN = 16\ntheta = 2 * math.asin(1 / math.sqrt(N))\nprint(f'N=16: Rotation angle per iteration = {math.degrees(theta):.2f} degrees')"
      },
      {
        id: "grover-phase-3",
        order: 3,
        title: "Equal Superposition Initialization (|s⟩)",
        duration: "5 min",
        xp_reward: 50,
        objective: "Understand the initialization of the n-qubit register into state |s⟩ using a parallel layer of Hadamard gates.",
        explanation: "To give every item in the database an equal initial chance of being found, the input register is initialized into an unbiased equal superposition state $|s\\rangle$:\n$$|s\\rangle = H^{\\otimes n} |0\\rangle^{\\otimes n} = \\frac{1}{\\sqrt{N}} \\sum_{x=0}^{N-1} |x\\rangle$$\n\nIn this state, every basis state $|x\\rangle$ (including the target $|\\omega\\rangle$) has identical real amplitude $1/\\sqrt{N}$ and probability $1/N$.\n\nIf we were to measure the circuit right now, the probability of measuring the marked state would be $P(\\omega) = |1/\\sqrt{N}|^2 = 1/N$, which is no better than guessing blindly at random. The goal of Grover's algorithm is to manipulate the amplitudes using constructive and destructive interference so that $P(\\omega) \\to 100\\%$ while all other amplitudes drop toward $0\\%$.",
        math: "Initial state vector:\n$$|s\\rangle = \\begin{pmatrix} 1/\\sqrt{N} \\\\ 1/\\sqrt{N} \\\\ \\vdots \\\\ 1/\\sqrt{N} \\end{pmatrix}, \\quad P(x) = |\\langle x | s \\rangle|^2 = \\frac{1}{N} \\quad \\forall x$$\nFor $n=3$ qubits ($N=8$): each state has amplitude $1/\\sqrt{8} \\approx 0.354$ and probability $1/8 = 12.5\\%$.",
        circuitConnection: "In QubitLab, column 0 of the circuit contains an $H$ gate on every qubit wire $q_0, \\dots, q_{n-1}$.",
        visualIntuition: "In QubitLab's state amplitude visualizer, this stage renders as a completely flat horizontal bar chart where all $N$ bars have identical positive height $1/\\sqrt{N}$.",
        example: "With $n=2$ qubits, applying $H$ to $q_0$ and $q_1$ produces $\\frac{1}{2}(|00\\rangle + |01\\rangle + |10\\rangle + |11\\rangle)$. Every state has 25% probability.",
        commonMistakes: [
          "Forgetting to apply Hadamard to all qubits, leaving some in $|0\\rangle$. This restricts the search space to a smaller subset of the database.",
          "Measuring immediately after the Hadamards. This collapses the state to a random item without any amplification."
        ],
        checkQuestion: "What is the initial probability of measuring the marked item |ω⟩ immediately after the initial Hadamard layer on an n-qubit register?",
        checkAnswer: "1/N (or 1/2^n), exactly equivalent to a blind random guess.",
        nextConnection: "Now we introduce the first operator of the Grover iteration: the phase oracle that marks the target item.",
        qiskitCode: "from qiskit import QuantumCircuit\nqc = QuantumCircuit(3)\nqc.h([0, 1, 2])\nprint('Grover initial state |s> initialized')"
      },
      {
        id: "grover-phase-4",
        order: 4,
        title: "The Phase Oracle (U_ω: Phase Marking)",
        duration: "6 min",
        xp_reward: 50,
        objective: "Understand how the phase oracle inverts the phase of the marked target state (|w⟩ -> -|w⟩) while leaving unmarked states unchanged.",
        explanation: "How does a quantum computer 'mark' the item we are looking for without measuring it? It flips its **phase**!\n\nThe Grover phase oracle $U_\\omega$ is a unitary operator that recognizes the target state $|\\omega\\rangle$ and negates its amplitude by multiplying it by $-1$, while leaving all other basis states $|x \\neq \\omega\\rangle$ completely untouched:\n$$U_\\omega |x\\rangle = \\begin{cases} -|x\\rangle & \\text{if } x = \\omega \\\\ +|x\\rangle & \\text{if } x \\neq \\omega \\end{cases}$$\n\nIn algebraic operator notation, $U_\\omega$ can be written as a reflection operator:\n$$U_\\omega = I - 2|\\omega\\rangle\\langle \\omega|$$\n\nGeometrically, in our 2D plane spanned by $|s'\\rangle$ and $|\\omega\\rangle$, $U_\\omega$ reflects the state vector across the unmarked axis $|s'\\rangle$! Notice that after this reflection, the probability of measuring $|\\omega\\rangle$ is still $|-1/\\sqrt{N}|^2 = 1/N$—the probability has not changed yet! However, the marked state now has a negative amplitude, setting up the interference in the next step.",
        math: "Matrix representation of $U_\\omega$ in the computational basis for $\\omega = |11\\rangle$ ($N=4$):\n$$U_{\\omega} = \\begin{pmatrix} 1 & 0 & 0 & 0 \\\\ 0 & 1 & 0 & 0 \\\\ 0 & 0 & 1 & 0 \\\\ 0 & 0 & 0 & -1 \\end{pmatrix}$$\nNotice that $U_\\omega |11\\rangle = -|11\\rangle$ and $U_\\omega |x\\rangle = |x\\rangle$ for $x \\neq 11$.",
        circuitConnection: "In QubitLab, if the marked state is $|11\\rangle$, $U_\\omega$ is implemented as a Controlled-Z ($CZ$) gate between $q_0$ and $q_1$. For marked states containing '0's, Pauli $X$ gates wrap the controls to match the target bit pattern.",
        visualIntuition: "In the bar chart of amplitudes, the bar for the marked item flips upside-down below the zero line, while all other bars remain positive above the line.",
        example: "For $N=4$ with marked state $|11\\rangle$, the state vector becomes $\\frac{1}{2}(|00\\rangle + |01\\rangle + |10\\rangle - |11\\rangle)$. The mean amplitude was $+0.5$; now the average amplitude drops to $(0.5 + 0.5 + 0.5 - 0.5)/4 = 1.0/4 = +0.25$.",
        commonMistakes: [
          "Believing the phase oracle increases the probability of the marked state immediately. It does not: $|-A|^2 = |A|^2$. The oracle only changes the phase, which is invisible to direct measurement without the diffusion operator.",
          "Using a bit-flip oracle instead of a phase oracle. If a bit-flip oracle with an ancilla is used, the ancilla must be in $|-\\rangle$ to perform phase kickback into the phase oracle."
        ],
        checkQuestion: "What is the geometric effect of the phase oracle U_ω = I - 2|ω⟩⟨ω| on our 2D state plane?",
        checkAnswer: "It reflects the state vector across the horizontal axis |s'⟩ (the axis of unmarked states), flipping the sign of the |ω⟩ component from positive to negative.",
        nextConnection: "Now comes the magic of Grover's algorithm: the Diffusion Operator, which inverts amplitudes about their mean!",
        qiskitCode: "from qiskit import QuantumCircuit\n# Oracle for target |11> on 2 qubits:\noracle = QuantumCircuit(2)\noracle.cz(0, 1)  # Applies phase -1 only to |11>\nprint('Phase oracle for |11> constructed')"
      },
      {
        id: "grover-phase-5",
        order: 5,
        title: "The Grover Diffusion Operator (Inversion About the Mean)",
        duration: "6 min",
        xp_reward: 50,
        objective: "Understand how the diffusion operator D = 2|s⟩⟨s| - I reflects amplitudes about their average, dramatically boosting the marked item's amplitude.",
        explanation: "After the phase oracle flips the marked state's amplitude to a negative value, how do we transform that negative phase into a massive positive probability? We apply the **Grover Diffusion Operator** $D$ (also called the Inversion About the Mean operator):\n$$D = 2|s\\rangle\\langle s| - I$$\n\nLet's understand why this is called 'inversion about the mean'. Suppose an $n$-qubit register has amplitudes $\\alpha_x$. The mean (average) amplitude across all $N$ states is:\n$$\\mu = \\frac{1}{N} \\sum_{x=0}^{N-1} \\alpha_x$$\nWhen the diffusion operator acts on amplitude $\\alpha_x$, it transforms it according to the rule:\n$$\\alpha_x \\mapsto 2\\mu - \\alpha_x = \\mu + (\\mu - \\alpha_x)$$\n\nLook at this equation carefully:\n- For an unmarked state, $\\alpha_x$ was positive and close to $\\mu$, so $2\\mu - \\alpha_x$ becomes smaller!\n- For the marked state, $\\alpha_\\omega$ was **negative** ($-\\alpha$). Therefore, $2\\mu - (-\\alpha) = 2\\mu + \\alpha$, which is much larger than before!\n\nThe negative amplitude of the marked state is reflected across the positive average line $\\mu$, shooting up high above all other states!",
        math: "Action of the diffusion operator on a vector $|v\\rangle = \\sum_x \\alpha_x |x\\rangle$:\n$$D|v\\rangle = (2|s\\rangle\\langle s| - I)|v\\rangle = 2\\langle s | v \\rangle |s\\rangle - |v\\rangle$$\nSince $\\langle s | v \\rangle = \\frac{1}{\\sqrt{N}}\\sum_x \\alpha_x = \\sqrt{N}\\mu$:\n$$D|v\\rangle = 2\\sqrt{N}\\mu \\left(\\frac{1}{\\sqrt{N}}\\sum_x |x\\rangle\\right) - \\sum_x \\alpha_x |x\\rangle = \\sum_x (2\\mu - \\alpha_x) |x\\rangle$$",
        circuitConnection: "In QubitLab, the diffusion operator is constructed as: $H^{\\otimes n}$ followed by $X^{\\otimes n}$, a multi-controlled Z gate, $X^{\\otimes n}$, and $H^{\\otimes n}$.",
        visualIntuition: "Imagine a group of children whose average height is 4 feet. One child is standing in a 2-foot ditch (-2 feet). If you reflect everyone about the 4-foot average, the child in the ditch is flipped up to 4 + (4 - (-2)) = 10 feet tall!",
        example: "For $N=4$: Initial amplitudes are $(0.5, 0.5, 0.5, 0.5)$. Oracle flips target to $-0.5$, giving $(0.5, 0.5, 0.5, -0.5)$. The mean is $\\mu = (0.5+0.5+0.5-0.5)/4 = 0.25$. Applying $2\\mu - \\alpha$:\n- Unmarked states: $2(0.25) - 0.5 = 0.5 - 0.5 = 0$\n- Marked state: $2(0.25) - (-0.5) = 0.5 + 0.5 = 1.0$!\nThe target amplitude becomes 1.0 (100% probability) while all others vanish to 0!",
        commonMistakes: [
          "Thinking the diffusion operator depends on knowing which item is marked. Notice the formula $D = 2|s\\rangle\\langle s| - I$: it contains ONLY the initial equal state $|s\\rangle$! The diffusion operator is completely independent of the target item $\\omega$.",
          "Forgetting the surrounding Hadamard gates. The diffusion operator is physically implemented by rotating to the computational basis ($H^{\\otimes n}$), reflecting about $|0\\dots0\\rangle$, and rotating back ($H^{\\otimes n}$)."
        ],
        checkQuestion: "If the average amplitude across 4 states is μ = 0.25 and the marked state has amplitude -0.5, what is its new amplitude after inversion about the mean (2μ - α)?",
        checkAnswer: "+1.0. 2*(0.25) - (-0.5) = 0.5 + 0.5 = 1.0.",
        nextConnection: "Now let's combine the phase oracle and the diffusion operator to define the complete Grover iteration step.",
        qiskitCode: "from qiskit import QuantumCircuit\n# 2-qubit Grover diffusion operator\ndiffuser = QuantumCircuit(2)\ndiffuser.h([0, 1])\ndiffuser.x([0, 1])\ndiffuser.cz(0, 1)  # Reflection about |00>\ndiffuser.x([0, 1])\ndiffuser.h([0, 1])\nprint('Diffusion operator compiled')"
      },
      {
        id: "grover-phase-6",
        order: 6,
        title: "The Grover Iteration Step (G = D · U_ω)",
        duration: "6 min",
        xp_reward: 50,
        objective: "Understand how composing two reflections (oracle reflection + diffusion reflection) produces a pure rotation by angle θ in the 2D state space.",
        explanation: "A famous theorem in Euclidean geometry states that the composition of two reflections across intersecting lines is equivalent to a pure **rotation** by twice the angle between the lines.\n\nThis is precisely how Grover's algorithm works:\n1. The oracle $U_\\omega = I - 2|\\omega\\rangle\\langle \\omega|$ reflects the state vector across the unmarked axis $|s'\\rangle$.\n2. The diffusion operator $D = 2|s\\rangle\\langle s| - I$ reflects the state vector across the initial state axis $|s\\rangle$.\n\nThe angle between the axis $|s'\\rangle$ and the axis $|s\\rangle$ is $\\theta/2 = \\arcsin(1/\\sqrt{N})$. Therefore, the combined **Grover operator** $G = D \\cdot U_\\omega$ performs a pure counter-clockwise rotation by angle $\\theta$ toward the target state $|\\omega\\rangle$:\n$$G = D \\cdot U_\\omega$$\n\nEvery time you apply $G$, the state vector rotates by an angle of $\\theta = 2\\arcsin(1/\\sqrt{N})$ directly toward the vertical target axis $|\\omega\\rangle$!",
        math: "In the 2D orthonormal basis $\\{|s'\\rangle, |\\omega\\rangle\\}$, the Grover iteration matrix is a 2D rotation matrix:\n$$G = \\begin{pmatrix} \\cos\\theta & -\\sin\\theta \\\\ \\sin\\theta & \\cos\\theta \\end{pmatrix}, \\quad \\text{where } \\sin(\\theta/2) = \\frac{1}{\\sqrt{N}}$$\nAfter $k$ iterations:\n$$G^k |s\\rangle = \\cos\\left(\\frac{2k+1}{2}\\theta\\right) |s'\\rangle + \\sin\\left(\\frac{2k+1}{2}\\theta\\right) |\\omega\\rangle$$",
        circuitConnection: "One Grover iteration consists of the Oracle block immediately followed by the Diffusion block.",
        visualIntuition: "Imagine a ratchet wrench. Each pull of the handle (one Grover iteration $G = D \\cdot U_\\omega$) clicks the gear forward by exactly $\\theta$ degrees toward the vertical target position.",
        example: "For $N=4$, $\\theta = 60^\\circ$. The initial state is at $30^\\circ$. One Grover step rotates it by $60^\\circ$: $30^\\circ + 60^\\circ = 90^\\circ$, aligning perfectly with $|\\omega\\rangle$.",
        commonMistakes: [
          "Applying the diffusion operator before the oracle. Matrix multiplication is not commutative ($D \\cdot U_\\omega \\neq U_\\omega \\cdot D$). The oracle must mark the phase first before the diffusion operator can amplify it.",
          "Believing the angle $\\theta$ depends on the iteration count $k$. The step angle $\\theta$ is constant; each iteration adds another increment of $\\theta$."
        ],
        checkQuestion: "Geometrically, what transformation does the composition of the phase oracle reflection and the diffusion reflection achieve?",
        checkAnswer: "A pure rotation by angle θ = 2 arcsin(1/√N) toward the target state |ω⟩ in the 2D plane.",
        nextConnection: "How many iterations should we perform? Can we apply too many iterations? Let's analyze the optimal number of iterations.",
        qiskitCode: "# One complete Grover iteration G = D * U_omega\nfrom qiskit import QuantumCircuit\nqc = QuantumCircuit(2)\n# Oracle for |11>\nqc.cz(0, 1)\n# Diffuser\nqc.h([0, 1]); qc.x([0, 1]); qc.cz(0, 1); qc.x([0, 1]); qc.h([0, 1])\nprint('Grover iteration G compiled')"
      },
      {
        id: "grover-phase-7",
        order: 7,
        title: "Optimal Number of Iterations (R ≈ π/4 √N)",
        duration: "6 min",
        xp_reward: 50,
        objective: "Derive the optimal iteration count R ≈ (π/4)√N and understand the danger of over-rotation in Grover search.",
        explanation: "Since each Grover iteration rotates the state vector by angle $\\theta \\approx 2/\\sqrt{N}$ (for large $N$), we want to stop when the total accumulated angle reaches $\\pi/2$ radians ($90^\\circ$), where the state vector coincides with the vertical target axis $|\\omega\\rangle$.\n\nSetting the total angle to $\\pi/2$:\n$$\\left(R + \\frac{1}{2}\\right) \\theta \\approx R \\left(\\frac{2}{\\sqrt{N}}\\right) = \\frac{\\pi}{2} \\implies R \\approx \\frac{\\pi}{4} \\sqrt{N}$$\n\n**The Over-Rotation Problem**:\nWhat happens if you keep iterating past $R_{\\text{opt}}$? The state vector does **not** stay locked on the target! It continues rotating past the target axis, causing the probability $P(\\omega) = \\sin^2((2k+1)\\theta/2)$ to **decrease**! If you apply $2R$ iterations, the probability drops back to near zero!\n\nGrover's algorithm is periodic: like a pendulum swinging past the bottom of its arc, it oscillates periodically between $0$ and $1$. You must stop at precisely $R_{\\text{opt}} = \\text{round}\\left(\\frac{\\pi}{4}\\sqrt{N}\\right)$.",
        math: "Optimal iteration formula:\n$$R_{\\text{opt}} = \\left\\lfloor \\frac{\\pi}{4} \\frac{1}{\\arcsin(1/\\sqrt{N})} \\right\\rceil \\approx \\left\\lfloor \\frac{\\pi}{4} \\sqrt{N} \\right\\rceil$$\nSuccess probability after $R$ iterations:\n$$P(\\omega) = \\sin^2\\left( (2R+1) \\arcsin(1/\\sqrt{N}) \\right) \\ge 1 - \\frac{1}{N}$$",
        circuitConnection: "In QubitLab, the number of oracle-diffusion pairs chained in series must match $R_{\\text{opt}}$ for the given qubit count $n$.",
        visualIntuition: "Think of an oven timer. If you bake a cake for 30 minutes, it is perfectly done. If you leave it in for 60 minutes, it burns to a crisp. More iterations does not mean better results!",
        example: "For $N=16$ ($n=4$ qubits): $\\frac{\\pi}{4}\\sqrt{16} = \\frac{\\pi}{4}(4) = \\pi \\approx 3.14$. We choose $R = 3$ iterations. For $R=3$, $P(\\omega) = \\sin^2(7 \\arcsin(0.25)) = \\sin^2(1.772 \\text{ rad}) \\approx 0.961$ (96.1% success probability!).",
        commonMistakes: [
          "Assuming that more iterations always increases the probability of finding the marked item. Over-rotating decreases the target probability.",
          "Forgetting to round to the nearest integer. $R$ must be a discrete whole number of circuit blocks."
        ],
        checkQuestion: "What happens to the measurement probability of the marked state if you run Grover's algorithm for twice the optimal number of iterations (2 * R_opt)?",
        checkAnswer: "The probability drops back down near zero. Grover's algorithm is periodic and rotates past the target state back toward the unmarked subspace.",
        nextConnection: "Now let's examine the multi-controlled gate implementations required to build the oracle and diffusion operators in real circuits.",
        qiskitCode: "import math\nfor n in [2, 3, 4, 5, 6]:\n    N = 2**n\n    R = round((math.pi / 4) * math.sqrt(N))\n    print(f'n={n} (N={N:2d}): Optimal Grover iterations = {R}')"
      },
      {
        id: "grover-phase-8",
        order: 8,
        title: "Circuit Topology: Multi-Controlled Gates",
        duration: "6 min",
        xp_reward: 50,
        objective: "Master the construction of multi-controlled phase flip gates (MCZ / Toffoli gates) used inside Grover oracles and diffusers.",
        explanation: "To implement the reflection about $|00\\dots0\\rangle$ inside the diffusion operator $D = H^{\\otimes n} (2|0\\rangle\\langle 0| - I) H^{\\otimes n}$, we need a gate that applies a phase flip $-1$ if and only if all $n$ qubits are in state $|0\\rangle$.\n\nIn standard circuit design, this is implemented using a **Multi-Controlled Z (MCZ)** gate wrapped by Pauli $X$ gates:\n1. Apply $X$ to all $n$ qubits (flipping $|0\\dots0\\rangle \\mapsto |1\\dots1\\rangle$).\n2. Apply an $n$-qubit MCZ gate (which negates the amplitude only if all inputs are 1).\n3. Apply $X$ to all $n$ qubits to restore their basis values.\n\nOn hardware platforms that only support 1-qubit and 2-qubit gates, an $n$-qubit MCZ gate is decomposed into standard gates: for $n=2$, it is simply a $CZ$ gate. For $n=3$, it is an $H$ gate on the target, followed by a Toffoli ($CCX$) gate, followed by an $H$ gate.",
        math: "The reflection operator $2|0\\dots0\\rangle\\langle 0\\dots0| - I$ can be written:\n$$X^{\\otimes n} (I - 2|1\\dots1\\rangle\\langle 1\\dots1|) X^{\\otimes n} = X^{\\otimes n} (\\text{MCZ}) X^{\\otimes n}$$\nFor $n=3$, $\\text{MCZ}(q_0, q_1, q_2) = (I \\otimes I \\otimes H) \\text{CCX}(q_0, q_1, q_2) (I \\otimes I \\otimes H)$.",
        circuitConnection: "In QubitLab, the diffuser block uses $H$ gates $\\to$ $X$ gates $\\to$ a controlled phase flip $\\to$ $X$ gates $\\to$ $H$ gates.",
        visualIntuition: "The $X$ gates act as an address decoder: they translate the target address $|00\\dots0\\rangle$ into the all-ones trigger $|11\\dots1\\rangle$ required by multi-controlled gates.",
        example: "For $n=3$ with target $|101\\rangle$: To mark this state, apply an $X$ gate to $q_1$ (flipping 0 to 1), apply a 3-qubit MCZ gate, and apply an $X$ gate to $q_1$ again.",
        commonMistakes: [
          "Forgetting to uncompute the $X$ gates around the multi-controlled gate. If you omit the second layer of $X$ gates, the basis states remain scrambled.",
          "Using a global phase gate instead of a controlled phase gate. The phase flip must apply selectively to only one specific computational basis state."
        ],
        checkQuestion: "How do you construct a phase flip gate that negates only the state |000⟩ using standard gates?",
        checkAnswer: "Apply X to all 3 qubits, apply a Multi-Controlled Z gate across all 3 qubits, and apply X to all 3 qubits again.",
        nextConnection: "With the circuit topology established, let's explore measurement probabilities and statistical confidence.",
        qiskitCode: "from qiskit import QuantumCircuit\n# 3-qubit diffuser using CCX and H:\nqc = QuantumCircuit(3)\nqc.h([0, 1, 2]); qc.x([0, 1, 2])\nqc.h(2); qc.ccx(0, 1, 2); qc.h(2)  # MCZ on 3 qubits\nqc.x([0, 1, 2]); qc.h([0, 1, 2])\nprint('3-qubit diffuser with decomposed MCZ ready')"
      },
      {
        id: "grover-phase-9",
        order: 9,
        title: "Measurement Probability & High-Confidence Readout",
        duration: "5 min",
        xp_reward: 50,
        objective: "Calculate readout success probabilities, understand residual error, and learn how classical repetition boosts confidence to 99.99%.",
        explanation: "Because $R_{\\text{opt}}$ is constrained to be an integer, the rotated state vector almost never aligns with the target axis $|\\omega\\rangle$ with 100.00% precision (except in special cases like $N=4$ where $\\theta=60^\\circ$).\n\nFor example, for $N=8$ ($n=3$ qubits), $R_{\\text{opt}} = 2$ iterations yields a target probability of:\n$$P(\\omega) = \\sin^2(5 \\arcsin(1/\\sqrt{8})) = \\sin^2(1.823 \\text{ rad}) \\approx 94.5\\%$$\nThere is a residual $5.5\\%$ probability of measuring an incorrect unmarked state.\n\nHow do we guarantee correctness in real-world systems? We use **Verification via Classical Substitution**:\n1. Run Grover's algorithm and measure candidate string $x_{\\text{cand}}$.\n2. Classically plug $x_{\\text{cand}}$ into the oracle to verify if $f(x_{\\text{cand}}) = 1$ (taking $\\mathcal{O}(1)$ time!).\n3. If it verifies, accept $x_{\\text{cand}}$. If not, re-run Grover's algorithm.\n\nWith a 94.5% success rate per trial, the probability of failing $k$ trials in a row is $(0.055)^k$. After just 3 trials, the failure probability is $(0.055)^3 \\approx 0.016\\%$ (a 99.98% confidence level!).",
        math: "Probability of failure after $m$ independent runs:\n$$P_{\\text{fail}}(m) = (1 - P(\\omega))^m$$\nFor $P(\\omega) = 0.90$:\n$$P_{\\text{fail}}(1) = 10\\%, \\quad P_{\\text{fail}}(2) = 1\\%, \\quad P_{\\text{fail}}(3) = 0.1\\%$$",
        circuitConnection: "In QubitLab, the simulator runs 100 or 1,000 shots. The histogram will show a dominant spike on the marked state bitstring.",
        visualIntuition: "Imagine searching for a needle in a haystack. Grover's algorithm magnets 95% of the straw away. You grab a straw: if it's the needle, you're done; if not, you grab again. You succeed in 1 or 2 tries.",
        example: "For $n=3$, running 1,000 shots in QubitLab produces ~945 counts on the target state (e.g. '101') and ~55 counts scattered evenly across the other 7 states (~8 counts each). The target stands out unmistakably.",
        commonMistakes: [
          "Assuming Grover's algorithm must always achieve 100% probability on the first shot. A small non-zero probability of measuring an unmarked state is normal and expected.",
          "Throwing away the result without classical verification. Testing whether $f(x)=1$ classically takes a single evaluation and guarantees zero false positives."
        ],
        checkQuestion: "Why is Grover's algorithm considered a BQP (bounded-error quantum polynomial time) algorithm rather than an exact algorithm for general N?",
        checkAnswer: "Because for arbitrary N, the rotation angle does not hit the vertical axis exactly, leaving a small bounded probability of measuring an unmarked state.",
        nextConnection: "Let's explore search problems with multiple marked items and how the iteration count scales.",
        qiskitCode: "# Simulating shot statistics\nimport random\nsuccess_rate = 0.945\nshots = 1000\nresults = [1 if random.random() < success_rate else 0 for _ in range(shots)]\nprint(f'Successful shots: {sum(results)} / {shots} ({sum(results)/shots:.1%})')"
      },
      {
        id: "grover-phase-10",
        order: 10,
        title: "Multiple Marked Items & Generalizations",
        duration: "5 min",
        xp_reward: 50,
        objective: "Understand how Grover's algorithm adapts when there are M marked items, accelerating the search to O(√(N/M)) iterations.",
        explanation: "What happens if there are $M > 1$ marked target items in the database of size $N$?\n\nThe geometric picture still holds, but the marked subspace is now spanned by all $M$ solutions. The initial overlap with the marked subspace increases from $1/\\sqrt{N}$ to:\n$$\\sin(\\theta/2) = \\sqrt{\\frac{M}{N}}$$\n\nBecause the starting angle $\\theta/2$ is larger, the state vector reaches the marked subspace in **fewer** iterations:\n$$R_{\\text{opt}} \\approx \\frac{\\pi}{4} \\sqrt{\\frac{N}{M}}$$\n\nNotice that if $M = N/4$ (one quarter of all items are targets), $R_{\\text{opt}} = \\frac{\\pi}{4}\\sqrt{4} = \\frac{\\pi}{2} \\approx 1$ single iteration! When measured, the circuit collapses onto one of the $M$ target items chosen uniformly at random.",
        math: "Optimal iterations for $M$ marked items:\n$$R_{\\text{opt}}(M) = \\left\\lfloor \\frac{\\pi}{4} \\sqrt{\\frac{N}{M}} \\right\\rceil$$\nComplexity: $\\mathcal{O}(\\sqrt{N/M})$. If $M$ is unknown, quantum counting (combining Grover with QPE) can determine $M$.",
        circuitConnection: "The oracle $U_\\omega$ simply negates the phase of all $M$ target states: $U_\\omega = I - 2\\sum_{i=1}^M |\\omega_i\\rangle\\langle \\omega_i|$.",
        visualIntuition: "Imagine looking for any red apple in an orchard. If there are 4 red apples instead of 1, the red signal is 4 times stronger, allowing the search to succeed twice as fast ($1/\\sqrt{4} = 1/2$).",
        example: "For $N=16$ with $M=4$ marked items, $R_{\\text{opt}} \\approx \\frac{\\pi}{4}\\sqrt{16/4} = \\frac{\\pi}{4}(2) \\approx 1.57 \\to 1$ iteration. A single Grover iteration finds one of the 4 solutions with ~100% probability!",
        commonMistakes: [
          "Using the single-item formula $R \\approx \\frac{\\pi}{4}\\sqrt{N}$ when multiple targets exist. Doing so causes severe over-rotation, dramatically lowering the probability of finding a solution!",
          "Assuming Grover can find all $M$ items in a single run. Each run measures one solution; to find all $M$, run the algorithm multiple times or remove found items."
        ],
        checkQuestion: "If a database of 100 items has 4 solutions, how does the required number of Grover iterations change compared to a database with only 1 solution?",
        checkAnswer: "The number of iterations is halved: R ≈ (π/4)√(100/4) = (π/4)(5) ≈ 4 iterations, compared to (π/4)√100 ≈ 8 iterations for 1 solution.",
        nextConnection: "Let's review the most common circuit debugging pitfalls when implementing Grover's search in QubitLab.",
        qiskitCode: "# Calculating iterations for multiple targets M\nimport math\nN = 64\nfor M in [1, 2, 4, 8]:\n    R = round((math.pi / 4) * math.sqrt(N / M))\n    print(f'N=64, M={M}: Optimal iterations = {R}')"
      },
      {
        id: "grover-phase-11",
        order: 11,
        title: "Common Circuit Mistakes & Debugging",
        duration: "5 min",
        xp_reward: 50,
        objective: "Diagnose and fix the three most common Grover circuit errors: phase inversion sign errors, missing diffuser Hadamards, and over-iteration.",
        explanation: "When debugging Grover circuits in Quantum Studio, check for these three primary failure modes:\n\n1. **Missing Hadamards in the Diffuser**:\nThe diffusion operator $D = 2|s\\rangle\\langle s| - I$ must rotate to the computational basis before and after the zero-state reflection: $D = H^{\\otimes n} (2|0\\rangle\\langle 0| - I) H^{\\otimes n}$. If you omit either the opening or closing Hadamards, the circuit reflects about the wrong basis, producing complete decoherence.\n\n2. **Phase Inversion Sign Error ($I - 2|s\\rangle\\langle s|$ vs $2|s\\rangle\\langle s| - I$)**:\nIf your diffuser implements $I - 2|s\\rangle\\langle s|$ instead of $2|s\\rangle\\langle s| - I$, it introduces a global phase difference of $-1$. While global phases are unobservable for pure states, mixing them across iterations can cause destructive cancellation.\n\n3. **Over-Iteration Loop Count**:\nAlways verify that the number of Grover iteration stages matches $R_{\\text{opt}}$. In a 2-qubit circuit ($N=4$), $R_{\\text{opt}} = 1$. If a student accidentally inserts 2 iterations, the success probability drops from 100% to 25% (pure random noise)!",
        math: "The 2-qubit diffuser identity:\n$$D = H^{\\otimes 2} X^{\\otimes 2} CZ X^{\\otimes 2} H^{\\otimes 2}$$\nVerify every gate sequentially: $H \\to X \\to CZ \\to X \\to H$.",
        circuitConnection: "In QubitLab, visually verify that the sequence of gates inside the diffuser block is symmetric: Hadamards on the outside, Pauli Xs on the inside, and the controlled phase flip in the exact center.",
        visualIntuition: "Use QubitLab's Q-Sphere. After the oracle, one point turns reddish-orange (negative phase). After the diffuser, that point expands into a giant bright sphere while the other points shrink to tiny dots.",
        example: "A student building Grover for $n=2$ with target $|11\\rangle$ places two identical oracle-diffuser blocks. They run the simulation and find all states have 25% probability! Fix: Delete the second block ($R_{\\text{opt}} = 1$). Probability jumps to 100%.",
        commonMistakes: [
          "Forgetting to wrap the controlled gate in Pauli X gates when reflecting about $|00\\rangle$. Without $X$ gates, you reflect about $|11\\rangle$ instead of $|00\\rangle$.",
          "Applying measurements inside the iteration loop instead of at the very end of the circuit."
        ],
        checkQuestion: "What happens to the success probability of a 2-qubit Grover search circuit if you accidentally apply 2 iterations instead of 1?",
        checkAnswer: "The success probability drops from 100% back to 25% (equal superposition), because 2 iterations over-rotates the state vector by 120° past the initial 30° position (total 150°), projecting equally onto all states.",
        nextConnection: "You are now ready to construct and execute the full Grover Search Circuit in Quantum Studio.",
        qiskitCode: "# Verifying the 2-qubit Grover circuit\nfrom qiskit import QuantumCircuit\nqc = QuantumCircuit(2, 2)\n# 1. Equal superposition\nqc.h([0, 1])\n# 2. Oracle for |11>\nqc.cz(0, 1)\n# 3. Diffuser\nqc.h([0, 1]); qc.x([0, 1]); qc.cz(0, 1); qc.x([0, 1]); qc.h([0, 1])\n# 4. Measure\nqc.measure([0, 1], [0, 1])\nprint(qc)"
      },
      {
        id: "grover-phase-12",
        order: 12,
        title: "Full Grover Algorithm Workflow & Synthesis",
        duration: "5 min",
        xp_reward: 50,
        objective: "Synthesize the complete Grover search circuit in Quantum Studio, verify quadratic speedup, and claim your Mission 03 XP.",
        explanation: "You have completed the Grover's Search Algorithm curriculum! Let's review the complete algorithm workflow:\n1. **Initialization**: Prepare an $n$-qubit register in state $|0\\rangle^{\\otimes n}$ and apply $H^{\\otimes n}$ to generate equal superposition $|s\\rangle$ with amplitudes $1/\\sqrt{N}$.\n2. **Grover Loop**: Repeat $R_{\\text{opt}} \\approx \\frac{\\pi}{4}\\sqrt{N}$ times:\n   a. **Phase Oracle** $U_\\omega$: Invert the amplitude of the marked state: $|\\omega\\rangle \\mapsto -|\\omega\\rangle$.\n   b. **Diffusion Operator** $D$: Invert all amplitudes about their mean ($2|s\\rangle\\langle s| - I$), amplifying the target amplitude and attenuating non-targets.\n3. **Measurement**: Measure the register in the computational basis to extract the target string $|\\omega\\rangle$ with probability $P \\ge 1 - 1/N$.\n4. **Verification**: Classically verify the candidate in $\\mathcal{O}(1)$ time.\n\nEnter Quantum Studio now to build your circuit, inspect the amplitude amplification in real time on the Q-Sphere, and claim your Mission 03 XP!",
        math: "Overall performance summary:\n$$T_{\\text{quantum}} = \\mathcal{O}(\\sqrt{N}) \\quad \\text{vs.} \\quad T_{\\text{classical}} = \\mathcal{O}(N)$$\nSpace complexity: $\\mathcal{O}(n) = \\mathcal{O}(\\log N)$ qubits.",
        circuitConnection: "In QubitLab, Mission 03 requires you to configure the circuit for target item $|11\\rangle$ on 2 qubits using no more than 6 quantum gates.",
        visualIntuition: "Watch the Q-Sphere in QubitLab: the target state $|11\\rangle$ transforms from an equal cyan node to an amplified dominant sphere while the other nodes fade away.",
        example: "With your circuit complete, run 100 shots in Quantum Studio: 100% of measurement counts will land on target $|11\\rangle$, satisfying all mission criteria.",
        commonMistakes: [
          "Exceeding the permitted gate budget by placing redundant gates.",
          "Failing to connect the measurement output bits to classical register lines."
        ],
        checkQuestion: "What is the computational complexity of classically verifying whether Grover's candidate output string is correct?",
        checkAnswer: "O(1) (a single function evaluation). Evaluating f(x_candidate) takes constant time.",
        nextConnection: "Proceed to Quantum Studio to build your circuit and earn your Data Architect badge for Grover's Algorithm!",
        qiskitCode: "# Full 2-qubit Grover search execution\nfrom qiskit import QuantumCircuit\nqc = QuantumCircuit(2, 2)\nqc.h([0, 1])\nqc.cz(0, 1)\nqc.h([0, 1]); qc.x([0, 1]); qc.cz(0, 1); qc.x([0, 1]); qc.h([0, 1])\nqc.measure([0, 1], [0, 1])\nprint('Grover Mission 03 ready for Quantum Studio simulation!')"
      }
    ]
  },
  qaoa: {
    projectId: "qaoa",
    algorithm: "Quantum Approximate Optimization Algorithm (QAOA)",
    overview: "Solve combinatorial optimization problems (such as Max-Cut) using a hybrid quantum-classical variational loop alternating between cost and mixer Hamiltonians.",
    difficulty: "Advanced",
    totalDuration: "75 min",
    phases: [
      {
        id: "qaoa-phase-1",
        order: 1,
        title: "Combinatorial Optimization & NP-Hard Problems",
        duration: "6 min",
        xp_reward: 50,
        objective: "Understand classical combinatorial optimization, the Max-Cut problem on graphs, and why finding exact solutions is NP-hard.",
        explanation: "Combinatorial optimization problems lie at the core of logistics, route scheduling, financial portfolio optimization, and circuit layout. The goal is to find an optimal discrete configuration (a bitstring $z \\in \\{0, 1\\}^n$) that maximizes or minimizes a classical objective function $C(z)$.\n\nThe canonical benchmark problem for QAOA is **Max-Cut**: Given an unweighted graph $G = (V, E)$ with vertices $V$ and edges $E$, we wish to partition the vertices into two disjoint sets, $S$ and $S'$, such that the number of edges crossing between the two sets is maximized.\n\nWhile this problem is simple to state, determining the exact maximum cut is **NP-hard**. For a graph with $n$ vertices, there are $2^{n-1}$ possible non-trivial partitions. Exhaustive brute-force search scales exponentially as $\\mathcal{O}(2^n)$, becoming intractable for graphs with more than a few dozen vertices.",
        math: "Max-Cut objective function for a graph $G = (V, E)$ with binary vertex assignments $s_i \\in \\{-1, +1\\}$:\n$$C(s) = \\sum_{(i, j) \\in E} \\frac{1 - s_i s_j}{2}$$\nNotice that if $s_i$ and $s_j$ are in the same set ($s_i = s_j$), $s_i s_j = +1$, so $\\frac{1 - 1}{2} = 0$ (no contribution). If they are in different sets ($s_i \\neq s_j$), $s_i s_j = -1$, so $\\frac{1 - (-1)}{2} = 1$ (the cut edge contributes +1).",
        circuitConnection: "In QubitLab, each vertex in the graph maps to a physical qubit wire ($q_i$). A cut across vertices corresponds to measuring opposite bit values ($0$ vs $1$).",
        visualIntuition: "Imagine dividing a group of politicians into two meeting rooms. An edge exists between every pair of rivals. The Max-Cut goal is to separate as many rival pairs as possible into different rooms.",
        example: "Consider a triangle graph $C_3$ (3 vertices, 3 edges: (0,1), (1,2), (0,2)). Any partition puts two vertices in one set and one in the other, cutting exactly 2 edges. The maximum cut is 2.",
        commonMistakes: [
          "Assuming QAOA is proven to solve NP-complete problems in polynomial time (P=NP). QAOA is an approximate heuristic algorithm designed to find high-quality approximate solutions on NISQ hardware, not an exact polynomial solver for NP-hard problems.",
          "Confusing vertex count with edge count. In QAOA, the number of qubits equals the number of vertices $|V|$, while the number of two-qubit interaction gates scales with the number of edges $|E|$."
        ],
        checkQuestion: "In the Max-Cut problem on an unweighted graph, what value does an edge (i, j) contribute to the objective function if both vertices are assigned to the same partition?",
        checkAnswer: "Zero (0). An edge contributes to the cut score (+1) only if its endpoints are assigned to different partitions.",
        nextConnection: "To solve this on a quantum computer, we must map the classical objective function into a quantum Cost Hamiltonian.",
        qiskitCode: "# Classical Max-Cut objective function in Python\ndef max_cut_value(bitstring, edges):\n    return sum(1 for u, v in edges if bitstring[u] != bitstring[v])\nprint('Cut value for 010 on triangle:', max_cut_value('010', [(0,1), (1,2), (0,2)]))"
      },
      {
        id: "qaoa-phase-2",
        order: 2,
        title: "Mapping Problems to the Cost Hamiltonian (H_C)",
        duration: "6 min",
        xp_reward: 50,
        objective: "Learn how classical binary variables s_i ∈ {-1, +1} are promoted to quantum Pauli Z operators, producing the Ising Cost Hamiltonian H_C.",
        explanation: "To optimize a classical cost function on a quantum computer, we use the method of **Ising spin glass mapping**. We replace each classical spin variable $s_i \\in \\{-1, +1\\}$ with the Pauli $Z_i$ operator acting on qubit $i$:\n$$s_i \\longrightarrow Z_i = \\begin{pmatrix} 1 & 0 \\\\ 0 & -1 \\end{pmatrix}$$\n\nNotice the eigenvalues of Pauli $Z$:\n- $Z|0\\rangle = +1|0\\rangle$ (corresponding to classical spin $s_i = +1$)\n- $Z|1\\rangle = -1|1\\rangle$ (corresponding to classical spin $s_i = -1$)\n\nSubstituting $s_i \\to Z_i$ into the classical Max-Cut cost function produces the **Cost Hamiltonian** $H_C$:\n$$H_C = \\sum_{(i, j) \\in E} \\frac{1}{2}(I - Z_i Z_j)$$\nBecause $H_C$ is diagonal in the computational basis, every classical bitstring $|z\\rangle = |z_1 z_2 \\dots z_n\\rangle$ is an eigenstate of $H_C$, and its eigenvalue is precisely the classical cut value $C(z)$:\n$$H_C |z\\rangle = C(z) |z\\rangle$$",
        math: "The Cost Hamiltonian for Max-Cut:\n$$H_C = \\sum_{(i, j) \\in E} \\frac{1}{2}(I - Z_i Z_j)$$\nSince the identity term $\\frac{1}{2}I$ only shifts eigenvalues by a constant, practitioners often maximize the interaction term or minimize the Ising Hamiltonian:\n$$H_{\\text{Ising}} = \\sum_{(i, j) \\in E} Z_i Z_j$$",
        circuitConnection: "The $Z_i Z_j$ interaction is implemented in quantum circuits using a CNOT gate, an $R_z$ rotation gate, and another CNOT gate between qubits $q_i$ and $q_j$.",
        visualIntuition: "Each edge in the graph becomes a quantum gravitational spring between two qubits. When the qubits point in opposite directions (0 and 1), the spring releases energy, lowering the Hamiltonian's energy state.",
        example: "For a 2-qubit single-edge graph (qubit 0 and qubit 1): $H_C = \\frac{1}{2}(I - Z_0 Z_1)$.\n- For $|00\\rangle$: $Z_0 Z_1 |00\\rangle = (+1)(+1)|00\\rangle = +1|00\\rangle \\implies C = 0$\n- For $|01\\rangle$: $Z_0 Z_1 |01\\rangle = (+1)(-1)|01\\rangle = -1|01\\rangle \\implies C = 1$ (Cut edge!)",
        commonMistakes: [
          "Assuming $H_C$ creates entanglement by itself. $H_C$ is diagonal in the computational basis; it only applies phase shifts proportional to $Z_i Z_j$, without creating superpositions.",
          "Confusing maximization of the cut with minimization of the Hamiltonian. Maximizing $\\frac{1}{2}(I - Z_i Z_j)$ is equivalent to minimizing $\\sum Z_i Z_j$."
        ],
        checkQuestion: "What is the eigenvalue of the Hamiltonian operator Z_0 Z_1 when acting on the computational basis state |01⟩?",
        checkAnswer: "-1. Because Z|0⟩ = +1|0⟩ and Z|1⟩ = -1|1⟩, Z_0 Z_1|01⟩ = (+1)(-1)|01⟩ = -1|01⟩.",
        nextConnection: "To explore superpositions across all possible cuts, we need a second operator that introduces quantum fluctuations: the Mixer Hamiltonian.",
        qiskitCode: "# Representing the Cost Hamiltonian using Qiskit SparsePauliOp\nfrom qiskit.quantum_info import SparsePauliOp\n# Edge between qubit 0 and qubit 1: H_C = 0.5*I - 0.5*Z0*Z1\nH_C = SparsePauliOp.from_list([('II', 0.5), ('ZZ', -0.5)])\nprint('Cost Hamiltonian:', H_C)"
      },
      {
        id: "qaoa-phase-3",
        order: 3,
        title: "The Mixer Hamiltonian (H_M) & Transverse Field",
        duration: "5 min",
        xp_reward: 50,
        objective: "Understand the transverse field Mixer Hamiltonian H_M = ∑ X_i, why it does not commute with H_C, and its role in driving quantum tunneling.",
        explanation: "If we only had the Cost Hamiltonian $H_C$, the circuit would be stuck in whatever computational basis state it started in. To explore the entire solution space and allow quantum tunneling between different bitstring configurations, Edward Farhi, Jeffrey Goldstone, and Sam Gutmann introduced the **Mixer Hamiltonian** $H_M$:\n$$H_M = \\sum_{i=0}^{n-1} X_i$$\nwhere $X_i$ is the Pauli $X$ operator acting on qubit $i$.\n\nThe Mixer Hamiltonian has two critical properties:\n1. **Ground State**: The ground state of $-H_M$ is the uniform equal superposition state $|+\\rangle^{\\otimes n} = H^{\\otimes n}|0\\rangle^{\\otimes n}$. This state is trivial to prepare on a quantum computer using a single layer of Hadamard gates!\n2. **Non-Commutativity**: $H_M$ does **not commute** with $H_C$ because $[X_i, Z_i] = -2iY_i \\neq 0$. This non-commutativity prevents the system from getting trapped in local classical minima, enabling quantum tunneling across energy barriers.",
        math: "The ground state of $-H_M = -\\sum X_i$:\n$$-X|+\\rangle = -(+1)|+\\rangle = -1|+\\rangle$$\nTherefore, $|+\\rangle^{\\otimes n}$ is the eigenstate of $-H_M$ with lowest possible eigenvalue ($-n$).",
        circuitConnection: "The unitary evolution under the mixer Hamiltonian $e^{-i \\beta H_M} = \\prod_i e^{-i \\beta X_i}$ is implemented as a parallel layer of single-qubit $R_x(2\\beta)$ rotation gates.",
        visualIntuition: "Think of simulated annealing where temperature causes thermal vibrations. The Mixer Hamiltonian is the quantum analog: it introduces transverse quantum fluctuations that allow the state to tunnel through narrow energy barriers.",
        example: "Applying $e^{-i\\beta X}$ to $|0\\rangle$ rotates it into $\\cos(\\beta)|0\\rangle - i\\sin(\\beta)|1\\rangle$, mixing amplitudes between 0 and 1 on each wire independently.",
        commonMistakes: [
          "Using a diagonal mixer like $H_M = \\sum Z_i$. A $Z$ mixer commutes with $H_C$, causing zero state transitions and completely preventing quantum optimization!",
          "Confusing the role of $H_M$ with $H_C$. $H_C$ encodes the problem constraints and drives the system toward optimal cuts. $H_M$ provides the quantum kinetic energy to explore alternative cuts."
        ],
        checkQuestion: "Why must the Mixer Hamiltonian H_M not commute with the Cost Hamiltonian H_C in QAOA?",
        checkAnswer: "If they commuted, they would share simultaneous eigenstates, meaning the mixer could never drive transitions between different computational basis states.",
        nextConnection: "Now we alternate between the Cost unitary and Mixer unitary to construct the parameterized QAOA ansatz circuit.",
        qiskitCode: "from qiskit import QuantumCircuit\n# Mixer layer: Rx(2*beta) on all qubits\ndef apply_mixer(qc, beta):\n    for q in range(qc.num_qubits):\n        qc.rx(2 * beta, q)\nprint('Mixer layer function defined')"
      },
      {
        id: "qaoa-phase-4",
        order: 4,
        title: "Parameterized Unitaries: Alternating Layers (p-layers)",
        duration: "6 min",
        xp_reward: 50,
        objective: "Understand how alternating evolutions under H_C (angle γ) and H_M (angle β) build the p-depth QAOA state |γ, β⟩.",
        explanation: "QAOA is an algorithm inspired by adiabatic quantum computation. In adiabatic computation, a system starts in the ground state of an easy Hamiltonian $H_M$ and slowly transforms into $H_C$ over infinite continuous time. QAOA discretizes this continuous evolution into $p$ distinct alternating layers (trotterization).\n\nStarting from the equal superposition state $|+\\rangle^{\\otimes n}$, QAOA applies $p$ sequential layers of alternating unitaries:\n1. **Cost Unitary** $U(C, \\gamma_k) = e^{-i \\gamma_k H_C}$: Applies problem-dependent phase shifts parameterised by angle $\\gamma_k$.\n2. **Mixer Unitary** $U(M, \\beta_k) = e^{-i \\beta_k H_M}$: Rotates states across the transverse basis parameterised by angle $\\beta_k$.\n\nThe final parameterized quantum state $|\\vec{\\gamma}, \\vec{\\beta}\\rangle$ after $p$ layers is:\n$$|\\vec{\\gamma}, \\vec{\\beta}\\rangle = \\prod_{k=1}^p \\left( e^{-i \\beta_k H_M} e^{-i \\gamma_k H_C} \\right) |+\\rangle^{\\otimes n}$$\n\nHere, $p$ is called the **circuit depth** or number of layers. A $p=1$ QAOA circuit has only 2 parameters $(\\gamma_1, \\beta_1)$. A $p=2$ circuit has 4 parameters $(\\gamma_1, \\gamma_2, \\beta_1, \\beta_2)$.",
        math: "The QAOA ansatz state:\n$$|\\vec{\\gamma}, \\vec{\\beta}\\rangle = U(M, \\beta_p) U(C, \\gamma_p) \\dots U(M, \\beta_1) U(C, \\gamma_1) |+\\rangle^{\\otimes n}$$\nAs $p \\to \\infty$, the adiabatic theorem guarantees that the output state converges to the exact ground state (exact optimal solution) with probability 1.",
        circuitConnection: "In QubitLab, each QAOA layer consists of: an entangling 2-qubit phase network for each edge $(i, j)$ using angles $\\gamma$, followed by single-qubit $R_x(2\\beta)$ gates on all qubits.",
        visualIntuition: "Imagine a blacksmith forging a sword: heating the metal in fire (mixer $\\beta$) softens the atomic structure so it can change shape, while hammering it against the anvil (cost $\\gamma$) forces it into the desired blade shape.",
        example: "For $p=1$ on a 2-qubit graph: apply $H$ on $q_0, q_1$, apply $e^{-i\\gamma Z_0 Z_1}$ between $q_0$ and $q_1$, then apply $R_x(2\\beta)$ to both $q_0$ and $q_1$.",
        commonMistakes: [
          "Assuming $p$ must be very large to obtain good answers. Even $p=1$ QAOA achieves a provable approximation ratio of $0.6924$ on 3-regular graphs, beating random guessing.",
          "Varying the gates inside a single layer independently. All edges in layer $k$ share the same parameter $\\gamma_k$, and all qubits in layer $k$ share the same parameter $\\beta_k$."
        ],
        checkQuestion: "How many total variational parameters are tuned in a QAOA circuit with p=3 layers?",
        checkAnswer: "6 parameters (3 gamma angles and 3 beta angles: γ1, γ2, γ3, β1, β2, β3).",
        nextConnection: "How do we physically implement the two-qubit cost unitary e^(-i γ Z_i Z_j) using standard quantum gates? Let's inspect the circuit gadget.",
        qiskitCode: "from qiskit import QuantumCircuit\n# 1-layer QAOA circuit skeleton for 2 qubits\ndef qaoa_p1(gamma, beta):\n    qc = QuantumCircuit(2)\n    qc.h([0, 1])\n    # Cost unitary e^(-i gamma Z0 Z1)\n    qc.cx(0, 1); qc.rz(2 * gamma, 1); qc.cx(0, 1)\n    # Mixer unitary\n    qc.rx(2 * beta, [0, 1])\n    return qc"
      },
      {
        id: "qaoa-phase-5",
        order: 5,
        title: "Circuit Construction: CNOT–RZ–CNOT Gadget",
        duration: "6 min",
        xp_reward: 50,
        objective: "Master the CNOT–RZ–CNOT circuit decomposition for synthesizing two-qubit ZZ interactions: e^(-i γ Z_i Z_j).",
        explanation: "Most quantum hardware does not possess native two-qubit $Z \\otimes Z$ gates. Therefore, we must decompose the unitary $e^{-i \\gamma Z_i Z_j}$ into native single-qubit rotations and CNOT gates.\n\nThe standard circuit gadget consists of three gates:\n1. **CNOT** from control qubit $q_i$ to target qubit $q_j$: computes the parity of the two qubits onto $q_j$ ($|q_i\\rangle |q_i \\oplus q_j\\rangle$).\n2. **$R_z(2\\gamma)$** on target qubit $q_j$: applies a phase shift $e^{-i \\gamma}$ if the parity is 0 and $e^{+i \\gamma}$ if the parity is 1.\n3. **CNOT** from control qubit $q_i$ to target qubit $q_j$: uncomputes the parity, restoring $q_j$ while preserving the accumulated relative phase on both qubits.\n\nMathematically, this gadget exactly implements:\n$$\\text{CNOT}_{ij} \\cdot (I \\otimes R_z(2\\gamma)) \\cdot \\text{CNOT}_{ij} = e^{-i \\gamma Z_i Z_j}$$",
        math: "Proof of equivalence:\nRecall $R_z(2\\gamma) = e^{-i \\gamma Z}$.\nUsing the operator identity $\\text{CNOT} (I \\otimes Z) \\text{CNOT} = Z \\otimes Z$:\n$$\\text{CNOT}_{ij} e^{-i \\gamma (I \\otimes Z_j)} \\text{CNOT}_{ij} = e^{-i \\gamma \\text{CNOT}_{ij} (I \\otimes Z_j) \\text{CNOT}_{ij}} = e^{-i \\gamma Z_i Z_j}$$",
        circuitConnection: "In QubitLab, for every edge $(i, j)$ in your graph, place a CNOT with control on $q_i$ and target on $q_j$, followed by an RZ gate with angle $2\\gamma$ on $q_j$, followed by another CNOT from $q_i$ to $q_j$.",
        visualIntuition: "Think of an arithmetic subroutine. The first CNOT checks if the two qubits match (XOR). The RZ gate applies a penalty or reward based on that match. The second CNOT erases the calculation scratchpad.",
        example: "For an edge between $q_0$ and $q_1$ with $\\gamma = 0.4$: place CNOT(0, 1), place RZ(0.8) on $q_1$, place CNOT(0, 1). This exact block implements $e^{-i 0.4 Z_0 Z_1}$.",
        commonMistakes: [
          "Placing the RZ gate on both qubits. The RZ gate belongs ONLY on the target qubit $q_j$. Placing it on both applies double the rotation.",
          "Using the angle $\\gamma$ instead of $2\\gamma$. In standard gate definitions, $R_z(\\theta) = e^{-i (\\theta/2) Z}$. To implement $e^{-i \\gamma Z}$, the rotation angle must be set to $\\theta = 2\\gamma$."
        ],
        checkQuestion: "What is the three-gate sequence used to implement the interaction unitary e^(-i γ Z_0 Z_1) on qubits 0 and 1?",
        checkAnswer: "CNOT(0, 1), followed by Rz(2γ) on qubit 1, followed by CNOT(0, 1).",
        nextConnection: "Now that the circuit can be compiled for any parameters (γ, β), how do we evaluate how good the resulting quantum state is? We measure the Expectation Value.",
        qiskitCode: "from qiskit import QuantumCircuit\nqc = QuantumCircuit(2)\ngamma = 0.5\n# CNOT-RZ-CNOT gadget for e^(-i gamma Z0 Z1)\nqc.cx(0, 1)\nqc.rz(2 * gamma, 1)\nqc.cx(0, 1)\nprint('ZZ interaction gadget compiled')"
      },
      {
        id: "qaoa-phase-6",
        order: 6,
        title: "Evaluating Expectation Values ⟨ψ(γ, β)| H_C |ψ(γ, β)⟩",
        duration: "6 min",
        xp_reward: 50,
        objective: "Understand how repeated circuit measurements compute the expected cut value F(γ, β) as the objective function for classical optimization.",
        explanation: "The quantum computer does not output an answer directly; it outputs statistical samples from the state $|\\psi(\\vec{\\gamma}, \\vec{\\beta})\\rangle$. To evaluate the quality of the parameters, we define the objective function as the quantum expectation value of the Cost Hamiltonian:\n$$F_p(\\vec{\\gamma}, \\vec{\\beta}) = \\langle \\psi(\\vec{\\gamma}, \\vec{\\beta}) | H_C | \\psi(\\vec{\\gamma}, \\vec{\\beta}) \\rangle$$\n\nHow do we calculate this in practice? By sampling!\n1. Execute the QAOA circuit with fixed $(\\vec{\\gamma}, \\vec{\\beta})$ for $S$ shots (e.g. $S = 1,000$).\n2. Each shot produces a classical bitstring $z^{(k)} \\in \\{0, 1\\}^n$.\n3. For each measured bitstring, compute its classical cut value $C(z^{(k)})$.\n4. Average the scores over all $S$ shots:\n$$\\langle H_C \\rangle \\approx \\frac{1}{S} \\sum_{k=1}^S C(z^{(k)})$$\n\nThis single real number $F(\\vec{\\gamma}, \\vec{\\beta})$ serves as the cost metric passed to a classical optimization algorithm!",
        math: "By the spectral decomposition of $H_C = \\sum_z C(z) |z\\rangle\\langle z|$:\n$$\\langle H_C \\rangle = \\sum_{z \\in \\{0, 1\\}^n} C(z) |\\langle z | \\psi(\\vec{\\gamma}, \\vec{\\beta}) \\rangle|^2 = \\sum_z C(z) P(z)$$\nThis is the exact statistical expectation of the cut score over the probability distribution $P(z)$ generated by the quantum circuit.",
        circuitConnection: "In QubitLab, the simulator runs the circuit, collects the probability distribution, and calculates $\\langle H_C \\rangle$ automatically.",
        visualIntuition: "Imagine tuning the focal knob on a microscope. At each dial setting $(\\gamma, \\beta)$, you take a quick snapshot and measure how clear the image is. You keep turning the dial until the image is as sharp as possible.",
        example: "With 100 shots: 70 shots measure '01' (cut value 1) and 30 shots measure '00' (cut value 0). The estimated expectation value is $(70 \\times 1 + 30 \\times 0)/100 = 0.70$.",
        commonMistakes: [
          "Assuming a single shot is sufficient to evaluate the expectation value. Quantum measurement is probabilistic; multiple shots (typically 500 to 2,000) are required to average out shot noise.",
          "Confusing the expectation value $\\langle H_C \\rangle$ with the maximum cut. The expectation value is the *average* cut. The maximum cut observed among the samples is often even higher than the average!"
        ],
        checkQuestion: "How is the quantum expectation value ⟨H_C⟩ approximated experimentally on real quantum hardware?",
        checkAnswer: "By running the circuit for S shots, calculating the classical cut score C(z) for each measured bitstring, and taking the arithmetic mean of the scores.",
        nextConnection: "Now we close the loop: sending this expectation value to a classical optimizer to tune the parameters iteratively.",
        qiskitCode: "# Computing expectation value from sample counts\ndef compute_expectation(counts, edges):\n    total_shots = sum(counts.values())\n    avg_cut = 0\n    for bitstring, count in counts.items():\n        cut = sum(1 for u, v in edges if bitstring[u] != bitstring[v])\n        avg_cut += cut * (count / total_shots)\n    return avg_cut"
      },
      {
        id: "qaoa-phase-7",
        order: 7,
        title: "The Hybrid Quantum-Classical Feedback Loop",
        duration: "6 min",
        xp_reward: 50,
        objective: "Understand the division of labor in VQAs: the quantum QPU computes state superpositions, while a classical CPU runs numerical optimization.",
        explanation: "QAOA is a prime example of a **Variational Quantum Algorithm (VQA)**. It operates in a closed hybrid feedback loop between two computing architectures:\n\n1. **The Quantum Processing Unit (QPU)**:\n   - Receives candidate parameters $(\\vec{\\gamma}, \\vec{\\beta})$ from the CPU.\n   - Executes the parameterized circuit.\n   - Measures the qubits and returns measurement samples.\n\n2. **The Classical Computer (CPU)**:\n   - Evaluates the objective function score $F(\\vec{\\gamma}, \\vec{\\beta})$.\n   - Runs a classical optimization algorithm (such as COBYLA, Nelder-Mead, or SPSA).\n   - Computes updated parameter guesses $(\\vec{\\gamma}_{\\text{new}}, \\vec{\\beta}_{\\text{new}})$ that move uphill toward higher cut scores.\n   - Sends the new angles back to the QPU.\n\nThis loop repeats for dozens of iterations until the parameters converge to the peak of the energy landscape, maximizing the probability of measuring the optimal cut!",
        math: "The classical optimization problem:\n$$(\\vec{\\gamma}^*, \\vec{\\beta}^*) = \\arg\\max_{\\vec{\\gamma}, \\vec{\\beta}} \\langle \\psi(\\vec{\\gamma}, \\vec{\\beta}) | H_C | \\psi(\\vec{\\gamma}, \\vec{\\beta}) \\rangle$$\nParameters are typically constrained to periodic domains: $\\gamma_k \\in [0, 2\\pi)$ and $\\beta_k \\in [0, \\pi)$.",
        circuitConnection: "In QubitLab, the Workspace UI exposes slider controls for the rotation angles $\\gamma$ and $\\beta$, allowing you to act as the classical optimizer and see the state probabilities shift in real time.",
        visualIntuition: "Think of an Olympic archer (QPU) and a spotter with binoculars (CPU). The archer fires an arrow (quantum circuit). The spotter calls out: 'Two inches high and right!' (classical evaluation). The archer adjusts their aim and fires again.",
        example: "Iteration 1: $\\gamma=0.2, \\beta=0.2 \\implies \\langle C \\rangle = 1.1$. Classical optimizer recommends $\\gamma=0.4, \\beta=0.3$. Iteration 2: $\\langle C \\rangle = 1.6$. Iteration 3: $\\gamma=0.6, \\beta=0.4 \\implies \\langle C \\rangle = 1.95$. Convergence reached!",
        commonMistakes: [
          "Believing the quantum computer updates its own parameters. The parameter optimization is performed entirely on a classical CPU running numerical algorithms.",
          "Using gradient descent when shot noise is high. Standard gradient descent requires exact analytical gradients; gradient-free methods like COBYLA or SPSA are much more resilient to statistical shot noise on NISQ devices."
        ],
        checkQuestion: "In a hybrid quantum-classical algorithm like QAOA, what task is executed on the QPU and what task is executed on the classical CPU?",
        checkAnswer: "The QPU executes the parameterized circuit and samples quantum states; the classical CPU evaluates the cost function and optimizes the variational parameters.",
        nextConnection: "Let's explore the energy landscape: why is finding the optimal angles challenging, and what are barren plateaus?",
        qiskitCode: "# Using SciPy COBYLA to optimize QAOA parameters\nfrom scipy.optimize import minimize\n# Classical optimizer loop skeleton:\n# res = minimize(cost_function, x0=[0.1, 0.1], method='COBYLA')\nprint('Classical optimization loop configured with COBYLA')"
      },
      {
        id: "qaoa-phase-8",
        order: 8,
        title: "The Parameter Landscape & Periodicity",
        duration: "5 min",
        xp_reward: 50,
        objective: "Understand the symmetries and periodicity of the QAOA energy landscape: γ ∈ [0, 2π) and β ∈ [0, π).",
        explanation: "The energy surface $F_1(\\gamma, \\beta)$ for a $p=1$ QAOA circuit forms a smooth, continuous 2D landscape with periodic hills and valleys.\n\nBecause the quantum gates are periodic:\n- The Cost Unitary uses $e^{-i \\gamma Z_i Z_j}$. Since the eigenvalues of $Z_i Z_j$ are $\\pm 1$ (integers), shifting $\\gamma$ by $2\\pi$ leaves the state completely unchanged: $e^{-i (\\gamma + 2\\pi) Z_i Z_j} = e^{-i \\gamma Z_i Z_j} e^{-i 2\\pi} = e^{-i \\gamma Z_i Z_j}$. Thus, $\\gamma$ is periodic with period $2\\pi$ (and often $\\pi$ for unweighted graphs).\n- The Mixer Unitary uses $e^{-i \\beta X}$. Since $e^{-i \\pi X} = -I$ (a harmless global phase), shifting $\\beta$ by $\\pi$ leaves measurement probabilities invariant. Thus, $\\beta$ is periodic with period $\\pi$.\n\nTherefore, we never need to search an infinite space! The entire parameter landscape is confined to a compact torus: $\\gamma \\in [0, 2\\pi)$ and $\\beta \\in [0, \\pi)$.",
        math: "Symmetry properties of the energy landscape:\n$$F(\\gamma + \\pi, \\beta) = F(\\gamma, \\beta) \\quad (\\text{for bipartite graphs})$$\n$$F(-\\gamma, -\\beta) = -F(\\gamma, \\beta)$$\nThese mathematical symmetries allow classical optimizers to restrict parameter bounds significantly.",
        circuitConnection: "In QubitLab's parameter controls, the slider ranges for $\\gamma$ and $\\beta$ are bounded between $0$ and $\\pi$ radians.",
        visualIntuition: "Imagine a 2D topographic hiking map. Because the terrain repeats endlessly in all directions like wallpaper, you only need to explore a single square tile to find the highest mountain peak.",
        example: "Plotting $F(\\gamma, \\beta)$ for a triangle graph reveals a distinctive saddle surface with two prominent symmetrical peaks at $(\\gamma \\approx 0.615, \\beta \\approx 0.393)$ radians.",
        commonMistakes: [
          "Searching unbounded parameter spaces like $\\gamma \\in [-100, 100]$. Because of periodicity, any parameter outside $[0, 2\\pi)$ is purely redundant.",
          "Getting stuck in local minima when initializing parameters poorly. Running multi-start optimization with several random initial guesses helps find the global optimum."
        ],
        checkQuestion: "What is the natural periodic search domain for the mixer angle β in QAOA?",
        checkAnswer: "[0, π) (or 0 to 180 degrees), because e^(-i π X) = -I, which produces an unobservable global phase.",
        nextConnection: "How good is the QAOA solution compared to the true theoretical optimum? Let's analyze the Approximation Ratio.",
        qiskitCode: "# Grid search over the bounded periodic landscape [0, pi] x [0, pi]\nimport numpy as np\ngammas = np.linspace(0, np.pi, 20)\nbetas = np.linspace(0, np.pi, 20)\nprint(f'Grid resolution: {len(gammas)*len(betas)} points to explore')"
      },
      {
        id: "qaoa-phase-9",
        order: 9,
        title: "Approximation Ratio & Theoretical Guarantees",
        duration: "6 min",
        xp_reward: 50,
        objective: "Understand the approximation ratio α = ⟨C⟩ / C_max and the performance scaling of QAOA as circuit depth p increases.",
        explanation: "In theoretical computer science, polynomial-time algorithms for NP-hard optimization problems are evaluated by their **approximation ratio** $\\alpha$:\n$$\\alpha = \\frac{\\langle C \\rangle}{C_{\\text{max}}}$$\nwhere $\\langle C \\rangle$ is the expected cut value produced by the algorithm, and $C_{\\text{max}}$ is the true maximum cut of the graph. An algorithm with $\\alpha = 1.0$ finds the exact optimum every time; an algorithm with $\\alpha = 0.5$ is equivalent to a blind coin toss.\n\nA celebrated landmark result by Farhi, Goldstone, and Gutmann (2014) proved that even for the shallowest possible circuit ($p = 1$), QAOA achieves an approximation ratio of:\n$$\\alpha \\ge 0.6924$$\non all 3-regular graphs in the worst case! As the circuit depth $p$ increases ($p = 2, 3, 4, \\dots$):\n$$\\lim_{p \\to \\infty} \\alpha = 1.0$$\nHowever, deeper circuits require more gates, which introduces hardware decoherence on NISQ devices. Balancing depth $p$ against hardware noise is the central engineering trade-off in modern quantum optimization.",
        math: "Approximation ratio definition:\n$$\\alpha = \\frac{\\langle \\psi(\\vec{\\gamma}^*, \\vec{\\beta}^*) | H_C | \\psi(\\vec{\\gamma}^*, \\vec{\\beta}^*) \\rangle}{C_{\\text{max}}} \\in [0, 1]$$\nFamous classical benchmark: The Goemans-Williamson algorithm (based on semidefinite programming) achieves $\\alpha_{\\text{GW}} \\approx 0.87856$. To beat classical algorithms, QAOA typically requires depth $p \\ge 3$.",
        circuitConnection: "In QubitLab, the mission criteria require your circuit to achieve an approximation ratio exceeding a specific baseline threshold.",
        visualIntuition: "Think of climbing a staircase toward perfection. Step 1 ($p=1$) takes you to 70% of the summit; Step 2 ($p=2$) takes you to 82%; each additional step brings you closer to the peak.",
        example: "On a graph whose maximum cut is 4 edges: if QAOA achieves an expectation value of $\\langle C \\rangle = 3.2$, its approximation ratio is $\\alpha = 3.2 / 4 = 0.80$ (80%).",
        commonMistakes: [
          "Assuming $p=1$ QAOA can beat the best classical algorithms for Max-Cut. $p=1$ QAOA achieves $\\alpha \\approx 0.692$, while Goemans-Williamson achieves $0.878$. Higher depth ($p \\ge 3$) is necessary to approach or surpass classical benchmarks.",
          "Evaluating $\\alpha$ on a trivial graph where all cuts have the same value."
        ],
        checkQuestion: "What is the theoretical value of the approximation ratio α as the QAOA circuit depth p approaches infinity (p → ∞)?",
        checkAnswer: "α = 1.0 (100% exact optimal solution), guaranteed by the adiabatic theorem.",
        nextConnection: "Let's explore hardware noise and error mitigation when running QAOA on near-term NISQ processors.",
        qiskitCode: "# Calculating approximation ratio\nc_max = 4.0\nexpected_c = 3.25\nalpha = expected_c / c_max\nprint(f'Approximation ratio alpha: {alpha:.3f} ({alpha:.1%})')"
      },
      {
        id: "qaoa-phase-10",
        order: 10,
        title: "Barren Plateaus & NISQ Hardware Constraints",
        duration: "5 min",
        xp_reward: 50,
        objective: "Understand the barren plateau phenomenon (vanishing gradients) in variational circuits and the impact of gate fidelity on deep QAOA.",
        explanation: "As we increase the number of layers $p$ to improve the approximation ratio, variational quantum circuits encounter a severe mathematical obstacle known as **Barren Plateaus** (discovered by McClean et al., 2018).\n\nIn deep parameterized circuits, the gradient of the objective function vanishes exponentially with the number of qubits $n$:\n$$\\text{Var}\\left( \\frac{\\partial F}{\\partial \\theta_i} \\right) \\sim \\mathcal{O}\\left(\\frac{1}{2^n}\\right)$$\nWhen this occurs, the optimization landscape becomes almost completely flat everywhere, with no slope for the classical optimizer to follow! Random initial guesses cannot determine which direction leads uphill.\n\nFurthermore, on noisy near-term (NISQ) quantum hardware, two-qubit CNOT gates have error rates of $0.1\\%$ to $1.0\\%$. If a circuit contains dozens of CNOTs, cumulative gate infidelity drowns out the subtle phase interference, flattening the energy landscape into pure uniform noise.",
        math: "The variance of the partial derivative across the Haar-distributed parameter space:\n$$\\text{Var}_{\\vec{\\theta}}\\left[ \\frac{\\partial \\langle H \\rangle}{\\partial \\theta_k} \\right] \\le \\frac{c}{2^n}$$\nTo avoid barren plateaus in QAOA, problem-inspired initial parameter heuristics (such as adiabatic ramp schedules $\\gamma_k = \\frac{k}{p}\\Delta t$, $\\beta_k = (1 - \\frac{k}{p})\\Delta t$) are used instead of random parameter initialization.",
        circuitConnection: "In QubitLab, keeping the circuit depth compact ($p=1$ or $p=2$) ensures high circuit fidelity and crisp gradient signals.",
        visualIntuition: "Imagine being lost in the desert at midnight where the ground is completely flat in every direction for 100 miles. Without any slope to guide you, you cannot find the mountain peak.",
        example: "On a 20-qubit circuit with random angles, the gradient variance is on the order of $2^{-20} \\approx 10^{-6}$. To detect a gradient above statistical shot noise, you would need billions of shots per iteration!",
        commonMistakes: [
          "Initializing QAOA angles with completely random large numbers. Always initialize parameters near small angles or use known heuristic schedules.",
          "Assuming barren plateaus cannot occur in QAOA. While QAOA's structure provides better resilience than generic hardware-efficient ansätze, deep QAOA on dense graphs still suffers from barren plateaus."
        ],
        checkQuestion: "What happens to the gradient of the cost function in a variational quantum circuit when a barren plateau is encountered?",
        checkAnswer: "The gradient vanishes exponentially toward zero as the number of qubits increases, making it impossible for classical optimizers to determine which direction to step.",
        nextConnection: "Let's review the most common circuit assembly bugs when building QAOA circuits in QubitLab.",
        qiskitCode: "# Heuristic linear ramp schedule for QAOA parameters\ndef linear_ramp_schedule(p, dt=0.75):\n    gammas = [(k / p) * dt for k in range(1, p + 1)]\n    betas  = [(1 - k / p) * dt for k in range(1, p + 1)]\n    return gammas, betas\nprint('Linear ramp angles (p=3):', linear_ramp_schedule(3))"
      },
      {
        id: "qaoa-phase-11",
        order: 11,
        title: "Common Circuit Mistakes & Debugging",
        duration: "5 min",
        xp_reward: 50,
        objective: "Identify and debug the three most common QAOA circuit construction errors: missing graph edges, mismatched rotation angles, and omitted mixer layers.",
        explanation: "When implementing QAOA in Quantum Studio, check for these three common bugs:\n\n1. **Omitted Graph Edges in the Cost Layer**:\nEvery single edge $(u, v)$ in the problem graph must have its own CNOT-RZ-CNOT interaction gadget. If your graph has 4 edges, your cost layer must contain 4 distinct gadgets. Leaving out an edge means the quantum computer is solving an incomplete problem!\n\n2. **Inverted Angle Factors ($2\\gamma$ vs $\\gamma$)**:\nIn standard quantum simulation libraries, an $R_z(\\theta)$ gate applies $e^{-i \\theta/2 Z}$. Therefore, to implement $e^{-i \\gamma Z_i Z_j}$, you must set the rotation parameter to $2\\gamma$. Setting it to $\\gamma$ halves your effective coupling, requiring twice the iterations to converge.\n\n3. **Mismatched Mixer Order**:\nEach layer must strictly follow the sequence: Cost Unitary first, then Mixer Unitary second ($e^{-i\\beta H_M} e^{-i\\gamma H_C}$). If you interleave mixer gates between edge gadgets within the same layer, you destroy the coherent commutation of the cost terms.",
        math: "Cost layer commutativity property:\nBecause all terms in $H_C = \\sum Z_i Z_j$ commute with each other ($[Z_i Z_j, Z_k Z_l] = 0$), the order in which you apply edge gadgets within a cost layer does not matter:\n$$e^{-i \\gamma H_C} = \\prod_{(u, v) \\in E} e^{-i \\gamma Z_u Z_v} \\quad (\\text{exact equality, no Trotter error})$$",
        circuitConnection: "In QubitLab, organize your canvas cleanly: Column 0 = initial H gates; Columns 1–3 = CNOT-RZ-CNOT gadgets for all edges; Column 4 = RX mixer gates on all wires; Final column = measurement meters.",
        visualIntuition: "Think of baking a layered cake. Layer 1 (sponge) then Layer 2 (frosting). You cannot frost half a cake, add the sponge, and expect a proper layered cake.",
        example: "Symptom: The cut expectation value does not improve as $\\gamma$ changes. Diagnosis: Check the CNOT pairs. If the second CNOT was accidentally placed with inverted control and target, the parity is not uncomputed, entangling the register erroneously.",
        commonMistakes: [
          "Measuring before the mixer layer. Measuring collapses the superposition, turning the algorithm into a classical random walk.",
          "Using $R_y$ instead of $R_x$ for the mixer. While $Y$ mixers are mathematically possible, the standard QAOA mixer is $R_x$ (Pauli $X$)."
        ],
        checkQuestion: "Does the order of CNOT-RZ-CNOT edge gadgets inside the Cost layer affect the final mathematical state?",
        checkAnswer: "No. Because all Z_i Z_j terms commute with each other ([Z_i Z_j, Z_k Z_l] = 0), the edge gadgets within a single cost layer can be executed in any order without Trotter error.",
        nextConnection: "Now you are ready to assemble the full QAOA algorithm and solve the Graph Partitioning mission in Quantum Studio!",
        qiskitCode: "# Checking commutation of ZZ interactions\nfrom qiskit.quantum_info import SparsePauliOp\nop1 = SparsePauliOp('ZZI')\nop2 = SparsePauliOp('IZZ')\ncomm = op1.compose(op2) - op2.compose(op1)\nprint('Commutator [Z0Z1, Z1Z2] == 0:', comm.simplify().equiv(0))"
      },
      {
        id: "qaoa-phase-12",
        order: 12,
        title: "Full QAOA Workflow & Combinatorial Synthesis",
        duration: "5 min",
        xp_reward: 50,
        objective: "Execute the complete QAOA workflow in Quantum Studio, tune variational parameters to optimize Max-Cut, and claim your Mission 04 XP.",
        explanation: "Congratulations! You have mastered the complete variational principles of the Quantum Approximate Optimization Algorithm.\n\nLet's review the complete pipeline you will execute in Quantum Studio:\n1. **Graph Specification**: Encode a multi-vertex graph with edges connecting specific qubit pairs.\n2. **Ground State Preparation**: Apply $H$ gates to all qubits to create $|+\\rangle^{\\otimes n}$.\n3. **Cost Unitary** $U(C, \\gamma)$: Apply CNOT-RZ-CNOT gadgets for every edge in the graph with parameter $2\\gamma$.\n4. **Mixer Unitary** $U(M, \\beta)$: Apply $R_x(2\\beta)$ gates to all qubits.\n5. **Measurement & Sampling**: Measure all qubits, compute the cut values, and verify that the measured distribution concentrates amplitude on the optimal partition bitstrings.\n\nEnter Quantum Studio now to tune your QAOA circuit, find the optimal cut, and earn your Logistics Engineer badge!",
        math: "Final state readout probability for optimal cut $z^*$:\n$$P(z^*) = |\\langle z^* | \\psi(\\gamma^*, \\beta^*) \\rangle|^2$$\nWhen parameters are optimized, $P(z^*)$ is significantly amplified above the uniform baseline $1/2^n$.",
        circuitConnection: "In QubitLab, Mission 04 challenges you to build a QAOA circuit for a 4-vertex graph, tune $\\gamma$ and $\\beta$, and achieve an approximation ratio exceeding the mission threshold.",
        visualIntuition: "In QubitLab's histogram, watch the bars corresponding to the optimal cuts (e.g. '0101' and '1010') grow taller as you tune $\\gamma$ and $\\beta$ toward their optimal values.",
        example: "On a 4-vertex line graph (3 edges: 0-1, 1-2, 2-3), the optimal cut is '0101' (cutting all 3 edges). After tuning $\\gamma=0.55, \\beta=0.38$, '0101' and '1010' account for over 65% of all sampled shots.",
        commonMistakes: [
          "Forgetting to measure all qubits into classical registers.",
          "Stopping parameter tuning after the first marginal improvement."
        ],
        checkQuestion: "What is the physical interpretation of the measured bitstring (e.g. 0101) in the context of the Max-Cut problem?",
        checkAnswer: "It specifies the partition assignment: vertices with bit 0 belong to set S, and vertices with bit 1 belong to set S'.",
        nextConnection: "Proceed to Quantum Studio to build your QAOA circuit and advance to Level 5: Quantum Neural Networks!",
        qiskitCode: "# Full QAOA circuit for 4-vertex line graph\nfrom qiskit import QuantumCircuit\nqc = QuantumCircuit(4, 4)\ngamma, beta = 0.55, 0.38\nqc.h(range(4))\n# 3 edges: (0,1), (1,2), (2,3)\nfor u, v in [(0, 1), (1, 2), (2, 3)]:\n    qc.cx(u, v); qc.rz(2 * gamma, v); qc.cx(u, v)\nqc.rx(2 * beta, range(4))\nqc.measure(range(4), range(4))\nprint('QAOA Mission 04 compiled!')"
      }
    ]
  },
  "qnn": {
    "projectId": "qnn",
    "algorithm": "Quantum Neural Network (QNN)",
    "overview": "Build a parameterized quantum circuit (ansatz) that classifies multi-dimensional data using variational optimization, quantum feature maps, and the parameter-shift rule.",
    "difficulty": "Advanced",
    "totalDuration": "80 min",
    "phases": [
      {
        "id": "qnn-phase-1",
        "order": 1,
        "title": "Classical Machine Learning Limits & Quantum Representation",
        "duration": "6 min",
        "xp_reward": 50,
        "objective": "Understand how quantum Hilbert spaces enable exponential feature spaces through quantum state representations.",
        "explanation": "Classical neural networks learn complex decision boundaries by mapping input feature vectors x ∈ R^d into higher-dimensional representations using non-linear activation functions (ReLU, Sigmoid). However, as feature dimensions grow, classical kernel machines suffer from memory and computation bottlenecks O(N²).\n\nQuantum Machine Learning (QML) leverages the exponential capacity of quantum state space: an n-qubit register possesses a 2^n-dimensional complex Hilbert space. By mapping classical data vectors into quantum states |ψ(x)⟩ via unitary feature maps U_Φ(x), linear quantum classifiers can find hyperplanes in Hilbert space that correspond to highly non-linear, classically intractable boundaries in the original feature space.",
        "math": "A classical data vector x = (x_1, \\dots, x_d) is mapped to a quantum state:\n$$|\\Phi(x)\\rangle = U_\\Phi(x)|0\\rangle^{\\otimes n}$$\nThe effective quantum kernel between two inputs x and x' is:\n$$k(x, x') = |\\langle \\Phi(x) | \\Phi(x') \\rangle|^2$$\nIn an n-qubit system, this inner product evaluates an overlap in a 2^n-dimensional space in polynomial time.",
        "circuitConnection": "In QubitLab, the feature map layer uses single-qubit rotation gates (Ry, Rz) parameterized by normalized input values x_i.",
        "visualIntuition": "Imagine projecting a flat 2D tangled circle of blue and red dots onto a 3D sphere: a simple flat plane can now slice through the sphere, perfectly separating the two colors.",
        "example": "If x is a customer's [income, age], normalized to [0.4, 0.8], qubit 0 is rotated by Ry(0.4π) and qubit 1 is rotated by Ry(0.8π).",
        "commonMistakes": [
          "Assuming quantum neural networks automatically outperform classical deep learning on all tabular datasets. QNNs excel specifically when data possesses quantum-like correlations or group symmetries.",
          "Passing unnormalized input data directly to rotation gates. Input features must be scaled to [0, 2π] or [-1, 1] to prevent trigonometric aliasing."
        ],
        "checkQuestion": "What is the dimensionality of the quantum feature state space for an 8-qubit quantum neural network?",
        "checkAnswer": "2^8 = 256 complex dimensions, growing exponentially with the number of qubits.",
        "nextConnection": "Let's explore data encoding strategies: angle, amplitude, and basis encoding.",
        "qiskitCode": "from qiskit import QuantumCircuit\nqc = QuantumCircuit(2)\nx = [0.4, 0.8]\nqc.ry(x[0], 0); qc.ry(x[1], 1)\nprint('Angle encoding feature map compiled')"
      },
      {
        "id": "qnn-phase-2",
        "order": 2,
        "title": "Quantum Data Encoding: Angle vs. Amplitude Encoding",
        "duration": "6 min",
        "xp_reward": 50,
        "objective": "Compare angle encoding, amplitude encoding, and basis encoding, understanding their trade-offs in circuit depth and qubit count.",
        "explanation": "To process classical data with a quantum circuit, you must first encode the numbers into a quantum state. Three primary encoding paradigms exist:\n\n1. **Angle Encoding**: Each classical feature x_i is mapped to the rotation angle of a single qubit: |x_i\\rangle = \\cos(x_i)|0\\rangle + \\sin(x_i)|1\\rangle. It requires d qubits for d features, but has shallow O(1) circuit depth and requires no entanglement for state preparation.\n2. **Amplitude Encoding**: A 2^n-dimensional classical vector x is normalized and encoded directly into the 2^n probability amplitudes of n qubits: |\\psi_x\\rangle = \\sum_{i=0}^{2^n-1} x_i |i\\rangle. This provides exponential data compression (encoding 1,024 features in just 10 qubits), but preparing an arbitrary amplitude state generally requires exponential O(2^n) CNOT gates.\n3. **Basis Encoding**: Encodes binary numbers directly into computational basis states (e.g. 5 = 101_2 \\implies |101\\rangle).\n\nFor near-term NISQ QNNs, angle encoding is the gold standard due to its shallow depth and resilience to noise.",
        "math": "Angle encoding state:\n$$|\\mathbf{x}\\rangle = \\bigotimes_{i=1}^d \\left( \\cos(x_i)|0\\rangle + \\sin(x_i)|1\\rangle \\right)$$\nAmplitude encoding state:\n$$|\\mathbf{x}\\rangle = \\sum_{i=0}^{2^n-1} x_i |i\\rangle, \\quad \\sum |x_i|^2 = 1$$",
        "circuitConnection": "In QubitLab, we use angle encoding via Ry(θ) gates on each input qubit line at the start of the circuit.",
        "visualIntuition": "Angle encoding rotates individual compass needles on separate dials. Amplitude encoding shapes a single wave across a large surface of water.",
        "example": "To encode a 4-feature customer vector [0.2, 0.5, 0.1, 0.9] via angle encoding, we apply Ry rotations with those angles to 4 separate qubits.",
        "commonMistakes": [
          "Attempting amplitude encoding without normalizing the input vector to unit Euclidean norm (∑ |x_i|² = 1). Quantum state vectors must always have norm 1.",
          "Using basis encoding for continuous floating-point variables. Basis encoding is strictly for discrete integer or categorical states."
        ],
        "checkQuestion": "How many qubits are required to encode a 16-dimensional classical vector using angle encoding vs. amplitude encoding?",
        "checkAnswer": "Angle encoding requires 16 qubits (1 per feature); amplitude encoding requires only 4 qubits (since 2^4 = 16).",
        "nextConnection": "Now that our data is embedded in quantum state space, we need a parameterized ansatz to serve as the trainable neural network model.",
        "qiskitCode": "# Amplitude vs Angle encoding demonstration\nfrom qiskit import QuantumCircuit\n# Angle: 2 features on 2 qubits\nqc_angle = QuantumCircuit(2)\nqc_angle.ry(0.5, 0); qc_angle.ry(1.2, 1)\nprint('Angle encoding circuit depth:', qc_angle.depth())"
      },
      {
        "id": "qnn-phase-3",
        "order": 3,
        "title": "Parameterized Quantum Circuits (Ansatz) as Neural Models",
        "duration": "6 min",
        "xp_reward": 50,
        "objective": "Understand the architecture of a Parameterized Quantum Circuit (PQC), the concept of an ansatz, and how expressibility and entangling capability dictate model capacity.",
        "explanation": "In classical neural networks, a layer consists of weight matrix multiplication followed by an activation function: a = σ(Wx + b). In Quantum Neural Networks, the role of the model is played by a **Parameterized Quantum Circuit (PQC)**, commonly referred to as an **ansatz** W(θ).\n\nThe ansatz is a sequence of single-qubit rotation gates parameterized by continuous trainable angles θ_j, interleaved with entangling two-qubit gates (such as CNOT or CZ). When applied to the encoded state |Φ(x)⟩, the ansatz applies a unitary transformation W(θ):\n$$|\\psi(x, \\theta)\\rangle = W(\\theta) |\\Phi(x)\\rangle$$\n\nTwo properties characterize a good ansatz:\n1. **Expressibility**: The ability of the circuit to explore diverse states in the Hilbert space.\n2. **Entangling Capability**: The ability to generate non-separable quantum correlations between different features.",
        "math": "The ansatz unitary is composed of L layers:\n$$W(\\theta) = \\prod_{l=1}^L U_{\\text{ent}} \\left( \\bigotimes_{i=1}^n R(\\theta_{l, i}) \\right)$$\nwhere R is a parameterized single-qubit rotation and U_ent is an entangler network.",
        "circuitConnection": "In QubitLab, the ansatz follows the feature map: Ry and Rz rotation gates with variable slider angles θ, followed by a chain of CNOT gates.",
        "visualIntuition": "Think of the feature map as dropping a marble onto a custom wooden board, and the ansatz as tilting the board using knobs (θ) until the marble rolls into the correct target pocket.",
        "example": "A 2-qubit, 1-layer ansatz: Ry(θ_1) on q0, Ry(θ_2) on q1, CNOT from q0 to q1, followed by Rz(θ_3) on q0 and Rz(θ_4) on q1 (4 total trainable weights).",
        "commonMistakes": [
          "Making the ansatz excessively deep. Deeper circuits increase gate errors on NISQ hardware and trigger the barren plateau problem.",
          "Using only single-qubit gates without entanglers. Without CNOT or CZ gates, the model cannot capture interactions between different features!"
        ],
        "checkQuestion": "What is the primary role of entangling gates (like CNOT) inside a Quantum Neural Network ansatz?",
        "checkAnswer": "To create quantum correlations and entanglement between qubits, allowing the model to learn multi-variable relationships between features.",
        "nextConnection": "Let's inspect single-qubit rotation weights in detail to understand how continuous parameters act as quantum neurons.",
        "qiskitCode": "from qiskit import QuantumCircuit\nfrom qiskit.circuit import Parameter\ntheta = Parameter('θ')\nqc = QuantumCircuit(1)\nqc.ry(theta, 0)\nprint('Parameterized single-qubit neuron compiled')"
      },
      {
        "id": "qnn-phase-4",
        "order": 4,
        "title": "Single-Qubit Rotations as Trainable Weights",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Master parameterized single-qubit rotations Rx(θ), Ry(θ), Rz(θ) as the fundamental weight parameters of a QNN.",
        "explanation": "In classical neural networks, weights w_ij are real numbers that scale signals. In QNNs, trainable weights are **rotation angles** θ that specify how far a qubit's state vector rotates around the X, Y, or Z axes of the Bloch sphere.\n\nThe three canonical single-qubit rotation operators are generated by the Pauli matrices:\n- $R_x(\\theta) = e^{-i \\frac{\\theta}{2} X} = \\cos(\\theta/2) I - i\\sin(\\theta/2) X$\n- $R_y(\\theta) = e^{-i \\frac{\\theta}{2} Y} = \\cos(\\theta/2) I - i\\sin(\\theta/2) Y$\n- $R_z(\\theta) = e^{-i \\frac{\\theta}{2} Z} = \\cos(\\theta/2) I - i\\sin(\\theta/2) Z$\n\nNotice that $R_y(\\theta)$ has entirely real matrix elements:\n$$R_y(\\theta) = \\begin{pmatrix} \\cos(\\theta/2) & -\\sin(\\theta/2) \\\\ \\sin(\\theta/2) & \\cos(\\theta/2) \\end{pmatrix}$$\nBecause $R_y(\\theta)$ keeps amplitudes in the real numbers, it is the most popular choice for classification tasks where complex phases are not explicitly required.",
        "math": "Any arbitrary single-qubit unitary rotation can be decomposed using the Z-Y-Z Euler decomposition:\n$$U(\\alpha, \\beta, \\gamma) = R_z(\\alpha) R_y(\\beta) R_z(\\gamma)$$\nThis proves that 3 rotation angles are sufficient to reach any point on the Bloch sphere.",
        "circuitConnection": "In QubitLab, Ry and Rz gates allow direct parameter entry via numeric inputs or drag-sliders.",
        "visualIntuition": "Each single-qubit rotation steers a point on the Bloch sphere along latitude or longitude lines. The angle θ controls the exact distance steered.",
        "example": "Applying Ry(π/2) to |0⟩ creates the equal superposition (1/√2)|0⟩ + (1/√2)|1⟩ with equal 50% probability.",
        "commonMistakes": [
          "Forgetting the factor of 1/2 in the rotation definition. An Ry gate rotated by angle π produces an amplitude shift cos(π/2) = 0 on |0⟩ and sin(π/2) = 1 on |1⟩.",
          "Using only Rz rotations. Rz only shifts phase; on the computational state |0⟩, Rz(θ)|0⟩ = e^(-iθ/2)|0⟩, which leaves measurement probabilities completely unchanged!"
        ],
        "checkQuestion": "What happens if an ansatz uses ONLY Rz rotation gates starting from the state |00...0⟩?",
        "checkAnswer": "The circuit will produce no observable change in measurement probabilities, because Rz only alters relative phases without mixing amplitudes between |0⟩ and |1⟩.",
        "nextConnection": "Now we couple multiple qubits together using entangling layers to capture correlations between input features.",
        "qiskitCode": "from qiskit import QuantumCircuit\nqc = QuantumCircuit(1)\n# Rotate around Y axis by angle theta=1.5708 (pi/2)\nqc.ry(1.5708, 0)\nprint('Rotated qubit to equal superposition')"
      },
      {
        "id": "qnn-phase-5",
        "order": 5,
        "title": "Entangling Layers: Circular, Linear, & All-to-All",
        "duration": "6 min",
        "xp_reward": 50,
        "objective": "Understand different entangling topologies (Linear, Circular, All-to-All) and how they influence QNN expressibility and hardware compatibility.",
        "explanation": "To enable a Quantum Neural Network to learn non-linear decision boundaries involving interactions between multiple features (e.g. feature 1 multiplied by feature 2), the qubits must be entangled.\n\nSeveral common entangling topologies exist:\n1. **Linear Entanglement**: CNOT gates connect adjacent qubits in a line: (0→1, 1→2, 2→3). This requires only n-1 two-qubit gates and maps directly to nearest-neighbor physical hardware layout.\n2. **Circular Entanglement**: Linear entanglement plus a CNOT connecting the last qubit back to the first: (n-1 → 0). This provides symmetric information flow across all qubits.\n3. **All-to-All Entanglement**: Every qubit is entangled with every other qubit: n(n-1)/2 CNOTs. While highly expressive, it introduces high circuit depth and requires extensive SWAP gates on planar architectures.\n\nFor most tabular classification benchmarks, linear or circular entanglement provides an optimal trade-off between expressibility and circuit depth.",
        "math": "Action of CNOT on a 2-qubit product state:\n$$\\text{CNOT} \\left( \\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}} \\otimes |0\\rangle \\right) = \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}$$\nThis creates a maximally entangled Bell state whose joint probability cannot be factored into independent marginal probabilities: $P(q_0, q_1) \\neq P(q_0)P(q_1)$.",
        "circuitConnection": "In QubitLab, place CNOT gates between wires q0→q1, q1→q2, etc., immediately following each layer of parameterized Ry/Rz gates.",
        "visualIntuition": "Single-qubit rotations are like individual solo musicians tuning their instruments. The entangling layer is the conductor who forces them to play in harmony as a single symphony orchestra.",
        "example": "In a 3-qubit automotive customer classifier: q0 = income, q1 = credit score, q2 = vehicle price. Linear CNOTs (0→1 and 1→2) allow the model to evaluate affordability (income relative to price).",
        "commonMistakes": [
          "Using all-to-all connectivity on noisy NISQ hardware, which introduces high gate error rates.",
          "Placing entangling gates without following them with another layer of parameterized rotations, which restricts the observable basis."
        ],
        "checkQuestion": "How many CNOT gates are required for a linear entanglement layer across n=4 qubits?",
        "checkAnswer": "3 CNOT gates (connecting pairs 0-1, 1-2, and 2-3).",
        "nextConnection": "How does a QNN output a prediction? We measure the expectation value of a quantum observable.",
        "qiskitCode": "from qiskit import QuantumCircuit\nqc = QuantumCircuit(3)\n# Linear CNOT entangling layer\nqc.cx(0, 1)\nqc.cx(1, 2)\nprint('Linear entangling layer compiled')"
      },
      {
        "id": "qnn-phase-6",
        "order": 6,
        "title": "Quantum Measurement & Observable Expectation Values",
        "duration": "6 min",
        "xp_reward": 50,
        "objective": "Understand how the expectation value of a Pauli observable ⟨Z⟩ maps continuous quantum amplitudes to bounded model predictions ŷ ∈ [-1, +1].",
        "explanation": "In classical neural networks, the output layer uses a linear transformation followed by an activation function (e.g. sigmoid or tanh) to output a prediction. In a Quantum Neural Network, the output is obtained by measuring the **expectation value** of a Hermitian observable, typically the Pauli Z operator on the first qubit:\n$$\\hat{y}(x, \\theta) = \\langle Z_0 \\rangle = \\langle \\psi(x, \\theta) | (Z \\otimes I^{\\otimes n-1}) | \\psi(x, \\theta) \\rangle$$\n\nBecause the eigenvalues of Pauli Z are +1 and -1, the expectation value $\\langle Z_0 \\rangle$ is a smooth, continuous real number naturally bounded in the range $[-1, +1]$:\n$$\\langle Z_0 \\rangle = P(q_0 = 0) - P(q_0 = 1)$$\n\nIf the first qubit is measured as $|0\\rangle$ with 90% probability and $|1\\rangle$ with 10% probability, the prediction is:\n$$\\hat{y} = 0.90 - 0.10 = +0.80$$\nTo map this to a binary classification label $y \\in \\{0, 1\\}$, we simply check if $\\hat{y} > 0$ (Class 0) or $\\hat{y} \\le 0$ (Class 1).",
        "math": "Expectation value calculation from measurement probabilities:\n$$\\langle Z_0 \\rangle = \\sum_{z \\in \\{0, 1\\}^n} (-1)^{z_0} P(z) = P(z_0 = 0) - P(z_0 = 1) \\in [-1, 1]$$\nSigmoid activation mapping to [0, 1]:\n$$\\tilde{y} = \\sigma(\\langle Z_0 \\rangle) = \\frac{1}{1 + e^{-\\langle Z_0 \\rangle}}$$",
        "circuitConnection": "In QubitLab, measurement meters [M] record bit frequencies, from which $\\langle Z_0 \\rangle = (N_0 - N_1)/N_{\\text{shots}}$ is calculated automatically.",
        "visualIntuition": "Think of a balance scale. Positive outcomes $|0\\rangle$ sit on the left pan (+1); negative outcomes $|1\\rangle$ sit on the right pan (-1). The tilt angle of the scale is the expectation value $\\langle Z_0 \\rangle$.",
        "example": "If 80 out of 100 shots record q0=0, and 20 record q0=1: $\\langle Z_0 \\rangle = (80 - 20)/100 = +0.60$. Since $0.60 > 0$, the model predicts Class 0 with 80% confidence.",
        "commonMistakes": [
          "Using a single measurement shot as the network's prediction. A single shot yields only a discrete bit (0 or 1); averaging over multiple shots is strictly required to get a smooth, continuous expectation value.",
          "Expecting predictions outside $[-1, +1]$. The Pauli Z observable has eigenvalues $\\pm 1$, so its expectation value can never exceed $\\pm 1$."
        ],
        "checkQuestion": "If an n-qubit QNN measures qubit 0 in state |0⟩ with 75% probability and |1⟩ with 25% probability, what is the expectation value ⟨Z_0⟩?",
        "checkAnswer": "⟨Z_0⟩ = 0.75 - 0.25 = +0.50.",
        "nextConnection": "Now we define the loss function that quantifies prediction errors and guides model training.",
        "qiskitCode": "# Computing <Z> from measurement counts\ncounts = {'00': 750, '01': 50, '10': 150, '11': 50}\n# Target is qubit 0 (rightmost bit in Qiskit ordering)\nshots = sum(counts.values())\np0 = sum(c for b, c in counts.items() if b[-1] == '0') / shots\np1 = 1.0 - p0\nexp_val = p0 - p1\nprint('Expectation value <Z0>:', exp_val)"
      },
      {
        "id": "qnn-phase-7",
        "order": 7,
        "title": "Loss Functions & Decision Boundaries",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Formulate Mean Squared Error (MSE) and Cross-Entropy loss functions for QNN training, understanding the resulting decision boundary.",
        "explanation": "To train a Quantum Neural Network, we define a scalar **loss function** $\\mathcal{L}(\\theta)$ that measures the discrepancy between the model's predictions $\\hat{y}_i = f(x_i; \\theta)$ and the true ground-truth labels $y_i$ across a dataset of $M$ training examples.\n\nTwo standard loss functions are commonly used:\n1. **Mean Squared Error (MSE)**:\n$$\\mathcal{L}_{\\text{MSE}}(\\theta) = \\frac{1}{M} \\sum_{i=1}^M (y_i - \\hat{y}_i(\\theta))^2$$\nMSE is smooth and simple, making it the most standard loss function in variational quantum machine learning.\n\n2. **Binary Cross-Entropy (BCE)**:\n$$\\mathcal{L}_{\\text{BCE}}(\\theta) = -\\frac{1}{M} \\sum_{i=1}^M \\left[ y_i \\log \\tilde{y}_i + (1 - y_i) \\log(1 - \\tilde{y}_i) \\right]$$\nwhere $\\tilde{y}_i = \\frac{1 + \\hat{y}_i}{2} \\in [0, 1]$ represents the predicted probability of class 1.\n\nThe **decision boundary** is the geometric surface in feature space where $\\hat{y}(x; \\theta) = 0$. By adjusting the circuit angles $\\theta$, classical optimization reshapes this boundary until classification errors are minimized.",
        "math": "The training objective is to find optimal parameters $\\theta^*$:\n$$\\theta^* = \\arg\\min_\\theta \\mathcal{L}(\\theta) = \\arg\\min_\\theta \\frac{1}{M} \\sum_{i=1}^M (y_i - \\langle Z_0(x_i, \\theta) \\rangle)^2$$",
        "circuitConnection": "In QubitLab, the mission dashboard tracks the Mean Squared Error across training batches as circuit parameters are tuned.",
        "visualIntuition": "Imagine molding a flexible rubber sheet (the decision boundary) over a 2D scatter plot of customer data points until all blue points lie on one side and all red points lie on the other.",
        "example": "If a customer has true label $y = +1$ and the QNN predicts $\\hat{y} = +0.8$, the squared error is $(1 - 0.8)^2 = 0.04$. If the model predicted $\\hat{y} = -0.5$ (wrong class), the error is $(1 - (-0.5))^2 = 2.25$.",
        "commonMistakes": [
          "Matching labels $y \\in \\{0, 1\\}$ directly against raw expectation values $\\hat{y} \\in \\{-1, +1\\}$. If using labels 0 and 1, either rescale predictions to $[0, 1]$ via $(1+\\hat{y})/2$ or convert labels to $\\{-1, +1\\}$.",
          "Overfitting a small training dataset using an overly expressive ansatz with too many parameters."
        ],
        "checkQuestion": "What is the value of the MSE loss for a single sample if the true label is +1 and the QNN prediction is +0.5?",
        "checkAnswer": "(1.0 - 0.5)² = 0.25.",
        "nextConnection": "How do we compute gradients of quantum circuits to minimize this loss? We use the exact analytical Parameter-Shift Rule.",
        "qiskitCode": "# Calculating MSE loss in Python\ndef mse_loss(predictions, targets):\n    return sum((y - y_hat)**2 for y, y_hat in zip(targets, predictions)) / len(targets)\nprint('MSE Loss (target=1, pred=0.8):', mse_loss([0.8], [1.0]))"
      },
      {
        "id": "qnn-phase-8",
        "order": 8,
        "title": "The Parameter-Shift Rule for Exact Quantum Gradients",
        "duration": "6 min",
        "xp_reward": 50,
        "objective": "Understand why finite differences fail on quantum hardware and master the Parameter-Shift Rule for evaluating exact analytical quantum gradients.",
        "explanation": "To perform gradient descent on a neural network, we need the partial derivatives of the loss with respect to each parameter: $\\frac{\\partial \\mathcal{L}}{\\partial \\theta_j}$. In classical deep learning, backpropagation uses automatic differentiation through cached intermediate layer activations. However, in quantum mechanics, the **No-Cloning Theorem** and state collapse prevent caching intermediate quantum states!\n\nCan we use classical finite differences $\\frac{f(\\theta + \\epsilon) - f(\\theta)}{\\epsilon}$? No! When $\\epsilon$ is small, the difference in expectation values is tiny and completely overwhelmed by statistical shot noise.\n\nIn 2019, Mitarai et al. and Schuld et al. derived the **Parameter-Shift Rule**: For any quantum circuit with generator $G = \\frac{1}{2}P$ (such as Pauli rotations $R_x, R_y, R_z$), the exact analytical gradient is given by evaluating the circuit at two macroscopic shift positions, $+\\pi/2$ and $-\\pi/2$:\n$$\\frac{\\partial \\langle O \\rangle}{\\partial \\theta_j} = \\frac{\\langle O \\rangle_{\\theta_j + \\pi/2} - \\langle O \\rangle_{\\theta_j - \\pi/2}}{2}$$\n\nNotice that the shift $\\pi/2$ ($90^\\circ$) is huge! It evaluates the circuit at macroscopic points where shot noise does not drown out the signal, yet mathematically yields the **exact analytical derivative**!",
        "math": "The Parameter-Shift theorem:\nLet $f(\\theta) = \\langle 0 | U^\\dagger(\\theta) O U(\\theta) | 0 \\rangle$ where $U(\\theta) = e^{-i \\frac{\\theta}{2} P}$.\nSince $f(\\theta) = A \\cos(\\theta) + B \\sin(\\theta)$, its derivative is:\n$$f'(\\theta) = -A \\sin(\\theta) + B \\cos(\\theta) = \\frac{f(\\theta + \\pi/2) - f(\\theta - \\pi/2)}{2}$$\nZero approximation error: this is not an estimate; it is the exact derivative!",
        "circuitConnection": "To compute the gradient with respect to parameter $\\theta_j$, QubitLab runs the circuit twice: once with $\\theta_j + \\pi/2$ and once with $\\theta_j - \\pi/2$.",
        "visualIntuition": "Because single-qubit rotations trace pure sine waves on the Bloch sphere, knowing the values at two points $90^\\circ$ apart mathematically locks down the slope at the midpoint.",
        "example": "If parameter $\\theta_1 = 0.4$: evaluate the circuit at $\\theta_1 = 0.4 + \\pi/2 \\approx 1.97$ (measured $\\langle Z \\rangle = +0.8$) and at $\\theta_1 = 0.4 - \\pi/2 \\approx -1.17$ (measured $\\langle Z \\rangle = -0.2$). The exact gradient is $(0.8 - (-0.2))/2 = +0.50$.",
        "commonMistakes": [
          "Using tiny finite difference steps like $\\epsilon = 10^{-5}$ on quantum circuits. Statistical shot noise will produce wildly erratic, meaningless gradients.",
          "Thinking backpropagation can be executed inside quantum hardware. Backpropagation is mathematically incompatible with unitary evolution and state collapse."
        ],
        "checkQuestion": "How many quantum circuit evaluations are required to compute the gradient of an n-parameter QNN using the parameter-shift rule?",
        "checkAnswer": "2n circuit evaluations (two evaluations, +π/2 and -π/2, for each of the n parameters).",
        "nextConnection": "With analytical gradients available, let's explore classical gradient descent and parameter updates.",
        "qiskitCode": "# Parameter-shift gradient demonstration\ndef parameter_shift_gradient(circuit_fn, theta):\n    import numpy as np\n    f_plus = circuit_fn(theta + np.pi / 2)\n    f_minus = circuit_fn(theta - np.pi / 2)\n    return (f_plus - f_minus) / 2.0\nprint('Parameter-shift gradient estimator defined')"
      },
      {
        "id": "qnn-phase-9",
        "order": 9,
        "title": "Hybrid Classical Optimization (Gradient Descent & Adam)",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Understand how classical optimizers (Gradient Descent, Adam, SPSA) use quantum gradients to update QNN weights.",
        "explanation": "Once the quantum processor computes the gradient vector $\\nabla_\\theta \\mathcal{L}$, a classical optimization algorithm updates the parameters:\n$$\\theta^{(t+1)} = \\theta^{(t)} - \\eta \\nabla_\\theta \\mathcal{L}(\\theta^{(t)})$$\nwhere $\\eta > 0$ is the **learning rate**.\n\nIn practical QNN training, standard Gradient Descent can oscillate wildly in narrow valleys or stall on plateaus. Modern frameworks use advanced adaptive optimizers:\n1. **Adam (Adaptive Moment Estimation)**: Maintains running averages of both past gradients (momentum) and squared gradients, adapting the learning rate for each parameter individually.\n2. **SPSA (Simultaneous Perturbation Stochastic Approximation)**: Approximates the entire gradient vector using only 2 circuit evaluations total (by randomly perturbing all parameters simultaneously with a Rademacher vector), regardless of how many parameters exist!\n\nThis hybrid interaction continues for multiple training epochs until the loss stabilizes and training converges.",
        "math": "Parameter update rule with momentum:\n$$v_t = \\beta v_{t-1} + (1 - \\beta) \\nabla_\\theta \\mathcal{L}$$\n$$\\theta_{t+1} = \\theta_t - \\eta v_t$$\nSPSA gradient approximation with perturbation vector $\\Delta_k \\in \\{\\pm 1\\}^d$:\n$$\\hat{g}_k(\\theta) = \\frac{f(\\theta + c_k \\Delta_k) - f(\\theta - c_k \\Delta_k)}{2 c_k} \\Delta_k^{-1}$$",
        "circuitConnection": "In QubitLab, the optimization loop runs in real time, updating the circuit angle sliders after each training step.",
        "visualIntuition": "Imagine skiing down a foggy mountain. The parameter-shift rule feels the slope beneath your skis, and Adam momentum carries you smoothly through shallow dips toward the base lodge.",
        "example": "With $\\theta = 1.0$, learning rate $\\eta = 0.1$, and calculated gradient $\\nabla \\mathcal{L} = 0.6$: the updated angle is $\\theta_{\\text{new}} = 1.0 - (0.1 \\times 0.6) = 0.94$.",
        "commonMistakes": [
          "Setting the learning rate too high (e.g. $\\eta = 5.0$), causing parameters to jump wildly across the periodic landscape.",
          "Setting the learning rate too low (e.g. $\\eta = 0.0001$), causing the model to appear completely frozen."
        ],
        "checkQuestion": "What is the primary computational advantage of the SPSA optimizer over standard parameter-shift gradient descent?",
        "checkAnswer": "SPSA requires only 2 circuit evaluations per step regardless of the number of parameters, whereas parameter-shift requires 2n evaluations.",
        "nextConnection": "Let's investigate the greatest theoretical challenge in scaling Quantum Neural Networks: Barren Plateaus.",
        "qiskitCode": "# Simple gradient descent update step in Python\ntheta = 1.2\ngradient = 0.45\nlr = 0.1\ntheta_new = theta - lr * gradient\nprint(f'Updated theta: {theta_new:.4f}')"
      },
      {
        "id": "qnn-phase-10",
        "order": 10,
        "title": "Barren Plateaus in QML & Trainability",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Understand how random deep ansätze suffer from exponentially vanishing gradients and learn architectural mitigation strategies.",
        "explanation": "A major theoretical discovery in quantum machine learning (McClean et al., 2018) proved that randomly initialized parameterized circuits suffer from **Barren Plateaus**.\n\nAs the number of qubits $n$ increases, the volume of Hilbert space grows exponentially ($2^n$). If the ansatz is deep and randomly parameterized, it forms a 2-design that randomizes quantum states uniformly across the Hilbert space. As a result, the expectation value concentrates around a fixed constant for almost all parameter values, and the variance of the gradient vanishes exponentially:\n$$\\text{Var}\\left( \\frac{\\partial \\mathcal{L}}{\\partial \\theta_k} \\right) \\sim \\mathcal{O}\\left(\\frac{1}{2^n}\\right)$$\n\nWhen a barren plateau occurs, the gradient is so tiny that detecting it requires an exponential number of measurement shots! The network becomes completely untrainable.\n\n**Mitigation Strategies**:\n1. **Shallow Circuits**: Keep circuit depth $L \\ll n$.\n2. **Local Cost Functions**: Measure observables on local single qubits ($Z_0$) rather than global observables ($Z_0 \\otimes Z_1 \\dots Z_n$).\n3. **Identity Initialization**: Initialize rotation angles near zero so the ansatz begins as the identity operator.",
        "math": "Gradient variance scaling:\n$$\\text{Var}[\\partial_k \\mathcal{L}] \\le \\frac{c}{2^{\\alpha n}} \\implies \\sigma(\\partial_k \\mathcal{L}) \\le \\frac{\\sqrt{c}}{2^{\\alpha n / 2}}$$\nFor local observables (single qubit), gradient variance decays polynomially in depth $\\mathcal{O}(1/L)$, avoiding barren plateaus when depth is logarithmic $L = \\mathcal{O}(\\log n)$.",
        "circuitConnection": "In QubitLab, we use a single-qubit measurement observable on $q_0$ and shallow depth ($L=1$ or $2$) to ensure strong, trainable gradients.",
        "visualIntuition": "Imagine Hilbert space as the Pacific Ocean. A global measurement looks for a single coin dropped on the ocean floor (impossible to find). A local measurement searches only a 5-foot shallow wading pool near shore.",
        "example": "On an 8-qubit system: a global observable has gradient variance $\\sim 1/256 \\approx 0.0039$. A local observable on $q_0$ maintains gradient variance $\\sim 0.12$, allowing fast convergence with only 100 shots.",
        "commonMistakes": [
          "Using global observables like $Z_0 Z_1 Z_2 Z_3 Z_4$ for classification. Global observables guarantee barren plateaus as qubit counts scale!",
          "Initializing all parameters with uniform random angles over $[0, 2\\pi]$. Always initialize near zero or use layer-by-layer pre-training."
        ],
        "checkQuestion": "Which observable type is more resistant to barren plateaus in QNNs: a local single-qubit observable (Z_0) or a global multi-qubit observable (Z_0 ⊗ Z_1 ⊗ ... ⊗ Z_n)?",
        "checkAnswer": "A local single-qubit observable (Z_0), because its gradients decay polynomially rather than exponentially.",
        "nextConnection": "Let's review the most common circuit debugging mistakes encountered when building Quantum Neural Networks.",
        "qiskitCode": "# Identity initialization strategy in Qiskit\nfrom qiskit.circuit import ParameterVector\nthetas = ParameterVector('θ', 4)\n# Initialize parameters near zero rather than randomly\ninitial_values = [0.01] * 4\nprint('Identity-near parameters:', initial_values)"
      },
      {
        "id": "qnn-phase-11",
        "order": 11,
        "title": "Common Circuit Mistakes & Debugging in QML",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Identify and debug the three most common QNN circuit bugs: unscaled feature maps, missing entanglers, and observable target mismatches.",
        "explanation": "When debugging Quantum Neural Networks in Quantum Studio, look out for these three critical bugs:\n\n1. **Unscaled Feature Values (The Aliasing Bug)**:\nIf your raw customer data contains features like 'Annual Income = $75,000' or 'Credit Score = 720' and you pass those numbers directly to an $R_y$ gate, the rotation angle $\\theta = 75,000$ radians wraps around the $2\\pi$ circle over 11,900 times! Minute noise in the input completely randomizes the angle. Always normalize inputs to $[0, \\pi]$ or $[-\\pi, \\pi]$.\n\n2. **Missing Entangling Gates (The Separable Model Bug)**:\nIf your ansatz contains only rotation gates without CNOTs, the quantum state is an unentangled product state: $|\\psi\\rangle = |q_0\\rangle \\otimes |q_1\\rangle \\dots$. The measurement on $q_0$ depends ONLY on feature 0 and parameter 0, completely ignoring all other customer attributes!\n\n3. **Measuring the Wrong Qubit**:\nIf your loss function evaluates the expectation of $q_0$, but your CNOT chain placed the classification output on $q_2$, your classical optimizer will find zero correlation between predictions and labels.",
        "math": "Feature normalization formula:\n$$x_{\\text{norm}} = \\pi \\times \\frac{x - x_{\\text{min}}}{x_{\\text{max}} - x_{\\text{min}}} \\in [0, \\pi]$$\nThis maps any arbitrary feature range cleanly into the first two quadrants of the Bloch sphere without wrap-around aliasing.",
        "circuitConnection": "In QubitLab, check that your input feature sliders map to $[0, \\pi]$, your CNOT gates bridge all feature lines, and your measurement meter is placed on the readout qubit $q_0$.",
        "visualIntuition": "Using unscaled inputs is like setting a clock by spinning the hands around 10,000 times as fast as possible—you have no idea what time it will stop on.",
        "example": "Symptom: The QNN achieves only 50% accuracy (random guessing). Diagnosis: You forgot to place CNOT gates between $q_0$ and $q_1$. Because $q_0$ was never entangled with $q_1$, the network was trying to classify customers based purely on income while completely ignoring credit score!",
        "commonMistakes": [
          "Over-parameterizing the circuit beyond the expressibility required for the dataset.",
          "Failing to seed the random number generator, leading to non-reproducible training runs."
        ],
        "checkQuestion": "What happens if you feed raw customer income (e.g. $80,000) directly into a rotation gate Ry(x) without normalization?",
        "checkAnswer": "The angle wraps around 2π thousands of times (aliasing), causing tiny input variations to produce completely random, chaotic quantum states.",
        "nextConnection": "Now you are ready to assemble the full Quantum Neural Network and classify customer data in Quantum Studio!",
        "qiskitCode": "# Normalizing input features in Python\nimport numpy as np\nraw_data = np.array([25000, 50000, 75000, 100000])\nscaled_data = np.pi * (raw_data - raw_data.min()) / (raw_data.max() - raw_data.min())\nprint('Normalized angles (radians):', np.round(scaled_data, 3))"
      },
      {
        "id": "qnn-phase-12",
        "order": 12,
        "title": "Full QNN Workflow & Customer Classification",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Synthesize the complete hybrid QNN pipeline in Quantum Studio, classify automotive customer data, and claim your Mission 05 XP.",
        "explanation": "You have completed the Quantum Neural Network curriculum! Let's review the complete hybrid machine learning workflow:\n1. **Data Pre-processing**: Scale multi-dimensional customer features into rotation angles $x_i \\in [0, \\pi]$.\n2. **Feature Map**: Encode the scaled features into an $n$-qubit quantum state using parallel $R_y(x_i)$ gates.\n3. **Trainable Ansatz**: Apply parameterized rotations $R_y(\\theta_j), R_z(\\phi_j)$ interleaved with CNOT entangling gates.\n4. **Readout Measurement**: Measure qubit 0 to compute the expectation value $\\langle Z_0 \\rangle \\in [-1, +1]$.\n5. **Optimization**: Calculate prediction loss, evaluate parameter gradients via the parameter-shift rule, and update angles $\\theta$ until convergence.\n\nEnter Quantum Studio now to wire your QNN circuit, train the variational parameters, achieve the target classification accuracy on customer test data, and claim your Mission 05 XP!",
        "math": "Complete QNN classifier mapping:\n$$f(x; \\theta) = \\text{sign}\\left( \\langle 0 | U_\\Phi^\\dagger(x) W^\\dagger(\\theta) Z_0 W(\\theta) U_\\Phi(x) | 0 \\rangle \\right)$$\nWhen trained, $f(x; \\theta)$ successfully separates target customer classes with high statistical confidence.",
        "circuitConnection": "In QubitLab, Mission 05 loads an automotive customer dataset. Your circuit uses 2 qubits to classify customers into 'Electric Vehicle Buyer' vs 'Combustion Vehicle Buyer'.",
        "visualIntuition": "Watch the QubitLab decision boundary plot update in real time: as you tune the ansatz angles, the boundary flexes and curves until it cleanly isolates the two customer clusters.",
        "example": "A customer with High Income ($x_0 = 2.4$) and Urban Location ($x_1 = 2.8$) evaluates to $\\langle Z_0 \\rangle = -0.78$. The negative sign classifies them as an Electric Vehicle Buyer with 89% probability.",
        "commonMistakes": [
          "Confusing feature parameters (which change with every sample) with ansatz parameters (which are shared across all samples and updated during training).",
          "Failing to verify classification accuracy on a held-out test split."
        ],
        "checkQuestion": "In the hybrid QNN workflow, which parameters change for every data point and which parameters are optimized across the dataset?",
        "checkAnswer": "The feature map angles x_i change for every data point; the ansatz angles θ_j are model weights that are optimized across the entire dataset.",
        "nextConnection": "Proceed to Quantum Studio to build your QNN, train your circuit, and advance to Level 6: Quantum Teleportation!",
        "qiskitCode": "# Full 2-qubit QNN classifier circuit template\nfrom qiskit import QuantumCircuit\nqc = QuantumCircuit(2, 1)\n# Feature map (inputs x0, x1)\nqc.ry(1.2, 0); qc.ry(2.1, 1)\n# Ansatz (weights w0, w1)\nqc.cx(0, 1)\nqc.ry(0.5, 0); qc.rz(0.8, 1)\n# Measure readout qubit\nqc.measure(0, 0)\nprint('QNN Mission 05 ready for training!')"
      }
    ]
  },
  "teleportation": {
    "projectId": "teleportation",
    "algorithm": "Quantum Teleportation Protocol",
    "overview": "Transmit an unknown arbitrary quantum state |ψ⟩ from Alice to Bob using an entangled Bell pair, Bell-basis measurement, and 2 classical communication bits.",
    "difficulty": "Intermediate",
    "totalDuration": "65 min",
    "phases": [
      {
        "id": "teleport-phase-1",
        "order": 1,
        "title": "What Quantum Teleportation Actually Is & Isn't",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Understand the true physical meaning of quantum teleportation: state transfer via entanglement, dispelling sci-fi misconceptions.",
        "explanation": "Quantum teleportation is often misunderstood due to science fiction. It is **not** the instantaneous physical dematerialization and transportation of matter across space (like in Star Trek). Rather, it is the exact disembodied transfer of an **unknown quantum state** $|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle$ from a source qubit (Alice) to a distant destination qubit (Bob).\n\nKey physical realities of quantum teleportation:\n1. **No Physical Matter Moves**: Only the quantum information (the complex amplitudes $\\alpha$ and $\\beta$) is transferred; Bob's physical qubit was already sitting on his desk.\n2. **No Superluminal Communication**: The protocol strictly requires Alice to transmit **2 classical bits** over a standard classical channel to Bob. Because classical signals cannot exceed the speed of light, quantum teleportation cannot be used for faster-than-light communication (respecting Einstein's Special Relativity).\n3. **The Original is Destroyed**: In compliance with the No-Cloning Theorem, Alice's original qubit state is completely destroyed during measurement. The state is transferred, not duplicated!",
        "math": "The state being teleported is an arbitrary unknown qubit:\n$$|\\psi\\rangle = \\alpha |0\\rangle + \\beta |1\\rangle, \\quad |\\alpha|^2 + |\\beta|^2 = 1$$\nAlice does not know $\\alpha$ or $\\beta$. If she tried to measure $|\\psi\\rangle$ to determine them, she would collapse it, destroying the information permanently!",
        "circuitConnection": "In QubitLab, the circuit uses 3 qubits: $q_0$ (Alice's secret message state $|\\psi\\rangle$), $q_1$ (Alice's half of the entangled pair), and $q_2$ (Bob's receiving qubit).",
        "visualIntuition": "Imagine you have an unbaked sculpture made of delicate mist ($|\\psi\\rangle$). If you touch it to measure it, it evaporates. Instead, you entangle it with a paired crystal, shatter the original, and send two instructions to a friend who uses their twin crystal to recreate the exact sculpture.",
        "example": "Alice holds a qubit in state $|\\psi\\rangle = 0.6|0\\rangle + 0.8|1\\rangle$. She does not know $\\alpha=0.6$ or $\\beta=0.8$. After teleportation, Bob's qubit $q_2$ is in state $0.6|0\\rangle + 0.8|1\\rangle$ with 100% fidelity.",
        "commonMistakes": [
          "Believing teleportation allows faster-than-light signaling. Without the 2 classical bits sent at light speed, Bob's qubit is in a maximally mixed state containing zero information.",
          "Thinking quantum teleportation violates the No-Cloning Theorem. Alice's state is destroyed in the process, ensuring only a single copy ever exists."
        ],
        "checkQuestion": "Why does quantum teleportation NOT enable faster-than-light (superluminal) communication?",
        "checkAnswer": "Because Bob cannot reconstruct the teleported state until he receives 2 classical bits from Alice, which are constrained by the speed of light.",
        "nextConnection": "Let's examine why classical communication is an absolute mathematical requirement for state reconstruction.",
        "qiskitCode": "from qiskit import QuantumCircuit\n# 3-qubit teleportation circuit skeleton\nqc = QuantumCircuit(3, 2)\nprint('Teleportation 3-qubit register initialized')"
      },
      {
        "id": "teleport-phase-2",
        "order": 2,
        "title": "Why Classical Communication is Strictly Required",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Understand why entanglement alone cannot transfer information and why 2 classical bits are required to resolve the 4 possible unitary rotations.",
        "explanation": "Why can't entanglement alone transmit information instantaneously? This fundamental principle is known as the **No-Communication Theorem**.\n\nWhen two particles are entangled, their joint state exhibits non-local correlations. However, if Alice performs a measurement on her particle without sending classical messages, the reduced density matrix of Bob's particle remains completely unchanged:\n$$\\rho_{\\text{Bob}} = \\text{Tr}_{\\text{Alice}}(\\rho_{\\text{AB}}) = \\frac{1}{2} I = \\begin{pmatrix} 1/2 & 0 \\\\ 0 & 1/2 \\end{pmatrix}$$\nThis is a **maximally mixed state**: from Bob's perspective, measuring his qubit yields purely random 50/50 noise regardless of what Alice did!\n\nAlice's Bell measurement produces one of **4 equally likely classical outcomes**: 00, 01, 10, or 11. Each outcome corresponds to a specific Pauli transformation on Bob's qubit ($I, X, Z,$ or $XZ$). Until Bob receives Alice's 2 classical bits, he has no way of knowing which of the 4 transformations occurred, and his qubit remains in total statistical uncertainty.",
        "math": "Without classical knowledge, Bob's state is the statistical mixture of all 4 possibilities:\n$$\\rho_B = \\frac{1}{4} |\\psi\\rangle\\langle\\psi| + \\frac{1}{4} X|\\psi\\rangle\\langle\\psi|X + \\frac{1}{4} Z|\\psi\\rangle\\langle\\psi|Z + \\frac{1}{4} XZ|\\psi\\rangle\\langle\\psi|ZX = \\frac{1}{2} I$$\nThe identity matrix $\\frac{1}{2}I$ contains zero information about $\\alpha$ or $\\beta$.",
        "circuitConnection": "In QubitLab, the two classical measurement wires from $q_0$ and $q_1$ connect to classically controlled gates on Bob's wire $q_2$.",
        "visualIntuition": "Imagine sending an encrypted letter in a locked titanium box. The box arrives instantly, but it is useless until the sender mails you the 2-digit padlock combination over standard mail.",
        "example": "If Alice measures outcome '10', Bob's qubit is currently rotated by a Pauli Z gate: $\\alpha|0\\rangle - \\beta|1\\rangle$. Once Alice tells him '10', Bob applies another Pauli Z gate, restoring $\\alpha|0\\rangle + \\beta|1\\rangle$.",
        "commonMistakes": [
          "Assuming Bob can determine which Pauli error occurred by measuring his qubit. Measuring destroys the state and provides zero information about relative phases.",
          "Thinking 1 classical bit is enough. Because there are 4 distinct Bell states ($2^2 = 4$), exactly $\\log_2(4) = 2$ classical bits are mathematically required."
        ],
        "checkQuestion": "How many classical bits must Alice transmit to Bob to enable complete reconstruction of the teleported state?",
        "checkAnswer": "Exactly 2 classical bits, needed to distinguish between the 4 possible Bell measurement outcomes.",
        "nextConnection": "Now let's examine the essential quantum resource that bridges Alice and Bob: the entangled Bell pair.",
        "qiskitCode": "# Verifying Bob's density matrix before classical reception\nfrom qiskit.quantum_info import DensityMatrix\n# Maximally mixed state represents total uncertainty\nrho_bob = DensityMatrix([[0.5, 0], [0, 0.5]])\nprint('Bob density matrix before classical message:\\n', rho_bob)"
      },
      {
        "id": "teleport-phase-3",
        "order": 3,
        "title": "Entanglement & Bell Pair Generation (|Φ⁺⟩)",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Understand EPR pairs, the Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2, and how to create entanglement using a Hadamard and a CNOT gate.",
        "explanation": "The quantum resource that enables teleportation is a shared entangled pair of qubits (an **EPR pair** or **Bell state**). Before the protocol begins, a third party (or Alice) prepares two qubits in the maximally entangled Bell state $|\\Phi^+\\rangle$ and distributes one qubit to Alice ($q_1$) and one qubit to Bob ($q_2$):\n$$|\\Phi^+\\rangle = \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}$$\n\nHow is this state created in a quantum circuit?\n1. Start with two qubits in the ground state $|00\\rangle$.\n2. Apply a **Hadamard gate** $H$ to the first qubit ($q_1$), creating equal superposition: $\\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}} \\otimes |0\\rangle = \\frac{|00\\rangle + |10\\rangle}{\\sqrt{2}}$.\n3. Apply a **CNOT gate** with control on $q_1$ and target on $q_2$. When $q_1=0$, $q_2$ remains $0$; when $q_1=1$, $q_2$ is flipped to $1$!\n\nThe resulting state is $|\\Phi^+\\rangle = \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}$. This state cannot be factored into independent product states—the two qubits are fundamentally entangled!",
        "math": "Mathematical derivation:\n$$|00\\rangle \\xrightarrow{H \\otimes I} \\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}} |0\\rangle = \\frac{|00\\rangle + |10\\rangle}{\\sqrt{2}}$$\n$$\\xrightarrow{\\text{CNOT}_{12}} \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}} = |\\Phi^+\\rangle$$\nThe 4 canonical Bell states are:\n$$|\\Phi^\\pm\\rangle = \\frac{|00\\rangle \\pm |11\\rangle}{\\sqrt{2}}, \\quad |\\Psi^\\pm\\rangle = \\frac{|01\\rangle \\pm |10\\rangle}{\\sqrt{2}}$$",
        "circuitConnection": "In QubitLab, the entanglement generation stage consists of an $H$ gate on $q_1$ followed by a CNOT from $q_1$ to $q_2$.",
        "visualIntuition": "Imagine creating twin magic coins in a forge. Wherever they travel in the universe, if coin 1 lands on Heads, coin 2 is guaranteed to land on Heads; if Tails, Tails.",
        "example": "If Alice measures her half ($q_1$) and records 0, Bob's qubit ($q_2$) collapses to $|0\\rangle$ instantly. If Alice records 1, Bob's qubit collapses to $|1\\rangle$.",
        "commonMistakes": [
          "Placing the CNOT control on $q_2$ and target on $q_1$. To entangle from the Hadamard state on $q_1$, $q_1$ must be the control!",
          "Believing an entangled pair can be used more than once. Entanglement is consumed (destroyed) during the teleportation protocol."
        ],
        "checkQuestion": "What two quantum gates in sequence are used to transform the ground state |00⟩ into the maximally entangled Bell state |Φ⁺⟩?",
        "checkAnswer": "A Hadamard (H) gate on the first qubit, followed by a CNOT gate with the first qubit as control and second qubit as target.",
        "nextConnection": "Now let's examine the total 3-qubit quantum state before Alice begins her operations.",
        "qiskitCode": "from qiskit import QuantumCircuit\nqc = QuantumCircuit(2)\nqc.h(0)\nqc.cx(0, 1)\nprint('Bell state |Phi+> prepared successfully')"
      },
      {
        "id": "teleport-phase-4",
        "order": 4,
        "title": "The 3-Qubit Total State (|ψ⟩ ⊗ |Φ⁺⟩)",
        "duration": "6 min",
        "xp_reward": 50,
        "objective": "Derive the joint 3-qubit state tensor product |ψ⟩ ⊗ |Φ⁺⟩ and expand it in the computational basis.",
        "explanation": "At the start of the protocol, the system consists of three qubits:\n- Qubit $q_0$: Alice's message state $|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle$\n- Qubits $q_1, q_2$: The shared Bell pair $|\\Phi^+\\rangle = \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}$\n\nBecause the message qubit has not yet interacted with the Bell pair, the total 3-qubit state $|\\psi_0\\rangle$ is the tensor product:\n$$|\\psi_0\\rangle = |\\psi\\rangle \\otimes |\\Phi^+\\rangle = (\\alpha|0\\rangle + \\beta|1\\rangle) \\otimes \\frac{1}{\\sqrt{2}}(|00\\rangle + |11\\rangle)$$\n\nExpanding this product across all 8 computational basis states gives:\n$$|\\psi_0\\rangle = \\frac{1}{\\sqrt{2}} \\left( \\alpha|000\\rangle + \\alpha|011\\rangle + \\beta|100\\rangle + \\beta|111\\rangle \\right)$$\nwhere in ket $|q_0 q_1 q_2\\rangle$, $q_0$ and $q_1$ belong to Alice, and $q_2$ belongs to Bob.",
        "math": "Expansion of the 3-qubit state:\n$$|\\psi_0\\rangle = \\frac{1}{\\sqrt{2}} \\Big[ \\alpha|0\\rangle(|00\\rangle + |11\\rangle) + \\beta|1\\rangle(|00\\rangle + |11\\rangle) \\Big]$$\n$$= \\frac{1}{\\sqrt{2}} \\Big( \\alpha|000\\rangle + \\alpha|011\\rangle + \\beta|100\\rangle + \\beta|111\\rangle \\Big)$$\nNotice that Bob's qubit ($q_2$) is correlated with Alice's ancilla ($q_1$), but not yet with the message qubit ($q_0$).",
        "circuitConnection": "In QubitLab, the first column after state preparation represents this exact state vector across wires $q_0, q_1, q_2$.",
        "visualIntuition": "Alice has two marbles on her desk ($q_0, q_1$). Bob has one marble on his desk across town ($q_2$). Marble 1 and Marble 2 are joined by an invisible quantum rubber band.",
        "example": "If $|\\psi\\rangle = |1\\rangle$ ($\\alpha=0, \\beta=1$), the state simplifies to $\\frac{1}{\\sqrt{2}}(|100\\rangle + |111\\rangle)$.",
        "commonMistakes": [
          "Mixing up qubit ordering. In Qiskit, qubits are written $|q_2 q_1 q_0\\rangle$ (little-endian), whereas in standard mathematical literature they are often written $|q_0 q_1 q_2\\rangle$ (big-endian). Always track wire indices explicitly!",
          "Assuming the message qubit is already entangled with Bob's qubit. Alice must perform local entangling operations first."
        ],
        "checkQuestion": "How many basis states have non-zero amplitude in the initial 3-qubit product state |ψ⟩ ⊗ |Φ⁺⟩?",
        "checkAnswer": "4 basis states (|000⟩, |011⟩, |100⟩, |111⟩), each with amplitude scaled by α/√2 or β/√2.",
        "nextConnection": "Now Alice performs her first operation: entangling her message qubit with her half of the Bell pair using a CNOT gate.",
        "qiskitCode": "# 3-qubit state expansion\nfrom qiskit import QuantumCircuit\nqc = QuantumCircuit(3)\n# Prepare Bell pair on q1, q2\nqc.h(1); qc.cx(1, 2)\nprint('3-qubit system initialized')"
      },
      {
        "id": "teleport-phase-5",
        "order": 5,
        "title": "Alice's Entangling CNOT Operation",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Understand the action of Alice's local CNOT gate between message qubit q0 (control) and Bell qubit q1 (target).",
        "explanation": "To transfer the information from $q_0$ into the shared entanglement channel, Alice performs a **CNOT gate** entirely on her local side, with her message qubit $q_0$ as the control and her Bell qubit $q_1$ as the target.\n\nLet's calculate the effect on our 4 terms in $|\\psi_0\\rangle = \\frac{1}{\\sqrt{2}}(\\alpha|000\\rangle + \\alpha|011\\rangle + \\beta|100\\rangle + \\beta|111\\rangle)$:\n- For the first two terms ($q_0 = 0$): the control is 0, so $q_1$ is untouched:\n  - $\\alpha|000\\rangle \\mapsto \\alpha|000\\rangle$\n  - $\\alpha|011\\rangle \\mapsto \\alpha|011\\rangle$\n- For the second two terms ($q_0 = 1$): the control is 1, so $q_1$ is flipped ($0 \\leftrightarrow 1$):\n  - $\\beta|100\\rangle \\mapsto \\beta|110\\rangle$\n  - $\\beta|111\\rangle \\mapsto \\beta|101\\rangle$\n\nThe state after Alice's CNOT is:\n$$|\\psi_1\\rangle = \\frac{1}{\\sqrt{2}} \\left( \\alpha|000\\rangle + \\alpha|011\\rangle + \\beta|110\\rangle + \\beta|101\\rangle \\right)$$\nNotice what happened: the message amplitudes $\\alpha$ and $\\beta$ are now entangled across all three qubits!",
        "math": "Action of $\\text{CNOT}_{01} \\otimes I_2$:\n$$\\text{CNOT}_{01} |\\psi_0\\rangle = \\frac{1}{\\sqrt{2}} \\Big( \\alpha|000\\rangle + \\alpha|011\\rangle + \\beta|110\\rangle + \\beta|101\\rangle \\Big)$$\nNotice that when $q_0 = 1$, the middle qubit flipped.",
        "circuitConnection": "In QubitLab, place a CNOT gate with control on wire $q_0$ and target on wire $q_1$. Do not touch wire $q_2$!",
        "visualIntuition": "Alice hooks a mechanical linkage between her two marbles. If marble 0 is in state 1, it trips a switch that flips marble 1.",
        "example": "If $\\alpha=1, \\beta=0$ (message is $|0\\rangle$), state is $\\frac{1}{\\sqrt{2}}(|000\\rangle + |011\\rangle)$. If $\\beta=1$ (message is $|1\\rangle$), state is $\\frac{1}{\\sqrt{2}}(|110\\rangle + |101\\rangle)$.",
        "commonMistakes": [
          "Applying the CNOT between $q_0$ and Bob's qubit $q_2$. Bob's qubit is far away across town! Alice can ONLY touch qubits in her local laboratory ($q_0$ and $q_1$).",
          "Flipping the control and target: placing control on $q_1$ and target on $q_0$ completely breaks the protocol."
        ],
        "checkQuestion": "What happens to the term β|100⟩ when Alice applies a CNOT with control on q0 and target on q1?",
        "checkAnswer": "It transforms into β|110⟩, because the control qubit q0 is 1, causing the target qubit q1 to flip from 0 to 1.",
        "nextConnection": "Now Alice applies a Hadamard gate to her message qubit q0 to complete the rotation into the Bell basis.",
        "qiskitCode": "from qiskit import QuantumCircuit\nqc = QuantumCircuit(3)\n# Alice applies CNOT(0, 1)\nqc.cx(0, 1)\nprint('Alice entangles message qubit with Bell qubit')"
      },
      {
        "id": "teleport-phase-6",
        "order": 6,
        "title": "Alice's Hadamard & Bell-Basis Rotation",
        "duration": "6 min",
        "xp_reward": 50,
        "objective": "Understand how applying H to q0 rotates Alice's two qubits into the Bell basis, revealing the 4 conditional states on Bob's qubit.",
        "explanation": "Next, Alice applies a **Hadamard gate** $H$ to her message qubit $q_0$.\n\nRecall: $H|0\\rangle = \\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}}$ and $H|1\\rangle = \\frac{|0\\rangle - |1\\rangle}{\\sqrt{2}}$.\nApplying this substitution to our state $|\\psi_1\\rangle$:\n$$|\\psi_2\\rangle = \\frac{1}{2} \\Big[ \\alpha(|0\\rangle + |1\\rangle)|00\\rangle + \\alpha(|0\\rangle + |1\\rangle)|11\\rangle + \\beta(|0\\rangle - |1\\rangle)|10\\rangle + \\beta(|0\\rangle - |1\\rangle)|01\\rangle \\Big]$$\n\nNow, let us group the terms by the state of **Alice's two qubits** ($q_0, q_1$):\n$$|\\psi_2\\rangle = \\frac{1}{2} \\Big[ |00\\rangle (\\alpha|0\\rangle + \\beta|1\\rangle) + |01\\rangle (\\alpha|1\\rangle + \\beta|0\\rangle) + |10\\rangle (\\alpha|0\\rangle - \\beta|1\\rangle) + |11\\rangle (\\alpha|1\\rangle - \\beta|0\\rangle) \\Big]$$\n\nLook at this equation—it is the crown jewel of the teleportation protocol! Notice that Bob's qubit (the rightmost term in parentheses) now contains the message amplitudes $\\alpha$ and $\\beta$ in all 4 branches of the superposition!",
        "math": "The 4 branches of the 3-qubit state grouped by Alice's qubits $|q_0 q_1\\rangle$:\n$$|\\psi_2\\rangle = \\frac{1}{2} \\Big[ |00\\rangle \\underbrace{(\\alpha|0\\rangle + \\beta|1\\rangle)}_{|\\psi\\rangle = I|\\psi\\rangle} + |01\\rangle \\underbrace{(\\alpha|1\\rangle + \\beta|0\\rangle)}_{X|\\psi\\rangle} + |10\\rangle \\underbrace{(\\alpha|0\\rangle - \\beta|1\\rangle)}_{Z|\\psi\\rangle} + |11\\rangle \\underbrace{(\\alpha|1\\rangle - \\beta|0\\rangle)}_{XZ|\\psi\\rangle} \\Big]$$",
        "circuitConnection": "In QubitLab, place an $H$ gate on wire $q_0$ immediately following the CNOT gate.",
        "visualIntuition": "The combination of CNOT followed by Hadamard performs a Bell-basis measurement rotation. It projects the joint state of Alice's two qubits onto the 4 orthogonal Bell states.",
        "example": "If Alice's qubits are in $|00\\rangle$, Bob's qubit is in the exact state $\\alpha|0\\rangle + \\beta|1\\rangle$ ($I$). If Alice's qubits are in $|10\\rangle$, Bob's qubit has a sign flip on $\\beta$: $\\alpha|0\\rangle - \\beta|1\\rangle$ ($Z$).",
        "commonMistakes": [
          "Applying the Hadamard to $q_1$ instead of $q_0$. $q_0$ is the message qubit and must receive the Hadamard.",
          "Believing Bob's state is already fixed. All 4 branches exist simultaneously in quantum superposition until Alice measures!"
        ],
        "checkQuestion": "What is the state of Bob's qubit q2 if Alice's qubits q0 and q1 are in state |00⟩?",
        "checkAnswer": "α|0⟩ + β|1⟩ (the exact, unaltered original state |ψ⟩).",
        "nextConnection": "Now Alice measures her two qubits, collapsing the system onto one of the 4 branches.",
        "qiskitCode": "from qiskit import QuantumCircuit\nqc = QuantumCircuit(3)\nqc.cx(0, 1)\nqc.h(0)\nprint('Bell measurement rotation complete')"
      },
      {
        "id": "teleport-phase-7",
        "order": 7,
        "title": "Bell Measurement & Classical Outcomes",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Understand how measuring q0 and q1 collapses the system onto one of 4 equally likely classical bit pairs (m0, m1) with probability 25% each.",
        "explanation": "Alice now measures her two qubits ($q_0$ and $q_1$) in the computational basis using standard measurement meters [M].\n\nBecause the amplitude of each of the 4 branches is exactly $1/2$, the Born rule dictates that each outcome occurs with equal probability:\n$$P(00) = P(01) = P(10) = P(11) = \\left|\\frac{1}{2}\\right|^2 = \\frac{1}{4} = 25\\%$$\n\nWhen Alice measures her qubits, the wavefunction collapses:\n- If Alice measures **$00$**: Bob's qubit collapses to $|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle$\n- If Alice measures **$01$**: Bob's qubit collapses to $X|\\psi\\rangle = \\alpha|1\\rangle + \\beta|0\\rangle$\n- If Alice measures **$10$**: Bob's qubit collapses to $Z|\\psi\\rangle = \\alpha|0\\rangle - \\beta|1\\rangle$\n- If Alice measures **$11$**: Bob's qubit collapses to $XZ|\\psi\\rangle = \\alpha|1\\rangle - \\beta|0\\rangle$\n\nAlice records her two measured bits as classical values $m_0, m_1 \\in \\{0, 1\\}$. Notice that Alice's original state $|\\psi\\rangle$ has been destroyed: $q_0$ and $q_1$ are now classical bits.",
        "math": "Wavefunction collapse outcomes:\n$$\\text{Outcome } (m_0, m_1) \\implies |\\psi_{\\text{Bob}}\\rangle = X^{m_1} Z^{m_0} |\\psi\\rangle$$\nwhere $m_0$ is the measurement outcome of $q_0$ and $m_1$ is the measurement outcome of $q_1$.",
        "circuitConnection": "In QubitLab, place measurement meters [M] on wire $q_0$ (recording into classical bit $c_0$) and wire $q_1$ (recording into classical bit $c_1$).",
        "visualIntuition": "Alice rolls a 4-sided die. Whichever number lands faces up dictates which of the 4 orientations Bob's compass needle will point.",
        "example": "Alice runs the measurement: $q_0$ measures 1, $q_1$ measures 0 (outcome 10). Bob's qubit has collapsed to $\\alpha|0\\rangle - \\beta|1\\rangle$.",
        "commonMistakes": [
          "Assuming Alice can predict which outcome she will get. The 4 outcomes are completely random, each occurring with exactly 25% probability.",
          "Thinking Alice's measurement reveals $\\alpha$ or $\\beta$. Alice sees only random bits (0 or 1); she learns absolutely nothing about the secret state $|\\psi\\rangle$!"
        ],
        "checkQuestion": "What is the probability of Alice measuring the specific outcome pair m0=1, m1=1?",
        "checkAnswer": "25% (or 1/4). All 4 Bell measurement outcomes have identical probability |1/2|² = 1/4.",
        "nextConnection": "Alice must now transmit these two classical bits to Bob over a classical channel.",
        "qiskitCode": "from qiskit import QuantumCircuit\nqc = QuantumCircuit(3, 2)\nqc.measure(0, 0)  # m0\nqc.measure(1, 1)  # m1\nprint('Alice measures both qubits into classical bits')"
      },
      {
        "id": "teleport-phase-8",
        "order": 8,
        "title": "Classical Transmission & Bob's Correction Table",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Master the Pauli correction table: mapping Alice's 2 classical bits (m0, m1) to Bob's recovery operations (I, X, Z, XZ).",
        "explanation": "Alice sends her two classical bits $(m_0, m_1)$ to Bob over an ordinary classical channel (telephone, optical fiber, radio).\n\nWhen Bob receives the bits, he consults the universal **Teleportation Correction Table** to determine which unitary correction gate to apply to his qubit $q_2$:\n\n| Alice Measures ($m_0, m_1$) | State of Bob's Qubit $q_2$ | Bob's Required Correction | Final Reconstructed State |\n| :---: | :---: | :---: | :---: |\n| **00** | $\\alpha|0\\rangle + \\beta|1\\rangle$ | **$I$** (Do nothing) | $\\alpha|0\\rangle + \\beta|1\\rangle = |\\psi\\rangle$ |\n| **01** | $\\alpha|1\\rangle + \\beta|0\\rangle$ | **$X$** (Bit flip) | $X(\\alpha|1\\rangle + \\beta|0\\rangle) = |\\psi\\rangle$ |\n| **10** | $\\alpha|0\\rangle - \\beta|1\\rangle$ | **$Z$** (Phase flip) | $Z(\\alpha|0\\rangle - \\beta|1\\rangle) = |\\psi\\rangle$ |\n| **11** | $\\alpha|1\\rangle - \\beta|0\\rangle$ | **$X \\cdot Z$** (Both) | $X Z(\\alpha|1\\rangle - \\beta|0\\rangle) = |\\psi\\rangle$ |\n\nNotice the beauty of the binary encoding:\n- If $m_1 = 1$, Bob applies an **$X$ gate** (bit correction).\n- If $m_0 = 1$, Bob applies a **$Z$ gate** (phase correction).",
        "math": "Bob's conditional recovery operator is concisely written:\n$$U_{\\text{recovery}} = X^{m_1} Z^{m_0}$$\nApplying this operator to Bob's post-measurement state:\n$$U_{\\text{recovery}} |\\psi_{\\text{Bob}}\\rangle = (X^{m_1} Z^{m_0}) (Z^{m_0} X^{m_1} |\\psi\\rangle) = I |\\psi\\rangle = |\\psi\\rangle$$\nState reconstruction is 100% exact and deterministic!",
        "circuitConnection": "In QubitLab, this is wired using classically controlled gates on wire $q_2$: a controlled-X conditioned on $c_1$, and a controlled-Z conditioned on $c_0$.",
        "visualIntuition": "Alice sends two text messages: 'Did it flip?' ($m_1$) and 'Did the phase invert?' ($m_0$). Bob flips switches accordingly to restore the original state.",
        "example": "Alice sends bits '01'. Bob sees $m_1=1$ and $m_0=0$. He applies a Pauli $X$ gate to his qubit $q_2$. His state flips from $\\alpha|1\\rangle + \\beta|0\\rangle$ to $\\alpha|0\\rangle + \\beta|1\\rangle$.",
        "commonMistakes": [
          "Applying $Z$ when $m_1=1$ and $X$ when $m_0=1$. Always verify: $m_1$ (from $q_1$) controls $X$; $m_0$ (from $q_0$) controls $Z$.",
          "Applying the corrections in reverse order without accounting for phase signs: $ZX = -XZ$."
        ],
        "checkQuestion": "If Alice measures m0 = 1 and m1 = 0, what gate must Bob apply to his qubit to recover |ψ⟩?",
        "checkAnswer": "A Pauli Z gate, because m0=1 indicates a phase flip occurred.",
        "nextConnection": "Now let's verify Bob's state reconstruction and calculate the theoretical fidelity.",
        "qiskitCode": "# Classical correction logic\ndef apply_corrections(bob_qubit, m0, m1):\n    # m1 controls X; m0 controls Z\n    if m1 == 1:\n        bob_qubit.x()\n    if m0 == 1:\n        bob_qubit.z()\n    return bob_qubit"
      },
      {
        "id": "teleport-phase-9",
        "order": 9,
        "title": "State Reconstruction & Fidelity Verification",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Verify state reconstruction, compute quantum state fidelity F = |⟨ψ|ψ_reconstructed⟩|² = 1.0, and understand experimental benchmarks.",
        "explanation": "After Bob executes his conditional Pauli corrections, his qubit $q_2$ is in the exact state:\n$$|\\psi_{\\text{Bob}}\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle = |\\psi\\rangle$$\n\nTo verify that the teleportation succeeded, we compute the **quantum state fidelity** $F$:\n$$F = |\\langle \\psi | \\psi_{\\text{Bob}} \\rangle|^2$$\nIn an ideal, noiseless quantum circuit, $F = 1.0$ (100% perfect fidelity) for every possible state $|\\psi\\rangle$, regardless of $\\alpha$ and $\\beta$!\n\n**Classical Benchmark**:\nCould Bob achieve this fidelity classically without entanglement? If Alice simply measured her qubit classically and told Bob her guess, the maximum average fidelity classically achievable for an arbitrary qubit is bounded by the Massar-Popescu limit:\n$$F_{\\text{classical}}^{\\text{max}} = \\frac{2}{3} \\approx 66.7\\%$$\nAny quantum teleportation experiment achieving $F > 2/3$ proves genuine non-local quantum state transfer that cannot be replicated by classical physics!",
        "math": "Quantum fidelity definition:\n$$F(\\rho, \\sigma) = \\left( \\text{Tr}\\sqrt{\\sqrt{\\rho}\\sigma\\sqrt{\\rho}} \\right)^2$$\nFor pure states: $F = |\\langle \\psi | \\phi \\rangle|^2$.\nClassical limit: $\\bar{F}_{\\text{classical}} = \\frac{2}{3} \\approx 0.667$. Quantum teleportation achieves $F = 1.0$.",
        "circuitConnection": "In QubitLab, the simulator evaluates the state vector of $q_2$ and verifies that its inner product with the prepared state $|\\psi\\rangle$ equals 1.0.",
        "visualIntuition": "Compare two photographs. A classical photocopy has slight blur ($F=0.67$). Quantum teleportation transfers the negative itself ($F=1.0$), producing an indistinguishable original.",
        "example": "Alice prepares $|\\psi\\rangle = \\cos(0.3)|0\\rangle + \\sin(0.3)|1\\rangle$. After teleportation across the 3-qubit circuit, Bob's qubit state vector is evaluated: $\\langle \\psi | \\psi_2 \\rangle = 1.000000$.",
        "commonMistakes": [
          "Testing teleportation with only $|0\\rangle$ or $|1\\rangle$. Classical channels can easily transfer basis states. To genuinely verify quantum teleportation, test with superpositions like $|+\\rangle$ or $(0.6|0\\rangle + 0.8|1\\rangle)$.",
          "Assuming fidelity can exceed 1.0. Fidelity is a probability measure bounded in $[0, 1]$."
        ],
        "checkQuestion": "What is the maximum average state fidelity achievable if Alice tries to transfer an unknown qubit classically without entanglement?",
        "checkAnswer": "2/3 ≈ 66.7% (the Massar-Popescu classical bound). Teleportation surpasses this with 100% fidelity.",
        "nextConnection": "Let's examine how teleportation strictly respects the fundamental No-Cloning Theorem.",
        "qiskitCode": "# Computing fidelity in Qiskit\nfrom qiskit.quantum_info import state_fidelity, Statevector\npsi_original = Statevector([0.6, 0.8])\npsi_bob      = Statevector([0.6, 0.8])\nprint('Fidelity:', state_fidelity(psi_original, psi_bob))"
      },
      {
        "id": "teleport-phase-10",
        "order": 10,
        "title": "No-Cloning Theorem & State Destruction",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Understand how the measurement of q0 and q1 enforces the No-Cloning Theorem by destroying Alice's original state.",
        "explanation": "The No-Cloning Theorem states that it is physically impossible to create an identical copy of an arbitrary unknown quantum state: $|\\psi\\rangle|0\\rangle \\not\\to |\\psi\\rangle|\\psi\\rangle$.\n\nDoes quantum teleportation violate the No-Cloning Theorem?\n**No!** Teleportation is a *transfer*, not a *cloning* process. At the exact moment Bob's qubit acquires the state $|\\psi\\rangle$, Alice's original qubit $q_0$ has been measured and collapsed into a classical bit (0 or 1).\n\nAlice's original superposition is completely erased. At no point in the protocol do two copies of $|\\psi\\rangle$ coexist simultaneously. The quantum information has not been duplicated; it has flowed from Alice's laboratory into Bob's laboratory via the entanglement channel.",
        "math": "Conservation of quantum information:\n$$\\text{Total copies of } |\\psi\\rangle \\text{ at } t_0 = 1 \\quad (\\text{on } q_0)$$\n$$\\text{Total copies of } |\\psi\\rangle \\text{ at } t_{\\text{final}} = 1 \\quad (\\text{on } q_2)$$\nThe information is strictly conserved, in exact compliance with unitarity and the No-Cloning Theorem.",
        "circuitConnection": "In QubitLab, inspect the state of wire $q_0$ at the end of the circuit: it contains either $|0\\rangle$ or $|1\\rangle$ (a classical eigenstate), while wire $q_2$ holds $|\\psi\\rangle$.",
        "visualIntuition": "Imagine a passport stamp. When you move to a new country, your old residency is stamped CANCELLED at the exact moment your new residency is validated.",
        "example": "If Alice prepares $|+\\rangle$, she measures $q_0$ and observes '0' (now in state $|0\\rangle$). Her $|+\\rangle$ state is gone forever, but Bob's qubit is now in state $|+\\rangle$.",
        "commonMistakes": [
          "Believing Alice still has the message after teleportation. Alice's qubit is measured and completely reset.",
          "Thinking you can clone a quantum state by teleporting it to two different people simultaneously. An entangled pair can only teleport to one receiver."
        ],
        "checkQuestion": "Why does quantum teleportation NOT violate the quantum No-Cloning Theorem?",
        "checkAnswer": "Because Alice's original state is permanently destroyed during the Bell measurement, ensuring only a single copy of the quantum state ever exists.",
        "nextConnection": "Let's review the most common circuit assembly bugs when building teleportation circuits in QubitLab.",
        "qiskitCode": "# Inspecting the post-measurement state\nprint('Alice original qubit collapsed to classical bit; Bob now holds the pure state |ψ>')"
      },
      {
        "id": "teleport-phase-11",
        "order": 11,
        "title": "Common Circuit Mistakes & Debugging",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Identify and fix the three most common teleportation circuit bugs: incorrect Bell pair wiring, reversed measurement bits, and missing conditional corrections.",
        "explanation": "When students construct teleportation circuits in Quantum Studio, three bugs account for almost all errors:\n\n1. **Reversed Conditional Corrections**:\nAlice's measurement $m_0$ (from message qubit $q_0$) must control the **$Z$ gate** on Bob's qubit $q_2$. Alice's measurement $m_1$ (from Bell qubit $q_1$) must control the **$X$ gate** on Bob's qubit $q_2$. Swapping these ($m_0 \\to X, m_1 \\to Z$) results in only 25% fidelity!\n\n2. **Incorrect Bell Pair Preparation**:\nThe EPR pair must be prepared between $q_1$ and $q_2$ using an $H$ on $q_1$ followed by CNOT($q_1 \\to q_2$). If you accidentally put the $H$ gate on $q_0$ or entangle $q_0$ with $q_1$ first, the initial entanglement channel is ruined.\n\n3. **Premature Measurement**:\nAlice must apply BOTH her local CNOT($q_0 \\to q_1$) and her local Hadamard($q_0$) BEFORE applying measurement meters. Measuring before the Hadamard destroys the phase coherence needed to teleport $\\beta$.",
        "math": "Verification checklist:\n$$\\text{Step 1: } H(q_1), \\text{CNOT}(q_1 \\to q_2) \\implies |\\Phi^+\\rangle_{12}$$\n$$\\text{Step 2: } \\text{CNOT}(q_0 \\to q_1), H(q_0)$$\n$$\\text{Step 3: } M(q_0) \\to c_0, M(q_1) \\to c_1$$\n$$\\text{Step 4: } c_1 \\to X(q_2), c_0 \\to Z(q_2)$$",
        "circuitConnection": "In QubitLab, check your wires carefully: Wire 0 = message qubit; Wire 1 = Alice's Bell qubit; Wire 2 = Bob's receiving qubit.",
        "visualIntuition": "Think of wiring a 3-pin plug. If you connect live to neutral, the circuit blows a fuse. Double-check that $c_1$ routes to $X$ and $c_0$ routes to $Z$.",
        "example": "Symptom: Teleporting $|0\\rangle$ works, but teleporting $|+\\rangle$ produces random noise. Diagnosis: Check the $Z$ correction. If $c_0$ is not connected to the $Z$ gate on $q_2$, relative phase errors are never corrected.",
        "commonMistakes": [
          "Forgetting to wire classical control lines from the measurement meters to the correction gates.",
          "Applying gates to Bob's qubit $q_2$ before Alice has performed her measurements."
        ],
        "checkQuestion": "In the standard teleportation protocol, which measurement outcome (from q0 or q1) controls the Pauli X gate on Bob's qubit?",
        "checkAnswer": "The measurement outcome from q1 (the Bell pair qubit) controls the Pauli X gate.",
        "nextConnection": "Now you are ready to construct and verify the complete Quantum Teleportation protocol in Quantum Studio!",
        "qiskitCode": "# Correct full teleportation circuit structure\nfrom qiskit import QuantumCircuit\nqc = QuantumCircuit(3, 2)\n# Prepare state |ψ> on q0\nqc.rx(1.2, 0)\n# 1. Bell pair on q1, q2\nqc.h(1); qc.cx(1, 2)\n# 2. Alice Bell measurement\nqc.cx(0, 1); qc.h(0)\nqc.measure(0, 0); qc.measure(1, 1)\n# 3. Bob corrections\n# qc.x(2).c_if(1, 1); qc.z(2).c_if(0, 1)\nprint('Full teleportation circuit template verified')"
      },
      {
        "id": "teleport-phase-12",
        "order": 12,
        "title": "Complete Teleportation Protocol & Circuit Synthesis",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Synthesize the complete Quantum Teleportation circuit in Quantum Studio, verify 100% state transfer fidelity, and claim your Mission 06 XP.",
        "explanation": "Congratulations! You have mastered the complete theoretical, physical, and circuit foundations of the Quantum Teleportation protocol.\n\nLet's review the complete 4-step execution in Quantum Studio:\n1. **Message Preparation**: Prepare an arbitrary unknown state $|\\psi\\rangle$ on $q_0$ using rotation gates.\n2. **EPR Pair Distribution**: Entangle $q_1$ and $q_2$ using an $H$ gate and CNOT to create $|\\Phi^+\\rangle$.\n3. **Alice's Bell Measurement**: Apply CNOT($q_0 \\to q_1$), $H(q_0)$, and measure both qubits into classical bits $c_0$ and $c_1$.\n4. **Bob's Conditional Recovery**: Apply classically controlled $X$ and $Z$ gates to $q_2$ based on $c_1$ and $c_0$.\n\nEnter Quantum Studio now to wire your circuit, test state transfer with arbitrary superposition states, and claim your Communications Specialist badge for Mission 06!",
        "math": "Final protocol equation:\n$$(X^{m_1} Z^{m_0})_{q_2} \\cdot M_{q_0, q_1} \\cdot (H_{q_0} \\text{CNOT}_{01}) \\cdot (|\\psi\\rangle_{q_0} \\otimes |\\Phi^+\\rangle_{12}) = |m_0 m_1\\rangle_{01} \\otimes |\\psi\\rangle_{q_2}$$\nBob's qubit is guaranteed to hold $|\\psi\\rangle$ with 100% fidelity.",
        "circuitConnection": "In QubitLab, Mission 06 tests your circuit against arbitrary input states to verify that Bob's output state matches with fidelity $F \\ge 0.99$.",
        "visualIntuition": "Watch the Bloch sphere in QubitLab: as the circuit executes, the state vector disappears from the Bloch sphere of $q_0$ and reappears identically on the Bloch sphere of $q_2$!",
        "example": "Prepare $|\\psi\\rangle = |+\\rangle$ on $q_0$. Run the simulator: no matter which of the 4 measurement outcomes occurs (00, 01, 10, or 11), Bob's qubit $q_2$ always measures 0 when rotated by an $H$ gate, proving it was in $|+\\rangle$!",
        "commonMistakes": [
          "Exceeding the permitted gate count by placing unnecessary gates on Bob's wire.",
          "Leaving classical control wires disconnected in the workspace."
        ],
        "checkQuestion": "What is the final state of Bob's qubit q2 after the complete teleportation protocol is executed with message state |ψ⟩?",
        "checkAnswer": "|ψ⟩ = α|0⟩ + β|1⟩ (the exact original state prepared on q0).",
        "nextConnection": "Proceed to Quantum Studio to build your Teleportation circuit and advance to Level 7: Quantum Fourier Transform!",
        "qiskitCode": "# Ready to run in Quantum Studio\nprint('Quantum Teleportation Mission 06 ready for execution!')"
      }
    ]
  },
  "qft": {
    "projectId": "qft",
    "algorithm": "Quantum Fourier Transform (QFT)",
    "overview": "Transform quantum amplitudes from computational basis states into periodic phase frequencies with exponential gate efficiency O(n²) compared to classical FFT O(n 2^n).",
    "difficulty": "Advanced",
    "totalDuration": "65 min",
    "phases": [
      {
        "id": "qft-phase-1",
        "order": 1,
        "title": "Classical Discrete Fourier Transform Intuition",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Understand the Discrete Fourier Transform (DFT), converting time-domain or spatial signals into frequency-domain representations.",
        "explanation": "In classical signal processing, the **Discrete Fourier Transform (DFT)** is one of the most important algorithms ever conceived. It takes a vector of $N$ complex numbers $x = (x_0, x_1, \\dots, x_{N-1})$ representing a signal sampled at discrete time intervals, and maps it to a vector of $N$ complex numbers $y = (y_0, y_1, \\dots, y_{N-1})$ representing the frequency components present in that signal:\n$$y_k = \\frac{1}{\\sqrt{N}} \\sum_{j=0}^{N-1} x_j e^{2\\pi i j k / N}$$\n\nIf the input vector contains a periodic wave with frequency $f$, the output vector $y$ will have a sharp spike at index $k = f$, while all other indices remain near zero. The classical Fast Fourier Transform (FFT) algorithm computes this transformation in $\\mathcal{O}(N \\log N)$ operations.\n\nHowever, when $N = 2^n$, classical FFT requires $\\mathcal{O}(n 2^n)$ operations—scaling exponentially with the number of bits $n$. The **Quantum Fourier Transform (QFT)** performs this exact transformation on the probability amplitudes of an $n$-qubit register in only $\\mathcal{O}(n^2)$ quantum gates!",
        "math": "Classical DFT mapping:\n$$y_k = \\frac{1}{\\sqrt{N}} \\sum_{j=0}^{N-1} x_j \\omega_N^{j k}, \\quad \\text{where } \\omega_N = e^{2\\pi i / N}$$\nComplexity comparison for $N = 2^n$:\n$$\\text{Classical FFT} = \\mathcal{O}(n 2^n) \\quad \\text{vs.} \\quad \\text{Quantum QFT} = \\mathcal{O}(n^2)$$\nFor $n=50$ qubits: classical FFT requires $10^{16}$ operations; QFT requires roughly $50^2 = 2,500$ quantum gates!",
        "circuitConnection": "In QubitLab, the QFT circuit transforms an $n$-qubit computational basis state $|j\\rangle$ into an entangled phase state across all wires.",
        "visualIntuition": "Think of a prism breaking white sunlight into a spectrum of rainbow colors. The input signal enters as a mixture of vibrations; the Fourier transform separates out the individual pure colors (frequencies).",
        "example": "If an audio recording contains a pure 440 Hz musical note (A4), the Fourier transform produces a single sharp spike at 440 Hz on the frequency axis.",
        "commonMistakes": [
          "Assuming QFT allows you to read out all $2^n$ classical Fourier coefficients. Measuring the quantum state collapses it to a single frequency index; QFT is useful as a subroutine inside quantum algorithms (like Shor's algorithm and phase estimation).",
          "Confusing the number of items $N$ with the number of qubits $n = \\log_2 N$."
        ],
        "checkQuestion": "What is the time complexity of the Quantum Fourier Transform on an n-qubit register compared to the classical Fast Fourier Transform on 2^n data points?",
        "checkAnswer": "QFT requires O(n²) quantum gates, whereas classical FFT requires O(n 2^n) operations—an exponential speedup in gate count.",
        "nextConnection": "Let's formulate the exact mathematical definition of the Quantum Fourier Transform on basis states.",
        "qiskitCode": "# Classical DFT in NumPy\nimport numpy as np\nx = np.array([1, 0, -1, 0])\ny = np.fft.fft(x) / np.sqrt(len(x))\nprint('Classical DFT output:', np.round(y, 3))"
      },
      {
        "id": "qft-phase-2",
        "order": 2,
        "title": "The Quantum Fourier Transform (QFT) Definition",
        "duration": "6 min",
        "xp_reward": 50,
        "objective": "Master the mathematical definition of QFT as a unitary operator mapping basis states |j⟩ to uniform superpositions with harmonic phases.",
        "explanation": "The Quantum Fourier Transform is a linear unitary operator acting on an $n$-qubit Hilbert space ($N = 2^n$). It maps each computational basis state $|j\\rangle \\in \\{|0\\rangle, \\dots, |N-1\\rangle\\}$ into an equal superposition of all basis states $|k\\rangle$, where the amplitude of $|k\\rangle$ acquires a complex phase proportional to the product $j \\cdot k$:\n$$\\text{QFT} |j\\rangle = \\frac{1}{\\sqrt{N}} \\sum_{k=0}^{N-1} e^{2\\pi i j k / N} |k\\rangle$$\n\nLet's unpack this formula:\n1. Every basis state $|k\\rangle$ in the output has the exact same probability magnitude: $|1/\\sqrt{N}|^2 = 1/N$.\n2. The information about the input number $j$ is encoded entirely in the **phases** $\\theta_{j, k} = \\frac{2\\pi j k}{N}$!\n3. As $k$ increases, the phase advances at a constant frequency proportional to $j$.\n\nBecause the matrix elements $U_{j, k} = \\frac{1}{\\sqrt{N}} e^{2\\pi i j k / N}$ satisfy $U^\\dagger U = I$, the QFT is strictly unitary, meaning it preserves quantum norms and has an exact inverse (the Inverse QFT, $QFT^\\dagger$).",
        "math": "QFT unitary operator matrix elements:\n$$\\langle k | \\text{QFT} | j \\rangle = \\frac{1}{\\sqrt{N}} \\omega_N^{j k} = \\frac{1}{\\sqrt{N}} e^{2\\pi i j k / 2^n}$$\nFor $n=1$ ($N=2$): $\\omega_2 = e^{2\\pi i / 2} = e^{i\\pi} = -1$.\n$$\\text{QFT}_1 = \\frac{1}{\\sqrt{2}}\\begin{pmatrix} 1 & 1 \\\\ 1 & -1 \\end{pmatrix} = H$$\nThe 1-qubit QFT is literally the Hadamard gate!",
        "circuitConnection": "In QubitLab, the QFT block transforms states on the Q-Sphere from localized computational basis points into balanced rings of rotating phases.",
        "visualIntuition": "Imagine $N$ clocks lined up in a row. For state $|j\\rangle$, clock $k$ has its minute hand turned by an angle proportional to $j \\times k$. The higher $j$ is, the faster the clock hands spin as you move along the row.",
        "example": "For $n=2$ ($N=4$) with input state $|1\\rangle$ ($j=1$):\n$$\\text{QFT}|1\\rangle = \\frac{1}{2}\\left( |0\\rangle + e^{i\\pi/2}|1\\rangle + e^{i\\pi}|2\\rangle + e^{i 3\\pi/2}|3\\rangle \\right) = \\frac{1}{2}(|0\\rangle + i|1\\rangle - |2\\rangle - i|3\\rangle)$$\nThe phases rotate by $90^\\circ$ ($i$) for each consecutive state.",
        "commonMistakes": [
          "Thinking QFT creates non-uniform probabilities. In the state $\\text{QFT}|j\\rangle$, ALL basis states have identical probability $1/N$. The entire transformation is purely in the complex phase angles!",
          "Confusing the input number $j$ with the number of qubits $n$."
        ],
        "checkQuestion": "What standard single-qubit quantum gate is exactly equivalent to the 1-qubit Quantum Fourier Transform?",
        "checkAnswer": "The Hadamard (H) gate. For n=1, QFT_1 = (1/√2)[[1, 1], [1, -1]] = H.",
        "nextConnection": "To build a circuit for QFT on multiple qubits, we must factor this global sum into a product state of individual qubits.",
        "qiskitCode": "# Inspecting the QFT matrix for 2 qubits\nfrom qiskit.circuit.library import QFT\nfrom qiskit.quantum_info import Operator\nqft_op = Operator(QFT(2))\nprint('QFT 4x4 matrix:\\n', np.round(qft_op.data, 2))"
      },
      {
        "id": "qft-phase-3",
        "order": 3,
        "title": "Product State Factorization & Binary Fractions",
        "duration": "6 min",
        "xp_reward": 50,
        "objective": "Understand how the global QFT sum factors into a tensor product of independent single-qubit states using binary fraction notation.",
        "explanation": "At first glance, the QFT formula $\\frac{1}{\\sqrt{N}}\\sum_k e^{2\\pi i j k / N}|k\\rangle$ looks like a horribly entangled state that would require exponential gates to synthesize. However, Coppersmith (1994) showed that it factors **cleanly into a separable tensor product** of single-qubit states!\n\nLet's write the binary expansion of $j$ and $k$:\n$j = j_1 2^{n-1} + j_2 2^{n-2} + \\dots + j_n 2^0$ and $k = \\sum_{l=1}^n k_l 2^{n-l}$.\nUsing binary fraction notation $0.j_1 j_2 \\dots j_m = \\sum_{l=1}^m j_l 2^{-l}$, the QFT factors into:\n$$\\text{QFT}|j_1 j_2 \\dots j_n\\rangle = \\frac{1}{\\sqrt{2^n}} \\bigotimes_{l=1}^n \\left( |0\\rangle + e^{2\\pi i (0.j_l j_{l+1} \\dots j_n)} |1\\rangle \\right)$$\n\nLook at each individual qubit in this product:\n- The 1st qubit is in state $\\frac{|0\\rangle + e^{2\\pi i (0.j_n)}|1\\rangle}{\\sqrt{2}}$\n- The 2nd qubit is in state $\\frac{|0\\rangle + e^{2\\pi i (0.j_{n-1} j_n)}|1\\rangle}{\\sqrt{2}}$\n- The $n$-th qubit is in state $\\frac{|0\\rangle + e^{2\\pi i (0.j_1 j_2 \\dots j_n)}|1\\rangle}{\\sqrt{2}}$\n\nEach qubit lives on the equator of its own Bloch sphere, with its phase rotated by a binary fraction of $2\\pi$ determined by the input bits!",
        "math": "Binary fraction notation:\n$$0.j_1 = \\frac{j_1}{2}, \\quad 0.j_1 j_2 = \\frac{j_1}{2} + \\frac{j_2}{4}, \\quad 0.j_1 j_2 j_3 = \\frac{j_1}{2} + \\frac{j_2}{4} + \\frac{j_3}{8}$$\nProduct representation:\n$$\\text{QFT}|j\\rangle = \\frac{(|0\\rangle + e^{2\\pi i 0.j_n}|1\\rangle)}{\\sqrt{2}} \\otimes \\frac{(|0\\rangle + e^{2\\pi i 0.j_{n-1} j_n}|1\\rangle)}{\\sqrt{2}} \\dots \\otimes \\frac{(|0\\rangle + e^{2\\pi i 0.j_1 \\dots j_n}|1\\rangle)}{\\sqrt{2}}$$",
        "circuitConnection": "Because the output state factors into a product of single-qubit states, we can build the QFT circuit using only single-qubit Hadamards and controlled phase rotations!",
        "visualIntuition": "Think of an odometer on a car. The tenths-of-a-mile digit spins fast (first qubit), the miles digit spins at medium speed (middle qubit), and the hundreds-of-miles digit spins very slowly (last qubit).",
        "example": "For $n=3$, the last qubit's phase is $e^{2\\pi i (0.j_1 j_2 j_3)} = e^{2\\pi i (j_1/2 + j_2/4 + j_3/8)}$.",
        "commonMistakes": [
          "Forgetting that terms with integer multiples of $2\\pi$ vanish: $e^{2\\pi i (1.j_1 j_2)} = e^{2\\pi i} e^{2\\pi i 0.j_1 j_2} = e^{2\\pi i 0.j_1 j_2}$. Only the fractional part matters!",
          "Writing binary fractions in reverse order."
        ],
        "checkQuestion": "What is the decimal value of the binary fraction 0.101?",
        "checkAnswer": "1/2 + 0/4 + 1/8 = 4/8 + 1/8 = 5/8 = 0.625.",
        "nextConnection": "Now let's see how the single-qubit Hadamard gate and controlled phase rotation gates implement this factorization.",
        "qiskitCode": "# Binary fraction expansion in Python\ndef binary_fraction(bits):\n    return sum(b / (2**(i+1)) for i, b in enumerate(bits))\nprint('0.101 binary fraction:', binary_fraction([1, 0, 1]))"
      },
      {
        "id": "qft-phase-4",
        "order": 4,
        "title": "Controlled Phase Rotation Gates (R_k)",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Understand the R_k phase gate family and how controlled-R_k gates apply conditional binary fraction phase shifts.",
        "explanation": "To apply the binary fractional phase shifts $e^{2\\pi i / 2^k}$, the QFT circuit relies on a family of single-qubit phase rotation gates denoted $R_k$:\n$$R_k = \\begin{pmatrix} 1 & 0 \\\\ 0 & e^{2\\pi i / 2^k} \\end{pmatrix}$$\n\nNotice the values of $R_k$ for small $k$:\n- $R_1 = \\begin{pmatrix} 1 & 0 \\\\ 0 & e^{2\\pi i / 2} \\end{pmatrix} = \\begin{pmatrix} 1 & 0 \\\\ 0 & -1 \\end{pmatrix} = Z$ (Pauli Z gate)\n- $R_2 = \\begin{pmatrix} 1 & 0 \\\\ 0 & e^{2\\pi i / 4} \\end{pmatrix} = \\begin{pmatrix} 1 & 0 \\\\ 0 & i \\end{pmatrix} = S$ (Phase gate)\n- $R_3 = \\begin{pmatrix} 1 & 0 \\\\ 0 & e^{2\\pi i / 8} \\end{pmatrix} = \\begin{pmatrix} 1 & 0 \\\\ 0 & e^{i\\pi/4} \\end{pmatrix} = T$ (T gate)\n\nIn the QFT, we use **Controlled-$R_k$** ($CR_k$) gates. When the control qubit is 1, a phase shift of $2\\pi / 2^k$ is applied to the target qubit's $|1\\rangle$ state; when the control is 0, no phase is applied.",
        "math": "Matrix representation of the 2-qubit Controlled-$R_k$ gate:\n$$CR_k = \\begin{pmatrix} 1 & 0 & 0 & 0 \\\\ 0 & 1 & 0 & 0 \\\\ 0 & 0 & 1 & 0 \\\\ 0 & 0 & 0 & e^{2\\pi i / 2^k} \\end{pmatrix}$$\nNotice that $CR_k$ is symmetric: swapping control and target yields the exact same physical operation!",
        "circuitConnection": "In QubitLab, $CR_k$ is represented as a controlled phase gate (CP or RZ gadget) parameterized by angle $\\theta = 2\\pi / 2^k$.",
        "visualIntuition": "On the target qubit's Bloch sphere, the Hadamard puts the state on the equator. Each subsequent $CR_k$ gate gives the state vector an additional clockwise nudge by $360^\\circ / 2^k$ degrees if the control qubit is 1.",
        "example": "A $CR_2$ gate (Controlled-S) between $q_1$ and $q_0$: if both qubits are in state $|1\\rangle$, the amplitude picks up a phase factor of $e^{2\\pi i / 4} = e^{i\\pi/2} = i$ ($90^\\circ$ rotation).",
        "commonMistakes": [
          "Confusing $R_k$ with $R_z(\\theta)$. $R_z(\\theta) = \\text{diag}(e^{-i\\theta/2}, e^{+i\\theta/2})$ has symmetric phases on both $|0\\rangle$ and $|1\\rangle$, whereas $R_k = \\text{diag}(1, e^{i\\theta})$ shifts only the $|1\\rangle$ state. They differ only by an unobservable global phase $e^{i\\theta/2}$.",
          "Using the wrong sign in the exponent. Standard QFT uses $+2\\pi i / 2^k$; Inverse QFT uses $-2\\pi i / 2^k$."
        ],
        "checkQuestion": "What standard single-qubit quantum gate is equivalent to R_2?",
        "checkAnswer": "The S gate (phase gate), which applies a phase shift of e^(2πi/4) = e^(iπ/2) = i to the |1⟩ state.",
        "nextConnection": "Now let's examine the complete cascading topology of the QFT circuit across multiple qubits.",
        "qiskitCode": "from qiskit import QuantumCircuit\nimport numpy as np\nqc = QuantumCircuit(2)\n# Controlled-R2 gate (Controlled-Phase with angle pi/2)\nqc.cp(np.pi / 2, 0, 1)\nprint('Controlled-R2 gate compiled')"
      },
      {
        "id": "qft-phase-5",
        "order": 5,
        "title": "QFT Circuit Topology: Cascading Controlled Rotations",
        "duration": "6 min",
        "xp_reward": 50,
        "objective": "Master the recursive cascading circuit pattern for n-qubit QFT: H followed by decreasing controlled rotations CR_2, CR_3, ... CR_n.",
        "explanation": "The QFT circuit follows a beautiful, recursive cascading pattern across the $n$ qubit wires:\n\n1. **On qubit $q_0$**:\n   - Apply a **Hadamard gate** $H$ (which produces $e^{2\\pi i (0.j_1)}$).\n   - Apply $CR_2$ with control on $q_1$ and target on $q_0$ (adding $e^{2\\pi i (0.0j_2)}$).\n   - Apply $CR_3$ with control on $q_2$ and target on $q_0$ (adding $e^{2\\pi i (0.00j_3)}$).\n   - $\\dots$ continue with $CR_k$ up to control on $q_{n-1}$.\n   Now, $q_0$ holds the complete phase $e^{2\\pi i (0.j_1 j_2 \\dots j_n)}$!\n\n2. **On qubit $q_1$**:\n   - Apply a **Hadamard gate** $H$.\n   - Apply $CR_2$ with control on $q_2$, $CR_3$ with control on $q_3$, up to $q_{n-1}$.\n   Now, $q_1$ holds the complete phase $e^{2\\pi i (0.j_2 j_3 \\dots j_n)}$!\n\n3. Repeat this process for all remaining qubits down to $q_{n-1}$, which only receives a single Hadamard gate $H$.\n\nNotice that the number of gates on wire $k$ decreases by 1 each time, forming a triangular cascade of controlled rotations!",
        "math": "Total gate count calculation for $n$ qubits:\n$$\\text{Total Gates} = n + \\sum_{k=1}^{n-1} k = n + \\frac{n(n-1)}{2} = \\frac{n(n+1)}{2} = \\mathcal{O}(n^2)$$\nFor $n=3$ qubits: $3 + \\frac{3 \\times 2}{2} = 3 + 3 = 6$ rotation/Hadamard gates total!",
        "circuitConnection": "In QubitLab, the QFT circuit forms an elegant staircase of gates: Hadamards along the diagonal, with controlled phase links cascading toward the top.",
        "visualIntuition": "Think of tuning an array of radio antennas. You calibrate the master antenna against all other antennas first; then calibrate antenna 2 against the rest; until the entire array is in phase lock.",
        "example": "For $n=3$: Wire 0 gets $H$, $CR_2(q_1)$, $CR_3(q_2)$. Wire 1 gets $H$, $CR_2(q_2)$. Wire 2 gets $H$.",
        "commonMistakes": [
          "Applying $CR_k$ gates with controls from qubits that precede the current qubit. The controls always come from qubits *below* the current qubit ($q_{k+1}, \\dots, q_{n-1}$).",
          "Reversing the angles (e.g. using $CR_3$ before $CR_2$). The nearest neighbor qubit always supplies $CR_2$ (angle $\\pi/2$), the next supplies $CR_3$ (angle $\\pi/4$), and so on."
        ],
        "checkQuestion": "How many total Hadamard and controlled-phase gates are required to implement the cascading QFT on n=4 qubits (before SWAP gates)?",
        "checkAnswer": "n(n+1)/2 = 4(5)/2 = 10 gates (4 Hadamards + 6 controlled rotations).",
        "nextConnection": "Notice that the output qubits ended up in reverse order! We must fix this with a final SWAP layer.",
        "qiskitCode": "# 3-qubit cascading QFT without SWAPs\nfrom qiskit import QuantumCircuit\nimport numpy as np\nqc = QuantumCircuit(3)\n# Qubit 0\nqc.h(0)\nqc.cp(np.pi/2, 1, 0)\nqc.cp(np.pi/4, 2, 0)\n# Qubit 1\nqc.h(1)\nqc.cp(np.pi/2, 2, 1)\n# Qubit 2\nqc.h(2)\nprint(qc)"
      },
      {
        "id": "qft-phase-6",
        "order": 6,
        "title": "Output Bit Reversal & The SWAP Layer",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Understand why the cascading QFT produces qubits in bit-reversed order and how to correct this using a layer of SWAP gates.",
        "explanation": "Look closely at the product state we derived in Phase 3:\n$$\\text{QFT}|j\\rangle = \\frac{|0\\rangle + e^{2\\pi i 0.j_n}|1\\rangle}{\\sqrt{2}} \\otimes \\dots \\otimes \\frac{|0\\rangle + e^{2\\pi i 0.j_1 \\dots j_n}|1\\rangle}{\\sqrt{2}}$$\nNotice the ordering:\n- The state with the full binary fraction $0.j_1 j_2 \\dots j_n$ was computed on **qubit $q_0$** (the most significant qubit).\n- But according to the mathematical definition of standard binary representation, the full fraction belongs on the **least significant qubit** $q_{n-1}$!\n- Conversely, the least detailed fraction $0.j_n$ ended up on $q_{n-1}$ when it belongs on $q_0$.\n\nIn other words, the output qubits are in exact **bit-reversed order**! To restore the standard computational basis ordering so that the output matches the mathematical definition of the Discrete Fourier Transform, we must reverse the order of the qubits using a layer of **SWAP gates**:\n- SWAP qubit $q_0$ with qubit $q_{n-1}$\n- SWAP qubit $q_1$ with qubit $q_{n-2}$\n- continue until all pairs meet in the center (requiring $\\lfloor n/2 \\rfloor$ SWAP gates).",
        "math": "The SWAP gate permutation:\n$$\\text{SWAP} |a\\rangle |b\\rangle = |b\\rangle |a\\rangle$$\nNumber of required SWAP gates:\n$$N_{\\text{SWAP}} = \\left\\lfloor \\frac{n}{2} \\right\\rfloor$$\nFor $n=3$, exactly $\\lfloor 3/2 \\rfloor = 1$ SWAP gate (between $q_0$ and $q_2$) is required.",
        "circuitConnection": "In QubitLab, the SWAP layer is placed at the final column of the QFT circuit, with SWAP gates connecting outermost matching pairs.",
        "visualIntuition": "Imagine dealing a hand of cards from left to right. To read the resulting number in standard left-to-right order, you simply flip the cards end-for-end.",
        "example": "For $n=4$: SWAP($q_0, q_3$) and SWAP($q_1, q_2$). Exactly 2 SWAP gates completely reverse the 4-qubit register.",
        "commonMistakes": [
          "Forgetting the SWAP layer. Omission of the SWAP layer is the single most common cause of QFT verification failures in quantum algorithms!",
          "Swapping every qubit with its neighbor. Only outermost pairs ($0 \\leftrightarrow n-1$, $1 \\leftrightarrow n-2$) should be swapped."
        ],
        "checkQuestion": "How many SWAP gates are required to reverse the output order of an n=5 qubit QFT circuit?",
        "checkAnswer": "floor(5/2) = 2 SWAP gates (swapping q0 with q4, and q1 with q3; the middle qubit q2 stays in place).",
        "nextConnection": "Now let's examine the Inverse Quantum Fourier Transform (QFT†), which transforms frequency states back to computational basis values.",
        "qiskitCode": "from qiskit import QuantumCircuit\nqc = QuantumCircuit(3)\n# Final SWAP layer for 3 qubits:\nqc.swap(0, 2)\nprint('SWAP layer restores correct bit order')"
      },
      {
        "id": "qft-phase-7",
        "order": 7,
        "title": "The Inverse Quantum Fourier Transform (QFT†)",
        "duration": "6 min",
        "xp_reward": 50,
        "objective": "Understand how to construct the Inverse QFT by reversing the gate order and inverting the signs of all rotation angles.",
        "explanation": "In quantum mechanics, every unitary operator $U$ has an exact mathematical inverse $U^\\dagger$ such that $U^\\dagger U = I$. The **Inverse Quantum Fourier Transform ($QFT^\\dagger$)** undoes the QFT, transforming states encoded in phase frequencies back into discrete computational basis bitstrings.\n\nHow do we build the circuit for $QFT^\\dagger$?\nBy applying the algebraic rule for the adjoint of a product of matrices: $(A B C)^\\dagger = C^\\dagger B^\\dagger A^\\dagger$.\nTo invert a quantum circuit:\n1. **Reverse the Order of Gates**: Start from the end of the QFT circuit and work backward to the beginning. The SWAP gates that were at the end of the QFT are now applied at the very beginning of $QFT^\\dagger$!\n2. **Invert the Angle of Every Gate**: Replace each Hadamard gate $H$ with $H^\\dagger = H$ (since Hadamards are Hermitian). Replace each controlled rotation $CR_k(\\theta)$ with $CR_k(-\\theta)$ by negating its angle: $\\theta \\mapsto -\\frac{2\\pi}{2^k}$.\n\nThe resulting circuit takes a periodic quantum phase state and focuses all probability amplitude onto the exact computational basis state corresponding to that period!",
        "math": "Inverse QFT matrix elements:\n$$\\langle k | \\text{QFT}^\\dagger | j \\rangle = \\frac{1}{\\sqrt{N}} e^{-2\\pi i j k / N}$$\nNotice the negative sign in the exponent. Applying QFT followed by $QFT^\\dagger$:\n$$\\text{QFT}^\\dagger (\\text{QFT}|j\\rangle) = I|j\\rangle = |j\\rangle$$",
        "circuitConnection": "In QubitLab, $QFT^\\dagger$ is used as the readout stage in Quantum Phase Estimation and Shor's Algorithm.",
        "visualIntuition": "If QFT is like unbraiding a rope into individual threads of frequency, $QFT^\\dagger$ is braiding those threads back together into a single solid rope.",
        "example": "If a register is in the phase state $\\frac{1}{2}(|0\\rangle + i|1\\rangle - |2\\rangle - i|3\\rangle)$ (which is $\\text{QFT}|1\\rangle$), applying $QFT^\\dagger$ collapses all amplitude onto the single computational basis state $|1\\rangle$ with 100% probability.",
        "commonMistakes": [
          "Forgetting to invert the signs of the rotation angles. Using $+\\theta$ instead of $-\\theta$ applies QFT twice instead of inverting it ($QFT^2 \\neq I$)!",
          "Applying the SWAP gates at the end of $QFT^\\dagger$ instead of at the beginning. Remember: $(AB)^\\dagger = B^\\dagger A^\\dagger$."
        ],
        "checkQuestion": "What two modifications must be made to a forward QFT circuit to convert it into an Inverse QFT (QFT†) circuit?",
        "checkAnswer": "Reverse the entire sequence of gates from end to beginning, and negate the signs of all rotation angles (θ → -θ).",
        "nextConnection": "Let's examine where QFT is used in quantum computing: Phase Estimation, Period Finding, and Shor's Algorithm.",
        "qiskitCode": "# Generating Inverse QFT automatically in Qiskit\nfrom qiskit.circuit.library import QFT\ninverse_qft = QFT(3).inverse()\nprint('Inverse QFT circuit depth:', inverse_qft.depth())"
      },
      {
        "id": "qft-phase-8",
        "order": 8,
        "title": "Applications: Quantum Phase Estimation & Period Finding",
        "duration": "6 min",
        "xp_reward": 50,
        "objective": "Understand how QFT acts as the core engine in Quantum Phase Estimation (QPE), order finding, and molecular simulation.",
        "explanation": "Why is the Quantum Fourier Transform considered one of the most important subroutines in all of quantum computing? Because QFT provides the mathematical engine for **Quantum Phase Estimation (QPE)**, which in turn unlocks:\n1. **Shor's Factoring Algorithm**: Factoring large RSA integers in polynomial time $\\mathcal{O}(n^3)$ by finding the period of modular exponentiation.\n2. **Quantum Chemistry & Material Simulation**: Finding the ground state energies of molecular Hamiltonians with exponential precision.\n3. **HHL Algorithm**: Solving massive linear systems of equations $A\\vec{x} = \\vec{b}$.\n\nIn all these algorithms, a quantum unitary operator $U$ encodes an unknown eigenvalue phase $\\theta$ into the state: $U|u\\rangle = e^{2\\pi i \\theta}|u\\rangle$. By applying controlled-$U^{2^k}$ gates from a clock register followed by the **Inverse QFT**, the continuous phase $\\theta$ is converted directly into an $n$-bit binary representation $|\\theta_1 \\theta_2 \\dots \\theta_n\\rangle$ in the computational basis!",
        "math": "Quantum Phase Estimation summary:\n$$|0\\rangle^{\\otimes n} |u\\rangle \\xrightarrow{\\text{Controlled-}U^{2^j}} \\left( \\frac{1}{\\sqrt{2^n}}\\sum_{k=0}^{2^n-1} e^{2\\pi i \\theta k} |k\\rangle \\right) |u\\rangle \\xrightarrow{\\text{QFT}^\\dagger} |\\theta\\rangle |u\\rangle$$\nMeasuring the clock register outputs the phase $\\theta$ with high probability.",
        "circuitConnection": "In QubitLab, the QFT circuit block directly interfaces with the control register wires in Phase Estimation circuits.",
        "visualIntuition": "Imagine listening to an unknown musical pitch. Your ear cannot measure the wave frequency directly, but the cochlea performs a physical Fourier transform, sending a signal from the specific nerve fiber that corresponds to that note.",
        "example": "If a Hamiltonian has an eigenvalue $e^{2\\pi i (3/8)}$, QPE uses a 3-qubit clock register. Applying $QFT^\\dagger$ produces the bitstring '011' ($3/8 = 0.011_2$) with 100% probability!",
        "commonMistakes": [
          "Believing QFT by itself factors numbers. QFT only performs the Fourier basis transform; Shor's algorithm provides the modular arithmetic framework that sets up the periodic state.",
          "Using too few clock qubits, which introduces phase rounding errors (leakage)."
        ],
        "checkQuestion": "In Quantum Phase Estimation, what circuit component converts the periodic phase superposition in the clock register into a measurable binary bitstring?",
        "checkAnswer": "The Inverse Quantum Fourier Transform (QFT†).",
        "nextConnection": "Let's explore hardware noise and the Approximate QFT (AQFT) technique for scaling to large numbers of qubits.",
        "qiskitCode": "# Concept of Phase Estimation readout via QFT dagger\nprint('QPE uses QFT dagger to extract eigenvalue phases as binary fractions')"
      },
      {
        "id": "qft-phase-9",
        "order": 9,
        "title": "Approximate QFT (AQFT) & Gate Pruning",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Understand Approximate QFT (AQFT): discarding tiny rotation gates CR_k for large k to reduce circuit depth without losing fidelity.",
        "explanation": "As the number of qubits $n$ grows, the rotation angles $\\theta_k = 2\\pi / 2^k$ become exponentially tiny. For example, for $k = 10$, the rotation angle is $2\\pi / 1024 \\approx 0.006$ radians ($0.35^\\circ$). For $k = 20$, the angle is less than one-millionth of a radian!\n\nOn physical quantum hardware, implementing an angle of $10^{-6}$ radians is pointless: hardware control noise and gate error rates are far larger than the rotation itself!\n\nIn 1996, Barenco et al. proved that we can **prune** all controlled rotations with $k > m$ (where $m$ is a small cutoff, typically $m \\approx 7$ to $10$) without significantly impacting algorithm performance. This is called the **Approximate Quantum Fourier Transform (AQFT)**.\n\nPruning tiny gates reduces the circuit depth from $\\mathcal{O}(n^2)$ down to $\\mathcal{O}(n \\log n)$, dramatically improving error tolerance on NISQ devices!",
        "math": "AQFT bound on operator error:\n$$\\| \\text{QFT} - \\text{AQFT}_m \\| \\le \\frac{n \\pi}{2^{m-1}}$$\nChoosing $m = \\mathcal{O}(\\log n)$ ensures that the approximation error decays exponentially while keeping circuit depth near-linear: $\\mathcal{O}(n \\log n)$.",
        "circuitConnection": "In QubitLab, full QFT is used for small qubit counts ($n \\le 5$), while AQFT principles guide gate budget optimization.",
        "visualIntuition": "Imagine drawing a portrait. The Hadamards and $CR_2$ gates draw the face and eyes. A $CR_{20}$ gate is like trying to paint an individual microscopic dust mite on an eyelash—it adds nothing visible and wastes time.",
        "example": "For $n=100$ qubits: full QFT requires $\\approx 5,000$ two-qubit gates. With an AQFT cutoff $m=8$, the circuit uses only $\\approx 800$ gates—an 84% reduction in circuit size!",
        "commonMistakes": [
          "Setting the cutoff $m$ too small (e.g. $m=1$), which discards all controlled rotations and reduces the QFT to just independent Hadamard gates.",
          "Thinking AQFT introduces non-unitary operations. AQFT is strictly unitary; it simply omits gates whose angles are negligible."
        ],
        "checkQuestion": "What is the primary practical advantage of Approximate QFT (AQFT) over exact QFT on physical quantum processors?",
        "checkAnswer": "It discards tiny, noise-sensitive rotation gates, drastically reducing circuit depth and CNOT counts with negligible loss in accuracy.",
        "nextConnection": "Let's review the most common circuit assembly bugs when building QFT circuits in QubitLab.",
        "qiskitCode": "# Approximate QFT in Qiskit (approximation_degree parameter)\nfrom qiskit.circuit.library import QFT\naqft = QFT(5, approximation_degree=2)\nprint('AQFT gate count vs exact QFT:', aqft.decompose().size())"
      },
      {
        "id": "qft-phase-10",
        "order": 10,
        "title": "Common Circuit Mistakes & Debugging",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Identify and debug the three most common QFT circuit errors: omitted SWAP gates, inverted phase signs, and incorrect control-target wire pairings.",
        "explanation": "When students construct QFT circuits in Quantum Studio, three bugs account for over 90% of all simulation errors:\n\n1. **Omission of the Final SWAP Layer**:\nWithout the SWAP gates, the output qubits remain in reversed order. When evaluated against test state inputs, the observed measurement probabilities will be completely bit-reversed (e.g. measuring 100 instead of 001)!\n\n2. **Phase Sign Confusion in Controlled Rotations**:\nForward QFT requires **positive** phase rotations: $CR_k(+2\\pi/2^k)$. Inverse QFT ($QFT^\\dagger$) requires **negative** phase rotations: $CR_k(-2\\pi/2^k)$. Using negative angles in forward QFT implements the inverse transform instead!\n\n3. **Mismatched Control and Target Wire Pairing**:\nIn the cascading block for qubit $q_i$, the $CR_2$ gate must connect to $q_{i+1}$, the $CR_3$ gate must connect to $q_{i+2}$, etc. Swapping the order of these controls scrambles the binary fractional coefficients.",
        "math": "QFT verification test:\n$$\\text{Test 1: } \\text{QFT}|0\\dots0\\rangle = \\frac{1}{\\sqrt{2^n}}\\sum_{k=0}^{2^n-1} |k\\rangle = |+\\rangle^{\\otimes n}$$\n$$\\text{Test 2: } \\text{QFT}^\\dagger(\\text{QFT}|x\\rangle) = |x\\rangle \\quad \\forall x$$\nAlways run these two sanity checks before using QFT in larger algorithms!",
        "circuitConnection": "In QubitLab, you can verify your QFT circuit by passing the all-zeros state $|00\\dots0\\rangle$: the output must display equal probability (equal height bars) on all states with zero relative phase differences.",
        "visualIntuition": "Test the circuit with $|000\\rangle$. If any state has non-zero phase on the Q-Sphere, one of your controlled rotations has an incorrect angle.",
        "example": "Symptom: A 3-qubit QFT on input $|1\\rangle$ ($001_2$) produces a phase pattern corresponding to $|4\\rangle$ ($100_2$). Diagnosis: The SWAP layer is missing! Add a SWAP gate between $q_0$ and $q_2$ to restore correct ordering.",
        "commonMistakes": [
          "Placing SWAP gates on non-matching pairs.",
          "Using an $X$ gate instead of an $H$ gate at the start of each cascade."
        ],
        "checkQuestion": "What is the expected output state if you apply a properly constructed QFT circuit to the ground state |00...0⟩?",
        "checkAnswer": "The equal superposition state |+⟩^(⊗n) = (1/√2^n) ∑ |k⟩ with identical real positive amplitudes on all basis states.",
        "nextConnection": "Now you are ready to construct and verify the complete Quantum Fourier Transform in Quantum Studio.",
        "qiskitCode": "# Sanity test: QFT on |000> must equal |+++>\nfrom qiskit import QuantumCircuit\nfrom qiskit.circuit.library import QFT\nfrom qiskit.quantum_info import Statevector\nsv = Statevector.from_label('000').evolve(QFT(3))\nprint('Is equal superposition:', np.allclose(np.abs(sv.data)**2, 1/8))"
      },
      {
        "id": "qft-phase-11",
        "order": 11,
        "title": "Quantum Circuit Synthesis: The 3-Qubit QFT",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Step through the exact gate-by-gate construction of the canonical 3-qubit QFT circuit in Quantum Studio.",
        "explanation": "Let's assemble the complete canonical 3-qubit QFT circuit step-by-step:\n\n- **Stage 1 (Qubit 0 Cascade)**:\n  1. Place an **$H$ gate** on wire $q_0$.\n  2. Place a **$CR_2$ gate** (Controlled-S, angle $\\pi/2$) with control on $q_1$ and target on $q_0$.\n  3. Place a **$CR_3$ gate** (Controlled-T, angle $\\pi/4$) with control on $q_2$ and target on $q_0$.\n\n- **Stage 2 (Qubit 1 Cascade)**:\n  4. Place an **$H$ gate** on wire $q_1$.\n  5. Place a **$CR_2$ gate** (Controlled-S, angle $\\pi/2$) with control on $q_2$ and target on $q_1$.\n\n- **Stage 3 (Qubit 2 Cascade)**:\n  6. Place an **$H$ gate** on wire $q_2$.\n\n- **Stage 4 (SWAP Layer)**:\n  7. Place a **SWAP gate** between wire $q_0$ and wire $q_2$.\n\nTotal gate count: exactly 7 gates (3 Hadamards, 3 controlled phase rotations, and 1 SWAP). This compact circuit implements the full 3-qubit Discrete Fourier Transform across 8 basis states!",
        "math": "Full 3-qubit QFT circuit operator:\n$$\\text{QFT}_3 = \\text{SWAP}_{0, 2} \\cdot H_2 \\cdot CR_2(1, 2) \\cdot H_1 \\cdot CR_3(0, 2) \\cdot CR_2(0, 1) \\cdot H_0$$\nMatrix dimension: $8 \\times 8$.",
        "circuitConnection": "In QubitLab, wire these 7 gates across columns 0 to 6 on wires $q_0, q_1, q_2$.",
        "visualIntuition": "Watch the state vector evolve from a single basis ket into a perfectly phased rainbow wheel across the Q-Sphere equator.",
        "example": "If input is $|4\\rangle = |100\\rangle$, the circuit outputs states with relative phases advancing by $2\\pi(4/8) = \\pi$ radians ($180^\\circ$) for each consecutive basis state.",
        "commonMistakes": [
          "Swapping wire 1 with wire 2 instead of wire 0 with wire 2.",
          "Omitting the $CR_3$ gate on wire 0."
        ],
        "checkQuestion": "How many total gates are used in the canonical 3-qubit QFT circuit including the SWAP layer?",
        "checkAnswer": "7 gates (3 Hadamards, 3 controlled phase rotations, and 1 SWAP gate).",
        "nextConnection": "Now you are ready to synthesize and verify the QFT circuit in Quantum Studio!",
        "qiskitCode": "# Canonical 3-qubit QFT implementation in Qiskit\nfrom qiskit import QuantumCircuit\nimport numpy as np\nqc = QuantumCircuit(3)\nqc.h(0)\nqc.cp(np.pi/2, 1, 0)\nqc.cp(np.pi/4, 2, 0)\nqc.h(1)\nqc.cp(np.pi/2, 2, 1)\nqc.h(2)\nqc.swap(0, 2)\nprint(qc)"
      },
      {
        "id": "qft-phase-12",
        "order": 12,
        "title": "Complete QFT Circuit Synthesis & Verification",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Execute the complete QFT circuit in Quantum Studio, verify phase interference across all basis states, and claim your Mission 07 XP.",
        "explanation": "Congratulations! You have mastered the physical, mathematical, and circuit foundations of the Quantum Fourier Transform.\n\nLet's review what your circuit accomplishes:\n1. It accepts an arbitrary $n$-qubit quantum state in the computational basis.\n2. It maps the integer index $j$ into harmonic relative phases across all $2^n$ basis states.\n3. It achieves this using only $\\mathcal{O}(n^2)$ quantum gates, unlocking an exponential advantage over classical FFT.\n4. It provides the core foundational engine for Quantum Phase Estimation and Shor's factoring algorithm.\n\nEnter Quantum Studio now to build your 3-qubit QFT circuit, verify that the simulator confirms correct phase transformation, and claim your Quantum Algorithm Engineer badge for Mission 07!",
        "math": "Summary identity:\n$$\\text{QFT}|j\\rangle = \\frac{1}{\\sqrt{2^n}} \\sum_{k=0}^{2^n-1} e^{2\\pi i j k / 2^n}|k\\rangle$$\nFidelity of circuit execution: $F = 1.0$ (exact deterministic unitary transform).",
        "circuitConnection": "In QubitLab, Mission 07 verifies that your circuit compiles without errors, uses the correct rotation angles, and correctly transforms basis states.",
        "visualIntuition": "Inspect QubitLab's Q-Sphere visualizer: notice the precise angle progression and how phases interfere coherently when inverted.",
        "example": "With your circuit complete, run the simulator on input state $|0\\rangle$: all 8 outcome bars have identical probability 12.5% and phase 0. Run on input $|4\\rangle$: probabilities remain 12.5%, but alternating states show phase $\\pi$ ($180^\\circ$).",
        "commonMistakes": [
          "Exceeding the permitted gate count by placing redundant gates.",
          "Failing to connect classical measurement registers."
        ],
        "checkQuestion": "What is the primary role of the QFT algorithm in Shor's factoring algorithm?",
        "checkAnswer": "It extracts the unknown period r of modular exponentiation from the control register by converting periodic wave interference into discrete measurement spikes.",
        "nextConnection": "Proceed to Quantum Studio to build your QFT circuit and advance to Level 8: Simon's Algorithm!",
        "qiskitCode": "# Ready to simulate in Quantum Studio\nprint('QFT Mission 07 ready for Quantum Studio simulation!')"
      }
    ]
  },
  "simon": {
    "projectId": "simon",
    "algorithm": "Simon's Algorithm",
    "overview": "Find a hidden periodic bitstring s inside a 2-to-1 black-box oracle with exponential quantum speedup O(n) vs classical Ω(2^(n/2)), proving oracle-based quantum supremacy.",
    "difficulty": "Advanced",
    "totalDuration": "65 min",
    "phases": [
      {
        "id": "simon-phase-1",
        "order": 1,
        "title": "Simon's Problem: The Hidden Period & 2-to-1 Functions",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Understand Simon's promise problem: finding a secret non-zero bitstring s such that f(x) = f(y) if and only if x ⊕ y ∈ {0, s}.",
        "explanation": "Simon's problem, introduced by Daniel Simon in 1994, is one of the most historically important milestones in quantum computing: it directly inspired Peter Shor to discover his polynomial-time factoring algorithm!\n\nThe problem is formulated as follows: You are given a black-box Boolean function $f: \\{0, 1\\}^n \\to \\{0, 1\\}^n$ with a special promise. There exists a secret, hidden bitstring $s \\in \\{0, 1\\}^n$ such that for any two inputs $x$ and $y$:\n$$f(x) = f(y) \\iff x \\oplus y \\in \\{0^n, s\\}$$\nwhere $\\oplus$ denotes bitwise XOR addition.\n\nLet's understand what this means:\n- If $s = 00\\dots0$ (all zeros): $x \\oplus y = 0 \\implies x = y$. The function is **one-to-one** (every input has a unique output).\n- If $s \\neq 00\\dots0$ (non-zero): $x \\oplus y = s \\implies y = x \\oplus s$. The function is **two-to-one**: every output is produced by exactly two distinct inputs, $x$ and $x \\oplus s$!\n\nThe challenge is to determine whether $s = 0$ or find the non-zero secret string $s$ by querying the oracle.",
        "math": "The Simon promise condition:\n$$f(x) = f(y) \\iff (x = y \\quad \\text{or} \\quad x = y \\oplus s)$$\nFor an $n$-bit input, the total domain has $2^n$ inputs, and the range contains exactly $2^{n-1}$ unique outputs when $s \\neq 0$.",
        "circuitConnection": "In QubitLab, the oracle is an integrated $2n$-qubit unitary $U_f$ connecting an $n$-qubit input register to an $n$-qubit target register.",
        "visualIntuition": "Imagine $2^n$ keys and $2^{n-1}$ lockboxes. Every lockbox has exactly two twin keys that open it. The difference (XOR mask) between the teeth of every twin pair is the identical secret string $s$.",
        "example": "For $n=3$ with secret string $s = 110_2$:\n- $f(000) = f(000 \\oplus 110) = f(110) = 5$\n- $f(001) = f(001 \\oplus 110) = f(111) = 2$\n- $f(010) = f(010 \\oplus 110) = f(100) = 7$\n- $f(011) = f(011 \\oplus 110) = f(101) = 1$",
        "commonMistakes": [
          "Confusing bitwise XOR with integer addition. $x \\oplus s$ operates on individual bits without carries (e.g. $011 \\oplus 110 = 101$).",
          "Assuming $s$ can be found by evaluating a single classical input. Evaluating $f(x)$ gives only an arbitrary output label; to find $s$ classically, you must find two different inputs that produce the same output."
        ],
        "checkQuestion": "If f is a 2-to-1 function with secret string s = 101, which other input produces the exact same output as x = 011?",
        "checkAnswer": "x ⊕ s = 011 ⊕ 101 = 110.",
        "nextConnection": "Let's explore why solving this problem classically requires an exponential number of queries due to the Birthday Paradox.",
        "qiskitCode": "# Verification of Simon's condition in Python\ns = 0b110\nx = 0b001\ny = x ^ s\nprint(f'x={bin(x)}, y={bin(y)}, x^y={bin(x ^ y)}')"
      },
      {
        "id": "simon-phase-2",
        "order": 2,
        "title": "Classical Difficulty & The Birthday Paradox (Ω(2^(n/2)))",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Understand why any classical algorithm requires Ω(2^(n/2)) queries to find a collision by the Birthday Paradox.",
        "explanation": "How would a classical algorithm find the secret string $s$?\n\nBecause the oracle provides arbitrary unindexed outputs, the only classical strategy is to query different inputs $x_1, x_2, x_3, \\dots$ and search for a **collision**: two distinct inputs $x_i \\neq x_j$ such that $f(x_i) = f(x_j)$. Once a collision is found, the secret string is instantly revealed: $s = x_i \\oplus x_j$!\n\nHowever, how many queries are required to find a collision?\nAccording to the famous **Birthday Paradox**, among $N = 2^n$ possible items, the number of random samples required before finding two identical values scales as $\\Omega(\\sqrt{N}) = \\Omega(2^{n/2})$.\n\nEven with optimal adaptive classical algorithms, any classical algorithm requires at least $\\Omega(2^{n/2})$ queries in the worst and average cases. For $n = 100$ bits, $2^{50} \\approx 1.12 \\times 10^{15}$ queries—an impossible computational barrier. Simon's quantum algorithm solves it in $\\mathcal{O}(n)$ queries!",
        "math": "Classical lower bound by the Birthday Paradox:\n$$Q_{\\text{classical}} = \\Omega(2^{n/2})$$\nQuantum query complexity:\n$$Q_{\\text{quantum}} = \\mathcal{O}(n)$$\nRatio: $\\frac{2^{n/2}}{n}$ is an **exponential speedup** over classical algorithms!",
        "circuitConnection": "The exponential speedup in QubitLab is demonstrated by running only $\\mathcal{O}(n)$ circuit iterations to collect linear constraints.",
        "visualIntuition": "Imagine a room of people with $2^n$ possible birthdays. To find two people sharing a birthday, a classical observer must interview dozens of people. The quantum computer uses interference to cross-examine everyone simultaneously.",
        "example": "For $n=20$ bits ($N = 1,048,576$): a classical computer must query the oracle at least $\\approx \\sqrt{2^{20}} = 2^{10} = 1,024$ times on average. The quantum algorithm finds $s$ with roughly $20$ queries!",
        "commonMistakes": [
          "Assuming a classical randomized algorithm can solve Simon's problem in polynomial time. The $\\Omega(2^{n/2})$ bound applies to ALL classical algorithms, deterministic or randomized!",
          "Confusing Simon's speedup with Grover's speedup. Grover's speedup is polynomial ($\\sqrt{N}$); Simon's speedup is exponential ($2^{n/2} \\to n$)."
        ],
        "checkQuestion": "For an n=60 bit function, approximately how many queries does a classical algorithm need to find a collision compared to Simon's algorithm?",
        "checkAnswer": "Classical requires roughly 2^(60/2) = 2^30 ≈ 1.07 billion queries, while Simon's quantum algorithm requires only O(60) queries.",
        "nextConnection": "Now let's formulate the quantum oracle operator U_f that computes this function reversibly.",
        "qiskitCode": "# Birthday bound demonstration\nimport math\nfor n in [10, 20, 40, 60]:\n    classical_queries = 2**(n // 2)\n    quantum_queries = n\n    print(f'n={n:2d}: Classical={classical_queries:12,d} | Quantum={quantum_queries:2d}')"
      },
      {
        "id": "simon-phase-3",
        "order": 3,
        "title": "The Quantum Oracle: U_f |x⟩|0⟩ = |x⟩|f(x)⟩",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Understand the 2n-qubit unitary oracle U_f that evaluates the multi-bit function f(x) into an n-qubit target register.",
        "explanation": "Because $f(x)$ outputs an $n$-bit binary string (unlike Deutsch-Jozsa which outputs a single bit), Simon's algorithm requires a **$2n$-qubit register**:\n- An $n$-qubit **input register** $|x\\rangle$\n- An $n$-qubit **target register** $|y\\rangle$\n\nThe quantum oracle is a unitary transformation $U_f$ on $2n$ qubits defined as:\n$$U_f |x\\rangle |y\\rangle = |x\\rangle |y \\oplus f(x)\\rangle$$\nWhen the target register is initialized to the all-zeros state $|0^n\\rangle = |00\\dots0\\rangle$, the oracle writes the function value directly into the target register:\n$$U_f |x\\rangle |0^n\\rangle = |x\\rangle |f(x)\\rangle$$\n\nBecause $U_f$ preserves the input register $|x\\rangle$, it is reversible and strictly unitary ($U_f^\\dagger U_f = I$).",
        "math": "Action on computational basis states:\n$$U_f |x\\rangle |0^n\\rangle = |x\\rangle |f(x)\\rangle$$\nBecause $f(x)$ is 2-to-1, for any output $w$, there are exactly two inputs $x$ and $x \\oplus s$ such that $f(x) = f(x \\oplus s) = w$.",
        "circuitConnection": "In QubitLab, the oracle is represented as a multi-qubit subcircuit with $n$ input wires and $n$ target wires using CNOT networks.",
        "visualIntuition": "Think of an automatic label printer. The input register carries the package ($x$); the oracle stamps the barcode ($f(x)$) onto an empty sticker ($|0^n\\rangle$) affixed to the package.",
        "example": "For $n=2$ with $s=11$ and $f(00)=f(11)=10$: $U_f|00\\rangle|00\\rangle = |00\\rangle|10\\rangle$ and $U_f|11\\rangle|00\\rangle = |11\\rangle|10\\rangle$.",
        "commonMistakes": [
          "Using a single ancilla qubit as in Deutsch-Jozsa. Simon's function outputs an $n$-bit string, so the target register MUST contain $n$ qubits!",
          "Attempting to perform phase kickback on the target register. Simon's algorithm does NOT use phase kickback; the target register is initialized to $|0^n\\rangle$, not $|-^n\\rangle$."
        ],
        "checkQuestion": "How many total qubits are required to execute Simon's algorithm for an n-bit input function?",
        "checkAnswer": "2n qubits (n input qubits and n target register qubits).",
        "nextConnection": "Let's see what happens when we initialize the input register in equal superposition.",
        "qiskitCode": "from qiskit import QuantumCircuit\n# 4-qubit circuit (n=2): 2 inputs, 2 targets\noracle = QuantumCircuit(4)\n# Example oracle for s=11: copy q0 to target q2, q0^q1 to q3\noracle.cx(0, 2)\noracle.cx(0, 3); oracle.cx(1, 3)\nprint('Simon oracle for s=11 compiled')"
      },
      {
        "id": "simon-phase-4",
        "order": 4,
        "title": "Superposition Initialization on Input Register",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Understand how applying H^(⊗n) to the input register creates an equal superposition of all 2^n inputs while leaving the target register in |0^n⟩.",
        "explanation": "We begin with all $2n$ qubits in the ground state: $|0^n\\rangle |0^n\\rangle$.\n\nWe apply a layer of Hadamard gates $H^{\\otimes n}$ **only to the $n$ input qubits**, while leaving the $n$ target qubits untouched in $|0^n\\rangle$:\n$$|\\psi_1\\rangle = (H^{\\otimes n} \\otimes I^{\\otimes n}) |0^n\\rangle |0^n\\rangle = \\left( \\frac{1}{\\sqrt{2^n}} \\sum_{x=0}^{2^n-1} |x\\rangle \\right) |0^n\\rangle$$\n\nNow the input register is in a uniform superposition of all $2^n$ possible inputs, each with identical amplitude $1/\\sqrt{2^n}$. The target register is in the definite state $|0^n\\rangle$.\n\nNotice that no entanglement exists yet: the state is a pure product state between the input register and the target register.",
        "math": "State vector after initial Hadamard layer:\n$$|\\psi_1\\rangle = \\frac{1}{\\sqrt{2^n}} \\sum_{x \\in \\{0, 1\\}^n} |x\\rangle |0^n\\rangle$$\nAmplitudes: each of the $2^n$ basis states has amplitude $1/\\sqrt{2^n}$.",
        "circuitConnection": "In QubitLab, apply $H$ gates to wires $q_0, \\dots, q_{n-1}$ at column 0. Wires $q_n, \\dots, q_{2n-1}$ remain untouched.",
        "visualIntuition": "The input register becomes an open quantum ledger with all $2^n$ addresses active at once, waiting to receive their function stamps.",
        "example": "For $n=2$, the input register is in state $\\frac{1}{2}(|00\\rangle + |01\\rangle + |10\\rangle + |11\\rangle)|00\\rangle$.",
        "commonMistakes": [
          "Applying Hadamards to the target register qubits. The target register must remain strictly in $|0^n\\rangle$!",
          "Measuring before the oracle call."
        ],
        "checkQuestion": "What is the quantum state of the target register immediately after the initial Hadamard layer?",
        "checkAnswer": "|0^n⟩ (the ground state on all n target qubits).",
        "nextConnection": "Now we query the oracle U_f, entangling the input and target registers.",
        "qiskitCode": "from qiskit import QuantumCircuit\nqc = QuantumCircuit(4)\nqc.h([0, 1])  # Hadamards on input register only\nprint('Input register in equal superposition')"
      },
      {
        "id": "simon-phase-5",
        "order": 5,
        "title": "Querying the Oracle & Register Entanglement",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Understand how the oracle creates a massive entangled state pairing each input x with its function output f(x).",
        "explanation": "When we apply the oracle $U_f$ to the state $|\\psi_1\\rangle$, linearity dictates that $U_f$ acts on every term in the superposition simultaneously:\n$$|\\psi_2\\rangle = U_f |\\psi_1\\rangle = \\frac{1}{\\sqrt{2^n}} \\sum_{x=0}^{2^n-1} |x\\rangle |f(x)\\rangle$$\n\nBecause $f$ is a 2-to-1 function with secret string $s$, every unique output value $w$ in the range of $f$ appears for exactly **two** inputs: some string $x_0$ and the paired string $x_0 \\oplus s$.\n\nTherefore, we can regroup the sum over the $2^{n-1}$ unique outputs $w$:\n$$|\\psi_2\\rangle = \\frac{1}{\\sqrt{2^n}} \\sum_{w \\in \\text{Range}(f)} \\Big( |x_w\\rangle + |x_w \\oplus s\\rangle \\Big) |w\\rangle$$\nwhere $x_w$ is one of the two inputs that maps to $w$.\n\nLook at this equation carefully: every single output value $|w\\rangle$ is now entangled with a superposition of its two preimages: $(|x_w\\rangle + |x_w \\oplus s\\rangle)$!",
        "math": "Regrouping the state over unique outputs:\n$$|\\psi_2\\rangle = \\frac{1}{\\sqrt{2^{n-1}}} \\sum_{w \\in \\text{Range}(f)} \\left( \\frac{|x_w\\rangle + |x_w \\oplus s\\rangle}{\\sqrt{2}} \\right) |w\\rangle$$\nNotice that the input register is now grouped into $2^{n-1}$ orthogonal pairs separated by the secret shift $s$.",
        "circuitConnection": "In QubitLab, the oracle block bridges the input wires $q_0 \\dots q_{n-1}$ to target wires $q_n \\dots q_{2n-1}$.",
        "visualIntuition": "Imagine a dance hall where $2^n$ dancers are paired into $2^{n-1}$ couples. Each couple is holding a placard showing their mutual family name ($w$).",
        "example": "For $n=2$ with $s=11$ where $f(00)=f(11)=\\text{'0'}$ and $f(01)=f(10)=\\text{'1'}$:\n$$|\\psi_2\\rangle = \\frac{1}{2}\\Big[ (|00\\rangle + |11\\rangle)|0\\rangle + (|01\\rangle + |10\\rangle)|1\\rangle \\Big]$$",
        "commonMistakes": [
          "Assuming measuring the state now reveals $s$. If you measure now, you get a single pair $(x, f(x))$, which gives zero information about the second preimage $x \\oplus s$!",
          "Believing the function values $w$ must be ordered in any specific sequence."
        ],
        "checkQuestion": "How many terms are grouped inside the input register superposition for each unique output value w?",
        "checkAnswer": "Exactly 2 terms: |x_w⟩ and |x_w ⊕ s⟩.",
        "nextConnection": "Now we measure the target register to collapse the system onto a single paired superposition.",
        "qiskitCode": "# State expansion after oracle\nprint('State after oracle: sum over w of (|x_w> + |x_w ^ s>)|w>')"
      },
      {
        "id": "simon-phase-6",
        "order": 6,
        "title": "Target Register Measurement & State Reduction",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Understand how measuring the target register isolates a single paired superposition (|x_0⟩ + |x_0 ⊕ s⟩)/√2 in the input register.",
        "explanation": "We now measure the $n$ target qubits in the computational basis.\n\nWhen we measure the target register, it collapses onto some specific output bitstring $w_0 \\in \\text{Range}(f)$. Because each of the $2^{n-1}$ outputs has identical amplitude $1/\\sqrt{2^{n-1}}$, each output occurs with equal probability:\n$$P(w_0) = \\left| \\frac{1}{\\sqrt{2^{n-1}}} \\right|^2 = \\frac{1}{2^{n-1}}$$\n\nImmediately after this measurement, by the projection postulate of quantum mechanics, the target register collapses to $|w_0\\rangle$, and the input register collapses onto the terms associated with $w_0$:\n$$|\\psi_3\\rangle = \\frac{|x_0\\rangle + |x_0 \\oplus s\\rangle}{\\sqrt{2}}$$\nwhere $x_0$ and $x_0 \\oplus s$ are the two inputs that produce $w_0$.\n\nNotice that the value of $w_0$ is completely arbitrary and irrelevant—we don't even need to record it! The target register has performed its job: it has disentangled the input register, leaving it in an isolated superposition of two states separated by the secret shift $s$!",
        "math": "Post-measurement state on input register:\n$$|\\psi_3\\rangle = \\frac{1}{\\sqrt{2}}(|x_0\\rangle + |x_0 \\oplus s\\rangle)$$\nNotice that this state has support on exactly two basis kets.",
        "circuitConnection": "In QubitLab, you can place measurement meters [M] on the target qubits $q_n, \\dots, q_{2n-1}$ (or simply trace them out, as quantum mechanics guarantees identical results).",
        "visualIntuition": "Imagine rolling a pair of linked dice. You peek at the sum ($w_0$): that single glance eliminates all other dice combinations, leaving only the two faces that match that sum.",
        "example": "If the target register measures '10', and the two inputs that map to '10' are $001$ and $111$ ($s = 110$), the input register is left in state $\\frac{|001\\rangle + |111\\rangle}{\\sqrt{2}}$.",
        "commonMistakes": [
          "Measuring the input register right now! If you measure the input register now, it collapses to either $x_0$ or $x_0 \\oplus s$ at random, giving zero information about $s$! You MUST apply Hadamards first.",
          "Thinking the identity of $w_0$ helps find $s$. The value of $w_0$ is an arbitrary hash value."
        ],
        "checkQuestion": "If you measured the input register immediately after measuring the target register, would you learn the secret string s?",
        "checkAnswer": "No! You would observe only a single random bitstring (either x_0 or x_0 ⊕ s), revealing no information about their difference s.",
        "nextConnection": "To extract information about s, we must cause quantum interference between |x_0⟩ and |x_0 ⊕ s⟩ using a second Hadamard transform.",
        "qiskitCode": "from qiskit import QuantumCircuit\nqc = QuantumCircuit(4, 2)\n# Measure target qubits into classical bits\nqc.measure([2, 3], [0, 1])\nprint('Target register measured')"
      },
      {
        "id": "simon-phase-7",
        "order": 7,
        "title": "Second Hadamard Layer & Quantum Interference",
        "duration": "6 min",
        "xp_reward": 50,
        "objective": "Apply H^(⊗n) to the paired state (|x_0⟩ + |x_0 ⊕ s⟩)/√2 and derive the interference amplitude.",
        "explanation": "Now we apply a final layer of Hadamard gates $H^{\\otimes n}$ to the $n$ input qubits.\n\nRecall the action of $H^{\\otimes n}$ on any basis state $|x\\rangle$:\n$$H^{\\otimes n} |x\\rangle = \\frac{1}{\\sqrt{2^n}} \\sum_{y \\in \\{0, 1\\}^n} (-1)^{x \\cdot y} |y\\rangle$$\nwhere $x \\cdot y = x_1 y_1 \\oplus x_2 y_2 \\oplus \\dots \\oplus x_n y_n$ is the bitwise inner product modulo 2.\n\nApplying $H^{\\otimes n}$ to our state $|\\psi_3\\rangle = \\frac{1}{\\sqrt{2}}(|x_0\\rangle + |x_0 \\oplus s\\rangle)$ gives:\n$$|\\psi_4\\rangle = H^{\\otimes n} \\left( \\frac{|x_0\\rangle + |x_0 \\oplus s\\rangle}{\\sqrt{2}} \\right) = \\frac{1}{\\sqrt{2^{n+1}}} \\sum_{y \\in \\{0, 1\\}^n} \\Big( (-1)^{x_0 \\cdot y} + (-1)^{(x_0 \\oplus s) \\cdot y} \\Big) |y\\rangle$$\n\nUsing the linearity of the dot product modulo 2:\n$$(x_0 \\oplus s) \\cdot y = (x_0 \\cdot y) \\oplus (s \\cdot y) \\implies (-1)^{(x_0 \\oplus s) \\cdot y} = (-1)^{x_0 \\cdot y} (-1)^{s \\cdot y}$$\nFactoring out $(-1)^{x_0 \\cdot y}$:\n$$|\\psi_4\\rangle = \\frac{1}{\\sqrt{2^{n+1}}} \\sum_{y \\in \\{0, 1\\}^n} (-1)^{x_0 \\cdot y} \\Big( 1 + (-1)^{s \\cdot y} \\Big) |y\\rangle$$\n\nLook at the term inside parentheses: $\\Big( 1 + (-1)^{s \\cdot y} \\Big)$! This term controls the interference!",
        "math": "Interference term evaluation:\n$$1 + (-1)^{s \\cdot y} = \\begin{cases} 1 + 1 = 2 & \\text{if } s \\cdot y = 0 \\pmod 2 \\quad (\\text{Constructive}) \\\\ 1 - 1 = 0 & \\text{if } s \\cdot y = 1 \\pmod 2 \\quad (\\text{Destructive}) \\end{cases}$$\nEvery bitstring $y$ that has $s \\cdot y = 1$ is completely annihilated by destructive interference!",
        "circuitConnection": "In QubitLab, place an $H$ gate on every input wire $q_0, \\dots, q_{n-1}$ immediately before the final measurement meters.",
        "visualIntuition": "Think of light passing through two parallel slits. Waves from slit $x_0$ and slit $x_0 \\oplus s$ arrive at the screen: for angles where the phase difference is odd ($s \\cdot y = 1$), the waves cancel to pure darkness.",
        "example": "If $s = 11$, and $y = 01$: $s \\cdot y = (1)(0) \\oplus (1)(1) = 1$. The term is $1 + (-1)^1 = 1 - 1 = 0$. The amplitude of $|01\\rangle$ is exactly 0!",
        "commonMistakes": [
          "Forgetting that the dot product is modulo 2. $1 \\oplus 1 = 0$ (not 2).",
          "Omitting the final Hadamard gates. Without the Hadamards, no interference occurs."
        ],
        "checkQuestion": "What is the amplitude of a state |y⟩ if its inner product with the secret string satisfies s · y = 1 (mod 2)?",
        "checkAnswer": "Exactly zero (0). Destructive interference completely cancels the amplitude: 1 + (-1)¹ = 0.",
        "nextConnection": "Now we analyze what happens when we measure the input register: we always observe a vector orthogonal to s!",
        "qiskitCode": "# Checking the interference condition in Python\ns = [1, 1, 0]\ny = [0, 1, 1]\ndot_product = sum(a * b for a, b in zip(s, y)) % 2\nprint('s . y (mod 2):', dot_product)  # 1*0 + 1*1 + 0*1 = 1 -> Destructive!"
      },
      {
        "id": "simon-phase-8",
        "order": 8,
        "title": "The Orthogonality Condition: y · s = 0 (mod 2)",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Understand why every measured bitstring y satisfies the linear equation y · s = 0 (mod 2).",
        "explanation": "Because destructive interference completely erases every state with $s \\cdot y = 1$, the final state contains non-zero amplitude ONLY for strings $y$ that satisfy:\n$$s \\cdot y = 0 \\pmod 2$$\n\nSubstituting $1 + (-1)^0 = 2$ back into our equation for $|\\psi_4\\rangle$:\n$$|\\psi_4\\rangle = \\frac{1}{\\sqrt{2^{n+1}}} \\sum_{y: s \\cdot y = 0} (-1)^{x_0 \\cdot y} (2) |y\\rangle = \\frac{1}{\\sqrt{2^{n-1}}} \\sum_{y: s \\cdot y = 0} (-1)^{x_0 \\cdot y} |y\\rangle$$\n\nThere are exactly $2^{n-1}$ bitstrings $y$ that are orthogonal to $s$. Each of these $2^{n-1}$ states has amplitude magnitude $1/\\sqrt{2^{n-1}}$ and probability:\n$$P(y) = \\left| \\frac{(-1)^{x_0 \\cdot y}}{\\sqrt{2^{n-1}}} \\right|^2 = \\frac{1}{2^{n-1}}$$\n\nWhen we measure the input register, we observe a bitstring $y$ chosen uniformly at random from the set of all vectors orthogonal to $s$!\nEvery single run of the quantum circuit gives us **one linear equation** about the secret string $s$:\n$$y_1 s_1 \\oplus y_2 s_2 \\oplus \\dots \\oplus y_n s_n = 0 \\pmod 2$$",
        "math": "The fundamental Simon measurement theorem:\n$$\\text{If } y \\text{ is measured, then } y \\cdot s = \\sum_{i=1}^n y_i s_i \\equiv 0 \\pmod 2$$\nNotice that $x_0$ appears only as a global phase factor $(-1)^{x_0 \\cdot y}$, having zero effect on the probability distribution $P(y)$.",
        "circuitConnection": "In QubitLab, the classical measurement register collects bitstring $y$. This bitstring is added as a linear constraint in the solver panel.",
        "visualIntuition": "Imagine the secret string $s$ is an unknown normal vector. Each measurement $y$ is a flat plank that is guaranteed to lie flush against that vector.",
        "example": "For $n=3$ with $s = 110$:\n- $y = 000$: $0(1) + 0(1) + 0(0) = 0$ (Always orthogonal!)\n- $y = 110$: $1(1) + 1(1) + 0(0) = 1 + 1 = 0 \\pmod 2$\n- $y = 001$: $0(1) + 0(1) + 1(0) = 0$\n- $y = 111$: $1(1) + 1(1) + 1(0) = 0$\nOnly these 4 bitstrings can ever be measured!",
        "commonMistakes": [
          "Expecting the measurement to yield $s$ directly. The measurement yields a vector $y$ *orthogonal* to $s$, not $s$ itself!",
          "Discarding $y = 00\\dots0$. The zero vector is always orthogonal to any $s$, but provides no new constraints."
        ],
        "checkQuestion": "If the secret string is s = 110, can the bitstring y = 100 ever be measured by Simon's algorithm?",
        "checkAnswer": "No! Because s · y = (1)(1) + (1)(0) + (0)(0) = 1 ≠ 0 (mod 2). Destructive interference completely eliminates this outcome.",
        "nextConnection": "A single linear equation does not uniquely determine s. How many equations do we need? Let's analyze Repeated Quantum Sampling.",
        "qiskitCode": "# Checking valid measurement outcomes for s=110\ns = [1, 1, 0]\nvalid_y = [y for y in range(8) if sum(int(b)*si for b, si in zip(f'{y:03b}', s)) % 2 == 0]\nprint('Measurable bitstrings y:', [f'{y:03b}' for y in valid_y])"
      },
      {
        "id": "simon-phase-9",
        "order": 9,
        "title": "Repeated Quantum Sampling: Collecting n−1 Independent Vectors",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Understand how repeated runs collect n-1 linearly independent constraint vectors y^(1), y^(2), ..., y^(n-1) with high probability in O(n) trials.",
        "explanation": "A single linear equation $y^{(1)} \\cdot s = 0 \\pmod 2$ restricts $s$ to a subspace of dimension $n-1$ (containing $2^{n-1}$ candidate strings). To pin down $s$ uniquely, we need a system of **$n-1$ linearly independent** equations.\n\nWe simply re-run the quantum circuit $m$ times, collecting vectors $y^{(1)}, y^{(2)}, \\dots, y^{(m)}$.\n\nHow many runs $m$ are required to collect $n-1$ linearly independent vectors?\n- The first non-zero vector $y^{(1)}$ is independent with probability $1 - 1/2^{n-1}$.\n- Given $k$ independent vectors spanning a $k$-dimensional subspace, a newly measured vector $y^{(k+1)}$ is linearly independent with probability $1 - 2^k / 2^{n-1} = 1 - 2^{k - (n-1)}$.\n\nSumming the geometric failure probabilities shows that running the quantum circuit approximately:\n$$m \\approx n + 10$$\ntimes guarantees that we obtain $n-1$ linearly independent vectors with probability exceeding **99.9%**! In total, only $\\mathcal{O}(n)$ quantum runs are needed!",
        "math": "Probability that $n-1$ vectors are linearly independent:\n$$P_{\\text{indep}} = \\prod_{k=1}^{n-1} \\left( 1 - \\frac{1}{2^{n-k}} \\right) > 0.288$$\nBy running $m = n + c$ independent trials, the success probability becomes:\n$$P_{\\text{success}} \\ge 1 - \\frac{1}{2^c}$$\nSetting $c = 10$ yields $P \\ge 1 - 1/1024 \\approx 99.9\\%$.",
        "circuitConnection": "In QubitLab, the circuit is executed in a loop of shots, appending each newly observed bitstring to a linear algebra matrix.",
        "visualIntuition": "Imagine you are trying to find an unknown line in 3D space. Each measurement gives you a flat plane passing through that line. Two non-parallel planes intersect in a single unique line!",
        "example": "For $n=3$: we need $3-1 = 2$ independent equations. Suppose run 1 gives $y^{(1)} = 001$ ($s_3 = 0$) and run 2 gives $y^{(2)} = 110$ ($s_1 \\oplus s_2 = 0 \\implies s_1 = s_2$). We have 2 independent equations.",
        "commonMistakes": [
          "Assuming every run produces a new independent vector. Duplicate vectors or linear combinations can occur; simply discard duplicates and keep sampling until rank = $n-1$.",
          "Stopping when you have $n$ equations instead of $n-1$. Because $s \\cdot y = 0$ is a homogeneous system, the maximum rank is $n-1$."
        ],
        "checkQuestion": "For an n=4 qubit system, how many linearly independent constraint vectors y are required to solve for the secret string s?",
        "checkAnswer": "n - 1 = 4 - 1 = 3 linearly independent vectors.",
        "nextConnection": "Now we hand these n-1 linear equations to a classical computer to solve for s using Gaussian Elimination over F_2.",
        "qiskitCode": "# Simulating independent vector collection\nimport numpy as np\nprint('Collecting linearly independent vectors over GF(2)...')"
      },
      {
        "id": "simon-phase-10",
        "order": 10,
        "title": "Classical Post-Processing: Gaussian Elimination over F_2",
        "duration": "6 min",
        "xp_reward": 50,
        "objective": "Solve the homogeneous linear system M · s = 0 over the Galois Field GF(2) using Gaussian elimination to recover the secret string s.",
        "explanation": "Once the quantum circuit has collected $n-1$ linearly independent vectors $y^{(1)}, \\dots, y^{(n-1)}$, we assemble them into an $(n-1) \\times n$ binary matrix $M$:\n$$M = \\begin{pmatrix} y^{(1)}_1 & y^{(1)}_2 & \\dots & y^{(1)}_n \\\\ y^{(2)}_1 & y^{(2)}_2 & \\dots & y^{(2)}_n \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ y^{(n-1)}_1 & y^{(n-1)}_2 & \\dots & y^{(n-1)}_n \\end{pmatrix}$$\n\nWe then solve the homogeneous linear system over the field $\\mathbb{F}_2 = \\text{GF}(2)$ (arithmetic modulo 2):\n$$M \\cdot \\vec{s} = \\vec{0} \\pmod 2$$\n\nBecause the matrix has rank $n-1$ and $n$ columns, by the Rank-Nullity Theorem, the null space (kernel) has dimension:\n$$\\text{dim}(\\text{Null}(M)) = n - \\text{rank}(M) = n - (n-1) = 1$$\nA 1-dimensional null space over $\\mathbb{F}_2$ contains exactly **two vectors**: the trivial zero vector $\\vec{0} = 00\\dots0$, and one unique non-zero vector—which is precisely our secret string $\\vec{s}$!\n\nStandard Gaussian elimination over $\\mathbb{F}_2$ solves this system in $\\mathcal{O}(n^3)$ classical operations!",
        "math": "Rank-Nullity theorem over $\\mathbb{F}_2$:\n$$\\text{dim}(\\text{Ker}(M)) = n - (n-1) = 1 \\implies \\text{Ker}(M) = \\{0^n, s\\}$$\nGaussian elimination row operations in $\\mathbb{F}_2$ replace subtraction with XOR: $R_i \\leftarrow R_i \\oplus R_j$.",
        "circuitConnection": "In QubitLab, the classical post-processing engine solves the matrix automatically and displays the extracted secret string $s$.",
        "visualIntuition": "Gaussian elimination systematically eliminates variables row by row, until only a single degree of freedom remains, pointing like an arrow directly at $s$.",
        "example": "For $n=3$, suppose our two equations are:\n1. $0s_1 + 0s_2 + 1s_3 = 0 \\implies s_3 = 0$\n2. $1s_1 + 1s_2 + 0s_3 = 0 \\implies s_1 = s_2$\nSince $s \\neq 000$, setting $s_1 = 1$ forces $s_2 = 1$. With $s_3 = 0$, the unique non-zero solution is $s = 110_2$!",
        "commonMistakes": [
          "Using standard real-number division in Gaussian elimination. In $\\mathbb{F}_2$, arithmetic is strictly modulo 2: addition is XOR, and multiplication is AND.",
          "Assuming the solution is invalid if $s = 00\\dots0$. If testing whether $f(0^n) = f(s)$ fails, it means the function was 1-to-1 ($s=0$)."
        ],
        "checkQuestion": "What is the dimension of the null space of an (n-1) x n binary matrix of rank n-1 over F_2, and how many vectors does it contain?",
        "checkAnswer": "The null space has dimension 1, containing exactly 2 vectors: the zero vector 0^n and the unique secret string s.",
        "nextConnection": "Let's reflect on the profound theoretical significance of Simon's algorithm in the history of quantum complexity theory.",
        "qiskitCode": "# Gaussian elimination over GF(2) in Python\ndef solve_simon_matrix(equations, n):\n    # Solves M * s = 0 over GF(2)\n    # Returns the non-zero kernel vector s\n    pass\nprint('Classical Gaussian elimination solver ready')"
      },
      {
        "id": "simon-phase-11",
        "order": 11,
        "title": "Exponential Quantum Advantage (BQP vs BPP)",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Understand the computational complexity proof of Simon's algorithm: proving an oracle separation between BQP and BPP.",
        "explanation": "Why is Simon's algorithm celebrated in theoretical computer science?\n\nBefore Simon's paper, the Deutsch-Jozsa algorithm proved an exponential separation for *deterministic* algorithms (EQP vs P), but a classical *randomized* algorithm (BPP) could still solve Deutsch-Jozsa with high probability in $\\mathcal{O}(1)$ queries.\n\nDaniel Simon proved something much stronger: **even with bounded error and randomization, no classical algorithm can solve Simon's problem in fewer than $\\Omega(2^{n/2})$ queries**! Meanwhile, Simon's quantum algorithm solves it in $\\mathcal{O}(n)$ queries with probability $1 - \\epsilon$.\n\nThis provided the first rigorous proof of an **exponential separation** between the quantum complexity class **BQP** (Bounded-error Quantum Polynomial-time) and the classical complexity class **BPP** (Bounded-error Probabilistic Polynomial-time) relative to an oracle:\n$$\\text{BQP}^{\\mathcal{O}} \\neq \\text{BPP}^{\\mathcal{O}}$$\nWhen Peter Shor read Simon's paper in 1994, he realized that finding the period of modular exponentiation shared the exact same algebraic structure—leading directly to Shor's revolutionary factoring algorithm!",
        "math": "Complexity comparison:\n$$T_{\\text{classical}} = \\Omega(2^{n/2}) \\quad \\text{vs.} \\quad T_{\\text{quantum}} = \\mathcal{O}(n) + \\mathcal{O}(n^3) = \\mathcal{O}(n^3)$$\nHere, $\\mathcal{O}(n)$ is the quantum query complexity, and $\\mathcal{O}(n^3)$ is the classical Gaussian elimination runtime.",
        "circuitConnection": "In QubitLab, Mission 08 lets you witness this exponential speedup in real time as $s$ is extracted in just a few shots.",
        "visualIntuition": "Classical computing is stuck hunting for two identical needles in a haystack of size $2^n$. The quantum computer detects the magnetic field lines generated by the needles, tracking them in a few seconds.",
        "example": "For $n=50$: classical brute force requires $2^{25} \\approx 33,554,432$ queries. Simon's quantum algorithm requires $\\approx 60$ queries and a fraction of a millisecond of Gaussian elimination.",
        "commonMistakes": [
          "Thinking Simon's algorithm can be used directly to factor integers. Simon's algorithm works over the group $(\\mathbb{Z}_2)^n$, whereas factoring works over the cyclic group $\\mathbb{Z}_N^*$. Shor adapted Simon's insight using QFT instead of Hadamards.",
          "Confusing BQP with NP. Simon's algorithm proves separation for an oracle problem, not for NP-complete problems."
        ],
        "checkQuestion": "Which complexity classes were proven to have an exponential separation relative to an oracle by Simon's algorithm?",
        "checkAnswer": "BQP (Bounded-error Quantum Polynomial time) and BPP (Bounded-error Probabilistic Polynomial time).",
        "nextConnection": "Now you are ready to assemble and execute the complete Simon's Algorithm circuit in Quantum Studio.",
        "qiskitCode": "# Demonstrating query comparison\nn = 30\nprint(f'Classical queries needed: {2**(n//2):,} | Quantum queries: {n+10}')"
      },
      {
        "id": "simon-phase-12",
        "order": 12,
        "title": "Full Simon Algorithm & Secret String Extraction",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Synthesize the complete Simon circuit in Quantum Studio, extract the secret string s, and claim your Mission 08 XP.",
        "explanation": "You have completed the Simon's Algorithm curriculum! Let's review the complete algorithm workflow:\n1. **Initialization**: Prepare $2n$ qubits in state $|0^n\\rangle |0^n\\rangle$.\n2. **Input Superposition**: Apply $H^{\\otimes n}$ to the $n$ input qubits to create $\\frac{1}{\\sqrt{2^n}}\\sum_x |x\\rangle |0^n\\rangle$.\n3. **Oracle Evaluation**: Apply $U_f$ to write $f(x)$ into the target register, entangling inputs and outputs.\n4. **Interference**: Apply $H^{\\otimes n}$ to the input register, causing destructive interference for all states with $s \\cdot y \\neq 0$.\n5. **Measurement & Sampling**: Measure the input register to obtain a vector $y$ satisfying $y \\cdot s = 0 \\pmod 2$. Repeat $\\approx n+10$ times.\n6. **Classical Post-Processing**: Solve the linear system $M s = 0 \\pmod 2$ using Gaussian elimination to recover the secret string $s$.\n\nEnter Quantum Studio now to wire your circuit, run the simulation, extract the hidden string $s$, and claim your Mission 08 XP!",
        "math": "Complete Simon circuit unitary operator:\n$$U_{\\text{Simon}} = (H^{\\otimes n} \\otimes I^{\\otimes n}) \\cdot U_f \\cdot (H^{\\otimes n} \\otimes I^{\\otimes n})$$\nMeasurement statistics: strictly sample from $\\{y : y \\cdot s = 0 \\pmod 2\\}$.",
        "circuitConnection": "In QubitLab, Mission 08 tests your circuit against a 2-qubit input ($n=2$, total 4 qubits) with a hidden non-zero mask $s$.",
        "visualIntuition": "Watch the measurement histogram in QubitLab: exactly half of the $2^n$ bitstrings have 0% counts, while the other half have equal counts, precisely defining the orthogonal hyperplane to $s$.",
        "example": "With $n=2$ and $s = 11$: the circuit measures only '00' and '11' (both have $y \\cdot 11 = 0$). Solving $s_1 \\oplus s_2 = 0$ uniquely yields $s = 11$!",
        "commonMistakes": [
          "Connecting measurement meters to the target register instead of the input register.",
          "Forgetting the initial Hadamards on the input register."
        ],
        "checkQuestion": "What is the final state of the target register at the end of Simon's algorithm?",
        "checkAnswer": "A collapsed computational state |w_0⟩ representing the output value associated with the observed input pair.",
        "nextConnection": "Proceed to Quantum Studio to build your Simon circuit and advance to Level 9: Variational Quantum Eigensolver (VQE)!",
        "qiskitCode": "# Full Simon algorithm circuit execution\nfrom qiskit import QuantumCircuit\nqc = QuantumCircuit(4, 2)\nqc.h([0, 1])\n# Oracle for s=11\nqc.cx(0, 2); qc.cx(0, 3); qc.cx(1, 3)\nqc.h([0, 1])\nqc.measure([0, 1], [0, 1])\nprint('Simon Mission 08 circuit compiled!')"
      }
    ]
  },
  "vqe": {
    "projectId": "vqe",
    "algorithm": "Variational Quantum Eigensolver (VQE)",
    "overview": "Compute the ground state energy and molecular dissociation profile of chemical systems using the Rayleigh-Ritz variational principle and a hybrid quantum-classical loop.",
    "difficulty": "Advanced",
    "totalDuration": "70 min",
    "phases": [
      {
        "id": "vqe-phase-1",
        "order": 1,
        "title": "The Molecular Ground-State Problem in Quantum Chemistry",
        "duration": "6 min",
        "xp_reward": 50,
        "objective": "Understand the electronic Schrödinger equation, molecular ground states, and why exact classical diagonalization scales exponentially O(2^N).",
        "explanation": "In quantum chemistry and materials science, predicting chemical reaction rates, molecular stability, drug-target binding affinities, and catalyst efficiency requires solving the time-independent **electronic Schrödinger equation** under the Born-Oppenheimer approximation:\n$$H_{\\text{elec}} |\\Psi_0\\rangle = E_0 |\\Psi_0\\rangle$$\nwhere $H_{\\text{elec}}$ is the electronic Hamiltonian, $|\\Psi_0\\rangle$ is the electronic ground state, and $E_0$ is the lowest possible energy eigenvalue (the ground-state energy).\n\nWhy is this intractable for classical supercomputers? Because electrons are indistinguishable fermions obeying the Pauli Exclusion Principle. When simulating an electronic system with $M$ molecular spin-orbitals, the dimension of the electronic Hilbert space (Fock space) scales as $\\binom{M}{N_e}$, growing exponentially with the number of electrons $N_e$.\n\nExact classical Full Configuration Interaction (FCI) diagonalization is computationally impossible for molecules larger than about 20 electrons. In 2014, Alberto Peruzzo et al. introduced the **Variational Quantum Eigensolver (VQE)** to estimate ground-state molecular energies on near-term NISQ quantum computers using hybrid quantum-classical algorithms.",
        "math": "Electronic Hamiltonian in second quantization:\n$$H = \\sum_{pq} h_{pq} a_p^\\dagger a_q + \\frac{1}{2} \\sum_{pqrs} h_{pqrs} a_p^\\dagger a_q^\\dagger a_s a_r$$\nwhere $a_p^\\dagger$ and $a_q$ are fermionic creation and annihilation operators satisfying anti-commutation relations: $\\{a_p, a_q^\\dagger\\} = \\delta_{pq}$.",
        "circuitConnection": "In QubitLab, the molecular orbitals are mapped to qubit wires, and the Hamiltonian is represented as a sum of Pauli operator strings.",
        "visualIntuition": "Imagine finding the lowest point in a vast, dark mountain range with millions of peaks and valleys. A classical computer must map every coordinate on paper. A quantum computer acts like a physical liquid poured into the terrain, naturally pooling at the lowest elevation.",
        "example": "For the Hydrogen molecule ($H_2$) in a minimal STO-3G basis: there are 4 spin orbitals and 2 electrons, which maps directly to a 4-qubit (or tapered 2-qubit) quantum circuit.",
        "commonMistakes": [
          "Assuming VQE finds excited states automatically. Standard VQE finds the ground state (lowest energy). Specialized variants (like SSVQE or VQD) are required for excited states.",
          "Thinking VQE runs entirely on a quantum computer. VQE is inherently a hybrid algorithm: parameter optimization is executed on a classical CPU."
        ],
        "checkQuestion": "Why is exact Full Configuration Interaction (FCI) quantum chemistry intractable on classical computers for large molecules?",
        "checkAnswer": "Because the fermionic Hilbert space dimension scales exponentially with the number of molecular spin orbitals, requiring exponential memory and time to diagonalize.",
        "nextConnection": "To compute this on qubits, we must transform fermionic creation/annihilation operators into Pauli spin operators.",
        "qiskitCode": "# Concept of molecular Hamiltonian mapping\nprint('Fermionic Hamiltonian -> Jordan-Wigner transform -> Pauli operator strings')"
      },
      {
        "id": "vqe-phase-2",
        "order": 2,
        "title": "Fermionic Mappings: Jordan–Wigner & Bravyi–Kitaev",
        "duration": "6 min",
        "xp_reward": 50,
        "objective": "Master the Jordan-Wigner transformation, mapping fermionic creation and annihilation operators to Pauli strings (X, Y, Z).",
        "explanation": "Qubits are distinguishable quantum particles obeying commutation relations, whereas electrons are indistinguishable fermions obeying **anti-commutation relations**:\n$$\\{a_p, a_q^\\dagger\\} = a_p a_q^\\dagger + a_q^\\dagger a_p = \\delta_{pq} I$$\n\nTo represent electrons on qubits, we must use a transformation that preserves these anti-commutation properties. The most widely used method is the **Jordan-Wigner Transformation** (1928):\n- Qubit state $|0\\rangle$ represents an unoccupied orbital; state $|1\\rangle$ represents an occupied orbital.\n- The creation operator $a_j^\\dagger$ is mapped to single-qubit raising/lowering operators with a 'tail' of Pauli $Z$ operators enforcing the fermionic minus sign:\n$$a_j^\\dagger = \\left( \\bigotimes_{k=0}^{j-1} Z_k \\right) \\otimes \\left( \\frac{X_j - iY_j}{2} \\right) \\otimes I^{\\otimes n-j-1}$$\n\nApplying this transformation converts any second-quantized molecular Hamiltonian into a linear combination of **Pauli strings**:\n$$H = \\sum_{k=1}^K c_k P_k, \\quad \\text{where } P_k \\in \\{I, X, Y, Z\\}^{\\otimes n}$$\nwhere each $c_k$ is a real scalar coefficient computed from classical molecular integrals.",
        "math": "The Jordan-Wigner operator mapping:\n$$a_j^\\dagger \\to \\left( \\prod_{k < j} Z_k \\right) \\sigma_j^+, \\quad a_j \\to \\left( \\prod_{k < j} Z_k \\right) \\sigma_j^-$$\nFor molecular $H_2$ at bond distance $0.735$ Å (2-qubit reduction):\n$$H = -1.052 I - 0.398 Z_0 - 0.398 Z_1 - 0.011 Z_0 Z_1 + 0.181 X_0 X_1$$",
        "circuitConnection": "In QubitLab, the molecular Hamiltonian is loaded as a list of Pauli string terms ($Z_0, Z_1, Z_0 Z_1, X_0 X_1$) with their corresponding numeric coefficients.",
        "visualIntuition": "The Jordan-Wigner string acts like a string of dominos. Every electron that moves past an orbital knocks down a domino (Pauli Z) to record the phase parity of all prior electrons.",
        "example": "For 2 orbitals: $a_0^\\dagger = \\frac{1}{2}(X_0 - iY_0) \\otimes I_1$, and $a_1^\\dagger = Z_0 \\otimes \\frac{1}{2}(X_1 - iY_1)$. The $Z_0$ operator ensures that swapping orbital 0 and orbital 1 introduces a minus sign.",
        "commonMistakes": [
          "Omitting the Pauli Z tail in Jordan-Wigner. Without the $Z$ string, electrons would behave as bosons instead of fermions, producing completely wrong physical energies!",
          "Assuming the Pauli representation is unique. Bravyi-Kitaev and Parity mappings are alternative encodings that can reduce two-qubit gate weights."
        ],
        "checkQuestion": "What is the primary physical purpose of the string of Pauli Z operators in the Jordan-Wigner transformation?",
        "checkAnswer": "To enforce the fermionic anti-commutation relations (antisymmetry under particle exchange) on distinguishable qubits.",
        "nextConnection": "Now that the Hamiltonian is written as Pauli operators, how do we find its lowest energy? We use the Rayleigh-Ritz Variational Principle.",
        "qiskitCode": "# Example H2 Hamiltonian in Pauli form\nfrom qiskit.quantum_info import SparsePauliOp\nH2 = SparsePauliOp.from_list([\n    ('II', -1.052),\n    ('ZI', -0.398),\n    ('IZ', -0.398),\n    ('ZZ', -0.011),\n    ('XX',  0.181)\n])\nprint('H2 Hamiltonian:', H2)"
      },
      {
        "id": "vqe-phase-3",
        "order": 3,
        "title": "The Rayleigh–Ritz Variational Principle",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Understand the Rayleigh-Ritz variational theorem: why the expectation value of any trial wavefunction is an upper bound on the ground state energy E_0.",
        "explanation": "The mathematical foundation that guarantees the correctness of VQE is the **Rayleigh-Ritz Variational Principle** from quantum mechanics.\n\nLet $H$ be a Hermitian Hamiltonian with unknown ground-state energy $E_0$ and corresponding ground state $|\\psi_0\\rangle$, such that $H|\\psi_0\\rangle = E_0 |\\psi_0\\rangle$.\n\nTheorem: For **any** normalized trial quantum state $|\\psi(\\theta)\\rangle$ (regardless of how it was prepared), the expectation value of $H$ is strictly greater than or equal to the true ground state energy $E_0$:\n$$\\langle H \\rangle_\\theta = \\langle \\psi(\\theta) | H | \\psi(\\theta) \\rangle \\ge E_0$$\n\nFurthermore, the equality $\\langle H \\rangle_\\theta = E_0$ holds if and only if $|\\psi(\\theta)\\rangle$ is the exact ground state $|\\psi_0\\rangle$!\n\nThis simple yet profound theorem converts a difficult eigenvalue problem into an **optimization problem**: to find the ground state, we simply search for the parameter set $\\theta^*$ that minimizes $\\langle H \\rangle_\\theta$! The lowest energy we ever measure is guaranteed to be an upper bound on the true physical energy.",
        "math": "Proof of the Variational Principle:\nLet $\\{|E_n\\rangle\\}$ be the complete orthonormal eigenbasis of $H$ with eigenvalues $E_0 \\le E_1 \\le E_2 \\dots$\nExpand any normalized state: $|\\psi\\rangle = \\sum_n c_n |E_n\\rangle$, where $\\sum |c_n|^2 = 1$.\n$$\\langle \\psi | H | \\psi \\rangle = \\sum_n |c_n|^2 E_n \\ge \\sum_n |c_n|^2 E_0 = E_0 \\sum_n |c_n|^2 = E_0$$\nTherefore: $\\langle H \\rangle \\ge E_0$.",
        "circuitConnection": "In QubitLab, the energy gauge displays $\\langle H \\rangle_\\theta$ as you adjust the circuit sliders, showing how close your trial state is to the ground state.",
        "visualIntuition": "Imagine holding a metal bar above a trampoline. No matter how you tilt or move the bar, the lowest possible height of the bar is always above or touching the lowest point of the trampoline.",
        "example": "If the true ground state energy of $H_2$ is $-1.137$ Hartree, any trial circuit parameters $\\theta$ might yield $-0.85$ or $-1.05$ or $-1.13$, but can never yield $-1.20$.",
        "commonMistakes": [
          "Thinking VQE can underestimate the true energy in a noiseless simulation. In the absence of unmitigated noise, $\\langle H \\rangle$ is strictly an UPPER bound on $E_0$.",
          "Failing to normalize the trial state vector."
        ],
        "checkQuestion": "Can a valid noiseless trial quantum state |ψ(θ)⟩ produce an energy expectation value lower than the true ground state energy E_0?",
        "checkAnswer": "No! By the Rayleigh-Ritz variational theorem, ⟨H⟩ ≥ E_0 for all normalized quantum states.",
        "nextConnection": "To explore candidate wavefunctions, we need a parameterized quantum circuit: the Ansatz.",
        "qiskitCode": "# Checking the variational bound numerically\nimport numpy as np\nH = np.array([[-1.0, 0.2], [0.2, 0.5]])\ne_true = np.linalg.eigvalsh(H)[0]\nprint('True ground state energy E0:', round(e_true, 4))"
      },
      {
        "id": "vqe-phase-4",
        "order": 4,
        "title": "Wavefunction Ansätze: Hardware-Efficient vs. UCCSD",
        "duration": "6 min",
        "xp_reward": 50,
        "objective": "Compare Hardware-Efficient Ansätze (HEA) and Unitary Coupled Cluster (UCCSD) ansätze, evaluating circuit depth against chemical accuracy.",
        "explanation": "The choice of parameterized quantum circuit—the **ansatz** $|\\psi(\\theta)\\rangle = U(\\theta)|\\text{HF}\\rangle$—is the most crucial design decision in VQE.\n\nTwo major philosophies exist:\n\n1. **Unitary Coupled Cluster (UCCSD)**:\n   - *Chemically Inspired*: Based on classical Coupled Cluster theory, $U(\\theta) = e^{T(\\theta) - T^\\dagger(\\theta)}$, where $T = T_1 + T_2$ describes single and double electron excitations from the Hartree-Fock state $|\\text{HF}\\rangle$.\n   - *Advantages*: Guaranteed to respect particle number and spin symmetries; physically motivated; immune to barren plateaus.\n   - *Disadvantages*: Very deep circuits with high CNOT counts after Trotterization, making it difficult on noisy NISQ hardware.\n\n2. **Hardware-Efficient Ansatz (HEA)**:\n   - *Device Inspired*: Alternates layers of single-qubit rotations ($R_y, R_z$) with native two-qubit entangling gates (CNOT, CZ) tailored to the physical coupling graph of the QPU.\n   - *Advantages*: Minimal circuit depth; low gate error accumulation; fully compatible with NISQ chips.\n   - *Disadvantages*: Does not inherently preserve electron number; susceptible to barren plateaus and unphysical local minima.",
        "math": "UCCSD operator:\n$$|\\psi_{\\text{UCCSD}}\\rangle = \\exp\\left( \\sum_{ia} \\theta_i^a (a_a^\\dagger a_i - a_i^\\dagger a_a) + \\sum_{ijab} \\theta_{ij}^{ab} (a_a^\\dagger a_b^\\dagger a_j a_i - \\text{h.c.}) \\right) |\\text{HF}\\rangle$$\nHardware-Efficient Ansatz:\n$$|\\psi_{\\text{HEA}}\\rangle = \\prod_{l=1}^L \\left( \\prod_{i} \\text{CNOT}_{i, i+1} \\prod_{i} R_y(\\theta_{l, i}) R_z(\\phi_{l, i}) \\right) |0\\dots0\\rangle$$",
        "circuitConnection": "In QubitLab, the default VQE circuit implements a hardware-efficient ansatz using Ry rotations and CNOT gates initialized from the Hartree-Fock state $|1100\\rangle$.",
        "visualIntuition": "UCCSD is like a custom tailored suit designed specifically for the shape of the molecule. HEA is like a stretchy spandex tracksuit: it fits anything easily, but might wrinkle in odd places.",
        "example": "For $H_2$ in minimal basis: Hartree-Fock state is $|01\\rangle$ (or $|1100\\rangle$). A single parameter $U(\\theta) = e^{-i \\theta X_0 Y_1}$ rotates between the ground state $|01\\rangle$ and the doubly excited state $|10\\rangle$.",
        "commonMistakes": [
          "Initializing the ansatz in $|0000\\rangle$ for molecular problems. Molecules have electrons! You must initialize the circuit into the **Hartree-Fock reference state** representing the correct number of electrons before applying excitation unitaries.",
          "Using an ansatz that breaks electron number conservation without adding penalty terms to the Hamiltonian."
        ],
        "checkQuestion": "What is the primary trade-off between the UCCSD ansatz and the Hardware-Efficient Ansatz (HEA)?",
        "checkAnswer": "UCCSD preserves physical electron symmetries but requires deep circuits; HEA has shallow depth suitable for NISQ hardware but can explore unphysical states.",
        "nextConnection": "Now let's see how the quantum computer evaluates the expectation value of a multi-term Hamiltonian.",
        "qiskitCode": "# Hardware efficient ansatz in Qiskit\nfrom qiskit.circuit.library import TwoLocal\nansatz = TwoLocal(2, ['ry', 'rz'], 'cx', reps=1)\nprint('HEA ansatz depth:', ansatz.depth())"
      },
      {
        "id": "vqe-phase-5",
        "order": 5,
        "title": "Measuring Pauli Strings & Basis Rotation",
        "duration": "6 min",
        "xp_reward": 50,
        "objective": "Understand how expectation values of arbitrary Pauli strings (Z, X, Y) are measured by rotating to the computational basis before measurement.",
        "explanation": "Because a molecular Hamiltonian is decomposed into a sum of Pauli strings $H = \\sum_k c_k P_k$, by linearity of expectation values:\n$$\\langle H \\rangle_\\theta = \\sum_{k=1}^K c_k \\langle P_k \\rangle_\\theta = \\sum_{k=1}^K c_k \\langle \\psi(\\theta) | P_k | \\psi(\\theta) \\rangle$$\n\nTo evaluate the total energy, we measure the expectation value $\\langle P_k \\rangle$ of each individual Pauli string! However, physical quantum detectors can **only measure in the computational Z-basis**.\n\nHow do we measure Pauli $X$ and Pauli $Y$ operators?\nBy applying a single-qubit **basis rotation** immediately before the measurement meter:\n1. **To measure Pauli $Z$**: Measure directly in the computational basis (eigenstates $|0\\rangle, |1\\rangle$).\n2. **To measure Pauli $X$**: Apply a **Hadamard gate** $H$ before measurement. Since $H X H = Z$, measuring in the computational basis after $H$ is mathematically equivalent to measuring in the $X$-basis!\n3. **To measure Pauli $Y$**: Apply an **$S^\\dagger$ gate followed by an $H$ gate** ($R_x(\\pi/2)$). Since this rotates the $Y$-axis onto the $Z$-axis, measuring gives $\\langle Y \\rangle$!",
        "math": "Basis rotation transformations:\n$$H X H = Z \\implies \\langle \\psi | X | \\psi \\rangle = \\langle H \\psi | Z | H \\psi \\rangle$$\n$$H S^\\dagger Y S H = Z \\implies \\langle \\psi | Y | \\psi \\rangle = \\langle H S^\\dagger \\psi | Z | H S^\\dagger \\psi \\rangle$$\nFor a multi-qubit Pauli string like $P = X_0 \\otimes Z_1 \\otimes Y_2$: apply $H$ on $q_0$, do nothing on $q_1$, apply $S^\\dagger H$ on $q_2$, then measure all three in the $Z$-basis.",
        "circuitConnection": "In QubitLab, the simulator evaluates each Pauli string by inserting the appropriate measurement basis rotations on the active wires.",
        "visualIntuition": "Imagine your camera only takes photos looking downward (Z-axis). To photograph the front (X-axis) or side (Y-axis) of an object, you simply rotate the object by $90^\\circ$ before snapping the shutter.",
        "example": "To measure $\\langle X_0 X_1 \\rangle$: apply $H$ to $q_0$ and $H$ to $q_1$, measure both qubits, and compute $\\langle X_0 X_1 \\rangle = P(00) + P(11) - P(01) - P(10)$.",
        "commonMistakes": [
          "Trying to measure $X$ and $Z$ simultaneously on the same qubit in the same circuit execution. They do not commute! You must run separate batches of shots with different pre-measurement basis rotations.",
          "Forgetting the $S^\\dagger$ gate when measuring $Y$ (applying only $H$ measures $X$, not $Y$)."
        ],
        "checkQuestion": "What gate must be applied to a qubit immediately before a computational Z-meter to measure the Pauli X observable?",
        "checkAnswer": "A Hadamard (H) gate, which rotates the X-basis eigenstates into computational basis eigenstates.",
        "nextConnection": "Measuring dozens of Pauli strings takes time and shots. How do we group them efficiently to minimize shot noise?",
        "qiskitCode": "# Measuring X observable using H before measurement\nfrom qiskit import QuantumCircuit\nqc = QuantumCircuit(1, 1)\n# State preparation...\nqc.h(0)  # Basis rotation: X -> Z\nqc.measure(0, 0)\nprint('X-basis measurement circuit ready')"
      },
      {
        "id": "vqe-phase-6",
        "order": 6,
        "title": "Statistical Shot Noise & Commuting Pauli Grouping",
        "duration": "6 min",
        "xp_reward": 50,
        "objective": "Understand statistical variance (shot noise), chemical accuracy (1.6 milli-Hartree), and how grouping commuting Paulis reduces measurement budgets.",
        "explanation": "Because quantum computers evaluate expectation values by averaging discrete measurement samples, the measured energy fluctuates around the true mean due to **statistical shot noise**.\n\nAccording to the Central Limit Theorem, the statistical error in estimating $\\langle H \\rangle$ scales inversely with the square root of the number of shots $N_{\\text{shots}}$:\n$$\\Delta E \\approx \\frac{\\sigma}{\\sqrt{N_{\\text{shots}}}}$$\nIn computational chemistry, the standard benchmark for predictive utility is **Chemical Accuracy**: $\\Delta E \\le 1.0 \\text{ kcal/mol} \\approx 1.6 \\times 10^{-3} \\text{ Hartree}$ (approx 0.043 eV). Reaching this tight threshold requires millions of measurement shots if every Pauli string is measured independently!\n\n**Qubit-Wise Commuting (QWC) Grouping**:\nIf two Pauli strings commute on every qubit (e.g. $Z_0 I_1$ and $I_0 Z_1$ and $Z_0 Z_1$), they can be measured **simultaneously in the exact same circuit run** from a single set of measurement data! Grouping Pauli strings into commuting cliques dramatically reduces the required number of circuit executions.",
        "math": "Shot variance for Hamiltonian $H = \\sum c_k P_k$:\n$$\\text{Var}(\\langle H \\rangle) = \\sum_{k=1}^K \\frac{c_k^2 (1 - \\langle P_k \\rangle^2)}{N_k}$$\nChemical accuracy target: $\\epsilon \\le 1.6 \\times 10^{-3}$ Hartree.\nNumber of shots required: $N_{\\text{shots}} = \\mathcal{O}\\left(\\frac{(\\sum |c_k|)^2}{\\epsilon^2}\\right)$.",
        "circuitConnection": "In QubitLab, the measurement budget optimizer groups Hamiltonian terms into commuting sets to maximize shot efficiency.",
        "visualIntuition": "Imagine running a public survey. Asking 5 questions on a single questionnaire saves enormous time compared to sending 5 separate survey mailers to every household.",
        "example": "For $H_2$: the terms $Z_0, Z_1,$ and $Z_0 Z_1$ all commute. A single batch of 1,000 shots in the standard Z-basis evaluates all three terms simultaneously!",
        "commonMistakes": [
          "Assuming 100 shots is enough for chemical accuracy. 100 shots gives precision $\\sim 1/\\sqrt{100} = 0.1$ Hartree, which is 60 times too coarse for chemical accuracy!",
          "Grouping terms that are not qubit-wise commuting without using entangling measurement subroutines."
        ],
        "checkQuestion": "What is the standard numerical threshold for 'chemical accuracy' in quantum chemistry?",
        "checkAnswer": "1.0 kcal/mol, which is approximately 1.6 milli-Hartree (0.0016 Hartree) or 0.043 eV.",
        "nextConnection": "Now we feed the estimated energy to a classical optimizer: COBYLA, SPSA, or Nelder-Mead.",
        "qiskitCode": "# Commuting grouping demonstration\nfrom qiskit.quantum_info import SparsePauliOp\nop1 = SparsePauliOp('ZI')\nop2 = SparsePauliOp('IZ')\nprint('Commute qubit-wise:', op1.commutes(op2))"
      },
      {
        "id": "vqe-phase-7",
        "order": 7,
        "title": "The Classical Optimizer: COBYLA, SPSA, & Nelder–Mead",
        "duration": "6 min",
        "xp_reward": 50,
        "objective": "Understand classical optimization strategies for noisy energy landscapes: gradient-free vs. stochastic gradient methods.",
        "explanation": "Once the quantum computer measures $\\langle H \\rangle_\\theta$, it passes this scalar energy value to a classical optimization routine running on a CPU. The optimizer adjusts $\\theta$ to step downhill toward the minimum.\n\nBecause the quantum energy evaluation contains statistical shot noise, standard classical gradient descent methods (like BFGS) struggle because numerical noise corrupts gradient estimates. Quantum chemists rely on three robust optimizers:\n\n1. **COBYLA (Constrained Optimization BY Linear Approximation)**:\n   - Constructs linear approximations to the objective function using a simplex of points.\n   - Excellent for low-dimensional parameter spaces ($< 20$ parameters).\n   - Fully gradient-free and highly resilient to moderate noise.\n\n2. **SPSA (Simultaneous Perturbation Stochastic Approximation)**:\n   - Randomly perturbs all parameters simultaneously to estimate gradients with only 2 function evaluations per step.\n   - Ideal for large parameter spaces and noisy hardware.\n\n3. **Nelder-Mead (Simplex Search)**:\n   - Adapts a geometric simplex (triangle/tetrahedron) that rolls downhill.\n   - Robust against minor noise but can stall on flat plateaus.",
        "math": "COBYLA builds a linear model $L_k(\\theta)$ in a trust region of radius $\\rho_k$:\n$$\\min_\\theta L_k(\\theta) \\quad \\text{subject to } \\|\\theta - \\theta_k\\| \\le \\rho_k$$\nWhen the step fails to improve the energy, the trust region contracts: $\\rho_{k+1} = \\frac{1}{2}\\rho_k$.",
        "circuitConnection": "In QubitLab, the VQE interface uses COBYLA by default to adjust the variational sliders automatically during automated optimization.",
        "visualIntuition": "Imagine rolling a heavy ball downhill in the dark during a hailstorm. COBYLA feels the ground with a 3-point cane, stepping in the general downhill direction despite the hail bouncing off the ground.",
        "example": "Starting at $\\theta = 0.0$ ($E = -0.85$ Ha): COBYLA steps to $\\theta = 0.2$ ($E = -1.02$ Ha), then $\\theta = 0.4$ ($E = -1.135$ Ha), and contracts its step size to converge at $\\theta^* = 0.38$ ($E = -1.137$ Ha).",
        "commonMistakes": [
          "Using standard finite-difference gradient descent with tiny step sizes $\\epsilon$. Shot noise will completely dominate the gradient!",
          "Terminating optimization prematurely after 5 or 10 steps before the trust region has contracted."
        ],
        "checkQuestion": "Why is the COBYLA optimizer widely preferred over standard finite-difference gradient descent for near-term VQE experiments?",
        "checkAnswer": "Because COBYLA is a gradient-free trust-region algorithm that is far more resilient to statistical shot noise on noisy quantum processors.",
        "nextConnection": "Now we trace the energy minimum across different interatomic bond distances to generate a Potential Energy Surface.",
        "qiskitCode": "# SciPy COBYLA minimization of a noisy function\nfrom scipy.optimize import minimize\ndef noisy_energy(theta):\n    import random\n    return (theta[0] - 0.38)**2 - 1.137 + random.gauss(0, 0.005)\nres = minimize(noisy_energy, x0=[0.0], method='COBYLA')\nprint('Converged theta:', np.round(res.x, 3), 'Energy:', np.round(res.fun, 4))"
      },
      {
        "id": "vqe-phase-8",
        "order": 8,
        "title": "Potential Energy Surfaces & Bond Dissociation",
        "duration": "6 min",
        "xp_reward": 50,
        "objective": "Understand how repeating VQE across multiple interatomic bond distances maps the potential energy curve and determines equilibrium bond lengths.",
        "explanation": "A single VQE calculation gives the ground-state energy for one fixed arrangement of atomic nuclei. To understand chemical reactions, bond breaking, and molecular vibration, chemists repeat VQE across dozens of nuclear separations $R$ to plot the **Potential Energy Surface (PES)** (or bond dissociation curve).\n\nLet's trace the curve for the Hydrogen molecule ($H_2$) as the internuclear distance $R$ varies from $0.2$ Å to $3.0$ Å:\n1. **Nuclear Repulsion ($R < 0.5$ Å)**: The positively charged proton nuclei are too close together. Coulomb repulsion dominates, and the energy spikes upward ($E \\to +\\infty$).\n2. **Equilibrium Well ($R \\approx 0.74$ Å)**: Attractive electron-nuclear forces balance nuclear repulsion. The energy reaches a global minimum: $E_{\\text{min}} \\approx -1.137$ Hartree. This minimum determines the physical **equilibrium bond length** ($R_e = 0.741$ Å) and the **bond dissociation energy**!\n3. **Dissociation Limit ($R > 2.5$ Å)**: The bond breaks completely. The two hydrogen atoms separate into two independent neutral atoms ($H + H$), with energy approaching $2 \\times (-0.5) = -1.000$ Hartree.",
        "math": "Total molecular energy including nuclear repulsion:\n$$E_{\\text{total}}(R) = \\langle H_{\\text{elec}}(R) \\rangle + V_{\\text{nuclear}}(R)$$\nwhere $V_{\\text{nuclear}}(R) = \\sum_{A < B} \\frac{Z_A Z_B}{R_{AB}}$ is the classical electrostatic repulsion between atomic nuclei.",
        "circuitConnection": "In QubitLab, the molecular geometry slider adjusts the bond distance $R$, recalculating the Hamiltonian coefficients $c_k(R)$ in real time.",
        "visualIntuition": "Imagine two magnets connected by a spring. If you squeeze them together, the spring resists strongly. If you pull them apart, the spring stretches. The relaxed resting length of the spring is the equilibrium bond length.",
        "example": "At $R = 0.74$ Å: total energy is $-1.137$ Ha. At $R = 2.5$ Å: total energy is $-1.000$ Ha. The depth of the well is $\\Delta E = 0.137$ Ha $\\approx 86$ kcal/mol, which is the exact chemical bond strength of $H_2$!",
        "commonMistakes": [
          "Forgetting to add the nuclear repulsion energy $V_{nn}$ to the electronic expectation value. Without $V_{nn}$, the energy appears to decrease monotonically to $-\\infty$ as $R \\to 0$!",
          "Assuming classical mean-field methods (Hartree-Fock) can handle bond breaking. Classical Hartree-Fock fails catastrophically at large $R$ due to strong static correlation; VQE handles bond dissociation accurately."
        ],
        "checkQuestion": "What physical feature of the Potential Energy Surface dictates the equilibrium bond length of a molecule?",
        "checkAnswer": "The global minimum (lowest energy point) of the potential energy curve.",
        "nextConnection": "Let's explore hardware noise on NISQ devices and error mitigation techniques like Zero-Noise Extrapolation.",
        "qiskitCode": "# Potential energy curve data points for H2\ndistances = [0.5, 0.74, 1.0, 1.5, 2.0, 2.5]\nenergies  = [-1.055, -1.137, -1.101, -1.025, -1.005, -1.000]\nprint('Equilibrium distance:', distances[np.argmin(energies)], 'A')"
      },
      {
        "id": "vqe-phase-9",
        "order": 9,
        "title": "Quantum Error Mitigation on NISQ Hardware",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Understand error mitigation strategies for noisy processors: Zero-Noise Extrapolation (ZNE) and Readout Error Mitigation.",
        "explanation": "Because fault-tolerant quantum error correction requires millions of physical qubits that do not yet exist, near-term VQE algorithms rely on **Quantum Error Mitigation (QEM)** to reduce the impact of hardware noise without full error-correcting codes.\n\nTwo critical techniques are widely deployed in VQE:\n\n1. **Zero-Noise Extrapolation (ZNE)**:\n   - Hardware noise cannot be eliminated, but it can be deliberately *increased*!\n   - We amplify the circuit noise by stretching gate pulses or inserting pairs of redundant gates (e.g. replacing a CNOT with 3 CNOTs or 5 CNOTs, since $\\text{CNOT}^2 = I$).\n   - We evaluate the energy at noise scale factors $\\lambda = 1, 3, 5$.\n   - We fit a polynomial or exponential curve to the points and extrapolate backward to $\\lambda = 0$ (the theoretical zero-noise limit)!\n\n2. **Readout Error Mitigation (Measurement Calibration)**:\n   - Qubit detectors have a $1\\%$ to $3\\%$ probability of recording a $|0\\rangle$ as a $|1\\rangle$ (or vice versa).\n   - We measure a calibration matrix $M_{\\text{cal}}$ by preparing basis states $|00\\rangle, |01\\rangle, \\dots$\n   - We invert this matrix: $P_{\\text{mitigated}} = M_{\\text{cal}}^{-1} P_{\\text{measured}}$, restoring true probability distributions.",
        "math": "Zero-Noise Extrapolation with Richardson extrapolation:\n$$E(\\lambda) = E_0 + c_1 \\lambda + c_2 \\lambda^2$$\nGiven measurements at $\\lambda = 1$ and $\\lambda = 2$:\n$$E_0 \\approx 2 E(\\lambda=1) - E(\\lambda=2)$$",
        "circuitConnection": "In QubitLab, enabling error mitigation applies readout calibration corrections to the measurement counts before computing expectation values.",
        "visualIntuition": "Imagine measuring outdoor temperature with a thermometer that reads higher when the sun shines directly on it. You measure in full shade, partial shade, and direct sun, and extrapolate to what the temperature would be with zero solar heating.",
        "example": "At noise scale $\\lambda=1$: energy measures $-1.08$ Ha. At $\\lambda=2$: energy measures $-1.02$ Ha. Richardson extrapolation predicts the zero-noise energy: $E_0 = 2(-1.08) - (-1.02) = -1.14$ Ha (matching the true chemical value!).",
        "commonMistakes": [
          "Confusing error mitigation with error correction. Mitigation does not correct errors during the run; it post-processes noisy expectation values using statistical sampling.",
          "Using high-order polynomial extrapolation with noisy data, which can cause Runge's phenomenon and wildly unphysical extrapolated values."
        ],
        "checkQuestion": "How does Zero-Noise Extrapolation (ZNE) estimate the zero-noise energy value on physical quantum hardware?",
        "checkAnswer": "By intentionally scaling up the hardware noise (e.g. by gate repetition), measuring the energy at multiple noise levels, and extrapolating mathematically back to zero noise.",
        "nextConnection": "Let's review the most common circuit debugging mistakes encountered when implementing VQE.",
        "qiskitCode": "# Simple Richardson extrapolation in Python\ne_scale1 = -1.08\ne_scale2 = -1.02\ne_zero = 2 * e_scale1 - e_scale2\nprint(f'Extrapolated zero-noise energy: {e_zero:.3f} Ha')"
      },
      {
        "id": "vqe-phase-10",
        "order": 10,
        "title": "Common Circuit Mistakes & Debugging in VQE",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Identify and fix the three most common VQE circuit errors: incorrect reference states, wrong basis rotation gates, and coefficient sign errors.",
        "explanation": "When constructing VQE circuits in Quantum Studio, three bugs account for almost all failed simulations:\n\n1. **Wrong Reference State Initialization**:\nIf your molecule has 2 electrons in 2 orbitals, the reference Hartree-Fock state is $|01\\rangle$ (or $|1100\\rangle$). If you leave the circuit in $|0000\\rangle$, you are simulating a system with **zero electrons**! The optimizer will minimize the energy of a vacuum state instead of the molecule!\n\n2. **Inverted Hamiltonian Signs**:\nNotice that nuclear-nuclear repulsion is positive, while electron-nuclear attraction is negative. If you accidentally enter $-0.181 X_0 X_1$ instead of $+0.181 X_0 X_1$, the optimizer will converge to an unphysical state with the wrong energy.\n\n3. **Basis Rotation Omission When Evaluating Off-Diagonal Terms**:\nTo measure an $X_0 X_1$ term, you **must** apply Hadamard gates to both qubits before measurement. If you omit the Hadamards, you measure $Z_0 Z_1$ instead of $X_0 X_1$, calculating completely wrong energies.",
        "math": "Verification checklist:\n$$\\text{Check 1: Hartree-Fock init} = X \\text{ gates on occupied spin orbitals}$$\n$$\\text{Check 2: Pauli rotation} = H \\text{ for } X, \\quad S^\\dagger H \\text{ for } Y$$\n$$\\text{Check 3: Total Energy} = \\sum c_k \\langle P_k \\rangle + V_{nn}$$",
        "circuitConnection": "In QubitLab, check your initialization column: verify that Pauli X gates are placed on the wires corresponding to occupied Hartree-Fock orbitals.",
        "visualIntuition": "Setting up VQE without the Hartree-Fock state is like baking bread but forgetting to put flour in the bowl—no matter how long you bake it, you won't get bread.",
        "example": "Symptom: Energy converges to 0.00 Ha instead of -1.137 Ha. Diagnosis: Check column 0. There were no $X$ gates to create the electrons. Adding $X$ to $q_0$ initializes the electron, restoring correct convergence.",
        "commonMistakes": [
          "Forgetting to measure all terms in the Hamiltonian.",
          "Using un-normalized parameter steps."
        ],
        "checkQuestion": "What happens if a student forgets to prepare the Hartree-Fock reference state (e.g. leaving qubits in |0000⟩) before running a molecular VQE circuit?",
        "checkAnswer": "The circuit simulates a vacuum with zero electrons rather than the molecule, resulting in completely unphysical energy estimates near zero.",
        "nextConnection": "Now you are ready to assemble the full VQE algorithm and find the ground state energy of molecular Hydrogen in Quantum Studio!",
        "qiskitCode": "# Correct VQE template with Hartree-Fock state\nfrom qiskit import QuantumCircuit\nqc = QuantumCircuit(2)\n# 1. Prepare Hartree-Fock state |01>\nqc.x(0)\n# 2. Parameterized ansatz (e.g. Ry rotation)\nqc.ry(0.78, 1)\nqc.cx(1, 0)\nprint('VQE ansatz initialized with HF state')"
      },
      {
        "id": "vqe-phase-11",
        "order": 11,
        "title": "Molecular Synthesis: Hydrogen Molecule (H_2)",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Step through the exact 2-qubit circuit implementation for the Hydrogen molecule (H_2) at bond distance R = 0.735 Å.",
        "explanation": "Let's assemble the canonical 2-qubit parity-tapered circuit for molecular Hydrogen ($H_2$) at its equilibrium bond distance $R = 0.735$ Å:\n\nThe Hamiltonian is:\n$$H = c_0 I + c_1 Z_0 + c_2 Z_1 + c_3 Z_0 Z_1 + c_4 X_0 X_1$$\nwith coefficients:\n$$c_0 = -1.052, \\quad c_1 = -0.398, \\quad c_2 = -0.398, \\quad c_3 = -0.011, \\quad c_4 = +0.181$$\n\nThe circuit uses 2 qubits and a single variational parameter $\\theta$:\n1. **Hartree-Fock Preparation**: Apply a Pauli $X$ gate to $q_0$ (state becomes $|10\\rangle$).\n2. **Excitation Rotation**: Apply a single-qubit rotation $R_y(\\theta)$ to $q_0$.\n3. **Entanglement**: Apply a CNOT from $q_0$ to $q_1$.\n4. **Superposition**: The state is $\\cos(\\theta/2)|10\\rangle + \\sin(\\theta/2)|01\\rangle$.\n\nWhen $\\theta = 0$, the state is pure Hartree-Fock ($E = -1.117$ Ha). As $\\theta$ is tuned to the optimal angle $\\theta^* \\approx 0.38$ radians, electron correlation is incorporated, reaching the exact ground-state energy $E_0 = -1.137$ Hartree (100% Full Configuration Interaction accuracy!).",
        "math": "Analytical energy as a function of $\\theta$:\n$$E(\\theta) = c_0 + (c_1 - c_2)\\cos\\theta - c_3 \\cos^2\\theta + c_4 \\sin\\theta$$\nMinimizing with respect to $\\theta$ yields $\\theta^* \\approx 0.38$ radians and $E(\\theta^*) = -1.1373$ Hartree.",
        "circuitConnection": "In QubitLab, build this 3-gate circuit: $X(q_0)$, $R_y(\\theta)$ on $q_0$, and $\\text{CNOT}(q_0 \\to q_1)$.",
        "visualIntuition": "The angle $\\theta$ controls the mixing between the single configuration (Hartree-Fock) and the doubly-excited electron configuration.",
        "example": "With $\\theta = 0.38$ rad: measurement counts show 96.4% on $|10\\rangle$ and 3.6% on $|01\\rangle$, capturing the precise quantum mechanical electron correlation of the covalent chemical bond!",
        "commonMistakes": [
          "Setting $\\theta = 0$, which ignores electron correlation.",
          "Applying the $R_y$ gate to $q_1$ instead of $q_0$."
        ],
        "checkQuestion": "What is the physical meaning of the 3.6% amplitude in the state |01⟩ in the ground state of H_2?",
        "checkAnswer": "It represents electron correlation: the probability that both electrons have simultaneously excited into the anti-bonding molecular orbital.",
        "nextConnection": "Now you are ready to execute the full VQE simulation in Quantum Studio and earn your Mission 09 XP!",
        "qiskitCode": "# 2-qubit H2 VQE circuit\nfrom qiskit import QuantumCircuit\nqc = QuantumCircuit(2)\ntheta = 0.38\nqc.x(0)         # Hartree-Fock |10>\nqc.ry(theta, 0) # Variational parameter\nqc.cx(0, 1)     # Entanglement\nprint(qc)"
      },
      {
        "id": "vqe-phase-12",
        "order": 12,
        "title": "Full VQE Workflow & Mission Synthesis",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Execute the full VQE optimization loop in Quantum Studio, achieve chemical accuracy for H_2, and claim your Mission 09 XP.",
        "explanation": "Congratulations! You have mastered the complete variational principles of quantum chemistry on quantum computers.\n\nLet's review the complete VQE workflow:\n1. **Fermionic Definition**: Specify atomic coordinates, calculate molecular integrals, and map fermions to Pauli strings via Jordan-Wigner.\n2. **Ansatz Wiring**: Construct a parameterized quantum circuit initialized in the Hartree-Fock state.\n3. **Measurement Loop**: Measure Pauli string observables with appropriate basis rotations to evaluate $\\langle H \\rangle_\\theta$.\n4. **Classical Minimization**: Use classical optimization (COBYLA) to iteratively update angles $\\theta$ downhill.\n5. **Convergence**: Reach the ground-state energy within chemical accuracy ($1.6$ milli-Hartree) of the true physical value.\n\nEnter Quantum Studio now to build your VQE circuit, tune the variational angle, verify the ground-state energy of $H_2$, and claim your Quantum Optimization Scientist badge for Mission 09!",
        "math": "Final verification target for $H_2$ at $R=0.735$ Å:\n$$|E_{\\text{measured}} - E_{\\text{exact}}| \\le 0.0016 \\text{ Hartree}$$\n$$E_{\\text{exact}} = -1.1373 \\text{ Hartree}$$\nSatisfying this criterion proves chemical accuracy on the quantum simulator!",
        "circuitConnection": "In QubitLab, Mission 09 requires you to tune $\\theta$ until the energy gauge turns green, indicating chemical accuracy has been achieved.",
        "visualIntuition": "Watch the energy dial in QubitLab drop from $-1.05$ Ha down into the green target zone at $-1.137$ Ha as you refine the parameter slider.",
        "example": "Running the automated optimizer in Quantum Studio: initial energy is $-1.052$ Ha. After 8 iterations, the parameter reaches $\\theta = 0.382$ rad and the energy stabilizes at $-1.1371$ Ha (error $= 0.0002$ Ha, well within chemical accuracy!).",
        "commonMistakes": [
          "Stopping optimization when the energy is in the yellow warning zone.",
          "Failing to record the final converged parameter value."
        ],
        "checkQuestion": "What is the primary commercial and scientific application of large-scale fault-tolerant VQE in the future?",
        "checkAnswer": "Designing novel chemical catalysts (e.g. for nitrogen fixation / fertilizer production), room-temperature superconductors, and targeted pharmaceutical drug candidates.",
        "nextConnection": "Proceed to Quantum Studio to build your VQE circuit and advance to Level 10: Shor's Factoring Algorithm!",
        "qiskitCode": "# Ready to simulate in Quantum Studio\nprint('VQE Mission 09 ready for Quantum Studio simulation!')"
      }
    ]
  },
  "shor": {
    "projectId": "shor",
    "algorithm": "Shor's Factoring Algorithm",
    "overview": "Factor composite integers N = p · q in polynomial time O((log N)³) by reducing factoring to order finding, using quantum parallelism and the Inverse QFT.",
    "difficulty": "Expert",
    "totalDuration": "80 min",
    "phases": [
      {
        "id": "shor-phase-1",
        "order": 1,
        "title": "Integer Factorization & The RSA Cryptosystem",
        "duration": "6 min",
        "xp_reward": 50,
        "objective": "Understand the integer factorization problem, the mathematical foundation of RSA cryptography, and why classical algorithms scale sub-exponentially.",
        "explanation": "Modern global cybersecurity, e-commerce, and encrypted communications rely heavily on public-key cryptosystems like **RSA** (invented by Rivest, Shamir, and Adleman in 1977). RSA's security is predicated on the mathematical asymmetry of multiplication versus factoring:\n- Multiplying two large prime numbers $p$ and $q$ to produce $N = p \\cdot q$ takes a fraction of a millisecond on any computer.\n- However, given only the composite integer $N$, finding the prime factors $p$ and $q$ is extraordinarily difficult for classical computers!\n\nThe best known classical factoring algorithm is the **General Number Field Sieve (GNFS)**, which has sub-exponential time complexity:\n$$T_{\\text{classical}} = \\mathcal{O}\\left( \\exp\\left( \\left( \\sqrt[3]{\\frac{64}{9}} + o(1) \\right) (\\ln N)^{1/3} (\\ln \\ln N)^{2/3} \\right) \\right)$$\nFor a standard RSA-2048 key (a 617-digit number $N$), factoring with classical supercomputers would require billions of years.\n\nIn 1994, Peter Shor stunned the world by proving that a quantum computer can factor large integers in **polynomial time**: $\\mathcal{O}((\\log N)^3)$! This turns an intractable billion-year problem into a computation taking just a few hours.",
        "math": "Complexity comparison for factoring an $n$-bit integer ($n = \\log_2 N$):\n$$\\text{Classical (GNFS)} = \\mathcal{O}\\left( e^{c n^{1/3} (\\log n)^{2/3}} \\right) \\quad (\\text{Sub-exponential})$$\n$$\\text{Shor's Quantum Algorithm} = \\mathcal{O}(n^3) \\quad (\\text{Polynomial})$$\nFor $n = 2048$: classical GNFS requires $\\approx 10^{30}$ operations; Shor's algorithm requires roughly $(2048)^3 \\approx 8.5 \\times 10^9$ operations!",
        "circuitConnection": "In QubitLab, we simulate the educational instance of Shor's algorithm for factoring $N = 15 = 3 \\times 5$ using a 4-qubit target register and a control register.",
        "visualIntuition": "Imagine mixing yellow and blue paint to make green paint. Mixing is effortless (multiplication). Un-mixing green paint back into separate yellow and blue paint drops is virtually impossible classically (factoring). Shor's algorithm is the quantum centrifuge that un-mixes the paint.",
        "example": "For $N = 15$: classical inspection easily finds $15 = 3 \\times 5$. For $N = 3233$: classical factoring finds $3233 = 61 \\times 53$. For a 2048-bit $N$, classical factoring fails entirely.",
        "commonMistakes": [
          "Believing Shor's algorithm searches through all prime numbers one by one. Shor's algorithm does NOT search through primes; it transforms factoring into a **period-finding** problem using modular arithmetic.",
          "Thinking current quantum computers can crack RSA-2048 today. Factoring RSA-2048 requires millions of noisy physical qubits with quantum error correction; current NISQ hardware can only factor small numbers like 15 or 21."
        ],
        "checkQuestion": "What is the time complexity of Shor's quantum factoring algorithm as a function of the number of bits n = log2(N)?",
        "checkAnswer": "O(n³) (or O((log N)³)), which is polynomial time.",
        "nextConnection": "How did Shor transform factoring into something a quantum computer can solve? The answer is Modular Arithmetic and Order Finding.",
        "qiskitCode": "# Classical factoring difficulty demo\nimport math\nN = 15\n# Classical brute force checking odd numbers:\nfor p in range(3, int(math.isqrt(N)) + 1, 2):\n    if N % p == 0:\n        print(f'{N} factors into {p} * {N // p}')"
      },
      {
        "id": "shor-phase-2",
        "order": 2,
        "title": "Reduction of Factoring to Order Finding",
        "duration": "6 min",
        "xp_reward": 50,
        "objective": "Understand how number theory reduces the problem of factoring N to finding the period (order) r of the modular function f(x) = a^x mod N.",
        "explanation": "Peter Shor's brilliant insight was connecting factoring to a well-known theorem in number theory: **order finding** in modular arithmetic.\n\nHere is how the reduction works:\n1. Choose a random integer $a$ such that $1 < a < N$.\n2. Compute the greatest common divisor $\\gcd(a, N)$ using Euclid's classical algorithm (which takes milliseconds). If $\\gcd(a, N) > 1$, we got lucky and found a factor immediately! Otherwise, $\\gcd(a, N) = 1$, meaning $a$ and $N$ are co-prime.\n3. Consider the modular exponential sequence:\n$$f(x) = a^x \\pmod N \\quad \\text{for } x = 0, 1, 2, 3, \\dots$$\nBecause the remainder modulo $N$ can only take values between $1$ and $N-1$, this sequence MUST eventually repeat itself! The smallest positive integer $r$ such that:\n$$a^r \\equiv 1 \\pmod N$$\nis called the **order** (or **period**) of $a$ modulo $N$.\n\nFinding $r$ on a classical computer is just as hard as factoring! But if we can find $r$, we can factor $N$ easily using simple classical algebra!",
        "math": "The modular order definition:\n$$a^r \\equiv 1 \\pmod N \\implies a^r - 1 \\equiv 0 \\pmod N$$\nRewrite as a difference of squares if $r$ is even:\n$$(a^{r/2} - 1)(a^{r/2} + 1) \\equiv 0 \\pmod N$$\nThis means that $N$ divides $(a^{r/2}-1)(a^{r/2}+1)$. Therefore, the factors of $N$ must share common divisors with these two terms!",
        "circuitConnection": "The quantum portion of Shor's algorithm is dedicated entirely to one single task: finding this unknown period $r$.",
        "visualIntuition": "Think of a clock with $N$ hours. You take steps of size $a^x$. Because the clock face is circular, your footprints eventually land back on 12 o'clock. The number of steps between repeats is the period $r$.",
        "example": "Let $N = 15$ and choose $a = 7$:\n- $7^0 = 1 \\equiv 1 \\pmod{15}$\n- $7^1 = 7 \\equiv 7 \\pmod{15}$\n- $7^2 = 49 = 3(15) + 4 \\equiv 4 \\pmod{15}$\n- $7^3 = 7 \\times 4 = 28 \\equiv 13 \\pmod{15}$\n- $7^4 = 7 \\times 13 = 91 = 6(15) + 1 \\equiv 1 \\pmod{15}$!\nThe sequence repeats: 1, 7, 4, 13, 1, 7, 4, 13... The period is $r = 4$!",
        "commonMistakes": [
          "Choosing $a$ that shares a factor with $N$. If $\\gcd(a, N) > 1$, Euclid's algorithm finds the factor without needing a quantum computer at all.",
          "Confusing the period $r$ with the factor $p$. The period $r$ is an intermediate stepping stone, not the final factor."
        ],
        "checkQuestion": "For N = 15 and base a = 2, what is the sequence of powers 2^x mod 15 for x = 0, 1, 2, 3, 4, and what is the period r?",
        "checkAnswer": "The sequence is 1, 2, 4, 8, 1... The period is r = 4 (since 2^4 = 16 ≡ 1 mod 15).",
        "nextConnection": "Once we have found the period r, how do we extract the actual prime factors p and q? Let's analyze the Euclid GCD step.",
        "qiskitCode": "# Finding period r classically\ndef find_period_classical(a, N):\n    for r in range(1, N):\n        if pow(a, r, N) == 1:\n            return r\nprint('Period of 7 mod 15:', find_period_classical(7, 15))"
      },
      {
        "id": "shor-phase-3",
        "order": 3,
        "title": "Recovering Prime Factors: gcd(a^(r/2) ± 1, N)",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Understand how an even period r yields non-trivial factors of N by computing gcd(a^(r/2) - 1, N) and gcd(a^(r/2) + 1, N).",
        "explanation": "Suppose we have successfully found the period $r$. How do we find the prime factors $p$ and $q$ of $N$?\n\nIf the period $r$ satisfies two conditions:\n1. $r$ is an **even number** ($r \\pmod 2 = 0$)\n2. $a^{r/2} + 1 \\not\\equiv 0 \\pmod N$ (i.e. $a^{r/2} \\not\\equiv -1 \\pmod N$)\n\nThen we can factor the difference of squares:\n$$a^r - 1 = (a^{r/2} - 1)(a^{r/2} + 1) = k N = k (p \\cdot q)$$\nBecause neither $(a^{r/2}-1)$ nor $(a^{r/2}+1)$ is a multiple of $N$ by itself, $p$ must divide one term, and $q$ must divide the other!\n\nTherefore, we can compute the greatest common divisor using Euclid's classical algorithm:\n$$p = \\gcd(a^{r/2} - 1, N) \\quad \\text{and} \\quad q = \\gcd(a^{r/2} + 1, N)$$\nEuclid's algorithm runs in $\\mathcal{O}((\\log N)^2)$ steps on a classical computer, revealing the prime factors instantly!",
        "math": "Euclid's GCD factoring equations:\n$$p = \\gcd(a^{r/2} - 1, N)$$\n$$q = \\gcd(a^{r/2} + 1, N)$$\nNumber theory guarantees that for a randomly chosen $a$, the probability that $r$ is even and $a^{r/2} \\not\\equiv -1 \\pmod N$ is at least $1 - 1/2^k \\ge 50\\%$. If it fails, we simply pick a new random $a$ and try again!",
        "circuitConnection": "In QubitLab, the classical post-processing panel takes the measured period $r$ and calculates these two GCDs automatically.",
        "visualIntuition": "Imagine cracking a lock by finding its harmonic resonance frequency. Once the frequency $r$ is known, you split the wave into two halves ($r/2$), and both halves unlock the two deadbolts ($p$ and $q$).",
        "example": "For $N = 15$ with $a = 7$: we found $r = 4$.\n1. Is $r$ even? Yes: $r/2 = 2$.\n2. Compute $a^{r/2} = 7^2 = 49$.\n3. Factor 1: $\\gcd(49 - 1, 15) = \\gcd(48, 15) = \\mathbf{3}$!\n4. Factor 2: $\\gcd(49 + 1, 15) = \\gcd(50, 15) = \\mathbf{5}$!\nWe factored $15 = 3 \\times 5$!",
        "commonMistakes": [
          "Giving up if $r$ is odd. If $r$ is odd, simply choose a different random base $a$. On average, fewer than 2 random choices of $a$ are needed.",
          "Assuming $\\gcd$ calculation is slow. The Euclidean algorithm has been known since 300 BC and is one of the fastest classical algorithms in existence."
        ],
        "checkQuestion": "For N = 15 and base a = 2 with period r = 4, what are the two factors recovered by gcd(2^(4/2) - 1, 15) and gcd(2^(4/2) + 1, 15)?",
        "checkAnswer": "gcd(2² - 1, 15) = gcd(3, 15) = 3, and gcd(2² + 1, 15) = gcd(5, 15) = 5.",
        "nextConnection": "Now we see why period finding is the key! How does a quantum computer find the period r exponentially faster than a classical computer? Let's enter the quantum circuit.",
        "qiskitCode": "# Classical GCD factor recovery in Python\nimport math\nN = 15; a = 7; r = 4\np = math.gcd(a**(r//2) - 1, N)\nq = math.gcd(a**(r//2) + 1, N)\nprint(f'Factors of {N}: {p} and {q}')"
      },
      {
        "id": "shor-phase-4",
        "order": 4,
        "title": "Quantum Parallelism & Modular Exponentiation State",
        "duration": "6 min",
        "xp_reward": 50,
        "objective": "Understand the two-register quantum state |x⟩|a^x mod N⟩ and how quantum parallelism evaluates the modular function across all inputs simultaneously.",
        "explanation": "Shor's quantum circuit uses two separate quantum registers:\n1. **Control Register (Clock)**: An $m$-qubit register ($m = 2n$ qubits to ensure sufficient precision) initialized to $|0\\dots0\\rangle$ and put into equal superposition using Hadamards: $\\frac{1}{\\sqrt{2^m}} \\sum_{x=0}^{2^m-1} |x\\rangle$.\n2. **Target Register**: An $n$-qubit register initialized to $|1\\rangle = |00\\dots01\\rangle$, which will store the modular powers $a^x \\pmod N$.\n\nA reversible quantum modular exponentiation circuit $U_a$ is applied across both registers:\n$$U_a |x\\rangle |1\\rangle = |x\\rangle |a^x \\pmod N\\rangle$$\n\nBy quantum parallelism, this single physical operation evaluates the modular exponential function for all $2^m$ inputs simultaneously:\n$$|\\psi_1\\rangle = \\frac{1}{\\sqrt{2^m}} \\sum_{x=0}^{2^m-1} |x\\rangle |a^x \\pmod N\\rangle$$\n\nThe control register now contains a massive superposition of all exponents $x$, entangled with their modular evaluations $a^x \\pmod N$ in the target register!",
        "math": "The entangled two-register state:\n$$|\\psi_1\\rangle = \\frac{1}{\\sqrt{2^m}} \\sum_{x=0}^{2^m-1} |x\\rangle |a^x \\pmod N\\rangle$$\nBecause $a^{x+r} \\equiv a^x \\pmod N$, the target register values repeat periodically with period $r$.",
        "circuitConnection": "In QubitLab, the top wires represent the control register (measuring phase), while the bottom wires represent the target register running modular multiplication.",
        "visualIntuition": "Imagine an infinite film strip. The top track lists frame numbers $0, 1, 2, 3\\dots$ The bottom track prints the repeating repeating pattern of colors $1, 7, 4, 13, 1, 7, 4, 13\\dots$",
        "example": "For $N=15, a=7$ with a 3-qubit control register (values 0 to 7):\n$$|\\psi_1\\rangle = \\frac{1}{\\sqrt{8}}\\Big( |0\\rangle|1\\rangle + |1\\rangle|7\\rangle + |2\\rangle|4\\rangle + |3\\rangle|13\\rangle + |4\\rangle|1\\rangle + |5\\rangle|7\\rangle + |6\\rangle|4\\rangle + |7\\rangle|13\\rangle \\Big)$$",
        "commonMistakes": [
          "Attempting to compute $a^x$ by repeated addition. In quantum circuits, modular exponentiation is decomposed into controlled modular multiplication gates: $a^x = a^{\\sum x_i 2^i} = \\prod (a^{2^i})^{x_i}$.",
          "Measuring the control register before the target register or before QFT. This collapses the state to a single random point."
        ],
        "checkQuestion": "In Shor's algorithm, what state is stored in the target register when the control register is in basis state |x⟩?",
        "checkAnswer": "|a^x mod N⟩ (the value of a raised to the power x modulo N).",
        "nextConnection": "Now we measure the target register: what happens to the control register when the target collapses?",
        "qiskitCode": "# State expansion for a=7 mod 15\nfor x in range(8):\n    print(f'|{x}> |{pow(7, x, 15)}>')"
      },
      {
        "id": "shor-phase-5",
        "order": 5,
        "title": "Target Register Measurement & Periodic Comb Isolation",
        "duration": "6 min",
        "xp_reward": 50,
        "objective": "Understand how measuring the target register isolates a periodic Dirac comb of states |x_0 + k · r⟩ in the control register.",
        "explanation": "We now measure the $n$-qubit target register.\n\nSuppose the target register collapses to some particular modular value, say $a^{x_0} \\pmod N$ (for instance, the value '4').\n\nWhich values of $x$ in the control register were associated with this output? All values of $x$ that evaluate to that exact same remainder!\nBecause $f(x) = a^x \\pmod N$ has period $r$, the matching exponents in the control register are:\n$$x = x_0, \\quad x_0 + r, \\quad x_0 + 2r, \\quad x_0 + 3r, \\dots$$\n\nTherefore, after measuring the target register, the control register collapses into a **periodic superposition** (a 'Dirac comb') with period $r$:\n$$|\\psi_2\\rangle = \\frac{1}{\\sqrt{K}} \\sum_{k=0}^{K-1} |x_0 + k \\cdot r\\rangle$$\n\nNotice that the offset $x_0$ is completely random and useless. But the **spacing between the peaks is exactly the secret period $r$**! We have created a periodic quantum wave whose frequency is $1/r$!",
        "math": "Post-measurement state of the control register:\n$$|\\psi_2\\rangle = \\frac{1}{\\sqrt{K}} \\sum_{k=0}^{K-1} |x_0 + k \\cdot r\\rangle$$\nwhere $K \\approx 2^m / r$ is the number of periodic spikes. This is a periodic wave with period $r$.",
        "circuitConnection": "In QubitLab, the target register wires show measurement meters. The control register retains the periodic superposition.",
        "visualIntuition": "Imagine a picket fence where the pickets are spaced apart by distance $r$. Measuring the target register tells you that you are looking at a picket fence, but its exact location is shifted by $x_0$.",
        "example": "For $N=15, a=7, r=4$: If the target measures '4' (which corresponds to $x=2$), the control register collapses to $\\frac{1}{\\sqrt{2}}(|2\\rangle + |6\\rangle)$—two states separated by exactly $r = 4$!",
        "commonMistakes": [
          "Measuring the control register right now! If you measure the control register now, you get a single random value ($x_0 + k r$), which tells you nothing about $r$! You must apply the Inverse QFT first to extract the frequency.",
          "Thinking the measurement of the target register is physically required. In fact, even if you never physically measure the target register, tracing it out mathematically produces the identical reduced density matrix!"
        ],
        "checkQuestion": "What is the mathematical structure of the state left in the control register after the target register is measured?",
        "checkAnswer": "A periodic superposition (Dirac comb) of basis states |x_0 + k · r⟩ spaced apart by the exact period r.",
        "nextConnection": "How do we extract the period r from this periodic wave? We apply the Inverse Quantum Fourier Transform!",
        "qiskitCode": "# Periodic comb simulation\nK = 2\nx0 = 2\nr = 4\ncomb = [x0 + k * r for k in range(K)]\nprint('Periodic comb states in control register:', comb)"
      },
      {
        "id": "shor-phase-6",
        "order": 6,
        "title": "Phase Estimation & Inverse QFT (QFT†)",
        "duration": "6 min",
        "xp_reward": 50,
        "objective": "Understand how applying QFT† to the periodic comb converts spatial periodicity r into sharp measurement spikes at multiples of 2^m / r.",
        "explanation": "In signal processing, taking the Fourier transform of a periodic wave with period $r$ produces a frequency spectrum with sharp peaks at integer multiples of the fundamental frequency:\n$$f = \\frac{1}{r}$$\n\nThis is precisely what the **Inverse Quantum Fourier Transform ($QFT^\\dagger$)** does to our control register!\n\nWhen we apply $QFT^\\dagger$ to the periodic state $|\\psi_2\\rangle = \\frac{1}{\\sqrt{K}} \\sum_k |x_0 + k r\\rangle$:\n- For values of $y$ that are close to integer multiples of $\\frac{2^m}{r}$, the probability amplitudes interfere **constructively**, producing sharp peaks!\n- For all other values of $y$, the probability amplitudes cancel **destructively** to near zero!\n\nThe state after $QFT^\\dagger$ is:\n$$|\\psi_3\\rangle = \\text{QFT}^\\dagger |\\psi_2\\rangle \\approx \\frac{1}{\\sqrt{r}} \\sum_{s=0}^{r-1} e^{i \\phi_s} \\left| s \\cdot \\frac{2^m}{r} \\right\\rangle$$\n\nWhen we measure the control register, we are guaranteed to observe a measured integer $y$ that is very close to:\n$$y \\approx s \\cdot \\frac{2^m}{r}$$\nfor some integer $s \\in \\{0, 1, \\dots, r-1\\}$!",
        "math": "Interference peak condition:\n$$\\frac{y}{2^m} \\approx \\frac{s}{r}$$\nNotice that dividing the measured integer $y$ by $2^m$ gives an estimate of the rational fraction $s/r$!",
        "circuitConnection": "In QubitLab, the control register passes through an Inverse QFT block immediately followed by measurement meters.",
        "visualIntuition": "Imagine shining laser light through a diffraction grating (our periodic comb of states). The light interferes to produce a series of bright, sharp diffraction dots on the screen. The spacing of the dots reveals the grating spacing $r$.",
        "example": "For $m=3$ ($2^3 = 8$) and period $r=4$: $\\frac{2^m}{r} = \\frac{8}{4} = 2$. The measured values $y$ will be multiples of 2: $0, 2, 4,$ or $6$ ($s = 0, 1, 2, 3$).",
        "commonMistakes": [
          "Expecting the measurement to yield $r$ directly. The measurement yields an integer $y \\approx s \\frac{2^m}{r}$. You must divide by $2^m$ to extract $r$ using continued fractions!",
          "Using forward QFT instead of Inverse QFT."
        ],
        "checkQuestion": "What rational fraction is approximated when you divide the measured control register integer y by 2^m?",
        "checkAnswer": "The fraction s/r, where r is the secret period and s is a random integer between 0 and r-1.",
        "nextConnection": "How do we recover the exact fraction s/r from our floating-point measurement y/2^m? We use the Continued Fractions Algorithm.",
        "qiskitCode": "# Peak locations for m=8, r=4\nm = 8\nr = 4\npeaks = [s * (2**m // r) for s in range(r)]\nprint('Measurement peaks in control register:', peaks)"
      },
      {
        "id": "shor-phase-7",
        "order": 7,
        "title": "Classical Post-Processing: Continued Fractions Algorithm",
        "duration": "6 min",
        "xp_reward": 50,
        "objective": "Use the classical Continued Fractions Algorithm to efficiently determine the denominator r from the measured phase estimate y / 2^m.",
        "explanation": "When we measure the control register, we obtain an integer $y$. We compute the phase estimate:\n$$\\phi = \\frac{y}{2^m} \\approx \\frac{s}{r}$$\n\nBecause $2^m$ is typically not an exact multiple of $r$, $\\phi$ is a floating-point number. How do we find the unknown integers $s$ and $r$ from this decimal number?\n\nWe use the classical **Continued Fractions Algorithm**! Any real number $\\phi$ can be uniquely expressed as an continued fraction:\n$$\\phi = a_0 + \\cfrac{1}{a_1 + \\cfrac{1}{a_2 + \\cfrac{1}{a_3 + \\dots}}}$$\nTruncating this fraction at successive steps produces rational approximations $p_k / q_k$ called **convergents**.\n\nA celebrated theorem in Diophantine approximation states that if $\\left| \\phi - \\frac{s}{r} \\right| < \\frac{1}{2 r^2}$ (which is guaranteed by setting $m \\ge 2n$), then the true fraction $\\frac{s}{r}$ is **guaranteed to be one of the convergents** $p_k / q_k$!\n\nThe denominator $q_k$ of this convergent is our period $r$!",
        "math": "Convergents of continued fraction:\n$$\\frac{p_0}{q_0} = a_0, \\quad \\frac{p_1}{q_1} = a_0 + \\frac{1}{a_1} = \\frac{a_0 a_1 + 1}{a_1}, \\quad \\dots$$\nIf $\\left| \\frac{y}{2^m} - \\frac{s}{r} \\right| \\le \\frac{1}{2^{m+1}} \\le \\frac{1}{2 r^2}$, then $\\frac{s}{r} = \\frac{p_k}{q_k}$ for some convergent $k$.",
        "circuitConnection": "In QubitLab, the post-processing module runs continued fractions on the measurement histogram in real time, extracting candidate denominators $r$.",
        "visualIntuition": "Think of continued fractions as a high-precision zoom lens. Each zoom level finds the simplest fraction that fits within the focus ring, landing precisely on $s/r$.",
        "example": "Suppose $m=8$ ($2^8 = 256$) and we measure $y = 64$. We compute $\\phi = 64 / 256 = 0.25$. The continued fraction expansion of $0.25$ is $\\frac{1}{4}$. The denominator is $r = 4$!",
        "commonMistakes": [
          "Assuming $s$ and $r$ can share common factors. If $\\gcd(s, r) > 1$, the fraction $s/r$ cancels to lowest terms (e.g. $2/4 = 1/2$), yielding a factor of $r$ ($r'=2$). Running the algorithm a second time resolves this.",
          "Using insufficient control qubits ($m < 2n$), which violates the condition $\\left| \\phi - s/r \\right| < 1/(2r^2)$."
        ],
        "checkQuestion": "What mathematical guarantee ensures that the true period r will appear as a denominator in the continued fraction expansion of y/2^m?",
        "checkAnswer": "The Diophantine approximation theorem: when m ≥ 2n, |y/2^m - s/r| < 1/(2r²), which guarantees that s/r is one of the continued fraction convergents.",
        "nextConnection": "Let's examine the failure modes of Shor's algorithm and how classical repetition handles them.",
        "qiskitCode": "# Continued fractions in Python\nfrom fractions import Fraction\ny = 64; m = 8\nphi = y / (2**m)\nfrac = Fraction(phi).limit_denominator(15)\nprint(f'Measured y={y}: Fraction={frac}, Candidate r={frac.denominator}')"
      },
      {
        "id": "shor-phase-8",
        "order": 8,
        "title": "Handling Failure Modes & Success Probability",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Understand the three failure modes of Shor's algorithm (s = 0, r is odd, trivial factors) and why a few repetitions guarantee success.",
        "explanation": "Shor's algorithm is a bounded-error randomized algorithm (BQP). A single execution can fail for one of three reasons:\n\n1. **$s = 0$ (Zero Measurement)**: If the control register measures $y = 0$, $\\phi = 0/2^m = 0$, which gives no information about $r$.\n2. **Odd Period $r$**: If the recovered period $r$ is an odd number, we cannot divide it by 2 to compute $a^{r/2} \\pm 1$.\n3. **Trivial Factor**: Even if $r$ is even, $a^{r/2} + 1$ might be a multiple of $N$ ($a^{r/2} \\equiv -1 \\pmod N$), yielding $\\gcd(a^{r/2} + 1, N) = N$, which produces only the trivial factor $N$ itself.\n\nWhat do we do if any of these occur?\nWe simply **pick a new random base $a$ and run the circuit again**!\nNumber theory proves that for any composite integer $N$ that is not a prime power, at least $50\\%$ of all co-prime bases $a$ yield an even period $r$ with non-trivial factors. Therefore, running the algorithm just 3 or 4 times reduces the failure probability to less than $5\\%$!",
        "math": "Success probability per trial for random base $a$:\n$$P(\\text{success}) \\ge 1 - \\frac{1}{2^{k-1}} \\ge \\frac{1}{2}$$\nwhere $k$ is the number of distinct prime factors of $N$.\nProbability of failing $T$ trials in a row:\n$$P_{\\text{fail}}(T) \\le \\left(\\frac{1}{2}\\right)^T$$\nFor $T = 5$ trials: $P_{\\text{fail}} \\le 1/32 \\approx 3.1\\%$.",
        "circuitConnection": "In QubitLab, if a trial yields a trivial factor, clicking 'Re-roll Base a' updates the circuit with a new base $a$ automatically.",
        "visualIntuition": "Imagine rolling a die where numbers 1, 2, 3 give you the password, and 4, 5, 6 say 'try again'. You just roll again until you get the password.",
        "example": "For $N = 15$: if you pick $a = 14$, $14 \\equiv -1 \\pmod{15}$, so $r = 2$. Then $a^{r/2} + 1 = 14 + 1 = 15 \\equiv 0 \\pmod{15}$ (trivial factor). Discard $a = 14$, pick $a = 7$, and succeed immediately!",
        "commonMistakes": [
          "Trying to factor prime powers $N = p^k$ with Shor's algorithm. Prime powers can be detected and factored in polynomial time by a simple classical algorithm (taking roots); Shor's algorithm is specifically for products of distinct primes.",
          "Assuming the quantum circuit is broken when a trial fails. Quantum algorithms are probabilistic; failure of an individual shot is an expected part of the protocol."
        ],
        "checkQuestion": "If a single trial of Shor's algorithm has a 50% probability of success, what is the probability of failing 4 trials in a row?",
        "checkAnswer": "(1/2)⁴ = 1/16 = 6.25% (meaning a 93.75% probability of success within 4 trials).",
        "nextConnection": "Let's explore the modular exponentiation circuit gadget: how does quantum hardware compute a^x mod N?",
        "qiskitCode": "# Probability of success after T trials\nfor T in [1, 2, 3, 5, 10]:\n    print(f'Trials T={T}: Success rate >= {1 - 0.5**T:.2%}')"
      },
      {
        "id": "shor-phase-9",
        "order": 9,
        "title": "Circuit Complexity: Modular Exponentiation Gadgets",
        "duration": "6 min",
        "xp_reward": 50,
        "objective": "Understand the circuit decomposition of modular exponentiation into controlled modular multiplication gates and reversible adders.",
        "explanation": "The most computationally demanding portion of Shor's algorithm by far is the **Modular Exponentiation Circuit** $U_a |x\\rangle |1\\rangle = |x\\rangle |a^x \\pmod N\\rangle$.\n\nWhile the QFT requires only $\\mathcal{O}(n^2)$ gates, modular exponentiation accounts for over $99\\%$ of all gates and runtime in Shor's algorithm.\n\nHow is it implemented in quantum hardware?\nWe use the binary decomposition of the exponent $x = \\sum_{i=0}^{m-1} x_i 2^i$:\n$$a^x = a^{\\sum x_i 2^i} = a^{x_0 2^0} \\cdot a^{x_1 2^1} \\cdot a^{x_2 2^2} \\cdots a^{x_{m-1} 2^{m-1}} \\pmod N$$\n\nThis factors the circuit into a sequence of $m$ **Controlled Modular Multipliers**:\n1. Controlled by $q_0$: multiply by $a^1 \\pmod N$\n2. Controlled by $q_1$: multiply by $a^2 \\pmod N$\n3. Controlled by $q_2$: multiply by $a^4 \\pmod N$\n4. $\\dots$ Controlled by $q_{m-1}$: multiply by $a^{2^{m-1}} \\pmod N$\n\nEach controlled multiplier is further decomposed into reversible quantum adders (such as the Draper adder or Cuccaro adder) using Toffoli and CNOT gates.",
        "math": "Modular exponentiation factoring:\n$$U_a = \\prod_{i=0}^{m-1} \\text{C-Mult}\\left( q_i, a^{2^i} \\pmod N \\right)$$\nCircuit complexity:\n$$\\text{Total Gates} = \\mathcal{O}(n^3) \\quad \\text{and} \\quad \\text{Total Qubits} = 2n + \\mathcal{O}(1)$$\nUsing modern optimizations (e.g. Beauregard's algorithm), Shor's algorithm can run with only $2n + 3$ qubits!",
        "circuitConnection": "In QubitLab, the modular multiplier for $a=7 \\pmod{15}$ is implemented using modular SWAP and CNOT permutation networks.",
        "visualIntuition": "Think of a mechanical gear train. Each gear ratio is double the previous gear ($1, 2, 4, 8\\dots$). Engaging a gear (when control qubit is 1) advances the output dial by that exact power.",
        "example": "For $N=15, a=7$:\n- $7^1 \\equiv 7 \\pmod{15}$\n- $7^2 = 49 \\equiv 4 \\pmod{15}$\n- $7^4 = 4^2 = 16 \\equiv 1 \\pmod{15}$\nNotice that $7^4 \\equiv 1$, so any higher power $7^8, 7^{16}\\dots$ is just the identity gate!",
        "commonMistakes": [
          "Computing $a^x$ by multiplying $x$ times in series. That would require exponential $\\mathcal{O}(2^n)$ gates! Repeated squaring allows computation in only $n$ multiplication steps.",
          "Using non-reversible classical adder designs. Every quantum adder must be strictly unitary and reversible."
        ],
        "checkQuestion": "How does repeated squaring reduce the number of modular multiplication steps from 2^n down to n?",
        "checkAnswer": "By factoring a^x into a product of pre-computed powers a^(2^i) mod N, requiring only m = 2n controlled multiplier gates.",
        "nextConnection": "Let's distinguish the educational demonstration of N=15 from industrial-scale RSA-2048 factoring.",
        "qiskitCode": "# Powers of a mod N by repeated squaring\nN = 15; a = 7\nfor i in range(4):\n    power = 2**i\n    val = pow(a, power, N)\n    print(f'a^(2^{i}) = {a}^{power} mod {N} = {val}')"
      },
      {
        "id": "shor-phase-10",
        "order": 10,
        "title": "Educational N = 15 vs. Industrial RSA-2048",
        "duration": "6 min",
        "xp_reward": 50,
        "objective": "Clearly distinguish the educational N=15 demonstration in QubitLab from real-world cryptographic factoring of RSA-2048.",
        "explanation": "It is vital for every quantum computing student to understand the difference between educational toy demonstrations and real-world cryptographic factoring:\n\n**The Educational Instance ($N = 15$)**:\n- In QubitLab and academic research papers (e.g. Vandersypen et al., 2001), factoring $N = 15$ or $N = 21$ is used to verify that the quantum circuit topology, modular multiplication, and QFT interact correctly.\n- It requires only 4 target qubits ($2^4 = 16 > 15$) and 3 to 4 control qubits, running on noisy NISQ hardware or desktop simulators in milliseconds.\n- Many gates can be compiled and simplified because $7^4 \\equiv 1 \\pmod{15}$.\n\n**The Cryptographic Reality (RSA-2048)**:\n- An RSA-2048 modulus has $n = 2048$ bits.\n- Factoring it requires approximately $4,096$ **logical qubits** and $\\approx 2 \\times 10^9$ non-Clifford Toffoli gates.\n- Because physical qubits have gate error rates of $\\approx 10^{-3}$, error correction (surface codes) requires roughly $1,000$ physical qubits per logical qubit!\n- Total requirement: **several million physical qubits**, operating continuously with fault tolerance for several hours. This remains an active global engineering grand challenge.",
        "math": "Resource comparison:\n$$\\begin{array}{l|c|c} \\text{Parameter} & \\text{QubitLab (} N=15 \\text{)} & \\text{RSA-2048} \\\\ \\hline \\text{Modulus bits } n & 4 \\text{ bits} & 2,048 \\text{ bits} \\\\ \\text{Logical qubits} & 7-8 \\text{ qubits} & \\approx 4,096 \\text{ qubits} \\\\ \\text{Physical qubits (surface code)} & 7-8 & \\approx 2-4 \\text{ million} \\\\ \\text{Quantum gates} & \\approx 30 & \\approx 2 \\times 10^9 \\text{ Toffoli} \\end{array}$$",
        "circuitConnection": "QubitLab's mission is an honest educational simulation of $N=15$; it does not pretend to crack military-grade RSA keys.",
        "visualIntuition": "Factoring $N=15$ on a quantum computer is like the Wright Brothers' first 12-second flight at Kitty Hawk. Factoring RSA-2048 is like sending a commercial Boeing 777 across the Pacific Ocean.",
        "example": "In 2001, IBM used an NMR quantum computer to factor $15 = 3 \\times 5$. In 2012, researchers factored 21. Scaling to 2048-bit numbers is the milestone known as Cryptographically Relevant Quantum Computer (CRQC).",
        "commonMistakes": [
          "Believing quantum computers have already broken RSA encryption. No quantum computer in existence today has factored an RSA key larger than small laboratory demonstration numbers.",
          "Assuming post-quantum cryptography is unnecessary today. Because adversaries can store encrypted traffic today to decrypt later ('harvest now, decrypt later'), organizations are already migrating to NIST Post-Quantum Cryptography (PQC) standards (such as ML-KEM / Kyber)."
        ],
        "checkQuestion": "Approximately how many physical qubits are estimated to be required to factor an RSA-2048 key using surface code error correction?",
        "checkAnswer": "Several million physical qubits (typically estimated between 2 million and 4 million physical qubits).",
        "nextConnection": "Let's review the most common circuit assembly bugs when building Shor's algorithm for N=15 in QubitLab.",
        "qiskitCode": "# Comparing key sizes\nimport math\nprint('RSA-2048 bit length:', 2048)\nprint('Smallest factor of N=15:', math.gcd(7**(4//2) - 1, 15))"
      },
      {
        "id": "shor-phase-11",
        "order": 11,
        "title": "Circuit Implementation for N = 15 with a = 7",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Step through the exact gate construction for factoring N=15 using base a=7 on a 7-qubit circuit in Quantum Studio.",
        "explanation": "Let's assemble the complete circuit for factoring $N = 15$ with base $a = 7$:\n\n- **Register Allocation**:\n  - Qubits $q_0, q_1, q_2$: 3-qubit Control Register (Clock)\n  - Qubits $q_3, q_4, q_5, q_6$: 4-qubit Target Register (representing numbers up to 15)\n\n- **Circuit Execution Steps**:\n  1. **Initialization**: Apply a Pauli $X$ gate to $q_3$ so the target register holds $|1\\rangle = |0001\\rangle$.\n  2. **Control Superposition**: Apply $H$ gates to $q_0, q_1, q_2$.\n  3. **Controlled Modular Operations**:\n     - Controlled by $q_0$ (multiplier $7^1 = 7 \\pmod{15}$): implemented using CNOT and SWAP gates.\n     - Controlled by $q_1$ (multiplier $7^2 = 4 \\pmod{15}$): implemented using controlled permutations.\n     - Controlled by $q_2$ (multiplier $7^4 = 1 \\pmod{15}$): this is the identity gate! Qubit $q_2$ needs no gates in the modular multiplier!\n  4. **Inverse QFT**: Apply $QFT^\\dagger$ on control qubits $q_0, q_1, q_2$.\n  5. **Readout**: Measure control qubits $q_0, q_1, q_2$.\n\nThe measured control bits will strictly yield outcomes corresponding to multiples of $2^3 / 4 = 2$: namely $000$ ($0$), $010$ ($2$), $100$ ($4$), or $110$ ($6$).",
        "math": "Measurement probabilities for $N=15, a=7$ with 3 control qubits:\n$$P(y = 0) = 25\\%, \\quad P(y = 2) = 25\\%, \\quad P(y = 4) = 25\\%, \\quad P(y = 6) = 25\\%$$\n- Outcome $y=2 \\implies \\phi = 2/8 = 1/4 \\implies r = 4$.\n- Outcome $y=6 \\implies \\phi = 6/8 = 3/4 \\implies r = 4$.\nBoth non-zero outcomes reveal $r = 4$ directly!",
        "circuitConnection": "In QubitLab, wires $q_0, q_1, q_2$ connect to the Inverse QFT block, and wires $q_3, q_4, q_5, q_6$ hold the target register.",
        "visualIntuition": "Watch the control register wires: after the Inverse QFT, the 8 possible states collapse to exactly 4 evenly spaced measurement spikes.",
        "example": "Run 1,000 shots: ~250 counts land on 000, ~250 on 010 (2), ~250 on 100 (4), and ~250 on 110 (6). Measuring '010' gives phase $2/8 = 1/4$, immediately proving period $r=4$!",
        "commonMistakes": [
          "Forgetting the initial $X$ gate on the target register. The target register must start in $|1\\rangle$ (not $|0\\rangle$) because $a^0 = 1$!",
          "Applying Inverse QFT across all 7 qubits. Inverse QFT belongs ONLY on the control qubits ($q_0, q_1, q_2$)."
        ],
        "checkQuestion": "What measurement outcomes on the 3-qubit control register will reveal the period r = 4 for N=15, a=7?",
        "checkAnswer": "Outcomes 010 (integer 2) and 110 (integer 6), because 2/8 = 1/4 and 6/8 = 3/4, giving denominator r = 4.",
        "nextConnection": "Now you are ready to assemble and execute the complete Shor factoring workflow in Quantum Studio!",
        "qiskitCode": "# 7-qubit Shor N=15 circuit skeleton\nfrom qiskit import QuantumCircuit\nqc = QuantumCircuit(7, 3)\n# Target in |1>\nqc.x(3)\n# Controls in |+>\nqc.h([0, 1, 2])\nprint('Shor N=15 circuit initialized')"
      },
      {
        "id": "shor-phase-12",
        "order": 12,
        "title": "Complete Shor Algorithm Workflow & Synthesis",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Synthesize the complete Shor factoring circuit in Quantum Studio, extract the period r=4, factor N=15=3x5, and claim your Mission 10 XP.",
        "explanation": "Congratulations! You have mastered the theoretical, mathematical, and circuit foundations of Shor's Factoring Algorithm.\n\nLet's review the complete end-to-end workflow:\n1. **Classical Setup**: Choose composite integer $N = 15$ and co-prime base $a = 7$. Verify $\\gcd(7, 15) = 1$.\n2. **State Preparation**: Initialize target register to $|1\\rangle$ and apply $H$ gates to the control register.\n3. **Modular Exponentiation**: Apply controlled modular multiplication gates $7^x \\pmod{15}$.\n4. **Phase Extraction**: Apply the Inverse QFT ($QFT^\\dagger$) to the control register to convert the periodic comb into frequency spikes.\n5. **Measurement & Continued Fractions**: Measure the control register, divide by $2^m$, and extract the period $r = 4$.\n6. **Factor Recovery**: Classically compute $\\gcd(7^2 - 1, 15) = 3$ and $\\gcd(7^2 + 1, 15) = 5$.\n\nEnter Quantum Studio now to wire your circuit, run the simulation, factor $N=15$, and claim your Quantum Cryptography Specialist badge for Mission 10!",
        "math": "Final verification equation:\n$$\\gcd(7^{4/2} - 1, 15) = \\gcd(48, 15) = 3$$\n$$\\gcd(7^{4/2} + 1, 15) = \\gcd(50, 15) = 5$$\n$$3 \\times 5 = 15 \\quad \\text{Factored successfully!}$$",
        "circuitConnection": "In QubitLab, Mission 10 tests your circuit, measures the control register, and verifies that the output histogram produces the correct factors.",
        "visualIntuition": "Watch the measurement histogram in QubitLab: peaks at binary 010 and 110 light up, and the factoring banner confirms: 'Success: 15 = 3 x 5'.",
        "example": "Run the circuit in Quantum Studio: within 1 second, the simulator completes the shots, continued fractions resolves $r=4$, Euclid's algorithm returns primes 3 and 5, and Mission 10 is completed.",
        "commonMistakes": [
          "Exceeding the permitted gate count by placing redundant gates.",
          "Failing to connect classical measurement registers."
        ],
        "checkQuestion": "What classical algorithm is used in the final step of Shor's workflow to compute gcd(a^(r/2) ± 1, N)?",
        "checkAnswer": "Euclid's algorithm for finding the greatest common divisor.",
        "nextConnection": "Proceed to Quantum Studio to build your Shor factoring circuit and advance to Level 11: Quantum Error Correction!",
        "qiskitCode": "# Ready to simulate in Quantum Studio\nprint('Shor Factoring Mission 10 ready for Quantum Studio simulation!')"
      }
    ]
  },
  "error-correction": {
    "projectId": "error-correction",
    "algorithm": "Quantum Error Correction (QEC)",
    "overview": "Protect fragile quantum information from environmental decoherence, bit flips, and phase flips without destroying quantum superpositions, using ancilla-based syndrome measurement.",
    "difficulty": "Expert",
    "totalDuration": "75 min",
    "phases": [
      {
        "id": "qec-phase-1",
        "order": 1,
        "title": "Fragility of Quantum States & Environmental Decoherence",
        "duration": "6 min",
        "xp_reward": 50,
        "objective": "Understand quantum noise channels (bit-flip, phase-flip, depolarizing), T1 relaxation time, and T2 dephasing time.",
        "explanation": "Unlike classical digital bits stored in durable magnetic domains or macroscopic transistor voltages with billions of electrons, a quantum bit is an extraordinarily fragile physical system—typically a single microwave photon, a trapped ion, or a superconducting Josephson junction circuit cooled to 15 millikelvin.\n\nAny stray environmental interaction—thermal photons, fluctuating magnetic fields, cosmic rays, or material impurities—perturbs the delicate phase and amplitude of the qubit. This process is called **quantum decoherence**.\n\nTwo fundamental physical timescales characterize qubit decoherence:\n1. **$T_1$ (Energy Relaxation Time)**: The characteristic time it takes for an excited qubit state $|1\\rangle$ to decay to the ground state $|0\\rangle$ by emitting energy to the environment (amplitude damping).\n2. **$T_2$ (Dephasing Time)**: The characteristic time over which relative phase coherence between $|0\\rangle$ and $|1\\rangle$ decays into a classical random mixture without exchanging energy (pure dephasing).\n\nWithout active error correction, quantum errors accumulate exponentially with circuit depth, rendering deep quantum algorithms useless.",
        "math": "A general quantum noise process on density matrix $\\rho$ is represented by Kraus operators $\\{E_k\\}$:\n$$\\mathcal{E}(\\rho) = \\sum_k E_k \\rho E_k^\\dagger, \\quad \\sum_k E_k^\\dagger E_k = I$$\nDecoherence timescales: $T_2 \\le 2 T_1$. On modern superconducting processors, $T_1$ and $T_2$ are typically between $50$ and $300$ microseconds.",
        "circuitConnection": "In QubitLab, noise channels can be simulated by inserting stochastic Pauli errors ($X, Y, Z$) along quantum wires.",
        "visualIntuition": "Imagine balancing an egg on the sharp tip of a needle. Even a microscopic puff of air (thermal fluctuation) causes the egg to wobble, lose balance, and smash on the floor.",
        "example": "If a gate operation takes 50 nanoseconds and $T_2 = 50$ microseconds, a physical qubit can execute roughly 1,000 gates before its quantum phase coherence is completely lost to environmental noise.",
        "commonMistakes": [
          "Assuming classical error correction (like repeating a bit 3 times: $0 \\to 000$) can be directly applied to qubits. The No-Cloning Theorem strictly prevents duplicating unknown quantum states!",
          "Believing quantum errors are strictly discrete (0 or 1). Quantum errors can be continuous rotations (e.g. $R_z(0.01^\\circ)$). Quantum error correction discretizes continuous errors into discrete Pauli syndromes via projection!"
        ],
        "checkQuestion": "What is the physical difference between T1 relaxation time and T2 dephasing time?",
        "checkAnswer": "T1 is the energy relaxation timescale for |1⟩ to decay to |0⟩ (amplitude damping), while T2 is the timescale over which relative quantum phase coherence is lost (dephasing).",
        "nextConnection": "Why can't we simply copy the qubit three times like in classical redundancy? The No-Cloning obstacle.",
        "qiskitCode": "# Concept of Pauli noise channel\nfrom qiskit.quantum_info import Kraus\nprint('Noise channels represented via Kraus operators')"
      },
      {
        "id": "qec-phase-2",
        "order": 2,
        "title": "The Quantum No-Cloning Obstacle",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Understand why the No-Cloning Theorem prevents classical repetition codes and how entanglement resolves this paradox.",
        "explanation": "In classical computing, error correction is conceptually simple: **redundancy**. If you want to protect a classical bit $b \\in \\{0, 1\\}$, you simply copy it three times: $0 \\to 000$ and $1 \\to 111$. If noise flips one bit (e.g. $000 \\to 010$), you take a majority vote ($2$ zeros vs $1$ one) and restore $000$.\n\nWhy can't we do this for a qubit $|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle$?\nBecause of the **No-Cloning Theorem**! There is no unitary operator in quantum mechanics that can clone an unknown state:\n$$|\\psi\\rangle|0\\rangle|0\\rangle \\not\\longrightarrow |\\psi\\rangle|\\psi\\rangle|\\psi\\rangle$$\n\nFurthermore, if you tried to measure the qubit to find out what $\\alpha$ and $\\beta$ are so you could recreate it, the measurement itself would collapse the superposition, destroying the exact quantum information you were trying to protect!\n\n**The Breakthrough Resolution**:\nPeter Shor proved in 1995 that while you cannot *clone* a state, you can **entangle** a single logical qubit across multiple physical qubits: $\\alpha|000\\rangle + \\beta|111\\rangle$! Information is stored non-locally in the joint parity of the qubits, rather than in any individual qubit.",
        "math": "Classical repetition vs. Quantum encoding:\n$$\\text{Classical: } b \\to (b, b, b)$$\n$$\\text{Quantum: } \\alpha|0\\rangle + \\beta|1\\rangle \\longrightarrow \\alpha|000\\rangle + \\beta|111\\rangle = |\\psi_L\\rangle$$\nNotice that $|\\psi_L\\rangle$ is NOT $|\\psi\\rangle|\\psi\\rangle|\\psi\\rangle$ (which would equal $\\alpha^3|000\\rangle + \\dots$). It is an entangled state!",
        "circuitConnection": "In QubitLab, the encoding circuit uses CNOT gates to spread the state of $q_0$ into an entangled 3-qubit logical state.",
        "visualIntuition": "Instead of making 3 photocopies of a secret letter, you tear the letter into 3 jigsaw puzzle pieces. No single piece contains the secret, but putting any 2 pieces together reconstructs the entire letter.",
        "example": "If $|\\psi\\rangle = \\frac{1}{\\sqrt{2}}(|0\\rangle + |1\\rangle)$, classical cloning would require $(|0\\rangle+|1\\rangle)^{\\otimes 3}$. Quantum encoding produces $\\frac{1}{\\sqrt{2}}(|000\\rangle + |111\\rangle)$ (a Greenberger-Horne-Zeilinger [GHZ] state).",
        "commonMistakes": [
          "Believing $\\alpha|000\\rangle + \\beta|111\\rangle$ is equivalent to cloning $|\\psi\\rangle$. The state $|\\psi\\rangle^{\\otimes 3} = (\\alpha|0\\rangle+\\beta|1\\rangle)^{\\otimes 3}$ contains cross-terms like $|001\\rangle$, whereas the encoded logical state has zero cross-terms.",
          "Thinking measuring one qubit leaves the others untouched in an entangled state."
        ],
        "checkQuestion": "What is the mathematical difference between the encoded logical state α|000⟩ + β|111⟩ and three cloned copies |ψ⟩ ⊗ |ψ⟩ ⊗ |ψ⟩?",
        "checkAnswer": "The three cloned copies would contain cross terms like α²β|001⟩, violating linearity. The encoded state is an entangled superposition containing only |000⟩ and |111⟩.",
        "nextConnection": "Now let's examine the 3-qubit bit-flip code and how to build its encoding circuit.",
        "qiskitCode": "from qiskit import QuantumCircuit\nqc = QuantumCircuit(3)\n# Encode |ψ> into α|000> + β|111>\nqc.cx(0, 1)\nqc.cx(0, 2)\nprint('3-qubit bit-flip code encoder compiled')"
      },
      {
        "id": "qec-phase-3",
        "order": 3,
        "title": "The 3-Qubit Bit-Flip Code Encoding",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Master the 3-qubit bit-flip code encoder, mapping logical basis states |0⟩_L = |000⟩ and |1⟩_L = |111⟩ using two CNOT gates.",
        "explanation": "The simplest quantum error-correcting code is the **3-qubit bit-flip code**. It protects a single logical qubit from an unwanted Pauli $X$ (bit-flip) error occurring on any one of the three physical qubits.\n\nThe code defines a two-dimensional code subspace spanned by two orthonormal **logical basis states**:\n- Logical Zero: $|0\\rangle_L = |000\\rangle$\n- Logical One: $|1\\rangle_L = |111\\rangle$\n\nAn arbitrary logical qubit state is encoded as:\n$$|\\psi_L\\rangle = \\alpha |0\\rangle_L + \\beta |1\\rangle_L = \\alpha |000\\rangle + \\beta |111\\rangle$$\n\n**The Encoding Circuit**:\nStarting with the arbitrary message state $|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle$ on data qubit $q_0$ and two auxiliary data qubits in ground state $|0\\rangle$ on $q_1$ and $q_2$:\n1. Apply a CNOT from $q_0$ to $q_1$: $|\\psi\\rangle|00\\rangle \\mapsto \\alpha|000\\rangle + \\beta|110\\rangle$\n2. Apply a CNOT from $q_0$ to $q_2$: $\\mapsto \\alpha|000\\rangle + \\beta|111\\rangle$\n\nWith just two CNOT gates, the logical qubit is fully encoded across 3 physical qubits!",
        "math": "Encoding transformation:\n$$(\\alpha|0\\rangle + \\beta|1\\rangle) \\otimes |00\\rangle \\xrightarrow{\\text{CNOT}_{01}} (\\alpha|00\\rangle + \\beta|11\\rangle) \\otimes |0\\rangle$$\n$$\\xrightarrow{\\text{CNOT}_{02}} \\alpha|000\\rangle + \\beta|111\\rangle = |\\psi_L\\rangle$$\nLogical code distance: $d = 3$ (for bit flips).",
        "circuitConnection": "In QubitLab, the encoder occupies columns 0 and 1 of wires $q_0, q_1, q_2$.",
        "visualIntuition": "Imagine three synchronized clock hands. When in sync, all three point up ($|000\\rangle$) or all three point down ($|111\\rangle$).",
        "example": "If $q_0$ starts in $|+\\rangle = \\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}}$, the encoded state is the maximally entangled GHZ state $\\frac{|000\\rangle + |111\\rangle}{\\sqrt{2}}$.",
        "commonMistakes": [
          "Placing CNOTs between $q_1$ and $q_2$ instead of using $q_0$ as the control for both. $q_0$ holds the data and must be the control for both encodings!",
          "Assuming the 3-qubit bit-flip code protects against phase flips ($Z$ errors). It protects ONLY against bit flips ($X$)."
        ],
        "checkQuestion": "What is the quantum state of three qubits after encoding a data qubit in state |1⟩ using the 3-qubit bit-flip code?",
        "checkAnswer": "|111⟩ (the logical one state |1⟩_L).",
        "nextConnection": "What happens when a bit-flip error strikes one of the qubits? Let's analyze error states.",
        "qiskitCode": "from qiskit import QuantumCircuit\nqc = QuantumCircuit(3)\n# Input in state |+>\nqc.h(0)\n# Encode\nqc.cx(0, 1)\nqc.cx(0, 2)\nprint('Encoded state |ψ_L> ready')"
      },
      {
        "id": "qec-phase-4",
        "order": 4,
        "title": "Bit-Flip Error Space & Error Subspaces",
        "duration": "6 min",
        "xp_reward": 50,
        "objective": "Analyze the 4 mutually orthogonal error subspaces created by single-qubit Pauli X errors on qubits q0, q1, and q2.",
        "explanation": "Suppose an environmental noise event strikes the encoded state $|\\psi_L\\rangle = \\alpha|000\\rangle + \\beta|111\\rangle$. Under the single-error assumption, one of four events can occur:\n\n1. **No Error ($I$)**:\n   $$E_0 |\\psi_L\\rangle = \\alpha|000\\rangle + \\beta|111\\rangle \\in \\mathcal{H}_0$$\n2. **Bit Flip on Qubit 0 ($X_0$)**:\n   $$X_0 |\\psi_L\\rangle = \\alpha|100\\rangle + \\beta|011\\rangle \\in \\mathcal{H}_1$$\n3. **Bit Flip on Qubit 1 ($X_1$)**:\n   $$X_1 |\\psi_L\\rangle = \\alpha|010\\rangle + \\beta|101\\rangle \\in \\mathcal{H}_2$$\n4. **Bit Flip on Qubit 2 ($X_2$)**:\n   $$X_2 |\\psi_L\\rangle = \\alpha|001\\rangle + \\beta|110\\rangle \\in \\mathcal{H}_3$$\n\nNotice something extraordinary: the four resulting subspaces $\\mathcal{H}_0, \\mathcal{H}_1, \\mathcal{H}_2, \\mathcal{H}_3$ are **mutually orthogonal** to each other!\n$$\\mathcal{H}_i \\perp \\mathcal{H}_j \\quad \\forall i \\neq j$$\n\nBecause they are orthogonal, quantum mechanics permits us to determine *which subspace* the state has drifted into without measuring or disturbing $\\alpha$ or $\\beta$!",
        "math": "Orthogonality of error subspaces:\n$$\\text{Span}\\{|000\\rangle, |111\\rangle\\} \\perp \\text{Span}\\{|100\\rangle, |011\\rangle\\} \\perp \\text{Span}\\{|010\\rangle, |101\\rangle\\} \\perp \\text{Span}\\{|001\\rangle, |110\\rangle\\}$$\nEach subspace preserves the superposition amplitudes $\\alpha$ and $\\beta$ untouched.",
        "circuitConnection": "In QubitLab, an error channel can insert a Pauli $X$ gate on wire $q_0, q_1,$ or $q_2$ to test error detection.",
        "visualIntuition": "Imagine 4 separate rooms in a house. The clean state is in Room 0. If an error occurs on qubit 1, the state moves to Room 1. We just need to check which room has the lights on, without opening the door to look at the occupant.",
        "example": "If qubit 2 suffers an $X$ error, the state becomes $\\alpha|001\\rangle + \\beta|110\\rangle$. The parity of qubits 1 and 2 is now mismatched.",
        "commonMistakes": [
          "Assuming two errors at the same time can be corrected. The 3-qubit code has distance $d=3$, meaning it can correct at most $\\lfloor (d-1)/2 \\rfloor = 1$ error. Two bit flips will look like a single bit flip on the third qubit, causing incorrect recovery.",
          "Thinking the error destroys $\\alpha$ and $\\beta$. The amplitudes remain completely preserved inside the shifted basis."
        ],
        "checkQuestion": "What is the resulting state if an unwanted Pauli X error occurs on data qubit q1 of the encoded state α|000⟩ + β|111⟩?",
        "checkAnswer": "α|010⟩ + β|101⟩.",
        "nextConnection": "Why can't we measure the data qubits directly to find the error? The Collapse Trap.",
        "qiskitCode": "# Inspecting error subspaces\nprint('Error subspaces: H0={000,111}, H1={100,011}, H2={010,101}, H3={001,110}')"
      },
      {
        "id": "qec-phase-5",
        "order": 5,
        "title": "The Collapse Trap: Why Direct Measurement Fails",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Understand why direct measurement of data qubits collapses the logical superposition and destroys quantum information.",
        "explanation": "Why can't we simply measure the three data qubits in the computational basis to see which one flipped?\n\nLet's see what happens if you measure the data qubits directly when the state is $\\alpha|000\\rangle + \\beta|111\\rangle$:\n- With probability $|\\alpha|^2$, you measure $000$, collapsing the state to $|000\\rangle$.\n- With probability $|\\beta|^2$, you measure $111$, collapsing the state to $|111\\rangle$.\n\nThe quantum superposition is **instantly and irreversibly destroyed**! The coefficients $\\alpha$ and $\\beta$ vanish forever. You have reduced your quantum computer into a classical computer!\n\nThis is **The Measurement Paradox of Quantum Error Correction**:\nTo correct an error, you must learn *what error occurred* without learning *what the quantum state was*!\n\nWe must extract information about the **error syndrome** (the relationship between qubits) while acquiring exactly zero information about the data ($\\\u0007lpha$ and $\\beta$).",
        "math": "Direct measurement collapses superposition:\n$$\\alpha|000\\rangle + \\beta|111\\rangle \\xrightarrow{M_{012}} \\begin{cases} |000\\rangle & \\text{with probability } |\\alpha|^2 \\\\ |111\\rangle & \\text{with probability } |\\beta|^2 \\end{cases}$$\nQuantum information is destroyed by state reduction.",
        "circuitConnection": "Never place measurement meters directly on data qubits during the computation! Measurement must only occur on auxiliary ancilla qubits.",
        "visualIntuition": "Imagine checking whether a patient is breathing. You hold a feather under their nose: the feather moves without disturbing the patient. Direct measurement is like performing open-heart surgery to check for a pulse.",
        "example": "If $|\\psi_L\\rangle = \\frac{1}{\\sqrt{2}}(|000\\rangle + |111\\rangle)$, measuring directly produces either $000$ or $111$. The relative phase between 0 and 1 is permanently erased.",
        "commonMistakes": [
          "Measuring data qubits to detect errors. This destroys the quantum calculation.",
          "Believing non-destructive measurement is impossible in quantum mechanics. Non-destructive parity measurement is achieved using ancilla qubits!"
        ],
        "checkQuestion": "What happens to the superposition α|000⟩ + β|111⟩ if you measure the data qubits directly in the computational basis?",
        "checkAnswer": "The superposition collapses irreversibly to either |000⟩ or |111⟩ with probabilities |α|² and |β|², destroying the quantum state.",
        "nextConnection": "How do we measure parity without measuring data? We introduce Ancilla Qubits for Syndrome Measurement.",
        "qiskitCode": "# Direct measurement trap\nprint('Direct measurement collapses data qubits; ancilla syndrome measurement is strictly required!')"
      },
      {
        "id": "qec-phase-6",
        "order": 6,
        "title": "Ancilla Qubits & Non-Destructive Parity Measurement",
        "duration": "6 min",
        "xp_reward": 50,
        "objective": "Understand how ancilla qubits measure two-qubit parities Z_0 Z_1 and Z_1 Z_2 non-destructively using CNOT networks.",
        "explanation": "To detect which qubit flipped without measuring the data, we introduce two auxiliary **ancilla qubits** ($a_0$ and $a_1$), initialized in the ground state $|00\\rangle$.\n\nInstead of measuring the individual values of the data qubits, we measure their **parity**:\n1. **Syndrome Bit $s_0$ (Parity of $q_0$ and $q_1$)**: Does $q_0 = q_1$?\n   - We apply a CNOT from $q_0$ to $a_0$, and a CNOT from $q_1$ to $a_0$.\n   - The ancilla $a_0$ computes the XOR sum: $a_0 = q_0 \\oplus q_1$.\n   - If $q_0 = q_1$ (e.g. $00$ or $11$), $a_0 = 0$.\n   - If $q_0 \\neq q_1$ (e.g. $01$ or $10$), $a_0 = 1$.\n\n2. **Syndrome Bit $s_1$ (Parity of $q_1$ and $q_2$)**: Does $q_1 = q_2$?\n   - We apply a CNOT from $q_1$ to $a_1$, and a CNOT from $q_2$ to $a_1$.\n   - The ancilla $a_1$ computes the XOR sum: $a_1 = q_1 \\oplus q_2$.\n\nNotice that for the uncorrupted state $\\alpha|000\\rangle + \\beta|111\\rangle$:\nIn both $|000\\rangle$ and $|111\\rangle$, $q_0 = q_1$ and $q_1 = q_2$! Therefore, both ancillas measure **00** with 100% certainty, leaving $\\alpha$ and $\\beta$ completely undisturbed!",
        "math": "The two parity check operators (stabilizers):\n$$S_1 = Z_0 Z_1, \\quad S_2 = Z_1 Z_2$$\nAction on logical states:\n$$Z_0 Z_1 |000\\rangle = (+1)(+1)|000\\rangle = +1|000\\rangle, \\quad Z_0 Z_1 |111\\rangle = (-1)(-1)|111\\rangle = +1|111\\rangle$$\nBoth $|000\\rangle$ and $|111\\rangle$ are $+1$ eigenstates of $S_1$ and $S_2$! Parity measurement extracts zero information about whether the state was $|0\\rangle_L$ or $|1\\rangle_L$.",
        "circuitConnection": "In QubitLab, wires $q_0, q_1, q_2$ are data lines; wires $a_0, a_1$ are ancilla lines. Two CNOTs connect to $a_0$, and two CNOTs connect to $a_1$.",
        "visualIntuition": "Imagine comparing the weights of two bags. A balance scale tells you whether Bag A and Bag B have the same weight, without revealing how heavy either bag is.",
        "example": "If an error flips $q_0$, the state is $\\alpha|100\\rangle + \\beta|011\\rangle$. In both branches, $q_0 \\neq q_1$ (parity 1) and $q_1 = q_2$ (parity 0). The ancillas measure $s_0=1, s_1=0$ with 100% certainty!",
        "commonMistakes": [
          "Reversing CNOT direction (making the ancilla the control). The data qubits must be the controls, and the ancilla must be the target!",
          "Measuring data qubits instead of ancillas."
        ],
        "checkQuestion": "What value will the ancilla qubit a_0 compute if data qubits q0 and q1 have the same bit value (00 or 11)?",
        "checkAnswer": "0 (even parity). The two CNOT gates cancel each other modulo 2: 0 ⊕ 0 = 0 and 1 ⊕ 1 = 0.",
        "nextConnection": "Now let's examine the complete Syndrome Decoding Table that maps (s0, s1) to the exact error location.",
        "qiskitCode": "from qiskit import QuantumCircuit\nqc = QuantumCircuit(5, 2)  # 3 data (0,1,2), 2 ancilla (3,4)\n# Parity Z0 Z1 on ancilla 3\nqc.cx(0, 3); qc.cx(1, 3)\n# Parity Z1 Z2 on ancilla 4\nqc.cx(1, 4); qc.cx(2, 4)\nqc.measure([3, 4], [0, 1])\nprint('Syndrome extraction circuit ready')"
      },
      {
        "id": "qec-phase-7",
        "order": 7,
        "title": "The Syndrome Decoding Table",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Master the syndrome decoding table: uniquely mapping the measured ancilla bits (s0, s1) to the error location.",
        "explanation": "When we measure the two ancilla qubits in the computational basis, we obtain a 2-bit classical string $(s_0, s_1)$ called the **error syndrome**.\n\nLet's trace all 4 possible error cases:\n\n| Measured Syndrome $(s_0, s_1)$ | Parity Meaning | Diagnosis | Required Recovery Gate |\n| :---: | :---: | :---: | :---: |\n| **00** | $q_0 = q_1$ and $q_1 = q_2$ | **No Error** | **$I$** (Do nothing) |\n| **10** | $q_0 \\neq q_1$ and $q_1 = q_2$ | **Bit Flip on $q_0$** | Apply **$X$ on $q_0$** |\n| **11** | $q_0 \\neq q_1$ and $q_1 \\neq q_2$ | **Bit Flip on $q_1$** (middle) | Apply **$X$ on $q_1$** |\n| **01** | $q_0 = q_1$ and $q_1 \\neq q_2$ | **Bit Flip on $q_2$** | Apply **$X$ on $q_2$** |\n\nLook at how elegant this is:\n- There are 4 possible single-qubit error states ($I, X_0, X_1, X_2$).\n- There are exactly $2^2 = 4$ possible 2-bit syndromes ($00, 10, 11, 01$).\nEvery single-qubit error produces a **unique, distinct syndrome**! The syndrome tells us exactly which qubit flipped with zero ambiguity, while having revealed zero information about the data!",
        "math": "Syndrome mapping function:\n$$f_{\\text{syndrome}}(E) = \\begin{cases} 00 & \\text{if } E = I \\\\ 10 & \\text{if } E = X_0 \\\\ 11 & \\text{if } E = X_1 \\\\ 01 & \\text{if } E = X_2 \\end{cases}$$\nBecause the mapping is bijective (one-to-one and onto), error identification is 100% deterministic.",
        "circuitConnection": "In QubitLab, the syndrome table is displayed in the debugging inspector, showing real-time error localization.",
        "visualIntuition": "Imagine three light switches in a row. Switch 1 and 2 differ (light 1 on). Switch 2 and 3 differ (light 2 on). If both lights turn on (11), the middle switch was flipped!",
        "example": "If noise flips qubit $q_1$, the data state is $\\alpha|010\\rangle + \\beta|101\\rangle$. We measure the ancillas: $s_0 = 0 \\oplus 1 = 1$, and $s_1 = 1 \\oplus 0 = 1$. Syndrome is **11**, pinpointing $q_1$ as the flipped qubit.",
        "commonMistakes": [
          "Confusing syndrome 10 with a flip on $q_1$. In 10, $q_1 = q_2$, so $q_1$ is healthy; $q_0$ is the odd one out.",
          "Thinking syndrome 00 means the state is definitely error-free. Syndrome 00 can also occur if ALL three qubits flipped ($X_0 X_1 X_2$), which is undetectable by this simple code."
        ],
        "checkQuestion": "If the syndrome measurement outcomes are s0 = 0 and s1 = 1, which data qubit suffered a bit flip?",
        "checkAnswer": "Qubit q2. Because s0=0 means q0 and q1 match, while s1=1 means q1 and q2 mismatch, q2 is the corrupted qubit.",
        "nextConnection": "Now we apply active error correction: using the syndrome to apply targeted Pauli X recovery gates.",
        "qiskitCode": "# Syndrome decoding logic in Python\ndef decode_syndrome(s0, s1):\n    table = {(0, 0): 'No error', (1, 0): 'Flip q0', (1, 1): 'Flip q1', (0, 1): 'Flip q2'}\n    return table.get((s0, s1), 'Unknown')"
      },
      {
        "id": "qec-phase-8",
        "order": 8,
        "title": "Active Error Recovery: Targeted Pauli X Unitaries",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Understand active error recovery: applying a Pauli X gate to the corrupted qubit based on classical syndrome bits to restore the original state.",
        "explanation": "Once the syndrome $(s_0, s_1)$ is measured, the final step is **active recovery**.\n\nIn classical computing, you rewrite the flipped bit. In quantum computing, we apply a **Pauli $X$ unitary gate** to the corrupted qubit! Because Pauli $X$ is its own inverse ($X \\cdot X = X^2 = I$):\n$$X_i \\left( X_i |\\psi_L\\rangle \\right) = X_i^2 |\\psi_L\\rangle = I |\\psi_L\\rangle = |\\psi_L\\rangle$$\n\nApplying a Pauli $X$ gate flips the corrupted qubit back to its original state, perfectly restoring the initial superposition $\\alpha|000\\rangle + \\beta|111\\rangle$ with 100% fidelity!\n\nThis can be implemented either:\n- **In Real-Time Hardware**: Using classically controlled $X$ gates conditioned on the measured ancilla bits.\n- **Via Pauli Frame Tracking**: In modern quantum processors, the physical $X$ gate is not even applied! Instead, a classical computer simply updates its internal 'Pauli frame' (tracking which qubit is inverted in software), achieving zero-latency virtual error correction!",
        "math": "Recovery operator:\n$$R(s_0, s_1) = \\begin{cases} I & \\text{if } s = 00 \\\\ X_0 & \\text{if } s = 10 \\\\ X_1 & \\text{if } s = 11 \\\\ X_2 & \\text{if } s = 01 \\end{cases}$$\nCombined error and recovery action: $R(s) \\cdot E \\cdot |\\psi_L\\rangle = |\\psi_L\\rangle$.",
        "circuitConnection": "In QubitLab, place classically controlled $X$ gates on wires $q_0, q_1, q_2$ controlled by the ancilla classical measurement lines.",
        "visualIntuition": "Imagine an upside-down playing card. The syndrome tells you: 'Card 2 is face-down.' You reach in and flip Card 2 over. All cards are now face-up again.",
        "example": "Suppose $q_0$ flipped: state is $\\alpha|100\\rangle + \\beta|011\\rangle$. Syndrome measures 10. We apply an $X$ gate to $q_0$: $X_0(\\alpha|100\\rangle + \\beta|011\\rangle) = \\alpha|000\\rangle + \\beta|111\\rangle$. Perfect restoration!",
        "commonMistakes": [
          "Applying a $Z$ gate instead of an $X$ gate for recovery. $Z$ corrects phase flips, not bit flips.",
          "Applying the recovery gate before measuring the ancilla."
        ],
        "checkQuestion": "Why does applying a Pauli X gate to a bit-flipped qubit restore it to its original uncorrupted state?",
        "checkAnswer": "Because Pauli X is self-inverse: X · X = X² = I. Applying a second bit flip cancels out the first bit flip exactly.",
        "nextConnection": "What about phase-flip errors (Z errors)? Let's examine the 3-qubit Phase-Flip Code.",
        "qiskitCode": "# Classical recovery conditional gate\nfrom qiskit import QuantumCircuit\nqc = QuantumCircuit(3)\n# If error on q0 detected, apply X(0)\nqc.x(0)\nprint('Recovery operation restored logical state')"
      },
      {
        "id": "qec-phase-9",
        "order": 9,
        "title": "The 3-Qubit Phase-Flip Code (Hadamard Basis)",
        "duration": "6 min",
        "xp_reward": 50,
        "objective": "Understand phase-flip errors (Pauli Z), and how wrapping the bit-flip code in Hadamard gates protects against phase flips.",
        "explanation": "Bit flips are only half the story. In quantum computing, qubits can also suffer from **phase-flip errors** ($Z$ errors):\n$$Z |0\\rangle = |0\\rangle, \\quad Z |1\\rangle = -|1\\rangle$$\nOn the superposition $|+\\rangle = \\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}}$, a Pauli $Z$ error flips the state to $|-\\rangle = \\frac{|0\\rangle - |1\\rangle}{\\sqrt{2}}$. The 3-qubit bit-flip code cannot detect phase flips!\n\nHow do we protect against phase flips? By using the fundamental duality between the $X$ and $Z$ bases!\nRecall that the Hadamard gate swaps Pauli $X$ and Pauli $Z$:\n$$H X H = Z \\quad \\text{and} \\quad H Z H = X$$\n\nTherefore, a phase flip in the computational basis is **identical to a bit flip in the Hadamard basis**! To build the **3-qubit Phase-Flip Code**:\n1. Encode the logical state into the Hadamard basis states:\n   - $|0\\rangle_L = |+++\\rangle$\n   - $|1\\rangle_L = |---\\rangle$\n2. The encoding circuit is identical to the bit-flip code, followed by a layer of Hadamard gates on all three qubits!\n3. A phase flip $Z$ changes a $|+\\rangle$ into $|-\\rangle$ (or vice versa), which acts as a bit flip in the conjugate basis. Syndrome extraction in the Hadamard basis detects and corrects it!",
        "math": "Logical basis for the Phase-Flip Code:\n$$|0\\rangle_L = |+++\\rangle = H^{\\otimes 3}|000\\rangle$$\n$$|1\\rangle_L = |---\\rangle = H^{\\otimes 3}|111\\rangle$$\nPhase-flip stabilizers: $S_1 = X_0 X_1$ and $S_2 = X_1 X_2$.",
        "circuitConnection": "In QubitLab, the phase-flip code adds Hadamard gates to all data wires before and after the syndrome extraction block.",
        "visualIntuition": "If you are vulnerable to attacks from the side (phase), you simply turn your armor $90^\\circ$ (Hadamard rotation) so the shield faces the incoming attack.",
        "example": "If $Z_0$ strikes $|+++\\rangle$, the state becomes $|-++\\rangle$. Applying Hadamards converts this to $|100\\rangle$, which syndrome measurement diagnoses as a flip on $q_0$!",
        "commonMistakes": [
          "Assuming a code must protect against both errors simultaneously using only 3 qubits. Quantum Hamming bounds prove that at least 5 qubits are required to protect against arbitrary single-qubit errors ($X$ and $Z$).",
          "Using $Z$ stabilizers for phase-flip codes instead of $X$ stabilizers."
        ],
        "checkQuestion": "What transformation converts a Pauli Z phase-flip error into a Pauli X bit-flip error?",
        "checkAnswer": "The Hadamard transformation: H Z H = X.",
        "nextConnection": "How do we protect against BOTH bit flips and phase flips simultaneously? We concatenate the codes into Shor's 9-Qubit Code.",
        "qiskitCode": "from qiskit import QuantumCircuit\nqc = QuantumCircuit(3)\n# 3-qubit phase flip encoder: bit-flip code + Hadamards\nqc.cx(0, 1); qc.cx(0, 2)\nqc.h([0, 1, 2])\nprint('3-qubit phase flip code compiled')"
      },
      {
        "id": "qec-phase-10",
        "order": 10,
        "title": "Shor's 9-Qubit Code & Arbitrary Quantum Error Correction",
        "duration": "6 min",
        "xp_reward": 50,
        "objective": "Understand code concatenation in Shor's 9-qubit code and why correcting Pauli X and Z errors automatically corrects arbitrary continuous errors.",
        "explanation": "In 1995, Peter Shor made one of the greatest conceptual breakthroughs in quantum information science: **Shor's 9-Qubit Code**, the world's first complete quantum error-correcting code capable of protecting against **any arbitrary single-qubit error**!\n\nShor achieved this through **concatenation** (nesting a code inside another code):\n1. First, encode the logical qubit using the 3-qubit phase-flip code into 3 blocks of states: $|+\\rangle, |+\\rangle, |+\\rangle$.\n2. Then, encode each of those 3 qubits using the 3-qubit bit-flip code into 3 physical qubits!\n\nThe resulting logical basis states use 9 physical qubits:\n$$|0\\rangle_L = \\frac{1}{2\\sqrt{2}}(|000\\rangle + |111\\rangle)(|000\\rangle + |111\\rangle)(|000\\rangle + |111\\rangle)$$\n$$|1\\rangle_L = \\frac{1}{2\\sqrt{2}}(|000\\rangle - |111\\rangle)(|000\\rangle - |111\\rangle)(|000\\rangle - |111\\rangle)$$\n\n**The Miracle of Quantum Discretization**:\nWhy does protecting against only Pauli $X$ and Pauli $Z$ protect against continuous errors (like an arbitrary rotation $R_x(0.001^\\circ)$ or a $Y = iXZ$ error)?\nBecause the Pauli matrices $\\{I, X, Y, Z\\}$ form a complete basis for all $2 \\times 2$ matrices! When syndrome measurement is performed, the measurement **projects** the continuous error onto one of the discrete Pauli operators! Continuous noise is forced into discrete Pauli errors!",
        "math": "Any arbitrary error $E$ can be expanded in the Pauli basis:\n$$E = c_0 I + c_1 X + c_2 Y + c_3 Z$$\nSyndrome measurement projects the superposition onto a single term with probability $|c_k|^2$. Correcting that Pauli error restores the state completely!",
        "circuitConnection": "In QubitLab, the 9-qubit code is demonstrated using hierarchical CNOT and Hadamard blocks.",
        "visualIntuition": "Imagine an analog watch whose second hand can be bent to any arbitrary angle. Quantum syndrome measurement acts like a notched escapement wheel: it snaps the bent hand into the nearest integer tick mark, turning analog drift into a discrete digital error.",
        "example": "If a cosmic ray causes a tiny rotation error $U = \\cos(\\theta)I - i\\sin(\\theta)X$, syndrome measurement collapses the state: with probability $\\cos^2\\theta$ it measures 'no error', and with probability $\\sin^2\\theta$ it measures a full bit flip $X$, which is immediately corrected by an $X$ gate!",
        "commonMistakes": [
          "Believing quantum computers are vulnerable to analog drift because qubits are continuous. Quantum error correction completely digitizes analog noise through projective measurement!",
          "Thinking 9 qubits is the theoretical minimum. The absolute theoretical minimum for a code correcting arbitrary single-qubit errors is the 5-qubit code (Laflamme et al., 1996)."
        ],
        "checkQuestion": "Why does a quantum code that corrects only discrete Pauli X and Z errors also protect against arbitrary continuous rotation errors?",
        "checkAnswer": "Because any error can be expanded as a linear combination of Pauli matrices, and syndrome measurement projects the continuous error onto a discrete Pauli operator.",
        "nextConnection": "Let's explore fault tolerance, surface codes, and physical error thresholds for industrial quantum computing.",
        "qiskitCode": "# Concept of Pauli basis error expansion\nprint('Arbitrary noise E = c0*I + c1*X + c2*Y + c3*Z is discretized by syndrome projection!')"
      },
      {
        "id": "qec-phase-11",
        "order": 11,
        "title": "Fault Tolerance, Surface Codes, & The Threshold Theorem",
        "duration": "6 min",
        "xp_reward": 50,
        "objective": "Understand fault tolerance, topological Surface Codes on 2D square lattices, and the Threshold Theorem (error rate < 1%).",
        "explanation": "What if the gates used to perform error correction themselves suffer from errors? If a noisy CNOT gate in your error-correction circuit introduces two new errors while trying to fix one, error correction will make your computer *worse*!\n\nTo solve this, John Preskill, Peter Shor, and Dorit Aharonov developed the theory of **Fault Tolerance**: designing circuits such that a single physical failure anywhere in the circuit (including inside the syndrome extraction gates) can never cascade into more than one error in any logical block.\n\n**The Quantum Threshold Theorem**:\nIf the physical error rate per gate is below a rigorous physical threshold:\n$$p < p_{\\text{th}} \\approx 1\\%$$\nthen by concatenating codes or scaling code distance, arbitrary quantum computations of arbitrary length can be simulated with **arbitrarily small logical error rates**:\n$$P_{\\text{logical}} \\sim \\left( \\frac{p}{p_{\\text{th}}} \\right)^{(d+1)/2} \\longrightarrow 0$$\n\nToday, the leading paradigm for physical hardware is the **Surface Code**: physical qubits are arranged on a 2D square grid with alternating $X$-plaquette and $Z$-plaquette stabilizer checks, requiring only nearest-neighbor connectivity.",
        "math": "Logical error rate scaling in surface codes:\n$$P_L \\approx c \\left( \\frac{p}{p_{\\text{th}}} \\right)^{d/2}$$\nwhere $d$ is the code distance and $p_{\\text{th}} \\approx 1.0\\%$ for surface codes. If $p = 10^{-3}$ (0.1%), increasing distance $d$ suppresses errors exponentially!",
        "circuitConnection": "In QubitLab, the error correction dashboard displays the physical vs. logical error rate comparison.",
        "visualIntuition": "Imagine building a levee against a rising flood. If you pack the sandbags too loosely ($p > p_{\\text{th}}$), water seeps through and washes the wall away. If you pack them tightly below the threshold ($p < p_{\\text{th}}$), each additional layer of sandbags makes the barrier exponentially more waterproof.",
        "example": "With physical error rate $p = 0.1\\%$ on a distance $d=27$ surface code: the logical error rate drops to $P_L \\sim 10^{-18}$, allowing a quantum computer to run billions of operations without a single logical error.",
        "commonMistakes": [
          "Assuming quantum error correction can work if physical hardware is too noisy. If $p > p_{\\text{th}}$, adding more qubits increases the net error rate!",
          "Confusing physical qubits with logical qubits. Current hardware has hundreds of physical qubits; fault-tolerant algorithms require thousands of logical qubits."
        ],
        "checkQuestion": "What does the Quantum Threshold Theorem state about quantum computations when physical gate error rates are below the threshold p_th?",
        "checkAnswer": "It proves that quantum computations of arbitrary duration can be executed with arbitrarily low logical error rates by scaling code distance, provided p < p_th.",
        "nextConnection": "Now you are ready to assemble and verify the complete 3-qubit bit-flip error correction circuit in Quantum Studio!",
        "qiskitCode": "# Surface code scaling calculation\np = 0.001\np_th = 0.01\nfor d in [3, 7, 15, 27]:\n    p_logical = (p / p_th)**((d + 1) / 2)\n    print(f'Distance d={d:2d}: Logical error rate ~ {p_logical:.1e}')"
      },
      {
        "id": "qec-phase-12",
        "order": 12,
        "title": "Complete QEC Circuit Synthesis & Verification",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Synthesize the complete 3-qubit bit-flip error correction circuit in Quantum Studio, verify non-destructive recovery, and claim your Mission 11 XP.",
        "explanation": "Congratulations! You have mastered the theoretical and circuit principles of Quantum Error Correction.\n\nLet's review the complete 5-stage pipeline you will execute in Quantum Studio:\n1. **Data Preparation**: Initialize data qubit $q_0$ in an arbitrary superposition state $|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle$.\n2. **Encoding**: Apply CNOT($q_0 \\to q_1$) and CNOT($q_0 \\to q_2$) to create the logical state $\\alpha|000\\rangle + \\beta|111\\rangle$.\n3. **Noise Injection**: Simulate a bit-flip error by placing a Pauli $X$ gate on one of the data qubits.\n4. **Syndrome Extraction**: Use 2 ancilla qubits and 4 CNOTs to measure parity $Z_0 Z_1$ and $Z_1 Z_2$ non-destructively.\n5. **Recovery**: Apply targeted Pauli $X$ gates conditioned on the measured syndrome bits to restore the original state $|\\psi\\rangle$ with 100% fidelity!\n\nEnter Quantum Studio now to wire your QEC circuit, inject errors, verify recovery on the Bloch sphere, and claim your Quantum Reliability Engineer badge for Mission 11!",
        "math": "Full error-correction identity:\n$$R(s) \\cdot M_{\\text{ancilla}} \\cdot U_{\\text{syndrome}} \\cdot (X_i) \\cdot U_{\\text{encode}} |\\psi\\rangle|00\\rangle = |\\psi\\rangle|00\\rangle \\otimes |s\\rangle$$\nFidelity: $F = 1.0$ (100% state preservation despite noise).",
        "circuitConnection": "In QubitLab, Mission 11 tests your circuit by injecting random bit flips and verifying that the recovered state matches the original data with fidelity $F \\ge 0.99$.",
        "visualIntuition": "Watch the Bloch sphere in QubitLab: when the error strikes, the state vector flips. When the syndrome recovery fires, the state vector snaps back to its original orientation instantly!",
        "example": "Prepare $|\\psi\\rangle = |+\\rangle$ on $q_0$. Inject an error $X$ on $q_0$. The ancillas measure $s_0=1, s_1=0$. The recovery gate fires on $q_0$. Rotate $q_0$ by $H$ and measure: it yields 0 with 100% probability, proving $|+\\rangle$ was perfectly recovered!",
        "commonMistakes": [
          "Exceeding the permitted gate count by placing redundant gates.",
          "Failing to connect classical control lines to recovery gates."
        ],
        "checkQuestion": "What is the primary difference between how classical computers handle errors and how quantum error correction handles errors?",
        "checkAnswer": "Classical error correction copies data bits directly; quantum error correction entangles data non-locally and uses ancilla parity measurements to protect superpositions without measuring data.",
        "nextConnection": "Proceed to Quantum Studio to build your QEC circuit and advance to Level 12: The HHL Quantum Linear Systems Algorithm!",
        "qiskitCode": "# Ready to simulate in Quantum Studio\nprint('Quantum Error Correction Mission 11 ready for Quantum Studio simulation!')"
      }
    ]
  },
  "hhl": {
    "projectId": "hhl",
    "algorithm": "HHL Algorithm (Quantum Linear Systems)",
    "overview": "Solve linear systems of equations A x = b with exponential speedup O(log N) over classical O(N) using Hamiltonian simulation, Quantum Phase Estimation, controlled rotations, and uncomputation.",
    "difficulty": "Expert",
    "totalDuration": "85 min",
    "phases": [
      {
        "id": "hhl-phase-1",
        "order": 1,
        "title": "The Linear Systems Problem: Ax = b & Classical Complexity",
        "duration": "6 min",
        "xp_reward": 50,
        "objective": "Understand the system of linear equations A x = b, classical Gaussian elimination O(N³), and conjugate gradient limits O(N s κ).",
        "explanation": "Systems of linear equations $A\\vec{x} = \\vec{b}$ are ubiquitous in modern engineering, scientific computing, finite element analysis, machine learning, and weather forecasting. Here, $A$ is an $N \\times N$ matrix, $\\vec{b}$ is a known $N$-dimensional vector, and $\\vec{x} = A^{-1}\\vec{b}$ is the unknown solution vector.\n\nHow difficult is solving this classically?\n- **Gaussian Elimination**: Takes $\\mathcal{O}(N^3)$ operations. For $N = 1,000,000$, $N^3 = 10^{18}$ operations—prohibitively slow!\n- **Conjugate Gradient Method**: For sparse matrices with $s$ non-zero entries per row, the conjugate gradient method improves runtime to $\\mathcal{O}(N s \\kappa \\log(1/\\epsilon))$, where $\\kappa$ is the condition number and $\\epsilon$ is the error tolerance.\n\nNotice that classical algorithms scale **at least linearly with $N$**: $\\mathcal{O}(N)$. Simply writing down the solution vector $\\vec{x}$ of length $N$ takes $\\mathcal{O}(N)$ time!\n\nIn 2009, Aram Harrow, Avinatan Hassidim, and Seth Lloyd published the **HHL Algorithm**, proving that a quantum computer can solve linear systems with **exponential speedup**: $\\mathcal{O}(\\log(N) s^2 \\kappa^2 / \\epsilon)$! For $N = 2^n$ dimensions, HHL scales logarithmically in $N$ (polynomially in $n = \\log N$ qubits).",
        "math": "Classical vs. Quantum linear systems complexity:\n$$T_{\\text{classical}} = \\mathcal{O}(N s \\kappa \\log(1/\\epsilon))$$\n$$T_{\\text{HHL}} = \\mathcal{O}\\left( \\log(N) \\frac{s^2 \\kappa^2}{\\epsilon} \\right) = \\mathcal{O}\\left( n \\frac{s^2 \\kappa^2}{\\epsilon} \\right)$$\nWhen $N = 10^{12}$ ($n \\approx 40$ qubits): classical requires $10^{12}$ operations; HHL scales as $\\sim 40$ steps—a speedup of 10 orders of magnitude!",
        "circuitConnection": "In QubitLab, we implement HHL for a $2 \\times 2$ matrix system using a data qubit, clock register, and an ancilla rotation qubit.",
        "visualIntuition": "Imagine finding the deformation of an airplane wing modeled with 1 billion mesh points ($N = 10^9$). Classical computers solve 1 billion equations sequentially. HHL prepares a single quantum state $|x\\rangle$ whose amplitudes represent the entire stress field.",
        "example": "Consider the $2 \\times 2$ linear system:\n$$\\begin{pmatrix} 1.5 & 0.5 \\\\ 0.5 & 1.5 \\end{pmatrix} \\begin{pmatrix} x_1 \\\\ x_2 \\end{pmatrix} = \\begin{pmatrix} 1 \\\\ 0 \\end{pmatrix}$$\nInverting $A$: $\\vec{x} = A^{-1}\\vec{b} = \\begin{pmatrix} 0.75 & -0.25 \\\\ -0.25 & 0.75 \\end{pmatrix} \\begin{pmatrix} 1 \\\\ 0 \\end{pmatrix} = \\begin{pmatrix} 0.75 \\\\ -0.25 \\end{pmatrix}$.",
        "commonMistakes": [
          "Assuming HHL outputs the full classical vector $\\vec{x}$ in $\\mathcal{O}(\\log N)$ time. HHL produces a quantum state $|x\\rangle = \\sum x_i |i\\rangle$. Reading out all $N$ classical components would require $\\mathcal{O}(N)$ measurements, destroying the exponential speedup! HHL is designed for extracting global expectation values $\\langle x | M | x \\rangle$.",
          "Ignoring the condition number $\\kappa$. If the matrix is ill-conditioned ($\\kappa \\gg 1$), HHL slows down significantly."
        ],
        "checkQuestion": "What is the time complexity of the HHL algorithm with respect to matrix dimension N, and how does it compare to classical algorithms?",
        "checkAnswer": "HHL scales as O(log N) (logarithmic in dimension), achieving an exponential speedup over classical algorithms which scale as O(N) (linear in dimension).",
        "nextConnection": "To solve this on a quantum computer, we must first understand how classical vectors are encoded into quantum states.",
        "qiskitCode": "# Classical 2x2 linear system solution\nimport numpy as np\nA = np.array([[1.5, 0.5], [0.5, 1.5]])\nb = np.array([1.0, 0.0])\nx = np.linalg.solve(A, b)\nprint('Exact classical solution x:', x)"
      },
      {
        "id": "hhl-phase-2",
        "order": 2,
        "title": "Quantum Representation of Vectors & Matrices",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Understand quantum vector encoding |b⟩ = ∑ b_i |i⟩, matrix Hermiticity A = A†, and the spectral decomposition A = ∑ λ_j |u_j⟩⟨u_j|.",
        "explanation": "In the HHL algorithm, the classical vector $\\vec{b} = (b_0, b_1, \\dots, b_{N-1})^T$ is normalized and encoded into the probability amplitudes of an $n$-qubit register ($N = 2^n$):\n$$|b\\rangle = \\sum_{i=0}^{N-1} b_i |i\\rangle, \\quad \\sum_{i=0}^{N-1} |b_i|^2 = 1$$\n\nThe goal of the algorithm is to output a quantum state $|x\\rangle$ proportional to the solution vector $\\vec{x} = A^{-1}\\vec{b}$:\n$$|x\\rangle = \\frac{A^{-1}|b\\rangle}{\\|A^{-1}|b\\rangle\\|}$$\n\n**Hermiticity and Spectral Decomposition**:\nHHL assumes the matrix $A$ is **Hermitian** ($A = A^\\dagger$). (If $A$ is not Hermitian, we can embed it into a larger Hermitian matrix $\\begin{pmatrix} 0 & A \\\\ A^\\dagger & 0 \\end{pmatrix}$). By the Spectral Theorem, any Hermitian matrix has real eigenvalues $\\lambda_j$ and an orthonormal set of eigenvectors $|u_j\\rangle$:\n$$A = \\sum_{j=1}^N \\lambda_j |u_j\\rangle\\langle u_j|$$\n\nBecause the eigenvectors form a complete basis, we can expand the input vector $|b\\rangle$ in the eigenbasis of $A$:\n$$|b\\rangle = \\sum_{j=1}^N \\beta_j |u_j\\rangle, \\quad \\text{where } \\beta_j = \\langle u_j | b \\rangle$$\nApplying the inverse matrix $A^{-1} = \\sum \\frac{1}{\\lambda_j}|u_j\\rangle\\langle u_j|$ simply inverts each eigenvalue:\n$$A^{-1}|b\\rangle = \\sum_{j=1}^N \\frac{\\beta_j}{\\lambda_j} |u_j\\rangle$$",
        "math": "Spectral expansion of $A$ and $A^{-1}$:\n$$A = \\sum_{j=1}^N \\lambda_j |u_j\\rangle\\langle u_j| \\implies A^{-1} = \\sum_{j=1}^N \\frac{1}{\\lambda_j} |u_j\\rangle\\langle u_j|$$\nAction on input state $|b\\rangle = \\sum \\beta_j |u_j\\rangle$:\n$$|x\\rangle \\propto A^{-1}|b\\rangle = \\sum_{j=1}^N \\frac{\\beta_j}{\\lambda_j} |u_j\\rangle$$",
        "circuitConnection": "In QubitLab, the data register qubit starts in state $|b\\rangle$. For $\\vec{b} = (1, 0)^T$, $|b\\rangle = |0\\rangle$.",
        "visualIntuition": "Imagine breaking white light into distinct colors using a prism (eigenvectors $|u_j\\rangle$). The matrix $A$ scales each color by $\\lambda_j$. To invert $A$, we just need to scale each color by $1/\\lambda_j$!",
        "example": "For $A = \\begin{pmatrix} 1.5 & 0.5 \\\\ 0.5 & 1.5 \\end{pmatrix}$:\n- Eigenvector $|u_1\\rangle = \\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}}$ with eigenvalue $\\lambda_1 = 2.0$\n- Eigenvector $|u_2\\rangle = \\frac{|0\\rangle - |1\\rangle}{\\sqrt{2}}$ with eigenvalue $\\lambda_2 = 1.0$\nInverting: $\\lambda_1^{-1} = 0.5$ and $\\lambda_2^{-1} = 1.0$.",
        "commonMistakes": [
          "Assuming $A$ must be diagonal. $A$ can be dense or general sparse; the spectral decomposition is mathematical, not physical.",
          "Attempting to solve systems where an eigenvalue $\\lambda_j = 0$. If $\\lambda_j = 0$, $A$ is singular and non-invertible."
        ],
        "checkQuestion": "If a Hermitian matrix A has eigenvector |u⟩ with eigenvalue λ = 4, what is the action of A^(-1) on |u⟩?",
        "checkAnswer": "A^(-1)|u⟩ = (1/4)|u⟩ = 0.25|u⟩.",
        "nextConnection": "How does a quantum circuit interact with matrix A? Through Hamiltonian Simulation.",
        "qiskitCode": "# Spectral decomposition in NumPy\nA = np.array([[1.5, 0.5], [0.5, 1.5]])\nevals, evecs = np.linalg.eigh(A)\nprint('Eigenvalues:', evals)\nprint('Eigenvectors:\\n', np.round(evecs, 3))"
      },
      {
        "id": "hhl-phase-3",
        "order": 3,
        "title": "Hamiltonian Simulation: Implementing e^(iAt)",
        "duration": "6 min",
        "xp_reward": 50,
        "objective": "Understand Stone's theorem: why Hermiticity of A enables unitary Hamiltonian simulation U(t) = e^(i A t).",
        "explanation": "Quantum computers can only execute **unitary operations** ($U^\\dagger U = I$). However, a general matrix $A$ in a linear system is not unitary!\n\nHow can a quantum circuit compute with a non-unitary matrix $A$?\nBy leveraging **Stone's Theorem on one-parameter unitary groups**: For any Hermitian matrix $A = A^\\dagger$, the matrix exponential:\n$$U(t) = e^{i A t}$$\nis **strictly unitary** for all real numbers $t \\in \\mathbb{R}$!\n\nThis means that the matrix $A$ can be physically simulated on a quantum computer as the Hamiltonian of an evolving quantum system! The eigenvalues $\\lambda_j$ of $A$ become energy eigenvalues that govern phase evolution:\n$$e^{i A t} |u_j\\rangle = e^{i \\lambda_j t} |u_j\\rangle$$\n\nTo simulate $e^{i A t}$ efficiently, $A$ must be **sparse** (having at most $s$ non-zero entries per row). Advanced Hamiltonian simulation techniques (such as Trotter-Suzuki decomposition or Qubitization) implement $e^{i A t}$ using $\\mathcal{O}(s^2 t)$ quantum gates.",
        "math": "Unitary check using matrix exponentials:\n$$(e^{i A t})^\\dagger e^{i A t} = e^{-i A^\\dagger t} e^{i A t} = e^{-i A t} e^{i A t} = e^0 = I \\quad (\\text{since } A = A^\\dagger)$$\nAction on an eigenstate:\n$$e^{i A t} |u_j\\rangle = \\sum_{k=0}^\\infty \\frac{(i t)^k}{k!} A^k |u_j\\rangle = \\sum_{k=0}^\\infty \\frac{(i t)^k}{k!} \\lambda_j^k |u_j\\rangle = e^{i \\lambda_j t} |u_j\\rangle$$",
        "circuitConnection": "In QubitLab, the Hamiltonian simulation operator $e^{i A t}$ is synthesized using controlled rotation and entangling gate networks.",
        "visualIntuition": "Imagine matrix $A$ is the shape of a drum head. Striking the drum causes it to vibrate over time $t$. The physical sound waves vibrating across the drum are described by $e^{i A t}$.",
        "example": "If $A = Z = \\begin{pmatrix} 1 & 0 \\\\ 0 & -1 \\end{pmatrix}$, then $e^{i Z t} = \\begin{pmatrix} e^{it} & 0 \\\\ 0 & e^{-it} \\end{pmatrix}$, which is simply an $R_z(-2t)$ single-qubit rotation gate!",
        "commonMistakes": [
          "Attempting to simulate $e^{i A t}$ when $A$ is non-Hermitian. If $A$ is not Hermitian, $e^{i A t}$ is not unitary, and probability norms will blow up or decay exponentially.",
          "Forgetting to normalize the matrix $A$ so that its eigenvalues satisfy $|\\lambda_j t| < 2\\pi$."
        ],
        "checkQuestion": "Under what mathematical condition on matrix A is the matrix exponential e^(i A t) guaranteed to be unitary for all t?",
        "checkAnswer": "When matrix A is Hermitian (A = A†).",
        "nextConnection": "Now that we can apply e^(iAt), how do we extract the eigenvalues λ_j? We use Quantum Phase Estimation (QPE).",
        "qiskitCode": "# Simulating e^(iAt) via matrix exponential in SciPy\nfrom scipy.linalg import expm\nA = np.array([[1.5, 0.5], [0.5, 1.5]])\nU = expm(1j * A * np.pi / 2)\nprint('Is U unitary:', np.allclose(U.conj().T @ U, np.eye(2)))"
      },
      {
        "id": "hhl-phase-4",
        "order": 4,
        "title": "Quantum Phase Estimation (QPE) on Matrix A",
        "duration": "6 min",
        "xp_reward": 50,
        "objective": "Understand how QPE extracts the eigenvalues λ_j of matrix A into a binary superposition in the clock register.",
        "explanation": "Now comes the first major phase of HHL: **Quantum Phase Estimation (QPE)**.\n\nWe introduce an $m$-qubit auxiliary register called the **clock register**, initialized to $|0\\dots0\\rangle$.\n1. Apply a layer of Hadamard gates $H^{\\otimes m}$ to the clock register, creating equal superposition: $\\frac{1}{\\sqrt{2^m}}\\sum_{\\tau=0}^{2^m-1} |\\tau\\rangle$.\n2. Apply **controlled Hamiltonian evolution gates**: controlled by clock qubit $\\tau$, apply $e^{i A \\tau t_0}$ to the data register $|b\\rangle$.\n   Since $|b\\rangle = \\sum \\beta_j |u_j\\rangle$, each eigencomponent acquires phase:\n   $$\\frac{1}{\\sqrt{2^m}} \\sum_{\\tau} |\\tau\\rangle e^{i A \\tau t_0} |u_j\\rangle = \\left( \\frac{1}{\\sqrt{2^m}} \\sum_{\\tau} e^{i \\lambda_j \\tau t_0} |\\tau\\rangle \\right) |u_j\\rangle$$\n3. Apply the **Inverse Quantum Fourier Transform ($QFT^\\dagger$)** to the clock register.\n\nAs we learned in Phase Estimation, the $QFT^\\dagger$ converts the periodic phase $e^{i \\lambda_j \\tau t_0}$ into a binary integer in the clock register:\n$$|\\psi_1\\rangle = \\sum_{j=1}^N \\beta_j |\\tilde{\\lambda}_j\\rangle |u_j\\rangle$$\n\nLook at this state: the clock register now stores the binary representation $|\\tilde{\\lambda}_j\\rangle$ of the eigenvalue $\\lambda_j$, entangled with its corresponding eigenvector $|u_j\\rangle$ in the data register!",
        "math": "QPE transformation on the input state:\n$$|0^m\\rangle |b\\rangle = |0^m\\rangle \\sum_j \\beta_j |u_j\\rangle \\xrightarrow{\\text{QPE}} \\sum_{j=1}^N \\beta_j |\\tilde{\\lambda}_j\\rangle |u_j\\rangle$$\nwhere $\\tilde{\\lambda}_j \\approx \\frac{2^m \\lambda_j t_0}{2\\pi}$ is the $m$-bit binary approximation of eigenvalue $\\lambda_j$.",
        "circuitConnection": "In QubitLab, the QPE stage spans the clock wires and data wire, ending with an Inverse QFT block on the clock register.",
        "visualIntuition": "Imagine an optical spectrometer. A composite beam of light ($|b\\rangle$) enters a prism. The prism separates the beam into distinct wavelengths (eigenvalues $\\lambda_j$), labeling each beam with its frequency.",
        "example": "For our $2 \\times 2$ matrix with eigenvalues $\\lambda_1 = 2$ and $\\lambda_2 = 1$: with properly scaled $t_0$, QPE transforms $|00\\rangle |b\\rangle$ into $\\beta_1 |10\\rangle |u_1\\rangle + \\beta_2 |01\\rangle |u_2\\rangle$.",
        "commonMistakes": [
          "Using too few clock qubits, causing eigenvalue rounding errors (phase leakage).",
          "Measuring the clock register now. Measuring collapses the superposition onto a single eigenvalue!"
        ],
        "checkQuestion": "What information is encoded in the clock register after the Quantum Phase Estimation stage of HHL?",
        "checkAnswer": "The binary representation of the eigenvalues |λ̃_j⟩ of matrix A, entangled with their corresponding eigenvectors |u_j⟩.",
        "nextConnection": "Now comes the central trick of HHL: how do we invert the eigenvalues to get 1/λ_j? Controlled Rotations!",
        "qiskitCode": "# Concept of QPE state in HHL\nprint('State after QPE: sum of beta_j |lambda_j>_clock |u_j>_data')"
      },
      {
        "id": "hhl-phase-5",
        "order": 5,
        "title": "Controlled Rotation for Eigenvalue Inversion (1/λ)",
        "duration": "6 min",
        "xp_reward": 50,
        "objective": "Understand how a controlled Ry rotation on an ancilla qubit encodes 1/λ_j into the probability amplitude of state |1⟩.",
        "explanation": "We now have the eigenvalues $\\lambda_j$ written in the clock register. How do we compute their reciprocal $1/\\lambda_j$ and transfer it into the quantum amplitudes?\n\nWe introduce a single **ancilla qubit** $|0\\rangle_{\\text{anc}}$, and perform a **controlled rotation** $R_y(\\theta(\\lambda))$ conditioned on the clock register:\n$$|\\tilde{\\lambda}_j\\rangle |0\\rangle_{\\text{anc}} \\xrightarrow{C-R_y} |\\tilde{\\lambda}_j\\rangle \\left( \\sqrt{1 - \\frac{C^2}{\\lambda_j^2}} |0\\rangle_{\\text{anc}} + \\frac{C}{\\lambda_j} |1\\rangle_{\\text{anc}} \\right)$$\nwhere $C$ is a normalization constant chosen such that $C \\le \\lambda_{\\text{min}}$ so that $\\frac{C}{\\lambda_j} \\le 1$.\n\nTo achieve this, the rotation angle $\\theta$ is set to:\n$$\\theta(\\lambda_j) = 2 \\arcsin\\left( \\frac{C}{\\lambda_j} \\right)$$\nSince $\\sin(\\theta/2) = \\sin(\\arcsin(C/\\lambda_j)) = \\frac{C}{\\lambda_j}$, applying $R_y(\\theta)$ to $|0\\rangle$ gives:\n$$R_y(\\theta)|0\\rangle = \\cos(\\theta/2)|0\\rangle + \\sin(\\theta/2)|1\\rangle = \\sqrt{1 - \\frac{C^2}{\\lambda_j^2}} |0\\rangle + \\frac{C}{\\lambda_j} |1\\rangle$$\n\nLook at the coefficient in front of the ancilla state $|1\\rangle$: it is **proportional to $1/\\lambda_j$**! We have successfully inverted the eigenvalue!",
        "math": "Controlled rotation action:\n$$R_y\\left( 2\\arcsin\\frac{C}{\\lambda_j} \\right) |0\\rangle = \\sqrt{1 - \\frac{C^2}{\\lambda_j^2}}|0\\rangle + \\frac{C}{\\lambda_j}|1\\rangle$$\nTotal state after rotation:\n$$|\\psi_2\\rangle = \\sum_{j=1}^N \\beta_j |\\tilde{\\lambda}_j\\rangle |u_j\\rangle \\left( \\sqrt{1 - \\frac{C^2}{\\lambda_j^2}} |0\\rangle_{\\text{anc}} + \\frac{C}{\\lambda_j} |1\\rangle_{\\text{anc}} \\right)$$",
        "circuitConnection": "In QubitLab, the controlled rotation is wired from the clock register qubits to the single ancilla rotation wire.",
        "visualIntuition": "Imagine an analog volume knob. For loud eigenvalues ($\\lambda=10$), you turn the knob down ($1/10$). For quiet eigenvalues ($\\lambda=2$), you turn the knob up ($1/2$). The ancilla's tilt angle stores this inverted volume.",
        "example": "If $\\lambda = 2$ and $C = 1$: $\\theta = 2\\arcsin(1/2) = 2(30^\\circ) = 60^\\circ$. The ancilla is rotated by $60^\\circ$, giving amplitude $\\sin(30^\\circ) = 0.5 = 1/2$.",
        "commonMistakes": [
          "Setting $C > \\lambda_{\\text{min}}$. If $C > \\lambda_j$, then $C/\\lambda_j > 1$, making $\\arcsin(C/\\lambda_j)$ undefined (complex angles)!",
          "Forgetting the factor of 2 in $\\theta = 2\\arcsin(C/\\lambda)$. In the $R_y$ definition, the angle is divided by 2: $R_y(\\theta)|0\\rangle = \\cos(\\theta/2)|0\\rangle + \\sin(\\theta/2)|1\\rangle$."
        ],
        "checkQuestion": "What is the amplitude of the ancilla's |1⟩ state after applying Ry(2 arcsin(C/λ_j)) to |0⟩?",
        "checkAnswer": "C / λ_j (the exact reciprocal of the eigenvalue scaled by constant C).",
        "nextConnection": "Notice that the clock register is still entangled with the solution. We must remove it using Uncomputation!",
        "qiskitCode": "# Controlled rotation angle calculation\nimport numpy as np\nC = 1.0; lam = 2.0\ntheta = 2 * np.arcsin(C / lam)\nprint(f'Rotation angle theta for lambda={lam}: {np.degrees(theta):.2f} deg')"
      },
      {
        "id": "hhl-phase-6",
        "order": 6,
        "title": "Uncomputation via Inverse QPE",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Understand uncomputation: applying QPE† to reset the clock register to |0^m⟩, cleanly disentangling it from the data register.",
        "explanation": "Look at our quantum state after the controlled rotation:\n$$|\\psi_2\\rangle = \\sum_{j=1}^N \\beta_j |\\tilde{\\lambda}_j\\rangle_{\\text{clock}} |u_j\\rangle_{\\text{data}} \\left( \\dots |0\\rangle_{\\text{anc}} + \\frac{C}{\\lambda_j} |1\\rangle_{\\text{anc}} \\right)$$\n\nNotice the problem: the clock register still holds $|\\tilde{\\lambda}_j\\rangle$! If we measure or discard the clock register right now, entanglement will collapse the sum over $j$, destroying the coherent linear combination $\\sum \\frac{\\beta_j}{\\lambda_j}|u_j\\rangle$!\n\nTo eliminate this entanglement, we perform **Uncomputation**: we apply the exact **Inverse Quantum Phase Estimation ($QPE^\\dagger$)** to the clock and data registers!\n\nBecause $QPE^\\dagger \\cdot QPE = I$, applying $QPE^\\dagger$ reverses the phase estimation, transforming $|\\tilde{\\lambda}_j\\rangle_{\\text{clock}} |u_j\\rangle_{\\text{data}} \\mapsto |0^m\\rangle_{\\text{clock}} |u_j\\rangle_{\\text{data}}$!\n\nThe clock register returns cleanly to $|0^m\\rangle$ and **factors out completely** from the rest of the circuit!",
        "math": "Uncomputation transformation:\n$$\\sum_{j=1}^N \\beta_j |\\tilde{\\lambda}_j\\rangle |u_j\\rangle \\left( \\dots |0\\rangle + \\frac{C}{\\lambda_j}|1\\rangle \\right) \\xrightarrow{\\text{QPE}^\\dagger} |0^m\\rangle_{\\text{clock}} \\otimes \\sum_{j=1}^N \\beta_j |u_j\\rangle \\left( \\dots |0\\rangle + \\frac{C}{\\lambda_j}|1\\rangle \\right)$$\nThe clock register is now completely disentangled and can be safely ignored.",
        "circuitConnection": "In QubitLab, the circuit is symmetric: Forward QPE $\\to$ Controlled Rotations $\\to$ Inverse QPE.",
        "visualIntuition": "Uncomputation is like cleaning your workbench after building a machine. You used tools (the clock register) to assemble the parts; now you put the tools back in the drawer so the machine can run freely.",
        "example": "After $QPE^\\dagger$, measuring the clock register yields $00\\dots0$ with 100% certainty, confirming that all entanglement between the clock and data has been eliminated.",
        "commonMistakes": [
          "Omitting the uncomputation step. Without $QPE^\\dagger$, tracing out the clock register leaves the data register in a mixed state (density matrix) rather than a pure solution state $|x\\rangle$!",
          "Applying uncomputation to the ancilla qubit. The ancilla holds the $1/\\lambda$ weights and must NOT be uncomputed!"
        ],
        "checkQuestion": "What is the primary physical purpose of applying Inverse QPE (uncomputation) in the HHL algorithm?",
        "checkAnswer": "To reset the clock register to |0...0⟩, completely disentangling it from the data register so that the solution state remains coherent.",
        "nextConnection": "Now we extract the solution: Post-Selection on the Ancilla Qubit.",
        "qiskitCode": "# Uncomputation concept\nprint('QPE dagger uncomputes clock register back to |00...0>')"
      },
      {
        "id": "hhl-phase-7",
        "order": 7,
        "title": "Post-Selection on Ancilla Measurement (|1⟩)",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Understand post-selection: measuring the ancilla qubit and accepting the data register state only when the ancilla measures |1⟩.",
        "explanation": "After uncomputation, the state of the data register and ancilla qubit is:\n$$|\\psi_3\\rangle = \\sum_{j=1}^N \\beta_j |u_j\\rangle \\left( \\sqrt{1 - \\frac{C^2}{\\lambda_j^2}} |0\\rangle_{\\text{anc}} + \\frac{C}{\\lambda_j} |1\\rangle_{\\text{anc}} \\right)$$\nWe can group this into two terms based on the ancilla state:\n$$|\\psi_3\\rangle = |\\text{garbage}\\rangle |0\\rangle_{\\text{anc}} + \\left( C \\sum_{j=1}^N \\frac{\\beta_j}{\\lambda_j} |u_j\\rangle \\right) |1\\rangle_{\\text{anc}}$$\n\nLook at the term multiplying $|1\\rangle_{\\text{anc}}$: recall that $\\sum \\frac{\\beta_j}{\\lambda_j}|u_j\\rangle$ is **precisely the solution vector $|x\\rangle = A^{-1}|b\\rangle$**!\n\nWe now measure the ancilla qubit in the computational basis:\n- If the ancilla measures **$0$**: the inversion failed. We discard the run and restart (or apply amplitude amplification).\n- If the ancilla measures **$1$**: the measurement collapses the data register onto the exact normalized solution state $|x\\rangle$!\n$$|x\\rangle = \\frac{\\sum_{j=1}^N \\frac{\\beta_j}{\\lambda_j} |u_j\\rangle}{\\sqrt{\\sum_{j=1}^N \\frac{\\beta_j^2}{\\lambda_j^2}}} \\propto A^{-1}|b\\rangle$$\nThis technique is called **post-selection**!",
        "math": "Probability of measuring $|1\\rangle$ on the ancilla:\n$$P_{\\text{succ}} = \\sum_{j=1}^N |\\beta_j|^2 \\frac{C^2}{\\lambda_j^2} = C^2 \\|A^{-1}|b\\rangle\\|^2 \\ge \\frac{C^2}{\\lambda_{\\text{max}}^2} = \\mathcal{O}\\left(\\frac{1}{\\kappa^2}\\right)$$\nUsing Grover-style amplitude amplification, the success probability can be boosted to $\\mathcal{O}(1)$ with only $\\mathcal{O}(\\kappa)$ repetitions.",
        "circuitConnection": "In QubitLab, the ancilla wire contains a measurement meter. When the ancilla output is 1, the data register is validated as the solution $|x\\rangle$.",
        "visualIntuition": "Imagine sifting gold from gravel. You pour the mixture over a sieve (ancilla). The gravel drops through ($|0\\rangle$); the gold nuggets are caught on top ($|1\\rangle$). When you see gold on the sieve, you keep the sample.",
        "example": "For our $2 \\times 2$ matrix: $A^{-1}|b\\rangle = 0.75|0\\rangle - 0.25|1\\rangle$. When the ancilla measures 1, the data qubit is in state $\\frac{0.75|0\\rangle - 0.25|1\\rangle}{\\sqrt{0.75^2 + 0.25^2}} = \\frac{3|0\\rangle - |1\\rangle}{\\sqrt{10}}$!",
        "commonMistakes": [
          "Keeping the data when the ancilla measures 0. When the ancilla measures 0, the data register contains unphysical garbage and MUST be discarded!",
          "Assuming post-selection success probability is always high. For ill-conditioned matrices (large $\\kappa$), $P_{\\text{succ}}$ can be very small without amplitude amplification."
        ],
        "checkQuestion": "What is the state of the data register when the ancilla qubit is successfully measured in state |1⟩?",
        "checkAnswer": "The normalized solution state |x⟩ proportional to A^(-1)|b⟩.",
        "nextConnection": "What can we actually DO with the quantum solution state |x⟩? Let's analyze the critical Readout Caveat.",
        "qiskitCode": "# Post-selection condition\nancilla_measurement = 1\nif ancilla_measurement == 1:\n    print('Success: Data register now holds solution |x> proportional to A^(-1)|b>')"
      },
      {
        "id": "hhl-phase-8",
        "order": 8,
        "title": "The Readout Caveat: What HHL Actually Outputs",
        "duration": "6 min",
        "xp_reward": 50,
        "objective": "Understand the HHL readout caveat: why extracting the full classical vector x requires O(N) queries, and why HHL is used for expectation values ⟨x|M|x⟩.",
        "explanation": "One of the most frequent misconceptions about quantum algorithms is that HHL gives you a text file containing the numbers $x_1, x_2, \\dots, x_N$ in logarithmic time. **It does not!**\n\nThe output of HHL is a **quantum state**:\n$$|x\\rangle = \\sum_{i=0}^{N-1} x_i |i\\rangle$$\nAccording to quantum mechanics, you cannot look at a quantum state and read all its amplitudes. If you measure $|x\\rangle$, you observe a single random index $i$ with probability $|x_i|^2$. To reconstruct all $N$ classical entries $x_i$ via quantum state tomography, you would need to run the circuit at least $\\mathcal{O}(N \\log N)$ times, which completely erases the exponential speedup!\n\n**Where is HHL actually useful?**\nHHL provides an exponential speedup when you do **not** need the entire vector $\\vec{x}$, but rather want to compute a **global statistical feature** or expectation value:\n$$\\langle x | M | x \\rangle$$\nwhere $M$ is an observable. Examples include:\n- In financial risk modeling: Is the total portfolio variance below a threshold? ($M = \\Sigma$)\n- In engineering: What is the total kinetic energy or average stress? ($M = K$)\n- In quantum machine learning: What is the classification score $\\vec{w}^T \\vec{x}$?",
        "math": "Expectation value evaluation in $\\mathcal{O}(1)$ measurements:\n$$\\langle M \\rangle = \\langle x | M | x \\rangle$$\nTomographic full vector reconstruction:\n$$N_{\\text{shots}} = \\mathcal{O}\\left( \\frac{N \\log N}{\\epsilon^2} \\right) \\implies \\text{No exponential speedup!}$$",
        "circuitConnection": "In QubitLab, the solution state $|x\\rangle$ is evaluated by measuring observable operators on the data qubit.",
        "visualIntuition": "Imagine an astronomical survey of 100 billion stars. You don't need the GPS coordinates of every single star; you just want to know the center of mass of the galaxy. HHL gives you the center of mass in 1 second.",
        "example": "In our $2 \\times 2$ system: rather than reading $x_1 = 0.75, x_2 = -0.25$, we measure the observable $M = Z$: $\\langle Z \\rangle = |x_1|^2 - |x_2|^2 = \\frac{9}{10} - \\frac{1}{10} = +0.80$, requiring only a few dozen shots!",
        "commonMistakes": [
          "Advertising HHL as a drop-in replacement for classical linear algebra solvers in all software. HHL is useful ONLY when input state preparation is efficient and output expectation values are sufficient.",
          "Ignoring the state preparation problem (the cost of preparing $|b\\rangle$)."
        ],
        "checkQuestion": "Why does attempting to extract all N classical numerical entries of vector x destroy the exponential speedup of HHL?",
        "checkAnswer": "Because quantum state tomography requires at least O(N log N) measurements to reconstruct all N amplitudes, eliminating the logarithmic speedup.",
        "nextConnection": "Let's examine the condition number κ and how it impacts HHL runtime.",
        "qiskitCode": "# Expectation value of solution state vs tomography\nprint('HHL speedup holds for evaluating expectation values <x|M|x>, not full vector tomography!')"
      },
      {
        "id": "hhl-phase-9",
        "order": 9,
        "title": "Condition Number (κ) & Sparsity Constraints",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Understand the condition number κ = λ_max / λ_min, matrix sparsity s, and their quadratic impact on HHL runtime O(s² κ² / ε).",
        "explanation": "The runtime of HHL is not just $\\mathcal{O}(\\log N)$. The full complexity bound is:\n$$T_{\\text{HHL}} = \\mathcal{O}\\left( \\frac{s^2 \\kappa^2 \\log(N)}{\\epsilon} \\right)$$\nLet's understand the two key physical parameters that govern this runtime:\n\n1. **Sparsity ($s$)**:\nA matrix is $s$-sparse if it has at most $s$ non-zero entries in any row or column. Efficient Hamiltonian simulation requires $s = \\mathcal{O}(\\text{poly}(\\log N))$. If $A$ is dense ($s = N$), Hamiltonian simulation requires $\\mathcal{O}(N)$ gates, destroying the quantum advantage.\n\n2. **Condition Number ($\\kappa$)**:\nThe condition number is the ratio of the largest to smallest eigenvalue:\n$$\\kappa = \\frac{|\\lambda_{\\text{max}}|}{|\\lambda_{\\text{min}}|}$$\nWhy does $\\kappa$ matter so much?\n- To avoid exceeding rotation bounds, the constant $C$ in the controlled rotation must satisfy $C \\le |\\lambda_{\\text{min}}|$.\n- The post-selection success probability scales as $P_{\\text{succ}} \\sim (C / \\lambda_{\\text{max}})^2 = (\\lambda_{\\text{min}} / \\lambda_{\\text{max}})^2 = 1/\\kappa^2$!\n- An ill-conditioned matrix (e.g. $\\kappa = 1,000$) has success probability $\\sim 10^{-6}$, requiring millions of repetitions!",
        "math": "Condition number definition:\n$$\\kappa = \\frac{\\sigma_{\\text{max}}(A)}{\\sigma_{\\text{min}}(A)} = \\frac{|\\lambda_{\\text{max}}|}{|\\lambda_{\\text{min}}|}$$\nPost-selection success probability without amplitude amplification:\n$$P_{\\text{succ}} \\ge \\frac{1}{\\kappa^2}$$\nWith amplitude amplification: $T = \\mathcal{O}(\\kappa)$.",
        "circuitConnection": "In QubitLab, the matrix inspector displays the condition number $\\kappa$ and sparsity $s$ before launching the simulation.",
        "visualIntuition": "Think of the condition number as the aspect ratio of an ellipse. A circle has $\\kappa = 1$ (well-behaved). A needle-thin oval has $\\kappa = 10,000$ (tiny changes in $\\vec{b}$ cause wild, unstable swings in $\\vec{x}$).",
        "example": "For our $2 \\times 2$ matrix with $\\lambda_1 = 2$ and $\\lambda_2 = 1$: $\\kappa = 2 / 1 = 2.0$. The matrix is exceptionally well-conditioned, with post-selection success probability $P_{\\text{succ}} \\approx 25\\%$.",
        "commonMistakes": [
          "Attempting to run HHL on nearly singular matrices where $\\lambda_{\\text{min}} \\to 0$ ($\\kappa \\to \\infty$). The algorithm will stall with zero post-selection successes.",
          "Assuming dense matrices can be simulated efficiently without specialized QRAM architectures."
        ],
        "checkQuestion": "What is the condition number κ of a matrix with maximum eigenvalue 8.0 and minimum eigenvalue 0.5?",
        "checkAnswer": "κ = 8.0 / 0.5 = 16.0.",
        "nextConnection": "Let's review the most common circuit assembly bugs when building HHL circuits in QubitLab.",
        "qiskitCode": "# Computing condition number in NumPy\nA = np.array([[1.5, 0.5], [0.5, 1.5]])\nkappa = np.linalg.cond(A)\nprint(f'Condition number kappa: {kappa:.2f}')"
      },
      {
        "id": "hhl-phase-10",
        "order": 10,
        "title": "Common Circuit Mistakes & Debugging in HHL",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Identify and debug the three most common HHL circuit errors: missing uncomputation, wrong rotation angles, and incorrect clock calibration.",
        "explanation": "HHL is the most complex algorithmic circuit in introductory quantum computing. When debugging in Quantum Studio, check for these three primary failure modes:\n\n1. **Omission of the Inverse QPE (Uncomputation)**:\nIf you omit the $QPE^\\dagger$ stage after the controlled rotations, the clock register remains entangled with the solution. When you measure the data qubit, you observe a random mixture rather than the pure solution vector $|x\\rangle$!\n\n2. **Inverted Angle in the Controlled Rotation**:\nThe rotation angle must be set to $\\theta = 2\\arcsin(C/\\lambda_j)$. If a student accidentally implements $2\\arcsin(C \\cdot \\lambda_j)$, the circuit *multiplies* by $A$ instead of *inverting* $A$!\n\n3. **Clock Register Time Scaling Mismatch ($t_0$)**:\nThe evolution time $t_0$ in $e^{i A t_0}$ must be calibrated so that all eigenvalues $\\lambda_j$ map into fractional phase intervals without aliasing around $2\\pi$. If $\\lambda_j t_0 > 2\\pi$, the phase wraps around, reporting the wrong eigenvalue.",
        "math": "HHL verification checklist:\n$$\\text{Check 1: Forward QPE} \\implies \\sum \\beta_j |\\lambda_j\\rangle |u_j\\rangle$$\n$$\\text{Check 2: Controlled Rotation} \\implies \\sin(\\theta/2) = C/\\lambda_j$$\n$$\\text{Check 3: Inverse QPE} \\implies \\text{Clock resets to } |0^m\\rangle$$\n$$\\text{Check 4: Post-Selection} \\implies \\text{Filter for Ancilla} = 1$$",
        "circuitConnection": "In QubitLab, check your canvas symmetry: verify that the gates in the second half of the circuit mirror the first half, with the controlled rotation in the center.",
        "visualIntuition": "HHL is like an archway bridge. The left pillar is QPE; the keystone is the controlled rotation; the right pillar is $QPE^\\dagger$. If you forget the right pillar, the bridge collapses.",
        "example": "Symptom: The output amplitudes are $(0.25, 0.75)$ instead of $(0.75, -0.25)$. Diagnosis: The rotation angles were proportional to $\\lambda$ instead of $1/\\lambda$, computing $A|b\\rangle$ instead of $A^{-1}|b\\rangle$.",
        "commonMistakes": [
          "Discarding post-selection shots where ancilla = 0.",
          "Using non-Hermitian matrices without block-encoding dilation."
        ],
        "checkQuestion": "What error occurs in HHL if the student sets the rotation angle proportional to λ rather than 1/λ?",
        "checkAnswer": "The circuit computes matrix multiplication A|b⟩ rather than matrix inversion A^(-1)|b⟩.",
        "nextConnection": "Now let's step through the exact 4-qubit circuit implementation for our 2x2 linear system.",
        "qiskitCode": "# Verification test for HHL solution\nx_expected = np.array([0.75, -0.25])\nx_normalized = x_expected / np.linalg.norm(x_expected)\nprint('Expected normalized solution state amplitudes:', np.round(x_normalized, 4))"
      },
      {
        "id": "hhl-phase-11",
        "order": 11,
        "title": "Circuit Implementation for 2x2 Matrix System",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Step through the exact 4-qubit circuit implementation for solving a 2x2 linear system in Quantum Studio.",
        "explanation": "Let's assemble the canonical 4-qubit HHL circuit for solving:\n$$\\begin{pmatrix} 1.5 & 0.5 \\\\ 0.5 & 1.5 \\end{pmatrix} \\vec{x} = \\begin{pmatrix} 1 \\\\ 0 \\end{pmatrix}$$\n\n- **Register Allocation**:\n  - Qubit $q_0$: Data Register (starts in $|b\\rangle = |0\\rangle$)\n  - Qubits $q_1, q_2$: 2-qubit Clock Register (starts in $|00\\rangle$)\n  - Qubit $q_3$: Ancilla Rotation Qubit (starts in $|0\\rangle$)\n\n- **Circuit Stages**:\n  1. **Clock Superposition**: Apply $H$ gates to clock qubits $q_1, q_2$.\n  2. **Controlled Hamiltonian Evolution**: Apply controlled-$e^{i A t}$ from $q_1, q_2$ to data qubit $q_0$.\n  3. **Inverse QFT on Clock**: Apply $QFT^\\dagger$ on $q_1, q_2$ (decomposes into SWAP, $H$, and $CR_2^\\dagger$).\n  4. **Controlled Rotation**: Apply controlled-$R_y$ from clock qubits $q_1, q_2$ to ancilla qubit $q_3$ with angles $\\theta_1 = 2\\arcsin(1/2) = 60^\\circ$ and $\\theta_2 = 2\\arcsin(1/1) = 180^\\circ$.\n  5. **Uncomputation (Inverse QPE)**: Apply forward QFT on clock, followed by inverted controlled evolutions, resetting $q_1, q_2$ to $|00\\rangle$.\n  6. **Readout**: Measure ancilla $q_3$. When $q_3 = 1$, measure data qubit $q_0$!",
        "math": "Solution state verification:\n$$|x\\rangle = \\frac{1}{\\sqrt{10}} (3|0\\rangle - |1\\rangle)$$\nProbability of measuring 0 on data qubit: $P(0) = |3/\\sqrt{10}|^2 = 9/10 = 90\\%$.\nProbability of measuring 1 on data qubit: $P(1) = |-1/\\sqrt{10}|^2 = 1/10 = 10\\%$.\nRatio: $P(0)/P(1) = 9/1 = (0.75 / -0.25)^2 = 3^2 = 9$! Exactly matches classical algebra!",
        "circuitConnection": "In QubitLab, the 4 wires represent $q_0$ (data), $q_1, q_2$ (clock), and $q_3$ (ancilla).",
        "visualIntuition": "Watch the probability bars on data qubit $q_0$: when post-selected on $q_3=1$, the bar for 0 reaches 90% and the bar for 1 reaches 10%.",
        "example": "Run 1,000 shots in Quantum Studio: ~250 shots have ancilla $q_3=1$. Among those 250 post-selected shots, ~225 measure $q_0=0$ and ~25 measure $q_0=1$. Ratio is exactly $9:1$!",
        "commonMistakes": [
          "Measuring $q_0$ without conditioning on $q_3=1$. Without post-selection, the 0 and 1 probabilities reflect unphysical noise.",
          "Using the wrong sign in the $CR_2$ gate inside the clock QFT."
        ],
        "checkQuestion": "In our 2x2 HHL example, what is the theoretical probability ratio P(0)/P(1) of the post-selected data qubit?",
        "checkAnswer": "9 to 1 (90% probability for 0 vs 10% probability for 1), matching (0.75 / -0.25)² = 9.",
        "nextConnection": "Now you are ready to assemble and execute the complete HHL algorithm in Quantum Studio!",
        "qiskitCode": "# 4-qubit HHL circuit template\nfrom qiskit import QuantumCircuit\nqc = QuantumCircuit(4, 2)  # q0=data, q1,q2=clock, q3=ancilla\nprint('4-qubit HHL circuit architecture ready')"
      },
      {
        "id": "hhl-phase-12",
        "order": 12,
        "title": "Full HHL Algorithm Workflow & Mission Synthesis",
        "duration": "5 min",
        "xp_reward": 50,
        "objective": "Execute the full HHL algorithm in Quantum Studio, verify the solution to Ax = b, and claim your Mission 12 XP.",
        "explanation": "Congratulations! You have mastered the most sophisticated algorithm in the quantum algorithms curriculum: the HHL Quantum Linear Systems Algorithm.\n\nLet's review the complete pipeline you have synthesized:\n1. **Vector Encoding**: Encode classical vector $\\vec{b}$ into quantum data state $|b\\rangle$.\n2. **QPE**: Simulate $e^{i A t}$ to extract matrix eigenvalues $\\lambda_j$ into the clock register.\n3. **Eigenvalue Inversion**: Rotate an ancilla qubit via controlled-$R_y(2\\arcsin(C/\\lambda_j))$ to encode $1/\\lambda_j$ into amplitudes.\n4. **Uncomputation**: Apply $QPE^\\dagger$ to reset the clock register to $|0\\dots0\\rangle$, eliminating entanglement.\n5. **Post-Selection & Readout**: Measure ancilla qubit in state $|1\\rangle$ and extract the solution expectation values from the data register.\n\nEnter Quantum Studio now to wire your HHL circuit, verify the 9:1 probability ratio on the data qubit, and claim your Quantum Computing Researcher badge for Mission 12!",
        "math": "Complete HHL unitary pipeline:\n$$|x\\rangle = \\left( \\langle 1|_{\\text{anc}} \\otimes I \\right) \\cdot (\\text{QPE}^\\dagger \\otimes I) \\cdot (C-R_y) \\cdot (\\text{QPE} \\otimes I) \\cdot (|b\\rangle |0^m\\rangle |0\\rangle_{\\text{anc}})$$\n$$|x\\rangle \\propto A^{-1}|b\\rangle$$\nExponential speedup achieved: $\\mathcal{O}(\\log N)$ operations.",
        "circuitConnection": "In QubitLab, Mission 12 tests your circuit against the $2 \\times 2$ matrix system and verifies that post-selected measurement statistics match $A^{-1}\\vec{b}$.",
        "visualIntuition": "Watch the entire quantum system interact across all 4 wires: clock superposition $\\to$ eigenvalue labeling $\\to$ reciprocal rotation $\\to$ clean uncomputation $\\to$ exact solution state readout.",
        "example": "With your circuit complete, run the simulator in Quantum Studio: post-selecting on ancilla=1 displays the exact $90\\% / 10\\%$ amplitude ratio, satisfying all success criteria for Mission 12.",
        "commonMistakes": [
          "Exceeding the permitted gate budget.",
          "Leaving the clock register uncomputed."
        ],
        "checkQuestion": "What is the ultimate theoretical significance of the HHL algorithm for quantum computing?",
        "checkAnswer": "It proves that quantum computers can invert sparse linear systems of dimension N in logarithmic time O(log N), providing the foundation for quantum machine learning and PDE simulation.",
        "nextConnection": "Congratulations on completing the entire 12-Mission QubitLab Quantum Curriculum! Enter Quantum Studio to claim your final XP!",
        "qiskitCode": "# Ready to simulate in Quantum Studio\nprint('HHL Mission 12 ready for Quantum Studio simulation!')"
      }
    ]
  }
};

function enrichPhase(phase: CurriculumPhase, prevTitle?: string): CurriculumPhase {
  const act = getCurriculumActivity(phase.id);
  const chk = getCurriculumCheckpoint(phase.id);
  return {
    ...phase,
    activity: phase.activity || act,
    checkpoint: phase.checkpoint || chk,
    whyNecessary:
      phase.whyNecessary ||
      `Understanding ${phase.title.toLowerCase()} is essential for mastering the quantum state transitions and circuit operations of this algorithm.`,
    prevConnection:
      phase.prevConnection ||
      (prevTitle
        ? `Builds directly upon the principles established in "${prevTitle}".`
        : `Establishes foundational physical and mathematical principles for the entire protocol.`),
    predictionQuestion:
      phase.predictionQuestion ||
      (act?.question || phase.checkQuestion || `What will be the resulting state or measurement probability after this stage?`),
    verification:
      phase.verification ||
      (act?.explanation || phase.checkAnswer || `Verified through the statevector amplitudes and projective measurement outcomes.`),
  };
}

const enrichedCurriculaCache = new Map<string, ProjectCurriculum>();

function enrichCurriculum(raw: ProjectCurriculum): ProjectCurriculum {
  if (enrichedCurriculaCache.has(raw.projectId)) {
    return enrichedCurriculaCache.get(raw.projectId)!;
  }
  const enriched: ProjectCurriculum = {
    ...raw,
    phases: raw.phases.map((p, idx, arr) => {
      const prevTitle = idx > 0 ? arr[idx - 1].title : undefined;
      return enrichPhase(p, prevTitle);
    }),
  };
  enrichedCurriculaCache.set(raw.projectId, enriched);
  return enriched;
}

/**
 * Normalizes project slug/ID and retrieves curriculum.
 * Supports aliases like 'deutschjozsa', 'teleport', 'qec', 'level-1', etc.
 */
export function getProjectCurriculum(id?: string | null): ProjectCurriculum | undefined {
  if (!id) return undefined;
  const raw = String(id).toLowerCase().trim();
  let base: ProjectCurriculum | undefined = projectCurricula[raw];

  // Aliases
  if (!base) {
    if (raw === 'deutschjozsa' || raw === 'dj' || raw === 'deutsch_jozsa') base = projectCurricula['deutsch-jozsa'];
    else if (raw === 'teleport' || raw === 'teleportation-protocol') base = projectCurricula['teleportation'];
    else if (raw === 'qec' || raw === 'quantum-error-correction' || raw === 'error_correction') base = projectCurricula['error-correction'];
    else if (raw === 'grover-search') base = projectCurricula['grover'];
    else if (raw === 'qaoa-opt') base = projectCurricula['qaoa'];
    else {
      // Level number mapping (e.g. 'level-1', 'level 2', '1', etc.)
      const numMatch = raw.match(/^(?:level[-_\s]*)?(\d+)$/);
      if (numMatch) {
        const num = numMatch[1];
        const levelSlugMap: Record<string, string> = {
          '1': 'bb84',
          '2': 'deutsch-jozsa',
          '3': 'grover',
          '4': 'qaoa',
          '5': 'qnn',
          '6': 'teleportation',
          '7': 'qft',
          '8': 'simon',
          '9': 'vqe',
          '10': 'shor',
          '11': 'error-correction',
          '12': 'hhl',
        };
        if (levelSlugMap[num] && projectCurricula[levelSlugMap[num]]) {
          base = projectCurricula[levelSlugMap[num]];
        }
      }
    }
  }

  if (!base) return undefined;
  return enrichCurriculum(base);
}

/**
 * Retrieves a specific phase by order (1-indexed) or ID.
 */
export function getCurriculumPhase(projectId: string, phaseIdentifier: number | string): CurriculumPhase | undefined {
  const curriculum = getProjectCurriculum(projectId);
  if (!curriculum) return undefined;

  if (typeof phaseIdentifier === 'number') {
    return curriculum.phases.find(p => p.order === phaseIdentifier);
  }

  const normalized = String(phaseIdentifier).toLowerCase();
  return curriculum.phases.find(p => p.id.toLowerCase() === normalized || String(p.order) === normalized);
}

/**
 * Returns all 12 project curricula as a list in canonical curriculum order (1 to 12).
 */
export function getAllCurricula(): ProjectCurriculum[] {
  const order = [
    'bb84',
    'deutsch-jozsa',
    'grover',
    'qaoa',
    'qnn',
    'teleportation',
    'qft',
    'simon',
    'vqe',
    'shor',
    'error-correction',
    'hhl'
  ];
  return order.map(k => getProjectCurriculum(k)).filter(Boolean) as ProjectCurriculum[];
}

