import { apiFetchJson } from "./api-client";

const BASE = `/api/v1/pm/emergency-response`;

export async function listEmergencyPlans(
  companyId: number,
  siteId?: number,
  projectId?: number,
) {
  const q = new URLSearchParams({ companyId: String(companyId) });
  if (siteId) q.set("siteId", String(siteId));
  if (projectId) q.set("projectId", String(projectId));
  return apiFetchJson<Array<Record<string, unknown>>>(`${BASE}/plans?${q}`);
}

export async function declareEmergency(body: {
  companyId: number;
  siteId: number;
  projectId?: number;
  eventType: string;
  title: string;
  description?: string;
}) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/events/declare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function fetchActiveMuster(siteId: number) {
  return apiFetchJson<Record<string, unknown> | null>(
    `${BASE}/muster/active?siteId=${siteId}`,
  );
}

export async function startMuster(body: {
  companyId: number;
  siteId: number;
  projectId?: number;
  notes?: string;
}) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/muster/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function pmMusterCheckIn(
  musterEventId: string,
  body: { workerId: number; method?: string; lat?: number; lng?: number },
) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/muster/${musterEventId}/checkin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function pmMusterAllClear(musterEventId: string) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/muster/${musterEventId}/all-clear`, {
    method: "POST",
  });
}

export async function fetchEmergencyAnalytics(projectId: number) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/analytics/project/${projectId}`);
}

export async function fetchEmergencyIntelligence(projectId: number) {
  return apiFetchJson<Array<Record<string, unknown>>>(
    `${BASE}/intelligence/project/${projectId}`,
  );
}

export async function syncPmEmergencyOffline(projectId: number) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/sync/project/${projectId}`);
}

export async function fetchPmEmergencyStatus(id: string) {
  return apiFetchJson<Record<string, unknown>>(
    `/api/v1/pm/emergency/${id}/status`,
  );
}

export async function applyPmEmergencyOfflineSync(
  projectId: number,
  payload: Record<string, unknown>,
) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/sync/project/${projectId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
