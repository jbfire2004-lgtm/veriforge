import type { Session } from "next-auth";
import { errorFromApiResponse } from "@/lib/core/api-error";
import { resolveApiBaseUrl, resolveApiWsOrigin, DEV_NEST_INTERNAL_URL } from "@/lib/dev-ports";
import { isVeraPmDevOpen } from "@/lib/pm-dev-open";
import { isVeraAuthBootstrapping } from "@/lib/vera-auth-boot";

export function getApiBaseUrl(): string {
  return resolveApiBaseUrl();
}

/** @deprecated Use `getApiBaseUrl()` — resolved per request for correct :5175 proxy routing. */
export const API_URL = DEV_NEST_INTERNAL_URL;

/** WebSocket origin derived from API base (`http`→`ws`, relative→same host). */
export function apiWsOrigin(): string {
  return resolveApiWsOrigin();
}

export type ApiFetchOptions = RequestInit & {
  /** Defaults to true for API calls to protected backend routes. */
  requireAuth?: boolean;
  /** Optional prefetched session to avoid resolving it twice in callers. */
  session?: Session | null;
  /** Abort the request after this many milliseconds (server/client). */
  timeoutMs?: number;
};

export async function getAccessToken(
  prefetchedSession?: Session | null
): Promise<string> {
  const token = await resolveSessionAccessToken(prefetchedSession);
  if (!token) {
    // Local PM testing: Nest JwtAuthGuard injects a mock actor when VERA_PM_DEV_OPEN=1.
    if (isVeraPmDevOpen()) {
      return "dev-open";
    }
    throw new Error("Missing auth token for protected API request");
  }
  return token;
}

async function resolveSessionAccessToken(
  prefetchedSession?: Session | null
): Promise<string | undefined> {
  if (prefetchedSession?.accessToken) return prefetchedSession.accessToken;

  if (typeof window !== "undefined") {
    const { getVeraBootstrapAccessToken } = await import("@/lib/vera-auth-boot");
    const bootstrap = getVeraBootstrapAccessToken();
    if (bootstrap) return bootstrap;

    const { getSession } = await import("next-auth/react");
    // Session may still be hydrating on first client fetch after navigation.
    const retryDelaysMs = [0, 50, 100, 200, 400, 800];
    for (const delayMs of retryDelaysMs) {
      if (delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
      const session = await getSession();
      if (session?.accessToken) return session.accessToken;
    }

    try {
      const res = await fetch("/api/auth/session", {
        credentials: "include",
        cache: "no-store",
      });
      if (res.ok) {
        const session = (await res.json()) as Session | null;
        if (session?.accessToken) return session.accessToken;
      }
    } catch {
      /* fall through */
    }

    return undefined;
  }

  const [{ getServerSession }, { authOptions }] = await Promise.all([
    import("next-auth"),
    import("@/lib/auth-options"),
  ]);
  const session = prefetchedSession ?? (await getServerSession(authOptions));
  return session?.accessToken;
}

function toAbsoluteUrl(input: RequestInfo | URL): string {
  if (input instanceof URL) return input.toString();
  if (typeof input !== "string") return String(input);
  if (/^https?:\/\//i.test(input)) return input;
  // Browser cannot always reach Nest :3001 (private-network / embedded preview).
  // Same-origin /api/veriforge/* is proxied by Next to Nest.
  if (
    typeof window !== "undefined" &&
    (input === "/veriforge" || input.startsWith("/veriforge/"))
  ) {
    return `/api${input}`;
  }
  if (input.startsWith("/")) return `${resolveApiBaseUrl()}${input}`;
  return `${resolveApiBaseUrl()}/${input}`;
}

let authRedirectInFlight = false;

async function tryRecoverClientAccessToken(): Promise<string | undefined> {
  if (typeof window === "undefined") return undefined;
  const { getSession } = await import("next-auth/react");
  const retryDelaysMs = [50, 150, 400];
  for (const delayMs of retryDelaysMs) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    const session = await getSession();
    if (session?.accessToken) return session.accessToken;
  }
  try {
    const res = await fetch("/api/auth/session", {
      credentials: "include",
      cache: "no-store",
    });
    if (res.ok) {
      const session = (await res.json()) as Session | null;
      if (session?.accessToken) return session.accessToken;
    }
  } catch {
    /* fall through */
  }
  return undefined;
}

function redirectToLogin(): void {
  if (
    typeof window === "undefined" ||
    authRedirectInFlight ||
    isVeraAuthBootstrapping()
  ) {
    return;
  }
  authRedirectInFlight = true;
  const callbackUrl = window.location.pathname + window.location.search;
  window.location.href = `/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;
}

function redirectToForbidden(): void {
  if (typeof window === "undefined") return;
  const from = encodeURIComponent(window.location.pathname);
  window.location.href = `/forbidden?from=${from}`;
}

async function executeAuthedFetch(
  input: RequestInfo | URL,
  init: RequestInit,
  token: string | undefined,
  signal: AbortSignal | undefined,
): Promise<Response> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body != null) {
    headers.set("Content-Type", "application/json");
  }
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  // Never send the local "dev-open" sentinel — Nest treats missing Bearer as
  // the mock SUPER_ADMIN when VERA_PM_DEV_OPEN=1.
  if (token && token !== "dev-open") {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(toAbsoluteUrl(input), {
    ...init,
    signal,
    credentials: init.credentials ?? "include",
    headers,
  });
}

function isVeriForgeApiRequest(input: RequestInfo | URL): boolean {
  const raw =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.pathname
        : String(input);
  return raw.includes("/veriforge");
}

function readVeriForgeTenantAccessToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem("veriforge.tenant.session");
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as { accessToken?: string };
    return parsed.accessToken || undefined;
  } catch {
    return undefined;
  }
}

export async function apiFetch(
  input: RequestInfo | URL,
  options?: ApiFetchOptions
): Promise<Response> {
  const { requireAuth = true, session, timeoutMs, ...init } = options ?? {};
  const veriforgeCall = isVeriForgeApiRequest(input);
  let token: string | undefined;
  if (veriforgeCall) {
    token = readVeriForgeTenantAccessToken();
    if (requireAuth && !token) {
      throw new Error("Missing VeriForge tenant session");
    }
  } else if (requireAuth) {
    token = await getAccessToken(session);
  } else if (session?.accessToken) {
    // Caller-supplied session only — never call getServerSession on public routes.
    // Otherwise NextAuth's jwt callback (e.g. token refresh) deadlocks waiting on itself.
    token = session.accessToken;
  }

  const signals: AbortSignal[] = [];
  if (init.signal) signals.push(init.signal);
  if (timeoutMs != null && timeoutMs > 0) {
    signals.push(AbortSignal.timeout(timeoutMs));
  }
  const signal =
    signals.length === 0
      ? undefined
      : signals.length === 1
        ? signals[0]
        : AbortSignal.any(signals);

  let res = await executeAuthedFetch(input, init, token, signal);

  if (requireAuth && res.status === 401 && typeof window !== "undefined") {
    if (veriforgeCall) {
      window.location.href = "/veriforge/auth/login";
      return res;
    }
    const recovered = await tryRecoverClientAccessToken();
    if (recovered && recovered !== token) {
      res = await executeAuthedFetch(input, init, recovered, signal);
    }
    if (res.status === 401) {
      redirectToLogin();
    }
  }

  if (res.status === 403 && typeof window !== "undefined" && !veriforgeCall) {
    redirectToForbidden();
  }

  return res;
}

/** Unwrap `{ status: "success", data }` envelopes from the API platform. */
export function unwrapApiPayload<T>(payload: unknown): T {
  if (payload == null || typeof payload !== "object") {
    return payload as T;
  }
  if (
    "status" in payload &&
    (payload as { status?: string }).status === "success" &&
    "data" in payload
  ) {
    return (payload as { data: T }).data;
  }
  if ("data" in payload && !("status" in payload)) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

export async function apiFetchJson<T>(
  input: RequestInfo | URL,
  options?: ApiFetchOptions
): Promise<T> {
  const res = await apiFetch(input, options);
  if (!res.ok) {
    const text = await res.text();
    throw errorFromApiResponse(res.status, text);
  }
  const text = await res.text();
  if (!text) return undefined as T;
  return unwrapApiPayload<T>(JSON.parse(text));
}
