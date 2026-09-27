// Lightweight statevector simulator (educational, not hardware-accurate)
export type C = { re: number; im: number };
const c = (re: number, im = 0): C => ({ re, im });
const add = (a: C, b: C): C => ({ re: a.re + b.re, im: a.im + b.im });
const mul = (a: C, b: C): C => ({ re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re });
const abs2 = (a: C) => a.re * a.re + a.im * a.im;

const H = 1 / Math.SQRT2;
type M = [C, C, C, C]; // 2x2 row-major

export function singleMatrix(g: string, theta = Math.PI / 2): M | null {
  switch (g) {
    case "H": return [c(H), c(H), c(H), c(-H)];
    case "X": return [c(0), c(1), c(1), c(0)];
    case "Y": return [c(0), c(0, -1), c(0, 1), c(0)];
    case "Z": return [c(1), c(0), c(0), c(-1)];
    case "S": return [c(1), c(0), c(0), c(0, 1)];
    case "T": return [c(1), c(0), c(0), { re: Math.cos(Math.PI / 4), im: Math.sin(Math.PI / 4) }];
    case "RX": return [c(Math.cos(theta / 2)), c(0, -Math.sin(theta / 2)), c(0, -Math.sin(theta / 2)), c(Math.cos(theta / 2))];
    case "RY": return [c(Math.cos(theta / 2)), c(-Math.sin(theta / 2)), c(Math.sin(theta / 2)), c(Math.cos(theta / 2))];
    case "RZ": return [{ re: Math.cos(theta / 2), im: -Math.sin(theta / 2) }, c(0), c(0), { re: Math.cos(theta / 2), im: Math.sin(theta / 2) }];
    default: return null;
  }
}

export type Op =
  | { kind: "single"; g: string; target: number; theta?: number }
  | { kind: "cnot"; control: number; target: number }
  | { kind: "cz"; control: number; target: number }
  | { kind: "swap"; a: number; b: number };

/**
 * Canonical State Label Formatting & Endianness Utilities
 *
 * CONVENTION:
 * UI Wire Order: |q0 q1 ... q_{n-1}⟩ where q0 is the top wire (wire 0) in Quantum Studio.
 * In this convention, the bit at index q is ((i >> q) & 1).
 *
 * Qiskit Convention: |q_{n-1} ... q1 q0⟩ (little-endian index where q0 is least significant bit on the right).
 * To convert between UI Wire Order and Qiskit representation, the bitstring is reversed.
 */
export function formatStateLabel(i: number, nQubits: number): string {
  return Array.from({ length: nQubits }, (_, q) => ((i >> q) & 1).toString()).join("");
}

export function toQiskitOrder(uiBitstring: string): string {
  return uiBitstring.split("").reverse().join("");
}

export function toUiWireOrder(qiskitBitstring: string): string {
  return qiskitBitstring.split("").reverse().join("");
}

export function simulate(nQubits: number, ops: Op[]) {
  const dim = 1 << nQubits;
  let state: C[] = Array.from({ length: dim }, (_, i) => (i === 0 ? c(1) : c(0)));

  const applySingle = (t: number, m: M) => {
    for (let i = 0; i < dim; i++) {
      if ((i >> t) & 1) continue;
      const j = i | (1 << t);
      const a = state[i], b = state[j];
      state[i] = add(mul(m[0], a), mul(m[1], b));
      state[j] = add(mul(m[2], a), mul(m[3], b));
    }
  };

  for (const op of ops) {
    if (op.kind === "single") {
      const m = singleMatrix(op.g, op.theta);
      if (m) applySingle(op.target, m);
    } else if (op.kind === "cnot") {
      for (let i = 0; i < dim; i++) {
        if (((i >> op.control) & 1) && !((i >> op.target) & 1)) {
          const j = i | (1 << op.target);
          const tmp = state[i]; state[i] = state[j]; state[j] = tmp;
        }
      }
    } else if (op.kind === "cz") {
      for (let i = 0; i < dim; i++) if (((i >> op.control) & 1) && ((i >> op.target) & 1)) state[i] = mul(state[i], c(-1));
    } else if (op.kind === "swap") {
      for (let i = 0; i < dim; i++) {
        const ba = (i >> op.a) & 1, bb = (i >> op.b) & 1;
        if (ba === 0 && bb === 1) {
          const j = (i | (1 << op.a)) & ~(1 << op.b);
          if (j > i) { const t = state[i]; state[i] = state[j]; state[j] = t; }
        }
      }
    }
  }

  const amps = state.map((amp, i) => ({
    state: formatStateLabel(i, nQubits), re: amp.re, im: amp.im, p: abs2(amp),
    phase: Math.atan2(amp.im, amp.re),
  }));
  const probs = amps.map((a) => ({ state: a.state, p: +(a.p * 100).toFixed(1) }));
  return { amps, probs };
}
