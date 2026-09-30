"use client";

import {
  VeriForgeProgressBar,
  useCommandCenterAnalyticsSync,
} from "@/components/veriforge";

export function VeriForgeDashboardCommandCenterStatus() {
  const { analytics } = useCommandCenterAnalyticsSync();
  return (
    <div
      className={`border bg-[#1A1A1A] p-4 ${
        analytics.criticalSites > 0 || analytics.activeEmergencies > 0
          ? "border-[#1E6FB8] shadow-[0_0_16px_rgba(30, 111, 184,.3)]"
          : "border-[#424242]"
      }`}
    >
      <p className="mb-3 font-[var(--vf-font-primary)] text-[11px] uppercase tracking-[0.12em] text-[#ffcfcf]">
        Live Multi-Site Command
      </p>
      <VeriForgeProgressBar
        label={`Health · critical sites ${analytics.criticalSites}`}
        value={analytics.commandHealthScore}
      />
      <p className="mt-2 text-xs text-[#b8b8b8]">
        Sites: {analytics.totalSites} · Emergencies: {analytics.activeEmergencies} ·
        Incidents: {analytics.openIncidents} · Alerts: {analytics.alertCount}
      </p>
    </div>
  );
}
