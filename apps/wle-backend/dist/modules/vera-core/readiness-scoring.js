"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scoreToVisualState = scoreToVisualState;
exports.complianceRateToVisualState = complianceRateToVisualState;
exports.assessmentStatusToVisualState = assessmentStatusToVisualState;
exports.fitTestRateToVisualState = fitTestRateToVisualState;
exports.trainingExpiryToVisualState = trainingExpiryToVisualState;
exports.predictiveRiskToVisualState = predictiveRiskToVisualState;
exports.competencyRollupToVisualState = competencyRollupToVisualState;
exports.trainingExpiryScore = trainingExpiryScore;
function scoreToVisualState(score, options) {
    var _a, _b;
    if (((_a = options === null || options === void 0 ? void 0 : options.criticalCount) !== null && _a !== void 0 ? _a : 0) > 0 || score < 50)
        return 'NON_COMPLIANT';
    if (((_b = options === null || options === void 0 ? void 0 : options.missingCount) !== null && _b !== void 0 ? _b : 0) > 0 || score < 85)
        return 'AT_RISK';
    return 'OK';
}
function complianceRateToVisualState(rate, nonCompliant, critical = 0) {
    if (critical > 0 || rate < 50 || (nonCompliant > 0 && rate < 70)) {
        return nonCompliant > 0 && rate >= 50 ? 'AT_RISK' : 'NON_COMPLIANT';
    }
    if (rate < 85)
        return 'AT_RISK';
    return 'OK';
}
function assessmentStatusToVisualState(status, score) {
    const normalized = status.toLowerCase();
    if (normalized.includes('reject') ||
        normalized.includes('not acceptable') ||
        normalized.includes('notacceptable') ||
        normalized.includes('fail') ||
        normalized.includes('weak')) {
        return 'NON_COMPLIANT';
    }
    if (normalized.includes('conditional') ||
        normalized.includes('moderate') ||
        normalized.includes('developing') ||
        (score != null && score < 85)) {
        return 'AT_RISK';
    }
    return 'OK';
}
function fitTestRateToVisualState(input) {
    if (input.failed > 0 || input.complianceRate < 50)
        return 'NON_COMPLIANT';
    if (input.expired > 0 || input.missing > 0 || input.complianceRate < 85) {
        return 'AT_RISK';
    }
    return 'OK';
}
function trainingExpiryToVisualState(input) {
    if (input.expired > 0 || input.highRisk > 0)
        return 'NON_COMPLIANT';
    if (input.gaps > 0)
        return 'AT_RISK';
    return 'OK';
}
function predictiveRiskToVisualState(riskLevel, riskIndex) {
    const level = riskLevel.toLowerCase();
    if (level === 'critical' || level === 'high' || riskIndex >= 70) {
        return 'NON_COMPLIANT';
    }
    if (level === 'medium' || riskIndex >= 45)
        return 'AT_RISK';
    return 'OK';
}
function competencyRollupToVisualState(input) {
    if (input.total === 0)
        return 'AT_RISK';
    const rate = Math.round((input.current / input.total) * 100);
    if (input.failed > 0 || rate < 50)
        return 'NON_COMPLIANT';
    if (input.expired > 0 || input.missing > 0 || rate < 85)
        return 'AT_RISK';
    return 'OK';
}
function trainingExpiryScore(input) {
    const penalty = input.expired * 12 +
        input.expiring30 * 4 +
        input.highRisk * 8 +
        input.gaps * 3;
    return Math.max(0, Math.min(100, 100 - penalty));
}
//# sourceMappingURL=readiness-scoring.js.map