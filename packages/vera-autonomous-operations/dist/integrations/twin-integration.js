"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTwinOperationsOverlay = buildTwinOperationsOverlay;
function buildTwinOperationsOverlay(report) {
    const overlay = {
        worker: {},
        equipment: {},
        project: {},
    };
    const restrictedIds = new Set(report.restriction.restrictions.map((a) => a.entityId));
    for (const lift of report.restriction.lifts) {
        restrictedIds.delete(lift.entityId);
    }
    for (const w of report.context.workers ?? []) {
        overlay.worker[w.id] = {
            restricted: restrictedIds.has(w.id) || !!w.restricted,
            dispatchStatus: w.dispatchStatus ?? "available",
            readiness: w.readinessScore ?? 50,
        };
    }
    const lockedIds = new Set(report.lockout.lockouts.map((a) => a.entityId));
    for (const u of report.lockout.unlocks) {
        lockedIds.delete(u.entityId);
    }
    for (const e of report.context.equipment ?? []) {
        overlay.equipment[e.id] = {
            lockedOut: lockedIds.has(e.id) || !!e.lockedOut,
            operatorId: e.operatorId,
        };
    }
    for (const r of report.readiness.readinessByProject) {
        const actionCount = report.execution.executed.filter((a) => a.targetId === r.projectId || a.entityId === r.projectId).length;
        overlay.project[r.projectId] = {
            readiness: r.score,
            autonomousActions: actionCount,
        };
    }
    return overlay;
}
//# sourceMappingURL=twin-integration.js.map