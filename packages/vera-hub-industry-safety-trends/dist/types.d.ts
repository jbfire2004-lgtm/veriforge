/**
 * VeriHub Industry Trend Engine — contracts
 * All inputs must already be normalized & anonymized (no tokens / PII).
 */
import type { BlindAggregateResult, CohortKey, DataPlane, HecaCategory, IndustryCode, MIN_SAMPLE, NormalizedMetrics, ScaleBand } from "@vera/hub-industry-safety";
export type { BlindAggregateResult, CohortKey, DataPlane, HecaCategory, IndustryCode, NormalizedMetrics, ScaleBand, };
/** Cohort identity without period (time series span a range of periods) */
export type TrendCohortScope = {
    industry: IndustryCode;
    entityType: DataPlane;
    subtype: string;
    scale: ScaleBand;
};
export type LeadingIndicators = {
    observationRate?: number | null;
    inspectionCompletionRate?: number | null;
    trainingCurrencyRate?: number | null;
    nearMissReportingIndex?: number | null;
    controlsVerifiedRate?: number | null;
};
export type WorkforceIndicators = {
    turnoverRate?: number | null;
    tenureMedianYears?: number | null;
    contractorRatio?: number | null;
    overtimePressure?: number | null;
    retentionScore?: number | null;
};
/**
 * One anonymized, period-level observation for a single plane cohort.
 * Prefer building from BlindAggregateResult via fromBlindAggregates().
 */
export type TrendSeriesPoint = {
    period: string;
    suppressed: boolean;
    entityCount: number | null;
    metrics: NormalizedMetrics | null;
    leading?: LeadingIndicators;
    workforce?: WorkforceIndicators;
    /** Category / keyword shares summing ~1 (anonymized) */
    rootCauseShares?: Record<string, number>;
};
export type HecaTrendPoint = {
    period: string;
    highEnergyRate: number | null;
    controlsVerifiedRate: number | null;
    suppressed: boolean;
};
export type HecaTrendAnalysis = {
    plane: DataPlane;
    scope: TrendCohortScope;
    points: HecaTrendPoint[];
    slopeHighEnergy: number | null;
    slopeControlsVerified: number | null;
    direction: "improving" | "worsening" | "stable" | "insufficient";
};
export type RateTrendPoint = {
    period: string;
    trif: number | null;
    ltif: number | null;
    incidentRatePer200k: number | null;
    suppressed: boolean;
};
export type TrifLtifTrendAnalysis = {
    plane: DataPlane;
    scope: TrendCohortScope;
    points: RateTrendPoint[];
    trifSlope: number | null;
    ltifSlope: number | null;
    direction: "improving" | "worsening" | "stable" | "insufficient";
};
export type CorrelationPair = {
    leading: string;
    lagging: "trif" | "ltif" | "incidentRatePer200k" | "severityIndex";
    /** Pearson r in [-1, 1] */
    r: number | null;
    n: number;
    strength: "strong" | "moderate" | "weak" | "none" | "insufficient";
};
export type LeadingCorrelationAnalysis = {
    plane: DataPlane;
    scope: TrendCohortScope;
    pairs: CorrelationPair[];
};
export type SeasonalMetric = "trif" | "ltif" | "heca_high_energy" | "leading_composite" | "incident_per_200k";
export type SeasonalPoint = {
    period: string;
    metric: SeasonalMetric;
    value: number | null;
    seasonalIndex: number | null;
    suppressed: boolean;
};
export type SeasonalRiskModel = {
    plane: DataPlane;
    scope: TrendCohortScope;
    metric: SeasonalMetric;
    points: SeasonalPoint[];
    peakBucket: string | null;
    troughBucket: string | null;
    amplitude: number | null;
};
export type RootCauseCluster = {
    id: string;
    label: string;
    share: number;
    members: string[];
    centroid: Record<string, number>;
};
export type RootCauseClustering = {
    plane: DataPlane;
    scope: TrendCohortScope;
    clusters: RootCauseCluster[];
    suppressed: boolean;
    samplePeriods: number;
};
export type WorkforceStabilityScore = {
    plane: DataPlane;
    scope: TrendCohortScope;
    score: number | null;
    band: "stable" | "watch" | "elevated" | "critical" | "insufficient";
    components: {
        turnover: number | null;
        tenure: number | null;
        contractorMix: number | null;
        overtime: number | null;
        retention: number | null;
    };
    trend: Array<{
        period: string;
        score: number | null;
        suppressed: boolean;
    }>;
};
export type RiskForecastHorizon = "1m" | "3m" | "6m";
export type PredictiveRiskPoint = {
    period: string;
    predictedTrif: number | null;
    predictedLtif: number | null;
    predictedHecaHighEnergy: number | null;
    riskIndex: number | null;
    confidence: number | null;
};
export type PredictiveRiskForecast = {
    plane: DataPlane;
    scope: TrendCohortScope;
    horizon: RiskForecastHorizon;
    history: RateTrendPoint[];
    forecast: PredictiveRiskPoint[];
    drivers: string[];
    suppressed: boolean;
};
export type IndustryTrendReport = {
    plane: DataPlane;
    scope: TrendCohortScope;
    minSample: typeof MIN_SAMPLE;
    heca: HecaTrendAnalysis;
    trifLtif: TrifLtifTrendAnalysis;
    leadingCorrelation: LeadingCorrelationAnalysis;
    seasonal: SeasonalRiskModel[];
    rootCause: RootCauseClustering;
    workforce: WorkforceStabilityScore;
    predictive: PredictiveRiskForecast;
};
export type TrendEngineInput = {
    scope: TrendCohortScope;
    series: TrendSeriesPoint[];
    /** Required true to analyze mixed project+company series (still reported separately) */
    explicitCrossCompare?: boolean;
    forecastHorizon?: RiskForecastHorizon;
    seasonalMetrics?: SeasonalMetric[];
};
