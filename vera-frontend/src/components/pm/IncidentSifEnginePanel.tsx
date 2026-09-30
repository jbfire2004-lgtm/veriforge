"use client";

import { useState } from "react";
import {
  generateIncidentSifEngineForEvent,
  type IncidentSifEngineOutput,
} from "@/lib/pm-incidents";
import { WorkspaceSection } from "@/components/theme/workspace";
import { Button } from "@/components/ui/button";

export function IncidentSifEnginePanel({ eventId }: { eventId: string }) {
  const [output, setOutput] = useState<IncidentSifEngineOutput | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const out = await generateIncidentSifEngineForEvent(eventId);
      setOutput(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Engine failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" size="sm" disabled={busy} onClick={() => void run()}>
          {busy ? "Analyzing…" : "Run INCIDENT_SIF_ENGINE"}
        </Button>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>

      {output ? (
        <div className="space-y-6">
          <WorkspaceSection title="Classification">
            <p className="mb-2 text-sm text-[#5a6b7c]">{output.classification.narrative}</p>
            <p className="text-sm">
              <span className="font-medium">SIF potential:</span>{" "}
              <span className="uppercase">{output.classification.sif_potential}</span> —{" "}
              {output.classification.sif_reasoning}
            </p>
            <p className="mt-1 text-sm text-[#64748b]">
              {output.classification.severity_assessment}
              {output.classification.requires_regulatory_attention
                ? " · Regulatory review may be required"
                : ""}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {Object.entries(output.classification.impact)
                .filter(([, v]) => v)
                .map(([k]) => (
                  <span
                    key={k}
                    className="rounded-full bg-[#E4F3F2] px-2 py-0.5 text-xs capitalize text-[#2F8F8C]"
                  >
                    {k}
                  </span>
                ))}
            </div>
          </WorkspaceSection>

          <WorkspaceSection title="Root cause analysis" description={output.root_cause_analysis.method}>
            <ul className="mb-4 list-disc space-y-1 pl-5 text-sm">
              {output.root_cause_analysis.five_whys.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
            <div className="grid gap-4 sm:grid-cols-3">
              {(
                [
                  ["Immediate", output.root_cause_analysis.immediate_causes],
                  ["Underlying", output.root_cause_analysis.underlying_causes],
                  ["System", output.root_cause_analysis.system_causes],
                ] as const
              ).map(([label, items]) => (
                <div key={label}>
                  <p className="mb-1 text-xs font-semibold uppercase text-[#64748b]">{label}</p>
                  <ul className="space-y-1 text-sm">
                    {items.map((c) => (
                      <li key={`${label}-${c.description}`} className="rounded border border-[#2A2E33]/10 px-2 py-1">
                        <span className="text-xs text-[#2F8F8C]">{c.category}</span> — {c.description}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </WorkspaceSection>

          <WorkspaceSection title="CAPA" description={`${output.capa_list.length} proposed actions`}>
            <ul className="divide-y divide-[#2A2E33]/10">
              {output.capa_list.map((c) => (
                <li key={`${c.type}-${c.action}`} className="py-3 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-[#2A2E33] px-2 py-0.5 text-xs uppercase text-white">
                      {c.type}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 text-xs capitalize ${
                        c.priority === "high"
                          ? "bg-red-100 text-red-800"
                          : c.priority === "medium"
                            ? "bg-amber-100 text-amber-900"
                            : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {c.priority}
                    </span>
                    <span className="text-xs text-[#64748b]">{c.owner_role}</span>
                  </div>
                  <p className="mt-1 font-medium">{c.action}</p>
                  <p className="text-xs text-[#64748b]">{c.effectiveness_expectation}</p>
                </li>
              ))}
            </ul>
          </WorkspaceSection>

          <WorkspaceSection title="Learning summary">
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {output.learning_summary.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </WorkspaceSection>

          <WorkspaceSection title="Client report summary">
            <p className="text-sm text-[#5a6b7c]">{output.client_report_summary}</p>
          </WorkspaceSection>
        </div>
      ) : null}
    </div>
  );
}
