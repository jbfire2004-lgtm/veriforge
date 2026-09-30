"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalDispatchIntelligenceEngine = void 0;
class GlobalDispatchIntelligenceEngine {
    analyze(ctx) {
        const companies = ctx.companies ?? [];
        const regionDemand = new Map();
        for (const c of companies) {
            const region = c.region ?? "unknown";
            const cur = regionDemand.get(region) ?? { demand: 0, workers: 0 };
            cur.demand += (c.dispatchConflicts ?? 0) + Math.ceil((c.workerCount ?? 0) * 0.05);
            cur.workers += c.workerCount ?? 0;
            regionDemand.set(region, cur);
        }
        const dispatchMap = [...regionDemand.entries()].map(([region, d]) => ({
            region,
            demand: d.demand,
            supply: d.workers,
        }));
        const conflicts = companies.reduce((s, c) => s + (c.dispatchConflicts ?? 0), 0);
        return {
            dispatchMap,
            conflicts,
            recommendations: dispatchMap
                .filter((d) => d.demand > d.supply * 0.1)
                .map((d) => `Increase union hall capacity in ${d.region}`),
        };
    }
}
exports.GlobalDispatchIntelligenceEngine = GlobalDispatchIntelligenceEngine;
//# sourceMappingURL=global-dispatch-intelligence.js.map