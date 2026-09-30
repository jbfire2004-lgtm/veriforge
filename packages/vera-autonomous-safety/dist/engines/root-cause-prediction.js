"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RootCausePredictionEngine = void 0;
class RootCausePredictionEngine {
    analyze(ctx) {
        const likelyCauses = [];
        if ((ctx.trainingGaps ?? 0) > 0) {
            likelyCauses.push({ cause: "Inadequate training", probability: 0.75 });
        }
        if ((ctx.competencyGaps ?? 0) > 0) {
            likelyCauses.push({ cause: "Competency gap", probability: 0.7 });
        }
        if ((ctx.inspectionFailures ?? 0) > 0) {
            likelyCauses.push({ cause: "Equipment condition / inspection gap", probability: 0.65 });
        }
        if ((ctx.forms ?? []).some((f) => !f.controlMeasures)) {
            likelyCauses.push({ cause: "Procedural gap — missing controls", probability: 0.6 });
        }
        if (!likelyCauses.length) {
            likelyCauses.push({ cause: "No dominant systemic cause identified", probability: 0.3 });
        }
        const contributingFactors = [];
        if (ctx.lockedOutEquipment)
            contributingFactors.push("Active equipment lockout");
        if (ctx.visionHazards?.length)
            contributingFactors.push("Vision-confirmed hazards");
        const systemicFailures = [];
        if ((ctx.inspectionFailures ?? 0) >= 2 && (ctx.trainingGaps ?? 0) > 0) {
            systemicFailures.push("Combined training and maintenance breakdown");
        }
        const correctiveActions = likelyCauses
            .filter((c) => c.probability >= 0.6)
            .map((c) => `Address: ${c.cause}`);
        return {
            likelyCauses: likelyCauses.sort((a, b) => b.probability - a.probability),
            contributingFactors,
            systemicFailures,
            correctiveActions,
        };
    }
}
exports.RootCausePredictionEngine = RootCausePredictionEngine;
//# sourceMappingURL=root-cause-prediction.js.map