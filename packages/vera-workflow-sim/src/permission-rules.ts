import type { VeraRole } from "./types";

const SUPER = new Set<VeraRole>(["SUPER_ADMIN", "ADMIN"]);
const COMPANY = new Set<VeraRole>([...SUPER, "COMPANY_ADMIN"]);
const SUPERVISOR = new Set<VeraRole>([...COMPANY, "SUPERVISOR", "PROJECT_MANAGER"]);

export const PERMISSION_MATRIX: Record<string, Set<VeraRole>> = {
  "worker.create": COMPANY,
  "worker.linkCompany": COMPANY,
  "worker.assignProject": SUPERVISOR,
  "worker.uploadTraining": new Set([...COMPANY, "TRAINING_INSTRUCTOR", "TRAINING_PROVIDER_ADMIN"]),
  "worker.complianceView": SUPERVISOR,
  "worker.qrScan": SUPERVISOR,
  "worker.walletUpdate": COMPANY,
  "worker.leaveProject": SUPERVISOR,
  "worker.leaveCompany": COMPANY,
  "worker.transferCompany": COMPANY,
  "equipment.create": COMPANY,
  "equipment.linkCompany": COMPANY,
  "equipment.assignProject": SUPERVISOR,
  "equipment.inspect": SUPERVISOR,
  "equipment.lockout": SUPERVISOR,
  "equipment.qrScan": SUPERVISOR,
  "training.issue": new Set([...SUPER, "TRAINING_PROVIDER_ADMIN", "TRAINING_INSTRUCTOR"]),
  "training.uploadClass": new Set(["TRAINING_INSTRUCTOR", "TRAINING_PROVIDER_ADMIN"]),
  "training.validate": COMPANY,
  "training.reject": COMPANY,
  "provider.create": SUPER,
  "provider.approve": SUPER,
  "provider.suspend": SUPER,
  "union.memberOnboard": new Set([...SUPER, "UNION_HALL_ADMIN"]),
  "union.dispatch": new Set([...SUPER, "UNION_HALL_ADMIN"]),
  "company.create": SUPER,
  "company.adminOnboard": SUPER,
  "project.create": COMPANY,
  "project.close": COMPANY,
  "project.readiness": SUPERVISOR,
  "compliance.evaluate": SUPERVISOR,
  "inspection.submit": SUPERVISOR,
  "competency.evaluate": SUPERVISOR,
  "competency.override": COMPANY,
  "sync.batch": SUPERVISOR,
  "dashboard.widgets": SUPERVISOR,
  "field.offline": new Set([...SUPERVISOR, "WORKER"]),
};

export function roleHasPermission(role: VeraRole, permission: string): boolean {
  const allowed = PERMISSION_MATRIX[permission];
  if (!allowed) return false;
  return allowed.has(role);
}
