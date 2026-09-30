import { apiFetchJson } from "./api-client";

const BASE = `/api/v1/pm/corrective-action`;

export async function createPmCorrectiveAction(body: {
  companyId: number;
  projectId: number;
  title: string;
  description?: string;
  sourceModule: string;
  sourceId: string;
  severity?: string;
  actionType?: string;
  hazardId?: string;
  controlId?: string;
  workerId?: number;
  equipmentId?: number;
  publish?: boolean;
}) {
  return apiFetchJson<Record<string, unknown>>(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function fetchPmCorrectiveAction(id: string) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${id}`);
}

export async function assignPmCorrectiveAction(body: {
  actionId: string;
  userId?: number;
  workerId?: number;
  role?: "primary" | "secondary";
}) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/assign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function escalatePmCorrectiveActions(projectId: number) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/escalate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId }),
  });
}

export async function verifyPmCorrectiveAction(body: {
  actionId: string;
  outcome: "approve" | "reject";
  role: string;
  notes?: string;
}) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function syncPmCorrectiveActionOffline(body: {
  companyId: number;
  projectId: number;
  actions?: Array<Record<string, unknown>>;
  verifications?: Array<{
    actionId: string;
    outcome: "approve" | "reject";
    role: string;
    notes?: string;
  }>;
  attachments?: Array<{
    actionId: string;
    fileName?: string;
    mimeType?: string;
    dataUrl?: string;
    phase?: string;
    clientSyncId?: string;
  }>;
}) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/offline/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
