import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isVeraPmDevOpen } from "@/lib/pm-dev-open";

const PROTECTED_PREFIXES = [
  "/supervisor",
  "/pm",
  "/core",
  "/admin",
  "/dashboard",
  "/wallet",
  "/companies",
  "/workers",
  "/equipment",
  "/training",
  "/documents",
  "/incidents",
  "/verification",
];

function hasSessionToken(req: NextRequest): boolean {
  return Boolean(
    req.cookies.get("next-auth.session-token")?.value ??
      req.cookies.get("__Secure-next-auth.session-token")?.value,
  );
}

/** Vite on :5175 proxies /vera → :3000 with changeOrigin, so Host is :3000. */
function isProxiedFromDevBrowser(req: NextRequest): boolean {
  const forwarded = (req.headers.get("x-forwarded-host") ?? "")
    .split(",")[0]
    ?.trim();
  if (!forwarded) return false;
  return forwarded.endsWith(":5175");
}

function isPmDevOpenPath(pathname: string): boolean {
  return pathname === "/pm" || pathname.startsWith("/pm/");
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = req.headers.get("host") ?? "";

  // Dev: redirect direct :3000 hits to the canonical browser origin (:5175/vera).
  // Skip when the request was proxied from Vite (:5175) — otherwise every /vera/* hit loops.
  if (
    process.env.NODE_ENV === "development" &&
    process.env.DISABLE_DEV_PORT_REDIRECT !== "1" &&
    (host === "localhost:3000" || host === "127.0.0.1:3000") &&
    !isProxiedFromDevBrowser(req)
  ) {
    const basePath = req.nextUrl.basePath || "";
    const target = new URL(
      `http://localhost:5175${basePath}${pathname}${req.nextUrl.search}`,
    );
    return NextResponse.redirect(target);
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-vera-pathname", pathname);

  const isProtected = PROTECTED_PREFIXES.some((p) =>
    pathname === p || pathname.startsWith(`${p}/`),
  );

  const pmDevBypass = isVeraPmDevOpen() && isPmDevOpenPath(pathname);

  if (isProtected && !pmDevBypass && !hasSessionToken(req)) {
    // Clone `nextUrl` so the redirect keeps the request origin and the
    // configured basePath (e.g. `/vera`); building from `req.url` drops the
    // basePath and lands on the VeriForge SPA login instead of Vera's.
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/auth/login";
    loginUrl.search = "";
    // App-relative path (basePath is applied by Next when routing).
    const returnPath = `${pathname}${req.nextUrl.search}`;
    loginUrl.searchParams.set("callbackUrl", returnPath);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
