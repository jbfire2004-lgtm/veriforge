"use client";

import { VeriHubConsoleShell } from "@/src/components/verihub/VeriHubConsoleShell";
import { AnalyticsDashboardView } from "@/src/components/analytics-dashboard";
import { getVeriHubSession } from "@/lib/verihub-org-api";

/**
 * Platform-admin global analytics (requires PLATFORM_ADMIN_EMAILS / platform.admin).
 */
export default function VeriHubAdminAnalyticsPage() {
  const session = getVeriHubSession();

  return (
    <VeriHubConsoleShell
      title="Admin analytics"
      description="Global contractor KPIs across the VeriForge network. Platform admin only."
    >
      {!session?.accessToken ? (
        <p className="text-sm text-zinc-600">Sign in required.</p>
      ) : (
        <AnalyticsDashboardView
          scope="admin"
          endpoint="admin"
          showContractorTable
          showQuickCheck={false}
        />
      )}
    </VeriHubConsoleShell>
  );
}
