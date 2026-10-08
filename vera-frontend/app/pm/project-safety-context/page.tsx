import PmProjectSafetyContextDashboard from "@/src/screens/pm/project-safety-context/dashboard";
import { resolveSearchParams } from "@/lib/resolve-search-params";

export default async function PmProjectSafetyContextRoute({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string; companyId?: string }>;
}) {
  const sp = await resolveSearchParams(searchParams);
  return (
    <PmProjectSafetyContextDashboard
      projectId={parseInt(sp.projectId ?? "1", 10)}
      companyId={parseInt(sp.companyId ?? "1", 10)}
    />
  );
}
