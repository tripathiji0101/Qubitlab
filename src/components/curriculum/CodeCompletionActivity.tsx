import React, { useState } from "react";
import MathMarkdown from "../MathMarkdown";

interface CodeCompletionActivityProps {
  question: string;
  starterCode: string;
  expectedAnswer: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  selectedOptionIndex?: number;
  lastAnsweredCorrectly?: boolean;
  onSubmit: (selectedIndex: number, isCorrect: boolean) => void;
  onAskTutor?: (question: string, studentAnswer: string, isCorrect: boolean) => void;
}

export default function CodeCompletionActivity({
  question,
  starterCode,
  expectedAnswer,
  options,
  correctIndex,
  explanation,
  selectedOptionIndex: initialSelected,
  onSubmit,
  onAskTutor,
}: CodeCompletionActivityProps) {
  const [selected, setSelected] = useState<number | null>(
    initialSelected !== undefined ? initialSelected : null
  );
  const [submitted, setSubmitted] = useState<boolean>(
    initialSelected !== undefined
  );
  const [copied, setCopied] = useState<boolean>(false);

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

  const handleCopyCode = () => {
    if (navigator?.clipboard) {
      const codeToCopy = starterCode.replace("___", options[correctIndex] || expectedAnswer);
      navigator.clipboard.writeText(codeToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="rounded-xl border border-accent-primary/35 bg-[#0b0e17] p-4 sm:p-5 text-txt space-y-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap border-b border-line/40 pb-2.5">
        <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-accent-primary flex items-center gap-1.5">
          <span>💻</span> Qiskit Code Construction
        </span>
        <button
          type="button"
          onClick={handleCopyCode}
          className="text-[11px] font-mono text-quantum-cyan hover:underline cursor-pointer"
        >
          {copied ? "✓ Copied!" : "Copy Code Template"}
        </button>
      </div>

      {/* Question */}
      <div className="text-[14px] font-medium text-txt leading-relaxed">
        <MathMarkdown content={question} />
      </div>

      {/* Starter Code Block */}
      <div className="rounded-lg bg-[#06080d] p-3.5 border border-line/40 font-mono text-[12px] text-accent-cyan overflow-x-auto">
        <pre className="leading-relaxed">
          <code>{starterCode}</code>
        </pre>
      </div>

      {/* Options */}
      <div className="space-y-2.5">
        <div className="font-mono text-[11px] uppercase text-txt-dim tracking-wider">
          Select code snippet to complete the circuit:
        </div>
        {options.map((option, idx) => {
          const letter = String.fromCharCode(65 + idx);
          const isThisSelected = selected === idx;
          const isThisCorrect = idx === correctIndex;

          let optionStyle =
            "border-line/60 bg-[#121520] hover:border-accent-primary/60 hover:bg-[#161a29]";
          if (submitted) {
            if (isThisCorrect) {
              optionStyle = "border-ok/80 bg-ok/[0.12] text-white shadow-xs";
            } else if (isThisSelected && !isThisCorrect) {
              optionStyle = "border-danger/80 bg-danger/[0.12] text-white shadow-xs";
            } else {
              optionStyle = "border-line/30 bg-[#0d0f17] opacity-60";
            }
          } else if (isThisSelected) {
            optionStyle = "border-accent-primary bg-accent-primary/15 text-white shadow-xs";
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
                    ? "bg-accent-primary text-white border-accent-primary"
                    : "bg-[#181d2c] border-line/60 text-txt-dim"
                }`}
              >
                {letter}
              </span>
              <div className="flex-1 min-w-0 pt-0.5 leading-relaxed text-txt font-mono">
                <code>{option}</code>
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
            className="px-5 py-2 rounded-xl bg-accent-primary text-white font-mono text-[12px] font-bold hover:bg-accent-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm glow-cyan"
          >
            Submit Code Completion 💻
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setSelected(null);
              setSubmitted(false);
            }}
            className="px-4 py-1.5 rounded-xl border border-line/60 bg-[#141824] text-txt-dim hover:text-white font-mono text-[12px] transition-colors cursor-pointer"
          >
            ↻ Try Again
          </button>
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
            <span>✦ Ask Tutor about this code syntax</span>
          </button>
        )}
      </div>

      {/* Explanation Banner */}
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
              <span className="text-ok">✓ Implementation Analysis:</span>
            ) : (
              <span className="text-warn">⚠️ Code Explanation & Error Analysis:</span>
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
