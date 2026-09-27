"""Focused automated tests for Quantum IDE backend execution and safety."""

import pytest
from app.services.quantum.code_parser import parse_and_validate_quantum_code
from app.services.quantum.base import register_engine, get_engine
from app.services.quantum.qiskit_engine import QiskitEngine
from app.services.quantum.pennylane_engine import PennyLaneEngine
from app.services.quantum.cirq_engine import CirqEngine


@pytest.fixture(autouse=True)
def ensure_engines():
    """Ensure quantum simulation engines are registered for tests."""
    register_engine(QiskitEngine())
    register_engine(PennyLaneEngine())
    register_engine(CirqEngine())


class TestQuantumIdeCodeParser:
    def test_qiskit_bell_state_parsing(self):
        code = """from qiskit import QuantumCircuit

qc = QuantumCircuit(2)
qc.h(0)
qc.cx(0, 1)
"""
        parsed = parse_and_validate_quantum_code(code, "qiskit")
        assert parsed.success is True
        assert parsed.qubits == 2
        assert len(parsed.placements) == 2
        assert parsed.placements[0].g == "H"
        assert parsed.placements[0].q == 0
        assert parsed.placements[1].g == "CNOT"
        assert parsed.placements[1].q == 0
        assert parsed.placements[1].q2 == 1

    def test_pennylane_bell_state_parsing(self):
        code = """import pennylane as qml

dev = qml.device("default.qubit", wires=2)

@qml.qnode(dev)
def circuit():
    qml.Hadamard(wires=0)
    qml.CNOT(wires=[0, 1])
    return qml.probs(wires=range(2))
"""
        parsed = parse_and_validate_quantum_code(code, "pennylane")
        assert parsed.success is True
        assert parsed.qubits == 2
        assert len(parsed.placements) == 2
        assert parsed.placements[0].g == "H"
        assert parsed.placements[1].g == "CNOT"

    def test_cirq_bell_state_parsing(self):
        code = """import cirq

q = cirq.LineQubit.range(2)
circuit = cirq.Circuit([
    cirq.H(q[0]),
    cirq.CNOT(q[0], q[1])
])
"""
        parsed = parse_and_validate_quantum_code(code, "cirq")
        assert parsed.success is True
        assert parsed.qubits == 2
        assert len(parsed.placements) == 2
        assert parsed.placements[0].g == "H"
        assert parsed.placements[1].g == "CNOT"

    def test_native_framework_parsing(self):
        code = """from qubitlab import QuantumCircuit

qc = QuantumCircuit(2)
qc.h(0)
qc.cx(0, 1)
"""
        parsed = parse_and_validate_quantum_code(code, "native")
        assert parsed.success is True
        assert parsed.qubits == 2
        assert len(parsed.placements) == 2

    def test_invalid_qubit_index_error(self):
        code = """from qiskit import QuantumCircuit

qc = QuantumCircuit(2)
qc.h(0)
qc.cx(0, 3)
"""
        parsed = parse_and_validate_quantum_code(code, "qiskit")
        assert parsed.success is False
        assert len(parsed.errors) >= 1
        err = parsed.errors[0]
        assert err.line == 5
        assert "invalid" in err.message.lower() or "qubit" in err.message.lower()

    def test_syntax_error_reporting(self):
        code = """from qiskit import QuantumCircuit

qc = QuantumCircuit(2
qc.h(0)
"""
        parsed = parse_and_validate_quantum_code(code, "qiskit")
        assert parsed.success is False
        assert parsed.errors[0].code == "SYNTAX_ERROR"
        assert parsed.errors[0].line >= 3

    def test_security_violation_rejection(self):
        code = """import os
os.system("echo compromised")
"""
        parsed = parse_and_validate_quantum_code(code, "qiskit")
        assert parsed.success is False
        assert parsed.errors[0].code == "SECURITY_VIOLATION"


class TestQuantumIdeSimulationEngines:
    def test_qiskit_real_execution(self):
        from app.services.quantum.qiskit_engine import HAS_QISKIT
        if not HAS_QISKIT:
            pytest.skip("Qiskit is not installed in this environment")

        code = """from qiskit import QuantumCircuit

qc = QuantumCircuit(2)
qc.h(0)
qc.cx(0, 1)
"""
        parsed = parse_and_validate_quantum_code(code, "qiskit")
        engine = get_engine("qiskit")
        res = engine.simulate(parsed.placements, parsed.qubits)
        assert res.success is True
        assert res.amps is not None
        # Statevector should have ~0.707 for |00> and |11>
        amps_dict = {a.state: a.p for a in res.amps}
        assert "00" in amps_dict and amps_dict["00"] > 0.4
        assert "11" in amps_dict and amps_dict["11"] > 0.4

    def test_pennylane_real_execution(self):
        from app.services.quantum.pennylane_engine import HAS_PENNYLANE
        if not HAS_PENNYLANE:
            pytest.skip("PennyLane is not installed in this environment")

        code = """import pennylane as qml

dev = qml.device("default.qubit", wires=2)

@qml.qnode(dev)
def circuit():
    qml.Hadamard(wires=0)
    qml.CNOT(wires=[0, 1])
    return qml.probs()
"""
        parsed = parse_and_validate_quantum_code(code, "pennylane")
        engine = get_engine("pennylane")
        res = engine.simulate(parsed.placements, parsed.qubits)
        assert res.success is True
        amps_dict = {a.state: a.p for a in res.amps}
        assert "00" in amps_dict and amps_dict["00"] > 0.4
        assert "11" in amps_dict and amps_dict["11"] > 0.4

    def test_cirq_real_execution(self):
        from app.services.quantum.cirq_engine import HAS_CIRQ
        if not HAS_CIRQ:
            pytest.skip("Cirq is not installed in this environment")

        code = """import cirq

q = cirq.LineQubit.range(2)
circuit = cirq.Circuit([
    cirq.H(q[0]),
    cirq.CNOT(q[0], q[1])
])
"""
        parsed = parse_and_validate_quantum_code(code, "cirq")
        engine = get_engine("cirq")
        res = engine.simulate(parsed.placements, parsed.qubits)
        assert res.success is True
        amps_dict = {a.state: a.p for a in res.amps}
        assert "00" in amps_dict and amps_dict["00"] > 0.4
        assert "11" in amps_dict and amps_dict["11"] > 0.4


class TestQuantumIdeApiEndpoint:
    @pytest.mark.asyncio
    async def test_run_code_qiskit_endpoint_success(self):
        from app.main import app
        from app.core.security import create_access_token
        from app.core.database import get_db
        from unittest.mock import AsyncMock
        from httpx import ASGITransport, AsyncClient

        async def mock_get_db():
            mock_session = AsyncMock()
            yield mock_session

        app.dependency_overrides[get_db] = mock_get_db

        token = create_access_token("test-ide-user", "student")
        headers = {"Authorization": f"Bearer {token}"}

        code = """from qiskit import QuantumCircuit
qc = QuantumCircuit(2)
qc.h(0)
qc.cx(0, 1)
"""
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.post(
                "/api/v1/simulations/run-code",
                headers=headers,
                json={"code": code, "framework": "qiskit", "shots": 1024},
            )
            assert resp.status_code == 200
            data = resp.json()
            assert data["success"] is True
            assert data["framework"] == "qiskit"
            assert data["qubits"] == 2
            assert len(data["placements"]) == 2
            assert len(data["amps"]) == 4
            assert len(data["bloch_spheres"]) == 2
            assert "COMPLETED SUCCESSFULLY" in data["output"]

    @pytest.mark.asyncio
    async def test_run_code_endpoint_reports_real_error(self):
        from app.main import app
        from app.core.security import create_access_token
        from httpx import ASGITransport, AsyncClient

        token = create_access_token("test-ide-user", "student")
        headers = {"Authorization": f"Bearer {token}"}

        code = """from qiskit import QuantumCircuit
qc = QuantumCircuit(2)
qc.h(0)
qc.cx(0, 3)
"""
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.post(
                "/api/v1/simulations/run-code",
                headers=headers,
                json={"code": code, "framework": "qiskit"},
            )
            assert resp.status_code == 200
            data = resp.json()
            assert data["success"] is False
            assert len(data["errors"]) > 0
            err = data["errors"][0]
            assert err["line"] == 4
            assert "3" in err["message"]

