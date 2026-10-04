import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PersonalizationService } from '../vera-hub-homepage/personalization.service';
import type { HubUserContext } from '../vera-hub-homepage/hub-homepage.types';
import {
  AD_INJECT_INTERVAL,
  isComplianceFeedItem,
} from './social-feed.constants';
import { SocialPostsService } from './social-posts.service';
import { SocialTrendingService } from './social-trending.service';

type PostCard = {
  kind: 'post';
  id: string;
  postType: string;
  title: string | null;
  body: string;
  publishedAt: string;
  author: { id: number; username: string };
  media: {
    id: string;
    fileType: string;
    url: string;
    mimeType: string | null;
  }[];
  pinned?: boolean;
  engagement: {
    likeCount: number;
    commentCount: number;
    shareCount: number;
    likedByMe?: boolean;
    savedByMe?: boolean;
  };
};

type FeedEntry =
  | PostCard
  | {
      kind: 'legacy';
      id: string;
      source: string;
      title: string;
      summary: string | null;
      imageUrl: string | null;
      url: string | null;
      publishedAt: string;
    }
  | {
      kind: 'ad';
      id: string;
      title: string;
      body: string;
      imageUrl: string | null;
      ctaUrl: string | null;
      ctaLabel: string | null;
    }
  | {
      kind: 'pinned';
      post: PostCard;
    };

@Injectable()
export class SocialFeedService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly personalization: PersonalizationService,
    private readonly posts: SocialPostsService,
    private readonly trending: SocialTrendingService,
  ) {}

  async getFeed(
    ctx: HubUserContext,
    options: { cursor?: string; limit?: number } = {},
  ) {
    const limit = Math.min(options.limit ?? 20, 50);
    const cursorDate = options.cursor ? new Date(options.cursor) : null;

    const [pinned, socialPosts, legacyItems, ads] = await Promise.all([
      this.prisma.pinnedPost.findMany({
        take: 3,
        orderBy: { pinnedAt: 'desc' },
        include: {
          post: {
            include: {
              author: { select: { id: true, username: true } },
              media: true,
              _count: { select: { likes: true, comments: true } },
            },
          },
        },
      }),
      this.prisma.socialPost.findMany({
        where: {
          deletedAt: null,
          ...(cursorDate ? { publishedAt: { lt: cursorDate } } : {}),
        },
        orderBy: { publishedAt: 'desc' },
        take: limit,
        include: {
          author: { select: { id: true, username: true } },
          media: true,
          pinnedEntry: true,
          _count: { select: { likes: true, comments: true } },
        },
      }),
      this.loadLegacyFeed(ctx, limit, cursorDate),
      this.loadSponsoredAds(),
    ]);

    const pinnedIds = new Set(pinned.map((p) => p.postId));
    const serializedPosts = await Promise.all(
      socialPosts
        .filter((p) => !pinnedIds.has(p.id))
        .map((p) => this.serializePostRow(p, ctx.userId)),
    );

    const merged: FeedEntry[] = [
      ...pinned
        .filter((p) => p.post && p.post.deletedAt == null)
        .map((p) => ({
          kind: 'pinned' as const,
          post: this.serializePostRow(p.post!, ctx.userId),
        })),
      ...serializedPosts,
      ...legacyItems,
    ];

    merged.sort(
      (a, b) =>
        new Date(this.entryDate(b)).getTime() -
        new Date(this.entryDate(a)).getTime(),
    );

    const withAds = this.injectAds(merged.slice(0, limit), ads);
    const last = socialPosts[socialPosts.length - 1];
    const nextCursor =
      socialPosts.length >= limit && last
        ? last.publishedAt.toISOString()
        : null;

    return { items: withAds, nextCursor };
  }

  async getTrending() {
    return this.trending.listTrending(25);
  }

  async getSponsoredAds() {
    return this.loadSponsoredAds();
  }

  async suggestProviders(userId: number, limit = 8) {
    const following = await this.prisma.followRelationship.findMany({
      where: { followerUserId: userId, targetType: 'PROVIDER' },
      select: { targetId: true },
    });
    const exclude = following.map((f) => Number(f.targetId)).filter(Boolean);
    return this.prisma.trainingProvider.findMany({
      where: {
        active: true,
        id: exclude.length ? { notIn: exclude } : undefined,
      },
      take: limit,
      orderBy: { name: 'asc' },
      include: { providerProfile: true },
    });
  }

  async suggestCompanies(userId: number, limit = 8) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true },
    });
    return this.prisma.company.findMany({
      where: user?.companyId ? { id: { not: user.companyId } } : {},
      take: limit,
      orderBy: { name: 'asc' },
    });
  }

  private async loadLegacyFeed(
    ctx: HubUserContext,
    limit: number,
    cursorDate: Date | null,
  ) {
    const prefs = await this.prisma.userHomepagePreferences.upsert({
      where: { userId: ctx.userId },
      create: { userId: ctx.userId },
      update: {},
    });
    const hidden = prefs.hiddenFeedSources ?? [];
    const scope = this.personalization.companyScope(ctx);
    const sourceFilter = this.personalization.feedSourceFilter(ctx, hidden);

    const rows = await this.prisma.feedItem.findMany({
      where: {
        ...scope,
        ...sourceFilter,
        ...(cursorDate ? { publishedAt: { lt: cursorDate } } : {}),
      },
      orderBy: { publishedAt: 'desc' },
      take: limit * 2,
    });

    return rows
      .filter((r) => !isComplianceFeedItem(r))
      .slice(0, limit)
      .map((r) => ({
        kind: 'legacy' as const,
        id: r.id,
        source: r.source,
        title: r.title,
        summary: r.summary,
        imageUrl: r.imageUrl,
        url: r.url,
        publishedAt: r.publishedAt.toISOString(),
      }));
  }

  private async loadSponsoredAds() {
    const now = new Date();
    const rows = await this.prisma.sponsoredAd.findMany({
      where: {
        active: true,
        OR: [{ startsAt: null }, { startsAt: { lte: now } }],
        AND: [{ OR: [{ endsAt: null }, { endsAt: { gt: now } }] }],
      },
      take: 10,
    });
    return rows.map((a) => ({
      kind: 'ad' as const,
      id: a.id,
      title: a.title,
      body: a.body,
      imageUrl: a.imageUrl,
      ctaUrl: a.ctaUrl,
      ctaLabel: a.ctaLabel,
    }));
  }

  private injectAds<T extends FeedEntry>(items: T[], ads: FeedEntry[]): T[] {
    if (!ads.length) return items;
    const out: T[] = [];
    let adIdx = 0;
    for (let i = 0; i < items.length; i++) {
      out.push(items[i]);
      if ((i + 1) % AD_INJECT_INTERVAL === 0) {
        out.push(ads[adIdx % ads.length] as T);
        adIdx++;
      }
    }
    return out;
  }

  private entryDate(entry: FeedEntry): string {
    if (entry.kind === 'pinned') return entry.post.publishedAt;
    if (entry.kind === 'post') return entry.publishedAt;
    if (entry.kind === 'legacy') return entry.publishedAt;
    return new Date().toISOString();
  }

  private serializePostRow(
    post: {
      id: string;
      postType: string;
      title: string | null;
      body: string;
      publishedAt: Date;
      shareCount: number;
      author: { id: number; username: string };
      media: {
        id: string;
        fileType: string;
        url: string;
        mimeType: string | null;
      }[];
      pinnedEntry?: unknown;
      _count: { likes: number; comments: number };
    },
    viewerId: number,
  ) {
    return {
      kind: 'post' as const,
      id: post.id,
      postType: post.postType,
      title: post.title,
      body: post.body,
      publishedAt: post.publishedAt.toISOString(),
      author: post.author,
      media: post.media,
      pinned: !!post.pinnedEntry,
      engagement: {
        likeCount: post._count.likes,
        commentCount: post._count.comments,
        shareCount: post.shareCount,
        likedByMe: false,
        savedByMe: false,
      },
    };
  }
}
