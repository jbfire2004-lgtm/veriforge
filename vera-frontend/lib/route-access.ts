import "server-only";

import type { Session } from "next-auth";
import { redirect } from "next/navigation";
import { isVeraPmDevOpen, veraPmDevOpenSession } from "@/lib/pm-dev-open";
import { getServerAuthSession } from "@/lib/server-session";
import { resolveSessionRole } from "@/lib/session-role";

export type RouteGuard = (role: string | null) => boolean;

export type RouteAccess = {
  session: Session;
  role: string | null;
};

export type RequireRouteAccessOptions = {
  /** Where to send the user after sign-in. Must be an in-app path. */
  callbackUrl: string;
  /** Predicate run against `sessionRole(session)`. Pass `true` for any signed-in user. */
  guard?: RouteGuard;
  /** Where to send users who *are* signed in but lack the required role. Defaults to `/forbidden`. */
  forbiddenUrl?: string;
};

/**
 * Server-side route guard used by `app/.../layout.tsx` and any page that needs
 * to gate access by role.
 *
 * Behaviour:
 * - No session → redirects to `/auth/login?callbackUrl=<callbackUrl>`
 *   (unless `NEXT_PUBLIC_VERA_PM_DEV_OPEN=1` in non-production).
 * - Session but guard fails → redirects to `forbiddenUrl` (default `/forbidden?from=<callbackUrl>`).
 * - Otherwise returns `{ session, role }` so the caller can render with role-aware UI.
 *
 * `redirect()` throws and never returns, so the return type is the success path only.
 */
export async function requireRouteAccess(
  options: RequireRouteAccessOptions
): Promise<RouteAccess> {
  const { callbackUrl, guard, forbiddenUrl } = options;
  let session = await getServerAuthSession();
  if (!session?.user && isVeraPmDevOpen()) {
    session = veraPmDevOpenSession() as Session;
  }
  if (!session?.user) {
    redirect(`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  const role = resolveSessionRole(session);
  if (guard && !guard(role)) {
    const target =
      forbiddenUrl ?? `/forbidden?from=${encodeURIComponent(callbackUrl)}`;
    redirect(target);
  }
  return { session, role };
}
