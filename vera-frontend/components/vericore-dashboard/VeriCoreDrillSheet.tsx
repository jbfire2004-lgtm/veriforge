"use client";

import Link from "next/link";
import type { DrillResponse } from "@/lib/vericore-dashboard/types";
import { Button } from "@/components/ui/button";

export function VeriCoreDrillSheet({
  drill,
  loading,
  onClose,
  locationId,
  roleBand,
  onLocationChange,
  onRoleChange,
}: {
  drill: DrillResponse | null;
  loading?: boolean;
  onClose: () => void;
  locationId?: string;
  roleBand?: string;
  onLocationChange?: (v: string) => void;
  onRoleChange?: (v: string) => void;
}) {
  if (!drill && !loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" role="dialog" aria-modal>
      <button type="button" className="flex-1 cursor-default" aria-label="Close" onClick={onClose} />
      <aside className="flex h-full w-full max-w-xl flex-col border-l border-[#5A6169]/40 bg-white shadow-xl">
        <header className="flex items-start justify-between gap-3 border-b border-[#5A6169]/30 px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#2F8F8C]">
              Drill-down
            </p>
            <h2 className="mt-1 text-lg font-semibold text-[#2A2E33]">
              {drill?.label ?? "Loading…"}
            </h2>
            {drill ? (
              <p className="mt-1 font-mono text-xs text-[#5a6b7c]">{drill.formulaId}</p>
            ) : null}
          </div>
          <Button type="button" size="sm" variant="outline" onClick={onClose}>
            Close
          </Button>
        </header>

        {loading || !drill ? (
          <div className="p-5 text-sm text-[#5a6b7c]">Loading underlying data…</div>
        ) : (
          <>
            <div className="space-y-3 border-b border-[#5A6169]/30 bg-[#F7FAFC] px-5 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5a6b7c]">
                Formula
              </p>
              <p className="rounded-[3px] border border-[#5A6169]/40 bg-white px-3 py-2 font-mono text-sm text-[#2A2E33]">
                {drill.formula}
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(drill.inputs).map(([k, v]) => (
                  <span
                    key={k}
                    className="rounded-[3px] border border-[#5A6169]/40 bg-white px-2 py-1 text-xs text-[#2A2E33]"
                  >
                    {k}: <strong className="tabular-nums">{v ?? "—"}</strong>
                  </span>
                ))}
              </div>

              {drill.metricKey.startsWith("training.") ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  <select
                    className="h-9 rounded-[3px] border border-[#5A6169] bg-white px-2 text-sm"
                    value={locationId ?? ""}
                    onChange={(e) => onLocationChange?.(e.target.value)}
                  >
                    <option value="">All locations</option>
                    <option value="loc-north">North Yard</option>
                    <option value="loc-south">South Gate</option>
                    <option value="loc-hq">HQ Office</option>
                  </select>
                  <select
                    className="h-9 rounded-[3px] border border-[#5A6169] bg-white px-2 text-sm"
                    value={roleBand ?? ""}
                    onChange={(e) => onRoleChange?.(e.target.value)}
                  >
                    <option value="">All roles</option>
                    <option value="field">Field</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="office">Office</option>
                  </select>
                </div>
              ) : null}
            </div>

            <div className="flex-1 overflow-auto px-5 py-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.06em] text-[#5a6b7c]">
                {drill.total} records
              </p>
              <ul className="divide-y divide-[#5A6169]/25 rounded-[3px] border border-[#5A6169]/30">
                {drill.items.map((item) => (
                  <li key={item.id} className="px-3 py-3 hover:bg-[#F7FAFC]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-[#2A2E33]">{item.title}</p>
                        {item.subtitle ? (
                          <p className="mt-0.5 text-xs text-[#5a6b7c]">{item.subtitle}</p>
                        ) : null}
                        <div className="mt-1 flex flex-wrap gap-2 text-xs text-[#8A9199]">
                          {item.status ? <span>{item.status}</span> : null}
                          {item.dueAt ? (
                            <span>Due {new Date(item.dueAt).toLocaleDateString()}</span>
                          ) : null}
                          {item.documentType ? <span>{item.documentType}</span> : null}
                        </div>
                      </div>
                      <Link
                        href={item.href}
                        className="shrink-0 text-xs font-semibold text-[#1E6FB8] hover:underline"
                      >
                        Open
                      </Link>
                    </div>
                  </li>
                ))}
                {drill.items.length === 0 ? (
                  <li className="px-3 py-6 text-center text-sm text-[#5a6b7c]">No rows for this filter.</li>
                ) : null}
              </ul>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
