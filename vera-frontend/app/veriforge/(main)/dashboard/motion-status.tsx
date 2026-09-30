"use client";

import {
  VeriForgeProgressBar,
  useMotionAnalyticsSync,
} from "@/components/veriforge";

export function VeriForgeDashboardMotionStatus() {
  const { analytics } = useMotionAnalyticsSync();
  return (
    <div
      className={`border bg-[#1A1A1A] p-4 ${
        analytics.criticalPlays > 0
          ? "border-[#1E6FB8] shadow-[0_0_16px_rgba(30, 111, 184,.3)]"
          : "border-[#424242]"
      }`}
    >
      <p className="mb-3 font-[var(--vf-font-primary)] text-[11px] uppercase tracking-[0.12em] text-[#ffcfcf]">
        Live Industrial Motion
      </p>
      <VeriForgeProgressBar
        label={`Coverage · plays ${analytics.playCount}`}
        value={analytics.motionCoverageScore}
      />
      <p className="mt-2 text-xs text-[#b8b8b8]">
        Specs: {analytics.totalSpecs} · Critical plays: {analytics.criticalPlays} · Avg
        duration: {analytics.averageDurationMs}ms
      </p>
    </div>
  );
}
