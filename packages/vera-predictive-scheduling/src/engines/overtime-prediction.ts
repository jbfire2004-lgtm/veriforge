import type { SchedulingContextInput } from "../types";

export class OvertimePredictionEngine {
  predict(ctx: SchedulingContextInput): { workerId: string; probability: number }[] {
    const projects = ctx.projects ?? [];
    const understaffed = projects.some(
      (p) => (p.requiredWorkers ?? 0) > (p.assignedWorkers ?? 0)
    );

    return (ctx.workers ?? []).map((w) => {
      let probability = 0.1;
      const hours = w.hoursThisWeek ?? 0;
      if (hours > 40) probability += 0.35;
      else if (hours > 32) probability += 0.15;
      if (understaffed && w.dispatchStatus === "available") probability += 0.2;
      if (w.dispatchStatus === "dispatched") probability += 0.1;
      return { workerId: w.id, probability: Math.min(0.99, probability) };
    });
  }
}
