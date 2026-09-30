"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnterpriseGoalEngine = void 0;
const scoring_1 = require("../utils/scoring");
class EnterpriseGoalEngine {
    resolve(ctx) {
        const base = { ...(0, scoring_1.defaultGoals)(), ...ctx.goals };
        if ((ctx.sifPrecursors ?? 0) > 0) {
            base.safety = Math.max(base.safety, 98);
            base.productivity = Math.min(base.productivity, 60);
        }
        if ((ctx.nonCompliantWorkers ?? 0) > 3) {
            base.compliance = Math.max(base.compliance, 95);
        }
        if ((ctx.schedulingShortages?.length ?? 0) > 2) {
            base.readiness = Math.max(base.readiness, 90);
        }
        return base;
    }
    balance(goals) {
        const entries = Object.entries(goals).sort((a, b) => b[1] - a[1]);
        return {
            primary: entries[0]?.[0] ?? "safety",
            tradeoffs: entries.slice(1, 3).map(([k, v]) => `${k} weight ${v}`),
        };
    }
}
exports.EnterpriseGoalEngine = EnterpriseGoalEngine;
//# sourceMappingURL=enterprise-goals.js.map