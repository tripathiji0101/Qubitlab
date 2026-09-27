type Props = { size?: number; withWordmark?: boolean; className?: string };

export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="ql-g" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0" stopColor="#35e0d8" />
          <stop offset="0.55" stopColor="#4d7cfe" />
          <stop offset="1" stopColor="#9b6bff" />
        </linearGradient>
      </defs>
      {/* orbital arcs */}
      <ellipse cx="16" cy="16" rx="13.5" ry="6" stroke="url(#ql-g)" strokeWidth="1.6" opacity="0.85"
        transform="rotate(35 16 16)" />
      <ellipse cx="16" cy="16" rx="13.5" ry="6" stroke="url(#ql-g)" strokeWidth="1.6" opacity="0.55"
        transform="rotate(-35 16 16)" />
      {/* qubit node */}
      <circle cx="16" cy="16" r="4.2" fill="url(#ql-g)" />
      <circle cx="16" cy="16" r="4.2" fill="#06070d" opacity="0.35" />
      <circle cx="16" cy="16" r="2" fill="#fff" />
      {/* state marker */}
      <circle cx="28" cy="8" r="1.7" fill="#35e0d8" />
    </svg>
  );
}

export default function Logo({ size = 28, withWordmark = true, className = "" }: Props) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      {withWordmark && (
        <span className="font-display font-700 tracking-tight text-txt" style={{ fontSize: size * 0.62 }}>
          Qubit<span className="text-quantum-cyan">Lab</span>
        </span>
      )}
    </span>
  );
}
