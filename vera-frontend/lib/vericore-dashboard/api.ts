/**
 * VERICore Dashboard API client (preview routes under /api/v1/core/dashboard).
 */

import type {
  DrillResponse,
  RevisionResponse,
  RoleBand,
  VeriCoreCompanyDashboard,
  VeriCoreProjectDashboard,
} from "./types";

const BASE = "/api/v1/core/dashboard";

export type DashboardClientQuery = {
  companyId?: number;
  projectId?: number;
  locationId?: string;
  roleBand?: RoleBand;
  crewId?: string;
  jobId?: string;
};

function qs(query: Record<string, string | number | undefined | null>) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v != null && v !== "") p.set(k, String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : "";
}

async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { Accept: "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(body || `VERICore dashboard error (${res.status})`);
  }
  return (await res.json()) as T;
}

export function fetchCompanyDashboard(query: DashboardClientQuery = {}) {
  return getJson<VeriCoreCompanyDashboard>(
    `${BASE}/company${qs({
      companyId: query.companyId ?? 1,
      projectId: query.projectId,
      locationId: query.locationId,
      roleBand: query.roleBand,
      crewId: query.crewId,
      jobId: query.jobId,
    })}`,
  );
}

export function fetchProjectDashboard(
  projectId: number,
  query: DashboardClientQuery = {},
) {
  return getJson<VeriCoreProjectDashboard>(
    `${BASE}/project${qs({
      projectId,
      companyId: query.companyId ?? 1,
      locationId: query.locationId,
      roleBand: query.roleBand,
    })}`,
  );
}

export function fetchDashboardRevision(companyId = 1, projectId?: number) {
  return getJson<RevisionResponse>(
    `${BASE}/revision${qs({ companyId, projectId })}`,
  );
}

export function refreshDashboard(companyId = 1, projectId?: number) {
  return getJson<VeriCoreCompanyDashboard>(`${BASE}/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ companyId, projectId }),
  });
}

export function emitDashboardEvent(eventName: string) {
  return getJson<VeriCoreCompanyDashboard>(`${BASE}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventName }),
  });
}

export function fetchDrill(
  metricKey: string,
  opts: {
    page?: number;
    pageSize?: number;
    locationId?: string;
    roleBand?: RoleBand;
    projectId?: number;
  } = {},
) {
  return getJson<DrillResponse>(
    `${BASE}/drill${qs({
      metricKey,
      page: opts.page ?? 1,
      pageSize: opts.pageSize ?? 25,
      locationId: opts.locationId,
      roleBand: opts.roleBand,
      projectId: opts.projectId,
    })}`,
  );
}

export function fetchContractorDetail(contractorCompanyId: number) {
  return getJson<{
    contractorCompanyId: number;
    name: string;
    programScore: number;
    grade: string;
    incidentRate: number | null;
    trainingCompliantPct: number;
    flhaJhaCompletionPct: number;
    pillars: Record<string, number>;
    documents: Array<{
      id: string;
      title: string;
      type: string;
      href: string;
      documentId: string;
    }>;
    formula: { formula: string; formulaId: string; label: string };
  }>(`${BASE}/contractors${qs({ contractorCompanyId })}`);
}
