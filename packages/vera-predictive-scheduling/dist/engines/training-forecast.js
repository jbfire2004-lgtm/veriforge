"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingForecastingEngine = void 0;
class TrainingForecastingEngine {
    analyze(ctx) {
        const expiries = ctx.trainingExpiries ?? [];
        const workers = ctx.workers ?? [];
        const expiring = expiries
            .map((t) => ({
            workerId: t.workerId,
            certification: t.certificationName,
            daysLeft: t.daysUntilExpiry ?? this.daysUntil(t.expiresAt),
        }))
            .filter((e) => e.daysLeft <= 90)
            .sort((a, b) => a.daysLeft - b.daysLeft);
        const gaps = workers
            .filter((w) => !w.isCompliant || (w.competencyGaps ?? 0) > 0)
            .map((w) => ({
            workerId: w.id,
            gap: w.isCompliant ? "Competency gap" : "Compliance / training gap",
        }));
        const demandMap = new Map();
        for (const e of expiring) {
            demandMap.set(e.certification, (demandMap.get(e.certification) ?? 0) + 1);
        }
        const demand = [...demandMap.entries()].map(([certification, count]) => ({
            certification,
            count,
        }));
        const byCert = new Map();
        for (const e of expiring.filter((x) => x.daysLeft <= 30)) {
            const list = byCert.get(e.certification) ?? [];
            list.push(e.workerId);
            byCert.set(e.certification, list);
        }
        const recommendedSessions = [...byCert.entries()].map(([label, workerIds]) => ({
            label: `Renew ${label}`,
            workerIds,
        }));
        return { expiring, gaps, demand, recommendedSessions };
    }
    daysUntil(expiresAt) {
        if (!expiresAt)
            return 365;
        const diff = new Date(expiresAt).getTime() - Date.now();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }
}
exports.TrainingForecastingEngine = TrainingForecastingEngine;
//# sourceMappingURL=training-forecast.js.map