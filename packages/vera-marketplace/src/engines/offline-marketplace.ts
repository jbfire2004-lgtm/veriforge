import type { MarketplaceContextInput, MarketplaceReport } from "../types";

type OfflineItem = { id: string; context: MarketplaceContextInput; queuedAt: string };

export class OfflineMarketplaceEngine {
  private queue: OfflineItem[] = [];

  enqueue(ctx: MarketplaceContextInput): string {
    const id = `mkt-offline-${Date.now()}`;
    this.queue.push({ id, context: { ...ctx, offline: true }, queuedAt: new Date().toISOString() });
    return id;
  }

  drain(): OfflineItem[] {
    const items = [...this.queue];
    this.queue = [];
    return items;
  }

  markSynced(report: MarketplaceReport): MarketplaceReport {
    return { ...report, context: { ...report.context, offline: false } };
  }
}
