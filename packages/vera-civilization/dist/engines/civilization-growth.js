"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CivilizationGrowthEngine = void 0;
class CivilizationGrowthEngine {
    model(ctx) {
        const scopes = ctx.scopes ?? [];
        const pop = scopes.reduce((s, x) => s + (x.population ?? 0), 0);
        return {
            forecasts: [
                { domain: "Population", rate: pop > 1000 ? 1.8 : 2.5, horizon: "100y" },
                { domain: "Colony expansion", rate: scopes.filter((s) => s.type === "colony").length * 0.5 + 1, horizon: "50y" },
                { domain: "Terraforming", rate: 0.8, horizon: "200y" },
                { domain: "Economy", rate: 2.2, horizon: "30y" },
                { domain: "Science", rate: 3.5, horizon: "20y" },
                { domain: "Culture", rate: 1.2, horizon: "100y" },
            ],
            optimizationPlans: [
                "Balance growth with sustainability envelope",
                "Prioritize science growth in stable systems",
                "Throttle expansion when stability score drops",
            ],
        };
    }
}
exports.CivilizationGrowthEngine = CivilizationGrowthEngine;
//# sourceMappingURL=civilization-growth.js.map