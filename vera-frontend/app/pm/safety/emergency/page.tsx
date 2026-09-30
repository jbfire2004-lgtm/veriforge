import EmergencyMusterPage from "@/src/pages/pm/safety-management/emergency";
import { resolveSearchParams } from "@/lib/resolve-search-params";

export default async function EmergencyRoute({
  searchParams,
}: {
  searchParams: Promise<{ siteId?: string; projectId?: string }>;
}) {
  const sp = await resolveSearchParams(searchParams);
  const siteId = parseInt(sp.siteId ?? "1", 10);
  const projectId = sp.projectId
    ? parseInt(sp.projectId, 10)
    : undefined;
  return <EmergencyMusterPage siteId={siteId} projectId={projectId} />;
}
