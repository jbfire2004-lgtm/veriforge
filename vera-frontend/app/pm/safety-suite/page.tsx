import SafetySuiteHubPage from "@/src/pages/pm/safety-suite/index";
import { resolveSearchParams } from "@/lib/resolve-search-params";

export default async function SafetySuiteRoute({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string; companyId?: string }>;
}) {
  const sp = await resolveSearchParams(searchParams);
  return (
    <SafetySuiteHubPage
      projectId={parseInt(sp.projectId ?? "1", 10)}
      companyId={parseInt(sp.companyId ?? "1", 10)}
    />
  );
}
