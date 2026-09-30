"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAction = createAction;
exports.rankWorkerForDispatch = rankWorkerForDispatch;
exports.readinessLevel = readinessLevel;
let actionCounter = 0;
function createAction(partial) {
    actionCounter += 1;
    return {
        id: `act-${Date.now()}-${actionCounter}`,
        status: partial.status ?? "pending",
        ...partial,
    };
}
function rankWorkerForDispatch(w) {
    let score = 50;
    if (w.isCompliant)
        score += 15;
    if (w.trainingValid !== false)
        score += 10;
    if (w.competencyValid !== false)
        score += 10;
    score += (w.readinessScore ?? 50) * 0.2;
    score -= (w.fatigueScore ?? 0) * 0.3;
    if (w.dispatchStatus === "available")
        score += 15;
    if (w.dispatchStatus === "dispatched")
        score -= 30;
    return Math.round(score);
}
function readinessLevel(score) {
    if (score >= 80)
        return "ready";
    if (score >= 60)
        return "marginal";
    if (score >= 40)
        return "at_risk";
    return "not_ready";
}
//# sourceMappingURL=actions.js.map