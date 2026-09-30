"use client";

import {
  VeriForgeProgressBar,
  useAuditScoreSync,
} from "@/components/veriforge";

export function VeriForgeDashboardAuditStatus() {
  const { score } = useAuditScoreSync();
  return (
    <div
      className={`border bg-[#1A1A1A] p-4 ${
        score.score < 70
          ? "border-[#1E6FB8] shadow-[0_0_16px_rgba(30, 111, 184,.3)]"
          : "border-[#424242]"
      }`}
    >
      <p className="mb-3 font-[var(--vf-font-primary)] text-[11px] uppercase tracking-[0.12em] text-[#ffcfcf]">
        Live Audit Score
      </p>
      <VeriForgeProgressBar
        label={`Completeness ${score.completeness}% · critical ${score.criticalFindings}`}
        value={score.score}
      />
      <p className="mt-2 text-xs text-[#b8b8b8]">
        Entries: {score.totalEntries} · Evidence: {score.evidenceCount} · Open actions:{" "}
        {score.openActions}
      </p>
    </div>
  );
}
