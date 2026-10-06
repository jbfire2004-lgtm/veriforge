import { Injectable } from '@nestjs/common';
import { NotificationChannel } from '@prisma/client';
import type {
  ModerationCaseStatus,
  ModerationResolution,
  ModerationTargetType,
} from '@prisma/client';
import { NotificationsService } from '../../notifications/notifications.service';
import { NOTIFICATION_TYPES } from '../../notifications/notification-types';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ModerationNotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async notifyCaseResolved(input: {
    caseId: string;
    targetType: ModerationTargetType;
    targetId: string;
    status: ModerationCaseStatus;
    resolution?: ModerationResolution | null;
    resolutionNote?: string | null;
    reporterUserId?: number | null;
  }): Promise<void> {
    const recipients = new Set<number>();
    if (input.reporterUserId) recipients.add(input.reporterUserId);

    const ownerId = await this.resolveContentOwnerUserId(
      input.targetType,
      input.targetId,
    );
    if (ownerId) recipients.add(ownerId);
    if (!recipients.size) return;

    const summary = await this.targetLabel(input.targetType, input.targetId);
    const action =
      input.status === 'DISMISSED'
        ? 'dismissed'
        : input.resolution === 'CONTENT_HIDDEN'
        ? 'removed from public view'
        : input.resolution === 'USER_WARNED'
        ? 'received a warning'
        : input.resolution === 'USER_SUSPENDED'
        ? 'was suspended'
        : 'reviewed';

    const title =
      input.status === 'DISMISSED'
        ? 'Your report was reviewed'
        : 'Moderation update on your content';

    const body =
      input.reporterUserId && ownerId && input.reporterUserId === ownerId
        ? `Your report about "${summary ?? 'content'}" was ${action}.`
        : input.reporterUserId && recipients.has(input.reporterUserId)
        ? `Your report about "${summary ?? 'content'}" was ${action}.`
        : `Content "${
            summary ?? 'your post'
          }" ${action} after moderation review.`;

    await this.notifications.notifyUsers({
      userIds: [...recipients],
      type: NOTIFICATION_TYPES.MODERATION_RESOLVED,
      title,
      body,
      payload: {
        caseId: input.caseId,
        targetType: input.targetType,
        targetId: input.targetId,
        status: input.status,
        resolution: input.resolution ?? null,
        url: await this.urlForTarget(input.targetType, input.targetId),
      },
      dedupeKey: `MOD_RESOLVED:${input.caseId}`,
      channels: [NotificationChannel.IN_APP],
    });
  }

  async notifyExpertVerificationReviewed(
    userId: number,
    status: 'APPROVED' | 'REJECTED',
    reviewNote?: string,
  ): Promise<void> {
    const approved = status === 'APPROVED';
    await this.notifications.notifyUsers({
      userIds: [userId],
      type: NOTIFICATION_TYPES.MODERATION_EXPERT_VERIFICATION,
      title: approved
        ? 'Expert verification approved'
        : 'Expert verification not approved',
      body: approved
        ? 'You are now a verified expert on Vera.'
        : reviewNote ??
          'Your application did not meet verification criteria. You may reapply later.',
      payload: {
        status,
        url: approved ? `/experts/profile/${userId}` : '/experts/verify',
      },
      dedupeKey: `MOD_EXPERT:${userId}:${status}`,
      channels: [NotificationChannel.IN_APP],
    });
  }

  private async resolveContentOwnerUserId(
    targetType: ModerationTargetType,
    targetId: string,
  ): Promise<number | null> {
    switch (targetType) {
      case 'FEED_ITEM': {
        const row = await this.prisma.feedItem.findUnique({
          where: { id: targetId },
          include: { worker: { include: { user: true } } },
        });
        const meta = row?.metadata as Record<string, unknown> | null;
        if (meta?.authorUserId != null)
          return Number(meta.authorUserId) || null;
        return row?.worker?.user?.id ?? null;
      }
      case 'EXPERT_QA_QUESTION': {
        const row = await this.prisma.expertQaQuestion.findUnique({
          where: { id: targetId },
          select: { authorUserId: true },
        });
        return row?.authorUserId ?? null;
      }
      case 'EXPERT_QA_ANSWER': {
        const row = await this.prisma.expertQaAnswer.findUnique({
          where: { id: targetId },
          select: { authorUserId: true },
        });
        return row?.authorUserId ?? null;
      }
      case 'SAFETY_COMMENT': {
        const row = await this.prisma.safetyBlogComment.findUnique({
          where: { id: targetId },
          select: { userId: true },
        });
        return row?.userId ?? null;
      }
      case 'SAFETY_ARTICLE':
      case 'JOB_POST':
      case 'USER':
        return null;
      default:
        return null;
    }
  }

  private async targetLabel(
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
        return r ? r.body.slice(0, 60) : null;
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
        return r ? r.body.slice(0, 60) : null;
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
      default:
        return null;
    }
  }

  private async urlForTarget(
    targetType: ModerationTargetType,
    targetId: string,
  ): Promise<string> {
    switch (targetType) {
      case 'FEED_ITEM':
        return '/hub';
      case 'EXPERT_QA_QUESTION': {
        const q = await this.prisma.expertQaQuestion.findUnique({
          where: { id: targetId },
          select: { slug: true },
        });
        return q?.slug ? `/experts/questions/${q.slug}` : '/experts';
      }
      case 'SAFETY_ARTICLE': {
        const a = await this.prisma.safetyArticle.findUnique({
          where: { id: targetId },
          select: { slug: true },
        });
        return a?.slug ? `/safety/${a.slug}` : '/safety';
      }
      default:
        return '/hub';
    }
  }
}
