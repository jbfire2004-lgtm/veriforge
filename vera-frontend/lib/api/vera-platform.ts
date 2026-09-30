import { apiGet, apiPost } from "@/lib/api";

const CORE = "/api/v1/core";

export type PlatformSummary = {
  companyId: number | null;
  generatedAt: string;
  modules: {
    reporting: unknown;
    equipment: {
      total: number;
      compliant: number;
      needsAttention: number;
      nonCompliant: number;
      lockedOut: number;
      overdueInspection: number;
    };
    inspections: {
      total: number;
      passed: number;
      failed: number;
      dueWithin7Days: number;
    };
    competency: {
      totalEvaluations: number;
      passing: number;
      expiringSoon: number;
      expired: number;
    };
    toolsPpe: unknown;
    maintenanceCalibration: unknown;
  };
  links: Record<string, string>;
};

export async function getPlatformSummary(companyId?: number) {
  const qs = companyId ? `?companyId=${companyId}` : "";
  return apiGet<PlatformSummary>(`${CORE}/platform/summary${qs}`);
}

export async function runPlatformNotifyDue(companyId?: number) {
  const qs = companyId ? `?companyId=${companyId}` : "";
  return apiPost(`${CORE}/platform/notify-due${qs}`, {});
}

export async function getEquipmentWalletFullViaCore(equipmentId: number) {
  return apiGet(`${CORE}/wallets/equipment/${equipmentId}/full`);
}
