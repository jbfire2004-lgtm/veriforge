import "server-only";

import type { Session } from "next-auth";
import { apiGetSafe, type ApiGetResult } from "@/lib/api";
import { getServerAccessToken, getServerAuthSession } from "@/lib/server-session";
import type { ProviderDashboard } from "./training-provider";

const BASE = "/api/v1/training-providers";

type PortalMe = {
  provider?: { id: number } | null;
  user?: { trainingProviderId?: number | null };
};

async function sessionWithApiToken(
  session?: Session | null,
): Promise<Session | null> {
  const base = session ?? (await getServerAuthSession());
  if (!base) return null;

  const accessToken = base.accessToken ?? (await getServerAccessToken());
  if (!accessToken) return null;

  if (base.accessToken === accessToken) return base;
  return { ...base, accessToken };
}

/** Resolve provider id from portal context or provider list (super-admin). */
export async function resolveProviderIdForSession(
  session?: Session | null,
): Promise<number | undefined> {
  const authSession = await sessionWithApiToken(session);
  if (!authSession) {
    return undefined;
  }

  const fromUser = authSession.user?.trainingProviderId;
  if (fromUser != null) return fromUser;

  const portal = await apiGetSafe<PortalMe>(`${BASE}/portal/me`, authSession);
  if (portal.ok) {
    const fromPortal =
      portal.data.provider?.id ?? portal.data.user?.trainingProviderId ?? undefined;
    if (fromPortal != null) return fromPortal;
  }

  const list = await apiGetSafe<{ id: number }[]>(`${BASE}/providers`, authSession);
  if (list.ok && list.data.length > 0) {
    return list.data[0].id;
  }

  return undefined;
}

/** Safe dashboard fetch used by provider-portal server pages. */
export async function apiGetSafeProviderDashboard(
  session?: Session | null,
): Promise<ApiGetResult<ProviderDashboard>> {
  const authSession = await sessionWithApiToken(session);
  if (!authSession) {
    return {
      ok: false,
      error:
        "Your session has expired or is missing an API token. Sign out and sign in again, then reopen the provider dashboard.",
    };
  }

  const providerId = await resolveProviderIdForSession(authSession);
  if (providerId == null) {
    return {
      ok: false,
      error:
        "No training provider is linked to this account. Complete provider registration or ask an administrator to link your user.",
    };
  }

  return apiGetSafe<ProviderDashboard>(
    `${BASE}/dashboard?providerId=${providerId}`,
    authSession,
  );
}
