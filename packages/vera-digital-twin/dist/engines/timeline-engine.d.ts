import type { TimelineEntry, TwinEventName } from "../types";
export declare class TwinTimelineEngine {
    append(timeline: TimelineEntry[], event: TwinEventName | string, summary: string, delta?: Record<string, unknown>, aiSummary?: string): TimelineEntry[];
    summarizeRecent(timeline: TimelineEntry[], count?: number): string;
}
//# sourceMappingURL=timeline-engine.d.ts.map