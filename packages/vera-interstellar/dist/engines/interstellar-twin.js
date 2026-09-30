"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterstellarTwinEngine = void 0;
const scoring_1 = require("../utils/scoring");
const TWIN_TYPES = [
    "star_system",
    "colony",
    "habitat",
    "terraforming",
    "power_grid",
    "mining",
    "robotics_fleet",
    "generation_ship",
    "cryosleep",
    "scientific_mission",
];
class InterstellarTwinEngine {
    hydrate(ctx) {
        const assets = ctx.assets ?? [];
        const twins = [];
        for (const a of assets) {
            for (const twinType of TWIN_TYPES) {
                const health = (0, scoring_1.clamp)((a.lifeSupportOk ? 40 : 0) + (a.powerLevel ?? 70) * 0.4 - (a.hazardScore ?? 0) * 0.5);
                twins.push({
                    twinType,
                    assetId: a.id,
                    health,
                    failureRisk: (0, scoring_1.clamp)(100 - health),
                    predictions: health < 55
                        ? [`${twinType}: failure/hazard risk at ${a.name} (decades autonomous)`]
                        : [`${twinType}: nominal at ${a.name}`],
                });
            }
        }
        return twins.slice(0, 50);
    }
}
exports.InterstellarTwinEngine = InterstellarTwinEngine;
//# sourceMappingURL=interstellar-twin.js.map