import { Suspense } from "react";
import { VeraPageLayout } from "@/src/components/navigation";
import { VeriPmSifHecaHubView } from "@/components/veripm-sif-heca-hub/VeriPmSifHecaHubView";
import { resolveSearchParams } from "@/lib/resolve-search-params";

export const metadata = {
  title: "SIF / HECA — VeriPM",
  description:
    "Unified SIF exposures, HECA assessments, critical control verification, and AI-assisted analysis.",
};

export default async function SifHecaRoute({
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
        <VeriPmSifHecaHubView projectId={projectId} companyId={companyId} />
      </Suspense>
    </VeraPageLayout>
  );
}
