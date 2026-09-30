"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clamp = clamp;
exports.weightedScore = weightedScore;
exports.defaultGoals = defaultGoals;
function clamp(n, min = 0, max = 100) {
    return Math.max(min, Math.min(max, n));
}
function weightedScore(weights, values) {
    let total = 0;
    let w = 0;
    for (const [k, weight] of Object.entries(weights)) {
        total += (values[k] ?? 0) * weight;
        w += weight;
    }
    return clamp(Math.round(total / (w || 1)));
}
function defaultGoals() {
    return {
        safety: 95,
        compliance: 90,
        readiness: 85,
        productivity: 75,
        cost: 70,
    };
}
//# sourceMappingURL=scoring.js.map