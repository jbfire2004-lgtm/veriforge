"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  createFieldOsPermit,
  fetchFieldOsPermits,
  simulateFieldOsWebhook,
  type VeripmFieldOsPermit,
} from "@/lib/veripm-fieldos-permits";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function FieldOsPermitsView() {
  const [permits, setPermits] = useState<VeripmFieldOsPermit[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<VeripmFieldOsPermit | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFieldOsPermits({ projectId: 1 });
      setPermits(res.permits ?? []);
      setCounts(res.countsByStatus ?? {});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load FieldOS permits");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function createDemo() {
    await createFieldOsPermit({
      projectId: 1,
      permitType: "loto",
      title: "LOTO — FieldOS demo isolation",
      assetId: "eq-3",
    });
    await load();
  }

  async function closeSelected() {
    if (!selected?.fieldos_task_id) return;
    await simulateFieldOsWebhook({
      task_id: selected.fieldos_task_id,
      external_permit_id: selected.permit_id,
      status: "closed",
      signatures: [
        { role: "issuer", name: "Field issuer", signedAt: new Date().toISOString() },
        { role: "acceptor", name: "Field acceptor", signedAt: new Date().toISOString() },
      ],
      notes: ["Closed from FieldOS permit task UI"],
      hazard_controls_applied: ["isolation_verified"],
      photos: [],
      completed_at: new Date().toISOString(),
    });
    await load();
    setSelected(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 border-b border-[#5A6169]/25 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#2F8F8C]">
            FieldOS · Permit tasks
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#2A2E33]">
            Permit tasks
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-[#5a6b7c]">
            Field execution of VERIPM permits — signatures, photos, hazard controls. Closing a task
            syncs status back to VERIPM and refreshes dashboards.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => void load()}>
            Refresh
          </Button>
          <Button type="button" size="sm" onClick={() => void createDemo()}>
            Create LOTO task
          </Button>
          <Link
            href="/pm/permits"
            className="inline-flex h-9 items-center rounded-[3px] border border-[#5A6169] px-3 text-sm font-medium text-[#2A2E33] hover:border-[#1E6FB8]"
          >
            VERIPM Permits
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        {Object.entries(counts).map(([status, n]) => (
          <span
            key={status}
            className="rounded-[3px] border border-[#5A6169]/40 bg-white px-2 py-1 tabular-nums text-[#2A2E33]"
          >
            {status.replace(/_/g, " ")}: {n}
          </span>
        ))}
      </div>

      {error ? (
        <div className="rounded-[3px] border border-[#C89F3D]/50 bg-[#FBF8F0] px-4 py-3 text-sm">
          {error}
        </div>
      ) : null}

      {loading && !permits.length ? <Skeleton className="h-40 w-full rounded-[3px]" /> : null}

      <div className="overflow-auto rounded-[3px] border border-[#5A6169]/40">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#F0F3F5] text-[11px] uppercase tracking-[0.06em] text-[#5a6b7c]">
            <tr>
              <th className="px-3 py-2">Permit</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Risk</th>
              <th className="px-3 py-2">VERIPM</th>
              <th className="px-3 py-2">FieldOS</th>
              <th className="px-3 py-2">Task</th>
            </tr>
          </thead>
          <tbody>
            {permits.map((p) => (
              <tr key={p.permit_id} className="border-t border-[#5A6169]/25">
                <td className="px-3 py-2">
                  <button
                    type="button"
                    className="text-left text-[#1E6FB8] hover:underline"
                    onClick={() => setSelected(p)}
                  >
                    {p.title ?? p.permit_id}
                  </button>
                </td>
                <td className="px-3 py-2 capitalize">{p.permit_type.replace(/_/g, " ")}</td>
                <td className="px-3 py-2 capitalize">{p.risk_level}</td>
                <td className="px-3 py-2 capitalize">{p.status.replace(/_/g, " ")}</td>
                <td className="px-3 py-2">{p.live_fieldos_status ?? "—"}</td>
                <td className="px-3 py-2 font-mono text-xs">{p.fieldos_task_id ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected ? (
        <div className="rounded-[3px] border border-[#5A6169]/40 bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[#2A2E33]">
                {selected.title ?? selected.permit_id}
              </h2>
              <p className="mt-1 text-sm text-[#5a6b7c]">
                FieldOS task {selected.fieldos_task_id} · risk {selected.risk_level}
              </p>
            </div>
            <div className="flex gap-2">
              {selected.status !== "closed" ? (
                <Button type="button" size="sm" onClick={() => void closeSelected()}>
                  Complete &amp; sync to VERIPM
                </Button>
              ) : null}
              <Button type="button" size="sm" variant="outline" onClick={() => setSelected(null)}>
                Close
              </Button>
            </div>
          </div>
          <FieldOsActivityPanel permit={selected} />
        </div>
      ) : null}
    </div>
  );
}

function FieldOsActivityPanel({ permit }: { permit: VeripmFieldOsPermit }) {
  const activity = (permit.fieldos_metadata?.activity ?? {}) as {
    signatures?: Array<{ role: string; name?: string }>;
    photos?: Array<{ id: string; caption?: string; url: string }>;
    notes?: string[];
    hazard_controls_applied?: string[];
  };
  const safety = permit.safety_links ?? {};

  return (
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5a6b7c]">
          Signatures
        </p>
        <ul className="mt-2 space-y-1 text-sm">
          {(activity.signatures ?? []).length === 0 ? (
            <li className="text-[#8A9199]">None yet</li>
          ) : (
            activity.signatures!.map((s, i) => (
              <li key={`${s.role}-${i}`}>
                {s.role}: {s.name ?? "—"}
              </li>
            ))
          )}
        </ul>
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5a6b7c]">
          Hazard controls
        </p>
        <ul className="mt-2 space-y-1 text-sm">
          {(activity.hazard_controls_applied ?? []).length === 0 ? (
            <li className="text-[#8A9199]">None logged</li>
          ) : (
            activity.hazard_controls_applied!.map((c) => <li key={c}>{c}</li>)
          )}
        </ul>
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5a6b7c]">
          Notes / photos
        </p>
        <ul className="mt-2 space-y-1 text-sm">
          {(activity.notes ?? []).map((n, i) => (
            <li key={i}>{n}</li>
          ))}
          {(activity.photos ?? []).map((p) => (
            <li key={p.id}>
              <Link href={p.url} className="text-[#1E6FB8] hover:underline">
                {p.caption ?? p.id}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5a6b7c]">
          Safety / work orders
        </p>
        <dl className="mt-2 space-y-1 text-sm">
          <div className="flex justify-between gap-2">
            <dt>FLHA/JHA</dt>
            <dd className="tabular-nums">{String(safety.flhaJhaId ?? "—")}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt>Work orders</dt>
            <dd className="tabular-nums">{permit.work_order_ids.join(", ") || "—"}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt>Contractor</dt>
            <dd className="tabular-nums">{permit.contractor_id ?? "—"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
