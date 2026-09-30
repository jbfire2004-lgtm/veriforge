import { directionFromSlope, finiteNumbers, linearSlope, round } from "./stats";
import { filterUsable } from "./series";
import type {
  DataPlane,
  RateTrendPoint,
  TrendCohortScope,
  TrendSeriesPoint,
  TrifLtifTrendAnalysis,
} from "./types";

export function analyzeTrifLtifTrend(
  plane: DataPlane,
  scope: TrendCohortScope,
  series: TrendSeriesPoint[],
): TrifLtifTrendAnalysis {
  const points: RateTrendPoint[] = series.map((p) => ({
    period: p.period,
    trif:
      p.suppressed || p.metrics?.recordableRatePer200k == null
        ? null
        : round(p.metrics.recordableRatePer200k, 4),
    ltif:
      p.suppressed || p.metrics?.lostTimeRatePer200k == null
        ? null
        : round(p.metrics.lostTimeRatePer200k, 4),
    incidentRatePer200k:
      p.suppressed || p.metrics?.incidentRatePer200k == null
        ? null
        : round(p.metrics.incidentRatePer200k, 4),
    suppressed: p.suppressed || p.metrics == null,
  }));

  const usable = filterUsable(series);
  const trifs = finiteNumbers(
    usable.map((p) => p.metrics!.recordableRatePer200k),
  );
  const ltifs = finiteNumbers(usable.map((p) => p.metrics!.lostTimeRatePer200k));
  const trifSlope = linearSlope(trifs);
  const ltifSlope = linearSlope(ltifs);

  const tDir = directionFromSlope(trifSlope, { lowerIsBetter: true });
  const lDir = directionFromSlope(ltifSlope, { lowerIsBetter: true });
  let direction: TrifLtifTrendAnalysis["direction"] = "insufficient";
  if (tDir !== "insufficient" || lDir !== "insufficient") {
    if (tDir === "worsening" || lDir === "worsening") direction = "worsening";
    else if (tDir === "improving" || lDir === "improving")
      direction = "improving";
    else direction = "stable";
  }

  return {
    plane,
    scope,
    points,
    trifSlope: trifSlope == null ? null : round(trifSlope, 6),
    ltifSlope: ltifSlope == null ? null : round(ltifSlope, 6),
    direction,
  };
}
