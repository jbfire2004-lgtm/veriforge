/**
 * Canonical local dev ports — browser uses ONE origin only.
 * @see docs/VERIFORGE-LOCAL-PORTS.md
 */

/** Browser entry (Vite SPA + proxies). All user-facing links use this. */
export const DEV_BROWSER_ORIGIN = "http://localhost:5175";

/** Workspace UI path when served via the Vite proxy. */
export const DEV_WORKSPACE_PUBLIC_URL = `${DEV_BROWSER_ORIGIN}/vera`;

/** Internal Next.js dev server (not for direct browser use). */
export const DEV_NEXT_INTERNAL_PORT = 3000;

/** Internal Nest API (SSR + server-side fetches). */
export const DEV_NEST_INTERNAL_URL = "http://localhost:3001";

/** Browser-relative Nest proxy on the Vite dev server. */
export const DEV_NEST_PROXY_PATH = "/nest";

/** Public site URL for SEO, auth callbacks, and share links. */
export function publicSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXTAUTH_URL ??
    DEV_WORKSPACE_PUBLIC_URL
  ).replace(/\/$/, "");
}

/**
 * Server-side Nest origin. Compose sets NEST_INTERNAL_URL=http://nest:3001
 * while the browser keeps a relative NEXT_PUBLIC_API_URL such as /nest.
 */
export function resolveServerApiBaseUrl(): string {
  const internal = process.env.NEST_INTERNAL_URL?.replace(/\/$/, "");
  if (internal && !internal.startsWith("/")) return internal;
  const configured = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (configured && !configured.startsWith("/")) return configured;
  return DEV_NEST_INTERNAL_URL;
}

/**
 * Nest API base URL.
 * - SSR (Next on :3000): NEST_INTERNAL_URL, else an absolute NEXT_PUBLIC_API_URL, else :3001
 * - Browser on :5175: `/nest` Vite proxy → :3001
 */
export function resolveApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (typeof window === "undefined") {
    return resolveServerApiBaseUrl();
  }
  if (configured?.startsWith("/")) return configured;
  if (configured) return configured;
  const { hostname, port } = window.location;
  if (
    (hostname === "localhost" || hostname === "127.0.0.1") &&
    port === "5175"
  ) {
    return DEV_NEST_PROXY_PATH;
  }
  return DEV_NEST_INTERNAL_URL;
}

/** WebSocket origin for Nest live feeds (matches `resolveApiBaseUrl`). */
export function resolveApiWsOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_API_WS_URL?.replace(/\/$/, "");
  if (explicit) return explicit;

  const base = resolveApiBaseUrl();
  if (base.startsWith("/")) {
    const proto =
      typeof window !== "undefined" && window.location.protocol === "https:"
        ? "wss:"
        : "ws:";
    const host =
      typeof window !== "undefined"
        ? window.location.host
        : `localhost:5175`;
    return `${proto}//${host}${base}`;
  }
  try {
    const u = new URL(base);
    u.protocol = u.protocol === "https:" ? "wss:" : "ws:";
    return u.origin;
  } catch {
    return "ws://localhost:3001";
  }
}
