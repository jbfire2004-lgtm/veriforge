import { directionFromSlope, finiteNumbers, linearSlope, round } from "./stats";
import { filterUsable } from "./series";
import type {
  DataPlane,
  HecaTrendAnalysis,
  HecaTrendPoint,
  TrendCohortScope,
  TrendSeriesPoint,
} from "./types";

export function analyzeHecaTrend(
  plane: DataPlane,
  scope: TrendCohortScope,
  series: TrendSeriesPoint[],
): HecaTrendAnalysis {
  const points: HecaTrendPoint[] = series.map((p) => ({
    period: p.period,
    highEnergyRate:
      p.suppressed || p.metrics?.hecaHighEnergyRate == null
        ? null
        : round(p.metrics.hecaHighEnergyRate, 4),
    controlsVerifiedRate:
      p.suppressed || p.metrics?.hecaControlsVerifiedRate == null
        ? null
        : round(p.metrics.hecaControlsVerifiedRate, 4),
    suppressed: p.suppressed || p.metrics == null,
  }));

  const usable = filterUsable(series);
  const heRates = finiteNumbers(usable.map((p) => p.metrics!.hecaHighEnergyRate));
  const cvRates = finiteNumbers(
    usable.map((p) => p.metrics!.hecaControlsVerifiedRate),
  );
  const slopeHighEnergy = linearSlope(heRates);
  const slopeControlsVerified = linearSlope(cvRates);

  const heDir = directionFromSlope(slopeHighEnergy, { lowerIsBetter: true });
  const cvDir = directionFromSlope(slopeControlsVerified, {
    lowerIsBetter: false,
  });
  let direction: HecaTrendAnalysis["direction"] = "insufficient";
  if (heDir !== "insufficient" || cvDir !== "insufficient") {
    if (heDir === "worsening" || cvDir === "worsening") direction = "worsening";
    else if (heDir === "improving" || cvDir === "improving")
      direction = "improving";
    else direction = "stable";
  }

  return {
    plane,
    scope,
    points,
    slopeHighEnergy:
      slopeHighEnergy == null ? null : round(slopeHighEnergy, 6),
    slopeControlsVerified:
      slopeControlsVerified == null ? null : round(slopeControlsVerified, 6),
    direction,
  };
}
