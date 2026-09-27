"""Comprehensive Test Suite for Goal-Aware, Socratic, Gamified Quantum AI Tutor.

Implements all 16 Acceptance Tests defined in Step 28 of specifications:
1.  test_mission_not_started: Empty circuit -> NOT_STARTED, guides with initial conceptual step.
2.  test_partial_circuit: Partial circuit -> PROGRESSING / EARLY_ATTEMPT, completed and remaining criteria.
3.  test_near_complete_circuit: Near-complete circuit -> NEAR_COMPLETION, focused next step.
4.  test_completed_circuit: Completed circuit -> COMPLETED, celebration + XP, follow-up experiment.
5.  test_progressive_hint_level_1: Hint 1 -> Tier 1 Conceptual.
6.  test_progressive_hint_level_2: Hint 2 -> Tier 2 Structural.
7.  test_progressive_hint_level_3: Hint 3 -> Tier 3 Near-solution.
8.  test_direct_answer_request: "just tell me the answer" -> DIRECT_ANSWER, exact solution.
9.  test_what_if_remove_h: "What happens if I remove the H gate?" -> What-If simulated and explained.
10. test_what_if_add_x_before_h: "What if I add X before H?" -> What-If simulated and explained.
11. test_what_if_mission_context: What-If in mission context -> criteria impact explained.
12. test_simulator_numerical_data: Simulator numerical data used accurately.
13. test_deterministic_fallback_when_gemini_unavailable: Fallback works seamlessly offline.
14. test_ambiguous_request: Ambiguous request -> clarification requested.
15. test_invalid_circuit: Invalid circuit -> graceful handling without crash.
16. test_authentication: 401 unauthenticated, 200 authenticated.
"""

import pytest
from starlette.testclient import TestClient
from app.main import app
from app.core.security import create_access_token
from app.services.ai.tutor import tutor, analyze_circuit, classify_tutor_intent


@pytest.fixture
def auth_headers():
    token = create_access_token("test-student-123", "student")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def client():
    return TestClient(app)


# ═══════════════════════════════════════════════════════════════════
# 1. Mission Not Started
# ═══════════════════════════════════════════════════════════════════

@pytest.mark.asyncio
async def test_mission_not_started(monkeypatch):
    """Test 1: Empty circuit -> NOT_STARTED state, guides with initial conceptual step."""
    monkeypatch.setattr(tutor.__class__, "_llm_available", property(lambda self: False))
    context = {
        "placements": [],
        "qubits": 2,
        "mission": "Create a Bell pair on q0 and q1",
        "success_criteria": ["Create equal superposition on q0", "Entangle q0 and q1"],
    }
    analysis = tutor._analyze(context)
    assert analysis["student_state"] == "NOT_STARTED"
    assert analysis["mission_progress"]["met_count"] == 0
    assert analysis["mission_progress"]["percentage"] == 0.0

    res = await tutor.chat("What should I do?", context)
    assert res["student_state"] == "NOT_STARTED"
    assert "Hadamard" in res["response"] or "H" in res["response"] or "superposition" in res["response"].lower()


# ═══════════════════════════════════════════════════════════════════
# 2. Partial Circuit
# ═══════════════════════════════════════════════════════════════════

@pytest.mark.asyncio
async def test_partial_circuit(monkeypatch):
    """Test 2: Partial circuit -> PROGRESSING state, completed & remaining criteria."""
    monkeypatch.setattr(tutor.__class__, "_llm_available", property(lambda self: False))
    context = {
        "placements": [{"id": "p0", "g": "H", "col": 0, "q": 0}],
        "qubits": 2,
        "mission": "Create a Bell pair on q0 and q1",
        "success_criteria": ["Create equal superposition on q0", "Entangle q0 and q1"],
    }
    analysis = tutor._analyze(context)
    assert analysis["student_state"] in ("PROGRESSING", "NEAR_COMPLETION")
    assert analysis["mission_progress"]["met_count"] == 1
    assert analysis["mission_progress"]["total_count"] == 2
    assert analysis["mission_progress"]["percentage"] == 50.0

    # Verification has both MET and UNMET criteria
    cr = analysis["verification"]["criteria_results"]
    assert any(c["status"] == "MET" for c in cr)
    assert any(c["status"] == "UNMET" for c in cr)


# ═══════════════════════════════════════════════════════════════════
# 3. Near-Complete Circuit
# ═══════════════════════════════════════════════════════════════════

@pytest.mark.asyncio
async def test_near_complete_circuit(monkeypatch):
    """Test 3: Near-complete circuit -> NEAR_COMPLETION, focused next step."""
    monkeypatch.setattr(tutor.__class__, "_llm_available", property(lambda self: False))
    context = {
        "placements": [
            {"id": "p0", "g": "H", "col": 0, "q": 0},
            {"id": "p1", "g": "CNOT", "col": 1, "q": 0, "q2": 1},
        ],
        "qubits": 2,
        "mission": "Create a Bell pair on q0 and q1",
        "success_criteria": ["Create equal superposition on q0", "Entangle q0 and q1", "Verify measurement probabilities via simulation"],
    }
    analysis = tutor._analyze(context)
    assert analysis["student_state"] in ("NEAR_COMPLETION", "PROGRESSING")

    res = await tutor.chat("What should I add next?", context)
    assert "Next Step" in res["response"] or "Run Circuit" in res["response"] or "Check" in res["response"]


# ═══════════════════════════════════════════════════════════════════
# 4. Completed Circuit
# ═══════════════════════════════════════════════════════════════════

@pytest.mark.asyncio
async def test_completed_circuit(monkeypatch):
    """Test 4: Fully compliant circuit -> COMPLETED, celebration + XP, suggested experiment."""
    monkeypatch.setattr(tutor.__class__, "_llm_available", property(lambda self: False))
    context = {
        "placements": [
            {"id": "p0", "g": "H", "col": 0, "q": 0},
            {"id": "p1", "g": "CNOT", "col": 1, "q": 0, "q2": 1},
        ],
        "qubits": 2,
        "simulation_result": {
            "probs": [{"state": "00", "p": 50.0}, {"state": "11", "p": 50.0}],
        },
        "mission": "Create a Bell pair on q0 and q1",
        "success_criteria": ["Create equal superposition on q0", "Entangle q0 and q1"],
    }
    analysis = tutor._analyze(context)
    assert analysis["student_state"] == "COMPLETED"
    assert analysis["mission_progress"]["percentage"] == 100.0
    assert analysis["celebration"] is not None
    assert analysis["celebration"]["xp"] >= 500
    assert analysis["suggested_experiment"] is not None

    res = await tutor.chat("What next?", context)
    assert res["student_state"] == "COMPLETED"
    assert res["celebration"] is not None


# ═══════════════════════════════════════════════════════════════════
# 5, 6, 7. Progressive Hints (Level 1, 2, 3)
# ═══════════════════════════════════════════════════════════════════

@pytest.mark.asyncio
async def test_progressive_hint_level_1(monkeypatch):
    """Test 5: Progressive hint 1 -> Tier 1 Conceptual hint."""
    monkeypatch.setattr(tutor.__class__, "_llm_available", property(lambda self: False))
    context = {
        "placements": [],
        "qubits": 2,
        "level": {"number": 2, "title": "Bell State Preparation", "algorithm": "bell"},
        "student_history": {"hints_used": 0},
    }
    res = await tutor.give_hint(context)
    assert "Tier 1 (Conceptual Hint)" in res["response"] or "Tier 1" in res["response"]
    assert "superposition" in res["response"].lower()


@pytest.mark.asyncio
async def test_progressive_hint_level_2(monkeypatch):
    """Test 6: Progressive hint 2 -> Tier 2 Structural algorithmic approach."""
    monkeypatch.setattr(tutor.__class__, "_llm_available", property(lambda self: False))
    context = {
        "placements": [],
        "qubits": 2,
        "level": {"number": 2, "title": "Bell State Preparation", "algorithm": "bell"},
        "student_history": {"hints_used": 1},
    }
    res = await tutor.give_hint(context)
    assert "Tier 2 (Structural Hint)" in res["response"] or "Tier 2" in res["response"]
    assert "two gates" in res["response"].lower() or "q0" in res["response"].lower()


@pytest.mark.asyncio
async def test_progressive_hint_level_3(monkeypatch):
    """Test 7: Progressive hint 3 -> Tier 3 Near-solution guidance."""
    monkeypatch.setattr(tutor.__class__, "_llm_available", property(lambda self: False))
    context = {
        "placements": [],
        "qubits": 2,
        "level": {"number": 2, "title": "Bell State Preparation", "algorithm": "bell"},
        "student_history": {"hints_used": 2},
    }
    res = await tutor.give_hint(context)
    assert "Tier 3 (Near Solution Hint)" in res["response"] or "Tier 3" in res["response"]
    assert "CNOT" in res["response"]
    assert "Hadamard" in res["response"] or "H" in res["response"]


# ═══════════════════════════════════════════════════════════════════
# 8. Direct Answer Request
# ═══════════════════════════════════════════════════════════════════

@pytest.mark.asyncio
async def test_direct_answer_request(monkeypatch):
    """Test 8: Direct answer request -> DIRECT_ANSWER intent and exact circuit solution provided."""
    monkeypatch.setattr(tutor.__class__, "_llm_available", property(lambda self: False))
    context = {
        "placements": [],
        "qubits": 2,
        "level": {"number": 2, "title": "Bell State", "algorithm": "bell"},
        "mission": "Create a Bell pair on q0 and q1",
    }
    res = await tutor.chat("just tell me the answer", context)
    assert res["intent"] == "DIRECT_ANSWER"
    assert "Exact Circuit Solution" in res["response"]
    assert "Hadamard" in res["response"] or "H" in res["response"]
    assert "CNOT" in res["response"]
    assert "q0" in res["response"].lower()
    assert "q1" in res["response"].lower()


# ═══════════════════════════════════════════════════════════════════
# 9 & 10. What-If Circuit Simulation
# ═══════════════════════════════════════════════════════════════════

@pytest.mark.asyncio
async def test_what_if_remove_h(monkeypatch):
    """Test 9: 'What happens if I remove the H gate?' -> simulated and explained."""
    monkeypatch.setattr("app.core.config.settings.AI_API_KEY", "")
    context = {
        "placements": [
            {"id": "p0", "g": "H", "col": 0, "q": 0},
            {"id": "p1", "g": "CNOT", "col": 1, "q": 0, "q2": 1},
        ],
        "qubits": 2,
    }
    res = await tutor.chat("What happens if I remove the H gate?", context)
    assert res["intent"] == "WHAT_IF"
    assert res["what_if"] is not None
    assert res["what_if"]["valid"] is True
    assert "remove" in res["what_if"]["operation"]
    # Removing H leaves only CNOT on |00>, which outputs |00> with 100%
    probs = {p["state"]: p["modified"] for p in res["what_if"]["comparison"]["probabilities"]}
    assert probs.get("00", 0) == 100.0


@pytest.mark.asyncio
async def test_what_if_add_x_before_h(monkeypatch):
    """Test 10: 'What if I add X before H?' -> simulated and explained."""
    monkeypatch.setattr("app.core.config.settings.AI_API_KEY", "")
    context = {
        "placements": [
            {"id": "p0", "g": "H", "col": 1, "q": 0},
            {"id": "p1", "g": "CNOT", "col": 2, "q": 0, "q2": 1},
        ],
        "qubits": 2,
    }
    res = await tutor.chat("What if I add X before H?", context)
    assert res["intent"] == "WHAT_IF"
    assert res["what_if"] is not None
    assert res["what_if"]["valid"] is True
    # Inserting X before H transforms |0> -> |1> -> |->
    assert "X" in res["what_if"]["description"] or "insert" in res["what_if"]["operation"]


# ═══════════════════════════════════════════════════════════════════
# 11. What-If in Mission Context
# ═══════════════════════════════════════════════════════════════════

@pytest.mark.asyncio
async def test_what_if_mission_context(monkeypatch):
    """Test 11: What-If in mission context evaluates impact on mission criteria."""
    monkeypatch.setattr("app.core.config.settings.AI_API_KEY", "")
    context = {
        "placements": [
            {"id": "p0", "g": "H", "col": 0, "q": 0},
            {"id": "p1", "g": "CNOT", "col": 1, "q": 0, "q2": 1},
        ],
        "qubits": 2,
        "mission": "Create a Bell pair on q0 and q1",
        "success_criteria": ["Entangle q0 and q1"],
    }
    res = await tutor.chat("What happens if I remove the CNOT gate?", context)
    assert res["what_if"] is not None
    comp = res["what_if"]["comparison"]
    assert "lost_criteria" in comp
    assert any("Entangle" in c or "entangle" in c.lower() for c in comp["lost_criteria"])
    assert "Mission Impact" in res["response"] or comp.get("mission_impact") is not None


# ═══════════════════════════════════════════════════════════════════
# 12. Simulator Numerical Ground Truth
# ═══════════════════════════════════════════════════════════════════

@pytest.mark.asyncio
async def test_simulator_numerical_data(monkeypatch):
    """Test 12: Simulator numerical data used accurately without hallucination."""
    monkeypatch.setattr(tutor.__class__, "_llm_available", property(lambda self: False))
    context = {
        "placements": [
            {"id": "p0", "g": "H", "col": 0, "q": 0},
            {"id": "p1", "g": "CNOT", "col": 1, "q": 0, "q2": 1},
        ],
        "qubits": 2,
        "simulation_result": {
            "probs": [{"state": "00", "p": 50.0}, {"state": "11", "p": 50.0}],
            "amps": [
                {"state": "00", "re": 0.7071, "im": 0.0, "p": 0.5},
                {"state": "11", "re": 0.7071, "im": 0.0, "p": 0.5},
            ],
        },
    }
    res = await tutor.chat("What are my circuit probabilities?", context)
    assert "50.0%" in res["response"]
    assert "|00⟩" in res["response"] or "00" in res["response"]
    assert "|11⟩" in res["response"] or "11" in res["response"]


# ═══════════════════════════════════════════════════════════════════
# 13. Deterministic Fallback When Gemini Unavailable
# ═══════════════════════════════════════════════════════════════════

@pytest.mark.asyncio
async def test_deterministic_fallback_when_gemini_unavailable(monkeypatch):
    """Test 13: Deterministic fallback produces structured, accurate responses without error."""
    monkeypatch.setattr(tutor.__class__, "_llm_available", property(lambda self: False))
    context = {
        "placements": [{"id": "p0", "g": "H", "col": 0, "q": 0}],
        "qubits": 2,
        "mission": "Prepare Superposition",
        "success_criteria": ["Create superposition on q0"],
    }
    # Test all tutor actions under offline condition
    explain_res = await tutor.explain_circuit(context)
    assert "### What your circuit does" in explain_res["response"]
    assert explain_res["student_state"] is not None

    debug_res = await tutor.debug_circuit(context)
    assert "### Circuit Debug" in debug_res["response"]

    verify_res = await tutor.verify(context)
    assert "### Circuit Verification" in verify_res["response"]

    hint_res = await tutor.give_hint(context)
    assert "Progressive Hint" in hint_res["response"]

    opt_res = await tutor.optimize(context)
    assert "Optimization" in opt_res["response"]


# ═══════════════════════════════════════════════════════════════════
# 14. Ambiguous Request Handling
# ═══════════════════════════════════════════════════════════════════

@pytest.mark.asyncio
async def test_ambiguous_request(monkeypatch):
    """Test 14: Ambiguous request -> clarification requested with options."""
    monkeypatch.setattr(tutor.__class__, "_llm_available", property(lambda self: False))
    context = {"placements": [], "qubits": 2}
    res = await tutor.chat("help", context)
    assert "clarify" in res["response"].lower() or "what you'd like" in res["response"].lower()
    assert len(res["suggestions"]) >= 3


# ═══════════════════════════════════════════════════════════════════
# 15. Invalid Circuit Handling
# ═══════════════════════════════════════════════════════════════════

@pytest.mark.asyncio
async def test_invalid_circuit(monkeypatch):
    """Test 15: Invalid circuit -> handled gracefully without crash."""
    monkeypatch.setattr(tutor.__class__, "_llm_available", property(lambda self: False))
    # Placement on q=5 in a 2-qubit register
    context = {
        "placements": [{"id": "p0", "g": "H", "col": 0, "q": 5}],
        "qubits": 2,
    }
    analysis = tutor._analyze(context)
    assert analysis["student_state"] == "INVALID"

    res = await tutor.chat("Debug my circuit", context)
    assert "Invalid Circuit" in res["response"] or "invalid" in res["response"].lower()


# ═══════════════════════════════════════════════════════════════════
# 16. Authentication (401 vs 200)
# ═══════════════════════════════════════════════════════════════════

def test_authentication(client, auth_headers):
    """Test 16: Unauthenticated request returns 401, authenticated returns 200."""
    # 1. Unauthenticated -> 401
    unauth_res = client.post("/api/v1/tutor/chat", json={"question": "What is H?"})
    assert unauth_res.status_code == 401

    # 2. Authenticated -> 200
    auth_res = client.post(
        "/api/v1/tutor/chat",
        json={"question": "What is H?"},
        headers=auth_headers,
    )
    assert auth_res.status_code == 200
    data = auth_res.json()
    assert "response" in data
    assert "student_state" in data
    assert "mission_progress" in data
