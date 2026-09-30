"use client";

import { useState } from "react";
import type { SubscriptionRow, UpdateSubscriptionPayload } from "@/lib/admin-subscriptions-api";
import { updateAdminSubscription } from "@/lib/admin-subscriptions-api";
import { MODULE_OPTIONS, TIER_OPTIONS } from "./tier-colors";

type Props = {
  row: SubscriptionRow;
  onUpdated: () => void;
};

export function SubscriptionActionsMenu({ row, onUpdated }: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function apply(patch: UpdateSubscriptionPayload) {
    setBusy(true);
    try {
      await updateAdminSubscription({
        companyId: row.companyId ?? undefined,
        tenantId: row.tenantId ?? undefined,
        ...patch,
      });
      onUpdated();
      setOpen(false);
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        className="rounded-lg border border-vera-charcoal/15 px-2 py-1 text-xs font-medium hover:bg-vera-surface"
        onClick={() => setOpen(true)}
      >
        Actions
      </button>
    );
  }

  return (
    <div className="min-w-[220px] space-y-2 rounded-lg border border-vera-charcoal/15 bg-white p-3 text-xs shadow-lg">
      <p className="font-semibold">Manage subscription</p>
      <label className="block">
        Tier
        <select
          className="mt-1 w-full rounded border px-2 py-1"
          defaultValue={row.tierKey}
          disabled={busy}
          onChange={(e) => void apply({ tierKey: e.target.value })}
        >
          {TIER_OPTIONS.map((t) => (
            <option key={t.key} value={t.key}>
              {t.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        Seats purchased
        <input
          type="number"
          className="mt-1 w-full rounded border px-2 py-1"
          defaultValue={row.seatsPurchased}
          min={0}
          disabled={busy}
          onBlur={(e) => {
            const n = parseInt(e.target.value, 10);
            if (Number.isFinite(n)) void apply({ seatsPurchased: n });
          }}
        />
      </label>
      <label className="block">
        Status
        <select
          className="mt-1 w-full rounded border px-2 py-1"
          defaultValue={row.status}
          disabled={busy}
          onChange={(e) => void apply({ status: e.target.value })}
        >
          <option value="ACTIVE">ACTIVE</option>
          <option value="TRIAL">TRIAL</option>
          <option value="PAST_DUE">PAST_DUE</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </label>
      <div>
        <p className="mb-1 font-medium">Modules</p>
        <div className="flex flex-wrap gap-1">
          {MODULE_OPTIONS.map((m) => {
            const on = row.modulesEnabled.includes(m.id);
            return (
              <button
                key={m.id}
                type="button"
                disabled={busy}
                className={`rounded-full px-2 py-0.5 ${on ? "bg-vera-teal text-white" : "bg-vera-charcoal/10"}`}
                onClick={() => {
                  const next = on
                    ? row.modulesEnabled.filter((x) => x !== m.id)
                    : [...row.modulesEnabled, m.id];
                  void apply({ modulesEnabled: next });
                }}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <a
          href={row.companyId ? `/admin/companies/${row.companyId}` : "#"}
          className="text-vera-teal hover:underline"
        >
          Company profile
        </a>
        <button type="button" className="ml-auto text-vera-muted" onClick={() => setOpen(false)}>
          Close
        </button>
      </div>
    </div>
  );
}
