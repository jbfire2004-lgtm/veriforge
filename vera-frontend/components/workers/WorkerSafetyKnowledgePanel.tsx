"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { SafetyKnowledgeHistoryList } from "@/components/safety-knowledge/SafetyKnowledgeHistoryList";
import {
  SafetyKnowledgeResultSummary,
  triggerSafetyKnowledgePdfDownload,
} from "@/components/safety-knowledge/SafetyKnowledgeResultSummary";
import {
  downloadSafetyKnowledgePdf,
  evaluateSafetyKnowledge,
  getLatestSafetyKnowledge,
  listSafetyKnowledgeHistory,
  type SafetyKnowledgeHistoryEntry,
  type SafetyKnowledgeResult,
} from "@/lib/safety-knowledge";
import { SfButton, SfCard } from "@/src/components/safety-forms/ui";

export function WorkerSafetyKnowledgePanel({
  workerId,
  workerName,
}: {
  workerId: number;
  workerName: string;
}) {
  const [result, setResult] = useState<SafetyKnowledgeResult | null>(null);
  const [evaluatedAt, setEvaluatedAt] = useState<string | null>(null);
  const [history, setHistory] = useState<SafetyKnowledgeHistoryEntry[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    void Promise.all([
      getLatestSafetyKnowledge(workerId),
      listSafetyKnowledgeHistory(workerId),
    ])
      .then(([run, rows]) => {
        setResult((run?.resultJson as SafetyKnowledgeResult) ?? null);
        setEvaluatedAt(run?.evaluatedAt ?? null);
        setHistory(rows);
      })
      .catch(() => {
        setResult(null);
        setEvaluatedAt(null);
        setHistory([]);
      });
  }, [workerId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const out = await evaluateSafetyKnowledge(workerId);
      setResult(out.result);
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Evaluate failed");
    } finally {
      setBusy(false);
    }
  }

  async function exportPdf() {
    setBusy(true);
    setError(null);
    try {
      await triggerSafetyKnowledgePdfDownload(workerId, downloadSafetyKnowledgePdf);
    } catch (e) {
      setError(e instanceof Error ? e.message : "PDF failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SfCard className="space-y-4 p-5" data-testid="worker-ske-panel">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-semibold text-vera-charcoal">Safety Knowledge</h2>
          <p className="text-sm text-vera-muted">SKE assessment for {workerName}</p>
        </div>
        <Link
          href={`/core/safety-knowledge?workerId=${workerId}`}
          className="text-xs text-vera-teal hover:underline"
        >
          Open in Core
        </Link>
      </div>

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {result ? (
        <SafetyKnowledgeResultSummary
          result={result}
          evaluatedAt={evaluatedAt}
          compact
        />
      ) : (
        <p className="text-sm text-vera-muted">No evaluation on file yet.</p>
      )}

      <div className="flex flex-wrap gap-2">
        <SfButton type="button" variant="secondary" disabled={busy} onClick={() => void run()}>
          {busy ? "Running…" : "Run evaluation"}
        </SfButton>
        <SfButton
          type="button"
          variant="secondary"
          disabled={busy || !result}
          onClick={() => void exportPdf()}
        >
          PDF report
        </SfButton>
        <SfButton type="button" variant="secondary" disabled={busy} onClick={() => refresh()}>
          Refresh
        </SfButton>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-vera-charcoal">Evaluation history</h3>
        <div className="mt-2">
          <SafetyKnowledgeHistoryList entries={history} selectedId={history[0]?.id} />
        </div>
      </div>
    </SfCard>
  );
}
