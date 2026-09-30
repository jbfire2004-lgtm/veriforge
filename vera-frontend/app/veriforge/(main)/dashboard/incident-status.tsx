"use client";

import {
  VeriForgeProgressBar,
  useIncidentAnalyticsSync,
  VeriForgeSeverityBadge,
} from "@/components/veriforge";

export function VeriForgeDashboardIncidentStatus() {
  const { analytics } = useIncidentAnalyticsSync();
  return (
    <div className="border border-[#424242] bg-[#1A1A1A] p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="font-[var(--vf-font-primary)] text-[11px] uppercase tracking-[0.12em] text-[#ffcfcf]">
          Live Incident Status
        </p>
        {analytics.criticalCount > 0 ? (
          <VeriForgeSeverityBadge severity="critical" />
        ) : (
          <VeriForgeSeverityBadge severity="low" />
        )}
      </div>
      <VeriForgeProgressBar
        label={`Investigation Progress · open ${analytics.openIncidents}`}
        value={analytics.investigationProgress}
      />
      <p className="mt-2 text-xs text-[#b8b8b8]">
        Critical: {analytics.criticalCount} · Moderate: {analytics.moderateCount} · Low:{" "}
        {analytics.lowCount}
      </p>
    </div>
  );
}
