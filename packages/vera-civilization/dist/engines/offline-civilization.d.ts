import type { CivilizationContextInput, CivilizationReport } from "../types";
type OfflineItem = {
    id: string;
    context: CivilizationContextInput;
    queuedAt: string;
};
export declare class OfflineCivilizationEngine {
    private queue;
    enqueue(ctx: CivilizationContextInput): string;
    drain(): OfflineItem[];
    markSynced(report: CivilizationReport): CivilizationReport;
}
export {};
//# sourceMappingURL=offline-civilization.d.ts.map