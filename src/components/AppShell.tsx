import { NavLink, Outlet, Link } from "react-router";
import { useState } from "react";
import Logo from "./Logo";
import ChatSidebar from "./ChatSidebar";
import { cx } from "./ui";

const nav = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/learn", label: "Learn" },
  { to: "/workspace", label: "Studio" },
  { to: "/ide", label: "Quantum IDE" },
  { to: "/challenges", label: "Challenges" },
  { to: "/discussions", label: "Discussions" },
  { to: "/university", label: "University" },
  { to: "/social", label: "Social" },
  { to: "/leaderboard", label: "Leaderboard" },
];

function Icon({ d }: { d: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export default function AppShell() {
  const [chatOpen, setChatOpen] = useState(false);
  return (
    <div className="qbg flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-line bg-ink-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-6 px-4 md:px-6">
          <Link to="/dashboard"><Logo size={26} /></Link>
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  cx(
                    "rounded-lg px-3 py-1.5 text-[13px] font-500 transition-colors",
                    isActive ? "bg-white/[0.06] text-txt" : "text-txt-dim hover:text-txt"
                  )
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <NavLink to="/instructor" className="hidden rounded-lg border border-line-strong px-3 py-1.5 text-[12px] font-500 text-txt-dim hover:text-txt md:block">
              Instructor
            </NavLink>
            <button
              onClick={() => setChatOpen((o) => !o)}
              className="relative grid h-9 w-9 place-items-center rounded-lg text-txt-dim hover:bg-white/5 hover:text-txt"
              aria-label="Chat"
            >
              <Icon d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </button>
            <button className="relative grid h-9 w-9 place-items-center rounded-lg text-txt-dim hover:bg-white/5 hover:text-txt" aria-label="Notifications">
              <Icon d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-quantum-cyan" />
            </button>
            <Link to="/profile" className="grid h-9 w-9 place-items-center rounded-full bg-[linear-gradient(120deg,#4d7cfe,#9b6bff)] text-[13px] font-600 text-white">
              AC
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-line bg-ink-900/95 backdrop-blur-xl md:hidden">
        {[
          { to: "/learn", label: "Learn", d: "M4 6h16M4 12h16M4 18h10" },
          { to: "/workspace", label: "Studio", d: "M4 4h16v12H4zM8 20h8" },
          { to: "/challenges", label: "Challenges", d: "M13 2 3 14h7l-1 8 10-12h-7z" },
          { to: "/dashboard", label: "Progress", d: "M3 3v18h18M7 14l4-4 3 3 5-6" },
        ].map((n) => (
          <NavLink key={n.to} to={n.to} className={({ isActive }) =>
            cx("flex flex-col items-center gap-1 py-2.5 text-[11px]", isActive ? "text-quantum-cyan" : "text-txt-faint")
          }>
            <Icon d={n.d} />
            {n.label}
          </NavLink>
        ))}
      </nav>

      {/* Chat sidebar */}
      <ChatSidebar open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}
