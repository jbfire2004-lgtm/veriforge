/**
 * Shared VISI project-scale contracts (mirrors verihub/INDUSTRY-SAFETY-INTELLIGENCE/types.ts)
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

export type ScaleBand = "small" | "medium" | "large" | "mega";

export type ProjectSubtype =
  | "transmission"
  | "distribution"
  | "substation"
  | "civil"
  | "industrial"
  | "renewable";

export const PROJECT_SUBTYPES: ProjectSubtype[] = [
  "transmission",
  "distribution",
  "substation",
  "civil",
  "industrial",
  "renewable",
];

export const PROJECT_SUBTYPE_LABELS: Record<ProjectSubtype, string> = {
  transmission: "Transmission",
  distribution: "Distribution",
  substation: "Substation",
  civil: "Civil",
  industrial: "Industrial",
  renewable: "Renewable",
};

/** Company-Scale Industry Dashboard subtypes */
export type CompanySubtype =
  | "utility"
  | "epc"
  | "contractor"
  | "engineering_firm"
  | "maintenance_provider";

export const COMPANY_SUBTYPES: CompanySubtype[] = [
  "utility",
  "epc",
  "contractor",
  "engineering_firm",
  "maintenance_provider",
];

export const COMPANY_SUBTYPE_LABELS: Record<CompanySubtype, string> = {
  utility: "Utility",
  epc: "EPC",
  contractor: "Contractor",
  engineering_firm: "Engineering Firm",
  maintenance_provider: "Maintenance Provider",
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

export const INDUSTRIES: IndustryCode[] = [
  "construction",
  "energy",
  "manufacturing",
  "transportation",
  "mining",
  "utilities",
  "other",
];

export const SCALES: ScaleBand[] = ["small", "medium", "large", "mega"];

export type ProjectScaleSelectors = {
  industry: IndustryCode;
  projectType: ProjectSubtype;
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
  distribution: Record<string, number>;
  trend: HecaTrendPoint[];
};

export type LeadingIndicatorMetrics = {
  nearMissRate: number;
  observationRate: number;
  inspectionCompletion: number;
  trainingCurrency: number;
  heatmap: Array<{ indicator: string; label: string; score: number }>;
};

export type CorrectiveActionAgingBucket = {
  bucket: "0-7d" | "8-30d" | "31-60d" | "61-90d" | "90d+";
  count: number;
  share: number;
};

export type CorrectiveActionMetrics = {
  onTimeRate: number;
  openAvg: number;
  overdueCountAvg: number;
  aging: CorrectiveActionAgingBucket[];
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
  incidentRatePer200k: number;
  recordableRatePer200k: number;
  lostTimeRatePer200k: number;
  hoursBasis: typeof HOURS_DENOMINATOR;
};

export type ProjectRiskProfile = {
  score: number;
  band: "low" | "moderate" | "elevated" | "critical";
  drivers: Array<{ code: string; label: string; weight: number }>;
  confidence: number;
};

export type PredictiveRiskResult = {
  riskScore: number;
  confidence: number;
  drivers: Array<{ code: string; label: string; weight: number }>;
  modelId: string;
  modelVersion: string;
};

export type ProjectScaleMetrics = {
  heca: HecaMetrics;
  trif: number;
  ltif: number;
  leading: LeadingIndicatorMetrics;
  correctiveActions: CorrectiveActionMetrics;
  competency: {
    currentRate: number;
    expiring30dRate: number;
    expiring60dRate: number;
    expiring90dRate: number;
  };
  seasonal: SeasonalPoint[];
  workforceNormalized: WorkforceNormalizedRates;
  rootCause: RootCauseSlice[];
  riskProfile: ProjectRiskProfile;
  predictive: PredictiveRiskResult;
};

export type IndustryCohortKey = {
  industry: IndustryCode;
  entityType: "project";
  subtype: ProjectSubtype;
  scale: ScaleBand;
  period: string;
};

export type ProjectScaleCohortAggregate = {
  cohort: IndustryCohortKey;
  metrics: ProjectScaleMetrics | null;
};

export type VisiProjectMeta = {
  timestamp: string;
  plane: "project";
  suppressed: boolean;
  minSample: typeof MIN_SAMPLE;
  entityCount: number | null;
  entityCountVisible: boolean;
  hoursDenominator: typeof HOURS_DENOMINATOR;
  companyDataIncluded: false;
};

export type VisiProjectResponse = {
  data: ProjectScaleCohortAggregate;
  meta: VisiProjectMeta;
};

export type CompanyScaleSelectors = {
  industry: IndustryCode;
  companyType: CompanySubtype;
  scale: ScaleBand;
  period: string;
};

export type CompanyHecaMetrics = {
  companyHecaRate: number;
  controlsVerifiedRate: number;
  distribution: Record<string, number>;
};

export type LeadingMaturityMetrics = {
  score: number;
  band: "nascent" | "emerging" | "developing" | "advanced";
  dimensions: Array<{ indicator: string; label: string; score: number }>;
};

export type CompetencyTrendPoint = {
  period: string;
  currentRate: number;
  expiring30dRate: number;
};

export type RegionalPerformanceRow = {
  code: string;
  label: string;
  trif: number;
  hecaRate: number;
  maturityScore: number;
  companyShare: number;
};

export type WorkforceStabilityIndicators = {
  turnoverRate: number;
  tenureMedianYears: number;
  contractorRatio: number;
  overtimePressure: number;
  retentionScore: number;
};

export type CompanyScaleMetrics = {
  heca: CompanyHecaMetrics;
  trif: number;
  ltif: number;
  hoursBasis: typeof HOURS_DENOMINATOR;
  leadingMaturity: LeadingMaturityMetrics;
  correctiveActions: CorrectiveActionMetrics;
  competency: {
    currentRate: number;
    expiring30dRate: number;
    expiring60dRate: number;
    expiring90dRate: number;
    trend: CompetencyTrendPoint[];
  };
  regional: RegionalPerformanceRow[];
  workforceStability: WorkforceStabilityIndicators;
};

export type CompanyCohortKey = {
  industry: IndustryCode;
  entityType: "company";
  subtype: CompanySubtype;
  scale: ScaleBand;
  period: string;
};

export type CompanyScaleCohortAggregate = {
  cohort: CompanyCohortKey;
  metrics: CompanyScaleMetrics | null;
};

export type VisiCompanyMeta = {
  timestamp: string;
  plane: "company";
  suppressed: boolean;
  minSample: typeof MIN_SAMPLE;
  entityCount: number | null;
  entityCountVisible: boolean;
  hoursDenominator: typeof HOURS_DENOMINATOR;
  projectDataIncluded: false;
};

export type VisiCompanyResponse = {
  data: CompanyScaleCohortAggregate;
  meta: VisiCompanyMeta;
};

/** Unified Industry Selector System state */
export type EntityType = "project" | "company";

export type IndustrySelectorState = {
  industry: IndustryCode;
  entityType: EntityType;
  /** Project type or company type depending on entityType */
  subtype: ProjectSubtype | CompanySubtype;
  scale: ScaleBand;
  period: string;
};

export type SelectorOptionAvailability = {
  id: string;
  available: boolean;
  qualifyingCombos?: number;
  entityCount?: number | null;
};

export type SubtypeAvailability = {
  id: string;
  available: boolean;
  scales: Array<{
    scale: ScaleBand;
    available: boolean;
    entityCount: number | null;
  }>;
};

export type SelectorAvailabilityResponse = {
  plane: EntityType;
  period: string;
  minSample: typeof MIN_SAMPLE;
  industry: IndustryCode;
  industries: SelectorOptionAvailability[];
  subtypes: SubtypeAvailability[];
  scales: Array<{ id: ScaleBand; available: boolean }>;
  crossContaminationPrevented: true;
  note: string;
};

export function shouldSuppress(entityCount: number): boolean {
  return entityCount < MIN_SAMPLE;
}

export function riskBand(score: number): ProjectRiskProfile["band"] {
  if (score >= 75) return "critical";
  if (score >= 55) return "elevated";
  if (score >= 35) return "moderate";
  return "low";
}

/** Company vs Industry comparison (self metrics + anonymized cohort) */
export type CompanyBenchmarkProfile = {
  companyName: string;
  industry: IndustryCode;
  companyType: CompanySubtype;
  scale: ScaleBand;
  workerCount?: number;
  period: string;
  entityType: "company";
};

export type CompanySelfVsIndustryDeltas = {
  trif: number | null;
  ltif: number | null;
  hecaRate: number | null;
  controlsVerifiedRate: number | null;
  leadingMaturityScore: number | null;
  capaOnTimeRate: number | null;
  competencyCurrentRate: number | null;
};

export type CompanySelfVsIndustryComparisons = {
  heca: {
    self: CompanyHecaMetrics;
    industry: CompanyHecaMetrics | null;
    deltaHecaRate: number | null;
  };
  trifLtif: {
    self: { trif: number; ltif: number; hoursBasis: typeof HOURS_DENOMINATOR };
    industry: {
      trif: number;
      ltif: number;
      hoursBasis: typeof HOURS_DENOMINATOR;
    } | null;
    deltaTrif: number | null;
    deltaLtif: number | null;
  };
  leadingMaturity: {
    self: LeadingMaturityMetrics;
    industry: LeadingMaturityMetrics | null;
    deltaScore: number | null;
  };
  correctiveActions: {
    self: CorrectiveActionMetrics;
    industry: CorrectiveActionMetrics | null;
    deltaOnTimeRate: number | null;
  };
  competency: {
    selfTrend: CompetencyTrendPoint[];
    industryTrend: CompetencyTrendPoint[];
    deltaCurrentRate: number | null;
  };
  seasonal: {
    self: Array<{ period: string; metric: string; value: number }>;
    industry: Array<{
      period: string;
      metric: string;
      value: number | null;
      suppressed?: boolean;
    }>;
  };
};

export type CompanySelfVsIndustryResponse = {
  data: {
    home: {
      industry: IndustryCode;
      companyType: CompanySubtype;
      scale: ScaleBand;
      companyName: string;
    };
    benchmark: {
      industry: IndustryCode;
      companyType: CompanySubtype;
      scale: ScaleBand;
      period: string;
      entityType: "company";
      crossCategory: boolean;
      crossScale: boolean;
    };
    self: {
      metrics: CompanyScaleMetrics;
      resolved: boolean;
      source: string;
      label: string;
    };
    industry: {
      metrics: CompanyScaleMetrics | null;
      suppressed: boolean;
      entityCount: number | null;
      label: string;
    };
    deltas: CompanySelfVsIndustryDeltas | null;
    comparisons: CompanySelfVsIndustryComparisons;
  };
  meta: {
    timestamp: string;
    plane: "company";
    projectDataIncluded: false;
    minSample: typeof MIN_SAMPLE;
    industrySuppressed: boolean;
    selfAvailable: boolean;
    hoursDenominator: typeof HOURS_DENOMINATOR;
    alignment: {
      sameType: boolean;
      sameScale: boolean;
      crossCategory: boolean;
      crossScale: boolean;
    };
  };
};
