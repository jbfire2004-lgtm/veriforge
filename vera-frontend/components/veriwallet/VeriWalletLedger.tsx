"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import {
  type VeriWalletTxStatus,
  vwSurface,
  vwTxBadge,
} from "./tokens";

export type VeriWalletLedgerRow = {
  id: string;
  timestamp: string;
  type: string;
  counterparty: string;
  amount: string;
  status: VeriWalletTxStatus;
};

const DEFAULT_ROWS: VeriWalletLedgerRow[] = [
  {
    id: "tx-88421",
    timestamp: "2026-07-08T18:14:02Z",
    type: "Credit purchase",
    counterparty: "VeriForge Billing",
    amount: "+500",
    status: "completed",
  },
  {
    id: "tx-88418",
    timestamp: "2026-07-08T16:02:41Z",
    type: "Asset verification",
    counterparty: "Asset · CRN-2044",
    amount: "−1",
    status: "completed",
  },
  {
    id: "tx-88411",
    timestamp: "2026-07-08T14:55:10Z",
    type: "Transfer out",
    counterparty: "Wallet · VW-OPS-00312",
    amount: "−25",
    status: "pending",
  },
  {
    id: "tx-88397",
    timestamp: "2026-07-07T22:11:33Z",
    type: "Identity binding",
    counterparty: "Credential · ISO-45001",
    amount: "0",
    status: "flagged",
  },
  {
    id: "tx-88380",
    timestamp: "2026-07-07T09:40:08Z",
    type: "Security hold",
    counterparty: "Compliance · SOC",
    amount: "−120",
    status: "critical",
  },
];

function formatTs(iso: string) {
  try {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }),
      time: d.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }),
    };
  } catch {
    return { date: iso, time: "" };
  }
}

/**
 * High-contrast transaction ledger — alternating graphite tones, status badges, blue hover.
 */
export function VeriWalletLedger({
  rows = DEFAULT_ROWS,
}: {
  rows?: VeriWalletLedgerRow[];
}) {
  return (
    <section className={cn(vwSurface.panel, "overflow-hidden p-0")}>
      <header className="border-b border-[#2A2E33]/12 px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#5A6169]">
          Transaction ledger
        </p>
        <h3 className="mt-1 text-sm font-semibold text-[#2A2E33]">
          Audit trail · verification credits & identity events
        </h3>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="bg-[#2A2E33] text-[10px] font-semibold uppercase tracking-[0.08em] text-[#A8B0B8]">
              <th className="px-4 py-2.5 font-semibold">Timestamp</th>
              <th className="px-4 py-2.5 font-semibold">Type</th>
              <th className="px-4 py-2.5 font-semibold">Counterparty</th>
              <th className="px-4 py-2.5 font-semibold">Amount</th>
              <th className="px-4 py-2.5 font-semibold">Status</th>
              <th className="px-4 py-2.5 font-semibold">Ref</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const ts = formatTs(row.timestamp);
              const isCritical = row.status === "critical";
              return (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b border-[#2A2E33]/10 transition-colors duration-100",
                    i % 2 === 0 ? "bg-white" : "bg-[#F0F2F4]",
                    "hover:bg-[#E8F1F8]",
                    isCritical && "bg-[#F8F0F0] hover:bg-[#F3E4E4]",
                  )}
                >
                  <td className="px-4 py-3 align-top">
                    <p className="font-semibold text-[#2A2E33]">{ts.date}</p>
                    <p className="font-mono text-[11px] text-[#5A6169]">
                      {ts.time} UTC
                    </p>
                  </td>
                  <td className="px-4 py-3 align-top font-medium text-[#2A2E33]">
                    {row.type}
                  </td>
                  <td className="px-4 py-3 align-top text-[#3B3F45]">
                    {row.counterparty}
                  </td>
                  <td className="px-4 py-3 align-top font-mono tabular-nums text-[#2A2E33]">
                    {row.amount}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span className={vwTxBadge[row.status]}>{row.status}</span>
                  </td>
                  <td className="px-4 py-3 align-top font-mono text-[11px] text-[#5A6169]">
                    {row.id}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
