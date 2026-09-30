import type { BrainContextInput, ContextSnapshot } from "../types";
import type { ingestAllPhases } from "../integrations/phase-integration";

export class EnterpriseContextEngine {
  snapshot(ctx: BrainContextInput, phases: ReturnType<typeof ingestAllPhases>): ContextSnapshot {
    return {
      enterprise: {
        companyId: ctx.companyId,
        workers: ctx.workerCount,
        equipment: ctx.equipmentCount,
        projects: ctx.projectCount,
        health: phases.command.dashboard,
      },
      safety: {
        sifPrecursors: ctx.sifPrecursors,
        hazards: phases.command.intelligence.hazards.length,
        alerts: phases.command.dashboard.safety,
      },
      operations: {
        automation: phases.command.automation,
        conflicts: phases.enterprise.conflicts.length,
      },
      compliance: {
        gaps: ctx.nonCompliantWorkers,
        expiring: ctx.expiringTraining,
        rate: phases.command.dashboard.compliance.rate,
      },
      workforce: {
        shortages: ctx.schedulingShortages,
        readiness: phases.command.dashboard.readiness,
      },
      equipment: {
        lockouts: phases.command.dashboard.equipment.lockouts,
        inspectionFailures: ctx.inspectionFailures,
      },
    };
  }
}
