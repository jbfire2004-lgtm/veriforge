"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrainEventEngine = void 0;
class BrainEventEngine {
    applyEvent(ctx, event, data) {
        const next = { ...ctx, eventName: event };
        switch (event) {
            case "inspection.failed":
                next.inspectionFailures = (ctx.inspectionFailures ?? 0) + 1;
                break;
            case "training.expired":
                next.expiringTraining = (ctx.expiringTraining ?? 0) + 1;
                next.nonCompliantWorkers = (ctx.nonCompliantWorkers ?? 0) + 1;
                break;
            case "safety.precursor":
                next.sifPrecursors = (ctx.sifPrecursors ?? 0) + 1;
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
exports.BrainEventEngine = BrainEventEngine;
//# sourceMappingURL=brain-events.js.map