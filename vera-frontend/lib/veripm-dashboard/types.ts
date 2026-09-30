/**
 * VERIPM Dashboard — types
 */

import type { IndustryCompare } from "@/lib/dashboard-analytics/types";

export type HoursBasis = "actual" | "estimated" | "unavailable";

export type Metric = {
  key: string;
  label: string;
  value: number | null;
  unit: string;
  formula: string;
  formulaId: string;
  sourceQuery: string;
  inputs: Record<string, number | null>;
  asOf: string;
  hoursBasis: HoursBasis;
  industry?: IndustryCompare;
};

export type ContractorGrade = "A" | "B" | "C" | "D";

export type ContractorCard = {
  contractorCompanyId: number;
  name: string;
  programScore: number;
  grade: ContractorGrade;
  incidentRate: number | null;
  trainingCompliantPct: number;
  pmCompletionRate: number;
  failureCount: number;
  href: string;
};

export type RelatedCompany = {
  companyId: number;
  name: string;
  linkRole: "owner" | "prime" | "contractor" | "jv" | "related";
  pmCompletionRate: number | null;
  downtimeHours: number | null;
  incidentRate: number | null;
  programScore: number | null;
  grade: ContractorGrade | null;
  href: string;
};

export type AssetSlice = {
  assetId: string;
  name: string;
  pmCompletionRate: number;
  overdueCount: number;
  downtimeHours: number;
  failureRate: number | null;
  warrantyDaysLeft: number | null;
};

export type WorkerMaintSlice = {
  workerId: string;
  name: string;
  openWorkOrders: number;
  completedInPeriod: number;
  highRiskTasks: number;
};

export type VeriPmCompanyDashboard = {
  generatedAt: string;
  revision: number;
  companyId: number;
  projectId: number | null;
  period: { start: string; end: string };
  maintenance: {
    pmCompletionRate: Metric;
    overduePmCount: Metric;
    downtimeHours: Metric;
    downtimePct: Metric;
    failureRate: Metric;
    technicianWorkload: Metric;
    warrantyExpiring: Metric;
    industry: {
      pmCompletionRate: IndustryCompare;
      downtimePct: IndustryCompare;
      maintenanceIncidentRate: IndustryCompare;
    };
  };
  safetyFromMaintenance: {
    incidentCount: Metric;
    incidentRate: Metric;
    highRiskPm: Metric;
    flhaJhaLinked: Metric;
  };
  permits: {
    activeOpen: Metric;
    highRiskOpen: Metric;
    fieldOsLinked: Metric;
    byStatus: Record<string, number>;
    byRisk?: Record<string, number>;
    contractorCompliancePct?: number | null;
  };
  contractors: ContractorCard[];
  projectsSummary: Array<{
    projectId: number;
    name: string;
    pmCompletionRate: number;
    overduePmCount: number;
    downtimeHours: number;
    contractorCount: number;
  }>;
  freshness: {
    lastEventAt: string | null;
    lastRebuildAt: string;
    pendingInvalidation: boolean;
  };
};

export type VeriPmProjectDashboard = VeriPmCompanyDashboard & {
  relatedCompanies: RelatedCompany[];
  projectPerformance: {
    pmCompletionRate: number;
    overduePmCount: number;
    downtimeHours: number;
    maintIncidentCount: number;
  };
  projectPermits: {
    total: number;
    open: number;
    highRiskOpen: number;
    byRisk: Record<string, number>;
    byStatus: Record<string, number>;
    permitRelatedIncidents: number;
    contractorCompliancePct: number | null;
    contractorCount: number;
    pmReadiness: {
      ready: boolean;
      blockers: string[];
      score: number;
    };
  };
};

export type VeriPmAssetDashboard = {
  asset: AssetSlice;
  metrics: Metric[];
  recentWorkOrders: Array<{
    id: string;
    title: string;
    status: string;
    dueAt?: string;
    href: string;
  }>;
  linkedSafety: Array<{
    id: string;
    title: string;
    type: string;
    href: string;
  }>;
  revision: number;
  generatedAt: string;
};

export type VeriPmDrillResponse = {
  metricKey: string;
  label: string;
  formula: string;
  formulaId: string;
  sourceQuery: string;
  inputs: Record<string, number | null>;
  filters: Record<string, string | undefined>;
  page: number;
  pageSize: number;
  total: number;
  items: Array<{
    id: string;
    title: string;
    subtitle?: string;
    status?: string;
    dueAt?: string;
    href: string;
    documentId?: string;
    documentType?: string;
    related?: Record<string, string | number | null | undefined>;
  }>;
};
