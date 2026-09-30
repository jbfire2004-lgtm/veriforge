import type { BrainContextInput, EnterpriseBrainReport } from "../types";
type OfflineItem = {
    id: string;
    context: BrainContextInput;
    queuedAt: string;
};
export declare class OfflineBrainEngine {
    private queue;
    enqueue(ctx: BrainContextInput): string;
    drain(): OfflineItem[];
    markSynced(report: EnterpriseBrainReport): EnterpriseBrainReport;
}
export {};
//# sourceMappingURL=offline-brain.d.ts.map