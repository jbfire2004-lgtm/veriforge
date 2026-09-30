import { apiFetchJson } from "./api-client";

const BASE = `/api/v1/pm/corrective-actions`;

export type PmCorrectiveAction = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  actionType: string;
  priorityScore: number;
  severityScore: number;
  escalationLevel: number;
  dueAt: string | null;
  sourceModule: string;
  cailEntry?: { id: string; status: string };
  assignees: Array<{ id: string; role: string; user?: { username: string } }>;
  escalations?: Array<{ id: string; level: number; reason: string; triggeredAt: string }>;
  verifications?: Array<{ id: string; outcome: string; role: string; notes?: string | null }>;
  description?: string | null;
};

export async function submitPmCapaVerification(id: string) {
  return apiFetchJson<PmCorrectiveAction>(`${BASE}/${id}/submit-verification`, {
    method: "POST",
  });
}

export async function markPmCapaInProgress(id: string) {
  return apiFetchJson<PmCorrectiveAction>(`${BASE}/${id}/in-progress`, {
    method: "PUT",
  });
}

export async function assignPmCorrectiveAction(
  id: string,
  body: { userId?: number; workerId?: number; role?: string },
) {
  return apiFetchJson<PmCorrectiveAction>(`${BASE}/${id}/assign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function autoSyncPmCapa(projectId: number) {
  return apiFetchJson<{ jha: number; inspection: number; sif: number }>(
    `${BASE}/auto/sync-project?projectId=${projectId}`,
    { method: "POST" },
  );
}

export async function listPmCorrectiveActions(
  projectId: number,
  overdueOnly?: boolean,
) {
  const q = new URLSearchParams({ projectId: String(projectId) });
  if (overdueOnly) q.set("overdueOnly", "true");
  return apiFetchJson<PmCorrectiveAction[]>(`${BASE}?${q}`);
}

export async function getPmCorrectiveAction(id: string) {
  return apiFetchJson<PmCorrectiveAction>(`${BASE}/${id}`);
}

export async function createPmCorrectiveAction(body: {
  companyId: number;
  projectId: number;
  sourceModule: string;
  sourceId: string;
  title: string;
  description?: string;
  actionType?: string;
  severity?: string;
  assignUserId?: number;
  equipmentId?: number;
}) {
  return apiFetchJson<PmCorrectiveAction>(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function verifyPmCorrectiveAction(
  id: string,
  outcome: "approve" | "reject",
  role: string,
  notes?: string,
) {
  return apiFetchJson<PmCorrectiveAction>(`${BASE}/${id}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ outcome, role, notes }),
  });
}

export async function runPmCapaEscalations(projectId: number) {
  return apiFetchJson<unknown[]>(`${BASE}/escalations/run?projectId=${projectId}`, {
    method: "POST",
  });
}

export async function fetchPmCapaAnalytics(projectId: number) {
  return apiFetchJson<Record<string, unknown>>(
    `${BASE}/analytics/project/${projectId}`,
  );
}

export async function syncPmCapaOffline(payload: Record<string, unknown>) {
  return apiFetchJson<PmCorrectiveAction>(`${BASE}/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
