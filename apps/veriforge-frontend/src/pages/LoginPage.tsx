import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "../lib/api";

const DEV_TEST_EMAIL = import.meta.env.VITE_DEV_LOGIN_EMAIL ?? "admin@veriforge.local";
const DEV_TEST_PASSWORD = import.meta.env.VITE_DEV_LOGIN_PASSWORD ?? "Str0ng!Passw0rd";

export function LoginPage() {
  const { login, isAuthenticated, bootstrapping, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/dashboard";

  const [email, setEmail] = useState(import.meta.env.DEV ? DEV_TEST_EMAIL : "");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!bootstrapping && isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const submitLogin = async (nextEmail: string, nextPassword: string) => {
    clearError();
    setLocalError(null);
    setSubmitting(true);
    try {
      await login(nextEmail, nextPassword);
      navigate(from, { replace: true });
    } catch (err) {
      const message = getApiErrorMessage(err, "Login failed");
      const hint =
        import.meta.env.DEV && /network|fetch|ECONNREFUSED/i.test(message)
          ? " Make sure the API is running (npm run dev in services/veriforge-saas-service)."
          : "";
      setLocalError(`${message}${hint}`);
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void submitLogin(email, password);
  };

  const useDevTestAccount = () => {
    setEmail(DEV_TEST_EMAIL);
    setPassword(DEV_TEST_PASSWORD);
    void submitLogin(DEV_TEST_EMAIL, DEV_TEST_PASSWORD);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
      <div className="vf-panel p-6 sm:p-8">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-forge-moss">
          VeriForge
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold">Sign in</h1>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="vf-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="vf-input"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div>
            <label className="vf-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="vf-input"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          {(localError || error) && (
            <p className="rounded-lg border border-forge-danger/30 bg-red-50 px-3 py-2 text-sm text-forge-danger">
              {localError ?? error}
            </p>
          )}
          <button type="submit" className="vf-btn-primary w-full" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {import.meta.env.DEV && (
          <div className="mt-5 rounded-lg border border-forge-moss/30 bg-forge-mist/80 p-4 text-sm text-forge-ink">
            <p className="font-semibold text-forge-forest">Local test account</p>
            <p className="mt-1 text-forge-steel">
              Email <span className="font-mono text-forge-ink">{DEV_TEST_EMAIL}</span>
              <br />
              Password <span className="font-mono text-forge-ink">{DEV_TEST_PASSWORD}</span>
            </p>
            <p className="mt-2 text-forge-steel">
              No Stripe needed — trial access is active for testing.
            </p>
            <button
              type="button"
              className="vf-btn-secondary mt-3 w-full"
              disabled={submitting}
              onClick={() => void useDevTestAccount()}
            >
              Sign in with test account
            </button>
          </div>
        )}

        <p className="mt-4 text-center text-sm text-forge-steel">
          New company?{" "}
          <Link to="/signup" className="font-semibold text-forge-moss hover:underline">
            Start free trial
          </Link>
          {" · "}
          <Link to="/hub" className="font-semibold text-forge-moss hover:underline">
            Explore free VeriHub
          </Link>
        </p>
      </div>
    </div>
  );
}
