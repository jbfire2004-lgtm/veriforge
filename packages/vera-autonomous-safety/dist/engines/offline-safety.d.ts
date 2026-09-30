import type { AutonomousSafetyReport, SafetyContextInput } from "../types";
export type OfflineSafetyQueueItem = {
    context: SafetyContextInput;
    queuedAt: string;
};
export declare class OfflineSafetyEngine {
    private queue;
    enqueue(ctx: SafetyContextInput): void;
    drain(): OfflineSafetyQueueItem[];
    applyReport(report: AutonomousSafetyReport): AutonomousSafetyReport;
    getQueueLength(): number;
}
//# sourceMappingURL=offline-safety.d.ts.map