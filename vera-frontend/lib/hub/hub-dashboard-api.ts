import { apiFetchJson } from "@/lib/api-fetch";

const BASE = "/api/v1/hub";

export type HubModuleCard = {
  key: string;
  title: string;
  description: string;
  href: string;
  allowed: boolean;
  reason?: "permission" | "feature" | "tier" | "role";
  features: string[];
};

export type HubWidgetVisibility = {
  workerReadiness: boolean;
  equipmentReadiness: boolean;
  trainingExpiring: boolean;
  safetyAlerts: boolean;
  projectActivity: boolean;
};

export type HubWidgetsBundle = {
  generatedAt: string;
  visibility: HubWidgetVisibility;
  workerReadiness: {
    totalWorkers: number;
    compliant: number;
    nonCompliant: number;
    expiringSoon: number;
    complianceRate: number;
    topIssues: Array<{ label: string; count: number }>;
    href: string;
  } | null;
  equipmentReadiness: {
    total: number;
    compliant: number;
    nonCompliant: number;
    overdueInspection: number;
    complianceRate: number;
    href: string;
  } | null;
  trainingExpiring: {
    expired: number;
    expiring30: number;
    expiring60: number;
    expiring90: number;
    highRisk: number;
    gaps: number;
    href: string;
  } | null;
  safetyAlerts: {
    openCount: number;
    highSeverityCount: number;
    items: Array<{
      id: string;
      title: string;
      severity: string;
      status: string;
      createdAt: string;
      href: string;
    }>;
    href: string;
  } | null;
  projectActivity: {
    items: Array<{
      id: string;
      title: string;
      summary: string | null;
      publishedAt: string;
      href: string;
    }>;
    href: string;
  } | null;
};

export async function fetchHubModules() {
  return apiFetchJson<HubModuleCard[]>(`/api/v1/access/modules`);
}

export async function fetchHubWidgetsSummary() {
  return apiFetchJson<HubWidgetsBundle>(`${BASE}/widgets/summary`);
}

export async function fetchHubWorkerReadiness() {
  return apiFetchJson<HubWidgetsBundle["workerReadiness"]>(
    `${BASE}/widgets/worker-readiness`,
  );
}

export async function fetchHubEquipmentReadiness() {
  return apiFetchJson<HubWidgetsBundle["equipmentReadiness"]>(
    `${BASE}/widgets/equipment-readiness`,
  );
}

export async function fetchHubTrainingExpiring() {
  return apiFetchJson<HubWidgetsBundle["trainingExpiring"]>(
    `${BASE}/widgets/training-expiring`,
  );
}

export async function fetchHubSafetyAlerts() {
  return apiFetchJson<HubWidgetsBundle["safetyAlerts"]>(
    `${BASE}/widgets/safety-alerts`,
  );
}

export async function fetchHubProjectActivity() {
  return apiFetchJson<HubWidgetsBundle["projectActivity"]>(
    `${BASE}/widgets/project-activity`,
  );
}
