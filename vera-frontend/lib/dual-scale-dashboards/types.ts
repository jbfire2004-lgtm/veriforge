/**
 * Dual-scale dashboards — project vs company analytics (strict plane isolation).
 */

export type DataPlane = "project" | "company";

export type FocusIndustry = "mining" | "construction" | "manufacturing";

export type DualSelectors = {
  industry: FocusIndustry;
  period: string;
  regionCode: string;
  /** Opt-in only — never mix planes unless true */
  crossPlaneOptIn: boolean;
};

export type HecaSlice = {
  category: string;
  ratePct: number;
};

export type LaggingRates = {
  trif: number | null;
  ltif: number | null;
  severityIndex: number | null;
  suppressed: boolean;
  entityCount: number | null;
};

export type LeadingIndicator = {
  key: string;
  label: string;
  score: number | null;
  suppressed: boolean;
};

export type CorrectiveActionAging = {
  bucket: "0-7d" | "8-30d" | "31-60d" | "61-90d" | "90d+";
  count: number | null;
  sharePct: number | null;
  ratePer200k: number | null;
  suppressed: boolean;
};

export type CorrectiveActionsBlock = {
  openAvg: number | null;
  overdueAvg: number | null;
  onTimeClosurePct: number | null;
  aging: CorrectiveActionAging[];
  suppressed: boolean;
};

export type RiskProfile = {
  score: number | null;
  band: "low" | "moderate" | "elevated" | "critical" | null;
  confidence: number | null;
  drivers: Array<{ code: string; label: string; weight: number }>;
  suppressed: boolean;
};

export type CompetencyTrend = {
  period: string;
  currentPct: number | null;
  gapPct: number | null;
  suppressed: boolean;
};

export type RegionalPerformance = {
  regionCode: string;
  label: string;
  trif: number | null;
  ltif: number | null;
  leadingMaturity: number | null;
  entityCount: number | null;
  suppressed: boolean;
};

export type ProjectScaleDashboard = {
  plane: "project";
  industry: FocusIndustry;
  period: string;
  heca: HecaSlice[];
  hecaSuppressed: boolean;
  rates: LaggingRates;
  leading: LeadingIndicator[];
  correctiveActions: CorrectiveActionsBlock;
  riskProfile: RiskProfile;
};

export type CompanyScaleDashboard = {
  plane: "company";
  industry: FocusIndustry;
  period: string;
  heca: HecaSlice[];
  hecaSuppressed: boolean;
  rates: LaggingRates;
  leadingMaturity: LeadingIndicator[];
  competencyTrends: CompetencyTrend[];
  regionalPerformance: RegionalPerformance[];
};

export type DualScaleSnapshot = {
  generatedAt: string;
  revision: number;
  selectors: DualSelectors;
  project: ProjectScaleDashboard;
  company: CompanyScaleDashboard;
  /** Present only when crossPlaneOptIn — blended view */
  blended: {
    rates: LaggingRates;
    note: string;
  } | null;
  rules: {
    planesIsolated: boolean;
    crossPlaneOptIn: boolean;
    minSample: number;
    hoursDenominator: 200000;
  };
};
