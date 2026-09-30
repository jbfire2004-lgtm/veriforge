"use client";

import { SfCard } from "@/src/components/safety-forms/ui";
import type { VeraOrchestratorAnalysis } from "@/lib/sif-heca";

export function VeraOrchestratorPanel({
  data,
  title = "VERA analysis",
}: {
  data: VeraOrchestratorAnalysis;
  title?: string;
}) {
  return (
    <SfCard className="space-y-3 p-5">
      <h2 className="font-medium">
        {title} — {data.moduleType}
      </h2>
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase text-[var(--sf-text-muted)]">Facts</p>
          <ul className="list-disc space-y-1 pl-4 text-sm">
            {data.facts.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold uppercase text-[var(--sf-text-muted)]">Analysis</p>
          <ul className="list-disc space-y-1 pl-4 text-sm">
            {data.analysis.map((line) => (
              <li
                key={line}
                className={
                  line.includes("SIF POTENTIAL") || line.includes("HIGH ENERGY")
                    ? "font-medium text-red-700"
                    : undefined
                }
              >
                {line}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold uppercase text-[var(--sf-text-muted)]">Actions</p>
          <ul className="list-disc space-y-1 pl-4 text-sm">
            {data.actions.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </div>
    </SfCard>
  );
}
