"use client";

import { useEffect, useState } from "react";
import { fetchPvsAnalytics, type PvsAnalytics } from "@/lib/pvs-api";
import { PvsStatusBadge } from "./PvsStatusBadge";

export function PvsAnalyticsPanel({
  contractorId,
}: {
  contractorId: string;
}) {
  const [data, setData] = useState<PvsAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchPvsAnalytics(contractorId)
      .then(setData)
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Analytics failed"),
      );
  }, [contractorId]);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!data) return <p className="text-sm text-zinc-500">Loading analytics…</p>;

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="PVS score" value={String(data.pvsScore)} />
        <Metric label="Programs" value={String(data.totals.programs)} />
        <Metric label="Verified" value={String(data.totals.verified)} />
        <Metric
          label="Matrix elements verified"
          value={`${data.elementStats.verified}/${data.elementStats.total}`}
        />
      </div>

      <section>
        <h3 className="mb-2 text-sm font-medium uppercase text-zinc-500">
          Status mix
        </h3>
        <ul className="flex flex-wrap gap-2 text-sm">
          {Object.entries(data.byStatus).map(([status, count]) => (
            <li
              key={status}
              className="flex items-center gap-2 border border-zinc-200 px-3 py-1"
            >
              <PvsStatusBadge status={status} />
              <span>{count}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-medium uppercase text-zinc-500">
          Required coverage
        </h3>
        <ul className="divide-y divide-zinc-200 border border-zinc-200 text-sm">
          {data.coverage.map((c) => (
            <li
              key={c.category}
              className="flex flex-wrap items-center justify-between gap-2 px-3 py-2"
            >
              <span>{c.label}</span>
              <span className="flex items-center gap-2">
                <PvsStatusBadge status={c.status} />
                {c.satisfied ? (
                  <span className="text-emerald-700">OK</span>
                ) : (
                  <span className="text-amber-800">Gap</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-zinc-200 px-3 py-3">
      <div className="text-xs uppercase text-zinc-500">{label}</div>
      <div className="mt-1 text-xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}
