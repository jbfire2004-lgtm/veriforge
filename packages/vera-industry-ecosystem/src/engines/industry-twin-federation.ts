import type { IndustryContextInput, IndustryTwinSignal } from "../types";

export class IndustryTwinFederationEngine {
  federate(ctx: IndustryContextInput): IndustryTwinSignal[] {
    const p = ctx.participants ?? [];
    const avgRisk = p.length
      ? p.reduce(
          (s, x) =>
            s + (x.sifForms ?? 0) * 10 + (x.inspectionFailures ?? 0) * 5 + (x.nonCompliantWorkers ?? 0) * 2,
          0
        ) / p.length
      : 25;

    return [
      { twinType: "worker", signal: "Industry readiness envelope", strength: Math.min(1, avgRisk / 80), anonymized: true },
      { twinType: "equipment", signal: "Fleet reliability federation", strength: Math.min(1, p.reduce((s, x) => s + (x.inspectionFailures ?? 0), 0) / Math.max(1, p.length * 4)), anonymized: true },
      { twinType: "project", signal: "Cross-contractor staffing pressure", strength: 0.5, anonymized: true },
      { twinType: "company", signal: "Non-sensitive compliance envelope", strength: Math.min(1, (ctx.networkRiskScore ?? avgRisk) / 100), anonymized: true },
      { twinType: "provider", signal: "Training capacity federation", strength: 0.6, anonymized: true },
      { twinType: "unionHall", signal: "Dispatch readiness federation", strength: Math.min(1, p.reduce((s, x) => s + (x.dispatchConflicts ?? 0), 0) / Math.max(1, p.length * 2)), anonymized: true },
    ];
  }
}
