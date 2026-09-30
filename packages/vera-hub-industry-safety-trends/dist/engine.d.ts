import { type BlindAggregateResult, type DataPlane } from "@vera/hub-industry-safety";
import type { IndustryTrendReport, SeasonalMetric, TrendEngineInput, TrendSeriesPoint } from "./types";
/**
 * VeriHub Industry Trend Engine
 *
 * Operates only on normalized, anonymized series (no tokens / PII).
 * Project and company planes stay isolated unless explicit cross-compare.
 */
export declare class VeriHubIndustryTrendEngine {
    readonly minSample: 5;
    fromBlindAggregates(aggregates: BlindAggregateResult[]): TrendSeriesPoint[];
    /**
     * Full trend report for a single plane cohort scope.
     */
    analyze(input: TrendEngineInput): IndustryTrendReport;
    analyzeHeca(input: TrendEngineInput): import("./types").HecaTrendAnalysis;
    analyzeTrifLtif(input: TrendEngineInput): import("./types").TrifLtifTrendAnalysis;
    correlateLeading(input: TrendEngineInput): import("./types").LeadingCorrelationAnalysis;
    modelSeasonal(input: TrendEngineInput, metric?: SeasonalMetric): import("./types").SeasonalRiskModel[];
    clusterRootCauses(input: TrendEngineInput): import("./types").RootCauseClustering;
    scoreWorkforce(input: TrendEngineInput): import("./types").WorkforceStabilityScore;
    forecastRisk(input: TrendEngineInput): import("./types").PredictiveRiskForecast;
    /**
     * Dual-plane report. Requires explicit consent; never blends metrics.
     */
    crossCompare(args: {
        project: TrendEngineInput;
        company: TrendEngineInput;
        explicitConsent: boolean;
        permissionGranted?: boolean;
    }): {
        project: IndustryTrendReport;
        company: IndustryTrendReport;
    };
    /** Public payload helper — strip any accidental token-like keys */
    toPublicReport(report: IndustryTrendReport): IndustryTrendReport;
    partitionByPlane(seriesByPlane: Partial<Record<DataPlane, TrendSeriesPoint[]>>): {
        project: TrendSeriesPoint[];
        company: TrendSeriesPoint[];
    };
}
