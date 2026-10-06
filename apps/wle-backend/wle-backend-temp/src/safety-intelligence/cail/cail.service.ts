import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CailStatus, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { CAIL_TRANSITIONS } from './cail.types';
import { CailScopeService, type CailActor } from './cail-scope.service';
import type { CreateCailDto } from '../dto/create-cail.dto';
import type { UpdateCailDto } from '../dto/update-cail.dto';
import type { ResolveCailDto } from '../dto/resolve-cail.dto';
import { LessonsLearnedService } from '../lessons-learned/lessons-learned.service';
import { SafetyIntelligenceAiService } from '../ai/safety-intelligence-ai.service';
import { CailCopilotEnrichmentService } from './cail-copilot-enrichment.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { NOTIFICATION_TYPES } from '../../notifications/notification-types';
import { VsiEventService } from '../events/vsi-event.service';

const includeDetail = {
  project: { select: { id: true, name: true, code: true } },
  ownerCompany: { select: { id: true, name: true } },
  assignedUser: { select: { id: true, username: true } },
  createdBy: { select: { id: true, username: true } },
  verifiedBy: { select: { id: true, username: true } },
  attachments: { orderBy: { createdAt: 'asc' as const } },
  activityLogs: { orderBy: { createdAt: 'desc' as const }, take: 50 },
};

@Injectable()
export class CailService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scope: CailScopeService,
    private readonly lessonsLearned: LessonsLearnedService,
    private readonly ai: SafetyIntelligenceAiService,
    private readonly copilotEnrich: CailCopilotEnrichmentService,
    private readonly notifications: NotificationsService,
    private readonly vsiEvents: VsiEventService,
  ) {}

  private assertTransition(from: CailStatus, to: CailStatus) {
    const allowed = CAIL_TRANSITIONS[from] ?? [];
    if (!allowed.includes(to)) {
      throw new BadRequestException(`Cannot transition from ${from} to ${to}`);
    }
  }

  private async log(
    cailId: string,
    eventType: string,
    actorId?: number,
    payload?: Record<string, unknown>,
  ) {
    await this.prisma.cailActivityLog.create({
      data: {
        cailId,
        eventType,
        actorId,
        payload: payload as Prisma.InputJsonValue,
      },
    });
  }

  async list(
    actor: CailActor,
    filters: {
      projectId?: number;
      status?: CailStatus;
      sourceType?: string;
      ownerCompanyId?: number;
    },
  ) {
    const where = this.scope.buildListWhere(actor, filters);
    return this.prisma.cailEntry.findMany({
      where: where as Prisma.CailEntryWhereInput,
      include: {
        project: { select: { id: true, name: true } },
        ownerCompany: { select: { id: true, name: true } },
        assignedUser: { select: { id: true, username: true } },
      },
      orderBy: [{ status: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
      take: 200,
    });
  }

  async getById(id: string, actor: CailActor) {
    const entry = await this.prisma.cailEntry.findUnique({
      where: { id },
      include: includeDetail,
    });
    if (!entry) throw new NotFoundException('CAIL entry not found');
    if (!this.scope.canAccessEntry(actor, entry)) {
      throw new ForbiddenException('Access denied');
    }
    return entry;
  }

  async create(dto: CreateCailDto, actor: CailActor) {
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
    });
    if (!project) throw new NotFoundException('Project not found');

    const sourceId = dto.sourceId ?? randomUUID();
    const sourceItemId = dto.sourceItemId ?? '';

    try {
      const entry = await this.prisma.cailEntry.create({
        data: {
          projectId: dto.projectId,
          ownerCompanyId: dto.ownerCompanyId,
          assignedUserId: dto.assignedUserId,
          sourceType: dto.sourceType,
          sourceId,
          sourceItemId,
          title: dto.title,
          description: dto.description,
          severity: dto.severity ?? 'medium',
          riskCategory: dto.riskCategory,
          dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
          status: 'open',
          siteId: dto.siteId,
          locationNote: dto.locationNote,
          equipmentId: dto.equipmentId,
          workerId: dto.workerId,
          tags: (dto.tags ?? []) as Prisma.InputJsonValue,
          createdByUserId: actor.id,
        },
        include: includeDetail,
      });
      await this.log(entry.id, 'created', actor.id);
      return entry;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        const existing = await this.prisma.cailEntry.findFirst({
          where: {
            sourceType: dto.sourceType,
            sourceId,
            sourceItemId,
          },
          include: includeDetail,
        });
        if (existing) return existing;
      }
      throw e;
    }
  }

  async update(id: string, dto: UpdateCailDto, actor: CailActor) {
    const entry = await this.getById(id, actor);
    const updated = await this.prisma.cailEntry.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        assignedUserId: dto.assignedUserId,
        severity: dto.severity,
        riskCategory: dto.riskCategory,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        status: dto.status,
        rootCauseCategory: dto.rootCauseCategory,
        rootCauseNotes: dto.rootCauseNotes,
        tags: dto.tags as Prisma.InputJsonValue | undefined,
      },
      include: includeDetail,
    });
    await this.log(id, 'updated', actor.id, { fields: Object.keys(dto) });
    if (dto.status && dto.status !== entry.status) {
      await this.log(id, `transition:${entry.status}->${dto.status}`, actor.id);
    }
    return updated;
  }

  async assign(
    id: string,
    data: { assignedUserId?: number; ownerCompanyId?: number },
    actor: CailActor,
  ) {
    const prior = await this.getById(id, actor);
    const updated = await this.prisma.cailEntry.update({
      where: { id },
      data: {
        assignedUserId: data.assignedUserId,
        ownerCompanyId: data.ownerCompanyId,
        status: 'in_progress',
      },
      include: includeDetail,
    });
    await this.log(id, 'assigned', actor.id, data as Record<string, unknown>);

    if (data.assignedUserId && data.assignedUserId !== prior.assignedUserId) {
      this.vsiEvents.cailAssigned({
        id,
        projectId: prior.projectId,
        ownerCompanyId: updated.ownerCompanyId,
        assignedUserId: data.assignedUserId,
        actorId: actor.id,
      });
      await this.notifications.notifyUsers({
        userIds: [data.assignedUserId],
        type: NOTIFICATION_TYPES.CAIL_ASSIGNED,
        title: 'CAIL assigned to you',
        body: `"${prior.title}" requires your attention.`,
        dedupeKey: `cail-assigned:${id}:u${data.assignedUserId}`,
        payload: { cailId: id, projectId: prior.projectId },
        companyId: updated.ownerCompanyId,
      });
    }

    return updated;
  }

  async analyzeWithAi(id: string, actor: CailActor) {
    const entry = await this.getById(id, actor);
    const openCailCount = await this.prisma.cailEntry.count({
      where: {
        projectId: entry.projectId,
        status: { in: ['open', 'in_progress', 'overdue'] },
      },
    });

    const analysis = await this.ai.analyzeCailEntry({
      title: entry.title,
      description: entry.description,
      sourceType: entry.sourceType,
      severity: entry.severity,
      riskCategory: entry.riskCategory,
      rootCauseNotes: entry.rootCauseNotes,
      projectId: entry.projectId,
      companyId: entry.ownerCompanyId,
      openCailCount,
    });

    if (analysis.copilotRun) {
      await this.copilotEnrich.persistRun(id, analysis.copilotRun);
    }
    const updated = await this.prisma.cailEntry.findUniqueOrThrow({
      where: { id },
      include: includeDetail,
    });

    await this.log(id, 'ai_analyzed', actor.id, {
      engine: analysis.engine,
    });

    return { entry: updated, analysis };
  }

  async resolve(id: string, dto: ResolveCailDto, actor: CailActor) {
    const entry = await this.getById(id, actor);
    this.assertTransition(entry.status, 'resolved');

    if (dto.attachments?.length) {
      for (const a of dto.attachments) {
        await this.prisma.cailAttachment.create({
          data: {
            cailId: id,
            phase: 'after',
            fileName: a.fileName,
            storageKey: a.storageKey,
            mimeType: a.mimeType,
            dataUrl: a.dataUrl,
            uploadedById: actor.id,
          },
        });
      }
    }

    const closedAt = new Date();
    const hours =
      (closedAt.getTime() - entry.createdAt.getTime()) / (1000 * 60 * 60);

    return this.prisma.cailEntry
      .update({
        where: { id },
        data: {
          status: 'resolved',
          closedAt,
          timeToResolveHours: hours,
          rootCauseNotes: dto.resolutionNotes ?? entry.rootCauseNotes,
          evidenceAfter: dto.evidenceAfter as Prisma.InputJsonValue | undefined,
        },
        include: includeDetail,
      })
      .then(async (row) => {
        await this.log(id, 'resolved', actor.id);
        this.vsiEvents.cailResolved({
          id,
          projectId: entry.projectId,
          ownerCompanyId: entry.ownerCompanyId,
          actorId: actor.id,
        });
        return row;
      });
  }

  async verify(id: string, actor: CailActor, note?: string) {
    const entry = await this.getById(id, actor);
    if (!this.scope.canVerify(actor, entry.projectId)) {
      throw new ForbiddenException('Only supervisors or PM can verify');
    }
    this.assertTransition(entry.status, 'verified');

    const updated = await this.prisma.cailEntry.update({
      where: { id },
      data: {
        status: 'verified',
        verifiedAt: new Date(),
        verifiedByUserId: actor.id,
      },
      include: includeDetail,
    });
    await this.log(id, 'verified', actor.id, note ? { note } : undefined);
    this.vsiEvents.cailVerified({
      id,
      projectId: entry.projectId,
      ownerCompanyId: entry.ownerCompanyId,
      actorId: actor.id,
    });

    try {
      await this.lessonsLearned.materializeFromCail(id);
    } catch {
      // Lesson materialization is best-effort
    }

    return this.prisma.cailEntry.findUnique({
      where: { id },
      include: {
        ...includeDetail,
        lessonLearned: true,
      },
    });
  }

  async cancel(id: string, actor: CailActor, reason?: string) {
    const entry = await this.getById(id, actor);
    this.assertTransition(entry.status, 'cancelled');
    const updated = await this.prisma.cailEntry.update({
      where: { id },
      data: { status: 'cancelled' },
      include: includeDetail,
    });
    await this.log(id, 'cancelled', actor.id, reason ? { reason } : undefined);
    return updated;
  }

  getWorkflowDefinition() {
    return {
      statuses: Object.keys(CAIL_TRANSITIONS),
      transitions: CAIL_TRANSITIONS,
    };
  }
}
