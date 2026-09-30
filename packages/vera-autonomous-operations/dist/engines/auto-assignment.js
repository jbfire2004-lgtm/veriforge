"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoAssignmentEngine = void 0;
const actions_1 = require("../utils/actions");
class AutoAssignmentEngine {
    run(ctx) {
        const workers = ctx.workers ?? [];
        const equipment = ctx.equipment ?? [];
        const projects = ctx.projects ?? [];
        const assignments = [];
        const replacements = [];
        const conflicts = [];
        const violations = [];
        const shortages = [];
        for (const w of workers) {
            if ((w.projectIds?.length ?? 0) > 1) {
                conflicts.push(`Worker ${w.name}: overlapping project assignments`);
            }
        }
        for (const p of projects) {
            const wDeficit = Math.max(0, (p.requiredWorkers ?? 0) - (p.assignedWorkers ?? 0));
            const eDeficit = Math.max(0, (p.requiredEquipment ?? 0) - (p.assignedEquipment ?? 0));
            if (wDeficit)
                shortages.push(`${p.name}: ${wDeficit} workers`);
            if (eDeficit)
                shortages.push(`${p.name}: ${eDeficit} equipment`);
            const ranked = workers
                .filter((w) => !w.restricted && w.isCompliant !== false)
                .sort((a, b) => (0, actions_1.rankWorkerForDispatch)(b) - (0, actions_1.rankWorkerForDispatch)(a));
            for (const w of ranked.slice(0, wDeficit)) {
                assignments.push((0, actions_1.createAction)({
                    type: "assignment.worker",
                    title: `Assign ${w.name} → ${p.name}`,
                    reason: "Project staffing requirement",
                    entityType: "worker",
                    entityId: w.id,
                    targetId: p.id,
                    overrideable: true,
                    rollbackable: true,
                }));
            }
            const availEq = equipment.filter((e) => !e.lockedOut && !(e.projectIds ?? []).includes(p.id));
            for (const e of availEq.slice(0, eDeficit)) {
                assignments.push((0, actions_1.createAction)({
                    type: "assignment.equipment",
                    title: `Assign ${e.name} → ${p.name}`,
                    reason: "Equipment matrix requirement",
                    entityType: "equipment",
                    entityId: e.id,
                    targetId: p.id,
                    overrideable: true,
                    rollbackable: true,
                }));
                if (e.operatorId) {
                    assignments.push((0, actions_1.createAction)({
                        type: "assignment.operator",
                        title: `Operator ${e.operatorId} on ${e.name}`,
                        reason: "Equipment operator pairing",
                        entityType: "worker",
                        entityId: e.operatorId,
                        targetId: e.id,
                        overrideable: true,
                        rollbackable: true,
                    }));
                }
            }
        }
        for (const w of workers.filter((x) => !x.trainingValid || x.restricted)) {
            const projectsNeeding = projects.filter((p) => (p.assignedWorkers ?? 0) < (p.requiredWorkers ?? 0));
            const replacement = workers.find((c) => c.id !== w.id &&
                c.trainingValid !== false &&
                !c.restricted &&
                c.dispatchStatus === "available");
            if (replacement && projectsNeeding[0]) {
                replacements.push((0, actions_1.createAction)({
                    type: "assignment.worker",
                    title: `Replace ${w.name} with ${replacement.name}`,
                    reason: !w.trainingValid ? "Expired training" : "Active restriction",
                    entityType: "worker",
                    entityId: replacement.id,
                    targetId: projectsNeeding[0].id,
                    overrideable: true,
                    rollbackable: true,
                    metadata: { replacedWorkerId: w.id },
                }));
            }
        }
        for (const e of equipment.filter((x) => x.lockedOut)) {
            const alt = equipment.find((a) => !a.lockedOut && a.id !== e.id);
            if (alt) {
                replacements.push((0, actions_1.createAction)({
                    type: "assignment.equipment",
                    title: `Substitute ${alt.name} for locked ${e.name}`,
                    reason: "Equipment lockout",
                    entityType: "equipment",
                    entityId: alt.id,
                    overrideable: true,
                    rollbackable: true,
                    metadata: { replacedEquipmentId: e.id },
                }));
            }
        }
        return { assignments, replacements, conflicts, violations, shortages };
    }
}
exports.AutoAssignmentEngine = AutoAssignmentEngine;
//# sourceMappingURL=auto-assignment.js.map