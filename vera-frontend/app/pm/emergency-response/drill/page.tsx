import { Suspense } from "react";
import { ErpDrillView } from "@/components/veripm-emergency-hub/ErpDrillView";
import { resolveSearchParams } from "@/lib/resolve-search-params";

export const metadata = {
  title: "ERP Drill — VeriPM",
  description:
    "Run ERP drills with live checklist, timestamps, attendance, issues, and auto-generated summary reports.",
};

export default async function ErpDrillRoute({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string; companyId?: string }>;
}) {
  const sp = await resolveSearchParams(searchParams);
  const projectId = parseInt(sp.projectId ?? "1", 10);
  const companyId = parseInt(sp.companyId ?? "1", 10);

  return (
    <Suspense fallback={<p className="p-6 text-sm text-slate-500">Loading…</p>}>
      <ErpDrillView projectId={projectId} companyId={companyId} />
    </Suspense>
  );
}
