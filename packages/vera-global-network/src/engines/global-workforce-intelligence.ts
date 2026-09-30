import type { GlobalWorkforceIntelligence, NetworkContextInput } from "../types";
import { clamp } from "../utils/anonymize";

export class GlobalWorkforceIntelligenceEngine {
  analyze(ctx: NetworkContextInput): GlobalWorkforceIntelligence {
    const companies = ctx.companies ?? [];
    const regionMap = new Map<string, { workers: number; nonCompliant: number }>();

    for (const c of companies) {
      const region = c.region ?? "unknown";
      const cur = regionMap.get(region) ?? { workers: 0, nonCompliant: 0 };
      cur.workers += c.workerCount ?? 0;
      cur.nonCompliant += c.nonCompliantWorkers ?? 0;
      regionMap.set(region, cur);
    }

    const availabilityMap = [...regionMap.entries()].map(([region, data]) => ({
      region,
      availability: clamp(100 - (data.nonCompliant / Math.max(1, data.workers)) * 100),
    }));

    const shortagePredictions = [...regionMap.entries()]
      .filter(([, d]) => d.workers > 0 && d.nonCompliant / d.workers > 0.15)
      .map(([region, d]) => ({
        region,
        deficit: Math.ceil(d.workers * 0.1),
      }));

    const skillGaps = shortagePredictions.length
      ? ["Network-wide competency drift in active regions"]
      : [];

    return {
      availabilityMap,
      shortagePredictions,
      skillGaps,
      mobilityRecommendations: shortagePredictions.map(
        (s) => `Mobilize workers to ${s.region} (${s.deficit} estimated gap)`
      ),
      fatigueRisk: clamp(
        companies.reduce((s, c) => s + (c.nonCompliantWorkers ?? 0), 0) * 2
      ),
    };
  }
}
