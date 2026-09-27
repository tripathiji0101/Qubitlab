import { Link } from "react-router";
import Logo from "../components/Logo";
import { Button, Badge, Card, SectionTitle } from "../components/ui";
import { ProbabilityChart, QSphere } from "../components/quantum";

function MiniStudio() {
  const wires = [0, 1, 2];
  const cells: Record<string, { g: string; c: string }> = {
    "0-0": { g: "H", c: "#4d7cfe" }, "0-2": { g: "●", c: "#4d7cfe" }, "0-4": { g: "M", c: "#9aa3ba" },
    "1-2": { g: "X", c: "#f4685f" }, "1-4": { g: "M", c: "#9aa3ba" },
    "2-1": { g: "RY", c: "#e05fce" }, "2-3": { g: "Z", c: "#9b6bff" },
  };
  return (
    <Card className="glass overflow-hidden p-0 shadow-[0_40px_120px_-40px_rgba(77,124,254,0.5)]">
      <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-warn/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-ok/70" />
        <span className="ml-2 font-mono text-[12px] text-txt-dim">grover_search.qubit</span>
        <Badge tone="cyan" className="ml-auto">Qiskit</Badge>
      </div>
      <div className="grid gap-px bg-line md:grid-cols-[1.4fr_1fr]">
        {/* circuit */}
        <div className="bg-ink-900 p-4">
          <div className="mb-2 font-mono text-[11px] uppercase tracking-wide text-txt-faint">Circuit</div>
          <div className="space-y-4 py-2">
            {wires.map((w) => (
              <div key={w} className="relative flex items-center gap-2">
                <span className="w-9 font-mono text-[12px] text-txt-dim">q[{w}]</span>
                <div className="relative h-7 flex-1">
                  <div className="absolute inset-x-0 top-1/2 h-px bg-line-strong" />
                  {w === 0 && <div className="absolute top-1/2 h-[46px] w-px -translate-y-1/2 bg-quantum-blue/60" style={{ left: "40%" }} />}
                  <div className="relative grid h-full grid-cols-5 gap-2">
                    {[0, 1, 2, 3, 4].map((col) => {
                      const cell = cells[`${w}-${col}`];
                      if (!cell) return <div key={col} />;
                      const isDot = cell.g === "●";
                      return (
                        <div key={col} className="flex items-center justify-center">
                          {isDot ? (
                            <span className="h-3 w-3 rounded-full" style={{ background: cell.c }} />
                          ) : (
                            <span className="grid h-7 min-w-7 place-items-center rounded-md px-1.5 font-mono text-[12px] font-600 text-ink-950"
                              style={{ background: cell.c }}>
                              {cell.g}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* viz + AI */}
        <div className="grid grid-rows-2 gap-px bg-line">
          <div className="bg-ink-900 p-3">
            <div className="mb-1 font-mono text-[11px] uppercase tracking-wide text-txt-faint">Probabilities</div>
            <div className="h-[92px]">
              <ProbabilityChart data={[{ state: "00", p: 6 }, { state: "01", p: 4 }, { state: "10", p: 8 }, { state: "11", p: 82 }]} />
            </div>
          </div>
          <div className="bg-ink-900 p-3">
            <div className="mb-1 font-mono text-[11px] uppercase tracking-wide text-txt-faint">Q-Sphere</div>
            <div className="h-[92px]">
              <QSphere states={[{ label: "00", amp: 0.4, phase: 0 }, { label: "11", amp: 0.9, phase: 1.2 }]} />
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 border-t border-line bg-ink-850 px-4 py-2.5 text-[12px]">
        <span className="h-2 w-2 animate-[pulse-node_1.5s_infinite] rounded-full bg-quantum-cyan" />
        <span className="text-txt-dim">Copilot:</span>
        <span className="text-txt">Add a diffusion operator to amplify |11⟩.</span>
      </div>
    </Card>
  );
}

const features = [
  { t: "Interactive Quantum Studio", d: "A dense, IDE-grade workspace to build circuits by dragging gates, with live code in Qiskit, PennyLane and Cirq.", tone: "blue" as const, d2: "M4 5h16v11H4zM8 20h8M4 9h16" },
  { t: "AI Quantum Tutor", d: "A context-aware copilot that reads your circuit, explains behavior, debugs entanglement and hands you a fix.", tone: "cyan" as const, d2: "M12 3a4 4 0 0 1 4 4c0 2-2 3-2 5M12 17h.01" },
  { t: "Real-World Projects", d: "Learn by shipping missions — secure a channel with BB84, search with Grover, optimize routes with QAOA.", tone: "violet" as const, d2: "M3 7l9-4 9 4-9 4zM3 7v10l9 4 9-4V7" },
  { t: "Quantum Visualization", d: "See probabilities, statevectors, Q-spheres and Bloch spheres update the instant your circuit changes.", tone: "magenta" as const, d2: "M12 3v18M3 12h18M6 6l12 12" },
  { t: "Gamified Progression", d: "Earn XP, climb five quantum roles, unlock badges and hold your rank — without the childish confetti.", tone: "cyan" as const, d2: "M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z" },
  { t: "Instructor Analytics", d: "Track class progress, surface at-risk students and pinpoint the exact concept a cohort is stuck on.", tone: "blue" as const, d2: "M3 3v18h18M7 14l4-4 3 3 5-6" },
];

export default function Landing() {
  return (
    <div className="qbg min-h-screen text-txt">
      {/* nav */}
      <header className="sticky top-0 z-40 border-b border-line bg-ink-950/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center px-5">
          <Logo />
          <nav className="ml-10 hidden items-center gap-7 text-[14px] text-txt-dim md:flex">
            <a href="#features" className="hover:text-txt">Product</a>
            <a href="#studio" className="hover:text-txt">Studio</a>
            <a href="#projects" className="hover:text-txt">Projects</a>
            <Link to="/instructor" className="hover:text-txt">For Educators</Link>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <Link to="/auth/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
            <Link to="/auth/signup"><Button size="sm">Get started</Button></Link>
          </div>
        </div>
      </header>

      {/* hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 grid-field opacity-60" />
        <div className="relative mx-auto grid max-w-[1200px] gap-12 px-5 py-16 md:py-24 lg:grid-cols-[1fr_1.05fr] lg:items-center">
          <div className="animate-rise">
            <Badge tone="violet" className="mb-5">Learn · Build · Simulate · Master Quantum</Badge>
            <h1 className="font-display text-4xl font-800 leading-[1.05] tracking-tight md:text-6xl">
              Learn quantum computing <span className="text-gradient">by building it.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-txt-dim">
              Master quantum algorithms through interactive circuits, real-time simulation, visual explanations,
              and an AI-powered quantum tutor that reads your work.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/auth/signup"><Button size="lg">Start Learning</Button></Link>
              <Link to="/workspace"><Button variant="outline" size="lg">Explore Quantum Studio →</Button></Link>
            </div>
            <div className="mt-8 flex items-center gap-6 text-[13px] text-txt-faint">
              <span><b className="text-txt">3</b> SDKs · Qiskit · PennyLane · Cirq</span>
              <span><b className="text-txt">40+</b> guided missions</span>
            </div>
          </div>
          <div className="animate-rise [animation-delay:120ms]">
            <MiniStudio />
          </div>
        </div>
      </section>

      {/* why */}
      <section id="features" className="mx-auto max-w-[1200px] px-5 py-16">
        <SectionTitle kicker="Why QubitLab" title="A serious quantum tool that teaches" sub="Technically credible enough for researchers, approachable enough for your first qubit." />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.t} className="group p-5 transition-colors hover:border-line-strong">
              <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg border border-line-strong bg-white/[0.03]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
                  className={f.tone === "blue" ? "text-quantum-blue" : f.tone === "cyan" ? "text-quantum-cyan" : f.tone === "violet" ? "text-quantum-violet" : "text-quantum-magenta"}>
                  <path d={f.d2} />
                </svg>
              </div>
              <h3 className="font-display text-lg font-600">{f.t}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-txt-dim">{f.d}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* studio band */}
      <section id="studio" className="border-y border-line bg-ink-900/50">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-5 py-16 lg:grid-cols-2">
          <div>
            <SectionTitle kicker="The flagship" title="An IDE for quantum circuits" />
            <p className="mt-4 text-txt-dim">Drag gates onto qubit wires, watch the code write itself, and run a
              simulation that instantly updates probabilities, the statevector and a 3D Q-sphere. The AI copilot
              stays in the loop, referencing the exact gates you placed.</p>
            <ul className="mt-6 space-y-3 text-[14px]">
              {["Drag-and-drop gate palette with tooltips", "Synchronized visual circuit & Python code", "Probability · Statevector · Q-Sphere · Bloch", "Context-aware AI debugging and hints"].map((x) => (
                <li key={x} className="flex items-center gap-3 text-txt">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-quantum-cyan/15 text-quantum-cyan">✓</span>{x}
                </li>
              ))}
            </ul>
            <Link to="/workspace" className="mt-7 inline-block"><Button>Open Quantum Studio</Button></Link>
          </div>
          <MiniStudio />
        </div>
      </section>

      {/* projects */}
      <section id="projects" className="mx-auto max-w-[1200px] px-5 py-16">
        <SectionTitle kicker="Learn through projects" title="Five roles, one quantum journey" sub="Every mission is a real-world problem you solve by building a working circuit." />
        <div className="mt-10 grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          {[["01", "Security Analyst", "BB84", "cyan"], ["02", "Logic Designer", "Deutsch–Jozsa", "blue"], ["03", "Data Architect", "Grover", "violet"], ["04", "Logistics Eng.", "QAOA", "magenta"], ["05", "Quantum AI Eng.", "QNN", "cyan"]].map(([n, role, alg, tone]) => (
            <Card key={n} className="p-4">
              <div className="font-mono text-[13px] text-txt-faint">LVL {n}</div>
              <div className="mt-2 font-display font-600">{role}</div>
              <Badge tone={tone as any} className="mt-3">{alg}</Badge>
            </Card>
          ))}
        </div>
      </section>

      {/* final cta */}
      <section className="mx-auto max-w-[1200px] px-5 pb-24">
        <Card className="glass relative overflow-hidden p-10 text-center md:p-16">
          <div className="pointer-events-none absolute inset-0 grid-field opacity-40" />
          <div className="relative">
            <h2 className="font-display text-3xl font-700 tracking-tight md:text-5xl">Ready to place your first qubit?</h2>
            <p className="mx-auto mt-4 max-w-xl text-txt-dim">Join learners building quantum intuition the only way that sticks — hands on the circuit.</p>
            <div className="mt-8 flex justify-center gap-3">
              <Link to="/auth/signup"><Button size="lg">Start Learning free</Button></Link>
              <Link to="/dashboard"><Button variant="outline" size="lg">View the dashboard</Button></Link>
            </div>
          </div>
        </Card>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 px-5 py-8 text-[13px] text-txt-faint md:flex-row">
          <Logo size={22} />
          <span>© 2026 QubitLab. Learn. Build. Simulate. Master Quantum.</span>
          <div className="flex gap-5">
            <a href="#" className="hover:text-txt">Privacy</a>
            <a href="#" className="hover:text-txt">Docs</a>
            <a href="#" className="hover:text-txt">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
