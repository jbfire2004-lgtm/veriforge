import { apiFetchJson } from "./api-client";

const BASE = `/api/v1/pm/safety-stations`;

export type StationWorkerValidation = {
  granted: boolean;
  denialReasons: string[];
  checks: Record<string, boolean>;
  requiredPpe?: string[];
  cail?: { likelyDenied: boolean; probability: number; topFactors: string[] };
  log?: { id: string };
};

export async function listSafetyStations(companyId: number, projectId?: number) {
  const q = new URLSearchParams({ companyId: String(companyId) });
  if (projectId) q.set("projectId", String(projectId));
  return apiFetchJson<Array<Record<string, unknown>>>(`${BASE}?${q}`);
}

export async function registerSafetyStation(body: Record<string, unknown>) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function activateSafetyStation(id: number) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${id}/activate`, {
    method: "PUT",
  });
}

export async function fetchStationHealth(projectId?: number, siteId?: number) {
  const q = new URLSearchParams();
  if (projectId) q.set("projectId", String(projectId));
  if (siteId) q.set("siteId", String(siteId));
  return apiFetchJson<Array<Record<string, unknown>>>(`${BASE}/health?${q}`);
}

export async function validateStationWorker(body: {
  stationId?: number;
  stationCode?: string;
  workerId: number;
  projectId: number;
  zoneCode?: string;
  equipmentId?: number;
  action?: string;
}) {
  return apiFetchJson<StationWorkerValidation>(`${BASE}/validate-worker`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function validateStationEquipment(body: {
  stationId?: number;
  stationCode?: string;
  equipmentId: number;
  workerId?: number;
  projectId?: number;
}) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/validate-equipment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function fetchStationAccessLogs(filters: {
  stationId?: number;
  projectId?: number;
  workerId?: number;
  limit?: number;
}) {
  const q = new URLSearchParams();
  if (filters.stationId) q.set("stationId", String(filters.stationId));
  if (filters.projectId) q.set("projectId", String(filters.projectId));
  if (filters.workerId) q.set("workerId", String(filters.workerId));
  if (filters.limit) q.set("limit", String(filters.limit));
  return apiFetchJson<Array<Record<string, unknown>>>(`${BASE}/access-logs?${q}`);
}

export async function fetchStationEquipmentLogs(stationId?: number, limit?: number) {
  const q = new URLSearchParams();
  if (stationId) q.set("stationId", String(stationId));
  if (limit) q.set("limit", String(limit));
  return apiFetchJson<Array<Record<string, unknown>>>(`${BASE}/equipment-logs?${q}`);
}

export async function fetchMusterStatus(projectId: number) {
  return apiFetchJson<Record<string, unknown>>(
    `${BASE}/muster/status?projectId=${projectId}`,
  );
}

export async function fetchStationAnalytics(projectId: number) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/analytics?projectId=${projectId}`);
}

export async function fetchStationCailInsights(projectId: number) {
  return apiFetchJson<Array<Record<string, unknown>>>(
    `${BASE}/cail/insights?projectId=${projectId}`,
  );
}

export async function buildStationOfflineBundle(stationId: number) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${stationId}/offline-bundle`);
}

export async function applyStationOfflineSync(
  stationId: number,
  events: Record<string, unknown>,
) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${stationId}/offline-sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(events),
  });
}

export async function syncPmSafetyStationsOffline(stationId: number) {
  return buildStationOfflineBundle(stationId);
}

export async function setStationEmergencyMode(stationId: number, active: boolean) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${stationId}/emergency-mode`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ active }),
  });
}

export async function fetchStationById(stationId: number) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${stationId}`);
}

export async function predictStationRisk(stationId: number, workerId?: number) {
  const q = workerId ? `?workerId=${workerId}` : "";
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${stationId}/predict${q}`);
}
