"use client";

import {
  VeriForgeProgressBar,
  useContractorAnalyticsSync,
} from "@/components/veriforge";

export function VeriForgeDashboardContractorStatus() {
  const { analytics } = useContractorAnalyticsSync();
  return (
    <div
      className={`border bg-[#1A1A1A] p-4 ${
        analytics.nonCompliantCount > 0
          ? "border-[#1E6FB8] shadow-[0_0_16px_rgba(30, 111, 184,.3)]"
          : "border-[#424242]"
      }`}
    >
      <p className="mb-3 font-[var(--vf-font-primary)] text-[11px] uppercase tracking-[0.12em] text-[#ffcfcf]">
        Live Contractor Compliance
      </p>
      <VeriForgeProgressBar
        label={`Avg compliance · non-compliant ${analytics.nonCompliantCount}`}
        value={analytics.averageCompliance}
      />
      <p className="mt-2 text-xs text-[#b8b8b8]">
        Contractors: {analytics.totalContractors} · Performance: {analytics.averagePerformance}% ·
        Expired docs: {analytics.expiredDocuments}
      </p>
    </div>
  );
}
