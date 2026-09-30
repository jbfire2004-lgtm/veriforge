import type { ConflictResolutionResult, OperationsContextInput } from "../types";
import { createAction, rankWorkerForDispatch } from "../utils/actions";

export class AutoConflictResolutionEngine {
  run(
    ctx: OperationsContextInput,
    assignmentConflicts: string[],
    dispatchConflicts: string[]
  ): ConflictResolutionResult {
    const resolutions: ConflictResolutionResult["resolutions"] = [];
    const unresolved: string[] = [];
    const workers = ctx.workers ?? [];
    const equipment = ctx.equipment ?? [];

    for (const msg of [...assignmentConflicts, ...dispatchConflicts]) {
      const workerMatch = msg.match(/Worker (\w+)/);
      const workerId = workerMatch?.[1];
      const w = workers.find((x) => x.id === workerId || x.name.includes(workerId ?? ""));
      if (w && (w.projectIds?.length ?? 0) > 1) {
        const keep = w.projectIds![0];
        const drop = w.projectIds![1];
        resolutions.push(
          createAction({
            type: "conflict.resolve",
            title: `Resolve double-booking ${w.name}`,
            reason: `Keep project ${keep}, release ${drop}`,
            entityType: "worker",
            entityId: w.id,
            targetId: keep,
            overrideable: true,
            rollbackable: true,
            metadata: { droppedProjectId: drop, factors: ["readiness", "risk", "compliance"] },
          })
        );
      } else {
        unresolved.push(msg);
      }
    }

    for (const e of equipment) {
      if ((e.projectIds?.length ?? 0) > 1) {
        resolutions.push(
          createAction({
            type: "conflict.resolve",
            title: `Resolve equipment conflict ${e.name}`,
            reason: "Equipment on multiple projects — assign to highest readiness project",
            entityType: "equipment",
            entityId: e.id,
            targetId: e.projectIds![0],
            overrideable: true,
            rollbackable: true,
          })
        );
      }
    }

    const trainingConflict = workers.filter((w) => w.trainingValid === false && (w.projectIds?.length ?? 0) > 0);
    for (const w of trainingConflict) {
      const replacement = workers
        .filter((c) => c.id !== w.id && c.trainingValid !== false)
        .sort((a, b) => rankWorkerForDispatch(b) - rankWorkerForDispatch(a))[0];
      if (replacement) {
        resolutions.push(
          createAction({
            type: "conflict.resolve",
            title: `Training conflict: swap ${w.name}`,
            reason: "Expired training on active assignment",
            entityType: "worker",
            entityId: replacement.id,
            targetId: w.projectIds![0],
            overrideable: true,
            rollbackable: true,
          })
        );
      } else {
        unresolved.push(`Training conflict: ${w.name}`);
      }
    }

    return { resolutions, unresolved };
  }
}
