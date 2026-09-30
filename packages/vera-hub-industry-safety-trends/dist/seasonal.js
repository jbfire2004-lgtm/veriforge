"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelSeasonalRisk = modelSeasonalRisk;
const stats_1 = require("./stats");
const periods_1 = require("./periods");
const series_1 = require("./series");
function metricValue(p, metric) {
    if (p.suppressed || !p.metrics)
        return null;
    switch (metric) {
        case "trif":
            return p.metrics.recordableRatePer200k;
        case "ltif":
            return p.metrics.lostTimeRatePer200k;
        case "heca_high_energy":
            return p.metrics.hecaHighEnergyRate;
        case "incident_per_200k":
            return p.metrics.incidentRatePer200k;
        case "leading_composite": {
            const parts = [
                p.leading?.controlsVerifiedRate ?? p.metrics.hecaControlsVerifiedRate,
                p.leading?.observationRate,
                p.leading?.inspectionCompletionRate,
                p.leading?.trainingCurrencyRate,
            ].filter((v) => v != null && Number.isFinite(v));
            if (!parts.length)
                return null;
            return parts.reduce((s, v) => s + v, 0) / parts.length;
        }
    }
}
function modelSeasonalRisk(plane, scope, series, metric) {
    const usable = (0, series_1.filterUsable)(series);
    const values = usable
        .map((p) => metricValue(p, metric))
        .filter((v) => v != null);
    const overall = (0, stats_1.mean)(values);
    const bucketSums = new Map();
    for (const p of usable) {
        const bucket = (0, periods_1.monthBucket)(p.period);
        const v = metricValue(p, metric);
        if (!bucket || v == null)
            continue;
        const cur = bucketSums.get(bucket) ?? { sum: 0, n: 0 };
        cur.sum += v;
        cur.n += 1;
        bucketSums.set(bucket, cur);
    }
    const bucketMeans = new Map();
    for (const [b, { sum, n }] of bucketSums) {
        if (n > 0)
            bucketMeans.set(b, sum / n);
    }
    let peakBucket = null;
    let troughBucket = null;
    let peakVal = -Infinity;
    let troughVal = Infinity;
    for (const [b, v] of bucketMeans) {
        if (v > peakVal) {
            peakVal = v;
            peakBucket = b;
        }
        if (v < troughVal) {
            troughVal = v;
            troughBucket = b;
        }
    }
    const points = series.map((p) => {
        const value = metricValue(p, metric);
        const bucket = (0, periods_1.monthBucket)(p.period);
        const bMean = bucket && bucketMeans.has(bucket) ? bucketMeans.get(bucket) : null;
        const seasonalIndex = overall != null && overall !== 0 && bMean != null
            ? (0, stats_1.round)(bMean / overall, 4)
            : null;
        return {
            period: p.period,
            metric,
            value: value == null ? null : (0, stats_1.round)(value, 4),
            seasonalIndex,
            suppressed: p.suppressed || value == null,
        };
    });
    const amplitude = peakVal !== -Infinity && troughVal !== Infinity
        ? (0, stats_1.round)(peakVal - troughVal, 4)
        : null;
    return {
        plane,
        scope,
        metric,
        points,
        peakBucket,
        troughBucket,
        amplitude,
    };
}
