import type { BrainContextInput, EnterpriseBrainReport } from "../types";

type OfflineItem = { id: string; context: BrainContextInput; queuedAt: string };

export class OfflineBrainEngine {
  private queue: OfflineItem[] = [];

  enqueue(ctx: BrainContextInput): string {
    const id = `aeb-offline-${Date.now()}`;
    this.queue.push({ id, context: { ...ctx, offline: true }, queuedAt: new Date().toISOString() });
    return id;
  }

  drain(): OfflineItem[] {
    const items = [...this.queue];
    this.queue = [];
    return items;
  }

  markSynced(report: EnterpriseBrainReport): EnterpriseBrainReport {
    return { ...report, context: { ...report.context, offline: false } };
  }
}
