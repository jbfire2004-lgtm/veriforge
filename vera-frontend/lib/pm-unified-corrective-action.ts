import { apiFetchJson } from "./api-client";

const BASE = `/api/v1/pm/unified-corrective-action`;

export async function fetchUnifiedCapaDashboard(companyId: number, projectId?: number) {
  const q = projectId ? `&projectId=${projectId}` : "";
  return apiFetchJson<Record<string, unknown>>(`${BASE}/dashboard?companyId=${companyId}${q}`);
}

export async function fetchUnifiedCapaList(
  companyId?: number,
  projectId?: number,
  overdueOnly?: boolean,
) {
  const params = new URLSearchParams();
  if (companyId) params.set("companyId", String(companyId));
  if (projectId) params.set("projectId", String(projectId));
  if (overdueOnly) params.set("overdueOnly", "true");
  return apiFetchJson<Array<Record<string, unknown>>>(`${BASE}/list?${params}`);
}

export async function fetchUnifiedCapa(id: string) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${id}`);
}

export async function createUnifiedCapa(body: Record<string, unknown>) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function evaluateUnifiedCapaEnforcement(body: {
  companyId: number;
  projectId?: number;
  workerId?: number;
  equipmentId?: number;
}) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/enforcement/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function generateUnifiedCapaBatch(projectId: number) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/generate/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId }),
  });
}

export async function runUnifiedCapaEscalationSweep(projectId: number) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/escalation/sweep`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId }),
  });
}

export async function fetchUnifiedCapaCailInsights(companyId: number, projectId?: number) {
  const q = projectId ? `&projectId=${projectId}` : "";
  return apiFetchJson<Array<Record<string, unknown>>>(
    `${BASE}/cail/insights?companyId=${companyId}${q}`,
  );
}

export async function fetchUnifiedCapaCailBundle(companyId: number, projectId?: number) {
  const q = projectId ? `&projectId=${projectId}` : "";
  return apiFetchJson<Record<string, unknown>>(`${BASE}/cail/bundle?companyId=${companyId}${q}`);
}

export async function syncUnifiedCapaOffline(companyId: number, projectId?: number) {
  const q = projectId ? `&projectId=${projectId}` : "";
  return apiFetchJson<Record<string, unknown>>(`${BASE}/sync/bundle?companyId=${companyId}${q}`);
}

export async function applyUnifiedCapaOfflineSync(body: {
  companyId: number;
  projectId: number;
  actions?: Array<Record<string, unknown>>;
}) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/sync/apply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function updateUnifiedCapa(id: string, body: Record<string, unknown>) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function autoAssignUnifiedCapa(id: string) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${id}/auto-assign`, { method: "POST" });
}

export async function submitUnifiedCapa(id: string) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${id}/submit`, { method: "POST" });
}

export async function markUnifiedCapaInProgress(id: string) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${id}/in-progress`, { method: "POST" });
}

export async function verifyUnifiedCapa(
  id: string,
  body: { outcome: "approve" | "reject"; role: string; notes?: string },
) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${id}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function assignUnifiedCapa(
  id: string,
  body: { userId?: number; workerId?: number; role?: "primary" | "secondary" },
) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${id}/assign`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function publishUnifiedCapa(id: string) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${id}/publish`, { method: "POST" });
}

export async function fetchUnifiedCapaTrends(companyId: number, projectId?: number) {
  const q = projectId ? `&projectId=${projectId}` : "";
  return apiFetchJson<Record<string, unknown>>(`${BASE}/analytics/trends?companyId=${companyId}${q}`);
}
