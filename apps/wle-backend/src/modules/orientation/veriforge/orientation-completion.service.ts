import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { OrientationCompletionStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditLogService } from '../../../audit/audit-log.service';
import { AuditAction, AuditEntityType } from '../../../audit/audit-actions';
import { EventBusService } from '../../api-platform/events/event-bus.service';
import { DomainEvent } from '../../api-platform/events/domain-events';
import { replayOrConflict } from '../../../common/prisma-errors';
import { computeExpiresOn } from './orientation-validation';
import type {
  CreateOrientationCompletionInput,
  OrientationExpiryRules,
} from './orientation.types';

@Injectable()
export class OrientationCompletionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
    @Optional() private readonly events?: EventBusService,
  ) {}

  async create(input: CreateOrientationCompletionInput) {
    const orientation = await this.prisma.orientationDefinition.findUnique({
      where: { id: input.orientationId },
    });
    if (!orientation) {
      throw new NotFoundException('Orientation definition not found');
    }
    if (orientation.companyId !== input.companyId) {
      throw new BadRequestException(
        'orientationId does not belong to companyId',
      );
    }

    const worker = await this.prisma.worker.findUnique({
      where: { id: input.workerId },
    });
    if (!worker) throw new NotFoundException('Worker not found');

    if (input.clientSyncId) {
      const existing = await this.prisma.orientationCompletion.findUnique({
        where: { clientSyncId: input.clientSyncId },
      });
      if (existing) return existing;
    }

    const status: OrientationCompletionStatus =
      input.status ??
      (input.score != null && input.score < 70 ? 'failed' : 'completed');

    const completedOn =
      status === 'completed' || status === 'failed' ? new Date() : null;
    const expiresOn =
      status === 'completed'
        ? computeExpiresOn(
            completedOn!,
            orientation.expiryRules as OrientationExpiryRules,
          )
        : null;

    let row;
    try {
      row = await this.prisma.orientationCompletion.create({
        data: {
          workerId: input.workerId,
          orientationId: input.orientationId,
          companyId: input.companyId,
          projectId: input.projectId,
          completedOn,
          expiresOn,
          score: input.score,
          status,
          clientSyncId: input.clientSyncId,
        },
      });
    } catch (err) {
      row = await replayOrConflict(err, async () => {
        if (!input.clientSyncId) return null;
        return this.prisma.orientationCompletion.findUnique({
          where: { clientSyncId: input.clientSyncId },
        });
      });
      return row;
    }

    if (input.actorId) {
      await this.auditLog.logAudit(
        { id: input.actorId, companyId: input.companyId },
        AuditAction.ORIENTATION_COMPLETION_RECORDED,
        {
          type: AuditEntityType.ORIENTATION_COMPLETION,
          id: row.id,
          tenantId: input.companyId,
        },
        { status: row.status, workerId: row.workerId },
      );
    }

    if (status === 'completed') {
      this.events?.emit({
        name: DomainEvent.ORIENTATION_COMPLETED,
        occurredAt: new Date().toISOString(),
        actorId: input.actorId,
        companyId: input.companyId,
        projectId: input.projectId,
        entityType: 'OrientationCompletion',
        entityId: row.id,
        data: {
          workerId: row.workerId,
          orientationId: row.orientationId,
          expiresOn: row.expiresOn?.toISOString() ?? null,
          score: row.score,
        },
      });
    }

    return row;
  }

  async list(filters: { workerId?: number; orientationId?: string }) {
    if (!filters.workerId && !filters.orientationId) {
      throw new BadRequestException('workerId or orientationId is required');
    }
    return this.prisma.orientationCompletion.findMany({
      where: {
        ...(filters.workerId != null ? { workerId: filters.workerId } : {}),
        ...(filters.orientationId
          ? { orientationId: filters.orientationId }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        orientation: {
          select: { id: true, title: true, type: true, version: true },
        },
      },
    });
  }

  /** Mark completions past expiresOn as expired (callable from cron). */
  async expireDue(companyId?: number) {
    const now = new Date();
    const result = await this.prisma.orientationCompletion.updateMany({
      where: {
        status: 'completed',
        expiresOn: { lt: now },
        ...(companyId != null ? { companyId } : {}),
      },
      data: { status: 'expired' },
    });
    return { expired: result.count };
  }
}
