"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchWorkerProjectReadiness,
  type WorkerProjectReadinessResult,
} from "@/lib/worker-project-readiness";

const STATUS_STYLES: Record<string, string> = {
  READY: "bg-emerald-100 text-emerald-900",
  RESTRICTED: "bg-amber-100 text-amber-900",
  "NOT QUALIFIED": "bg-red-100 text-red-900",
};

export function WorkerProjectReadinessPanel({
  workerId,
  projectId,
  workerName,
}: {
  workerId: number;
  projectId: number;
  workerName?: string;
}) {
  const [result, setResult] = useState<WorkerProjectReadinessResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(() => {
    setBusy(true);
    setError(null);
    void fetchWorkerProjectReadiness(workerId, projectId)
      .then(setResult)
      .catch((e) => setError(e instanceof Error ? e.message : "Readiness check failed"))
      .finally(() => setBusy(false));
  }, [workerId, projectId]);

  useEffect(() => {
    run();
  }, [run]);

  if (busy && !result) {
    return <p className="text-sm text-[var(--sf-text-muted)]">Checking project readiness…</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600" role="alert">{error}</p>;
  }

  if (!result) return null;

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[result.status] ?? "bg-slate-100"}`}
        >
          {result.status}
        </span>
        <span className="text-xs text-slate-500">
          {result.training_summary.valid_verified}/{result.training_summary.required} verified
        </span>
        <button
          type="button"
          className="text-xs font-medium text-[var(--sf-primary)] hover:underline"
          onClick={run}
          disabled={busy}
        >
          Refresh
        </button>
      </div>

      <p className="text-xs text-slate-700">{result.supervisor_message}</p>

      {result.blocking_items.length > 0 ? (
        <div>
          <p className="mb-1 text-xs font-semibold uppercase text-red-700">Blocking</p>
          <ul className="list-inside list-disc text-xs text-slate-700">
            {result.blocking_items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {result.non_blocking_items.length > 0 ? (
        <div>
          <p className="mb-1 text-xs font-semibold uppercase text-amber-800">Restrictions</p>
          <ul className="list-inside list-disc text-xs text-slate-700">
            {result.non_blocking_items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {result.fix_steps.length > 0 ? (
        <details className="text-xs text-slate-600">
          <summary className="cursor-pointer font-medium text-slate-800">
            Fix steps{workerName ? ` for ${workerName}` : ""}
          </summary>
          <ol className="mt-1 list-inside list-decimal">
            {result.fix_steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </details>
      ) : null}
    </div>
  );
}
