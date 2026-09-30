import type { SafetyContextInput } from "../types";

/** Maps domain safety events into analysis context updates */
export class SafetyEventEngine {
  applyEvent(ctx: SafetyContextInput, event: string, data?: Record<string, unknown>): SafetyContextInput {
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
