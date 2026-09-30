"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { vwBtn, vwSurface } from "./tokens";
import {
  VwAddIcon,
  VwCreditsIcon,
  VwIdentityIcon,
  VwLedgerIcon,
  VwTransferIcon,
  VwVerifyIcon,
} from "./icons";

export type VeriWalletQuickAction =
  | "add-credits"
  | "transfer"
  | "verify-asset"
  | "view-ledger";

type BalanceCard = {
  id: string;
  label: string;
  value: string;
  hint: string;
  accent?: "blue" | "teal" | "amber";
};

const DEFAULT_BALANCES: BalanceCard[] = [
  {
    id: "credits",
    label: "Verification credits",
    value: "1,240",
    hint: "Available for attestations",
    accent: "blue",
  },
  {
    id: "identity",
    label: "Identity tokens",
    value: "3",
    hint: "Active credential bindings",
    accent: "teal",
  },
  {
    id: "pending",
    label: "Pending settlements",
    value: "2",
    hint: "Awaiting confirmation",
    accent: "amber",
  },
];

const QUICK_ACTIONS: {
  id: VeriWalletQuickAction;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  { id: "add-credits", label: "Add Credits", icon: VwAddIcon },
  { id: "transfer", label: "Transfer", icon: VwTransferIcon },
  { id: "verify-asset", label: "Verify Asset", icon: VwVerifyIcon },
  { id: "view-ledger", label: "View Ledger", icon: VwLedgerIcon },
];

/**
 * VeriWallet dashboard — matte slate balance cards, credit meter, identity badge, quick actions.
 */
export function VeriWalletDashboard({
  creditBalance = 1240,
  creditCapacity = 2000,
  identityLabel = "Verified Operator",
  identityId = "VW-OPS-00481",
  balances = DEFAULT_BALANCES,
  onAction,
}: {
  creditBalance?: number;
  creditCapacity?: number;
  identityLabel?: string;
  identityId?: string;
  balances?: BalanceCard[];
  onAction: (action: VeriWalletQuickAction) => void;
}) {
  const pct = Math.min(
    100,
    Math.round((creditBalance / Math.max(creditCapacity, 1)) * 100),
  );

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        {balances.map((card) => (
          <article
            key={card.id}
            className={cn(vwSurface.slate, "p-4")}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#A8B0B8]">
                {card.label}
              </p>
              <span
                className={cn(
                  "grid h-7 w-7 place-items-center rounded-[3px] border border-[#5A6169] bg-[#23272C]",
                  card.accent === "blue" && "text-[#1E6FB8]",
                  card.accent === "teal" && "text-[#2F8F8C]",
                  card.accent === "amber" && "text-[#C89F3D]",
                  !card.accent && "text-[#A8B0B8]",
                )}
              >
                {card.id === "identity" ? (
                  <VwIdentityIcon size={14} />
                ) : (
                  <VwCreditsIcon size={14} />
                )}
              </span>
            </div>
            <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight text-[#F4F6F8]">
              {card.value}
            </p>
            <p className="mt-1 text-xs text-[#8A929A]">{card.hint}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
        <section className={cn(vwSurface.panel, "p-4")}>
          <header className="mb-3 flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#5A6169]">
                Credit utilization
              </p>
              <h3 className="mt-1 text-sm font-semibold text-[#2A2E33]">
                Verification credit meter
              </h3>
            </div>
            <p className="text-sm font-semibold tabular-nums text-[#1E6FB8]">
              {pct}%
            </p>
          </header>
          <div
            className="h-2.5 overflow-hidden rounded-[3px] border border-[#2A2E33]/12 bg-[#E8ECF0]"
            role="meter"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Verification credit utilization"
          >
            <div
              className="h-full rounded-[2px] bg-[#1E6FB8] transition-[width] duration-200"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[#5A6169]">
            <span className="font-semibold tabular-nums text-[#2A2E33]">
              {creditBalance.toLocaleString()}
            </span>{" "}
            of {creditCapacity.toLocaleString()} credits allocated
          </p>
        </section>

        <section className={cn(vwSurface.graphite, "p-4")}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#A8B0B8]">
            Identity badge
          </p>
          <div className="mt-3 flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-[3px] border border-[#5A6169] bg-[#2A2E33] text-[#2F8F8C]">
              <VwIdentityIcon size={22} />
            </span>
            <div>
              <p className="text-sm font-semibold text-[#F4F6F8]">
                {identityLabel}
              </p>
              <p className="mt-0.5 font-mono text-xs text-[#A8B0B8]">
                {identityId}
              </p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#4FAF6F]">
                Status · Active
              </p>
            </div>
          </div>
        </section>
      </div>

      <section className={cn(vwSurface.panel, "p-4")}>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#5A6169]">
          Quick actions
        </p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            const isPrimary = action.id === "add-credits";
            return (
              <button
                key={action.id}
                type="button"
                onClick={() => onAction(action.id)}
                className={cn(
                  vwBtn.base,
                  isPrimary ? vwBtn.primary : vwBtn.secondary,
                  "h-11 w-full justify-start px-3 text-sm",
                )}
              >
                <Icon size={16} />
                {action.label}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
