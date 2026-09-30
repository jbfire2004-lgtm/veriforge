"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forecastPredictiveRisk = forecastPredictiveRisk;
const stats_1 = require("./stats");
const periods_1 = require("./periods");
const series_1 = require("./series");
const trif_ltif_1 = require("./trif-ltif");
function projectSeries(values, steps) {
    const slope = (0, stats_1.linearSlope)(values) ?? 0;
    const last = values[values.length - 1] ?? 0;
    const sd = (0, stats_1.stddev)(values) ?? 0;
    const predicted = [];
    for (let i = 1; i <= steps; i++) {
        predicted.push(Math.max(0, last + slope * i));
    }
    // Confidence decays with horizon and volatility
    const base = values.length >= 6 ? 0.75 : values.length >= 3 ? 0.55 : 0.35;
    const volPenalty = (0, stats_1.clamp)(sd / ((0, stats_1.mean)(values) || 1), 0, 0.4);
    const confidence = (0, stats_1.round)((0, stats_1.clamp)(base - volPenalty - steps * 0.04), 3);
    return { predicted, confidence };
}
function forecastPredictiveRisk(plane, scope, series, horizon = "3m") {
    const trifLtif = (0, trif_ltif_1.analyzeTrifLtifTrend)(plane, scope, series);
    const usable = (0, series_1.filterUsable)(series);
    if (usable.length < 2) {
        return {
            plane,
            scope,
            horizon,
            history: trifLtif.points,
            forecast: [],
            drivers: [],
            suppressed: true,
        };
    }
    const trifs = (0, stats_1.finiteNumbers)(usable.map((p) => p.metrics.recordableRatePer200k));
    const ltifs = (0, stats_1.finiteNumbers)(usable.map((p) => p.metrics.lostTimeRatePer200k));
    const hecas = (0, stats_1.finiteNumbers)(usable.map((p) => p.metrics.hecaHighEnergyRate));
    const lastPeriod = usable[usable.length - 1].period;
    const kind = (0, periods_1.parsePeriod)(lastPeriod)?.kind ?? "month";
    const steps = (0, periods_1.horizonSteps)(horizon, kind);
    const trifProj = trifs.length >= 2 ? projectSeries(trifs, steps) : null;
    const ltifProj = ltifs.length >= 2 ? projectSeries(ltifs, steps) : null;
    const hecaProj = hecas.length >= 2 ? projectSeries(hecas, steps) : null;
    const forecast = [];
    let cursor = lastPeriod;
    for (let i = 0; i < steps; i++) {
        const nxt = (0, periods_1.nextPeriod)(cursor);
        if (!nxt)
            break;
        cursor = nxt;
        const predictedTrif = trifProj ? (0, stats_1.round)(trifProj.predicted[i], 4) : null;
        const predictedLtif = ltifProj ? (0, stats_1.round)(ltifProj.predicted[i], 4) : null;
        const predictedHecaHighEnergy = hecaProj
            ? (0, stats_1.round)(hecaProj.predicted[i], 4)
            : null;
        // Risk index 0–100: blend normalized rates (higher = more risk)
        const parts = [];
        if (predictedTrif != null)
            parts.push((0, stats_1.clamp)(predictedTrif / 5) * 100);
        if (predictedLtif != null)
            parts.push((0, stats_1.clamp)(predictedLtif / 2) * 100);
        if (predictedHecaHighEnergy != null)
            parts.push((0, stats_1.clamp)(predictedHecaHighEnergy) * 100);
        const riskIndex = parts.length > 0
            ? (0, stats_1.round)(parts.reduce((s, v) => s + v, 0) / parts.length, 1)
            : null;
        const confs = [
            trifProj?.confidence,
            ltifProj?.confidence,
            hecaProj?.confidence,
        ].filter((c) => c != null);
        forecast.push({
            period: cursor,
            predictedTrif,
            predictedLtif,
            predictedHecaHighEnergy,
            riskIndex,
            confidence: confs.length ? (0, stats_1.round)((0, stats_1.mean)(confs), 3) : null,
        });
    }
    const drivers = [];
    if (trifLtif.trifSlope != null && trifLtif.trifSlope > 0.02)
        drivers.push("rising_trif");
    if (trifLtif.ltifSlope != null && trifLtif.ltifSlope > 0.01)
        drivers.push("rising_ltif");
    const lastHeca = usable[usable.length - 1]?.metrics?.hecaHighEnergyRate;
    if (lastHeca != null && lastHeca > 0.15)
        drivers.push("elevated_heca");
    const lastCv = usable[usable.length - 1]?.metrics?.hecaControlsVerifiedRate;
    if (lastCv != null && lastCv < 0.7)
        drivers.push("weak_controls_verification");
    return {
        plane,
        scope,
        horizon,
        history: trifLtif.points,
        forecast,
        drivers,
        suppressed: false,
    };
}
