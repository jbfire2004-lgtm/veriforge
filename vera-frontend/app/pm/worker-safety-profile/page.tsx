import PmWorkerSafetyProfileDashboard from "@/src/screens/pm/worker-safety-profile/dashboard";
import { resolveSearchParams } from "@/lib/resolve-search-params";

export default async function PmWorkerSafetyProfileRoute({
  searchParams,
}: {
  searchParams: Promise<{ workerId?: string; projectId?: string }>;
}) {
  const sp = await resolveSearchParams(searchParams);
  return (
    <PmWorkerSafetyProfileDashboard
      workerId={parseInt(sp.workerId ?? "1", 10)}
      projectId={
        sp.projectId ? parseInt(sp.projectId, 10) : undefined
      }
    />
  );
}
