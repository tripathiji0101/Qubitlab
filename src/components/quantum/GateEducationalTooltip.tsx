import React, { useMemo, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import katex from "katex";
import { gateColors } from "../quantum";
import { GATE_EDUCATION_DATA, formatGateTheta } from "./gateEducationData";

interface GateEducationalTooltipProps {
  placement: {
    id: string;
    g: string;
    col: number;
    q: number;
    q2?: number;
    theta?: number;
  };
  anchorRect: DOMRect | null;
  isTarget?: boolean;
  onClose?: () => void;
  interactive?: boolean; // if true, allows pointer events (for mobile/focus)
}

export default function GateEducationalTooltip({
  placement,
  anchorRect,
  isTarget = false,
  onClose,
  interactive = false,
}: GateEducationalTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: -9999, left: -9999 });

  const info = GATE_EDUCATION_DATA[placement.g] ?? {
    id: placement.g,
    symbol: placement.g,
    name: `${placement.g} Gate`,
    category: "Single Qubit",
    description: "Quantum circuit operation.",
    intuition: "Performs unitary transformation on the qubit state.",
  };

  // Keyboard accessibility: dismiss on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Compute smart viewport-clamped positioning
  useEffect(() => {
    if (!anchorRect) return;

    const updatePosition = () => {
      const tooltipEl = tooltipRef.current;
      const width = tooltipEl ? tooltipEl.offsetWidth : 320;
      const height = tooltipEl ? tooltipEl.offsetHeight : 240;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Center horizontally on anchor, clamped to screen edges
      const anchorCenterX = anchorRect.left + anchorRect.width / 2;
      let left = anchorCenterX - width / 2;
      left = Math.max(12, Math.min(viewportWidth - width - 12, left));

      // Prefer showing ABOVE the gate; flip BELOW if near top
      let top = anchorRect.top - height - 10;
      if (top < 12) {
        top = anchorRect.bottom + 10;
      }
      // If still overflowing bottom, clamp within viewport
      top = Math.max(12, Math.min(viewportHeight - height - 12, top));

      setCoords({ top, left });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [anchorRect, placement]);

  // Pre-render KaTeX math safely
  const renderedEquation = useMemo(() => {
    if (!info.equation) return null;
    try {
      return katex.renderToString(info.equation, {
        displayMode: true,
        throwOnError: false,
      });
    } catch {
      return null;
    }
  }, [info.equation]);

  const renderedMatrix = useMemo(() => {
    if (!info.matrix) return null;
    try {
      return katex.renderToString(info.matrix, {
        displayMode: true,
        throwOnError: false,
      });
    } catch {
      return null;
    }
  }, [info.matrix]);

  if (!anchorRect) return null;

  const thetaInfo = formatGateTheta(placement.theta);
  const isRotation = ["RX", "RY", "RZ"].includes(placement.g);
  const color = gateColors[placement.g] || "#3b82f6";

  const content = (
    <div
      ref={tooltipRef}
      role="tooltip"
      id={`gate-tooltip-${placement.id}`}
      aria-label={`${info.name} educational details`}
      className={`fixed z-[99999] w-[320px] max-w-[calc(100vw-24px)] rounded-xl border border-line-strong/80 bg-bg-panel/95 p-3.5 shadow-2xl backdrop-blur-md transition-opacity duration-150 animate-in fade-in zoom-in-95 ${
        interactive ? "pointer-events-auto" : "pointer-events-none select-none"
      }`}
      style={{
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        opacity: coords.top === -9999 ? 0 : 1,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-line/60 pb-2.5">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-[13px] font-bold text-white shadow-xs"
          style={{ background: color }}
        >
          {placement.g === "CNOT" || placement.g === "CZ" ? "●" : placement.g}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1.5">
            <h4 className="truncate font-display text-[13.5px] font-bold text-txt">
              {info.name}
            </h4>
            <span className="shrink-0 rounded bg-bg-surface px-1.5 py-0.5 font-mono text-[10px] font-semibold text-txt-dim border border-line/60">
              {info.category}
            </span>
          </div>
          <div className="font-mono text-[11px] text-txt-dim">
            {isTarget ? (
              <span className="text-accent-blue">Target wire: q[{placement.q2 ?? placement.q}]</span>
            ) : placement.q2 !== undefined ? (
              <span>
                Control: <strong className="text-txt font-semibold">q[{placement.q}]</strong> → Target: <strong className="text-txt font-semibold">q[{placement.q2}]</strong>
              </span>
            ) : (
              <span>
                Wire: <strong className="text-txt font-semibold">q[{placement.q}]</strong> · Moment: {placement.col + 1}
              </span>
            )}
          </div>
        </div>
        {interactive && (
          <button
            onClick={onClose}
            className="text-txt-dim hover:text-white p-1 rounded hover:bg-bg-surface text-xs"
            aria-label="Close tooltip"
          >
            ✕
          </button>
        )}
      </div>

      {/* Description */}
      <p className="mt-2 text-[12px] font-normal leading-relaxed text-txt-dim">
        {info.description}
      </p>

      {/* Parameterized Angle Details */}
      {isRotation && (
        <div className="mt-2 rounded-lg border border-line/70 bg-bg-surface/80 p-2 font-mono text-[11px]">
          <div className="flex items-center justify-between text-txt">
            <span className="text-txt-faint uppercase font-bold text-[10px]">Rotation Parameter</span>
            <span className="font-bold text-accent-blue">
              θ = {thetaInfo.fraction} ({thetaInfo.degrees})
            </span>
          </div>
          <div className="mt-0.5 text-[10.5px] text-txt-dim">
            {info.parameterExplanation} Value: <code className="text-txt">{thetaInfo.radians}</code>
          </div>
        </div>
      )}

      {/* Mathematical Action & Matrix */}
      {(renderedEquation || renderedMatrix) && (
        <div className="mt-2.5 space-y-1.5 rounded-lg border border-line/50 bg-bg-canvas/90 p-2 text-center overflow-x-auto">
          {renderedEquation && (
            <div
              className="text-[11.5px] text-txt [&_.katex-display]:my-0.5"
              dangerouslySetInnerHTML={{ __html: renderedEquation }}
            />
          )}
          {renderedMatrix && (
            <div className="pt-1 border-t border-line/40">
              <span className="text-[10px] font-mono uppercase tracking-wider text-txt-faint block mb-0.5">
                Matrix Representation
              </span>
              <div
                className="text-[11px] text-txt [&_.katex-display]:my-0.5"
                dangerouslySetInnerHTML={{ __html: renderedMatrix }}
              />
            </div>
          )}
        </div>
      )}

      {/* Intuition Callout */}
      <div className="mt-2.5 rounded-lg border border-accent-primary/20 bg-accent-primary/5 p-2 text-[11.5px] leading-snug text-txt-dim">
        <span className="font-semibold text-accent-blue mr-1">💡 Intuition:</span>
        {info.intuition}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
