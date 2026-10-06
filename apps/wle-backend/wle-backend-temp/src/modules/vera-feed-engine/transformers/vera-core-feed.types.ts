import type { FeedSource } from '@prisma/client';

/** Normalized feed row before Prisma upsert. */
export type VeraCoreFeedUpsertInput = {
  source: FeedSource;
  externalId: string;
  title: string;
  summary?: string | null;
  body?: string | null;
  publishedAt: Date;
  companyId?: number;
  workerId?: number;
  projectId?: number;
  url?: string;
  metadata?: Record<string, unknown>;
  rankScore?: number;
  safetyPriority?: number;
};
