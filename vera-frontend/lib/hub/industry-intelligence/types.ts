/**
 * VeriHub Industry Intelligence — types for mining / construction / manufacturing.
 */

export type DataPlane = "project" | "company";

export type FocusIndustry = "mining" | "construction" | "manufacturing";

export type ExternalSourceKind =
  | "regulator"
  | "association"
  | "public_dashboard"
  | "government_report";

export type HecaCategory =
  | "gravity"
  | "electrical"
  | "mechanical"
  | "pressure"
  | "chemical"
  | "thermal"
  | "radiation"
  | "biological"
  | "other";

export type LeadingIndicatorKey =
  | "observations"
  | "toolbox_talks"
  | "near_miss_reporting"
  | "training_completion"
  | "inspection_closure"
  | "permit_compliance";

export type IndustrySelector = {
  plane: DataPlane;
  industry: FocusIndustry;
  period: string;
  regionCode: string;
  /** Opt-in only — never mix planes unless true */
  crossPlaneOptIn: boolean;
};

export type HecaPoint = {
  period: string;
  category: HecaCategory;
  ratePct: number;
};

export type RateSeriesPoint = {
  period: string;
  trif: number;
  ltif: number;
  severityIndex: number;
};

export type LeadingMaturity = {
  key: LeadingIndicatorKey;
  label: string;
  score: number; // 0–100
  industryMean: number;
};

export type RegionalTrend = {
  regionCode: string;
  label: string;
  trif: number | null;
  ltif: number | null;
  entityCount: number | null;
  suppressed: boolean;
};

export type IndustryBenchmark = {
  industry: FocusIndustry;
  plane: DataPlane;
  period: string;
  suppressed: boolean;
  entityCount: number | null;
  trif: number | null;
  ltif: number | null;
  severityIndex: number | null;
  hecaHighEnergyPct: number | null;
  leadingMaturityAvg: number | null;
};

export type IndustryComparisonRow = {
  industry: FocusIndustry;
  trif: number | null;
  ltif: number | null;
  severityIndex: number | null;
  leadingMaturityAvg: number | null;
  suppressed: boolean;
  entityCount: number | null;
};

export type AiNarrative = {
  id: string;
  tone: "neutral" | "positive" | "caution" | "alert";
  headline: string;
  body: string;
  sources: string[];
};

export type PredictiveRisk = {
  horizon: "30d" | "90d" | "12m";
  riskScore: number; // 0–100
  band: "low" | "moderate" | "elevated" | "critical";
  drivers: string[];
  projectedTrif: number | null;
  confidence: number;
};

export type IngestSourceStat = {
  kind: ExternalSourceKind;
  label: string;
  lastPullAt: string;
  recordsIngested: number;
  status: "ok" | "stale" | "error";
};

export type IndustryIntelligenceDashboard = {
  generatedAt: string;
  revision: number;
  selectors: IndustrySelector;
  sources: IngestSourceStat[];
  benchmark: IndustryBenchmark;
  hecaTrends: HecaPoint[];
  trifLtifSeries: RateSeriesPoint[];
  leadingIndicators: LeadingMaturity[];
  regionalTrends: RegionalTrend[];
  industryComparisons: IndustryComparisonRow[];
  narratives: AiNarrative[];
  predictive: PredictiveRisk[];
  rules: {
    minSample: number;
    planesIsolated: boolean;
    crossPlaneOptIn: boolean;
    normalizedBeforeAnalytics: true;
  };
};
