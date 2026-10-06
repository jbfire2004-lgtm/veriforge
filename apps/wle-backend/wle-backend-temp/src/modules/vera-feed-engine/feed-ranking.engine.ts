import type { FeedSource } from '@prisma/client';

export type RankableFeedItem = {
  id: string;
  source: FeedSource;
  publishedAt: Date;
  rankScore: number;
  companyId?: number | null;
  projectId?: number | null;
  trade?: string | null;
  workerId?: number | null;
  safetyPriority?: number;
  metadata?: Record<string, unknown> | null;
};

export type FeedRankingContext = {
  userId: number;
  role: string;
  companyId?: number;
  projectIds?: number[];
  trades?: string[];
  /** source -> interaction count (views, likes, clicks) */
  sourceAffinity?: Partial<Record<FeedSource, number>>;
  /** feed item ids the user liked or commented on */
  interactedItemIds?: Set<string>;
  /** subscribed target keys e.g. "JOB_BOARD", "company:42" */
  subscriptions?: string[];
};

const SOURCE_WEIGHT: Record<FeedSource, number> = {
  VERA_CORE_EQUIPMENT: 1.2,
  TRAINING_EXPIRY: 1.18,
  VERA_CORE_TRAINING: 1.1,
  UNION_DISPATCH: 1.08,
  SYSTEM: 0.95,
  COMPANY_ANNOUNCEMENT: 1.05,
  WORKER_ACHIEVEMENT: 1.0,
  WORKER_VERIFICATION: 1.08,
  VERA_CORE_PROJECT: 1.0,
  JOB_BOARD: 0.9,
  SAFETY_BLOG: 1.0,
  EXPERT_ANSWER: 0.92,
  SOCIAL_POST: 1.12,
};

const ROLE_SOURCE_BOOST: Record<string, Partial<Record<FeedSource, number>>> = {
  WORKER: {
    VERA_CORE_TRAINING: 1.12,
    TRAINING_EXPIRY: 1.15,
    WORKER_ACHIEVEMENT: 1.1,
    WORKER_VERIFICATION: 1.12,
    JOB_BOARD: 1.05,
  },
  SUPERVISOR: {
    VERA_CORE_PROJECT: 1.1,
    VERA_CORE_EQUIPMENT: 1.12,
    COMPANY_ANNOUNCEMENT: 1.08,
  },
  COMPANY_ADMIN: {
    COMPANY_ANNOUNCEMENT: 1.15,
    VERA_CORE_EQUIPMENT: 1.1,
  },
  UNION_HALL: {
    UNION_DISPATCH: 1.2,
    VERA_CORE_TRAINING: 1.08,
  },
};

const RECENCY_MS = 36 * 60 * 60 * 1000;
const SAFETY_PRIORITY_SCALE = 0.08;

function subscriptionBoost(
  item: RankableFeedItem,
  subs: string[] | undefined,
): number {
  if (!subs?.length) return 1;
  let boost = 1;
  if (subs.includes(item.source)) boost += 0.12;
  if (item.companyId && subs.includes(`company:${item.companyId}`))
    boost += 0.1;
  if (item.projectId && subs.includes(`project:${item.projectId}`))
    boost += 0.1;
  if (item.trade && subs.includes(`trade:${item.trade}`)) boost += 0.1;
  return boost;
}

function tradeRelevance(
  item: RankableFeedItem,
  trades: string[] | undefined,
): number {
  if (!trades?.length || !item.trade) return 1;
  const match = trades.some(
    (t) => t.toLowerCase() === item.trade!.toLowerCase(),
  );
  return match ? 1.15 : 0.92;
}

function projectRelevance(
  item: RankableFeedItem,
  projectIds: number[] | undefined,
): number {
  if (!projectIds?.length || !item.projectId) return 1;
  return projectIds.includes(item.projectId) ? 1.12 : 0.95;
}

function companyRelevance(
  item: RankableFeedItem,
  companyId: number | undefined,
): number {
  if (!companyId || !item.companyId) return 1;
  return item.companyId === companyId ? 1.1 : 0.97;
}

function interactionBoost(
  item: RankableFeedItem,
  interacted: Set<string> | undefined,
  affinity: Partial<Record<FeedSource, number>> | undefined,
): number {
  let boost = 1;
  if (interacted?.has(item.id)) boost += 0.06;
  const aff = affinity?.[item.source];
  if (aff && aff > 0) boost += Math.min(0.15, aff * 0.02);
  const engagement =
    typeof item.metadata?.engagement === 'number'
      ? Math.min(1.4, 1 + item.metadata.engagement * 0.04)
      : 1;
  return boost * engagement;
}

/**
 * Composite feed rank: recency, role/trade/company/project relevance,
 * interaction history, safety priority, and source weights.
 */
export function computeFeedRankScore(
  item: RankableFeedItem,
  ctx: FeedRankingContext = { userId: 0, role: 'WORKER' },
  now: Date = new Date(),
): number {
  const ageMs = Math.max(0, now.getTime() - item.publishedAt.getTime());
  const recency = Math.exp(-ageMs / RECENCY_MS);
  const sourceWeight = SOURCE_WEIGHT[item.source] ?? 1;
  const roleBoost = ROLE_SOURCE_BOOST[ctx.role]?.[item.source] ?? 1;
  const safety = 1 + (item.safetyPriority ?? 0) * SAFETY_PRIORITY_SCALE;
  const stored = item.rankScore > 0 ? item.rankScore * 0.25 : 0;

  const composite =
    recency *
    sourceWeight *
    roleBoost *
    safety *
    subscriptionBoost(item, ctx.subscriptions) *
    tradeRelevance(item, ctx.trades) *
    projectRelevance(item, ctx.projectIds) *
    companyRelevance(item, ctx.companyId) *
    interactionBoost(item, ctx.interactedItemIds, ctx.sourceAffinity);

  return stored + composite * 100;
}

export function sortFeedByRank<T extends RankableFeedItem>(
  items: T[],
  ctx: FeedRankingContext,
  now: Date = new Date(),
): T[] {
  return [...items].sort(
    (a, b) =>
      computeFeedRankScore(b, ctx, now) - computeFeedRankScore(a, ctx, now) ||
      b.publishedAt.getTime() - a.publishedAt.getTime(),
  );
}
