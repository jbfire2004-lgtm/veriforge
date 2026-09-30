import { apiGet, apiPatch, apiPost } from "@/lib/api";

const BASE = "/api/v1/equipment";

export type EquipmentDashboard = {
  total: number;
  lockedOut: number;
  nonCompliant: number;
  needsInspection: number;
  recent: EquipmentSummary[];
};

export type EquipmentSummary = {
  id: number;
  name: string;
  serialNumber?: string | null;
  assetTag?: string | null;
  safetyStatus: string;
  lockedOutAt?: string | null;
  complianceStatus?: string;
  lastInspectionAt?: string | null;
  nextInspectionAt?: string | null;
  lockoutStatus?: string;
  competencyRequired?: boolean;
  trainingRequired?: boolean;
  company?: { id: number; name: string } | null;
  equipmentLinks?: { complianceStatus: string; active: boolean }[];
};

export type EquipmentDetail = EquipmentSummary & {
  qrToken?: string | null;
  isLockedOut: boolean;
  isSafe: boolean;
  complianceUpdatedAt?: string | null;
  description?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  meterHours?: number;
  activeCompanyLink?: {
    id: number;
    companyId: number;
    complianceStatus: string;
    company?: { name: string };
  } | null;
  assignedOperators?: { worker: { id: number; firstName: string; lastName: string } }[];
  projectAssignments?: { project: { id: number; name: string }; assignedAt: string }[];
  inspections?: unknown[];
  maintenanceRecords?: unknown[];
  calibrations?: unknown[];
  lockoutHistory?: unknown[];
  complianceHistory?: { status: string; assessedAt: string; notes?: string | null }[];
  competencyRequirements?: unknown[];
  trainingRequirements?: unknown[];
};

export type TimelineEvent = {
  at: string;
  type: string;
  title: string;
  detail?: string;
};

export async function getEquipmentDashboard(companyId?: number) {
  const qs = companyId ? `?companyId=${companyId}` : "";
  return apiGet<EquipmentDashboard>(`${BASE}/dashboard${qs}`);
}

export async function listEquipment(params?: {
  companyId?: number;
  q?: string;
  limit?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.companyId) qs.set("companyId", String(params.companyId));
  if (params?.q) qs.set("q", params.q);
  if (params?.limit) qs.set("limit", String(params.limit));
  const q = qs.toString();
  return apiGet<EquipmentSummary[]>(`${BASE}${q ? `?${q}` : ""}`);
}

export async function searchEquipment(params: {
  q?: string;
  serial?: string;
  assetTag?: string;
  qr?: string;
}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v && qs.set(k, v));
  return apiGet<EquipmentSummary[]>(`${BASE}/search?${qs}`);
}

export async function getEquipment(id: number) {
  return apiGet<EquipmentDetail>(`${BASE}/${id}`);
}

export async function createEquipment(body: Record<string, unknown>) {
  return apiPost<EquipmentDetail>(BASE, body);
}

export async function updateEquipment(id: number, body: Record<string, unknown>) {
  return apiPatch<EquipmentDetail>(`${BASE}/${id}`, body);
}

export async function getEquipmentTimeline(id: number) {
  return apiGet<TimelineEvent[]>(`${BASE}/${id}/timeline`);
}

export async function getEquipmentQr(id: number) {
  return apiGet<{ qrToken: string; content: string; url: string }>(`${BASE}/${id}/qr`);
}

export async function getEquipmentWallet(id: number) {
  return apiGet<unknown>(`/api/v1/equipment/${id}/wallet`);
}

export async function scanEquipmentQr(qrToken: string, companyId: number) {
  return apiPost<{
    linked: boolean;
    equipmentId: number;
    companyId: number;
    complianceStatus: string;
    equipmentName: string | null;
    walletUrl: string;
  }>(`${BASE}/scan`, { qrToken, companyId });
}

export async function assignEquipmentToProject(equipmentId: number, projectId: number) {
  return apiPost(`${BASE}/${equipmentId}/assign-project`, { projectId });
}

export async function assignWorkerToEquipment(
  equipmentId: number,
  workerId: number,
  companyId?: number,
) {
  return apiPost(`${BASE}/${equipmentId}/assign-worker`, { workerId, companyId });
}

export async function lockoutEquipment(
  equipmentId: number,
  reason: string,
  companyId?: number,
) {
  return apiPost(`${BASE}/${equipmentId}/lockout`, { reason, companyId });
}

export async function unlockEquipment(equipmentId: number, notes?: string) {
  return apiPost(`${BASE}/${equipmentId}/unlock`, { notes });
}

export async function addMaintenance(equipmentId: number, body: Record<string, unknown>) {
  return apiPost(`${BASE}/${equipmentId}/maintenance`, body);
}

export async function addCalibration(equipmentId: number, body: Record<string, unknown>) {
  return apiPost(`${BASE}/${equipmentId}/calibration`, body);
}

export async function listEquipmentCategories() {
  return apiGet<
    { id: number; name: string; types: { id: number; name: string }[] }[]
  >(`${BASE}/categories`);
}
