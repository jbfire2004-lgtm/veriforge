"use client";

import { useParams } from "next/navigation";
import { VeriHubConsoleShell } from "@/src/components/verihub/VeriHubConsoleShell";
import { AuditReviewScreen } from "@/src/components/audit-evaluation";

export default function VeriHubAuditDetailPage() {
  const params = useParams();
  const id = String(params.id || "");

  return (
    <VeriHubConsoleShell
      title="Audit review"
      description="Score sections, record findings, and track corrective actions."
    >
      {!id ? (
        <p className="text-sm text-zinc-500">Missing audit id.</p>
      ) : (
        <AuditReviewScreen auditId={id} canManage />
      )}
    </VeriHubConsoleShell>
  );
}
