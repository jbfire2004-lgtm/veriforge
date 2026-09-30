import type { AutoRosterResult, OperationsContextInput } from "../types";
import { createAction, rankWorkerForDispatch } from "../utils/actions";

export class AutoRosterEngine {
  run(ctx: OperationsContextInput): AutoRosterResult {
    const workers = [...(ctx.workers ?? [])].sort(
      (a, b) => rankWorkerForDispatch(b) - rankWorkerForDispatch(a)
    );
    const projects = ctx.projects ?? [];
    const corrections: AutoRosterResult["corrections"] = [];
    const understaffing: string[] = [];
    const overstaffing: string[] = [];
    const skillGaps: string[] = [];
    const roster: AutoRosterResult["roster"] = [];
    const shifts = ["day", "swing", "night"];
    const today = new Date().toISOString().slice(0, 10);

    let idx = 0;
    for (const shift of shifts) {
      const chunk = workers.filter((w) => !w.restricted).slice(idx, idx + 4);
      idx += 4;
      roster.push({
        date: today,
        shift,
        workerIds: chunk.map((w) => w.id),
      });
    }

    for (const p of projects) {
      const need = p.requiredWorkers ?? 0;
      const have = p.assignedWorkers ?? 0;
      if (have < need) understaffing.push(`${p.name}: ${need - have} under`);
      if (have > need + 2) overstaffing.push(`${p.name}: possible overstaff`);
      if (p.requiredSkills?.length) {
        const covered = workers.some((w) =>
          p.requiredSkills!.some((s) => w.skills?.includes(s))
        );
        if (!covered) skillGaps.push(`${p.name}: missing ${p.requiredSkills.join(", ")}`);
      }
    }

    const overloaded = workers.filter((w) => (w.fatigueScore ?? 0) > 75);
    const available = workers.filter((w) => (w.fatigueScore ?? 0) < 40 && !w.restricted);
    if (overloaded[0] && available[0]) {
      corrections.push(
        createAction({
          type: "roster.correct",
          title: `Swap ${overloaded[0].name} ↔ ${available[0].name}`,
          reason: "Fatigue balance",
          entityType: "worker",
          entityId: overloaded[0].id,
          targetId: available[0].id,
          overrideable: true,
          rollbackable: true,
        })
      );
    }

    if (understaffing.length) {
      corrections.push(
        createAction({
          type: "roster.correct",
          title: "Add workers to roster",
          reason: understaffing[0],
          entityType: "project",
          entityId: projects[0]?.id ?? "0",
          overrideable: true,
          rollbackable: true,
        })
      );
    }

    return {
      roster,
      corrections,
      understaffing,
      overstaffing,
      skillGaps,
    };
  }
}
