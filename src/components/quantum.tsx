import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";

/* Gate visual identity (Professional Technical Palette, Dark Theme) */
export const gateColors: Record<string, string> = {
  H: "#3b82f6", X: "#10b981", Y: "#f59e0b", Z: "#64748b",
  S: "#0ea5e9", T: "#0ea5e9", RX: "#10b981", RY: "#f59e0b",
  RZ: "#64748b", CNOT: "#3b82f6", CZ: "#64748b", SWAP: "#0ea5e9",
  M: "#4f515a", B: "#37383f",
};

export const gatePalette = [
  { group: "Single Qubit", gates: ["H", "X", "Y", "Z", "S", "T"] },
  { group: "Rotation", gates: ["RX", "RY", "RZ"] },
  { group: "Multi Qubit", gates: ["CNOT", "CZ", "SWAP"] },
  { group: "Measurement", gates: ["M", "B"] },
];

export const gateLabel: Record<string, string> = {
  H: "Hadamard", X: "Pauli-X", Y: "Pauli-Y", Z: "Pauli-Z", S: "Phase S", T: "Phase T",
  RX: "Rotate X", RY: "Rotate Y", RZ: "Rotate Z", CNOT: "Controlled-NOT", CZ: "Controlled-Z",
  SWAP: "Swap", M: "Measure", B: "Barrier",
};

/* ---------- Probability chart ---------- */
export function ProbabilityChart({ data }: { data: { state: string; p: number }[] }) {
  return (
    <div className="h-full min-h-[80px] w-full">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={80}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 4 }}>
          <XAxis dataKey="state" tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "JetBrains Mono" }} axisLine={{ stroke: "#37383f" }} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Bar dataKey="p" radius={[3, 3, 0, 0]} maxBarSize={40}>
            {data.map((_, i) => (
              <Cell key={i} fill="url(#probgrad)" />
            ))}
          </Bar>
          <defs>
            <linearGradient id="probgrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#60a5fa" />
              <stop offset="1" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ---------- Statevector ---------- */
export function Statevector({ amps }: { amps: { state: string; re: number; im: number; p: number }[] }) {
  const nonzero = amps.filter((a) => a.p > 0.001);
  return (
    <div className="flex h-full flex-col gap-3 overflow-auto p-1">
      <div className="rounded-md border border-line bg-bg-panel p-3 font-mono text-[13px] leading-relaxed text-txt">
        <span className="text-txt-faint">|ψ⟩ = </span>
        {nonzero.map((a, i) => (
          <span key={a.state}>
            {i > 0 && <span className="text-txt-faint"> + </span>}
            <span className="text-accent-blue font-600">{a.re.toFixed(3)}</span>
            <span className="text-txt-dim">|{a.state}⟩</span>
          </span>
        ))}
      </div>
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-2 font-mono text-[12px]">
        {nonzero.map((a) => {
          const phase = Math.atan2(a.im, a.re);
          const hue = ((phase + Math.PI) / (2 * Math.PI)) * 360;
          return (
            <div key={a.state} className="contents">
              <span className="text-txt-dim">|{a.state}⟩</span>
              <div className="h-2 rounded-full bg-line">
                <div className="h-full rounded-full" style={{ width: `${Math.sqrt(a.p) * 100}%`, background: `hsl(${hue} 70% 50%)` }} />
              </div>
              <span className="tabular-nums text-txt-faint">{(a.p * 100).toFixed(1)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Q-Sphere ---------- */
export function QSphere({ states }: { states: { label: string; amp: number; phase: number }[] }) {
  const cx = 130, cy = 120, r = 92;
  return (
    <div className="flex h-full items-center justify-center">
      <svg viewBox="0 0 260 240" className="h-full max-h-[220px] w-full">
        <defs>
          <radialGradient id="qs-fill" cx="40%" cy="35%">
            <stop offset="0" stopColor="rgba(59,130,246,0.1)" />
            <stop offset="1" stopColor="rgba(0,0,0,0.2)" />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={r} fill="url(#qs-fill)" stroke="rgba(255,255,255,0.08)" />
        {[0.5, 0.82].map((k, i) => (
          <ellipse key={i} cx={cx} cy={cy} rx={r} ry={r * k * 0.42} fill="none" stroke="rgba(255,255,255,0.05)" />
        ))}
        <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke="rgba(255,255,255,0.05)" />
        <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke="rgba(255,255,255,0.05)" />
        {states.map((s, i) => {
          const angle = -Math.PI / 2 + (i / Math.max(1, states.length)) * Math.PI * 0.9;
          const yOff = (i % 2 === 0 ? -1 : 1) * (r * 0.55) * s.amp;
          const ex = cx + Math.cos(angle) * r * 0.75 * s.amp;
          const ey = cy + yOff;
          const hue = ((s.phase + Math.PI) / (2 * Math.PI)) * 360;
          const color = `hsl(${hue} 70% 50%)`;
          return (
            <g key={s.label}>
              <line x1={cx} y1={cy} x2={ex} y2={ey} stroke={color} strokeWidth={1.5} opacity={0.8} />
              <circle cx={ex} cy={ey} r={4 + s.amp * 4} fill={color} />
              <text x={ex} y={ey - 9} fill="#94a3b8" fontSize={9} fontFamily="JetBrains Mono" textAnchor="middle">|{s.label}⟩</text>
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r={3} fill="#fff" stroke="#37383f" />
      </svg>
    </div>
  );
}

/* ---------- Phase color wheel (legend) ---------- */
export function PhaseWheel({ size = 46 }: { size?: number }) {
  const stops = Array.from({ length: 12 }, (_, i) => `hsl(${i * 30} 70% 50%) ${(i / 12) * 100}%`);
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="grid place-items-center rounded-full" style={{ width: size, height: size, background: `conic-gradient(${stops.join(",")})` }}>
        <div className="grid place-items-center rounded-full bg-bg-surface text-[8px] text-txt-dim shadow-sm" style={{ width: size * 0.5, height: size * 0.5 }}>Phase</div>
      </div>
      <div className="flex w-full justify-between px-0.5 font-mono text-[8px] text-txt-dim"><span>π</span><span>0</span></div>
    </div>
  );
}

/* ---------- Panel chrome (matches dense IDE viz headers) ---------- */
export function VizPanel({ title, children, actions }: { title: string; children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col bg-bg-surface h-full">
      <div className="flex items-center gap-2 border-b border-line px-4 py-2 bg-bg-panel/50">
        <span className="font-sans text-[12px] font-600 uppercase tracking-wide text-txt-dim">{title}</span>
        <div className="ml-auto flex items-center gap-1.5 text-txt-faint">
          {actions}
          <button className="grid h-6 w-6 place-items-center rounded hover:bg-line text-[14px]" aria-label="Info">ⓘ</button>
          <button className="grid h-6 w-6 place-items-center rounded text-[16px] hover:bg-line" aria-label="More">⋯</button>
        </div>
      </div>
      <div className="relative min-h-0 flex-1 p-4">{children}</div>
    </div>
  );
}

/* ---------- Bloch sphere ---------- */
export function BlochSphere({ theta = 0.9, phi = 0.6 }: { theta?: number; phi?: number }) {
  const cx = 120, cy = 120, r = 90;
  const x = Math.sin(theta) * Math.cos(phi);
  const z = Math.cos(theta);
  const ex = cx + x * r * 0.9;
  const ey = cy - z * r;
  return (
    <div className="flex h-full items-center justify-center">
      <svg viewBox="0 0 240 240" className="h-full max-h-[220px]">
        <circle cx={cx} cy={cy} r={r} fill="rgba(59,130,246,0.05)" stroke="#37383f" />
        <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.32} fill="none" stroke="#4f515a" />
        <ellipse cx={cx} cy={cy} rx={r * 0.32} ry={r} fill="none" stroke="#4f515a" />
        <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke="#4f515a" />
        <text x={cx} y={cy - r - 5} fill="#94a3b8" fontSize={10} textAnchor="middle" fontFamily="JetBrains Mono">|0⟩</text>
        <text x={cx} y={cy + r + 14} fill="#94a3b8" fontSize={10} textAnchor="middle" fontFamily="JetBrains Mono">|1⟩</text>
        <line x1={cx} y1={cy} x2={ex} y2={ey} stroke="#3b82f6" strokeWidth={2} />
        <circle cx={ex} cy={ey} r={5} fill="#3b82f6" />
      </svg>
    </div>
  );
}
