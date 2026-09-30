"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketplaceSimulationEngine = void 0;
let simId = 0;
class MarketplaceSimulationEngine {
    run(categories) {
        const mk = (scenario, supply, demand, recommendation) => {
            simId += 1;
            return { id: `msim-${simId}`, scenario, supply, demand, gap: demand - supply, recommendation };
        };
        return categories.map((c) => {
            const supply = c.availabilityMap.reduce((s, a) => s + a.supply, 0);
            const demand = c.availabilityMap.reduce((s, a) => s + a.demand, 0);
            return mk(`${c.category} supply/demand`, supply, demand, c.recommendations[0] ?? "Monitor market");
        });
    }
}
exports.MarketplaceSimulationEngine = MarketplaceSimulationEngine;
//# sourceMappingURL=marketplace-simulation.js.map