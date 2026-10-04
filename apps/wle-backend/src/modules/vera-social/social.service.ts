import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  SocialActivityList,
  SocialFeedComment,
  SocialFollowStatus,
  SocialUserSummary,
} from '@vera/api-contract';
import { PrismaService } from '../../prisma/prisma.service';
import { createFeedEngineService } from '../vera-feed-engine/feed-engine.factory';
import { SocialActivityService } from './social-activity.service';
import { SocialNotificationService } from './social-notification.service';

@Injectable()
export class SocialService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activity: SocialActivityService,
    private readonly notify: SocialNotificationService,
  ) {}

  private feed() {
    return createFeedEngineService(this.prisma);
  }

  async interact(
    userId: number,
    feedItemId: string,
    type: 'LIKE' | 'COMMENT' | 'SHARE',
    body?: string,
    parentId?: string,
  ): Promise<void> {
    const item = await this.prisma.feedItem.findUnique({
      where: { id: feedItemId },
    });
    if (!item) throw new NotFoundException('Feed item not found');

    const result = await this.feed().interact(
      userId,
      feedItemId,
      type,
      body,
      parentId,
    );

    const actorName = await this.actorName(userId);

    if (type === 'LIKE') {
      const verb = result === 'unliked' ? 'UNLIKE' : 'LIKE';
      await this.activity.log({
        actorUserId: userId,
        verb,
        targetType: 'FEED_ITEM',
        targetId: feedItemId,
        feedItemId,
        summary: `${actorName} ${verb === 'LIKE' ? 'liked' : 'unliked'} "${
          item.title
        }"`,
      });
      if (result === 'liked') {
        await this.notify.notifyFeedInteraction(userId, feedItemId, 'LIKE');
      }
      return;
    }

    if (type === 'COMMENT') {
      await this.activity.log({
        actorUserId: userId,
        verb: 'COMMENT',
        targetType: 'FEED_ITEM',
        targetId: feedItemId,
        feedItemId,
        summary: `${actorName} commented on "${item.title}"`,
        metadata: { preview: body?.slice(0, 120) },
      });
      await this.notify.notifyFeedInteraction(
        userId,
        feedItemId,
        'COMMENT',
        body?.slice(0, 120),
      );
      return;
    }

    if (type === 'SHARE') {
      await this.activity.log({
        actorUserId: userId,
        verb: 'SHARE',
        targetType: 'FEED_ITEM',
        targetId: feedItemId,
        feedItemId,
        summary: `${actorName} shared "${item.title}"`,
      });
      await this.notify.notifyFeedInteraction(userId, feedItemId, 'SHARE');
    }
  }

  async listComments(feedItemId: string): Promise<SocialFeedComment[]> {
    const rows = await this.prisma.feedInteraction.findMany({
      where: { feedItemId, type: 'COMMENT' },
      orderBy: { createdAt: 'asc' },
      include: {
        user: { include: { worker: true } },
        _count: { select: { replies: true } },
      },
    });

    return rows.map((r) => ({
      id: r.id,
      feedItemId: r.feedItemId,
      userId: r.userId,
      body: r.body ?? '',
      parentId: r.parentId,
      createdAt: r.createdAt.toISOString(),
      authorName: r.user.worker
        ? `${r.user.worker.firstName} ${r.user.worker.lastName}`.trim()
        : r.user.username,
      authorUsername: r.user.username,
      replyCount: r._count.replies,
    }));
  }

  async followUser(
    followerId: number,
    followingId: number,
  ): Promise<SocialFollowStatus> {
    if (followerId === followingId) {
      throw new ConflictException('Cannot follow yourself');
    }
    const target = await this.prisma.user.findUnique({
      where: { id: followingId },
    });
    if (!target) throw new NotFoundException('User not found');

    const existing = await this.prisma.socialUserFollow.findUnique({
      where: {
        followerId_followingId: { followerId, followingId },
      },
    });

    if (!existing) {
      await this.prisma.socialUserFollow.create({
        data: { followerId, followingId },
      });
      await this.feed().subscribe(followerId, 'USER', String(followingId));
      const actorName = await this.actorName(followerId);
      await this.activity.log({
        actorUserId: followerId,
        verb: 'FOLLOW',
        targetType: 'USER',
        targetId: String(followingId),
        summary: `${actorName} followed ${target.username}`,
      });
      await this.notify.notifyFollow(followerId, followingId);
    }

    return this.followStatus(followerId, followingId);
  }

  async unfollowUser(
    followerId: number,
    followingId: number,
  ): Promise<SocialFollowStatus> {
    const row = await this.prisma.socialUserFollow.findUnique({
      where: {
        followerId_followingId: { followerId, followingId },
      },
    });
    if (row) {
      await this.prisma.socialUserFollow.delete({ where: { id: row.id } });
      await this.prisma.feedSubscription.deleteMany({
        where: {
          userId: followerId,
          targetType: 'USER',
          targetKey: String(followingId),
        },
      });
      const actorName = await this.actorName(followerId);
      await this.activity.log({
        actorUserId: followerId,
        verb: 'UNFOLLOW',
        targetType: 'USER',
        targetId: String(followingId),
        summary: `${actorName} unfollowed a user`,
      });
    }
    return this.followStatus(followerId, followingId);
  }

  async followStatus(
    viewerId: number,
    targetUserId: number,
  ): Promise<SocialFollowStatus> {
    const [following, followerCount, followingCount] = await Promise.all([
      this.prisma.socialUserFollow.findUnique({
        where: {
          followerId_followingId: {
            followerId: viewerId,
            followingId: targetUserId,
          },
        },
      }),
      this.prisma.socialUserFollow.count({
        where: { followingId: targetUserId },
      }),
      this.prisma.socialUserFollow.count({
        where: { followerId: targetUserId },
      }),
    ]);

    return {
      following: !!following,
      followerCount,
      followingCount,
    };
  }

  async listFollowing(userId: number): Promise<SocialUserSummary[]> {
    const rows = await this.prisma.socialUserFollow.findMany({
      where: { followerId: userId },
      include: {
        following: { include: { worker: true, expertProfile: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return rows.map((r) => this.userSummary(r.following, true));
  }

  async listFollowers(userId: number): Promise<SocialUserSummary[]> {
    const rows = await this.prisma.socialUserFollow.findMany({
      where: { followingId: userId },
      include: {
        follower: { include: { worker: true, expertProfile: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return rows.map((r) => this.userSummary(r.follower, false));
  }

  getActivity(
    userId: number,
    options: {
      cursor?: string;
      limit?: number;
      scope?: 'me' | 'following' | 'all';
    },
  ): Promise<SocialActivityList> {
    return this.activity.listForUser(userId, options);
  }

  async subscribeTopic(
    userId: number,
    targetType: 'SOURCE' | 'COMPANY' | 'PROJECT' | 'TRADE' | 'EXPERT' | 'USER',
    targetKey: string,
  ) {
    const sub = await this.feed().subscribe(userId, targetType, targetKey);
    const actorName = await this.actorName(userId);
    const activityTarget = targetType === 'SOURCE' ? 'FEED_SOURCE' : targetType;
    await this.activity.log({
      actorUserId: userId,
      verb: 'SUBSCRIBE',
      targetType: activityTarget as never,
      targetId: targetKey,
      summary: `${actorName} subscribed to ${targetType.toLowerCase()} ${targetKey}`,
    });
    return sub;
  }

  private userSummary(
    user: {
      id: number;
      username: string;
      worker: { firstName: string; lastName: string } | null;
      expertProfile: { headline: string | null } | null;
    },
    following: boolean,
  ): SocialUserSummary {
    return {
      userId: user.id,
      displayName: user.worker
        ? `${user.worker.firstName} ${user.worker.lastName}`.trim()
        : user.username,
      username: user.username,
      headline: user.expertProfile?.headline ?? null,
      following,
    };
  }

  private async actorName(userId: number): Promise<string> {
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
