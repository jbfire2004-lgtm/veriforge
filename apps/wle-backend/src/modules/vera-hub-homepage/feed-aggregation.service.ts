import { Injectable } from '@nestjs/common';
import type { FeedPageResult, HubUserContext } from './hub-homepage.types';
import { FeedEngineService } from '../vera-feed-engine/feed-engine.service';
import { FeedAggregationPipeline } from '../vera-feed-engine/feed-aggregation.pipeline';

@Injectable()
export class FeedAggregationService {
  constructor(
    private readonly pipeline: FeedAggregationPipeline,
    private readonly feedEngine: FeedEngineService,
  ) {}

  async refreshSources(ctx: HubUserContext): Promise<void> {
    await this.pipeline.refreshAll(ctx);
  }

  async getFeedPage(
    ctx: HubUserContext,
    options: { cursor?: string; limit?: number } = {},
  ): Promise<FeedPageResult> {
    const page = await this.feedEngine.getFeedPage(ctx, options);
    return {
      items: page.items.map(({ engagement: _e, ...item }) => item),
      nextCursor: page.nextCursor,
    };
  }
}
