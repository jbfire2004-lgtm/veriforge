import type { CommandContextInput } from "../types";
import { ingestRealtimePhases } from "../integrations/phase-realtime";

export class RealtimeIntelligenceEngine {
  ingest(ctx: CommandContextInput) {
    const phases = ingestRealtimePhases(ctx);
    const anomalies: string[] = [];
    const hazards: string[] = [];
    const conflicts: string[] = [];
    const complianceFailures: string[] = [];
    const operationalFailures: string[] = [];

    if ((ctx.visionAnomalies ?? 0) > 0) {
      anomalies.push(`${ctx.visionAnomalies} vision anomalies detected`);
    }
    if ((ctx.documentFraud ?? 0) > 0) {
      anomalies.push(`${ctx.documentFraud} document fraud signals`);
    }

    for (const p of phases.safety.sif.precursors) {
      hazards.push(p.message);
    }
    for (const c of phases.safety.energyWheel.conflicts) {
      hazards.push(c);
    }

    conflicts.push(...phases.enterprise.conflicts.map((c) => c.resolution));
    conflicts.push(
      ...phases.scheduling.dispatch.conflicts.map((c) =>
        typeof c === "string" ? c : c.message
      )
    );

    if ((ctx.trainingExpiries ?? 0) > 0) {
      complianceFailures.push(`${ctx.trainingExpiries} training expiries`);
    }
    if ((ctx.competencyGaps ?? 0) > 0) {
      complianceFailures.push(`${ctx.competencyGaps} competency gaps`);
    }

    if ((ctx.dispatchConflicts ?? 0) > 0) {
      operationalFailures.push(`${ctx.dispatchConflicts} dispatch conflicts`);
    }
    if (phases.scheduling.workforce.shortages.length) {
      operationalFailures.push(...phases.scheduling.workforce.shortages.map((s) => s.message));
    }

    return {
      anomalies,
      hazards,
      conflicts,
      complianceFailures,
      operationalFailures,
      phases,
    };
  }
}
