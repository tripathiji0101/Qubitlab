import { Link, useParams } from "react-router";
import { useEffect, useState } from "react";
import { Card, Badge, Button, Progress, cx } from "../components/ui";
import { ScoreRing, Count } from "../components/motion";
import { challenges, difficultyTone } from "../lib/data";

const checks = [
  { label: "Validating circuit structure", key: "valid" },
  { label: "Simulating statevector", key: "sim" },
  { label: "Comparing to target state", key: "target" },
  { label: "Scoring efficiency & depth", key: "score" },
];

export default function ChallengeDetail() {
  const { id } = useParams();
  const ch = challenges.find((c) => c.id === id) ?? challenges[0];
  const [phase, setPhase] = useState<"idle" | "evaluating" | "result">("idle");
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (phase !== "evaluating") return;
    setStep(0);
    const timers = checks.map((_, i) => setTimeout(() => setStep(i + 1), (i + 1) * 480));
    const done = setTimeout(() => setPhase("result"), checks.length * 480 + 350);
    return () => { timers.forEach(clearTimeout); clearTimeout(done); };
  }, [phase]);

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8 md:px-6">
      <Link to="/challenges" className="text-[13px] text-txt-dim hover:text-txt">← Challenges</Link>
      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={ch.tone}>{ch.algorithm}</Badge>
            <Badge tone={difficultyTone[ch.difficulty]}>{ch.difficulty}</Badge>
            <Badge tone="cyan">{ch.xp} XP</Badge>
          </div>
          <h1 className="mt-3 font-display text-3xl font-800 tracking-tight">{ch.title}</h1>

          <section className="mt-6">
            <h2 className="font-display text-lg font-700">Problem statement</h2>
            <p className="mt-2 leading-relaxed text-txt-dim">{ch.statement}</p>
          </section>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Card className="p-4">
              <h3 className="font-display text-[15px] font-700">Requirements</h3>
              <ul className="mt-2 space-y-1.5 text-[13px] text-txt-dim">
                <li>· Produce the exact target statevector</li>
                <li>· Use only the allowed gate set</li>
                <li>· Keep circuit depth within limits</li>
              </ul>
            </Card>
            <Card className="p-4">
              <h3 className="font-display text-[15px] font-700">Constraints</h3>
              <ul className="mt-2 space-y-1.5 text-[13px] text-txt-dim">
                <li>· Max depth: 8</li>
                <li>· Max gates: 6</li>
                <li>· Qubits: 2</li>
              </ul>
            </Card>
          </div>

          <section className="mt-6">
            <h2 className="font-display text-lg font-700">Allowed gates</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {["H", "X", "Z", "CNOT", "CZ"].map((g) => (
                <span key={g} className="rounded-md border border-line-strong bg-ink-850 px-3 py-1 font-mono text-[13px] text-txt-dim">{g}</span>
              ))}
            </div>
          </section>

          <section className="mt-6 rounded-xl border border-warn/25 bg-warn/[0.06] p-4">
            <h2 className="font-display text-[15px] font-700 text-warn">Hints</h2>
            <p className="mt-1.5 text-[13px] text-txt-dim">A single Hadamard followed by a CNOT is enough to entangle two qubits. Think about which qubit should be the control.</p>
          </section>

          <section className="mt-6">
            <h2 className="font-display text-lg font-700">Expected output</h2>
            <div className="mt-2 rounded-lg border border-line bg-ink-900 p-3 font-mono text-[13px] text-txt">
              |ψ⟩ = <span className="text-quantum-cyan">0.707</span>|00⟩ + <span className="text-quantum-cyan">0.707</span>|11⟩
            </div>
          </section>
        </div>

        {/* right rail */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          {phase === "idle" && (
            <Card className="p-5">
              <h3 className="font-display text-lg font-700">Ready to solve?</h3>
              <p className="mt-1.5 text-[13px] text-txt-dim">Build your circuit in the Studio, then submit for scoring.</p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[12px]">
                <div className="rounded-lg border border-line bg-ink-900 p-2"><div className="text-txt-faint">Best</div><div className="font-600">{ch.best || "—"}</div></div>
                <div className="rounded-lg border border-line bg-ink-900 p-2"><div className="text-txt-faint">Tries</div><div className="font-600">{ch.attempts}</div></div>
                <div className="rounded-lg border border-line bg-ink-900 p-2"><div className="text-txt-faint">Reward</div><div className="font-600 text-quantum-cyan">{ch.xp}</div></div>
              </div>
              <div className="mt-4 space-y-2">
                <Link to="/workspace"><Button className="w-full" size="lg">Open in Quantum Studio →</Button></Link>
                <Button variant="secondary" className="w-full" onClick={() => setPhase("evaluating")}>Submit circuit</Button>
              </div>
            </Card>
          )}

          {phase === "evaluating" && (
            <Card className="p-5">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-line-strong border-t-quantum-cyan" />
                <span className="font-display text-lg font-700">Evaluating submission…</span>
              </div>
              <div className="mt-5 space-y-3">
                {checks.map((c, i) => {
                  const state = i < step ? "done" : i === step ? "active" : "wait";
                  return (
                    <div key={c.key} className={cx("flex items-center gap-3 text-[13px] transition-opacity", state === "wait" && "opacity-40")}>
                      <span className={cx("grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[11px]",
                        state === "done" ? "border-ok/40 bg-ok/15 text-ok" : state === "active" ? "border-quantum-cyan/50 text-quantum-cyan" : "border-line-strong text-txt-faint")}>
                        {state === "done" ? "✓" : state === "active" ? <span className="h-2 w-2 animate-[pulse-node_1s_infinite] rounded-full bg-quantum-cyan" /> : ""}
                      </span>
                      <span className={state === "done" ? "text-txt" : "text-txt-dim"}>{c.label}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-5"><Progress value={(step / checks.length) * 100} tone="cyan" /></div>
            </Card>
          )}

          {phase === "result" && (
            <Card className="animate-rise overflow-hidden p-0">
              <div className="relative border-b border-line bg-ok/[0.06] p-5 text-center">
                <div className="pointer-events-none absolute inset-0 grid-field opacity-30" />
                <div className="relative">
                  <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-ok/30 bg-ok/10 px-3 py-1 text-[13px] font-600 text-ok">
                    <span>✓</span> CORRECT
                  </div>
                  <div className="mt-4 grid place-items-center"><ScoreRing value={92} label="Score" /></div>
                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-quantum-cyan/15 px-3 py-1 font-mono text-[13px] font-600 text-quantum-cyan animate-rise">
                    ✦ +<Count to={ch.xp} /> XP
                  </div>
                </div>
              </div>
              <div className="space-y-3 p-5">
                {[["Correctness", 100, "cyan"], ["Efficiency", 84, "violet"]].map(([k, v, t]) => (
                  <div key={k as string}>
                    <div className="mb-1 flex justify-between text-[12px]"><span className="text-txt-dim">{k}</span><span className="tabular-nums"><Count to={v as number} suffix="%" /></span></div>
                    <Progress value={v as number} tone={t as any} />
                  </div>
                ))}
                <div className="grid grid-cols-3 gap-2 pt-1 text-center text-[12px]">
                  {[["Depth", 8], ["Gates", 4], ["Shots", "1k"]].map(([k, v]) => (
                    <div key={k as string} className="rounded-lg border border-line bg-ink-900 p-2"><div className="text-txt-faint">{k}</div><div className="font-600">{v}</div></div>
                  ))}
                </div>
                <div className="rounded-lg border border-quantum-cyan/25 bg-quantum-cyan/[0.06] p-3 text-[13px] text-txt-dim">
                  <span className="font-500 text-quantum-cyan">AI feedback · </span>
                  Your solution produces the correct target state. You can reduce circuit depth by removing two redundant gates.
                </div>
                <div className="flex gap-2 pt-1">
                  <Button variant="outline" className="flex-1" onClick={() => setPhase("idle")}>Try again</Button>
                  <Link to="/challenges" className="flex-1"><Button className="w-full">Next →</Button></Link>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
