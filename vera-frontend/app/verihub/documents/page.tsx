"use client";

import { VeriHubConsoleShell } from "@/src/components/verihub/VeriHubConsoleShell";
import { DocumentList } from "@/src/components/document-center";
import { getVeriHubSession } from "@/lib/verihub-org-api";

export default function VeriHubDocumentCenterPage() {
  const session = getVeriHubSession();
  const orgId = session?.orgId;

  return (
    <VeriHubConsoleShell
      title="Document Center"
      description="Upload, replace, expire, and exempt contractor compliance documents. Scores sync to the Contractor Directory."
    >
      {!orgId ? (
        <p className="text-sm text-zinc-600">Sign in to manage documents.</p>
      ) : (
        <DocumentList contractorId={orgId} canManage />
      )}
    </VeriHubConsoleShell>
  );
}
