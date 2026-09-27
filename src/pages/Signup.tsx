import { Link, useNavigate, useLocation } from "react-router";
import { useState } from "react";
import Logo from "../components/Logo";
import { Button, Input, Field, cx } from "../components/ui";
import { QSphere } from "../components/quantum";
import { useAuth } from "../lib/auth";

const levels = [
  { id: "beginner", label: "Beginner", desc: "New to quantum computing" },
  { id: "intermediate", label: "Intermediate", desc: "Know the basics of gates & qubits" },
  { id: "advanced", label: "Advanced", desc: "Comfortable writing quantum code" },
];

export default function Signup() {
  const nav = useNavigate();
  const location = useLocation();
  const { register } = useAuth();
  const [lvl, setLvl] = useState("beginner");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(name, email, password, lvl);
      const savedRedirect = sessionStorage.getItem("post_login_redirect");
      if (savedRedirect) {
        sessionStorage.removeItem("post_login_redirect");
        nav(savedRedirect);
      } else {
        nav(redirectPath);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="qbg flex items-center justify-center p-6 lg:order-1">
        <div className="w-full max-w-md animate-rise">
          <div className="mb-8"><Link to="/"><Logo /></Link></div>
          <h1 className="font-display text-2xl font-700">Create your QubitLab account</h1>
          <p className="mt-1.5 text-[14px] text-txt-dim">Start building quantum circuits in minutes.</p>

          {error && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
              {error}
            </div>
          )}

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <Field label="Full name">
              <Input
                placeholder="Alex Chen"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Field>
            <Field label="Email">
              <Input
                type="email"
                placeholder="alex@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>
            <Field label="Password" hint="At least 8 characters with a number.">
              <Input
                type="password"
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </Field>

            <div>
              <span className="mb-2 block text-[13px] font-500 text-txt-dim">Quantum computing experience</span>
              <div className="grid gap-2">
                {levels.map((l) => (
                  <button type="button" key={l.id} onClick={() => setLvl(l.id)}
                    className={cx(
                      "flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors",
                      lvl === l.id ? "border-quantum-blue/60 bg-quantum-blue/10" : "border-line-strong hover:border-line-strong hover:bg-white/[0.02]"
                    )}>
                    <div>
                      <div className="text-[14px] font-500 text-txt">{l.label}</div>
                      <div className="text-[12px] text-txt-faint">{l.desc}</div>
                    </div>
                    <span className={cx("grid h-5 w-5 place-items-center rounded-full border", lvl === l.id ? "border-quantum-blue bg-quantum-blue text-ink-950" : "border-line-strong")}>
                      {lvl === l.id && "✓"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-start gap-2 text-[13px] text-txt-dim">
              <input type="checkbox" required className="mt-0.5 accent-quantum-blue" />
              I agree to the Terms of Service and Privacy Policy.
            </label>
            <Button className="w-full" size="lg" type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-[14px] text-txt-dim">
            Already have an account? <Link to="/auth/login" className="text-quantum-cyan hover:underline">Sign in</Link>
          </p>
        </div>
      </div>

      <div className="qbg relative hidden overflow-hidden border-l border-line lg:flex lg:flex-col lg:justify-center lg:p-12">
        <div className="pointer-events-none absolute inset-0 grid-field opacity-60" />
        <div className="relative mx-auto max-w-sm text-center">
          <div className="h-72"><QSphere states={[{ label: "000", amp: 0.6, phase: 0 }, { label: "011", amp: 0.8, phase: 1.6 }, { label: "101", amp: 0.5, phase: -2 }, { label: "110", amp: 0.7, phase: 0.9 }]} /></div>
          <h2 className="mt-6 font-display text-2xl font-700">From your first qubit to quantum AI.</h2>
          <p className="mt-2 text-txt-dim">Five roles. Real missions. One elegant path through quantum computing.</p>
          <div className="mt-6 flex justify-center gap-6 text-[13px] text-txt-faint">
            <div><div className="font-display text-xl font-700 text-txt">40+</div>missions</div>
            <div><div className="font-display text-xl font-700 text-txt">3</div>SDKs</div>
            <div><div className="font-display text-xl font-700 text-txt">1.2k</div>learners</div>
          </div>
        </div>
      </div>
    </div>
  );
}
