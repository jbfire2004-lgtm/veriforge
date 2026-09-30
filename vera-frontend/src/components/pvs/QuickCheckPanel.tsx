"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { fetchPvsQuickCheck, type PvsQuickCheck } from "@/lib/pvs-api";

export function QuickCheckPanel({
  contractorId,
}: {
  contractorId: string;
}) {
  const [data, setData] = useState<PvsQuickCheck | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      setData(await fetchPvsQuickCheck(contractorId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "QuickCheck failed");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void run();
  }, [contractorId]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">QuickCheck</h2>
          <p className="text-sm text-zinc-600">
            Rapid PVS + documents + audit finding pass/fail.
          </p>
        </div>
        <Button type="button" variant="outline" disabled={busy} onClick={() => void run()}>
          {busy ? "Running…" : "Re-run"}
        </Button>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {data ? (
        <>
          <div
            className={`border px-4 py-3 text-sm ${data.ready ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-amber-200 bg-amber-50 text-amber-950"}`}
          >
            {data.ready ? "Ready" : "Gaps found"} — {data.passed}/{data.total}{" "}
            checks passed · PVS score {data.pvsScore}
          </div>
          <ul className="divide-y divide-zinc-200 border border-zinc-200 text-sm">
            {data.checks.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-2 px-3 py-2"
              >
                <span>{c.label}</span>
                <span className={c.ok ? "text-emerald-700" : "text-red-700"}>
                  {c.ok ? "PASS" : "FAIL"} · {c.detail}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-zinc-500">
            Generated {new Date(data.generatedAt).toLocaleString()}
          </p>
        </>
      ) : (
        <p className="text-sm text-zinc-500">Running QuickCheck…</p>
      )}
    </div>
  );
}
