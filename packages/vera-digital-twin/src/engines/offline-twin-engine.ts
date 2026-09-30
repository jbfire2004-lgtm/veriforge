import type { DigitalTwin, TwinEventPayload } from "../types";
import { EventDrivenUpdateEngine } from "./event-update-engine";

export type OfflineQueueItem = {
  event: TwinEventPayload;
  clientVersion: number;
};

export class OfflineTwinEngine {
  private queue: OfflineQueueItem[] = [];

  enqueue(event: TwinEventPayload, clientVersion: number): void {
    this.queue.push({ event, clientVersion });
  }

  applyPending(
    twin: DigitalTwin,
    updater: EventDrivenUpdateEngine,
    resolver?: (local: DigitalTwin, server: DigitalTwin) => DigitalTwin
  ): { twin: DigitalTwin; conflicts: number } {
    let current = twin;
    let conflicts = 0;
    const pending = [...this.queue];
    this.queue = [];

    for (const item of pending) {
      if (
        resolver &&
        twin.offline.serverVersion != null &&
        item.clientVersion < twin.offline.serverVersion
      ) {
        current = resolver(current, twin);
        conflicts++;
      }
      current = updater.apply(current, item.event);
    }

    return {
      twin: updater.apply(current, {
        name: "twin.synced",
        entityType: twin.type,
        entityId: twin.id,
        occurredAt: new Date().toISOString(),
      }),
      conflicts,
    };
  }

  getQueueLength(): number {
    return this.queue.length;
  }
}
