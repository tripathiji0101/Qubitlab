import React, { useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router";
import { Badge, Button, cx } from "../ui";
import { Level, difficultyTone } from "../../lib/data";
import {
  CurriculumPhase as PhaseType,
  ProjectCurriculum,
  getProjectCurriculum,
} from "../../lib/curriculumData";
import {
  PhaseKnowledgeState,
  getPhaseKnowledgeState,
  savePhaseKnowledgeState,
} from "../../lib/curriculumActivities";
import CurriculumPhase from "./CurriculumPhase";

export interface CurriculumModalProps {
  isOpen: boolean;
  onClose: () => void;
  level: Level;
  initialPhaseOrder?: number;
}

export default function CurriculumModal({
  isOpen,
  onClose,
  level,
  initialPhaseOrder = 1,
}: CurriculumModalProps) {
  const navigate = useNavigate();

  // Retrieve rich curriculum data for this project
  const curriculum: ProjectCurriculum | undefined = useMemo(() => {
    return getProjectCurriculum(level.slug);
  }, [level.slug]);

  // Current view: "syllabus" overview or detailed "lesson"
  const [activeView, setActiveView] = useState<"syllabus" | "lesson">("syllabus");
  const [selectedPhaseOrder, setSelectedPhaseOrder] = useState<number>(initialPhaseOrder);

  // Track completed phases in localStorage
  const storageKey = `qubitlab_curriculum_${level.slug}`;
  const [completedPhases, setCompletedPhases] = useState<Record<number, boolean>>({});

  // Local knowledge state cache per phase order
  const [knowledgeMap, setKnowledgeMap] = useState<Record<number, PhaseKnowledgeState>>({});

  // Initialize and load saved completion & knowledge state
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setCompletedPhases(JSON.parse(saved));
      } else {
        setCompletedPhases({});
      }
    } catch {
      setCompletedPhases({});
    }

    // Load knowledge states
    const kMap: Record<number, PhaseKnowledgeState> = {};
    for (let o = 1; o <= 12; o++) {
      kMap[o] = getPhaseKnowledgeState(level.slug, o);
    }
    setKnowledgeMap(kMap);
  }, [storageKey, level.slug]);

  // Update selected phase if initialPhaseOrder changes
  useEffect(() => {
    if (initialPhaseOrder) {
      setSelectedPhaseOrder(initialPhaseOrder);
    }
  }, [initialPhaseOrder]);

  // Handle body scroll locking and Escape key
  useEffect(() => {
    if (!isOpen) return;

    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Escape listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const phases = curriculum?.phases ?? [];
  const currentPhase: PhaseType | undefined = useMemo(() => {
    return phases.find((p) => p.order === selectedPhaseOrder) || phases[0];
  }, [phases, selectedPhaseOrder]);

  // Toggle completion for a phase
  const togglePhaseCompletion = useCallback(
    (order: number, e?: React.MouseEvent) => {
      e?.stopPropagation();
      setCompletedPhases((prev) => {
        const nextVal = !prev[order];
        const updated = { ...prev, [order]: nextVal };
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch {}
        return updated;
      });
    },
    [storageKey]
  );

  // Update knowledge state for a phase
  const handleUpdateKnowledgeState = useCallback(
    (order: number, update: Partial<PhaseKnowledgeState>) => {
      const updated = savePhaseKnowledgeState(level.slug, order, update);
      setKnowledgeMap((prev) => ({
        ...prev,
        [order]: updated,
      }));

      // If completed, automatically mark phase complete
      if (updated.completed && !completedPhases[order]) {
        togglePhaseCompletion(order);
      }
    },
    [level.slug, completedPhases, togglePhaseCompletion]
  );

  const completedCount = useMemo(() => {
    return Object.values(completedPhases).filter(Boolean).length;
  }, [completedPhases]);

  const progressPercent =
    phases.length > 0 ? Math.round((completedCount / phases.length) * 100) : 0;

  // Navigate to Tutor in Workspace with pre-loaded prompt
  const handleAskTutor = (prompt: string) => {
    onClose();
    navigate(
      `/workspace?level=${level.slug}&phase=${encodeURIComponent(
        `Phase ${selectedPhaseOrder}: ${currentPhase?.title || ""}`
      )}&tutorPrompt=${encodeURIComponent(prompt)}`
    );
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${level.title} Curriculum`}
    >
      <div
        className="relative flex flex-col w-full max-w-4xl h-[92vh] max-h-[880px] rounded-2xl border border-line/70 bg-[#0e0f15] text-txt shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <header className="flex flex-col border-b border-line/60 bg-[#12131a] px-4 sm:px-5 py-3.5 sm:py-4 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[11px] font-bold uppercase text-quantum-cyan px-2 py-0.5 rounded bg-quantum-cyan/10 border border-quantum-cyan/25">
                  Mission {String(level.n).padStart(2, "0")} Mini-Course
                </span>
                <Badge tone={difficultyTone[level.difficulty] ?? "neutral"}>
                  {level.difficulty}
                </Badge>
                <span className="text-[12px] font-mono text-txt-dim hidden sm:inline">
                  {level.algorithm}
                </span>
              </div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-txt truncate">
                {level.title} — Interactive Curriculum
              </h2>
            </div>

            {/* View Switcher & Close button */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center bg-[#171822] p-1 rounded-lg border border-line/60">
                <button
                  type="button"
                  onClick={() => setActiveView("syllabus")}
                  className={cx(
                    "px-3 py-1 rounded text-[12px] font-mono font-medium transition-colors cursor-pointer",
                    activeView === "syllabus"
                      ? "bg-quantum-cyan/20 text-quantum-cyan border border-quantum-cyan/30"
                      : "text-txt-dim hover:text-white"
                  )}
                >
                  📋 Syllabus
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView("lesson")}
                  className={cx(
                    "px-3 py-1 rounded text-[12px] font-mono font-medium transition-colors cursor-pointer",
                    activeView === "lesson"
                      ? "bg-quantum-cyan/20 text-quantum-cyan border border-quantum-cyan/30"
                      : "text-txt-dim hover:text-white"
                  )}
                >
                  📖 Lesson
                </button>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="grid h-8 w-8 place-items-center rounded-lg border border-line/60 bg-[#161722] text-txt-dim hover:text-white hover:border-line text-sm cursor-pointer transition-colors"
                aria-label="Close curriculum modal"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 flex items-center justify-between gap-4 text-[11px] font-mono text-txt-dim">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="w-full bg-[#1b1d28] rounded-full h-1.5 overflow-hidden border border-line/40">
                <div
                  className="bg-gradient-to-r from-quantum-cyan to-quantum-blue h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="shrink-0 text-quantum-cyan font-bold">{progressPercent}%</span>
            </div>
            <span>
              {completedCount} of {phases.length} Phases Mastered
            </span>
          </div>
        </header>

        {/* Modal Body */}
        <div className="flex-1 min-h-0 overflow-y-auto bg-[#0e0f15] p-3 sm:p-5 md:p-6 space-y-6">
          {activeView === "syllabus" ? (
            /* ----------------- SYLLABUS OVERVIEW ----------------- */
            <div className="space-y-5">
              {/* Mission Curriculum Overview Card */}
              {curriculum?.overview && (
                <div className="rounded-xl border border-quantum-cyan/25 bg-quantum-cyan/[0.03] p-4 sm:p-5">
                  <div className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase text-quantum-cyan">
                    <span>⚡ Course Syllabus & Interactive Roadmap</span>
                  </div>
                  <p className="mt-2 text-[13px] text-txt leading-relaxed">
                    {curriculum.overview}
                  </p>
                  <div className="mt-3 flex items-center gap-4 text-[12px] font-mono text-txt-dim flex-wrap">
                    <span>⏱ Total Duration: {curriculum.totalDuration}</span>
                    <span>•</span>
                    <span className="text-ok">🏆 Total XP: +{level.xp} XP</span>
                    <span>•</span>
                    <span>📚 {phases.length} Step-by-Step Learning Phases</span>
                  </div>
                </div>
              )}

              {/* List of 12 Phases */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[12px] font-mono text-txt-dim border-b border-line/40 pb-2">
                  <span>12 INTERACTIVE PHASES</span>
                  <span>CLICK TO OPEN LESSON</span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {phases.map((phase) => {
                    const isCompleted = Boolean(completedPhases[phase.order]);
                    const isCurrent = currentPhase?.order === phase.order;
                    const kState = knowledgeMap[phase.order];
                    const hasPassedCheckpoint = kState?.checkpointPassed;

                    return (
                      <div
                        key={phase.id}
                        onClick={() => {
                          setSelectedPhaseOrder(phase.order);
                          setActiveView("lesson");
                        }}
                        className={cx(
                          "group relative flex items-start justify-between gap-4 rounded-xl border p-3.5 sm:p-4 transition-all cursor-pointer select-none",
                          isCompleted
                            ? "border-ok/30 bg-[#101915] hover:border-ok/60"
                            : isCurrent
                            ? "border-quantum-cyan/50 bg-[#131e28] shadow-[0_0_15px_rgba(0,229,255,0.08)]"
                            : "border-line/60 bg-[#13141d] hover:border-line hover:bg-[#181925]"
                        )}
                      >
                        <div className="flex items-start gap-3.5 min-w-0">
                          {/* Checkbox */}
                          <button
                            type="button"
                            onClick={(e) => togglePhaseCompletion(phase.order, e)}
                            className={cx(
                              "mt-0.5 grid h-5 w-5 place-items-center rounded border transition-colors shrink-0 cursor-pointer",
                              isCompleted
                                ? "border-ok bg-ok text-black font-bold text-xs"
                                : "border-line bg-[#1c1d29] hover:border-quantum-cyan text-transparent"
                            )}
                            title={isCompleted ? "Mark incomplete" : "Mark complete"}
                            aria-label={`Mark phase ${phase.order} complete`}
                          >
                            ✓
                          </button>

                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-quantum-cyan/15 text-quantum-cyan border border-quantum-cyan/25">
                                Phase {String(phase.order).padStart(2, "0")}
                              </span>
                              {phase.checkpoint && (
                                <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded border ${
                                  hasPassedCheckpoint
                                    ? "bg-ok/15 text-ok border-ok/30"
                                    : "bg-quantum-gold/15 text-quantum-gold border-quantum-gold/30"
                                }`}>
                                  🏁 Checkpoint {hasPassedCheckpoint ? "✓" : ""}
                                </span>
                              )}
                              <h3 className="font-display text-[14px] font-bold text-txt group-hover:text-quantum-cyan transition-colors truncate">
                                {phase.title}
                              </h3>
                            </div>
                            <p className="text-[12px] text-txt-dim line-clamp-2 leading-relaxed">
                              {phase.objective}
                            </p>
                          </div>
                        </div>

                        {/* Metadata & Open Lesson button */}
                        <div className="flex items-center gap-3 shrink-0 font-mono text-[11px]">
                          <span className="text-txt-faint hidden sm:inline">⏱ {phase.duration}</span>
                          <span className="text-quantum-cyan font-semibold">+{phase.xp_reward} XP</span>
                          <span className="rounded bg-[#1a1b26] px-2.5 py-1 text-[11px] font-medium text-txt-dim group-hover:text-white group-hover:bg-quantum-cyan/20 group-hover:text-quantum-cyan transition-all border border-line/40">
                            Open Lesson →
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* ----------------- INTERACTIVE LESSON VIEW ----------------- */
            currentPhase && (
              <div className="space-y-4">
                {/* Lesson Navigation Header */}
                <div className="flex items-center justify-between border-b border-line/50 pb-3 gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setActiveView("syllabus")}
                      className="px-2.5 py-1 rounded-md border border-line/60 bg-[#161722] text-[12px] font-mono text-txt-dim hover:text-white transition-colors cursor-pointer"
                    >
                      ← Syllabus
                    </button>
                    <select
                      value={selectedPhaseOrder}
                      onChange={(e) => setSelectedPhaseOrder(Number(e.target.value))}
                      className="rounded-md border border-line/60 bg-[#161722] px-3 py-1 text-[12px] font-mono text-txt outline-none focus:border-quantum-cyan cursor-pointer max-w-[200px] sm:max-w-xs truncate"
                    >
                      {phases.map((p) => (
                        <option key={p.id} value={p.order}>
                          Phase {String(p.order).padStart(2, "0")} · {p.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={currentPhase.order <= 1}
                      onClick={() => setSelectedPhaseOrder((prev) => Math.max(1, prev - 1))}
                      className="px-2.5 py-1 rounded-md border border-line/60 bg-[#161722] text-[12px] font-mono text-txt-dim hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      ← Prev
                    </button>
                    <button
                      type="button"
                      disabled={currentPhase.order >= phases.length}
                      onClick={() => setSelectedPhaseOrder((prev) => Math.min(phases.length, prev + 1))}
                      className="px-2.5 py-1 rounded-md border border-line/60 bg-[#161722] text-[12px] font-mono text-quantum-cyan hover:bg-quantum-cyan/10 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Next →
                    </button>
                  </div>
                </div>

                {/* Render complete 15-part pedagogical phase */}
                <CurriculumPhase
                  phase={currentPhase}
                  totalPhases={phases.length}
                  knowledgeState={knowledgeMap[currentPhase.order] || {
                    started: false,
                    completed: false,
                    activityAttempts: 0,
                    correctAttempts: 0,
                    checkpointPassed: false,
                    hintsUsed: 0,
                  }}
                  onUpdateKnowledgeState={(update) =>
                    handleUpdateKnowledgeState(currentPhase.order, update)
                  }
                  onToggleMastery={togglePhaseCompletion}
                  isMastered={Boolean(completedPhases[currentPhase.order])}
                  onNavigatePrev={() => setSelectedPhaseOrder((prev) => Math.max(1, prev - 1))}
                  onNavigateNext={() => {
                    if (currentPhase.order < phases.length) {
                      setSelectedPhaseOrder(currentPhase.order + 1);
                    } else {
                      setActiveView("syllabus");
                    }
                  }}
                  onAskTutor={handleAskTutor}
                />
              </div>
            )
          )}
        </div>

        {/* Modal Footer */}
        <footer className="flex items-center justify-between border-t border-line/60 px-4 sm:px-5 py-3.5 bg-[#12131a] shrink-0">
          <div className="text-[12px] font-mono text-txt-dim truncate mr-2">
            {activeView === "lesson" && currentPhase ? (
              <span>
                Viewing Phase {currentPhase.order} of {phases.length}
              </span>
            ) : (
              <span>Syllabus: {phases.length} Total Phases</span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              size="sm"
              className="font-mono text-[12px] glow-cyan cursor-pointer"
              onClick={() => {
                onClose();
                navigate(`/workspace?level=${level.slug}`);
              }}
            >
              Enter Quantum Studio 🚀
            </Button>
          </div>
        </footer>
      </div>
    </div>,
    document.body
  );
}
