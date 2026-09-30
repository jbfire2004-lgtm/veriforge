"use client";

import type { ClearanceStatus } from "./types";

export function ClearanceVisualization({
  requiredClearanceM,
  availableClearanceM,
  status,
  loading,
}: {
  requiredClearanceM: number;
  availableClearanceM: number;
  status: ClearanceStatus;
  loading: boolean;
}) {
  const statusClass =
    status === "PASS"
      ? "vera-status vera-status--success"
      : status === "WARNING"
        ? "vera-status vera-status--warning"
        : "vera-status vera-status--danger";

  return (
    <div className="mb-4 rounded-[6px] border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="font-semibold text-[var(--foreground)]">
          Clearance Visualization
        </span>
        <span className={statusClass}>{status}</span>
      </div>
      {loading ? (
        <div className="text-sm text-[var(--muted-foreground)]">Calculating…</div>
      ) : (
        <div className="space-y-1 text-sm text-[var(--foreground)]">
          <p>
            Required clearance:{" "}
            <span className="tabular-nums font-medium">
              {requiredClearanceM.toFixed(2)} m
            </span>
          </p>
          <p>
            Available clearance:{" "}
            <span className="tabular-nums font-medium">
              {availableClearanceM.toFixed(2)} m
            </span>
          </p>
          {/* Hook in SVG/Canvas visualization later */}
        </div>
      )}
    </div>
  );
}
