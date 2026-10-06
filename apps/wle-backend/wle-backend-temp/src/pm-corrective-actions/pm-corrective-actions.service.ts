import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CailSeverity,
  CailSourceType,
  CailStatus,
  EquipmentSafetyStatus,
  PmCorrectiveActionStatus,
  PmCorrectiveActionType,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { replayOrConflict } from '../common/prisma-errors';
import { CailEmitterService } from '../safety-intelligence/cail/cail-emitter.service';
import { InactivationService } from '../modules/vera-core/inactivation.service';
import { CapaPriorityEngine } from './capa-priority.engine';
import { CapaDueDateEngine } from './capa-due-date.engine';
import { CapaAssignmentEngine } from './capa-assignment.engine';
import { CapaEscalationEngine } from './capa-escalation.engine';
import { CapaVerificationEngine } from './capa-verification.engine';
import { SOURCE_MODULE_TO_CAIL } from './pm-capa.constants';

const includeDetail = {
  cailEntry: {
    select: { id: true, status: true, severity: true, dueDate: true },
  },
  assignees: { include: { user: { select: { id: true, username: true } } } },
  escalations: { orderBy: { triggeredAt: 'desc' as const }, take: 10 },
  verifications: { orderBy: { verifiedAt: 'desc' as const }, take: 5 },
  attachments: true,
  project: { select: { id: true, name: true } },
  equipment: { select: { id: true, name: true } },
} satisfies Prisma.PmCorrectiveActionInclude;

@Injectable()
export class PmCorrectiveActionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emitter: CailEmitterService,
    private readonly priority: CapaPriorityEngine,
    private readonly dueDate: CapaDueDateEngine,
    private readonly assignment: CapaAssignmentEngine,
    private readonly escalation: CapaEscalationEngine,
    private readonly verification: CapaVerificationEngine,
    private readonly inactivation: InactivationService,
  ) {}

  private async audit(
    actionId: string,
    eventType: string,
    actorId?: number,
    payload?: Record<string, unknown>,
  ) {
    await this.prisma.pmCorrectiveActionAuditLog.create({
      data: {
        actionId,
        eventType,
        actorId,
        payload: payload as Prisma.InputJsonValue | undefined,
      },
    });
  }

  async getCompanyConfig(companyId: number) {
    return this.prisma.pmCapaCompanyConfig.upsert({
      where: { companyId },
      create: { companyId },
      update: {},
    });
  }

  async list(filters: {
    projectId?: number;
    companyId?: number;
    status?: PmCorrectiveActionStatus;
    overdueOnly?: boolean;
  }) {
    const now = new Date();
    return this.prisma.pmCorrectiveAction.findMany({
      where: {
        deletedAt: null,
        ...(filters.projectId ? { projectId: filters.projectId } : {}),
        ...(filters.companyId ? { companyId: filters.companyId } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.overdueOnly
          ? {
              dueAt: { lt: now },
              status: {
                notIn: ['closed', 'verified', 'cancelled'],
              },
            }
          : {}),
      },
      include: includeDetail,
      orderBy: [{ priorityScore: 'desc' }, { dueAt: 'asc' }],
      take: 200,
    });
  }

  async get(id: string) {
    const row = await this.prisma.pmCorrectiveAction.findFirst({
      where: { id, deletedAt: null },
      include: {
        ...includeDetail,
        auditLogs: { orderBy: { createdAt: 'desc' }, take: 50 },
      },
    });
    if (!row) throw new NotFoundException('Corrective action not found');
    return row;
  }

  async create(input: {
    companyId: number;
    projectId: number;
    siteId?: number;
    sourceModule: string;
    sourceId: string;
    sourceItemId?: string;
    deficiencyId?: string;
    title: string;
    description?: string;
    actionType?: PmCorrectiveActionType;
    severity?: CailSeverity | string;
    createdByUserId: number;
    assignUserId?: number;
    equipmentId?: number;
    workerId?: number;
    subcontractorCompanyId?: number;
    sifLinked?: boolean;
    hecaLinked?: boolean;
    clientSyncId?: string;
    publish?: boolean;
  }) {
    if (input.clientSyncId) {
      const existing = await this.prisma.pmCorrectiveAction.findUnique({
        where: { clientSyncId: input.clientSyncId },
      });
      if (existing) return this.get(existing.id);
    }

    const config = await this.getCompanyConfig(input.companyId);
    const severity = (input.severity ?? 'medium') as CailSeverity;
    const actionType = input.actionType ?? 'permanent';

    const scores = this.priority.score({
      severity,
      actionType,
      sifLinked: input.sifLinked,
      hecaLinked: input.hecaLinked,
      equipmentUnsafe:
        !!input.equipmentId && input.sourceModule === 'equipment',
    });

    const dueAt = this.dueDate.computeDueAt(severity, {
      dueDaysLow: config.dueDaysLow,
      dueDaysMedium: config.dueDaysMedium,
      dueDaysHigh: config.dueDaysHigh,
      dueDaysCritical: config.dueDaysCritical,
    });

    const cailSource = (SOURCE_MODULE_TO_CAIL[input.sourceModule] ??
      'general') as CailSourceType;

    const cailEntry = await this.emitter.emit({
      projectId: input.projectId,
      ownerCompanyId: input.companyId,
      sourceType: cailSource,
      sourceId: input.sourceId,
      sourceItemId: input.sourceItemId ?? `pm-capa-${Date.now()}`,
      title: input.title.slice(0, 120),
      description: input.description,
      severity,
      createdByUserId: input.createdByUserId,
      assignedUserId: input.assignUserId,
      siteId: input.siteId,
      equipmentId: input.equipmentId,
      workerId: input.workerId,
      dueDate: dueAt,
      tags: ['pm-capa', input.sourceModule],
    });

    const status: PmCorrectiveActionStatus =
      input.publish === false
        ? 'draft'
        : input.assignUserId
        ? 'assigned'
        : 'open';

    let action;
    try {
      action = await this.prisma.pmCorrectiveAction.create({
        data: {
          cailEntryId: cailEntry.id,
          companyId: input.companyId,
          projectId: input.projectId,
          siteId: input.siteId,
          sourceModule: input.sourceModule,
          sourceId: input.sourceId,
          sourceItemId: input.sourceItemId ?? '',
          deficiencyId: input.deficiencyId,
          actionType,
          status,
          title: input.title,
          description: input.description,
          severityScore: scores.severityScore,
          priorityScore: scores.priorityScore,
          dueAt,
          equipmentId: input.equipmentId,
          workerId: input.workerId,
          subcontractorCompanyId: input.subcontractorCompanyId,
          createdByUserId: input.createdByUserId,
          clientSyncId: input.clientSyncId,
        },
        include: includeDetail,
      });
    } catch (err) {
      const replayed = await replayOrConflict(err, async () => {
        if (!input.clientSyncId) return null;
        return this.prisma.pmCorrectiveAction.findUnique({
          where: { clientSyncId: input.clientSyncId },
        });
      });
      return this.get(replayed.id);
    }

    if (input.assignUserId) {
      await this.assign(
        action.id,
        { userId: input.assignUserId, role: 'primary' },
        input.createdByUserId,
      );
    }

    await this.audit(action.id, 'created', input.createdByUserId, { scores });
    return this.get(action.id);
  }

  async assign(
    actionId: string,
    data: {
      userId?: number;
      workerId?: number;
      role?: 'primary' | 'secondary' | 'delegate' | 'verifier';
    },
    actorId?: number,
  ) {
    const action = await this.get(actionId);
    await this.prisma.pmCorrectiveActionAssignee.create({
      data: {
        actionId,
        userId: data.userId,
        workerId: data.workerId,
        role: data.role ?? 'primary',
      },
    });

    if (data.userId) {
      await this.prisma.cailEntry.update({
        where: { id: action.cailEntryId },
        data: { assignedUserId: data.userId, status: 'in_progress' },
      });
    }

    await this.prisma.pmCorrectiveAction.update({
      where: { id: actionId },
      data: { status: 'assigned' },
    });

    await this.audit(actionId, 'assigned', actorId, data);
    return this.get(actionId);
  }

  async delegate(actionId: string, toUserId: number, actorId: number) {
    return this.assign(
      actionId,
      { userId: toUserId, role: 'delegate' },
      actorId,
    );
  }

  async updateDraft(
    actionId: string,
    data: { title?: string; description?: string },
    actorId?: number,
  ) {
    const action = await this.get(actionId);
    if (!['draft', 'open', 'assigned', 'in_progress'].includes(action.status)) {
      throw new BadRequestException(
        'Only open corrective actions can be edited',
      );
    }
    await this.prisma.pmCorrectiveAction.update({
      where: { id: actionId },
      data: {
        ...(data.title != null ? { title: data.title } : {}),
        ...(data.description != null ? { description: data.description } : {}),
      },
    });
    await this.audit(actionId, 'draft_updated', actorId, data);
    return this.get(actionId);
  }

  async markInProgress(actionId: string, actorId?: number) {
    await this.prisma.pmCorrectiveAction.update({
      where: { id: actionId },
      data: { status: 'in_progress' },
    });
    await this.prisma.cailEntry.update({
      where: { id: (await this.get(actionId)).cailEntryId },
      data: { status: 'in_progress' },
    });
    await this.audit(actionId, 'in_progress', actorId);
    return this.get(actionId);
  }

  async submitForVerification(actionId: string, actorId: number) {
    await this.prisma.pmCorrectiveAction.update({
      where: { id: actionId },
      data: { status: 'verification_pending' },
    });
    await this.audit(actionId, 'verification_requested', actorId);
    return this.get(actionId);
  }

  async verify(
    actionId: string,
    input: {
      outcome: 'approve' | 'reject';
      role: string;
      notes?: string;
      evidenceJson?: unknown[];
    },
    verifierUserId: number,
  ) {
    this.verification.assertRole(input.role);
    const action = await this.get(actionId);

    await this.prisma.pmCorrectiveActionVerification.create({
      data: {
        actionId,
        verifierUserId,
        role: input.role,
        outcome: input.outcome,
        notes: input.notes,
        evidenceJson: (input.evidenceJson ?? []) as Prisma.InputJsonValue,
      },
    });

    const nextStatus = this.verification.nextStatus(input.outcome);

    if (input.outcome === 'approve') {
      await this.prisma.pmCorrectiveAction.update({
        where: { id: actionId },
        data: {
          status: 'verified',
          verifiedAt: new Date(),
          verifiedByUserId: verifierUserId,
          closedAt: new Date(),
        },
      });
      await this.prisma.cailEntry.update({
        where: { id: action.cailEntryId },
        data: {
          status: 'verified',
          verifiedAt: new Date(),
          verifiedByUserId: verifierUserId,
          closedAt: new Date(),
        },
      });

      if (action.deficiencyId) {
        await this.prisma.pmInspectionDeficiency.update({
          where: { id: action.deficiencyId },
          data: {
            status: 'closed',
            verifiedAt: new Date(),
            closedAt: new Date(),
          },
        });
      }

      if (action.equipmentId) {
        await this.tryUnblockEquipment(action.equipmentId, verifierUserId);
      }
    } else {
      await this.prisma.pmCorrectiveAction.update({
        where: { id: actionId },
        data: { status: 'in_progress' },
      });
      await this.prisma.cailEntry.update({
        where: { id: action.cailEntryId },
        data: { status: 'in_progress' },
      });
    }

    await this.audit(
      actionId,
      `verify_${input.outcome}`,
      verifierUserId,
      input,
    );
    return this.get(actionId);
  }

  private async tryUnblockEquipment(equipmentId: number, userId: number) {
    const openCapa = await this.prisma.pmCorrectiveAction.count({
      where: {
        equipmentId,
        status: { notIn: ['verified', 'closed', 'cancelled'] },
      },
    });
    if (openCapa > 0) return;

    const equipment = await this.prisma.equipment.findUnique({
      where: { id: equipmentId },
    });
    if (!equipment?.lockedOutAt) return;

    await this.prisma.equipment.update({
      where: { id: equipmentId },
      data: {
        safetyStatus: EquipmentSafetyStatus.OK,
        lockedOutAt: null,
        lockoutReason: null,
      },
    });
    await this.prisma.equipmentLockout.updateMany({
      where: { equipmentId, unlockedAt: null },
      data: { unlockedAt: new Date(), unlockedByUserId: userId },
    });
  }

  async runEscalations(projectId: number) {
    const open = await this.prisma.pmCorrectiveAction.findMany({
      where: {
        projectId,
        deletedAt: null,
        status: { notIn: ['closed', 'verified', 'cancelled', 'draft'] },
      },
    });

    const triggered = [];
    for (const action of open) {
      const trig = this.escalation.evaluate({
        dueAt: action.dueAt,
        severity:
          action.severityScore >= 75
            ? 'critical'
            : action.severityScore >= 50
            ? 'high'
            : 'medium',
        sifLinked: action.sourceModule === 'sif_heca',
        hecaLinked: !!action.sourceModule,
        equipmentUnsafe: !!action.equipmentId,
        currentLevel: action.escalationLevel,
        status: action.status,
      });
      if (!trig || trig.level <= action.escalationLevel) continue;

      await this.prisma.pmCorrectiveActionEscalation.create({
        data: {
          actionId: action.id,
          level: trig.level,
          reason: trig.reason,
        },
      });
      await this.prisma.pmCorrectiveAction.update({
        where: { id: action.id },
        data: {
          escalationLevel: trig.level,
          overdueAt:
            action.dueAt && action.dueAt < new Date()
              ? new Date()
              : action.overdueAt,
        },
      });
      await this.prisma.cailEntry.update({
        where: { id: action.cailEntryId },
        data: { status: 'overdue' as CailStatus },
      });

      if (action.equipmentId && trig.level >= 3) {
        await this.inactivation.lockoutEquipment(
          action.equipmentId,
          `Overdue CAPA: ${action.title}`,
        );
      }

      triggered.push({ actionId: action.id, ...trig });
    }
    return triggered;
  }

  async addAttachment(
    actionId: string,
    data: {
      storageKey?: string;
      fileName?: string;
      mimeType?: string;
      dataUrl?: string;
      coreFileId?: number;
      phase?: string;
      clientSyncId?: string;
    },
    actorId?: number,
  ) {
    await this.get(actionId);
    const att = await this.prisma.pmCorrectiveActionAttachment.create({
      data: { actionId, ...data },
    });
    await this.audit(actionId, 'attachment_added', actorId, {
      attachmentId: att.id,
    });
    return att;
  }

  async addSignature(
    actionId: string,
    data: { role: string; signatureData?: string; signerUserId?: number },
    actorId?: number,
  ) {
    await this.get(actionId);
    const sig = await this.prisma.pmCorrectiveActionSignature.create({
      data: {
        actionId,
        role: data.role,
        signatureData: data.signatureData,
        signerUserId: data.signerUserId ?? actorId,
      },
    });
    await this.audit(actionId, 'signature_added', actorId);
    return sig;
  }

  async workerAccessCheck(workerId: number, projectId: number) {
    const openWhere = {
      projectId,
      deletedAt: null,
      status: {
        notIn: [
          'verified',
          'closed',
          'cancelled',
        ] as PmCorrectiveActionStatus[],
      },
    };

    const openAssigned = await this.prisma.pmCorrectiveAction.count({
      where: {
        ...openWhere,
        OR: [{ workerId }, { assignees: { some: { workerId } } }],
      },
    });

    const criticalOpen = await this.prisma.pmCorrectiveAction.count({
      where: {
        ...openWhere,
        severityScore: { gte: 75 },
        OR: [{ workerId }, { assignees: { some: { workerId } } }],
      },
    });

    const overdue = await this.prisma.pmCorrectiveAction.count({
      where: {
        ...openWhere,
        dueAt: { lt: new Date() },
        OR: [{ workerId }, { assignees: { some: { workerId } } }],
      },
    });

    const allowed = openAssigned === 0 && criticalOpen === 0 && overdue === 0;
    return {
      allowed,
      openAssigned,
      criticalOpen,
      overdueCount: overdue,
    };
  }

  async analytics(projectId: number) {
    const [total, open, overdue, verified] = await Promise.all([
      this.prisma.pmCorrectiveAction.count({
        where: { projectId, deletedAt: null },
      }),
      this.prisma.pmCorrectiveAction.count({
        where: {
          projectId,
          deletedAt: null,
          status: { notIn: ['verified', 'closed', 'cancelled'] },
        },
      }),
      this.prisma.pmCorrectiveAction.count({
        where: {
          projectId,
          deletedAt: null,
          dueAt: { lt: new Date() },
          status: { notIn: ['verified', 'closed', 'cancelled'] },
        },
      }),
      this.prisma.pmCorrectiveAction.count({
        where: { projectId, status: { in: ['verified', 'closed'] } },
      }),
    ]);

    const byType = await this.prisma.pmCorrectiveAction.groupBy({
      by: ['actionType'],
      where: { projectId, deletedAt: null },
      _count: true,
    });

    return {
      total,
      open,
      overdue,
      verified,
      closureRate: total > 0 ? Math.round((verified / total) * 100) : 100,
      byType,
      leadingIndicatorScore: Math.max(0, 100 - overdue * 5 - open),
    };
  }

  async syncOffline(payload: {
    clientSyncId: string;
    companyId: number;
    projectId: number;
    createdByUserId: number;
    title: string;
    description?: string;
    sourceModule: string;
    sourceId: string;
    actionType?: PmCorrectiveActionType;
    severity?: string;
    assignUserId?: number;
    publish?: boolean;
  }) {
    const existing = await this.prisma.pmCorrectiveAction.findUnique({
      where: { clientSyncId: payload.clientSyncId },
    });
    if (existing) return this.get(existing.id);

    return this.create({ ...payload, publish: payload.publish ?? true });
  }
}
