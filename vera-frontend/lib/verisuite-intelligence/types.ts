import type { GeoLevel } from "./geo";

export type IntelligencePlane = "project" | "company";

export type IndustryCode =
  | "construction"
  | "mining"
  | "manufacturing"
  | "energy"
  | "utilities"
  | "transportation"
  | "other";

export type ModuleLens = "hub" | "pm" | "fieldos" | "core";

export type SelectorState = {
  plane: IntelligencePlane;
  industry: IndustryCode;
  subtype: string;
  scale: "small" | "medium" | "large" | "mega";
  period: string;
  regionCode: string;
  module: ModuleLens;
};

export type CohortMetrics = {
  trif: number | null;
  ltif: number | null;
  nearMissRate: number | null;
  trainingCompliantPct: number | null;
  capaClosureDays: number | null;
  highRiskPermitOpen: number | null;
  hecaHighEnergyPct: number | null;
  entityCount: number | null;
  suppressed: boolean;
};

export type RegionalChild = {
  code: string;
  label: string;
  level: GeoLevel;
  suppressed: boolean;
  entityCount: number | null;
  metrics: CohortMetrics | null;
};

export type RegionalDrillResponse = {
  node: { level: GeoLevel; code: string; label: string };
  breadcrumbs: Array<{ code: string; label: string; level: GeoLevel }>;
  children: RegionalChild[];
  selfMetrics: CohortMetrics;
  insights: AiInsight[];
};

export type AiInsight = {
  insightId: string;
  kind: "trend" | "anomaly" | "risk_pattern";
  severity: "info" | "watch" | "alert" | "critical";
  metricId: string;
  summary: string;
  confidence: number;
  module?: ModuleLens;
  regionCode?: string;
  detectedAt: string;
};

export type ModuleDashboardSlice = {
  module: ModuleLens;
  title: string;
  href: string;
  kpis: Array<{ key: string; label: string; value: number | null; unit: string }>;
  insights: AiInsight[];
  industryCompare: {
    companyValue: number | null;
    industryMean: number | null;
    percentile: number | null;
  };
};

export type IntelligenceSnapshot = {
  generatedAt: string;
  revision: number;
  selectors: SelectorState;
  dual: {
    project: CohortMetrics;
    company: CohortMetrics;
  };
  regional: RegionalDrillResponse;
  modules: ModuleDashboardSlice[];
  insights: AiInsight[];
  anonymization: {
    minSample: number;
    planesIsolated: true;
    crossIndustryGated: true;
    siteBandIndustryForbidden: true;
  };
};
