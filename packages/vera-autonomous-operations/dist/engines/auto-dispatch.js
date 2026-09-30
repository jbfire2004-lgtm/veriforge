"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoDispatchEngine = void 0;
const actions_1 = require("../utils/actions");
class AutoDispatchEngine {
    run(ctx) {
        const workers = ctx.workers ?? [];
        const projects = ctx.projects ?? [];
        const dispatches = (ctx.dispatches ?? []).filter((d) => !d.recalledAt);
        const dispatchesOut = [];
        const recalls = [];
        const escalations = [];
        const notifications = [];
        const conflicts = [];
        const violations = [];
        const shortages = [];
        const workerDispatchCount = new Map();
        for (const d of dispatches) {
            workerDispatchCount.set(d.workerId, (workerDispatchCount.get(d.workerId) ?? 0) + 1);
        }
        for (const [wid, count] of workerDispatchCount) {
            if (count > 1)
                conflicts.push(`Worker ${wid}: double dispatch`);
        }
        for (const p of projects) {
            const deficit = Math.max(0, (p.requiredWorkers ?? 0) - (p.assignedWorkers ?? 0));
            if (deficit > 0)
                shortages.push(`${p.name}: ${deficit} workers needed`);
            const candidates = workers
                .filter((w) => w.dispatchStatus === "available" &&
                !w.restricted &&
                w.isCompliant !== false &&
                (w.sifRiskScore ?? 0) < 70)
                .sort((a, b) => (0, actions_1.rankWorkerForDispatch)(b) - (0, actions_1.rankWorkerForDispatch)(a));
            for (const w of candidates.slice(0, deficit)) {
                if ((w.hecaDeviation || (w.fatigueScore ?? 0) > 75) && !w.trainingValid) {
                    violations.push(`Union rule: ${w.name} not eligible for dispatch`);
                    continue;
                }
                dispatchesOut.push((0, actions_1.createAction)({
                    type: "dispatch.assign",
                    title: `Auto-dispatch ${w.name}`,
                    reason: `Project ${p.name} staffing shortage`,
                    entityType: "worker",
                    entityId: w.id,
                    targetId: p.id,
                    overrideable: true,
                    rollbackable: true,
                    metadata: { unionHallId: ctx.unionHallId, projectId: p.id },
                }));
                notifications.push((0, actions_1.createAction)({
                    type: "notify.worker",
                    title: `Notify ${w.name}`,
                    reason: "Dispatch assignment",
                    entityType: "worker",
                    entityId: w.id,
                    overrideable: false,
                    rollbackable: false,
                }));
            }
        }
        for (const w of workers.filter((x) => (x.fatigueScore ?? 0) > 85 || x.hecaDeviation)) {
            const active = dispatches.find((d) => d.workerId === w.id);
            if (active) {
                recalls.push((0, actions_1.createAction)({
                    type: "dispatch.recall",
                    title: `Recall ${w.name}`,
                    reason: w.hecaDeviation ? "HECA deviation" : "Fatigue risk",
                    entityType: "dispatch",
                    entityId: active.id,
                    overrideable: true,
                    rollbackable: true,
                }));
            }
        }
        if (shortages.length > 2) {
            escalations.push((0, actions_1.createAction)({
                type: "dispatch.escalate",
                title: "Escalate dispatch shortage",
                reason: `${shortages.length} projects understaffed`,
                entityType: "project",
                entityId: projects[0]?.id ?? "company",
                overrideable: true,
                rollbackable: false,
            }));
            notifications.push((0, actions_1.createAction)({
                type: "notify.union_hall",
                title: "Notify union hall",
                reason: "Dispatch pool exhaustion",
                entityType: "worker",
                entityId: ctx.unionHallId ?? "hall",
                overrideable: false,
                rollbackable: false,
            }));
        }
        return {
            dispatches: dispatchesOut,
            recalls,
            escalations,
            shortages,
            conflicts,
            violations,
            notifications,
        };
    }
}
exports.AutoDispatchEngine = AutoDispatchEngine;
//# sourceMappingURL=auto-dispatch.js.map