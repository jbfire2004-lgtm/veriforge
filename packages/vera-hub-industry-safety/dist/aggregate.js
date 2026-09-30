"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blindAggregate = blindAggregate;
exports.shouldSuppress = shouldSuppress;
exports.groupFactsByCohort = groupFactsByCohort;
const types_1 = require("./types");
const normalize_1 = require("./normalize");
function mean(values) {
    if (values.length === 0)
        return null;
    return (0, normalize_1.round)(values.reduce((a, b) => a + b, 0) / values.length, 4);
}
function avgMetric(facts, pick) {
    const vals = facts
        .map((f) => pick(f.metrics))
        .filter((v) => v != null && Number.isFinite(v));
    return mean(vals);
}
function mergeHecaDistribution(facts) {
    const acc = {};
    for (const f of facts) {
        for (const [k, v] of Object.entries(f.metrics.hecaDistribution)) {
            if (v == null || !Number.isFinite(v))
                continue;
            (acc[k] ?? (acc[k] = [])).push(v);
        }
    }
    const out = {};
    for (const [k, vals] of Object.entries(acc)) {
        const m = mean(vals);
        if (m != null) {
            out[k] = m;
        }
    }
    return out;
}
/**
 * Blind aggregation: cohort means only, suppress when distinct tokens < minSample.
 */
function blindAggregate(facts, key, options = {}) {
    const minSample = options.minSample ?? types_1.MIN_SAMPLE;
    const hideExact = options.hideExactCountWhenSuppressed ?? true;
    // Plane isolation: ignore facts from the wrong plane
    const planeFacts = facts.filter((f) => f.plane === key.entityType);
    const tokens = new Set(planeFacts.map((f) => f.token));
    const entityCount = tokens.size;
    const suppressed = entityCount < minSample;
    if (suppressed) {
        return {
            key,
            suppressed: true,
            entityCount: hideExact ? null : entityCount,
            entityCountVisible: !hideExact,
            minSample: types_1.MIN_SAMPLE,
            metrics: null,
        };
    }
    const metrics = {
        incidentRatePer200k: avgMetric(planeFacts, (m) => m.incidentRatePer200k),
        recordableRatePer200k: avgMetric(planeFacts, (m) => m.recordableRatePer200k),
        lostTimeRatePer200k: avgMetric(planeFacts, (m) => m.lostTimeRatePer200k),
        nearMissRatePer200k: avgMetric(planeFacts, (m) => m.nearMissRatePer200k),
        severityIndex: avgMetric(planeFacts, (m) => m.severityIndex),
        hecaHighEnergyRate: avgMetric(planeFacts, (m) => m.hecaHighEnergyRate),
        hecaControlsVerifiedRate: avgMetric(planeFacts, (m) => m.hecaControlsVerifiedRate),
        hecaDistribution: mergeHecaDistribution(planeFacts),
        hoursBasis: planeFacts[0]?.metrics.hoursBasis ?? 200000,
    };
    return {
        key,
        suppressed: false,
        entityCount,
        entityCountVisible: true,
        minSample: types_1.MIN_SAMPLE,
        metrics,
    };
}
function shouldSuppress(entityCount, minSample = types_1.MIN_SAMPLE) {
    return entityCount < minSample;
}
function groupFactsByCohort(facts) {
    const map = new Map();
    for (const f of facts) {
        const key = [
            f.plane,
            f.industry,
            f.subtype,
            f.scale,
            f.period,
        ].join("|");
        const list = map.get(key) ?? [];
        list.push(f);
        map.set(key, list);
    }
    return map;
}
