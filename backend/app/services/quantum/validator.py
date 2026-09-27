"""Deterministic circuit validator.

Validates circuits before simulation — checks qubit bounds, gate support,
control/target conflicts, depth limits, and parameter ranges.
"""

from dataclasses import dataclass, field
from typing import Optional
import math

from app.schemas.circuit import PlacementIn, ValidationError, ValidationResponse


SUPPORTED_GATES = {"H", "X", "Y", "Z", "S", "T", "RX", "RY", "RZ", "CNOT", "CZ", "SWAP", "M", "B"}
TWO_QUBIT_GATES = {"CNOT", "CZ", "SWAP"}
ROTATION_GATES = {"RX", "RY", "RZ"}


def validate_circuit(
    placements: list[PlacementIn],
    qubits: int,
    max_qubits: int = 20,
    max_depth: int = 200,
    max_gates: int = 500,
) -> ValidationResponse:
    """Validate a circuit represented as frontend Placement[] format."""
    errors: list[ValidationError] = []

    # Global limits
    if qubits < 1:
        errors.append(ValidationError(code="INVALID_QUBIT_COUNT", message="Circuit must have at least 1 qubit."))
    if qubits > max_qubits:
        errors.append(ValidationError(
            code="TOO_MANY_QUBITS",
            message=f"Maximum {max_qubits} qubits allowed, got {qubits}.",
        ))

    non_barrier = [p for p in placements if p.g not in ("M", "B")]
    if len(non_barrier) > max_gates:
        errors.append(ValidationError(
            code="TOO_MANY_GATES",
            message=f"Maximum {max_gates} gates allowed, got {len(non_barrier)}.",
        ))

    if placements:
        depth = max(p.col for p in placements) + 1
        if depth > max_depth:
            errors.append(ValidationError(
                code="CIRCUIT_TOO_DEEP",
                message=f"Maximum depth {max_depth} allowed, got {depth}.",
            ))

    # Per-gate validation
    for p in placements:
        # Supported gate
        if p.g not in SUPPORTED_GATES:
            errors.append(ValidationError(
                code="INVALID_GATE",
                message=f"Unsupported gate '{p.g}'.",
                gate_id=p.id,
            ))
            continue

        # Primary qubit bounds
        if p.q < 0 or p.q >= qubits:
            errors.append(ValidationError(
                code="INVALID_QUBIT",
                message=f"Qubit {p.q} does not exist (circuit has {qubits} qubits).",
                gate_id=p.id,
            ))

        # Two-qubit gate validation
        if p.g in TWO_QUBIT_GATES:
            if p.q2 is None:
                errors.append(ValidationError(
                    code="MISSING_CONTROL",
                    message=f"Gate {p.g} requires a second qubit.",
                    gate_id=p.id,
                ))
            elif p.q2 < 0 or p.q2 >= qubits:
                errors.append(ValidationError(
                    code="INVALID_QUBIT",
                    message=f"Qubit {p.q2} does not exist (circuit has {qubits} qubits).",
                    gate_id=p.id,
                ))
            elif p.q == p.q2:
                errors.append(ValidationError(
                    code="DUPLICATE_CONTROL_TARGET",
                    message=f"Control and target cannot be the same qubit ({p.q}).",
                    gate_id=p.id,
                ))

        # Rotation parameter validation
        if p.g in ROTATION_GATES:
            if p.theta is None:
                errors.append(ValidationError(
                    code="INVALID_PARAMETER",
                    message=f"Gate {p.g} requires a theta parameter.",
                    gate_id=p.id,
                ))
            elif not math.isfinite(p.theta):
                errors.append(ValidationError(
                    code="INVALID_PARAMETER",
                    message=f"Parameter theta must be a finite number.",
                    gate_id=p.id,
                ))

    return ValidationResponse(valid=len(errors) == 0, errors=errors)
