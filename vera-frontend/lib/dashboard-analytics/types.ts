/**
 * Shared Dashboard Analytics Engine — metric model, scopes, industry, events.
 * Powers VERICore + VERIPM + CSS drill-down and reactive updates.
 */

export type DashboardDomain = "VERICORE" | "VERIPM" | "CSS" | "SHARED";

export type ScopeType =
  | "company"
  | "project"
  | "contractor"
  | "asset"
  | "worker"
  | "region"
  | "global";

export type TrendDirection = "up" | "down" | "flat" | "unknown";

export type MetricStatus =
  | "ok"
  | "watch"
  | "alert"
  | "critical"
  | "insufficient_data";

export type IndustryCompare = {
  industryValue: number | null;
  industryPercentile: number | null;
  cohortSize: number;
  sampleSuppressed: boolean;
  period: string;
  direction: "higher_better" | "lower_better";
  sector: string;
};

export type AnalyticsMetric = {
  metricId: string;
  domain: DashboardDomain;
  scopeType: ScopeType;
  scopeId: string;
  name: string;
  label: string;
  value: number | null;
  unit: string;
  trendValue: number | null;
  trendDirection: TrendDirection;
  industryValue: number | null;
  industryPercentile: number | null;
  industry?: IndustryCompare;
  status: MetricStatus;
  formula: string;
  formulaId: string;
  sourceQuery: string;
  inputs: Record<string, number | null>;
  updatedAt: string;
};

export type DrillRecord = {
  id: string;
  title: string;
  subtitle?: string;
  status?: string;
  occurredAt?: string;
  dueAt?: string;
  href: string;
  documentId?: string;
  documentType?: string;
  related: {
    workerId?: string;
    workerName?: string;
    jobId?: string;
    assetId?: string;
    assetName?: string;
    contractorId?: string;
    contractorName?: string;
    projectId?: string;
    riskRating?: string;
  };
};

export type UniversalDrillResponse = {
  metricId: string;
  label: string;
  domain: DashboardDomain;
  scopeType: ScopeType;
  scopeId: string;
  formula: string;
  formulaId: string;
  sourceQuery: string;
  timeWindow: { start: string; end: string };
  filters: Record<string, string | undefined>;
  inputs: Record<string, number | null>;
  page: number;
  pageSize: number;
  total: number;
  items: DrillRecord[];
};

export type AnalyticsEvent = {
  eventName: string;
  domain?: DashboardDomain;
  scopeType?: ScopeType;
  scopeId?: string;
  at: string;
};

export type RevisionPayload = {
  revision: number;
  generatedAt: string;
  pendingInvalidation: boolean;
  lastEvent?: AnalyticsEvent | null;
};
