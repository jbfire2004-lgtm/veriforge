"use client";



import { useCallback, useEffect, useState } from "react";

import {

  downloadFitTestPdf,

  evaluateFitTest,

  FIT_TEST_METHODS,

  FIT_TEST_TYPES,

  formatFitTestDate,

  getWorkerFitTestSummary,

  listWorkerFitTestHistory,

  runWorkerFitTest,

  fitTestStatusTone,

  type FitTestResult,

  type FitTestRun,

  type FitTestSummary,

} from "@/lib/fit-tests";

import { SfButton, SfCard } from "@/src/components/safety-forms/ui";



const STATUS_STYLES = {

  success: "bg-emerald-100 text-emerald-900",

  warning: "bg-amber-100 text-amber-900",

  danger: "bg-red-100 text-red-900",

  neutral: "bg-slate-100 text-slate-800",

} as const;



export function WorkerFitTestPanel({ workerId }: { workerId: number }) {

  const [summary, setSummary] = useState<FitTestSummary>(null);

  const [history, setHistory] = useState<FitTestRun[]>([]);

  const [busy, setBusy] = useState<"load" | "save" | "pdf" | null>(null);

  const [error, setError] = useState<string | null>(null);



  const [testType, setTestType] = useState<string>(FIT_TEST_TYPES[0]);

  const [testMethod, setTestMethod] = useState<string>(FIT_TEST_METHODS[0]);

  const [result, setResult] = useState<FitTestResult>("PASS");

  const [performedAt, setPerformedAt] = useState(() => new Date().toISOString().slice(0, 10));

  const [notes, setNotes] = useState("");

  const [preview, setPreview] = useState<string | null>(null);



  const refresh = useCallback(async () => {

    setBusy("load");

    try {

      const [latest, runs] = await Promise.all([

        getWorkerFitTestSummary(workerId),

        listWorkerFitTestHistory(workerId),

      ]);

      setSummary(latest);

      setHistory(runs);

    } catch {

      setSummary(null);

      setHistory([]);

    } finally {

      setBusy(null);

    }

  }, [workerId]);



  useEffect(() => {

    void refresh();

  }, [refresh]);



  async function previewEvaluation() {

    setError(null);

    try {

      const out = await evaluateFitTest({

        result,

        performedAt: new Date(performedAt).toISOString(),

      });

      const expires = formatFitTestDate(out.evaluation.expiresAt);

      setPreview(

        `${out.evaluation.statusLabel}${expires ? ` · valid until ${expires}` : ""}`,

      );

    } catch (e) {

      setError(e instanceof Error ? e.message : "Evaluation failed");

    }

  }



  async function saveRun() {

    setBusy("save");

    setError(null);

    try {

      await runWorkerFitTest(workerId, {

        testType,

        testMethod,

        result,

        notes: notes.trim() || undefined,

        performedAt: new Date(performedAt).toISOString(),

      });

      setPreview(null);

      await refresh();

    } catch (e) {

      setError(e instanceof Error ? e.message : "Record failed");

    } finally {

      setBusy(null);

    }

  }



  async function exportPdf() {

    setBusy("pdf");

    setError(null);

    try {

      const blob = await downloadFitTestPdf(workerId);

      const url = URL.createObjectURL(blob);

      const anchor = document.createElement("a");

      anchor.href = url;

      anchor.download = `fit-test-${workerId}.pdf`;

      anchor.click();

      URL.revokeObjectURL(url);

    } catch (e) {

      setError(e instanceof Error ? e.message : "PDF export failed");

    } finally {

      setBusy(null);

    }

  }



  const statusLabel = summary?.evaluation.statusLabel;

  const tone = statusLabel ? fitTestStatusTone(statusLabel) : "neutral";



  return (

    <SfCard className="space-y-4 p-5" data-testid="worker-fit-test-panel">

      <div className="flex flex-wrap items-start justify-between gap-3">

        <div>

          <h2 className="font-semibold text-vera-charcoal">Respirator fit test</h2>

          <p className="mt-1 text-sm text-vera-muted">

            Qualitative or quantitative fit testing with one-year validity on pass.

          </p>

        </div>

        <div className="flex flex-wrap gap-2">

          <SfButton

            type="button"

            variant="secondary"

            disabled={busy !== null || !summary}

            onClick={() => void exportPdf()}

          >

            {busy === "pdf" ? "Exporting…" : "Export PDF"}

          </SfButton>

        </div>

      </div>



      {summary?.latest ? (

        <div className="rounded-lg border border-[var(--sf-border)] bg-[var(--sf-surface-muted)] p-3 text-sm">

          <div className="flex flex-wrap items-center gap-2">

            <span

              className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[tone]}`}

            >

              {summary.evaluation.statusLabel}

            </span>

            <span>{summary.latest.testType ?? "Respirator"}</span>

            {summary.evaluation.expiresAt ? (

              <span className="text-vera-muted">

                Expires {formatFitTestDate(summary.evaluation.expiresAt)}

              </span>

            ) : null}

            {summary.evaluation.expiringSoon ? (

              <span className="text-xs font-medium text-amber-800">Expiring within 30 days</span>

            ) : null}

          </div>

        </div>

      ) : (

        <p className="text-sm text-vera-muted">No fit test on file.</p>

      )}



      <section className="space-y-3 rounded-lg border border-[var(--sf-border)] p-4">

        <h3 className="text-sm font-semibold">Run fit test</h3>

        <div className="grid gap-3 sm:grid-cols-2">

          <label className="block text-sm">

            <span className="text-vera-muted">Test type</span>

            <select

              className="mt-1 w-full rounded border px-2 py-1.5"

              value={testType}

              onChange={(e) => setTestType(e.target.value)}

            >

              {FIT_TEST_TYPES.map((type) => (

                <option key={type} value={type}>

                  {type}

                </option>

              ))}

            </select>

          </label>

          <label className="block text-sm">

            <span className="text-vera-muted">Test method</span>

            <select

              className="mt-1 w-full rounded border px-2 py-1.5"

              value={testMethod}

              onChange={(e) => setTestMethod(e.target.value)}

            >

              {FIT_TEST_METHODS.map((method) => (

                <option key={method} value={method}>

                  {method}

                </option>

              ))}

            </select>

          </label>

          <label className="block text-sm">

            <span className="text-vera-muted">Performed date</span>

            <input

              type="date"

              className="mt-1 w-full rounded border px-2 py-1.5"

              value={performedAt}

              onChange={(e) => setPerformedAt(e.target.value)}

            />

          </label>

          <label className="block text-sm">

            <span className="text-vera-muted">Result</span>

            <select

              className="mt-1 w-full rounded border px-2 py-1.5"

              value={result}

              onChange={(e) => setResult(e.target.value as FitTestResult)}

            >

              <option value="PASS">Pass</option>

              <option value="FAIL">Fail</option>

              <option value="CONDITIONAL">Conditional</option>

            </select>

          </label>

        </div>

        <label className="block text-sm">

          <span className="text-vera-muted">Notes</span>

          <textarea

            className="mt-1 w-full rounded border px-2 py-1.5"

            rows={2}

            value={notes}

            onChange={(e) => setNotes(e.target.value)}

            placeholder="Protocol reference, tester name, mask model…"

          />

        </label>

        {preview ? (

          <p className="text-sm text-vera-muted">Preview: {preview}</p>

        ) : null}

        <div className="flex flex-wrap gap-2">

          <SfButton type="button" variant="secondary" disabled={busy !== null} onClick={() => void previewEvaluation()}>

            Evaluate

          </SfButton>

          <SfButton type="button" disabled={busy !== null} onClick={() => void saveRun()}>

            {busy === "save" ? "Saving…" : "Run fit test"}

          </SfButton>

        </div>

      </section>



      {history.length ? (

        <section>

          <h3 className="text-sm font-semibold">History</h3>

          <ul className="mt-2 divide-y rounded-lg border border-[var(--sf-border)]">

            {history.slice(0, 8).map((run) => (

              <li key={run.id} className="flex flex-wrap items-center gap-2 px-3 py-2 text-sm">

                <span className="font-medium">{run.result}</span>

                <span className="text-vera-muted">{formatFitTestDate(run.performedAt)}</span>

                <span>{run.testType ?? "—"}</span>

                {run.expiresAt ? (

                  <span className="text-vera-muted">expires {formatFitTestDate(run.expiresAt)}</span>

                ) : null}

              </li>

            ))}

          </ul>

        </section>

      ) : null}



      {error ? (

        <p className="text-sm text-red-600" role="alert">

          {error}

        </p>

      ) : null}

      {busy === "load" ? <p className="text-xs text-vera-muted">Loading…</p> : null}

    </SfCard>

  );

}


