import type { CommandCenterReport, CommandContextInput } from "../types";

type OfflineItem = { id: string; context: CommandContextInput; queuedAt: string };

export class OfflineCommandEngine {
  private queue: OfflineItem[] = [];

  enqueue(ctx: CommandContextInput): string {
    const id = `cc-offline-${Date.now()}`;
    this.queue.push({ id, context: { ...ctx, offline: true }, queuedAt: new Date().toISOString() });
    return id;
  }

  drain(): OfflineItem[] {
    const items = [...this.queue];
    this.queue = [];
    return items;
  }

  markSynced(report: CommandCenterReport): CommandCenterReport {
    return { ...report, context: { ...report.context, offline: false } };
  }
}
