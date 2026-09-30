"use client";

import { useCallback, useEffect, useState } from "react";
import {
  buildSafetySitePlan,
  confirmSafetyProgramRun,
  correctSafetyProgramRun,
  extractSafetyProgramText,
  listSafetyProgramRuns,
  rejectSafetyProgramRun,
  summarizeSafetyProgram,
  type SafetyProgramExtract,
  type SafetyProgramIngestRun,
} from "@/lib/safety-program-ingestion";

export function SafetyProgramIngestPanel({
  companyId,
  projectId,
  channel,
  title = "Safety Program Ingestion",
}: {
  companyId: number;
  projectId?: number;
  channel: "core" | "pm";
  title?: string;
}) {
  const [text, setText] = useState("");
  const [sourceReference, setSourceReference] = useState("");
  const [confirmedBy, setConfirmedBy] = useState("");
  const [active, setActive] = useState<SafetyProgramIngestRun | null>(null);
  const [runs, setRuns] = useState<SafetyProgramIngestRun[]>([]);
  const [editJson, setEditJson] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<string>("");
  const [worksite, setWorksite] = useState("");
  const [activities, setActivities] = useState("");
  const [sitePlan, setSitePlan] = useState("");

  const reload = useCallback(async () => {
    if (!companyId) return;
    try {
      setRuns(await listSafetyProgramRuns({ companyId, projectId }));
    } catch {
      /* soft */
    }
  }, [companyId, projectId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    if (active?.extract) {
      setEditJson(JSON.stringify(active.extract, null, 2));
    }
  }, [active]);

  async function onExtract() {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const run = await extractSafetyProgramText({
        companyId,
        projectId,
        channel,
        text,
        sourceReference: sourceReference || undefined,
        usePipeline: true,
      });
      setActive(run);
      setMessage(
        `Extracted → ${run.status}. Long docs are chunked, merged, and normalized. Review before confirm.`,
      );
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Extract failed");
    } finally {
      setBusy(false);
    }
  }

  async function onCorrect() {
    if (!active) return;
    setBusy(true);
    setError(null);
    try {
      const parsed = JSON.parse(editJson) as SafetyProgramExtract;
      const run = await correctSafetyProgramRun(active.id, parsed);
      setActive(run);
      setMessage("Corrections saved and re-validated against schema.");
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Correct failed");
    } finally {
      setBusy(false);
    }
  }

  async function onConfirm() {
    if (!active) return;
    setBusy(true);
    setError(null);
    try {
      const run = await confirmSafetyProgramRun(
        active.id,
        confirmedBy.trim() || "reviewer",
      );
      setActive(run);
      setMessage("Confirmed — domain write-back completed (drafts only).");
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Confirm failed");
    } finally {
      setBusy(false);
    }
  }

  async function onReject() {
    if (!active) return;
    setBusy(true);
    try {
      const run = await rejectSafetyProgramRun(active.id, "Rejected in UI");
      setActive(run);
      setMessage("Run rejected — no write-back.");
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reject failed");
    } finally {
      setBusy(false);
    }
  }

  async function onSummarize() {
    if (!active) return;
    setBusy(true);
    setError(null);
    try {
      const result = await summarizeSafetyProgram({ runId: active.id });
      setSummaries(JSON.stringify(result, null, 2));
      setMessage("Embedding summaries generated from the validated extract.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Summarize failed");
    } finally {
      setBusy(false);
    }
  }

  async function onSitePlan() {
    setBusy(true);
    setError(null);
    try {
      const result = await buildSafetySitePlan({
        companyId,
        runIds: active ? [active.id] : undefined,
        worksiteDescription: worksite,
        plannedActivities: activities,
      });
      setSitePlan(result.markdown);
      setMessage("Site plan generated from ingested runs (no invented regulations).");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Site plan failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-4 sm:p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-600">
          Shared VeriCore + VeriPM engine: extract → merge/normalize → summarize
          → site plan → human confirm → draft write-back. Missing data stays
          null/empty — no invented hazards or regulations.
        </p>
      </header>

      <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        Confirm is required before any domain write-back. Non-safety text sets{" "}
        <code>is_safety_document: false</code> and skips write-back.
      </div>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-800">{message}</p> : null}

      <section className="space-y-2 rounded-lg border border-slate-200 bg-white p-4">
        <label className="block text-sm">
          Source reference (optional)
          <input
            className="mt-1 w-full rounded border px-2 py-1.5"
            value={sourceReference}
            onChange={(e) => setSourceReference(e.target.value)}
            placeholder="File name or internal doc ID"
          />
        </label>
        <label className="block text-sm">
          Document text
          <textarea
            className="mt-1 w-full rounded border px-2 py-1.5 font-mono text-xs"
            rows={10}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste safety document text…"
          />
        </label>
        <button
          type="button"
          disabled={busy || !text.trim() || !companyId}
          onClick={onExtract}
          className="rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          Extract (chunk → merge → normalize)
        </button>
      </section>

      {active ? (
        <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap gap-3 text-sm text-slate-600">
            <span>
              Run <code className="text-xs">{active.id.slice(0, 8)}</code>
            </span>
            <span>Status: {active.status}</span>
            <span>
              Confidence:{" "}
              {active.confidence != null
                ? Math.round(active.confidence * 100)
                : "—"}
              %
            </span>
            <span>
              Safety doc:{" "}
              {active.extract?.meta.is_safety_document ? "yes" : "no"}
            </span>
          </div>
          <label className="block text-sm">
            Extract JSON (edit then Save corrections)
            <textarea
              className="mt-1 w-full rounded border px-2 py-1.5 font-mono text-xs"
              rows={18}
              value={editJson}
              onChange={(e) => setEditJson(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            Confirmed by
            <input
              className="mt-1 w-full max-w-md rounded border px-2 py-1.5"
              value={confirmedBy}
              onChange={(e) => setConfirmedBy(e.target.value)}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={onCorrect}
              className="rounded border border-slate-300 px-3 py-1.5 text-sm"
            >
              Save corrections
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={onSummarize}
              className="rounded border border-slate-300 px-3 py-1.5 text-sm"
            >
              Generate summaries
            </button>
            <button
              type="button"
              disabled={busy || active.status !== "NEEDS_REVIEW"}
              onClick={onConfirm}
              className="rounded bg-slate-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
            >
              Confirm write-back
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={onReject}
              className="rounded border border-red-300 px-3 py-1.5 text-sm text-red-800"
            >
              Reject
            </button>
          </div>
          {summaries ? (
            <pre className="overflow-auto rounded bg-slate-50 p-3 text-xs">
              {summaries}
            </pre>
          ) : null}
          {active.writebackSummary ? (
            <pre className="overflow-auto rounded bg-slate-50 p-3 text-xs">
              {JSON.stringify(active.writebackSummary, null, 2)}
            </pre>
          ) : null}
        </section>
      ) : null}

      <section className="space-y-2 rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-900">
          Site-specific safety plan
        </h2>
        <p className="text-xs text-slate-500">
          Uses confirmed/review runs for this company (and the active run when
          selected). Regulations are taken only from ingested JSON.
        </p>
        <label className="block text-sm">
          Worksite description
          <textarea
            className="mt-1 w-full rounded border px-2 py-1.5 text-sm"
            rows={3}
            value={worksite}
            onChange={(e) => setWorksite(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          Planned activities
          <textarea
            className="mt-1 w-full rounded border px-2 py-1.5 text-sm"
            rows={3}
            value={activities}
            onChange={(e) => setActivities(e.target.value)}
          />
        </label>
        <button
          type="button"
          disabled={busy || !companyId}
          onClick={onSitePlan}
          className="rounded border border-slate-300 px-4 py-2 text-sm disabled:opacity-50"
        >
          Generate site plan (Markdown)
        </button>
        {sitePlan ? (
          <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded bg-slate-50 p-3 text-xs">
            {sitePlan}
          </pre>
        ) : null}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-900">Recent runs</h2>
        <ul className="mt-2 divide-y divide-slate-100 text-sm">
          {runs.length === 0 ? (
            <li className="py-3 text-slate-500">No runs yet.</li>
          ) : (
            runs.map((r) => (
              <li key={r.id} className="flex justify-between gap-2 py-2">
                <button
                  type="button"
                  className="text-left text-slate-800 underline"
                  onClick={() => setActive(r)}
                >
                  {r.sourceFileName || r.id.slice(0, 8)} · {r.status}
                </button>
                <span className="text-slate-500">
                  {new Date(r.createdAt).toLocaleString()}
                </span>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
