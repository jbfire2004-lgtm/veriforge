import { apiFetchJson } from "./api-client";

const BASE = `/api/v1/pm/project/safety`;

export type ProjectSafetyScore = {
  projectId: number;
  score: number;
  maxScore: number;
  band: string;
  predictedRisk: number;
  weakControls: string[];
  zoneScores: Array<{ zoneCode: string; score: number }>;
  workflowState: string;
  computedAt: string;
};

export async function upsertPmProjectSafetyProfile(body: {
  projectId: number;
  autoGenerate?: boolean;
  publish?: boolean;
  updates?: Record<string, unknown>;
}) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function createPmProjectHazard(body: {
  projectId: number;
  category: string;
  title: string;
  description: string;
  severity?: number;
  likelihood?: number;
  sifPotential?: boolean;
}) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/hazards`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function createPmProjectControl(body: {
  projectId: number;
  controlType: string;
  title: string;
  description: string;
  ppeRequired?: boolean;
}) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/controls`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function upsertPmProjectZoneRules(
  projectId: number,
  zones: Array<Record<string, unknown>>,
) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/zones`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId, zones }),
  });
}

export async function upsertPmProjectEquipmentRules(
  projectId: number,
  equipmentRules: Record<string, unknown>,
) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/equipment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId, equipmentRules }),
  });
}

export async function upsertPmProjectTrainingRules(
  projectId: number,
  trainingRules: Record<string, unknown>,
) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/training`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId, trainingRules }),
  });
}

export async function upsertPmProjectEmergencyRules(
  projectId: number,
  emergencyRules: Record<string, unknown>,
) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/emergency`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId, emergencyRules }),
  });
}

export async function createPmProjectSafetyOverride(body: {
  projectId: number;
  overrideType: string;
  ruleKey: string;
  reason: string;
  expiry?: string;
  overrideJson?: Record<string, unknown>;
}) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/override`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function syncPmProjectSafetyOffline(
  projectId: number,
  payload: Record<string, unknown>,
) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/offline/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId, ...payload }),
  });
}

export async function fetchPmProjectSafetyScore(
  projectId: number,
): Promise<ProjectSafetyScore> {
  return apiFetchJson<ProjectSafetyScore>(`${BASE}/${projectId}/score`);
}

export async function fetchPmProjectSafetyAnalytics(projectId: number) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${projectId}/analytics`);
}

export async function fetchPmProjectSafetyCailBundle(projectId: number) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${projectId}/cail`);
}
