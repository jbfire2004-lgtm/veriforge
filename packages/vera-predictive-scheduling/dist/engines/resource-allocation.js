"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceAllocationEngine = void 0;
class ResourceAllocationEngine {
    allocate(ctx, staffing) {
        const workerAllocations = staffing.workerAssignments.map((a, i) => ({
            workerId: a.workerId,
            projectId: a.projectId,
            priority: a.score - i,
        }));
        const equipmentAllocations = staffing.equipmentAssignments.map((a, i) => ({
            equipmentId: a.equipmentId,
            projectId: a.projectId,
            priority: a.score - i,
        }));
        const trainingAllocations = (ctx.workers ?? [])
            .filter((w) => !w.isCompliant || (w.expiringTraining ?? 0) > 0)
            .map((w) => ({
            workerId: w.id,
            action: w.isCompliant ? "Schedule renewal training" : "Complete compliance training",
        }));
        const readiness = workerAllocations.length > 0
            ? workerAllocations.reduce((s, a) => s + a.priority, 0) / workerAllocations.length
            : 50;
        const risk = (ctx.workers ?? []).reduce((s, w) => s + (w.riskScore ?? 0), 0) / Math.max(1, ctx.workers?.length ?? 1);
        const downtime = (ctx.equipment ?? []).filter((e) => e.lockedOut || e.overdueInspection).length * 10;
        return {
            workerAllocations,
            equipmentAllocations,
            trainingAllocations,
            goals: {
                readiness: Math.round(readiness),
                risk: Math.round(risk),
                downtime: Math.round(downtime),
                cost: Math.round(workerAllocations.length * 2 + equipmentAllocations.length * 5),
            },
        };
    }
}
exports.ResourceAllocationEngine = ResourceAllocationEngine;
//# sourceMappingURL=resource-allocation.js.map