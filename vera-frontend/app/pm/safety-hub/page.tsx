import SafetyHubDashboard from "@/src/screens/pm/safety-hub/dashboard";
import { resolveSearchParams } from "@/lib/resolve-search-params";

export default async function SafetyHubRoute({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string; companyId?: string }>;
}) {
  const sp = await resolveSearchParams(searchParams);
  return (
    <SafetyHubDashboard
      companyId={parseInt(sp.companyId ?? "1", 10)}
      projectId={parseInt(sp.projectId ?? "1", 10)}
    />
  );
}
