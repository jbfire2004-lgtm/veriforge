import PmSafetyStationsDashboardPage from "@/src/pages/pm/safety-stations/dashboard";
import { resolveSearchParams } from "@/lib/resolve-search-params";

export default async function PmSafetyStationsRoute({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string; companyId?: string }>;
}) {
  const sp = await resolveSearchParams(searchParams);
  return (
    <PmSafetyStationsDashboardPage
      projectId={parseInt(sp.projectId ?? "1", 10)}
      companyId={parseInt(sp.companyId ?? "1", 10)}
    />
  );
}
