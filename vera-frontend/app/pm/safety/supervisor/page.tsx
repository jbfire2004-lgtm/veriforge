import SupervisorSafetyDashboard from "@/src/pages/pm/safety-management/supervisor-dashboard";
import { resolveSearchParams } from "@/lib/resolve-search-params";

export default async function SupervisorDashboardRoute({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string; siteId?: string }>;
}) {
  const sp = await resolveSearchParams(searchParams);
  const projectId = parseInt(sp.projectId ?? "1", 10);
  const siteId = sp.siteId
    ? parseInt(sp.siteId, 10)
    : undefined;
  return <SupervisorSafetyDashboard projectId={projectId} siteId={siteId} />;
}
