"use client";

import {
  VeriForgeProgressBar,
  useLedgerAnalyticsSync,
} from "@/components/veriforge";

export function VeriForgeDashboardLedgerStatus() {
  const { analytics } = useLedgerAnalyticsSync();
  return (
    <div
      className={`border bg-[#1A1A1A] p-4 ${
        !analytics.chainIntegrity || analytics.criticalBlocks > 0
          ? "border-[#1E6FB8] shadow-[0_0_16px_rgba(30, 111, 184,.3)]"
          : "border-[#424242]"
      }`}
    >
      <p className="mb-3 font-[var(--vf-font-primary)] text-[11px] uppercase tracking-[0.12em] text-[#ffcfcf]">
        Safety Blockchain Ledger
      </p>
      <VeriForgeProgressBar
        label={`Health · critical blocks ${analytics.criticalBlocks}`}
        value={analytics.ledgerHealthScore}
      />
      <p className="mt-2 text-xs text-[#b8b8b8]">
        Blocks: {analytics.totalBlocks} · Integrity:{" "}
        {analytics.chainIntegrity ? "OK" : "BROKEN"} · Contracts:{" "}
        {analytics.activeContracts} · Fires: {analytics.contractFires}
      </p>
    </div>
  );
}
