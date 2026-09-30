"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterplanetarySafetyEngine = void 0;
const scoring_1 = require("../utils/scoring");
let hazardId = 0;
class InterplanetarySafetyEngine {
    assess(ctx) {
        const sites = ctx.sites ?? [];
        const hazards = [];
        const add = (type, body, severity, probability, siteId) => {
            hazardId += 1;
            hazards.push({ id: `hz-${hazardId}`, type, body, severity, probability, siteId });
        };
        for (const s of sites) {
            if ((s.radiationLevel ?? 0) > 50)
                add("radiation", s.body, "high", 0.7, s.id);
            if (!s.lifeSupportOk)
                add("life_support_anomaly", s.body, "critical", 0.9, s.id);
            if (s.body === "mars" && (s.hazardScore ?? 0) > 30)
                add("dust_storm", "mars", "high", 0.55, s.id);
            if (s.body === "moon" && (s.hazardScore ?? 0) > 20)
                add("regolith", "moon", "medium", 0.4, s.id);
            if (s.facilityType === "orbital_station")
                add("debris_conjunction", "orbit", "medium", 0.25, s.id);
            if (s.body === "mars" || s.body === "moon")
                add("atmospheric", s.body, "medium", 0.35, s.id);
            if ((s.hazardScore ?? 0) > 40)
                add("eva_risk", s.body, "high", 0.5, s.id);
        }
        add("microgravity", "orbit", "low", 0.3);
        add("habitat_breach", "mars", "low", 0.15);
        const evaRisk = (0, scoring_1.clamp)(hazards.filter((h) => h.type.includes("eva") || h.body === "orbit").length * 15 + 20);
        const habitatRisk = (0, scoring_1.clamp)(sites.filter((s) => !s.lifeSupportOk).length * 30 +
            hazards.filter((h) => h.type.includes("life") || h.type.includes("habitat")).length * 20);
        return {
            hazards,
            evaRiskScore: evaRisk,
            habitatRiskScore: habitatRisk,
            recommendations: [
                hazards.some((h) => h.severity === "critical")
                    ? "Execute habitat safety protocol immediately"
                    : "Continue autonomous hazard monitoring",
                "Pre-plan EVA holds during radiation peaks",
            ],
        };
    }
}
exports.InterplanetarySafetyEngine = InterplanetarySafetyEngine;
//# sourceMappingURL=interplanetary-safety.js.map