"use client";

import {
  VeriForgeProgressBar,
  useBrandExpansionAnalyticsSync,
} from "@/components/veriforge";

export function VeriForgeDashboardBrandExpansionStatus() {
  const { analytics } = useBrandExpansionAnalyticsSync();
  return (
    <div
      className={`border bg-[#1A1A1A] p-4 ${
        analytics.activeSubBrands < analytics.subBrandCount ||
        analytics.brandConsistencyScore < 70
          ? "border-[#1E6FB8] shadow-[0_0_16px_rgba(30, 111, 184,.3)]"
          : "border-[#424242]"
      }`}
    >
      <p className="mb-3 font-[var(--vf-font-primary)] text-[11px] uppercase tracking-[0.12em] text-[#ffcfcf]">
        Live Brand Expansion
      </p>
      <VeriForgeProgressBar
        label={`Consistency · active ${analytics.activeSubBrands}/${analytics.subBrandCount}`}
        value={analytics.brandConsistencyScore}
      />
      <p className="mt-2 text-xs text-[#b8b8b8]">
        Products: {analytics.productLineCount} · Campaigns: {analytics.activeCampaigns} ·
        Rules: {analytics.governanceRules} · Assets: {analytics.assetCount}
      </p>
    </div>
  );
}
