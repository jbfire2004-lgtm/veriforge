"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";

type Transition = {
  to: string;
  label: string;
  suggestsInvestigation?: boolean;
};

export default function IncidentWorkflowPage() {
  const params = useParams();
  const id = Number(params?.id);
  const [incident, setIncident] = useState<any>(null);
  const [workflow, setWorkflow] = useState<any>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [investigateNext, setInvestigateNext] = useState(false);
  const [investigatorId, setInvestigatorId] = useState("");

  const load = useCallback(async () => {
    if (!Number.isFinite(id)) return;
    setError("");
    try {
      const [inc, wf] = await Promise.all([
        apiGet(`/incidents/${id}`),
        apiGet(`/safety-workflow/incidents/${id}`),
      ]);
      setIncident(inc);
      setWorkflow(wf);
    } catch (e: any) {
      setError(String(e?.message || e));
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function advance(to: string) {
    setBusy(true);
    setError("");
    try {
      await apiPost(`/safety-workflow/incidents/${id}/advance`, {
        status: to,
        startInvestigation:
          investigateNext && to === "ACTION_REQUIRED"
            ? true
            : undefined,
        investigatorId: investigatorId
          ? parseInt(investigatorId, 10)
          : undefined,
      });
      setInvestigateNext(false);
      await load();
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }

  if (!Number.isFinite(id)) {
    return <p className="p-6 text-red-600">Invalid incident id.</p>;
  }

  const transitions: Transition[] = workflow?.availableTransitions ?? [];
  const phase = workflow?.phase ?? "—";
  const status = workflow?.incidentStatus ?? incident?.status;

  return (
    <main className="p-6 space-y-6 max-w-xl mx-auto pb-24">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/supervisor/incidents/list"
            className="text-sm text-blue-600 hover:underline"
          >
            ← All incidents
          </Link>
          <h1 className="text-2xl font-bold mt-2 text-slate-900">
            {incident?.title || "Incident"}
          </h1>
          {incident?.category && (
            <p className="text-sm text-slate-500 mt-1">{incident.category}</p>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm p-3">
          {error}
        </div>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 shadow-sm">
        <h2 className="font-semibold text-slate-800">Workflow</h2>
        <p className="text-sm">
          <span className="text-slate-500">Phase:</span>{" "}
          <span className="font-medium">{phase}</span>
        </p>
        <p className="text-sm">
          <span className="text-slate-500">Status:</span>{" "}
          <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">
            {status}
          </span>
        </p>
        {workflow?.openInvestigationCount > 0 && (
          <p className="text-sm text-amber-800">
            Open investigations: {workflow.openInvestigationCount}
          </p>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-sm">
        <h2 className="font-semibold text-slate-800">Next step</h2>
        <p className="text-xs text-slate-500">
          Transitions are validated on the server. Optional investigation opens
          when moving into corrective action.
        </p>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={investigateNext}
            onChange={(e) => setInvestigateNext(e.target.checked)}
          />
          Start formal investigation when entering corrective action
        </label>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-500">Investigator user id (optional)</label>
          <input
            type="number"
            className="border rounded px-3 py-2 text-sm"
            placeholder="e.g. 1"
            value={investigatorId}
            onChange={(e) => setInvestigatorId(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2 pt-2">
          {transitions.length === 0 && (
            <p className="text-sm text-slate-500">No transitions (may be closed).</p>
          )}
          {transitions.map((t) => (
            <button
              key={t.to}
              type="button"
              disabled={busy}
              onClick={() => advance(t.to)}
              className="w-full text-left rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
            >
              {t.label}
              <span className="block text-xs font-normal text-slate-500 mt-0.5">
                → {t.to}
                {t.suggestsInvestigation ? " (investigation recommended)" : ""}
              </span>
            </button>
          ))}
        </div>
      </section>

      {incident && (
        <section className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm space-y-2">
          <h2 className="font-semibold text-slate-800">Details</h2>
          <p>
            <span className="text-slate-500">Severity:</span> {incident.severity}
          </p>
          {incident.description && (
            <p className="whitespace-pre-wrap">{incident.description}</p>
          )}
          {incident.latitude != null && incident.longitude != null && (
            <p className="text-xs text-slate-500">
              Location: {incident.latitude.toFixed(5)}, {incident.longitude.toFixed(5)}
            </p>
          )}
        </section>
      )}
    </main>
  );
}
