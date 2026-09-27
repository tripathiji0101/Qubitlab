import { Link, useParams, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { Card, Badge, Button, cx } from "../components/ui";
import { levels, difficultyTone, projectContent, getProjectLessons, getMissionActivities, LevelLesson } from "../lib/data";
import { gateColors, gateLabel } from "../components/quantum";
import { QuantumLevelVisual } from "../components/QuantumVisuals";
import { learning, ProjectDetailResponse } from "../lib/api";
import MissionActivityCard from "../components/MissionActivityCard";
import MathMarkdown from "../components/MathMarkdown";
import CurriculumModal from "../components/CurriculumModal";

export default function ProjectBriefing() {
  const { project } = useParams();
  const navigate = useNavigate();
  const [projectData, setProjectData] = useState<ProjectDetailResponse | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [isCurriculumModalOpen, setIsCurriculumModalOpen] = useState(false);
  const [highlightCurriculum, setHighlightCurriculum] = useState(false);

  // Match level by slug, or bb84/qkd alias, or level number
  const l =
    levels.find((x) => x.slug === project || (project === "qkd" && x.slug === "bb84")) ??
    levels.find((x) => String(x.n) === project) ??
    levels[0];

  const content = projectContent[l.slug] ?? projectContent[project ?? ""] ?? projectContent._default;

  // Load project details from backend if available
  useEffect(() => {
    let mounted = true;
    if (l.slug) {
      learning.project(l.slug)
        .then((data) => {
          if (mounted && data) setProjectData(data);
        })
        .catch(() => {
          // Graceful fallback to static data
        });
      // Also register mission started
      learning.startProject(l.slug).catch(() => {});
    }
    return () => {
      mounted = false;
    };
  }, [l.slug]);

  // Lessons: prioritize backend DB lessons if available, else use structured 10-lesson curriculum
  const rawLessons: LevelLesson[] =
    projectData?.lessons && projectData.lessons.length > 0
      ? projectData.lessons.map((dbL) => ({
          id: dbL.id,
          order: dbL.order,
          title: dbL.title,
          duration: `${dbL.duration_minutes} min`,
          xp_reward: dbL.xp_reward,
          description: dbL.content,
          completed: Boolean(dbL.completed),
          learningObjective: `Master the physical and mathematical mechanisms behind ${dbL.title}.`,
          explanation: dbL.content,
          relevantConcept: l.algorithm,
          expectedUnderstanding: `Synthesize the quantum principles taught in Phase ${dbL.order} and apply them to mission circuit construction.`,
        }))
      : getProjectLessons(l.slug, l.n, l.algorithm);

  const nextLevel = levels.find((x) => x.n === l.n + 1);
  const activities = getMissionActivities(l.slug);
  const [completedActivities, setCompletedActivities] = useState<Record<string, boolean>>({});

  // Sync initial completion status from localStorage
  useEffect(() => {
    const map: Record<string, boolean> = {};
    for (const act of activities) {
      try {
        const saved = localStorage.getItem(`qubitlab_act_${l.slug}_${act.id}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.status === "CORRECT" || parsed.status === "COMPLETED") {
            map[act.id] = true;
          }
        }
      } catch {}
    }
    setCompletedActivities(map);
  }, [l.slug, activities.length]);

  const completedActivityCount = Object.values(completedActivities).filter(Boolean).length;

  const openCurriculum = () => {
    setIsCurriculumModalOpen(true);
    if (selectedLesson === null && rawLessons.length > 0) {
      setSelectedLesson(rawLessons[0].order);
    }
  };

  const scrollToCurriculumSection = () => {
    setIsCurriculumModalOpen(false);
    setTimeout(() => {
      const el = document.getElementById("curriculum-section");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        setHighlightCurriculum(true);
        setTimeout(() => setHighlightCurriculum(false), 2500);
      }
    }, 100);
  };



  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-6 animate-rise">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-[13px] text-txt-dim">
        <Link to="/learn" className="hover:text-quantum-cyan transition-colors">
          ← Learning Path
        </Link>
        <span>/</span>
        <span className="text-txt font-mono">Mission {String(l.n).padStart(2, "0")}</span>
      </div>

      {/* Mission Hero Header */}
      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_360px] items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-quantum-cyan/15 px-2.5 py-0.5 font-mono text-[12px] font-700 text-quantum-cyan border border-quantum-cyan/30">
              MISSION {String(l.n).padStart(2, "0")}
            </span>
            <span className="text-[13px] font-mono font-600 text-txt-dim">
              Role: <span className="text-txt">{l.role}</span>
            </span>
            <Badge tone={difficultyTone[l.difficulty]}>{l.difficulty}</Badge>
            {l.status === "completed" && <Badge tone="ok">Completed ✓</Badge>}
          </div>

          <h1 className="mt-3 font-display text-3xl font-800 tracking-tight md:text-5xl text-txt">
            {l.title}
          </h1>
          <p className="mt-2 font-mono text-[14px] text-quantum-cyan flex items-center gap-2">
            <span>⚛ Algorithm:</span>
            <span className="text-txt font-bold">{l.algorithm}</span>
          </p>

          {/* Visual Hero Asset (Video or Scientific Schematic) */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-line/80 shadow-2xl">
            <QuantumLevelVisual level={l} size="lg" showBadge={true} />
          </div>

          {/* Core Briefing Content Sections */}
          <div className="mt-8 space-y-8">
            {/* Mission Objective Callout */}
            <section className="rounded-xl border border-quantum-cyan/30 bg-quantum-cyan/[0.04] p-5">
              <div className="flex items-center gap-2 text-quantum-cyan font-mono text-[12px] uppercase font-bold tracking-wider">
                <span>🎯</span> Mission Objective
              </div>
              <p className="mt-2 text-[15px] leading-relaxed text-txt font-medium">
                {l.mission}
              </p>
            </section>

            {/* Custom Structured Sections: Sections A through K */}
            {content.sections.map((s) => (
              <section key={s.t} className="space-y-3">
                <h2 className="font-display text-xl font-700 text-txt flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-quantum-cyan" />
                  {s.t}
                </h2>
                {"body" in s && s.body && (
                  <div className="leading-relaxed text-[15px] text-txt-dim space-y-2">
                    <MathMarkdown content={s.body(l)} />
                  </div>
                )}
                {"list" in s && s.list && (
                  <ul className="grid gap-2 sm:grid-cols-2 pt-1">
                    {s.list.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 rounded-lg border border-line/70 bg-ink-900/50 p-3 text-[13px] text-txt transition-colors hover:border-quantum-cyan/30"
                      >
                        <span className="mt-0.5 text-quantum-cyan font-bold">→</span>
                        <div className="flex-1 leading-relaxed">
                          <MathMarkdown content={item} />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            {/* Interactive Mission Challenges */}
            {activities.length > 0 && (
              <section className="space-y-4 rounded-2xl border border-quantum-cyan/30 bg-quantum-cyan/[0.02] p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/60 pb-3">
                  <div>
                    <h2 className="font-display text-xl font-700 text-txt flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-quantum-cyan animate-pulse" />
                      Interactive Mission Challenges
                    </h2>
                    <p className="mt-1 text-[13px] text-txt-dim">
                      Discover, predict, and experiment before building your circuit in Quantum Studio.
                    </p>
                  </div>
                  <span className="font-mono text-[12px] font-bold text-quantum-cyan bg-quantum-cyan/15 border border-quantum-cyan/40 px-3 py-1 rounded-md shadow-sm">
                    {completedActivityCount} / {activities.length} Challenges Solved
                  </span>
                </div>

                <div className="space-y-4 pt-1">
                  {activities.map((act) => (
                    <MissionActivityCard
                      key={act.id}
                      activity={act}
                      levelSlug={l.slug}
                      onCompletedChange={(id, done) => {
                        setCompletedActivities((prev) => ({ ...prev, [id]: done }));
                      }}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* 10-Phase Curriculum & Lesson Progression */}
            <section
              id="curriculum-section"
              className={cx(
                "space-y-4 scroll-mt-24 transition-all duration-500 rounded-2xl",
                highlightCurriculum && "p-4 ring-2 ring-quantum-cyan bg-quantum-cyan/[0.04] shadow-[0_0_35px_rgba(0,229,255,0.2)]"
              )}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-700 text-txt flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-quantum-blue" />
                  Curriculum & Lesson Progression
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={openCurriculum}
                    className="text-[12px] font-mono text-quantum-cyan hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Full Syllabus Modal ↗</span>
                  </button>
                  <span className="font-mono text-[12px] text-txt-faint">
                    {rawLessons.filter((x) => x.completed).length}/{rawLessons.length} Completed
                  </span>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {rawLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    onClick={() =>
                      setSelectedLesson(selectedLesson === lesson.order ? null : lesson.order)
                    }
                    className={cx(
                      "cursor-pointer rounded-xl border p-3.5 transition-all",
                      lesson.completed
                        ? "border-ok/30 bg-ok/[0.04]"
                        : lesson.order === 3
                        ? "border-quantum-cyan/40 bg-quantum-cyan/[0.06] shadow-sm"
                        : "border-line/60 bg-ink-900/40 hover:border-line-strong"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-quantum-cyan">
                        PHASE {String(lesson.order).padStart(2, "0")}
                      </span>
                      <span className="font-mono text-[10px] text-txt-faint">
                        ⏱ {lesson.duration}
                      </span>
                    </div>
                    <div className="mt-1 font-display text-[14px] font-600 text-txt">
                      {lesson.title}
                    </div>
                    {selectedLesson === lesson.order && (
                      <div className="mt-3 text-[12px] text-txt-dim pt-3 border-t border-line/40 space-y-2 animate-rise">
                        {lesson.learningObjective && (
                          <div className="rounded-md bg-quantum-cyan/[0.04] p-2 border border-quantum-cyan/20">
                            <span className="font-mono text-[10px] uppercase font-bold text-quantum-cyan">🎯 Objective: </span>
                            <span className="text-txt">{lesson.learningObjective}</span>
                          </div>
                        )}
                        <div>
                          <span className="font-mono text-[10px] uppercase font-bold text-quantum-blue">📖 Explanation: </span>
                          <div className="mt-1 text-txt-dim leading-relaxed">
                            <MathMarkdown content={lesson.explanation || lesson.description} />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {lesson.relevantConcept && (
                            <div className="rounded-md bg-ink-950/60 p-2 border border-line/50">
                              <span className="font-mono text-[10px] uppercase font-bold text-quantum-cyan">⚛ Concept: </span>
                              <span className="text-txt text-[11px] block">{lesson.relevantConcept}</span>
                            </div>
                          )}
                          {lesson.expectedUnderstanding && (
                            <div className="rounded-md bg-ink-950/60 p-2 border border-ok/30">
                              <span className="font-mono text-[10px] uppercase font-bold text-ok">💡 Understanding: </span>
                              <span className="text-txt text-[11px] block">{lesson.expectedUnderstanding}</span>
                            </div>
                          )}
                        </div>

                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLesson(lesson.order);
                              setIsCurriculumModalOpen(true);
                            }}
                            className="text-[11px] font-mono text-quantum-cyan hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>Open Full Lesson in Modal →</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Quantum Concepts Covered */}
            <section>
              <h2 className="font-display text-lg font-700 text-txt">Quantum Concepts</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {l.concepts.map((c) => (
                  <Badge key={c} tone="blue" className="font-mono text-[11px]">
                    {c}
                  </Badge>
                ))}
              </div>
            </section>

            {/* Available Gates Inventory */}
            <section>
              <h2 className="font-display text-lg font-700 text-txt">Permitted Circuit Gates</h2>
              <p className="mt-1 text-[13px] text-txt-dim">
                The quantum hardware for this mission is calibrated for the following unitaries:
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {l.gates.map((g) => {
                  const key = g === "Measure" ? "M" : g;
                  return (
                    <span
                      key={g}
                      className="flex items-center gap-2 rounded-lg border border-line bg-ink-850 py-1.5 pl-1.5 pr-3 shadow-sm"
                    >
                      <span
                        className="grid h-7 min-w-7 place-items-center rounded-md px-1.5 font-mono text-[12px] font-700 text-ink-950 shadow-sm"
                        style={{ background: gateColors[key] ?? "#4d7cfe" }}
                      >
                        {key}
                      </span>
                      <span className="text-[13px] font-mono text-txt-dim">
                        {gateLabel[key] ?? g}
                      </span>
                    </span>
                  );
                })}
              </div>
            </section>

            {/* Socratic Hints Preview */}
            <section className="rounded-xl border border-warn/30 bg-warn/[0.05] p-5">
              <div className="flex items-center gap-2 text-warn font-mono text-[13px] font-bold">
                <span>💡</span> Architectural Hints
              </div>
              <ul className="mt-3 space-y-2 text-[14px] text-txt-dim leading-relaxed">
                {content.hints.map((h, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-warn font-bold">·</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        {/* Sticky Sidebar: Mission Requirements & Launch Terminal */}
        <div className="lg:sticky lg:top-20 lg:self-start space-y-4">
          <Card className="p-6 border-line/80 bg-ink-900/70 backdrop-blur-md shadow-xl">
            {/* Parameters Matrix */}
            <div className="grid grid-cols-2 gap-4">
              {[
                ["Difficulty", l.difficulty],
                ["XP Bounty", `+${l.xp} XP`],
                ["Est. Duration", l.duration],
                ["Access Level", `Level ${l.n}`],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg border border-line/40 bg-ink-950/50 p-2.5">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-txt-faint">
                    {k}
                  </div>
                  <div
                    className={cx(
                      "mt-0.5 font-display text-[15px] font-700",
                      k === "XP Bounty" ? "text-quantum-cyan" : "text-txt"
                    )}
                  >
                    {v}
                  </div>
                </div>
              ))}
            </div>

            {/* Interactive Concept Readiness */}
            {activities.length > 0 && (
              <div className="mt-4 rounded-xl border border-quantum-cyan/25 bg-quantum-cyan/[0.04] p-3 space-y-1.5">
                <div className="flex items-center justify-between font-mono text-[11px] font-bold uppercase text-quantum-cyan">
                  <span>🧠 Prep Challenges</span>
                  <span>{completedActivityCount} / {activities.length} Solved</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-950 border border-line/40">
                  <div
                    className="h-full bg-quantum-cyan transition-all duration-500"
                    style={{
                      width: `${(completedActivityCount / activities.length) * 100}%`,
                    }}
                  />
                </div>
                <div className="text-[10px] font-mono text-txt-faint">
                  Conceptual preparation before Quantum Studio.
                </div>
              </div>
            )}

            <hr className="my-5 border-line/60" />

            {/* Deterministic Mission Criteria Checklist */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-[15px] font-700 text-txt flex items-center gap-1.5">
                  <span>📋</span> Success Criteria
                </h3>
                <span className="font-mono text-[10px] text-txt-faint">SIMULATOR VERIFIED</span>
              </div>
              <ul className="space-y-2.5 text-[13px]">
                {content.successCriteria.map((c, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 rounded-lg border border-line/40 bg-ink-950/40 p-2 text-txt-dim"
                  >
                    <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border border-quantum-cyan/50 text-[10px] text-quantum-cyan font-bold">
                      ○
                    </span>
                    <span className="leading-tight">{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            <hr className="my-5 border-line/60" />

            {/* Mission Rewards Overview */}
            <div className="rounded-xl border border-quantum-cyan/20 bg-quantum-cyan/[0.03] p-3.5 space-y-2">
              <div className="font-mono text-[11px] font-bold text-quantum-cyan uppercase tracking-wider">
                🎁 Mission Rewards
              </div>
              <div className="space-y-1 font-mono text-[12px] text-txt">
                <div className="flex items-center justify-between">
                  <span className="text-txt-dim">XP Reward:</span>
                  <span className="text-quantum-cyan font-bold">+{l.xp} XP</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-txt-dim">Achievement:</span>
                  <span className="text-txt font-semibold">{l.title} Master</span>
                </div>
                {nextLevel && (
                  <div className="flex items-center justify-between">
                    <span className="text-txt-dim">Unlocks Next:</span>
                    <span className="text-txt font-semibold">Level {nextLevel.n}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="mt-6 space-y-2.5">
              <Button
                className="w-full font-mono text-[14px] shadow-lg glow-cyan cursor-pointer"
                size="lg"
                onClick={() => navigate(`/workspace?level=${l.slug}`)}
              >
                Enter Quantum Studio 🚀
              </Button>

              <Button
                variant="secondary"
                className="w-full font-mono text-[13px] cursor-pointer hover:border-accent-primary/60 hover:text-white transition-all flex items-center justify-center gap-1.5 shadow-sm"
                onClick={() => navigate(`/workspace?level=${l.slug}&mode=ide`)}
              >
                <span>Open in Quantum IDE</span> <span>💻</span>
              </Button>

              <Button
                variant="outline"
                className="w-full font-mono text-[12px] cursor-pointer hover:border-quantum-cyan/70 hover:text-quantum-cyan transition-all flex items-center justify-center gap-1.5 shadow-xs"
                onClick={openCurriculum}
              >
                <span>Inspect Curriculum</span> <span>📖</span>
              </Button>

              {l.status === "completed" ? (
                <div className="rounded-lg border border-ok/30 bg-ok/10 p-2.5 text-center font-mono text-[12px] text-ok font-semibold flex items-center justify-center gap-1.5">
                  <span>✓</span> Mission Completed (+{l.xp} XP Claimed)
                </div>
              ) : (
                <div className="rounded-lg border border-line/40 bg-ink-950/40 p-2.5 text-center font-mono text-[11px] text-txt-dim">
                  Build and verify your circuit in Quantum Studio to satisfy criteria & earn +{l.xp} XP.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Interactive Curriculum Inspector Modal */}
      <CurriculumModal
        isOpen={isCurriculumModalOpen}
        onClose={() => setIsCurriculumModalOpen(false)}
        level={l}
        initialPhaseOrder={selectedLesson || 1}
      />
    </div>
  );
}


