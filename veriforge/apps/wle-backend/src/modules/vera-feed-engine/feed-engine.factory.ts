import { PrismaClient } from '@prisma/client';
import { VeraCoreIntegration } from '../vera-hub-homepage/integrations/vera-core.integration';
import { JobBoardIntegration } from '../vera-hub-homepage/integrations/job-board.integration';
import { SafetyBlogIntegration } from '../vera-hub-homepage/integrations/safety-blog.integration';
import { FeedAggregationPipeline } from './feed-aggregation.pipeline';
import { FeedCacheService } from './feed-cache.service';
import { FeedEngineService } from './feed-engine.service';
import { FeedPersonalizationService } from './feed-personalization.service';
import { FeedRealtimeGateway } from './feed-realtime.gateway';
import { UnionDispatchIntegration } from './integrations/union-dispatch.integration';
import { ExpertQaFeedIntegration } from '../vera-expert-qa/expert-qa-feed.integration';
import { CompanyAnnouncementIntegration } from './integrations/company-announcement.integration';
import { VeraCoreFeedService } from './vera-core-feed.service';

export function createFeedAggregationPipeline(
  prisma: PrismaClient,
): FeedAggregationPipeline {
  const veraCoreFeed = new VeraCoreFeedService(prisma as never);
  const veraCore = new VeraCoreIntegration(prisma as never, veraCoreFeed);
  const jobBoard = new JobBoardIntegration(prisma as never);
  const safetyBlog = new SafetyBlogIntegration(prisma as never);
  return new FeedAggregationPipeline(
    veraCore,
    jobBoard,
    safetyBlog,
    new UnionDispatchIntegration(prisma as never),
    new ExpertQaFeedIntegration(prisma as never),
    new CompanyAnnouncementIntegration(prisma as never),
  );
}

export function createFeedEngineService(
  prisma: PrismaClient,
): FeedEngineService {
  const pipeline = createFeedAggregationPipeline(prisma);
  return new FeedEngineService(
    prisma as never,
    pipeline,
    new FeedCacheService(),
    new FeedPersonalizationService(prisma as never),
    new FeedRealtimeGateway(),
  );
}
