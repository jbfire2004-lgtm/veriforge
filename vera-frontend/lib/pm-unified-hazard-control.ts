import { apiFetchJson } from "./api-client";

const BASE = `/api/v1/pm/unified-hazard-control`;

export async function fetchHcDashboard(companyId: number, projectId?: number) {
  const q = projectId ? `&projectId=${projectId}` : "";
  return apiFetchJson<Record<string, unknown>>(`${BASE}/dashboard?companyId=${companyId}${q}`);
}

export async function fetchHcHazards(companyId: number, projectId?: number) {
  const q = projectId ? `&projectId=${projectId}` : "";
  return apiFetchJson<Array<Record<string, unknown>>>(
    `${BASE}/hazards?companyId=${companyId}${q}`,
  );
}

export async function fetchHcControls(companyId: number, projectId?: number) {
  const q = projectId ? `&projectId=${projectId}` : "";
  return apiFetchJson<Array<Record<string, unknown>>>(
    `${BASE}/controls?companyId=${companyId}${q}`,
  );
}

export async function fetchHcEnergyWheel(hazardId: string) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/hazards/${hazardId}/energy-wheel`);
}

export async function fetchHcCailInsights(companyId: number, projectId?: number) {
  const q = projectId ? `&projectId=${projectId}` : "";
  return apiFetchJson<Array<Record<string, unknown>>>(
    `${BASE}/cail/insights?companyId=${companyId}${q}`,
  );
}

export async function ingestHcBatch(
  companyId: number,
  source: string,
  projectId?: number,
) {
  const q = projectId ? `&projectId=${projectId}` : "";
  return apiFetchJson<Record<string, unknown>>(
    `${BASE}/ingest?companyId=${companyId}&source=${source}${q}`,
    { method: "POST" },
  );
}

export async function syncHcCompanyToProject(companyId: number, projectId: number) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/sync/company-to-project`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ companyId, projectId }),
  });
}

export async function evaluateHcEnforcement(body: {
  companyId: number;
  projectId?: number;
  workerId?: number;
}) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/enforcement/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function syncPmUnifiedHcOffline(companyId: number, projectId?: number) {
  const q = projectId ? `&projectId=${projectId}` : "";
  return apiFetchJson<Record<string, unknown>>(`${BASE}/sync?companyId=${companyId}${q}`);
}
