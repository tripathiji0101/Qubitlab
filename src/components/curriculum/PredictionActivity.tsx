import React, { useState } from "react";
import MathMarkdown from "../MathMarkdown";
import SimulatorPreview from "./SimulatorPreview";
import { CircuitGateStep } from "../../lib/curriculumActivities";

interface PredictionActivityProps {
  question: string;
  initialState?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  circuit?: { qubits: number; gates: CircuitGateStep[] };
  selectedOptionIndex?: number;
  lastAnsweredCorrectly?: boolean;
  onSubmit: (selectedIndex: number, isCorrect: boolean) => void;
  onAskTutor?: (question: string, studentAnswer: string, isCorrect: boolean) => void;
}

export default function PredictionActivity({
  question,
  initialState,
  options,
  correctIndex,
  explanation,
  circuit,
  selectedOptionIndex: initialSelected,
  lastAnsweredCorrectly,
  onSubmit,
  onAskTutor,
}: PredictionActivityProps) {
  const [selected, setSelected] = useState<number | null>(
    initialSelected !== undefined ? initialSelected : null
  );
  const [submitted, setSubmitted] = useState<boolean>(
    initialSelected !== undefined
  );
  const [showSim, setShowSim] = useState<boolean>(false);

  const isCorrect = submitted && selected === correctIndex;
  const isIncorrect = submitted && selected !== null && selected !== correctIndex;

  const handleSelect = (idx: number) => {
    if (submitted && isCorrect) return; // Locked once correctly solved
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
    <div className="rounded-xl border border-quantum-cyan/35 bg-[#0b0e17] p-4 sm:p-5 text-txt space-y-4 shadow-sm">
      {/* Hypothesis / Prediction header */}
      <div className="flex items-center justify-between gap-2 flex-wrap border-b border-line/40 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-quantum-cyan flex items-center gap-1.5">
            <span>🔮</span> Predict Before You Run
          </span>
          {initialState && (
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#161b28] border border-line/50 text-accent-cyan">
              Initial State: <strong>{initialState}</strong>
            </span>
          )}
        </div>

        <span className="text-[11px] font-mono text-txt-dim">
          Active Quantum Reasoning
        </span>
      </div>

      {/* The Question */}
      <div className="text-[14px] font-medium text-txt leading-relaxed">
        <MathMarkdown content={question} />
      </div>

      {/* Options List */}
      <div className="space-y-2.5">
        {options.map((option, idx) => {
          const letter = String.fromCharCode(65 + idx); // A, B, C, D
          const isThisSelected = selected === idx;
          const isThisCorrect = idx === correctIndex;

          let optionStyle =
            "border-line/60 bg-[#121520] hover:border-quantum-cyan/60 hover:bg-[#161a29]";
          if (submitted) {
            if (isThisCorrect) {
              optionStyle = "border-ok/80 bg-ok/[0.12] text-white shadow-xs";
            } else if (isThisSelected && !isThisCorrect) {
              optionStyle = "border-danger/80 bg-danger/[0.12] text-white shadow-xs";
            } else {
              optionStyle = "border-line/30 bg-[#0d0f17] opacity-60";
            }
          } else if (isThisSelected) {
            optionStyle = "border-quantum-cyan bg-quantum-cyan/15 text-white shadow-xs";
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
                    ? "bg-quantum-cyan text-black border-quantum-cyan"
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

      {/* Action / Submit Buttons */}
      <div className="flex items-center justify-between gap-3 pt-2 flex-wrap">
        {!submitted ? (
          <button
            type="button"
            disabled={selected === null}
            onClick={handleSubmit}
            className="px-5 py-2 rounded-xl bg-quantum-cyan text-black font-mono text-[12px] font-bold hover:bg-quantum-cyan/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm glow-cyan"
          >
            Submit Prediction & Verify 🚀
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
                className="px-4 py-1.5 rounded-xl border border-quantum-cyan/40 bg-quantum-cyan/10 text-quantum-cyan hover:bg-quantum-cyan/20 font-mono text-[12px] font-semibold transition-colors cursor-pointer"
              >
                {showSim ? "Hide Simulator Execution ⌃" : "Run Live in Simulator ⚛"}
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
            <span>✦ Ask Tutor about this prediction</span>
          </button>
        )}
      </div>

      {/* Immediate Pedagogical Feedback Banner */}
      {submitted && (
        <div
          className={`rounded-xl border p-4 space-y-2 text-xs sm:text-[13px] animate-fade-in ${
            isCorrect
              ? "border-ok/40 bg-ok/[0.08] text-txt"
              : "border-warn/40 bg-warn/[0.08] text-txt"
          }`}
        >
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider">
            {isCorrect ? (
              <span className="text-ok flex items-center gap-1.5">
                <span>✓</span> Accurate Prediction!
              </span>
            ) : (
              <span className="text-warn flex items-center gap-1.5">
                <span>⚠️</span> Hypothesis Mismatch — Let's Reason Why:
              </span>
            )}
          </div>

          <div className="leading-relaxed text-txt-dim">
            <MathMarkdown content={explanation} />
          </div>
        </div>
      )}

      {/* Connected Live Quantum Simulation */}
      {showSim && circuit && (
        <div className="pt-2 animate-scale-up">
          <SimulatorPreview
            circuit={circuit}
            title="Statevector Verification for this Prediction"
            expectedState={options[correctIndex]}
          />
        </div>
      )}
    </div>
  );
}
