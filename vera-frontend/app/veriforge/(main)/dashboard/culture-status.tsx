"use client";

import {
  VeriForgeProgressBar,
  useCultureAnalyticsSync,
} from "@/components/veriforge";

export function VeriForgeDashboardCultureStatus() {
  const { analytics } = useCultureAnalyticsSync();
  return (
    <div
      className={`border bg-[#1A1A1A] p-4 ${
        analytics.priorityGaps > 0 || analytics.cultureScore < 70
          ? "border-[#1E6FB8] shadow-[0_0_16px_rgba(30, 111, 184,.3)]"
          : "border-[#424242]"
      }`}
    >
      <p className="mb-3 font-[var(--vf-font-primary)] text-[11px] uppercase tracking-[0.12em] text-[#ffcfcf]">
        Live Safety Culture
      </p>
      <VeriForgeProgressBar
        label={`Culture score · gaps ${analytics.priorityGaps}`}
        value={analytics.cultureScore}
      />
      <p className="mt-2 text-xs text-[#b8b8b8]">
        Leadership: {analytics.leadershipEngagement}% · Empowerment:{" "}
        {analytics.workerEmpowerment}% · At-risk: {analytics.atRiskBehaviors} · Campaigns:{" "}
        {analytics.activeCampaigns}
      </p>
    </div>
  );
}
