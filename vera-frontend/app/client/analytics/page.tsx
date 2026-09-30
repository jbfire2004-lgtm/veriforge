"use client";

import { HiringClientShell } from "@/src/components/client/HiringClientShell";
import { AnalyticsDashboardView } from "@/src/components/analytics-dashboard";
import { getHiringClientSession } from "@/lib/hiring-client-api";

export default function ClientAnalyticsPage() {
  const session = getHiringClientSession();

  return (
    <HiringClientShell
      title="Analytics"
      description="Compliance KPIs and trends for your connected contractors."
    >
      {!session?.accessToken ? (
        <p className="text-sm text-zinc-600">Sign in as a hiring client.</p>
      ) : (
        <AnalyticsDashboardView
          scope="client"
          endpoint="client"
          showContractorTable
          showQuickCheck={false}
        />
      )}
    </HiringClientShell>
  );
}
