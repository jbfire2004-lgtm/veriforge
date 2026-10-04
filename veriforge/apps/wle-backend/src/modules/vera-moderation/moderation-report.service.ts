import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  ModerationReportReason,
  ModerationTargetType,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ModerationAutoRulesService } from './moderation-auto-rules.service';
import { ModerationResolutionService } from './moderation-resolution.service';

@Injectable()
export class ModerationReportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly autoRules: ModerationAutoRulesService,
    private readonly resolution: ModerationResolutionService,
  ) {}

  async reportPost(
    reporterUserId: number,
    targetType: ModerationTargetType,
    targetId: string,
    reason: ModerationReportReason,
    details?: string,
  ): Promise<{ caseId: string }> {
    await this.ensureTargetExists(targetType, targetId);

    const dup = await this.prisma.moderationCase.findFirst({
      where: {
        reporterUserId,
        targetType,
        targetId,
        status: { in: ['OPEN', 'IN_REVIEW'] },
      },
    });
    if (dup) throw new ConflictException('You already reported this content');

    const text = await this.fetchTargetText(targetType, targetId);
    const caseRow = await this.prisma.moderationCase.create({
      data: {
        source: 'USER_REPORT',
        targetType,
        targetId,
        reportReason: reason,
        reportDetails: details,
        reporterUserId,
        priority: this.priorityForReason(reason),
        status: 'OPEN',
      },
    });

    await this.runAutoRules(targetType, targetId, text);
    return { caseId: caseRow.id };
  }

  async reportUser(
    reporterUserId: number,
    reportedUserId: number,
    reason: ModerationReportReason,
    details?: string,
  ): Promise<{ caseId: string }> {
    if (reporterUserId === reportedUserId) {
      throw new ConflictException('Cannot report yourself');
    }
    const user = await this.prisma.user.findUnique({
      where: { id: reportedUserId },
    });
    if (!user) throw new NotFoundException('User not found');

    const dup = await this.prisma.moderationCase.findFirst({
      where: {
        reporterUserId,
        targetType: 'USER',
        targetId: String(reportedUserId),
        status: { in: ['OPEN', 'IN_REVIEW'] },
      },
    });
    if (dup) throw new ConflictException('You already reported this user');

    const caseRow = await this.prisma.moderationCase.create({
      data: {
        source: 'USER_REPORT',
        targetType: 'USER',
        targetId: String(reportedUserId),
        reportReason: reason,
        reportDetails: details,
        reporterUserId,
        priority: this.priorityForReason(reason),
        status: 'OPEN',
      },
    });

    return { caseId: caseRow.id };
  }

  private async runAutoRules(
    targetType: ModerationTargetType,
    targetId: string,
    text: string,
  ): Promise<void> {
    const hits = await this.autoRules.evaluateContent(
      targetType,
      targetId,
      text,
    );
    for (const hit of hits) {
      const existing = await this.prisma.moderationCase.findFirst({
        where: {
          source: 'AUTO_RULE',
          autoRuleId: hit.ruleId,
          targetType,
          targetId,
          status: { in: ['OPEN', 'IN_REVIEW'] },
        },
      });
      if (existing) continue;

      await this.prisma.moderationCase.create({
        data: {
          source: 'AUTO_RULE',
          targetType,
          targetId,
          autoRuleId: hit.ruleId,
          priority: hit.priority,
          status: 'OPEN',
          metadata: { autoFlagged: true },
        },
      });

      if (hit.action === 'AUTO_HIDE') {
        await this.resolution.applyContentHide(targetType, targetId);
      }
    }
  }

  private priorityForReason(reason: ModerationReportReason): number {
    if (reason === 'SAFETY_RISK' || reason === 'HARASSMENT') return 100;
    if (reason === 'IMPERSONATION') return 80;
    if (reason === 'SPAM') return 50;
    return 30;
  }

  private async ensureTargetExists(
    targetType: ModerationTargetType,
    targetId: string,
  ): Promise<void> {
    const ok = await this.targetExists(targetType, targetId);
    if (!ok) throw new NotFoundException('Content not found');
  }

  private async targetExists(
    targetType: ModerationTargetType,
    targetId: string,
  ): Promise<boolean> {
    switch (targetType) {
      case 'FEED_ITEM':
        return !!(await this.prisma.feedItem.findUnique({
          where: { id: targetId },
        }));
      case 'EXPERT_QA_QUESTION':
        return !!(await this.prisma.expertQaQuestion.findUnique({
          where: { id: targetId },
        }));
      case 'EXPERT_QA_ANSWER':
        return !!(await this.prisma.expertQaAnswer.findUnique({
          where: { id: targetId },
        }));
      case 'SAFETY_ARTICLE':
        return !!(await this.prisma.safetyArticle.findUnique({
          where: { id: targetId },
        }));
      case 'SAFETY_COMMENT':
        return !!(await this.prisma.safetyBlogComment.findUnique({
          where: { id: targetId },
        }));
      case 'JOB_POST':
        return !!(await this.prisma.jobPost.findUnique({
          where: { id: targetId },
        }));
      case 'SOCIAL_POST':
        return !!(await this.prisma.socialPost.findFirst({
          where: { id: targetId, deletedAt: null },
        }));
      default:
        return false;
    }
  }

  private async fetchTargetText(
    targetType: ModerationTargetType,
    targetId: string,
  ): Promise<string> {
    switch (targetType) {
      case 'FEED_ITEM': {
        const row = await this.prisma.feedItem.findUnique({
          where: { id: targetId },
        });
        return [row?.title, row?.summary, row?.body].filter(Boolean).join(' ');
      }
      case 'EXPERT_QA_QUESTION': {
        const row = await this.prisma.expertQaQuestion.findUnique({
          where: { id: targetId },
        });
        return [row?.title, row?.body].filter(Boolean).join(' ');
      }
      case 'EXPERT_QA_ANSWER': {
        const row = await this.prisma.expertQaAnswer.findUnique({
          where: { id: targetId },
        });
        return row?.body ?? '';
      }
      case 'SAFETY_ARTICLE': {
        const row = await this.prisma.safetyArticle.findUnique({
          where: { id: targetId },
        });
        return [row?.title, row?.excerpt, row?.body].filter(Boolean).join(' ');
      }
      case 'SAFETY_COMMENT': {
        const row = await this.prisma.safetyBlogComment.findUnique({
          where: { id: targetId },
        });
        return row?.body ?? '';
      }
      case 'JOB_POST': {
        const row = await this.prisma.jobPost.findUnique({
          where: { id: targetId },
        });
        return [row?.title, row?.summary, row?.description]
          .filter(Boolean)
          .join(' ');
      }
      case 'SOCIAL_POST': {
        const row = await this.prisma.socialPost.findFirst({
          where: { id: targetId },
        });
        return [row?.title, row?.body].filter(Boolean).join(' ');
      }
      default:
        return '';
    }
  }
}
