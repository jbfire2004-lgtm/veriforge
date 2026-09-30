import "server-only";

import type { Session } from "next-auth";
import { getServerAuthSession } from "@/lib/server-session";
import { apiGetSafe } from "@/lib/api";
import { isSuperAdmin } from "@/lib/phase1-roles";

export type UserCompanyContext = {
  companyId: number | null;
  companyName: string | null;
  /** When true, company picker should be read-only for this user. */
  lockCompany: boolean;
  role: string | null;
};

export type CompanyOption = { id: number; name: string };

type AuthMeUser = {
  id: number;
  role: string;
  companyId?: number | null;
  companyName?: string | null;
};

async function resolveAuthSession(
  session?: Session | null,
): Promise<Session | null> {
  if (session?.accessToken) return session;
  if (session) {
    const enriched = await getServerAuthSession();
    return enriched ?? session;
  }
  return getServerAuthSession();
}

/** Resolve the signed-in user's employer for subscriber auto-populate. */
export async function getUserCompanyContext(
  session?: Session | null,
): Promise<UserCompanyContext> {
  const resolvedSession = await resolveAuthSession(session);
  const role = resolvedSession?.user?.role ?? null;

  let companyId = resolvedSession?.user?.companyId ?? null;
  let companyName = resolvedSession?.user?.companyName ?? null;

  if (companyId == null) {
    const me = await apiGetSafe<{ user: AuthMeUser }>(
      "/auth/me",
      resolvedSession,
    );
    if (me.ok && me.data.user) {
      companyId = me.data.user.companyId ?? null;
      companyName = me.data.user.companyName ?? null;
    }
  }

  const lockCompany =
    companyId != null && companyId > 0 && !isSuperAdmin(role);

  return { companyId, companyName, lockCompany, role };
}

/** Ensure the subscriber's company appears in picker options even if directory fetch failed partially. */
export function mergeCompaniesWithUser(
  companies: CompanyOption[],
  userCompany: Pick<UserCompanyContext, "companyId" | "companyName">,
): CompanyOption[] {
  if (!userCompany.companyId || userCompany.companyId < 1) {
    return companies;
  }
  if (companies.some((c) => c.id === userCompany.companyId)) {
    return companies;
  }
  return [
    ...companies,
    {
      id: userCompany.companyId,
      name: userCompany.companyName ?? `Company #${userCompany.companyId}`,
    },
  ];
}
