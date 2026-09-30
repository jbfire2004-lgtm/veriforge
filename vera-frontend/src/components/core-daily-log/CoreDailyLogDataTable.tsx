"use client";

/**
 * TanStack Table + ShadCN for VERA Core.
 *
 * Data type: CoreDailyLogDto
 * API: GET /api/v1/core-daily-logs (listCoreDailyLogs)
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type ColumnDef,
  type PaginationState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  type CoreDailyLogDto,
  type CoreDailyLogListSortField,
  type CoreDailyLogShift,
  listCoreDailyLogs,
} from "@/src/api/core-daily-log";
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
import { CoreAlert } from "@/src/components/core/CoreAlert";
import { cn } from "@/src/lib/utils";

const PAGE_SIZES = [10, 20, 50] as const;

const SHIFTS: CoreDailyLogShift[] = ["DAY", "NIGHT", "OTHER"];

const SORTABLE_IDS: CoreDailyLogListSortField[] = [
  "id",
  "title",
  "logDate",
  "shift",
  "createdAt",
  "updatedAt",
];

function isSortField(id: string): id is CoreDailyLogListSortField {
  return (SORTABLE_IDS as readonly string[]).includes(id);
}

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

function parseOptionalPositiveInt(raw: string): number | undefined {
  const t = raw.trim();
  if (!t) return undefined;
  const n = Number(t);
  if (!Number.isFinite(n) || n < 1) return undefined;
  return Math.floor(n);
}

export interface CoreDailyLogDataTableProps {
  pageSizeOptions?: readonly number[];
  onRowClick?: (row: CoreDailyLogDto) => void;
  className?: string;
}

export function CoreDailyLogDataTable({
  pageSizeOptions = PAGE_SIZES,
  onRowClick,
  className,
}: CoreDailyLogDataTableProps) {
  const [data, setData] = useState<CoreDailyLogDto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [companyInput, setCompanyInput] = useState("");
  const [siteInput, setSiteInput] = useState("");
  const [debouncedCompany, setDebouncedCompany] = useState("");
  const [debouncedSite, setDebouncedSite] = useState("");

  const [shift, setShift] = useState<"" | CoreDailyLogShift>("");

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSizeOptions[0] ?? 10,
  });

  const [sorting, setSorting] = useState<SortingState>([
    { id: "logDate", desc: true },
  ]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedCompany(companyInput.trim()), 300);
    return () => clearTimeout(t);
  }, [companyInput]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSite(siteInput.trim()), 300);
    return () => clearTimeout(t);
  }, [siteInput]);

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debouncedCompany, debouncedSite, shift]);

  const sortApi = sorting[0];
  const sortBy: CoreDailyLogListSortField =
    sortApi && isSortField(sortApi.id) ? sortApi.id : "logDate";
  const sortOrder: "asc" | "desc" = sortApi?.desc ? "desc" : "asc";

  const companyId = parseOptionalPositiveInt(debouncedCompany);
  const siteId = parseOptionalPositiveInt(debouncedSite);

  const skip = pagination.pageIndex * pagination.pageSize;
  const take = pagination.pageSize;
  const totalPages = Math.max(1, Math.ceil(total / take) || 1);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listCoreDailyLogs({
        companyId,
        siteId,
        shift: shift || undefined,
        skip,
        take,
        sortBy,
        sortOrder,
      });
      setData(res.items);
      setTotal(res.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [companyId, siteId, shift, skip, take, sortBy, sortOrder]);

  useEffect(() => {
    void load();
  }, [load]);

  const columns = useMemo<ColumnDef<CoreDailyLogDto>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        enableSorting: true,
        size: 72,
      },
      {
        accessorKey: "title",
        header: "Title",
        enableSorting: true,
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-slate-900">{row.original.title}</div>
            {row.original.body && (
              <div className="mt-0.5 line-clamp-2 text-xs text-slate-600">
                {row.original.body}
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: "shift",
        header: "Shift",
        enableSorting: true,
        cell: ({ getValue }) => (
          <span className="rounded bg-sky-50 px-2 py-0.5 text-xs text-sky-950">
            {getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "logDate",
        header: "Log date",
        enableSorting: true,
        cell: ({ getValue }) => formatDate(getValue<string>()),
      },
      {
        id: "site",
        header: "Site",
        enableSorting: false,
        cell: ({ row }) =>
          row.original.site?.name ??
          (row.original.siteId != null
            ? `Site #${row.original.siteId}`
            : "—"),
      },
      {
        id: "company",
        header: "Company",
        enableSorting: false,
        cell: ({ row }) =>
          row.original.company?.name ??
          (row.original.companyId != null
            ? `Company #${row.original.companyId}`
            : "—"),
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        enableSorting: true,
        cell: ({ getValue }) => formatDate(getValue<string>()),
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

  const apiPage = pagination.pageIndex + 1;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end">
        <div className="min-w-[140px] flex-1 space-y-1.5">
          <Label htmlFor="cdl-filter-company">Company ID</Label>
          <Input
            id="cdl-filter-company"
            inputMode="numeric"
            placeholder="Optional"
            value={companyInput}
            onChange={(e) => setCompanyInput(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="min-w-[140px] flex-1 space-y-1.5">
          <Label htmlFor="cdl-filter-site">Site ID</Label>
          <Input
            id="cdl-filter-site"
            inputMode="numeric"
            placeholder="Optional"
            value={siteInput}
            onChange={(e) => setSiteInput(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="min-w-[200px] space-y-1.5">
          <Label htmlFor="cdl-filter-shift">Shift</Label>
          <select
            id="cdl-filter-shift"
            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            value={shift}
            onChange={(e) =>
              setShift((e.target.value || "") as "" | CoreDailyLogShift)
            }
            disabled={loading}
          >
            <option value="">All shifts</option>
            {SHIFTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <CoreAlert role="alert">{error}</CoreAlert>}

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
                  No daily logs match your filters.
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
          {total > 0 ? (
            <span className="text-slate-500"> · {total} total</span>
          ) : null}
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
