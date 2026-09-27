import { Link, useNavigate, useLocation } from "react-router";
import { useState } from "react";
import Logo from "../components/Logo";
import { Button, Input, Field } from "../components/ui";
import { QSphere } from "../components/quantum";
import { useAuth } from "../lib/auth";

function OAuth({ label, d }: { label: string; d: string }) {
  return (
    <button type="button" className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-line-strong bg-ink-800 text-[14px] font-500 text-txt transition-colors hover:border-quantum-blue/50 hover:bg-ink-750">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d={d} /></svg>
      {label}
    </button>
  );
}

export default function Login() {
  const nav = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [forgot, setForgot] = useState(false);
  const [email, setEmail] = useState("alex@university.edu");
  const [password, setPassword] = useState("quantum123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (forgot) {
      alert("If an account exists for that email, a password reset link has been sent.");
      setForgot(false);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      const savedRedirect = sessionStorage.getItem("post_login_redirect");
      if (savedRedirect) {
        sessionStorage.removeItem("post_login_redirect");
        nav(savedRedirect);
      } else {
        nav(redirectPath);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sign in failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* visual side */}
      <div className="qbg relative hidden overflow-hidden border-r border-line lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute inset-0 grid-field opacity-60" />
        <Link to="/" className="relative"><Logo /></Link>
        <div className="relative">
          <div className="mx-auto max-w-sm">
            <div className="h-64"><QSphere states={[{ label: "00", amp: 0.7, phase: 0.2 }, { label: "01", amp: 0.5, phase: 2 }, { label: "10", amp: 0.6, phase: -1.4 }, { label: "11", amp: 0.9, phase: 1.1 }]} /></div>
          </div>
          <h2 className="mt-4 font-display text-2xl font-700">Your quantum workspace, waiting.</h2>
          <p className="mt-2 text-txt-dim">Pick up your circuit exactly where you left off.</p>
        </div>
        <div className="relative flex items-center gap-2 text-[13px] text-txt-faint">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-ok/15 text-ok">🔒</span>
          End-to-end encrypted · SOC 2 aligned
        </div>
      </div>

      {/* form side */}
      <div className="qbg flex items-center justify-center p-6">
        <div className="w-full max-w-sm animate-rise">
          <div className="mb-8 lg:hidden"><Logo /></div>
          <h1 className="font-display text-2xl font-700">{forgot ? "Reset your password" : "Welcome back"}</h1>
          <p className="mt-1.5 text-[14px] text-txt-dim">{forgot ? "We'll send a secure reset link to your email." : "Sign in to continue your quantum journey."}</p>

          {!forgot && (
            <>
              <div className="mt-6 flex gap-3">
                <OAuth label="Google" d="M12 11v2h5.5c-.2 1.4-1.6 4-5.5 4a5 5 0 1 1 0-10c1.6 0 2.6.7 3.2 1.2l1.7-1.7C15.8 5.5 14.1 5 12 5a7 7 0 1 0 0 14c4 0 6.7-2.8 6.7-6.8 0-.5 0-.8-.1-1.2z" />
                <OAuth label="GitHub" d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.4-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .3.3.6.9.6 1.9v2.8c0 .3.2.6.7.5A10 10 0 0 0 12 2z" />
              </div>
              <div className="my-5 flex items-center gap-3 text-[12px] text-txt-faint">
                <div className="h-px flex-1 bg-line" /> or <div className="h-px flex-1 bg-line" />
              </div>
            </>
          )}

          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Field label="Email">
              <Input
                type="email"
                placeholder="alex@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>
            {!forgot && (
              <Field label="Password">
                <Input
                  type="password"
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Field>
            )}
            {!forgot && (
              <div className="flex items-center justify-between text-[13px]">
                <label className="flex items-center gap-2 text-txt-dim"><input type="checkbox" className="accent-quantum-blue" defaultChecked /> Remember me</label>
                <button type="button" onClick={() => setForgot(true)} className="text-quantum-cyan hover:underline">Forgot password?</button>
              </div>
            )}
            <Button className="w-full" size="lg" type="submit" disabled={loading}>
              {loading ? "Signing in..." : forgot ? "Send reset link" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-[14px] text-txt-dim">
            {forgot ? (
              <button onClick={() => setForgot(false)} className="text-quantum-cyan hover:underline">← Back to sign in</button>
            ) : (
              <>New to QubitLab? <Link to="/auth/signup" className="text-quantum-cyan hover:underline">Create an account</Link></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
