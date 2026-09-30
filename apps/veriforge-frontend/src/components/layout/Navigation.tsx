import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { usePermissions } from "../../hooks/usePermissions";
import { isPlatformAdminEmail } from "../../lib/api";
import { MODULE_META, PERMISSIONS, type ModuleCode } from "../../types/api";

const MODULE_ORDER: ModuleCode[] = ["vericore", "veripm", "verihub"];

function linkClass({ isActive }: { isActive: boolean }) {
  return [
    "rounded-lg px-3 py-2 text-sm font-medium transition",
    isActive
      ? "bg-forge-forest text-white"
      : "text-forge-ink/80 hover:bg-forge-mist hover:text-forge-ink",
  ].join(" ");
}

export function Navigation() {
  const { isModuleEnabled, hasActiveAccess, user, logout, can } = useAuth();
  const { canManageBilling, canUpdateOrg, canManageUsers, isOwnerOrAdmin } = usePermissions();
  const showAdmin =
    can(PERMISSIONS.PLATFORM_ADMIN) || isPlatformAdminEmail(user?.email);

  return (
    <header className="border-b border-forge-sand/80 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-6">
          <NavLink to="/dashboard" className="font-display text-lg font-bold tracking-tight text-forge-forest">
            VeriForge
          </NavLink>
          <nav className="flex flex-wrap items-center gap-1">
            <NavLink to="/dashboard" className={linkClass}>
              Dashboard
            </NavLink>
            {MODULE_ORDER.map((code) => {
              const enabled = isModuleEnabled(code);
              const locked = !hasActiveAccess || !enabled;
              if (!enabled && !isOwnerOrAdmin) return null;
              return (
                <NavLink
                  key={code}
                  to={MODULE_META[code].path}
                  className={({ isActive }) =>
                    [linkClass({ isActive }), locked ? "opacity-50" : ""].join(" ")
                  }
                  title={locked ? "Module locked — activate subscription" : undefined}
                >
                  {MODULE_META[code].label}
                </NavLink>
              );
            })}
            {(canUpdateOrg || canManageBilling || canManageUsers) && (
              <NavLink to="/settings" className={linkClass}>
                Settings
              </NavLink>
            )}
            {showAdmin && (
              <NavLink to="/admin/organizations" className={linkClass}>
                Admin
              </NavLink>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <div className="text-right leading-tight">
            <p className="font-medium text-forge-ink">{user?.fullName}</p>
            <p className="capitalize text-forge-steel">{user?.role ?? "member"}</p>
          </div>
          <button type="button" className="vf-btn-secondary" onClick={() => void logout()}>
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
