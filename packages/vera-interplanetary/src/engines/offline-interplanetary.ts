import type { InterplanetaryContextInput, InterplanetaryReport } from "../types";

type OfflineItem = { id: string; context: InterplanetaryContextInput; queuedAt: string };

export class OfflineInterplanetaryEngine {
  private queue: OfflineItem[] = [];

  enqueue(ctx: InterplanetaryContextInput): string {
    const id = `ip-offline-${Date.now()}`;
    this.queue.push({ id, context: { ...ctx, offline: true }, queuedAt: new Date().toISOString() });
    return id;
  }

  drain(): OfflineItem[] {
    const items = [...this.queue];
    this.queue = [];
    return items;
  }

  markSynced(report: InterplanetaryReport): InterplanetaryReport {
    return { ...report, context: { ...report.context, offline: false } };
  }
}
