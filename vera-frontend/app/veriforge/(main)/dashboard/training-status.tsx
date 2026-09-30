"use client";

import {
  VeriForgeProgressBar,
  useTrainingAnalyticsSync,
} from "@/components/veriforge";

export function VeriForgeDashboardTrainingStatus() {
  const { analytics } = useTrainingAnalyticsSync();
  return (
    <div className="border border-[#424242] bg-[#1A1A1A] p-4">
      <p className="mb-3 font-[var(--vf-font-primary)] text-[11px] uppercase tracking-[0.12em] text-[#ffcfcf]">
        Live Training Progress
      </p>
      <VeriForgeProgressBar
        label={`Completion · overdue ${analytics.overdueModules}`}
        value={analytics.completionRate}
      />
      <p className="mt-2 text-xs text-[#b8b8b8]">
        Avg score: {analytics.averageScore}% · In progress: {analytics.inProgress} · Completed:{" "}
        {analytics.completed}
      </p>
    </div>
  );
}
