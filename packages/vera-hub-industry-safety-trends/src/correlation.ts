import {
  correlationStrength,
  finiteNumbers,
  pearson,
  round,
} from "./stats";
import { filterUsable } from "./series";
import type {
  CorrelationPair,
  DataPlane,
  LeadingCorrelationAnalysis,
  TrendCohortScope,
  TrendSeriesPoint,
} from "./types";

type LaggingKey = CorrelationPair["lagging"];

function laggingValue(
  p: TrendSeriesPoint,
  key: LaggingKey,
): number | null {
  if (!p.metrics) return null;
  switch (key) {
    case "trif":
      return p.metrics.recordableRatePer200k;
    case "ltif":
      return p.metrics.lostTimeRatePer200k;
    case "incidentRatePer200k":
      return p.metrics.incidentRatePer200k;
    case "severityIndex":
      return p.metrics.severityIndex;
  }
}

function leadingValue(
  p: TrendSeriesPoint,
  key: string,
): number | null {
  if (key === "controlsVerifiedRate") {
    return (
      p.leading?.controlsVerifiedRate ??
      p.metrics?.hecaControlsVerifiedRate ??
      null
    );
  }
  if (key === "nearMissReportingIndex") {
    return (
      p.leading?.nearMissReportingIndex ??
      p.metrics?.nearMissRatePer200k ??
      null
    );
  }
  const leading = p.leading as Record<string, number | null | undefined> | undefined;
  return leading?.[key] ?? null;
}

const LEADING_KEYS = [
  "controlsVerifiedRate",
  "nearMissReportingIndex",
  "observationRate",
  "inspectionCompletionRate",
  "trainingCurrencyRate",
] as const;

const LAGGING_KEYS: LaggingKey[] = [
  "trif",
  "ltif",
  "incidentRatePer200k",
  "severityIndex",
];

export function analyzeLeadingCorrelation(
  plane: DataPlane,
  scope: TrendCohortScope,
  series: TrendSeriesPoint[],
): LeadingCorrelationAnalysis {
  const usable = filterUsable(series);
  const pairs: CorrelationPair[] = [];

  for (const leading of LEADING_KEYS) {
    for (const lagging of LAGGING_KEYS) {
      const xs: number[] = [];
      const ys: number[] = [];
      for (const p of usable) {
        const x = leadingValue(p, leading);
        const y = laggingValue(p, lagging);
        if (x != null && y != null && Number.isFinite(x) && Number.isFinite(y)) {
          xs.push(x);
          ys.push(y);
        }
      }
      const r = pearson(xs, ys);
      pairs.push({
        leading,
        lagging,
        r: r == null ? null : round(r, 4),
        n: xs.length,
        strength: correlationStrength(r, xs.length),
      });
    }
  }

  // Prefer pairs with enough samples; keep all for transparency
  pairs.sort((a, b) => {
    const aa = a.r == null ? -1 : Math.abs(a.r);
    const bb = b.r == null ? -1 : Math.abs(b.r);
    return bb - aa;
  });

  void finiteNumbers;
  return { plane, scope, pairs };
}
