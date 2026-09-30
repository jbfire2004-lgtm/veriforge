import { apiGet, apiPatch, apiPost } from "@/lib/api";

const BASE = "/api/v1/tools-ppe";

export type ToolsPpeDashboard = {
  toolCount: number;
  toolsInspectionDue: number;
  ppeCount: number;
  ppeExpired: number;
  ppeExpiringSoon: number;
  activeToolAssignments: number;
  activePpeAssignments: number;
};

export type ToolRow = {
  id: number;
  name: string;
  serialNumber: string | null;
  status: string;
  nextInspectionAt: string | null;
  assignments?: { worker?: { firstName: string; lastName: string } }[];
};

export type PpeRow = {
  id: number;
  name: string;
  ppeType: string;
  status: string;
  expiresAt: string;
  assignments?: { worker?: { firstName: string; lastName: string } }[];
};

export async function getToolsPpeDashboard(companyId?: number) {
  const qs = companyId ? `?companyId=${companyId}` : "";
  return apiGet<ToolsPpeDashboard>(`${BASE}/dashboard${qs}`);
}

export async function listTools(companyId?: number) {
  const qs = companyId ? `?companyId=${companyId}` : "";
  return apiGet<ToolRow[]>(`${BASE}/tools${qs}`);
}

export async function listPpe(companyId?: number) {
  const qs = companyId ? `?companyId=${companyId}` : "";
  return apiGet<PpeRow[]>(`${BASE}/ppe${qs}`);
}

export async function createTool(body: Record<string, unknown>) {
  return apiPost(`${BASE}/tools`, body);
}

export async function createPpe(body: Record<string, unknown>) {
  return apiPost(`${BASE}/ppe`, body);
}

export async function getTool(id: number) {
  return apiGet<{ id: number; name: string; defaultChecklist: { id: string; label: string; required?: boolean }[]; inspections: unknown[] }>(
    `${BASE}/tools/${id}`,
  );
}

export async function getPpe(id: number) {
  return apiGet<{ id: number; name: string; ppeType: string; expiresAt: string; inspections: unknown[] }>(
    `${BASE}/ppe/${id}`,
  );
}

export async function inspectTool(id: number, body: Record<string, unknown>) {
  return apiPost(`${BASE}/tools/${id}/inspect`, body);
}

export async function inspectPpe(id: number, body: Record<string, unknown>) {
  return apiPost(`${BASE}/ppe/${id}/inspect`, body);
}

export async function assignToolToWorker(toolId: number, workerId: number, projectId?: number) {
  return apiPost(`${BASE}/tools/${toolId}/assign-worker`, { workerId, projectId });
}

export async function assignPpeToWorker(ppeId: number, workerId: number, projectId?: number) {
  return apiPost(`${BASE}/ppe/${ppeId}/assign-worker`, { workerId, projectId });
}

export async function processPpeExpiry(companyId?: number) {
  const qs = companyId ? `?companyId=${companyId}` : "";
  return apiPost<{ ppeExpired: number; toolsMarkedDue: number }>(
    `${BASE}/ppe/process-expiry${qs}`,
    {},
  );
}
