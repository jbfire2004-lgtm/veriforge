export type RetryPolicy = {
    maxAttempts: number;
    baseDelayMs: number;
    maxDelayMs: number;
    jitterRatio: number;
};
export declare const DEFAULT_PUBLISH_RETRY: RetryPolicy;
export declare const DEFAULT_CONSUMER_RETRY: RetryPolicy;
export declare function nextRetryAt(attempts: number, policy?: RetryPolicy, now?: number): Date;
