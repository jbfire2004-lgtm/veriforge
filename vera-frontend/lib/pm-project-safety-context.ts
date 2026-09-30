import { apiFetchJson } from "./api-client";

const BASE = `/api/v1/pm/project-safety-context`;

export async function fetchProjectSafetyContext(projectId: number) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/project/${projectId}`);
}

export async function fetchProjectSafetyProfile(projectId: number) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/profile/${projectId}`);
}

export async function updateProjectSafetyProfile(
  projectId: number,
  body: Record<string, unknown>,
) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/profile/${projectId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function autoGenerateProjectSafetyProfile(projectId: number) {
  return apiFetchJson<Record<string, unknown>>(
    `${BASE}/profile/${projectId}/auto-generate`,
    { method: "POST" },
  );
}

export async function publishProjectSafetyProfile(projectId: number) {
  return apiFetchJson<Record<string, unknown>>(
    `${BASE}/profile/${projectId}/publish`,
    { method: "POST" },
  );
}

export async function listProjectHazards(projectId: number, status?: string) {
  const q = status ? `?status=${status}` : "";
  return apiFetchJson<Array<Record<string, unknown>>>(
    `${BASE}/hazards/${projectId}${q}`,
  );
}

export async function importProjectHazards(
  projectId: number,
  sources: string[],
) {
  return apiFetchJson<Record<string, unknown>>(
    `${BASE}/hazards/${projectId}/import`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sources }),
    },
  );
}

export async function publishProjectHazard(hazardId: string) {
  return apiFetchJson<Record<string, unknown>>(
    `${BASE}/hazards/${hazardId}/publish`,
    { method: "POST" },
  );
}

export async function listProjectControls(projectId: number) {
  return apiFetchJson<Array<Record<string, unknown>>>(
    `${BASE}/controls/${projectId}`,
  );
}

export async function importProjectControls(projectId: number) {
  return apiFetchJson<Record<string, unknown>>(
    `${BASE}/controls/${projectId}/import`,
    { method: "POST" },
  );
}

export async function fetchProjectSafetyCailInsights(projectId: number) {
  return apiFetchJson<Array<Record<string, unknown>>>(
    `${BASE}/cail/insights/${projectId}`,
  );
}

export async function syncPmProjectSafetyContextOffline(projectId: number) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/sync/project/${projectId}`);
}

export async function uploadPmProjectSafetyContextOffline(
  projectId: number,
  payload: Record<string, unknown>,
) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/sync/project/${projectId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function fetchProjectSafetyScore(projectId: number) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/score/${projectId}`);
}

export async function fetchProjectSafetyAnalytics(projectId: number) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/analytics/${projectId}`);
}
