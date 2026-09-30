"use client";

import Link from "next/link";
import type { CoreDailyLogDto } from "@/src/api/core-daily-log";
import { Button } from "@/components/ui/button";
import { CoreAlert } from "@/src/components/core/CoreAlert";

export type CoreDailyLogTableProps = {
  items: CoreDailyLogDto[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onDelete?: (id: number) => void | Promise<void>;
  className?: string;
};

function formatLogDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function CoreDailyLogTable({
  items,
  loading = false,
  error = null,
  onRefresh,
  onDelete,
  className,
}: CoreDailyLogTableProps) {
  return (
    <div className={className}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-900">Daily logs</h2>
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
        <CoreAlert variant="info" className="mb-3" role="status">
          Loading daily logs…
        </CoreAlert>
      )}

      {!loading && !error && items.length === 0 && (
        <CoreAlert variant="info" role="status" className="mb-3">
          No daily logs match your filters.
        </CoreAlert>
      )}

      {items.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-700">
              <tr>
                <th className="px-3 py-2 font-medium">Title</th>
                <th className="px-3 py-2 font-medium">Shift</th>
                <th className="px-3 py-2 font-medium">Log date</th>
                <th className="px-3 py-2 font-medium">Site</th>
                <th className="px-3 py-2 font-medium">Company</th>
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
                    {(row.activities ?? row.body) && (
                      <div className="mt-0.5 line-clamp-2 text-xs text-slate-600">
                        {row.activities ?? row.body}
                      </div>
                    )}
                    {(row.safety_notes ?? row.safetyNotes) && (
                      <div className="mt-0.5 line-clamp-1 text-xs text-amber-800">
                        Safety: {row.safety_notes ?? row.safetyNotes}
                      </div>
                    )}
                    <div className="mt-1 font-mono text-[10px] text-slate-400">
                      log_id #{row.log_id ?? row.id}
                      {Array.isArray(row.attachments) &&
                      row.attachments.length > 0
                        ? ` · ${row.attachments.length} attachment(s)`
                        : ""}
                    </div>
                  </td>
                  <td className="px-3 py-2 align-top">
                    <span className="rounded bg-sky-50 px-2 py-0.5 text-xs text-sky-950">
                      {row.shift}
                    </span>
                    {row.supervisor || row.supervisorUserId != null ? (
                      <div className="mt-1 text-[10px] text-slate-500">
                        Sup:{" "}
                        {row.supervisor?.username ??
                          row.supervisor?.email ??
                          `#${row.supervisor?.id ?? row.supervisorUserId}`}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-3 py-2 align-top text-slate-700">
                    {formatLogDate(row.logDate)}
                  </td>
                  <td className="px-3 py-2 align-top text-slate-700">
                    {row.site?.name ??
                      (row.siteId != null ? `Site #${row.siteId}` : "—")}
                  </td>
                  <td className="px-3 py-2 align-top text-slate-700">
                    {row.company?.name ??
                      (row.companyId != null ? `#${row.companyId}` : "—")}
                  </td>
                  <td className="px-3 py-2 align-top text-right">
                    <Link
                      href={`/core/daily-logs/edit/${row.id}`}
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
      )}
    </div>
  );
}
