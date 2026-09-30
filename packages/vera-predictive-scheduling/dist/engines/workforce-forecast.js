"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkforceForecastingEngine = void 0;
const scoring_1 = require("../utils/scoring");
class WorkforceForecastingEngine {
    analyze(ctx) {
        const workers = ctx.workers ?? [];
        const horizon = ctx.horizonDays ?? 14;
        const projects = ctx.projects ?? [];
        const availability = workers.map((w) => {
            let prob = 0.85;
            if (w.dispatchStatus === "dispatched")
                prob = 0.35;
            if (w.dispatchStatus === "unavailable")
                prob = 0.1;
            if (!w.isCompliant)
                prob -= 0.2;
            if ((w.expiringTraining ?? 0) > 0)
                prob -= 0.1;
            return {
                workerId: w.id,
                probability: Math.max(0.05, Math.min(1, prob)),
                horizonDays: horizon,
            };
        });
        const readiness = workers.map((w) => {
            const score = (0, scoring_1.schedulingScore)([
                { weight: 40, value: w.isCompliant ? 15 : 70 },
                { weight: 30, value: (w.competencyGaps ?? 0) * 20 },
                { weight: 30, value: 100 - (w.readinessScore ?? 50) },
            ]);
            return { workerId: w.id, score: score.score, level: score.level };
        });
        const fatigueRisk = workers.map((w) => ({
            workerId: w.id,
            score: Math.min(100, (w.hoursThisWeek ?? 0) * 2.5 + (w.absenceRisk ?? 0) * 10),
        }));
        const turnoverRisk = workers
            .filter((w) => !w.isCompliant || (w.competencyGaps ?? 0) > 2)
            .map((w) => ({
            workerId: w.id,
            probability: w.isCompliant ? 0.15 : 0.45,
        }));
        const shortages = projects
            .map((p) => {
            const need = p.requiredWorkers ?? 0;
            const have = p.assignedWorkers ?? 0;
            const deficit = Math.max(0, need - have);
            return deficit > 0
                ? {
                    projectId: p.id,
                    deficit,
                    message: `Project ${p.name}: ${deficit} worker(s) short`,
                }
                : null;
        })
            .filter((s) => s !== null);
        const recommendations = [];
        if (shortages.length)
            recommendations.push("Backfill worker shortages from union dispatch pool");
        if (turnoverRisk.length > 3)
            recommendations.push("Schedule compliance refresh for at-risk workers");
        if (fatigueRisk.some((f) => f.score > 70))
            recommendations.push("Reduce hours for high fatigue-risk workers");
        return {
            availability,
            shortages,
            readiness,
            fatigueRisk,
            turnoverRisk,
            recommendations,
        };
    }
}
exports.WorkforceForecastingEngine = WorkforceForecastingEngine;
//# sourceMappingURL=workforce-forecast.js.map