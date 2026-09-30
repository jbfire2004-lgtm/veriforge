"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SafetyTimelineEngine = void 0;
let tlId = 0;
class SafetyTimelineEngine {
    build(report) {
        const entries = [];
        for (const p of report.sif.precursors) {
            entries.push({
                id: `tl_${++tlId}`,
                at: new Date().toISOString(),
                category: "SIF",
                message: p.message,
                severity: report.sif.riskScore.level,
            });
        }
        for (const d of report.heca.deviations) {
            entries.push({
                id: `tl_${++tlId}`,
                at: new Date().toISOString(),
                category: "HECA",
                message: d.message,
                severity: "medium",
            });
        }
        for (const i of report.interventions) {
            entries.push({
                id: `tl_${++tlId}`,
                at: i.triggeredAt,
                category: "INTERVENTION",
                message: `${i.title}: ${i.reason}`,
                severity: i.priority >= 90 ? "critical" : "high",
            });
        }
        return entries.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 50);
    }
}
exports.SafetyTimelineEngine = SafetyTimelineEngine;
//# sourceMappingURL=safety-timeline.js.map