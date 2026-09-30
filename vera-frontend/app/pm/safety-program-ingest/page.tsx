import { Suspense } from "react";
import { VeraPageLayout } from "@/src/components/navigation";
import { SafetyProgramIngestPanel } from "@/components/safety-program-ingestion/SafetyProgramIngestPanel";
import { resolveSearchParams } from "@/lib/resolve-search-params";

export const metadata = {
  title: "Safety Program Ingestion — VeriPM",
};

export default async function PmSafetyProgramIngestPage({
  searchParams,
}: {
  searchParams: Promise<{ companyId?: string; projectId?: string }>;
}) {
  const sp = await resolveSearchParams(searchParams);
  const companyId = parseInt(sp.companyId ?? "1", 10);
  const projectId = parseInt(sp.projectId ?? "1", 10);

  return (
    <VeraPageLayout>
      <Suspense fallback={<p className="p-6 text-sm text-slate-500">Loading…</p>}>
        <SafetyProgramIngestPanel
          companyId={companyId}
          projectId={projectId}
          channel="pm"
          title="Safety Program Ingestion"
        />
      </Suspense>
    </VeraPageLayout>
  );
}
