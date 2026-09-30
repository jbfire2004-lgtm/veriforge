import { apiFetchJson } from "./api-client";

const BASE = `/api/v1/pm/site-access-control`;

export type AccessValidationResult = {
  decision: string;
  granted: boolean;
  denialReasons: string[];
  checks: Record<string, boolean>;
  attemptId?: string;
};

export async function validateSiteAccess(body: {
  workerId: number;
  projectId: number;
  zoneCode?: string;
  equipmentId?: number;
  accessPointId?: string;
}) {
  return apiFetchJson<AccessValidationResult>(`${BASE}/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function listAccessPoints(companyId: number, projectId?: number) {
  const q = new URLSearchParams({ companyId: String(companyId) });
  if (projectId) q.set("projectId", String(projectId));
  return apiFetchJson<Array<Record<string, unknown>>>(`${BASE}/access-points?${q}`);
}

export async function listZoneRules(projectId: number) {
  return apiFetchJson<Array<Record<string, unknown>>>(
    `${BASE}/zone-rules?projectId=${projectId}`,
  );
}

export async function upsertZoneRule(body: Record<string, unknown>) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/zone-rules`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function createAccessOverride(body: Record<string, unknown>) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/overrides`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function listAccessOverrides(projectId: number) {
  return apiFetchJson<Array<Record<string, unknown>>>(
    `${BASE}/overrides?projectId=${projectId}`,
  );
}

export async function fetchSiteAccessAnalytics(projectId: number) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/analytics/project/${projectId}`);
}

export async function fetchSiteAccessIntelligence(projectId: number) {
  return apiFetchJson<Array<Record<string, unknown>>>(
    `${BASE}/intelligence/project/${projectId}`,
  );
}

export async function syncPmSiteAccessOffline(projectId: number) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/sync/project/${projectId}`);
}

export async function applyPmSiteAccessOfflineSync(
  projectId: number,
  payload: Record<string, unknown>,
) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/offline/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId, ...payload }),
  });
}
