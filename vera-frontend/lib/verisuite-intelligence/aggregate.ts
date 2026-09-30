/**
 * Blind cohort aggregation + dual-plane metrics.
 */

import { MIN_SAMPLE, shouldSuppress } from "./anonymize";
import { listFacts } from "./ingest";
import type { CohortMetrics, IntelligencePlane, IndustryCode } from "./types";

function mean(vals: Array<number | null | undefined>): number | null {
  const v = vals.filter((x): x is number => x != null && Number.isFinite(x));
  if (!v.length) return null;
  return Math.round((v.reduce((a, b) => a + b, 0) / v.length) * 100) / 100;
}

export function aggregateCohort(opts: {
  plane: IntelligencePlane;
  industry: IndustryCode;
  regionCode?: string;
}): CohortMetrics {
  const facts = listFacts({
    industry: opts.industry,
    plane: opts.plane,
    regionCode: opts.regionCode,
  });
  const tokens = new Set(facts.map((f) => f.token));
  const suppressed = shouldSuppress(tokens.size);
  if (suppressed) {
    return {
      trif: null,
      ltif: null,
      nearMissRate: null,
      trainingCompliantPct: null,
      capaClosureDays: null,
      highRiskPermitOpen: null,
      hecaHighEnergyPct: null,
      entityCount: null,
      suppressed: true,
    };
  }
  return {
    trif: mean(facts.map((f) => f.trif)),
    ltif: mean(facts.map((f) => f.ltif)),
    nearMissRate: mean(facts.map((f) => f.nearMissRate)),
    trainingCompliantPct: mean(facts.map((f) => f.trainingCompliantPct)),
    capaClosureDays: mean(facts.map((f) => f.capaClosureDays)),
    highRiskPermitOpen: mean(facts.map((f) => f.highRiskPermitOpen)),
    hecaHighEnergyPct: mean(facts.map((f) => f.hecaHighEnergyPct)),
    entityCount: tokens.size,
    suppressed: false,
  };
}

export { MIN_SAMPLE };
