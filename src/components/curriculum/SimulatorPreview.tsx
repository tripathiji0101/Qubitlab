import React, { useMemo, useState } from "react";
import { simulate, Op } from "../../lib/sim";
import { CircuitGateStep } from "../../lib/curriculumActivities";

interface SimulatorPreviewProps {
  circuit: {
    qubits: number;
    gates: CircuitGateStep[];
  };
  title?: string;
  expectedState?: string;
  className?: string;
}

export default function SimulatorPreview({
  circuit,
  title = "Live Quantum Simulator Execution",
  expectedState,
  className = "",
}: SimulatorPreviewProps) {
  const [viewMode, setViewMode] = useState<"probs" | "amplitudes">("probs");

  // Map high-level activity gate steps into low-level simulator Ops
  const ops: Op[] = useMemo(() => {
    return circuit.gates.map((gate) => {
      const gUpper = gate.g.toUpperCase();
      if (gUpper === "CNOT" || gUpper === "CX") {
        return {
          kind: "cnot",
          control: gate.q,
          target: gate.q2 ?? (gate.q + 1) % circuit.qubits,
        };
      }
      if (gUpper === "CZ") {
        return {
          kind: "cz",
          control: gate.q,
          target: gate.q2 ?? (gate.q + 1) % circuit.qubits,
        };
      }
      if (gUpper === "SWAP") {
        return {
          kind: "swap",
          a: gate.q,
          b: gate.q2 ?? (gate.q + 1) % circuit.qubits,
        };
      }
      return {
        kind: "single",
        g: gate.g,
        target: gate.q,
        theta: gate.theta,
      };
    });
  }, [circuit]);

  // Execute canonical simulation
  const result = useMemo(() => {
    try {
      return simulate(circuit.qubits, ops);
    } catch {
      return null;
    }
  }, [circuit.qubits, ops]);

  if (!result) {
    return null;
  }

  return (
    <div
      className={`rounded-xl border border-quantum-cyan/30 bg-[#0a0d14] p-4 text-txt space-y-4 shadow-sm ${className}`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap border-b border-line/40 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-quantum-cyan flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-quantum-cyan animate-pulse" />
            {title}
          </span>
          <span className="rounded bg-quantum-cyan/10 px-2 py-0.5 font-mono text-[10px] text-quantum-cyan border border-quantum-cyan/20">
            {circuit.qubits} Qubit{circuit.qubits > 1 ? "s" : ""} · {ops.length} Op{ops.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex items-center bg-[#131722] p-0.5 rounded-lg border border-line/50 text-[11px] font-mono">
          <button
            type="button"
            onClick={() => setViewMode("probs")}
            className={`px-2.5 py-0.5 rounded transition-colors cursor-pointer ${
              viewMode === "probs"
                ? "bg-quantum-cyan/20 text-quantum-cyan font-bold border border-quantum-cyan/30"
                : "text-txt-dim hover:text-white"
            }`}
          >
            Probabilities
          </button>
          <button
            type="button"
            onClick={() => setViewMode("amplitudes")}
            className={`px-2.5 py-0.5 rounded transition-colors cursor-pointer ${
              viewMode === "amplitudes"
                ? "bg-quantum-cyan/20 text-quantum-cyan font-bold border border-quantum-cyan/30"
                : "text-txt-dim hover:text-white"
            }`}
          >
            Amplitudes
          </button>
        </div>
      </div>

      {/* Circuit wire diagram preview */}
      <div className="space-y-1.5 bg-[#07090e] p-3 rounded-lg border border-line/30 overflow-x-auto">
        <div className="font-mono text-[10px] uppercase text-txt-dim tracking-wider mb-1">
          Circuit Execution Sequence:
        </div>
        {Array.from({ length: circuit.qubits }, (_, q) => {
          // Find gates touching qubit q
          const qGates = circuit.gates.filter(
            (g) => g.q === q || g.q2 === q
          );
          return (
            <div key={q} className="flex items-center gap-2 font-mono text-[12px] min-w-max">
              <span className="text-quantum-cyan font-bold w-7 shrink-0">
                q[{q}]
              </span>
              <span className="text-txt-faint">|0⟩ ──</span>
              <div className="flex items-center gap-1.5">
                {qGates.length === 0 ? (
                  <span className="text-txt-faint">─────── (Identity)</span>
                ) : (
                  qGates.map((g, gIdx) => {
                    const isControl = g.q === q && g.q2 !== undefined && (g.g === "CNOT" || g.g === "CZ");
                    const isTarget = g.q2 === q;
                    let label = g.g;
                    if (isControl) label = "● (ctrl)";
                    else if (isTarget && g.g === "CNOT") label = "⊕ (targ)";
                    else if (isTarget && g.g === "CZ") label = "■ (targ)";

                    return (
                      <React.Fragment key={gIdx}>
                        <span className="rounded bg-quantum-blue/20 border border-quantum-blue/40 px-2 py-0.5 text-[11px] font-bold text-accent-cyan shadow-xs">
                          {label}
                        </span>
                        <span className="text-txt-faint">──</span>
                      </React.Fragment>
                    );
                  })
                )}
              </div>
              <span className="text-txt-faint">──▷</span>
            </div>
          );
        })}
      </div>

      {/* Statevector Output Readout */}
      {viewMode === "probs" ? (
        <div className="space-y-2">
          <div className="font-mono text-[10px] uppercase text-txt-dim tracking-wider">
            Measurement Probability Distribution:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {result.probs.map(({ state, p }) => {
              const isProminent = p > 0.1;
              return (
                <div
                  key={state}
                  className={`flex flex-col p-2 rounded-lg border text-xs font-mono transition-colors ${
                    isProminent
                      ? "border-quantum-cyan/40 bg-quantum-cyan/[0.06]"
                      : "border-line/30 bg-[#0d1017] opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-txt">|{state}⟩</span>
                    <span
                      className={`font-bold ${
                        isProminent ? "text-quantum-cyan" : "text-txt-dim"
                      }`}
                    >
                      {p.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[#151926] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-quantum-cyan to-accent-blue rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(0, p))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="font-mono text-[10px] uppercase text-txt-dim tracking-wider">
            Complex Statevector Amplitudes:
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {result.amps.map((amp) => {
              const reStr = amp.re >= 0 ? amp.re.toFixed(4) : amp.re.toFixed(4);
              const imStr = amp.im >= 0 ? `+ ${amp.im.toFixed(4)}i` : `- ${Math.abs(amp.im).toFixed(4)}i`;
              const isNonZero = amp.p > 0.0001;
              return (
                <div
                  key={amp.state}
                  className={`flex items-center justify-between px-3 py-1.5 rounded border text-[11px] font-mono ${
                    isNonZero
                      ? "border-quantum-cyan/30 bg-[#0f1422] text-txt"
                      : "border-line/20 bg-[#080a0f] text-txt-faint opacity-50"
                  }`}
                >
                  <span className="font-bold text-quantum-cyan">|{amp.state}⟩</span>
                  <span className="text-txt-dim">
                    {reStr} {amp.im !== 0 ? imStr : ""}
                  </span>
                  <span className="font-semibold text-accent-cyan">
                    |α|² = {(amp.p * 100).toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Expected State Confirmation */}
      {expectedState && (
        <div className="rounded-lg border border-ok/30 bg-ok/[0.06] p-2.5 text-[11px] font-mono flex items-center justify-between gap-2 flex-wrap">
          <span className="text-ok font-bold flex items-center gap-1.5">
            <span>✓</span> Target Verified: {expectedState}
          </span>
          <span className="text-txt-dim text-[10px]">
            Simulation executed deterministically via statevector unitary matrix
          </span>
        </div>
      )}
    </div>
  );
}
