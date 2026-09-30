import type { CommandContextInput } from "../types";

export class CommandEventEngine {
  applyEvent(
    ctx: CommandContextInput,
    event: string,
    data?: Record<string, unknown>
  ): CommandContextInput {
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
      next.entities = ctx.entities.map((e) =>
        e.id === String(data.entityId)
          ? { ...e, metadata: { ...e.metadata, lastEvent: event } }
          : e
      );
    }

    return next;
  }
}
