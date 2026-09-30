/**
 * VeriHub Industry Safety Intelligence — privacy & normalization contracts
 */

export const MIN_SAMPLE = 5 as const;
export const HOURS_DENOMINATOR = 200_000 as const;

export type DataPlane = "project" | "company";

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

export type CompanySubtype =
  | "utility"
  | "epc"
  | "contractor"
  | "engineering_firm"
  | "maintenance_provider";

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

export const PROJECT_SUBTYPES: ProjectSubtype[] = [
  "transmission",
  "distribution",
  "substation",
  "civil",
  "industrial",
  "renewable",
];

export const COMPANY_SUBTYPES: CompanySubtype[] = [
  "utility",
  "epc",
  "contractor",
  "engineering_firm",
  "maintenance_provider",
];

export const HECA_CATEGORIES: HecaCategory[] = [
  "gravity",
  "electrical",
  "mechanical",
  "pressure",
  "chemical",
  "thermal",
  "radiation",
  "biological",
  "other",
];

export const INDUSTRIES: IndustryCode[] = [
  "construction",
  "energy",
  "manufacturing",
  "transportation",
  "mining",
  "utilities",
  "other",
];

/** Raw ingress — may contain PII / identifiers (private zone only) */
export type RawEntityRecord = {
  entityType: DataPlane;
  projectId?: string | number;
  companyId?: string | number;
  projectName?: string;
  companyName?: string;
  legalName?: string;
  contractNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  lat?: number;
  lon?: number;
  regionCode?: string;
  workerName?: string;
  email?: string;
  phone?: string;
  badgeId?: string;
  userId?: string | number;
  permitNumber?: string;
  narrative?: string;
  comments?: string;
  industry?: string;
  projectType?: string;
  companyType?: string;
  subtype?: string;
  scale?: string;
  workerCount?: number;
  peakWorkers?: number;
  contractValueUsd?: number;
  period: string;
  hoursWorked?: number;
  recordableIncidents?: number;
  lostTimeIncidents?: number;
  totalIncidents?: number;
  nearMisses?: number;
  hecaHighEnergyEvents?: number;
  hecaControlsVerified?: number;
  hecaTotalAssessments?: number;
  hecaCategoryCounts?: Record<string, number>;
  severityWeights?: number[];
  severitySum?: number;
  severityCount?: number;
};

export type StrippedRecord = {
  entityType: DataPlane;
  projectId?: string | number;
  companyId?: string | number;
  regionCode?: string;
  industry?: string;
  projectType?: string;
  companyType?: string;
  subtype?: string;
  scale?: string;
  workerCount?: number;
  peakWorkers?: number;
  contractValueUsd?: number;
  period: string;
  hoursWorked?: number;
  recordableIncidents?: number;
  lostTimeIncidents?: number;
  totalIncidents?: number;
  nearMisses?: number;
  hecaHighEnergyEvents?: number;
  hecaControlsVerified?: number;
  hecaTotalAssessments?: number;
  hecaCategoryCounts?: Record<string, number>;
  severityWeights?: number[];
  severitySum?: number;
  severityCount?: number;
  hazardKeywordCounts?: Record<string, number>;
};

export type NormalizedMetrics = {
  /** Incidents per 200,000 hours */
  incidentRatePer200k: number | null;
  recordableRatePer200k: number | null;
  lostTimeRatePer200k: number | null;
  nearMissRatePer200k: number | null;
  /** 0–100 severity index */
  severityIndex: number | null;
  hecaHighEnergyRate: number | null;
  hecaControlsVerifiedRate: number | null;
  hecaDistribution: Partial<Record<HecaCategory, number>>;
  hoursBasis: typeof HOURS_DENOMINATOR;
};

export type NormalizedPlaneFact = {
  plane: DataPlane;
  /** Internal only — never expose to Hub UI */
  token: string;
  industry: IndustryCode;
  subtype: ProjectSubtype | CompanySubtype;
  scale: ScaleBand;
  period: string;
  regionBand?: string;
  metrics: NormalizedMetrics;
};

export type CohortKey = {
  industry: IndustryCode;
  entityType: DataPlane;
  subtype: ProjectSubtype | CompanySubtype;
  scale: ScaleBand;
  period: string;
  /** Optional regional grain for Global→…→city_band drilldowns */
  regionLevel?:
    | "global"
    | "continent"
    | "country"
    | "province_state"
    | "region"
    | "city_band";
  regionCode?: string;
};

export type BlindAggregateResult = {
  key: CohortKey;
  suppressed: boolean;
  entityCount: number | null;
  entityCountVisible: boolean;
  minSample: typeof MIN_SAMPLE;
  metrics: NormalizedMetrics | null;
};

export type IsolationErrorCode =
  | "VISI_MIXED_PLANE"
  | "VISI_PLANE_MISMATCH"
  | "VISI_CROSS_DENIED"
  | "VISI_CROSS_SCALE"
  | "VISI_CROSS_TYPE";
