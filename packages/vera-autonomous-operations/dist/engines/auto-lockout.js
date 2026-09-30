"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoLockoutEngine = void 0;
const actions_1 = require("../utils/actions");
class AutoLockoutEngine {
    run(ctx) {
        const equipment = ctx.equipment ?? [];
        const lockouts = [];
        const unlocks = [];
        const notifications = [];
        for (const e of equipment) {
            const shouldLock = e.lockedOut ||
                e.inspectionPassed === false ||
                e.visionDamageDetected ||
                e.sifPrecursor ||
                e.hecaDeviation ||
                e.energyConflict ||
                e.competencyMismatch;
            if (shouldLock && !e.lockedOut) {
                const reason = e.inspectionPassed === false
                    ? "Inspection failed"
                    : e.visionDamageDetected
                        ? "Vision damage detected"
                        : e.sifPrecursor
                            ? "SIF precursor"
                            : e.hecaDeviation
                                ? "HECA deviation"
                                : e.energyConflict
                                    ? "Energy conflict"
                                    : e.competencyMismatch
                                        ? "Competency mismatch"
                                        : "Safety lockout";
                lockouts.push((0, actions_1.createAction)({
                    type: "lockout.apply",
                    title: `Lockout ${e.name}`,
                    reason,
                    entityType: "equipment",
                    entityId: e.id,
                    overrideable: true,
                    rollbackable: true,
                }));
                notifications.push((0, actions_1.createAction)({
                    type: "notify.supervisor",
                    title: `Notify supervisor: ${e.name} locked`,
                    reason,
                    entityType: "equipment",
                    entityId: e.id,
                    overrideable: false,
                    rollbackable: false,
                }));
            }
            if (e.lockedOut &&
                e.inspectionPassed === true &&
                !e.visionDamageDetected &&
                !e.sifPrecursor &&
                !e.hecaDeviation) {
                unlocks.push((0, actions_1.createAction)({
                    type: "lockout.release",
                    title: `Release lockout ${e.name}`,
                    reason: "Inspection passed / maintenance complete",
                    entityType: "equipment",
                    entityId: e.id,
                    overrideable: true,
                    rollbackable: true,
                }));
            }
        }
        return { lockouts, unlocks, notifications };
    }
}
exports.AutoLockoutEngine = AutoLockoutEngine;
//# sourceMappingURL=auto-lockout.js.map