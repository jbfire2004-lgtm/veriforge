export function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

export function weightedScore(weights: Record<string, number>, values: Record<string, number>): number {
  let total = 0;
  let w = 0;
  for (const [k, weight] of Object.entries(weights)) {
    total += (values[k] ?? 0) * weight;
    w += weight;
  }
  return clamp(Math.round(total / (w || 1)));
}

export function defaultGoals(): import("../types").EnterpriseGoals {
  return {
    safety: 95,
    compliance: 90,
    readiness: 85,
    productivity: 75,
    cost: 70,
  };
}
