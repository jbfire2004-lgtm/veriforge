import { API_URL } from "./api";
import { fetchJson } from "./core";

const BASE = `${API_URL}/api/v1/pm/safety`;

export type SiteAccessEvaluation = {
  granted: boolean;
  denialReasons: string[];
  checks: Record<string, boolean>;
};

export type ProjectSafetyContext = {
  projectId: number;
  ownerCompanyId: number;
  siteIds: number[];
  siteName: string | null;
  companyName: string;
  activeWorkerCount: number;
  openCailCount: number;
  overdueCailCount: number;
  sifOpenCount: number;
  lastInspectionAt: string | null;
  lastFlhaAt: string | null;
  riskSnapshot: {
    score: number;
    band: string;
    computedAt: string;
  } | null;
  requiredForms: string[];
  zoneRules: Array<{ id: string; zoneCode: string; requiresFlhaHours: number }>;
};

export type WorkerSafetyProfile = {
  workerId: number;
  workerName: string;
  trainingCompliance: Array<{
    courseCode: string | null;
    courseName: string;
    status: "valid" | "expired";
    expiresAt?: string;
  }>;
  openCailAssigned: number;
  incidentInvolvement12mo: number;
  bboAtRiskCount12mo: number;
  riskScore: number;
  lastFlhaDate: string | null;
  siteAccessStatus: "granted" | "denied" | "conditional";
  denialReasons: string[];
};

export async function fetchProjectSafetyContext(projectId: number) {
  return fetchJson<ProjectSafetyContext>(
    `${BASE}/context/project/${projectId}`,
  );
}

export async function fetchWorkerSafetyProfile(
  workerId: number,
  projectId?: number,
) {
  const q = projectId ? `?projectId=${projectId}` : "";
  return fetchJson<WorkerSafetyProfile>(
    `${BASE}/context/worker/${workerId}${q}`,
  );
}

export async function fetchSiteAccessRules(projectId: number) {
  return fetchJson<Array<Record<string, unknown>>>(
    `${BASE}/site-access/rules?projectId=${projectId}`,
  );
}

export async function evaluateSiteAccess(body: {
  workerId: number;
  projectId: number;
  zoneCode?: string;
}) {
  return fetchJson<SiteAccessEvaluation>(`${BASE}/site-access/evaluate`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function fetchSiteAccessGrants(projectId: number) {
  return fetchJson<Array<Record<string, unknown>>>(
    `${BASE}/site-access/grants?projectId=${projectId}`,
  );
}

export async function fetchSdsDocuments(companyId: number, q?: string) {
  const params = new URLSearchParams({ companyId: String(companyId) });
  if (q) params.set("q", q);
  return fetchJson<Array<Record<string, unknown>>>(
    `${BASE}/sds/documents?${params}`,
  );
}

export async function createSdsDocument(body: {
  companyId: number;
  productName: string;
  manufacturer?: string;
}) {
  return fetchJson<Record<string, unknown>>(`${BASE}/sds/documents`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function fetchEmergencyPlans(siteId: number) {
  return fetchJson<Array<Record<string, unknown>>>(
    `${BASE}/emergency/plans?siteId=${siteId}`,
  );
}

export async function triggerMuster(body: {
  siteId: number;
  projectId?: number;
  notes?: string;
}) {
  return fetchJson<Record<string, unknown>>(`${BASE}/emergency/muster/trigger`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function fetchActiveMuster(siteId: number) {
  return fetchJson<Record<string, unknown> | null>(
    `${BASE}/emergency/muster/active?siteId=${siteId}`,
  );
}

export async function musterCheckIn(
  musterId: string,
  body: { workerId: number; method?: string },
) {
  return fetchJson<Record<string, unknown>>(
    `${BASE}/emergency/muster/${musterId}/checkin`,
    { method: "POST", body: JSON.stringify(body) },
  );
}

export async function musterAllClear(musterId: string) {
  return fetchJson<Record<string, unknown>>(
    `${BASE}/emergency/muster/${musterId}/all-clear`,
    { method: "POST" },
  );
}

export async function fetchStationHealth(siteId?: number) {
  const q = siteId ? `?siteId=${siteId}` : "";
  return fetchJson<Array<Record<string, unknown>>>(
    `${BASE}/stations/health${q}`,
  );
}
