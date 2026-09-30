import type { MultiProjectBalance, SchedulingContextInput } from "../types";

export class MultiProjectBalancingEngine {
  analyze(ctx: SchedulingContextInput): MultiProjectBalance {
    const projects = ctx.projects ?? [];
    const workers = ctx.workers ?? [];
    const equipment = ctx.equipment ?? [];
    const conflicts: string[] = [];
    const shortages: string[] = [];
    const overstaffing: string[] = [];
    const rebalanceActions: MultiProjectBalance["rebalanceActions"] = [];

    const workerProjectMap = new Map<string, string[]>();
    for (const w of workers) {
      for (const pid of w.projectIds ?? []) {
        const list = workerProjectMap.get(w.id) ?? [];
        list.push(pid);
        workerProjectMap.set(w.id, list);
      }
    }

    for (const [workerId, pids] of workerProjectMap) {
      if (pids.length > 1) {
        conflicts.push(`Worker ${workerId} assigned to multiple active projects`);
        rebalanceActions.push({
          type: "worker",
          entityId: workerId,
          fromProject: pids[0],
          toProject: pids[pids.length - 1],
        });
      }
    }

    for (const p of projects) {
      const wGap = (p.requiredWorkers ?? 0) - (p.assignedWorkers ?? 0);
      const eGap = (p.requiredEquipment ?? 0) - (p.assignedEquipment ?? 0);
      if (wGap > 0) shortages.push(`${p.name}: ${wGap} workers short`);
      if (eGap > 0) shortages.push(`${p.name}: ${eGap} equipment short`);
      if ((p.assignedWorkers ?? 0) > (p.requiredWorkers ?? 0) + 2) {
        overstaffing.push(`${p.name}: possible worker overstaffing`);
      }
    }

    const donor = projects.find(
      (p) => (p.assignedWorkers ?? 0) > (p.requiredWorkers ?? 0)
    );
    const receiver = projects.find(
      (p) => (p.requiredWorkers ?? 0) > (p.assignedWorkers ?? 0)
    );
    if (donor && receiver) {
      const movable = workers.find(
        (w) => w.projectIds?.includes(donor.id) && w.dispatchStatus === "available"
      );
      if (movable) {
        rebalanceActions.push({
          type: "worker",
          entityId: movable.id,
          fromProject: donor.id,
          toProject: receiver.id,
        });
      }
    }

    const idleEquipment = equipment.filter(
      (e) => !e.projectIds?.length && !e.lockedOut
    );
    if (idleEquipment.length && receiver) {
      rebalanceActions.push({
        type: "equipment",
        entityId: idleEquipment[0].id,
        toProject: receiver.id,
      });
    }

    return { conflicts, shortages, overstaffing, rebalanceActions };
  }
}
