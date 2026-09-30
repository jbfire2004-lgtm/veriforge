import { apiFetchJson } from "./api-client";

const BASE = `/api/v1/pm/cail`;

export async function fetchPmCailDashboard(companyId: number, projectId?: number) {
  const q = projectId ? `&projectId=${projectId}` : "";
  return apiFetchJson<Record<string, unknown>>(`${BASE}/dashboard?companyId=${companyId}${q}`);
}

export async function predictPmCail(body: {
  companyId: number;
  projectId: number;
  workerId?: number;
  equipmentId?: number;
  predictionType?: string;
}) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function scorePmCail(body: {
  companyId: number;
  projectId: number;
  workerId?: number;
  equipmentId?: number;
  scoreType?: string;
}) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/score`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function recommendPmCail(body: { companyId: number; projectId: number }) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function correlatePmCail(body: { companyId: number; projectId: number }) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/correlate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function explainPmCail(body: {
  companyId: number;
  projectId?: number;
  explainabilityId?: string;
  predictionType?: string;
  entityId?: string;
}) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/explain`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function trainPmCailModel(body: {
  companyId: number;
  projectId: number;
  modelId?: string;
}) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/model/train`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function deployPmCailModel(modelId: string, version: number) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/model/deploy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ modelId, version }),
  });
}

export async function rollbackPmCailModel(modelId: string, toVersion: number) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/model/rollback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ modelId, toVersion }),
  });
}

export async function offlineInferPmCail(body: {
  companyId: number;
  projectId: number;
  workerId?: number;
  equipmentId?: number;
  localScores?: Array<Record<string, unknown>>;
  localPredictions?: Array<Record<string, unknown>>;
}) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/offline/infer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function syncPmCailOffline(body: {
  companyId: number;
  projectId: number;
  predictions?: Array<Record<string, unknown>>;
  scores?: Array<Record<string, unknown>>;
  recommendations?: Array<Record<string, unknown>>;
}) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/offline/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function fetchPmCailModel(id: string) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/model/${id}`);
}
