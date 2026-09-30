import SubstanceTestDetailPage from "@/src/pages/pm/substance-testing/detail";
import { resolveSearchParams } from "@/lib/resolve-search-params";

export default async function SubstanceTestDetailRoute({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ projectId?: string }>;
}) {
  const { id } = await params;
  const sp = await resolveSearchParams(searchParams);
  return (
    <SubstanceTestDetailPage
      id={id}
      projectId={parseInt(sp.projectId ?? "1", 10)}
    />
  );
}
