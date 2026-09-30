"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrossModuleAutomationEngine = void 0;
const actions_1 = require("../utils/actions");
class CrossModuleAutomationEngine {
    run(ctx) {
        const chains = [];
        const actions = [];
        if ((ctx.expiringTraining ?? 0) > 0) {
            chains.push({
                id: "chain-training-expiry",
                trigger: "training.expired",
                steps: [
                    "Auto-restrict worker",
                    "Auto-reassign project role",
                    "Notify supervisor",
                    "Schedule training session",
                ],
            });
            actions.push((0, actions_1.enterpriseAction)({
                module: "cross_module",
                type: "chain.training_expiry",
                title: "Training expiry chain",
                reason: `${ctx.expiringTraining} workers with expiring training`,
                entityType: "company",
                entityId: ctx.companyId ?? "0",
                priority: (0, actions_1.priorityScore)({ compliance: 90, safety: 50 }),
                overrideable: true,
                rollbackable: true,
            }));
        }
        if ((ctx.inspectionFailures ?? 0) > 0) {
            chains.push({
                id: "chain-inspection-fail",
                trigger: "inspection.failed",
                steps: [
                    "Auto-lockout equipment",
                    "Auto-reassign operator",
                    "Notify mechanic",
                    "Schedule maintenance",
                ],
            });
            actions.push((0, actions_1.enterpriseAction)({
                module: "cross_module",
                type: "chain.inspection_fail",
                title: "Inspection failure chain",
                reason: `${ctx.inspectionFailures} inspection failure(s)`,
                entityType: "company",
                entityId: ctx.companyId ?? "0",
                priority: (0, actions_1.priorityScore)({ safety: 95, operational: 70 }),
                overrideable: true,
                rollbackable: true,
            }));
        }
        if (ctx.schedulingShortages?.length) {
            chains.push({
                id: "chain-readiness",
                trigger: "project.readiness_drop",
                steps: [
                    "Auto-correct staffing",
                    "Auto-correct equipment",
                    "Trigger training",
                ],
            });
        }
        return { chains, actions };
    }
}
exports.CrossModuleAutomationEngine = CrossModuleAutomationEngine;
//# sourceMappingURL=cross-module-automation.js.map