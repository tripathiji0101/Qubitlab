"""Comprehensive test suite for Quantum AI Tutor circuit analyzer, canonical endianness, and actions."""

import pytest
from app.services.ai.tutor import (
    format_state_label,
    to_qiskit_order,
    to_ui_wire_order,
    analyze_circuit,
    tutor,
)


def test_canonical_endianness_utilities():
    """Verify UI Wire Order |q0 q1 ...> vs Qiskit little-endian conversion."""
    # 2 qubits: i = 1 means q0=1, q1=0 -> UI wire order "10"
    assert format_state_label(1, 2) == "10"
    assert to_qiskit_order("10") == "01"
    assert to_ui_wire_order("01") == "10"

    # 4 qubits: i = 3 means q0=1, q1=1, q2=0, q3=0 -> UI wire order "1100"
    assert format_state_label(3, 4) == "1100"
    assert to_qiskit_order("1100") == "0011"
    assert to_ui_wire_order("0011") == "1100"

    # 4 qubits: i = 0 means |0000> in both conventions
    assert format_state_label(0, 4) == "0000"
    assert to_qiskit_order("0000") == "0000"


def test_circuit_a_hadamard_single_qubit():
    """Circuit A: H(q0) on 2-qubit register."""
    placements = [
        {"id": "p0", "g": "H", "col": 0, "q": 0},
    ]
    analysis = analyze_circuit(placements, qubits=2)

    assert analysis["qubits"] == 2
    assert analysis["gate_count"] == 1
    assert analysis["depth"] == 1
    assert analysis["active_qubits"] == [0]
    assert analysis["unused_qubits"] == [1]
    assert analysis["superposition_qubits"] == [0]
    assert analysis["entanglement_detected"] is False
    assert analysis["self_inverse_cancellations"] == []
    assert "qc.h(0)" in analysis["qiskit_code"]


def test_circuit_b_two_qubit_bell_state():
    """Circuit B: H(q0), CNOT(q0 -> q1) creating Bell state."""
    placements = [
        {"id": "p0", "g": "H", "col": 0, "q": 0},
        {"id": "p1", "g": "CNOT", "col": 1, "q": 0, "q2": 1},
    ]
    sim_result = {
        "probs": [
            {"state": "00", "p": 50.0},
            {"state": "11", "p": 50.0},
        ]
    }
    analysis = analyze_circuit(
        placements,
        qubits=2,
        simulation_result=sim_result,
        mission="Create a Bell state",
        success_criteria=["Create an entangled Bell pair", "Equal 50/50 probability"],
    )

    assert analysis["qubits"] == 2
    assert analysis["gate_count"] == 2
    assert analysis["active_qubits"] == [0, 1]
    assert analysis["unused_qubits"] == []
    assert analysis["entanglement_detected"] is True
    assert analysis["simulation"]["available"] is True
    assert len(analysis["simulation"]["probs"]) == 2
    assert analysis["verification"]["status"] == "PASS"


def test_circuit_c_four_qubit_bell_with_idle_qubits():
    """Circuit C: 4-qubit Bell state with q2, q3 unused.

    Critical invariant:
    - Active subsystem (q0, q1) is entangled in Bell state.
    - Idle qubits (q2, q3) remain in |0>.
    - In UI Wire Order |q0 q1 q2 q3>, states are |0000> and |1100>.
    - In Qiskit little-endian |q3 q2 q1 q0>, states are |0000> and |0011>.
    """
    placements = [
        {"id": "p0", "g": "H", "col": 0, "q": 0},
        {"id": "p1", "g": "CNOT", "col": 1, "q": 0, "q2": 1},
    ]
    sim_result = {
        "probs": [
            {"state": "0000", "p": 50.0},
            {"state": "1100", "p": 50.0},
        ],
        "amps": [
            {"state": "0000", "re": 0.7071, "im": 0.0, "p": 0.5},
            {"state": "1100", "re": 0.7071, "im": 0.0, "p": 0.5},
        ],
    }
    analysis = analyze_circuit(placements, qubits=4, simulation_result=sim_result)

    assert analysis["qubits"] == 4
    assert analysis["active_qubits"] == [0, 1]
    assert analysis["unused_qubits"] == [2, 3]
    assert analysis["entanglement_detected"] is True

    # Check simulator states in UI wire order
    probs = analysis["simulation"]["probs"]
    assert len(probs) == 2
    assert probs[0]["state"] == "0000"
    assert probs[1]["state"] == "1100"

    # Check Qiskit conversion
    assert to_qiskit_order(probs[1]["state"]) == "0011"


def test_circuit_d_multi_gate_with_measurement():
    """Circuit D: Circuit containing X, H, CNOT, and measurement."""
    placements = [
        {"id": "p0", "g": "X", "col": 0, "q": 0},
        {"id": "p1", "g": "H", "col": 1, "q": 1},
        {"id": "p2", "g": "CNOT", "col": 2, "q": 1, "q2": 2},
        {"id": "p3", "g": "M", "col": 3, "q": 2},
    ]
    analysis = analyze_circuit(placements, qubits=3)

    assert analysis["qubits"] == 3
    assert analysis["gate_count"] == 3  # X, H, CNOT (M is measurement)
    assert len(analysis["measurements"]) == 1
    assert analysis["measurements"][0]["qubit"] == 2
    assert analysis["classical_bits"] == 1
    assert "qc.measure(2, 2)" in analysis["qiskit_code"]


def test_self_inverse_cancellation_detection():
    """Detect consecutive self-canceling gates H-H."""
    placements = [
        {"id": "p0", "g": "H", "col": 0, "q": 0},
        {"id": "p1", "g": "H", "col": 1, "q": 0},
    ]
    analysis = analyze_circuit(placements, qubits=2)

    assert len(analysis["self_inverse_cancellations"]) == 1
    canc = analysis["self_inverse_cancellations"][0]
    assert canc["gate"] == "H"
    assert canc["qubit"] == 0


@pytest.mark.asyncio
async def test_tutor_actions_fallback(monkeypatch):
    """Verify tutor actions return rich structured responses with ground truth."""
    monkeypatch.setattr(tutor.__class__, "_llm_available", property(lambda self: False))
    placements = [
        {"id": "p0", "g": "H", "col": 0, "q": 0},
        {"id": "p1", "g": "CNOT", "col": 1, "q": 0, "q2": 1},
    ]
    sim_result = {
        "probs": [
            {"state": "0000", "p": 50.0},
            {"state": "1100", "p": 50.0},
        ]
    }
    context = {
        "placements": placements,
        "qubits": 4,
        "simulation_result": sim_result,
        "mission": "Create a Bell pair on q0 and q1",
        "success_criteria": ["Entangle q0 and q1"],
    }

    # 1. Explain
    explain_res = await tutor.explain_circuit(context)
    assert "### What your circuit does" in explain_res["response"]
    assert "### Step by step" in explain_res["response"]
    assert "### Result" in explain_res["response"]
    assert "|0000⟩" in explain_res["response"] or "0000" in explain_res["response"]

    # 2. Debug
    debug_res = await tutor.debug_circuit(context)
    assert "response" in debug_res
    assert len(debug_res["response"]) > 10

    # 3. Verify
    verify_res = await tutor.verify(context)
    assert "PASS" in verify_res["response"]

    # 4. Progressive hint
    hint_res = await tutor.give_hint(context)
    assert "Progressive Hint" in hint_res["response"]

    # 5. Chat about unused qubits
    chat_q2 = await tutor.chat("Why are q2 and q3 unused?", context)
    assert "q" in chat_q2["response"] and ("unused" in chat_q2["response"].lower() or "|0⟩" in chat_q2["response"] or "0" in chat_q2["response"])

    # 6. Chat asking for Qiskit code
    chat_code = await tutor.chat("Give me the Qiskit code", context)
    assert "qc.h(0)" in chat_code["response"]
    assert "qc.cx(0, 1)" in chat_code["response"]

    # 7. What happens if I put X before H?
    chat_x_before_h = await tutor.chat("What happens if I put X before H?", context)
    assert "X" in chat_x_before_h["response"]
    assert "\\Phi^-" in chat_x_before_h["response"] or "minus" in chat_x_before_h["response"] or "|-\\rangle" in chat_x_before_h["response"]

    # 8. What happens if I remove this CNOT?
    chat_rem_cnot = await tutor.chat("What happens if I remove this CNOT?", context)
    assert "product state" in chat_rem_cnot["response"].lower() or "separable" in chat_rem_cnot["response"].lower()

    # 9. Why did you use H here?
    chat_why_h = await tutor.chat("Why did you use H here?", context)
    assert "superposition" in chat_why_h["response"].lower()

    # 10. Why is q1 changing?
    chat_why_q1 = await tutor.chat("Why is q1 changing?", context)
    assert "target" in chat_why_q1["response"].lower()

    # 11. Why am I getting these probabilities?
    chat_why_probs = await tutor.chat("Why am I getting these probabilities?", context)
    assert "50%" in chat_why_probs["response"] or "amplitude" in chat_why_probs["response"].lower()

    # 12. Explain q0 step by step
    chat_q0_steps = await tutor.chat("Explain q0 step by step", context)
    assert "q" in chat_q0_steps["response"] and "Moment" in chat_q0_steps["response"]

    # 13. Explain like a beginner
    chat_beginner = await tutor.chat("Explain this like I am a beginner", context)
    assert "coin" in chat_beginner["response"].lower() or "simple" in chat_beginner["response"].lower()

    # 14. Can I solve with fewer gates?
    chat_fewer = await tutor.chat("Can I solve this level with fewer gates?", context)
    assert "2 gates" in chat_fewer["response"] or "minimum" in chat_fewer["response"].lower()

    # 15. What should I add next?
    chat_next = await tutor.chat("What should I add next?", context)
    assert "Next Step" in chat_next["response"]


@pytest.mark.asyncio
async def test_empty_and_malformed_circuits(monkeypatch):
    """Test handling of empty and malformed circuits."""
    monkeypatch.setattr(tutor.__class__, "_llm_available", property(lambda self: False))

    # Empty circuit
    empty_ctx = {
        "placements": [],
        "qubits": 2,
        "simulation_result": None,
    }
    empty_explain = await tutor.explain_circuit(empty_ctx)
    assert "empty" in empty_explain["response"].lower()

    empty_debug = await tutor.debug_circuit(empty_ctx)
    assert "empty" in empty_debug["response"].lower()

    empty_verify = await tutor.verify(empty_ctx)
    assert "FAIL" in empty_verify["response"]

    # Malformed circuit (missing fields, unexpected keys)
    malformed_ctx = {
        "placements": [
            {"id": "bad1"},
            {"id": "bad2", "g": "UNKNOWN_GATE", "q": 99},
        ],
        "qubits": 2,
    }
    # Should not crash, should analyze gracefully
    analysis = analyze_circuit(malformed_ctx["placements"], qubits=2)
    assert analysis["qubits"] == 2
    assert isinstance(analysis["gates"], list)
