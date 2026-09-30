"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceAutomationEngine = void 0;
const actions_1 = require("../utils/actions");
class ComplianceAutomationEngine {
    run(ctx) {
        const actions = [];
        const insights = [];
        if ((ctx.nonCompliantWorkers ?? 0) > 0) {
            insights.push(`${ctx.nonCompliantWorkers} workers non-compliant`);
            actions.push((0, actions_1.enterpriseAction)({
                module: "compliance",
                type: "compliance.trigger_training",
                title: "Trigger compliance training",
                reason: "Non-compliant workers detected",
                entityType: "company",
                entityId: ctx.companyId ?? "0",
                priority: (0, actions_1.priorityScore)({ compliance: 95 }),
                overrideable: true,
                rollbackable: false,
            }));
        }
        if ((ctx.inspectionFailures ?? 0) > 0) {
            actions.push((0, actions_1.enterpriseAction)({
                module: "compliance",
                type: "compliance.trigger_inspection",
                title: "Schedule compliance inspections",
                reason: "Failed inspections",
                entityType: "company",
                entityId: ctx.companyId ?? "0",
                priority: (0, actions_1.priorityScore)({ compliance: 85, safety: 70 }),
                overrideable: true,
                rollbackable: false,
            }));
        }
        if ((ctx.lockedEquipment ?? 0) > 0) {
            actions.push((0, actions_1.enterpriseAction)({
                module: "compliance",
                type: "compliance.lockout",
                title: "Maintain equipment lockouts",
                reason: "Locked equipment pending clearance",
                entityType: "company",
                entityId: ctx.companyId ?? "0",
                priority: (0, actions_1.priorityScore)({ safety: 90 }),
                overrideable: true,
                rollbackable: true,
            }));
        }
        actions.push((0, actions_1.enterpriseAction)({
            module: "compliance",
            type: "compliance.report",
            title: "Generate compliance report",
            reason: "Scheduled compliance automation",
            entityType: "company",
            entityId: ctx.companyId ?? "0",
            priority: 30,
            overrideable: false,
            rollbackable: false,
        }));
        return { actions, insights };
    }
}
exports.ComplianceAutomationEngine = ComplianceAutomationEngine;
//# sourceMappingURL=compliance-automation.js.map