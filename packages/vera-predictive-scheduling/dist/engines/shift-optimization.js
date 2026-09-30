"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShiftOptimizationEngine = void 0;
const SHIFTS = ["day", "swing", "night"];
class ShiftOptimizationEngine {
    analyze(ctx) {
        const workers = ctx.workers ?? [];
        const shifts = [];
        const overtimeRisk = [];
        const fatigueAlerts = [];
        const conflicts = [];
        workers.forEach((w, i) => {
            const shift = SHIFTS[i % SHIFTS.length];
            const hours = w.hoursThisWeek ?? 0;
            let score = 70;
            if (w.isCompliant)
                score += 15;
            if (hours > 40)
                score -= 25;
            shifts.push({ workerId: w.id, shift, score });
            const otProb = hours > 40 ? 0.7 : hours > 32 ? 0.35 : 0.1;
            overtimeRisk.push({ workerId: w.id, probability: otProb });
            if (hours > 48) {
                fatigueAlerts.push({
                    workerId: w.id,
                    message: `Fatigue risk: ${hours}h this week on ${shift} shift`,
                });
            }
        });
        const nightWorkers = shifts.filter((s) => s.shift === "night").length;
        if (nightWorkers > workers.length * 0.5) {
            conflicts.push("Night shift over-concentration — rebalance crew");
        }
        const recommendations = [];
        if (fatigueAlerts.length)
            recommendations.push("Rotate high-hour workers to day shift");
        if (overtimeRisk.some((o) => o.probability > 0.5)) {
            recommendations.push("Add relief workers to prevent overtime cascade");
        }
        return { shifts, overtimeRisk, fatigueAlerts, conflicts, recommendations };
    }
}
exports.ShiftOptimizationEngine = ShiftOptimizationEngine;
//# sourceMappingURL=shift-optimization.js.map