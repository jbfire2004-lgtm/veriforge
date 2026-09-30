import type { HubHomepageRole, HubSection } from "@vera/api-contract";
import {
  isCompanyAdmin,
  isSupervisor,
  isUnionHallAdmin,
  isWorker,
} from "@/lib/phase1-roles";

export function mapSessionRoleToHubRole(role: string | null): HubHomepageRole {
  if (isUnionHallAdmin(role)) return "UNION_HALL";
  if (isCompanyAdmin(role)) return "COMPANY_ADMIN";
  if (isSupervisor(role) || role === "PROJECT_MANAGER") return "SUPERVISOR";
  return "WORKER";
}

export function hubRoleLabel(hubRole: HubHomepageRole): string {
  switch (hubRole) {
    case "UNION_HALL":
      return "Union hall";
    case "COMPANY_ADMIN":
      return "Company admin";
    case "SUPERVISOR":
      return "Supervisor";
    default:
      return "Worker";
  }
}

export function shouldShowSection(
  sections: HubSection[],
  section: HubSection,
): boolean {
  return sections.includes(section);
}

export function isWorkerHub(role: string | null): boolean {
  return isWorker(role);
}
