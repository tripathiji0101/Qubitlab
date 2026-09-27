import React, { useState } from "react";
import MathMarkdown from "../MathMarkdown";
import SimulatorPreview from "./SimulatorPreview";
import { CircuitGateStep } from "../../lib/curriculumActivities";

interface CircuitActivityProps {
  question: string;
  initialState?: string;
  circuitSummary?: string;
  expectedState?: string;
  expectedObservation?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  circuit?: { qubits: number; gates: CircuitGateStep[] };
  selectedOptionIndex?: number;
  lastAnsweredCorrectly?: boolean;
  onSubmit: (selectedIndex: number, isCorrect: boolean) => void;
  onAskTutor?: (question: string, studentAnswer: string, isCorrect: boolean) => void;
}

export default function CircuitActivity({
  question,
  initialState,
  circuitSummary,
  expectedState,
  expectedObservation,
  options,
  correctIndex,
  explanation,
  circuit,
  selectedOptionIndex: initialSelected,
  onSubmit,
  onAskTutor,
}: CircuitActivityProps) {
  const [selected, setSelected] = useState<number | null>(
    initialSelected !== undefined ? initialSelected : null
  );
  const [submitted, setSubmitted] = useState<boolean>(
    initialSelected !== undefined
  );
  const [showSim, setShowSim] = useState<boolean>(true); // Auto-open circuit for circuit activities

  const isCorrect = submitted && selected === correctIndex;

  const handleSelect = (idx: number) => {
    if (submitted && isCorrect) return;
    setSelected(idx);
    setSubmitted(false);
  };

  const handleSubmit = () => {
    if (selected === null) return;
    const correct = selected === correctIndex;
    setSubmitted(true);
    onSubmit(selected, correct);
  };

  const handleRetry = () => {
    setSelected(null);
    setSubmitted(false);
  };

  return (
    <div className="rounded-xl border border-accent-cyan/35 bg-[#0b0e17] p-4 sm:p-5 text-txt space-y-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap border-b border-line/40 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-accent-cyan flex items-center gap-1.5">
            <span>⚡</span> Quantum Circuit Analysis
          </span>
          {initialState && (
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#161b28] border border-line/50 text-quantum-cyan">
              |ψ₀⟩ = <strong>{initialState}</strong>
            </span>
          )}
        </div>
        <span className="text-[11px] font-mono text-txt-dim">
          Gate Transformation
        </span>
      </div>

      {/* Circuit summary if available */}
      {circuitSummary && (
        <div className="rounded-lg border border-line/50 bg-[#10131d] p-3 text-xs font-mono text-txt-dim leading-relaxed">
          <span className="text-quantum-cyan font-bold block mb-1">
            Circuit Configuration:
          </span>
          <MathMarkdown content={circuitSummary} />
        </div>
      )}

      {/* Embedded Simulator Diagram (Visible by default for circuit analysis) */}
      {showSim && circuit && (
        <SimulatorPreview
          circuit={circuit}
          title="Circuit Gate Execution Flow"
          expectedState={expectedState || expectedObservation}
        />
      )}

      {/* Question */}
      <div className="text-[14px] font-medium text-txt leading-relaxed pt-1">
        <MathMarkdown content={question} />
      </div>

      {/* Options */}
      <div className="space-y-2.5">
        {options.map((option, idx) => {
          const letter = String.fromCharCode(65 + idx);
          const isThisSelected = selected === idx;
          const isThisCorrect = idx === correctIndex;

          let optionStyle =
            "border-line/60 bg-[#121520] hover:border-accent-cyan/60 hover:bg-[#161a29]";
          if (submitted) {
            if (isThisCorrect) {
              optionStyle = "border-ok/80 bg-ok/[0.12] text-white shadow-xs";
            } else if (isThisSelected && !isThisCorrect) {
              optionStyle = "border-danger/80 bg-danger/[0.12] text-white shadow-xs";
            } else {
              optionStyle = "border-line/30 bg-[#0d0f17] opacity-60";
            }
          } else if (isThisSelected) {
            optionStyle = "border-accent-cyan bg-accent-cyan/15 text-white shadow-xs";
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(idx)}
              className={`w-full text-left p-3 sm:p-3.5 rounded-xl border text-xs sm:text-[13px] font-mono transition-all flex items-start gap-3 cursor-pointer select-none ${optionStyle}`}
            >
              <span
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg text-xs font-bold border transition-colors ${
                  submitted && isThisCorrect
                    ? "bg-ok text-black border-ok"
                    : submitted && isThisSelected && !isThisCorrect
                    ? "bg-danger text-white border-danger"
                    : isThisSelected
                    ? "bg-accent-cyan text-black border-accent-cyan"
                    : "bg-[#181d2c] border-line/60 text-txt-dim"
                }`}
              >
                {letter}
              </span>
              <div className="flex-1 min-w-0 pt-0.5 leading-relaxed text-txt">
                <MathMarkdown content={option} />
              </div>
              {submitted && isThisCorrect && (
                <span className="shrink-0 text-ok font-bold text-sm">✓ Correct</span>
              )}
              {submitted && isThisSelected && !isThisCorrect && (
                <span className="shrink-0 text-danger font-bold text-sm">✗ Chosen</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-between gap-3 pt-2 flex-wrap">
        {!submitted ? (
          <button
            type="button"
            disabled={selected === null}
            onClick={handleSubmit}
            className="px-5 py-2 rounded-xl bg-accent-cyan text-black font-mono text-[12px] font-bold hover:bg-accent-cyan/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm glow-cyan"
          >
            Submit Circuit Analysis ⚡
          </button>
        ) : (
          <div className="flex items-center gap-2">
            {!isCorrect && (
              <button
                type="button"
                onClick={handleRetry}
                className="px-4 py-1.5 rounded-xl border border-line/60 bg-[#141824] text-txt-dim hover:text-white font-mono text-[12px] transition-colors cursor-pointer"
              >
                ↻ Try Again
              </button>
            )}
            {circuit && (
              <button
                type="button"
                onClick={() => setShowSim((prev) => !prev)}
                className="px-4 py-1.5 rounded-xl border border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20 font-mono text-[12px] font-semibold transition-colors cursor-pointer"
              >
                {showSim ? "Hide Simulator Circuit ⌃" : "Inspect Simulator Circuit ⚛"}
              </button>
            )}
          </div>
        )}

        {onAskTutor && submitted && (
          <button
            type="button"
            onClick={() =>
              onAskTutor(
                question,
                selected !== null ? options[selected] : "",
                isCorrect
              )
            }
            className="text-[11px] font-mono text-accent-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>✦ Ask Tutor about this circuit state</span>
          </button>
        )}
      </div>

      {/* Feedback banner */}
      {submitted && (
        <div
          className={`rounded-xl border p-4 space-y-2 text-xs sm:text-[13px] animate-fade-in ${
            isCorrect
              ? "border-ok/40 bg-ok/[0.08] text-txt"
              : "border-warn/40 bg-warn/[0.08] text-txt"
          }`}
        >
          <div className="font-mono text-xs font-bold uppercase tracking-wider">
            {isCorrect ? (
              <span className="text-ok">✓ Circuit Transformation Verified:</span>
            ) : (
              <span className="text-warn">⚠️ Gate Action Explanation:</span>
            )}
          </div>
          <div className="leading-relaxed text-txt-dim">
            <MathMarkdown content={explanation} />
          </div>
        </div>
      )}
    </div>
  );
}
