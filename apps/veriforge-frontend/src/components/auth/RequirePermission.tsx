import type { ReactNode } from "react";
import { useAuth } from "../../context/AuthContext";

export function RequirePermission({
  permission,
  children,
  fallback = null,
}: {
  permission: string | string[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { can, hasAnyPermission } = useAuth();
  const ok = Array.isArray(permission)
    ? hasAnyPermission(...permission)
    : can(permission);

  if (!ok) return <>{fallback}</>;
  return <>{children}</>;
}
