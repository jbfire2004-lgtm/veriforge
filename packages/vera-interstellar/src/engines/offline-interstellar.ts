import type { InterstellarContextInput, InterstellarReport } from "../types";

type OfflineItem = { id: string; context: InterstellarContextInput; queuedAt: string };

export class OfflineInterstellarEngine {
  private queue: OfflineItem[] = [];

  enqueue(ctx: InterstellarContextInput): string {
    const id = `is-offline-${Date.now()}`;
    this.queue.push({ id, context: { ...ctx, offline: true }, queuedAt: new Date().toISOString() });
    return id;
  }

  drain(): OfflineItem[] {
    const items = [...this.queue];
    this.queue = [];
    return items;
  }

  markSynced(report: InterstellarReport): InterstellarReport {
    return { ...report, context: { ...report.context, offline: false } };
  }
}
