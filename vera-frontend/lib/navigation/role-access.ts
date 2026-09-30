import { Phase1Role } from "@/lib/phase1-roles";
import {
  canAccessProviderPortal,
  isTrainingInstructor,
  isTrainingProviderAdmin,
} from "@/lib/training-provider-permissions";
import type { DashboardWidgetId, NavModuleId, QuickActionId } from "./types";

function isSuperAdmin(role: string | null): boolean {
  return role === Phase1Role.SUPER_ADMIN || role === Phase1Role.ADMIN;
}

function isCompanyAdmin(role: string | null): boolean {
  return role === Phase1Role.COMPANY_ADMIN || isSuperAdmin(role);
}

function isSupervisor(role: string | null): boolean {
  return (
    role === Phase1Role.SUPERVISOR ||
    role === Phase1Role.PROJECT_MANAGER ||
    isSuperAdmin(role) ||
    role === Phase1Role.COMPANY_ADMIN
  );
}

function isUnionHallAdmin(role: string | null): boolean {
  return role === Phase1Role.UNION_HALL_ADMIN || isSuperAdmin(role);
}

function isWorker(role: string | null): boolean {
  return role === Phase1Role.WORKER;
}

/** Which sidebar modules each role may see (VERA Core §4). */
export function canSeeNavModule(role: string | null, module: NavModuleId): boolean {
  if (!role) return false;

  if (isWorker(role)) {
    return module === "wallet" || module === "dashboard";
  }

  if (isTrainingInstructor(role) && !isTrainingProviderAdmin(role)) {
    return (
      module === "dashboard" ||
      module === "training" ||
      module === "trainingProviders"
    );
  }

  if (isTrainingProviderAdmin(role) && !isSuperAdmin(role)) {
    return (
      module === "dashboard" ||
      module === "training" ||
      module === "trainingProviders" ||
      module === "compliance"
    );
  }

  if (isUnionHallAdmin(role) && !isSuperAdmin(role)) {
    return (
      module === "dashboard" ||
      module === "workers" ||
      module === "training" ||
      module === "unionHalls"
    );
  }

  if (isSupervisor(role) && !isCompanyAdmin(role) && !isSuperAdmin(role)) {
    const supervisorModules: NavModuleId[] = [
      "dashboard",
      "workers",
      "equipment",
      "projects",
      "safetyIntelligence",
      "scan",
      "verification",
      "settings",
    ];
    return supervisorModules.includes(module);
  }

  if (isCompanyAdmin(role) && !isSuperAdmin(role)) {
    const companyModules: NavModuleId[] = [
      "dashboard",
      "workers",
      "equipment",
      "training",
      "projects",
      "safetyIntelligence",
      "companies",
      "compliance",
      "reports",
    ];
    return companyModules.includes(module);
  }

  // Super admin — full sidebar
  return true;
}

/** Dashboard widgets visible per role (VERA Core §3–4). */
export function canSeeDashboardWidget(
  role: string | null,
  widget: DashboardWidgetId
): boolean {
  if (!role) return false;

  if (isWorker(role)) {
    return widget === "quickActions";
  }

  if (isTrainingInstructor(role) && !isTrainingProviderAdmin(role)) {
    return (
      widget === "trainingExpiry" ||
      widget === "providerApprovals" ||
      widget === "quickActions"
    );
  }

  if (isTrainingProviderAdmin(role) && !isSuperAdmin(role)) {
    return (
      widget === "trainingExpiry" ||
      widget === "providerApprovals" ||
      widget === "quickActions" ||
      widget === "recentActivity"
    );
  }

  if (isUnionHallAdmin(role) && !isSuperAdmin(role)) {
    return (
      widget === "workerCompliance" ||
      widget === "trainingExpiry" ||
      widget === "unionDispatch" ||
      widget === "quickActions"
    );
  }

  if (isSupervisor(role) && !isCompanyAdmin(role) && !isSuperAdmin(role)) {
    return (
      widget === "workerCompliance" ||
      widget === "equipmentCompliance" ||
      widget === "projectReadiness" ||
      widget === "assignments" ||
      widget === "quickActions" ||
      widget === "metrics"
    );
  }

  if (widget === "systemHealth") {
    return isSuperAdmin(role);
  }

  if (widget === "assignments") {
    return isSupervisor(role) && !isCompanyAdmin(role) && !isSuperAdmin(role);
  }

  if (isCompanyAdmin(role) && !isSuperAdmin(role)) {
    return (
      widget !== "unionDispatch" &&
      widget !== "providerApprovals" &&
      widget !== "systemHealth" &&
      widget !== "assignments"
    );
  }

  return true;
}

export function canSeeQuickAction(role: string | null, action: QuickActionId): boolean {
  if (!role) return false;
  if (isWorker(role)) return false;

  if (action === "scanQr") {
    return isSupervisor(role);
  }

  if (action === "uploadTraining") {
    return (
      canAccessProviderPortal(role) ||
      isCompanyAdmin(role) ||
      isUnionHallAdmin(role)
    );
  }

  if (action === "addWorker" || action === "assignProject") {
    return isCompanyAdmin(role) || isUnionHallAdmin(role);
  }

  if (action === "addEquipment") {
    return isCompanyAdmin(role) || isSupervisor(role);
  }

  return isSuperAdmin(role);
}
