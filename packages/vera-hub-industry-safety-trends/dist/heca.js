"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeHecaTrend = analyzeHecaTrend;
const stats_1 = require("./stats");
const series_1 = require("./series");
function analyzeHecaTrend(plane, scope, series) {
    const points = series.map((p) => ({
        period: p.period,
        highEnergyRate: p.suppressed || p.metrics?.hecaHighEnergyRate == null
            ? null
            : (0, stats_1.round)(p.metrics.hecaHighEnergyRate, 4),
        controlsVerifiedRate: p.suppressed || p.metrics?.hecaControlsVerifiedRate == null
            ? null
            : (0, stats_1.round)(p.metrics.hecaControlsVerifiedRate, 4),
        suppressed: p.suppressed || p.metrics == null,
    }));
    const usable = (0, series_1.filterUsable)(series);
    const heRates = (0, stats_1.finiteNumbers)(usable.map((p) => p.metrics.hecaHighEnergyRate));
    const cvRates = (0, stats_1.finiteNumbers)(usable.map((p) => p.metrics.hecaControlsVerifiedRate));
    const slopeHighEnergy = (0, stats_1.linearSlope)(heRates);
    const slopeControlsVerified = (0, stats_1.linearSlope)(cvRates);
    const heDir = (0, stats_1.directionFromSlope)(slopeHighEnergy, { lowerIsBetter: true });
    const cvDir = (0, stats_1.directionFromSlope)(slopeControlsVerified, {
        lowerIsBetter: false,
    });
    let direction = "insufficient";
    if (heDir !== "insufficient" || cvDir !== "insufficient") {
        if (heDir === "worsening" || cvDir === "worsening")
            direction = "worsening";
        else if (heDir === "improving" || cvDir === "improving")
            direction = "improving";
        else
            direction = "stable";
    }
    return {
        plane,
        scope,
        points,
        slopeHighEnergy: slopeHighEnergy == null ? null : (0, stats_1.round)(slopeHighEnergy, 6),
        slopeControlsVerified: slopeControlsVerified == null ? null : (0, stats_1.round)(slopeControlsVerified, 6),
        direction,
    };
}
