import { Injectable } from '@nestjs/common';
import type {
  ModerationResolution,
  ModerationTargetType,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ExpertProfileService } from '../vera-expert-qa/expert-profile.service';

@Injectable()
export class ModerationResolutionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly experts: ExpertProfileService,
  ) {}

  async applyContentHide(
    targetType: ModerationTargetType,
    targetId: string,
  ): Promise<void> {
    switch (targetType) {
      case 'FEED_ITEM': {
        const existing = await this.prisma.feedItem.findUnique({
          where: { id: targetId },
          select: { metadata: true },
        });
        const meta =
          (existing?.metadata as Record<string, unknown> | null) ?? {};
        await this.prisma.feedItem.update({
          where: { id: targetId },
          data: {
            metadata: {
              ...meta,
              moderationHidden: true,
              hiddenAt: new Date().toISOString(),
            },
          },
        });
        break;
      }
      case 'EXPERT_QA_QUESTION':
        await this.prisma.expertQaQuestion.update({
          where: { id: targetId },
          data: { moderationStatus: 'HIDDEN', status: 'HIDDEN' },
        });
        break;
      case 'EXPERT_QA_ANSWER':
        await this.prisma.expertQaAnswer.update({
          where: { id: targetId },
          data: { moderationStatus: 'HIDDEN' },
        });
        break;
      case 'SAFETY_ARTICLE':
        await this.prisma.safetyArticle.update({
          where: { id: targetId },
          data: { active: false, status: 'ARCHIVED' },
        });
        break;
      case 'SAFETY_COMMENT':
        await this.prisma.safetyBlogComment.update({
          where: { id: targetId },
          data: { status: 'HIDDEN' },
        });
        break;
      case 'JOB_POST':
        await this.prisma.jobPost.update({
          where: { id: targetId },
          data: { active: false },
        });
        break;
      case 'SOCIAL_POST':
        await this.prisma.socialPost.update({
          where: { id: targetId },
          data: { deletedAt: new Date() },
        });
        await this.prisma.postModerationFlag.updateMany({
          where: { postId: targetId, status: 'OPEN' },
          data: { status: 'RESOLVED' },
        });
        break;
      case 'USER':
        break;
    }
  }

  async applyResolution(
    targetType: ModerationTargetType,
    targetId: string,
    resolution: ModerationResolution,
    reviewerUserId: number,
  ): Promise<void> {
    switch (resolution) {
      case 'CONTENT_HIDDEN':
        await this.applyContentHide(targetType, targetId);
        break;
      case 'EXPERT_VERIFIED': {
        const uid = parseInt(targetId, 10);
        if (!Number.isNaN(uid)) {
          await this.experts.verifyExpert(uid);
        }
        break;
      }
      case 'USER_WARNED':
      case 'USER_SUSPENDED':
      case 'NO_ACTION':
      case 'EXPERT_REJECTED':
        break;
    }
  }
}
