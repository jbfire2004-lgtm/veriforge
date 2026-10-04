import { PrismaClient } from '@prisma/client';
import { FeedAggregationService } from './feed-aggregation.service';
import { HubHomepageService } from './hub-homepage.service';
import { HomepageCacheService } from './homepage-cache.service';
import { PersonalizationService } from './personalization.service';
import { TrendingTopicsService } from './trending-topics.service';
import { WeatherHazardService } from './weather-hazard.service';
import { JobBoardIntegration } from './integrations/job-board.integration';
import { SafetyBlogIntegration } from './integrations/safety-blog.integration';
import { VeraCoreIntegration } from './integrations/vera-core.integration';
import { VeraCoreFeedService } from '../vera-feed-engine/vera-core-feed.service';
import {
  createFeedAggregationPipeline,
  createFeedEngineService,
} from '../vera-feed-engine/feed-engine.factory';

/** Standalone factory for tRPC / scripts without Nest DI. */
export function createHubHomepageService(
  prisma: PrismaClient,
): HubHomepageService {
  const cache = new HomepageCacheService();
  const personalization = new PersonalizationService(prisma as never);
  const veraCoreFeed = new VeraCoreFeedService(prisma as never);
  const veraCore = new VeraCoreIntegration(prisma as never, veraCoreFeed);
  const jobBoard = new JobBoardIntegration(prisma as never);
  const safetyBlog = new SafetyBlogIntegration(prisma as never);
  const feed = new FeedAggregationService(
    createFeedAggregationPipeline(prisma),
    createFeedEngineService(prisma),
  );
  const trending = new TrendingTopicsService(prisma as never);
  const weather = new WeatherHazardService(prisma as never);
  return new HubHomepageService(
    prisma as never,
    cache,
    feed,
    personalization,
    trending,
    weather,
    veraCore,
    jobBoard,
    safetyBlog,
  );
}
