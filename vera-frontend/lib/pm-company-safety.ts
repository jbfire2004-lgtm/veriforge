import { apiFetchJson } from "./api-client";

const BASE = `/api/v1/pm/company/safety`;

export type CompanySafetyScore = {
  companyId: number;
  score: number;
  maxScore: number;
  band: string;
  predictedRisk: number;
  weakControls: string[];
  workflowState: string;
  computedAt: string;
};

export async function upsertPmCompanySafetyProfile(body: {
  companyId: number;
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

export async function createPmCompanyHazard(body: {
  companyId: number;
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

export async function createPmCompanyControl(body: {
  companyId: number;
  controlType: string;
  title: string;
  description: string;
  controlStrength?: number;
}) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/controls`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function upsertPmCompanyTrainingRule(body: {
  companyId: number;
  roleType: string;
  category: string;
  trainingCode: string;
  trainingName: string;
  expiresInDays?: number;
}) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/training`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function createPmCompanyPolicy(body: {
  companyId: number;
  policyType: string;
  title: string;
  requiresAckForAccess?: boolean;
}) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/policy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function createPmCompanySds(body: {
  companyId: number;
  productName: string;
  casNumber?: string;
  whmisClass?: string;
  expiresAt?: string;
}) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/sds`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function createPmCompanyEmergencyPlan(body: {
  companyId: number;
  planType: string;
  title: string;
  contentJson?: Record<string, unknown>;
}) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/emergency`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function upsertPmCompanyEquipmentRule(body: {
  companyId: number;
  ruleKey: string;
  requiredInspections?: unknown[];
  requiredCerts?: unknown[];
  requiredControls?: unknown[];
}) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/equipment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function upsertPmCompanyZoneTemplate(body: {
  companyId: number;
  templateCode: string;
  zoneType: string;
  title: string;
  requiredTraining?: unknown[];
  requiredPpe?: unknown[];
  requiresJha?: boolean;
  highRisk?: boolean;
}) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/zones`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function createPmCompanySafetyOverride(body: {
  companyId: number;
  overrideType: string;
  ruleKey: string;
  reason: string;
  expiry?: string;
  supervisorSig?: string;
  safetySig?: string;
}) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/override`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function syncPmCompanySafetyOffline(
  companyId: number,
  payload: Record<string, unknown>,
) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/offline/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ companyId, ...payload }),
  });
}

export async function fetchPmCompanySafetyScore(
  companyId: number,
): Promise<CompanySafetyScore> {
  return apiFetchJson<CompanySafetyScore>(`${BASE}/${companyId}/score`);
}

export async function fetchPmCompanySafetyAnalytics(companyId: number) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${companyId}/analytics`);
}

export async function fetchPmCompanySafetyCailBundle(companyId: number) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${companyId}/cail`);
}
