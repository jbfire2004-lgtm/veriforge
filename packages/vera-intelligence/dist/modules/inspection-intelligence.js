"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeInspection = analyzeInspection;
function analyzeInspection(input, engines) {
    const failureRate = input.failureHistory.length / Math.max(1, input.failureHistory.length + 3);
    const failureForecast = engines.predictive.forecastFailure(input.equipmentId, "Inspection failure", failureRate);
    const lockoutTrigger = engines.predictive.forecastFailure(input.equipmentId, "Lockout trigger", input.passed ? failureRate * 0.5 : failureRate * 1.5);
    const photoClass = engines.classify.classifyInspectionPhoto({
        hazards: input.photoHazards,
    });
    const repeated = engines.patterns.detectRepeatedFailures(input.failureHistory);
    return {
        id: input.id,
        failureForecast,
        lockoutTrigger,
        photoClassification: photoClass,
        repeatedFailures: repeated,
        summary: engines.summarize.summarize("Inspection", [
            input.passed ? "Passed" : "Failed",
            photoClass.tags.join(", "),
        ]),
        correctiveActions: engines.correct.suggestCorrections(input.passed ? [] : ["Repair defect", "Re-inspect before use"]),
    };
}
//# sourceMappingURL=inspection-intelligence.js.map