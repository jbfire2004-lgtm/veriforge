"use client";

import { VeriHubConsoleShell } from "@/src/components/verihub/VeriHubConsoleShell";
import { ComplianceUploadForm } from "@/src/components/forms";
import { ComplianceList } from "@/src/components/compliance";
import { useCompliance } from "@/lib/veriforge-hooks";

export default function VeriHubCompliancePage() {
  const { data, error, loading, reload } = useCompliance();

  return (
    <VeriHubConsoleShell
      title="Compliance"
      description="Upload and track insurance, WCB, COR, and SCSA artifacts."
    >
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      <div className="mb-8">
        <ComplianceUploadForm onUploaded={() => reload()} />
      </div>
      {loading || !data ? (
        <p className="text-sm text-zinc-500">Loading artifacts…</p>
      ) : (
        <ComplianceList artifacts={data.artifacts ?? []} />
      )}
    </VeriHubConsoleShell>
  );
}
