import type { MarketplaceContextInput, MarketplaceReport } from "../types";
type OfflineItem = {
    id: string;
    context: MarketplaceContextInput;
    queuedAt: string;
};
export declare class OfflineMarketplaceEngine {
    private queue;
    enqueue(ctx: MarketplaceContextInput): string;
    drain(): OfflineItem[];
    markSynced(report: MarketplaceReport): MarketplaceReport;
}
export {};
//# sourceMappingURL=offline-marketplace.d.ts.map