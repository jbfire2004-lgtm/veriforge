import NewSubstanceTestPage from "@/src/pages/pm/substance-testing/new";
import { resolveSearchParams } from "@/lib/resolve-search-params";

export default async function NewSubstanceTestRoute({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string; companyId?: string }>;
}) {
  const sp = await resolveSearchParams(searchParams);
  return (
    <NewSubstanceTestPage
      projectId={parseInt(sp.projectId ?? "1", 10)}
      companyId={parseInt(sp.companyId ?? "1", 10)}
    />
  );
}
