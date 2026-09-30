"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterstellarSafetyEngine = void 0;
const scoring_1 = require("../utils/scoring");
let hazardId = 0;
class InterstellarSafetyEngine {
    assess(ctx) {
        const assets = ctx.assets ?? [];
        const hazards = [];
        const add = (type, system, severity, probability, assetId) => {
            hazardId += 1;
            hazards.push({ id: `ihz-${hazardId}`, type, system, severity, probability, assetId });
        };
        for (const a of assets) {
            if ((a.radiationLevel ?? 0) > 60)
                add("cosmic_radiation", a.system, "high", 0.75, a.id);
            if ((a.radiationLevel ?? 0) > 80)
                add("stellar_flare", a.system, "critical", 0.6, a.id);
            if ((a.hazardScore ?? 0) > 30)
                add("micrometeoroid", a.system, "medium", 0.4, a.id);
            if (!a.lifeSupportOk)
                add("life_support_anomaly", a.system, "critical", 0.9, a.id);
            if (!a.lifeSupportOk)
                add("habitat_breach", a.system, "critical", 0.85, a.id);
            if ((a.terraformStage ?? 0) > 0 && (a.terraformStage ?? 0) < 3)
                add("terraforming", a.system, "medium", 0.35, a.id);
            if (a.kind === "generation_ship")
                add("cryosleep", a.system, "medium", 0.3, a.id);
            if ((a.robotCount ?? 0) > 0 && (a.hazardScore ?? 0) > 40)
                add("robotic", a.system, "medium", 0.45, a.id);
        }
        return {
            hazards,
            cryosleepRisk: (0, scoring_1.clamp)(hazards.filter((h) => h.type === "cryosleep").length * 20 +
                assets.filter((a) => a.kind === "generation_ship").length * 10),
            habitatRisk: (0, scoring_1.clamp)(assets.filter((a) => !a.lifeSupportOk).length * 35 +
                hazards.filter((h) => h.type.includes("habitat")).length * 15),
            recommendations: [
                hazards.some((h) => h.severity === "critical")
                    ? "Execute interstellar emergency protocol"
                    : "Continue autonomous hazard monitoring",
                "Shelter crews during stellar flare windows",
            ],
        };
    }
}
exports.InterstellarSafetyEngine = InterstellarSafetyEngine;
//# sourceMappingURL=interstellar-safety.js.map