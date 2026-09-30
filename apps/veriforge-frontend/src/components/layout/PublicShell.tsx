import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function PublicShell() {
  const { isAuthenticated, bootstrapping } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="border-b border-forge-sand/80 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="font-display text-lg font-bold tracking-tight text-forge-forest">
            VeriForge
          </Link>
          <nav className="flex flex-wrap items-center gap-2">
            <Link to="/hub" className="vf-btn-secondary text-sm">
              VeriHub
            </Link>
            {!bootstrapping && isAuthenticated ? (
              <Link to="/dashboard" className="vf-btn-primary text-sm">
                Go to workspace
              </Link>
            ) : (
              <>
                <Link to="/login" className="vf-btn-secondary text-sm">
                  Sign in
                </Link>
                <Link to="/signup" className="vf-btn-primary text-sm">
                  Start free trial
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
