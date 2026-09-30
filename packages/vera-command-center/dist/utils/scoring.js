"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeScore = computeScore;
exports.levelFromScore = levelFromScore;
exports.readinessFromRisk = readinessFromRisk;
function computeScore(factors) {
    const total = factors.reduce((s, f) => s + f.weight, 0) || 1;
    const score = Math.round(factors.reduce((s, f) => s + (f.value * f.weight) / total, 0));
    const clamped = Math.max(0, Math.min(100, score));
    return {
        score: clamped,
        level: levelFromScore(clamped),
        trend: "stable",
        updatedAt: new Date().toISOString(),
    };
}
function levelFromScore(score) {
    if (score >= 75)
        return "critical";
    if (score >= 50)
        return "high";
    if (score >= 25)
        return "medium";
    return "low";
}
function readinessFromRisk(riskScore) {
    return Math.max(0, Math.min(100, 100 - riskScore));
}
//# sourceMappingURL=scoring.js.map