import { Suspense } from "react";
import { DocumentArchiveHub } from "@/components/documents/DocumentArchiveHub";
import { resolveSearchParams } from "@/lib/resolve-search-params";

export const metadata = {
  title: "Document Archive — VeriPM",
  description:
    "Unified archive for finalized forms, reports, assessments, and Document Storage files.",
};

export default async function PmDocumentsArchiveRoute({
  searchParams,
}: {
  searchParams: Promise<{
    projectId?: string;
    companyId?: string;
  }>;
}) {
  const sp = await resolveSearchParams(searchParams);
  const companyId = sp.companyId ? parseInt(sp.companyId, 10) : undefined;
  const projectId = sp.projectId ? parseInt(sp.projectId, 10) : undefined;

  return (
    <Suspense
      fallback={
        <div className="p-8 text-sm text-[#64748b]">Loading document archive…</div>
      }
    >
      <DocumentArchiveHub
        defaultCompanyId={
          companyId != null && Number.isFinite(companyId) ? companyId : undefined
        }
        defaultProjectId={
          projectId != null && Number.isFinite(projectId) ? projectId : undefined
        }
      />
    </Suspense>
  );
}
