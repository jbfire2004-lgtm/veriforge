"use client";

import Link from "next/link";
import type { CoreSiteRiskDto } from "@/src/api/core-site-risk";
import { Button } from "@/components/ui/button";

export type CoreSiteRiskTableProps = {
  items: CoreSiteRiskDto[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onDelete?: (id: number) => void | Promise<void>;
  className?: string;
};

function formatWhen(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function CoreSiteRiskTable({
  items,
  loading,
  error,
  onRefresh,
  onDelete,
  className,
}: CoreSiteRiskTableProps) {
  return (
    <div className={className}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-900">Site risks</h2>
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
              <th className="px-3 py-2 font-medium">Category</th>
              <th className="px-3 py-2 font-medium">Severity</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Identified</th>
              <th className="px-3 py-2 font-medium">Site</th>
              <th className="w-[1%] px-3 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {loading && items.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-slate-500" colSpan={7}>
                  Loading…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-slate-500" colSpan={7}>
                  No site risks match your filters.
                </td>
              </tr>
            ) : (
              items.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="px-3 py-2 align-top">
                    <div className="font-medium text-slate-900">{row.title}</div>
                    {row.description && (
                      <div className="mt-0.5 line-clamp-2 text-xs text-slate-600">
                        {row.description}
                      </div>
                    )}
                    <div className="mt-1 font-mono text-[10px] text-slate-400">
                      #{row.id}
                    </div>
                  </td>
                  <td className="px-3 py-2 align-top">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs">
                      {row.category.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-3 py-2 align-top">{row.severity}</td>
                  <td className="px-3 py-2 align-top">
                    {row.status.replace(/_/g, " ")}
                  </td>
                  <td className="px-3 py-2 align-top text-slate-700">
                    {formatWhen(row.identifiedAt)}
                  </td>
                  <td className="px-3 py-2 align-top text-slate-700">
                    {row.site?.name ??
                      (row.siteId != null ? `Site #${row.siteId}` : "—")}
                  </td>
                  <td className="px-3 py-2 align-top text-right">
                    <Link
                      href={`/core/site-risks/edit/${row.id}`}
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
