import type { IndustryCompare } from "./types";

/** Preview industry benchmark table by sector. */
export const INDUSTRY_BENCHMARKS: Record<
  string,
  Record<
    string,
    {
      mean: number;
      p25: number;
      p50: number;
      p75: number;
      direction: "higher_better" | "lower_better";
      cohortSize: number;
    }
  >
> = {
  construction: {
    "training.compliant_pct": {
      mean: 81,
      p25: 72,
      p50: 81,
      p75: 89,
      direction: "higher_better",
      cohortSize: 42,
    },
    "sms.incident_rate": {
      mean: 2.4,
      p25: 1.4,
      p50: 2.2,
      p75: 3.1,
      direction: "lower_better",
      cohortSize: 42,
    },
    "sms.near_miss_rate": {
      mean: 9.1,
      p25: 5.2,
      p50: 8.8,
      p75: 12.4,
      direction: "higher_better",
      cohortSize: 42,
    },
    "sms.capa_closure_days": {
      mean: 16,
      p25: 9,
      p50: 15,
      p75: 22,
      direction: "lower_better",
      cohortSize: 42,
    },
    "pm.completion_rate": {
      mean: 86,
      p25: 78,
      p50: 86,
      p75: 93,
      direction: "higher_better",
      cohortSize: 38,
    },
    "asset.downtime_pct": {
      mean: 3.4,
      p25: 1.8,
      p50: 3.1,
      p75: 4.6,
      direction: "lower_better",
      cohortSize: 38,
    },
    "pm_safety.incident_rate": {
      mean: 1.5,
      p25: 0.7,
      p50: 1.4,
      p75: 2.2,
      direction: "lower_better",
      cohortSize: 38,
    },
  },
};

export function compareToIndustry(
  metricKey: string,
  companyValue: number | null,
  sector = "construction",
  period = "2026-Q2",
): IndustryCompare {
  const row = INDUSTRY_BENCHMARKS[sector]?.[metricKey];
  if (!row || companyValue == null) {
    return {
      industryValue: null,
      industryPercentile: null,
      cohortSize: 0,
      sampleSuppressed: true,
      period,
      direction: "higher_better",
      sector,
    };
  }

  // Approximate percentile from bands
  let percentile = 50;
  if (row.direction === "higher_better") {
    if (companyValue >= row.p75) percentile = 78;
    else if (companyValue >= row.p50) percentile = 62;
    else if (companyValue >= row.p25) percentile = 38;
    else percentile = 22;
  } else {
    if (companyValue <= row.p25) percentile = 78;
    else if (companyValue <= row.p50) percentile = 62;
    else if (companyValue <= row.p75) percentile = 38;
    else percentile = 22;
  }

  return {
    industryValue: row.mean,
    industryPercentile: percentile,
    cohortSize: row.cohortSize,
    sampleSuppressed: row.cohortSize < 5,
    period,
    direction: row.direction,
    sector,
  };
}
