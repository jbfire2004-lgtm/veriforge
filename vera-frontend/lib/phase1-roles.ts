import { defaultProviderPortalPath } from "@/lib/training-provider-permissions";

/**
 * Role strings match Prisma {@link UserRole} / JWT `role` claim.
 */
export const Phase1Role = {
  SUPER_ADMIN: "SUPER_ADMIN",
  UNION_HALL_ADMIN: "UNION_HALL_ADMIN",
  COMPANY_ADMIN: "COMPANY_ADMIN",
  ADMIN: "ADMIN",
  SUPERVISOR: "SUPERVISOR",
  PROJECT_MANAGER: "PROJECT_MANAGER",
  WORKER: "WORKER",
  TRAINING_PROVIDER_ADMIN: "TRAINING_PROVIDER_ADMIN",
  TRAINING_INSTRUCTOR: "TRAINING_INSTRUCTOR",
} as const;

export type Phase1RoleString = (typeof Phase1Role)[keyof typeof Phase1Role];

export function sessionRole(
  session: { user?: { role?: string | null } } | null | undefined
): string | null {
  const r = session?.user?.role;
  return r && typeof r === "string" ? r : null;
}

export function isSuperAdmin(role: string | null): boolean {
  return role === Phase1Role.SUPER_ADMIN || role === Phase1Role.ADMIN;
}

export function isAdmin(role: string | null): boolean {
  return isSuperAdmin(role);
}

export function isUnionHallAdmin(role: string | null): boolean {
  return role === Phase1Role.UNION_HALL_ADMIN || isSuperAdmin(role);
}

export function isCompanyAdmin(role: string | null): boolean {
  return role === Phase1Role.COMPANY_ADMIN || isSuperAdmin(role);
}

export function isSupervisor(role: string | null): boolean {
  return role === Phase1Role.SUPERVISOR;
}

export function isProjectManager(role: string | null): boolean {
  return role === Phase1Role.PROJECT_MANAGER;
}

export function isWorker(role: string | null): boolean {
  return role === Phase1Role.WORKER;
}

/** Any recognised Phase-1 role string. */
export function isStaff(role: string | null): boolean {
  return (
    isSuperAdmin(role) ||
    role === Phase1Role.UNION_HALL_ADMIN ||
    role === Phase1Role.COMPANY_ADMIN ||
    role === Phase1Role.SUPERVISOR ||
    role === Phase1Role.PROJECT_MANAGER ||
    role === Phase1Role.WORKER ||
    role === Phase1Role.TRAINING_PROVIDER_ADMIN ||
    role === Phase1Role.TRAINING_INSTRUCTOR
  );
}

/** VERA Admin UI shell (`/admin/*`) — admin-only for Phase 1. */
export function canAccessAdminShell(role: string | null): boolean {
  return isSuperAdmin(role) || role === Phase1Role.COMPANY_ADMIN;
}

export function canAccessUnionHallShell(role: string | null): boolean {
  return isUnionHallAdmin(role);
}

/** Supervisor / company operations UI (`/supervisor/*`). */
export function canAccessSupervisorShell(role: string | null): boolean {
  return (
    role === Phase1Role.SUPERVISOR ||
    isSuperAdmin(role) ||
    role === Phase1Role.COMPANY_ADMIN ||
    role === Phase1Role.PROJECT_MANAGER
  );
}

/** VERA Core tools (`/core/*`) — any authenticated staff. */
export function canAccessCoreTools(role: string | null): boolean {
  return isStaff(role);
}

/** VeraPM workspace (`/pm/*`) — site safety execution for PM roles. */
export function canAccessPmWorkspace(role: string | null): boolean {
  return (
    isSuperAdmin(role) ||
    role === Phase1Role.PROJECT_MANAGER ||
    role === Phase1Role.SUPERVISOR ||
    role === Phase1Role.COMPANY_ADMIN
  );
}

/** @deprecated Prefer {@link canAccessPmWorkspace}; kept for layout guards. */
export function canAccessProjectManagement(role: string | null): boolean {
  return canAccessPmWorkspace(role);
}

/** Default landing route after sign-in when no explicit `callbackUrl` is provided. */
export function defaultPostLoginPath(role: string | null): string {
  if (!role) return "/home";
  if (
    role === Phase1Role.TRAINING_PROVIDER_ADMIN ||
    role === Phase1Role.TRAINING_INSTRUCTOR
  ) {
    return defaultProviderPortalPath(role);
  }
  if (role === Phase1Role.UNION_HALL_ADMIN) return "/union-hall";
  return "/welcome";
}

/** Equipment assignment management — supervisors and above. */
export function canManageEquipmentAssignments(role: string | null): boolean {
  return canAccessSupervisorShell(role);
}

/** Safety-station configuration / hardware — back-office only. */
export function canManageSafetyStations(role: string | null): boolean {
  return role === Phase1Role.ADMIN || role === Phase1Role.SUPERVISOR;
}

/** Cross-company training & credential expiry (PM / admin). Not worker employment. */
export function canAccessTrainingProviderDashboard(role: string | null): boolean {
  return (
    isSuperAdmin(role) ||
    role === Phase1Role.ADMIN ||
    role === Phase1Role.PROJECT_MANAGER
  );
}

/** Site-contact management — write requires staff role. */
export function canManageSiteContacts(role: string | null): boolean {
  return (
    role === Phase1Role.ADMIN ||
    role === Phase1Role.PROJECT_MANAGER ||
    role === Phase1Role.SUPERVISOR
  );
}

/** Combined worker/equipment result lookups — any signed-in staff. */
export function canViewCombinedResults(role: string | null): boolean {
  return isStaff(role);
}

/** Demo / sandbox surfaces — admins only. */
export function canAccessDemoSurfaces(role: string | null): boolean {
  return role === Phase1Role.ADMIN;
}

/** Internal `/equipment/:id` view (non-public) — needs staff role. */
export function canViewEquipmentDetail(role: string | null): boolean {
  return isStaff(role);
}
