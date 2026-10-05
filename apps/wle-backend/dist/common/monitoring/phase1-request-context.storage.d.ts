import { AsyncLocalStorage } from 'async_hooks';
export type Phase1RequestStore = {
    correlationId: string;
    userId?: number;
    ip?: string | null;
    userAgent?: string | null;
};
export declare const phase1RequestStore: AsyncLocalStorage<Phase1RequestStore>;
