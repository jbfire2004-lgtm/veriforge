import type {
  HecaAnalysis,
  SafetyContextInput,
  SafetyIntervention,
  SifAnalysis,
  EnergyWheelAnalysis,
  InterventionType,
} from "../types";

let interventionId = 0;

export class SafetyInterventionEngine {
  private interventions: SafetyIntervention[] = [];

  evaluate(
    ctx: SafetyContextInput,
    sif: SifAnalysis,
    heca: HecaAnalysis,
    energy: EnergyWheelAnalysis
  ): SafetyIntervention[] {
    this.interventions = [];

    for (const type of sif.interventions) {
      this.add(type, 95, "SIF prevention trigger", sif.riskScore.level);
    }

    if (heca.violations.length > 0) {
      this.add("require_jha_update", 88, "HECA deviation detected", "high");
    }

    if (energy.conflicts.length > 0) {
      this.add("notify_supervisor", 85, "Energy conflict detected", "high");
    }

    if ((ctx.inspectionFailures ?? 0) >= 2) {
      this.add("require_inspection", 90, "Repeated inspection failures", "high");
      if (ctx.equipmentId) this.add("lockout_equipment", 92, "Equipment lockout recommended", "critical");
    }

    if ((ctx.trainingGaps ?? 0) > 0) {
      this.add("require_training", 80, "Training gap identified", "medium");
    }

    if (sif.riskScore.level === "critical") {
      this.add("escalate_management", 99, "Critical SIF risk score", "critical");
    }

    if (ctx.workerId && heca.riskScore.level === "high") {
      this.add("restrict_worker", 87, "HECA high risk for worker", "high", "worker", ctx.workerId);
    }

    return this.prioritize();
  }

  getAll(): SafetyIntervention[] {
    return this.prioritize();
  }

  private add(
    type: InterventionType,
    priority: number,
    reason: string,
    severity: string,
    entityType?: string,
    entityId?: string
  ): void {
    const titles: Record<InterventionType, string> = {
      notify_supervisor: "Notify supervisor",
      lockout_equipment: "Lock out equipment",
      restrict_worker: "Restrict worker assignment",
      require_training: "Require training",
      require_inspection: "Require inspection",
      require_jha_update: "Update JHA/FLHA",
      escalate_management: "Escalate to management",
    };
    this.interventions.push({
      id: `int_${++interventionId}`,
      type,
      priority,
      title: titles[type],
      reason,
      entityType,
      entityId,
      triggeredAt: new Date().toISOString(),
    });
  }

  private prioritize(): SafetyIntervention[] {
    return [...this.interventions].sort((a, b) => b.priority - a.priority);
  }
}
