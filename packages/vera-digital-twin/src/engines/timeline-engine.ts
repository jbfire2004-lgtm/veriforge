import type { TimelineEntry, TwinEventName } from "../types";

let entryCounter = 0;

export class TwinTimelineEngine {
  append(
    timeline: TimelineEntry[],
    event: TwinEventName | string,
    summary: string,
    delta?: Record<string, unknown>,
    aiSummary?: string
  ): TimelineEntry[] {
    const entry: TimelineEntry = {
      id: `tl_${++entryCounter}`,
      at: new Date().toISOString(),
      event,
      summary,
      delta,
      aiSummary,
    };
    return [entry, ...timeline].slice(0, 100);
  }

  summarizeRecent(timeline: TimelineEntry[], count = 5): string {
    const recent = timeline.slice(0, count);
    if (!recent.length) return "No recent activity.";
    return recent.map((e) => e.summary).join("; ");
  }
}
