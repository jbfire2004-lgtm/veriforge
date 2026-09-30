"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandEventEngine = void 0;
class CommandEventEngine {
    applyEvent(ctx, event, data) {
        const next = { ...ctx, eventName: event };
        switch (event) {
            case "inspection.failed":
                next.inspectionFailures = (ctx.inspectionFailures ?? 0) + 1;
                break;
            case "training.expired":
                next.trainingExpiries = (ctx.trainingExpiries ?? 0) + 1;
                next.competencyGaps = (ctx.competencyGaps ?? 0) + 1;
                break;
            case "safety.intervention":
                next.sifPrecursors = (ctx.sifPrecursors ?? 0) + 1;
                break;
            case "dispatch.conflict":
                next.dispatchConflicts = (ctx.dispatchConflicts ?? 0) + 1;
                break;
            case "vision.anomaly":
                next.visionAnomalies = (ctx.visionAnomalies ?? 0) + 1;
                break;
            case "sync.batch":
                next.offline = false;
                break;
            default:
                break;
        }
        if (data?.entityId && ctx.entities) {
            next.entities = ctx.entities.map((e) => e.id === String(data.entityId)
                ? { ...e, metadata: { ...e.metadata, lastEvent: event } }
                : e);
        }
        return next;
    }
}
exports.CommandEventEngine = CommandEventEngine;
//# sourceMappingURL=command-events.js.map