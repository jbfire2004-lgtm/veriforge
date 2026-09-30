/**
 * Shared stats for AI detectors.
 */

import type { SeriesPoint } from "./types";

export function mean(vals: number[]): number {
  if (!vals.length) return 0;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function stdev(vals: number[]): number {
  if (vals.length < 2) return 0;
  const m = mean(vals);
  const v = vals.reduce((s, x) => s + (x - m) ** 2, 0) / (vals.length - 1);
  return Math.sqrt(v);
}

export function slope(points: SeriesPoint[]): number {
  const n = points.length;
  if (n < 2) return 0;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += points[i]!.value;
    sumXY += i * points[i]!.value;
    sumXX += i * i;
  }
  const den = n * sumXX - sumX * sumX;
  if (den === 0) return 0;
  return (n * sumXY - sumX * sumY) / den;
}

export function pearson(xs: number[], ys: number[]): number {
  const n = Math.min(xs.length, ys.length);
  if (n < 3) return 0;
  const mx = mean(xs.slice(0, n));
  const my = mean(ys.slice(0, n));
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < n; i++) {
    const a = xs[i]! - mx;
    const b = ys[i]! - my;
    num += a * b;
    dx += a * a;
    dy += b * b;
  }
  if (dx === 0 || dy === 0) return 0;
  return num / Math.sqrt(dx * dy);
}

export function round(n: number, d = 2): number {
  const p = 10 ** d;
  return Math.round(n * p) / p;
}
