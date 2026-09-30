import type { ReadinessLevel, SchedulingScore } from "../types";

export function schedulingScore(
  factors: { weight: number; value: number }[]
): SchedulingScore {
  const totalWeight = factors.reduce((s, f) => s + f.weight, 0) || 1;
  const score = Math.round(
    factors.reduce((s, f) => s + (f.value * f.weight) / totalWeight, 0)
  );
  const clamped = Math.max(0, Math.min(100, score));
  return {
    score: clamped,
    level: levelFromScore(clamped),
    updatedAt: new Date().toISOString(),
  };
}

export function levelFromScore(score: number): ReadinessLevel {
  if (score >= 75) return "critical";
  if (score >= 50) return "high";
  if (score >= 25) return "medium";
  return "low";
}

export function invertReadiness(score: number): number {
  return Math.max(0, Math.min(100, 100 - score));
}

export function matchScore(
  workerSkills: string[] | undefined,
  required: string[] | undefined
): number {
  if (!required?.length) return 80;
  if (!workerSkills?.length) return 40;
  const hits = required.filter((r) =>
    workerSkills.some((s) => s.toLowerCase().includes(r.toLowerCase()))
  );
  return Math.round((hits.length / required.length) * 100);
}
