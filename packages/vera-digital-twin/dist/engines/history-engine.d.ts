import type { DigitalTwin } from "../types";
export type HistorySnapshot = {
    twinId: string;
    twinType: string;
    at: string;
    state: Partial<DigitalTwin>;
};
export declare class TwinHistoryEngine {
    private snapshots;
    record(twin: DigitalTwin): void;
    forTwin(twinType: string, twinId: string, limit?: number): HistorySnapshot[];
}
//# sourceMappingURL=history-engine.d.ts.map