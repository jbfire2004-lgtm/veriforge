"use client";

import {
  VeriForgeProgressBar,
  useReportingAnalyticsSync,
} from "@/components/veriforge";

export function VeriForgeDashboardReportingStatus() {
  const { analytics } = useReportingAnalyticsSync();
  return (
    <div
      className={`border bg-[#1A1A1A] p-4 ${
        analytics.criticalCount > 0
          ? "border-[#1E6FB8] shadow-[0_0_16px_rgba(30, 111, 184,.3)]"
          : "border-[#424242]"
      }`}
    >
      <p className="mb-3 font-[var(--vf-font-primary)] text-[11px] uppercase tracking-[0.12em] text-[#ffcfcf]">
        Live Executive Reporting
      </p>
      <VeriForgeProgressBar
        label={`Readiness · critical ${analytics.criticalCount}`}
        value={analytics.executiveReadinessScore}
      />
      <p className="mt-2 text-xs text-[#b8b8b8]">
        Reports: {analytics.totalReports} · Exported: {analytics.exportedCount} · Avg
        score: {analytics.averageScore} · Ready: {analytics.readyCount}
      </p>
    </div>
  );
}
