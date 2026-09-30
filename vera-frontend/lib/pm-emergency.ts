import { apiFetchJson } from "./api-client";

const BASE = `/api/v1/pm/emergency`;

export async function declarePmEmergency(body: Record<string, unknown>) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/declare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function fetchPmEmergencyStatus(id: string) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${id}/status`);
}

export async function predictPmEmergency(id: string) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${id}/predict`);
}

export async function allClearPmEmergency(id: string, force?: boolean) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${id}/all_clear`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ force }),
  });
}

export async function closePmEmergency(id: string, force?: boolean) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${id}/close`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ force }),
  });
}

export async function startPmEmergencyMuster(id: string, body: Record<string, unknown>) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${id}/muster/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function checkInPmEmergencyMuster(
  id: string,
  body: { workerId: number; method?: string; lat?: number; lng?: number },
) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${id}/muster/checkin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function createPmEmergencyPlan(body: Record<string, unknown>) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function createPmEmergencyEquipment(body: Record<string, unknown>) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/equipment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function syncPmEmergencyOffline(
  projectId: number,
  payload: Record<string, unknown>,
) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/offline/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId, ...payload }),
  });
}
