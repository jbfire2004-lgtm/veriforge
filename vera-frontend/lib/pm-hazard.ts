import { apiFetchJson } from "./api-client";

const HAZARD_BASE = `/api/v1/pm/hazard`;
const CONTROL_BASE = `/api/v1/pm/control`;

export async function createPmHazard(body: {
  companyId: number;
  title: string;
  description: string;
  category?: string;
  hazardType?: string;
  severity?: number;
  likelihood?: number;
  projectId?: number;
  energyTypes?: string[];
  trainingCodes?: string[];
  ppeTypes?: string[];
}) {
  return apiFetchJson<Record<string, unknown>>(HAZARD_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function fetchPmHazard(id: string) {
  return apiFetchJson<Record<string, unknown>>(`${HAZARD_BASE}/${id}`);
}

export async function ingestPmHazards(body: {
  companyId: number;
  source: string;
  projectId?: number;
}) {
  return apiFetchJson<Record<string, unknown>>(`${HAZARD_BASE}/ingest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function mapPmHazardControls(body: {
  hazardId: string;
  controlId: string;
  effectivenessScore?: number;
}) {
  return apiFetchJson<Record<string, unknown>>(`${HAZARD_BASE}/map-controls`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function scorePmHazardSifHeca(hazardId: string) {
  return apiFetchJson<Record<string, unknown>>(`${HAZARD_BASE}/sif-heca`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hazardId }),
  });
}

export async function syncPmHazardOffline(
  body: {
    companyId: number;
    projectId?: number;
    hazards?: Array<Record<string, unknown>>;
    controls?: Array<Record<string, unknown>>;
    mappings?: Array<{ hazardId: string; controlId: string; effectivenessScore?: number }>;
  },
) {
  return apiFetchJson<Record<string, unknown>>(`${HAZARD_BASE}/offline/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function fetchPmHazardEnergyWheel(hazardId: string) {
  return apiFetchJson<Record<string, unknown>>(`${HAZARD_BASE}/${hazardId}/energy-wheel`);
}

export async function fetchPmHazardCailBundle(
  hazardId: string,
  companyId: number,
  projectId?: number,
) {
  const q = projectId ? `&projectId=${projectId}` : "";
  return apiFetchJson<Record<string, unknown>>(
    `${HAZARD_BASE}/${hazardId}/cail?companyId=${companyId}${q}`,
  );
}

export async function createPmControl(body: {
  companyId: number;
  title: string;
  description: string;
  controlType?: string;
  controlStrength?: number;
  hierarchyLevel?: number;
  projectId?: number;
  verificationSteps?: Array<{ description: string; stepOrder?: number }>;
}) {
  return apiFetchJson<Record<string, unknown>>(CONTROL_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function fetchPmControl(id: string) {
  return apiFetchJson<Record<string, unknown>>(`${CONTROL_BASE}/${id}`);
}
