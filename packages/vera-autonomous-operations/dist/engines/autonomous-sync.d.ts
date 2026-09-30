import type { AutonomousAction } from "../types";
type SyncQueueItem = {
    id: string;
    actions: AutonomousAction[];
    queuedAt: string;
};
export declare class AutonomousSyncEngine {
    private queue;
    enqueue(actions: AutonomousAction[]): string;
    drain(): SyncQueueItem[];
    applySynced(actions: AutonomousAction[]): AutonomousAction[];
    pendingCount(): number;
}
export {};
//# sourceMappingURL=autonomous-sync.d.ts.map