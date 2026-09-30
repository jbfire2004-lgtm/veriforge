"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnterprisePlanningEngine = void 0;
class EnterprisePlanningEngine {
    plan(ctx, phases) {
        const daily = [];
        const weekly = [];
        const monthly = [];
        let idx = 0;
        const add = (horizon, domain, action, priority) => {
            const item = {
                id: `plan-${idx++}`,
                horizon,
                domain,
                action,
                priority,
            };
            if (horizon === "daily")
                daily.push(item);
            else if (horizon === "weekly")
                weekly.push(item);
            else
                monthly.push(item);
        };
        add("daily", "safety", "Run SIF/HECA field verification", 95);
        add("daily", "operations", "Execute priority automation queue", 90);
        add("daily", "workforce", "Reconcile dispatch vs project assignments", 85);
        if ((ctx.expiringTraining ?? 0) > 0) {
            add("weekly", "training", `Schedule ${ctx.expiringTraining} renewal sessions`, 88);
        }
        if ((ctx.schedulingShortages?.length ?? 0) > 0) {
            add("weekly", "scheduling", "Backfill understaffed projects", 82);
        }
        add("weekly", "equipment", "Preventive maintenance window", 75);
        add("monthly", "compliance", "Enterprise compliance audit cycle", 70);
        add("monthly", "project", "Portfolio readiness review", 68);
        for (const draft of phases.command.automation.recent.slice(0, 3)) {
            add("daily", "automation", draft.title, 80);
        }
        return {
            daily,
            weekly,
            monthly,
            summary: `${daily.length} daily, ${weekly.length} weekly, ${monthly.length} monthly plan items`,
        };
    }
}
exports.EnterprisePlanningEngine = EnterprisePlanningEngine;
//# sourceMappingURL=enterprise-planning.js.map