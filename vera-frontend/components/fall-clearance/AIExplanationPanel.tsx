"use client";

import type { ClearanceStatus, StandardBasisRef } from "./types";

export function AIExplanationPanel({
  aiExplanation,
  standardBasis,
}: {
  status: ClearanceStatus;
  aiExplanation: string;
  standardBasis: StandardBasisRef[];
}) {
  return (
    <div className="mb-4 rounded-[6px] border border-[var(--border)] bg-[var(--surface)] p-4">
      <h3 className="mb-2 font-semibold text-[var(--foreground)]">Explanation</h3>
      <p className="mb-2 text-sm text-[var(--foreground)]">
        {aiExplanation || "Awaiting AI explanation."}
      </p>
      <details className="text-xs text-[var(--foreground)]">
        <summary className="cursor-pointer">Standards & manufacturer basis</summary>
        <ul className="ml-4 mt-1 list-disc">
          {standardBasis.map((b) => (
            <li key={b.ref}>
              <span className="font-semibold">{b.ref}</span>: {b.description}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
