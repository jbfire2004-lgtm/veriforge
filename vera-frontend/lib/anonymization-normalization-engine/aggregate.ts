/**
 * Blind aggregation — aggregate only on anonymized tokens / bands.
 * Enforces minimum sample threshold (hide categories n < 5).
 */

import { MIN_SAMPLE, STANDARDIZED_CATEGORIES } from "./normalize";
import type {
  BlindAggregateKey,
  BlindAggregateResult,
  NormalizedFact,
  StandardizedCategory,
} from "./types";

function mean(vals: number[]): number | null {
  if (!vals.length) return null;
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100;
}

export type BlindAggregateOptions = {
  /** Default MIN_SAMPLE (5) */
  minSample?: number;
  /** Never reveal exact n when suppressed; when ok, may show n */
  revealCountWhenOk?: boolean;
};

/**
 * Blind aggregation rules:
 * 1. Group only by anonymized bands (plane, industry, period, region) — never by name/ID.
 * 2. Use opaque fact tokens for uniqueness — never raw company/project IDs.
 * 3. If unique tokens < minSample → suppress all metrics (null) and hide count.
 * 4. Never emit member tokens in the aggregate payload.
 */
export function blindAggregate(
  facts: NormalizedFact[],
  key: BlindAggregateKey,
  opts?: BlindAggregateOptions,
): BlindAggregateResult {
  const minSample = opts?.minSample ?? MIN_SAMPLE;
  const revealCountWhenOk = opts?.revealCountWhenOk ?? true;

  const cohort = facts.filter(
    (f) =>
      f.plane === key.plane &&
      f.industryBand === key.industryBand &&
      f.period === key.period &&
      (key.regionBand === "GLB" ||
        f.regionBand === key.regionBand ||
        f.regionBand.startsWith(`${key.regionBand}-`)),
  );

  const tokens = new Set(cohort.map((f) => f.token));
  if (tokens.size < minSample) {
    return {
      key,
      suppressed: true,
      entityCount: null,
      entityCountVisible: false,
      incidentRatePer200k: null,
      lostTimeRatePer200k: null,
      nearMissRatePer200k: null,
      severityIndex: null,
      categories: null,
      rule: "min_sample",
    };
  }

  const categories = {} as Record<StandardizedCategory, number>;
  for (const c of STANDARDIZED_CATEGORIES) {
    categories[c] = mean(cohort.map((f) => f.categories[c])) ?? 0;
  }

  return {
    key,
    suppressed: false,
    entityCount: revealCountWhenOk ? tokens.size : null,
    entityCountVisible: revealCountWhenOk,
    incidentRatePer200k: mean(cohort.map((f) => f.incidentRatePer200k)),
    lostTimeRatePer200k: mean(cohort.map((f) => f.lostTimeRatePer200k)),
    nearMissRatePer200k: mean(cohort.map((f) => f.nearMissRatePer200k)),
    severityIndex: mean(cohort.map((f) => f.severityIndex)),
    categories,
    rule: "ok",
  };
}

export function enforceMinSample<T>(
  entityCount: number,
  payload: T,
  minSample = MIN_SAMPLE,
): { suppressed: true; data: null } | { suppressed: false; data: T } {
  if (entityCount < minSample) {
    return { suppressed: true, data: null };
  }
  return { suppressed: false, data: payload };
}
