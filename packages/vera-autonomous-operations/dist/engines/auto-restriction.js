"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoRestrictionEngine = void 0;
const actions_1 = require("../utils/actions");
class AutoRestrictionEngine {
    run(ctx) {
        const workers = ctx.workers ?? [];
        const restrictions = [];
        const lifts = [];
        for (const w of workers) {
            const shouldRestrict = w.restricted ||
                w.trainingValid === false ||
                w.competencyValid === false ||
                (w.sifRiskScore ?? 0) >= 70 ||
                w.hecaDeviation ||
                (w.fatigueScore ?? 0) > 80;
            if (shouldRestrict && !w.restricted) {
                const reason = w.trainingValid === false
                    ? "Training expired"
                    : w.competencyValid === false
                        ? "Competency expired"
                        : (w.sifRiskScore ?? 0) >= 70
                            ? "SIF precursor risk"
                            : w.hecaDeviation
                                ? "HECA deviation"
                                : "Fatigue risk";
                restrictions.push((0, actions_1.createAction)({
                    type: "restriction.apply",
                    title: `Restrict ${w.name}`,
                    reason,
                    entityType: "worker",
                    entityId: w.id,
                    overrideable: true,
                    rollbackable: true,
                }));
            }
            if (w.restricted &&
                w.trainingValid !== false &&
                w.competencyValid !== false &&
                (w.sifRiskScore ?? 0) < 50 &&
                !w.hecaDeviation &&
                (w.fatigueScore ?? 0) < 60) {
                lifts.push((0, actions_1.createAction)({
                    type: "restriction.lift",
                    title: `Lift restriction ${w.name}`,
                    reason: "Training/competency validated",
                    entityType: "worker",
                    entityId: w.id,
                    overrideable: true,
                    rollbackable: true,
                }));
            }
        }
        return { restrictions, lifts };
    }
}
exports.AutoRestrictionEngine = AutoRestrictionEngine;
//# sourceMappingURL=auto-restriction.js.map