"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterplanetaryTwinEngine = void 0;
const scoring_1 = require("../utils/scoring");
const TWIN_TYPES = [
    "habitat",
    "life_support",
    "power_grid",
    "rover",
    "lander",
    "orbital_station",
    "eva_suit",
    "crew",
    "robotics",
];
class InterplanetaryTwinEngine {
    hydrate(ctx) {
        const sites = ctx.sites ?? [];
        const twins = [];
        for (const s of sites) {
            for (const twinType of TWIN_TYPES.slice(0, s.facilityType === "rover" ? 4 : 6)) {
                const health = (0, scoring_1.clamp)((s.lifeSupportOk ? 40 : 0) + (s.powerLevel ?? 80) * 0.5 - (s.hazardScore ?? 0));
                twins.push({
                    twinType,
                    siteId: s.id,
                    health,
                    predictions: health < 60
                        ? [`${twinType} failure risk elevated at ${s.name}`]
                        : [`${twinType} nominal at ${s.name}`],
                    failureRisk: (0, scoring_1.clamp)(100 - health),
                });
            }
        }
        return twins.slice(0, 40);
    }
}
exports.InterplanetaryTwinEngine = InterplanetaryTwinEngine;
//# sourceMappingURL=interplanetary-twin.js.map