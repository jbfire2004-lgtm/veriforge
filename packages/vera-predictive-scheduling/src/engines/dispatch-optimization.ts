import type { DispatchOptimization, SchedulingContextInput } from "../types";
import { schedulingScore } from "../utils/scoring";

export class DispatchOptimizationEngine {
  analyze(ctx: SchedulingContextInput): DispatchOptimization {
    const dispatches = ctx.dispatches ?? [];
    const workers = new Map((ctx.workers ?? []).map((w) => [w.id, w]));
    const projects = ctx.projects ?? [];

    const active = dispatches.filter((d) => !d.recalledAt);
    const conflicts: DispatchOptimization["conflicts"] = [];
    const workerDispatchCount = new Map<string, number>();

    for (const d of active) {
      workerDispatchCount.set(d.workerId, (workerDispatchCount.get(d.workerId) ?? 0) + 1);
    }
    for (const [workerId, count] of workerDispatchCount) {
      if (count > 1) {
        conflicts.push({
          code: "DOUBLE_DISPATCH",
          message: `Worker ${workerId} has ${count} active dispatches`,
        });
      }
    }

    const shortages: string[] = [];
    for (const p of projects) {
      const gap = (p.requiredWorkers ?? 0) - (p.assignedWorkers ?? 0);
      if (gap > 0) shortages.push(`Dispatch pool needed for project ${p.name}: ${gap} workers`);
    }

    const optimizedOrder = active
      .map((d) => {
        const w = workers.get(d.workerId);
        let priority = 50;
        if (w?.isCompliant) priority += 20;
        if (w?.dispatchStatus === "available") priority += 15;
        priority -= (w?.riskScore ?? 0) * 0.2;
        priority -= (w?.safetyRiskScore ?? 0) * 0.15;
        return { dispatchId: d.id, priority: Math.round(priority) };
      })
      .sort((a, b) => b.priority - a.priority);

    const readinessScores = active.map((d) => {
      const w = workers.get(d.workerId);
      const score = schedulingScore([
        { weight: 50, value: w?.isCompliant ? 20 : 80 },
        { weight: 50, value: 100 - (w?.readinessScore ?? 50) },
      ]);
      return { workerId: d.workerId, score: 100 - score.score };
    });

    const recommendations: string[] = [];
    if (conflicts.length) recommendations.push("Resolve double-dispatch conflicts before new assignments");
    if (shortages.length) recommendations.push("Prioritize union hall dispatches to understaffed projects");

    return {
      optimizedOrder,
      conflicts,
      shortages,
      readinessScores,
      recommendations,
    };
  }
}
