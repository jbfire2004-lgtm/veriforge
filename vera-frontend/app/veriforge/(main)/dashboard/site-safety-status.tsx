"use client";

import {
  VeriForgeProgressBar,
  useSiteSafetyAnalyticsSync,
} from "@/components/veriforge";

export function VeriForgeDashboardSiteSafetyStatus() {
  const { analytics } = useSiteSafetyAnalyticsSync();
  return (
    <div
      className={`border bg-[#1A1A1A] p-4 ${
        analytics.criticalHazards > 0 || analytics.expiredPermits > 0
          ? "border-[#1E6FB8] shadow-[0_0_16px_rgba(30, 111, 184,.3)]"
          : "border-[#424242]"
      }`}
    >
      <p className="mb-3 font-[var(--vf-font-primary)] text-[11px] uppercase tracking-[0.12em] text-[#ffcfcf]">
        Live Site Safety Planning
      </p>
      <VeriForgeProgressBar
        label={`Safety score · hazards ${analytics.criticalHazards}`}
        value={analytics.averageSafetyScore}
      />
      <p className="mt-2 text-xs text-[#b8b8b8]">
        Sites: {analytics.siteCount} · Control coverage: {analytics.controlCoverage}% ·
        Worker readiness: {analytics.workerReadiness}% · Expired permits:{" "}
        {analytics.expiredPermits}
      </p>
    </div>
  );
}
