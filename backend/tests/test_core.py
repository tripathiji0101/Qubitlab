"""QubitLab Backend Tests — Auth, Circuit Validation, Simulation."""

import pytest
from unittest.mock import patch
from app.services.quantum.validator import validate_circuit
from app.schemas.circuit import PlacementIn
from app.services.quantum.code_generator import generate_code
from app.core.security import hash_password, verify_password, create_access_token, decode_token


# ═══════════════════════ SECURITY TESTS ═══════════════════════


class TestSecurity:
    def test_password_hash_and_verify(self):
        password = "quantum123"
        hashed = hash_password(password)
        assert hashed != password
        assert verify_password(password, hashed)
        assert not verify_password("wrong", hashed)

    def test_jwt_create_and_decode(self):
        token = create_access_token("user-123", "student")
        payload = decode_token(token)
        assert payload["sub"] == "user-123"
        assert payload["role"] == "student"
        assert payload["type"] == "access"


# ═══════════════════════ VALIDATOR TESTS ═══════════════════════


class TestCircuitValidator:
    def test_valid_bell_state(self):
        placements = [
            PlacementIn(id="1", g="H", col=0, q=0),
            PlacementIn(id="2", g="CNOT", col=1, q=0, q2=1),
        ]
        result = validate_circuit(placements, qubits=2)
        assert result.valid
        assert len(result.errors) == 0

    def test_invalid_qubit_reference(self):
        placements = [
            PlacementIn(id="1", g="H", col=0, q=5),  # qubit 5 doesn't exist
        ]
        result = validate_circuit(placements, qubits=2)
        assert not result.valid
        assert any(e.code == "INVALID_QUBIT" for e in result.errors)

    def test_unsupported_gate(self):
        placements = [
            PlacementIn(id="1", g="TOFFOLI", col=0, q=0),
        ]
        result = validate_circuit(placements, qubits=3)
        assert not result.valid
        assert any(e.code == "INVALID_GATE" for e in result.errors)

    def test_cnot_missing_control(self):
        placements = [
            PlacementIn(id="1", g="CNOT", col=0, q=0),  # missing q2
        ]
        result = validate_circuit(placements, qubits=2)
        assert not result.valid
        assert any(e.code == "MISSING_CONTROL" for e in result.errors)

    def test_cnot_same_qubit(self):
        placements = [
            PlacementIn(id="1", g="CNOT", col=0, q=0, q2=0),
        ]
        result = validate_circuit(placements, qubits=2)
        assert not result.valid
        assert any(e.code == "DUPLICATE_CONTROL_TARGET" for e in result.errors)

    def test_rotation_missing_theta(self):
        placements = [
            PlacementIn(id="1", g="RX", col=0, q=0),  # missing theta
        ]
        result = validate_circuit(placements, qubits=2)
        assert not result.valid
        assert any(e.code == "INVALID_PARAMETER" for e in result.errors)

    def test_rotation_with_theta(self):
        import math
        placements = [
            PlacementIn(id="1", g="RX", col=0, q=0, theta=math.pi / 2),
        ]
        result = validate_circuit(placements, qubits=2)
        assert result.valid

    def test_too_many_qubits(self):
        placements = [PlacementIn(id="1", g="H", col=0, q=0)]
        result = validate_circuit(placements, qubits=25, max_qubits=20)
        assert not result.valid
        assert any(e.code == "TOO_MANY_QUBITS" for e in result.errors)

    def test_empty_circuit(self):
        result = validate_circuit([], qubits=2)
        assert result.valid


# ═══════════════════════ CODE GENERATOR TESTS ═══════════════════════


class TestCodeGenerator:
    def test_qiskit_bell_state(self):
        placements = [
            PlacementIn(id="1", g="H", col=0, q=0),
            PlacementIn(id="2", g="CNOT", col=1, q=0, q2=1),
        ]
        code = generate_code(placements, 2, "qiskit")
        assert "QuantumCircuit" in code
        assert "qc.h(0)" in code
        assert "qc.cx(0, 1)" in code

    def test_pennylane_bell_state(self):
        placements = [
            PlacementIn(id="1", g="H", col=0, q=0),
            PlacementIn(id="2", g="CNOT", col=1, q=0, q2=1),
        ]
        code = generate_code(placements, 2, "pennylane")
        assert "pennylane" in code
        assert "Hadamard" in code
        assert "CNOT" in code

    def test_cirq_bell_state(self):
        placements = [
            PlacementIn(id="1", g="H", col=0, q=0),
            PlacementIn(id="2", g="CNOT", col=1, q=0, q2=1),
        ]
        code = generate_code(placements, 2, "cirq")
        assert "cirq" in code
        assert "cirq.H" in code
        assert "cirq.CNOT" in code


# ═══════════════════════ QISKIT ENGINE TESTS ═══════════════════════


class TestQiskitEngine:
    """These tests require Qiskit to be installed."""

    def test_bell_state_simulation(self):
        try:
            from app.services.quantum.qiskit_engine import QiskitEngine
        except ImportError:
            pytest.skip("Qiskit not installed")

        engine = QiskitEngine()
        placements = [
            PlacementIn(id="1", g="H", col=0, q=0),
            PlacementIn(id="2", g="CNOT", col=1, q=0, q2=1),
        ]
        result = engine.simulate(placements, qubits=2, shots=1024)

        assert result.success
        assert result.amps is not None
        assert result.probs is not None
        assert len(result.amps) == 4  # 2^2 states

        # Bell state: |00⟩ and |11⟩ should have ~50% each
        prob_map = {p.state: p.p for p in result.probs}
        assert prob_map.get("00", 0) > 40  # should be ~50%
        assert prob_map.get("11", 0) > 40
        assert prob_map.get("01", 0) < 5
        assert prob_map.get("10", 0) < 5

    def test_x_gate(self):
        try:
            from app.services.quantum.qiskit_engine import QiskitEngine
        except ImportError:
            pytest.skip("Qiskit not installed")

        engine = QiskitEngine()
        placements = [PlacementIn(id="1", g="X", col=0, q=0)]
        result = engine.simulate(placements, qubits=1, shots=100)

        assert result.success
        # X gate flips |0⟩ to |1⟩
        prob_map = {p.state: p.p for p in result.probs}
        assert prob_map.get("1", 0) > 95

    def test_hadamard_gate(self):
        try:
            from app.services.quantum.qiskit_engine import QiskitEngine
        except ImportError:
            pytest.skip("Qiskit not installed")

        engine = QiskitEngine()
        placements = [PlacementIn(id="1", g="H", col=0, q=0)]
        result = engine.simulate(placements, qubits=1, shots=1024)

        assert result.success
        # H creates equal superposition
        prob_map = {p.state: p.p for p in result.probs}
        assert 40 < prob_map.get("0", 0) < 60
        assert 40 < prob_map.get("1", 0) < 60


# ═══════════════════════ CHALLENGE EVALUATOR TESTS ═══════════════════════


class TestChallengeEvaluator:
    def test_correct_bell_state(self):
        try:
            from app.services.quantum.qiskit_engine import QiskitEngine
            from app.services.quantum.base import register_engine
            register_engine(QiskitEngine())
        except ImportError:
            pytest.skip("Qiskit not installed")

        from app.services.evaluation.challenge_evaluator import evaluate_challenge

        placements = [
            PlacementIn(id="1", g="H", col=0, q=0),
            PlacementIn(id="2", g="CNOT", col=1, q=0, q2=1),
        ]
        config = {
            "target_probabilities": {"00": 0.5, "11": 0.5},
            "allowed_gates": ["H", "CNOT", "X", "M"],
            "max_depth": 4,
            "max_gate_count": 3,
            "weight_correctness": 60,
            "weight_efficiency": 20,
            "weight_depth": 10,
            "weight_gate_count": 10,
        }
        result = evaluate_challenge(placements, qubits=2, challenge_config=config)

        assert result.passed
        assert result.correctness > 90
        assert result.score > 70

    def test_wrong_answer(self):
        try:
            from app.services.quantum.qiskit_engine import QiskitEngine
            from app.services.quantum.base import register_engine
            register_engine(QiskitEngine())
        except ImportError:
            pytest.skip("Qiskit not installed")

        from app.services.evaluation.challenge_evaluator import evaluate_challenge

        # Just an X gate — produces |10⟩, not a Bell state
        placements = [PlacementIn(id="1", g="X", col=0, q=0)]
        config = {
            "target_probabilities": {"00": 0.5, "11": 0.5},
            "allowed_gates": ["H", "CNOT", "X", "M"],
            "max_depth": 4,
            "max_gate_count": 3,
        }
        result = evaluate_challenge(placements, qubits=2, challenge_config=config)

        assert not result.passed
        assert result.correctness < 50
