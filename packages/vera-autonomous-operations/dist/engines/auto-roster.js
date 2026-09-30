"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoRosterEngine = void 0;
const actions_1 = require("../utils/actions");
class AutoRosterEngine {
    run(ctx) {
        const workers = [...(ctx.workers ?? [])].sort((a, b) => (0, actions_1.rankWorkerForDispatch)(b) - (0, actions_1.rankWorkerForDispatch)(a));
        const projects = ctx.projects ?? [];
        const corrections = [];
        const understaffing = [];
        const overstaffing = [];
        const skillGaps = [];
        const roster = [];
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
            if (have < need)
                understaffing.push(`${p.name}: ${need - have} under`);
            if (have > need + 2)
                overstaffing.push(`${p.name}: possible overstaff`);
            if (p.requiredSkills?.length) {
                const covered = workers.some((w) => p.requiredSkills.some((s) => w.skills?.includes(s)));
                if (!covered)
                    skillGaps.push(`${p.name}: missing ${p.requiredSkills.join(", ")}`);
            }
        }
        const overloaded = workers.filter((w) => (w.fatigueScore ?? 0) > 75);
        const available = workers.filter((w) => (w.fatigueScore ?? 0) < 40 && !w.restricted);
        if (overloaded[0] && available[0]) {
            corrections.push((0, actions_1.createAction)({
                type: "roster.correct",
                title: `Swap ${overloaded[0].name} ↔ ${available[0].name}`,
                reason: "Fatigue balance",
                entityType: "worker",
                entityId: overloaded[0].id,
                targetId: available[0].id,
                overrideable: true,
                rollbackable: true,
            }));
        }
        if (understaffing.length) {
            corrections.push((0, actions_1.createAction)({
                type: "roster.correct",
                title: "Add workers to roster",
                reason: understaffing[0],
                entityType: "project",
                entityId: projects[0]?.id ?? "0",
                overrideable: true,
                rollbackable: true,
            }));
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
exports.AutoRosterEngine = AutoRosterEngine;
//# sourceMappingURL=auto-roster.js.map