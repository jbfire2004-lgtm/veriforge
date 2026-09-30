import SifHecaEvaluatePage from "@/src/pages/pm/sif-heca/evaluate";
import { resolveSearchParams } from "@/lib/resolve-search-params";

export default async function SifHecaEvaluateRoute({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string; companyId?: string }>;
}) {
  const sp = await resolveSearchParams(searchParams);
  return (
    <SifHecaEvaluatePage
      projectId={parseInt(sp.projectId ?? "1", 10)}
      companyId={parseInt(sp.companyId ?? "1", 10)}
    />
  );
}
