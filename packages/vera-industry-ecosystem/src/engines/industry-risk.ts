import type { IndustryContextInput, IndustryRisk } from "../types";
import { clamp } from "../utils/scoring";

export class IndustryRiskEngine {
  assess(ctx: IndustryContextInput): IndustryRisk {
    const p = ctx.participants ?? [];
    const sif = p.reduce((s, x) => s + (x.sifForms ?? 0), 0);
    const heca = p.reduce((s, x) => s + (x.hecaForms ?? 0), 0);
    const energy = p.reduce((s, x) => s + (x.energyWheelForms ?? 0), 0);
    const complianceGaps = p.reduce((s, x) => s + (x.nonCompliantWorkers ?? 0), 0);
    const workers = p.reduce((s, x) => s + (x.workerCount ?? 0), 0);
    const ops = p.reduce((s, x) => s + (x.inspectionFailures ?? 0) + (x.schedulingShortages ?? 0), 0);

    const industryScore = clamp(
      sif * 5 + heca * 4 + energy * 3 + complianceGaps * 2 + ops
    );
    const sifRisk = clamp(sif * 8);
    const hecaRisk = clamp(heca * 7);
    const energyWheelRisk = clamp(energy * 6);
    const complianceRisk = clamp(workers > 0 ? (complianceGaps / workers) * 120 : 0);
    const operationalRisk = clamp(ops * 3);

    const regionMap = new Map<string, number>();
    for (const x of p) {
      regionMap.set(x.region, (regionMap.get(x.region) ?? 0) + (x.sifForms ?? 0) * 10 + (x.inspectionFailures ?? 0) * 5);
    }

    return {
      industryScore,
      sifRisk,
      hecaRisk,
      energyWheelRisk,
      complianceRisk,
      operationalRisk,
      riskMap: [...regionMap.entries()].map(([region, score]) => ({
        region,
        score: clamp(score),
        hazards: score > 40 ? ["Elevated SIF/inspection pressure"] : ["Baseline"],
      })),
      predictions: [
        { label: "Industry risk escalation", probability: industryScore / 100, horizon: "14d" },
      ],
      recommendations: [
        industryScore > 60 ? "Industry-wide risk review required" : "Monitor federated risk envelope",
        "Share anonymized control libraries across participants",
      ],
    };
  }
}
