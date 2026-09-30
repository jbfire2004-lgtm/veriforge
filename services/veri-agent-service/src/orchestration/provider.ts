import type {
  AiTaskType,
  ErrorClass,
  ProviderKind,
  ProviderRequest,
  ProviderResponse,
} from "./types";

/**
 * Pluggable provider adapter — OpenAI, Azure, Anthropic, local, heuristic, etc.
 */
export interface AiProvider {
  readonly id: string;
  readonly kind: ProviderKind;
  readonly regions: readonly string[];

  supports(taskType: AiTaskType): boolean;

  /**
   * Execute a single completion. Throw ProviderError for classified failures.
   */
  complete(req: ProviderRequest): Promise<ProviderResponse>;
}

export class ProviderError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly errorClass: ErrorClass,
    public readonly status?: number,
    public readonly retryable?: boolean,
  ) {
    super(message);
    this.name = "ProviderError";
  }
}

export function classifyHttpStatus(status: number): {
  errorClass: ErrorClass;
  retryable: boolean;
  code: string;
} {
  if (status === 408 || status === 429 || status >= 500) {
    return {
      errorClass: "transient",
      retryable: true,
      code: status === 429 ? "rate_limited" : "provider_unavailable",
    };
  }
  if (status === 401 || status === 403) {
    return {
      errorClass: "permanent",
      retryable: false,
      code: "provider_auth",
    };
  }
  if (status === 400 || status === 422) {
    return {
      errorClass: "permanent",
      retryable: false,
      code: "provider_bad_request",
    };
  }
  return {
    errorClass: "permanent",
    retryable: false,
    code: "provider_error",
  };
}

export function isAbortError(err: unknown): boolean {
  return (
    (err instanceof Error && err.name === "AbortError") ||
    (typeof err === "object" &&
      err !== null &&
      "name" in err &&
      (err as { name: string }).name === "AbortError")
  );
}

export function toProviderError(err: unknown): ProviderError {
  if (err instanceof ProviderError) return err;
  if (isAbortError(err)) {
    return new ProviderError(
      "Provider request timed out or was aborted",
      "timeout",
      "transient",
      undefined,
      true,
    );
  }
  if (err instanceof SyntaxError) {
    return new ProviderError(
      "Provider returned non-JSON content",
      "invalid_json",
      "permanent",
      undefined,
      false,
    );
  }
  const message = err instanceof Error ? err.message : "Unknown provider error";
  // Network failures are typically transient
  if (/fetch|network|ECONN|ETIMEDOUT|ENOTFOUND/i.test(message)) {
    return new ProviderError(message, "network_error", "transient", undefined, true);
  }
  return new ProviderError(message, "provider_error", "permanent", undefined, false);
}
