"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildEquipmentTwin = buildEquipmentTwin;
const scoring_1 = require("../engines/scoring");
const predictive_state_engine_1 = require("../engines/predictive-state-engine");
function buildEquipmentTwin(input) {
    const predictive = new predictive_state_engine_1.PredictiveStateEngine();
    const risk = (0, scoring_1.scoreFromFactors)([
        { weight: 45, value: input.lockedOut ? 95 : 10 },
        { weight: 35, value: input.overdueInspection ? 80 : 5 },
        { weight: 20, value: Math.min(100, (input.failedInspections ?? 0) * 25) },
    ]);
    const compliance = (0, scoring_1.scoreFromFactors)([
        { weight: 100, value: input.lockedOut || input.overdueInspection ? 25 : 90 },
    ]);
    const readiness = (0, scoring_1.readinessFromRisk)(risk.score);
    return {
        id: input.id,
        type: "equipment",
        name: input.name,
        updatedAt: new Date().toISOString(),
        companyId: input.companyId,
        projectIds: input.projectIds ?? [],
        lockedOut: input.lockedOut ?? false,
        overdueInspection: input.overdueInspection ?? false,
        inspectionCount: 0,
        competencyRequired: input.competencyRequired ?? false,
        visionPlates: input.visionPlates ?? 0,
        compliance,
        risk,
        readiness,
        predictions: [
            predictive.forecastFailure(input.id, "Inspection failure", (input.failedInspections ?? 0) / 10),
            predictive.forecastFailure(input.id, "Lockout trigger", input.lockedOut ? 0.9 : 0.15),
        ],
        offline: { pending: false, queuedEvents: 0 },
        timeline: [
            {
                id: "tl_init",
                at: new Date().toISOString(),
                event: "twin.created",
                summary: `Equipment twin initialized for ${input.name}`,
            },
        ],
    };
}
//# sourceMappingURL=equipment-twin.js.map