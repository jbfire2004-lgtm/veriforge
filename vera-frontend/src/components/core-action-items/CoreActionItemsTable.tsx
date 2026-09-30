"use client";

import Link from "next/link";
import type { CoreActionItemDto } from "@/src/api/core-action-items";
import { Button } from "@/components/ui/button";

export type CoreActionItemsTableProps = {
  items: CoreActionItemDto[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onDelete?: (id: string) => void | Promise<void>;
  className?: string;
};

function formatDue(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

/** Mirrors backend `CoreActionItemVerification.isOverdueOpen` for list rows (API omits `verification` on list). */
function isOverdueOpen(row: CoreActionItemDto): boolean {
  if (row.status !== "OPEN" || !row.dueAt) return false;
  const due = new Date(row.dueAt).getTime();
  return !Number.isNaN(due) && due < Date.now();
}

export function CoreActionItemsTable({
  items,
  loading,
  error,
  onRefresh,
  onDelete,
  className,
}: CoreActionItemsTableProps) {
  return (
    <div className={className}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-900">Action items</h2>
        {onRefresh && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() => void onRefresh()}
          >
            {loading ? "Loading…" : "Refresh"}
          </Button>
        )}
      </div>

      {error && (
        <p className="mb-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-700">
            <tr>
              <th className="px-3 py-2 font-medium">Title</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Priority</th>
              <th className="px-3 py-2 font-medium">Due</th>
              <th className="px-3 py-2 font-medium">Meeting</th>
              <th className="px-3 py-2 font-medium">Daily log</th>
              <th className="px-3 py-2 font-medium">Company</th>
              <th className="px-3 py-2 w-[1%] font-medium" />
            </tr>
          </thead>
          <tbody>
            {loading && items.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-slate-500" colSpan={8}>
                  Loading…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-slate-500" colSpan={8}>
                  No action items.
                </td>
              </tr>
            ) : (
              items.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="px-3 py-2 align-top">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-slate-900">
                        {row.title}
                      </span>
                      {(row.verification?.overdueWarning || isOverdueOpen(row)) && (
                        <span
                          className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-950"
                          title="Open item past due date"
                        >
                          Overdue
                        </span>
                      )}
                    </div>
                    {row.description && (
                      <div className="mt-0.5 line-clamp-2 text-xs text-slate-600">
                        {row.description}
                      </div>
                    )}
                    <div className="mt-1 font-mono text-[10px] text-slate-400">
                      {row.id}
                    </div>
                  </td>
                  <td className="px-3 py-2 align-top">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs">
                      {row.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 align-top">{row.priority}</td>
                  <td className="px-3 py-2 align-top text-slate-700">
                    {formatDue(row.dueAt)}
                  </td>
                  <td className="px-3 py-2 align-top text-slate-700">
                    {row.coreMeetingRecord?.title ??
                      (row.coreMeetingRecordId != null
                        ? `Record #${row.coreMeetingRecordId}`
                        : "—")}
                  </td>
                  <td className="px-3 py-2 align-top text-slate-700">
                    {row.coreDailyLog?.title ??
                      (row.coreDailyLogId != null
                        ? `Log #${row.coreDailyLogId}`
                        : "—")}
                  </td>
                  <td className="px-3 py-2 align-top text-slate-700">
                    {row.company?.name ??
                      (row.companyId != null ? `#${row.companyId}` : "—")}
                  </td>
                  <td className="px-3 py-2 align-top text-right">
                    <Link
                      href={`/core/action-items/edit/${encodeURIComponent(row.id)}`}
                      className="mr-2 inline-flex h-8 items-center rounded-md px-2 text-xs text-slate-700 hover:bg-slate-100"
                    >
                      Edit
                    </Link>
                    {onDelete && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-700 hover:text-red-800"
                        onClick={() => void onDelete(row.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
