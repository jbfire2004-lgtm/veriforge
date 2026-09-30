"use client";

import { useState } from "react";
import { BrainCircuit } from "lucide-react";
import {
  analyzeIncidentIntelligenceEvent,
  type IncidentIntelligenceResult,
} from "@/lib/incident-intelligence-ai";
import { Button } from "@/components/ui/button";

const SIF_STYLES: Record<string, string> = {
  yes: "bg-red-100 text-red-900",
  no: "bg-emerald-100 text-emerald-900",
  unknown: "bg-amber-100 text-amber-900",
};

const RISK_STYLES: Record<string, string> = {
  low: "text-emerald-700",
  medium: "text-amber-700",
  high: "text-orange-700",
  critical: "text-red-700",
};

export function IncidentIntelligencePanel({ eventId }: { eventId: string }) {
  const [result, setResult] = useState<IncidentIntelligenceResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const out = await analyzeIncidentIntelligenceEvent(eventId);
      setResult(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4 rounded-lg border border-violet-100 bg-violet-50/40 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <BrainCircuit className="h-4 w-4 text-violet-900" />
        <span className="text-sm font-medium text-violet-950">Incident Intelligence</span>
        <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => void run()}>
          {busy ? "Analyzing…" : "Run incident intelligence"}
        </Button>
        {error ? <span className="text-xs text-red-600">{error}</span> : null}
      </div>

      {result ? (
        <div className="space-y-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-900">{result.incident_type}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${SIF_STYLES[result.sif_potential] ?? ""}`}
            >
              SIF {result.sif_potential}
            </span>
            <span className={`text-xs font-semibold capitalize ${RISK_STYLES[result.recurrence_risk] ?? ""}`}>
              Recurrence: {result.recurrence_risk}
            </span>
          </div>

          <p className="text-xs text-slate-600">{result.field_summary}</p>
          <p className="text-xs text-slate-500">{result.sif_reasoning}</p>

          {result.root_causes.length > 0 ? (
            <div>
              <p className="text-xs font-semibold text-slate-700">Root causes</p>
              <ul className="mt-1 list-disc pl-4 text-xs text-slate-600">
                {result.root_causes.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {result.recommended_actions.length > 0 ? (
            <div>
              <p className="text-xs font-semibold text-slate-700">Recommended actions</p>
              <ul className="mt-1 list-disc pl-4 text-xs text-slate-600">
                {result.recommended_actions.slice(0, 6).map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {result.training_gaps.length > 0 ? (
            <div>
              <p className="text-xs font-semibold text-violet-800">Linked training gaps</p>
              <ul className="mt-1 space-y-1 text-xs">
                {result.training_gaps.slice(0, 5).map((g) => (
                  <li key={`${g.training_code}-${g.worker_id ?? "n"}`} className="rounded border border-violet-100 bg-white px-2 py-1">
                    <span className="font-medium">{g.training_name}</span>
                    {g.worker_name ? <span className="text-slate-500"> · {g.worker_name}</span> : null}
                    <span className="text-slate-500"> — {g.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {result.similar_incidents_count > 0 ? (
            <p className="text-xs text-amber-800">
              {result.similar_incidents_count} similar incident(s) on this project in the past 12 months.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
