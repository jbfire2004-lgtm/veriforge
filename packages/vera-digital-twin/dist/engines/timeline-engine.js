"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwinTimelineEngine = void 0;
let entryCounter = 0;
class TwinTimelineEngine {
    append(timeline, event, summary, delta, aiSummary) {
        const entry = {
            id: `tl_${++entryCounter}`,
            at: new Date().toISOString(),
            event,
            summary,
            delta,
            aiSummary,
        };
        return [entry, ...timeline].slice(0, 100);
    }
    summarizeRecent(timeline, count = 5) {
        const recent = timeline.slice(0, count);
        if (!recent.length)
            return "No recent activity.";
        return recent.map((e) => e.summary).join("; ");
    }
}
exports.TwinTimelineEngine = TwinTimelineEngine;
//# sourceMappingURL=timeline-engine.js.map