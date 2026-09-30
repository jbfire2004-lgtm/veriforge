import type { InterstellarContextInput, InterstellarReport } from "../types";
type OfflineItem = {
    id: string;
    context: InterstellarContextInput;
    queuedAt: string;
};
export declare class OfflineInterstellarEngine {
    private queue;
    enqueue(ctx: InterstellarContextInput): string;
    drain(): OfflineItem[];
    markSynced(report: InterstellarReport): InterstellarReport;
}
export {};
//# sourceMappingURL=offline-interstellar.d.ts.map