"""Comprehensive test suite for What-If Quantum Circuit Simulation.

Covers all 10 required prompt scenarios and authentication:
- Test 1: Remove H (original unchanged, 0 gates in modified, simulations differ)
- Test 2: Remove CNOT (original unchanged, modified contains only H, comparison correct)
- Test 3: X before H (modified order X -> H, original remains H)
- Test 4: Add X(q1) (modified contains new X, original unchanged)
- Test 5: Replace H with X (original unchanged, modified contains X)
- Test 6: Ambiguous removal (multiple gates exist -> requests clarification)
- Test 7: Invalid qubit (safe validation error)
- Test 8: Empty circuit (does not crash, handles gracefully)
- Test 9: 4-qubit circuit with idle qubits (canonical UI wire order |0000> and |1100>)
- Test 10: Gemini unavailable (deterministic fallback produces structured comparison)
- Auth Test: Unauthenticated requests return 401
"""

import pytest
import copy
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.config import settings
from app.services.ai.what_if import (
    parse_what_if_query,
    apply_what_if_modification,
    simulate_circuit_deterministic,
    compare_circuits,
    run_what_if_experiment,
    is_what_if_query,
)
from app.services.ai.tutor import (
    analyze_circuit,
    format_state_label,
    to_qiskit_order,
    to_ui_wire_order,
    tutor,
)


# ═══════════════════════════════════════════════════
# TEST 1: Remove H gate
# ═══════════════════════════════════════════════════

@pytest.mark.asyncio
async def test_1_remove_h_gate():
    """TEST 1:
    Original: H(q0)
    What-if: remove H
    Verify:
    - original unchanged
    - modified circuit has zero gates
    - simulations differ correctly
    """
    original = [{"id": "p0", "g": "H", "col": 0, "q": 0}]
    orig_copy = copy.deepcopy(original)

    mod = parse_what_if_query("What happens if I remove the H gate?", original, qubits=2)
    assert mod.valid is True
    assert mod.operation == "remove"
    assert mod.gate == "H"

    # Temporary circuit creation
    modified = apply_what_if_modification(original, mod, qubits=2)

    # 1. Original unchanged
    assert original == orig_copy
    assert len(original) == 1

    # 2. Modified has zero gates
    assert len(modified) == 0

    # 3. Simulations differ correctly
    sim_orig = simulate_circuit_deterministic(original, qubits=2)
    sim_mod = simulate_circuit_deterministic(modified, qubits=2)

    # In original: |00> 50%, |10> 50% (H on q0 creates |0>+|1> on q0, q1 is 0 -> UI wire order 00 and 10)
    orig_probs = {p["state"]: p["p"] for p in sim_orig["probs"]}
    assert orig_probs.get("00") == 50.0
    assert orig_probs.get("10") == 50.0

    # In modified (empty circuit): strictly |00> 100%
    mod_probs = {p["state"]: p["p"] for p in sim_mod["probs"]}
    assert mod_probs.get("00") == 100.0
    assert mod_probs.get("10", 0.0) == 0.0


# ═══════════════════════════════════════════════════
# TEST 2: Remove CNOT
# ═══════════════════════════════════════════════════

@pytest.mark.asyncio
async def test_2_remove_cnot_gate():
    """TEST 2:
    Original: H(q0), CNOT(q0, q1)
    What-if: remove CNOT
    Verify:
    - original unchanged
    - modified contains only H
    - comparison is correct
    """
    original = [
        {"id": "p0", "g": "H", "col": 0, "q": 0},
        {"id": "p1", "g": "CNOT", "col": 1, "q": 0, "q2": 1},
    ]
    orig_copy = copy.deepcopy(original)

    mod = parse_what_if_query("What happens if I remove the CNOT?", original, qubits=2)
    assert mod.valid is True
    assert mod.operation == "remove"
    assert mod.gate == "CNOT"

    modified = apply_what_if_modification(original, mod, qubits=2)

    # 1. Original unchanged
    assert original == orig_copy
    assert len(original) == 2

    # 2. Modified contains only H
    assert len(modified) == 1
    assert modified[0]["g"] == "H"
    assert modified[0]["q"] == 0

    # 3. Comparison is correct
    sim_orig = simulate_circuit_deterministic(original, qubits=2)
    sim_mod = simulate_circuit_deterministic(modified, qubits=2)

    orig_analysis = analyze_circuit(original, qubits=2, simulation_result=sim_orig)
    mod_analysis = analyze_circuit(modified, qubits=2, simulation_result=sim_mod)

    comp = compare_circuits(orig_analysis, mod_analysis, mod)
    assert comp["gate_count"]["original"] == 2
    assert comp["gate_count"]["modified"] == 1
    assert comp["gate_count"]["diff"] == -1
    assert comp["entanglement"]["original"] is True
    assert comp["entanglement"]["modified"] is False
    assert "lost" in comp["entanglement"]["summary"].lower()


# ═══════════════════════════════════════════════════
# TEST 3: X before H
# ═══════════════════════════════════════════════════

@pytest.mark.asyncio
async def test_3_x_before_h():
    """TEST 3:
    Original: H(q0)
    What-if: X before H
    Verify:
    - modified order is X -> H
    - original remains H
    """
    original = [{"id": "p0", "g": "H", "col": 0, "q": 0}]
    orig_copy = copy.deepcopy(original)

    mod = parse_what_if_query("What if I put X before H?", original, qubits=2)
    assert mod.valid is True
    assert mod.operation == "insert_before"
    assert mod.gate == "X"

    modified = apply_what_if_modification(original, mod, qubits=2)

    # 1. Original remains H only
    assert original == orig_copy
    assert len(original) == 1
    assert original[0]["g"] == "H"

    # 2. Modified order is X -> H
    assert len(modified) == 2
    assert modified[0]["g"] == "X"
    assert modified[0]["col"] == 0
    assert modified[1]["g"] == "H"
    assert modified[1]["col"] == 1


# ═══════════════════════════════════════════════════
# TEST 4: Add X to q1
# ═══════════════════════════════════════════════════

@pytest.mark.asyncio
async def test_4_add_x_to_q1():
    """TEST 4:
    Original: H(q0), CNOT(q0, q1)
    What-if: add X to q1
    Verify:
    - modified circuit contains new X
    - original unchanged
    """
    original = [
        {"id": "p0", "g": "H", "col": 0, "q": 0},
        {"id": "p1", "g": "CNOT", "col": 1, "q": 0, "q2": 1},
    ]
    orig_copy = copy.deepcopy(original)

    mod = parse_what_if_query("What if I add an X gate to q1?", original, qubits=2)
    assert mod.valid is True
    assert mod.operation == "add"
    assert mod.gate == "X"
    assert mod.qubit == 1

    modified = apply_what_if_modification(original, mod, qubits=2)

    # 1. Original unchanged
    assert original == orig_copy

    # 2. Modified contains new X on q1
    assert len(modified) == 3
    added = [p for p in modified if p["g"] == "X" and p["q"] == 1]
    assert len(added) == 1


# ═══════════════════════════════════════════════════
# TEST 5: Replace H with X
# ═══════════════════════════════════════════════════

@pytest.mark.asyncio
async def test_5_replace_h_with_x():
    """TEST 5:
    Original: H(q0)
    What-if: replace H with X
    Verify:
    - original unchanged
    - modified contains X
    """
    original = [{"id": "p0", "g": "H", "col": 0, "q": 0}]
    orig_copy = copy.deepcopy(original)

    mod = parse_what_if_query("What happens if I replace H with X?", original, qubits=2)
    assert mod.valid is True
    assert mod.operation == "replace"
    assert mod.gate == "X"

    modified = apply_what_if_modification(original, mod, qubits=2)

    # 1. Original unchanged
    assert original == orig_copy
    assert original[0]["g"] == "H"

    # 2. Modified contains X
    assert len(modified) == 1
    assert modified[0]["g"] == "X"


# ═══════════════════════════════════════════════════
# TEST 6: Ambiguous Removal
# ═══════════════════════════════════════════════════

@pytest.mark.asyncio
async def test_6_ambiguous_removal_requests_clarification():
    """TEST 6:
    Multiple gates exist.
    "Remove the gate"
    Must request clarification without guessing or mutating.
    """
    original = [
        {"id": "p0", "g": "H", "col": 0, "q": 0},
        {"id": "p1", "g": "CNOT", "col": 1, "q": 0, "q2": 1},
        {"id": "p2", "g": "X", "col": 2, "q": 1},
    ]
    orig_copy = copy.deepcopy(original)

    mod = parse_what_if_query("What if I remove the gate?", original, qubits=2)
    assert mod.valid is False
    assert mod.is_ambiguous is True
    assert "Which gate do you mean?" in mod.clarification_message
    assert "H on q0" in mod.clarification_message
    assert ("CNOT q0 → q1" in mod.clarification_message or "CNOT q0 -> q1" in mod.clarification_message)
    assert "X on q1" in mod.clarification_message

    # End-to-end tutor call
    res = await tutor.chat("What happens if I remove the gate?", {"placements": original, "qubits": 2})
    assert "Which gate do you mean?" in res["response"]
    assert original == orig_copy


# ═══════════════════════════════════════════════════
# TEST 7: Invalid Qubit
# ═══════════════════════════════════════════════════

@pytest.mark.asyncio
async def test_7_invalid_qubit_safe_error():
    """TEST 7:
    Invalid qubit (e.g. q5 on a 2-qubit circuit).
    Must return a safe validation error.
    """
    original = [{"id": "p0", "g": "H", "col": 0, "q": 0}]
    mod = parse_what_if_query("What if I add X to q5?", original, qubits=2)
    assert mod.valid is False
    assert "invalid" in mod.error_message.lower()
    assert "q5" in mod.error_message

    # End-to-end tutor call
    res = await tutor.chat("What if I add X to q5?", {"placements": original, "qubits": 2})
    assert "q5 is invalid" in res["response"]


# ═══════════════════════════════════════════════════
# TEST 8: Empty Circuit
# ═══════════════════════════════════════════════════

@pytest.mark.asyncio
async def test_8_empty_circuit_does_not_crash():
    """TEST 8:
    Empty circuit.
    Must not crash.
    """
    empty_circuit = []
    mod = parse_what_if_query("What happens if I remove the H gate?", empty_circuit, qubits=2)
    assert mod.valid is False
    assert "empty" in mod.error_message.lower()

    # End-to-end tutor call
    res = await tutor.chat("What happens if I remove H?", {"placements": empty_circuit, "qubits": 2})
    assert "empty" in res["response"].lower()


# ═══════════════════════════════════════════════════
# TEST 9: 4-Qubit Circuit & Canonical UI Wire Endianness
# ═══════════════════════════════════════════════════

@pytest.mark.asyncio
async def test_9_four_qubit_canonical_endianness():
    """TEST 9:
    4-qubit circuit: H(q0), CNOT(q0, q1) with q2, q3 unused.
    Verify state-label ordering:
    - Active pair: q0, q1 entangled in Bell state
    - Inactive: q2, q3 remain in |0>
    - In UI Wire Order |q0 q1 q2 q3>, states are |0000> and |1100>
    """
    placements = [
        {"id": "p0", "g": "H", "col": 0, "q": 0},
        {"id": "p1", "g": "CNOT", "col": 1, "q": 0, "q2": 1},
    ]

    sim = simulate_circuit_deterministic(placements, qubits=4)
    probs = {p["state"]: p["p"] for p in sim["probs"] if p["p"] > 0.05}

    # Must contain |0000> and |1100> (NOT |0011> which is Qiskit little-endian)
    assert "0000" in probs
    assert "1100" in probs
    assert probs["0000"] == 50.0
    assert probs["1100"] == 50.0

    # Test what-if: remove CNOT on 4-qubit circuit
    mod = parse_what_if_query("What happens if I remove the CNOT?", placements, qubits=4)
    mod_placements = apply_what_if_modification(placements, mod, qubits=4)
    mod_sim = simulate_circuit_deterministic(mod_placements, qubits=4)
    mod_probs = {p["state"]: p["p"] for p in mod_sim["probs"] if p["p"] > 0.05}

    # With only H on q0: q0 is in 50/50 |0> and |1>, while q1, q2, q3 are strictly |0>
    # In UI Wire Order |q0 q1 q2 q3>, states are |0000> and |1000>
    assert "0000" in mod_probs
    assert "1000" in mod_probs
    assert mod_probs["0000"] == 50.0
    assert mod_probs["1000"] == 50.0


# ═══════════════════════════════════════════════════
# TEST 10: Gemini Unavailable Fallback
# ═══════════════════════════════════════════════════

@pytest.mark.asyncio
async def test_10_gemini_unavailable_deterministic_fallback(monkeypatch):
    """TEST 10:
    Gemini unavailable.
    Verify deterministic fallback produces a structured comparison.
    """
    # Force LLM provider to empty so fallback triggers
    monkeypatch.setattr(settings, "AI_PROVIDER", "")
    monkeypatch.setattr(settings, "AI_API_KEY", "")

    original = [
        {"id": "p0", "g": "H", "col": 0, "q": 0},
        {"id": "p1", "g": "CNOT", "col": 1, "q": 0, "q2": 1},
    ]

    res = await tutor.chat("What happens if I remove the H gate?", {"placements": original, "qubits": 2})

    assert "response" in res
    assert res.get("what_if") is not None
    assert res["what_if"]["valid"] is True
    assert len(res["what_if"]["modified_placements"]) == 1
    assert res["what_if"]["modified_placements"][0]["g"] == "CNOT"

    text = res["response"]
    assert "### What changed" in text
    assert "### Before" in text
    assert "### After" in text
    assert "### Why it changed" in text
    assert "### Key idea" in text
    assert "Hadamard" in text


# ═══════════════════════════════════════════════════
# AUTHENTICATION TESTS
# ═══════════════════════════════════════════════════

@pytest.mark.asyncio
async def test_auth_unauthenticated_returns_401():
    """Verify unauthenticated requests to tutor endpoints return 401 Unauthorized."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        r1 = await client.post("/api/v1/tutor/chat", json={"question": "What happens if I remove H?"})
        assert r1.status_code == 401

        r2 = await client.post("/api/v1/tutor/what-if", json={"question": "What happens if I remove H?"})
        assert r2.status_code == 401


@pytest.mark.asyncio
async def test_auth_authenticated_what_if_succeeds():
    """Verify authenticated requests to tutor what-if return 200 OK with what_if data."""
    from app.core.security import create_access_token
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = create_access_token("test-student-1", "student")
        headers = {"Authorization": f"Bearer {token}"}

        # Call /tutor/what-if
        body = {
            "question": "What happens if I remove the H gate?",
            "placements": [
                {"id": "p0", "g": "H", "col": 0, "q": 0},
                {"id": "p1", "g": "CNOT", "col": 1, "q": 0, "q2": 1},
            ],
            "qubits": 2,
        }
        res = await client.post("/api/v1/tutor/what-if", json=body, headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert "response" in data
        assert data.get("what_if") is not None
        assert data["what_if"]["valid"] is True
        assert len(data["what_if"]["modified_placements"]) == 1
