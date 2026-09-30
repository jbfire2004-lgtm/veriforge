import type { IndustryContextInput, IndustryReadiness } from "../types";
import { clamp } from "../utils/scoring";

export class IndustryReadinessEngine {
  assess(ctx: IndustryContextInput): IndustryReadiness {
    const p = ctx.participants ?? [];
    const workers = p.reduce((s, x) => s + (x.workerCount ?? 0), 0);
    const gaps = p.reduce((s, x) => s + (x.nonCompliantWorkers ?? 0), 0);
    const equipment = p.reduce((s, x) => s + (x.equipmentCount ?? 0), 0);
    const failures = p.reduce((s, x) => s + (x.inspectionFailures ?? 0), 0);
    const expiring = p.reduce((s, x) => s + (x.expiringTraining ?? 0), 0);
    const dispatch = p.reduce((s, x) => s + (x.dispatchConflicts ?? 0), 0);

    const workforceScore = clamp(workers > 0 ? 100 - (gaps / workers) * 100 : 80);
    const equipmentScore = clamp(equipment > 0 ? 100 - (failures / equipment) * 200 : 85);
    const projectScore = clamp(100 - p.reduce((s, x) => s + (x.schedulingShortages ?? 0), 0) * 5);
    const trainingScore = clamp(100 - expiring * 2);
    const complianceScore = ctx.networkSafetyScore ?? workforceScore;
    const dispatchScore = clamp(100 - dispatch * 8);

    const dimensions = [
      { dimension: "Workforce", score: workforceScore, trend: gaps > 10 ? "down" as const : "stable" as const },
      { dimension: "Equipment", score: equipmentScore, trend: failures > 5 ? "down" as const : "stable" as const },
      { dimension: "Projects", score: projectScore, trend: "stable" as const },
      { dimension: "Training", score: trainingScore, trend: expiring > 15 ? "down" as const : "up" as const },
      { dimension: "Compliance", score: complianceScore, trend: "stable" as const },
      { dimension: "Dispatch", score: dispatchScore, trend: dispatch > 2 ? "down" as const : "stable" as const },
    ];

    const industryReadinessScore = clamp(
      dimensions.reduce((s, d) => s + d.score, 0) / dimensions.length
    );

    return {
      industryReadinessScore,
      dimensions,
      predictions: [
        { label: "Readiness dip", probability: industryReadinessScore < 70 ? 0.65 : 0.2, horizon: "30d" },
      ],
      recommendations: [
        industryReadinessScore < 75 ? "Industry readiness recovery plan" : "Sustain cross-company readiness",
      ],
    };
  }
}
