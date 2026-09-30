"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inspectionScheduleEngine = exports.lockoutEngine = exports.conditionScoringEngine = exports.InspectionScheduleEngine = exports.LockoutEngine = exports.ConditionScoringEngine = void 0;
exports.isAuthorizationActive = isAuthorizationActive;
const client_1 = require("@prisma/client");
class ConditionScoringEngine {
    compute(ctx) {
        const now = ctx.now ?? new Date();
        if (ctx.equipment.status === client_1.EquipmentStatus.retired) {
            return {
                score: 0,
                factors: { inspectionScore: 0, certificationScore: 0, lockoutPenalty: 0, overduePenalty: 0 },
            };
        }
        let inspectionScore = 70;
        const latest = ctx.inspections[0];
        if (latest) {
            if (latest.status === client_1.InspectionStatus.pass)
                inspectionScore = 100;
            else if (latest.status === client_1.InspectionStatus.conditional)
                inspectionScore = 75;
            else if (latest.status === client_1.InspectionStatus.fail)
                inspectionScore = 30;
            else
                inspectionScore = 60;
        }
        let certificationScore = 100;
        const expiredCerts = ctx.certifications.filter((c) => c.expiryDate && c.expiryDate.getTime() < now.getTime());
        if (ctx.certifications.length === 0)
            certificationScore = 80;
        else if (expiredCerts.length > 0) {
            certificationScore = Math.max(0, 100 - expiredCerts.length * 25);
        }
        let overduePenalty = 0;
        if (ctx.equipment.nextInspectionDue && ctx.equipment.nextInspectionDue.getTime() < now.getTime()) {
            overduePenalty = 20;
        }
        const lockoutPenalty = ctx.activeLockout || ctx.equipment.status === client_1.EquipmentStatus.locked_out ? 50 : 0;
        const raw = inspectionScore * 0.45 +
            certificationScore * 0.35 +
            (100 - overduePenalty) * 0.2 -
            lockoutPenalty;
        const score = Math.max(0, Math.min(100, Math.round(raw)));
        return {
            score,
            factors: { inspectionScore, certificationScore, lockoutPenalty, overduePenalty },
        };
    }
}
exports.ConditionScoringEngine = ConditionScoringEngine;
class LockoutEngine {
    canLock(equipment) {
        if (equipment.status === client_1.EquipmentStatus.retired) {
            throw new Error('Cannot lock retired equipment');
        }
    }
    canUnlock(activeLockout) {
        if (!activeLockout) {
            throw new Error('Equipment is not locked out');
        }
    }
    resolveStatusAfterUnlock(conditionScore) {
        if (conditionScore < 50)
            return client_1.EquipmentStatus.out_of_service;
        if (conditionScore < 70)
            return client_1.EquipmentStatus.maintenance;
        return client_1.EquipmentStatus.active;
    }
}
exports.LockoutEngine = LockoutEngine;
class InspectionScheduleEngine {
    computeNextDue(from, intervalDays) {
        const next = new Date(from);
        next.setDate(next.getDate() + intervalDays);
        return next;
    }
}
exports.InspectionScheduleEngine = InspectionScheduleEngine;
exports.conditionScoringEngine = new ConditionScoringEngine();
exports.lockoutEngine = new LockoutEngine();
exports.inspectionScheduleEngine = new InspectionScheduleEngine();
function isAuthorizationActive(auth, now = new Date()) {
    if (auth.status !== client_1.AuthorizationStatus.active)
        return false;
    if (auth.expiryDate && auth.expiryDate.getTime() < now.getTime())
        return false;
    return true;
}
