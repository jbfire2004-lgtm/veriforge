import { apiFetchJson } from "./api-client";

const BASE = `/api/v1/pm/equipment-safety`;

export type EquipmentProfile = {
  id: number;
  name: string;
  serialNumber: string | null;
  manufacturer: string | null;
  model: string | null;
  operationalStatus: string;
  safetyCategory: string | null;
  complianceStatus: string;
  lockoutStatus: string;
  safetyStatus: string;
  nextInspectionAt: string | null;
};

export async function listEquipmentProfiles(companyId: number, projectId?: number) {
  const q = new URLSearchParams({ companyId: String(companyId) });
  if (projectId) q.set("projectId", String(projectId));
  return apiFetchJson<EquipmentProfile[]>(`${BASE}/profiles?${q}`);
}

export async function getEquipmentProfile(id: number) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/profiles/${id}`);
}

export async function reportEquipmentFailure(body: {
  companyId: number;
  projectId?: number;
  equipmentId: number;
  failureType: string;
  title: string;
  description?: string;
  autoLockout?: boolean;
}) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/failures`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function createEquipmentLoto(body: {
  companyId: number;
  equipmentId: number;
  reason: string;
  stepsJson?: unknown[];
}) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/loto`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function removeEquipmentLoto(id: string) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/loto/${id}/remove`, {
    method: "POST",
  });
}

export async function grantEquipmentAuthorization(body: {
  companyId: number;
  workerId: number;
  authType: string;
  equipmentId?: number;
  expiresAt?: string;
}) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/authorizations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function fetchEquipmentAnalytics(projectId: number) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/analytics/project/${projectId}`);
}

export async function fetchEquipmentIntelligence(projectId: number) {
  return apiFetchJson<Array<Record<string, unknown>>>(
    `${BASE}/intelligence/project/${projectId}`,
  );
}

export async function syncPmEquipmentOffline(projectId: number) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/sync/project/${projectId}`);
}

export async function applyPmEquipmentOfflineSync(
  projectId: number,
  payload: Record<string, unknown>,
) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/sync/project/${projectId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function fetchEquipmentConditionScore(id: number, projectId?: number) {
  const q = projectId ? `?projectId=${projectId}` : "";
  return apiFetchJson<Record<string, unknown>>(
    `/api/v1/pm/equipment/${id}/score${q}`,
  );
}

export async function checkEquipmentWorkerAccess(workerId: number, projectId: number) {
  return apiFetchJson<{
    allowed: boolean;
    blockedEquipmentCount: number;
    reasons: string[];
  }>(`${BASE}/access/worker?workerId=${workerId}&projectId=${projectId}`);
}
