import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function LandingPage() {
  const { isAuthenticated, bootstrapping } = useAuth();

  if (!bootstrapping && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(15,23,20,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,20,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
        <p className="font-display text-sm font-semibold uppercase tracking-[0.28em] text-forge-moss">
          VeriForge
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-5xl font-bold leading-tight text-forge-ink sm:text-6xl">
          Industrial safety modules, one company workspace.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-forge-steel">
          Start a 7-day trial of VeriCore, VeriPM, and VeriHub — configure roles, projects, and
          compliance before you activate billing.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/signup" className="vf-btn-primary px-6 py-3 text-base">
            Start free trial
          </Link>
          <Link to="/hub" className="vf-btn-secondary px-6 py-3 text-base">
            Explore VeriHub
          </Link>
          <Link to="/login" className="vf-btn-secondary px-6 py-3 text-base">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
