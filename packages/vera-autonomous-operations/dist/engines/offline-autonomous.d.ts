import type { AutonomousOperationsReport, OperationsContextInput } from "../types";
type OfflineItem = {
    id: string;
    context: OperationsContextInput;
    queuedAt: string;
};
export declare class OfflineAutonomousEngine {
    private queue;
    enqueue(ctx: OperationsContextInput): string;
    drain(): OfflineItem[];
    detectOfflineConflicts(ctx: OperationsContextInput): string[];
    markSynced(report: AutonomousOperationsReport): AutonomousOperationsReport;
}
export {};
//# sourceMappingURL=offline-autonomous.d.ts.map