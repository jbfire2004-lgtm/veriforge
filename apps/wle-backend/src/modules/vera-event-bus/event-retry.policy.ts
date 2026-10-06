export type RetryPolicy = {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitterRatio: number;
};

export const DEFAULT_PUBLISH_RETRY: RetryPolicy = {
  maxAttempts: 5,
  baseDelayMs: 2_000,
  maxDelayMs: 120_000,
  jitterRatio: 0.15,
};

export const DEFAULT_CONSUMER_RETRY: RetryPolicy = {
  maxAttempts: 3,
  baseDelayMs: 1_000,
  maxDelayMs: 60_000,
  jitterRatio: 0.1,
};

export function nextRetryAt(
  attempts: number,
  policy: RetryPolicy = DEFAULT_PUBLISH_RETRY,
  now = Date.now(),
): Date {
  const exp = Math.min(
    policy.maxDelayMs,
    policy.baseDelayMs * Math.pow(2, Math.max(0, attempts - 1)),
  );
  const jitter = exp * policy.jitterRatio * (Math.random() * 2 - 1);
  return new Date(now + Math.max(policy.baseDelayMs, exp + jitter));
}
