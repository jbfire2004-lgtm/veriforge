"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskEngine = void 0;
const scoring_1 = require("../utils/scoring");
class RiskEngine {
    score(factors) {
        return (0, scoring_1.weightedScore)(factors);
    }
    readinessScore(inputs) {
        return (0, scoring_1.weightedScore)([
            { id: "compliant", label: "Compliant", weight: 40, value: inputs.compliant ? 0 : 80 },
            { id: "gaps", label: "Gaps", weight: 25, value: Math.min(100, inputs.gaps * 20) },
            { id: "expiring", label: "Expiring soon", weight: 20, value: inputs.expiringSoon ? 60 : 0 },
            { id: "failures", label: "Recent failures", weight: 15, value: Math.min(100, inputs.failures * 25) },
        ]);
    }
    /** Invert risk to readiness (100 = ready). */
    toReadiness(risk) {
        const score = 100 - risk.score;
        return {
            ...risk,
            score,
            level: score >= 80 ? "low" : score >= 60 ? "medium" : score >= 35 ? "high" : "critical",
        };
    }
}
exports.RiskEngine = RiskEngine;
//# sourceMappingURL=risk-engine.js.map