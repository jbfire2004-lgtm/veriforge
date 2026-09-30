import type { IndustryContextInput, IndustryEcosystemReport } from "../types";
type OfflineItem = {
    id: string;
    context: IndustryContextInput;
    queuedAt: string;
};
export declare class OfflineEcosystemEngine {
    private queue;
    enqueue(ctx: IndustryContextInput): string;
    drain(): OfflineItem[];
    markSynced(report: IndustryEcosystemReport): IndustryEcosystemReport;
}
export {};
//# sourceMappingURL=offline-ecosystem.d.ts.map