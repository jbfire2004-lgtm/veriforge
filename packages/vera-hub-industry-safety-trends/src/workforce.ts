import { clamp, mean, round } from "./stats";
import type {
  DataPlane,
  TrendCohortScope,
  TrendSeriesPoint,
  WorkforceStabilityScore,
} from "./types";

function turnoverScore(rate: number | null | undefined): number | null {
  if (rate == null || !Number.isFinite(rate)) return null;
  // 0% → 100, 30%+ → 0
  return round(clamp(1 - rate / 0.3) * 100, 1);
}

function tenureScore(years: number | null | undefined): number | null {
  if (years == null || !Number.isFinite(years)) return null;
  // 0y → 20, 8y+ → 100
  return round(clamp(0.2 + years / 10) * 100, 1);
}

function contractorScore(ratio: number | null | undefined): number | null {
  if (ratio == null || !Number.isFinite(ratio)) return null;
  // Balanced mix scores higher; extreme contractor reliance lowers score
  const ideal = 0.35;
  const dist = Math.abs(ratio - ideal);
  return round(clamp(1 - dist / 0.5) * 100, 1);
}

function overtimeScore(pressure: number | null | undefined): number | null {
  if (pressure == null || !Number.isFinite(pressure)) return null;
  return round(clamp(1 - pressure / 0.5) * 100, 1);
}

function retentionComponent(score: number | null | undefined): number | null {
  if (score == null || !Number.isFinite(score)) return null;
  return round(clamp(score / 100) * 100, 1);
}

function bandFor(
  score: number | null,
): WorkforceStabilityScore["band"] {
  if (score == null) return "insufficient";
  if (score >= 75) return "stable";
  if (score >= 55) return "watch";
  if (score >= 35) return "elevated";
  return "critical";
}

function pointScore(p: TrendSeriesPoint): number | null {
  const w = p.workforce;
  if (!w) return null;
  const parts = [
    turnoverScore(w.turnoverRate),
    tenureScore(w.tenureMedianYears),
    contractorScore(w.contractorRatio),
    overtimeScore(w.overtimePressure),
    retentionComponent(w.retentionScore),
  ].filter((v): v is number => v != null);
  if (!parts.length) return null;
  return round(parts.reduce((s, v) => s + v, 0) / parts.length, 1);
}

export function scoreWorkforceStability(
  plane: DataPlane,
  scope: TrendCohortScope,
  series: TrendSeriesPoint[],
): WorkforceStabilityScore {
  const trend = series.map((p) => ({
    period: p.period,
    score: p.suppressed ? null : pointScore(p),
    suppressed: p.suppressed || pointScore(p) == null,
  }));

  const latestWithWorkforce = [...series]
    .reverse()
    .find((p) => !p.suppressed && p.workforce);
  const w = latestWithWorkforce?.workforce;
  const components = {
    turnover: w ? turnoverScore(w.turnoverRate) : null,
    tenure: w ? tenureScore(w.tenureMedianYears) : null,
    contractorMix: w ? contractorScore(w.contractorRatio) : null,
    overtime: w ? overtimeScore(w.overtimePressure) : null,
    retention: w ? retentionComponent(w.retentionScore) : null,
  };

  const componentValues = Object.values(components).filter(
    (v): v is number => v != null,
  );
  const score =
    componentValues.length > 0
      ? round(mean(componentValues)!, 1)
      : mean(
          trend
            .map((t) => t.score)
            .filter((v): v is number => v != null),
        );

  return {
    plane,
    scope,
    score: score == null ? null : round(score, 1),
    band: bandFor(score),
    components,
    trend,
  };
}
