import type { InterplanetaryContextInput, InterplanetaryReport } from "../types";
type OfflineItem = {
    id: string;
    context: InterplanetaryContextInput;
    queuedAt: string;
};
export declare class OfflineInterplanetaryEngine {
    private queue;
    enqueue(ctx: InterplanetaryContextInput): string;
    drain(): OfflineItem[];
    markSynced(report: InterplanetaryReport): InterplanetaryReport;
}
export {};
//# sourceMappingURL=offline-interplanetary.d.ts.map