"""Deterministic challenge evaluator.

Pipeline: validate → simulate → compare → score → return
The LLM is NEVER the source of truth for scoring.
"""

from dataclasses import dataclass
from typing import Optional

from app.schemas.circuit import PlacementIn
from app.services.quantum.validator import validate_circuit
from app.services.quantum.base import get_engine, EngineResult


@dataclass
class EvaluationResult:
    passed: bool = False
    score: int = 0
    correctness: float = 0.0
    efficiency: float = 0.0
    depth_score: float = 0.0
    gate_count_score: float = 0.0
    actual_depth: int = 0
    actual_gate_count: int = 0
    feedback: str = ""
    simulation_result: Optional[dict] = None


def evaluate_challenge(
    placements: list[PlacementIn],
    qubits: int,
    challenge_config: dict,
    framework: str = "qiskit",
) -> EvaluationResult:
    """
    Deterministically evaluate a challenge submission.

    challenge_config should contain:
        target_probabilities: dict[str, float]  # e.g. {"00": 0.5, "11": 0.5}
        allowed_gates: list[str]
        max_depth: int
        max_gate_count: int
        weight_correctness: int (default 60)
        weight_efficiency: int (default 20)
        weight_depth: int (default 10)
        weight_gate_count: int (default 10)
    """

    result = EvaluationResult()

    # ── Step 1: Validate circuit ──
    validation = validate_circuit(placements, qubits)
    if not validation.valid:
        result.feedback = f"Circuit validation failed: {validation.errors[0].message}"
        return result

    # Check allowed gates
    allowed = set(challenge_config.get("allowed_gates", []))
    if allowed:
        gate_placements = [p for p in placements if p.g not in ("M", "B")]
        used_gates = {p.g for p in gate_placements}
        forbidden = used_gates - allowed
        if forbidden:
            result.feedback = f"Gate(s) not allowed: {', '.join(forbidden)}"
            return result

    # ── Step 2: Simulate ──
    try:
        engine = get_engine(framework)
    except ValueError:
        engine = get_engine("qiskit")

    sim_result = engine.simulate(placements, qubits, shots=1024, return_statevector=True)

    if not sim_result.success:
        result.feedback = f"Simulation failed: {sim_result.error}"
        return result

    # Store simulation data
    result.simulation_result = {
        "amps": [a.model_dump() for a in (sim_result.amps or [])],
        "probs": [p.model_dump() for p in (sim_result.probs or [])],
    }

    # ── Step 3: Compute correctness ──
    target_probs = challenge_config.get("target_probabilities", {})
    if target_probs and sim_result.probs:
        # Build actual probability map (normalized to 0-1)
        actual_probs = {p.state: p.p / 100.0 for p in sim_result.probs if p.p > 0.001}

        # Compare distributions using fidelity-like metric
        total_error = 0.0
        for state, target_p in target_probs.items():
            actual_p = actual_probs.get(state, 0.0)
            total_error += abs(target_p - actual_p)

        # Also penalize unexpected states
        for state, actual_p in actual_probs.items():
            if state not in target_probs and actual_p > 0.01:
                total_error += actual_p

        # Correctness: 100% if perfect match, 0% if completely wrong
        max_error = 2.0  # maximum possible error
        correctness_pct = max(0.0, (1.0 - total_error / max_error)) * 100
        result.correctness = round(correctness_pct, 1)
    else:
        result.correctness = 0.0

    # ── Step 4: Compute efficiency metrics ──
    gate_placements = [p for p in placements if p.g not in ("M", "B")]
    result.actual_gate_count = len(gate_placements)
    result.actual_depth = max((p.col for p in placements), default=0) + 1 if placements else 0

    max_depth = challenge_config.get("max_depth", 8)
    max_gates = challenge_config.get("max_gate_count", 6)

    # Efficiency: higher is better, penalize excess depth/gates
    if result.actual_depth <= max_depth:
        depth_ratio = 1.0 - (result.actual_depth / max(max_depth * 2, 1))
        result.depth_score = round(max(0, depth_ratio) * 100, 1)
    else:
        result.depth_score = max(0, (1.0 - (result.actual_depth - max_depth) / max_depth) * 50)

    if result.actual_gate_count <= max_gates:
        gate_ratio = 1.0 - (result.actual_gate_count / max(max_gates * 2, 1))
        result.gate_count_score = round(max(0, gate_ratio) * 100, 1)
    else:
        result.gate_count_score = max(0, (1.0 - (result.actual_gate_count - max_gates) / max_gates) * 50)

    result.efficiency = round((result.depth_score + result.gate_count_score) / 2, 1)

    # ── Step 5: Final weighted score ──
    w_correct = challenge_config.get("weight_correctness", 60)
    w_eff = challenge_config.get("weight_efficiency", 20)
    w_depth = challenge_config.get("weight_depth", 10)
    w_gates = challenge_config.get("weight_gate_count", 10)
    total_weight = w_correct + w_eff + w_depth + w_gates

    weighted_score = (
        (result.correctness / 100) * w_correct
        + (result.efficiency / 100) * w_eff
        + (result.depth_score / 100) * w_depth
        + (result.gate_count_score / 100) * w_gates
    )
    result.score = round(weighted_score / total_weight * 100)

    # ── Step 6: Pass/fail ──
    result.passed = result.correctness >= 90.0 and result.score >= 50

    # ── Step 7: Feedback ──
    if result.passed:
        if result.score >= 95:
            result.feedback = "Excellent! Your solution is optimal."
        elif result.score >= 80:
            result.feedback = "Your solution produces the correct target state. You can reduce circuit depth by removing redundant gates."
        else:
            result.feedback = "Correct result, but the circuit could be more efficient. Try reducing gate count and depth."
    else:
        if result.correctness < 50:
            result.feedback = "The output probabilities don't match the target. Review the expected state and adjust your gates."
        elif result.correctness < 90:
            result.feedback = "Close! The distribution is approximately right but needs fine-tuning. Check your gate parameters."
        else:
            result.feedback = "The result is correct but the circuit exceeds constraints. Try to optimize depth and gate count."

    return result
