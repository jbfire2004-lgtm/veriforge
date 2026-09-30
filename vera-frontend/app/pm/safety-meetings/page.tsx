import { VeraPageLayout } from "@/src/components/navigation";
import { VeriPmSafetyMeetingsHubView } from "@/components/veripm-safety-meetings-hub/VeriPmSafetyMeetingsHubView";
import { resolveSearchParams } from "@/lib/resolve-search-params";
import { Suspense } from "react";

export const metadata = {
  title: "Safety Meetings — VeriPM",
  description:
    "Smart safety meeting hub: AI topics, library, planner, and attendance intelligence.",
};

export default async function SafetyMeetingsRoute({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string; companyId?: string }>;
}) {
  const sp = await resolveSearchParams(searchParams);
  const projectId = parseInt(sp.projectId ?? "1", 10);
  const companyId = parseInt(sp.companyId ?? "1", 10);

  return (
    <VeraPageLayout>
      <Suspense fallback={<p className="p-6 text-sm text-slate-500">Loading…</p>}>
        <VeriPmSafetyMeetingsHubView
          projectId={projectId}
          companyId={companyId}
        />
      </Suspense>
    </VeraPageLayout>
  );
}
