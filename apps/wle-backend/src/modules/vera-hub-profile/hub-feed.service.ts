import { Injectable } from '@nestjs/common';
import type { FeedSource, Prisma } from '@prisma/client';
import type { FeedPage } from '@vera/api-contract';
import { PrismaService } from '../../prisma/prisma.service';
import { FeedEngineService } from '../vera-feed-engine/feed-engine.service';
import { PersonalizationService } from '../vera-hub-homepage/personalization.service';
import { SocialPostsService } from '../vera-social-feed/social-posts.service';
import type { CreatePostDto } from '../vera-social-feed/dto/social-post.dto';

export type HubFeedFilter =
  | 'all'
  | 'network'
  | 'company'
  | 'projects'
  | 'providers';

@Injectable()
export class HubFeedService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly feedEngine: FeedEngineService,
    private readonly personalization: PersonalizationService,
    private readonly socialPosts: SocialPostsService,
  ) {}

  async getFeed(
    userId: number,
    options: {
      filter?: HubFeedFilter;
      cursor?: string;
      limit?: number;
      refresh?: boolean;
    } = {},
  ): Promise<FeedPage> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { worker: true },
    });
    const ctx = this.personalization.resolveContext(user);
    const extraWhere = await this.buildFilterWhere(
      userId,
      ctx,
      options.filter ?? 'all',
    );

    return this.feedEngine.getFeedPage(ctx, {
      cursor: options.cursor,
      limit: options.limit,
      refresh: options.refresh,
      extraWhere,
    });
  }

  async createPost(userId: number, dto: CreatePostDto) {
    const post = await this.socialPosts.create(userId, {
      ...dto,
      postType: dto.postType ?? 'WORKER_MILESTONE',
      visibility: dto.visibility ?? 'PUBLIC',
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { worker: true },
    });

    await this.prisma.feedItem.upsert({
      where: {
        source_externalId: {
          source: 'SOCIAL_POST',
          externalId: post.id,
        },
      },
      create: {
        source: 'SOCIAL_POST',
        externalId: post.id,
        title: post.title ?? 'Safety update',
        summary: post.body.slice(0, 280),
        body: post.body,
        companyId: user?.companyId ?? undefined,
        workerId: user?.worker?.id,
        publishedAt: new Date(),
        metadata: { socialPostId: post.id, authorUserId: userId },
      },
      update: {
        title: post.title ?? 'Safety update',
        summary: post.body.slice(0, 280),
        body: post.body,
        publishedAt: new Date(),
      },
    });

    return post;
  }

  private async buildFilterWhere(
    userId: number,
    ctx: ReturnType<PersonalizationService['resolveContext']>,
    filter: HubFeedFilter,
  ): Promise<Prisma.FeedItemWhereInput | undefined> {
    if (filter === 'all') return undefined;

    if (filter === 'company' && ctx.companyId) {
      return { companyId: ctx.companyId };
    }

    if (filter === 'projects') {
      const assignments = await this.prisma.projectAssignment.findMany({
        where: {
          worker: { userId },
          status: 'ACTIVE',
        },
        select: { projectId: true },
        take: 20,
      });
      const projectIds = assignments.map((a) => a.projectId);
      if (!projectIds.length) return { projectId: { in: [-1] } };
      return { projectId: { in: projectIds } };
    }

    if (filter === 'providers') {
      return { source: 'SOCIAL_POST' as FeedSource };
    }

    if (filter === 'network') {
      const following = await this.prisma.socialUserFollow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
      });
      const followingUserIds = following.map((f) => f.followingId);
      const workers = await this.prisma.worker.findMany({
        where: { userId: { in: followingUserIds } },
        select: { id: true },
      });
      const workerIds = workers.map((w) => w.id);
      const or: Prisma.FeedItemWhereInput[] = [];
      if (workerIds.length) or.push({ workerId: { in: workerIds } });
      if (ctx.companyId) or.push({ companyId: ctx.companyId });
      if (!or.length) return { workerId: { in: [-1] } };
      return { OR: or };
    }

    return undefined;
  }
}
