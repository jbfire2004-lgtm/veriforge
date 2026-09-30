import type { GlobalNetworkReport, NetworkContextInput } from "../types";
type OfflineItem = {
    id: string;
    context: NetworkContextInput;
    queuedAt: string;
};
export declare class OfflineNetworkEngine {
    private queue;
    enqueue(ctx: NetworkContextInput): string;
    drain(): OfflineItem[];
    markSynced(report: GlobalNetworkReport): GlobalNetworkReport;
}
export {};
//# sourceMappingURL=offline-network.d.ts.map