import { createHash } from 'crypto';
import type { SmsAccessPlane } from '@prisma/client';
import type { UserRole } from '@prisma/client';

export type SmsPlane = SmsAccessPlane;

export interface SmsAuthUser {
  id: number;
  role: UserRole;
  companyId: number | null;
  projectIds?: number[];
  subcontractorCompanyId?: number | null;
}

export interface SmsRequestScope {
  companyId: number;
  plane: SmsPlane;
  projectId?: number;
  allowedProjectIds: number[];
  subcontractorCompanyId?: number | null;
  role: UserRole;
  userId: number;
  requestId?: string;
}

export interface SmsEnvelopeMeta {
  requestId?: string;
  plane?: SmsPlane;
  cached?: boolean;
  revision?: number;
  nextCursor?: string | null;
  suppressed?: boolean;
}

export function smsEnvelope<T>(
  data: T,
  meta?: SmsEnvelopeMeta,
): { data: T; meta?: SmsEnvelopeMeta } {
  return meta ? { data, meta } : { data };
}

export function ratePer200k(count: number, hoursWorked: number): number | null {
  if (!hoursWorked || hoursWorked <= 0) return null;
  return Math.round(((count * 200_000) / hoursWorked) * 10000) / 10000;
}

export function sha256Hex(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

export function hashPayload(value: unknown): string {
  return sha256Hex(JSON.stringify(value ?? null));
}

export function qualityBand(score: number): 'pass' | 'warn' | 'fail' {
  if (score >= 80) return 'pass';
  if (score >= 60) return 'warn';
  return 'fail';
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function periodBounds(
  grain: 'day' | 'week' | 'month' | 'quarter',
  end: Date = new Date(),
): { periodStart: Date; periodEnd: Date } {
  const periodEnd = new Date(
    Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()),
  );
  const periodStart = new Date(periodEnd);
  if (grain === 'day') {
    // same day
  } else if (grain === 'week') {
    periodStart.setUTCDate(periodStart.getUTCDate() - 6);
  } else if (grain === 'month') {
    periodStart.setUTCDate(1);
  } else {
    const q = Math.floor(periodEnd.getUTCMonth() / 3) * 3;
    periodStart.setUTCMonth(q, 1);
  }
  return { periodStart, periodEnd };
}
