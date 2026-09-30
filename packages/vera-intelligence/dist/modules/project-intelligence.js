"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeProject = analyzeProject;
function analyzeProject(input, engines) {
    const risk = engines.risk.score([
        { id: "readiness", label: "Low readiness", weight: 40, value: 100 - input.readiness },
        { id: "workers", label: "Missing workers", weight: 20, value: Math.min(100, input.missingWorkers * 15) },
        { id: "equipment", label: "Missing equipment", weight: 20, value: Math.min(100, input.missingEquipment * 15) },
        { id: "training", label: "Missing training", weight: 20, value: Math.min(100, input.missingTraining * 10) },
    ]);
    const readiness = engines.risk.toReadiness(risk);
    const workerShortage = engines.predictive.forecastShortage(input.id, input.workerCount + input.missingWorkers, input.workerCount, 14);
    const complianceFailure = engines.predictive.forecastFailure(input.id, "Compliance failure", (input.missingTraining + input.missingWorkers) / 20);
    if (input.missingWorkers > 0) {
        engines.recommend.suggest({
            module: "project",
            title: "Assign missing workers",
            description: input.name,
            actionType: "project.assignWorkers",
            priority: 88,
            entityId: input.id,
        });
    }
    return {
        id: input.id,
        name: input.name,
        readiness,
        risk,
        predictions: { workerShortage, complianceFailure },
        staffingGaps: {
            workers: input.missingWorkers,
            equipment: input.missingEquipment,
            training: input.missingTraining,
        },
        summary: engines.summarize.summarize(`Project ${input.name}`, [
            `Readiness ${readiness.score}%`,
            `${input.missingWorkers} workers needed`,
            `${input.missingEquipment} equipment needed`,
        ]),
        suggestedStaffing: [
            input.missingWorkers > 0 ? `Add ${input.missingWorkers} workers` : null,
            input.missingEquipment > 0 ? `Add ${input.missingEquipment} equipment` : null,
        ].filter(Boolean),
    };
}
//# sourceMappingURL=project-intelligence.js.map