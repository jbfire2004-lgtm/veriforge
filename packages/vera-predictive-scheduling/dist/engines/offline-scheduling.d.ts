import type { PredictiveSchedulingReport, SchedulingContextInput } from "../types";
type OfflineQueueItem = {
    id: string;
    context: SchedulingContextInput;
    queuedAt: string;
};
export declare class OfflineSchedulingEngine {
    private queue;
    enqueue(ctx: SchedulingContextInput): string;
    drain(): OfflineQueueItem[];
    peek(): OfflineQueueItem[];
    applyReport(report: PredictiveSchedulingReport): PredictiveSchedulingReport;
    detectConflicts(ctx: SchedulingContextInput): string[];
}
export {};
//# sourceMappingURL=offline-scheduling.d.ts.map