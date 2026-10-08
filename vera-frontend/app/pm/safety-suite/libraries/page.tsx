import SafetySuiteLibrariesPage from "@/src/screens/pm/safety-suite/libraries";
import { resolveSearchParams } from "@/lib/resolve-search-params";

export default async function SafetySuiteLibrariesRoute({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string; companyId?: string }>;
}) {
  const sp = await resolveSearchParams(searchParams);
  return (
    <SafetySuiteLibrariesPage
      projectId={parseInt(sp.projectId ?? "1", 10)}
      companyId={parseInt(sp.companyId ?? "1", 10)}
    />
  );
}
