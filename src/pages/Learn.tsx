import { Link } from "react-router";
import { useState, useEffect } from "react";
import { Card, Badge, Progress, cx, Button } from "../components/ui";
import { Count, Reveal } from "../components/motion";
import { levels as defaultLevels, difficultyTone, Level } from "../lib/data";
import { QuantumLevelVisual } from "../components/QuantumVisuals";
import { learning } from "../lib/api";

export default function Learn() {
  const [levelList, setLevelList] = useState<Level[]>(defaultLevels);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function fetchLevels() {
      try {
        setLoading(true);
        const apiLevels = await learning.levels();
        if (mounted && apiLevels && apiLevels.length > 0) {
          // Merge API progress into defaultLevels metadata
          setLevelList((prev) =>
            prev.map((l) => {
              const apiMatch = apiLevels.find((a) => a.n === l.n || a.slug === l.slug);
              if (apiMatch) {
                return {
                  ...l,
                  status: (apiMatch.status as Level["status"]) ?? l.status,
                  progress: typeof apiMatch.progress === "number" ? Math.round(apiMatch.progress) : l.progress,
                };
              }
              return l;
            })
          );
        }
      } catch {
        // Fallback gracefully to client state
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchLevels();
    return () => {
      mounted = false;
    };
  }, []);

  const completed = levelList.filter((l) => l.status === "completed").length;
  const totalXp = levelList.reduce((s, l) => s + Math.round((l.progress / 100) * l.xp), 0);
  const overall = Math.round(levelList.reduce((s, l) => s + l.progress, 0) / levelList.length);

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-10 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-6 animate-rise">
        <div>
          <div className="flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.2em] text-quantum-cyan">
            <span className="h-2 w-2 rounded-full bg-quantum-cyan animate-pulse" />
            Quantum Learning Journey
          </div>
          <h1 className="mt-2 font-display text-3xl font-800 tracking-tight md:text-4xl text-txt">
            Mission Progression Path
          </h1>
          <p className="mt-2 text-base text-txt-dim max-w-xl leading-relaxed">
            Master 12 progressive quantum computing missions — from single-qubit fundamentals and quantum key distribution to Shor's algorithm and HHL quantum linear solvers.
          </p>
        </div>

        <Card className="flex items-center gap-6 p-4 border-line/80 bg-ink-900/60 backdrop-blur-md shadow-lg">
          <div className="text-center">
            <div className="font-display text-2xl font-800 text-txt">
              <Count to={completed} />/{levelList.length}
            </div>
            <div className="text-[11px] font-mono text-txt-faint uppercase">Missions Done</div>
          </div>
          <div className="h-8 w-px bg-line" />
          <div className="text-center">
            <div className="font-display text-2xl font-800 text-quantum-cyan">
              <Count to={totalXp} />
            </div>
            <div className="text-[11px] font-mono text-txt-faint uppercase">XP Earned</div>
          </div>
          <div className="h-8 w-px bg-line" />
          <div className="min-w-[130px]">
            <div className="mb-1 flex justify-between text-[11px] font-mono text-txt-faint">
              <span>Overall Progress</span>
              <span className="text-quantum-cyan font-bold">{overall}%</span>
            </div>
            <Progress value={overall} tone="violet" />
          </div>
        </Card>
      </div>

      <div className="relative mt-12">
        {/* Connecting Quantum Spine */}
        <div
          className="absolute left-[27px] top-6 bottom-6 hidden w-px bg-[linear-gradient(to_bottom,#35e0d8,#4d7cfe_35%,#9b6bff_70%,#e05fce)] md:block opacity-60"
          aria-hidden="true"
        />

        <div className="space-y-6">
          {levelList.map((l) => {
            const locked = l.status === "locked";
            const active = l.status === "active";
            const isCompleted = l.status === "completed";

            return (
              <Reveal key={l.n} delay={Math.min(l.n * 50, 400)} className="relative md:pl-16">
                {/* Active Level Ping Indicator */}
                {active && (
                  <span
                    className="absolute left-0 top-6 hidden h-14 w-14 animate-ping rounded-xl bg-quantum-cyan/25 md:block"
                    aria-hidden="true"
                  />
                )}

                {/* Left Number / Lock Badge */}
                <div
                  className={cx(
                    "absolute left-0 top-6 z-10 hidden h-14 w-14 place-items-center rounded-xl border font-display text-lg font-700 shadow-md md:grid transition-all",
                    locked
                      ? "border-line-strong bg-ink-950 text-txt-faint opacity-60"
                      : isCompleted
                      ? "border-ok/60 bg-ok/15 text-ok glow-ok"
                      : active
                      ? "border-quantum-cyan bg-quantum-cyan/20 text-quantum-cyan glow-cyan ring-2 ring-quantum-cyan/40"
                      : "border-quantum-blue/40 bg-quantum-blue/10 text-txt"
                  )}
                  aria-label={locked ? `Level ${l.n} locked` : `Level ${l.n}`}
                >
                  {locked ? "🔒" : isCompleted ? "✓" : String(l.n).padStart(2, "0")}
                </div>

                <Card
                  className={cx(
                    "p-6 transition-all duration-300 border-line/70 bg-ink-900/40 backdrop-blur-sm",
                    !locked &&
                      "hover:-translate-y-1 hover:border-quantum-cyan/40 hover:shadow-[0_16px_40px_-20px_rgba(53,224,216,0.25)]",
                    active && "border-quantum-cyan/50 bg-quantum-cyan/[0.03]"
                  )}
                >
                  <div className="grid gap-6 lg:grid-cols-[1fr_260px] lg:items-center">
                    {/* Left: Metadata & Objectives */}
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={isCompleted ? "ok" : active ? "cyan" : "violet"}>
                          Level {String(l.n).padStart(2, "0")}
                        </Badge>
                        <span className="text-[13px] font-mono font-600 text-quantum-cyan">
                          {l.role}
                        </span>
                        <Badge tone={difficultyTone[l.difficulty]}>{l.difficulty}</Badge>
                        {isCompleted && (
                          <Badge tone="ok" className="flex items-center gap-1 font-mono text-[11px]">
                            <span>✓</span> Completed
                          </Badge>
                        )}
                        {active && (
                          <span className="rounded-md bg-quantum-cyan/15 px-2 py-0.5 text-[11px] font-mono font-700 text-quantum-cyan border border-quantum-cyan/30">
                            Active Mission
                          </span>
                        )}
                        {locked && <Badge tone="neutral">🔒 Locked</Badge>}
                      </div>

                      <h2 className="mt-3 font-display text-2xl font-700 text-txt tracking-tight flex items-center gap-3">
                        {l.title}
                        <span className="text-[13px] font-mono font-normal text-txt-dim hidden sm:inline">
                          — {l.algorithm}
                        </span>
                      </h2>

                      <p className="mt-2 text-[14px] leading-relaxed text-txt-dim max-w-2xl">
                        {l.mission}
                      </p>

                      {/* Concept Tags */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {l.concepts.slice(0, 5).map((c) => (
                          <span
                            key={c}
                            className="rounded-md border border-line/60 bg-ink-850/80 px-2 py-0.5 text-[11px] font-mono text-txt-faint"
                          >
                            {c}
                          </span>
                        ))}
                      </div>

                      {/* Mission Meta Bar */}
                      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[12px] text-txt-faint pt-2 border-t border-line/40">
                        <span>
                          TIME · <span className="text-txt-dim">{l.duration}</span>
                        </span>
                        <span>
                          REWARD · <span className="text-quantum-cyan font-bold">+{l.xp} XP</span>
                        </span>
                        <span>
                          GATES · <span className="text-txt-dim">{l.gates.join(", ")}</span>
                        </span>
                        <span>
                          PREREQ ·{" "}
                          <span className="text-txt-dim">
                            {l.n === 1 ? "None" : `Level ${l.n - 1}`}
                          </span>
                        </span>
                      </div>

                      {/* Progress Bar for Unlocked */}
                      {!locked && (
                        <div className="mt-4 max-w-md">
                          <div className="mb-1 flex justify-between text-[11px] font-mono text-txt-faint">
                            <span>Mission Progress</span>
                            <span className="text-quantum-cyan font-bold">{l.progress}%</span>
                          </div>
                          <Progress
                            value={l.progress}
                            tone={isCompleted || active ? "cyan" : "violet"}
                          />
                        </div>
                      )}
                    </div>

                    {/* Right: Quantum Visual Schematic & CTA */}
                    <div className="flex flex-col gap-3">
                      <QuantumLevelVisual level={l} size="md" showBadge={true} />

                      {locked ? (
                        <Button variant="secondary" size="sm" disabled className="w-full opacity-60">
                          🔒 Level {l.n - 1} Required
                        </Button>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <Link to={`/learn/${l.slug}`} className="w-full">
                            <Button variant="outline" size="sm" className="w-full font-mono text-[12px]">
                              Briefing 📋
                            </Button>
                          </Link>
                          <Link to={`/workspace?level=${l.slug}`} className="w-full">
                            <Button
                              variant={active ? "primary" : "secondary"}
                              size="sm"
                              className="w-full font-mono text-[12px]"
                            >
                              {isCompleted ? "Replay ⚡" : "Launch 🚀"}
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </div>
    </div>
  );
}

