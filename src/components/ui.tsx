import { createContext, useContext, useState, type ReactNode, type ButtonHTMLAttributes, type InputHTMLAttributes } from "react";

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

/* ---------- Button ---------- */
type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
};
export function Button({ variant = "primary", size = "md", className, children, ...rest }: BtnProps) {
  const sizes = {
    sm: "h-8 px-3 text-[13px] gap-1.5",
    md: "h-10 px-4 text-sm gap-2",
    lg: "h-12 px-6 text-[15px] gap-2",
  };
  const variants = {
    primary: "bg-accent-primary text-white hover:bg-accent-primary/90 border border-transparent shadow-sm",
    secondary: "bg-bg-panel text-txt border border-line shadow-sm hover:bg-bg-surface",
    ghost: "text-txt-dim hover:text-txt hover:bg-line/50",
    outline: "border border-line-strong text-txt hover:bg-bg-surface",
    danger: "bg-danger text-white hover:bg-danger/90 border border-transparent shadow-sm",
  };
  return (
    <button
      className={cx(
        "inline-flex items-center justify-center rounded-md font-500 transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap",
        sizes[size],
        variants[variant],
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ---------- Card ---------- */
export function Card({ className, children, ...rest }: { className?: string; children: ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx("rounded-xl border border-line bg-bg-surface shadow-[0_2px_12px_rgba(0,0,0,0.15)]", className)} {...rest}>
      {children}
    </div>
  );
}

/* ---------- Badge ---------- */
type Tone = "cyan" | "blue" | "violet" | "magenta" | "ok" | "warn" | "danger" | "neutral";
const toneMap: Record<Tone, string> = {
  cyan: "text-accent-blue bg-accent-primary/10 border-accent-primary/20",
  blue: "text-accent-blue bg-accent-primary/10 border-accent-primary/20",
  violet: "text-accent-blue bg-accent-primary/10 border-accent-primary/20",
  magenta: "text-accent-blue bg-accent-primary/10 border-accent-primary/20",
  ok: "text-ok bg-ok/10 border-ok/20",
  warn: "text-warn bg-warn/10 border-warn/20",
  danger: "text-danger bg-danger/10 border-danger/20",
  neutral: "text-txt-dim bg-bg-panel border-line-strong",
};
export function Badge({ tone = "neutral", className, children }: { tone?: Tone; className?: string; children: ReactNode }) {
  return (
    <span className={cx("inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-600 uppercase tracking-wide", toneMap[tone], className)}>
      {children}
    </span>
  );
}

export function Chip({ active, children, ...rest }: { active?: boolean; children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cx(
        "h-8 rounded-full border px-3 text-[13px] font-500 transition-colors",
        active ? "border-accent-primary bg-accent-primary text-white" : "border-line-strong bg-bg-surface text-txt hover:border-line-strong hover:bg-bg-panel"
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ---------- Progress ---------- */
export function Progress({ value, tone = "blue", className }: { value: number; tone?: "blue" | "cyan" | "violet"; className?: string }) {
  return (
    <div className={cx("h-2 w-full overflow-hidden rounded-full bg-line", className)}>
      <div 
        className="h-full rounded-full bg-accent-primary transition-[width] duration-700" 
        style={{ width: `${Math.min(100, value)}%` }} 
      />
    </div>
  );
}

/* ---------- Stat card ---------- */
export function Stat({ label, value, delta, icon }: { label: string; value: ReactNode; delta?: string; icon?: ReactNode }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <span className="text-[12px] font-600 uppercase tracking-wide text-txt-faint">{label}</span>
        {icon && <span className="text-txt-dim">{icon}</span>}
      </div>
      <div className="mt-2 font-display text-2xl font-700">{value}</div>
      {delta && <div className="mt-1 text-[12px] text-ok">{delta}</div>}
    </Card>
  );
}

/* ---------- Inputs ---------- */
export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-500 text-txt-dim">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[12px] text-txt-faint">{hint}</span>}
    </label>
  );
}
export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cx(
        "h-10 w-full rounded-md border border-line-strong bg-bg-panel px-3 text-sm text-txt placeholder:text-txt-faint transition-colors focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary",
        className
      )}
      {...rest}
    />
  );
}

/* ---------- Tabs ---------- */
const TabsCtx = createContext<{ value: string; set: (v: string) => void } | null>(null);
export function Tabs({ tabs, value, onChange, className }: { tabs: { id: string; label: ReactNode }[]; value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <div className={cx("inline-flex items-center gap-1 rounded-md border border-line bg-bg-panel p-1", className)}>
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cx(
            "rounded px-3 py-1.5 text-[13px] font-500 transition-colors shadow-sm",
            value === t.id ? "bg-bg-surface text-txt border border-line-strong" : "text-txt-dim hover:text-txt border border-transparent shadow-none"
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- Section heading ---------- */
export function SectionTitle({ kicker, title, sub }: { kicker?: string; title: ReactNode; sub?: ReactNode }) {
  return (
    <div>
      {kicker && <div className="mb-2 font-mono text-[12px] uppercase tracking-wider text-accent-blue">{kicker}</div>}
      <h2 className="font-display text-2xl font-700 tracking-tight md:text-3xl text-txt">{title}</h2>
      {sub && <p className="mt-2 max-w-2xl text-txt-dim">{sub}</p>}
    </div>
  );
}

/* ---------- Tooltip (simple) ---------- */
export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <span className="pointer-events-none absolute -top-8 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded border border-line bg-bg-surface px-2 py-1 text-[11px] text-txt shadow-md">
          {label}
        </span>
      )}
    </span>
  );
}

export { TabsCtx };
