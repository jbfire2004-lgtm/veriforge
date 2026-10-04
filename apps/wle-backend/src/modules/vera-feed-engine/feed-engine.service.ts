import { Injectable } from '@nestjs/common';
import type { FeedSource, Prisma } from '@prisma/client';
import type {
  FeedComment,
  FeedItemWithEngagement,
  FeedPage,
  FeedSubscriptionDto,
} from '@vera/api-contract';
import { PrismaService } from '../../prisma/prisma.service';
import type { HubUserContext } from '../vera-hub-homepage/hub-homepage.types';
import { FeedAggregationPipeline } from './feed-aggregation.pipeline';
import { FeedCacheService } from './feed-cache.service';
import { FeedPersonalizationService } from './feed-personalization.service';
import { computeFeedRankScore, sortFeedByRank } from './feed-ranking.engine';
import { FeedRealtimeGateway } from './feed-realtime.gateway';
import { isComplianceFeedItem } from '../vera-social-feed/social-feed.constants';

@Injectable()
export class FeedEngineService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pipeline: FeedAggregationPipeline,
    private readonly cache: FeedCacheService,
    private readonly personalization: FeedPersonalizationService,
    private readonly realtime: FeedRealtimeGateway,
  ) {}

  async getFeedPage(
    ctx: HubUserContext,
    options: {
      cursor?: string;
      limit?: number;
      sources?: FeedSource[];
      refresh?: boolean;
      extraWhere?: Prisma.FeedItemWhereInput;
    } = {},
  ): Promise<FeedPage> {
    if (!options.cursor && !options.refresh) {
      const cached = this.cache.get(
        ctx.userId,
        ctx.companyId,
        options.sources?.join(','),
      );
      if (cached) return cached;
    }

    const prefs = await this.prisma.userHomepagePreferences.upsert({
      where: { userId: ctx.userId },
      create: { userId: ctx.userId },
      update: {},
    });
    const limit = Math.min(options.limit ?? prefs.feedPageSize, 50);
    const hidden = prefs.hiddenFeedSources ?? [];
    const scope = this.personalization.companyScope(ctx);
    const sourceFilter = this.personalization.feedSourceFilter(ctx, hidden);
    const rankingCtx = await this.personalization.buildRankingContext(
      ctx.userId,
    );

    const rows = await this.prisma.feedItem.findMany({
      where: {
        ...scope,
        ...sourceFilter,
        ...(options.extraWhere ?? {}),
        ...(options.sources?.length ? { source: { in: options.sources } } : {}),
      },
      orderBy: { publishedAt: 'desc' },
      take: limit + 1,
      ...(options.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
    });

    const visible = rows.filter((r) => {
      if (isComplianceFeedItem(r)) return false;
      const meta = r.metadata as Record<string, unknown> | null;
      return meta?.moderationHidden !== true;
    });

    const ranked = sortFeedByRank(
      visible.map((r) => ({
        ...r,
        metadata: (r.metadata as Record<string, unknown> | null) ?? null,
      })),
      rankingCtx,
    );

    const page = ranked.slice(0, limit);
    const hasMore = ranked.length > limit;
    const ids = page.map((r) => r.id);

    const [counts, myLikes] = await Promise.all([
      this.engagementCounts(ids),
      this.prisma.feedInteraction.findMany({
        where: {
          feedItemId: { in: ids },
          userId: ctx.userId,
          type: 'LIKE',
        },
        select: { feedItemId: true },
      }),
    ]);
    const likedSet = new Set(myLikes.map((l) => l.feedItemId));

    const items: FeedItemWithEngagement[] = page.map((r) => {
      const eng = counts[r.id] ?? {
        likeCount: 0,
        commentCount: 0,
        shareCount: 0,
      };
      return {
        id: r.id,
        source: r.source as FeedItemWithEngagement['source'],
        title: r.title,
        summary: r.summary,
        imageUrl: r.imageUrl,
        url: r.url,
        publishedAt: r.publishedAt.toISOString(),
        rankScore: computeFeedRankScore(
          {
            ...r,
            metadata: (r.metadata as Record<string, unknown> | null) ?? null,
          },
          rankingCtx,
        ),
        metadata: (r.metadata as Record<string, unknown> | null) ?? null,
        safetyPriority: r.safetyPriority,
        trade: r.trade,
        projectId: r.projectId,
        engagement: {
          ...eng,
          likedByMe: likedSet.has(r.id),
        },
      };
    });

    const result: FeedPage = {
      items,
      nextCursor: hasMore ? page[page.length - 1]?.id ?? null : null,
    };

    if (!options.cursor) {
      this.cache.set(
        ctx.userId,
        ctx.companyId,
        result,
        options.sources?.join(','),
      );
    }

    return result;
  }

  async refreshAndInvalidate(ctx: HubUserContext): Promise<void> {
    await this.pipeline.refreshAll(ctx);
    this.cache.invalidateUser(ctx.userId);
  }

  async interact(
    userId: number,
    feedItemId: string,
    type: 'LIKE' | 'COMMENT' | 'SHARE',
    body?: string,
    parentId?: string,
  ): Promise<'liked' | 'unliked' | 'created'> {
    if (type === 'LIKE') {
      const existing = await this.prisma.feedInteraction.findFirst({
        where: { feedItemId, userId, type: 'LIKE' },
      });
      if (existing) {
        await this.prisma.feedInteraction.delete({
          where: { id: existing.id },
        });
        this.cache.invalidateUser(userId);
        this.realtime.broadcast(userId, {
          type: 'feed.interaction',
          feedItemId,
          payload: { action: 'unlike' },
        });
        return 'unliked';
      }
    }

    await this.prisma.feedInteraction.create({
      data: {
        feedItemId,
        userId,
        type,
        body: body ?? null,
        parentId: type === 'COMMENT' ? parentId ?? null : null,
      },
    });
    this.cache.invalidateUser(userId);
    this.realtime.broadcast(userId, {
      type: 'feed.interaction',
      feedItemId,
      payload: { action: type.toLowerCase() },
    });
    return type === 'LIKE' ? 'liked' : 'created';
  }

  async listComments(feedItemId: string): Promise<FeedComment[]> {
    const rows = await this.prisma.feedInteraction.findMany({
      where: { feedItemId, type: 'COMMENT' },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((r) => ({
      id: r.id,
      feedItemId: r.feedItemId,
      userId: r.userId,
      body: r.body ?? '',
      parentId: r.parentId,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async subscribe(
    userId: number,
    targetType: 'SOURCE' | 'COMPANY' | 'PROJECT' | 'TRADE' | 'EXPERT' | 'USER',
    targetKey: string,
  ): Promise<FeedSubscriptionDto> {
    const row = await this.prisma.feedSubscription.upsert({
      where: {
        userId_targetType_targetKey: { userId, targetType, targetKey },
      },
      create: { userId, targetType, targetKey },
      update: {},
    });
    this.cache.invalidateUser(userId);
    return {
      id: row.id,
      targetType: row.targetType as FeedSubscriptionDto['targetType'],
      targetKey: row.targetKey,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async listSubscriptions(userId: number): Promise<FeedSubscriptionDto[]> {
    const rows = await this.prisma.feedSubscription.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => ({
      id: r.id,
      targetType: r.targetType as FeedSubscriptionDto['targetType'],
      targetKey: r.targetKey,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  private async engagementCounts(
    feedItemIds: string[],
  ): Promise<
    Record<
      string,
      { likeCount: number; commentCount: number; shareCount: number }
    >
  > {
    if (!feedItemIds.length) return {};
    const groups = await this.prisma.feedInteraction.groupBy({
      by: ['feedItemId', 'type'],
      where: { feedItemId: { in: feedItemIds } },
      _count: { _all: true },
    });
    const out: Record<
      string,
      { likeCount: number; commentCount: number; shareCount: number }
    > = {};
    for (const id of feedItemIds) {
      out[id] = { likeCount: 0, commentCount: 0, shareCount: 0 };
    }
    for (const g of groups) {
      const bucket = out[g.feedItemId]!;
      if (g.type === 'LIKE') bucket.likeCount = g._count._all;
      if (g.type === 'COMMENT') bucket.commentCount = g._count._all;
      if (g.type === 'SHARE') bucket.shareCount = g._count._all;
    }
    return out;
  }
}
