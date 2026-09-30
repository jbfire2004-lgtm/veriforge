import type { AutonomousAction } from "../types";

type SyncQueueItem = {
  id: string;
  actions: AutonomousAction[];
  queuedAt: string;
};

export class AutonomousSyncEngine {
  private queue: SyncQueueItem[] = [];

  enqueue(actions: AutonomousAction[]): string {
    const id = `sync-${Date.now()}`;
    this.queue.push({ id, actions, queuedAt: new Date().toISOString() });
    return id;
  }

  drain(): SyncQueueItem[] {
    const items = [...this.queue];
    this.queue = [];
    return items;
  }

  applySynced(actions: AutonomousAction[]): AutonomousAction[] {
    const now = new Date().toISOString();
    return actions.map((a) => ({
      ...a,
      status: "executed" as const,
      executedAt: now,
      metadata: { ...a.metadata, synced: true },
    }));
  }

  pendingCount(): number {
    return this.queue.reduce((s, q) => s + q.actions.length, 0);
  }
}
