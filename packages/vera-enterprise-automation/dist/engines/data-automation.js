"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataAutomationEngine = void 0;
const actions_1 = require("../utils/actions");
class DataAutomationEngine {
    run(ctx) {
        const actions = [];
        const insights = [];
        actions.push((0, actions_1.enterpriseAction)({
            module: "data",
            type: "data.validate_integrity",
            title: "Validate data integrity",
            reason: "Scheduled enterprise data pass",
            entityType: "company",
            entityId: ctx.companyId ?? "0",
            priority: (0, actions_1.priorityScore)({ compliance: 40 }),
            overrideable: false,
            rollbackable: false,
        }));
        if ((ctx.workerCount ?? 0) > 50) {
            insights.push("Large worker set — deduplication scan recommended");
            actions.push((0, actions_1.enterpriseAction)({
                module: "data",
                type: "data.deduplicate",
                title: "Deduplicate worker records",
                reason: "High worker count anomaly threshold",
                entityType: "company",
                entityId: ctx.companyId ?? "0",
                priority: 35,
                overrideable: true,
                rollbackable: true,
            }));
        }
        if (ctx.offline) {
            actions.push((0, actions_1.enterpriseAction)({
                module: "data",
                type: "data.sync_offline",
                title: "Sync offline data batch",
                reason: "Offline mode active",
                entityType: "company",
                entityId: ctx.companyId ?? "0",
                priority: (0, actions_1.priorityScore)({ operational: 80 }),
                overrideable: false,
                rollbackable: false,
                status: "queued",
            }));
        }
        return { actions, insights };
    }
}
exports.DataAutomationEngine = DataAutomationEngine;
//# sourceMappingURL=data-automation.js.map