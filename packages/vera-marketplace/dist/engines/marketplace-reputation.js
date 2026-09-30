"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketplaceReputationEngine = void 0;
const scoring_1 = require("../utils/scoring");
class MarketplaceReputationEngine {
    score(ctx) {
        const scores = [];
        const seen = new Set();
        for (const l of ctx.listings ?? []) {
            if (seen.has(l.sellerHash))
                continue;
            seen.add(l.sellerHash);
            scores.push({
                entityHash: l.sellerHash,
                entityType: l.category === "provider" ? "provider" : "company",
                score: (0, scoring_1.clamp)(l.readinessScore),
                reliability: (0, scoring_1.clamp)(l.readinessScore + (l.complianceOk ? 10 : -15)),
                compliance: l.complianceOk ? 90 : 45,
                safety: (0, scoring_1.clamp)(100 - (ctx.industryRiskScore ?? 20)),
            });
        }
        for (const l of ctx.listings ?? []) {
            if (l.category !== "workforce" || seen.has(`w-${l.id}`))
                continue;
            scores.push({
                entityHash: `worker-${l.id}`,
                entityType: "worker",
                score: (0, scoring_1.clamp)(l.readinessScore),
                reliability: (0, scoring_1.clamp)(l.readinessScore),
                compliance: l.complianceOk ? 88 : 50,
                safety: (0, scoring_1.clamp)((ctx.networkSafetyScore ?? 70)),
            });
        }
        return scores.slice(0, 30);
    }
}
exports.MarketplaceReputationEngine = MarketplaceReputationEngine;
//# sourceMappingURL=marketplace-reputation.js.map