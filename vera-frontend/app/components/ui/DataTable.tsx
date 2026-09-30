"use client";

import { useMemo, useState, type ReactNode } from "react";

export type DataTableColumn<TRow> = {
  /** Stable id for sorting and keys */
  id: string;
  header: ReactNode;
  /**
   * Return a primitive (or value with meaningful String()) for default cell text
   * and optional client-side sorting.
   */
  accessor?: (row: TRow) => string | number | boolean | null | undefined;
  /** Custom cell; falls back to `String(accessor(row) ?? "—")` */
  cell?: (row: TRow) => ReactNode;
  thClassName?: string;
  tdClassName?: string;
  sortable?: boolean;
};

export type DataTableProps<TRow> = {
  columns: DataTableColumn<TRow>[];
  data: TRow[];
  getRowId: (row: TRow) => string | number;
  loading?: boolean;
  emptyMessage?: string;
  /** Visually hidden caption for screen readers */
  caption?: string;
  className?: string;
  /** Outer wrapper: default adds horizontal scroll on small viewports */
  tableWrapperClassName?: string;
};

function compareForSort(
  a: string | number | boolean | null | undefined,
  b: string | number | boolean | null | undefined
): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "boolean" && typeof b === "boolean")
    return Number(a) - Number(b);
  return String(a).localeCompare(String(b), undefined, { numeric: true });
}

export default function DataTable<TRow>({
  columns,
  data,
  getRowId,
  loading = false,
  emptyMessage = "No rows to display.",
  caption,
  className = "",
  tableWrapperClassName = "overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm",
}: DataTableProps<TRow>) {
  const [sort, setSort] = useState<{
    columnId: string;
    direction: "asc" | "desc";
  } | null>(null);

  const sortableColumn = useMemo(
    () => columns.find((c) => c.id === sort?.columnId),
    [columns, sort]
  );

  const rows = useMemo(() => {
    if (!sort || !sortableColumn?.accessor) return data;
    const acc = sortableColumn.accessor;
    const dir = sort.direction === "asc" ? 1 : -1;
    return [...data].sort(
      (a, b) => dir * compareForSort(acc(a), acc(b))
    );
  }, [data, sort, sortableColumn]);

  function toggleSort(columnId: string) {
    const col = columns.find((c) => c.id === columnId);
    if (!col?.sortable || !col.accessor) return;
    setSort((prev) => {
      if (!prev || prev.columnId !== columnId) {
        return { columnId, direction: "asc" };
      }
      if (prev.direction === "asc") {
        return { columnId, direction: "desc" };
      }
      return null;
    });
  }

  return (
    <div className={tableWrapperClassName}>
      <table
        className={`min-w-full table-auto border-collapse text-left text-sm text-gray-900 ${className}`}
      >
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {columns.map((col) => {
              const active = sort?.columnId === col.id;
              const sortable = Boolean(col.sortable && col.accessor);
              return (
                <th
                  key={col.id}
                  scope="col"
                  className={`px-4 py-3 font-semibold text-gray-700 ${col.thClassName ?? ""}`}
                >
                  {sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(col.id)}
                      className="inline-flex w-full items-center justify-between gap-2 rounded text-left hover:text-gray-900 focus-visible:outline focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      <span>{col.header}</span>
                      <span
                        className="text-gray-400 tabular-nums"
                        aria-hidden
                      >
                        {active
                          ? sort?.direction === "asc"
                            ? "▲"
                            : "▼"
                          : "↕"}
                      </span>
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-gray-500"
              >
                Loading…
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={String(getRowId(row))}
                className="border-b border-gray-100 last:border-0 hover:bg-gray-50/80"
              >
                {columns.map((col) => (
                  <td
                    key={col.id}
                    className={`px-4 py-3 align-top text-gray-800 ${col.tdClassName ?? ""}`}
                  >
                    {col.cell
                      ? col.cell(row)
                      : String(col.accessor?.(row) ?? "—")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
