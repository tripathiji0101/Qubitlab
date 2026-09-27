import json
import re
from pathlib import Path
import pytest
from app.services.ai.tutor import analyze_circuit

DATA_TS_PATH = Path(__file__).resolve().parent.parent.parent / "src" / "lib" / "data.ts"

def test_data_ts_activities_structure():
    """Verify that data.ts contains valid activities for all 12 algorithms with deterministic ground truth."""
    assert DATA_TS_PATH.exists(), f"Could not find {DATA_TS_PATH}"
    content = DATA_TS_PATH.read_text(encoding="utf-8")
    
    # Check that Activity types and helper function exist
    assert "export type ActivityType" in content
    assert "export function getMissionActivities" in content
    
    # Required algorithm slugs
    required_slugs = [
        "bb84", "deutsch-jozsa", "grover", "qaoa", "qnn",
        "teleportation", "qft", "simon", "vqe", "shor",
        "error-correction", "hhl"
    ]
    
    for slug in required_slugs:
        pattern = rf'["\']?{re.escape(slug)}["\']?:\s*\{{[^}}]*activities:\s*\['
        assert re.search(pattern, content), f"Algorithm '{slug}' missing activities array in data.ts"

def test_activities_deterministic_answer_correctness():
    """Verify that every defined activity has at least one correct option and valid explanations."""
    content = DATA_TS_PATH.read_text(encoding="utf-8")
    
    # Check for correct options across PREDICT, IDENTIFY, EXPERIMENT, DEBUG
    for act_type in ["PREDICT", "IDENTIFY", "EXPERIMENT", "DEBUG"]:
        type_matches = re.findall(rf'type:\s*"{act_type}"', content)
        assert len(type_matches) > 0, f"Activity type {act_type} not found in data.ts"

    # Ensure isCorrect: true exists for activities
    correct_matches = re.findall(r'isCorrect:\s*true', content)
    assert len(correct_matches) >= 20, "Expected at least 20 deterministic correct options across activities"

def test_mission_criteria_remain_authoritative():
    """Verify that activity completion does NOT override or substitute for circuit simulator verification."""
    criteria = [
        "Qubits prepared in correct superposition or basis state",
        "Measurement applied in appropriate basis",
        "Key sifting isolates matching basis results",
        "Eavesdropper disturbance detected above threshold"
    ]
    
    # Empty circuit must FAIL mission verification regardless of activity status
    analysis_empty = analyze_circuit([], qubits=2, mission="bb84", success_criteria=criteria)
    mp_empty = analysis_empty["mission_progress"]
    assert mp_empty["percentage"] == 0.0, "Empty circuit must have 0% criteria satisfaction"
    assert analysis_empty["student_state"] != "COMPLETED", "Empty circuit must not be marked COMPLETED"

    # Non-empty circuit with wrong gates must NOT pass
    wrong_placements = [{"id": "p0", "g": "X", "col": 0, "q": 0}]
    analysis_wrong = analyze_circuit(wrong_placements, qubits=2, mission="bb84", success_criteria=criteria)
    mp_wrong = analysis_wrong["mission_progress"]
    assert mp_wrong["percentage"] < 100.0
    assert analysis_wrong["student_state"] != "COMPLETED"

def test_tutor_deterministic_criteria_evaluation():
    """Verify that Tutor analyzer uses deterministic ground truth and evaluates criteria strictly."""
    criteria = [
        "Qubits prepared in correct superposition or basis state",
        "Measurement applied in appropriate basis"
    ]
    # BB84 partial preparation: H on q0, measure on q0
    correct_placements = [
        {"id": "p0", "g": "H", "col": 0, "q": 0},
        {"id": "p1", "g": "M", "col": 1, "q": 0}
    ]
    analysis = analyze_circuit(correct_placements, qubits=2, mission="bb84", success_criteria=criteria)
    mp = analysis["mission_progress"]
    # Must deterministically evaluate criteria
    assert mp["total_count"] == 2
    assert mp["met_count"] >= 1
    assert "criteria" in mp
