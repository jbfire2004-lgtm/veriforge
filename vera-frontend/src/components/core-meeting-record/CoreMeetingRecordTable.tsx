"use client";

import Link from "next/link";
import type { CoreMeetingRecordDto } from "@/src/api/core-meeting-record";
import { Button } from "@/components/ui/button";
import { CoreAlert } from "@/src/components/core/CoreAlert";

export type CoreMeetingRecordTableProps = {
  items: CoreMeetingRecordDto[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onDelete?: (id: number) => void | Promise<void>;
  className?: string;
};

function formatHeld(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function CoreMeetingRecordTable({
  items,
  loading = false,
  error = null,
  onRefresh,
  onDelete,
  className,
}: CoreMeetingRecordTableProps) {
  return (
    <div className={className}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-900">
          Meeting records
        </h2>
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
        <CoreAlert className="mb-3" role="alert">
          {error}
        </CoreAlert>
      )}

      {loading && items.length === 0 && !error && (
        <p className="mb-3 text-sm text-slate-600" aria-live="polite">
          Loading meeting records…
        </p>
      )}

      {!loading && !error && items.length === 0 && (
        <CoreAlert variant="info" role="status" className="mb-3">
          No meeting records match your filters.
        </CoreAlert>
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-700">
            <tr>
              <th className="px-3 py-2 font-medium">Title</th>
              <th className="px-3 py-2 font-medium">Type</th>
              <th className="px-3 py-2 font-medium">Held</th>
              <th className="px-3 py-2 font-medium">Site</th>
              <th className="px-3 py-2 w-[1%] font-medium" />
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr
                key={row.id}
                className="border-b border-slate-100 last:border-0"
              >
                <td className="px-3 py-2 align-top">
                  <div className="font-medium text-slate-900">{row.title}</div>
                  {row.body && (
                    <div className="mt-0.5 line-clamp-2 text-xs text-slate-600">
                      {row.body}
                    </div>
                  )}
                  <div className="mt-1 font-mono text-[10px] text-slate-400">
                    #{row.id}
                  </div>
                </td>
                <td className="px-3 py-2 align-top">
                  <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs text-indigo-950">
                    {row.meetingType.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-3 py-2 align-top text-slate-700">
                  {formatHeld(row.heldAt)}
                </td>
                <td className="px-3 py-2 align-top text-slate-700">
                  {row.site?.name ??
                    (row.siteId != null ? `Site #${row.siteId}` : "—")}
                </td>
                <td className="px-3 py-2 align-top text-right">
                  <Link
                    href={`/core/meeting-records/edit/${row.id}`}
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
                      disabled={loading}
                      onClick={() => void onDelete(row.id)}
                    >
                      Delete
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
