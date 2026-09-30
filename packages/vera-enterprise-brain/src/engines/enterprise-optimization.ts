import type { BrainContextInput, OptimizationResult } from "../types";
import type { ingestAllPhases } from "../integrations/phase-integration";

export class EnterpriseOptimizationEngine {
  optimize(ctx: BrainContextInput, phases: ReturnType<typeof ingestAllPhases>): OptimizationResult[] {
    const results: OptimizationResult[] = [];

    const domains = [
      "workforce",
      "equipment",
      "crew",
      "shift",
      "dispatch",
      "training",
      "safety",
      "compliance",
      "project",
      "multi_project",
    ];

    for (const domain of domains) {
      let score = 70;
      const recommendations: string[] = [];
      const allocations: OptimizationResult["allocations"] = [];

      if (domain === "workforce" && (ctx.schedulingShortages?.length ?? 0) > 0) {
        score = 55;
        recommendations.push("Reallocate available workers to shortage projects");
        for (const s of ctx.schedulingShortages!.slice(0, 3)) {
          allocations.push({ entityId: "pool", targetId: s.projectId, priority: 90 - s.deficit });
        }
      }
      if (domain === "safety" && (ctx.sifPrecursors ?? 0) > 0) {
        score = 45;
        recommendations.push("Apply Energy Wheel controls", "Trigger SIF interventions");
      }
      if (domain === "dispatch" && phases.command.dashboard.staffing.shortages > 0) {
        score = 60;
        recommendations.push("Optimize union hall dispatch order");
      }
      if (domain === "compliance" && (ctx.nonCompliantWorkers ?? 0) > 0) {
        score = 50;
        recommendations.push("Prioritize training renewals");
      }

      results.push({ domain, score, recommendations, allocations });
    }

    return results;
  }
}
