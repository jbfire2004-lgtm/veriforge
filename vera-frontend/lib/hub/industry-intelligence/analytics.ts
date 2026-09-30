/**
 * Benchmarks, HECA trends, leading maturity, regional trends, comparisons.
 * Enforces plane isolation and n≥5 suppression.
 */

import { MIN_SAMPLE, LEADING_KEYS, LEADING_LABELS, HECA_KEYS } from "./normalize";
import { getFacts } from "./ingest";
import type {
  DataPlane,
  FocusIndustry,
  HecaPoint,
  IndustryBenchmark,
  IndustryComparisonRow,
  LeadingMaturity,
  RateSeriesPoint,
  RegionalTrend,
} from "./types";

function mean(vals: number[]): number | null {
  if (!vals.length) return null;
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100;
}

function uniqueTokens(
  industry: FocusIndustry,
  plane: DataPlane,
  period?: string,
  regionCode?: string,
) {
  const facts = getFacts({ industry, plane, period, regionCode });
  return { facts, tokens: new Set(facts.map((f) => f.token)) };
}

export function buildBenchmark(
  industry: FocusIndustry,
  plane: DataPlane,
  period: string,
  regionCode = "GLB",
): IndustryBenchmark {
  const { facts, tokens } = uniqueTokens(industry, plane, period, regionCode);
  const suppressed = tokens.size < MIN_SAMPLE;
  if (suppressed) {
    return {
      industry,
      plane,
      period,
      suppressed: true,
      entityCount: null,
      trif: null,
      ltif: null,
      severityIndex: null,
      hecaHighEnergyPct: null,
      leadingMaturityAvg: null,
    };
  }
  const highEnergy = ["gravity", "electrical", "mechanical", "pressure", "chemical", "thermal"];
  const hecaHigh = facts.map((f) =>
    highEnergy.reduce((s, k) => s + (f.heca[k as keyof typeof f.heca] ?? 0), 0),
  );
  const leadingAvgs = facts.map((f) => {
    const vals = LEADING_KEYS.map((k) => f.leading[k]);
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  });
  return {
    industry,
    plane,
    period,
    suppressed: false,
    entityCount: tokens.size,
    trif: mean(facts.map((f) => f.trif)),
    ltif: mean(facts.map((f) => f.ltif)),
    severityIndex: mean(facts.map((f) => f.severityIndex)),
    hecaHighEnergyPct: mean(hecaHigh),
    leadingMaturityAvg: mean(leadingAvgs),
  };
}

export function buildHecaTrends(
  industry: FocusIndustry,
  plane: DataPlane,
): HecaPoint[] {
  const facts = getFacts({ industry, plane });
  const byPeriod = new Map<string, typeof facts>();
  for (const f of facts) {
    const list = byPeriod.get(f.period) ?? [];
    list.push(f);
    byPeriod.set(f.period, list);
  }
  const out: HecaPoint[] = [];
  for (const [period, rows] of [...byPeriod.entries()].sort()) {
    const tokens = new Set(rows.map((r) => r.token));
    if (tokens.size < MIN_SAMPLE) continue;
    for (const cat of HECA_KEYS) {
      const m = mean(rows.map((r) => r.heca[cat]));
      if (m != null) out.push({ period, category: cat, ratePct: m });
    }
  }
  return out;
}

export function buildTrifLtifSeries(
  industry: FocusIndustry,
  plane: DataPlane,
): RateSeriesPoint[] {
  const facts = getFacts({ industry, plane });
  const byPeriod = new Map<string, typeof facts>();
  for (const f of facts) {
    const list = byPeriod.get(f.period) ?? [];
    list.push(f);
    byPeriod.set(f.period, list);
  }
  const out: RateSeriesPoint[] = [];
  for (const [period, rows] of [...byPeriod.entries()].sort()) {
    const tokens = new Set(rows.map((r) => r.token));
    if (tokens.size < MIN_SAMPLE) continue;
    out.push({
      period,
      trif: mean(rows.map((r) => r.trif)) ?? 0,
      ltif: mean(rows.map((r) => r.ltif)) ?? 0,
      severityIndex: mean(rows.map((r) => r.severityIndex)) ?? 0,
    });
  }
  return out;
}

export function buildLeadingMaturity(
  industry: FocusIndustry,
  plane: DataPlane,
  period: string,
): LeadingMaturity[] {
  const { facts, tokens } = uniqueTokens(industry, plane, period);
  if (tokens.size < MIN_SAMPLE) {
    return LEADING_KEYS.map((key) => ({
      key,
      label: LEADING_LABELS[key],
      score: 0,
      industryMean: 0,
    }));
  }
  return LEADING_KEYS.map((key) => {
    const score = mean(facts.map((f) => f.leading[key])) ?? 0;
    return {
      key,
      label: LEADING_LABELS[key],
      score,
      industryMean: Math.round((score * 0.95 + 55 * 0.05) * 10) / 10,
    };
  });
}

const REGION_LABELS: Record<string, string> = {
  "CA-AB": "Alberta",
  "CA-BC": "British Columbia",
  "CA-ON": "Ontario",
  "US-TX": "Texas",
  "US-NV": "Nevada",
  "CA-AB-north": "Northern Alberta",
  "CA-AB-edm": "Edmonton metro",
};

export function buildRegionalTrends(
  industry: FocusIndustry,
  plane: DataPlane,
  period: string,
): RegionalTrend[] {
  const roots = ["CA-AB", "CA-BC", "CA-ON", "US-TX", "US-NV"];
  return roots.map((code) => {
    const b = buildBenchmark(industry, plane, period, code);
    return {
      regionCode: code,
      label: REGION_LABELS[code] ?? code,
      trif: b.trif,
      ltif: b.ltif,
      entityCount: b.entityCount,
      suppressed: b.suppressed,
    };
  });
}

export function buildIndustryComparisons(
  plane: DataPlane,
  period: string,
): IndustryComparisonRow[] {
  const industries: FocusIndustry[] = ["mining", "construction", "manufacturing"];
  return industries.map((industry) => {
    const b = buildBenchmark(industry, plane, period);
    return {
      industry,
      trif: b.trif,
      ltif: b.ltif,
      severityIndex: b.severityIndex,
      leadingMaturityAvg: b.leadingMaturityAvg,
      suppressed: b.suppressed,
      entityCount: b.entityCount,
    };
  });
}

/** Opt-in cross-plane blend — only when user explicitly enables. */
export function buildCrossPlaneBenchmark(
  industry: FocusIndustry,
  period: string,
  optIn: boolean,
): IndustryBenchmark | { denied: true; reason: string } {
  if (!optIn) {
    return {
      denied: true,
      reason: "Cross-plane mix requires explicit opt-in.",
    };
  }
  const project = getFacts({ industry, plane: "project", period });
  const company = getFacts({ industry, plane: "company", period });
  const facts = [...project, ...company];
  const tokens = new Set(facts.map((f) => f.token));
  if (tokens.size < MIN_SAMPLE) {
    return {
      industry,
      plane: "company",
      period,
      suppressed: true,
      entityCount: null,
      trif: null,
      ltif: null,
      severityIndex: null,
      hecaHighEnergyPct: null,
      leadingMaturityAvg: null,
    };
  }
  return {
    industry,
    plane: "company",
    period,
    suppressed: false,
    entityCount: tokens.size,
    trif: mean(facts.map((f) => f.trif)),
    ltif: mean(facts.map((f) => f.ltif)),
    severityIndex: mean(facts.map((f) => f.severityIndex)),
    hecaHighEnergyPct: null,
    leadingMaturityAvg: null,
  };
}
