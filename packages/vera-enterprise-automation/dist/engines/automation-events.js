"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomationEventEngine = void 0;
class AutomationEventEngine {
    applyEvent(ctx, event, data) {
        const next = { ...ctx, eventName: event };
        switch (event) {
            case "training.validated":
                next.nonCompliantWorkers = Math.max(0, (ctx.nonCompliantWorkers ?? 1) - 1);
                next.expiringTraining = Math.max(0, (ctx.expiringTraining ?? 1) - 1);
                break;
            case "training.expired":
                next.expiringTraining = (ctx.expiringTraining ?? 0) + 1;
                next.nonCompliantWorkers = (ctx.nonCompliantWorkers ?? 0) + 1;
                break;
            case "inspection.failed":
                next.inspectionFailures = (ctx.inspectionFailures ?? 0) + 1;
                next.lockedEquipment = (ctx.lockedEquipment ?? 0) + 1;
                break;
            case "inspection.completed":
                if (data?.passed === true) {
                    next.inspectionFailures = Math.max(0, (ctx.inspectionFailures ?? 1) - 1);
                }
                break;
            case "compliance.recalc":
                break;
            case "sync.batch":
                next.offline = false;
                break;
            default:
                break;
        }
        return next;
    }
}
exports.AutomationEventEngine = AutomationEventEngine;
//# sourceMappingURL=automation-events.js.map