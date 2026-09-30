import { apiGet, apiPost, apiPut } from "@/lib/api";

const BASE = "/api/v1/competency";

export type CompetencyCheck = {
  eligible: boolean;
  reason?: string;
  requireEvaluation: boolean;
  minPassingScore: number;
  latestEvaluation?: {
    id: number;
    score: number;
    evaluationDate: string;
    expiresAt: string | null;
    expired: boolean;
  };
};

export type CompetencyDashboard = {
  totalEvaluations: number;
  passing: number;
  expiringSoon: number;
  expired: number;
  operatorLinks: number;
  recent: unknown[];
};

export async function getCompetencyDashboard(companyId?: number) {
  const qs = companyId ? `?companyId=${companyId}` : "";
  return apiGet<CompetencyDashboard>(`${BASE}/dashboard${qs}`);
}

export async function evaluateCompetency(body: {
  workerId: number;
  equipmentId: number;
  score: number;
  passed: boolean;
  evaluationDate?: string;
  notes?: string;
  evidenceNotes?: string;
  workerSignature?: string;
  evaluatorSignature?: string;
}) {
  return apiPost(`${BASE}/evaluate`, body);
}

export async function checkCompetency(workerId: number, equipmentId: number) {
  return apiPost<CompetencyCheck>(`${BASE}/check`, { workerId, equipmentId });
}

export async function getWorkerCompetencyHistory(workerId: number) {
  return apiGet<unknown[]>(`${BASE}/workers/${workerId}`);
}

export async function getEquipmentCompetencyEvaluations(equipmentId: number) {
  return apiGet<unknown[]>(`${BASE}/equipment/${equipmentId}`);
}

export async function getEquipmentCompetencyRequirements(equipmentId: number) {
  return apiGet<unknown>(`${BASE}/equipment/${equipmentId}/requirements`);
}

export async function upsertEquipmentCompetencyRequirements(
  equipmentId: number,
  body: Record<string, unknown>,
) {
  return apiPut(`${BASE}/equipment/${equipmentId}/requirements`, body);
}
