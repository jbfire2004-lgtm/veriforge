"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildProviderTwin = buildProviderTwin;
const scoring_1 = require("../engines/scoring");
const predictive_state_engine_1 = require("../engines/predictive-state-engine");
function buildProviderTwin(input) {
    const predictive = new predictive_state_engine_1.PredictiveStateEngine();
    const quality = input.qualityScore ?? (input.approved ? 85 : 40);
    const risk = (0, scoring_1.scoreFromFactors)([
        { weight: 50, value: input.approved ? 15 : 75 },
        { weight: 50, value: 100 - quality },
    ]);
    const compliance = (0, scoring_1.scoreFromFactors)([{ weight: 100, value: quality }]);
    const readiness = (0, scoring_1.readinessFromRisk)(risk.score);
    return {
        id: input.id,
        type: "provider",
        name: input.name,
        updatedAt: new Date().toISOString(),
        approved: input.approved ?? false,
        instructorCount: input.instructorCount ?? 0,
        courseCount: input.courseCount ?? 0,
        trainingVolume: input.trainingVolume ?? 0,
        qualityScore: quality,
        compliance,
        risk,
        readiness,
        predictions: [
            predictive.forecastFailure(input.id, "Approval lapse", input.approved ? 0.1 : 0.7),
        ],
        offline: { pending: false, queuedEvents: 0 },
        timeline: [
            {
                id: "tl_init",
                at: new Date().toISOString(),
                event: "twin.created",
                summary: `Provider twin initialized for ${input.name}`,
            },
        ],
    };
}
//# sourceMappingURL=provider-twin.js.map