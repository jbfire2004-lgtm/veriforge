import type { MarketplaceContextInput, ReputationScore } from "../types";
import { clamp } from "../utils/scoring";

export class MarketplaceReputationEngine {
  score(ctx: MarketplaceContextInput): ReputationScore[] {
    const scores: ReputationScore[] = [];
    const seen = new Set<string>();

    for (const l of ctx.listings ?? []) {
      if (seen.has(l.sellerHash)) continue;
      seen.add(l.sellerHash);
      scores.push({
        entityHash: l.sellerHash,
        entityType: l.category === "provider" ? "provider" : "company",
        score: clamp(l.readinessScore),
        reliability: clamp(l.readinessScore + (l.complianceOk ? 10 : -15)),
        compliance: l.complianceOk ? 90 : 45,
        safety: clamp(100 - (ctx.industryRiskScore ?? 20)),
      });
    }

    for (const l of ctx.listings ?? []) {
      if (l.category !== "workforce" || seen.has(`w-${l.id}`)) continue;
      scores.push({
        entityHash: `worker-${l.id}`,
        entityType: "worker",
        score: clamp(l.readinessScore),
        reliability: clamp(l.readinessScore),
        compliance: l.complianceOk ? 88 : 50,
        safety: clamp((ctx.networkSafetyScore ?? 70)),
      });
    }

    return scores.slice(0, 30);
  }
}
