"use client";

import {
  VeriForgeProgressBar,
  useEmergencyAnalyticsSync,
} from "@/components/veriforge";

export function VeriForgeDashboardEmergencyStatus() {
  const { analytics } = useEmergencyAnalyticsSync();
  return (
    <div
      className={`border bg-[#1A1A1A] p-4 ${
        analytics.criticalCount > 0 || analytics.activeEmergencies > 0
          ? "border-[#1E6FB8] shadow-[0_0_16px_rgba(30, 111, 184,.3)]"
          : "border-[#424242]"
      }`}
    >
      <p className="mb-3 font-[var(--vf-font-primary)] text-[11px] uppercase tracking-[0.12em] text-[#ffcfcf]">
        Live Emergency Response
      </p>
      <VeriForgeProgressBar
        label={`Response status · active ${analytics.activeEmergencies}`}
        value={analytics.averageResponsePercent}
      />
      <p className="mt-2 text-xs text-[#b8b8b8]">
        Critical: {analytics.criticalCount} · Missing: {analytics.missingPersonnel} · Blocked
        routes: {analytics.blockedRoutes} · Avg: {analytics.averageResponseMinutes}m
      </p>
    </div>
  );
}
