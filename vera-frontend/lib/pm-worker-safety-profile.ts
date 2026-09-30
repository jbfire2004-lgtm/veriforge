import { apiFetchJson } from "./api-client";

const BASE = `/api/v1/pm/worker-safety-profile`;

export async function fetchWorkerSafetyProfile(workerId: number, projectId?: number) {
  const q = projectId ? `?projectId=${projectId}` : "";
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${workerId}${q}`);
}

export async function rebuildWorkerSafetyProfile(workerId: number, projectId?: number) {
  const q = projectId ? `?projectId=${projectId}` : "";
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${workerId}/rebuild${q}`, {
    method: "POST",
  });
}

export async function evaluateWorkerEnforcement(body: {
  workerId: number;
  projectId: number;
  zoneCode?: string;
  equipmentId?: number;
}) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/enforcement/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function fetchWorkerSafetyAnalytics(workerId: number) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${workerId}/analytics`);
}

export async function fetchWorkerCailInsights(workerId: number, projectId?: number) {
  const q = projectId ? `?projectId=${projectId}` : "";
  return apiFetchJson<Array<Record<string, unknown>>>(
    `${BASE}/${workerId}/cail/insights${q}`,
  );
}

export async function syncPmWorkerSafetyProfileOffline(workerId: number) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/sync/${workerId}`);
}

export async function uploadPmWorkerSafetyProfileOffline(
  workerId: number,
  payload: Record<string, unknown>,
) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/sync/${workerId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function fetchWorkerSafetyScore(workerId: number, projectId?: number) {
  const q = projectId ? `?projectId=${projectId}` : "";
  return apiFetchJson<Record<string, unknown>>(`${BASE}/score/${workerId}${q}`);
}
