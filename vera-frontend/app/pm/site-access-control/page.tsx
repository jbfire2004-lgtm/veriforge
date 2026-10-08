import PmSiteAccessDashboardPage from "@/src/screens/pm/site-access-control/dashboard";
import { resolveSearchParams } from "@/lib/resolve-search-params";

export default async function PmSiteAccessRoute({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string; companyId?: string }>;
}) {
  const sp = await resolveSearchParams(searchParams);
  return (
    <PmSiteAccessDashboardPage
      projectId={parseInt(sp.projectId ?? "1", 10)}
      companyId={parseInt(sp.companyId ?? "1", 10)}
    />
  );
}
