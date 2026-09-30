/**
 * VeriPM Project Safety Dashboard — types
 */

export type ProjectType =
  | "transmission"
  | "distribution"
  | "substation"
  | "civil"
  | "industrial"
  | "renewable";

export type ScaleBand = "small" | "medium" | "large" | "mega";

export type RegionCode =
  | "CA-AB"
  | "CA-BC"
  | "CA-ON"
  | "US-TX"
  | "US-NV"
  | "US-CA";

export const PROJECT_TYPES: ProjectType[] = [
  "transmission",
  "distribution",
  "substation",
  "civil",
  "industrial",
  "renewable",
];

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  transmission: "Transmission",
  distribution: "Distribution",
  substation: "Substation",
  civil: "Civil",
  industrial: "Industrial",
  renewable: "Renewable",
};

export const SCALE_BANDS: ScaleBand[] = ["small", "medium", "large", "mega"];

export const SCALE_LABELS: Record<ScaleBand, string> = {
  small: "Small",
  medium: "Medium",
  large: "Large",
  mega: "Mega",
};

export const REGION_CODES: RegionCode[] = [
  "CA-AB",
  "CA-BC",
  "CA-ON",
  "US-TX",
  "US-NV",
  "US-CA",
];

export const REGION_LABELS: Record<RegionCode, string> = {
  "CA-AB": "Alberta",
  "CA-BC": "British Columbia",
  "CA-ON": "Ontario",
  "US-TX": "Texas",
  "US-NV": "Nevada",
  "US-CA": "California",
};

export const HOURS_DENOMINATOR = 200_000 as const;

export type ProjectSafetySelectors = {
  /** Tokenized project id (never raw DB id in responses) */
  projectToken: string;
  projectType: ProjectType;
  region: RegionCode;
  scale: ScaleBand;
  period: string;
  /** Opt-in: compare across project types / regions / scales */
  crossCategoryOptIn: boolean;
};

export type RateMetric = {
  key: string;
  label: string;
  value: number;
  unit: "per_200k" | "pct" | "score" | "count" | "days";
  formula: string;
};

export type LeadingIndicators = {
  observationRate: RateMetric;
  nearMissRate: RateMetric;
  toolboxTalkRate: RateMetric;
  trainingCurrencyPct: RateMetric;
  permitCompliancePct: RateMetric;
  inspectionCompletionPct: RateMetric;
};

export type LaggingIndicators = {
  trif: RateMetric;
  ltif: RateMetric;
  severityIndex: RateMetric;
  recordableRate: RateMetric;
  firstAidRate: RateMetric;
};

export type TrendPoint = {
  period: string;
  value: number;
};

export type IncidentTrend = {
  recordables: TrendPoint[];
  nearMisses: TrendPoint[];
  lostTime: TrendPoint[];
};

export type FocusAuditTrend = {
  period: string;
  auditsCompleted: number;
  findingsRate: number; // per 200k
  criticalFindingsRate: number;
  closurePct: number;
};

export type IntelligentInspectionTrend = {
  period: string;
  inspectionsCompleted: number;
  aiFlaggedRate: number; // per 200k
  highRiskClosurePct: number;
  coveragePct: number;
};

export type CorrectiveAgingBucket = {
  bucket: "0-7d" | "8-30d" | "31-60d" | "61-90d" | "90d+";
  count: number;
  sharePct: number;
  ratePer200k: number;
};

export type CorrectiveActionAging = {
  openCount: number;
  overdueCount: number;
  avgAgeDays: number;
  onTimeClosurePct: number;
  aging: CorrectiveAgingBucket[];
};

export type ProjectRiskProfile = {
  score: number;
  band: "low" | "moderate" | "elevated" | "critical";
  confidence: number;
  drivers: Array<{ code: string; label: string; weight: number }>;
};

export type IndustryCompareRow = {
  metric: string;
  label: string;
  projectValue: number;
  industryValue: number | null;
  delta: number | null;
  suppressed: boolean;
  unit: "per_200k" | "pct" | "score";
};

export type ProjectCatalogItem = {
  token: string;
  label: string; // anonymized display name
  projectType: ProjectType;
  region: RegionCode;
  scale: ScaleBand;
};

export type ProjectSafetyDashboard = {
  generatedAt: string;
  revision: number;
  selectors: ProjectSafetySelectors;
  catalog: ProjectCatalogItem[];
  leading: LeadingIndicators;
  lagging: LaggingIndicators;
  incidentTrends: IncidentTrend;
  focusAuditTrends: FocusAuditTrend[];
  intelligentInspectionTrends: IntelligentInspectionTrend[];
  correctiveActionAging: CorrectiveActionAging;
  riskProfile: ProjectRiskProfile;
  industryComparison: IndustryCompareRow[];
  rules: {
    hoursDenominator: typeof HOURS_DENOMINATOR;
    projectLevelOnly: boolean;
    crossCategoryOptIn: boolean;
    projectIdsTokenized: true;
    metricsNormalizedPer200k: true;
  };
};
