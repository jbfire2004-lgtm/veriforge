import type { EnterpriseAutomationReport, EnterpriseContextInput } from "../types";
type OfflineItem = {
    id: string;
    context: EnterpriseContextInput;
    queuedAt: string;
};
export declare class OfflineEnterpriseEngine {
    private queue;
    enqueue(ctx: EnterpriseContextInput): string;
    drain(): OfflineItem[];
    markSynced(report: EnterpriseAutomationReport): EnterpriseAutomationReport;
}
export {};
//# sourceMappingURL=offline-enterprise.d.ts.map