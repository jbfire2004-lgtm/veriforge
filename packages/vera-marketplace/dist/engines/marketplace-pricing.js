"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketplacePricingEngine = void 0;
const scoring_1 = require("../utils/scoring");
let quoteId = 0;
class MarketplacePricingEngine {
    price(ctx, matching) {
        const riskMult = (ctx.industryRiskScore ?? 30) > 60 ? 1.25 : 1;
        const demandPressure = (ctx.demands?.length ?? 0) / Math.max(1, ctx.listings?.length ?? 1);
        const dynamicMultiplier = (0, scoring_1.clamp)(0.8 + demandPressure * 0.4 + (riskMult - 1), 0.5, 2);
        const quotes = matching.matches.slice(0, 20).map((m) => {
            quoteId += 1;
            const base = 100 + m.score;
            const surge = m.factors.includes("sif_heca_specialist") ? 1.4 : 1;
            const adjusted = Math.round(base * dynamicMultiplier * surge);
            return {
                id: `quote-${quoteId}`,
                matchId: m.id,
                basePrice: base,
                adjustedPrice: adjusted,
                factors: [
                    "dynamic_pricing",
                    demandPressure > 1.2 ? "demand_surge" : "supply_balanced",
                    (ctx.industryRiskScore ?? 0) > 50 ? "risk_premium" : "standard",
                ],
                currency: "USD",
            };
        });
        const surgeRegions = [...new Set((ctx.demands ?? []).map((d) => d.region))].filter((_, i, arr) => arr.length > 2 && demandPressure > 1.3);
        return { quotes, surgeRegions, dynamicMultiplier };
    }
}
exports.MarketplacePricingEngine = MarketplacePricingEngine;
//# sourceMappingURL=marketplace-pricing.js.map