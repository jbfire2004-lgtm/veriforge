"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeLeadingCorrelation = analyzeLeadingCorrelation;
const stats_1 = require("./stats");
const series_1 = require("./series");
function laggingValue(p, key) {
    if (!p.metrics)
        return null;
    switch (key) {
        case "trif":
            return p.metrics.recordableRatePer200k;
        case "ltif":
            return p.metrics.lostTimeRatePer200k;
        case "incidentRatePer200k":
            return p.metrics.incidentRatePer200k;
        case "severityIndex":
            return p.metrics.severityIndex;
    }
}
function leadingValue(p, key) {
    if (key === "controlsVerifiedRate") {
        return (p.leading?.controlsVerifiedRate ??
            p.metrics?.hecaControlsVerifiedRate ??
            null);
    }
    if (key === "nearMissReportingIndex") {
        return (p.leading?.nearMissReportingIndex ??
            p.metrics?.nearMissRatePer200k ??
            null);
    }
    const leading = p.leading;
    return leading?.[key] ?? null;
}
const LEADING_KEYS = [
    "controlsVerifiedRate",
    "nearMissReportingIndex",
    "observationRate",
    "inspectionCompletionRate",
    "trainingCurrencyRate",
];
const LAGGING_KEYS = [
    "trif",
    "ltif",
    "incidentRatePer200k",
    "severityIndex",
];
function analyzeLeadingCorrelation(plane, scope, series) {
    const usable = (0, series_1.filterUsable)(series);
    const pairs = [];
    for (const leading of LEADING_KEYS) {
        for (const lagging of LAGGING_KEYS) {
            const xs = [];
            const ys = [];
            for (const p of usable) {
                const x = leadingValue(p, leading);
                const y = laggingValue(p, lagging);
                if (x != null && y != null && Number.isFinite(x) && Number.isFinite(y)) {
                    xs.push(x);
                    ys.push(y);
                }
            }
            const r = (0, stats_1.pearson)(xs, ys);
            pairs.push({
                leading,
                lagging,
                r: r == null ? null : (0, stats_1.round)(r, 4),
                n: xs.length,
                strength: (0, stats_1.correlationStrength)(r, xs.length),
            });
        }
    }
    // Prefer pairs with enough samples; keep all for transparency
    pairs.sort((a, b) => {
        const aa = a.r == null ? -1 : Math.abs(a.r);
        const bb = b.r == null ? -1 : Math.abs(b.r);
        return bb - aa;
    });
    void stats_1.finiteNumbers;
    return { plane, scope, pairs };
}
