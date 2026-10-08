import { canAccessCoreTools } from "@/lib/phase1-roles";
import { requireRouteAccess } from "@/lib/route-access";
import { apiGetSafe } from "@/lib/api";
import {
  getUserCompanyContext,
  mergeCompaniesWithUser,
} from "@/lib/user-company-context";
import CoreDailyLogListPage from "@/src/screens/core-daily-log/list";
import type { SitesPaginatedDto } from "@/src/api/sites";

export const metadata = {
  title: "Daily logs — Vera Core",
  description: "Shift notes and site narrative with company and site scoping.",
};

export default async function CoreDailyLogsRoute() {
  const { session } = await requireRouteAccess({
    callbackUrl: "/core/daily-logs",
    guard: canAccessCoreTools,
  });

  const [companiesRes, userCompany, sitesRes] = await Promise.all([
    apiGetSafe<{ id: number; name: string }[]>("/companies", session),
    getUserCompanyContext(session),
    apiGetSafe<SitesPaginatedDto>(
      "/api/v1/sites?activeOnly=true&limit=100",
      session,
    ),
  ]);

  const companies = mergeCompaniesWithUser(
    companiesRes.ok ? companiesRes.data : [],
    userCompany,
  );
  const sites = sitesRes.ok
    ? (sitesRes.data.data ?? []).map((s) => ({
        id: s.id,
        name: s.name,
        code: s.code,
      }))
    : [];
  const defaultCompanyId =
    userCompany.companyId ??
    (companies.length === 1 ? companies[0]!.id : undefined);
  const defaultSiteId = sites.length === 1 ? sites[0]!.id : undefined;

  return (
    <CoreDailyLogListPage
      companies={companies}
      sites={sites}
      defaultCompanyId={defaultCompanyId}
      defaultSiteId={defaultSiteId}
      lockCompany={userCompany.lockCompany}
    />
  );
}
