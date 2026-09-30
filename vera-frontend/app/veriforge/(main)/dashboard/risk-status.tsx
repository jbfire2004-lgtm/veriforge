"use client";

import {
  VeriForgeProgressBar,
  useRiskAnalyticsSync,
  RiskBandBadge,
} from "@/components/veriforge";

export function VeriForgeDashboardRiskStatus() {
  const { analytics } = useRiskAnalyticsSync();
  return (
    <div
      className={`border bg-[#1A1A1A] p-4 ${
        analytics.highRiskCount > 0
          ? "border-[#1E6FB8] shadow-[0_0_16px_rgba(30, 111, 184,.3)]"
          : "border-[#424242]"
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="font-[var(--vf-font-primary)] text-[11px] uppercase tracking-[0.12em] text-[#ffcfcf]">
          Live Risk Score
        </p>
        {analytics.criticalCount > 0 ? (
          <RiskBandBadge band="critical" />
        ) : analytics.highRiskCount > 0 ? (
          <RiskBandBadge band="high" />
        ) : (
          <RiskBandBadge band="low" />
        )}
      </div>
      <VeriForgeProgressBar
        label={`Control effectiveness · high/critical ${analytics.highRiskCount}`}
        value={analytics.controlEffectiveness}
      />
      <p className="mt-2 text-xs text-[#b8b8b8]">
        Hazards: {analytics.totalHazards} · Avg inherent: {analytics.averageInherent} · Residual:{" "}
        {analytics.averageResidual} · Open actions: {analytics.openActions}
      </p>
    </div>
  );
}
