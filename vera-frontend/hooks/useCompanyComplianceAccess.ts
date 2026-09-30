"use client";

import { useSession } from "next-auth/react";
import { useMemo } from "react";

const COMPLIANCE_VIEW_ROLES = new Set([
  "SUPERVISOR",
  "ADMIN",
  "SUPER_ADMIN",
  "COMPANY_ADMIN",
  "PROJECT_MANAGER",
  "WORKER",
]);

/**
 * Gate company compliance / scoring UI.
 * Mirrors backend `companies.compliance.view` intent using session role until ACP permissions are wired.
 */
export function useCompanyComplianceAccess() {
  const { data: session, status } = useSession();

  return useMemo(() => {
    const role = session?.user?.role ?? null;
    const permissions = (session?.user as { permissions?: string[] } | undefined)
      ?.permissions;
    const loading = status === "loading";

    const hasPermission =
      permissions?.includes("companies.compliance.view") ||
      permissions?.includes("*") ||
      (role != null && COMPLIANCE_VIEW_ROLES.has(role));

    return {
      loading,
      canViewCompliance: hasPermission,
      role,
    };
  }, [session, status]);
}
