/**
 * Canonical API error payload nested under `error` in HTTP JSON responses.
 * Top-level envelope: { success: false, statusCode, error: CanonicalApiError, timestamp }
 */
export type CanonicalApiError = {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
};

const STATUS_CODES: Record<number, string> = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  413: "PAYLOAD_TOO_LARGE",
  422: "UNPROCESSABLE_ENTITY",
  429: "TOO_MANY_REQUESTS",
  500: "INTERNAL_SERVER_ERROR",
  503: "SERVICE_UNAVAILABLE",
};

function defaultCodeForStatus(status: number): string | undefined {
  return STATUS_CODES[status] ?? (status >= 400 ? `HTTP_${status}` : undefined);
}

function joinMessages(message: unknown): string {
  if (typeof message === "string" && message.length > 0) return message;
  if (Array.isArray(message) && message.every((x) => typeof x === "string")) {
    return message.join("; ");
  }
  return "";
}

/**
 * Normalize Nest `HttpException.getResponse()` (string or object) plus HTTP status
 * into {@link CanonicalApiError}.
 */
export function toCanonicalApiError(
  raw: string | object,
  statusCode: number,
): CanonicalApiError {
  if (typeof raw === "string") {
    const message = raw.trim() || "Request failed";
    return {
      message,
      code: defaultCodeForStatus(statusCode),
    };
  }

  const o = raw as Record<string, unknown>;
  let message =
    joinMessages(o.message) ||
    (typeof o.error === "string" ? o.error : "") ||
    "";

  if (!message && o.error && typeof o.error === "object") {
    const nested = o.error as Record<string, unknown>;
    message =
      joinMessages(nested.message) ||
      (typeof nested.error === "string" ? nested.error : "") ||
      "";
  }

  if (!message) {
    message = "Request failed";
  }

  const code =
    (typeof o.code === "string" && o.code) ||
    (o.error &&
    typeof o.error === "object" &&
    typeof (o.error as Record<string, unknown>).code === "string"
      ? String((o.error as Record<string, unknown>).code)
      : undefined) ||
    defaultCodeForStatus(statusCode);

  const details: Record<string, unknown> = {};

  const skip = new Set(["message", "statusCode", "error", "success"]);
  for (const [k, v] of Object.entries(o)) {
    if (skip.has(k)) continue;
    details[k] = v;
  }

  if (typeof o.error === "object" && o.error !== null) {
    const nested = o.error as Record<string, unknown>;
    for (const [k, v] of Object.entries(nested)) {
      if (k === "message" || k === "error") continue;
      if (!(k in details)) details[k] = v;
    }
  }

  const hasDetails = Object.keys(details).length > 0;

  return {
    message,
    code,
    ...(hasDetails ? { details } : {}),
  };
}
