"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnterpriseWorkflowEngine = void 0;
const actions_1 = require("../utils/actions");
class EnterpriseWorkflowEngine {
    run(ctx, eventName) {
        const workflows = [];
        const actions = [];
        workflows.push({
            id: "wf-daily-ops",
            name: "Daily operations workflow",
            steps: ["Hydrate twins", "Run safety", "Run scheduling", "Run operations", "Sync"],
            status: ctx.offline ? "offline" : "active",
        });
        if (eventName) {
            workflows.push({
                id: `wf-event-${eventName}`,
                name: `Event: ${eventName}`,
                steps: ["Evaluate rules", "Resolve conflicts", "Execute actions", "Update twins"],
                status: "event_driven",
            });
        }
        workflows.push({
            id: "wf-compliance-weekly",
            name: "Weekly compliance workflow",
            steps: ["Scan training", "Scan inspections", "Generate reports"],
            status: "scheduled",
        });
        for (const wf of workflows) {
            actions.push((0, actions_1.enterpriseAction)({
                module: "workflow",
                type: "workflow.advance",
                title: `Advance ${wf.name}`,
                reason: `Workflow ${wf.id}`,
                entityType: "workflow",
                entityId: wf.id,
                priority: (0, actions_1.priorityScore)({ operational: 50 }),
                overrideable: true,
                rollbackable: true,
            }));
        }
        return { workflows, actions };
    }
}
exports.EnterpriseWorkflowEngine = EnterpriseWorkflowEngine;
//# sourceMappingURL=enterprise-workflow.js.map