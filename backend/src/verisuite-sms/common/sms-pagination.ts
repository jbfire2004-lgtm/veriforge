import { SMS_PAGE_DEFAULT, SMS_PAGE_MAX } from '../constants';
import { SmsException } from './sms-errors';

export interface SmsPageQuery {
  cursor?: string;
  limit?: number | string;
}

export function parseSmsPage(query: SmsPageQuery): {
  cursor?: string;
  take: number;
} {
  const take = Math.min(
    Math.max(1, Number(query.limit) || SMS_PAGE_DEFAULT),
    SMS_PAGE_MAX,
  );
  if (query.cursor != null && query.cursor !== '') {
    if (typeof query.cursor !== 'string' || query.cursor.length > 200) {
      throw new SmsException('VALIDATION_ERROR', 'Invalid cursor');
    }
  }
  return {
    cursor: query.cursor || undefined,
    take,
  };
}

export function paginatedResult<T extends { id: string }>(
  items: T[],
  take: number,
): { items: T[]; nextCursor: string | null } {
  const nextCursor =
    items.length === take ? (items[items.length - 1]?.id ?? null) : null;
  return { items, nextCursor };
}

export function parseDateRange(
  dateFrom?: string,
  dateTo?: string,
  maxDays = 366,
): { gte?: Date; lte?: Date } {
  const gte = dateFrom ? new Date(dateFrom) : undefined;
  const lte = dateTo ? new Date(dateTo) : undefined;
  if (gte && Number.isNaN(gte.getTime())) {
    throw new SmsException('VALIDATION_ERROR', 'Invalid dateFrom');
  }
  if (lte && Number.isNaN(lte.getTime())) {
    throw new SmsException('VALIDATION_ERROR', 'Invalid dateTo');
  }
  if (gte && lte && gte > lte) {
    throw new SmsException('VALIDATION_ERROR', 'dateFrom must be <= dateTo');
  }
  if (gte && lte) {
    const days = (lte.getTime() - gte.getTime()) / 86_400_000;
    if (days > maxDays) {
      throw new SmsException(
        'VALIDATION_ERROR',
        `Date range exceeds ${maxDays} days`,
      );
    }
  }
  return { gte, lte };
}

export function parseMulti(value?: string | string[]): string[] | undefined {
  if (value == null) return undefined;
  const raw = Array.isArray(value) ? value.join(',') : value;
  const parts = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length ? parts : undefined;
}
