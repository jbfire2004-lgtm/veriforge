import { apiGet, apiPost } from "@/lib/api";

const BASE = "/api/v1/equipment-compliance";

export type ComplianceStatus =
  | "COMPLIANT"
  | "NEEDS_ATTENTION"
  | "NON_COMPLIANT"
  | "LOCKED_OUT";

export type EquipmentComplianceDashboard = {
  total: number;
  compliant: number;
  needsAttention: number;
  nonCompliant: number;
  lockedOut: number;
  overdueInspection: number;
  recent: {
    id: number;
    name: string;
    complianceStatus: ComplianceStatus;
    lockoutStatus: string;
    lastInspectionAt: string | null;
    nextInspectionAt: string | null;
    competencyRequired: boolean;
    trainingRequired: boolean;
    safetyStatus: string;
    company?: { id: number; name: string } | null;
  }[];
};

export async function getEquipmentComplianceDashboard(companyId?: number) {
  const qs = companyId ? `?companyId=${companyId}` : "";
  return apiGet<EquipmentComplianceDashboard>(`${BASE}/dashboard${qs}`);
}

export async function recalculateEquipmentCompliance(equipmentId: number) {
  return apiPost(`${BASE}/equipment/${equipmentId}/recalculate`, {});
}
