"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentAutomationEngine = void 0;
const actions_1 = require("../utils/actions");
class DocumentAutomationEngine {
    run(ctx) {
        const actions = [];
        const insights = [];
        for (const doc of ctx.documents ?? []) {
            if ((doc.fraudScore ?? 0) > 0.7) {
                insights.push(`Fraud detected: document ${doc.id}`);
                actions.push((0, actions_1.enterpriseAction)({
                    module: "document",
                    phase: "VVE",
                    type: "document.fraud_block",
                    title: `Block fraudulent document ${doc.id}`,
                    reason: `Fraud score ${doc.fraudScore}`,
                    entityType: "document",
                    entityId: doc.id,
                    priority: (0, actions_1.priorityScore)({ compliance: 90, safety: 60 }),
                    overrideable: true,
                    rollbackable: true,
                }));
            }
            else {
                actions.push((0, actions_1.enterpriseAction)({
                    module: "document",
                    phase: "VVE",
                    type: "document.auto_map",
                    title: `Auto-map document ${doc.id}`,
                    reason: "Vision document pipeline",
                    entityType: "document",
                    entityId: doc.id,
                    priority: (0, actions_1.priorityScore)({ compliance: 50 }),
                    overrideable: true,
                    rollbackable: true,
                }));
            }
        }
        if (!ctx.documents?.length) {
            actions.push((0, actions_1.enterpriseAction)({
                module: "document",
                phase: "VVE",
                type: "document.scan_queue",
                title: "Process document scan queue",
                reason: "No pending documents in context",
                entityType: "company",
                entityId: ctx.companyId ?? "0",
                priority: 20,
                overrideable: false,
                rollbackable: false,
            }));
        }
        return { actions, insights };
    }
}
exports.DocumentAutomationEngine = DocumentAutomationEngine;
//# sourceMappingURL=document-automation.js.map