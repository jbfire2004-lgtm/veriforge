import type { AutoLockoutResult, OperationsContextInput } from "../types";
import { createAction } from "../utils/actions";

export class AutoLockoutEngine {
  run(ctx: OperationsContextInput): AutoLockoutResult {
    const equipment = ctx.equipment ?? [];
    const lockouts: AutoLockoutResult["lockouts"] = [];
    const unlocks: AutoLockoutResult["unlocks"] = [];
    const notifications: AutoLockoutResult["notifications"] = [];

    for (const e of equipment) {
      const shouldLock =
        e.lockedOut ||
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

        lockouts.push(
          createAction({
            type: "lockout.apply",
            title: `Lockout ${e.name}`,
            reason,
            entityType: "equipment",
            entityId: e.id,
            overrideable: true,
            rollbackable: true,
          })
        );
        notifications.push(
          createAction({
            type: "notify.supervisor",
            title: `Notify supervisor: ${e.name} locked`,
            reason,
            entityType: "equipment",
            entityId: e.id,
            overrideable: false,
            rollbackable: false,
          })
        );
      }

      if (
        e.lockedOut &&
        e.inspectionPassed === true &&
        !e.visionDamageDetected &&
        !e.sifPrecursor &&
        !e.hecaDeviation
      ) {
        unlocks.push(
          createAction({
            type: "lockout.release",
            title: `Release lockout ${e.name}`,
            reason: "Inspection passed / maintenance complete",
            entityType: "equipment",
            entityId: e.id,
            overrideable: true,
            rollbackable: true,
          })
        );
      }
    }

    return { lockouts, unlocks, notifications };
  }
}
