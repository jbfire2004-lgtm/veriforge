import { ProviderError } from "./provider";

export async function sleep(ms: number): Promise<void> {
  if (ms <= 0) return;
  await new Promise((r) => setTimeout(r, ms));
}

/**
 * Retry a transient-failing operation with linear backoff.
 */
export async function withRetries<T>(
  fn: (attempt: number) => Promise<T>,
  opts: {
    maxRetries: number;
    backoffMs: number;
    onAttempt?: (attempt: number, err: ProviderError) => void;
  },
): Promise<T> {
  let lastErr: ProviderError | undefined;
  const attempts = Math.max(1, opts.maxRetries + 1);

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      const pe =
        err instanceof ProviderError
          ? err
          : new ProviderError(
              err instanceof Error ? err.message : "unknown",
              "provider_error",
              "permanent",
              undefined,
              false,
            );
      lastErr = pe;
      opts.onAttempt?.(attempt, pe);
      const retryable =
        pe.retryable === true || pe.errorClass === "transient";
      if (!retryable || attempt >= attempts) throw pe;
      await sleep(opts.backoffMs * attempt);
    }
  }

  throw (
    lastErr ??
    new ProviderError("Retry exhausted", "retry_exhausted", "transient", undefined, false)
  );
}
