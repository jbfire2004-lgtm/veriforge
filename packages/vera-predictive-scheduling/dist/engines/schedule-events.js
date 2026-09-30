"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleEventEngine = void 0;
class ScheduleEventEngine {
    applyEvent(ctx, event, data) {
        const next = { ...ctx };
        switch (event) {
            case "worker.dispatched":
                next.workers = (ctx.workers ?? []).map((w) => w.id === String(data?.workerId)
                    ? { ...w, dispatchStatus: "dispatched" }
                    : w);
                break;
            case "worker.recalled":
                next.workers = (ctx.workers ?? []).map((w) => w.id === String(data?.workerId)
                    ? { ...w, dispatchStatus: "available" }
                    : w);
                break;
            case "training.expired":
                next.workers = (ctx.workers ?? []).map((w) => w.id === String(data?.workerId)
                    ? { ...w, isCompliant: false, expiringTraining: (w.expiringTraining ?? 0) + 1 }
                    : w);
                break;
            case "equipment.locked":
                next.equipment = (ctx.equipment ?? []).map((e) => e.id === String(data?.equipmentId) ? { ...e, lockedOut: true } : e);
                break;
            case "project.assigned":
                if (data?.workerId && data?.projectId) {
                    next.workers = (ctx.workers ?? []).map((w) => w.id === String(data.workerId)
                        ? {
                            ...w,
                            projectIds: [...(w.projectIds ?? []), String(data.projectId)],
                        }
                        : w);
                }
                break;
            default:
                break;
        }
        return next;
    }
}
exports.ScheduleEventEngine = ScheduleEventEngine;
//# sourceMappingURL=schedule-events.js.map