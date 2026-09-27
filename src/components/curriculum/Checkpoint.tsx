import React, { useState } from "react";
import MathMarkdown from "../MathMarkdown";
import { CheckpointDefinition } from "../../lib/curriculumActivities";

interface CheckpointProps {
  checkpoint: CheckpointDefinition;
  isPassed: boolean;
  onPass: () => void;
  onAskTutor?: (question: string, studentAnswer: string, isCorrect: boolean) => void;
}

export default function Checkpoint({
  checkpoint,
  isPassed,
  onPass,
  onAskTutor,
}: CheckpointProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(isPassed);

  const isCorrect = submitted && (selected === checkpoint.correctIndex || isPassed);

  const handleSubmit = () => {
    if (selected === null) return;
    setSubmitted(true);
    if (selected === checkpoint.correctIndex) {
      onPass();
    }
  };

  const handleRetry = () => {
    setSelected(null);
    setSubmitted(false);
  };

  return (
    <div className="rounded-xl border border-quantum-gold/50 bg-[#14120b] p-5 text-txt space-y-4 shadow-md">
      {/* Checkpoint header */}
      <div className="flex items-center justify-between gap-2 border-b border-quantum-gold/30 pb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-lg bg-quantum-gold/20 text-quantum-gold border border-quantum-gold/40 text-xs font-bold">
            🏁
          </span>
          <span className="font-mono text-[12px] font-bold uppercase tracking-wider text-quantum-gold">
            Milestone Concept Checkpoint
          </span>
        </div>
        {isPassed && (
          <span className="rounded-md bg-ok/20 border border-ok/40 px-2.5 py-0.5 font-mono text-[11px] font-bold text-ok flex items-center gap-1">
            <span>✓</span> Checkpoint Passed
          </span>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="font-display text-[15px] font-bold text-txt">
          {checkpoint.title}
        </h3>
        <p className="text-xs font-mono text-txt-dim leading-relaxed">
          {checkpoint.conceptSummary}
        </p>
      </div>

      {/* Question */}
      <div className="rounded-lg bg-[#0e0d08] p-3.5 border border-quantum-gold/20 text-xs sm:text-[13px] font-mono text-txt leading-relaxed">
        <MathMarkdown content={checkpoint.question} />
      </div>

      {/* Options */}
      <div className="space-y-2">
        {checkpoint.options.map((option, idx) => {
          const letter = String.fromCharCode(65 + idx);
          const isThisSelected = selected === idx;
          const isThisCorrect = idx === checkpoint.correctIndex;

          let optionStyle =
            "border-line/60 bg-[#16140f] hover:border-quantum-gold/60 hover:bg-[#1b1912]";
          if (submitted) {
            if (isThisCorrect) {
              optionStyle = "border-ok/80 bg-ok/[0.15] text-white shadow-xs";
            } else if (isThisSelected && !isThisCorrect) {
              optionStyle = "border-danger/80 bg-danger/[0.15] text-white shadow-xs";
            } else {
              optionStyle = "border-line/30 bg-[#0d0c08] opacity-60";
            }
          } else if (isThisSelected) {
            optionStyle = "border-quantum-gold bg-quantum-gold/20 text-white shadow-xs";
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (submitted && isCorrect) return;
                setSelected(idx);
                setSubmitted(false);
              }}
              className={`w-full text-left p-3 rounded-xl border text-xs sm:text-[13px] font-mono transition-all flex items-start gap-3 cursor-pointer select-none ${optionStyle}`}
            >
              <span
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg text-xs font-bold border transition-colors ${
                  submitted && isThisCorrect
                    ? "bg-ok text-black border-ok"
                    : submitted && isThisSelected && !isThisCorrect
                    ? "bg-danger text-white border-danger"
                    : isThisSelected
                    ? "bg-quantum-gold text-black border-quantum-gold font-bold"
                    : "bg-[#201d14] border-line/60 text-txt-dim"
                }`}
              >
                {letter}
              </span>
              <div className="flex-1 min-w-0 pt-0.5 leading-relaxed text-txt font-mono">
                <MathMarkdown content={option} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
        {!submitted ? (
          <button
            type="button"
            disabled={selected === null}
            onClick={handleSubmit}
            className="px-5 py-2 rounded-xl bg-quantum-gold text-black font-mono text-[12px] font-bold hover:bg-quantum-gold/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
          >
            Submit Milestone Checkpoint 🏁
          </button>
        ) : (
          !isCorrect && (
            <button
              type="button"
              onClick={handleRetry}
              className="px-4 py-1.5 rounded-xl border border-line/60 bg-[#16140f] text-txt-dim hover:text-white font-mono text-[12px] transition-colors cursor-pointer"
            >
              ↻ Try Again
            </button>
          )
        )}

        {onAskTutor && submitted && (
          <button
            type="button"
            onClick={() =>
              onAskTutor(
                checkpoint.question,
                selected !== null ? checkpoint.options[selected] : "",
                isCorrect
              )
            }
            className="text-[11px] font-mono text-quantum-gold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>✦ Ask Tutor about this checkpoint</span>
          </button>
        )}
      </div>

      {/* Explanation Banner */}
      {submitted && (
        <div
          className={`rounded-xl border p-4 space-y-2 text-xs sm:text-[13px] animate-fade-in ${
            isCorrect
              ? "border-ok/40 bg-ok/[0.1] text-txt"
              : "border-warn/40 bg-warn/[0.1] text-txt"
          }`}
        >
          <div className="font-mono text-xs font-bold uppercase tracking-wider">
            {isCorrect ? (
              <span className="text-ok">✓ Milestone Retrieval Confirmed:</span>
            ) : (
              <span className="text-warn">⚠️ Key Transfer Concept:</span>
            )}
          </div>
          <div className="leading-relaxed text-txt-dim">
            <MathMarkdown content={checkpoint.explanation} />
          </div>
        </div>
      )}
    </div>
  );
}
