import { CorrectiveActionStatus } from '@prisma/client';
import { capaRepository } from '../models/capa.repository';
import { priorityEngine } from '../engines/priority.engine';
import { escalationEngine } from '../engines/escalation.engine';
import { verificationEngine } from '../engines/verification.engine';
import { statusTransitionEngine } from '../engines/status-transition.engine';
import { attachmentEngine } from '../engines/attachment.engine';
import { offlineSyncEngine } from '../engines/offline-sync.engine';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from '../utils/errors';
import type {
  EvidenceAttachment,
  ModuleLink,
  OfflineSyncAction,
  CorrectiveActionStatus as CapaStatus,
} from '../types';
import { logger } from '../utils/logger';

function toCapaDto(capa: NonNullable<Awaited<ReturnType<typeof capaRepository.findById>>>) {
  return {
    id: capa.id,
    companyId: capa.companyId,
    projectId: capa.projectId,
    sourceType: capa.sourceType,
    sourceId: capa.sourceId,
    actionType: capa.actionType,
    title: capa.title,
    description: capa.description,
    severity: capa.severity,
    priority: capa.priority,
    hazardId: capa.hazardId,
    controlId: capa.controlId,
    equipmentId: capa.equipmentId,
    workerId: capa.workerId,
    dueDate: capa.dueDate?.toISOString() ?? null,
    status: capa.status,
    escalationLevel: capa.escalationLevel,
    createdBy: capa.createdBy,
    assignments: capa.assignments.map((a) => ({
      id: a.id,
      assigneeId: a.assigneeId,
      assignedBy: a.assignedBy,
      assignedAt: a.assignedAt.toISOString(),
    })),
    escalations: capa.escalations.map((e) => ({
      id: e.id,
      level: e.level,
      reason: e.reason,
      triggeredAt: e.triggeredAt.toISOString(),
    })),
    verifications: capa.verifications.map((v) => ({
      id: v.id,
      verifiedBy: v.verifiedBy,
      verifiedAt: v.verifiedAt.toISOString(),
      notes: v.notes,
      outcome: v.outcome,
    })),
    attachments: capa.attachments.map((a) => ({
      id: a.id,
      fileName: a.fileName,
      mimeType: a.mimeType,
      storageKey: a.storageKey,
      phase: a.phase,
      createdAt: a.createdAt.toISOString(),
    })),
    moduleLinks: capa.moduleLinks.map((l) => ({
      id: l.id,
      moduleType: l.moduleType,
      linkedId: l.linkedId,
      metadata: l.metadata,
    })),
    allowedTransitions: statusTransitionEngine.allowedNext(capa.status as CapaStatus),
    createdAt: capa.createdAt.toISOString(),
    updatedAt: capa.updatedAt.toISOString(),
  };
}

async function transitionStatus(
  id: string,
  companyId: string,
  to: CorrectiveActionStatus,
) {
  const capa = await capaRepository.findById(id, companyId);
  if (!capa) throw new NotFoundError('Corrective action not found');

  try {
    statusTransitionEngine.assertTransition(capa.status as CapaStatus, to as CapaStatus);
  } catch {
    throw new BadRequestError(`Cannot transition from ${capa.status} to ${to}`);
  }

  await capaRepository.update(id, companyId, { status: to });
}

export const correctiveActionService = {
  assertCompanyAccess(tokenCompanyId: string, requestedCompanyId: string) {
    if (tokenCompanyId !== requestedCompanyId) {
      throw new ForbiddenError('Cross-company access denied');
    }
  },

  async create(input: {
    companyId: string;
    projectId: string;
    sourceType: string;
    sourceId: string;
    actionType: string;
    title: string;
    description?: string;
    severity: string;
    createdBy: string;
    hazardId?: string;
    controlId?: string;
    equipmentId?: string;
    workerId?: string;
    dueDate?: string;
    moduleLinks?: ModuleLink[];
    attachments?: EvidenceAttachment[];
    publish?: boolean;
    sifLinked?: boolean;
    hecaLinked?: boolean;
  }) {
    const priority = priorityEngine.compute({
      severity: input.severity,
      actionType: input.actionType,
      sifLinked: input.sifLinked,
      hecaLinked: input.hecaLinked,
      equipmentUnsafe: !!input.equipmentId,
    });

    const capa = await capaRepository.create({
      companyId: input.companyId,
      projectId: input.projectId,
      sourceType: input.sourceType,
      sourceId: input.sourceId,
      actionType: input.actionType,
      title: input.title,
      description: input.description,
      severity: priority.severity,
      priority: priority.priority,
      hazardId: input.hazardId,
      controlId: input.controlId,
      equipmentId: input.equipmentId,
      workerId: input.workerId,
      dueDate: input.dueDate ? new Date(input.dueDate) : priority.dueDate,
      status: input.publish === false ? CorrectiveActionStatus.draft : CorrectiveActionStatus.open,
      createdBy: input.createdBy,
    });

    if (input.hazardId) {
      await capaRepository.addModuleLink({
        correctiveActionId: capa.id,
        moduleType: 'hazard',
        linkedId: input.hazardId,
      }).catch(() => undefined);
    }
    if (input.controlId) {
      await capaRepository.addModuleLink({
        correctiveActionId: capa.id,
        moduleType: 'control',
        linkedId: input.controlId,
      }).catch(() => undefined);
    }

    for (const link of input.moduleLinks ?? []) {
      try {
        await capaRepository.addModuleLink({
          correctiveActionId: capa.id,
          moduleType: link.moduleType,
          linkedId: link.linkedId,
          metadata: (link.metadata ?? {}) as import('@prisma/client').Prisma.InputJsonValue,
        });
      } catch (e: unknown) {
        if (e && typeof e === 'object' && 'code' in e && e.code !== 'P2002') throw e;
      }
    }

    for (const attachment of input.attachments ?? []) {
      await this.addAttachment({
        correctiveActionId: capa.id,
        companyId: input.companyId,
        attachment,
      });
    }

    logger.info('corrective action created', {
      correctiveActionId: capa.id,
      sourceType: input.sourceType,
      priority: priority.priority,
    });

    const reloaded = await capaRepository.reload(capa.id, input.companyId);
    return toCapaDto(reloaded!);
  },

  async assign(input: {
    correctiveActionId: string;
    companyId: string;
    assigneeId: string;
    assignedBy: string;
  }) {
    const capa = await capaRepository.findById(input.correctiveActionId, input.companyId);
    if (!capa) throw new NotFoundError('Corrective action not found');

    if (['closed', 'verified', 'cancelled'].includes(capa.status)) {
      throw new ConflictError(`Cannot assign CAPA in status: ${capa.status}`);
    }

    await capaRepository.addAssignment({
      correctiveActionId: input.correctiveActionId,
      assigneeId: input.assigneeId,
      assignedBy: input.assignedBy,
    });

    if (capa.status === CorrectiveActionStatus.open || capa.status === CorrectiveActionStatus.draft) {
      await transitionStatus(input.correctiveActionId, input.companyId, CorrectiveActionStatus.assigned);
    }

    logger.info('corrective action assigned', {
      correctiveActionId: input.correctiveActionId,
      assigneeId: input.assigneeId,
    });

    const reloaded = await capaRepository.reload(input.correctiveActionId, input.companyId);
    return toCapaDto(reloaded!);
  },

  async escalate(input: {
    correctiveActionId: string;
    companyId: string;
    reason?: string;
    level?: number;
  }) {
    const capa = await capaRepository.findById(input.correctiveActionId, input.companyId);
    if (!capa) throw new NotFoundError('Corrective action not found');

    const trigger =
      input.level != null
        ? { level: input.level, reason: input.reason ?? 'Manual escalation', shouldNotify: true }
        : escalationEngine.evaluate({
            dueDate: capa.dueDate,
            severity: capa.severity,
            sifLinked: capa.sourceType === 'sif_heca',
            hecaLinked: capa.sourceType === 'sif_heca',
            equipmentUnsafe: !!capa.equipmentId,
            currentLevel: capa.escalationLevel,
            status: capa.status,
          });

    if (!trigger) {
      throw new BadRequestError('No escalation warranted for this corrective action');
    }

    if (trigger.level <= capa.escalationLevel) {
      throw new ConflictError(`Already escalated to level ${capa.escalationLevel}`);
    }

    await capaRepository.addEscalation({
      correctiveActionId: input.correctiveActionId,
      level: trigger.level,
      reason: input.reason ?? trigger.reason,
    });

    await capaRepository.update(input.correctiveActionId, input.companyId, {
      escalationLevel: trigger.level,
      priority: trigger.level >= 4 ? 'critical' : capa.priority,
    });

    logger.info('corrective action escalated', {
      correctiveActionId: input.correctiveActionId,
      level: trigger.level,
    });

    const reloaded = await capaRepository.reload(input.correctiveActionId, input.companyId);
    return { ...toCapaDto(reloaded!), escalation: trigger };
  },

  async verify(input: {
    correctiveActionId: string;
    companyId: string;
    verifiedBy: string;
    notes?: string;
    outcome?: 'approved' | 'rejected';
    verifierRoles: string[];
  }) {
    verificationEngine.assertRole(input.verifierRoles);

    const capa = await capaRepository.findById(input.correctiveActionId, input.companyId);
    if (!capa) throw new NotFoundError('Corrective action not found');

    const outcome = input.outcome ?? 'approved';

    if (['closed', 'verified', 'cancelled'].includes(capa.status)) {
      throw new ConflictError(`Cannot verify CAPA in status: ${capa.status}`);
    }

    if (capa.status === CorrectiveActionStatus.assigned) {
      await transitionStatus(
        input.correctiveActionId,
        input.companyId,
        CorrectiveActionStatus.in_progress,
      );
    }

    await capaRepository.addVerification({
      correctiveActionId: input.correctiveActionId,
      verifiedBy: input.verifiedBy,
      notes: input.notes,
      outcome,
    });

    const nextStatus = verificationEngine.outcomeToStatus(outcome);
    await capaRepository.update(input.correctiveActionId, input.companyId, {
      status: nextStatus as CorrectiveActionStatus,
    });

    logger.info('corrective action verified', {
      correctiveActionId: input.correctiveActionId,
      outcome,
    });

    const reloaded = await capaRepository.reload(input.correctiveActionId, input.companyId);
    return toCapaDto(reloaded!);
  },

  async addAttachment(input: {
    correctiveActionId: string;
    companyId: string;
    attachment: EvidenceAttachment;
  }) {
    const capa = await capaRepository.findById(input.correctiveActionId, input.companyId);
    if (!capa) throw new NotFoundError('Corrective action not found');

    const registered = await attachmentEngine.registerEvidence({
      correctiveActionId: input.correctiveActionId,
      companyId: input.companyId,
      attachment: input.attachment,
    });

    await capaRepository.addAttachment({
      correctiveActionId: input.correctiveActionId,
      fileName: input.attachment.fileName,
      mimeType: input.attachment.mimeType,
      storageKey: registered.storageKey ?? input.attachment.storageKey,
      dataUrl: input.attachment.dataUrl,
      phase: input.attachment.phase ?? 'evidence',
    });

    if (
      capa.status === CorrectiveActionStatus.assigned ||
      capa.status === CorrectiveActionStatus.open
    ) {
      await capaRepository.update(input.correctiveActionId, input.companyId, {
        status: CorrectiveActionStatus.in_progress,
      });
    }

    const reloaded = await capaRepository.reload(input.correctiveActionId, input.companyId);
    return toCapaDto(reloaded!);
  },

  async getById(id: string, companyId: string) {
    const capa = await capaRepository.findById(id, companyId);
    if (!capa) throw new NotFoundError('Corrective action not found');
    return toCapaDto(capa);
  },

  async syncOffline(input: {
    deviceId: string;
    companyId: string;
    userId: string;
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
