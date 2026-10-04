import { FeedSource } from '@prisma/client';
import {
  computeFeedRankScore,
  sortFeedByRank,
  type FeedRankingContext,
} from './feed-ranking.engine';

describe('feed-ranking.engine', () => {
  const now = new Date('2026-05-18T12:00:00Z');
  const baseCtx: FeedRankingContext = {
    userId: 1,
    role: 'WORKER',
    companyId: 10,
    projectIds: [5],
    trades: ['electrician'],
    subscriptions: ['TRAINING_EXPIRY', 'company:10'],
  };

  it('ranks newer items higher than stale items', () => {
    const fresh = computeFeedRankScore(
      {
        id: '1',
        source: FeedSource.SYSTEM,
        publishedAt: new Date('2026-05-18T11:00:00Z'),
        rankScore: 0,
      },
      baseCtx,
      now,
    );
    const stale = computeFeedRankScore(
      {
        id: '2',
        source: FeedSource.SYSTEM,
        publishedAt: new Date('2026-05-10T12:00:00Z'),
        rankScore: 0,
      },
      baseCtx,
      now,
    );
    expect(fresh).toBeGreaterThan(stale);
  });

  it('boosts training expiry for workers', () => {
    const expiry = computeFeedRankScore(
      {
        id: '1',
        source: FeedSource.TRAINING_EXPIRY,
        publishedAt: now,
        rankScore: 0,
        safetyPriority: 3,
      },
      { userId: 1, role: 'WORKER' },
      now,
    );
    const job = computeFeedRankScore(
      {
        id: '2',
        source: FeedSource.JOB_BOARD,
        publishedAt: now,
        rankScore: 0,
      },
      { userId: 1, role: 'WORKER' },
      now,
    );
    expect(expiry).toBeGreaterThan(job);
  });

  it('boosts union dispatch for union hall role', () => {
    const dispatch = computeFeedRankScore(
      {
        id: '1',
        source: FeedSource.UNION_DISPATCH,
        publishedAt: now,
        rankScore: 0,
      },
      { userId: 1, role: 'UNION_HALL' },
      now,
    );
    const blog = computeFeedRankScore(
      {
        id: '2',
        source: FeedSource.SAFETY_BLOG,
        publishedAt: now,
        rankScore: 0,
      },
      { userId: 1, role: 'UNION_HALL' },
      now,
    );
    expect(dispatch).toBeGreaterThan(blog);
  });

  it('applies trade relevance', () => {
    const match = computeFeedRankScore(
      {
        id: '1',
        source: FeedSource.JOB_BOARD,
        publishedAt: now,
        rankScore: 0,
        trade: 'electrician',
      },
      baseCtx,
      now,
    );
    const miss = computeFeedRankScore(
      {
        id: '2',
        source: FeedSource.JOB_BOARD,
        publishedAt: now,
        rankScore: 0,
        trade: 'plumber',
      },
      baseCtx,
      now,
    );
    expect(match).toBeGreaterThan(miss);
  });

  it('sortFeedByRank orders by composite score', () => {
    const sorted = sortFeedByRank(
      [
        {
          id: 'old',
          source: FeedSource.JOB_BOARD,
          publishedAt: new Date('2026-05-01T12:00:00Z'),
          rankScore: 0,
        },
        {
          id: 'new',
          source: FeedSource.VERA_CORE_EQUIPMENT,
          publishedAt: new Date('2026-05-18T11:30:00Z'),
          rankScore: 0,
        },
      ],
      baseCtx,
      now,
    );
    expect(sorted[0].id).toBe('new');
  });
});
