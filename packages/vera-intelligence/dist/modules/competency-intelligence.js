"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeCompetency = analyzeCompetency;
function analyzeCompetency(input, engines) {
    return {
        workerId: input.workerId,
        expiryForecast: engines.predictive.forecastExpiry(input.workerId, "Competency", input.daysToExpiry),
        failureForecast: engines.predictive.forecastFailure(input.workerId, "Competency failure", input.failed ? 0.7 : 0.1),
        summary: engines.summarize.summarize("Competency", [
            input.failed ? "Failed evaluation" : "Valid",
            input.gaps.length ? `${input.gaps.length} gaps` : "No gaps",
        ]),
        suggestedTraining: input.gaps,
        suggestedEquipment: input.failed ? [] : ["General fleet"],
    };
}
//# sourceMappingURL=competency-intelligence.js.map