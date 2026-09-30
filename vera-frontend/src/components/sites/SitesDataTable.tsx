"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type ColumnDef,
  type PaginationState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { SiteDto } from "@/src/api/sites";
import { fetchSites } from "@/src/api/sites";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/src/lib/utils";

const PAGE_SIZES = [10, 20, 50] as const;

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export interface SitesDataTableProps {
  pageSizeOptions?: readonly number[];
  /** Fired when a data row is clicked (not header). */
  onRowClick?: (site: SiteDto) => void;
  className?: string;
}

export function SitesDataTable({
  pageSizeOptions = PAGE_SIZES,
  onRowClick,
  className,
}: SitesDataTableProps) {
  const [data, setData] = useState<SiteDto[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [activeOnly, setActiveOnly] = useState(false);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSizeOptions[0] ?? 10,
  });

  const [sorting, setSorting] = useState<SortingState>([
    { id: "id", desc: false },
  ]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debouncedSearch, activeOnly]);

  const sortApi = sorting[0];
  const sortBy = sortApi?.id;
  const sortOrder: "asc" | "desc" | undefined = sortApi
    ? sortApi.desc
      ? "desc"
      : "asc"
    : undefined;

  const apiPage = pagination.pageIndex + 1;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchSites({
        page: apiPage,
        limit: pagination.pageSize,
        search: debouncedSearch || undefined,
        sortBy,
        sortOrder,
        activeOnly: activeOnly || undefined,
      });
      setData(res.data);
      setTotalPages(Math.max(1, res.totalPages));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [
    apiPage,
    pagination.pageSize,
    debouncedSearch,
    sortBy,
    sortOrder,
    activeOnly,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  const columns = useMemo<ColumnDef<SiteDto>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        enableSorting: true,
        size: 72,
      },
      {
        accessorKey: "name",
        header: "Name",
        enableSorting: true,
      },
      {
        accessorKey: "code",
        header: "Code",
        cell: ({ getValue }) => getValue<string | null>() ?? "—",
        enableSorting: true,
      },
      {
        accessorKey: "region",
        header: "Region",
        cell: ({ getValue }) => getValue<string | null>() ?? "—",
        enableSorting: true,
      },
      {
        accessorKey: "active",
        header: "Active",
        cell: ({ getValue }) => (getValue<boolean>() ? "Yes" : "No"),
        enableSorting: true,
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ getValue }) => formatDate(getValue<string>()),
        enableSorting: true,
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    pageCount: totalPages,
    state: {
      pagination,
      sorting,
    },
    onPaginationChange: setPagination,
    onSortingChange: (updater) => {
      setSorting(updater);
      setPagination((p) => ({ ...p, pageIndex: 0 }));
    },
    manualPagination: true,
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="min-w-[200px] flex-1 space-y-1.5">
          <Label htmlFor="sites-search">Search</Label>
          <Input
            id="sites-search"
            placeholder="Name, code, region…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="flex items-center gap-2 pb-0.5">
          <input
            id="sites-active-only"
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300"
            checked={activeOnly}
            onChange={(e) => setActiveOnly(e.target.checked)}
            disabled={loading}
          />
          <Label htmlFor="sites-active-only" className="font-normal">
            Active only
          </Label>
        </div>
      </div>

      {error && (
        <div
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      header.column.getCanSort() &&
                        "cursor-pointer select-none hover:bg-slate-100"
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <span className="inline-flex items-center gap-1">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getIsSorted() === "asc" && (
                        <span className="text-slate-400" aria-hidden>
                          ↑
                        </span>
                      )}
                      {header.column.getIsSorted() === "desc" && (
                        <span className="text-slate-400" aria-hidden>
                          ↓
                        </span>
                      )}
                    </span>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-slate-500"
                >
                  Loading…
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-slate-500"
                >
                  No sites match your filters.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  className={cn(
                    onRowClick && "cursor-pointer",
                    "hover:bg-slate-50"
                  )}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          Page {apiPage} of {totalPages}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <span>Rows</span>
            <select
              className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
              value={pagination.pageSize}
              onChange={(e) => {
                const n = Number(e.target.value);
                setPagination({ pageIndex: 0, pageSize: n });
              }}
              disabled={loading}
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading || apiPage <= 1}
            onClick={() => {
              table.previousPage();
            }}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading || apiPage >= totalPages}
            onClick={() => {
              table.nextPage();
            }}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
