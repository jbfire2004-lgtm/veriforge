import PmOfflineModeDashboardPage from "@/src/screens/pm/offline-mode/dashboard";
import { resolveSearchParams } from "@/lib/resolve-search-params";

export default async function PmOfflineModeRoute({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string; companyId?: string }>;
}) {
  const sp = await resolveSearchParams(searchParams);
  return (
    <PmOfflineModeDashboardPage
      projectId={parseInt(sp.projectId ?? "1", 10)}
      companyId={parseInt(sp.companyId ?? "1", 10)}
    />
  );
}
