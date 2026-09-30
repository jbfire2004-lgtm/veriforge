import type { IndustryContextInput, IndustryEcosystemReport } from "../types";

type OfflineItem = { id: string; context: IndustryContextInput; queuedAt: string };

export class OfflineEcosystemEngine {
  private queue: OfflineItem[] = [];

  enqueue(ctx: IndustryContextInput): string {
    const id = `eco-offline-${Date.now()}`;
    this.queue.push({ id, context: { ...ctx, offline: true }, queuedAt: new Date().toISOString() });
    return id;
  }

  drain(): OfflineItem[] {
    const items = [...this.queue];
    this.queue = [];
    return items;
  }

  markSynced(report: IndustryEcosystemReport): IndustryEcosystemReport {
    return { ...report, context: { ...report.context, offline: false } };
  }
}
