import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  ModerationCaseStatus,
  ModerationResolution,
  ModerationTargetType,
} from '@prisma/client';
import type { ModerationCase, ModerationCaseList } from '@vera/api-contract';
import { PrismaService } from '../../prisma/prisma.service';
import { ModerationResolutionService } from './moderation-resolution.service';
import { ModerationNotificationService } from './moderation-notification.service';

@Injectable()
export class ModerationQueueService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly resolution: ModerationResolutionService,
    private readonly moderationNotifications?: ModerationNotificationService,
  ) {}

  async listQueue(query: {
    status?: ModerationCaseStatus;
    targetType?: ModerationTargetType;
    page?: number;
    pageSize?: number;
  }): Promise<ModerationCaseList> {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 25, 100);
    const where = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.targetType ? { targetType: query.targetType } : {}),
    };

    const [total, rows] = await Promise.all([
      this.prisma.moderationCase.count({ where }),
      this.prisma.moderationCase.findMany({
        where,
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          reporter: { include: { worker: true } },
          autoRule: true,
        },
      }),
    ]);

    const items = await Promise.all(
      rows.map(async (r) => ({
        id: r.id,
        source: r.source as ModerationCase['source'],
        targetType: r.targetType as ModerationCase['targetType'],
        targetId: r.targetId,
        reportReason: r.reportReason,
        reportDetails: r.reportDetails,
        reporterUserId: r.reporterUserId,
        reporterName: r.reporter
          ? r.reporter.worker
            ? `${r.reporter.worker.firstName} ${r.reporter.worker.lastName}`
            : r.reporter.username
          : null,
        autoRuleName: r.autoRule?.name ?? null,
        priority: r.priority,
        status: r.status as ModerationCase['status'],
        resolution: r.resolution as ModerationCase['resolution'],
        resolutionNote: r.resolutionNote,
        targetSummary: await this.summarizeTarget(r.targetType, r.targetId),
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })),
    );

    return { items, total, page, pageSize };
  }

  async resolveCase(
    caseId: string,
    reviewerUserId: number,
    input: {
      status: ModerationCaseStatus;
      resolution?: ModerationResolution;
      resolutionNote?: string;
    },
  ): Promise<void> {
    const row = await this.prisma.moderationCase.findUnique({
      where: { id: caseId },
    });
    if (!row) throw new NotFoundException('Case not found');

    if (input.resolution && input.status === 'RESOLVED') {
      await this.resolution.applyResolution(
        row.targetType,
        row.targetId,
        input.resolution,
        reviewerUserId,
      );
    }

    await this.prisma.moderationCase.update({
      where: { id: caseId },
      data: {
        status: input.status,
        resolution: input.resolution,
        resolutionNote: input.resolutionNote,
        reviewedByUserId: reviewerUserId,
        reviewedAt: new Date(),
      },
    });

    if (
      this.moderationNotifications &&
      (input.status === 'RESOLVED' || input.status === 'DISMISSED')
    ) {
      await this.moderationNotifications.notifyCaseResolved({
        caseId,
        targetType: row.targetType,
        targetId: row.targetId,
        status: input.status,
        resolution: input.resolution,
        resolutionNote: input.resolutionNote,
        reporterUserId: row.reporterUserId,
      });
    }
  }

  async queueStats(): Promise<{
    open: number;
    inReview: number;
    autoFlaggedOpen: number;
  }> {
    const [open, inReview, autoFlaggedOpen] = await Promise.all([
      this.prisma.moderationCase.count({ where: { status: 'OPEN' } }),
      this.prisma.moderationCase.count({ where: { status: 'IN_REVIEW' } }),
      this.prisma.moderationCase.count({
        where: { status: 'OPEN', source: 'AUTO_RULE' },
      }),
    ]);
    return { open, inReview, autoFlaggedOpen };
  }

  private async summarizeTarget(
    targetType: ModerationTargetType,
    targetId: string,
  ): Promise<string | null> {
    switch (targetType) {
      case 'FEED_ITEM': {
        const r = await this.prisma.feedItem.findUnique({
          where: { id: targetId },
        });
        return r?.title ?? null;
      }
      case 'USER': {
        const uid = parseInt(targetId, 10);
        const u = await this.prisma.user.findUnique({
          where: { id: uid },
          include: { worker: true },
        });
        if (!u) return null;
        return u.worker
          ? `${u.worker.firstName} ${u.worker.lastName}`
          : u.username;
      }
      case 'EXPERT_QA_QUESTION': {
        const r = await this.prisma.expertQaQuestion.findUnique({
          where: { id: targetId },
        });
        return r?.title ?? null;
      }
      case 'EXPERT_QA_ANSWER': {
        const r = await this.prisma.expertQaAnswer.findUnique({
          where: { id: targetId },
        });
        return r ? `Answer: ${r.body.slice(0, 80)}` : null;
      }
      case 'SAFETY_ARTICLE': {
        const r = await this.prisma.safetyArticle.findUnique({
          where: { id: targetId },
        });
        return r?.title ?? null;
      }
      case 'SAFETY_COMMENT': {
        const r = await this.prisma.safetyBlogComment.findUnique({
          where: { id: targetId },
        });
        return r ? r.body.slice(0, 80) : null;
      }
      case 'JOB_POST': {
        const r = await this.prisma.jobPost.findUnique({
          where: { id: targetId },
        });
        return r?.title ?? null;
      }
      case 'SOCIAL_POST': {
        const r = await this.prisma.socialPost.findFirst({
          where: { id: targetId },
        });
        return r?.title ?? r?.body.slice(0, 80) ?? null;
      }
      default:
        return null;
    }
  }
}
