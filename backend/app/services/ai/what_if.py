"""What-If Quantum Circuit Simulation service.

Authoritative engine for parsing hypothetical circuit modifications,
simulating temporary modified circuits against original circuits,
calculating deterministic differences, and generating verified educational explanations.

ARCHITECTURE:
    Current Circuit (Placements)
          ↓
    User What-If Question
          ↓
    Modification Parser (with Ambiguity & Validation Detection)
          ↓
    Temporary Modified Circuit (Non-destructive: original NEVER mutated)
          ↓
    Authoritative Quantum Simulator (Ground Truth: Canonical UI Wire Order)
          ↓
    Original vs Modified Deterministic Comparison
          ↓
    Gemini Explanation (with guaranteed Deterministic Fallback)
          ↓
    Tutor Response (with structured What-If payload)
"""

import copy
import math
import cmath
import re
import uuid
from typing import Optional, Any

from app.core.config import settings
from app.core.logging import logger
from app.services.ai.tutor import (
    format_state_label,
    to_qiskit_order,
    to_ui_wire_order,
    analyze_circuit,
    GATE_INFO,
    _circuit_to_text,
    _simulation_to_text,
)


# ═══════════════════════════════════════════════════
# Authoritative Statevector Simulator (UI Wire Order)
# ═══════════════════════════════════════════════════

def _single_matrix(g: str, theta: float = math.pi / 2) -> Optional[list[complex]]:
    """Return 2x2 unitary matrix in row-major order: [M00, M01, M10, M11]."""
    H_val = 1.0 / math.sqrt(2)
    if g == "H":
        return [complex(H_val), complex(H_val), complex(H_val), complex(-H_val)]
    elif g == "X":
        return [complex(0), complex(1), complex(1), complex(0)]
    elif g == "Y":
        return [complex(0), complex(0, -1), complex(0, 1), complex(0)]
    elif g == "Z":
        return [complex(1), complex(0), complex(0), complex(-1)]
    elif g == "S":
        return [complex(1), complex(0), complex(0), complex(0, 1)]
    elif g == "T":
        return [complex(1), complex(0), complex(0), cmath.exp(complex(0, math.pi / 4))]
    elif g == "RX":
        c = math.cos(theta / 2.0)
        s = math.sin(theta / 2.0)
        return [complex(c), complex(0, -s), complex(0, -s), complex(c)]
    elif g == "RY":
        c = math.cos(theta / 2.0)
        s = math.sin(theta / 2.0)
        return [complex(c), complex(-s), complex(s), complex(c)]
    elif g == "RZ":
        c = math.cos(theta / 2.0)
        s = math.sin(theta / 2.0)
        return [complex(c, -s), complex(0), complex(0), complex(c, s)]
    return None


def simulate_circuit_deterministic(placements: list[dict], qubits: int) -> dict:
    """Run an exact statevector simulation matching sim.ts and QiskitEngine.

    Computes normalized amplitudes and probabilities in canonical UI Wire Order:
    |q0 q1 ... q_{n-1}> where q0 is wire 0 (top wire).
    """
    dim = 1 << qubits
    state: list[complex] = [complex(1, 0) if i == 0 else complex(0, 0) for i in range(dim)]

    sorted_placements = sorted(placements, key=lambda p: (p.get("col", 0), p.get("q", 0)))

    for p in sorted_placements:
        g = p.get("g", "")
        q = p.get("q", 0)
        q2 = p.get("q2")
        theta = p.get("theta", math.pi / 2)

        if g in ("M", "B"):
            continue

        if g == "CNOT" and q2 is not None:
            ctrl = q
            tgt = q2
            for i in range(dim):
                if ((i >> ctrl) & 1) and not ((i >> tgt) & 1):
                    j = i | (1 << tgt)
                    tmp = state[i]
                    state[i] = state[j]
                    state[j] = tmp
        elif g == "CZ" and q2 is not None:
            ctrl = q
            tgt = q2
            for i in range(dim):
                if ((i >> ctrl) & 1) and ((i >> tgt) & 1):
                    state[i] = state[i] * complex(-1, 0)
        elif g == "SWAP" and q2 is not None:
            qa = q
            qb = q2
            for i in range(dim):
                ba = (i >> qa) & 1
                bb = (i >> qb) & 1
                if ba == 0 and bb == 1:
                    j = (i | (1 << qa)) & ~(1 << qb)
                    if j > i:
                        t = state[i]
                        state[i] = state[j]
                        state[j] = t
        else:
            m = _single_matrix(g, theta)
            if m is not None:
                for i in range(dim):
                    if (i >> q) & 1:
                        continue
                    j = i | (1 << q)
                    a = state[i]
                    b = state[j]
                    state[i] = m[0] * a + m[1] * b
                    state[j] = m[2] * a + m[3] * b

    amps = []
    probs = []
    for i, amp in enumerate(state):
        prob = abs(amp) ** 2
        label = format_state_label(i, qubits)
        phase = cmath.phase(amp)
        amps.append({
            "state": label,
            "re": round(amp.real, 6),
            "im": round(amp.imag, 6),
            "p": round(prob, 6),
            "phase": round(phase, 6),
        })
        probs.append({
            "state": label,
            "p": round(prob * 100.0, 1),
        })

    return {"amps": amps, "probs": probs}


# ═══════════════════════════════════════════════════
# Query Intent Detection & Parser
# ═══════════════════════════════════════════════════

WHAT_IF_TRIGGERS = [
    "what if", "what happens if", "what would happen if", "what does happen if",
    "if i remove", "if i delete", "if i add", "if i insert", "if i put", "if i replace",
    "if i change", "if i swap", "suppose i", "hypothetically", "how about removing",
    "how about adding", "can i remove", "can i add", "can i replace",
]

KNOWN_GATES = ["CNOT", "SWAP", "CZ", "RX", "RY", "RZ", "H", "X", "Y", "Z", "S", "T", "M"]


def is_what_if_query(question: str) -> bool:
    """Determine if a user's question is a What-If quantum circuit inquiry."""
    q_low = question.lower().strip()
    for trig in WHAT_IF_TRIGGERS:
        if trig in q_low:
            return True

    # Direct action phrases: e.g. "remove H", "remove the cnot", "add X to q1", "replace H with X", "put X before H"
    if re.search(r"^(?:please\s+)?(?:remove|delete|add|put|insert|replace|change)\s+(?:the\s+)?(?:gate|[a-z0-9]+)", q_low):
        return True

    return False


class WhatIfParseResult:
    def __init__(
        self,
        valid: bool,
        operation: Optional[str] = None,
        target_gate_id: Optional[str] = None,
        gate: Optional[str] = None,
        qubit: Optional[int] = None,
        target_qubit: Optional[int] = None,
        column: Optional[int] = None,
        description: str = "",
        is_ambiguous: bool = False,
        clarification_message: Optional[str] = None,
        error_message: Optional[str] = None,
    ):
        self.valid = valid
        self.operation = operation
        self.target_gate_id = target_gate_id
        self.gate = gate
        self.qubit = qubit
        self.target_qubit = target_qubit
        self.column = column
        self.description = description
        self.is_ambiguous = is_ambiguous
        self.clarification_message = clarification_message
        self.error_message = error_message

    def to_dict(self) -> dict:
        return {
            "valid": self.valid,
            "operation": self.operation,
            "target_gate_id": self.target_gate_id,
            "gate": self.gate,
            "qubit": self.qubit,
            "target_qubit": self.target_qubit,
            "column": self.column,
            "description": self.description,
            "is_ambiguous": self.is_ambiguous,
            "clarification_message": self.clarification_message,
            "error_message": self.error_message,
        }


def _extract_qubit(text: str) -> Optional[int]:
    """Extract qubit index from string (e.g. 'q0', 'q[1]', 'qubit 2', 'on 0')."""
    m = re.search(r"(?:qubit|q|wire)\s*\[?(\d+)\]?", text, re.IGNORECASE)
    if m:
        return int(m.group(1))
    m2 = re.search(r"\b(?:on|to|from|at)\s+(\d+)\b", text, re.IGNORECASE)
    if m2:
        return int(m2.group(1))
    return None


def _extract_column(text: str) -> Optional[int]:
    """Extract moment/column from string (e.g. 'column 2', 'col 1', 'moment 0')."""
    m = re.search(r"(?:column|col|moment|step)\s*(\d+)", text, re.IGNORECASE)
    if m:
        return int(m.group(1))
    return None


def _extract_gate_name(text: str) -> Optional[str]:
    """Identify quantum gate from query text."""
    # Match multi-letter gates first (CNOT, SWAP, CZ, RX, RY, RZ)
    for g in ["CNOT", "SWAP", "CZ", "RX", "RY", "RZ"]:
        if re.search(rf"\b{g}\b", text, re.IGNORECASE):
            return g
    # Match single-letter gates
    for g in ["H", "X", "Y", "Z", "S", "T", "M"]:
        if re.search(rf"\b{g}\b(?:\s+gate)?", text, re.IGNORECASE):
            return g
        if re.search(rf"\b{g.lower()}\b\s+gate", text, re.IGNORECASE):
            return g
    return None


def _format_candidate_label(p: dict) -> str:
    """Format candidate gate consistently per Section 5 example: 'CNOT q0 → q1, column 1' or 'H on q0, column 0'."""
    g = p.get("g", "")
    q = p.get("q", 0)
    col = p.get("col", 0)
    q2 = p.get("q2")
    if q2 is not None:
        return f"{g} q{q} → q{q2}, column {col}"
    return f"{g} on q{q}, column {col}"


def parse_what_if_query(
    question: str,
    placements: list[dict],
    qubits: int = 2,
    selected_gate: Optional[dict] = None,
) -> WhatIfParseResult:
    """Deterministically parse a user's What-If question into a structured modification."""
    q_raw = question.strip()
    q_low = q_raw.lower()

    # Active operational gates (ignoring measurement and barrier for gate math)
    active_gates = [p for p in placements if p.get("g") not in ("M", "B")]
    active_gates.sort(key=lambda p: (p.get("col", 0), p.get("q", 0)))

    # ─────────────────────────────────────────────────────────────
    # CASE 1: INSERT / PREPEND ("put X before H", "add H before CNOT")
    # ─────────────────────────────────────────────────────────────
    m_before = re.search(
        r"(?:put|insert|add|prepend)\s+(?:an?\s+)?([a-z0-9]+)\s+before\s+(?:the\s+)?([a-z0-9]+)",
        q_low,
    )
    if m_before:
        new_g = _extract_gate_name(m_before.group(1))
        target_g = _extract_gate_name(m_before.group(2))
        if not new_g:
            return WhatIfParseResult(valid=False, error_message=f"Unknown gate '{m_before.group(1)}' to insert.")
        if not target_g:
            return WhatIfParseResult(valid=False, error_message=f"Unknown target gate '{m_before.group(2)}'.")

        candidates = [p for p in active_gates if p.get("g") == target_g]
        if not candidates:
            return WhatIfParseResult(
                valid=False,
                error_message=f"Cannot put {new_g} before {target_g}: no {target_g} gate exists in your circuit."
            )
        if len(candidates) > 1:
            cand_lines = [f"{i+1}. {_format_candidate_label(p)}" for i, p in enumerate(candidates)]
            msg = f"Which {target_g} gate do you mean?\n\n" + "\n".join(cand_lines)
            return WhatIfParseResult(valid=False, is_ambiguous=True, clarification_message=msg)

        target = candidates[0]
        specified_q = _extract_qubit(q_raw)
        chosen_q = specified_q if specified_q is not None else target.get("q", 0)
        if chosen_q >= qubits:
            return WhatIfParseResult(valid=False, error_message=f"Qubit q{chosen_q} is invalid. Your circuit only has qubits q0 to q{qubits - 1}.")

        desc = f"Put {new_g} before {target_g} on q{chosen_q}"
        return WhatIfParseResult(
            valid=True,
            operation="insert_before",
            target_gate_id=target.get("id"),
            gate=new_g,
            qubit=chosen_q,
            column=target.get("col", 0),
            description=desc,
        )

    # ─────────────────────────────────────────────────────────────
    # CASE 2: REPLACE ("replace H with X", "replace CNOT with X", "change H to X")
    # ─────────────────────────────────────────────────────────────
    m_replace = re.search(
        r"(?:replace|change|swap)\s+(?:the\s+)?([a-z0-9]+)\s+(?:with|to)\s+(?:an?\s+)?([a-z0-9]+)",
        q_low,
    )
    if m_replace:
        old_g = _extract_gate_name(m_replace.group(1))
        new_g = _extract_gate_name(m_replace.group(2))
        if not old_g and "this gate" in q_low and selected_gate:
            old_g = selected_gate.get("gate")
        if not old_g:
            return WhatIfParseResult(valid=False, error_message=f"Unknown source gate '{m_replace.group(1)}' to replace.")
        if not new_g:
            return WhatIfParseResult(valid=False, error_message=f"Unknown replacement gate '{m_replace.group(2)}'.")

        candidates = [p for p in active_gates if p.get("g") == old_g]
        if not candidates:
            return WhatIfParseResult(valid=False, error_message=f"Cannot replace {old_g}: no {old_g} gate found in circuit.")
        if len(candidates) > 1:
            cand_lines = [f"{i+1}. {_format_candidate_label(p)}" for i, p in enumerate(candidates)]
            msg = f"Which {old_g} gate do you mean to replace?\n\n" + "\n".join(cand_lines)
            return WhatIfParseResult(valid=False, is_ambiguous=True, clarification_message=msg)

        target = candidates[0]
        desc = f"Replace {old_g} with {new_g} on q{target.get('q')}"
        return WhatIfParseResult(
            valid=True,
            operation="replace",
            target_gate_id=target.get("id"),
            gate=new_g,
            qubit=target.get("q", 0),
            column=target.get("col", 0),
            description=desc,
        )

    # ─────────────────────────────────────────────────────────────
    # CASE 3: REMOVE ("remove H", "remove the CNOT", "remove the gate", "remove last gate")
    # ─────────────────────────────────────────────────────────────
    is_remove = any(w in q_low for w in ("remove", "delete", "drop", "take away", "eliminate", "without"))
    if is_remove:
        if not active_gates:
            return WhatIfParseResult(valid=False, error_message="Your circuit is currently empty, so there are no gates to remove.")

        # Specific: "remove last gate" or "remove the second gate" or "remove gate at column 2"
        if "last gate" in q_low or "last" in q_low:
            last_gate = active_gates[-1]
            desc = f"Remove last gate ({last_gate.get('g')} on q{last_gate.get('q')})"
            return WhatIfParseResult(
                valid=True,
                operation="remove",
                target_gate_id=last_gate.get("id"),
                gate=last_gate.get("g"),
                qubit=last_gate.get("q"),
                column=last_gate.get("col"),
                description=desc,
            )

        m_ordinal = re.search(r"(?:first|1st|second|2nd|third|3rd|fourth|4th|fifth|5th|gate\s+(\d+))\s+gate?", q_low)
        if m_ordinal:
            ord_map = {"first": 0, "1st": 0, "second": 1, "2nd": 1, "third": 2, "3rd": 2, "fourth": 3, "4th": 3}
            idx = ord_map.get(m_ordinal.group(0).split()[0])
            if idx is None and m_ordinal.group(1):
                idx = int(m_ordinal.group(1)) - 1
            if idx is not None:
                if 0 <= idx < len(active_gates):
                    t_gate = active_gates[idx]
                    desc = f"Remove gate #{idx + 1} ({t_gate.get('g')} on q{t_gate.get('q')})"
                    return WhatIfParseResult(
                        valid=True,
                        operation="remove",
                        target_gate_id=t_gate.get("id"),
                        gate=t_gate.get("g"),
                        qubit=t_gate.get("q"),
                        column=t_gate.get("col"),
                        description=desc,
                    )
                else:
                    return WhatIfParseResult(valid=False, error_message=f"Gate #{idx + 1} does not exist. Circuit has {len(active_gates)} gate(s).")

        # Specific: by column/moment
        col = _extract_column(q_raw)
        q_idx = _extract_qubit(q_raw)

        if col is not None:
            col_gates = [p for p in active_gates if p.get("col") == col]
            if q_idx is not None:
                col_gates = [p for p in col_gates if p.get("q") == q_idx]
            if not col_gates:
                return WhatIfParseResult(valid=False, error_message=f"No gate found at column {col}{' on q' + str(q_idx) if q_idx is not None else ''}.")
            if len(col_gates) > 1:
                cand_lines = [f"{i+1}. {_format_candidate_label(p)}" for i, p in enumerate(col_gates)]
                msg = f"Which gate at column {col} do you mean?\n\n" + "\n".join(cand_lines)
                return WhatIfParseResult(valid=False, is_ambiguous=True, clarification_message=msg)
            t_gate = col_gates[0]
            desc = f"Remove {t_gate.get('g')} on q{t_gate.get('q')} at column {col}"
            return WhatIfParseResult(
                valid=True,
                operation="remove",
                target_gate_id=t_gate.get("id"),
                gate=t_gate.get("g"),
                qubit=t_gate.get("q"),
                column=col,
                description=desc,
            )

        # Gate name specified (e.g. "remove H", "remove the CNOT")
        g_name = _extract_gate_name(q_raw)

        # If user says "remove the gate" or "remove gate" without gate name
        if not g_name and ("the gate" in q_low or "this gate" in q_low or q_low.endswith("gate") or "remove gate" in q_low):
            if "this gate" in q_low and selected_gate:
                t_id = selected_gate.get("id")
                sel_p = next((p for p in active_gates if p.get("id") == t_id), None)
                if sel_p:
                    desc = f"Remove selected {sel_p.get('g')} on q{sel_p.get('q')}"
                    return WhatIfParseResult(
                        valid=True,
                        operation="remove",
                        target_gate_id=sel_p.get("id"),
                        gate=sel_p.get("g"),
                        qubit=sel_p.get("q"),
                        column=sel_p.get("col"),
                        description=desc,
                    )

            if len(active_gates) > 1:
                cand_lines = [f"{i+1}. {_format_candidate_label(p)}" for i, p in enumerate(active_gates)]
                msg = "Which gate do you mean?\n\n" + "\n".join(cand_lines)
                return WhatIfParseResult(valid=False, is_ambiguous=True, clarification_message=msg)
            elif len(active_gates) == 1:
                t_gate = active_gates[0]
                desc = f"Remove {t_gate.get('g')} on q{t_gate.get('q')}"
                return WhatIfParseResult(
                    valid=True,
                    operation="remove",
                    target_gate_id=t_gate.get("id"),
                    gate=t_gate.get("g"),
                    qubit=t_gate.get("q"),
                    column=t_gate.get("col"),
                    description=desc,
                )

        if g_name:
            candidates = [p for p in active_gates if p.get("g") == g_name]
            if q_idx is not None:
                candidates = [p for p in candidates if p.get("q") == q_idx or p.get("q2") == q_idx]
            if not candidates:
                return WhatIfParseResult(
                    valid=False,
                    error_message=f"No {g_name} gate{' on q' + str(q_idx) if q_idx is not None else ''} found in your circuit to remove."
                )
            if len(candidates) > 1:
                cand_lines = [f"{i+1}. {_format_candidate_label(p)}" for i, p in enumerate(candidates)]
                msg = f"Which {g_name} gate do you mean?\n\n" + "\n".join(cand_lines)
                return WhatIfParseResult(valid=False, is_ambiguous=True, clarification_message=msg)

            t_gate = candidates[0]
            desc = f"Remove {g_name} on q{t_gate.get('q')}{' at column ' + str(t_gate.get('col')) if t_gate.get('col') is not None else ''}"
            return WhatIfParseResult(
                valid=True,
                operation="remove",
                target_gate_id=t_gate.get("id"),
                gate=g_name,
                qubit=t_gate.get("q"),
                column=t_gate.get("col"),
                description=desc,
            )

        # Ambiguous removal fallback
        if len(active_gates) > 1:
            cand_lines = [f"{i+1}. {_format_candidate_label(p)}" for i, p in enumerate(active_gates)]
            msg = "Which gate do you mean?\n\n" + "\n".join(cand_lines)
            return WhatIfParseResult(valid=False, is_ambiguous=True, clarification_message=msg)

    # ─────────────────────────────────────────────────────────────
    # CASE 4: ADD / APPEND ("add X to q1", "add CNOT between q0 and q1", "add X after the last gate")
    # ─────────────────────────────────────────────────────────────
    is_add = any(w in q_low for w in ("add", "append", "attach", "insert"))
    if is_add:
        g_name = _extract_gate_name(q_raw)
        if not g_name:
            if "gate" in q_low:
                return WhatIfParseResult(
                    valid=False,
                    is_ambiguous=True,
                    clarification_message="Which gate would you like to add? (e.g. H, X, Z, or CNOT) and to which qubit?",
                )
            return WhatIfParseResult(valid=False, error_message="Please specify which gate you would like to add (e.g. 'add X to q1').")

        # Two-qubit gate: CNOT, CZ, SWAP
        if g_name in ("CNOT", "CZ", "SWAP"):
            qubits_found = re.findall(r"(?:q|qubit\s*)?(\d+)", q_raw, re.IGNORECASE)
            # Filter out gate name letters
            q_ints = []
            for item in qubits_found:
                try:
                    q_ints.append(int(item))
                except ValueError:
                    pass

            if len(q_ints) < 2:
                return WhatIfParseResult(
                    valid=False,
                    is_ambiguous=True,
                    clarification_message=f"A {g_name} gate requires two qubits. Which control and target qubits do you mean? (e.g. 'add CNOT from q0 to q1')",
                )
            ctrl_q, tgt_q = q_ints[0], q_ints[1]
            if ctrl_q == tgt_q:
                return WhatIfParseResult(valid=False, error_message=f"A {g_name} gate requires distinct control and target qubits (got q{ctrl_q} for both).")
            if ctrl_q >= qubits or tgt_q >= qubits:
                return WhatIfParseResult(valid=False, error_message=f"Qubit index out of bounds. Circuit only has {qubits} qubits (q0 to q{qubits - 1}).")

            max_col = max((p.get("col", 0) for p in placements), default=-1)
            target_col = max_col + 1

            desc = f"Add {g_name} from q{ctrl_q} to q{tgt_q}"
            return WhatIfParseResult(
                valid=True,
                operation="add",
                gate=g_name,
                qubit=ctrl_q,
                target_qubit=tgt_q,
                column=target_col,
                description=desc,
            )

        # Single qubit gate
        target_q = _extract_qubit(q_raw)
        if target_q is None:
            return WhatIfParseResult(
                valid=False,
                is_ambiguous=True,
                clarification_message=f"Which qubit wire would you like to add the {g_name} gate to? (e.g. 'add {g_name} to q0')",
            )
        if target_q >= qubits:
            return WhatIfParseResult(valid=False, error_message=f"Qubit q{target_q} is invalid. Your circuit only has {qubits} qubits (q0 to q{qubits - 1}).")

        # Column calculation: if "after last gate" or unspecified, place at depth
        max_col = max((p.get("col", 0) for p in placements), default=-1)
        target_col = max_col + 1
        col_spec = _extract_column(q_raw)
        if col_spec is not None:
            target_col = col_spec

        desc = f"Add {g_name} to q{target_q}"
        return WhatIfParseResult(
            valid=True,
            operation="add",
            gate=g_name,
            qubit=target_q,
            column=target_col,
            description=desc,
        )

    # Could not match a supported modification
    return WhatIfParseResult(
        valid=False,
        error_message="I understand you're asking a What-If question, but I couldn't determine the exact gate operation. Try: 'What if I remove the H gate?', 'What if I put X before H?', or 'What if I add X to q1?'",
    )


# ═══════════════════════════════════════════════════
# Temporary Circuit Construction (Non-destructive)
# ═══════════════════════════════════════════════════

def apply_what_if_modification(
    placements: list[dict],
    mod: WhatIfParseResult,
    qubits: int,
) -> list[dict]:
    """Pure function: apply modification to create a new circuit.

    CRITICAL INVARIANT: The original placements list is NEVER mutated.
    """
    # Deep copy original placements
    modified: list[dict] = [dict(p) for p in placements]

    op = mod.operation

    if op == "remove":
        target_id = mod.target_gate_id
        if target_id:
            modified = [p for p in modified if p.get("id") != target_id]
        elif mod.gate and mod.qubit is not None:
            # Fallback match
            idx = next((i for i, p in enumerate(modified) if p.get("g") == mod.gate and p.get("q") == mod.qubit), None)
            if idx is not None:
                modified.pop(idx)

    elif op == "add":
        new_id = f"whatif_{uuid.uuid4().hex[:6]}"
        entry = {
            "id": new_id,
            "g": mod.gate,
            "q": mod.qubit,
            "col": mod.column if mod.column is not None else 0,
        }
        if mod.target_qubit is not None:
            entry["q2"] = mod.target_qubit
        modified.append(entry)

    elif op == "insert_before":
        target_col = mod.column if mod.column is not None else 0
        # Shift all placements at or after target_col right by 1
        for p in modified:
            if p.get("col", 0) >= target_col:
                p["col"] = p.get("col", 0) + 1

        new_id = f"whatif_{uuid.uuid4().hex[:6]}"
        entry = {
            "id": new_id,
            "g": mod.gate,
            "q": mod.qubit if mod.qubit is not None else 0,
            "col": target_col,
        }
        if mod.target_qubit is not None:
            entry["q2"] = mod.target_qubit
        modified.append(entry)

    elif op == "replace":
        target_id = mod.target_gate_id
        for p in modified:
            if p.get("id") == target_id:
                p["g"] = mod.gate
                if mod.gate in ("CNOT", "CZ", "SWAP"):
                    if p.get("q2") is None:
                        p["q2"] = 1 if p.get("q", 0) == 0 else 0
                else:
                    p.pop("q2", None)

    # Sort deterministically by column then qubit
    modified.sort(key=lambda p: (p.get("col", 0), p.get("q", 0)))
    return modified


# ═══════════════════════════════════════════════════
# Deterministic Comparison & Diff Computation
# ═══════════════════════════════════════════════════

def compare_circuits(
    orig_analysis: dict,
    mod_analysis: dict,
    mod: WhatIfParseResult,
) -> dict:
    """Compute exact numerical and structural differences between original and modified circuits."""
    orig_sim = orig_analysis.get("simulation", {})
    mod_sim = mod_analysis.get("simulation", {})

    orig_probs = {p["state"]: p["p"] for p in orig_sim.get("probs", [])}
    mod_probs = {p["state"]: p["p"] for p in mod_sim.get("probs", [])}

    all_states = sorted(list(set(orig_probs.keys()) | set(mod_probs.keys())))
    prob_diffs = []

    for s in all_states:
        p_orig = orig_probs.get(s, 0.0)
        p_mod = mod_probs.get(s, 0.0)
        delta = round(p_mod - p_orig, 1)
        if abs(delta) > 0.01 or p_orig > 0 or p_mod > 0:
            prob_diffs.append({
                "state": s,
                "original": p_orig,
                "modified": p_mod,
                "delta": delta,
            })

    prob_diffs.sort(key=lambda x: -abs(x["delta"]))

    # Entanglement change
    orig_ent = orig_analysis.get("entanglement_detected", False)
    mod_ent = mod_analysis.get("entanglement_detected", False)
    if orig_ent and not mod_ent:
        ent_desc = "Entanglement lost (circuit collapsed to separable state)"
    elif not orig_ent and mod_ent:
        ent_desc = "Entanglement created"
    elif orig_ent and mod_ent:
        ent_desc = "Entangled (retained)"
    else:
        ent_desc = "Separable (no entanglement)"

    # Mission criteria diff
    orig_crit = {cr["criterion"]: cr["status"] for cr in orig_analysis.get("verification", {}).get("criteria_results", [])}
    mod_crit = {cr["criterion"]: cr["status"] for cr in mod_analysis.get("verification", {}).get("criteria_results", [])}

    lost_criteria = []
    gained_criteria = []
    for c_name, o_status in orig_crit.items():
        m_status = mod_crit.get(c_name, "UNMET")
        if o_status == "MET" and m_status != "MET":
            lost_criteria.append(c_name)
        elif o_status != "MET" and m_status == "MET":
            gained_criteria.append(c_name)

    mission_impact = []
    if lost_criteria:
        for lc in lost_criteria:
            if "entangle" in lc.lower() or "bell" in lc.lower():
                mission_impact.append(f"Removing this operation means the circuit no longer satisfies the entanglement requirement ({lc}) of this mission.")
            elif "superposition" in lc.lower():
                mission_impact.append(f"Removing this operation breaks the superposition requirement ({lc}) of this mission.")
            else:
                mission_impact.append(f"This modification causes the circuit to fail the '{lc}' requirement of this mission.")
    elif gained_criteria:
        for gc in gained_criteria:
            mission_impact.append(f"This modification successfully satisfies the '{gc}' requirement of this mission!")

    # Textual diff
    ascii_orig = _circuit_to_text(orig_analysis)
    ascii_mod = _circuit_to_text(mod_analysis)

    return {
        "operation": mod.operation,
        "description": mod.description,
        "gate_count": {
            "original": orig_analysis.get("gate_count", 0),
            "modified": mod_analysis.get("gate_count", 0),
            "diff": mod_analysis.get("gate_count", 0) - orig_analysis.get("gate_count", 0),
        },
        "depth": {
            "original": orig_analysis.get("depth", 0),
            "modified": mod_analysis.get("depth", 0),
            "diff": mod_analysis.get("depth", 0) - orig_analysis.get("depth", 0),
        },
        "entanglement": {
            "original": orig_ent,
            "modified": mod_ent,
            "summary": ent_desc,
        },
        "probabilities": prob_diffs,
        "mission_impact": mission_impact,
        "lost_criteria": lost_criteria,
        "gained_criteria": gained_criteria,
        "ascii_diff": {
            "original": ascii_orig,
            "modified": ascii_mod,
        },
    }


# ═══════════════════════════════════════════════════
# Explanation Builders: Gemini & Deterministic
# ═══════════════════════════════════════════════════

def _format_prob_comparison_lines(prob_diffs: list[dict]) -> str:
    """Format probability comparison lines cleanly."""
    lines = []
    for pd in prob_diffs[:6]:
        state = pd["state"]
        p_orig = pd["original"]
        p_mod = pd["modified"]
        if p_orig != p_mod:
            lines.append(f"- $|{state}\\rangle$: **{p_orig:.1f}% → {p_mod:.1f}%** ({pd['delta']:+.1f}%)")
        else:
            lines.append(f"- $|{state}\\rangle$: {p_orig:.1f}% (unchanged)")
    return "\n".join(lines)


def deterministic_what_if_explanation(
    comparison: dict,
    orig_analysis: dict,
    mod_analysis: dict,
) -> str:
    """Authoritative, pedagogical explanation when Gemini is offline or fallback is required."""
    desc = comparison.get("description", "Circuit modification")
    op = comparison.get("operation", "")
    probs = comparison.get("probabilities", [])

    orig_gates = orig_analysis.get("gate_count", 0)
    mod_gates = mod_analysis.get("gate_count", 0)

    # State formulas
    orig_states = [p["state"] for p in orig_analysis.get("simulation", {}).get("probs", []) if p["p"] > 0.05]
    mod_states = [p["state"] for p in mod_analysis.get("simulation", {}).get("probs", []) if p["p"] > 0.05]

    ket_orig = ", ".join(f"|{s}\\rangle" for s in orig_states[:2])
    ket_mod = ", ".join(f"|{s}\\rangle" for s in mod_states[:3])

    if orig_analysis.get("entanglement_detected") and len(orig_states) == 2:
        orig_eq = r"$$|\psi_{\text{orig}}\rangle = \frac{|00\rangle + |11\rangle}{\sqrt{2}}$$"
    elif orig_analysis.get("is_empty"):
        orig_eq = "$$|\\psi_{\\text{orig}}\\rangle = |0\\dots0\\rangle$$"
    else:
        orig_eq = f"$$|\\psi_{{\\text{{orig}}}}\\rangle = {ket_orig}$$"

    if mod_analysis.get("entanglement_detected") and len(mod_states) == 2:
        mod_eq = r"$$|\psi_{\text{what-if}}\rangle = \frac{|00\rangle + |11\rangle}{\sqrt{2}}$$"
    elif mod_analysis.get("is_empty"):
        mod_eq = "$$|\\psi_{\\text{what-if}}\\rangle = |0\\dots0\\rangle$$"
    elif len(mod_states) == 1:
        mod_eq = f"$$|\\psi_{{\\text{{what-if}}}}\\rangle = |{mod_states[0]}\\rangle$$"
    else:
        mod_eq = f"$$|\\psi_{{\\text{{what-if}}}}\\rangle = {ket_mod}$$"

    # Why it changed logic
    why_lines = []
    key_idea = "Unitary gate sequencing fundamentally defines quantum state trajectories."

    if op == "remove":
        removed_g = comparison.get("description", "")
        if "H" in removed_g:
            why_lines.append(
                "Removing the **Hadamard (H)** gate prevents the qubit from entering an equal superposition of $|0\\rangle$ and $|1\\rangle$. "
                "Because the qubit remains in the ground state $|0\\rangle$, subsequent controlled gates (like CNOT) no longer branch into parallel execution, "
                "collapsing the system into a deterministic single basis state."
            )
            key_idea = "The Hadamard gate creates quantum superposition: $H|0\\rangle = \\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}}$. Without it, entangling gates act on classical eigenstates."
        elif "CNOT" in removed_g:
            why_lines.append(
                "Removing the **CNOT** gate breaks the multi-qubit entanglement interaction. While the first qubit may remain in superposition, "
                "the target qubit receives no operations and remains strictly in $|0\\rangle$. "
                "The two qubits become independent, separable product states rather than an entangled Bell pair."
            )
            key_idea = "Entanglement requires both a superposition gate (H) and an entangling gate (CNOT) connecting control and target."
        else:
            why_lines.append(f"Removing this operation eliminates its unitary transformation from the circuit, altering both the basis states and final measurement amplitudes.")
    elif op == "insert_before" and "X before H" in desc:
        why_lines.append(
            "Placing an **X** gate before the Hadamard flips the initial state $|0\\rangle \\xrightarrow{X} |1\\rangle$. "
            "Applying the Hadamard to $|1\\rangle$ produces the $|-\\rangle = \\frac{|0\\rangle - |1\\rangle}{\\sqrt{2}}$ state (introducing a relative minus phase) "
            "rather than $|+\\rangle$. If entangled by a subsequent CNOT, this prepares the Bell state $|\\Phi^-\\rangle = \\frac{|00\\rangle - |11\\rangle}{\\sqrt{2}}$."
        )
        key_idea = "Pauli-X flips $|0\\rangle \\to |1\\rangle$. Applying Hadamard to $|1\\rangle$ injects a $\\pi$ relative phase: $H|1\\rangle = |-\\rangle$."
    elif op == "add":
        why_lines.append(f"Adding this operation introduces a new unitary rotation onto the register, steering the quantum state amplitudes.")
        key_idea = "Each added gate applies a unitary matrix multiplication $U_k \\dots U_1 |\\psi_0\\rangle$ to the statevector."
    elif op == "replace":
        why_lines.append(f"Replacing this gate substitutes a different unitary matrix operator, reshaping the interference pattern.")
        key_idea = "Different quantum gates perform distinct geometric rotations on the Bloch sphere."

    prob_lines = _format_prob_comparison_lines(probs)

    parts = [
        f"### What changed\n\n**{desc}**\n",
        f"### Before\n\n{orig_gates} gate(s), depth {orig_analysis.get('depth', 0)}\n\n{orig_eq}\n\n**Probabilities**:\n"
        + "\n".join(f"- $|{p['state']}\\rangle$ → {p['p']:.1f}%" for p in orig_analysis.get("simulation", {}).get("probs", []) if p["p"] > 0.05),
        f"\n\n### After (What-If)\n\n{mod_gates} gate(s), depth {mod_analysis.get('depth', 0)}\n\n{mod_eq}\n\n**Probabilities**:\n"
        + "\n".join(f"- $|{p['state']}\\rangle$ → {p['p']:.1f}%" for p in mod_analysis.get("simulation", {}).get("probs", []) if p["p"] > 0.05),
        f"\n\n### Probability Shift\n\n{prob_lines}",
        f"\n\n### Why it changed\n\n" + "\n\n".join(why_lines),
        f"\n\n### Key idea\n\n{key_idea}",
    ]

    if comparison.get("mission_impact"):
        parts.append(f"\n\n### Mission Impact\n\n" + "\n\n".join(f"• {mi}" for mi in comparison["mission_impact"]))

    return "\n".join(parts)


def _build_what_if_llm_prompt(
    question: str,
    context: dict,
    orig_analysis: dict,
    mod_analysis: dict,
    comparison: dict,
) -> tuple[str, str]:
    """Construct system and user messages for Gemini to explain the verified circuit comparison."""
    system = (
        "You are QubitLab's Quantum AI Tutor explaining a VERIFIED What-If Quantum Circuit experiment.\n"
        "The system has already simulated BOTH the original circuit and the modified what-if circuit using the authoritative quantum simulator.\n\n"
        "STRICT GROUND TRUTH RULES:\n"
        "1. THE SIMULATOR IS THE ABSOLUTE SOURCE OF TRUTH: You must NEVER guess, calculate, or alter numerical probabilities, amplitudes, gate counts, or circuit depth.\n"
        "2. USE SUPPLIED DATA ONLY: Every percentage, state label, and gate number in your response MUST match the supplied simulation tables exactly.\n"
        "3. CANONICAL UI WIRE ORDER: State labels use |q0 q1 ... q_{n-1}> where q0 is top wire.\n"
        "4. DO NOT REVEAL MISSION CODE OR UNREQUESTED FULL SOLUTIONS: Keep your guidance educational, concise, and focused on the physical quantum reason for the observed difference.\n"
        "5. MISSION AWARENESS: If the modification impacts success criteria, explain the mission consequence directly.\n"
        "6. LATEX: Format math with $ ... $ (inline) and $$ ... $$ (display).\n"
        "7. RESPONSE STRUCTURE:\n"
        "   ### What changed\n"
        "   ### Before\n"
        "   ### After\n"
        "   ### Probability Comparison\n"
        "   ### Mission Impact (if applicable)\n"
        "   ### Why it changed\n"
        "   ### Key idea\n"
    )

    user_lines = [
        f"STUDENT WHAT-IF QUESTION: {question}",
        f"MODIFICATION: {comparison['description']} (Operation: {comparison['operation']})\n",
        "── ORIGINAL CIRCUIT ──",
        _circuit_to_text(orig_analysis),
        "\n── WHAT-IF MODIFIED CIRCUIT ──",
        _circuit_to_text(mod_analysis),
        "\n── ORIGINAL SIMULATOR GROUND TRUTH ──",
        _simulation_to_text(orig_analysis["simulation"], orig_analysis["qubits"]),
        "\n── WHAT-IF SIMULATOR GROUND TRUTH ──",
        _simulation_to_text(mod_analysis["simulation"], mod_analysis["qubits"]),
        "\n── DETERMINISTIC COMPARISON ──",
        f"Gate count: {comparison['gate_count']['original']} → {comparison['gate_count']['modified']} (delta {comparison['gate_count']['diff']})",
        f"Circuit depth: {comparison['depth']['original']} → {comparison['depth']['modified']} (delta {comparison['depth']['diff']})",
        f"Entanglement status: {comparison['entanglement']['summary']}",
        "Probability deltas:",
    ]

    for pd in comparison["probabilities"][:6]:
        user_lines.append(f"  |{pd['state']}⟩: {pd['original']:.1f}% → {pd['modified']:.1f}% ({pd['delta']:+.1f}%)")

    if comparison.get("mission_impact"):
        user_lines.append("\n── MISSION CRITERIA IMPACT ──")
        for mi in comparison["mission_impact"]:
            user_lines.append(f"• {mi}")

    user_lines.append(
        "\nExplain clearly and pedagogically why this modification causes the exact observed difference in quantum state and probabilities."
    )

    return system, "\n".join(user_lines)


# ═══════════════════════════════════════════════════
# Master Orchestrator
# ═══════════════════════════════════════════════════

async def run_what_if_experiment(question: str, context: dict) -> dict:
    """Execute the full What-If pipeline:

    1. Parse question into structured modification object
    2. Check for ambiguity or validation errors
    3. Generate isolated temporary modified circuit (original untouched)
    4. Simulate original & modified circuits deterministically
    5. Calculate deterministic difference metrics
    6. Generate verified Gemini explanation (or deterministic fallback)
    7. Return clean markdown response with structured what_if payload
    """
    placements = context.get("placements", [])
    qubits = context.get("qubits", 2)
    selected_gate = context.get("selected_gate")

    # 1. Parse modification
    mod = parse_what_if_query(question, placements, qubits=qubits, selected_gate=selected_gate)

    if not mod.valid:
        if mod.is_ambiguous:
            return {
                "response": mod.clarification_message or "Could you clarify which gate you mean?",
                "sources": [],
                "suggestions": [],
                "what_if": None,
            }
        return {
            "response": f"⚠️ **What-If Notice**: {mod.error_message or 'Unable to parse what-if request.'}",
            "sources": [],
            "suggestions": [],
            "what_if": None,
        }

    # 2. Construct temporary modified circuit (ORIGINAL NEVER MUTATED)
    modified_placements = apply_what_if_modification(placements, mod, qubits=qubits)

    # 3. Authoritative simulation
    orig_sim = simulate_circuit_deterministic(placements, qubits=qubits)
    mod_sim = simulate_circuit_deterministic(modified_placements, qubits=qubits)

    # 4. Deterministic analysis of both circuits
    orig_analysis = analyze_circuit(
        placements=placements,
        qubits=qubits,
        classical_bits=context.get("classical_bits", 0),
        simulation_result=orig_sim,
        mission=context.get("mission"),
        success_criteria=context.get("success_criteria"),
    )
    mod_analysis = analyze_circuit(
        placements=modified_placements,
        qubits=qubits,
        classical_bits=context.get("classical_bits", 0),
        simulation_result=mod_sim,
        mission=context.get("mission"),
        success_criteria=context.get("success_criteria"),
    )

    # 5. Deterministic comparison
    comparison = compare_circuits(orig_analysis, mod_analysis, mod)

    # 6. Explanation generation (Gemini with guaranteed fallback)
    explanation_text = ""
    from app.services.ai.tutor import tutor
    llm_available = tutor._llm_available

    if llm_available:
        try:
            from app.services.ai.providers import call_llm
            system_p, user_p = _build_what_if_llm_prompt(question, context, orig_analysis, mod_analysis, comparison)
            explanation_text = await call_llm(system_p, user_p, max_tokens=1800)
        except Exception as e:
            logger.warning("Gemini What-If explanation failed (%s); using deterministic fallback", e)
            explanation_text = "*(The AI explanation is temporarily unavailable, but here is the verified circuit comparison)*\n\n" + deterministic_what_if_explanation(
                comparison, orig_analysis, mod_analysis
            )
    else:
        explanation_text = deterministic_what_if_explanation(comparison, orig_analysis, mod_analysis)

    what_if_payload = {
        "valid": True,
        "description": mod.description,
        "operation": mod.operation,
        "target_gate_id": mod.target_gate_id,
        "original_placements": placements,
        "modified_placements": modified_placements,
        "qubits": qubits,
        "comparison": comparison,
    }

    return {
        "response": explanation_text,
        "sources": [],
        "suggestions": ["Apply this change", "Why did this happen?", "What if I add an X gate?"],
        "what_if": what_if_payload,
        "student_state": orig_analysis.get("student_state"),
        "intent": "WHAT_IF",
        "mission_progress": orig_analysis.get("mission_progress"),
        "celebration": orig_analysis.get("celebration"),
        "suggested_experiment": orig_analysis.get("suggested_experiment"),
    }
