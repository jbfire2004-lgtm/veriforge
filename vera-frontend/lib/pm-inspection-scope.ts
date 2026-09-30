import type { Session } from "next-auth";

/** Read `companyId` from the VERA API JWT — must match backend tenant checks. */
export function companyIdFromAccessToken(accessToken: string): number | null {
  try {
    const part = accessToken.split(".")[1];
    if (!part) return null;
    const padded = part.replace(/-/g, "+").replace(/_/g, "/");
    const json = JSON.parse(
      typeof Buffer !== "undefined"
        ? Buffer.from(padded, "base64").toString("utf8")
        : atob(padded),
    ) as { companyId?: unknown };
    const raw = json?.companyId;
    if (typeof raw === "number" && raw > 0) return raw;
    if (typeof raw === "string") {
      const parsed = parseInt(raw, 10);
      if (Number.isFinite(parsed) && parsed > 0) return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/** Prefer JWT tenant id, then session user, then URL (fixes 403 cross-tenant errors). */
export function resolvePmInspectionCompanyId(
  session: Session | null | undefined,
  queryCompanyId?: string | number,
): number {
  if (typeof session?.accessToken === "string") {
    const fromJwt = companyIdFromAccessToken(session.accessToken);
    if (fromJwt != null) return fromJwt;
  }

  const fromSession = session?.user?.companyId;
  if (typeof fromSession === "number" && fromSession > 0) {
    return fromSession;
  }
  if (typeof queryCompanyId === "number" && queryCompanyId > 0) {
    return queryCompanyId;
  }
  const parsed = parseInt(String(queryCompanyId ?? "1"), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export function resolvePmInspectionProjectId(queryProjectId?: string | number): number {
  if (typeof queryProjectId === "number" && queryProjectId > 0) {
    return queryProjectId;
  }
  const parsed = parseInt(String(queryProjectId ?? "1"), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export function pmInspectionQuery(companyId: number, projectId: number): string {
  return `?projectId=${projectId}&companyId=${companyId}`;
}
