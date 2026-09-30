"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeTrifLtifTrend = analyzeTrifLtifTrend;
const stats_1 = require("./stats");
const series_1 = require("./series");
function analyzeTrifLtifTrend(plane, scope, series) {
    const points = series.map((p) => ({
        period: p.period,
        trif: p.suppressed || p.metrics?.recordableRatePer200k == null
            ? null
            : (0, stats_1.round)(p.metrics.recordableRatePer200k, 4),
        ltif: p.suppressed || p.metrics?.lostTimeRatePer200k == null
            ? null
            : (0, stats_1.round)(p.metrics.lostTimeRatePer200k, 4),
        incidentRatePer200k: p.suppressed || p.metrics?.incidentRatePer200k == null
            ? null
            : (0, stats_1.round)(p.metrics.incidentRatePer200k, 4),
        suppressed: p.suppressed || p.metrics == null,
    }));
    const usable = (0, series_1.filterUsable)(series);
    const trifs = (0, stats_1.finiteNumbers)(usable.map((p) => p.metrics.recordableRatePer200k));
    const ltifs = (0, stats_1.finiteNumbers)(usable.map((p) => p.metrics.lostTimeRatePer200k));
    const trifSlope = (0, stats_1.linearSlope)(trifs);
    const ltifSlope = (0, stats_1.linearSlope)(ltifs);
    const tDir = (0, stats_1.directionFromSlope)(trifSlope, { lowerIsBetter: true });
    const lDir = (0, stats_1.directionFromSlope)(ltifSlope, { lowerIsBetter: true });
    let direction = "insufficient";
    if (tDir !== "insufficient" || lDir !== "insufficient") {
        if (tDir === "worsening" || lDir === "worsening")
            direction = "worsening";
        else if (tDir === "improving" || lDir === "improving")
            direction = "improving";
        else
            direction = "stable";
    }
    return {
        plane,
        scope,
        points,
        trifSlope: trifSlope == null ? null : (0, stats_1.round)(trifSlope, 6),
        ltifSlope: ltifSlope == null ? null : (0, stats_1.round)(ltifSlope, 6),
        direction,
    };
}
