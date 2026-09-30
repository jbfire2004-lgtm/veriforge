import { apiFetchJson } from "./api-client";

const BASE = `/api/v1/pm/offline`;

export async function syncPmOffline(body: {
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

export async function resolvePmOfflineConflict(body: {
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

export async function fetchPmOfflineDeviceStatus(
  deviceId: string,
  projectId?: number,
) {
  const q = projectId ? `?projectId=${projectId}` : "";
  return apiFetchJson<Record<string, unknown>>(`${BASE}/device/${deviceId}${q}`);
}
