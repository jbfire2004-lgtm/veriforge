import type { SchedulingContextInput } from "../types";

export class AbsencePredictionEngine {
  predict(ctx: SchedulingContextInput): { workerId: string; probability: number; horizonDays: number }[] {
    const horizon = ctx.horizonDays ?? 14;
    return (ctx.workers ?? []).map((w) => {
      let probability = w.absenceRisk ?? 0.08;
      if (!w.isCompliant) probability += 0.12;
      if ((w.expiringTraining ?? 0) > 0) probability += 0.05;
      if ((w.hoursThisWeek ?? 0) > 50) probability += 0.1;
      return {
        workerId: w.id,
        probability: Math.min(0.95, probability),
        horizonDays: horizon,
      };
    });
  }
}
