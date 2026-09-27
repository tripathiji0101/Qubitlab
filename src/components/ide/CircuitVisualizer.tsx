import React, { useState } from "react";
import { gateColors, gateLabel } from "../quantum";
import GateEducationalTooltip from "../quantum/GateEducationalTooltip";
import { cx } from "../ui";

export interface Placement {
  id: string;
  g: string;
  col: number;
  q: number;
  q2?: number;
  theta?: number;
}

interface CircuitVisualizerProps {
  qubits: number;
  placements: Placement[];
  onOpenInStudio?: () => void;
  className?: string;
}

const TWO = new Set(["CNOT", "CZ", "SWAP"]);
const ROT = new Set(["RX", "RY", "RZ"]);

export default function CircuitVisualizer({
  qubits,
  placements,
  onOpenInStudio,
  className,
}: CircuitVisualizerProps) {
  const [hoveredGate, setHoveredGate] = useState<{
    placement: Placement;
    rect: DOMRect;
    isTarget?: boolean;
  } | null>(null);

  const maxCol = placements.length > 0 ? Math.max(...placements.map((p) => p.col)) : 0;
  const numCols = Math.max(maxCol + 3, 8);

  return (
    <div
      className={cx(
        "relative flex h-full flex-col overflow-hidden rounded-xl border border-line/60 bg-bg-surface text-txt shadow-sm",
        className
      )}
    >
      {/* Visualizer header */}
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-line/50 bg-bg-panel/60 px-3 select-none">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-txt-dim">
            <span className="inline-block h-2 w-2 rounded-full bg-quantum-cyan" />
            Synthesized Circuit
          </span>
          <span className="text-[10px] text-txt-faint">|</span>
          <span className="text-[11px] font-mono text-txt-faint">
            {qubits} {qubits === 1 ? "qubit" : "qubits"}, {placements.length} gates
          </span>
        </div>

        {onOpenInStudio && (
          <button
            type="button"
            onClick={onOpenInStudio}
            className="flex items-center gap-1 rounded bg-bg-surface px-2 py-0.5 text-[11px] font-medium text-accent-blue hover:bg-accent-primary/10 border border-accent-primary/20 transition-colors cursor-pointer"
            title="Open and edit this circuit visually in Circuit Studio"
          >
            <span>Edit in Studio</span>
            <span>↗</span>
          </button>
        )}
      </div>

      {/* Circuit Wires Grid */}
      <div className="relative flex-1 min-h-0 overflow-auto p-4 quantum-grid-bg">
        {placements.length === 0 ? (
          <div className="flex h-full min-h-[160px] flex-col items-center justify-center rounded-lg border border-dashed border-line/60 p-6 text-center text-txt-dim">
            <span className="text-2xl mb-2">⚡</span>
            <div className="text-[13px] font-bold text-white mb-1">No Quantum Operations Executed</div>
            <div className="text-[11px] text-txt-faint max-w-xs">
              Write or load a quantum program and click <strong>Run ▶</strong> to visualize the generated circuit.
            </div>
          </div>
        ) : (
          <div className="space-y-1 min-w-[500px]">
            {Array.from({ length: qubits }).map((_, row) => (
              <div key={row} className="flex items-center gap-3 h-13">
                {/* Qubit Rail Pill Badge */}
                <span className="w-8 shrink-0 rounded-md bg-bg-surface/90 border border-line/60 py-1 text-center font-mono text-[11px] font-bold text-txt-dim select-none shadow-2xs">
                  q[{row}]
                </span>

                <div className="relative flex-1">
                  {/* Quantum wire line */}
                  <div className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 bg-line-strong quantum-wire-glow" />

                  <div
                    className="relative grid"
                    style={{ gridTemplateColumns: `repeat(${numCols}, minmax(0, 1fr))` }}
                  >
                    {Array.from({ length: numCols }).map((_, col) => {
                      const here = placements.find((p) => p.col === col && p.q === row);
                      const target = placements.find(
                        (p) => p.col === col && TWO.has(p.g) && p.q2 === row
                      );

                      return (
                        <div
                          key={col}
                          className="relative flex h-13 items-center justify-center"
                        >
                          {/* Vertical entanglement line */}
                          {here && TWO.has(here.g) && here.q2 !== undefined && (
                            <span
                              className="absolute left-1/2 -z-0 w-[2.5px] -translate-x-1/2 shadow-xs pointer-events-none"
                              style={{
                                height: `${Math.abs(here.q2 - here.q) * 52}px`,
                                top:
                                  here.q2 > here.q
                                    ? "50%"
                                    : `calc(50% - ${(here.q - here.q2) * 52}px)`,
                                background: gateColors[here.g] || "#3b82f6",
                              }}
                            />
                          )}

                          {/* Gate node */}
                          {here && (
                            <span
                              tabIndex={0}
                              role="button"
                              aria-label={`${gateLabel[here.g] || here.g} gate on wire q[${here.q}]`}
                              onMouseEnter={(e) =>
                                setHoveredGate({
                                  placement: here,
                                  rect: e.currentTarget.getBoundingClientRect(),
                                })
                              }
                              onMouseLeave={() => setHoveredGate(null)}
                              onFocus={(e) =>
                                setHoveredGate({
                                  placement: here,
                                  rect: e.currentTarget.getBoundingClientRect(),
                                })
                              }
                              onBlur={() => setHoveredGate(null)}
                              className={cx(
                                "z-10 flex flex-col items-center justify-center h-9 min-w-9 px-1.5 rounded-xl font-mono font-bold text-bg-surface shadow-md transition-all hover:scale-105 select-none focus:outline-none focus:ring-2 focus:ring-accent-primary",
                                "border-t border-white/35 border-b-2 border-black/35 cursor-pointer"
                              )}
                              style={{ background: gateColors[here.g] || "#3b82f6" }}
                            >
                              <span
                                className={cx(
                                  here.g === "CNOT" || here.g === "CZ"
                                    ? "text-[16px] leading-none"
                                    : "text-[12px] leading-none"
                                )}
                              >
                                {here.g === "CNOT" || here.g === "CZ" ? "●" : here.g}
                              </span>
                              {ROT.has(here.g) && here.theta !== undefined && (
                                <span className="text-[8px] font-mono font-bold opacity-90 leading-none mt-0.5 tracking-tighter">
                                  {Math.abs(here.theta - Math.PI) < 0.05
                                    ? "π"
                                    : Math.abs(here.theta - Math.PI / 2) < 0.05
                                    ? "π/2"
                                    : Math.abs(here.theta - Math.PI / 4) < 0.05
                                    ? "π/4"
                                    : `${(here.theta / Math.PI).toFixed(2)}π`}
                                </span>
                              )}
                            </span>
                          )}

                          {/* Target qubit for 2-qubit gates */}
                          {target && (
                            <span
                              tabIndex={0}
                              role="button"
                              aria-label={`Target qubit for ${target.g} gate on wire q[${row}]`}
                              onMouseEnter={(e) =>
                                setHoveredGate({
                                  placement: target,
                                  rect: e.currentTarget.getBoundingClientRect(),
                                  isTarget: true,
                                })
                              }
                              onMouseLeave={() => setHoveredGate(null)}
                              onFocus={(e) =>
                                setHoveredGate({
                                  placement: target,
                                  rect: e.currentTarget.getBoundingClientRect(),
                                  isTarget: true,
                                })
                              }
                              onBlur={() => setHoveredGate(null)}
                              className="z-10 grid h-6.5 w-6.5 place-items-center rounded-full border-2 bg-bg-surface font-mono text-[12px] font-bold transition-transform hover:scale-110 select-none shadow-sm cursor-pointer"
                              style={{
                                borderColor: gateColors[target.g] || "#3b82f6",
                                color: gateColors[target.g] || "#3b82f6",
                              }}
                            >
                              {target.g === "SWAP" ? "×" : "⊕"}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Gate Educational Tooltip on Hover */}
        {hoveredGate && (
          <GateEducationalTooltip
            placement={hoveredGate.placement}
            anchorRect={hoveredGate.rect}
            isTarget={hoveredGate.isTarget}
            onClose={() => setHoveredGate(null)}
          />
        )}
      </div>
    </div>
  );
}
