/**
 * Daily industry benchmark builder + AI narratives.
 */

import { mean, MIN_SAMPLE } from "./normalize";
import type {
  EngineNarrative,
  FocusIndustry,
  IndustryBenchmark,
  NormalizedIndustryFact,
} from "./types";

const INDUSTRIES: FocusIndustry[] = ["mining", "construction", "manufacturing"];

export function buildBenchmarks(
  facts: NormalizedIndustryFact[],
  asOfDate: string,
  period = "2026-Q2",
): IndustryBenchmark[] {
  return INDUSTRIES.map((industry) => {
    const current = facts.filter(
      (f) => f.industry === industry && f.period === period,
    );
    const tokens = new Set(current.map((f) => f.token));
    const priorPeriod = "2026-Q1";
    const prior = facts.filter(
      (f) => f.industry === industry && f.period === priorPeriod,
    );
    const priorTrif = mean(prior.map((f) => f.trif));
    const trif = mean(current.map((f) => f.trif));

    if (tokens.size < MIN_SAMPLE) {
      return {
        industry,
        period,
        asOfDate,
        suppressed: true,
        entityCount: null,
        trif: null,
        ltif: null,
        nearMissRate: null,
        severityIndex: null,
        leadingMaturity: null,
        deltaTrifVsPrior: null,
      };
    }

    return {
      industry,
      period,
      asOfDate,
      suppressed: false,
      entityCount: tokens.size,
      trif,
      ltif: mean(current.map((f) => f.ltif)),
      nearMissRate: mean(current.map((f) => f.nearMissRate)),
      severityIndex: mean(current.map((f) => f.severityIndex)),
      leadingMaturity: mean(current.map((f) => f.leadingMaturity)),
      deltaTrifVsPrior:
        trif != null && priorTrif != null
          ? Math.round((trif - priorTrif) * 100) / 100
          : null,
    };
  });
}

export function generateNarratives(
  benchmarks: IndustryBenchmark[],
  facts: NormalizedIndustryFact[],
  now: string,
): EngineNarrative[] {
  const out: EngineNarrative[] = [];

  for (const b of benchmarks) {
    if (b.suppressed) {
      out.push({
        id: `nar-${b.industry}-suppressed`,
        industry: b.industry,
        tone: "neutral",
        category: "trend",
        headline: `${b.industry}: insufficient sample for published benchmark`,
        body: `Fewer than ${MIN_SAMPLE} anonymized external entities for ${b.industry} in ${b.period}. Daily update retained; category remains hidden.`,
        evidence: ["min_sample_gate"],
        generatedAt: now,
      });
      continue;
    }

    // Trend
    const delta = b.deltaTrifVsPrior;
    if (delta != null) {
      out.push({
        id: `nar-${b.industry}-trend`,
        industry: b.industry,
        tone: delta > 0.15 ? "alert" : delta < -0.15 ? "positive" : "neutral",
        category: "trend",
        headline:
          delta > 0
            ? `${b.industry} peer TRIF edged higher vs prior period`
            : delta < 0
              ? `${b.industry} peer TRIF improved vs prior period`
              : `${b.industry} peer TRIF stable vs prior period`,
        body: `Anonymized external cohort TRIF is ${b.trif} (n=${b.entityCount}). Change vs prior: ${delta >= 0 ? "+" : ""}${delta}. LTIF ${b.ltif}; leading maturity ${b.leadingMaturity}.`,
        evidence: ["daily_benchmark", "normalized_trif"],
        generatedAt: now,
      });
    }

    // Anomaly — high severity or low leading
    if (b.severityIndex != null && b.severityIndex >= 2.4) {
      out.push({
        id: `nar-${b.industry}-anom-sev`,
        industry: b.industry,
        tone: "caution",
        category: "anomaly",
        headline: `${b.industry}: elevated severity index in external feeds`,
        body: `Severity index ${b.severityIndex} is above the soft watch band (≥2.4). Cross-check regulatory extracts and incident databases for concentrated high-consequence events.`,
        evidence: ["severity_index", "multi_modal_extract"],
        generatedAt: now,
      });
    }

    if (b.leadingMaturity != null && b.leadingMaturity < 60) {
      out.push({
        id: `nar-${b.industry}-risk-leading`,
        industry: b.industry,
        tone: "alert",
        category: "risk",
        headline: `${b.industry}: leading-indicator maturity lagging`,
        body: `Leading maturity averages ${b.leadingMaturity}/100 across anonymized external sources. Weak leading controls often precede lagging-rate deterioration.`,
        evidence: ["leading_maturity", "risk_pattern"],
        generatedAt: now,
      });
    }

    // Modality coverage anomaly
    const industryFacts = facts.filter(
      (f) => f.industry === b.industry && f.period === b.period,
    );
    const visionShare =
      industryFacts.filter((f) => f.modality === "vision").length /
      Math.max(1, industryFacts.length);
    if (visionShare > 0.55) {
      out.push({
        id: `nar-${b.industry}-anom-vision`,
        industry: b.industry,
        tone: "neutral",
        category: "anomaly",
        headline: `${b.industry}: extraction skewed toward vision/PDF sources`,
        body: `${Math.round(visionShare * 100)}% of facts arrived via vision modality. Prefer corroborating scrape/LLM table extracts before locking the daily benchmark.`,
        evidence: ["modality_mix"],
        generatedAt: now,
      });
    }
  }

  return out;
}
