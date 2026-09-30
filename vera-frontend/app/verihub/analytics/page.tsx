"use client";

import { VeriHubConsoleShell } from "@/src/components/verihub/VeriHubConsoleShell";
import { AnalyticsDashboardView } from "@/src/components/analytics-dashboard";
import { getVeriHubSession } from "@/lib/verihub-org-api";

export default function VeriHubAnalyticsPage() {
  const session = getVeriHubSession();
  const orgId = session?.orgId;

  return (
    <VeriHubConsoleShell
      title="Analytics dashboard"
      description="Contractor KPIs across Document Center, Audits, PVS, Insurance, and QuickCheck. Charts use Chart.js."
    >
      {!orgId ? (
        <p className="text-sm text-zinc-600">Sign in to view analytics.</p>
      ) : (
        <AnalyticsDashboardView
          scope="contractor"
          endpoint="contractor"
          contractorId={orgId}
          showContractorTable={false}
          showQuickCheck
        />
      )}
    </VeriHubConsoleShell>
  );
}
