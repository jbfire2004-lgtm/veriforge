import type { CivilizationContextInput, CivilizationReport } from "../types";

type OfflineItem = { id: string; context: CivilizationContextInput; queuedAt: string };

export class OfflineCivilizationEngine {
  private queue: OfflineItem[] = [];

  enqueue(ctx: CivilizationContextInput): string {
    const id = `civ-offline-${Date.now()}`;
    this.queue.push({ id, context: { ...ctx, offline: true }, queuedAt: new Date().toISOString() });
    return id;
  }

  drain(): OfflineItem[] {
    const items = [...this.queue];
    this.queue = [];
    return items;
  }

  markSynced(report: CivilizationReport): CivilizationReport {
    return { ...report, context: { ...report.context, offline: false } };
  }
}
