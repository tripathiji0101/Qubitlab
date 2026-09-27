import test from "node:test";
import assert from "node:assert";

// Verify Native quantum simulator operations and Bell state
import { simulate } from "../../src/lib/sim.ts";

test("Quantum IDE - Native Simulator creates Bell state |Φ+⟩", () => {
  const ops = [
    { kind: "single", g: "H", target: 0 },
    { kind: "cnot", control: 0, target: 1 },
  ];
  const res = simulate(2, ops);
  assert.strictEqual(res.amps.length, 4);

  const prob00 = res.probs.find((p) => p.state === "00");
  const prob11 = res.probs.find((p) => p.state === "11");
  const prob01 = res.probs.find((p) => p.state === "01");
  const prob10 = res.probs.find((p) => p.state === "10");

  assert.ok(prob00 && Math.abs(prob00.p - 50.0) < 1.0, "State 00 should be ~50%");
  assert.ok(prob11 && Math.abs(prob11.p - 50.0) < 1.0, "State 11 should be ~50%");
  assert.strictEqual(prob01?.p, 0);
  assert.strictEqual(prob10?.p, 0);
});

test("Quantum IDE - Native Simulator single qubit Superposition", () => {
  const ops = [{ kind: "single", g: "H", target: 0 }];
  const res = simulate(1, ops);
  assert.strictEqual(res.amps.length, 2);

  const p0 = res.probs.find((p) => p.state === "0");
  const p1 = res.probs.find((p) => p.state === "1");
  assert.ok(p0 && Math.abs(p0.p - 50.0) < 1.0);
  assert.ok(p1 && Math.abs(p1.p - 50.0) < 1.0);
});

test("Quantum IDE - 3-Qubit GHZ State Simulation", () => {
  const ops = [
    { kind: "single", g: "H", target: 0 },
    { kind: "cnot", control: 0, target: 1 },
    { kind: "cnot", control: 1, target: 2 },
  ];
  const res = simulate(3, ops);
  assert.strictEqual(res.amps.length, 8);

  const p000 = res.probs.find((p) => p.state === "000");
  const p111 = res.probs.find((p) => p.state === "111");
  assert.ok(p000 && Math.abs(p000.p - 50.0) < 1.0);
  assert.ok(p111 && Math.abs(p111.p - 50.0) < 1.0);
});

// ═══════════════════════════════════════════════════════════
// REGRESSION SUITE: Code Rendering & Syntax Highlight Architecture
// ═══════════════════════════════════════════════════════════
import { highlightPython, stripHtml, escapeHtml } from "../../src/lib/highlight.ts";
import { STARTER_TEMPLATES } from "../../src/components/ide/starterTemplates.ts";

test("Syntax Highlighter - Preserves raw text content 1:1 without attribute leakage", () => {
  const testSamples = [
    `from qiskit import QuantumCircuit
qc = QuantumCircuit(3)
qc.h(0)
qc.cx(0, 1)
qc.cx(1, 2)`,
    `import pennylane as qml
dev = qml.device("default.qubit", wires=2)
@qml.qnode(dev)
def circuit():
    qml.Hadamard(wires=0)
    qml.CNOT(wires=[0, 1])
    return qml.state()`,
    `import cirq
q0, q1 = cirq.LineQubit.range(2)
circuit = cirq.Circuit(cirq.H(q0), cirq.CNOT(q0, q1))`,
    `# String with CSS-like contents:
val = "color:#a78bfa and 400 font-semibold inside quotes"
num = 400`,
  ];

  for (const sample of testSamples) {
    const highlighted = highlightPython(sample);

    // 1. Must NOT contain corrupted nested tag syntax
    assert.strictEqual(highlighted.includes("text-purple-<span"), false, "Must not have nested span tags in class");
    assert.strictEqual(highlighted.includes('style="<span'), false, "Must not have nested span tags in style");
    assert.strictEqual(highlighted.includes('style="color:#a78bfa"'), false, "Must not have inline style attributes");

    // 2. The visible text content (tags stripped, entities unescaped) must EQUAL the original source
    const textContent = stripHtml(highlighted);
    assert.strictEqual(textContent, sample, "Visible text content must strictly equal raw Python source code");

    // 3. Raw source must not contain HTML artifacts
    assert.strictEqual(sample.includes("<span"), false);
    assert.strictEqual(sample.includes("class="), false);
  }
});

test("Starter Templates - All templates are pure Python with zero markup", () => {
  for (const [fw, templates] of Object.entries(STARTER_TEMPLATES)) {
    for (const tpl of templates) {
      assert.strictEqual(tpl.code.includes("<span"), false, `${fw} ${tpl.id} must not contain <span`);
      assert.strictEqual(tpl.code.includes("</span>"), false, `${fw} ${tpl.id} must not contain </span>`);
      assert.strictEqual(tpl.code.includes("class="), false, `${fw} ${tpl.id} must not contain class=`);
      assert.strictEqual(tpl.code.includes("style="), false, `${fw} ${tpl.id} must not contain style=`);
      assert.strictEqual(tpl.code.includes("color:#"), false, `${fw} ${tpl.id} must not contain color:#`);
      assert.strictEqual(tpl.code.includes("font-semibold"), false, `${fw} ${tpl.id} must not contain font-semibold`);

      // Highlighting each template must yield clean HTML
      const highlighted = highlightPython(tpl.code);
      assert.strictEqual(stripHtml(highlighted), tpl.code, `${fw} ${tpl.id} highlighted text must match source`);
    }
  }
});

test("Sanitize Utility - Cleanses corrupted HTML from localStorage or state", () => {
  const corrupted = `400 font-semibold">from qiskit <span style="color:#a78bfa">import</span> QuantumCircuit`;
  const cleaned = stripHtml(corrupted);
  assert.strictEqual(cleaned.includes("<span"), false);
  assert.strictEqual(cleaned.includes("</span>"), false);
  assert.strictEqual(cleaned.includes("&amp;"), false);
});

