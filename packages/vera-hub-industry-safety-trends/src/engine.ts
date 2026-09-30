import {
  MIN_SAMPLE,
  PlaneIsolationError,
  assertCrossCompareConsent,
  type BlindAggregateResult,
  type DataPlane,
} from "@vera/hub-industry-safety";
import { analyzeLeadingCorrelation } from "./correlation";
import { forecastPredictiveRisk } from "./forecast";
import { analyzeHecaTrend } from "./heca";
import { clusterRootCauses } from "./root-cause";
import { modelSeasonalRisk } from "./seasonal";
import {
  assertSeriesPlane,
  fromBlindAggregates,
} from "./series";
import { analyzeTrifLtifTrend } from "./trif-ltif";
import { scoreWorkforceStability } from "./workforce";
import type {
  IndustryTrendReport,
  SeasonalMetric,
  TrendEngineInput,
  TrendSeriesPoint,
} from "./types";

const DEFAULT_SEASONAL: SeasonalMetric[] = [
  "trif",
  "ltif",
  "heca_high_energy",
  "leading_composite",
  "incident_per_200k",
];

/**
 * VeriHub Industry Trend Engine
 *
 * Operates only on normalized, anonymized series (no tokens / PII).
 * Project and company planes stay isolated unless explicit cross-compare.
 */
export class VeriHubIndustryTrendEngine {
  readonly minSample = MIN_SAMPLE;

  fromBlindAggregates(aggregates: BlindAggregateResult[]): TrendSeriesPoint[] {
    return fromBlindAggregates(aggregates);
  }

  /**
   * Full trend report for a single plane cohort scope.
   */
  analyze(input: TrendEngineInput): IndustryTrendReport {
    const { scope, series } = input;
    assertSeriesPlane(series, scope, {
      explicitCrossCompare: input.explicitCrossCompare,
    });

    const plane = scope.entityType;
    const seasonalMetrics = input.seasonalMetrics ?? DEFAULT_SEASONAL;
    const horizon = input.forecastHorizon ?? "3m";

    return {
      plane,
      scope,
      minSample: MIN_SAMPLE,
      heca: analyzeHecaTrend(plane, scope, series),
      trifLtif: analyzeTrifLtifTrend(plane, scope, series),
      leadingCorrelation: analyzeLeadingCorrelation(plane, scope, series),
      seasonal: seasonalMetrics.map((m) =>
        modelSeasonalRisk(plane, scope, series, m),
      ),
      rootCause: clusterRootCauses(plane, scope, series),
      workforce: scoreWorkforceStability(plane, scope, series),
      predictive: forecastPredictiveRisk(plane, scope, series, horizon),
    };
  }

  analyzeHeca(input: TrendEngineInput) {
    assertSeriesPlane(input.series, input.scope);
    return analyzeHecaTrend(input.scope.entityType, input.scope, input.series);
  }

  analyzeTrifLtif(input: TrendEngineInput) {
    assertSeriesPlane(input.series, input.scope);
    return analyzeTrifLtifTrend(
      input.scope.entityType,
      input.scope,
      input.series,
    );
  }

  correlateLeading(input: TrendEngineInput) {
    assertSeriesPlane(input.series, input.scope);
    return analyzeLeadingCorrelation(
      input.scope.entityType,
      input.scope,
      input.series,
    );
  }

  modelSeasonal(input: TrendEngineInput, metric?: SeasonalMetric) {
    assertSeriesPlane(input.series, input.scope);
    const metrics = metric
      ? [metric]
      : input.seasonalMetrics ?? DEFAULT_SEASONAL;
    return metrics.map((m) =>
      modelSeasonalRisk(input.scope.entityType, input.scope, input.series, m),
    );
  }

  clusterRootCauses(input: TrendEngineInput) {
    assertSeriesPlane(input.series, input.scope);
    return clusterRootCauses(input.scope.entityType, input.scope, input.series);
  }

  scoreWorkforce(input: TrendEngineInput) {
    assertSeriesPlane(input.series, input.scope);
    return scoreWorkforceStability(
      input.scope.entityType,
      input.scope,
      input.series,
    );
  }

  forecastRisk(input: TrendEngineInput) {
    assertSeriesPlane(input.series, input.scope);
    return forecastPredictiveRisk(
      input.scope.entityType,
      input.scope,
      input.series,
      input.forecastHorizon ?? "3m",
    );
  }

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
  } {
    assertCrossCompareConsent({
      explicitConsent: args.explicitConsent,
      hasPermission: args.permissionGranted,
    });

    if (args.project.scope.entityType !== "project") {
      throw new PlaneIsolationError(
        "VISI_PLANE_MISMATCH",
        "crossCompare.project.scope.entityType must be project",
      );
    }
    if (args.company.scope.entityType !== "company") {
      throw new PlaneIsolationError(
        "VISI_PLANE_MISMATCH",
        "crossCompare.company.scope.entityType must be company",
      );
    }

    return {
      project: this.analyze({
        ...args.project,
        explicitCrossCompare: true,
      }),
      company: this.analyze({
        ...args.company,
        explicitCrossCompare: true,
      }),
    };
  }

  /** Public payload helper — strip any accidental token-like keys */
  toPublicReport(report: IndustryTrendReport): IndustryTrendReport {
    const json = JSON.stringify(report);
    if (/\b(proj_|co_)[a-f0-9]{8,}/i.test(json)) {
      throw new PlaneIsolationError(
        "VISI_CROSS_DENIED",
        "Trend report must not contain entity tokens",
      );
    }
    return report;
  }

  partitionByPlane(
    seriesByPlane: Partial<Record<DataPlane, TrendSeriesPoint[]>>,
  ): { project: TrendSeriesPoint[]; company: TrendSeriesPoint[] } {
    return {
      project: seriesByPlane.project ?? [],
      company: seriesByPlane.company ?? [],
    };
  }
}
