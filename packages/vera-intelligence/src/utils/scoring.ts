import type { RiskLevel, ScoreResult } from "../types";

export function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

export function riskLevelFromScore(score: number): RiskLevel {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 35) return "medium";
  return "low";
}

export function weightedScore(
  factors: { id: string; label: string; weight: number; value: number }[]
): ScoreResult {
  const totalWeight = factors.reduce((s, f) => s + f.weight, 0) || 1;
  let score = 0;
  const mapped = factors.map((f) => {
    const contribution = (f.value * f.weight) / totalWeight;
    score += contribution;
    return { id: f.id, label: f.label, weight: f.weight, contribution };
  });
  score = clamp(score);
  return {
    score,
    level: riskLevelFromScore(score),
    factors: mapped,
    confidence: Math.min(0.95, 0.5 + factors.length * 0.08),
  };
}

/** Exponential decay probability of event before horizon (e.g. expiry). */
export function predictBeforeHorizon(
  daysRemaining: number | undefined,
  horizonDays: number,
  baselineRisk = 0.15
): number {
  if (daysRemaining === undefined || daysRemaining < 0) return 0.95;
  if (daysRemaining > horizonDays * 2) return baselineRisk;
  const lambda = 1 / Math.max(horizonDays, 1);
  const p = 1 - Math.exp(-lambda * Math.max(0, horizonDays - daysRemaining));
  return clamp(p * 100, 0, 100) / 100;
}

export function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / (86400000));
}
