import { apiFetchJson } from "./api-client";

const BASE = `/api/v1/pm/access`;

export type AccessValidationResult = {
  decision: string;
  granted: boolean;
  result: "granted" | "denied" | "override_required";
  workflowState: string;
  denialReasons: string[];
  checks: Record<string, boolean>;
  attemptId?: string;
};

export async function validatePmAccess(body: {
  workerId: number;
  projectId: number;
  zoneCode?: string;
  equipmentId?: number;
  accessPointId?: string;
}) {
  return apiFetchJson<AccessValidationResult>(`${BASE}/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function createPmAccessOverride(body: Record<string, unknown>) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/override`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function syncPmAccessOffline(
  projectId: number,
  payload: Record<string, unknown>,
) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/offline/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId, ...payload }),
  });
}

export async function fetchPmWorkerAccessProfile(
  workerId: number,
  projectId: number,
) {
  return apiFetchJson<Record<string, unknown>>(
    `${BASE}/worker/${workerId}?projectId=${projectId}`,
  );
}

export async function predictPmWorkerAccess(
  workerId: number,
  projectId: number,
) {
  return apiFetchJson<Record<string, unknown>>(
    `${BASE}/worker/${workerId}/predict?projectId=${projectId}`,
  );
}

export async function fetchPmEquipmentAccessProfile(
  equipmentId: number,
  projectId: number,
) {
  return apiFetchJson<Record<string, unknown>>(
    `${BASE}/equipment/${equipmentId}?projectId=${projectId}`,
  );
}

export async function predictPmEquipmentAccess(equipmentId: number) {
  return apiFetchJson<Record<string, unknown>>(
    `${BASE}/equipment/${equipmentId}/predict`,
  );
}
