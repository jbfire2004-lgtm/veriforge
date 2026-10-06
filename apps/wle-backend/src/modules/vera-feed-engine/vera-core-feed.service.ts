import { Injectable, Logger } from '@nestjs/common';
import { FeedSource, Prisma } from '@prisma/client';
import type { DomainEventPayload } from '../api-platform/events/domain-events';
import { DomainEvent } from '../api-platform/events/domain-events';
import { PrismaService } from '../../prisma/prisma.service';
import type { VeraCoreFeedUpsertInput } from './transformers/vera-core-feed.types';
import {
  dailyLogToFeed,
  equipmentStatusToFeed,
  projectAssignedToFeed,
  projectClosedToFeed,
  trainingCompletionToFeed,
  trainingExpiryToFeed,
  workerAchievementToFeed,
  workerVerificationToFeed,
} from './transformers/vera-core-feed.transformers';

const TRAINING_INCLUDE = {
  worker: true,
  certification: true,
} as const;

@Injectable()
export class VeraCoreFeedService {
  private readonly logger = new Logger(VeraCoreFeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async upsert(input: VeraCoreFeedUpsertInput): Promise<string> {
    const row = await this.prisma.feedItem.upsert({
      where: {
        source_externalId: {
          source: input.source,
          externalId: input.externalId,
        },
      },
      create: {
        source: input.source,
        externalId: input.externalId,
        title: input.title,
        summary: input.summary ?? null,
        body: input.body ?? null,
        publishedAt: input.publishedAt,
        companyId: input.companyId,
        workerId: input.workerId,
        projectId: input.projectId,
        url: input.url,
        metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
        rankScore: input.rankScore ?? 1,
        safetyPriority: input.safetyPriority ?? 0,
      },
      update: {
        title: input.title,
        summary: input.summary ?? undefined,
        body: input.body ?? undefined,
        publishedAt: input.publishedAt,
        metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
        rankScore: input.rankScore ?? undefined,
        safetyPriority: input.safetyPriority ?? undefined,
      },
    });
    return row.id;
  }

  async syncTrainingCompletion(
    trainingRecordId: number,
  ): Promise<string | null> {
    const record = await this.loadTrainingRecord(trainingRecordId);
    if (!record?.completedAt) return null;
    const dto = trainingCompletionToFeed(record);
    const id = await this.upsert(dto);
    await this.upsert(workerAchievementToFeed(record));
    return id;
  }

  async syncTrainingExpiry(trainingRecordId: number): Promise<string | null> {
    const record = await this.loadTrainingRecord(trainingRecordId);
    if (!record) return null;
    const dto = trainingExpiryToFeed(record);
    if (!dto) return null;
    return this.upsert(dto);
  }

  async syncEquipment(equipmentId: number): Promise<string | null> {
    const equipment = await this.prisma.equipment.findUnique({
      where: { id: equipmentId },
    });
    if (!equipment) return null;
    const dto = equipmentStatusToFeed(equipment);
    if (!dto) return null;
    return this.upsert(dto);
  }

  async syncProjectAssigned(
    projectId: number,
    workerId?: number,
  ): Promise<string | null> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) return null;

    let workerName: string | undefined;
    if (workerId) {
      const worker = await this.prisma.worker.findUnique({
        where: { id: workerId },
      });
      if (worker) workerName = `${worker.firstName} ${worker.lastName}`;
    }

    const dto = projectAssignedToFeed(project, workerName);
    dto.externalId = workerId
      ? `project-assigned-${projectId}-${workerId}`
      : `project-assigned-${projectId}`;
    return this.upsert(dto);
  }

  async syncProjectClosed(projectId: number): Promise<string | null> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) return null;
    return this.upsert(projectClosedToFeed(project));
  }

  async syncWorkerVerification(
    validationResultId: number,
  ): Promise<string | null> {
    const validation = await this.prisma.trainingValidationResult.findUnique({
      where: { id: validationResultId },
      include: {
        trainingRecord: {
          include: TRAINING_INCLUDE,
        },
      },
    });
    if (!validation) return null;
    const dto = workerVerificationToFeed(validation);
    if (!dto) return null;
    return this.upsert(dto);
  }

  /** Batch sync all Vera Core feed sources for hub refresh. */
  async syncBatch(scope: { companyId?: number; workerId?: number }): Promise<{
    training: number;
    achievements: number;
    expiry: number;
    projects: number;
    equipment: number;
    verification: number;
  }> {
    const [training, achievements, expiry, projects, equipment, verification] =
      await Promise.all([
        this.batchTrainingCompletions(scope),
        this.batchWorkerAchievements(scope),
        this.batchTrainingExpiry(scope),
        this.batchProjectUpdates(scope),
        this.batchEquipment(scope),
        this.batchWorkerVerification(scope),
      ]);
    return {
      training,
      achievements,
      expiry,
      projects,
      equipment,
      verification,
    };
  }

  async handleDomainEvent(payload: DomainEventPayload): Promise<string | null> {
    try {
      switch (payload.name) {
        case DomainEvent.TRAINING_UPLOADED:
        case DomainEvent.TRAINING_VALIDATED: {
          const id = Number(payload.entityId);
          if (!id) return null;
          const completionId = await this.syncTrainingCompletion(id);
          await this.syncTrainingExpiry(id);
          const validation =
            await this.prisma.trainingValidationResult.findFirst({
              where: { trainingRecordId: id },
              orderBy: { validatedAt: 'desc' },
            });
          if (validation) await this.syncWorkerVerification(validation.id);
          return completionId;
        }
        case DomainEvent.PROJECT_ASSIGNED: {
          if (!payload.projectId) return null;
          const workerId =
            payload.entityType === 'worker'
              ? Number(payload.entityId)
              : undefined;
          return this.syncProjectAssigned(payload.projectId, workerId);
        }
        case DomainEvent.PROJECT_CLOSED: {
          const projectId = payload.projectId ?? Number(payload.entityId);
          if (!projectId) return null;
          return this.syncProjectClosed(projectId);
        }
        case DomainEvent.EQUIPMENT_CREATED:
        case DomainEvent.EQUIPMENT_UPDATED: {
          const id = Number(payload.entityId);
          if (!id) return null;
          return this.syncEquipment(id);
        }
        case DomainEvent.COMPLIANCE_RECALC: {
          if (payload.entityType === 'training' && payload.entityId) {
            return this.syncTrainingExpiry(Number(payload.entityId));
          }
          return null;
        }
        default:
          return null;
      }
    } catch (err) {
      this.logger.warn(
        `Feed sync failed for ${payload.name}: ${
          err instanceof Error ? err.message : err
        }`,
      );
      return null;
    }
  }

  private async loadTrainingRecord(id: number) {
    return this.prisma.trainingRecord.findUnique({
      where: { id },
      include: TRAINING_INCLUDE,
    });
  }

  private async batchWorkerAchievements(scope: {
    companyId?: number;
    workerId?: number;
  }): Promise<number> {
    const where: Prisma.TrainingRecordWhereInput = {
      completedAt: { not: null },
      ...(scope.companyId ? { companyId: scope.companyId } : {}),
      ...(scope.workerId ? { workerId: scope.workerId } : {}),
    };
    const records = await this.prisma.trainingRecord.findMany({
      where,
      orderBy: { completedAt: 'desc' },
      take: 15,
      include: TRAINING_INCLUDE,
    });
    let count = 0;
    for (const r of records) {
      await this.upsert(workerAchievementToFeed(r));
      count += 1;
    }
    return count;
  }

  private async batchTrainingCompletions(scope: {
    companyId?: number;
    workerId?: number;
  }): Promise<number> {
    const where: Prisma.TrainingRecordWhereInput = {
      completedAt: { not: null },
      ...(scope.companyId ? { companyId: scope.companyId } : {}),
      ...(scope.workerId ? { workerId: scope.workerId } : {}),
    };
    const records = await this.prisma.trainingRecord.findMany({
      where,
      orderBy: { completedAt: 'desc' },
      take: 25,
      include: TRAINING_INCLUDE,
    });
    let count = 0;
    for (const r of records) {
      await this.upsert(trainingCompletionToFeed(r));
      count += 1;
    }
    return count;
  }

  private async batchTrainingExpiry(scope: {
    companyId?: number;
    workerId?: number;
  }): Promise<number> {
    const now = new Date();
    const horizon = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const records = await this.prisma.trainingRecord.findMany({
      where: {
        expiresAt: { not: null },
        OR: [
          { expiresAt: { gte: now, lte: horizon } },
          {
            expiresAt: {
              lt: now,
              gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
            },
          },
        ],
        ...(scope.companyId ? { companyId: scope.companyId } : {}),
        ...(scope.workerId ? { workerId: scope.workerId } : {}),
      },
      orderBy: { expiresAt: 'asc' },
      take: 40,
      include: TRAINING_INCLUDE,
    });
    let count = 0;
    for (const r of records) {
      const dto = trainingExpiryToFeed(r, now);
      if (dto) {
        await this.upsert(dto);
        count += 1;
      }
    }
    return count;
  }

  private async batchProjectUpdates(scope: {
    companyId?: number;
  }): Promise<number> {
    const logs = await this.prisma.coreDailyLog.findMany({
      where: scope.companyId ? { companyId: scope.companyId } : {},
      orderBy: { logDate: 'desc' },
      take: 15,
    });
    let count = 0;
    for (const log of logs) {
      await this.upsert(dailyLogToFeed(log));
      count += 1;
    }

    const projects = await this.prisma.project.findMany({
      where: {
        ...(scope.companyId ? { companyId: scope.companyId } : {}),
        status: 'ACTIVE',
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    for (const p of projects) {
      await this.upsert({
        ...projectAssignedToFeed(p),
        externalId: `project-active-${p.id}`,
        title: `Active project: ${p.name}`,
        summary: `Status: ${p.status}`,
        metadata: { eventType: 'project.snapshot', projectStatus: p.status },
      });
      count += 1;
    }
    return count;
  }

  private async batchEquipment(scope: { companyId?: number }): Promise<number> {
    const equipment = await this.prisma.equipment.findMany({
      where: {
        ...(scope.companyId ? { companyId: scope.companyId } : {}),
        OR: [{ safetyStatus: { not: 'OK' } }, { lockedOutAt: { not: null } }],
      },
      take: 20,
    });
    let count = 0;
    for (const e of equipment) {
      const dto = equipmentStatusToFeed(e);
      if (dto) {
        await this.upsert(dto);
        count += 1;
      }
    }
    return count;
  }

  private async batchWorkerVerification(scope: {
    companyId?: number;
    workerId?: number;
  }): Promise<number> {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const rows = await this.prisma.trainingValidationResult.findMany({
      where: {
        validatedAt: { gte: since },
        trainingRecordId: { not: null },
        ...(scope.workerId
          ? { trainingRecord: { workerId: scope.workerId } }
          : {}),
        ...(scope.companyId
          ? { trainingRecord: { companyId: scope.companyId } }
          : {}),
      },
      orderBy: { validatedAt: 'desc' },
      take: 20,
      include: {
        trainingRecord: { include: TRAINING_INCLUDE },
      },
    });
    let count = 0;
    for (const v of rows) {
      const dto = workerVerificationToFeed(v);
      if (dto) {
        await this.upsert(dto);
        count += 1;
      }
    }
    return count;
  }
}
