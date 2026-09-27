import React, { useState, useEffect, useCallback } from "react";
import { Card, Badge, Button, cx } from "./ui";
import MathMarkdown from "./MathMarkdown";
import {
  type MissionActivity,
  type ActivityType,
  type ActivityStatus,
  type ActivityOption,
} from "../lib/data";

export interface MissionActivityCardProps {
  activity: MissionActivity;
  levelSlug: string;
  onRunWhatIf?: (query: string) => void;
  onOpenStudio?: () => void;
  compact?: boolean;
  className?: string;
  onCompletedChange?: (activityId: string, completed: boolean) => void;
}

const TYPE_CONFIG: Record<
  ActivityType,
  { label: string; icon: string; tone: "cyan" | "violet" | "blue" | "warn" | "ok"; border: string; bg: string }
> = {
  PREDICT: {
    label: "PREDICT",
    icon: "🧠",
    tone: "cyan",
    border: "border-quantum-cyan/40",
    bg: "bg-quantum-cyan/10",
  },
  EXPERIMENT: {
    label: "EXPERIMENT",
    icon: "🔬",
    tone: "violet",
    border: "border-quantum-purple/40",
    bg: "bg-quantum-purple/10",
  },
  IDENTIFY: {
    label: "IDENTIFY",
    icon: "🔍",
    tone: "blue",
    border: "border-quantum-blue/40",
    bg: "bg-quantum-blue/10",
  },
  DEBUG: {
    label: "DEBUG",
    icon: "🐛",
    tone: "warn",
    border: "border-warn/40",
    bg: "bg-warn/10",
  },
  BUILD: {
    label: "BUILD",
    icon: "🛠️",
    tone: "ok",
    border: "border-ok/40",
    bg: "bg-ok/10",
  },
};

interface StoredActivityState {
  status: ActivityStatus;
  selectedId: string | null;
  attempts: number;
  reflectionAnswered?: boolean;
}

export default function MissionActivityCard({
  activity,
  levelSlug,
  onRunWhatIf,
  onOpenStudio,
  compact = false,
  className = "",
  onCompletedChange,
}: MissionActivityCardProps) {
  const storageKey = `qubitlab_act_${levelSlug}_${activity.id}`;

  const [status, setStatus] = useState<ActivityStatus>("NOT_STARTED");
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [reflectionSelected, setReflectionSelected] = useState<string | null>(null);
  const [reflectionSubmitted, setReflectionSubmitted] = useState<boolean>(false);

  // Load from localStorage on mount or activity change
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed: StoredActivityState = JSON.parse(saved);
        setStatus(parsed.status ?? "NOT_STARTED");
        setSelectedOptionId(parsed.selectedId ?? null);
        setAttempts(parsed.attempts ?? 0);
        if (parsed.reflectionAnswered) setReflectionSubmitted(true);
        if (parsed.status === "COMPLETED" || parsed.status === "CORRECT") {
          onCompletedChange?.(activity.id, true);
        }
      } else {
        setStatus("NOT_STARTED");
        setSelectedOptionId(null);
        setAttempts(0);
        setShowHint(false);
        setReflectionSelected(null);
        setReflectionSubmitted(false);
      }
    } catch {
      // Fallback if localStorage is unavailable
    }
  }, [storageKey, activity.id]);

  // Persist state updates
  const saveState = useCallback(
    (newStatus: ActivityStatus, newSelectedId: string | null, newAttempts: number, reflDone?: boolean) => {
      try {
        const payload: StoredActivityState = {
          status: newStatus,
          selectedId: newSelectedId,
          attempts: newAttempts,
          reflectionAnswered: reflDone ?? reflectionSubmitted,
        };
        localStorage.setItem(storageKey, JSON.stringify(payload));
      } catch {
        // Local storage full or private mode
      }
    },
    [storageKey, reflectionSubmitted]
  );

  const selectedOption = activity.options.find((o) => o.id === selectedOptionId);
  const isCorrect = selectedOption?.isCorrect ?? false;

  const handleSelect = (optId: string) => {
    if (status === "CORRECT" || status === "COMPLETED") return; // Keep locked if already completed
    setSelectedOptionId(optId);
    if (status === "INCORRECT") {
      setStatus("IN_PROGRESS");
    }
  };

  const handleCheck = () => {
    if (!selectedOptionId) return;
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (isCorrect) {
      setStatus("CORRECT");
      saveState("CORRECT", selectedOptionId, newAttempts);
      onCompletedChange?.(activity.id, true);
    } else {
      setStatus("INCORRECT");
      saveState("INCORRECT", selectedOptionId, newAttempts);
      onCompletedChange?.(activity.id, false);
    }
  };

  const handleRetry = () => {
    setStatus("IN_PROGRESS");
    setSelectedOptionId(null);
    saveState("IN_PROGRESS", null, attempts);
  };

  const cfg = TYPE_CONFIG[activity.type] ?? TYPE_CONFIG.PREDICT;

  return (
    <Card
      className={cx(
        "relative overflow-hidden transition-all duration-300 border backdrop-blur-md shadow-sm",
        status === "CORRECT" || status === "COMPLETED"
          ? "border-ok/40 bg-ok/[0.04]"
          : status === "INCORRECT"
          ? "border-danger/40 bg-danger/[0.03]"
          : `${cfg.border} bg-ink-900/80`,
        compact ? "p-3 rounded-xl" : "p-5 rounded-2xl shadow-lg",
        className
      )}
    >
      {/* Header bar with Activity Badge and Title */}
      <div className={cx("flex items-center justify-between gap-2 border-b border-line/50", compact ? "pb-2" : "pb-2.5")}>
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={cx(
              "inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[11px] font-bold border tracking-wider",
              cfg.bg,
              cfg.border,
              status === "CORRECT" ? "text-ok" : "text-txt"
            )}
          >
            <span>{cfg.icon}</span>
            <span>{cfg.label}</span>
          </span>
          <h4 className={cx("font-display font-bold text-txt truncate", compact ? "text-[13px]" : "text-[14px]")}>
            {activity.title}
          </h4>
        </div>

        {/* Status Indicator */}
        <div className="shrink-0 flex items-center gap-1.5 font-mono text-[11px]">
          {status === "CORRECT" || status === "COMPLETED" ? (
            <span className="flex items-center gap-1 text-ok font-bold">
              <span>✓</span>
              <span>Solved</span>
            </span>
          ) : status === "INCORRECT" ? (
            <span className="flex items-center gap-1 text-danger font-semibold">
              <span>✗</span>
              <span>Try Again</span>
            </span>
          ) : (
            <span className="text-txt-faint">
              {attempts > 0 ? `${attempts} attempts` : "Active"}
            </span>
          )}
        </div>
      </div>

      {/* Optional Context Code Block (e.g. Circuit snippet) */}
      {activity.contextCode && (
        <div className={cx("rounded-lg border border-line/70 bg-ink-950/80 font-mono text-quantum-cyan overflow-x-auto shadow-inner", compact ? "mt-2 p-2 text-[11px]" : "mt-3 p-3 text-[12px]")}>
          <div className="text-[10px] uppercase font-bold text-txt-faint mb-1">
            CIRCUIT SCHEMATIC
          </div>
          <pre className="leading-tight">{activity.contextCode}</pre>
        </div>
      )}

      {/* Main Activity Prompt */}
      <div className={cx("leading-relaxed text-txt font-medium", compact ? "mt-2 text-[13px] leading-snug" : "mt-3 text-[14px]")}>
        <MathMarkdown content={activity.prompt} />
      </div>

      {/* Multiple Choice Options */}
      <fieldset className={cx("space-y-2", compact ? "mt-2 space-y-1.5" : "mt-3 space-y-2")} role="radiogroup" aria-label={activity.title}>
        <legend className="sr-only">{activity.title} Options</legend>
        {activity.options.map((opt) => {
          const isSelected = selectedOptionId === opt.id;
          const isSolved = status === "CORRECT" || status === "COMPLETED";
          const isWrongSelection = status === "INCORRECT" && isSelected;

          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={isSolved}
              onClick={() => handleSelect(opt.id)}
              className={cx(
                "w-full text-left flex items-start border transition-all cursor-pointer select-none",
                compact ? "p-2 gap-2.5 rounded-lg text-[12px]" : "p-3 gap-3 rounded-xl text-[13px]",
                "focus:outline-none focus:ring-2 focus:ring-quantum-cyan/50 focus:ring-offset-1 focus:ring-offset-ink-950",
                isSelected && !isSolved && !isWrongSelection
                  ? "border-quantum-cyan/80 bg-quantum-cyan/15 text-txt shadow-sm"
                  : isSolved && opt.isCorrect
                  ? "border-ok/60 bg-ok/15 text-ok font-semibold"
                  : isWrongSelection
                  ? "border-danger/60 bg-danger/15 text-danger"
                  : "border-line/60 bg-ink-950/50 text-txt-dim hover:border-line hover:text-txt hover:bg-ink-850"
              )}
            >
              {/* Radio Indicator Pill */}
              <span
                className={cx(
                  "grid shrink-0 place-items-center rounded-full border font-bold font-mono transition-colors",
                  compact ? "mt-0.5 h-4 w-4 text-[9px]" : "mt-0.5 h-4.5 w-4.5 text-[10px]",
                  isSelected && !isSolved && !isWrongSelection
                    ? "border-quantum-cyan bg-quantum-cyan text-ink-950"
                    : isSolved && opt.isCorrect
                    ? "border-ok bg-ok text-ink-950"
                    : isWrongSelection
                    ? "border-danger bg-danger text-ink-950"
                    : "border-line text-txt-faint"
                )}
              >
                {opt.id.toUpperCase()}
              </span>

              {/* Option Text with Math Rendering */}
              <div className="flex-1 leading-snug">
                <MathMarkdown content={opt.label} />
              </div>
            </button>
          );
        })}
      </fieldset>

      {/* Progressive Hint Drawer */}
      {activity.hint && (
        <div className={compact ? "mt-1.5" : "mt-2.5"}>
          {!showHint && status !== "CORRECT" && (
            <button
              type="button"
              onClick={() => setShowHint(true)}
              className="text-[11px] font-mono text-txt-faint hover:text-warn transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>💡</span>
              <span>Need a hint?</span>
            </button>
          )}
          {showHint && (
            <div className="rounded-lg border border-warn/30 bg-warn/[0.06] p-2 text-[12px] text-txt-dim animate-rise">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase font-bold text-warn mb-1">
                <span>💡 HINT</span>
                <button
                  type="button"
                  onClick={() => setShowHint(false)}
                  className="hover:text-txt cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <MathMarkdown content={activity.hint} />
            </div>
          )}
        </div>
      )}

      {/* Action Bar (Check / Retry / What-If / Studio CTA) */}
      <div className={cx("flex flex-wrap items-center justify-between gap-2 border-t border-line/40", compact ? "mt-2.5 pt-2" : "mt-4 pt-2")}>
        {status !== "CORRECT" && status !== "COMPLETED" ? (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              disabled={!selectedOptionId}
              onClick={handleCheck}
              className="font-mono text-[12px] glow-cyan shadow-sm h-7.5 px-3"
            >
              {activity.type === "PREDICT" ? "Check Prediction" : "Check Answer"}
            </Button>

            {status === "INCORRECT" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="font-mono text-[12px] h-7.5 px-2.5"
              >
                Try Again ↺
              </Button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Badge tone="ok" className="font-mono text-[11px]">
              ✓ Verified Correct
            </Badge>
          </div>
        )}

        {/* Experiment / What-If Studio Action */}
        {activity.whatIfQuery && onRunWhatIf && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRunWhatIf(activity.whatIfQuery!)}
            className="font-mono text-[11px] text-quantum-purple border-quantum-purple/40 hover:bg-quantum-purple/15 flex items-center gap-1.5 shadow-sm h-7.5 px-2.5"
          >
            <span>🔬</span>
            <span>Run What-If</span>
          </Button>
        )}

        {/* Optional Studio Jump Button */}
        {onOpenStudio && (status === "CORRECT" || status === "COMPLETED") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenStudio}
            className="font-mono text-[12px] text-quantum-cyan hover:text-quantum-cyan hover:bg-quantum-cyan/10 flex items-center gap-1 h-7.5 px-2.5"
          >
            <span>Build in Studio</span>
            <span>→</span>
          </Button>
        )}
      </div>

      {/* Detailed Feedback & Educational Explanation */}
      {status === "CORRECT" && (
        <div className={cx("rounded-lg border border-ok/30 bg-ok/[0.08] text-ok animate-rise", compact ? "mt-2 p-2.5 text-[12px] space-y-0.5" : "mt-3 p-3 text-[13px] space-y-1")}>
          <div className="font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
            <span>✓</span> Nice reasoning!
          </div>
          <div className="text-txt text-[12px] leading-relaxed">
            <MathMarkdown content={activity.explanation} />
          </div>
        </div>
      )}

      {status === "INCORRECT" && (
        <div className={cx("rounded-lg border border-danger/30 bg-danger/[0.08] text-danger animate-rise", compact ? "mt-2 p-2.5 text-[12px] space-y-0.5" : "mt-3 p-3 text-[13px] space-y-1")}>
          <div className="font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
            <span>✗</span> Not quite.
          </div>
          <div className="text-txt-dim text-[12px] leading-relaxed">
            {selectedOption?.explanation ||
              "Think about the quantum state transformations and try your prediction again."}
          </div>
        </div>
      )}

      {/* Post-Experiment Reflection Question (if configured) */}
      {activity.reflectionPrompt && (status === "CORRECT" || status === "COMPLETED") && (
        <div className={cx("rounded-xl border border-quantum-purple/30 bg-quantum-purple/[0.05] animate-rise", compact ? "mt-2 p-2 text-[11px] space-y-1" : "mt-3 p-3 text-[12px] space-y-2")}>
          <div className="font-mono text-[11px] font-bold text-quantum-purple uppercase flex items-center gap-1">
            <span>🤔</span> Post-Experiment Reflection
          </div>
          <p className="text-txt text-[12px] leading-relaxed">
            {activity.reflectionPrompt}
          </p>
          {!reflectionSubmitted ? (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {["Yes, altered statistics", "No change", "Inconclusive"].map((ans) => (
                <button
                  key={ans}
                  type="button"
                  onClick={() => {
                    setReflectionSelected(ans);
                    setReflectionSubmitted(true);
                    saveState(status, selectedOptionId, attempts, true);
                  }}
                  className="rounded-md border border-line/60 bg-ink-950 px-2 py-0.5 text-[11px] font-mono hover:border-quantum-purple/50 text-txt-dim hover:text-txt transition-colors cursor-pointer"
                >
                  {ans}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-[11px] font-mono text-ok flex items-center gap-1 pt-0.5">
              <span>✓</span> Reflection noted: {reflectionSelected}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
