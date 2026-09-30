import { apiFetchJson } from "./api-client";

const BASE = `/api/v1/pm/project`;

export async function createPmProject(body: {
  companyId: number;
  name: string;
  code?: string;
  siteId?: number;
  type?: string;
  scope?: Record<string, unknown>;
  startDate?: string;
  endDate?: string;
  autoConfigure?: boolean;
}) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function createPmProjectWorkPackage(
  projectId: number,
  body: Record<string, unknown>,
) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/work-package`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId, ...body }),
  });
}

export async function createPmProjectTask(
  projectId: number,
  body: Record<string, unknown>,
) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/task`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId, ...body }),
  });
}

export async function createPmProjectSchedule(
  projectId: number,
  body: Record<string, unknown>,
) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/schedule`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId, ...body }),
  });
}

export async function assignPmProjectWorker(
  projectId: number,
  body: Record<string, unknown>,
) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/assign/worker`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId, ...body }),
  });
}

export async function assignPmProjectEquipment(
  projectId: number,
  body: Record<string, unknown>,
) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/assign/equipment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId, ...body }),
  });
}

export async function createPmProjectPermit(
  projectId: number,
  body: Record<string, unknown>,
) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/permit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId, ...body }),
  });
}

export async function updatePmProjectProgress(
  taskId: string,
  progressPct: number,
) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/progress`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ taskId, progressPct }),
  });
}

export async function syncPmProjectOffline(
  projectId: number,
  payload: Record<string, unknown>,
) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/offline/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId, ...payload }),
  });
}

export async function fetchPmProjectDashboard(projectId: number) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${projectId}/dashboard`);
}

export async function fetchPmProjectCailBundle(projectId: number) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${projectId}/cail`);
}

export async function fetchPmProjectAnalytics(projectId: number) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${projectId}/analytics`);
}
