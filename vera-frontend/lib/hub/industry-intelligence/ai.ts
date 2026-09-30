/**
 * AI narratives + predictive risk modeling for Industry Intelligence.
 */

import type {
  AiNarrative,
  FocusIndustry,
  IndustryBenchmark,
  LeadingMaturity,
  PredictiveRisk,
  RateSeriesPoint,
  RegionalTrend,
} from "./types";

export function generateNarratives(args: {
  industry: FocusIndustry;
  benchmark: IndustryBenchmark;
  series: RateSeriesPoint[];
  leading: LeadingMaturity[];
  regional: RegionalTrend[];
}): AiNarrative[] {
  const out: AiNarrative[] = [];
  const { industry, benchmark, series, leading, regional } = args;

  if (benchmark.suppressed) {
    out.push({
      id: "nar-suppressed",
      tone: "neutral",
      headline: "Insufficient sample for published benchmarks",
      body: `Fewer than 5 anonymized ${industry} entities in this plane/period. Categories remain hidden until the minimum sample threshold is met.`,
      sources: ["anonymization_engine"],
    });
    return out;
  }

  const latest = series[series.length - 1];
  const prev = series[series.length - 2];
  if (latest && prev) {
    const delta = Math.round((latest.trif - prev.trif) * 100) / 100;
    out.push({
      id: "nar-trif-trend",
      tone: delta > 0.2 ? "alert" : delta < -0.2 ? "positive" : "neutral",
      headline:
        delta > 0
          ? `${industry} TRIF edged up vs prior period`
          : delta < 0
            ? `${industry} TRIF improved vs prior period`
            : `${industry} TRIF stable vs prior period`,
      body: `Anonymized peer TRIF moved from ${prev.trif} to ${latest.trif} (${delta >= 0 ? "+" : ""}${delta}). LTIF is ${latest.ltif}; severity index ${latest.severityIndex}.`,
      sources: ["normalized_cohort", "rate_series"],
    });
  }

  const weakLeading = [...leading].sort((a, b) => a.score - b.score)[0];
  if (weakLeading && weakLeading.score < 65) {
    out.push({
      id: "nar-leading",
      tone: "caution",
      headline: `Leading-indicator gap: ${weakLeading.label}`,
      body: `${weakLeading.label} maturity scores ${weakLeading.score}/100 against an industry mean near ${weakLeading.industryMean}. Strengthening this control often precedes TRIF improvement.`,
      sources: ["leading_indicator_model"],
    });
  }

  const hotRegion = regional
    .filter((r) => !r.suppressed && r.trif != null)
    .sort((a, b) => (b.trif ?? 0) - (a.trif ?? 0))[0];
  if (hotRegion?.trif != null) {
    out.push({
      id: "nar-regional",
      tone: hotRegion.trif > (benchmark.trif ?? 2) + 0.5 ? "alert" : "neutral",
      headline: `Regional hotspot: ${hotRegion.label}`,
      body: `${hotRegion.label} shows peer TRIF ${hotRegion.trif} (n=${hotRegion.entityCount}). Compare leading-indicator maturity and HECA mix before escalating controls.`,
      sources: ["regional_aggregation"],
    });
  }

  if (benchmark.hecaHighEnergyPct != null && benchmark.hecaHighEnergyPct > 55) {
    out.push({
      id: "nar-heca",
      tone: "caution",
      headline: "High-energy HECA share elevated",
      body: `High-energy categories comprise ~${benchmark.hecaHighEnergyPct}% of the HECA distribution. Prioritize gravity, electrical, mechanical, and process-energy controls.`,
      sources: ["heca_normalization"],
    });
  }

  return out;
}

export function buildPredictiveRisk(args: {
  industry: FocusIndustry;
  benchmark: IndustryBenchmark;
  series: RateSeriesPoint[];
  leading: LeadingMaturity[];
}): PredictiveRisk[] {
  const { benchmark, series, leading, industry } = args;
  if (benchmark.suppressed || !series.length) {
    return [
      {
        horizon: "90d",
        riskScore: 0,
        band: "low",
        drivers: ["insufficient_sample"],
        projectedTrif: null,
        confidence: 0.2,
      },
    ];
  }

  const latest = series[series.length - 1]!;
  const prev = series[series.length - 2] ?? latest;
  const slope = latest.trif - prev.trif;
  const leadingAvg =
    leading.reduce((s, l) => s + l.score, 0) / Math.max(1, leading.length);
  const leadingGap = Math.max(0, 75 - leadingAvg);

  const score30 = clamp(
    35 + latest.trif * 8 + slope * 20 + leadingGap * 0.4 + latest.severityIndex * 3,
  );
  const score90 = clamp(score30 + slope * 12 + (industry === "mining" ? 4 : 0));
  const score12 = clamp(score90 + leadingGap * 0.25);

  return [
    pack("30d", score30, latest.trif + slope * 0.25, [
      slope > 0 ? "rising_trif" : "stable_trif",
      leadingGap > 10 ? "leading_gap" : "leading_ok",
    ]),
    pack("90d", score90, latest.trif + slope * 0.6, [
      "seasonal_exposure",
      benchmark.hecaHighEnergyPct && benchmark.hecaHighEnergyPct > 50
        ? "heca_energy"
        : "heca_balanced",
    ]),
    pack("12m", score12, latest.trif + slope * 1.1, [
      "structural_controls",
      "peer_benchmark_drift",
    ]),
  ];
}

function pack(
  horizon: PredictiveRisk["horizon"],
  riskScore: number,
  projectedTrif: number,
  drivers: string[],
): PredictiveRisk {
  return {
    horizon,
    riskScore: Math.round(riskScore),
    band:
      riskScore >= 75
        ? "critical"
        : riskScore >= 55
          ? "elevated"
          : riskScore >= 35
            ? "moderate"
            : "low",
    drivers,
    projectedTrif: Math.round(Math.max(0, projectedTrif) * 100) / 100,
    confidence: horizon === "30d" ? 0.72 : horizon === "90d" ? 0.61 : 0.48,
  };
}

function clamp(n: number) {
  return Math.max(0, Math.min(100, n));
}
