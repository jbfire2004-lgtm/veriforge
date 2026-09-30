"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomationEngine = void 0;
let taskId = 0;
class AutomationEngine {
    constructor() {
        this.tasks = [];
        this.rules = [];
    }
    registerRule(rule) {
        this.rules.push(rule);
    }
    registerDefaultRules() {
        this.registerRule({
            id: "expiry-reminder",
            type: "reminder",
            module: "training",
            condition: (ctx) => ctx.daysToExpiry <= 30 && ctx.daysToExpiry > 0,
            build: (ctx) => ({
                type: "reminder",
                module: "training",
                title: `Training expires in ${ctx.daysToExpiry} days`,
                payload: { entityId: ctx.entityId },
            }),
        });
        this.registerRule({
            id: "lockout-trigger",
            type: "lockout",
            module: "equipment",
            condition: (ctx) => ctx.inspectionFailed === true,
            build: (ctx) => ({
                type: "lockout",
                module: "equipment",
                title: "Auto-lockout after inspection failure",
                payload: { equipmentId: ctx.equipmentId },
            }),
        });
        this.registerRule({
            id: "compliance-escalation",
            type: "escalation",
            module: "compliance",
            condition: (ctx) => ctx.riskScore >= 80,
            build: (ctx) => ({
                type: "escalation",
                module: "compliance",
                title: "High compliance risk — escalate to admin",
                payload: { companyId: ctx.companyId },
            }),
        });
        this.registerRule({
            id: "sync-retry",
            type: "retry",
            module: "offline",
            condition: (ctx) => ctx.syncFailed === true && ctx.retries < 3,
            build: (ctx) => ({
                type: "retry",
                module: "offline",
                title: "Retry offline sync batch",
                payload: { batchId: ctx.batchId },
            }),
        });
    }
    evaluate(ctx) {
        const created = [];
        for (const rule of this.rules) {
            if (!rule.condition(ctx))
                continue;
            const partial = rule.build(ctx);
            const task = {
                id: `auto_${++taskId}`,
                ...partial,
                scheduledAt: new Date().toISOString(),
                status: "pending",
                retries: 0,
            };
            this.tasks.push(task);
            created.push(task);
        }
        return created;
    }
    getPending() {
        return this.tasks.filter((t) => t.status === "pending");
    }
    markComplete(id) {
        const t = this.tasks.find((x) => x.id === id);
        if (t)
            t.status = "completed";
    }
    getAll() {
        return [...this.tasks];
    }
}
exports.AutomationEngine = AutomationEngine;
//# sourceMappingURL=automation-engine.js.map