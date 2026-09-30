"use client";

import Link from "next/link";
import {
  formatSafetyKnowledgeEvaluatedAt,
  SafetyKnowledgeStatusBadge,
} from "@/components/safety-knowledge/SafetyKnowledgeResultSummary";
import type { CoreWorkerReadiness } from "@/lib/core/vera-core-platform";

export function WorkerSafetyKnowledgeSummaryCard({
  workerId,
  summary,
}: {
  workerId: number;
  summary: CoreWorkerReadiness["safetyKnowledge"];
}) {
  if (!summary) {
    return (
      <section
        className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4"
        data-testid="worker-ske-summary-empty"
      >
        <h2 className="font-semibold text-slate-900">Safety Knowledge (SKE)</h2>
        <p className="mt-1 text-sm text-slate-600">
          No SKE evaluation on file for this worker.
        </p>
        <Link
          href={`/core/safety-knowledge?workerId=${workerId}`}
          className="mt-3 inline-block text-sm font-medium text-teal-700 hover:underline"
        >
          Run evaluation in Core →
        </Link>
      </section>
    );
  }

  const when = formatSafetyKnowledgeEvaluatedAt(summary.evaluatedAt);

  return (
    <section
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      data-testid="worker-ske-summary"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-900">Safety Knowledge (SKE)</h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <SafetyKnowledgeStatusBadge status={summary.overallStatus} />
            <span className="text-lg font-semibold text-slate-900">
              {summary.overallScore}/100
            </span>
            {when ? (
              <span className="text-xs text-slate-500">Evaluated {when}</span>
            ) : null}
          </div>
        </div>
        <Link
          href={`/core/safety-knowledge?workerId=${workerId}`}
          className="text-sm font-medium text-teal-700 hover:underline"
        >
          Open SKE
        </Link>
      </div>
    </section>
  );
}
