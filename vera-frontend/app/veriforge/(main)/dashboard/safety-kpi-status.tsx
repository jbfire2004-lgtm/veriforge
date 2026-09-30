"use client";

import {
  VeriForgeProgressBar,
  useSafetyKpiAnalyticsSync,
} from "@/components/veriforge";

export function VeriForgeDashboardSafetyKpiStatus() {
  const { analytics } = useSafetyKpiAnalyticsSync();
  return (
    <div
      className={`border bg-[#1A1A1A] p-4 ${
        analytics.criticalCount > 0 || analytics.negativeTrends > 0
          ? "border-[#1E6FB8] shadow-[0_0_16px_rgba(30, 111, 184,.3)]"
          : "border-[#424242]"
      }`}
    >
      <p className="mb-3 font-[var(--vf-font-primary)] text-[11px] uppercase tracking-[0.12em] text-[#ffcfcf]">
        Live Safety KPI Intelligence
      </p>
      <VeriForgeProgressBar
        label={`Avg score · critical ${analytics.criticalCount}`}
        value={analytics.averageScore}
      />
      <p className="mt-2 text-xs text-[#b8b8b8]">
        KPIs: {analytics.totalKpis} · Below target: {analytics.belowTarget} · Negative
        trends: {analytics.negativeTrends} · Forecast risk: {analytics.forecastRisk}
      </p>
    </div>
  );
}
