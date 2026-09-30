"use client";

import { useCallback, useEffect, useState } from "react";
import {
  downloadTrainingAssessmentPdf,
  getLatestWorkerTrainingAssessment,
  runWorkerTrainingAssessment,
  type TrainingAssessmentSummary,
} from "@/lib/assessment-engines";
import { SfButton } from "@/src/components/safety-forms/ui";

export function WorkerTrainingAssessmentPanel({
  workerId,
}: {
  workerId: number;
}) {
  const [latest, setLatest] = useState<TrainingAssessmentSummary | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    void getLatestWorkerTrainingAssessment(workerId)
      .then(setLatest)
      .catch(() => setLatest(null));
  }, [workerId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      await runWorkerTrainingAssessment(workerId);
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Assessment failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg border border-[var(--sf-border)] bg-[var(--sf-surface)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Training assessment</h3>
          {latest ? (
            <p className="mt-1 text-sm text-[var(--sf-text-muted)]">
              {latest.overallStatus} · score {latest.overallScore} ·{" "}
              {new Date(latest.evaluatedAt).toLocaleString()}
            </p>
          ) : (
            <p className="mt-1 text-sm text-[var(--sf-text-muted)]">
              No assessment on file yet.
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <SfButton type="button" variant="secondary" disabled={busy} onClick={() => void run()}>
            {busy ? "Running…" : "Run assessment"}
          </SfButton>
          <SfButton
            type="button"
            variant="secondary"
            disabled={busy || !latest}
            onClick={() => {
              setBusy(true);
              void downloadTrainingAssessmentPdf(workerId)
                .then((blob) => {
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `training-assessment-${workerId}.pdf`;
                  a.click();
                  URL.revokeObjectURL(url);
                })
                .catch((e) =>
                  setError(e instanceof Error ? e.message : "PDF failed"),
                )
                .finally(() => setBusy(false));
            }}
          >
            PDF report
          </SfButton>
        </div>
      </div>
      {error ? (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
