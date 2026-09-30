import type { EnterpriseAutomationReport, EnterpriseContextInput } from "../types";

type OfflineItem = { id: string; context: EnterpriseContextInput; queuedAt: string };

export class OfflineEnterpriseEngine {
  private queue: OfflineItem[] = [];

  enqueue(ctx: EnterpriseContextInput): string {
    const id = `ent-offline-${Date.now()}`;
    this.queue.push({ id, context: { ...ctx, offline: true }, queuedAt: new Date().toISOString() });
    return id;
  }

  drain(): OfflineItem[] {
    const items = [...this.queue];
    this.queue = [];
    return items;
  }

  markSynced(report: EnterpriseAutomationReport): EnterpriseAutomationReport {
    return { ...report, context: { ...report.context, offline: false } };
  }
}
