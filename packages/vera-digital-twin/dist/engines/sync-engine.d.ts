import type { DigitalTwin } from "../types";
export declare class RealTimeSyncEngine {
    private subscribers;
    subscribe(type: string, id: string, fn: (twin: DigitalTwin) => void): () => void;
    publish(twin: DigitalTwin): void;
}
//# sourceMappingURL=sync-engine.d.ts.map