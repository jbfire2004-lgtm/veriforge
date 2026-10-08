import JhaFlhaEditorPage from "@/src/screens/pm/jha-flha/editor";
import { resolveSearchParams } from "@/lib/resolve-search-params";

export default async function JhaFlhaNewFlhaRoute({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string; companyId?: string }>;
}) {
  const sp = await resolveSearchParams(searchParams);
  return (
    <JhaFlhaEditorPage
      initialKind="FLHA"
      projectId={parseInt(sp.projectId ?? "1", 10)}
      companyId={parseInt(sp.companyId ?? "1", 10)}
    />
  );
}
