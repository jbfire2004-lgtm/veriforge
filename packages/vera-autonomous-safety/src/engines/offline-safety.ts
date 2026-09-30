import type { AutonomousSafetyReport, SafetyContextInput } from "../types";

export type OfflineSafetyQueueItem = {
  context: SafetyContextInput;
  queuedAt: string;
};

export class OfflineSafetyEngine {
  private queue: OfflineSafetyQueueItem[] = [];

  enqueue(ctx: SafetyContextInput): void {
    this.queue.push({ context: { ...ctx, offline: true }, queuedAt: new Date().toISOString() });
  }

  drain(): OfflineSafetyQueueItem[] {
    const items = [...this.queue];
    this.queue = [];
    return items;
  }

  applyReport(report: AutonomousSafetyReport): AutonomousSafetyReport {
    return {
      ...report,
      context: { ...report.context, offline: false },
    };
  }

  getQueueLength(): number {
    return this.queue.length;
  }
}
