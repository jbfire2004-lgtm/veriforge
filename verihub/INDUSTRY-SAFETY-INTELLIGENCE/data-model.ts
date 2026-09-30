/**
 * VeriHub Dual-Dashboard Data Model — TypeScript contracts
 *
 * Maps 1:1 to SQL tables. Project and company planes never share FKs.
 * Metrics are stored only after normalization (hoursBasis = 200_000).
 */

export const VISI_HOURS_BASIS = 200_000 as const;
export const VISI_MIN_SAMPLE = 5 as const;

export type VisiDataPlane = "project" | "company";

export type VisiScaleBand = "small" | "medium" | "large" | "mega";

export type VisiIndustryCode =
  | "construction"
  | "energy"
  | "manufacturing"
  | "transportation"
  | "mining"
  | "utilities"
  | "other";

export type VisiProjectSubtype =
  | "transmission"
  | "distribution"
  | "substation"
  | "civil"
  | "industrial"
  | "renewable";

export type VisiCompanySubtype =
  | "utility"
  | "epc"
  | "contractor"
  | "engineering_firm"
  | "maintenance_provider";

export type VisiTrendReportKind =
  | "cohort"
  | "heca"
  | "trif_ltif"
  | "seasonal"
  | "leading"
  | "root_cause"
  | "workforce"
  | "predictive"
  | "full_trends";

export type VisiForecastHorizon = "1m" | "3m" | "6m";

/** anonymized_tokens */
export type AnonymizedTokenRow = {
  id: string;
  plane: VisiDataPlane;
  token: string;
  saltVersion: string;
  sourceIdHash: string | null;
  createdAt: string;
};

/** industry_projects */
export type IndustryProjectRow = {
  id: string;
  token: string;
  industry: VisiIndustryCode;
  subtype: VisiProjectSubtype;
  scale: VisiScaleBand;
  regionBand: string | null;
  normalizerVersion: string;
  createdAt: string;
  updatedAt: string;
};

/** industry_companies */
export type IndustryCompanyRow = {
  id: string;
  token: string;
  industry: VisiIndustryCode;
  subtype: VisiCompanySubtype;
  scale: VisiScaleBand;
  regionBand: string | null;
  normalizerVersion: string;
  createdAt: string;
  updatedAt: string;
};

/** Shared normalized metric columns (project_metrics / company_metrics) */
export type NormalizedMetricColumns = {
  period: string;
  hoursBasis: typeof VISI_HOURS_BASIS;
  hoursWorked: number | null;
  incidentRatePer200k: number | null;
  /** TRIF */
  recordableRatePer200k: number | null;
  /** LTIF */
  lostTimeRatePer200k: number | null;
  nearMissRatePer200k: number | null;
  severityIndex: number | null;
  hecaHighEnergyRate: number | null;
  hecaControlsVerifiedRate: number | null;
  hecaDistribution: Record<string, number>;
  normalizedAt: string;
  normalizerVersion: string;
};

export type ProjectMetricsRow = NormalizedMetricColumns & {
  id: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
};

export type CompanyMetricsRow = NormalizedMetricColumns & {
  id: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
};

/** leading_indicators */
export type LeadingIndicatorsRow = {
  id: string;
  entityType: VisiDataPlane;
  token: string;
  period: string;
  observationRate: number | null;
  inspectionCompletionRate: number | null;
  trainingCurrencyRate: number | null;
  nearMissReportingIndex: number | null;
  controlsVerifiedRate: number | null;
  leadingComposite: number | null;
  normalizedAt: string;
  normalizerVersion: string;
};

/** corrective_actions */
export type CorrectiveActionsRow = {
  id: string;
  entityType: VisiDataPlane;
  token: string;
  period: string;
  onTimeRate: number | null;
  openAvg: number | null;
  overdueCountAvg: number | null;
  aging: Record<string, number>;
  normalizedAt: string;
  normalizerVersion: string;
};

/** competency_profiles */
export type CompetencyProfilesRow = {
  id: string;
  entityType: VisiDataPlane;
  token: string;
  period: string;
  currentRate: number | null;
  expiring30dRate: number | null;
  expiring60dRate: number | null;
  expiring90dRate: number | null;
  roleDistribution: Record<string, number> | null;
  normalizedAt: string;
  normalizerVersion: string;
};

/** trend_cache — industry aggregates partitioned by entityType */
export type TrendCacheRow = {
  id: string;
  entityType: VisiDataPlane;
  industry: VisiIndustryCode;
  subtype: string;
  scale: VisiScaleBand;
  period: string;
  reportKind: VisiTrendReportKind;
  /** Predictive: 1m|3m|6m; otherwise "" */
  horizon: VisiForecastHorizon | "";
  payload: Record<string, unknown>;
  suppressed: boolean;
  entityCount: number | null;
  minSample: typeof VISI_MIN_SAMPLE;
  computedAt: string;
  expiresAt: string | null;
};

/** selector_state */
export type SelectorStateRow = {
  id: string;
  userId: number;
  entityType: VisiDataPlane;
  industry: VisiIndustryCode;
  subtype: string;
  scale: VisiScaleBand;
  period: string;
  updatedAt: string;
};

/** Write guard — reject unnormalized metric inserts */
export function assertNormalizedForStorage(
  row: Pick<NormalizedMetricColumns, "hoursBasis" | "normalizedAt" | "normalizerVersion">,
): void {
  if (row.hoursBasis !== VISI_HOURS_BASIS) {
    throw new Error(`VISI_STORAGE: hoursBasis must be ${VISI_HOURS_BASIS}`);
  }
  if (!row.normalizedAt) {
    throw new Error("VISI_STORAGE: normalizedAt required");
  }
  if (!row.normalizerVersion) {
    throw new Error("VISI_STORAGE: normalizerVersion required");
  }
}

/** Plane isolation helper for discriminator tables */
export function assertPlaneTokenPrefix(
  entityType: VisiDataPlane,
  token: string,
): void {
  if (entityType === "project" && !token.startsWith("proj_")) {
    throw new Error("VISI_MIXED_PLANE: project rows require proj_ token");
  }
  if (entityType === "company" && !token.startsWith("co_")) {
    throw new Error("VISI_MIXED_PLANE: company rows require co_ token");
  }
}
