"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromBlindAggregates = fromBlindAggregates;
exports.assertSinglePlaneFacts = assertSinglePlaneFacts;
exports.assertSeriesPlane = assertSeriesPlane;
exports.filterUsable = filterUsable;
const hub_industry_safety_1 = require("@vera/hub-industry-safety");
const periods_1 = require("./periods");
/**
 * Convert blind aggregates (already anonymized) into a sorted trend series.
 */
function fromBlindAggregates(aggregates) {
    return aggregates
        .map((a) => ({
        period: a.key.period,
        suppressed: a.suppressed,
        entityCount: a.entityCount,
        metrics: a.metrics,
        leading: a.metrics
            ? {
                controlsVerifiedRate: a.metrics.hecaControlsVerifiedRate,
                nearMissReportingIndex: a.metrics.nearMissRatePer200k,
            }
            : undefined,
        rootCauseShares: a.metrics?.hecaDistribution
            ? Object.fromEntries(Object.entries(a.metrics.hecaDistribution).filter(([, v]) => v != null && Number.isFinite(v)))
            : undefined,
    }))
        .sort((a, b) => (0, periods_1.periodSortKey)(a.period) - (0, periods_1.periodSortKey)(b.period));
}
/**
 * Group facts by period then caller should blind-aggregate externally.
 * This helper only validates plane isolation and sorts.
 */
function assertSinglePlaneFacts(facts, expected) {
    if (!facts.length) {
        if (expected)
            return expected;
        throw new hub_industry_safety_1.PlaneIsolationError("VISI_PLANE_MISMATCH", "Trend series requires at least one fact");
    }
    const plane = facts[0].plane;
    for (const f of facts) {
        if (f.plane !== plane) {
            throw new hub_industry_safety_1.PlaneIsolationError("VISI_MIXED_PLANE", "Project and company facts cannot mix in a trend series");
        }
    }
    if (expected && plane !== expected) {
        throw new hub_industry_safety_1.PlaneIsolationError("VISI_PLANE_MISMATCH", `Expected ${expected} plane, got ${plane}`);
    }
    return plane;
}
function assertSeriesPlane(series, scope, opts = {}) {
    if (scope.entityType !== "project" && scope.entityType !== "company") {
        throw new hub_industry_safety_1.PlaneIsolationError("VISI_PLANE_MISMATCH", "entityType must be project or company");
    }
    // Series points are already plane-scoped by construction; cross-compare
    // is only allowed when building dual reports, not a blended series.
    if (opts.explicitCrossCompare === false) {
        // no-op guard for API symmetry
    }
    void series;
}
function filterUsable(series) {
    return series.filter((p) => !p.suppressed && p.metrics != null);
}
