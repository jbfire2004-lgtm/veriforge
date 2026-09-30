import { Suspense } from "react";
import { VeraPageLayout } from "@/src/components/navigation";
import { ClearanceWorksheetView } from "@/components/veripm-work-at-heights/ClearanceWorksheetView";
import { resolveSearchParams } from "@/lib/resolve-search-params";

export const metadata = {
  title: "Clearance Worksheet — Work at Heights — VeriPM",
  description:
    "Manufacturer-spec reference worksheet. User-owned clearance figures — not a Vera design calculation.",
};

export default async function WahClearanceRoute({
  searchParams,
}: {
  searchParams: Promise<{
    projectId?: string;
    companyId?: string;
    industry?: string;
  }>;
}) {
  const sp = await resolveSearchParams(searchParams);
  const projectId = parseInt(sp.projectId ?? "1", 10);
  const companyId = parseInt(sp.companyId ?? "1", 10);

  return (
    <VeraPageLayout>
      <Suspense fallback={<p className="p-6 text-sm text-slate-500">Loading…</p>}>
        <ClearanceWorksheetView
          projectId={projectId}
          companyId={companyId}
          industry={sp.industry}
        />
      </Suspense>
    </VeraPageLayout>
  );
}
