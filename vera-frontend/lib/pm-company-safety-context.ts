import { apiFetchJson } from "./api-client";

const BASE = `/api/v1/pm/company-safety-context`;

export async function fetchCompanySafetyContext(companyId: number) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/company/${companyId}`);
}

export async function autoGenerateCompanyProfile(companyId: number) {
  return apiFetchJson<Record<string, unknown>>(
    `${BASE}/profile/${companyId}/auto-generate`,
    { method: "POST" },
  );
}

export async function publishCompanyProfile(companyId: number) {
  return apiFetchJson<Record<string, unknown>>(
    `${BASE}/profile/${companyId}/publish`,
    { method: "POST" },
  );
}

export async function syncCompanyToProjects(companyId: number) {
  return apiFetchJson<Record<string, unknown>>(
    `${BASE}/profile/${companyId}/sync-projects`,
    { method: "POST" },
  );
}

export async function listCompanyHazards(companyId: number, status?: string) {
  const q = status ? `?status=${status}` : "";
  return apiFetchJson<Array<Record<string, unknown>>>(`${BASE}/hazards/${companyId}${q}`);
}

export async function listCompanyControls(companyId: number) {
  return apiFetchJson<Array<Record<string, unknown>>>(`${BASE}/controls/${companyId}`);
}

export async function listCompanyTrainingMatrix(companyId: number) {
  return apiFetchJson<Array<Record<string, unknown>>>(
    `${BASE}/training-matrix/${companyId}`,
  );
}

export async function fetchCompanySafetyAnalytics(companyId: number) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/analytics/${companyId}`);
}

export async function fetchCompanyCailInsights(companyId: number) {
  return apiFetchJson<Array<Record<string, unknown>>>(
    `${BASE}/cail/insights/${companyId}`,
  );
}

export async function syncPmCompanySafetyContextOffline(companyId: number) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/sync/company/${companyId}`);
}

export async function uploadPmCompanySafetyContextOffline(
  companyId: number,
  payload: Record<string, unknown>,
) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/sync/company/${companyId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function fetchCompanySafetyScore(companyId: number) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/score/${companyId}`);
}
