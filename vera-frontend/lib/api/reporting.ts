import { apiGet, API_URL } from "@/lib/api";

const BASE = "/api/v1/reporting";

export type ReportingChart = { labels: string[]; values: number[] };

export type ReportingOverview = {
  companyId: number | null;
  workers: WorkerComplianceReport["summary"];
  equipment: { summary: { complianceRate: number; total: number } };
  competency: { summary: { passRate: number } };
  inspections: { summary: { passRate: number } };
  projects: { summary: { averageReadiness: number; totalProjects: number } };
  companies: unknown;
  unionDispatch: { summary: { activeDispatches: number } };
  generatedAt: string;
};

export type WorkerComplianceReport = {
  summary: {
    totalWorkers: number;
    evaluated: number;
    compliant: number;
    nonCompliant: number;
    expiringSoon: number;
    complianceRate: number;
  };
  chart: ReportingChart;
  rows: {
    workerId: number;
    workerName: string;
    companyId: number | null;
    companyName: string | null;
    isCompliant: boolean;
    issueCount: number;
    expiringSoon: boolean;
  }[];
};

export type EquipmentComplianceReport = {
  summary: {
    total: number;
    compliant: number;
    needsAttention: number;
    nonCompliant: number;
    lockedOut: number;
    overdueInspection: number;
    complianceRate: number;
  };
  chart: ReportingChart;
  recent: {
    id: number;
    name: string;
    complianceStatus: string;
    company?: { name: string } | null;
  }[];
};

export type CompetencyReport = {
  summary: {
    totalEvaluations: number;
    passing: number;
    expiringSoon: number;
    expired: number;
    passRate: number;
  };
  chart: ReportingChart;
  recent: unknown[];
};

export type InspectionReport = {
  summary: {
    totalInspections: number;
    passed: number;
    failed: number;
    passRate: number;
    dueWithin7Days: number;
  };
  chart: ReportingChart;
  recent: unknown[];
};

export type ProjectReadinessReport = {
  summary: {
    totalProjects: number;
    ready: number;
    atRisk: number;
    notReady: number;
    averageReadiness: number;
  };
  chart: ReportingChart;
  rows: {
    projectId: number;
    projectName: string;
    companyName: string;
    readinessScore: number;
    readinessStatus: string;
    totalWorkers: number;
    compliantWorkers: number;
    totalEquipment: number;
    compliantEquipment: number;
  }[];
};

export type CompanyReadinessReport = {
  company: { id: number; name: string };
  overallScore: number;
  readinessStatus: string;
  workers: { complianceRate: number };
  equipment: { complianceRate: number };
  inspections: { passRate: number };
  projects: { averageReadiness: number };
};

export type UnionDispatchReport = {
  summary: {
    totalDispatches: number;
    activeDispatches: number;
    recalledDispatches: number;
    activeMembers: number;
  };
  chart: ReportingChart;
  byCompany: { companyId: number; companyName: string; count: number }[];
  byHall: { unionHallId: number; unionHallName: string; count: number }[];
  recent: {
    id: number;
    dispatchedAt: string;
    recalledAt: string | null;
    worker: { id: number; firstName: string; lastName: string };
    company: { id: number; name: string };
    unionHall: { id: number; name: string };
  }[];
};

function qs(params: Record<string, string | number | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v != null && v !== "") sp.set(k, String(v));
  }
  const q = sp.toString();
  return q ? `?${q}` : "";
}

export function reportingExportUrl(
  kind: "workers" | "equipment" | "projects" | "union-dispatch",
  filters?: { companyId?: number; unionHallId?: number; from?: string; to?: string },
) {
  return `${API_URL}${BASE}/export/${kind}${qs(filters ?? {})}`;
}

export async function getReportingOverview(companyId?: number) {
  return apiGet<ReportingOverview>(`${BASE}/overview${qs({ companyId })}`);
}

export async function getWorkerComplianceReport(companyId?: number, limit?: number) {
  return apiGet<WorkerComplianceReport>(`${BASE}/workers${qs({ companyId, limit })}`);
}

export async function getEquipmentComplianceReport(companyId?: number) {
  return apiGet<EquipmentComplianceReport>(`${BASE}/equipment${qs({ companyId })}`);
}

export async function getCompetencyReport(companyId?: number) {
  return apiGet<CompetencyReport>(`${BASE}/competency${qs({ companyId })}`);
}

export async function getInspectionReport(companyId?: number) {
  return apiGet<InspectionReport>(`${BASE}/inspections${qs({ companyId })}`);
}

export async function getProjectReadinessReport(companyId?: number, projectId?: number) {
  return apiGet<ProjectReadinessReport>(`${BASE}/projects${qs({ companyId, projectId })}`);
}

export async function getCompanyReadinessReport(companyId: number) {
  return apiGet<CompanyReadinessReport>(`${BASE}/companies${qs({ companyId })}`);
}

export async function getCompaniesReadinessList() {
  return apiGet<{ rows: { companyId: number; companyName: string; workerCount: number; equipmentComplianceRate: number }[] }>(
    `${BASE}/companies`,
  );
}

export async function getUnionDispatchReport(filters?: {
  companyId?: number;
  unionHallId?: number;
  from?: string;
  to?: string;
}) {
  return apiGet<UnionDispatchReport>(`${BASE}/union-halls${qs(filters ?? {})}`);
}
