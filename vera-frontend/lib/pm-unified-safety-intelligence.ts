import { apiFetchJson } from "./api-client";

const BASE = `/api/v1/pm/unified-safety-intelligence`;

export async function fetchUnifiedIntelDashboard(companyId: number, projectId?: number) {
  const q = projectId ? `&projectId=${projectId}` : "";
  return apiFetchJson<Record<string, unknown>>(`${BASE}/dashboard?companyId=${companyId}${q}`);
}

export async function fetchUnifiedIntelTrends(companyId: number, projectId?: number) {
  const q = projectId ? `&projectId=${projectId}` : "";
  return apiFetchJson<Record<string, unknown>>(`${BASE}/analytics/trends?companyId=${companyId}${q}`);
}

export async function fetchUnifiedIntelPredictions(companyId: number, projectId?: number) {
  const q = projectId ? `&projectId=${projectId}` : "";
  return apiFetchJson<Array<Record<string, unknown>>>(`${BASE}/predictions?companyId=${companyId}${q}`);
}

export async function fetchUnifiedIntelScores(companyId: number, projectId?: number) {
  const q = projectId ? `&projectId=${projectId}` : "";
  return apiFetchJson<Array<Record<string, unknown>>>(`${BASE}/scores?companyId=${companyId}${q}`);
}

export async function fetchUnifiedIntelRecommendations(companyId: number, projectId?: number) {
  const q = projectId ? `&projectId=${projectId}` : "";
  return apiFetchJson<Array<Record<string, unknown>>>(
    `${BASE}/recommendations?companyId=${companyId}${q}`,
  );
}

export async function runUnifiedIntelBatch(companyId: number, projectId: number) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/inference/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ companyId, projectId }),
  });
}

export async function runUnifiedIntelRealtime(body: {
  companyId: number;
  projectId: number;
  workerId?: number;
  equipmentId?: number;
  zoneCode?: string;
}) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/inference/realtime`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function evaluateUnifiedIntelGate(body: {
  companyId: number;
  projectId: number;
  workerId?: number;
  equipmentId?: number;
}) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/enforcement/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function syncUnifiedIntelOffline(companyId: number, projectId?: number) {
  const q = projectId ? `&projectId=${projectId}` : "";
  return apiFetchJson<Record<string, unknown>>(`${BASE}/sync/bundle?companyId=${companyId}${q}`);
}

export async function applyUnifiedIntelOfflineSync(body: {
  companyId: number;
  projectId: number;
  predictions?: Array<Record<string, unknown>>;
  scores?: Array<Record<string, unknown>>;
  recommendations?: Array<Record<string, unknown>>;
}) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/sync/apply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function fetchUnifiedIntelModels(companyId: number) {
  return apiFetchJson<Array<Record<string, unknown>>>(`${BASE}/models?companyId=${companyId}`);
}

export async function getUnifiedIntelExplainability(id: string) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/explainability/${id}`);
}
