"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildProjectTwin = buildProjectTwin;
const scoring_1 = require("../engines/scoring");
const predictive_state_engine_1 = require("../engines/predictive-state-engine");
function buildProjectTwin(input) {
    const predictive = new predictive_state_engine_1.PredictiveStateEngine();
    const readinessScore = input.readiness ?? 70;
    const risk = (0, scoring_1.scoreFromFactors)([
        { weight: 40, value: 100 - readinessScore },
        { weight: 20, value: Math.min(100, (input.missingWorkers ?? 0) * 15) },
        { weight: 20, value: Math.min(100, (input.missingEquipment ?? 0) * 15) },
        { weight: 20, value: Math.min(100, (input.missingTraining ?? 0) * 10) },
    ]);
    const compliance = (0, scoring_1.scoreFromFactors)([{ weight: 100, value: readinessScore }]);
    const readiness = (0, scoring_1.readinessFromRisk)(risk.score);
    const requiredWorkers = (input.workerCount ?? 0) + (input.missingWorkers ?? 0);
    return {
        id: input.id,
        type: "project",
        name: input.name,
        updatedAt: new Date().toISOString(),
        companyId: input.companyId,
        workerCount: input.workerCount ?? 0,
        equipmentCount: input.equipmentCount ?? 0,
        missingWorkers: input.missingWorkers ?? 0,
        missingEquipment: input.missingEquipment ?? 0,
        missingTraining: input.missingTraining ?? 0,
        safetyDocumentCount: input.safetyDocs ?? 0,
        compliance,
        risk,
        readiness,
        predictions: [
            predictive.forecastShortage(input.id, requiredWorkers, input.workerCount ?? 0),
            predictive.forecastFailure(input.id, "Compliance failure", (100 - readinessScore) / 100),
        ],
        offline: { pending: false, queuedEvents: 0 },
        timeline: [
            {
                id: "tl_init",
                at: new Date().toISOString(),
                event: "twin.created",
                summary: `Project twin initialized for ${input.name}`,
            },
        ],
    };
}
//# sourceMappingURL=project-twin.js.map