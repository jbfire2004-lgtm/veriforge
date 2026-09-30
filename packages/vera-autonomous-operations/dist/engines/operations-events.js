"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationsEventEngine = void 0;
class OperationsEventEngine {
    applyEvent(ctx, event, data) {
        const next = { ...ctx };
        switch (event) {
            case "inspection.failed":
                next.equipment = (ctx.equipment ?? []).map((e) => e.id === String(data?.equipmentId)
                    ? { ...e, inspectionPassed: false, lockedOut: true }
                    : e);
                break;
            case "inspection.completed":
                if (data?.passed === true) {
                    next.equipment = (ctx.equipment ?? []).map((e) => e.id === String(data?.equipmentId)
                        ? { ...e, inspectionPassed: true }
                        : e);
                }
                break;
            case "training.expired":
            case "training.validated":
                next.workers = (ctx.workers ?? []).map((w) => w.id === String(data?.workerId)
                    ? {
                        ...w,
                        trainingValid: event === "training.validated",
                        isCompliant: event === "training.validated",
                    }
                    : w);
                break;
            case "safety.intervention":
                if (data?.lockoutEquipmentId) {
                    next.equipment = (ctx.equipment ?? []).map((e) => e.id === String(data.lockoutEquipmentId)
                        ? { ...e, sifPrecursor: true, lockedOut: true }
                        : e);
                }
                if (data?.restrictWorkerId) {
                    next.workers = (ctx.workers ?? []).map((w) => w.id === String(data.restrictWorkerId)
                        ? { ...w, restricted: true, sifRiskScore: 80 }
                        : w);
                }
                break;
            case "dispatch.created":
                next.workers = (ctx.workers ?? []).map((w) => w.id === String(data?.workerId)
                    ? { ...w, dispatchStatus: "dispatched" }
                    : w);
                break;
            default:
                break;
        }
        return next;
    }
}
exports.OperationsEventEngine = OperationsEventEngine;
//# sourceMappingURL=operations-events.js.map