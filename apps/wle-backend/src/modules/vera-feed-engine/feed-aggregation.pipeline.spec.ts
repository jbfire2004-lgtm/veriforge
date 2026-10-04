import { FeedAggregationPipeline } from './feed-aggregation.pipeline';

describe('FeedAggregationPipeline', () => {
  it('refreshAll aggregates counts from all integrations', async () => {
    const pipeline = new FeedAggregationPipeline(
      { syncFeedItems: async () => 10 } as never,
      { syncToFeed: async () => 2 } as never,
      { syncToFeed: async () => 1 } as never,
      { syncToFeed: async () => 4 } as never,
      { syncRecentToFeed: async () => 2 } as never,
      { syncToFeed: async () => 1 } as never,
    );
    const result = await pipeline.refreshAll({
      userId: 1,
      role: 'WORKER',
      hubRole: 'WORKER',
    });
    expect(result.synced).toBe(20);
  });
});
