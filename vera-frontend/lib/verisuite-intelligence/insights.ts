/**
 * AI Insight Engine — trend / anomaly / risk pattern detection (deterministic preview).
 */

import type {
  AiInsight,
  CohortMetrics,
  IndustryCode,
  IntelligencePlane,
  ModuleLens,
} from "./types";

export function detectInsights(opts: {
  plane: IntelligencePlane;
  industry: IndustryCode;
  regionCode: string;
  metrics: CohortMetrics;
  module?: ModuleLens;
}): AiInsight[] {
  const out: AiInsight[] = [];
  const at = new Date().toISOString();
  const m = opts.metrics;
  if (m.suppressed) return out;

  if (m.trif != null && m.trif > 2.5) {
    out.push({
      insightId: `anom-trif-${opts.regionCode}`,
      kind: "anomaly",
      severity: m.trif > 4 ? "critical" : "alert",
      metricId: "trif",
      summary: `TRIF ${m.trif} is elevated vs construction peer band (~2.0) in ${opts.regionCode}.`,
      confidence: 0.78,
      module: opts.module ?? "hub",
      regionCode: opts.regionCode,
      detectedAt: at,
    });
  }

  if (m.nearMissRate != null && m.trif != null && m.nearMissRate < m.trif * 2) {
    out.push({
      insightId: `risk-reporting-${opts.regionCode}`,
      kind: "risk_pattern",
      severity: "watch",
      metricId: "near_miss_rate",
      summary:
        "Near-miss reporting density is low relative to recordables — possible under-reporting pattern.",
      confidence: 0.66,
      module: opts.module ?? "core",
      regionCode: opts.regionCode,
      detectedAt: at,
    });
  }

  if (m.highRiskPermitOpen != null && m.highRiskPermitOpen >= 2) {
    out.push({
      insightId: `risk-permits-${opts.regionCode}`,
      kind: "risk_pattern",
      severity: "alert",
      metricId: "high_risk_permits",
      summary: `Average ${m.highRiskPermitOpen} high-risk permits open — FieldOS/VERIPM load elevated.`,
      confidence: 0.72,
      module: "fieldos",
      regionCode: opts.regionCode,
      detectedAt: at,
    });
  }

  if (m.trainingCompliantPct != null && m.trainingCompliantPct < 85) {
    out.push({
      insightId: `trend-training-${opts.regionCode}`,
      kind: "trend",
      severity: "watch",
      metricId: "training_compliant_pct",
      summary: `Training compliance at ${m.trainingCompliantPct}% — below 85% peer threshold.`,
      confidence: 0.7,
      module: "core",
      regionCode: opts.regionCode,
      detectedAt: at,
    });
  }

  if (m.capaClosureDays != null && m.capaClosureDays > 18) {
    out.push({
      insightId: `trend-action-closure-${opts.regionCode}`,
      kind: "trend",
      severity: "watch",
      metricId: "action_closure_days",
      summary: `Action closure averaging ${m.capaClosureDays} days — slower than industry mid-band.`,
      confidence: 0.69,
      module: "pm",
      regionCode: opts.regionCode,
      detectedAt: at,
    });
  }

  if (m.hecaHighEnergyPct != null && m.hecaHighEnergyPct > 35) {
    out.push({
      insightId: `risk-heca-${opts.regionCode}`,
      kind: "risk_pattern",
      severity: "alert",
      metricId: "heca_high_energy",
      summary: `High-energy HECA share ${m.hecaHighEnergyPct}% — prioritize SIF controls.`,
      confidence: 0.74,
      module: "hub",
      regionCode: opts.regionCode,
      detectedAt: at,
    });
  }

  return out;
}
