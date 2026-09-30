import type { IndustryContextInput, IndustryCoordination } from "../types";

let actionId = 0;

export class IndustryCoordinationEngine {
  coordinate(ctx: IndustryContextInput): IndustryCoordination {
    const participants = ctx.participants ?? [];
    const regions = new Map<string, { workers: number; gaps: number }>();

    for (const p of participants) {
      const cur = regions.get(p.region) ?? { workers: 0, gaps: 0 };
      cur.workers += p.workerCount ?? 0;
      cur.gaps += p.nonCompliantWorkers ?? 0;
      regions.set(p.region, cur);
    }

    const workforceSharing: string[] = [];
    const surplus = [...regions.entries()].filter(([, d]) => d.workers > 20 && d.gaps < 3);
    const deficit = [...regions.entries()].filter(([, d]) => d.gaps > 5);
    for (const [, s] of surplus.slice(0, 2)) {
      for (const [r] of deficit.slice(0, 2)) {
        workforceSharing.push(`Federated workforce pool: surplus → ${r} (anonymized)`);
      }
    }

    const actions = [
      this.action("workforce", "Coordinate anonymized availability pools", workforceSharing.length ? "high" : "medium"),
      this.action("equipment", "Share equipment utilization patterns across contractors", "medium"),
      this.action("dispatch", "Align union hall dispatch windows network-wide", participants.some((p) => (p.dispatchConflicts ?? 0) > 0) ? "high" : "low"),
      this.action("training", "Synchronize provider capacity with expiry clusters", "medium"),
      this.action("safety", "Broadcast hazard cluster controls to participating companies", participants.some((p) => (p.sifForms ?? 0) > 0) ? "critical" : "low"),
      this.action("compliance", "Federated compliance recalc across industries", "medium"),
    ];

    return {
      actions,
      workforceSharing,
      equipmentSharing: ["Share idle heavy-equipment windows across regions"],
      dispatchCoordination: deficit.map(([r]) => `Union hall surge coordination in ${r}`),
      trainingCoordination: ["Cross-provider seat allocation for expiring certifications"],
      safetyCoordination: ["Industry-wide SIF precursor watchlist (anonymized)"],
      complianceCoordination: ["Regional compliance harmonization playbook"],
    };
  }

  private action(
    domain: string,
    action: string,
    priority: IndustryCoordination["actions"][0]["priority"]
  ) {
    actionId += 1;
    return { id: `coord-${actionId}`, domain, action, priority, anonymized: true };
  }
}
