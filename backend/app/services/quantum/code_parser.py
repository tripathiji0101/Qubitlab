"""Safe AST-based Quantum Code Parser and Validator for QubitLab Quantum IDE.

Supports:
- Qiskit (QuantumCircuit, gate operations: h, x, y, z, s, t, rx, ry, rz, cx, cz, swap, measure, barrier)
- PennyLane (qml.device, qml.qnode, gates: Hadamard, PauliX/Y/Z, S, T, RX, RY, RZ, CNOT, CZ, SWAP)
- Cirq (LineQubit.range, Circuit, gates: H, X, Y, Z, S, T, rx/ry/rz, CNOT, CZ, SWAP, measure)
- Native (QuantumCircuit or op sequence)

Security:
- Disallows dangerous modules (os, sys, subprocess, socket, urllib, requests, eval, exec, open, etc.)
- Strict AST analysis with line-number-aware error reporting.
"""

import ast
import math
from dataclasses import dataclass, field
from typing import Optional, Any
from app.schemas.circuit import PlacementIn


FORBIDDEN_NAMES = {
    "eval", "exec", "compile", "open", "input", "__import__",
    "globals", "locals", "getattr", "setattr", "delattr",
    "breakpoint", "help", "memoryview",
}

FORBIDDEN_MODULES = {
    "os", "sys", "subprocess", "socket", "urllib", "requests", "http",
    "shutil", "builtins", "importlib", "pickle", "ctypes", "posix", "pty",
    "commands", "glob", "pathlib", "threading", "multiprocessing",
}


@dataclass
class ParseError:
    line: int
    col: int
    message: str
    snippet: str = ""
    code: str = "SYNTAX_ERROR"


@dataclass
class ParsedCircuitResult:
    success: bool
    qubits: int = 2
    placements: list[PlacementIn] = field(default_factory=list)
    framework: str = "qiskit"
    errors: list[ParseError] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)


class SecurityVisitor(ast.NodeVisitor):
    """Enforces execution security constraints on the AST."""

    def __init__(self, lines: list[str]):
        self.lines = lines
        self.violations: list[ParseError] = []

    def visit_Import(self, node: ast.Import):
        for alias in node.names:
            mod_root = alias.name.split(".")[0]
            if mod_root in FORBIDDEN_MODULES:
                line_text = self.lines[node.lineno - 1] if 0 < node.lineno <= len(self.lines) else ""
                self.violations.append(
                    ParseError(
                        line=node.lineno,
                        col=node.col_offset,
                        message=f"Import of module '{mod_root}' is restricted in Quantum IDE.",
                        snippet=line_text.strip(),
                        code="SECURITY_VIOLATION",
                    )
                )
        self.generic_visit(node)

    def visit_ImportFrom(self, node: ast.ImportFrom):
        if node.module:
            mod_root = node.module.split(".")[0]
            if mod_root in FORBIDDEN_MODULES:
                line_text = self.lines[node.lineno - 1] if 0 < node.lineno <= len(self.lines) else ""
                self.violations.append(
                    ParseError(
                        line=node.lineno,
                        col=node.col_offset,
                        message=f"Import from module '{mod_root}' is restricted in Quantum IDE.",
                        snippet=line_text.strip(),
                        code="SECURITY_VIOLATION",
                    )
                )
        self.generic_visit(node)

    def visit_Call(self, node: ast.Call):
        func_name = None
        if isinstance(node.func, ast.Name):
            func_name = node.func.id
        elif isinstance(node.func, ast.Attribute):
            func_name = node.func.attr

        if func_name in FORBIDDEN_NAMES:
            line_text = self.lines[node.lineno - 1] if 0 < node.lineno <= len(self.lines) else ""
            self.violations.append(
                ParseError(
                    line=node.lineno,
                    col=node.col_offset,
                    message=f"Function call '{func_name}()' is not permitted.",
                    snippet=line_text.strip(),
                    code="SECURITY_VIOLATION",
                )
            )
        self.generic_visit(node)


def _eval_num(node: ast.AST) -> Optional[float]:
    """Safely evaluates numeric literals, basic math (e.g. pi/2), or negations."""
    if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
        return float(node.value)
    if isinstance(node, ast.UnaryOp) and isinstance(node.op, ast.USub):
        val = _eval_num(node.operand)
        return -val if val is not None else None
    if isinstance(node, ast.BinOp):
        left = _eval_num(node.left)
        right = _eval_num(node.right)
        if left is not None and right is not None:
            if isinstance(node.op, ast.Add): return left + right
            if isinstance(node.op, ast.Sub): return left - right
            if isinstance(node.op, ast.Mult): return left * right
            if isinstance(node.op, ast.Div) and right != 0: return left / right
    if isinstance(node, ast.Attribute):
        if node.attr in ("pi", "e"):
            return math.pi if node.attr == "pi" else math.e
    if isinstance(node, ast.Name):
        if node.id in ("pi", "PI"):
            return math.pi
    return None


def _eval_int(node: ast.AST) -> Optional[int]:
    val = _eval_num(node)
    if val is not None:
        return int(val)
    return None


class QiskitParser(ast.NodeVisitor):
    def __init__(self, lines: list[str]):
        self.lines = lines
        self.qubits = 2
        self.circuit_var: Optional[str] = None
        self.raw_ops: list[dict] = []
        self.errors: list[ParseError] = []

    def visit_Assign(self, node: ast.Assign):
        # Look for: qc = QuantumCircuit(qubits, ...)
        if isinstance(node.value, ast.Call):
            call = node.value
            is_qc = False
            if isinstance(call.func, ast.Name) and call.func.id in ("QuantumCircuit", "Circuit"):
                is_qc = True
            elif isinstance(call.func, ast.Attribute) and call.func.attr == "QuantumCircuit":
                is_qc = True

            if is_qc and node.targets and isinstance(node.targets[0], ast.Name):
                self.circuit_var = node.targets[0].id
                if call.args:
                    q_arg = _eval_int(call.args[0])
                    if q_arg is not None and q_arg > 0:
                        self.qubits = q_arg
                for kw in call.keywords:
                    if kw.arg in ("qubits", "n_qubits"):
                        q_kw = _eval_int(kw.value)
                        if q_kw is not None and q_kw > 0:
                            self.qubits = q_kw

        self.generic_visit(node)

    def visit_Expr(self, node: ast.Expr):
        if isinstance(node.value, ast.Call):
            self._handle_call(node.value, node.lineno, node.col_offset)
        self.generic_visit(node)

    def _handle_call(self, call: ast.Call, lineno: int, col: int):
        if not isinstance(call.func, ast.Attribute):
            return

        method = call.func.attr.lower()
        line_text = self.lines[lineno - 1] if 0 < lineno <= len(self.lines) else ""

        # Ignore simulator calls like sim.run(), qc.draw()
        if method in ("run", "result", "get_counts", "draw", "compose", "save_statevector"):
            return

        # Single qubit gates: h, x, y, z, s, t
        SINGLE_GATES = {
            "h": "H", "x": "X", "y": "Y", "z": "Z",
            "s": "S", "t": "T",
        }
        # Rotations: rx, ry, rz
        ROT_GATES = {"rx": "RX", "ry": "RY", "rz": "RZ"}
        # Two qubit gates: cx, cnot, cz, swap
        TWO_GATES = {"cx": "CNOT", "cnot": "CNOT", "cz": "CZ", "swap": "SWAP"}

        if method in SINGLE_GATES:
            if not call.args:
                self.errors.append(ParseError(line=lineno, col=col, message=f"Gate '{method}' requires target qubit index.", snippet=line_text.strip(), code="MISSING_ARGUMENT"))
                return
            q = _eval_int(call.args[0])
            if q is None:
                self.errors.append(ParseError(line=lineno, col=col, message=f"Qubit index must be an integer literal for '{method}'.", snippet=line_text.strip(), code="INVALID_QUBIT_INDEX"))
                return
            self.raw_ops.append({"g": SINGLE_GATES[method], "q": q, "line": lineno, "col": col, "snippet": line_text.strip()})

        elif method in ROT_GATES:
            if len(call.args) < 2:
                self.errors.append(ParseError(line=lineno, col=col, message=f"Rotation gate '{method}' requires angle theta and qubit index: {method}(theta, qubit).", snippet=line_text.strip(), code="MISSING_ARGUMENT"))
                return
            theta = _eval_num(call.args[0])
            q = _eval_int(call.args[1])
            if theta is None:
                theta = math.pi / 2
            if q is None:
                self.errors.append(ParseError(line=lineno, col=col, message=f"Qubit index must be an integer literal for '{method}'.", snippet=line_text.strip(), code="INVALID_QUBIT_INDEX"))
                return
            self.raw_ops.append({"g": ROT_GATES[method], "q": q, "theta": theta, "line": lineno, "col": col, "snippet": line_text.strip()})

        elif method in TWO_GATES:
            if len(call.args) < 2:
                self.errors.append(ParseError(line=lineno, col=col, message=f"Two-qubit gate '{method}' requires control and target qubit: {method}(ctrl, target).", snippet=line_text.strip(), code="MISSING_ARGUMENT"))
                return
            q1 = _eval_int(call.args[0])
            q2 = _eval_int(call.args[1])
            if q1 is None or q2 is None:
                self.errors.append(ParseError(line=lineno, col=col, message=f"Control and target qubits must be integers for '{method}'.", snippet=line_text.strip(), code="INVALID_QUBIT_INDEX"))
                return
            if q1 == q2:
                self.errors.append(ParseError(line=lineno, col=col, message=f"Control and target qubit cannot be the same wire (qubit {q1}).", snippet=line_text.strip(), code="SAME_CONTROL_TARGET"))
                return
            self.raw_ops.append({"g": TWO_GATES[method], "q": q1, "q2": q2, "line": lineno, "col": col, "snippet": line_text.strip()})

        elif method == "measure":
            if call.args:
                q = _eval_int(call.args[0])
                if q is not None:
                    self.raw_ops.append({"g": "M", "q": q, "line": lineno, "col": col, "snippet": line_text.strip()})

        elif method == "barrier":
            q = 0
            if call.args:
                q_eval = _eval_int(call.args[0])
                if q_eval is not None:
                    q = q_eval
            self.raw_ops.append({"g": "B", "q": q, "line": lineno, "col": col, "snippet": line_text.strip()})


class PennyLaneParser(ast.NodeVisitor):
    def __init__(self, lines: list[str]):
        self.lines = lines
        self.qubits = 2
        self.raw_ops: list[dict] = []
        self.errors: list[ParseError] = []

    def visit_Assign(self, node: ast.Assign):
        # dev = qml.device("default.qubit", wires=2)
        if isinstance(node.value, ast.Call):
            for kw in node.value.keywords:
                if kw.arg in ("wires", "n_wires"):
                    w = _eval_int(kw.value)
                    if w is not None and w > 0:
                        self.qubits = w
        self.generic_visit(node)

    def visit_Expr(self, node: ast.Expr):
        if isinstance(node.value, ast.Call):
            self._handle_call(node.value, node.lineno, node.col_offset)
        self.generic_visit(node)

    def _extract_wire(self, kw_val: ast.AST) -> Optional[int]:
        if isinstance(kw_val, ast.List) and kw_val.elts:
            return _eval_int(kw_val.elts[0])
        return _eval_int(kw_val)

    def _extract_wires(self, kw_val: ast.AST) -> list[int]:
        if isinstance(kw_val, ast.List):
            res = []
            for elt in kw_val.elts:
                val = _eval_int(elt)
                if val is not None:
                    res.append(val)
            return res
        val = _eval_int(kw_val)
        return [val] if val is not None else []

    def _handle_call(self, call: ast.Call, lineno: int, col: int):
        func_name = ""
        if isinstance(call.func, ast.Attribute):
            func_name = call.func.attr
        elif isinstance(call.func, ast.Name):
            func_name = call.func.id

        line_text = self.lines[lineno - 1] if 0 < lineno <= len(self.lines) else ""

        GATE_MAP = {
            "Hadamard": "H", "PauliX": "X", "PauliY": "Y", "PauliZ": "Z",
            "S": "S", "T": "T",
        }
        ROT_MAP = {"RX": "RX", "RY": "RY", "RZ": "RZ"}
        TWO_MAP = {"CNOT": "CNOT", "CZ": "CZ", "SWAP": "SWAP"}

        # Extract wires keyword or first positional if keyword absent
        wires: list[int] = []
        theta: Optional[float] = None

        for kw in call.keywords:
            if kw.arg == "wires":
                wires = self._extract_wires(kw.value)
            elif kw.arg in ("phi", "theta"):
                theta = _eval_num(kw.value)

        if func_name in GATE_MAP:
            if not wires and call.args:
                wires = self._extract_wires(call.args[0])
            if not wires:
                self.errors.append(ParseError(line=lineno, col=col, message=f"PennyLane gate '{func_name}' requires wires parameter.", snippet=line_text.strip(), code="MISSING_ARGUMENT"))
                return
            self.raw_ops.append({"g": GATE_MAP[func_name], "q": wires[0], "line": lineno, "col": col, "snippet": line_text.strip()})

        elif func_name in ROT_MAP:
            if theta is None and call.args:
                theta = _eval_num(call.args[0])
            if not wires and len(call.args) > 1:
                wires = self._extract_wires(call.args[1])
            if not wires:
                self.errors.append(ParseError(line=lineno, col=col, message=f"Rotation gate '{func_name}' requires wires parameter.", snippet=line_text.strip(), code="MISSING_ARGUMENT"))
                return
            self.raw_ops.append({"g": ROT_MAP[func_name], "q": wires[0], "theta": theta or (math.pi / 2), "line": lineno, "col": col, "snippet": line_text.strip()})

        elif func_name in TWO_MAP:
            if not wires and call.args:
                wires = self._extract_wires(call.args[0])
            if len(wires) < 2:
                self.errors.append(ParseError(line=lineno, col=col, message=f"Two-qubit gate '{func_name}' requires 2 wires, e.g. wires=[0, 1].", snippet=line_text.strip(), code="MISSING_ARGUMENT"))
                return
            if wires[0] == wires[1]:
                self.errors.append(ParseError(line=lineno, col=col, message=f"Control and target wire cannot be the same (wire {wires[0]}).", snippet=line_text.strip(), code="SAME_CONTROL_TARGET"))
                return
            self.raw_ops.append({"g": TWO_MAP[func_name], "q": wires[0], "q2": wires[1], "line": lineno, "col": col, "snippet": line_text.strip()})


class CirqParser(ast.NodeVisitor):
    def __init__(self, lines: list[str]):
        self.lines = lines
        self.qubits = 2
        self.raw_ops: list[dict] = []
        self.errors: list[ParseError] = []

    def visit_Assign(self, node: ast.Assign):
        # q = cirq.LineQubit.range(2)
        if isinstance(node.value, ast.Call):
            call = node.value
            if isinstance(call.func, ast.Attribute) and call.func.attr == "range":
                if call.args:
                    w = _eval_int(call.args[0])
                    if w is not None and w > 0:
                        self.qubits = w
        self.generic_visit(node)

    def visit_Call(self, node: ast.Call):
        self._inspect_cirq_gate(node, node.lineno, node.col_offset)
        self.generic_visit(node)

    def _extract_q_idx(self, node: ast.AST) -> Optional[int]:
        # q[0]
        if isinstance(node, ast.Subscript):
            return _eval_int(node.slice)
        return _eval_int(node)

    def _inspect_cirq_gate(self, call: ast.Call, lineno: int, col: int):
        func_name = ""
        target_sub: Optional[ast.AST] = None

        # cirq.H(q[0]) or cirq.rx(theta).on(q[0])
        if isinstance(call.func, ast.Attribute):
            if call.func.attr == "on":
                # rotation .on(q[0])
                if call.args:
                    target_sub = call.args[0]
                if isinstance(call.func.value, ast.Call) and isinstance(call.func.value.func, ast.Attribute):
                    rot_method = call.func.value.func.attr.lower()
                    theta = None
                    if call.func.value.args:
                        theta = _eval_num(call.func.value.args[0])
                    q = self._extract_q_idx(target_sub)
                    if q is not None and rot_method in ("rx", "ry", "rz"):
                        line_text = self.lines[lineno - 1] if 0 < lineno <= len(self.lines) else ""
                        self.raw_ops.append({"g": rot_method.upper(), "q": q, "theta": theta or (math.pi / 2), "line": lineno, "col": col, "snippet": line_text.strip()})
                        return

            func_name = call.func.attr
        elif isinstance(call.func, ast.Name):
            func_name = call.func.id

        line_text = self.lines[lineno - 1] if 0 < lineno <= len(self.lines) else ""
        GATE_MAP = {"H": "H", "X": "X", "Y": "Y", "Z": "Z", "S": "S", "T": "T"}
        TWO_MAP = {"CNOT": "CNOT", "CZ": "CZ", "SWAP": "SWAP"}

        if func_name in GATE_MAP:
            if call.args:
                q = self._extract_q_idx(call.args[0])
                if q is not None:
                    self.raw_ops.append({"g": GATE_MAP[func_name], "q": q, "line": lineno, "col": col, "snippet": line_text.strip()})

        elif func_name in TWO_MAP:
            if len(call.args) >= 2:
                q1 = self._extract_q_idx(call.args[0])
                q2 = self._extract_q_idx(call.args[1])
                if q1 is not None and q2 is not None:
                    if q1 == q2:
                        self.errors.append(ParseError(line=lineno, col=col, message=f"Control and target qubit cannot be the same (qubit {q1}).", snippet=line_text.strip(), code="SAME_CONTROL_TARGET"))
                        return
                    self.raw_ops.append({"g": TWO_MAP[func_name], "q": q1, "q2": q2, "line": lineno, "col": col, "snippet": line_text.strip()})

        elif func_name == "measure":
            if call.args:
                q = self._extract_q_idx(call.args[0])
                if q is not None:
                    self.raw_ops.append({"g": "M", "q": q, "line": lineno, "col": col, "snippet": line_text.strip()})


def _assign_columns_and_validate(
    raw_ops: list[dict],
    qubits: int,
    explicit_qubits: bool = False,
    max_qubits: int = 10,
    max_depth: int = 40,
) -> tuple[list[PlacementIn], list[ParseError], int]:
    """Arranges gate operations into non-overlapping columns (moments) and validates boundaries."""
    errors: list[ParseError] = []

    actual_max_q = qubits - 1
    for op in raw_ops:
        actual_max_q = max(actual_max_q, op.get("q", 0), op.get("q2", 0) or 0)

    if explicit_qubits:
        effective_qubits = qubits
    else:
        effective_qubits = max(qubits, actual_max_q + 1)

    if effective_qubits > max_qubits:
        op = raw_ops[0] if raw_ops else {"line": 1, "col": 0, "snippet": ""}
        errors.append(
            ParseError(
                line=op.get("line", 1),
                col=op.get("col", 0),
                message=f"Circuit exceeds maximum supported qubits of {max_qubits}.",
                snippet=op.get("snippet", ""),
                code="MAX_QUBITS_EXCEEDED",
            )
        )
        return [], errors, qubits

    qubit_occupied_col = [0] * effective_qubits
    placements: list[PlacementIn] = []

    for idx, op in enumerate(raw_ops):
        q = op.get("q", 0)
        q2 = op.get("q2")
        line = op.get("line", 1)
        col = op.get("col", 0)
        snippet = op.get("snippet", "")

        # Boundary checks against effective (declared) qubits
        if q < 0 or q >= effective_qubits:
            errors.append(
                ParseError(
                    line=line,
                    col=col,
                    message=f"Qubit index {q} is invalid for a {effective_qubits}-qubit circuit (qubits 0 to {effective_qubits - 1}).",
                    snippet=snippet,
                    code="QUBIT_OUT_OF_BOUNDS",
                )
            )
            continue

        if q2 is not None and (q2 < 0 or q2 >= effective_qubits):
            errors.append(
                ParseError(
                    line=line,
                    col=col,
                    message=f"Target qubit index {q2} is invalid for a {effective_qubits}-qubit circuit (qubits 0 to {effective_qubits - 1}).",
                    snippet=snippet,
                    code="QUBIT_OUT_OF_BOUNDS",
                )
            )
            continue

        # Column calculation: earliest column where involved wires are free
        if q2 is not None:
            involved_range = range(min(q, q2), max(q, q2) + 1)
            target_col = max(qubit_occupied_col[w] for w in involved_range)
            for w in involved_range:
                qubit_occupied_col[w] = target_col + 1
        else:
            target_col = qubit_occupied_col[q]
            qubit_occupied_col[q] = target_col + 1

        if target_col >= max_depth:
            errors.append(
                ParseError(
                    line=line,
                    col=col,
                    message=f"Circuit depth exceeds maximum supported depth of {max_depth}.",
                    snippet=snippet,
                    code="MAX_DEPTH_EXCEEDED",
                )
            )
            break

        placements.append(
            PlacementIn(
                id=f"p_{idx}",
                g=op["g"],
                col=target_col,
                q=q,
                q2=q2,
                theta=op.get("theta"),
            )
        )

    return placements, errors, effective_qubits


def parse_and_validate_quantum_code(
    code: str,
    framework: str = "qiskit",
    max_qubits: int = 10,
    max_depth: int = 40,
) -> ParsedCircuitResult:
    """Parses arbitrary quantum code safely using AST and transpiles to PlacementIn[]."""
    framework_norm = framework.lower().strip()
    lines = code.splitlines()

    # 1. Syntax check
    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        snippet = lines[e.lineno - 1] if e.lineno and 0 < e.lineno <= len(lines) else ""
        return ParsedCircuitResult(
            success=False,
            framework=framework_norm,
            errors=[
                ParseError(
                    line=e.lineno or 1,
                    col=e.offset or 0,
                    message=f"SyntaxError: {e.msg}",
                    snippet=snippet.strip(),
                    code="SYNTAX_ERROR",
                )
            ],
        )

    # 2. Security validation
    sec_visitor = SecurityVisitor(lines)
    sec_visitor.visit(tree)
    if sec_visitor.violations:
        return ParsedCircuitResult(
            success=False,
            framework=framework_norm,
            errors=sec_visitor.violations,
        )

    # 3. Framework-specific parsing
    raw_ops: list[dict] = []
    qubits = 2
    explicit_qubits = False
    errors: list[ParseError] = []

    if framework_norm in ("qiskit", "native"):
        parser = QiskitParser(lines)
        parser.visit(tree)
        raw_ops = parser.raw_ops
        qubits = parser.qubits
        explicit_qubits = parser.circuit_var is not None
        errors.extend(parser.errors)
    elif framework_norm == "pennylane":
        parser = PennyLaneParser(lines)
        parser.visit(tree)
        raw_ops = parser.raw_ops
        qubits = parser.qubits
        explicit_qubits = True
        errors.extend(parser.errors)
    elif framework_norm == "cirq":
        parser = CirqParser(lines)
        parser.visit(tree)
        raw_ops = parser.raw_ops
        qubits = parser.qubits
        explicit_qubits = True
        errors.extend(parser.errors)
    else:
        # Fallback to Qiskit-style parser
        parser = QiskitParser(lines)
        parser.visit(tree)
        raw_ops = parser.raw_ops
        qubits = parser.qubits
        explicit_qubits = parser.circuit_var is not None
        errors.extend(parser.errors)

    if errors:
        return ParsedCircuitResult(
            success=False,
            qubits=qubits,
            framework=framework_norm,
            errors=errors,
        )

    # 4. Column assignment and boundary checks
    placements, assign_errors, final_qubits = _assign_columns_and_validate(
        raw_ops, qubits, explicit_qubits=explicit_qubits, max_qubits=max_qubits, max_depth=max_depth
    )

    if assign_errors:
        return ParsedCircuitResult(
            success=False,
            qubits=final_qubits,
            framework=framework_norm,
            errors=assign_errors,
        )

    return ParsedCircuitResult(
        success=True,
        qubits=final_qubits,
        placements=placements,
        framework=framework_norm,
    )
