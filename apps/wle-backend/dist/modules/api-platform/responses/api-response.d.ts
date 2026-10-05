import type { ApiSuccessEnvelope } from '@vera/api-contract';
export type PaginationMeta = {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
};
export declare function apiOk<T>(data: T, meta?: Record<string, unknown>): ApiSuccessEnvelope<T>;
export declare function apiPaginated<T>(data: T[], pagination: PaginationMeta, extraMeta?: Record<string, unknown>): ApiSuccessEnvelope<T[]>;
