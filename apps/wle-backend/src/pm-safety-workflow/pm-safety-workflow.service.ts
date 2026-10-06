import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  type PmSafetyWorkflow,
  Prisma,
  type PmSafetyWorkflowStatus,
  type UserRole,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { assertActorMayPerformAction } from './pm-safety-workflow.actor-policy';
import type { CreatePmSafetyWorkflowDto } from './dto/create-pm-safety-workflow.dto';
import type { SignPmSafetyWorkerDto } from './dto/sign-pm-safety-worker.dto';
import { pmSafetyInvalidTransition } from './pm-safety-workflow.errors';
import type { PmSafetyAction } from './pm-safety-workflow.types';
import {
  PM_SAFETY_KINDS_REQUIRING_WORKER_SIGN,
  PM_SAFETY_TRANSITIONS,
  findTransition,
} from './pm-safety-workflow.types';
import { buildPmSafetyWorkflowPdfBuffer } from './pm-safety-workflow.pdf';

export const EVENT_TYPES = {
  STATUS_CHANGE: 'STATUS_CHANGE',
  NOTIFICATION: 'NOTIFICATION',
  PDF_EXPORT: 'PDF_EXPORT',
  WORKER_SIGNATURE: 'WORKER_SIGNATURE',
} as const;

export type PmSafetyActor = {
  userId: number;
  role: UserRole;
};

@Injectable()
export class PmSafetyWorkflowService {
  private readonly logger = new Logger(PmSafetyWorkflowService.name);
  constructor(private readonly prisma: PrismaService) {}

  getDefinition() {
    return {
      version: 1,
      workflow: 'VERA_PM_SAFETY',
      kinds: [
        'PERMIT_TO_WORK',
        'JOB_SAFETY_ANALYSIS',
        'JHA',
        'FLHA',
        'SIF',
        'HECA',
        'ENERGY_WHEEL',
        'INSPECTION',
      ],
      statuses: [
        'DRAFT',
        'SUBMITTED',
        'UNDER_REVIEW',
        'APPROVED',
        'REJECTED',
        'CLOSED',
        'CANCELLED',
      ],
      kindsRequiringWorkerSignBeforeSubmit:
        PM_SAFETY_KINDS_REQUIRING_WORKER_SIGN,
      transitions: PM_SAFETY_TRANSITIONS,
      notificationChannels: ['EMAIL_STUB', 'SMS_STUB', 'IN_APP_STUB'],
      permissionHints: {
        workerSignRoles: ['WORKER', 'ADMIN'],
        supervisorRoles: ['SUPERVISOR', 'ADMIN'],
        projectManagerRoles: ['PROJECT_MANAGER', 'ADMIN'],
        actorHeaders: ['x-pm-actor-user-id', 'x-pm-actor-role'],
      },
    };
  }

  async list(params?: { companyId?: number; status?: PmSafetyWorkflowStatus }) {
    return this.prisma.pmSafetyWorkflow.findMany({
      where: {
        companyId: params?.companyId,
        status: params?.status,
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        company: { select: { id: true, name: true } },
        site: { select: { id: true, name: true, code: true } },
        workerUser: { select: { id: true, username: true } },
        supervisorUser: { select: { id: true, username: true } },
      },
    });
  }

  async create(dto: CreatePmSafetyWorkflowDto): Promise<PmSafetyWorkflow> {
    this.logger.log(
      JSON.stringify({
        type: 'pm_safety.create.start',
        title: dto.title,
        kind: dto.kind ?? 'PERMIT_TO_WORK',
        companyId: dto.companyId ?? null,
        siteId: dto.siteId ?? null,
      }),
    );
    const validFrom = dto.validFrom ? new Date(dto.validFrom) : undefined;
    const validTo = dto.validTo ? new Date(dto.validTo) : undefined;
    if (validFrom && Number.isNaN(validFrom.getTime())) {
      throw new BadRequestException('validFrom is not a valid date');
    }
    if (validTo && Number.isNaN(validTo.getTime())) {
      throw new BadRequestException('validTo is not a valid date');
    }
    if (validFrom && validTo && validFrom.getTime() > validTo.getTime()) {
      throw new BadRequestException('validFrom must be before validTo');
    }

    const taskSteps = this.parseTaskStepsJson(dto.taskStepsJson);

    return this.prisma.$transaction(async (tx) => {
      const wf = await tx.pmSafetyWorkflow.create({
        data: {
          title: dto.title.trim(),
          kind: dto.kind ?? 'PERMIT_TO_WORK',
          companyId: dto.companyId ?? null,
          siteId: dto.siteId ?? null,
          workDescription: dto.workDescription?.trim() ?? null,
          hazardSummary: dto.hazardSummary?.trim() ?? null,
          controlMeasures: dto.controlMeasures?.trim() ?? null,
          jobLocation: dto.jobLocation?.trim() ?? null,
          taskStepsJson: taskSteps ?? undefined,
          validFrom: validFrom ?? null,
          validTo: validTo ?? null,
        },
      });

      await this.appendEventTx(tx, wf.id, EVENT_TYPES.STATUS_CHANGE, null, {
        initial: true,
        status: wf.status,
      });
      await this.createAuditLogTx(tx, {
        action: 'pm_safety.created',
        entity: 'PmSafetyWorkflow',
        entityId: wf.id,
        metadata: {
          status: wf.status,
          kind: wf.kind,
          companyId: wf.companyId,
          siteId: wf.siteId,
        },
      });

      return wf;
    });
  }

  async findOne(id: number) {
    const wf = await this.prisma.pmSafetyWorkflow.findUnique({
      where: { id },
      include: {
        company: { select: { id: true, name: true } },
        site: { select: { id: true, name: true, code: true } },
        workerUser: { select: { id: true, username: true } },
        supervisorUser: { select: { id: true, username: true } },
      },
    });
    if (!wf) throw new NotFoundException('Workflow not found');
    return wf;
  }

  /** Resolved UI state: next actions + labels */
  async getState(id: number) {
    const wf = await this.findOne(id);
    const next = PM_SAFETY_TRANSITIONS.filter((t) => t.from === wf.status).map(
      (t) => ({
        action: t.action,
        to: t.to,
        label: t.label,
      }),
    );
    return { workflow: wf, availableActions: next };
  }

  /**
   * Worker attestation (typed signature). Requires `x-pm-actor-*` headers on the controller.
   * Allowed roles: WORKER, ADMIN.
   */
  async signWorker(
    id: number,
    dto: SignPmSafetyWorkerDto,
    actor: PmSafetyActor,
  ): Promise<PmSafetyWorkflow> {
    this.logger.log(
      JSON.stringify({
        type: 'pm_safety.sign_worker.start',
        workflowId: id,
        actorUserId: actor.userId,
        actorRole: actor.role,
      }),
    );
    this.assertWorkerSignRole(actor);

    const wf = await this.prisma.pmSafetyWorkflow.findUnique({ where: { id } });
    if (!wf) throw new NotFoundException('Workflow not found');
    if (wf.status !== 'DRAFT') {
      throw new BadRequestException(
        'Worker signature is only allowed while the workflow is in DRAFT',
      );
    }

    const now = new Date();
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.pmSafetyWorkflow.update({
        where: { id },
        data: {
          workerUserId: actor.userId,
          workerSignedAt: now,
          workerSignatureText: dto.attestationText.trim(),
        },
      });

      await this.appendEventTx(tx, wf.id, EVENT_TYPES.WORKER_SIGNATURE, null, {
        userId: actor.userId,
        signedAt: now.toISOString(),
      });
      await this.createAuditLogTx(tx, {
        action: 'pm_safety.worker_signed',
        entity: 'PmSafetyWorkflow',
        entityId: wf.id,
        metadata: { actorUserId: actor.userId, actorRole: actor.role },
      });

      await this.appendEventTx(
        tx,
        wf.id,
        EVENT_TYPES.NOTIFICATION,
        'IN_APP_STUB',
        {
          template: 'PM_SAFETY_WORKER_SIGNED',
          workflowId: wf.id,
          title: wf.title,
          note: 'Stub: notify responsible party that the worker signed the assessment.',
        },
      );

      return updated;
    });
  }

  /**
   * State transition. {@link actor} is required (via headers) for permission checks.
   * Approvals record supervisor user + optional note as supervisor attestation.
   */
  async transition(
    id: number,
    action: PmSafetyAction,
    actor: PmSafetyActor,
    note?: string,
  ): Promise<PmSafetyWorkflow> {
    this.logger.log(
      JSON.stringify({
        type: 'pm_safety.transition.start',
        workflowId: id,
        action,
        actorUserId: actor.userId,
        actorRole: actor.role,
      }),
    );

    const wf = await this.prisma.pmSafetyWorkflow.findUnique({
      where: { id },
    });
    if (!wf) throw new NotFoundException('Workflow not found');

    const edge = findTransition(wf.status, action);
    if (!edge) {
      throw pmSafetyInvalidTransition({ status: wf.status, action });
    }

    assertActorMayPerformAction(action, actor.role);

    if (action === 'submit') {
      if (
        PM_SAFETY_KINDS_REQUIRING_WORKER_SIGN.includes(wf.kind) &&
        !wf.workerSignedAt
      ) {
        throw new BadRequestException({
          code: 'PM_SAFETY_WORKER_SIGN_REQUIRED',
          message: `Workflow kind ${wf.kind} requires a worker signature before submit`,
          kind: wf.kind,
        });
      }
    }

    const now = new Date();
    const extraData: Prisma.PmSafetyWorkflowUpdateInput = {};

    if (action === 'approve' || action === 'reject') {
      extraData.supervisorUser = { connect: { id: actor.userId } };
      extraData.supervisorApprovedAt = now;
      extraData.supervisorSignatureText =
        note?.trim() ||
        (action === 'approve'
          ? 'Supervisor approval recorded in VERA PM'
          : 'Supervisor rejection recorded in VERA PM');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.pmSafetyWorkflow.update({
        where: { id },
        data: {
          status: edge.to,
          ...extraData,
        },
      });

      await this.appendEventTx(tx, wf.id, EVENT_TYPES.STATUS_CHANGE, null, {
        from: wf.status,
        to: edge.to,
        action,
        note: note?.trim() ?? null,
        actorUserId: actor.userId,
        actorRole: actor.role,
      });
      await this.createAuditLogTx(tx, {
        action: 'pm_safety.transition',
        entity: 'PmSafetyWorkflow',
        entityId: wf.id,
        metadata: {
          from: wf.status,
          to: edge.to,
          action,
          actorUserId: actor.userId,
          actorRole: actor.role,
        },
      });

      await this.emitNotificationStubTx(tx, updated, edge.to, action);

      return updated;
    });
  }

  /** Timeline: oldest-first (stable with `id`). */
  async listEvents(workflowId: number) {
    await this.ensureExists(workflowId);
    return this.prisma.pmSafetyWorkflowEvent.findMany({
      where: { workflowId },
      orderBy: [{ id: 'asc' }, { createdAt: 'asc' }],
    });
  }

  /** Binary PDF + audit/event side effects (call from controller with StreamableFile). */
  async exportPdfBuffer(id: number): Promise<Buffer> {
    const wf = await this.findOne(id);
    const buffer = buildPmSafetyWorkflowPdfBuffer({
      id: wf.id,
      title: wf.title,
      status: wf.status,
      kind: wf.kind,
    });

    await this.prisma.$transaction(async (tx) => {
      await this.appendEventTx(tx, wf.id, EVENT_TYPES.PDF_EXPORT, null, {
        format: 'application/pdf',
        bytes: buffer.length,
        workflowId: wf.id,
      });
      await this.createAuditLogTx(tx, {
        action: 'pm_safety.export_pdf',
        entity: 'PmSafetyWorkflow',
        entityId: wf.id,
        metadata: { bytes: buffer.length },
      });
    });

    return buffer;
  }

  private assertWorkerSignRole(actor: PmSafetyActor) {
    if (actor.role !== 'WORKER' && actor.role !== 'ADMIN') {
      throw new ForbiddenException({
        code: 'PM_SAFETY_ACTOR_FORBIDDEN',
        message: 'Only WORKER or ADMIN may record the worker signature',
        action: 'sign_worker',
        role: actor.role,
      });
    }
  }

  private parseTaskStepsJson(raw?: string): Prisma.InputJsonValue | null {
    if (raw == null || raw.trim() === '') return null;
    try {
      return JSON.parse(raw) as Prisma.InputJsonValue;
    } catch {
      throw new BadRequestException('taskStepsJson must be valid JSON');
    }
  }

  private async ensureExists(id: number): Promise<void> {
    const n = await this.prisma.pmSafetyWorkflow.count({ where: { id } });
    if (!n) throw new NotFoundException('Workflow not found');
  }

  private async appendEventTx(
    tx: Prisma.TransactionClient,
    workflowId: number,
    eventType: string,
    channel: string | null,
    payload: Record<string, unknown>,
  ) {
    await tx.pmSafetyWorkflowEvent.create({
      data: {
        workflowId,
        eventType,
        channel,
        payload: payload as Prisma.InputJsonValue,
      },
    });
  }

  private async createAuditLogTx(
    tx: Prisma.TransactionClient,
    data: {
      action: string;
      entity: string;
      entityId: number;
      metadata: Prisma.InputJsonValue;
    },
  ): Promise<void> {
    await tx.auditLog.create({
      data: {
        action: data.action,
        entityType: data.entity,
        entityId: String(data.entityId),
        metadataJson: data.metadata,
      },
    });
  }

  /** Notification pipeline stub — swap for queue / SES / Twilio */
  private async emitNotificationStubTx(
    tx: Prisma.TransactionClient,
    wf: PmSafetyWorkflow,
    newStatus: PmSafetyWorkflowStatus,
    _action: PmSafetyAction,
  ) {
    const notify: PmSafetyWorkflowStatus[] = [
      'SUBMITTED',
      'APPROVED',
      'REJECTED',
      'CANCELLED',
    ];
    if (!notify.includes(newStatus)) {
      return;
    }

    const templates: Partial<Record<PmSafetyWorkflowStatus, string>> = {
      SUBMITTED: 'PM_SAFETY_SUBMITTED',
      APPROVED: 'PM_SAFETY_APPROVED',
      REJECTED: 'PM_SAFETY_REJECTED',
      CANCELLED: 'PM_SAFETY_CANCELLED',
    };

    await this.appendEventTx(
      tx,
      wf.id,
      EVENT_TYPES.NOTIFICATION,
      'EMAIL_STUB',
      {
        template: templates[newStatus] ?? `PM_SAFETY_${newStatus}`,
        workflowId: wf.id,
        title: wf.title,
        status: newStatus,
        recipients: [],
        channel: 'EMAIL_STUB',
        dispatchedAt: null,
        note: 'Replace with real notification service',
      },
    );
  }
}
