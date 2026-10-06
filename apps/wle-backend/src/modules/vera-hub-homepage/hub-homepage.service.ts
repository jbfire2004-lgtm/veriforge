import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FeedAggregationService } from './feed-aggregation.service';
import { HomepageCacheService } from './homepage-cache.service';
import type {
  HomepagePayload,
  HomepageQuery,
  HubUserContext,
} from './hub-homepage.types';
import { PersonalizationService } from './personalization.service';
import { TrendingTopicsService } from './trending-topics.service';
import { WeatherHazardService } from './weather-hazard.service';
import { VeraCoreIntegration } from './integrations/vera-core.integration';
import { JobBoardIntegration } from './integrations/job-board.integration';
import { SafetyBlogIntegration } from './integrations/safety-blog.integration';
import { quickActionsForHubRole } from './hub-role.utils';

@Injectable()
export class HubHomepageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: HomepageCacheService,
    private readonly feed: FeedAggregationService,
    private readonly personalization: PersonalizationService,
    private readonly trending: TrendingTopicsService,
    private readonly weather: WeatherHazardService,
    private readonly veraCore: VeraCoreIntegration,
    private readonly jobBoard: JobBoardIntegration,
    private readonly safetyBlog: SafetyBlogIntegration,
  ) {}

  async buildForUser(
    userId: number,
    query: HomepageQuery = {},
  ): Promise<HomepagePayload> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { worker: true },
    });
    const ctx = this.personalization.resolveContext(user);

    if (!query.refresh) {
      const cached = this.cache.get(ctx.userId, ctx.hubRole, ctx.companyId);
      if (cached && !query.cursor) return cached;
    } else {
      await this.feed.refreshSources(ctx);
    }

    const prefs = await this.personalization.getPreferences(ctx.userId);
    const region = query.region ?? prefs.region ?? 'default';

    const [
      feedPage,
      trendingTopics,
      weatherSnap,
      jobPreview,
      safetyBlogPreview,
      projectUpdates,
      achievements,
    ] = await Promise.all([
      this.feed.getFeedPage(ctx, {
        cursor: query.cursor,
        limit: query.limit,
      }),
      this.trending.list(ctx.companyId),
      this.weather.getSnapshot(region, ctx.companyId, ctx.userId),
      this.jobBoard.listActive(ctx.companyId),
      this.safetyBlog.listActive(ctx.companyId),
      ctx.hubRole === 'WORKER'
        ? Promise.resolve([])
        : this.veraCore.listProjectUpdates(ctx.companyId),
      this.veraCore.listAchievements({
        companyId: ctx.companyId,
        workerId: ctx.hubRole === 'WORKER' ? ctx.workerId : undefined,
      }),
    ]);

    const announcements = await this.listAnnouncements(ctx);

    const payload: HomepagePayload = {
      hubRole: ctx.hubRole,
      sections: this.personalization.visibleSections(ctx),
      feed: feedPage,
      quickActions: quickActionsForHubRole(ctx.hubRole),
      trendingTopics,
      weather: weatherSnap,
      jobPreview,
      safetyBlogPreview,
      projectUpdates,
      achievements,
      announcements,
      cachedAt: new Date().toISOString(),
    };

    if (!query.cursor) {
      this.cache.set(ctx.userId, ctx.hubRole, ctx.companyId, payload);
    }

    return payload;
  }

  invalidateCache(userId: number): void {
    this.cache.invalidateUser(userId);
  }

  private async listAnnouncements(ctx: HubUserContext) {
    if (
      ctx.hubRole !== 'SUPERVISOR' &&
      ctx.hubRole !== 'COMPANY_ADMIN' &&
      ctx.hubRole !== 'UNION_HALL'
    ) {
      return [];
    }
    const items = await this.prisma.feedItem.findMany({
      where: {
        source: 'COMPANY_ANNOUNCEMENT',
        ...(ctx.companyId ? { companyId: ctx.companyId } : {}),
      },
      orderBy: { publishedAt: 'desc' },
      take: 5,
    });
    return items.map((i) => ({
      id: i.id,
      title: i.title,
      body: i.summary ?? i.title,
      publishedAt: i.publishedAt.toISOString(),
      priority: 'normal' as const,
    }));
  }
}
