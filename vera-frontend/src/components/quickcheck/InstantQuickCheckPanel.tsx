"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import {
  fetchQuickCheck,
  listQuickCheckRuns,
  type QuickCheckResult,
  type QuickCheckRunRow,
} from "@/lib/quickcheck-api";
import {
  QuickCheckResultsPanel,
  RiskLevelBadge,
} from "./QuickCheckResultsPanel";

export function InstantQuickCheckPanel({
  contractorId,
  source = "page",
  autoRun = true,
}: {
  contractorId: string;
  source?: string;
  autoRun?: boolean;
}) {
  const [result, setResult] = useState<QuickCheckResult | null>(null);
  const [runs, setRuns] = useState<QuickCheckRunRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const [r, history] = await Promise.all([
        fetchQuickCheck(contractorId, source),
        listQuickCheckRuns(contractorId),
      ]);
      setResult(r);
      setRuns(history.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "QuickCheck failed");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (autoRun) void run();
  }, [contractorId, autoRun]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">QuickCheck</h2>
          <p className="text-sm text-zinc-600">
            Compliance score, missing items, and risk level — logged for
            analytics.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={() => void run()}
        >
          {busy ? "Running…" : "Re-run"}
        </Button>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {result ? (
        <QuickCheckResultsPanel result={result} />
      ) : (
        <p className="text-sm text-zinc-500">
          {busy ? "Running QuickCheck…" : "Click Re-run to start."}
        </p>
      )}

      {runs.length ? (
        <section>
          <h3 className="mb-2 text-sm font-medium uppercase text-zinc-500">
            Recent runs
          </h3>
          <ul className="divide-y divide-zinc-200 border border-zinc-200 text-sm">
            {runs.slice(0, 8).map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 px-3 py-2"
              >
                <span className="tabular-nums">{r.complianceScore}</span>
                <RiskLevelBadge level={r.riskLevel} />
                <span className="text-xs text-zinc-500">
                  {r.source} · {new Date(r.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
