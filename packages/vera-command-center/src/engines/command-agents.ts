import type { AgentInsight, CommandContextInput } from "../types";
import type { ingestRealtimePhases } from "../integrations/phase-realtime";

export class CommandAgentsEngine {
  run(
    ctx: CommandContextInput,
    phases: ReturnType<typeof ingestRealtimePhases>
  ): AgentInsight[] {
    return [
      {
        agent: "Safety Agent",
        summary: `${phases.safety.sif.precursors.length} SIF precursors, ${phases.safety.heca.deviations.length} HECA deviations`,
        actions: phases.safety.automation.alerts.slice(0, 3),
        confidence: 0.85,
      },
      {
        agent: "Operations Agent",
        summary: `${phases.enterprise.operations.actions.length} operational actions recommended`,
        actions: phases.enterprise.operations.actions.slice(0, 2).map((d) => d.title),
        confidence: 0.8,
      },
      {
        agent: "Compliance Agent",
        summary: `${ctx.trainingExpiries ?? 0} training expiries, ${ctx.competencyGaps ?? 0} competency gaps`,
        actions: phases.enterprise.compliance.insights,
        confidence: 0.78,
      },
      {
        agent: "Workforce Agent",
        summary: `${phases.scheduling.workforce.shortages.length} staffing shortages forecast`,
        actions: phases.scheduling.automation.scheduleDrafts.slice(0, 2),
        confidence: 0.75,
      },
      {
        agent: "Equipment Agent",
        summary: `${ctx.inspectionFailures ?? 0} inspection issues, lockouts active`,
        actions: ["Review maintenance queue", "Verify lockout status"],
        confidence: 0.82,
      },
      {
        agent: "Document Agent",
        summary: `${ctx.documentFraud ?? 0} fraud signals, ${ctx.visionAnomalies ?? 0} vision anomalies`,
        actions: ["Process document queue"],
        confidence: 0.7,
      },
      {
        agent: "Automation Agent",
        summary: `${phases.enterprise.execution.executed.length} actions executed this cycle`,
        actions: phases.enterprise.execution.log.slice(0, 3).map((a) => a.title),
        confidence: 0.9,
      },
    ];
  }
}
