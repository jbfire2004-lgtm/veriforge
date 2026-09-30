import type { AutonomousOperationsReport, OperationsContextInput } from "../types";

type OfflineItem = { id: string; context: OperationsContextInput; queuedAt: string };

export class OfflineAutonomousEngine {
  private queue: OfflineItem[] = [];

  enqueue(ctx: OperationsContextInput): string {
    const id = `offline-op-${Date.now()}`;
    this.queue.push({
      id,
      context: { ...ctx, offline: true },
      queuedAt: new Date().toISOString(),
    });
    return id;
  }

  drain(): OfflineItem[] {
    const items = [...this.queue];
    this.queue = [];
    return items;
  }

  detectOfflineConflicts(ctx: OperationsContextInput): string[] {
    const conflicts: string[] = [];
    for (const w of ctx.workers ?? []) {
      if ((w.projectIds?.length ?? 0) > 1) {
        conflicts.push(`Offline: ${w.name} multi-project`);
      }
    }
    return conflicts;
  }

  markSynced(report: AutonomousOperationsReport): AutonomousOperationsReport {
    return {
      ...report,
      context: { ...report.context, offline: false },
    };
  }
}
