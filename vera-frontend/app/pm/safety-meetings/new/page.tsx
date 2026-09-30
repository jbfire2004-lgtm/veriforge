import { Suspense } from "react";
import NewSafetyMeetingPage from "@/src/pages/pm/safety-meetings/new";
import { resolveSearchParams } from "@/lib/resolve-search-params";

export default async function NewSafetyMeetingRoute({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string; companyId?: string }>;
}) {
  const sp = await resolveSearchParams(searchParams);
  return (
    <Suspense fallback={<p className="p-6 text-sm text-slate-500">Loading…</p>}>
      <NewSafetyMeetingPage
        projectId={parseInt(sp.projectId ?? "1", 10)}
        companyId={parseInt(sp.companyId ?? "1", 10)}
      />
    </Suspense>
  );
}
