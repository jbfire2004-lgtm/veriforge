"use client";

import { useState } from "react";
import {
  generateTrainingCompetencyForWorker,
  type TrainingCompetencyEngineOutput,
} from "@/lib/pm-training";
import { SfButton, SfCard } from "@/src/components/safety-forms/ui";

export function TrainingCompetencyEnginePanel({
  workerId,
  projectId,
}: {
  workerId: number;
  projectId?: number;
}) {
  const [output, setOutput] = useState<TrainingCompetencyEngineOutput | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const out = await generateTrainingCompetencyForWorker(workerId, { projectId });
      setOutput(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Engine failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SfCard className="space-y-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-medium">Training & competency engine</h2>
        <SfButton type="button" variant="secondary" size="sm" disabled={busy} onClick={() => void run()}>
          {busy ? "Analyzing…" : "Run TRAINING_COMPETENCY_ENGINE"}
        </SfButton>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {output ? (
        <div className="space-y-4 text-sm">
          <div className="rounded-lg border border-[var(--sf-border)] bg-[var(--sf-surface-muted)] p-3">
            <p className="text-xs font-semibold uppercase text-[var(--sf-text-muted)]">Field summary</p>
            <p className="mt-1">{output.field_summary}</p>
          </div>

          {output.gaps.length > 0 ? (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase text-[var(--sf-text-muted)]">
                Gaps ({output.gaps.length})
              </p>
              <ul className="space-y-2">
                {output.gaps.slice(0, 6).map((g) => (
                  <li key={`${g.course}-${g.status}`} className="rounded border border-[var(--sf-border)] px-3 py-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{g.course}</span>
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs capitalize text-amber-900">
                        {g.status}
                      </span>
                      <span className="text-xs text-[var(--sf-text-muted)]">{g.priority_tier}</span>
                    </div>
                    <p className="mt-1 text-xs text-[var(--sf-text-muted)]">{g.remediation}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-[var(--sf-text-muted)]">No training gaps identified.</p>
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            {(
              [
                ["Immediate", output.prioritized_training_plan.immediate_required_training],
                ["Short term", output.prioritized_training_plan.short_term_training],
                ["Development", output.prioritized_training_plan.development_training],
              ] as const
            ).map(([label, items]) => (
              <div key={label}>
                <p className="mb-1 text-xs font-semibold uppercase text-[var(--sf-text-muted)]">{label}</p>
                {items.length ? (
                  <ul className="space-y-1 text-xs">
                    {items.slice(0, 4).map((p) => (
                      <li key={`${label}-${p.course}`}>{p.course}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-[var(--sf-text-muted)]">—</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </SfCard>
  );
}
