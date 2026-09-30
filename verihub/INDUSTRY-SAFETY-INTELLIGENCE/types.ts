/**
 * VeriHub Industry Safety Intelligence (VISI) — canonical contracts
 *
 * HARD RULE: project and company planes never mix unless CrossCategoryCompare
 * is explicitly requested with consent + permission.
 */

export const MIN_SAMPLE = 5 as const;

export const HOURS_DENOMINATOR = 200_000 as const;

export type IndustryCode =
  | "construction"
  | "energy"
  | "manufacturing"
  | "transportation"
  | "mining"
  | "utilities"
  | "other";

export type EntityType = "project" | "company";

export type ScaleBand = "small" | "medium" | "large" | "mega";

/** Project-Scale Industry Dashboard subtypes */
export type ProjectSubtype =
  | "transmission"
  | "distribution"
  | "substation"
  | "civil"
  | "industrial"
  | "renewable";

export type CompanySubtype =
  | "owner_operator"
  | "epc"
  | "trade_contractor"
  | "manufacturer"
  | "utility"
  | "transporter"
  | "mining_operator"
  | "other_company";

export type Subtype = ProjectSubtype | CompanySubtype;

export type DataPlane = "project" | "company" | "cross";

export const PROJECT_SUBTYPE_LABELS: Record<ProjectSubtype, string> = {
  transmission: "Transmission",
  distribution: "Distribution",
  substation: "Substation",
  civil: "Civil",
  industrial: "Industrial",
  renewable: "Renewable",
};

export const SCALE_LABELS: Record<ScaleBand, string> = {
  small: "Small",
  medium: "Medium",
  large: "Large",
  mega: "Mega",
};

export const INDUSTRY_LABELS: Record<IndustryCode, string> = {
  construction: "Construction",
  energy: "Energy",
  manufacturing: "Manufacturing",
  transportation: "Transportation",
  mining: "Mining",
  utilities: "Utilities",
  other: "Other",
};

export type ProjectScaleSelectors = {
  industry: IndustryCode;
  projectType: ProjectSubtype;
  scale: ScaleBand;
  /** YYYY-MM or YYYY-Qn */
  period: string;
};

export type IndustryCohortKey = {
  industry: IndustryCode;
  entityType: "project";
  subtype: ProjectSubtype;
  scale: ScaleBand;
  period: string;
};

export type HecaTrendPoint = {
  period: string;
  highEnergyRate: number;
  controlsVerifiedRate: number;
};

export type HecaMetrics = {
  highEnergyRate: number;
  controlsVerifiedRate: number;
  distribution?: Record<string, number>;
  trend: HecaTrendPoint[];
};

export type LeadingIndicatorMetrics = {
  nearMissRate?: number;
  observationRate?: number;
  inspectionCompletion?: number;
  trainingCurrency?: number;
  /** 0–100 scores for heatmap cells */
  heatmap: Array<{
    indicator: string;
    label: string;
    score: number;
  }>;
};

export type CorrectiveActionAgingBucket = {
  bucket: "0-7d" | "8-30d" | "31-60d" | "61-90d" | "90d+";
  count: number;
  share: number;
};

export type CorrectiveActionMetrics = {
  onTimeRate?: number;
  openAvg?: number;
  overdueCountAvg?: number;
  aging: CorrectiveActionAgingBucket[];
};

export type CompetencyMetrics = {
  currentRate?: number;
  expiring30dRate?: number;
  expiring60dRate?: number;
  expiring90dRate?: number;
};

export type SeasonalPoint = {
  period: string;
  metric: string;
  value: number | null;
  suppressed?: boolean;
};

export type RootCauseSlice = {
  code: string;
  label: string;
  share: number;
  count: number;
};

export type WorkforceNormalizedRates = {
  /** Incidents per 200,000 hours */
  incidentRatePer200k: number;
  /** Recordables per 200,000 hours (aligns with TRIF) */
  recordableRatePer200k: number;
  /** Lost-time per 200,000 hours (aligns with LTIF) */
  lostTimeRatePer200k: number;
  hoursBasis: typeof HOURS_DENOMINATOR;
};

export type ProjectRiskProfile = {
  /** 0–100 industry-relative risk score for the cohort */
  score: number;
  band: "low" | "moderate" | "elevated" | "critical";
  drivers: Array<{ code: string; label: string; weight: number }>;
  confidence: number;
};

export type PredictiveRiskResult = {
  riskScore: number;
  confidence: number;
  drivers: Array<{ code: string; label: string; weight: number }>;
  modelId?: string;
  modelVersion?: string;
};

export type ProjectScaleMetrics = {
  heca: HecaMetrics;
  /** TRIF normalized per 200,000 hours */
  trif: number;
  /** LTIF normalized per 200,000 hours */
  ltif: number;
  leading: LeadingIndicatorMetrics;
  correctiveActions: CorrectiveActionMetrics;
  competency: CompetencyMetrics;
  seasonal: SeasonalPoint[];
  workforceNormalized: WorkforceNormalizedRates;
  rootCause: RootCauseSlice[];
  riskProfile: ProjectRiskProfile;
  predictive: PredictiveRiskResult | null;
};

export type ProjectScaleCohortAggregate = {
  cohort: IndustryCohortKey;
  metrics: ProjectScaleMetrics | null;
};

export type VisiResponseMeta = {
  timestamp: string;
  plane: "project";
  suppressed: boolean;
  minSample: typeof MIN_SAMPLE;
  entityCount: number | null;
  entityCountVisible: boolean;
  /** Internal tokens never exposed — count of distinct proj_* only when visible */
  hoursDenominator: typeof HOURS_DENOMINATOR;
};

export type VisiApiResponse<T> = {
  data: T;
  meta: VisiResponseMeta;
};

export const PROJECT_SUBTYPES: ProjectSubtype[] = [
  "transmission",
  "distribution",
  "substation",
  "civil",
  "industrial",
  "renewable",
];

export function shouldSuppress(
  entityCount: number,
  minSample: number = MIN_SAMPLE,
): boolean {
  return entityCount < minSample;
}

export function riskBand(score: number): ProjectRiskProfile["band"] {
  if (score >= 75) return "critical";
  if (score >= 55) return "elevated";
  if (score >= 35) return "moderate";
  return "low";
}
