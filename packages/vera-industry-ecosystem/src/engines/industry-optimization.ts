import type { IndustryContextInput, IndustryOptimization } from "../types";
import { clamp } from "../utils/scoring";

export class IndustryOptimizationEngine {
  optimize(ctx: IndustryContextInput): IndustryOptimization {
    const p = ctx.participants ?? [];
    const byRegion = new Map<string, { workers: number; equipment: number; gaps: number }>();

    for (const x of p) {
      const cur = byRegion.get(x.region) ?? { workers: 0, equipment: 0, gaps: 0 };
      cur.workers += x.workerCount ?? 0;
      cur.equipment += x.equipmentCount ?? 0;
      cur.gaps += x.nonCompliantWorkers ?? 0;
      byRegion.set(x.region, cur);
    }

    const allocations = [...byRegion.entries()].map(([region, d]) => ({
      region,
      resource: "workforce",
      fromSurplus: Math.max(0, d.workers - d.gaps - 10),
      toDeficit: d.gaps,
    }));

    const totalGaps = p.reduce((s, x) => s + (x.nonCompliantWorkers ?? 0), 0);
    const efficiencyGain = clamp(15 + (p.length > 3 ? 10 : 0) - totalGaps * 0.5);

    return {
      allocations,
      workforceDistribution: allocations
        .filter((a) => a.toDeficit > 0)
        .map((a) => `Shift ${a.toDeficit} seats to ${a.region} via federated pool`),
      equipmentDistribution: ["Balance inspection-heavy fleets across regions"],
      trainingDistribution: ["Route expiring workers to nearest provider capacity"],
      dispatchDistribution: ["Load-balance union hall dispatch queues by region"],
      safetyResourceMoves: ["Concentrate controls on top industry hazard clusters"],
      efficiencyGain,
    };
  }
}
