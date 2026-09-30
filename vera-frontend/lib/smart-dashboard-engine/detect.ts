/**
 * AI anomaly detection + trend detection.
 */

import { mean, round, slope, stdev } from "./stats";
import type { AnomalyFinding, MetricId, SeriesPoint, TrendFinding } from "./types";

const METRIC_LABEL: Record<MetricId, string> = {
  trif: "TRIF",
  ltif: "LTIF",
  near_miss_rate: "Near-miss rate",
  competency_pct: "Competency %",
  inspection_completion_pct: "Inspection completion %",
  severity_index: "Severity index",
  risk_score: "Risk score",
};

/** Higher is worse for these metrics */
const HIGHER_IS_WORSE: Set<MetricId> = new Set([
  "trif",
  "ltif",
  "near_miss_rate",
  "severity_index",
  "risk_score",
]);

export function detectAnomalies(
  seriesMap: Record<MetricId, SeriesPoint[]>,
): AnomalyFinding[] {
  const out: AnomalyFinding[] = [];
  for (const [metric, series] of Object.entries(seriesMap) as Array<
    [MetricId, SeriesPoint[]]
  >) {
    if (series.length < 4) continue;
    const values = series.map((p) => p.value);
    const m = mean(values);
    const sd = stdev(values) || 0.01;

    for (let i = 0; i < series.length; i++) {
      const pt = series[i]!;
      const z = (pt.value - m) / sd;
      const absZ = Math.abs(z);
      if (absZ < 1.75) continue;

      const kind: AnomalyFinding["kind"] =
        absZ >= 2.5
          ? z > 0
            ? "spike"
            : "drop"
          : Math.abs(pt.value - (series[i - 1]?.value ?? pt.value)) >
              sd * 1.2
            ? "level_shift"
            : "outlier";

      const severity: AnomalyFinding["severity"] =
        absZ >= 3
          ? "critical"
          : absZ >= 2.4
            ? "high"
            : absZ >= 2
              ? "medium"
              : "low";

      out.push({
        id: `anom-${metric}-${pt.period}`,
        metric,
        kind,
        severity,
        period: pt.period,
        value: pt.value,
        baseline: round(m),
        zScore: round(z),
        headline: `${METRIC_LABEL[metric]} ${kind.replace("_", " ")} in ${pt.period}`,
        detail: `${METRIC_LABEL[metric]} was ${pt.value} vs baseline ${round(m)} (z=${round(z)}).`,
        confidence: round(Math.min(0.92, 0.55 + absZ * 0.1), 2),
      });
    }
  }
  return out.sort((a, b) => Math.abs(b.zScore) - Math.abs(a.zScore));
}

export function detectTrends(
  seriesMap: Record<MetricId, SeriesPoint[]>,
): TrendFinding[] {
  const out: TrendFinding[] = [];
  for (const [metric, series] of Object.entries(seriesMap) as Array<
    [MetricId, SeriesPoint[]]
  >) {
    if (series.length < 3) continue;
    const s = slope(series);
    const abs = Math.abs(s);
    const higherWorse = HIGHER_IS_WORSE.has(metric);
    let direction: TrendFinding["direction"] = "stable";
    if (abs >= 0.08) {
      if (higherWorse) {
        direction = s > 0 ? "worsening" : "improving";
      } else {
        direction = s > 0 ? "improving" : "worsening";
      }
    }
    out.push({
      id: `trend-${metric}`,
      metric,
      direction,
      slope: round(s, 3),
      periods: series.length,
      headline: `${METRIC_LABEL[metric]} is ${direction}`,
      detail: `Linear slope ${round(s, 3)} per period across ${series.length} quarters.`,
      confidence: round(Math.min(0.9, 0.5 + abs * 2), 2),
    });
  }
  return out;
}

export { METRIC_LABEL, HIGHER_IS_WORSE };
