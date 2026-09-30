import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function linkClass({ isActive }: { isActive: boolean }) {
  return [
    "rounded-lg px-3 py-2 text-sm font-medium transition",
    isActive ? "bg-forge-ink text-white" : "text-forge-ink/80 hover:bg-white/10 hover:text-white",
  ].join(" ");
}

export function AdminShell() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#0c1210] text-white">
      <header className="border-b border-white/10 bg-[#121a17]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3">
          <div className="flex flex-wrap items-center gap-6">
            <NavLink to="/admin/organizations" className="font-display text-lg font-bold tracking-tight">
              VeriForge Admin
            </NavLink>
            <nav className="flex flex-wrap gap-1">
              <NavLink to="/admin/organizations" className={linkClass}>
                Organizations
              </NavLink>
              <NavLink to="/admin/onboarding" className={linkClass}>
                Onboarding
              </NavLink>
              <NavLink to="/admin/pricing" className={linkClass}>
                Pricing
              </NavLink>
              <NavLink to="/dashboard" className={linkClass}>
                ← App
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm text-white/70">
            <span>{user?.email}</span>
            <button
              type="button"
              className="rounded-lg border border-white/20 px-3 py-1.5 text-white hover:bg-white/10"
              onClick={() => void logout()}
            >
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
