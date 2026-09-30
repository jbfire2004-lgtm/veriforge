"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildUnionHallTwin = buildUnionHallTwin;
const scoring_1 = require("../engines/scoring");
const predictive_state_engine_1 = require("../engines/predictive-state-engine");
function buildUnionHallTwin(input) {
    const predictive = new predictive_state_engine_1.PredictiveStateEngine();
    const risk = (0, scoring_1.scoreFromFactors)([
        { weight: 60, value: Math.min(100, (input.missingTraining ?? 0) * 8) },
        { weight: 40, value: (input.dispatchQueue ?? 0) > (input.readyForDispatch ?? 0) ? 50 : 10 },
    ]);
    const compliance = (0, scoring_1.scoreFromFactors)([
        { weight: 100, value: Math.max(0, 100 - (input.missingTraining ?? 0) * 5) },
    ]);
    const readiness = (0, scoring_1.readinessFromRisk)(risk.score);
    return {
        id: input.id,
        type: "unionHall",
        name: input.name,
        updatedAt: new Date().toISOString(),
        memberCount: input.memberCount ?? 0,
        dispatchQueue: input.dispatchQueue ?? 0,
        readyForDispatch: input.readyForDispatch ?? 0,
        missingTraining: input.missingTraining ?? 0,
        compliance,
        risk,
        readiness,
        predictions: [
            predictive.forecastShortage(input.id, input.memberCount ?? 0, input.readyForDispatch ?? 0),
        ],
        offline: { pending: false, queuedEvents: 0 },
        timeline: [
            {
                id: "tl_init",
                at: new Date().toISOString(),
                event: "twin.created",
                summary: `Union hall twin initialized for ${input.name}`,
            },
        ],
    };
}
//# sourceMappingURL=union-hall-twin.js.map