import { apiFetchJson } from "./api-client";

const BASE = `/api/v1/pm/offline-mode`;

export async function syncPmOfflineMode(body: {
  deviceId: string;
  companyId?: number;
  projectId?: number;
  batchId?: string;
  actions: Array<{
    type: string;
    recordId?: string;
    payload: Record<string, unknown>;
    clientVersion?: number;
    lastModified?: string;
  }>;
}) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function resolvePmOfflineModeConflict(body: {
  conflictId: string;
  strategy?: "prefer_local" | "prefer_server" | "merge";
  resolvedValue?: Record<string, unknown>;
  retrySync?: boolean;
}) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/conflict/resolve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function fetchPmOfflineModeDevice(deviceId: string, projectId?: number) {
  const q = projectId ? `?projectId=${projectId}` : "";
  return apiFetchJson<Record<string, unknown>>(`${BASE}/device/${deviceId}${q}`);
}

export async function fetchPmOfflineAnalytics(projectId: number) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/analytics/project/${projectId}`);
}

export async function fetchPmOfflineDelta(companyId?: number, since?: string) {
  const q = new URLSearchParams();
  if (companyId) q.set("companyId", String(companyId));
  if (since) q.set("since", since);
  return apiFetchJson<Record<string, unknown>>(`${BASE}/delta?${q}`);
}
