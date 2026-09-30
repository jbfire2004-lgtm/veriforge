"use client";

import {
  VeriForgeProgressBar,
  useBadgeAnalyticsSync,
} from "@/components/veriforge";

export function VeriForgeDashboardBadgeStatus() {
  const { analytics } = useBadgeAnalyticsSync();
  return (
    <div
      className={`border bg-[#1A1A1A] p-4 ${
        analytics.denyCount > 0 || analytics.expiredCompliance > 0
          ? "border-[#1E6FB8] shadow-[0_0_16px_rgba(30, 111, 184,.3)]"
          : "border-[#424242]"
      }`}
    >
      <p className="mb-3 font-[var(--vf-font-primary)] text-[11px] uppercase tracking-[0.12em] text-[#ffcfcf]">
        Live Badge Access
      </p>
      <VeriForgeProgressBar
        label={`Allow rate · denied ${analytics.denyCount}`}
        value={analytics.allowRate}
      />
      <p className="mt-2 text-xs text-[#b8b8b8]">
        Badges: {analytics.totalBadges} · Valid: {analytics.validCount} · Expired:{" "}
        {analytics.expiredCount} · Compliance expired: {analytics.expiredCompliance}
      </p>
    </div>
  );
}
