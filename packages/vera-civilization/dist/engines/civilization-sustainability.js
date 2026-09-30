"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CivilizationSustainabilityEngine = void 0;
const scoring_1 = require("../utils/scoring");
class CivilizationSustainabilityEngine {
    assess(ctx) {
        const scopes = ctx.scopes ?? [];
        const avgResource = scopes.length > 0
            ? scopes.reduce((s, x) => s + (x.resourceIndex ?? 60), 0) / scopes.length
            : 60;
        const sustainabilityScore = (0, scoring_1.clamp)(avgResource - (ctx.interstellarRiskScore ?? 20) * 0.3);
        return {
            sustainabilityScore,
            predictions: [
                { label: "Energy deficit", probability: sustainabilityScore < 60 ? 0.5 : 0.15, horizon: "40y" },
                { label: "Habitat overshoot", probability: 0.2, horizon: "60y" },
                { label: "Terraforming imbalance", probability: 0.18, horizon: "100y" },
            ],
            recommendations: [
                "Circular resource loops on all colonies",
                "Interstellar logistics carbon-equivalent budgeting",
                sustainabilityScore < 70 ? "Sustainability surge: habitat efficiency mandate" : "Maintain long-horizon reserves",
            ],
        };
    }
}
exports.CivilizationSustainabilityEngine = CivilizationSustainabilityEngine;
//# sourceMappingURL=civilization-sustainability.js.map