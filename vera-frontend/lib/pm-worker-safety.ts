import { apiFetchJson } from "./api-client";

const BASE = `/api/v1/pm/worker/safety`;

export type WorkerSafetyScore = {
  workerId: number;
  score: number;
  maxScore: number;
  riskLevel: string;
  complianceState: string;
  computedAt: string;
};

export async function fetchPmWorkerSafetyProfile(body: {
  workerId: number;
  rebuild?: boolean;
  projectId?: number;
  roleType?: string;
  tradeCode?: string;
}) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function upsertPmWorkerTraining(body: {
  workerId: number;
  trainingCode: string;
  courseName: string;
  completedAt?: string;
  expiryDate?: string;
  competencyLevel?: number;
}) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/training`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function createPmWorkerAuthorization(body: {
  workerId: number;
  authType?: string;
  authorizationType?: string;
  equipmentId?: number;
  issueDate?: string;
  expiryDate?: string;
}) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/authorization`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function addPmWorkerMedicalRestriction(body: {
  workerId: number;
  restrictionType: string;
  description: string;
  expiry?: string;
  blocksHighRisk?: boolean;
  blocksEquipment?: boolean;
}) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/restriction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function recordPmWorkerHazardExposure(body: {
  workerId: number;
  hazardType?: string;
  hazardId?: string;
  severity?: number;
  likelihood?: number;
  exposureDate?: string;
  projectId?: number;
}) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/exposure`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function linkPmWorkerCorrectiveAction(body: {
  workerId: number;
  correctiveActionId: string;
  status?: string;
  dueDate?: string;
}) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/corrective`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function createPmWorkerSafetyOverride(body: {
  workerId: number;
  overrideType: string;
  ruleKey: string;
  reason: string;
  expiry?: string;
  projectId?: number;
}) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/override`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function syncPmWorkerSafetyOffline(
  workerId: number,
  payload: Record<string, unknown>,
) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/offline/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ workerId, ...payload }),
  });
}

export async function fetchPmWorkerSafetyScore(
  workerId: number,
  projectId?: number,
): Promise<WorkerSafetyScore> {
  const q = projectId ? `?projectId=${projectId}` : "";
  return apiFetchJson<WorkerSafetyScore>(`${BASE}/${workerId}/score${q}`);
}

export async function fetchPmWorkerSafetyAnalytics(workerId: number) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${workerId}/analytics`);
}

export async function fetchPmWorkerSafetyCailBundle(
  workerId: number,
  projectId?: number,
) {
  const q = projectId ? `?projectId=${projectId}` : "";
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${workerId}/cail${q}`);
}
