"use client";

import { useMemo, useState } from "react";
import type { SubscriptionRow } from "@/lib/admin-subscriptions-api";
import { SeatUsageBar } from "./SeatUsageBar";
import { SubscriptionActionsMenu } from "./SubscriptionActionsMenu";

type Props = {
  rows: SubscriptionRow[];
  onUpdated: () => void;
  highlightCompanyId?: number | null;
};

type SortKey = "company" | "tier" | "seatsUsed" | "renewal";

export function SubscriptionTable({ rows, onUpdated, highlightCompanyId }: Props) {
  const [filter, setFilter] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("company");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filtered = useMemo(() => {
    let list = rows;
    const q = filter.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) =>
          r.companyName.toLowerCase().includes(q) ||
          (r.location.city?.toLowerCase().includes(q) ?? false),
      );
    }
    if (tierFilter !== "all") {
      list = list.filter((r) => r.tier === tierFilter);
    }
    list = [...list].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "tier":
          cmp = a.tier.localeCompare(b.tier);
          break;
        case "seatsUsed":
          cmp = a.seatsUsed - b.seatsUsed;
          break;
        case "renewal":
          cmp = (a.renewalDate ?? "").localeCompare(b.renewalDate ?? "");
          break;
        default:
          cmp = a.companyName.localeCompare(b.companyName);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [rows, filter, tierFilter, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const th = (key: SortKey, label: string) => (
    <th className="cursor-pointer px-3 py-2 text-left font-medium" onClick={() => toggleSort(key)}>
      {label}
      {sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
    </th>
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search companies…"
          className="rounded-lg border border-vera-charcoal/15 px-3 py-2 text-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <select
          className="rounded-lg border border-vera-charcoal/15 px-3 py-2 text-sm"
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
        >
          <option value="all">All tiers</option>
          <option value="Free">Free</option>
          <option value="Core">Core</option>
          <option value="PM">PM</option>
          <option value="Full Suite">Full Suite</option>
          <option value="Custom">Custom</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-vera-charcoal/10">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-vera-surface/80 text-xs uppercase tracking-wide text-vera-muted">
            <tr>
              {th("company", "Company")}
              {th("tier", "Tier")}
              <th className="px-3 py-2 font-medium">Seats</th>
              <th className="px-3 py-2 font-medium">Modules</th>
              {th("renewal", "Renewal")}
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr
                key={r.id}
                className={`border-t border-vera-charcoal/5 ${
                  highlightCompanyId === r.companyId ? "bg-teal-50/60" : ""
                }`}
              >
                <td className="px-3 py-3 font-medium">{r.companyName}</td>
                <td className="px-3 py-3">{r.tier}</td>
                <td className="px-3 py-3 min-w-[140px]">
                  <SeatUsageBar used={r.seatsUsed} purchased={r.seatsPurchased} />
                </td>
                <td className="px-3 py-3 text-xs text-vera-muted">
                  {r.modulesEnabled.join(", ") || "—"}
                </td>
                <td className="px-3 py-3 text-xs">
                  {r.renewalDate ? new Date(r.renewalDate).toLocaleDateString() : "—"}
                </td>
                <td className="px-3 py-3 text-xs">{r.status}</td>
                <td className="px-3 py-3">
                  <SubscriptionActionsMenu row={r} onUpdated={onUpdated} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
