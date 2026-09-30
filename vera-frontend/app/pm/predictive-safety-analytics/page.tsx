import { VeraPageLayout } from "@/src/components/navigation";
import { VeriPmPredictiveView } from "@/components/veripm-predictive/VeriPmPredictiveView";
import { resolveSearchParams } from "@/lib/resolve-search-params";
import { Suspense } from "react";

export const metadata = {
  title: "Predictive Safety — VeriPM",
  description:
    "AI risk forecasts, industry comparisons, and cross-page next steps.",
};

export default async function PredictiveSafetyAnalyticsRoute({
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
        <VeriPmPredictiveView projectId={projectId} companyId={companyId} />
      </Suspense>
    </VeraPageLayout>
  );
}
