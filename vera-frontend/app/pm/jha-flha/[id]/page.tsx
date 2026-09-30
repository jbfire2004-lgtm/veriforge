import JhaFlhaEditorPage from "@/src/pages/pm/jha-flha/editor";
import { resolveRouteParams } from "@/lib/resolve-route-params";
import { resolveSearchParams } from "@/lib/resolve-search-params";

export default async function JhaFlhaDetailRoute({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ projectId?: string; companyId?: string }>;
}) {
  const { id } = await resolveRouteParams(params);
  const sp = await resolveSearchParams(searchParams);
  return (
    <JhaFlhaEditorPage
      id={id}
      projectId={parseInt(sp.projectId ?? "1", 10)}
      companyId={parseInt(sp.companyId ?? "1", 10)}
    />
  );
}
