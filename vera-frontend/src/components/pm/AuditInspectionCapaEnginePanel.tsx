"use client";

import { useState } from "react";
import {
  generateAuditInspectionCapaForInspection,
  type AuditInspectionCapaEngineOutput,
} from "@/lib/pm-inspections";
import { SfButton, SfCard } from "@/src/components/safety-forms/ui";

export function AuditInspectionCapaEnginePanel({ inspectionId }: { inspectionId: string }) {
  const [output, setOutput] = useState<AuditInspectionCapaEngineOutput | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const out = await generateAuditInspectionCapaForInspection(inspectionId);
      setOutput(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Engine failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SfCard className="space-y-4 p-5 print:hidden">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-medium">Audit CAPA engine</h2>
        <SfButton type="button" variant="secondary" size="sm" disabled={busy} onClick={() => void run()}>
          {busy ? "Analyzing…" : "Run AUDIT_INSPECTION_CAPA_ENGINE"}
        </SfButton>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {output ? (
        <div className="space-y-4 text-sm">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase text-[var(--sf-text-muted)]">Executive summary</p>
            <ul className="list-disc space-y-1 pl-5">
              {output.executive_summary.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold uppercase text-[var(--sf-text-muted)]">Toolbox brief</p>
            <ul className="list-disc space-y-1 pl-5">
              {output.field_brief.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>

          {output.trends.length > 0 ? (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-[var(--sf-text-muted)]">Trends</p>
              <ul className="space-y-1 text-xs text-[var(--sf-text-muted)]">
                {output.trends.map((t) => (
                  <li key={t.issue}>
                    {t.issue} — {t.recurrence_count}x · {t.note}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {output.findings.length > 0 ? (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-[var(--sf-text-muted)]">
                Findings ({output.findings.length})
              </p>
              <ul className="space-y-2">
                {output.findings.slice(0, 5).map((f) => (
                  <li key={f.item_id} className="rounded border border-[var(--sf-border)] px-3 py-2">
                    <div className="flex flex-wrap gap-2">
                      <span className="font-medium capitalize">{f.risk_rating.level}</span>
                      {f.sif_relevance === "yes" ? (
                        <span className="rounded bg-red-100 px-1.5 text-xs text-red-800">SIF</span>
                      ) : null}
                    </div>
                    <p className="mt-1">{f.description}</p>
                    <p className="text-xs text-[var(--sf-text-muted)]">{f.related_standard}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {output.capa_list.length > 0 ? (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-[var(--sf-text-muted)]">CAPA</p>
              <ul className="space-y-2 text-xs">
                {output.capa_list.slice(0, 5).map((c) => (
                  <li key={c.finding_ref} className="rounded border border-[var(--sf-border)] px-3 py-2">
                    <span className="font-medium">{c.corrective_action}</span>
                    <p className="text-[var(--sf-text-muted)]">
                      {c.responsible_role} · {c.due_date_priority} priority
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </SfCard>
  );
}
