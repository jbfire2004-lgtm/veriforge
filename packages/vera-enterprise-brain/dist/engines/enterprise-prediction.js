"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnterprisePredictionEngine = void 0;
class EnterprisePredictionEngine {
    predict(ctx, phases) {
        const predictions = [];
        let idx = 0;
        const add = (label, probability, horizonDays, domain, preventiveAction) => {
            predictions.push({
                id: `pred-${idx++}`,
                label,
                probability,
                horizonDays,
                domain,
                preventiveAction,
            });
        };
        if ((ctx.schedulingShortages?.length ?? 0) > 0) {
            add("Workforce shortage", 0.75, 7, "workforce", "Pre-dispatch from union hall");
        }
        if ((ctx.expiringTraining ?? 0) > 0) {
            add("Compliance failure wave", 0.65, 14, "compliance", "Schedule training sessions");
        }
        if ((ctx.sifPrecursors ?? 0) > 0) {
            add("SIF incident risk elevation", 0.55, 3, "safety", "Escalate controls and restrictions");
        }
        if ((ctx.inspectionFailures ?? 0) > 0) {
            add("Equipment downtime", 0.7, 5, "equipment", "Maintenance and reinspection");
        }
        if (phases.command.dashboard.risk.critical > 0) {
            add("Critical risk cluster", 0.6, 10, "safety");
        }
        if (phases.enterprise.conflicts.length > 0) {
            add("Operational conflict escalation", 0.5, 2, "operations", "Run conflict resolver");
        }
        for (const r of phases.command.risk.filter((x) => x.prediction).slice(0, 3)) {
            add(r.prediction.label, r.prediction.probability, 14, "risk", r.recommendedActions[0]);
        }
        return predictions.sort((a, b) => b.probability - a.probability);
    }
}
exports.EnterprisePredictionEngine = EnterprisePredictionEngine;
//# sourceMappingURL=enterprise-prediction.js.map