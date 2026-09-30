"use client";

import {
  VeriForgeProgressBar,
  useIconographyAnalyticsSync,
} from "@/components/veriforge";

export function VeriForgeDashboardIconographyStatus() {
  const { analytics } = useIconographyAnalyticsSync();
  return (
    <div
      className={`border bg-[#1A1A1A] p-4 ${
        analytics.criticalSelections > 0
          ? "border-[#1E6FB8] shadow-[0_0_16px_rgba(30, 111, 184,.3)]"
          : "border-[#424242]"
      }`}
    >
      <p className="mb-3 font-[var(--vf-font-primary)] text-[11px] uppercase tracking-[0.12em] text-[#ffcfcf]">
        Live Industrial Iconography
      </p>
      <VeriForgeProgressBar
        label={`Coverage · icons ${analytics.totalIcons}`}
        value={analytics.iconCoverageScore}
      />
      <p className="mt-2 text-xs text-[#b8b8b8]">
        Views: {analytics.viewCount} · Critical: {analytics.criticalSelections} ·
        Categories: {Object.keys(analytics.categoryCounts).length}
      </p>
    </div>
  );
}
