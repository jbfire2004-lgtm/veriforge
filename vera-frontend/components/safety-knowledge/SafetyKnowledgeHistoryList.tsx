"use client";

import {
  formatSafetyKnowledgeEvaluatedAt,
  SafetyKnowledgeStatusBadge,
} from "@/components/safety-knowledge/SafetyKnowledgeResultSummary";
import type { SafetyKnowledgeHistoryEntry } from "@/lib/safety-knowledge";

export function SafetyKnowledgeHistoryList({
  entries,
  onSelect,
  selectedId,
}: {
  entries: SafetyKnowledgeHistoryEntry[];
  onSelect?: (entry: SafetyKnowledgeHistoryEntry) => void;
  selectedId?: string | null;
}) {
  if (!entries.length) {
    return (
      <p className="text-sm text-[var(--sf-text-muted)]" data-testid="ske-history-empty">
        No prior evaluations.
      </p>
    );
  }

  return (
    <ul className="divide-y rounded-lg border text-sm" data-testid="ske-history-list">
      {entries.map((entry) => {
        const when = formatSafetyKnowledgeEvaluatedAt(entry.evaluatedAt);
        const selected = selectedId === entry.id;
        return (
          <li key={entry.id}>
            <button
              type="button"
              className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-slate-50 ${
                selected ? "bg-sky-50" : ""
              }`}
              onClick={() => onSelect?.(entry)}
              data-testid={`ske-history-${entry.id}`}
            >
              <span className="flex flex-wrap items-center gap-2">
                <SafetyKnowledgeStatusBadge status={entry.overallStatus} />
                <span className="font-medium">{entry.overallScore}/100</span>
              </span>
              <span className="text-xs text-[var(--sf-text-muted)]">{when}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
