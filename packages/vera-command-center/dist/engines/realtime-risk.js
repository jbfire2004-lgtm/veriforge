"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeRiskEngine = void 0;
const scoring_1 = require("../utils/scoring");
class RealtimeRiskEngine {
    assess(ctx) {
        const results = [];
        const globalFactors = [
            { weight: 25, value: Math.min(100, (ctx.sifPrecursors ?? 0) * 25) },
            { weight: 20, value: Math.min(100, (ctx.hecaDeviations ?? 0) * 30) },
            { weight: 15, value: Math.min(100, (ctx.energyConflicts ?? 0) * 20) },
            { weight: 15, value: Math.min(100, (ctx.inspectionFailures ?? 0) * 25) },
            { weight: 10, value: Math.min(100, (ctx.trainingExpiries ?? 0) * 15) },
            { weight: 10, value: Math.min(100, (ctx.fatigueIndicators ?? 0) * 20) },
            { weight: 5, value: Math.min(100, (ctx.visionAnomalies ?? 0) * 30) },
        ];
        const types = ["worker", "equipment", "project", "company", "provider", "unionHall"];
        for (const type of types) {
            if (type === "unionHall" && !ctx.unionHallId)
                continue;
            if (type === "provider")
                continue;
            const entities = (ctx.entities ?? []).filter((e) => e.type === type);
            const targets = entities.length > 0
                ? entities
                : [
                    {
                        id: type === "company" ? ctx.companyId ?? "0" : ctx.companyId ?? "0",
                        name: type,
                        type,
                        riskScore: 40,
                    },
                ];
            for (const e of targets) {
                const factors = [
                    ...globalFactors,
                    { weight: 20, value: e.riskScore ?? 40 },
                ];
                const score = (0, scoring_1.computeScore)(factors);
                const factorLabels = [];
                if ((ctx.sifPrecursors ?? 0) > 0)
                    factorLabels.push("SIF precursors");
                if ((ctx.inspectionFailures ?? 0) > 0)
                    factorLabels.push("Inspection failures");
                if (e.complianceOk === false)
                    factorLabels.push("Compliance gap");
                results.push({
                    entityType: type,
                    entityId: e.id,
                    score: { ...score, trend: score.score > 60 ? "up" : "stable" },
                    factors: factorLabels,
                    prediction: score.score > 50
                        ? { label: "Elevated incident risk", probability: score.score / 100 }
                        : undefined,
                    recommendedActions: score.level === "critical" || score.level === "high"
                        ? ["Review controls", "Trigger safety intervention", "Restrict high-risk work"]
                        : ["Monitor"],
                });
            }
        }
        return results;
    }
}
exports.RealtimeRiskEngine = RealtimeRiskEngine;
//# sourceMappingURL=realtime-risk.js.map