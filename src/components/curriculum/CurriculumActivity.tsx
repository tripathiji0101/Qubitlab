import React, { useState } from "react";
import MathMarkdown from "../MathMarkdown";
import PredictionActivity from "./PredictionActivity";
import MultipleChoiceActivity from "./MultipleChoiceActivity";
import CircuitActivity from "./CircuitActivity";
import CodeCompletionActivity from "./CodeCompletionActivity";
import {
  CurriculumActivity as ActivityUnion,
  PhaseKnowledgeState,
} from "../../lib/curriculumActivities";

interface CurriculumActivityProps {
  activity: ActivityUnion;
  knowledgeState: PhaseKnowledgeState;
  onUpdateKnowledgeState: (update: Partial<PhaseKnowledgeState>) => void;
  onAskTutor?: (question: string, studentAnswer: string, isCorrect: boolean) => void;
}

export default function CurriculumActivity({
  activity,
  knowledgeState,
  onUpdateKnowledgeState,
  onAskTutor,
}: CurriculumActivityProps) {
  const [activeHintLevel, setActiveHintLevel] = useState<number>(
    knowledgeState.hintsUsed || 0
  );
  const [showFullExplanation, setShowFullExplanation] = useState<boolean>(false);

  const handleActivitySubmit = (selectedIndex: number, isCorrect: boolean) => {
    onUpdateKnowledgeState({
      started: true,
      activityAttempts: (knowledgeState.activityAttempts || 0) + 1,
      correctAttempts: (knowledgeState.correctAttempts || 0) + (isCorrect ? 1 : 0),
      completed: isCorrect || knowledgeState.completed,
      selectedOptionIndex: selectedIndex,
      lastAnsweredCorrectly: isCorrect,
    });
  };

  const handleUnlockHint = (level: number) => {
    const nextLevel = Math.max(activeHintLevel, level);
    setActiveHintLevel(nextLevel);
    onUpdateKnowledgeState({
      hintsUsed: nextLevel,
    });
  };

  const hints = activity.hints || [];

  return (
    <div className="space-y-4">
      {/* Dynamic Dispatcher for Activity Type */}
      {activity.type === "prediction" && (
        <PredictionActivity
          question={activity.question}
          initialState={activity.initialState}
          options={activity.options}
          correctIndex={activity.correctIndex}
          explanation={activity.explanation}
          circuit={activity.circuit}
          selectedOptionIndex={knowledgeState.selectedOptionIndex}
          lastAnsweredCorrectly={knowledgeState.lastAnsweredCorrectly}
          onSubmit={handleActivitySubmit}
          onAskTutor={onAskTutor}
        />
      )}

      {activity.type === "multiple-choice" && (
        <MultipleChoiceActivity
          question={activity.question}
          options={activity.options}
          correctIndex={activity.correctIndex}
          explanation={activity.explanation}
          circuit={activity.circuit}
          selectedOptionIndex={knowledgeState.selectedOptionIndex}
          lastAnsweredCorrectly={knowledgeState.lastAnsweredCorrectly}
          onSubmit={handleActivitySubmit}
          onAskTutor={onAskTutor}
        />
      )}

      {(activity.type === "gate-prediction" || activity.type === "circuit-analysis") && (
        <CircuitActivity
          question={activity.question}
          initialState={
            activity.type === "gate-prediction" ? activity.initialState : undefined
          }
          circuitSummary={
            activity.type === "circuit-analysis"
              ? activity.circuitSummary
              : undefined
          }
          expectedState={
            activity.type === "gate-prediction"
              ? activity.expectedState
              : undefined
          }
          expectedObservation={
            activity.type === "circuit-analysis"
              ? activity.expectedObservation
              : undefined
          }
          options={activity.options}
          correctIndex={activity.correctIndex}
          explanation={activity.explanation}
          circuit={activity.circuit}
          selectedOptionIndex={knowledgeState.selectedOptionIndex}
          lastAnsweredCorrectly={knowledgeState.lastAnsweredCorrectly}
          onSubmit={handleActivitySubmit}
          onAskTutor={onAskTutor}
        />
      )}

      {activity.type === "statevector" && (
        <MultipleChoiceActivity
          question={`${activity.question}\n\n**Expression**: $${activity.expression}$`}
          options={activity.options}
          correctIndex={activity.correctIndex}
          explanation={activity.explanation}
          circuit={activity.circuit}
          selectedOptionIndex={knowledgeState.selectedOptionIndex}
          lastAnsweredCorrectly={knowledgeState.lastAnsweredCorrectly}
          onSubmit={handleActivitySubmit}
          onAskTutor={onAskTutor}
        />
      )}

      {activity.type === "code-completion" && (
        <CodeCompletionActivity
          question={activity.question}
          starterCode={activity.starterCode}
          expectedAnswer={activity.expectedAnswer}
          options={activity.options}
          correctIndex={activity.correctIndex}
          explanation={activity.explanation}
          selectedOptionIndex={knowledgeState.selectedOptionIndex}
          lastAnsweredCorrectly={knowledgeState.lastAnsweredCorrectly}
          onSubmit={handleActivitySubmit}
          onAskTutor={onAskTutor}
        />
      )}

      {/* 2-Stage Progressive Hint Engine (Requirement 6) */}
      <div className="rounded-xl border border-line/50 bg-[#0e1017] p-4 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-txt-dim flex items-center gap-1.5">
            <span>💡</span> Socratic Hint Progression
          </span>
          <div className="flex items-center gap-2">
            {hints.length >= 1 && (
              <button
                type="button"
                onClick={() => handleUnlockHint(1)}
                className={`px-3 py-1 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${
                  activeHintLevel >= 1
                    ? "border-quantum-cyan/40 bg-quantum-cyan/15 text-quantum-cyan font-bold"
                    : "border-line/60 bg-[#141724] text-txt-dim hover:text-white"
                }`}
              >
                Hint 1 {activeHintLevel >= 1 ? "✓" : "🔓"}
              </button>
            )}

            {hints.length >= 2 && (
              <button
                type="button"
                onClick={() => handleUnlockHint(2)}
                className={`px-3 py-1 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${
                  activeHintLevel >= 2
                    ? "border-quantum-cyan/40 bg-quantum-cyan/15 text-quantum-cyan font-bold"
                    : "border-line/60 bg-[#141724] text-txt-dim hover:text-white"
                }`}
              >
                Hint 2 {activeHintLevel >= 2 ? "✓" : "🔓"}
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowFullExplanation((prev) => !prev)}
              className="text-[11px] font-mono text-txt-dim hover:text-white underline cursor-pointer"
            >
              {showFullExplanation ? "Hide Explanation" : "Reveal Explanation"}
            </button>
          </div>
        </div>

        {/* Unlocked Hint 1 */}
        {activeHintLevel >= 1 && hints[0] && (
          <div className="rounded-lg border border-quantum-cyan/25 bg-quantum-cyan/[0.04] p-3 text-xs font-mono text-txt leading-relaxed animate-fade-in">
            <span className="font-bold text-quantum-cyan block mb-1">
              💡 Hint 1 (Guiding Intuition):
            </span>
            <MathMarkdown content={hints[0]} />
          </div>
        )}

        {/* Unlocked Hint 2 */}
        {activeHintLevel >= 2 && hints[1] && (
          <div className="rounded-lg border border-accent-blue/30 bg-accent-blue/[0.05] p-3 text-xs font-mono text-txt leading-relaxed animate-fade-in">
            <span className="font-bold text-accent-blue block mb-1">
              💡 Hint 2 (Technical Mechanism):
            </span>
            <MathMarkdown content={hints[1]} />
          </div>
        )}

        {/* Unlocked Full Explanation */}
        {showFullExplanation && (
          <div className="rounded-lg border border-ok/30 bg-[#0e1a14] p-3 text-xs font-mono text-txt leading-relaxed animate-fade-in">
            <span className="font-bold text-ok block mb-1">
              🔍 Complete Mathematical Solution:
            </span>
            <MathMarkdown content={activity.explanation} />
          </div>
        )}
      </div>
    </div>
  );
}
