"use strict";
/** Small numeric helpers for trend analytics */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mean = mean;
exports.stddev = stddev;
exports.linearSlope = linearSlope;
exports.pearson = pearson;
exports.clamp = clamp;
exports.round = round;
exports.finiteNumbers = finiteNumbers;
exports.directionFromSlope = directionFromSlope;
exports.correlationStrength = correlationStrength;
function mean(values) {
    if (!values.length)
        return null;
    return values.reduce((s, v) => s + v, 0) / values.length;
}
function stddev(values) {
    if (values.length < 2)
        return null;
    const m = mean(values);
    if (m == null)
        return null;
    const v = values.reduce((s, x) => s + (x - m) ** 2, 0) / (values.length - 1);
    return Math.sqrt(v);
}
/** Ordinary least-squares slope for y over index 0..n-1 */
function linearSlope(values) {
    const n = values.length;
    if (n < 2)
        return null;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;
    for (let i = 0; i < n; i++) {
        sumX += i;
        sumY += values[i];
        sumXY += i * values[i];
        sumXX += i * i;
    }
    const den = n * sumXX - sumX * sumX;
    if (den === 0)
        return null;
    return (n * sumXY - sumX * sumY) / den;
}
function pearson(xs, ys) {
    if (xs.length !== ys.length || xs.length < 3)
        return null;
    const mx = mean(xs);
    const my = mean(ys);
    if (mx == null || my == null)
        return null;
    let num = 0;
    let dx = 0;
    let dy = 0;
    for (let i = 0; i < xs.length; i++) {
        const a = xs[i] - mx;
        const b = ys[i] - my;
        num += a * b;
        dx += a * a;
        dy += b * b;
    }
    if (dx === 0 || dy === 0)
        return null;
    return num / Math.sqrt(dx * dy);
}
function clamp(n, min = 0, max = 1) {
    return Math.max(min, Math.min(max, n));
}
function round(n, digits = 4) {
    const p = 10 ** digits;
    return Math.round(n * p) / p;
}
function finiteNumbers(values) {
    return values.filter((v) => v != null && Number.isFinite(v));
}
/** For rates where lower is better */
function directionFromSlope(slope, opts = {}) {
    if (slope == null)
        return "insufficient";
    const eps = opts.epsilon ?? 0.01;
    const lowerIsBetter = opts.lowerIsBetter ?? true;
    if (Math.abs(slope) < eps)
        return "stable";
    const rising = slope > 0;
    if (lowerIsBetter)
        return rising ? "worsening" : "improving";
    return rising ? "improving" : "worsening";
}
function correlationStrength(r, n) {
    if (r == null || n < 3)
        return "insufficient";
    const a = Math.abs(r);
    if (a >= 0.7)
        return "strong";
    if (a >= 0.4)
        return "moderate";
    if (a >= 0.2)
        return "weak";
    return "none";
}
