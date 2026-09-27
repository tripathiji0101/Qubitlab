import React from "react";
import { PhaseKnowledgeState } from "../../lib/curriculumActivities";

interface PhaseProgressProps {
  state: PhaseKnowledgeState;
  hasCheckpoint?: boolean;
  className?: string;
}

export default function PhaseProgress({
  state,
  hasCheckpoint = false,
  className = "",
}: PhaseProgressProps) {
  const isMastered = state.completed && state.lastAnsweredCorrectly;
  const isStarted = state.started || state.activityAttempts > 0;

  return (
    <div
      className={`flex items-center justify-between gap-3 p-3 rounded-xl border bg-[#0d1017] text-xs font-mono flex-wrap ${
        isMastered
          ? "border-ok/40 bg-ok/[0.03]"
          : isStarted
          ? "border-quantum-cyan/30 bg-quantum-cyan/[0.02]"
          : "border-line/40"
      } ${className}`}
    >
      {/* Status indicator */}
      <div className="flex items-center gap-2">
        <span
          className={`grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold ${
            isMastered
              ? "bg-ok text-black"
              : isStarted
              ? "bg-quantum-cyan/20 text-quantum-cyan border border-quantum-cyan/40"
              : "bg-line/40 text-txt-faint"
          }`}
        >
          {isMastered ? "✓" : isStarted ? "●" : "○"}
        </span>
        <span
          className={`font-semibold tracking-wide ${
            isMastered
              ? "text-ok"
              : isStarted
              ? "text-quantum-cyan"
              : "text-txt-dim"
          }`}
        >
          {isMastered
            ? "Phase Mastered"
            : isStarted
            ? "Practice In Progress"
            : "Not Started"}
        </span>
      </div>

      {/* Numerical knowledge metrics */}
      <div className="flex items-center gap-3 text-[11px] text-txt-dim flex-wrap">
        <span title="Total attempts on this phase's interactive activity">
          🎯 Attempts:{" "}
          <strong className="text-txt font-semibold">
            {state.activityAttempts}
          </strong>
        </span>

        {state.hintsUsed > 0 && (
          <span
            className="text-warn flex items-center gap-1"
            title="Progressive hints unlocked"
          >
            <span>💡</span> Hints: {state.hintsUsed}/2
          </span>
        )}

        {hasCheckpoint && (
          <span
            className={`flex items-center gap-1 ${
              state.checkpointPassed ? "text-ok font-semibold" : "text-txt-dim"
            }`}
          >
            <span>🏁</span> Checkpoint:{" "}
            {state.checkpointPassed ? "Passed ✓" : "Pending"}
          </span>
        )}
      </div>
    </div>
  );
}
