import type { ScoreSnapshot } from "../types";

export function scoreFromFactors(factors: { weight: number; value: number }[]): ScoreSnapshot {
  const total = factors.reduce((s, f) => s + f.weight, 0) || 1;
  const score = Math.round(
    factors.reduce((s, f) => s + (f.value * f.weight) / total, 0)
  );
  const clamped = Math.max(0, Math.min(100, score));
  return {
    score: clamped,
    level: levelFromScore(clamped),
    updatedAt: new Date().toISOString(),
  };
}

export function readinessFromRisk(riskScore: number): ScoreSnapshot {
  const score = 100 - riskScore;
  return { score, level: levelFromScore(score), updatedAt: new Date().toISOString() };
}

export function levelFromScore(score: number): ScoreSnapshot["level"] {
  if (score >= 80) return "low";
  if (score >= 60) return "medium";
  if (score >= 35) return "high";
  return "critical";
}
