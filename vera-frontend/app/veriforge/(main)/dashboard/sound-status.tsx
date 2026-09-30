"use client";

import {
  VeriForgeProgressBar,
  useSoundAnalyticsSync,
} from "@/components/veriforge";

export function VeriForgeDashboardSoundStatus() {
  const { analytics } = useSoundAnalyticsSync();
  return (
    <div
      className={`border bg-[#1A1A1A] p-4 ${
        analytics.criticalPlays > 0
          ? "border-[#1E6FB8] shadow-[0_0_16px_rgba(30, 111, 184,.3)]"
          : "border-[#424242]"
      }`}
    >
      <p className="mb-3 font-[var(--vf-font-primary)] text-[11px] uppercase tracking-[0.12em] text-[#ffcfcf]">
        Live Industrial Sound Design
      </p>
      <VeriForgeProgressBar
        label={`Coverage · plays ${analytics.playCount}${analytics.muted ? " · MUTED" : ""}`}
        value={analytics.soundCoverageScore}
      />
      <p className="mt-2 text-xs text-[#b8b8b8]">
        Sounds: {analytics.totalSounds} · Critical plays: {analytics.criticalPlays} ·
        Categories: {Object.keys(analytics.categoryCounts).length}
      </p>
    </div>
  );
}
