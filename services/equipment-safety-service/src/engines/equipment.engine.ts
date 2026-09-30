import {
  EquipmentStatus,
  InspectionStatus,
  AuthorizationStatus,
  type Equipment,
  type EquipmentInspection,
  type EquipmentCertification,
  type EquipmentLockout,
} from '@prisma/client';

export interface ScoringContext {
  equipment: Equipment;
  inspections: EquipmentInspection[];
  certifications: EquipmentCertification[];
  activeLockout: EquipmentLockout | null;
  now?: Date;
}

export class ConditionScoringEngine {
  compute(ctx: ScoringContext): {
    score: number;
    factors: {
      inspectionScore: number;
      certificationScore: number;
      lockoutPenalty: number;
      overduePenalty: number;
    };
  } {
    const now = ctx.now ?? new Date();

    if (ctx.equipment.status === EquipmentStatus.retired) {
      return {
        score: 0,
        factors: { inspectionScore: 0, certificationScore: 0, lockoutPenalty: 0, overduePenalty: 0 },
      };
    }

  let inspectionScore = 70;
  const latest = ctx.inspections[0];
  if (latest) {
    if (latest.status === InspectionStatus.pass) inspectionScore = 100;
    else if (latest.status === InspectionStatus.conditional) inspectionScore = 75;
    else if (latest.status === InspectionStatus.fail) inspectionScore = 30;
    else inspectionScore = 60;
  }

  let certificationScore = 100;
  const expiredCerts = ctx.certifications.filter(
    (c) => c.expiryDate && c.expiryDate.getTime() < now.getTime(),
  );
  if (ctx.certifications.length === 0) certificationScore = 80;
  else if (expiredCerts.length > 0) {
    certificationScore = Math.max(0, 100 - expiredCerts.length * 25);
  }

  let overduePenalty = 0;
  if (ctx.equipment.nextInspectionDue && ctx.equipment.nextInspectionDue.getTime() < now.getTime()) {
    overduePenalty = 20;
  }

  const lockoutPenalty = ctx.activeLockout || ctx.equipment.status === EquipmentStatus.locked_out ? 50 : 0;

  const raw =
    inspectionScore * 0.45 +
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

export class LockoutEngine {
  canLock(equipment: Equipment): void {
    if (equipment.status === EquipmentStatus.retired) {
      throw new Error('Cannot lock retired equipment');
    }
  }

  canUnlock(activeLockout: EquipmentLockout | null): void {
    if (!activeLockout) {
      throw new Error('Equipment is not locked out');
    }
  }

  resolveStatusAfterUnlock(conditionScore: number): EquipmentStatus {
    if (conditionScore < 50) return EquipmentStatus.out_of_service;
    if (conditionScore < 70) return EquipmentStatus.maintenance;
    return EquipmentStatus.active;
  }
}

export class InspectionScheduleEngine {
  computeNextDue(from: Date, intervalDays: number): Date {
    const next = new Date(from);
    next.setDate(next.getDate() + intervalDays);
    return next;
  }
}

export const conditionScoringEngine = new ConditionScoringEngine();
export const lockoutEngine = new LockoutEngine();
export const inspectionScheduleEngine = new InspectionScheduleEngine();

export function isAuthorizationActive(
  auth: { status: AuthorizationStatus; expiryDate: Date | null },
  now = new Date(),
): boolean {
  if (auth.status !== AuthorizationStatus.active) return false;
  if (auth.expiryDate && auth.expiryDate.getTime() < now.getTime()) return false;
  return true;
}
