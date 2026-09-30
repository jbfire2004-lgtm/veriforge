import type { ScoreResult } from "../types";
import { weightedScore } from "../utils/scoring";

export class RiskEngine {
  score(factors: { id: string; label: string; weight: number; value: number }[]): ScoreResult {
    return weightedScore(factors);
  }

  readinessScore(inputs: {
    compliant: boolean;
    gaps: number;
    expiringSoon: boolean;
    failures: number;
  }): ScoreResult {
    return weightedScore([
      { id: "compliant", label: "Compliant", weight: 40, value: inputs.compliant ? 0 : 80 },
      { id: "gaps", label: "Gaps", weight: 25, value: Math.min(100, inputs.gaps * 20) },
      { id: "expiring", label: "Expiring soon", weight: 20, value: inputs.expiringSoon ? 60 : 0 },
      { id: "failures", label: "Recent failures", weight: 15, value: Math.min(100, inputs.failures * 25) },
    ]);
  }

  /** Invert risk to readiness (100 = ready). */
  toReadiness(risk: ScoreResult): ScoreResult {
    const score = 100 - risk.score;
    return {
      ...risk,
      score,
      level: score >= 80 ? "low" : score >= 60 ? "medium" : score >= 35 ? "high" : "critical",
    };
  }
}
