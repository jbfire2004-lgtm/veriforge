"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scoreFromFactors = scoreFromFactors;
exports.readinessFromRisk = readinessFromRisk;
exports.levelFromScore = levelFromScore;
function scoreFromFactors(factors) {
    const total = factors.reduce((s, f) => s + f.weight, 0) || 1;
    const score = Math.round(factors.reduce((s, f) => s + (f.value * f.weight) / total, 0));
    const clamped = Math.max(0, Math.min(100, score));
    return {
        score: clamped,
        level: levelFromScore(clamped),
        updatedAt: new Date().toISOString(),
    };
}
function readinessFromRisk(riskScore) {
    const score = 100 - riskScore;
    return { score, level: levelFromScore(score), updatedAt: new Date().toISOString() };
}
function levelFromScore(score) {
    if (score >= 80)
        return "low";
    if (score >= 60)
        return "medium";
    if (score >= 35)
        return "high";
    return "critical";
}
//# sourceMappingURL=scoring.js.map