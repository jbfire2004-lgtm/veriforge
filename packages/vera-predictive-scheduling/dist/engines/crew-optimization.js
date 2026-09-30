"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrewOptimizationEngine = void 0;
class CrewOptimizationEngine {
    analyze(ctx) {
        const workers = [...(ctx.workers ?? [])].sort((a, b) => (b.readinessScore ?? 0) - (a.readinessScore ?? 0));
        const crews = [];
        const size = 4;
        for (let i = 0; i < workers.length; i += size) {
            const chunk = workers.slice(i, i + size);
            if (!chunk.length)
                continue;
            const avgReadiness = chunk.reduce((s, w) => s + (w.readinessScore ?? 50), 0) / chunk.length;
            const avgRisk = chunk.reduce((s, w) => s + (w.riskScore ?? 0) + (w.safetyRiskScore ?? 0), 0) /
                chunk.length;
            const compliancePenalty = chunk.filter((w) => !w.isCompliant).length * 12;
            crews.push({
                id: `crew-${crews.length + 1}`,
                workerIds: chunk.map((w) => w.id),
                readinessScore: Math.round(avgReadiness),
                riskScore: Math.round(avgRisk + compliancePenalty),
            });
        }
        const recommendations = [];
        const highRisk = crews.filter((c) => c.riskScore > 60);
        if (highRisk.length)
            recommendations.push("Split high-risk crews and pair with mentors");
        if (crews.some((c) => c.workerIds.length < 3)) {
            recommendations.push("Merge undersized crews before field deployment");
        }
        return { crews, recommendations };
    }
}
exports.CrewOptimizationEngine = CrewOptimizationEngine;
//# sourceMappingURL=crew-optimization.js.map