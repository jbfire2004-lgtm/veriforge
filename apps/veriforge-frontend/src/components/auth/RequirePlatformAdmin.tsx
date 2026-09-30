import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { isPlatformAdminEmail } from "../../lib/api";
import { PERMISSIONS } from "../../types/api";

/** Platform admin only — VITE_PLATFORM_ADMIN_EMAILS and/or platform.admin permission. */
export function RequirePlatformAdmin() {
  const { isAuthenticated, bootstrapping, can, user } = useAuth();

  if (bootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center text-forge-steel">
        Loading admin…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: { pathname: "/admin/organizations" } }} />;
  }

  const allowed =
    can(PERMISSIONS.PLATFORM_ADMIN) || isPlatformAdminEmail(user?.email);

  if (!allowed) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
