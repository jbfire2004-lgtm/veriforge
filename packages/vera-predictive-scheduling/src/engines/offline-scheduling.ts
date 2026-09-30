import type { PredictiveSchedulingReport, SchedulingContextInput } from "../types";

type OfflineQueueItem = {
  id: string;
  context: SchedulingContextInput;
  queuedAt: string;
};

export class OfflineSchedulingEngine {
  private queue: OfflineQueueItem[] = [];

  enqueue(ctx: SchedulingContextInput): string {
    const id = `offline-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.queue.push({ id, context: { ...ctx, offline: true }, queuedAt: new Date().toISOString() });
    return id;
  }

  drain(): OfflineQueueItem[] {
    const items = [...this.queue];
    this.queue = [];
    return items;
  }

  peek(): OfflineQueueItem[] {
    return [...this.queue];
  }

  applyReport(report: PredictiveSchedulingReport): PredictiveSchedulingReport {
    return {
      ...report,
      context: { ...report.context, offline: false },
    };
  }

  detectConflicts(ctx: SchedulingContextInput): string[] {
    const conflicts: string[] = [];
    const workers = ctx.workers ?? [];
    for (const w of workers) {
      if ((w.projectIds?.length ?? 0) > 1) {
        conflicts.push(`Offline: worker ${w.id} multi-project conflict`);
      }
    }
    return conflicts;
  }
}
