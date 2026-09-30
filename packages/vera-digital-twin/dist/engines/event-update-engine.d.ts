import type { DigitalTwin, TwinEventPayload } from "../types";
import { StateModelEngine } from "./state-model-engine";
import { TwinTimelineEngine } from "./timeline-engine";
import { TwinHistoryEngine } from "./history-engine";
export declare class EventDrivenUpdateEngine {
    private readonly state;
    private readonly timeline;
    private readonly history;
    constructor(state: StateModelEngine, timeline: TwinTimelineEngine, history: TwinHistoryEngine);
    apply(twin: DigitalTwin, event: TwinEventPayload): DigitalTwin;
}
//# sourceMappingURL=event-update-engine.d.ts.map