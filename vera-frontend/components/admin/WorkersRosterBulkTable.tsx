"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { CheckCircle2, Eye, Loader2, Plus, Printer, Search, ShieldOff, Trash2, Users } from "lucide-react";
import { apiPost } from "@/lib/api";
import { unknownToErrorMessage } from "@/lib/core";
import {
  Badge,
  Button,
  buttonStyles,
  EmptyState,
  Input,
  Label,
  Pagination,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";

export type WorkersRosterRow = {
  id: number;
  firstName: string;
  lastName: string;
  companyId: number | null;
  companyName: string | null;
  hasValidTraining: boolean;
  hasUnsafeEquipment: boolean;
};

export type WorkersRosterBulkTableProps = {
  companies: { id: number; name: string }[];
  rows: WorkersRosterRow[];
  page: number;
  totalPages: number;
  /** `pageHrefs[i]` = href for 1-based page `i + 1`. */
  pageHrefs: string[];
  emptyState: "none" | "no-workers" | "no-matches";
};

export function WorkersRosterBulkTable({
  companies,
  rows,
  page,
  totalPages,
  pageHrefs,
  emptyState,
}: WorkersRosterBulkTableProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<number>>(() => new Set());
  const [companyId, setCompanyId] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rowIds = useMemo(() => rows.map((r) => r.id), [rows]);

  const toggle = useCallback((id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAllOnPage = useCallback(() => {
    setSelected(new Set(rowIds));
  }, [rowIds]);

  const clearSelection = useCallback(() => {
    setSelected(new Set());
  }, []);

  const allOnPageSelected =
    rowIds.length > 0 && rowIds.every((id) => selected.has(id));
  const someSelected = selected.size > 0;

  async function runAssign(unassign: boolean) {
    setError(null);
    const ids = Array.from(selected);
    if (ids.length === 0) {
      setError("Select at least one worker.");
      return;
    }
    if (!unassign) {
      const cid = Number(companyId);
      if (!Number.isFinite(cid) || cid < 1) {
        setError("Choose a company to assign.");
        return;
      }
    }
    setPending(true);
    try {
      await apiPost("/workers/assign-company", {
        workerIds: ids,
        ...(unassign ? { unassign: true } : { companyId: Number(companyId) }),
      });
      setSelected(new Set());
      setCompanyId("");
      router.refresh();
    } catch (e) {
      setError(unknownToErrorMessage(e, "Could not update workers."));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-vera-4">
      {error ? (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-vera-4 py-vera-3 text-sm font-medium text-red-700"
        >
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-vera-4 rounded-xl border border-vera-charcoal/10 bg-vera-surface/40 p-vera-4 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="space-y-vera-2">
          <Label htmlFor="bulk-company">Assign selected to company</Label>
          <Select
            id="bulk-company"
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            disabled={pending}
            className="min-w-[12rem]"
          >
            <option value="">Select company…</option>
            {companies.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-wrap gap-vera-2">
          <Button type="button" variant="teal" disabled={pending || !someSelected} onClick={() => void runAssign(false)}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            Assign to company
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={pending || !someSelected}
            onClick={() => void runAssign(true)}
          >
            Remove from company
          </Button>
          <Button type="button" variant="ghost" size="sm" disabled={pending || rowIds.length === 0} onClick={selectAllOnPage}>
            Select page
          </Button>
          <Button type="button" variant="ghost" size="sm" disabled={pending || !someSelected} onClick={clearSelection}>
            Clear selection
          </Button>
        </div>
        <p className="w-full text-xs text-vera-muted">
          {someSelected ? (
            <>
              <strong>{selected.size}</strong> selected.
            </>
          ) : (
            <>Use the row checkboxes or &quot;Select page&quot;, then pick a company and assign.</>
          )}
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <span className="sr-only">Select</span>
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-vera-charcoal/30"
                checked={allOnPageSelected && rowIds.length > 0}
                disabled={pending || rowIds.length === 0}
                onChange={() => {
                  if (allOnPageSelected) clearSelection();
                  else selectAllOnPage();
                }}
                aria-label="Select all on this page"
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((worker) => (
            <TableRow key={worker.id}>
              <TableCell className="align-middle">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-vera-charcoal/30"
                  checked={selected.has(worker.id)}
                  disabled={pending}
                  onChange={() => toggle(worker.id)}
                  aria-label={`Select ${worker.firstName} ${worker.lastName}`}
                />
              </TableCell>
              <TableCell>
                <Link
                  href={`/admin/workers/${worker.id}`}
                  className="font-semibold text-vera-deep underline-offset-4 hover:text-vera-teal hover:underline"
                >
                  {worker.firstName} {worker.lastName}
                </Link>
              </TableCell>
              <TableCell className="text-vera-muted">
                {worker.companyName ? (
                  worker.companyName
                ) : (
                  <span className="italic">Unassigned pool</span>
                )}
              </TableCell>
              <TableCell className="tabular-nums text-vera-muted">{worker.id}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-vera-2">
                  <Badge
                    variant={worker.hasValidTraining ? "success" : "danger"}
                    icon={worker.hasValidTraining ? CheckCircle2 : ShieldOff}
                    className="font-medium"
                  >
                    {worker.hasValidTraining ? "Training OK" : "Training expired"}
                  </Badge>
                  <Badge
                    variant={worker.hasUnsafeEquipment ? "danger" : "success"}
                    icon={worker.hasUnsafeEquipment ? ShieldOff : CheckCircle2}
                    className="font-medium"
                  >
                    {worker.hasUnsafeEquipment ? "Unsafe equipment" : "Equipment OK"}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex flex-wrap justify-end gap-vera-2">
                  <Link href={`/admin/workers/${worker.id}`} className={buttonStyles({ variant: "ghost", size: "sm" })}>
                    <Eye className="h-3.5 w-3.5" aria-hidden />
                    View
                  </Link>
                  <Link href={`/admin/workers/${worker.id}/print`} className={buttonStyles({ variant: "outline", size: "sm" })}>
                    <Printer className="h-3.5 w-3.5" aria-hidden />
                    Print
                  </Link>
                  <Link href={`/admin/workers/${worker.id}/delete`} className={buttonStyles({ variant: "destructive", size: "sm" })}>
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    Delete
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          ))}

          {emptyState === "no-workers" && (
            <TableRow>
              <TableCell colSpan={6} className="p-0">
                <div className="p-vera-8">
                  <EmptyState
                    icon={Users}
                    title="No workers yet"
                    description="Add a worker to start tracking training, credentials, and assignments."
                  >
                    <Link href="/admin/workers/new" className={buttonStyles({ variant: "teal", size: "md" })}>
                      <Plus className="h-4 w-4" aria-hidden />
                      Add worker
                    </Link>
                  </EmptyState>
                </div>
              </TableCell>
            </TableRow>
          )}
          {emptyState === "no-matches" && (
            <TableRow>
              <TableCell colSpan={6} className="p-0">
                <div className="p-vera-8">
                  <EmptyState
                    icon={Search}
                    title="No matching workers"
                    description="Try another search term or clear filters."
                  />
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Pagination
        page={page}
        totalPages={totalPages}
        getHref={(p) => pageHrefs[p - 1] ?? pageHrefs[0] ?? "?"}
        label="Workers pagination"
      />
    </div>
  );
}
