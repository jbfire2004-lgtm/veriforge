import { Injectable } from '@nestjs/common';
import type { SocialActivity, SocialActivityList } from '@vera/api-contract';
import type {
  Prisma,
  SocialActivityVerb,
  SocialActivityTargetType,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SocialActivityService {
  constructor(private readonly prisma: PrismaService) {}

  async log(input: {
    actorUserId: number;
    verb: SocialActivityVerb;
    targetType: SocialActivityTargetType;
    targetId: string;
    summary?: string;
    feedItemId?: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    await this.prisma.socialActivityLog.create({
      data: {
        actorUserId: input.actorUserId,
        verb: input.verb,
        targetType: input.targetType,
        targetId: input.targetId,
        summary: input.summary,
        feedItemId: input.feedItemId,
        metadata: (input.metadata ?? undefined) as
          | Prisma.InputJsonValue
          | undefined,
      },
    });
  }

  async listForUser(
    userId: number,
    options: {
      cursor?: string;
      limit?: number;
      scope?: 'me' | 'following' | 'all';
    },
  ): Promise<SocialActivityList> {
    const limit = Math.min(options.limit ?? 30, 50);
    let actorIds: number[] | undefined;

    if (options.scope === 'me') {
      actorIds = [userId];
    } else if (options.scope === 'following' || !options.scope) {
      const follows = await this.prisma.socialUserFollow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
      });
      actorIds = [userId, ...follows.map((f) => f.followingId)];
    }

    const rows = await this.prisma.socialActivityLog.findMany({
      where: actorIds ? { actorUserId: { in: actorIds } } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(options.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
    });

    const page = rows.slice(0, limit);
    const hasMore = rows.length > limit;
    const actorIdsUnique = [...new Set(page.map((r) => r.actorUserId))];
    const actors = await this.prisma.user.findMany({
      where: { id: { in: actorIdsUnique } },
      include: { worker: true },
    });
    const actorMap = new Map(
      actors.map((u) => [
        u.id,
        u.worker
          ? `${u.worker.firstName} ${u.worker.lastName}`.trim()
          : u.username,
      ]),
    );

    const feedIds = page
      .map((r) => r.feedItemId)
      .filter((id): id is string => !!id);
    const feeds =
      feedIds.length > 0
        ? await this.prisma.feedItem.findMany({
            where: { id: { in: feedIds } },
            select: { id: true, url: true },
          })
        : [];
    const feedUrlMap = new Map(feeds.map((f) => [f.id, f.url]));

    const items: SocialActivity[] = page.map((r) => ({
      id: r.id,
      actorUserId: r.actorUserId,
      actorName: actorMap.get(r.actorUserId) ?? 'User',
      verb: r.verb as SocialActivity['verb'],
      targetType: r.targetType as SocialActivity['targetType'],
      targetId: r.targetId,
      summary: r.summary,
      feedItemId: r.feedItemId,
      url: r.feedItemId ? feedUrlMap.get(r.feedItemId) ?? '/hub' : null,
      createdAt: r.createdAt.toISOString(),
    }));

    return {
      items,
      nextCursor: hasMore ? page[page.length - 1]?.id ?? null : null,
    };
  }
}
