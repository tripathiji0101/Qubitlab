import { useEffect, useRef, useState } from "react";

/* Count-up on mount / value change */
export function useCountUp(target: number, duration = 900, run = true) {
  const [val, setVal] = useState(0);
  const raf = useRef(0);
  useEffect(() => {
    if (!run) return;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(target * eased);
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration, run]);
  return val;
}

export function Count({ to, decimals = 0, suffix = "", prefix = "", run = true }: { to: number; decimals?: number; suffix?: string; prefix?: string; run?: boolean }) {
  const v = useCountUp(to, 900, run);
  return <>{prefix}{v.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</>;
}

/* Reveal when scrolled into view */
export function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } }, { threshold: 0.15 });
    io.observe(el); return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={className}
      style={{ opacity: shown ? 1 : 0, transform: shown ? "none" : "translateY(14px)", transition: `opacity .6s ease ${delay}ms, transform .6s cubic-bezier(.2,.7,.2,1) ${delay}ms` }}>
      {children}
    </div>
  );
}

/* Animated circular gauge (0-100) */
export function ScoreRing({ value, size = 128, stroke = 10, label, run = true }: { value: number; size?: number; stroke?: number; label?: string; run?: boolean }) {
  const v = useCountUp(value, 1100, run);
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const off = circ * (1 - v / 100);
  const color = value >= 90 ? "var(--color-ok)" : value >= 70 ? "var(--color-accent-teal)" : "var(--color-warn)";
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ring-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={color} />
            <stop offset="1" stopColor="var(--color-accent-sage)" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="url(#ring-g)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={off} style={{ transition: "stroke-dashoffset .1s linear" }} />
      </svg>
      <div className="absolute text-center">
        <div className="font-display text-3xl font-800 leading-none">{Math.round(v)}</div>
        {label && <div className="mt-1 text-[10px] uppercase tracking-wide text-txt-faint">{label}</div>}
      </div>
    </div>
  );
}

/* Tiny sparkline / bar activity strip */
export function Sparkbars({ data, className = "" }: { data: number[]; className?: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className={`flex items-end gap-1 ${className}`}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 rounded-sm bg-[linear-gradient(to_top,var(--color-accent-teal),var(--color-accent-sage))]"
          style={{ height: `${(d / max) * 100}%`, minHeight: 3, opacity: 0.55 + (d / max) * 0.45, animation: `rise .5s ease ${i * 40}ms both` }} />
      ))}
    </div>
  );
}
