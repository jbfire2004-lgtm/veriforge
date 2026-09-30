import type { DigitalTwin, TwinEventPayload, TwinEventName } from "../types";
import { StateModelEngine } from "./state-model-engine";
import { TwinTimelineEngine } from "./timeline-engine";
import { TwinHistoryEngine } from "./history-engine";

export class EventDrivenUpdateEngine {
  constructor(
    private readonly state: StateModelEngine,
    private readonly timeline: TwinTimelineEngine,
    private readonly history: TwinHistoryEngine
  ) {}

  apply(twin: DigitalTwin, event: TwinEventPayload): DigitalTwin {
    const summary = eventSummary(event);
    twin.timeline = this.timeline.append(twin.timeline, event.name, summary, event.data);

    switch (event.name) {
      case "training.uploaded":
      case "training.validated":
        if (twin.type === "worker") {
          twin.trainingCount = (twin.trainingCount ?? 0) + 1;
        }
        break;
      case "training.expired":
        if (twin.type === "worker") twin.expiringTraining = (twin.expiringTraining ?? 0) + 1;
        break;
      case "inspection.completed":
        if (twin.type === "equipment") twin.inspectionCount = (twin.inspectionCount ?? 0) + 1;
        break;
      case "inspection.failed":
        if (twin.type === "equipment") {
          twin.lockedOut = true;
          twin.risk = { ...twin.risk, score: Math.min(100, twin.risk.score + 25), level: "high" };
        }
        break;
      case "equipment.locked":
        if (twin.type === "equipment") twin.lockedOut = true;
        break;
      case "equipment.unlocked":
        if (twin.type === "equipment") twin.lockedOut = false;
        break;
      case "project.assigned":
        if (twin.type === "worker" || twin.type === "equipment") {
          const pid = String(event.projectId ?? event.data?.projectId ?? "");
          if (pid && !twin.projectIds.includes(pid)) twin.projectIds.push(pid);
        }
        break;
      case "dispatch.created":
        if (twin.type === "worker") twin.dispatchStatus = "dispatched";
        break;
      case "dispatch.recalled":
        if (twin.type === "worker") twin.dispatchStatus = "available";
        break;
      case "twin.offline":
        twin.offline = { ...twin.offline, pending: true, queuedEvents: twin.offline.queuedEvents + 1 };
        break;
      case "twin.synced":
        twin.offline = {
          pending: false,
          lastSyncedAt: new Date().toISOString(),
          queuedEvents: 0,
          clientVersion: twin.offline.clientVersion,
          serverVersion: (twin.offline.serverVersion ?? 0) + 1,
        };
        break;
    }

    const updated = this.state.set(twin);
    this.history.record(updated);
    return updated;
  }
}

function eventSummary(event: TwinEventPayload): string {
  return `${event.name} on ${event.entityType} ${event.entityId}`;
}
