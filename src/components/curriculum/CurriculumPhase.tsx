import React, { useState } from "react";
import MathMarkdown from "../MathMarkdown";
import CurriculumActivity from "./CurriculumActivity";
import Checkpoint from "./Checkpoint";
import PhaseProgress from "./PhaseProgress";
import { CurriculumPhase as PhaseType } from "../../lib/curriculumData";
import { PhaseKnowledgeState } from "../../lib/curriculumActivities";

interface CurriculumPhaseProps {
  phase: PhaseType;
  totalPhases: number;
  knowledgeState: PhaseKnowledgeState;
  onUpdateKnowledgeState: (update: Partial<PhaseKnowledgeState>) => void;
  onToggleMastery: (order: number) => void;
  isMastered: boolean;
  onNavigatePrev: () => void;
  onNavigateNext: () => void;
  onAskTutor: (prompt: string) => void;
}

export default function CurriculumPhase({
  phase,
  totalPhases,
  knowledgeState,
  onUpdateKnowledgeState,
  onToggleMastery,
  isMastered,
  onNavigatePrev,
  onNavigateNext,
  onAskTutor,
}: CurriculumPhaseProps) {
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [showVerification, setShowVerification] = useState<boolean>(false);

  const handleCopyCode = (code: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleAskTutorWithContext = (
    activityQ?: string,
    studentAns?: string,
    isCorrect?: boolean
  ) => {
    let prompt = `Algorithm: ${phase.id.split("-")[0].toUpperCase()}\nPhase: Phase ${phase.order} — ${phase.title}\nObjective: ${phase.objective}\n`;
    if (activityQ) {
      prompt += `Activity Question: ${activityQ}\n`;
      prompt += `Student Answer: ${studentAns || "Unanswered"}\n`;
      prompt += `Answered Correctly: ${isCorrect ? "Yes" : "No"}\n`;
      prompt += `Hints Used: ${knowledgeState.hintsUsed}/2\n`;
    }
    prompt += `\nCould you please explain the quantum mechanics and intuition behind this concept in detail?`;
    onAskTutor(prompt);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-6">
      {/* 1. Header: Phase Title & Knowledge State Bar */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 font-mono text-[11px] flex-wrap">
          <span className="font-bold uppercase text-quantum-cyan px-2 py-0.5 rounded bg-quantum-cyan/15 border border-quantum-cyan/25">
            Phase {String(phase.order).padStart(2, "0")} of {totalPhases}
          </span>
          <span className="text-txt-faint">⏱ {phase.duration}</span>
          <span className="text-ok font-semibold">+{phase.xp_reward} XP</span>
        </div>
        <h1 className="font-display text-2xl font-bold text-txt">
          {phase.title}
        </h1>

        {/* Knowledge state banner */}
        <PhaseProgress
          state={knowledgeState}
          hasCheckpoint={Boolean(phase.checkpoint)}
        />
      </div>

      {/* 2. Previous Phase Bridge */}
      {phase.prevConnection && (
        <div className="rounded-xl border border-line/50 bg-[#0e1017] p-3.5 text-xs text-txt-dim font-mono flex items-start gap-2">
          <span className="text-quantum-blue font-bold shrink-0">⏮ Context:</span>
          <p className="leading-relaxed">{phase.prevConnection}</p>
        </div>
      )}

      {/* 3. Learning Objective */}
      <div className="rounded-xl border border-quantum-cyan/35 bg-quantum-cyan/[0.04] p-4">
        <div className="font-mono text-[11px] uppercase font-bold text-quantum-cyan flex items-center gap-1.5">
          <span>🎯 Learning Objective</span>
        </div>
        <p className="mt-1.5 text-[13px] text-txt leading-relaxed font-medium">
          {phase.objective}
        </p>
      </div>

      {/* 4. Why This Concept Is Necessary */}
      {phase.whyNecessary && (
        <div className="rounded-xl border border-accent-blue/30 bg-[#0d1322] p-4 space-y-1.5">
          <div className="font-mono text-[11px] uppercase font-bold text-accent-blue flex items-center gap-1.5">
            <span>⚡ Why This Concept Is Necessary</span>
          </div>
          <p className="text-[13px] text-txt-dim leading-relaxed">
            {phase.whyNecessary}
          </p>
        </div>
      )}

      {/* 5. Concept Explanation */}
      <div className="rounded-xl border border-line/60 bg-[#12131b] p-5 space-y-3">
        <div className="font-mono text-[11px] uppercase font-bold text-quantum-blue flex items-center gap-1.5 border-b border-line/40 pb-2">
          <span>📖 Beginner-Friendly Explanation</span>
        </div>
        <div className="text-[13px] text-txt-dim leading-relaxed">
          <MathMarkdown content={phase.explanation} />
        </div>
      </div>

      {/* 6. Mathematical Foundations */}
      {phase.math && (
        <div className="rounded-xl border border-accent-blue/30 bg-[#0f1422] p-5 space-y-3">
          <div className="font-mono text-[11px] uppercase font-bold text-accent-blue flex items-center gap-1.5 border-b border-line/40 pb-2">
            <span>⚛ Mathematical Formulation & State Amplitudes</span>
          </div>
          <div className="text-[13px] text-txt-dim leading-relaxed">
            <MathMarkdown content={phase.math} />
          </div>
        </div>
      )}

      {/* 7. Circuit Connection & Physical Intuition */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {phase.circuitConnection && (
          <div className="rounded-xl border border-line/60 bg-[#12131b] p-4 space-y-2">
            <div className="font-mono text-[11px] uppercase font-bold text-quantum-cyan flex items-center gap-1.5">
              <span>🔌 Circuit & Gate Connection</span>
            </div>
            <div className="text-[12px] text-txt-dim leading-relaxed">
              {typeof phase.circuitConnection === "string" ? (
                <MathMarkdown content={phase.circuitConnection} />
              ) : (
                <ul className="space-y-1.5">
                  {phase.circuitConnection.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="font-mono text-[11px] font-bold text-quantum-cyan">
                        [{item.gate}]
                      </span>
                      <span>{item.role}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {phase.visualIntuition && (
          <div className="rounded-xl border border-line/60 bg-[#12131b] p-4 space-y-2">
            <div className="font-mono text-[11px] uppercase font-bold text-accent-primary flex items-center gap-1.5">
              <span>👁 Physical & Geometric Intuition</span>
            </div>
            <p className="text-[12px] text-txt-dim leading-relaxed">
              {phase.visualIntuition}
            </p>
          </div>
        )}
      </div>

      {/* 8. Worked Example */}
      {phase.example && (
        <div className="rounded-xl border border-line/60 bg-[#12131b] p-4 space-y-2">
          <div className="font-mono text-[11px] uppercase font-bold text-ok flex items-center gap-1.5">
            <span>💡 Worked Numerical Example</span>
          </div>
          <div className="text-[12px] text-txt-dim leading-relaxed">
            <MathMarkdown content={phase.example} />
          </div>
        </div>
      )}

      {/* 9. INTERACTIVE LEARNING ACTIVITY (Heart of the phase) */}
      {phase.activity && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-quantum-cyan flex items-center gap-1.5">
              <span>✨</span> Interactive Learning Activity
            </span>
            <span className="font-mono text-[10px] text-txt-dim">
              Activity Type: {phase.activity.type}
            </span>
          </div>

          <CurriculumActivity
            activity={phase.activity}
            knowledgeState={knowledgeState}
            onUpdateKnowledgeState={onUpdateKnowledgeState}
            onAskTutor={(q, a, c) => handleAskTutorWithContext(q, a, c)}
          />
        </div>
      )}

      {/* 10. Conceptual Verification & Analysis */}
      {phase.verification && (
        <div className="rounded-xl border border-ok/30 bg-[#0d1712] p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase font-bold text-ok flex items-center gap-1.5">
              <span>🔍</span> Verification & Mathematical Evidence
            </span>
            <button
              type="button"
              onClick={() => setShowVerification((prev) => !prev)}
              className="text-[11px] font-mono text-ok hover:underline cursor-pointer"
            >
              {showVerification ? "Hide Verification" : "Show Verification"}
            </button>
          </div>
          {showVerification && (
            <div className="text-[12px] text-txt-dim leading-relaxed pt-1 animate-fade-in">
              <MathMarkdown content={phase.verification} />
            </div>
          )}
        </div>
      )}

      {/* 11. Common Mistakes & Pitfalls */}
      {phase.commonMistakes && phase.commonMistakes.length > 0 && (
        <div className="rounded-xl border border-warn/30 bg-[#1a1610] p-4 space-y-2">
          <div className="font-mono text-[11px] uppercase font-bold text-warn flex items-center gap-1.5">
            <span>⚠️ Common Student Pitfalls & Misconceptions</span>
          </div>
          <ul className="space-y-1.5 text-[12px] text-txt-dim list-disc pl-4">
            {phase.commonMistakes.map((mistake, idx) => (
              <li key={idx} className="leading-relaxed">
                {mistake}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 12. Concept Checkpoint (Milestone Phases 4, 8, 12) */}
      {phase.checkpoint && (
        <Checkpoint
          checkpoint={phase.checkpoint}
          isPassed={knowledgeState.checkpointPassed}
          onPass={() => onUpdateKnowledgeState({ checkpointPassed: true })}
          onAskTutor={(q, a, c) => handleAskTutorWithContext(q, a, c)}
        />
      )}

      {/* 13. Qiskit Code Snippet */}
      {phase.qiskitCode && (
        <div className="rounded-xl border border-line/60 bg-[#0b0c10] p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase font-bold text-txt-dim">
              💻 Qiskit Code Implementation
            </span>
            <button
              type="button"
              onClick={() => handleCopyCode(phase.qiskitCode!)}
              className="text-[11px] font-mono text-quantum-cyan hover:underline cursor-pointer"
            >
              {copiedCode ? "✓ Copied!" : "Copy Code"}
            </button>
          </div>
          <pre className="overflow-x-auto rounded-lg bg-[#08090d] p-3 text-[12px] font-mono text-accent-cyan leading-normal border border-line/30">
            <code>{phase.qiskitCode}</code>
          </pre>
        </div>
      )}

      {/* 14. Connection to Next Phase */}
      {phase.nextConnection && (
        <div className="rounded-xl border border-line/60 bg-[#12131b] p-4 text-[12px] text-txt-dim">
          <span className="font-mono text-[10px] uppercase font-bold text-quantum-blue block mb-1">
            🚀 Connection to Next Phase:
          </span>
          <p className="leading-relaxed">{phase.nextConnection}</p>
        </div>
      )}

      {/* 15. Ask AI Tutor CTA */}
      <div className="rounded-xl border border-accent-primary/40 bg-accent-primary/[0.06] p-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase text-accent-primary">
            <span>✦ Socratic Quantum AI Tutor</span>
          </div>
          <p className="text-[12px] text-txt-dim">
            Need further guidance? Ask the AI Tutor with full phase context pre-loaded.
          </p>
        </div>
        <button
          type="button"
          onClick={() => handleAskTutorWithContext()}
          className="px-3.5 py-1.5 rounded-lg bg-accent-primary/20 border border-accent-primary/40 text-accent-primary hover:bg-accent-primary hover:text-white font-mono text-[12px] font-bold transition-all cursor-pointer shadow-xs"
        >
          Ask Tutor about Phase {phase.order} ✦
        </button>
      </div>

      {/* Bottom Navigation controls */}
      <div className="flex items-center justify-between pt-4 border-t border-line/40 flex-wrap gap-3">
        <button
          type="button"
          disabled={phase.order <= 1}
          onClick={onNavigatePrev}
          className="px-4 py-2 rounded-lg border border-line/60 bg-[#161722] text-[12px] font-mono text-txt-dim hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          ← Previous Phase
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleMastery(phase.order)}
            className={`px-3 py-2 rounded-lg border text-[12px] font-mono transition-colors cursor-pointer ${
              isMastered
                ? "border-ok/50 bg-ok/10 text-ok font-bold"
                : "border-line/60 bg-[#161722] text-txt-dim hover:text-white"
            }`}
          >
            {isMastered ? "✓ Phase Completed" : "○ Mark Complete"}
          </button>

          <button
            type="button"
            onClick={onNavigateNext}
            className="px-4 py-2 rounded-lg bg-quantum-cyan/20 border border-quantum-cyan/40 text-quantum-cyan hover:bg-quantum-cyan hover:text-black font-mono text-[12px] font-bold transition-all cursor-pointer glow-cyan"
          >
            {phase.order < totalPhases
              ? `Continue to Phase ${phase.order + 1} →`
              : "Mastery Complete — Return to Syllabus ✓"}
          </button>
        </div>
      </div>
    </div>
  );
}
