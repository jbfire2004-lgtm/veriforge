"use client";

import {
  VeriForgeProgressBar,
  useAnimationAnalyticsSync,
} from "@/components/veriforge";

export function VeriForgeDashboardAnimationStatus() {
  const { analytics } = useAnimationAnalyticsSync();
  return (
    <div
      className={`border bg-[#1A1A1A] p-4 ${
        analytics.criticalPlays > 0
          ? "border-[#1E6FB8] shadow-[0_0_16px_rgba(30, 111, 184,.3)]"
          : "border-[#424242]"
      }`}
    >
      <p className="mb-3 font-[var(--vf-font-primary)] text-[11px] uppercase tracking-[0.12em] text-[#ffcfcf]">
        Live Industrial Animations
      </p>
      <VeriForgeProgressBar
        label={`Coverage · plays ${analytics.playCount}`}
        value={analytics.animationCoverageScore}
      />
      <p className="mt-2 text-xs text-[#b8b8b8]">
        Specs: {analytics.totalSpecs} · Primitives: {analytics.primitiveCount} · Critical
        plays: {analytics.criticalPlays} · Avg: {analytics.averageDurationMs}ms
      </p>
    </div>
  );
}
