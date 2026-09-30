/** Small numeric helpers for trend analytics */

export function mean(values: number[]): number | null {
  if (!values.length) return null;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

export function stddev(values: number[]): number | null {
  if (values.length < 2) return null;
  const m = mean(values);
  if (m == null) return null;
  const v = values.reduce((s, x) => s + (x - m) ** 2, 0) / (values.length - 1);
  return Math.sqrt(v);
}

/** Ordinary least-squares slope for y over index 0..n-1 */
export function linearSlope(values: number[]): number | null {
  const n = values.length;
  if (n < 2) return null;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i]!;
    sumXY += i * values[i]!;
    sumXX += i * i;
  }
  const den = n * sumXX - sumX * sumX;
  if (den === 0) return null;
  return (n * sumXY - sumX * sumY) / den;
}

export function pearson(xs: number[], ys: number[]): number | null {
  if (xs.length !== ys.length || xs.length < 3) return null;
  const mx = mean(xs);
  const my = mean(ys);
  if (mx == null || my == null) return null;
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < xs.length; i++) {
    const a = xs[i]! - mx;
    const b = ys[i]! - my;
    num += a * b;
    dx += a * a;
    dy += b * b;
  }
  if (dx === 0 || dy === 0) return null;
  return num / Math.sqrt(dx * dy);
}

export function clamp(n: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, n));
}

export function round(n: number, digits = 4): number {
  const p = 10 ** digits;
  return Math.round(n * p) / p;
}

export function finiteNumbers(values: Array<number | null | undefined>): number[] {
  return values.filter((v): v is number => v != null && Number.isFinite(v));
}

export type Direction = "improving" | "worsening" | "stable" | "insufficient";

/** For rates where lower is better */
export function directionFromSlope(
  slope: number | null,
  opts: { lowerIsBetter?: boolean; epsilon?: number } = {},
): Direction {
  if (slope == null) return "insufficient";
  const eps = opts.epsilon ?? 0.01;
  const lowerIsBetter = opts.lowerIsBetter ?? true;
  if (Math.abs(slope) < eps) return "stable";
  const rising = slope > 0;
  if (lowerIsBetter) return rising ? "worsening" : "improving";
  return rising ? "improving" : "worsening";
}

export function correlationStrength(
  r: number | null,
  n: number,
): "strong" | "moderate" | "weak" | "none" | "insufficient" {
  if (r == null || n < 3) return "insufficient";
  const a = Math.abs(r);
  if (a >= 0.7) return "strong";
  if (a >= 0.4) return "moderate";
  if (a >= 0.2) return "weak";
  return "none";
}
