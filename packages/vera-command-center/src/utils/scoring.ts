import type { ScoreSnapshot } from "../types";

export function computeScore(
  factors: { weight: number; value: number }[]
): ScoreSnapshot {
  const total = factors.reduce((s, f) => s + f.weight, 0) || 1;
  const score = Math.round(
    factors.reduce((s, f) => s + (f.value * f.weight) / total, 0)
  );
  const clamped = Math.max(0, Math.min(100, score));
  return {
    score: clamped,
    level: levelFromScore(clamped),
    trend: "stable",
    updatedAt: new Date().toISOString(),
  };
}

export function levelFromScore(score: number): ScoreSnapshot["level"] {
  if (score >= 75) return "critical";
  if (score >= 50) return "high";
  if (score >= 25) return "medium";
  return "low";
}

export function readinessFromRisk(riskScore: number): number {
  return Math.max(0, Math.min(100, 100 - riskScore));
}
