import type { GlobalNetworkReport, NetworkContextInput } from "../types";

type OfflineItem = { id: string; context: NetworkContextInput; queuedAt: string };

export class OfflineNetworkEngine {
  private queue: OfflineItem[] = [];

  enqueue(ctx: NetworkContextInput): string {
    const id = `net-offline-${Date.now()}`;
    this.queue.push({ id, context: { ...ctx, offline: true }, queuedAt: new Date().toISOString() });
    return id;
  }

  drain(): OfflineItem[] {
    const items = [...this.queue];
    this.queue = [];
    return items;
  }

  markSynced(report: GlobalNetworkReport): GlobalNetworkReport {
    return { ...report, context: { ...report.context, offline: false } };
  }
}
