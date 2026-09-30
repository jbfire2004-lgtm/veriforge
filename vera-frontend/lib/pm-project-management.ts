import { apiFetchJson } from "./api-client";

const BASE = `/api/v1/pm/project-management`;

export type PmProjectRow = {
  id: number;
  name: string;
  code: string | null;
  status: string;
  companyId: number;
  company?: { id: number; name: string };
  pmProjectConfig?: unknown;
  _count?: { pmPmTasks: number; pmWorkPackages: number; pmPmWorkerAssignments: number };
};

async function pmFetch<T>(path: string, init?: RequestInit): Promise<T> {
  return apiFetchJson<T>(`${BASE}${path}`, init);
}

export async function fetchPmProjects(companyId?: number) {
  const q = companyId ? `?companyId=${companyId}` : "";
  return pmFetch<PmProjectRow[]>(`/projects${q}`);
}

export async function createPmProject(body: Record<string, unknown>) {
  return pmFetch<Record<string, unknown>>("/project", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function fetchPmProjectDashboard(projectId: number) {
  return pmFetch<Record<string, unknown>>(`/project/${projectId}/dashboard`);
}

export async function fetchPmProjectReadiness(projectId: number) {
  return pmFetch<Record<string, unknown>>(`/project/${projectId}/readiness`);
}

export async function fetchPmProjectActivity(projectId: number) {
  return pmFetch<Record<string, unknown>>(`/project/${projectId}/activity`);
}

export async function configurePmProject(projectId: number, body: Record<string, unknown>) {
  return pmFetch<Record<string, unknown>>(`/project/${projectId}/configure`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function fetchPmWorkPackages(projectId: number) {
  return pmFetch<Array<Record<string, unknown>>>(`/project/${projectId}/work-packages`);
}

export async function createPmWorkPackage(projectId: number, body: Record<string, unknown>) {
  return pmFetch<Record<string, unknown>>(`/project/${projectId}/work-packages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function publishPmWorkPackage(workPackageId: string) {
  return pmFetch<Record<string, unknown>>(`/work-packages/${workPackageId}/publish`, {
    method: "POST",
  });
}

export async function fetchPmTasks(projectId: number, workPackageId?: string) {
  const q = workPackageId ? `?workPackageId=${workPackageId}` : "";
  return pmFetch<Array<Record<string, unknown>>>(`/project/${projectId}/tasks${q}`);
}

export async function createPmTask(projectId: number, body: Record<string, unknown>) {
  return pmFetch<Record<string, unknown>>(`/project/${projectId}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function startPmTask(taskId: string) {
  return pmFetch<Record<string, unknown>>(`/tasks/${taskId}/start`, { method: "POST" });
}

export async function updatePmTaskProgress(taskId: string, progressPct: number) {
  return pmFetch<Record<string, unknown>>(`/tasks/${taskId}/progress`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ progressPct }),
  });
}

export async function evaluatePmTaskGate(taskId: string) {
  return pmFetch<Record<string, unknown>>(`/tasks/${taskId}/gate`, { method: "POST" });
}

export async function fetchPmSchedule(projectId: number) {
  return pmFetch<Array<Record<string, unknown>>>(`/project/${projectId}/schedule`);
}

export async function createPmScheduleEntry(projectId: number, body: Record<string, unknown>) {
  return pmFetch<Record<string, unknown>>(`/project/${projectId}/schedule`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function fetchPmWorkerAssignments(projectId: number) {
  return pmFetch<Array<Record<string, unknown>>>(
    `/project/${projectId}/assignments/workers`,
  );
}

export async function assignPmWorker(projectId: number, body: Record<string, unknown>) {
  return pmFetch<Record<string, unknown>>(`/project/${projectId}/assignments/worker`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function fetchPmEquipmentAssignments(projectId: number) {
  return pmFetch<Array<Record<string, unknown>>>(
    `/project/${projectId}/assignments/equipment`,
  );
}

export async function assignPmEquipment(projectId: number, body: Record<string, unknown>) {
  return pmFetch<Record<string, unknown>>(`/project/${projectId}/assignments/equipment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function fetchPmPermits(projectId: number) {
  return pmFetch<Array<Record<string, unknown>>>(`/project/${projectId}/permits`);
}

export async function createPmPermit(
  projectId: number,
  body: { permitType: string; title: string } & Record<string, unknown>,
) {
  return pmFetch<Record<string, unknown>>(`/project/${projectId}/permits`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function submitPmPermit(permitId: string) {
  return pmFetch<Record<string, unknown>>(`/permits/${permitId}/submit`, { method: "POST" });
}

export async function approvePmPermit(permitId: string) {
  return pmFetch<Record<string, unknown>>(`/permits/${permitId}/approve`, { method: "POST" });
}

export async function activatePmPermit(permitId: string) {
  return pmFetch<Record<string, unknown>>(`/permits/${permitId}/activate`, { method: "POST" });
}

export async function fetchPmProjectAnalytics(projectId: number) {
  return pmFetch<Record<string, unknown>>(`/project/${projectId}/analytics`);
}

export async function fetchPmProjectCailInsights(projectId: number) {
  return pmFetch<Array<Record<string, unknown>>>(`/project/${projectId}/cail/insights`);
}

export async function optimizePmSchedule(projectId: number, companyId: number) {
  return pmFetch<Record<string, unknown>>(
    `/project/${projectId}/scheduling/optimize?companyId=${companyId}`,
    { method: "POST" },
  );
}

export async function applyPmSchedule(projectId: number, report: Record<string, unknown>) {
  return pmFetch<Record<string, unknown>>(`/project/${projectId}/scheduling/apply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ report }),
  });
}

export async function runPmDispatch(projectId: number, companyId: number) {
  return pmFetch<Record<string, unknown>>(
    `/project/${projectId}/dispatch/run?companyId=${companyId}`,
    { method: "POST" },
  );
}

export async function applyPmDispatch(projectId: number, report: Record<string, unknown>) {
  return pmFetch<Record<string, unknown>>(`/project/${projectId}/dispatch/apply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ report }),
  });
}

export async function syncPmProjectManagementOffline(projectId: number) {
  return pmFetch<Record<string, unknown>>(`/sync/${projectId}`);
}

export async function applyPmProjectManagementOfflineSync(
  projectId: number,
  payload: Record<string, unknown>,
) {
  return pmFetch<Record<string, unknown>>(`/sync/${projectId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
