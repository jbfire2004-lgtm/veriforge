import type { ApiSuccessEnvelope } from '@vera/api-contract';

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

/** Build standard success envelope (§2). */
export function apiOk<T>(
  data: T,
  meta?: Record<string, unknown>,
): ApiSuccessEnvelope<T> {
  return {
    status: 'success',
    data,
    ...(meta ? { meta } : {}),
  };
}

export function apiPaginated<T>(
  data: T[],
  pagination: PaginationMeta,
  extraMeta?: Record<string, unknown>,
): ApiSuccessEnvelope<T[]> {
  return apiOk(data, { ...extraMeta, pagination });
}
