"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCompanyTwin = buildCompanyTwin;
const scoring_1 = require("../engines/scoring");
const predictive_state_engine_1 = require("../engines/predictive-state-engine");
function buildCompanyTwin(input) {
    const predictive = new predictive_state_engine_1.PredictiveStateEngine();
    const rate = input.complianceRate ?? 80;
    const risk = (0, scoring_1.scoreFromFactors)([{ weight: 100, value: 100 - rate }]);
    const compliance = (0, scoring_1.scoreFromFactors)([{ weight: 100, value: rate }]);
    const readiness = (0, scoring_1.readinessFromRisk)(risk.score);
    return {
        id: input.id,
        type: "company",
        name: input.name,
        updatedAt: new Date().toISOString(),
        workerCount: input.workerCount ?? 0,
        equipmentCount: input.equipmentCount ?? 0,
        projectCount: input.projectCount ?? 0,
        providerCount: input.providerCount ?? 0,
        unionHallIds: input.unionHallIds ?? [],
        compliance,
        risk,
        readiness,
        predictions: [
            predictive.forecastFailure(input.id, "Compliance decline", (100 - rate) / 100),
        ],
        offline: { pending: false, queuedEvents: 0 },
        timeline: [
            {
                id: "tl_init",
                at: new Date().toISOString(),
                event: "twin.created",
                summary: `Company twin initialized for ${input.name}`,
            },
        ],
    };
}
//# sourceMappingURL=company-twin.js.map