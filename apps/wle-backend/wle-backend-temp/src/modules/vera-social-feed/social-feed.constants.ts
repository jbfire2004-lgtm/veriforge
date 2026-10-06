import type { FeedSource } from '@prisma/client';

/** Never surface compliance clutter on the social homepage feed. */
export const BLOCKED_FEED_SOURCES: FeedSource[] = ['TRAINING_EXPIRY'];

const COMPLIANCE_PATTERN =
  /\b(expir(y|ing|ed)|overdue|compliance alert|training due|certification due|upcoming expir)/i;

export function isComplianceFeedItem(item: {
  source: FeedSource;
  title: string;
  summary?: string | null;
  metadata?: unknown;
}): boolean {
  if (BLOCKED_FEED_SOURCES.includes(item.source)) return true;
  const meta = item.metadata as Record<string, unknown> | null;
  if (meta?.compliance === true) return true;
  if (meta?.expiry === true || meta?.overdue === true) return true;
  if (meta?.kind === 'TRAINING_EXPIRY' || meta?.kind === 'COMPLIANCE')
    return true;
  const text = `${item.title} ${item.summary ?? ''}`;
  if (COMPLIANCE_PATTERN.test(text)) return true;
  if (
    item.source === 'VERA_CORE_TRAINING' &&
    meta?.announcement !== true &&
    meta?.upload !== true
  ) {
    return true;
  }
  return false;
}

export const AD_INJECT_INTERVAL = 5;
