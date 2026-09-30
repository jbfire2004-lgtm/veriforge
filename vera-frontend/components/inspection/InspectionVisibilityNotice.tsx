"use client";

import type { InspectionVisibilityNotice as Notice } from "@/lib/use-inspection-visibility-changes";

export function InspectionVisibilityNotice({ notice }: { notice: Notice }) {
  if (!notice.appeared.length && !notice.hidden.length) return null;

  return (
    <div
      className="space-y-1 rounded-lg border border-sky-200 bg-sky-50/80 px-3 py-2 text-sm text-sky-950"
      role="status"
      aria-live="polite"
      data-testid="inspection-visibility-notice"
    >
      {notice.appeared.length ? (
        <p>
          <span className="font-medium">Shown:</span>{" "}
          {notice.appeared.map((item) => item.label).join(", ")}
        </p>
      ) : null}
      {notice.hidden.length ? (
        <p>
          <span className="font-medium">Hidden:</span>{" "}
          {notice.hidden.map((item) => item.label).join(", ")}
          <span className="text-xs text-sky-800">
            {" "}
            (answers cleared — not submitted or scored)
          </span>
        </p>
      ) : null}
    </div>
  );
}
