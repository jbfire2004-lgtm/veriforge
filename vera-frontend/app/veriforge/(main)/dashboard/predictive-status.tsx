"use client";

import {
  VeriForgeProgressBar,
  usePredictiveAnalyticsSync,
} from "@/components/veriforge";

export function VeriForgeDashboardPredictiveStatus() {
  const { analytics } = usePredictiveAnalyticsSync();
  return (
    <div
      className={`border bg-[#1A1A1A] p-4 ${
        analytics.criticalCount > 0
          ? "border-[#1E6FB8] shadow-[0_0_16px_rgba(30, 111, 184,.3)]"
          : "border-[#424242]"
      }`}
    >
      <p className="mb-3 font-[var(--vf-font-primary)] text-[11px] uppercase tracking-[0.12em] text-[#ffcfcf]">
        Live Safety AI Predictive
      </p>
      <VeriForgeProgressBar
        label={`Health · critical ${analytics.criticalCount}`}
        value={analytics.predictiveHealthScore}
      />
      <p className="mt-2 text-xs text-[#b8b8b8]">
        Predictions: {analytics.totalPredictions} · Confidence:{" "}
        {analytics.averageConfidence}% · High-risk zones: {analytics.highRiskZones} ·
        Models: {analytics.modelCount}
      </p>
    </div>
  );
}
