import SubstanceTestingDashboard from "@/src/pages/pm/substance-testing/dashboard";
import { resolveSearchParams } from "@/lib/resolve-search-params";

export default async function SubstanceTestingRoute({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string; companyId?: string }>;
}) {
  const sp = await resolveSearchParams(searchParams);
  return (
    <SubstanceTestingDashboard
      projectId={parseInt(sp.projectId ?? "1", 10)}
      companyId={parseInt(sp.companyId ?? "1", 10)}
    />
  );
}
