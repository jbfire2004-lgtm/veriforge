import { VeraPageLayout } from "@/src/components/navigation";
import { VeriPmTrainingHubView } from "@/components/veripm-training-hub/VeriPmTrainingHubView";
import { resolveSearchParams } from "@/lib/resolve-search-params";
import { Suspense } from "react";

export const metadata = {
  title: "Training — VeriPM",
  description:
    "Competency intelligence linked from incidents, actions, meetings, and inspections.",
};

export default async function PmTrainingRoute({
  searchParams,
}: {
  searchParams: Promise<{
    projectId?: string;
    companyId?: string;
    focus?: string;
  }>;
}) {
  const sp = await resolveSearchParams(searchParams);
  const projectId = parseInt(sp.projectId ?? "1", 10);
  const companyId = parseInt(sp.companyId ?? "1", 10);

  return (
    <VeraPageLayout>
      <Suspense fallback={<p className="p-6 text-sm text-slate-500">Loading…</p>}>
        <VeriPmTrainingHubView projectId={projectId} companyId={companyId} />
      </Suspense>
    </VeraPageLayout>
  );
}
