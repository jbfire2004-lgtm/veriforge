"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SafetyEventEngine = void 0;
/** Maps domain safety events into analysis context updates */
class SafetyEventEngine {
    applyEvent(ctx, event, data) {
        const next = { ...ctx };
        switch (event) {
            case "inspection.failed":
                next.inspectionFailures = (next.inspectionFailures ?? 0) + 1;
                break;
            case "training.expired":
                next.trainingGaps = (next.trainingGaps ?? 0) + 1;
                break;
            case "equipment.locked":
                next.lockedOutEquipment = true;
                break;
            case "vision.hazard":
                next.visionHazards = [...(next.visionHazards ?? []), String(data?.hazard ?? "unknown")];
                break;
        }
        return next;
    }
}
exports.SafetyEventEngine = SafetyEventEngine;
//# sourceMappingURL=safety-events.js.map