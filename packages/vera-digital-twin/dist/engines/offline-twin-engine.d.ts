import type { DigitalTwin, TwinEventPayload } from "../types";
import { EventDrivenUpdateEngine } from "./event-update-engine";
export type OfflineQueueItem = {
    event: TwinEventPayload;
    clientVersion: number;
};
export declare class OfflineTwinEngine {
    private queue;
    enqueue(event: TwinEventPayload, clientVersion: number): void;
    applyPending(twin: DigitalTwin, updater: EventDrivenUpdateEngine, resolver?: (local: DigitalTwin, server: DigitalTwin) => DigitalTwin): {
        twin: DigitalTwin;
        conflicts: number;
    };
    getQueueLength(): number;
}
//# sourceMappingURL=offline-twin-engine.d.ts.map