import type { CommandAlert, CommandContextInput, RiskAssessment } from "../types";

let alertId = 0;

export class CommandAlertingEngine {
  generate(
    ctx: CommandContextInput,
    risks: RiskAssessment[],
    intelligence: {
      hazards: string[];
      complianceFailures: string[];
      operationalFailures: string[];
    }
  ): CommandAlert[] {
    const alerts: CommandAlert[] = [];
    const now = new Date().toISOString();

    const push = (
      severity: CommandAlert["severity"],
      type: CommandAlert["type"],
      title: string,
      message: string,
      entityType?: string,
      entityId?: string
    ) => {
      alertId += 1;
      alerts.push({
        id: `alert-${alertId}`,
        severity,
        type,
        title,
        message,
        entityType,
        entityId,
        at: now,
      });
    };

    if ((ctx.sifPrecursors ?? 0) > 0) {
      push("critical", "safety", "SIF precursor alert", `${ctx.sifPrecursors} SIF precursor(s) active`);
    }
    if ((ctx.hecaDeviations ?? 0) > 0) {
      push("high", "safety", "HECA deviation", `${ctx.hecaDeviations} HECA deviation(s)`);
    }
    if ((ctx.energyConflicts ?? 0) > 0) {
      push("high", "safety", "Energy Wheel conflict", `${ctx.energyConflicts} energy conflict(s)`);
    }

    for (const h of intelligence.hazards.slice(0, 3)) {
      push("medium", "safety", "Hazard detected", h);
    }

    for (const c of intelligence.complianceFailures) {
      push("high", "compliance", "Compliance failure", c);
    }

    for (const o of intelligence.operationalFailures.slice(0, 3)) {
      push("medium", "operations", "Operational issue", o);
    }

    if ((ctx.dispatchConflicts ?? 0) > 0) {
      push("high", "dispatch", "Dispatch conflict", `${ctx.dispatchConflicts} conflict(s)`);
    }

    if ((ctx.trainingExpiries ?? 0) > 0) {
      push("medium", "training", "Training expiry", `${ctx.trainingExpiries} expiring soon`);
    }

    if ((ctx.documentFraud ?? 0) > 0) {
      push("critical", "document", "Document fraud", `${ctx.documentFraud} flagged document(s)`);
    }

    for (const r of risks.filter((x) => x.score.level === "critical").slice(0, 5)) {
      push("critical", "safety", `${r.entityType} critical risk`, r.factors.join(", "), r.entityType, r.entityId);
    }

    return alerts.sort((a, b) => severityRank(b.severity) - severityRank(a.severity));
  }
}

function severityRank(s: CommandAlert["severity"]): number {
  return { critical: 4, high: 3, medium: 2, low: 1 }[s];
}
