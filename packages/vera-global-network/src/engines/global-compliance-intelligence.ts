import type { GlobalComplianceIntelligence, NetworkContextInput } from "../types";
import { clamp } from "../utils/anonymize";

export class GlobalComplianceIntelligenceEngine {
  analyze(ctx: NetworkContextInput): GlobalComplianceIntelligence {
    const companies = ctx.companies ?? [];
    const workers = companies.reduce((s, c) => s + (c.workerCount ?? 0), 0);
    const gaps = companies.reduce((s, c) => s + (c.nonCompliantWorkers ?? 0), 0);
    const rate = workers > 0 ? ((workers - gaps) / workers) * 100 : 100;

    const byRegion = new Map<string, number>();
    for (const c of companies) {
      const r = c.region ?? "global";
      byRegion.set(r, (byRegion.get(r) ?? 0) + (c.nonCompliantWorkers ?? 0));
    }

    return {
      globalScore: clamp(Math.round(rate)),
      trends: [...byRegion.entries()].map(([label, value]) => ({ label, value })),
      regulatoryRisks: gaps > workers * 0.1 ? ["Network compliance drift exceeds 10% threshold"] : [],
      recommendations: [
        "Federated compliance recalc across all tenants",
        gaps > 0 ? "Prioritize network training renewal campaign" : "Maintain compliance posture",
      ],
    };
  }
}
