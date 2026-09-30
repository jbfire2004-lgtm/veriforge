import { apiFetchJson } from "./api-client";

const BASE = `/api/v1/pm/station`;

export async function registerPmStation(body: Record<string, unknown>) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function sendPmStationHeartbeat(body: {
  stationCode: string;
  batteryLevel?: number;
  storageFreeMb?: number;
  sensorHealth?: Record<string, boolean>;
  firmwareVersion?: string;
  online?: boolean;
}) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/heartbeat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function validatePmStationWorker(body: Record<string, unknown>) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/validate/worker`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function validatePmStationEquipment(body: Record<string, unknown>) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/validate/equipment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function checkInPmStationMuster(body: Record<string, unknown>) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/muster/checkin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function setPmStationEmergencyMode(stationId: number, active: boolean) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/emergency/mode`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stationId, active }),
  });
}

export async function syncPmStationOffline(
  stationId: number,
  payload: Record<string, unknown>,
) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/offline/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stationId, ...payload }),
  });
}

export async function fetchPmStation(id: number) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${id}`);
}

export async function predictPmStation(id: number, workerId?: number) {
  const q = workerId ? `?workerId=${workerId}` : "";
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${id}/predict${q}`);
}
