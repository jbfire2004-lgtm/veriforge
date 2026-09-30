import type { CommandCenterReport, CommandContextInput } from "../types";
type OfflineItem = {
    id: string;
    context: CommandContextInput;
    queuedAt: string;
};
export declare class OfflineCommandEngine {
    private queue;
    enqueue(ctx: CommandContextInput): string;
    drain(): OfflineItem[];
    markSynced(report: CommandCenterReport): CommandCenterReport;
}
export {};
//# sourceMappingURL=offline-command.d.ts.map