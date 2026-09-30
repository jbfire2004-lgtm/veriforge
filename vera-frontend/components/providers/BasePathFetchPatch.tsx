"use client";

/**
 * When Vera runs under a Next.js `basePath` (e.g. `/vera`, served via the
 * VeriForge dev proxy on :5175), client code still fetches root-absolute API
 * paths like `/api/v1/core/dashboard`. Next.js only rewrites `basePath` for
 * `<Link>`, router navigation, and static assets — NOT for `fetch()`. Without
 * the prefix those requests bypass Vera and hit the wrong origin, returning 500.
 *
 * This module patches `window.fetch` once (client-only) to prepend the basePath
 * to same-origin `/api/...` requests that don't already include it. It is a
 * no-op when `NEXT_PUBLIC_BASE_PATH` is unset (standalone Vera on :3000).
 */

const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, "") || "";

type PatchedWindow = Window & { __veraFetchPatched?: boolean };

if (
  basePath &&
  typeof window !== "undefined" &&
  !(window as PatchedWindow).__veraFetchPatched
) {
  (window as PatchedWindow).__veraFetchPatched = true;

  const origin = window.location.origin;
  const originalFetch = window.fetch.bind(window);

  const prefixPathname = (pathname: string): string | null => {
    if (!pathname.startsWith("/api/") && pathname !== "/api") return null;
    if (pathname === basePath || pathname.startsWith(`${basePath}/`)) return null;
    return `${basePath}${pathname}`;
  };

  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      if (typeof input === "string") {
        // Relative path, e.g. "/api/v1/core/dashboard/company?x=1"
        if (input.startsWith("/")) {
          const url = new URL(input, origin);
          const next = prefixPathname(url.pathname);
          if (next) {
            url.pathname = next;
            input = url.pathname + url.search + url.hash;
          }
        } else if (input.startsWith(origin)) {
          const url = new URL(input);
          const next = prefixPathname(url.pathname);
          if (next) {
            url.pathname = next;
            input = url.toString();
          }
        }
      } else if (input instanceof URL) {
        if (input.origin === origin) {
          const next = prefixPathname(input.pathname);
          if (next) {
            const url = new URL(input.toString());
            url.pathname = next;
            input = url;
          }
        }
      } else if (input instanceof Request) {
        const url = new URL(input.url);
        if (url.origin === origin) {
          const next = prefixPathname(url.pathname);
          if (next) {
            url.pathname = next;
            input = new Request(url.toString(), input);
          }
        }
      }
    } catch {
      // Fall through to the original fetch on any parsing error.
    }
    return originalFetch(input as RequestInfo | URL, init);
  };
}

export function BasePathFetchPatch() {
  return null;
}
