/**
 * Unified SMS workflow API client.
 * Delegates to /api/v1/pm/sms/workflows — see docs/SMS-WORKFLOW-API.md.
 */
import type { Session } from 'next-auth';
import type {
  SmsWorkflowCreateBody,
  SmsWorkflowEntity,
  SmsWorkflowListQuery,
  SmsWorkflowUpdateBody,
} from '@vera/api-contract';
import { apiFetchJson } from './api-fetch';

const BASE = '/api/v1/pm/sms/workflows';

export type SmsWorkflowApiContext = {
  session?: Session | null;
};

export async function fetchSmsWorkflowSurface(ctx?: SmsWorkflowApiContext) {
  return apiFetchJson<Record<string, unknown>>(BASE, { session: ctx?.session });
}

export async function listSmsWorkflowRecords(
  entity: SmsWorkflowEntity,
  query: SmsWorkflowListQuery,
  ctx?: SmsWorkflowApiContext,
) {
  const q = new URLSearchParams();
  if (query.companyId != null) q.set('companyId', String(query.companyId));
  if (query.projectId != null) q.set('projectId', String(query.projectId));
  if (query.status) q.set('status', query.status);
  if (query.kind) q.set('kind', query.kind);
  if (query.limit != null) q.set('limit', String(query.limit));
  const suffix = q.toString() ? `?${q}` : '';
  return apiFetchJson<unknown[]>(`${BASE}/${entity}${suffix}`, {
    session: ctx?.session,
  });
}

export async function createSmsWorkflowDraft(
  entity: SmsWorkflowEntity,
  body: SmsWorkflowCreateBody,
  ctx?: SmsWorkflowApiContext,
) {
  return apiFetchJson<unknown>(`${BASE}/${entity}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    session: ctx?.session,
  });
}

export async function getSmsWorkflowRecord(
  entity: SmsWorkflowEntity,
  id: string,
  ctx?: SmsWorkflowApiContext,
) {
  return apiFetchJson<unknown>(`${BASE}/${entity}/${id}`, {
    session: ctx?.session,
  });
}

export async function patchSmsWorkflowRecord(
  entity: SmsWorkflowEntity,
  id: string,
  body: SmsWorkflowUpdateBody,
  ctx?: SmsWorkflowApiContext,
) {
  return apiFetchJson<unknown>(`${BASE}/${entity}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    session: ctx?.session,
  });
}

export async function submitSmsWorkflowRecord(
  entity: SmsWorkflowEntity,
  id: string,
  ctx?: SmsWorkflowApiContext,
) {
  return apiFetchJson<unknown>(`${BASE}/${entity}/${id}/submit`, {
    method: 'POST',
    session: ctx?.session,
  });
}

export type { SmsWorkflowEntity, SmsWorkflowCreateBody, SmsWorkflowUpdateBody };
