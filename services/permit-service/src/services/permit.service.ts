import { WorkPermitStatus, PermitType } from '@prisma/client';
import { permitRepository } from '../models/permit.repository';
import { safetyGateEngine } from '../engines/safety-gate.engine';
import { approvalEngine } from '../engines/approval.engine';
import { offlineSyncEngine } from '../engines/offline-sync.engine';
import { eventPublisher } from '../events/publisher';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from '../utils/errors';
import type {
  WorkPermitStatus as PermitStatus,
  PermitType as PermitTypeDto,
  PermitEventPayload,
  OfflineSyncAction,
} from '../types';
import { logger } from '../utils/logger';

function toEventPayload(
  permit: NonNullable<Awaited<ReturnType<typeof permitRepository.findById>>>,
): PermitEventPayload {
  return {
    permitId: permit.id,
    companyId: permit.companyId,
    projectId: permit.projectId,
    permitType: permit.permitType as PermitTypeDto,
    status: permit.status as PermitStatus,
    pmTaskId: permit.pmTaskId,
    workerId: permit.workerId,
  };
}

function toPermitDto(permit: NonNullable<Awaited<ReturnType<typeof permitRepository.findById>>>) {
  return {
    id: permit.id,
    companyId: permit.companyId,
    projectId: permit.projectId,
    workPackageId: permit.workPackageId,
    pmTaskId: permit.pmTaskId,
    permitType: permit.permitType,
    title: permit.title,
    description: permit.description,
    location: permit.location,
    status: permit.status,
    requestedBy: permit.requestedBy,
    workerId: permit.workerId,
    jhaId: permit.jhaId,
    hazardId: permit.hazardId,
    controlId: permit.controlId,
    equipmentId: permit.equipmentId,
    validFrom: permit.validFrom?.toISOString() ?? null,
    validTo: permit.validTo?.toISOString() ?? null,
    approvals: permit.approvals.map((a) => ({
      id: a.id,
      approvedBy: a.approvedBy,
      role: a.role,
      outcome: a.outcome,
      notes: a.notes,
      approvedAt: a.approvedAt.toISOString(),
    })),
    safetyRequirements: permit.safetyRequirements.map((r) => ({
      id: r.id,
      requirementType: r.requirementType,
      linkedId: r.linkedId,
      satisfied: r.satisfied,
      metadata: r.metadata,
      checkedAt: r.checkedAt.toISOString(),
    })),
    allowedTransitions: approvalEngine.allowedNext(permit.status as PermitStatus),
    createdAt: permit.createdAt.toISOString(),
    updatedAt: permit.updatedAt.toISOString(),
  };
}

async function transitionStatus(
  id: string,
  companyId: string,
  to: WorkPermitStatus,
) {
  const permit = await permitRepository.findById(id, companyId);
  if (!permit) throw new NotFoundError('Work permit not found');

  try {
    approvalEngine.assertTransition(permit.status as PermitStatus, to as PermitStatus);
  } catch {
    throw new BadRequestError(`Cannot transition from ${permit.status} to ${to}`);
  }

  await permitRepository.update(id, companyId, { status: to });
}

async function persistSafetyGate(id: string, gate: Awaited<ReturnType<typeof safetyGateEngine.evaluate>>) {
  for (const check of gate.checks) {
    await permitRepository.upsertSafetyRequirement({
      permitId: id,
      requirementType: check.requirementType,
      linkedId: check.linkedId,
      satisfied: check.satisfied,
      metadata: {
        reason: check.reason,
        ...(check.metadata ?? {}),
      },
    });
  }
}

export const permitService = {
  assertCompanyAccess(tokenCompanyId: string, requestedCompanyId: string) {
    if (tokenCompanyId !== requestedCompanyId) {
      throw new ForbiddenError('Cross-company access denied');
    }
  },

  async create(input: {
    companyId: string;
    projectId: string;
    workPackageId?: string;
    pmTaskId?: string;
    permitType: string;
    title: string;
    description?: string;
    location?: string;
    requestedBy: string;
    workerId?: string;
    jhaId?: string;
    hazardId?: string;
    controlId?: string;
    equipmentId?: string;
    validFrom?: string;
    validTo?: string;
  }) {
    const permit = await permitRepository.create({
      companyId: input.companyId,
      projectId: input.projectId,
      workPackageId: input.workPackageId,
      pmTaskId: input.pmTaskId,
      permitType: input.permitType as PermitType,
      title: input.title,
      description: input.description,
      location: input.location,
      status: WorkPermitStatus.draft,
      requestedBy: input.requestedBy,
      workerId: input.workerId,
      jhaId: input.jhaId,
      hazardId: input.hazardId,
      controlId: input.controlId,
      equipmentId: input.equipmentId,
      validFrom: input.validFrom ? new Date(input.validFrom) : undefined,
      validTo: input.validTo ? new Date(input.validTo) : undefined,
    });

    logger.info('work permit created', {
      permitId: permit.id,
      permitType: input.permitType,
    });

    const reloaded = await permitRepository.reload(permit.id, input.companyId);
    return toPermitDto(reloaded!);
  },

  async getSafetyGate(input: {
    permitId: string;
    companyId: string;
    token: string;
    workerRole?: string;
  }) {
    const permit = await permitRepository.findById(input.permitId, input.companyId);
    if (!permit) throw new NotFoundError('Work permit not found');

    const gate = await safetyGateEngine.evaluate({
      companyId: input.companyId,
      token: input.token,
      jhaId: permit.jhaId,
      workerId: permit.workerId,
      hazardId: permit.hazardId,
      controlId: permit.controlId,
      equipmentId: permit.equipmentId,
      pmTaskId: permit.pmTaskId,
      workerRole: input.workerRole,
    });

    await persistSafetyGate(permit.id, gate);

    const reloaded = await permitRepository.reload(permit.id, input.companyId);
    return { ...gate, permit: toPermitDto(reloaded!) };
  },

  async requestApproval(input: { permitId: string; companyId: string; token: string }) {
    const permit = await permitRepository.findById(input.permitId, input.companyId);
    if (!permit) throw new NotFoundError('Work permit not found');

    try {
      approvalEngine.assertCanRequestApproval(permit.status as PermitStatus);
    } catch (e) {
      throw new BadRequestError(e instanceof Error ? e.message : 'Cannot request approval');
    }

    const gate = await safetyGateEngine.evaluate({
      companyId: input.companyId,
      token: input.token,
      jhaId: permit.jhaId,
      workerId: permit.workerId,
      hazardId: permit.hazardId,
      controlId: permit.controlId,
      equipmentId: permit.equipmentId,
      pmTaskId: permit.pmTaskId,
    });
    await persistSafetyGate(permit.id, gate);

    await transitionStatus(input.permitId, input.companyId, WorkPermitStatus.pending_approval);

    const reloaded = await permitRepository.reload(input.permitId, input.companyId);
    const payload = toEventPayload(reloaded!);
    await eventPublisher.permitRequested(payload);

    logger.info('permit approval requested', { permitId: input.permitId });
    return toPermitDto(reloaded!);
  },

  async approve(input: {
    permitId: string;
    companyId: string;
    approvedBy: string;
    role: string;
    outcome?: 'approved' | 'rejected';
    notes?: string;
    token: string;
    verifierRoles: string[];
  }) {
    const permit = await permitRepository.findById(input.permitId, input.companyId);
    if (!permit) throw new NotFoundError('Work permit not found');

    try {
      approvalEngine.assertCanApprove(permit.status as PermitStatus);
    } catch (e) {
      throw new BadRequestError(e instanceof Error ? e.message : 'Cannot approve');
    }

    const outcome = input.outcome ?? 'approved';

    if (outcome === 'approved') {
      const gate = await safetyGateEngine.evaluate({
        companyId: input.companyId,
        token: input.token,
        jhaId: permit.jhaId,
        workerId: permit.workerId,
        hazardId: permit.hazardId,
        controlId: permit.controlId,
        equipmentId: permit.equipmentId,
        pmTaskId: permit.pmTaskId,
      });
      await persistSafetyGate(permit.id, gate);

      if (!gate.passed) {
        throw new BadRequestError(
          `Safety gate failed: ${gate.blockReasons.join('; ')}`,
        );
      }
    }

    await permitRepository.addApproval({
      permitId: input.permitId,
      approvedBy: input.approvedBy,
      role: input.role,
      outcome,
      notes: input.notes,
    });

    const nextStatus = approvalEngine.outcomeToStatus({
      outcome,
      role: input.role,
      notes: input.notes,
    });
    await permitRepository.update(input.permitId, input.companyId, {
      status: nextStatus as WorkPermitStatus,
    });

    const reloaded = await permitRepository.reload(input.permitId, input.companyId);
    if (outcome === 'approved') {
      await eventPublisher.permitApproved(toEventPayload(reloaded!));
    }

    logger.info('permit approval recorded', { permitId: input.permitId, outcome });
    return toPermitDto(reloaded!);
  },

  async activate(input: { permitId: string; companyId: string; token: string }) {
    const permit = await permitRepository.findById(input.permitId, input.companyId);
    if (!permit) throw new NotFoundError('Work permit not found');

    if (approvalEngine.isExpired(permit.validTo)) {
      await transitionStatus(input.permitId, input.companyId, WorkPermitStatus.expired);
      throw new ConflictError('Permit validity period has expired');
    }

    try {
      approvalEngine.assertCanActivate(permit.status as PermitStatus);
    } catch (e) {
      throw new BadRequestError(e instanceof Error ? e.message : 'Cannot activate');
    }

    const gate = await safetyGateEngine.evaluate({
      companyId: input.companyId,
      token: input.token,
      jhaId: permit.jhaId,
      workerId: permit.workerId,
      hazardId: permit.hazardId,
      controlId: permit.controlId,
      equipmentId: permit.equipmentId,
      pmTaskId: permit.pmTaskId,
    });
    if (!gate.passed) {
      throw new BadRequestError(`Safety gate failed: ${gate.blockReasons.join('; ')}`);
    }

    await transitionStatus(input.permitId, input.companyId, WorkPermitStatus.active);

    const reloaded = await permitRepository.reload(input.permitId, input.companyId);
    await eventPublisher.permitActive(toEventPayload(reloaded!));

    logger.info('permit activated', { permitId: input.permitId });
    return toPermitDto(reloaded!);
  },

  async suspend(input: { permitId: string; companyId: string; reason?: string }) {
    const permit = await permitRepository.findById(input.permitId, input.companyId);
    if (!permit) throw new NotFoundError('Work permit not found');

    try {
      approvalEngine.assertCanSuspend(permit.status as PermitStatus);
    } catch (e) {
      throw new BadRequestError(e instanceof Error ? e.message : 'Cannot suspend');
    }

    await transitionStatus(input.permitId, input.companyId, WorkPermitStatus.suspended);

    logger.info('permit suspended', { permitId: input.permitId, reason: input.reason });
    const reloaded = await permitRepository.reload(input.permitId, input.companyId);
    return toPermitDto(reloaded!);
  },

  async close(input: { permitId: string; companyId: string; notes?: string }) {
    const permit = await permitRepository.findById(input.permitId, input.companyId);
    if (!permit) throw new NotFoundError('Work permit not found');

    try {
      approvalEngine.assertCanClose(permit.status as PermitStatus);
    } catch (e) {
      throw new ConflictError(e instanceof Error ? e.message : 'Cannot close');
    }

    await transitionStatus(input.permitId, input.companyId, WorkPermitStatus.closed);

    logger.info('permit closed', { permitId: input.permitId });
    const reloaded = await permitRepository.reload(input.permitId, input.companyId);
    return toPermitDto(reloaded!);
  },

  async getById(id: string, companyId: string) {
    const permit = await permitRepository.findById(id, companyId);
    if (!permit) throw new NotFoundError('Work permit not found');
    return toPermitDto(permit);
  },

  async syncOffline(input: {
    deviceId: string;
    companyId: string;
    userId: string;
    token: string;
    actions: OfflineSyncAction[];
    batchId?: string;
  }) {
    const results = [];
    let synced = 0;
    let failed = 0;

    for (const action of input.actions) {
      const result = await offlineSyncEngine.processAction({
        deviceId: input.deviceId,
        companyId: input.companyId,
        userId: input.userId,
        token: input.token,
        action,
      });
      results.push(result);
      if (result.ok) synced++;
      else failed++;
    }

    return {
      deviceId: input.deviceId,
      batchId: input.batchId,
      synced,
      failed,
      results,
      canCompleteSync: failed === 0,
    };
  },
};
