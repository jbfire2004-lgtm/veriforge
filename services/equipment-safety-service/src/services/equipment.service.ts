import { EquipmentStatus, InspectionStatus } from '@prisma/client';
import { env } from '../config/env';
import {
  conditionScoringEngine,
  lockoutEngine,
  inspectionScheduleEngine,
  isAuthorizationActive,
} from '../engines/equipment.engine';
import { equipmentRepository } from '../models/equipment.repository';
import { BadRequestError, ConflictError, NotFoundError } from '../utils/errors';
import type { EquipmentScoreSummary } from '../types';
import { logger } from '../utils/logger';

function mapEquipment(e: Awaited<ReturnType<typeof equipmentRepository.findEquipment>>) {
  if (!e) return null;
  return {
    id: e.id,
    companyId: e.companyId,
    projectId: e.projectId,
    type: e.type,
    model: e.model,
    serialNumber: e.serialNumber,
    status: e.status,
    conditionScore: e.conditionScore,
    lastInspectionDate: e.lastInspectionDate?.toISOString() ?? null,
    nextInspectionDue: e.nextInspectionDue?.toISOString() ?? null,
    createdAt: e.createdAt.toISOString(),
  };
}

async function refreshConditionScore(equipmentId: string, companyId: string) {
  const ctx = await equipmentRepository.getScoreContext(equipmentId, companyId);
  if (!ctx) return null;

  const { score } = conditionScoringEngine.compute({
    equipment: ctx,
    inspections: ctx.inspections,
    certifications: ctx.certifications,
    activeLockout: ctx.lockouts[0] ?? null,
  });

  await equipmentRepository.updateEquipment(equipmentId, companyId, { conditionScore: score });
  return score;
}

export const equipmentService = {
  async register(input: {
    companyId: string;
    projectId?: string;
    type: string;
    model?: string;
    serialNumber?: string;
  }) {
    const equipment = await equipmentRepository.createEquipment(input);
    logger.info('equipment registered', { equipmentId: equipment.id, companyId: input.companyId });
    return mapEquipment(equipment);
  },

  async recordInspection(input: {
    companyId: string;
    equipmentId: string;
    inspectorId: string;
    templateId?: string;
    status: InspectionStatus;
    notes?: string;
    intervalDays?: number;
  }) {
    const equipment = await equipmentRepository.findEquipment(input.equipmentId, input.companyId);
    if (!equipment) throw new NotFoundError('Equipment not found');

  const activeLockout = await equipmentRepository.findActiveLockout(input.equipmentId);
  if (activeLockout) {
    throw new BadRequestError('Cannot inspect locked-out equipment');
  }

  const inspection = await equipmentRepository.createInspection({
    equipmentId: input.equipmentId,
    inspectorId: input.inspectorId,
    templateId: input.templateId,
    status: input.status,
    notes: input.notes,
  });

  const inspectedAt = inspection.createdAt;
  const interval = input.intervalDays ?? env.defaultInspectionIntervalDays;
  const nextDue = inspectionScheduleEngine.computeNextDue(inspectedAt, interval);

  let status = equipment.status;
  if (input.status === InspectionStatus.fail) status = EquipmentStatus.out_of_service;
  else if (input.status === InspectionStatus.conditional) status = EquipmentStatus.maintenance;
  else if (equipment.status === EquipmentStatus.maintenance || equipment.status === EquipmentStatus.out_of_service) {
    status = EquipmentStatus.active;
  }

  await equipmentRepository.updateEquipment(input.equipmentId, input.companyId, {
    lastInspectionDate: inspectedAt,
    nextInspectionDue: nextDue,
    status,
  });

  const score = await refreshConditionScore(input.equipmentId, input.companyId);

  return {
    id: inspection.id,
    equipmentId: inspection.equipmentId,
    inspectorId: inspection.inspectorId,
    templateId: inspection.templateId,
    status: inspection.status,
    notes: inspection.notes,
    createdAt: inspection.createdAt.toISOString(),
    nextInspectionDue: nextDue.toISOString(),
    conditionScore: score,
  };
  },

  async addCertification(input: {
    companyId: string;
    equipmentId: string;
    certificationType: string;
    issuedBy?: string;
    issueDate: string;
    expiryDate?: string;
  }) {
    const equipment = await equipmentRepository.findEquipment(input.equipmentId, input.companyId);
    if (!equipment) throw new NotFoundError('Equipment not found');

    const cert = await equipmentRepository.createCertification({
      equipmentId: input.equipmentId,
      certificationType: input.certificationType,
      issuedBy: input.issuedBy,
      issueDate: new Date(input.issueDate),
      expiryDate: input.expiryDate ? new Date(input.expiryDate) : undefined,
    });

    const score = await refreshConditionScore(input.equipmentId, input.companyId);

    return {
      id: cert.id,
      equipmentId: cert.equipmentId,
      certificationType: cert.certificationType,
      issuedBy: cert.issuedBy,
      issueDate: cert.issueDate.toISOString(),
      expiryDate: cert.expiryDate?.toISOString() ?? null,
      conditionScore: score,
    };
  },

  async authorizeOperator(input: {
    companyId: string;
    equipmentId: string;
    workerId: string;
    authorizedBy: string;
    expiryDate?: string;
  }) {
    const equipment = await equipmentRepository.findEquipment(input.equipmentId, input.companyId);
    if (!equipment) throw new NotFoundError('Equipment not found');

    if (equipment.status === EquipmentStatus.locked_out) {
      throw new BadRequestError('Cannot authorize operators for locked-out equipment');
    }

    const auth = await equipmentRepository.upsertAuthorization({
      equipmentId: input.equipmentId,
      workerId: input.workerId,
      authorizedBy: input.authorizedBy,
      expiryDate: input.expiryDate ? new Date(input.expiryDate) : undefined,
    });

    return {
      id: auth.id,
      equipmentId: auth.equipmentId,
      workerId: auth.workerId,
      authorizedBy: auth.authorizedBy,
      status: auth.status,
      expiryDate: auth.expiryDate?.toISOString() ?? null,
      createdAt: auth.createdAt.toISOString(),
    };
  },

  async lockout(input: {
    companyId: string;
    equipmentId: string;
    reason: string;
    lockedBy: string;
  }) {
    const equipment = await equipmentRepository.findEquipment(input.equipmentId, input.companyId);
    if (!equipment) throw new NotFoundError('Equipment not found');

    try {
      lockoutEngine.canLock(equipment);
    } catch (e) {
      throw new BadRequestError(e instanceof Error ? e.message : 'Cannot lock equipment');
    }

    const existing = await equipmentRepository.findActiveLockout(input.equipmentId);
    if (existing) throw new ConflictError('Equipment is already locked out');

    const lockout = await equipmentRepository.createLockout({
      equipmentId: input.equipmentId,
      reason: input.reason,
      lockedBy: input.lockedBy,
    });

    await equipmentRepository.updateEquipment(input.equipmentId, input.companyId, {
      status: EquipmentStatus.locked_out,
    });

    const score = await refreshConditionScore(input.equipmentId, input.companyId);

    return {
      id: lockout.id,
      equipmentId: lockout.equipmentId,
      reason: lockout.reason,
      lockedBy: lockout.lockedBy,
      lockedAt: lockout.lockedAt.toISOString(),
      active: lockout.active,
      conditionScore: score,
    };
  },

  async unlock(input: {
    companyId: string;
    equipmentId: string;
    unlockedBy: string;
  }) {
    const equipment = await equipmentRepository.findEquipment(input.equipmentId, input.companyId);
    if (!equipment) throw new NotFoundError('Equipment not found');

    const activeLockout = await equipmentRepository.findActiveLockout(input.equipmentId);
    try {
      lockoutEngine.canUnlock(activeLockout);
    } catch (e) {
      throw new BadRequestError(e instanceof Error ? e.message : 'Equipment is not locked out');
    }

    await equipmentRepository.deactivateLockout(activeLockout!.id, input.unlockedBy);

    const ctx = await equipmentRepository.getScoreContext(input.equipmentId, input.companyId);
    const { score } = conditionScoringEngine.compute({
      equipment: ctx!,
      inspections: ctx!.inspections,
      certifications: ctx!.certifications,
      activeLockout: null,
    });

    const status = lockoutEngine.resolveStatusAfterUnlock(score);
    await equipmentRepository.updateEquipment(input.equipmentId, input.companyId, {
      status,
      conditionScore: score,
    });

    return {
      equipmentId: input.equipmentId,
      unlockedBy: input.unlockedBy,
      unlockedAt: new Date().toISOString(),
      status,
      conditionScore: score,
    };
  },

  async getScore(equipmentId: string, companyId: string): Promise<EquipmentScoreSummary> {
    const ctx = await equipmentRepository.getScoreContext(equipmentId, companyId);
    if (!ctx) throw new NotFoundError('Equipment not found');

    const activeLockout = ctx.lockouts[0] ?? null;
    const { score, factors } = conditionScoringEngine.compute({
      equipment: ctx,
      inspections: ctx.inspections,
      certifications: ctx.certifications,
      activeLockout,
    });

    if (score !== ctx.conditionScore) {
      await equipmentRepository.updateEquipment(equipmentId, companyId, { conditionScore: score });
    }

    const now = new Date();
    const expiredCertifications = ctx.certifications.filter(
      (c) => c.expiryDate && c.expiryDate.getTime() < now.getTime(),
    ).length;
    const activeAuthorizations = ctx.authorizations.filter((a) =>
      isAuthorizationActive(a, now),
    ).length;

    return {
      equipmentId: ctx.id,
      companyId: ctx.companyId,
      conditionScore: score,
      status: ctx.status,
      factors,
      lastInspectionDate: ctx.lastInspectionDate?.toISOString() ?? null,
      nextInspectionDue: ctx.nextInspectionDue?.toISOString() ?? null,
      activeLockout: Boolean(activeLockout),
      expiredCertifications,
      activeAuthorizations,
    };
  },
};
