import { API_URL } from "./api";
import { fetchJson } from "./core";

const BASE = `${API_URL}/api/v1/pm/safety-suite`;

export type SafetySuiteReadiness = {
  projectId: number;
  readinessScore: number;
  level: "READY" | "NEEDS_ATTENTION" | "AT_RISK";
  averageQualityScore: number;
  projectSifScore: number;
  sifHighCount: number;
  blockedJhaCount: number;
};

export type SafetySuiteAlert = {
  type: string;
  id: string;
  title: string;
  status?: string;
  severity?: string;
  kind?: string;
  href: string;
  createdAt: string;
};

export async function fetchSafetySuiteDashboard(projectId: number, companyId?: number) {
  const q = new URLSearchParams({ projectId: String(projectId) });
  if (companyId) q.set("companyId", String(companyId));
  return fetchJson<Record<string, unknown>>(`${BASE}/dashboard?${q}`);
}

export async function fetchSafetySuiteAlerts(projectId: number, companyId?: number) {
  const q = new URLSearchParams({ projectId: String(projectId) });
  if (companyId) q.set("companyId", String(companyId));
  return fetchJson<{
    jhaSifAlerts: SafetySuiteAlert[];
    sifReviewAlerts: SafetySuiteAlert[];
    incidentAlerts: SafetySuiteAlert[];
  }>(`${BASE}/alerts?${q}`);
}

export async function fetchSafetySuiteReadiness(projectId: number) {
  return fetchJson<SafetySuiteReadiness>(`${BASE}/readiness?projectId=${projectId}`);
}

export async function fetchSafetySuiteEnergyWheel() {
  return fetchJson<{ jha: Array<Record<string, unknown>>; sif: { segments: Array<Record<string, unknown>> } }>(
    `${BASE}/energy-wheel`,
  );
}

export async function fetchSafetySuiteLibraries(companyId: number, projectId?: number) {
  const q = new URLSearchParams({ companyId: String(companyId) });
  if (projectId) q.set("projectId", String(projectId));
  return fetchJson<{
    hazards: Array<Record<string, unknown>>;
    controls: Array<Record<string, unknown>>;
    sifIndicators: Array<Record<string, unknown>>;
    hecaCategories: Array<Record<string, unknown>>;
    energyWheel: Array<Record<string, unknown>>;
  }>(`${BASE}/libraries?${q}`);
}
