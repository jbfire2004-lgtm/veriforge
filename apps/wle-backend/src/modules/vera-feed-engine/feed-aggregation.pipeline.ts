import { Injectable } from '@nestjs/common';
import { VeraCoreIntegration } from '../vera-hub-homepage/integrations/vera-core.integration';
import { JobBoardIntegration } from '../vera-hub-homepage/integrations/job-board.integration';
import { SafetyBlogIntegration } from '../vera-hub-homepage/integrations/safety-blog.integration';
import type { HubUserContext } from '../vera-hub-homepage/hub-homepage.types';
import { UnionDispatchIntegration } from './integrations/union-dispatch.integration';
import { ExpertQaFeedIntegration } from '../vera-expert-qa/expert-qa-feed.integration';
import { CompanyAnnouncementIntegration } from './integrations/company-announcement.integration';

/**
 * Aggregates all feed sources into FeedItem rows.
 * Called on feed refresh or via background job.
 */
@Injectable()
export class FeedAggregationPipeline {
  constructor(
    private readonly veraCore: VeraCoreIntegration,
    private readonly jobBoard: JobBoardIntegration,
    private readonly safetyBlog: SafetyBlogIntegration,
    private readonly unionDispatch: UnionDispatchIntegration,
    private readonly expertQa: ExpertQaFeedIntegration,
    private readonly announcements: CompanyAnnouncementIntegration,
  ) {}

  async refreshAll(ctx: HubUserContext): Promise<{ synced: number }> {
    const results = await Promise.all([
      this.veraCore.syncFeedItems({
        companyId: ctx.companyId,
        workerId: ctx.workerId,
      }),
      this.jobBoard.syncToFeed(ctx.companyId),
      this.safetyBlog.syncToFeed(ctx.companyId),
      this.unionDispatch.syncToFeed({
        unionHallId: ctx.unionHallId,
        companyId: ctx.companyId,
      }),
      this.expertQa.syncRecentToFeed(ctx.companyId),
      this.announcements.syncToFeed(ctx.companyId),
    ]);
    return { synced: results.reduce((a, b) => a + b, 0) };
  }
}
