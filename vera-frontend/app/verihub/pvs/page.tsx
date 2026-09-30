"use client";

import { VeriHubConsoleShell } from "@/src/components/verihub/VeriHubConsoleShell";
import { PvsDashboard } from "@/src/components/pvs";
import { getVeriHubSession } from "@/lib/verihub-org-api";

export default function VeriHubPvsPage() {
  const session = getVeriHubSession();
  const orgId = session?.orgId;

  return (
    <VeriHubConsoleShell
      title="Program Verification (PVS)"
      description="Written safety program verification, safety matrix, and exemptions. Contributes 15% to directory compliance."
    >
      {!orgId ? (
        <p className="text-sm text-zinc-600">Sign in to manage PVS.</p>
      ) : (
        <PvsDashboard contractorId={orgId} canManage />
      )}
    </VeriHubConsoleShell>
  );
}
