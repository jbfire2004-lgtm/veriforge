import PmUnifiedHazardControlDashboard from "@/src/pages/pm/unified-hazard-control/dashboard";
import { resolveSearchParams } from "@/lib/resolve-search-params";

export default async function PmUnifiedHazardControlRoute({
  searchParams,
}: {
  searchParams: Promise<{ companyId?: string; projectId?: string }>;
}) {
  const sp = await resolveSearchParams(searchParams);
  return (
    <PmUnifiedHazardControlDashboard
      companyId={parseInt(sp.companyId ?? "1", 10)}
      projectId={
        sp.projectId ? parseInt(sp.projectId, 10) : undefined
      }
    />
  );
}
