/**
 * VeriSuite SMS — query optimization helpers (Final Data Model §8).
 * Patterns for hub reads, regional drilldown, AI cache hits, rates /200k.
 */

import {
  SMS_QUERY_OPTIMIZATION,
  SMS_RBAC_PREDICATE,
  type SmsQueryWorkload,
} from '../data-model/sms-production-data-model';

export const SMS_AGGREGATE_CACHE_TTL_SEC = 45;

export type SmsLatestMetricQuery = {
  companyId: number;
  projectId?: number | null;
  geoNodeId?: string | null;
  periodGrain: 'day' | 'week' | 'month' | 'quarter';
  /** Prefer DISTINCT ON … ORDER BY period_end DESC */
  latestOnly?: boolean;
};

/**
 * Recommended orderBy for latest snapshot reads.
 * Pair with findFirst / take:1 after company(+project/geo) filter.
 */
export function latestMetricOrderBy(): { periodEnd: 'desc' } {
  return { periodEnd: 'desc' };
}

/**
 * Tenant-first where clause builder — never omit companyId.
 */
export function tenantMetricWhere(q: SmsLatestMetricQuery): Record<string, unknown> {
  const where: Record<string, unknown> = {
    companyId: q.companyId,
    periodGrain: q.periodGrain,
    deletedAt: null,
  };
  if (q.projectId != null) where.projectId = q.projectId;
  if (q.geoNodeId != null) where.geoNodeId = q.geoNodeId;
  return where;
}

/**
 * Regional children for AI-18 drilldown — indexed on
 * (company_id, parent_geo_node_id, period_end DESC).
 */
export function regionalChildrenWhere(params: {
  companyId: number;
  parentGeoNodeId: string;
  periodGrain: string;
  availableOnly?: boolean;
}): Record<string, unknown> {
  return {
    companyId: params.companyId,
    parentGeoNodeId: params.parentGeoNodeId,
    periodGrain: params.periodGrain,
    deletedAt: null,
    ...(params.availableOnly !== false ? { available: true } : {}),
  };
}

/**
 * AI cache hit key — matches partial unique active index.
 */
export function aiCacheHitWhere(params: {
  companyId: number;
  behaviorId: string;
  inputHash: string;
  pageContext?: string | null;
}): Record<string, unknown> {
  return {
    companyId: params.companyId,
    behaviorId: params.behaviorId,
    inputHash: params.inputHash,
    pageContext: params.pageContext ?? null,
    status: 'active',
    expiresAt: { gt: new Date() },
  };
}

/**
 * Rate per 200k hours — never recompute hours in request path;
 * use hours_worked already on the metrics row.
 */
export function ratePer200k(count: number, hoursWorked: number): number | null {
  if (!hoursWorked || hoursWorked <= 0) return null;
  return Number(((count * 200_000) / hoursWorked).toFixed(4));
}

export function listQueryWorkloads(): SmsQueryWorkload[] {
  return [...SMS_QUERY_OPTIMIZATION];
}

export function rbacPredicateDoc(): string {
  return SMS_RBAC_PREDICATE;
}

/** Payload size guard for hub responses (SLO ≤150KB). */
export const SMS_HUB_PAYLOAD_BUDGET_BYTES = 150_000;

export function assertHubPayloadBudget(
  json: unknown,
  budget = SMS_HUB_PAYLOAD_BUDGET_BYTES,
): { ok: boolean; bytes: number } {
  const bytes = Buffer.byteLength(JSON.stringify(json ?? {}), 'utf8');
  return { ok: bytes <= budget, bytes };
}
