import type { PillarId } from "./types";

export const PILLAR_FORMULAS: Record<
  PillarId,
  { formulaId: string; formula: string }
> = {
  program_completeness: {
    formulaId: "css.program_completeness.v1",
    formula: "docScore×0.70 + meetingScore×0.30",
  },
  performance: {
    formulaId: "css.performance.v1",
    formula: "incidentScore×0.75 + nearMissScore×0.25",
  },
  responsiveness: {
    formulaId: "css.responsiveness.v1",
    formula: "clamp(closureScore − overduePenalty + verificationBonus, 0, 100)",
  },
  training_competency: {
    formulaId: "css.training_competency.v1",
    formula: "workers_fully_compliant / workers_on_prime_sites × 100",
  },
  audit_inspection: {
    formulaId: "css.audit_inspection.v1",
    formula: "findingBurdenScore×0.60 + closeoutScore×0.40",
  },
};

export function gradeFromScore(score: number): "A" | "B" | "C" | "D" {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  return "D";
}

export function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

export function round1(n: number) {
  return Math.round(n * 10) / 10;
}
