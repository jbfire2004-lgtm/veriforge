"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketplaceMatchingEngine = void 0;
class MarketplaceMatchingEngine {
    match(ctx, categories) {
        const allMatches = categories.flatMap((c) => c.matches);
        return {
            matches: allMatches.sort((a, b) => b.score - a.score),
            skillMatches: allMatches.filter((m) => m.factors.includes("skill_fit") || m.factors.includes("competency_aligned")).length,
            complianceMatches: allMatches.filter((m) => m.factors.includes("compliance_ok")).length,
            readinessMatches: allMatches.filter((m) => m.factors.includes("readiness")).length,
            locationMatches: allMatches.filter((m) => m.score >= 70).length,
        };
    }
}
exports.MarketplaceMatchingEngine = MarketplaceMatchingEngine;
//# sourceMappingURL=marketplace-matching.js.map