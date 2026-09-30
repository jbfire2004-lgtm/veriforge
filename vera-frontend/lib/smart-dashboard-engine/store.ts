/**
 * Time-series store for smart dashboard AI signals.
 */

import type { Industry, MetricId, SeriesPoint } from "./types";

export const PERIODS = [
  "2025-Q1",
  "2025-Q2",
  "2025-Q3",
  "2025-Q4",
  "2026-Q1",
  "2026-Q2",
] as const;

export const METRICS: MetricId[] = [
  "trif",
  "ltif",
  "near_miss_rate",
  "competency_pct",
  "inspection_completion_pct",
  "severity_index",
  "risk_score",
];

export const INDUSTRIES: Industry[] = [
  "mining",
  "construction",
  "manufacturing",
];

type Store = {
  revision: number;
  series: Record<Industry, Record<MetricId, SeriesPoint[]>>;
};

const g = globalThis as unknown as { __smartDashboardEngine?: Store };

function seedSeries(industry: Industry): Record<MetricId, SeriesPoint[]> {
  const base =
    industry === "mining" ? 1.8 : industry === "construction" ? 2.2 : 1.5;
  const out = {} as Record<MetricId, SeriesPoint[]>;

  out.trif = PERIODS.map((period, i) => {
    // Baseline declines as competency/inspections improve; mining has a Q4 spike anomaly
    let v = base + 0.35 - i * 0.12;
    if (industry === "mining" && period === "2025-Q4") v += 1.35;
    if (industry === "construction" && i >= 3) v += 0.25;
    if (industry === "manufacturing") v -= i * 0.04;
    return { period, value: Math.round(Math.max(0.2, v) * 100) / 100 };
  });

  out.ltif = out.trif.map((p) => ({
    period: p.period,
    value: Math.round(p.value * 0.42 * 100) / 100,
  }));

  out.near_miss_rate = PERIODS.map((period, i) => ({
    period,
    value: Math.round((8 + i * 0.6 + (industry === "mining" ? 2 : 0)) * 10) / 10,
  }));

  // Competency rises → should correlate negatively with incidents
  out.competency_pct = PERIODS.map((period, i) => {
    let v = 72 + i * 2.2;
    if (industry === "construction" && i < 2) v -= 6;
    return { period, value: Math.round(Math.min(98, v) * 10) / 10 };
  });

  // Inspection completion rises → should correlate negatively with risk
  out.inspection_completion_pct = PERIODS.map((period, i) => {
    let v = 78 + i * 1.8;
    if (industry === "mining" && period === "2025-Q4") v -= 12;
    return { period, value: Math.round(Math.min(99, Math.max(50, v)) * 10) / 10 };
  });

  out.severity_index = PERIODS.map((period, i) => {
    let v = 1.6 + (i % 3) * 0.15;
    if (industry === "mining" && period === "2025-Q4") v += 0.9;
    return { period, value: Math.round(v * 10) / 10 };
  });

  out.risk_score = PERIODS.map((period, i) => {
    const trif = out.trif[i]!.value;
    const insp = out.inspection_completion_pct[i]!.value;
    const comp = out.competency_pct[i]!.value;
    const v = Math.max(
      5,
      Math.min(100, Math.round(20 + trif * 12 + (90 - insp) * 0.5 + (85 - comp) * 0.35)),
    );
    return { period, value: v };
  });

  return out;
}

function store(): Store {
  if (!g.__smartDashboardEngine) {
    const series = {} as Store["series"];
    for (const industry of INDUSTRIES) {
      series[industry] = seedSeries(industry);
    }
    g.__smartDashboardEngine = { revision: 1, series };
  }
  return g.__smartDashboardEngine;
}

export function getSeries(
  industry: Industry,
): Record<MetricId, SeriesPoint[]> {
  return store().series[industry];
}

export function getRevision(): number {
  return store().revision;
}

export function bumpRevision(): number {
  store().revision += 1;
  return store().revision;
}
