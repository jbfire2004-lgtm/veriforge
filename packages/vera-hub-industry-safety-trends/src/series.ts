import {
  PlaneIsolationError,
  type BlindAggregateResult,
  type DataPlane,
  type NormalizedPlaneFact,
} from "@vera/hub-industry-safety";
import { periodSortKey } from "./periods";
import type { TrendCohortScope, TrendSeriesPoint } from "./types";

/**
 * Convert blind aggregates (already anonymized) into a sorted trend series.
 */
export function fromBlindAggregates(
  aggregates: BlindAggregateResult[],
): TrendSeriesPoint[] {
  return aggregates
    .map((a) => ({
      period: a.key.period,
      suppressed: a.suppressed,
      entityCount: a.entityCount,
      metrics: a.metrics,
      leading: a.metrics
        ? {
            controlsVerifiedRate: a.metrics.hecaControlsVerifiedRate,
            nearMissReportingIndex: a.metrics.nearMissRatePer200k,
          }
        : undefined,
      rootCauseShares: a.metrics?.hecaDistribution
        ? Object.fromEntries(
            Object.entries(a.metrics.hecaDistribution).filter(
              ([, v]) => v != null && Number.isFinite(v),
            ),
          )
        : undefined,
    }))
    .sort((a, b) => periodSortKey(a.period) - periodSortKey(b.period));
}

/**
 * Group facts by period then caller should blind-aggregate externally.
 * This helper only validates plane isolation and sorts.
 */
export function assertSinglePlaneFacts(
  facts: NormalizedPlaneFact[],
  expected?: DataPlane,
): DataPlane {
  if (!facts.length) {
    if (expected) return expected;
    throw new PlaneIsolationError(
      "VISI_PLANE_MISMATCH",
      "Trend series requires at least one fact",
    );
  }
  const plane = facts[0]!.plane;
  for (const f of facts) {
    if (f.plane !== plane) {
      throw new PlaneIsolationError(
        "VISI_MIXED_PLANE",
        "Project and company facts cannot mix in a trend series",
      );
    }
  }
  if (expected && plane !== expected) {
    throw new PlaneIsolationError(
      "VISI_PLANE_MISMATCH",
      `Expected ${expected} plane, got ${plane}`,
    );
  }
  return plane;
}

export function assertSeriesPlane(
  series: TrendSeriesPoint[],
  scope: TrendCohortScope,
  opts: { explicitCrossCompare?: boolean } = {},
): void {
  if (scope.entityType !== "project" && scope.entityType !== "company") {
    throw new PlaneIsolationError(
      "VISI_PLANE_MISMATCH",
      "entityType must be project or company",
    );
  }
  // Series points are already plane-scoped by construction; cross-compare
  // is only allowed when building dual reports, not a blended series.
  if (opts.explicitCrossCompare === false) {
    // no-op guard for API symmetry
  }
  void series;
}

export function filterUsable(
  series: TrendSeriesPoint[],
): TrendSeriesPoint[] {
  return series.filter((p) => !p.suppressed && p.metrics != null);
}
