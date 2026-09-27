# QubitLab — Platform Differentiators & Advanced Features

Beyond the baseline requirements of SIH Problem Statement 4, QubitLab incorporates specialized, production-grade features designed to accelerate quantum understanding, maintain engagement, and provide institutional support.

---

### 1. 12-Project Comprehensive Curriculum (144 Phases, 144 Activities, 36 Checkpoints)
- **Feature**: Complete 12-tier quantum computing curriculum.
- **What it does**: Guides students from basic superposition through fault-tolerant quantum error correction and HHL linear systems across 144 interactive phases, 144 activities, and 36 checkpoints.
- **Why it is useful**: Most quantum learning tools only offer 2–3 toy examples (Bell state, basic teleportation). QubitLab covers genuine NISQ and fault-tolerant algorithms with practical applications.
- **Where implemented**: `src/lib/curriculumData.ts`, `src/lib/curriculumActivities.ts`, `backend/app/models/learning.py`, and `backend/app/seed/seed_data.py`.

---

### 2. "What-If" Counterfactual Simulation Engine
- **Feature**: Counterfactual quantum experiment engine.
- **What it does**: Allows students to ask natural-language questions like "What if I remove the Hadamard gate?" or "What happens if I put X before H?", then automatically executes both the baseline and modified circuits, calculating exact statevector divergence and explaining the physical consequences.
- **Why it is useful**: Builds deep intuition by allowing learners to explore failure modes and alternative circuit configurations safely.
- **Where implemented**: `backend/app/services/ai/what_if.py` and `src/components/quantum/WhatIfPanel.tsx`.

---

### 3. Goal-Aware AI Quantum Tutor with Deterministic Guardrails
- **Feature**: Context-aware AI tutor with deterministic fallback.
- **What it does**: Understands the user's active mission, gate placements, and simulator results. Evaluates criteria deterministically and provides guidance without hallucinating impossible quantum operations. Falls back gracefully when offline.
- **Why it is useful**: Prevents misleading AI explanations of quantum mechanics while providing instant, personalized debugging assistance.
- **Where implemented**: `backend/app/services/ai/tutor.py` and `src/components/tutor/CopilotDrawer.tsx`.

---

### 4. Curriculum-to-Tutor Seamless Handoff
- **Feature**: Context preservation between curriculum and studio.
- **What it does**: Clicking "Open in Quantum Studio" or asking the tutor from any curriculum phase transfers the exact algorithm, reference Hamiltonian, initial gate layout, and mission criteria directly into the IDE.
- **Why it is useful**: Eliminates friction between conceptual reading and interactive experimentation.
- **Where implemented**: `src/pages/ProjectDetail.tsx` and `src/pages/Workspace.tsx`.

---

### 5. Deterministic Circuit Evaluation & Optimization Engine
- **Feature**: Static analysis and rule-based circuit optimizer.
- **What it does**: Analyzes circuits for gate cancellations ($H \cdot H = I$, $X \cdot X = I$), redundant swaps, unmeasured active wires, and uninitialized ancillas. Suggests structural optimizations to reduce circuit depth.
- **Why it is useful**: Teaches circuit compilation principles critical for noisy intermediate-scale quantum (NISQ) hardware.
- **Where implemented**: `backend/app/services/evaluation/challenge_evaluator.py` and `src/lib/quantum/optimizer.ts`.

---

### 6. Interactive Prediction & Misconception Checkpoints
- **Feature**: Active prediction activities before circuit execution.
- **What it does**: Requires learners to predict measurement outcomes or phase changes before running the simulator, comparing their prediction with the actual statevector.
- **Why it is useful**: Directly targets well-known quantum misconceptions (e.g., confusing phase kickback with bit flips or assuming measurement without collapse).
- **Where implemented**: `src/lib/curriculumActivities.ts` and `src/components/learning/InteractiveActivityCard.tsx`.

---

### 7. Multi-Framework Interoperability (Qiskit Aer, PennyLane, Cirq)
- **Feature**: Unified simulation adapter architecture.
- **What it does**: Seamlessly simulates circuits through native browser engine, Qiskit Aer, PennyLane, or Cirq, normalizing all statevectors, probabilities, and measurement counts into a common contract.
- **Why it is useful**: Prepares students for multi-platform quantum software development without vendor lock-in.
- **Where implemented**: `backend/app/services/quantum/` (`qiskit_engine.py`, `pennylane_engine.py`, `cirq_engine.py`, `base.py`).

---

### 8. Exact Partial-Trace Bloch Sphere Visualization
- **Feature**: 3D Bloch sphere derived from density matrix.
- **What it does**: Computes the reduced density matrix $\rho_q = \text{Tr}_{\bar{q}}(\rho)$ for any qubit in an arbitrary multi-qubit state, calculating exact spherical coordinates $(\theta, \phi)$ and purity $r = \|\vec{a}\|$. Correctly shows maximally mixed states ($r \approx 0$) for entangled qubits.
- **Why it is useful**: Eliminates false single-qubit Bloch representations for entangled states that confuse students.
- **Where implemented**: `backend/app/api/v1/simulations.py`, `src/components/quantum/BlochSphere.tsx`.

---

### 9. Gamification & Progression (XP, Streaks, Skill Radar)
- **Feature**: Integrated motivation and reward system.
- **What it does**: Tracks idempotent XP awards across activities, challenges, and lesson completions. Maintains learning streaks and dynamically populates a 6-axis skill radar based on concept mastery.
- **Why it is useful**: Maintains high retention and completion rates across difficult mathematical and physical topics.
- **Where implemented**: `backend/app/models/progress.py`, `src/pages/Dashboard.tsx`, `src/components/profile/SkillRadar.tsx`.

---

### 10. Multi-Tenant University & Collaborative Learning
- **Feature**: Institutional classroom management and peer collaboration.
- **What it does**: Enables universities to create dedicated course environments, ingest custom syllabi/documents with RAG grounding, view class-wide progress analytics, and create peer collaboration rooms.
- **Why it is useful**: Transforms QubitLab from a solo learning sandbox into an enterprise-ready educational platform for academic institutions.
- **Where implemented**: `backend/app/api/v1/university.py`, `backend/app/api/v1/rooms.py`, `backend/app/api/v1/social.py`.
