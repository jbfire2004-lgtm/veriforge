"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbsencePredictionEngine = void 0;
class AbsencePredictionEngine {
    predict(ctx) {
        const horizon = ctx.horizonDays ?? 14;
        return (ctx.workers ?? []).map((w) => {
            let probability = w.absenceRisk ?? 0.08;
            if (!w.isCompliant)
                probability += 0.12;
            if ((w.expiringTraining ?? 0) > 0)
                probability += 0.05;
            if ((w.hoursThisWeek ?? 0) > 50)
                probability += 0.1;
            return {
                workerId: w.id,
                probability: Math.min(0.95, probability),
                horizonDays: horizon,
            };
        });
    }
}
exports.AbsencePredictionEngine = AbsencePredictionEngine;
//# sourceMappingURL=absence-prediction.js.map