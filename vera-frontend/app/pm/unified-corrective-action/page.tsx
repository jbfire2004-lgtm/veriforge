import PmUnifiedCorrectiveActionDashboard from "@/src/screens/pm/unified-corrective-action/dashboard";
import { resolveSearchParams } from "@/lib/resolve-search-params";

export default async function PmUnifiedCorrectiveActionRoute({
  searchParams,
}: {
  searchParams: Promise<{ companyId?: string; projectId?: string }>;
}) {
  const sp = await resolveSearchParams(searchParams);
  return (
    <PmUnifiedCorrectiveActionDashboard
      companyId={parseInt(sp.companyId ?? "1", 10)}
      projectId={
        sp.projectId ? parseInt(sp.projectId, 10) : undefined
      }
    />
  );
}
