import { MIN_SAMPLE, type BlindAggregateResult, type CohortKey, type NormalizedMetrics, type NormalizedPlaneFact } from "./types";
import { round } from "./normalize";

export type BlindAggregateOptions = {
  minSample?: number;
  /** When suppressed, hide exact entity counts from public meta */
  hideExactCountWhenSuppressed?: boolean;
  /** Skip min/max style stats unless n >= this (default 10) */
  minSampleForExtremes?: number;
};

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return round(values.reduce((a, b) => a + b, 0) / values.length, 4);
}

function avgMetric(
  facts: NormalizedPlaneFact[],
  pick: (m: NormalizedMetrics) => number | null | undefined,
): number | null {
  const vals = facts
    .map((f) => pick(f.metrics))
    .filter((v): v is number => v != null && Number.isFinite(v));
  return mean(vals);
}

function mergeHecaDistribution(
  facts: NormalizedPlaneFact[],
): NormalizedMetrics["hecaDistribution"] {
  const acc: Record<string, number[]> = {};
  for (const f of facts) {
    for (const [k, v] of Object.entries(f.metrics.hecaDistribution)) {
      if (v == null || !Number.isFinite(v)) continue;
      (acc[k] ??= []).push(v);
    }
  }
  const out: NormalizedMetrics["hecaDistribution"] = {};
  for (const [k, vals] of Object.entries(acc)) {
    const m = mean(vals);
    if (m != null) {
      (out as Record<string, number>)[k] = m;
    }
  }
  return out;
}

/**
 * Blind aggregation: cohort means only, suppress when distinct tokens < minSample.
 */
export function blindAggregate(
  facts: NormalizedPlaneFact[],
  key: CohortKey,
  options: BlindAggregateOptions = {},
): BlindAggregateResult {
  const minSample = options.minSample ?? MIN_SAMPLE;
  const hideExact = options.hideExactCountWhenSuppressed ?? true;

  // Plane isolation: ignore facts from the wrong plane
  const planeFacts = facts.filter((f) => {
    if (f.plane !== key.entityType) return false;
    if (key.regionCode && key.regionCode !== "GLB") {
      const band = (f.regionBand ?? "").toUpperCase();
      const code = key.regionCode.toUpperCase();
      if (!band || !(band === code || band.startsWith(`${code}-`) || band.startsWith(code))) {
        return false;
      }
    }
    return true;
  });
  const tokens = new Set(planeFacts.map((f) => f.token));
  const entityCount = tokens.size;
  const suppressed = entityCount < minSample;

  if (suppressed) {
    return {
      key,
      suppressed: true,
      entityCount: hideExact ? null : entityCount,
      entityCountVisible: !hideExact,
      minSample: MIN_SAMPLE,
      metrics: null,
    };
  }

  const metrics: NormalizedMetrics = {
    incidentRatePer200k: avgMetric(planeFacts, (m) => m.incidentRatePer200k),
    recordableRatePer200k: avgMetric(planeFacts, (m) => m.recordableRatePer200k),
    lostTimeRatePer200k: avgMetric(planeFacts, (m) => m.lostTimeRatePer200k),
    nearMissRatePer200k: avgMetric(planeFacts, (m) => m.nearMissRatePer200k),
    severityIndex: avgMetric(planeFacts, (m) => m.severityIndex),
    hecaHighEnergyRate: avgMetric(planeFacts, (m) => m.hecaHighEnergyRate),
    hecaControlsVerifiedRate: avgMetric(
      planeFacts,
      (m) => m.hecaControlsVerifiedRate,
    ),
    hecaDistribution: mergeHecaDistribution(planeFacts),
    hoursBasis: planeFacts[0]?.metrics.hoursBasis ?? 200_000,
  };

  return {
    key,
    suppressed: false,
    entityCount,
    entityCountVisible: true,
    minSample: MIN_SAMPLE,
    metrics,
  };
}

export function shouldSuppress(
  entityCount: number,
  minSample: number = MIN_SAMPLE,
): boolean {
  return entityCount < minSample;
}

export function groupFactsByCohort(
  facts: NormalizedPlaneFact[],
): Map<string, NormalizedPlaneFact[]> {
  const map = new Map<string, NormalizedPlaneFact[]>();
  for (const f of facts) {
    const key = [
      f.plane,
      f.industry,
      f.subtype,
      f.scale,
      f.period,
      f.regionBand ?? "GLB",
    ].join("|");
    const list = map.get(key) ?? [];
    list.push(f);
    map.set(key, list);
  }
  return map;
}
