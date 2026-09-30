import { PmProjectWorkspace } from "@/src/components/pm/PmProjectWorkspace";
import { resolveSearchParams } from "@/lib/resolve-search-params";

export default async function PmProjectManagementRoute({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string }>;
}) {
  const sp = await resolveSearchParams(searchParams);
  return <PmProjectWorkspace projectId={parseInt(sp.projectId ?? "1", 10)} />;
}
