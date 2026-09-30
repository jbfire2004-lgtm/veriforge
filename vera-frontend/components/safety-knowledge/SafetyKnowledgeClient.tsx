"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SafetyKnowledgeHistoryList } from "@/components/safety-knowledge/SafetyKnowledgeHistoryList";
import {
  SafetyKnowledgeResultSummary,
  triggerSafetyKnowledgePdfDownload,
} from "@/components/safety-knowledge/SafetyKnowledgeResultSummary";
import { WorkerPicker, type WorkerPickerOption } from "@/components/workers/WorkerPicker";
import {
  downloadSafetyKnowledgePdf,
  evaluateSafetyKnowledge,
  getLatestSafetyKnowledge,
  listSafetyKnowledgeHistory,
  type SafetyKnowledgeHistoryEntry,
  type SafetyKnowledgeResult,
} from "@/lib/safety-knowledge";
import { SfButton, SfCard } from "@/src/components/safety-forms/ui";

export function SafetyKnowledgeClient({
  initialWorkerId,
}: {
  initialWorkerId?: number;
}) {
  const router = useRouter();
  const [pickerId, setPickerId] = useState<number | null>(initialWorkerId ?? null);
  const [selectedWorker, setSelectedWorker] = useState<WorkerPickerOption | null>(null);
  const [result, setResult] = useState<SafetyKnowledgeResult | null>(null);
  const [evaluatedAt, setEvaluatedAt] = useState<string | null>(null);
  const [history, setHistory] = useState<SafetyKnowledgeHistoryEntry[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWorkerData = useCallback(async (id: number) => {
    setBusy(true);
    setError(null);
    try {
      const [run, rows] = await Promise.all([
        getLatestSafetyKnowledge(id),
        listSafetyKnowledgeHistory(id),
      ]);
      setResult((run?.resultJson as SafetyKnowledgeResult) ?? null);
      setEvaluatedAt(run?.evaluatedAt ?? null);
      setHistory(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
      setResult(null);
      setEvaluatedAt(null);
      setHistory([]);
    } finally {
      setBusy(false);
    }
  }, []);

  const syncWorkerSelection = useCallback(
    (id: number, worker?: WorkerPickerOption) => {
      setPickerId(id);
      setSelectedWorker(worker ?? null);
      router.replace(`/core/safety-knowledge?workerId=${id}`, { scroll: false });
      void loadWorkerData(id);
    },
    [loadWorkerData, router],
  );

  useEffect(() => {
    if (initialWorkerId != null) {
      void loadWorkerData(initialWorkerId);
    }
  }, [initialWorkerId, loadWorkerData]);

  async function runEvaluate() {
    if (pickerId == null) {
      setError("Select a worker to evaluate");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const out = await evaluateSafetyKnowledge(pickerId);
      setResult(out.result);
      await loadWorkerData(pickerId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Evaluation failed");
    } finally {
      setBusy(false);
    }
  }

  async function exportPdf() {
    if (pickerId == null) return;
    setBusy(true);
    setError(null);
    try {
      await triggerSafetyKnowledgePdfDownload(pickerId, downloadSafetyKnowledgePdf);
    } catch (e) {
      setError(e instanceof Error ? e.message : "PDF failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6" data-testid="ske-client">
      <SfCard className="space-y-4 p-5">
        <p className="text-sm font-medium">Select worker</p>
        <WorkerPicker
          value={pickerId}
          onChange={(id, worker) => {
            if (id == null) {
              setPickerId(null);
              setSelectedWorker(null);
              setResult(null);
              setEvaluatedAt(null);
              setHistory([]);
              router.replace("/core/safety-knowledge", { scroll: false });
              return;
            }
            syncWorkerSelection(id, worker);
          }}
        />
        {selectedWorker ? (
          <p className="text-sm text-[var(--sf-text-muted)]">
            Selected: {selectedWorker.firstName} {selectedWorker.lastName}
            {selectedWorker.company?.name ? ` · ${selectedWorker.company.name}` : ""}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <SfButton
            type="button"
            disabled={busy || pickerId == null}
            onClick={() => void runEvaluate()}
          >
            {busy ? "Running…" : "Run evaluation"}
          </SfButton>
          <SfButton
            type="button"
            variant="secondary"
            disabled={busy || pickerId == null}
            onClick={() => pickerId != null && void loadWorkerData(pickerId)}
          >
            Refresh
          </SfButton>
          <SfButton
            type="button"
            variant="secondary"
            disabled={busy || pickerId == null || !result}
            onClick={() => void exportPdf()}
          >
            Download PDF
          </SfButton>
        </div>
        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
      </SfCard>

      {pickerId != null ? (
        <SfCard className="space-y-3 p-5">
          <h2 className="font-semibold">Latest result</h2>
          {result ? (
            <SafetyKnowledgeResultSummary result={result} evaluatedAt={evaluatedAt} />
          ) : !busy ? (
            <p className="text-sm text-[var(--sf-text-muted)]">
              No SKE evaluation on file for this worker yet. Run evaluation to generate a
              score.
            </p>
          ) : null}
        </SfCard>
      ) : null}

      {pickerId != null ? (
        <SfCard className="space-y-3 p-5">
          <h2 className="font-semibold">History</h2>
          <SafetyKnowledgeHistoryList entries={history} selectedId={history[0]?.id} />
        </SfCard>
      ) : null}
    </div>
  );
}
