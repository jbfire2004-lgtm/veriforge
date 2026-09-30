import { Link, NavLink } from "react-router-dom";
import { ReactNode } from "react";

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium ${
    isActive ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-200"
  }`;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <Link to="/" className="text-xl font-bold text-slate-900">
            Vera Worker Lifecycle Engine
          </Link>
          <nav className="flex flex-wrap gap-2">
            <NavLink to="/" className={navClass} end>
              Dashboard
            </NavLink>
            <NavLink to="/presence" className={navClass}>
              Presence
            </NavLink>
            <NavLink to="/presence/scan" className={navClass}>
              QR Scan
            </NavLink>
            <NavLink to="/presence/history" className={navClass}>
              Scan History
            </NavLink>
            <NavLink to="/supervisor/requests" className={navClass}>
              Supervisor
            </NavLink>
            <NavLink to="/workers/import-export" className={navClass}>
              Import/Export
            </NavLink>
            <NavLink to="/orientation" className={navClass}>
              Orientation
            </NavLink>
            <NavLink to="/company" className={navClass}>
              Company
            </NavLink>
            <NavLink to="/rules" className={navClass}>
              Rules
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl p-4 md:p-6">{children}</main>
    </div>
  );
}
