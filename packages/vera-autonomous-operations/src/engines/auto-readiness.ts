import type { AutoReadinessResult, OperationsContextInput } from "../types";
import { createAction, readinessLevel } from "../utils/actions";

export class AutoReadinessEngine {
  run(ctx: OperationsContextInput): AutoReadinessResult {
    const projects = ctx.projects ?? [];
    const workers = ctx.workers ?? [];
    const equipment = ctx.equipment ?? [];
    const readinessByProject: AutoReadinessResult["readinessByProject"] = [];
    const failures: string[] = [];
    const recommendations: string[] = [];
    const correctiveActions: AutoReadinessResult["correctiveActions"] = [];

    for (const p of projects) {
      const wRatio =
        (p.requiredWorkers ?? 1) > 0
          ? (p.assignedWorkers ?? 0) / (p.requiredWorkers ?? 1)
          : 1;
      const eRatio =
        (p.requiredEquipment ?? 1) > 0
          ? (p.assignedEquipment ?? 0) / (p.requiredEquipment ?? 1)
          : 1;
      const score = Math.round(
        ((p.readinessScore ?? 70) * 0.4 + wRatio * 30 + eRatio * 30) 
      );
      const level = readinessLevel(score);
      readinessByProject.push({ projectId: p.id, score, level });

      if (level === "not_ready" || level === "at_risk") {
        failures.push(`${p.name}: readiness ${level} (${score})`);
        if (wRatio < 1) {
          correctiveActions.push(
            createAction({
              type: "readiness.correct",
              title: `Staff ${p.name}`,
              reason: "Worker shortage",
              entityType: "project",
              entityId: p.id,
              overrideable: true,
              rollbackable: true,
            })
          );
          recommendations.push(`Assign additional workers to ${p.name}`);
        }
        if (eRatio < 1) {
          correctiveActions.push(
            createAction({
              type: "readiness.correct",
              title: `Equip ${p.name}`,
              reason: "Equipment shortage",
              entityType: "project",
              entityId: p.id,
              overrideable: true,
              rollbackable: true,
            })
          );
        }
        const nonCompliant = workers.filter((w) => !w.isCompliant).length;
        if (nonCompliant > 0) {
          correctiveActions.push(
            createAction({
              type: "readiness.trigger_training",
              title: `Training for ${p.name}`,
              reason: `${nonCompliant} workers non-compliant`,
              entityType: "project",
              entityId: p.id,
              overrideable: true,
              rollbackable: false,
            })
          );
        }
        const failedInsp = equipment.filter((e) => e.inspectionPassed === false).length;
        if (failedInsp > 0) {
          correctiveActions.push(
            createAction({
              type: "readiness.trigger_inspection",
              title: `Inspections for ${p.name}`,
              reason: `${failedInsp} equipment failed inspection`,
              entityType: "project",
              entityId: p.id,
              overrideable: true,
              rollbackable: false,
            })
          );
        }
      }
    }

    return { readinessByProject, failures, recommendations, correctiveActions };
  }
}
