"use client";

/**
 * TanStack Table + ShadCN example for VERA Core.
 *
 * Data type: CoreMeetingRecordDto
 * API: GET /api/v1/core-meeting-records (listCoreMeetingRecords)
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
  type CoreMeetingRecordDto,
  type CoreMeetingRecordListSortField,
  type CoreMeetingRecordType,
  listCoreMeetingRecords,
} from "@/src/api/core-meeting-record";
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

const MEETING_TYPES: CoreMeetingRecordType[] = [
  "TEAM_SAFETY",
  "TOOLBOX",
  "MANAGEMENT_REVIEW",
  "OTHER",
];

const SORTABLE_IDS: CoreMeetingRecordListSortField[] = [
  "id",
  "title",
  "heldAt",
  "meetingType",
  "createdAt",
];

function isSortField(id: string): id is CoreMeetingRecordListSortField {
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

export interface CoreMeetingRecordDataTableProps {
  pageSizeOptions?: readonly number[];
  onRowClick?: (row: CoreMeetingRecordDto) => void;
  className?: string;
}

export function CoreMeetingRecordDataTable({
  pageSizeOptions = PAGE_SIZES,
  onRowClick,
  className,
}: CoreMeetingRecordDataTableProps) {
  const [data, setData] = useState<CoreMeetingRecordDto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [companyInput, setCompanyInput] = useState("");
  const [siteInput, setSiteInput] = useState("");
  const [debouncedCompany, setDebouncedCompany] = useState("");
  const [debouncedSite, setDebouncedSite] = useState("");

  const [meetingType, setMeetingType] = useState<"" | CoreMeetingRecordType>(
    ""
  );

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSizeOptions[0] ?? 10,
  });

  const [sorting, setSorting] = useState<SortingState>([
    { id: "heldAt", desc: true },
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
  }, [debouncedCompany, debouncedSite, meetingType]);

  const sortApi = sorting[0];
  const sortBy: CoreMeetingRecordListSortField | undefined =
    sortApi && isSortField(sortApi.id) ? sortApi.id : "heldAt";
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
      const res = await listCoreMeetingRecords({
        companyId,
        siteId,
        meetingType: meetingType || undefined,
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
  }, [
    companyId,
    siteId,
    meetingType,
    skip,
    take,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  const columns = useMemo<ColumnDef<CoreMeetingRecordDto>[]>(
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
        accessorKey: "meetingType",
        header: "Type",
        enableSorting: true,
        cell: ({ getValue }) => (
          <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs text-indigo-950">
            {String(getValue<string>()).replace(/_/g, " ")}
          </span>
        ),
      },
      {
        accessorKey: "heldAt",
        header: "Held",
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
          <Label htmlFor="cmr-filter-company">Company ID</Label>
          <Input
            id="cmr-filter-company"
            inputMode="numeric"
            placeholder="Optional"
            value={companyInput}
            onChange={(e) => setCompanyInput(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="min-w-[140px] flex-1 space-y-1.5">
          <Label htmlFor="cmr-filter-site">Site ID</Label>
          <Input
            id="cmr-filter-site"
            inputMode="numeric"
            placeholder="Optional"
            value={siteInput}
            onChange={(e) => setSiteInput(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="min-w-[200px] space-y-1.5">
          <Label htmlFor="cmr-filter-type">Meeting type</Label>
          <select
            id="cmr-filter-type"
            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            value={meetingType}
            onChange={(e) =>
              setMeetingType(
                (e.target.value || "") as "" | CoreMeetingRecordType
              )
            }
            disabled={loading}
          >
            <option value="">All types</option>
            {MEETING_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.replace(/_/g, " ")}
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
                  No meeting records match your filters.
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
