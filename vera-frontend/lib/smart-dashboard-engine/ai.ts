/**
 * AI narratives, risk forecasting, correlation analysis.
 */

import { HIGHER_IS_WORSE, METRIC_LABEL } from "./detect";
import { pearson, round, slope } from "./stats";
import type {
  AnomalyFinding,
  CorrelationFinding,
  MetricId,
  Narrative,
  RiskForecast,
  SeriesPoint,
  TrendFinding,
} from "./types";

export function generateNarratives(args: {
  industry: string;
  anomalies: AnomalyFinding[];
  trends: TrendFinding[];
  correlations: CorrelationFinding[];
  forecasts: RiskForecast[];
}): Narrative[] {
  const now = new Date().toISOString();
  const out: Narrative[] = [];

  const topAnom = args.anomalies[0];
  if (topAnom) {
    out.push({
      id: `nar-anom-${topAnom.id}`,
      tone:
        topAnom.severity === "critical" || topAnom.severity === "high"
          ? "alert"
          : "caution",
      category: "anomaly",
      headline: topAnom.headline,
      body: `${args.industry}: ${topAnom.detail} Review controls tied to ${METRIC_LABEL[topAnom.metric]} before the next period close.`,
      sources: ["anomaly_detection", topAnom.metric],
      generatedAt: now,
    });
  }

  for (const t of args.trends.filter((x) => x.direction !== "stable").slice(0, 3)) {
    out.push({
      id: `nar-trend-${t.id}`,
      tone:
        t.direction === "improving"
          ? "positive"
          : t.direction === "worsening"
            ? "caution"
            : "neutral",
      category: "trend",
      headline: t.headline,
      body: t.detail,
      sources: ["trend_detection", t.metric],
      generatedAt: now,
    });
  }

  for (const c of args.correlations.filter((x) => x.interpretation !== "weak")) {
    out.push({
      id: `nar-corr-${c.id}`,
      tone: c.interpretation === "protective" ? "positive" : "alert",
      category: "correlation",
      headline: c.headline,
      body: c.detail,
      sources: ["correlation_analysis", c.xMetric, c.yMetric],
      generatedAt: now,
    });
  }

  const f90 = args.forecasts.find((f) => f.horizon === "90d");
  if (f90) {
    out.push({
      id: "nar-risk-90d",
      tone:
        f90.band === "critical" || f90.band === "elevated"
          ? "alert"
          : f90.band === "moderate"
            ? "caution"
            : "neutral",
      category: "risk",
      headline: `90-day risk outlook: ${f90.band} (${f90.riskScore})`,
      body: `Projected TRIF ${f90.projectedTrif}, LTIF ${f90.projectedLtif}. Drivers: ${f90.drivers.join(", ")}.`,
      sources: ["risk_forecasting", ...f90.drivers],
      generatedAt: now,
    });
  }

  if (!out.length) {
    out.push({
      id: "nar-baseline",
      tone: "neutral",
      category: "trend",
      headline: "No material AI signals",
      body: "Anomaly, trend, and correlation detectors are within expected bands for the selected industry.",
      sources: ["smart_dashboard_engine"],
      generatedAt: now,
    });
  }

  return out;
}

export function forecastRisk(
  seriesMap: Record<MetricId, SeriesPoint[]>,
): RiskForecast[] {
  const trif = seriesMap.trif ?? [];
  const ltif = seriesMap.ltif ?? [];
  const risk = seriesMap.risk_score ?? [];
  const comp = seriesMap.competency_pct ?? [];
  const insp = seriesMap.inspection_completion_pct ?? [];

  const latestTrif = trif[trif.length - 1]?.value ?? 2;
  const latestLtif = ltif[ltif.length - 1]?.value ?? 0.8;
  const latestRisk = risk[risk.length - 1]?.value ?? 40;
  const trifSlope = slope(trif);
  const compSlope = slope(comp);
  const inspSlope = slope(insp);

  const drivers: string[] = [];
  if (trifSlope > 0.05) drivers.push("rising_trif");
  else drivers.push("stable_trif");
  if (compSlope > 0.5) drivers.push("improving_competency");
  else if (compSlope < -0.3) drivers.push("competency_erosion");
  else drivers.push("competency_flat");
  if (inspSlope < -0.5) drivers.push("inspection_slippage");
  else drivers.push("inspection_coverage_ok");

  function pack(
    horizon: RiskForecast["horizon"],
    boost: number,
    conf: number,
  ): RiskForecast {
    const projectedTrif = round(Math.max(0, latestTrif + trifSlope * boost));
    const projectedLtif = round(Math.max(0, latestLtif + trifSlope * 0.4 * boost));
    const score = Math.max(
      0,
      Math.min(
        100,
        Math.round(
          latestRisk +
            trifSlope * 18 * boost +
            (compSlope < 0 ? Math.abs(compSlope) * 8 : -compSlope * 4) +
            (inspSlope < 0 ? Math.abs(inspSlope) * 6 : -inspSlope * 3),
        ),
      ),
    );
    return {
      horizon,
      riskScore: score,
      band:
        score >= 75
          ? "critical"
          : score >= 55
            ? "elevated"
            : score >= 35
              ? "moderate"
              : "low",
      projectedTrif,
      projectedLtif,
      drivers,
      confidence: conf,
    };
  }

  return [pack("30d", 0.35, 0.74), pack("90d", 0.85, 0.62), pack("12m", 1.8, 0.48)];
}

/**
 * Correlation analysis:
 * - competency → incidents (TRIF)
 * - inspections → risk
 */
export function analyzeCorrelations(
  seriesMap: Record<MetricId, SeriesPoint[]>,
): CorrelationFinding[] {
  const pairs: Array<{
    id: string;
    x: MetricId;
    y: MetricId;
    expected: "protective" | "risk_amplifying";
  }> = [
    {
      id: "competency-incidents",
      x: "competency_pct",
      y: "trif",
      expected: "protective",
    },
    {
      id: "inspections-risk",
      x: "inspection_completion_pct",
      y: "risk_score",
      expected: "protective",
    },
    {
      id: "near-miss-trif",
      x: "near_miss_rate",
      y: "trif",
      expected: "risk_amplifying",
    },
  ];

  return pairs.map((p) => {
    const xs = (seriesMap[p.x] ?? []).map((pt) => pt.value);
    const ys = (seriesMap[p.y] ?? []).map((pt) => pt.value);
    const r = round(pearson(xs, ys), 3);
    const abs = Math.abs(r);
    let interpretation: CorrelationFinding["interpretation"] = "weak";
    if (abs >= 0.35) {
      // Protective if higher X associates with lower Y when Y is a harm metric
      const yWorse = HIGHER_IS_WORSE.has(p.y);
      if (yWorse && r < -0.35) interpretation = "protective";
      else if (yWorse && r > 0.35) interpretation = "risk_amplifying";
      else if (!yWorse && r > 0.35) interpretation = "protective";
      else interpretation = "risk_amplifying";
    }

    return {
      id: p.id,
      pair: `${METRIC_LABEL[p.x]} → ${METRIC_LABEL[p.y]}`,
      xMetric: p.x,
      yMetric: p.y,
      r,
      interpretation,
      headline:
        interpretation === "weak"
          ? `Weak link: ${METRIC_LABEL[p.x]} vs ${METRIC_LABEL[p.y]}`
          : interpretation === "protective"
            ? `Protective link: ${METRIC_LABEL[p.x]} ↔ ${METRIC_LABEL[p.y]}`
            : `Risk-amplifying link: ${METRIC_LABEL[p.x]} ↔ ${METRIC_LABEL[p.y]}`,
      detail: `Pearson r=${r} across ${Math.min(xs.length, ys.length)} periods. ${
        interpretation === "protective"
          ? "Strengthening the leading metric tends to accompany lower harm/risk."
          : interpretation === "risk_amplifying"
            ? "Movement in the leading metric aligns with higher harm/risk — investigate causality."
            : "No strong linear association in the current window."
      }`,
      confidence: round(Math.min(0.88, 0.45 + abs * 0.5), 2),
      samplePoints: Math.min(xs.length, ys.length),
    };
  });
}
