import { apiFetchJson } from "./api-client";

const BASE = `/api/v1/pm/equipment`;

export async function registerPmEquipment(body: Record<string, unknown>) {
  return apiFetchJson<Record<string, unknown>>(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function getPmEquipment(id: number) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${id}`);
}

export async function fetchPmEquipmentScore(id: number, projectId?: number) {
  const q = projectId ? `?projectId=${projectId}` : "";
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${id}/score${q}`);
}

export async function predictPmEquipmentRisk(id: number) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${id}/predict`);
}

export async function recordPmEquipmentInspection(
  equipmentId: number,
  body: Record<string, unknown>,
) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${equipmentId}/inspection`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function addPmEquipmentCertification(
  equipmentId: number,
  body: Record<string, unknown>,
) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${equipmentId}/certification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function authorizePmEquipmentOperator(
  equipmentId: number,
  body: Record<string, unknown>,
) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${equipmentId}/authorize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function lockoutPmEquipment(
  equipmentId: number,
  body: { companyId: number; reason: string; stepsJson?: unknown[] },
) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${equipmentId}/lockout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function unlockPmEquipment(equipmentId: number) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${equipmentId}/unlock`, {
    method: "POST",
  });
}

export async function syncPmEquipmentOffline(
  projectId: number,
  payload: Record<string, unknown>,
) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/offline/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId, ...payload }),
  });
}
