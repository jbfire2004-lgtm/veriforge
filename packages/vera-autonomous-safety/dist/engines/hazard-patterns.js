"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HazardPatternRecognitionEngine = void 0;
class HazardPatternRecognitionEngine {
    analyze(ctx) {
        const hazardTexts = (ctx.forms ?? [])
            .map((f) => f.hazardSummary?.toLowerCase() ?? "")
            .filter(Boolean);
        const freq = new Map();
        for (const h of hazardTexts) {
            const tokens = h.split(/\W+/).filter((t) => t.length > 4);
            for (const t of tokens)
                freq.set(t, (freq.get(t) ?? 0) + 1);
        }
        const clusters = [...freq.entries()]
            .filter(([, c]) => c >= 2)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([label, count], i) => ({
            id: `cluster_${i}`,
            label,
            count,
            severity: count >= 4 ? "high" : "medium",
        }));
        const trends = [];
        if ((ctx.inspectionFailures ?? 0) > 1) {
            trends.push({ label: "Inspection failures", delta: ctx.inspectionFailures });
        }
        if ((ctx.trainingGaps ?? 0) > 0) {
            trends.push({ label: "Training gaps", delta: ctx.trainingGaps });
        }
        const correlations = [];
        if (clusters.length && (ctx.inspectionFailures ?? 0) > 0) {
            correlations.push("Hazard clusters correlate with inspection failures");
        }
        const precursors = [];
        if (clusters.some((c) => /fall|height|electrical/i.test(c.label))) {
            precursors.push("SIF-relevant hazard language increasing");
        }
        const escalations = [];
        if ((ctx.inspectionFailures ?? 0) >= 3) {
            escalations.push("Repeated inspection failures — escalate review");
        }
        return { clusters, trends, correlations, precursors, escalations };
    }
}
exports.HazardPatternRecognitionEngine = HazardPatternRecognitionEngine;
//# sourceMappingURL=hazard-patterns.js.map