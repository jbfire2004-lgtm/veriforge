import { apiFetchJson } from "./api-client";

const BASE = `/api/v1/pm/safety-hub`;

export type SafetyHubDomain =
  | "inspection"
  | "investigation"
  | "corrective_action"
  | "predictive"
  | "contractor"
  | "substance_testing"
  | "competency"
  | "equipment";

export type SafetyHubSnapshot = {
  generatedAt: string;
  companyId: number;
  projectId: number | null;
  summary: {
    alertScore: number;
    openCapa: number;
    openCail: number;
    evidenceIndexed: number;
    domainsNeedingAttention: number;
  };
  domains: Record<
    SafetyHubDomain,
    Record<string, number | string | null> & { href: string }
  >;
  capaQueue: Array<{
    id: string;
    title: string;
    status: string;
    severityLevel?: string;
    dueAt?: string;
    sourceModule?: string;
  }>;
  timeline: Array<{
    id: string;
    eventName: string;
    domain?: string;
    occurredAt: string;
    entityType?: string;
    entityId?: string;
  }>;
};

export async function getSafetyHubMeta() {
  return apiFetchJson<{
    domains: Array<{ id: string; label: string; link: { href: string; label: string } }>;
    pillars: Array<{ id: string; label: string }>;
  }>(`${BASE}/meta`);
}

export async function getSafetyHubDashboard(companyId: number, projectId?: number, refresh = false) {
  const q = new URLSearchParams({ companyId: String(companyId) });
  if (projectId) q.set("projectId", String(projectId));
  if (refresh) q.set("refresh", "true");
  return apiFetchJson<SafetyHubSnapshot>(`${BASE}/dashboard?${q}`);
}

export async function refreshSafetyHubDashboard(companyId: number, projectId?: number) {
  const q = new URLSearchParams({ companyId: String(companyId) });
  if (projectId) q.set("projectId", String(projectId));
  return apiFetchJson<SafetyHubSnapshot>(`${BASE}/dashboard/refresh?${q}`, { method: "POST" });
}

export async function searchSafetyEvidence(params: {
  companyId: number;
  projectId?: number;
  domain?: SafetyHubDomain;
  q?: string;
}) {
  const qs = new URLSearchParams({ companyId: String(params.companyId) });
  if (params.projectId) qs.set("projectId", String(params.projectId));
  if (params.domain) qs.set("domain", params.domain);
  if (params.q) qs.set("q", params.q);
  return apiFetchJson<Array<{
    id: string;
    domain: SafetyHubDomain;
    title?: string;
    fileName?: string;
    sourceType: string;
    sourceId: string;
    capturedAt: string;
    thumbnailDataUrl?: string;
  }>>(`${BASE}/evidence?${qs}`);
}

export async function getSafetyHubAnalytics(companyId: number, projectId?: number) {
  const q = new URLSearchParams({ companyId: String(companyId) });
  if (projectId) q.set("projectId", String(projectId));
  return apiFetchJson(`${BASE}/analytics?${q}`);
}

export async function getSafetyHubCapa(companyId: number, projectId?: number) {
  const q = new URLSearchParams({ companyId: String(companyId) });
  if (projectId) q.set("projectId", String(projectId));
  return apiFetchJson(`${BASE}/capa?${q}`);
}

export async function listSafetyHubNotifications(unreadOnly = false) {
  return apiFetchJson<Array<{ id: number; title: string; body: string; type: string; createdAt: string }>>(
    `${BASE}/notifications${unreadOnly ? "?unreadOnly=true" : ""}`,
  );
}

export async function getSafetyHubTimeline(companyId: number, projectId?: number) {
  const q = new URLSearchParams({ companyId: String(companyId) });
  if (projectId) q.set("projectId", String(projectId));
  return apiFetchJson(`${BASE}/timeline?${q}`);
}

export const DOMAIN_LABELS: Record<SafetyHubDomain, string> = {
  inspection: "Inspections",
  investigation: "Investigations",
  corrective_action: "Corrective actions",
  predictive: "Predictive analytics",
  contractor: "Contractor compliance",
  substance_testing: "Drug & alcohol",
  competency: "Worker competency",
  equipment: "Equipment safety",
};
