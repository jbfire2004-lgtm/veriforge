import { Injectable } from '@nestjs/common';
import { NotificationChannel } from '@prisma/client';
import { NotificationsService } from '../../notifications/notifications.service';
import { NOTIFICATION_TYPES } from '../../notifications/notification-types';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SocialNotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async notifyFeedInteraction(
    actorUserId: number,
    feedItemId: string,
    kind: 'LIKE' | 'COMMENT' | 'SHARE',
    preview?: string,
  ): Promise<void> {
    const [actor, item] = await Promise.all([
      this.displayName(actorUserId),
      this.prisma.feedItem.findUnique({
        where: { id: feedItemId },
        include: { worker: { include: { user: true } } },
      }),
    ]);
    if (!item) return;

    const recipients = await this.resolveFeedRecipients(item, actorUserId);
    if (!recipients.length) return;

    const typeMap = {
      LIKE: NOTIFICATION_TYPES.SOCIAL_LIKE,
      COMMENT: NOTIFICATION_TYPES.SOCIAL_COMMENT,
      SHARE: NOTIFICATION_TYPES.SOCIAL_SHARE,
    } as const;

    const verbMap = {
      LIKE: 'liked',
      COMMENT: 'commented on',
      SHARE: 'shared',
    };

    await this.notifications.notifyUsers({
      userIds: recipients,
      type: typeMap[kind],
      title: `${actor} ${verbMap[kind]} your post`,
      body: preview ?? item.title,
      payload: {
        feedItemId,
        url: item.url ?? '/hub',
        actorUserId,
        kind,
      },
      dedupeKey: `${kind}:${feedItemId}:${actorUserId}:${recipients.join(',')}`,
      channels: [NotificationChannel.IN_APP],
    });
  }

  async notifyFollow(followerId: number, followingId: number): Promise<void> {
    if (followerId === followingId) return;
    const actor = await this.displayName(followerId);
    await this.notifications.notifyUsers({
      userIds: [followingId],
      type: NOTIFICATION_TYPES.SOCIAL_FOLLOW,
      title: `${actor} started following you`,
      body: 'You have a new follower on Vera Hub.',
      payload: {
        followerId,
        url: `/hub/people/${followerId}`,
        actorUserId: followerId,
      },
      dedupeKey: `FOLLOW:${followerId}:${followingId}`,
      channels: [NotificationChannel.IN_APP],
    });
  }

  private async resolveFeedRecipients(
    item: {
      workerId: number | null;
      metadata: unknown;
      worker: { user: { id: number } | null } | null;
    },
    actorUserId: number,
  ): Promise<number[]> {
    const ids = new Set<number>();
    const meta = item.metadata as Record<string, unknown> | null;
    if (meta?.authorUserId != null) {
      const uid = Number(meta.authorUserId);
      if (uid && uid !== actorUserId) ids.add(uid);
    }
    if (item.worker?.user?.id && item.worker.user.id !== actorUserId) {
      ids.add(item.worker.user.id);
    }
    return [...ids];
  }

  private async displayName(userId: number): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { worker: true },
    });
    if (!user) return 'Someone';
    if (user.worker) {
      return `${user.worker.firstName} ${user.worker.lastName}`.trim();
    }
    return user.username;
  }
}
