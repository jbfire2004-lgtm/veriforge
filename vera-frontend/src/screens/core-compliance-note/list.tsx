"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ClipboardCheck } from "lucide-react";
import { CoreComplianceNoteTable } from "@/src/components/core-compliance-note/CoreComplianceNoteTable";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  SuccessState,
} from "@/src/components/core/AsyncViewState";
import {
  CORE_COMPLIANCE_NOTE_CATEGORIES,
  CORE_COMPLIANCE_NOTE_STATUSES,
} from "@/src/components/core-compliance-note/core-compliance-note.schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buttonStyles } from "@/components/ui";
import { useCoreComplianceNote } from "@/src/hooks/useCoreComplianceNote";
import { useCoreComplianceNoteMutations } from "@/src/hooks/useCoreComplianceNoteMutations";
import { VeraPageLayout } from "@/src/components/navigation";

export default function CoreComplianceNoteListPage() {
  const [companyId, setCompanyId] = useState("");
  const [siteId, setSiteId] = useState("");
  const [status, setStatus] = useState<string>("");
  const [category, setCategory] = useState<string>("");

  const params = useMemo(() => {
    const cid = parseInt(companyId, 10);
    const sid = parseInt(siteId, 10);
    return {
      companyId: Number.isFinite(cid) && cid >= 1 ? cid : undefined,
      siteId: Number.isFinite(sid) && sid >= 1 ? sid : undefined,
      status:
        status && CORE_COMPLIANCE_NOTE_STATUSES.includes(status as never)
          ? (status as (typeof CORE_COMPLIANCE_NOTE_STATUSES)[number])
          : undefined,
      category:
        category &&
        CORE_COMPLIANCE_NOTE_CATEGORIES.includes(category as never)
          ? (category as (typeof CORE_COMPLIANCE_NOTE_CATEGORIES)[number])
          : undefined,
      take: 50,
    };
  }, [companyId, siteId, status, category]);

  const { items, total, loading, error, refetch } =
    useCoreComplianceNote(params);
  const {
    busy: deleting,
    error: deleteErr,
    success: deleteOk,
    clearMessages,
    remove,
  } = useCoreComplianceNoteMutations();

  async function onDelete(id: number) {
    if (
      typeof globalThis.confirm === "function" &&
      !globalThis.confirm("Delete this compliance note?")
    ) {
      return;
    }
    clearMessages();
    try {
      await remove(id);
      await refetch();
    } catch {}
  }

  return (
    <VeraPageLayout
      title="Compliance notes"
      description={
        <>
          Audit and regulatory context via{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">
            GET /api/v1/core-compliance-notes
          </code>
          <span className="text-slate-500"> · {total} total</span>
        </>
      }
      actions={
        <Link href="/core/compliance-notes/new" className={buttonStyles({ variant: "teal", size: "sm" })}>
          New note
        </Link>
      }
      filters={
        <div className="flex flex-wrap gap-4 rounded-lg border border-slate-200 bg-slate-50/80 p-4">
          <div className="space-y-1.5">
            <Label htmlFor="ccn-filter-company">Company ID</Label>
            <Input
              id="ccn-filter-company"
              inputMode="numeric"
              placeholder="Any"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className="w-36"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ccn-filter-site">Site ID</Label>
            <Input
              id="ccn-filter-site"
              inputMode="numeric"
              placeholder="Any"
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
              className="w-36"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ccn-filter-status">Status</Label>
            <select
              id="ccn-filter-status"
              className="flex h-9 w-44 rounded-md border border-slate-300 bg-white px-2 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Any</option>
              {CORE_COMPLIANCE_NOTE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ccn-filter-category">Category</Label>
            <select
              id="ccn-filter-category"
              className="flex h-9 w-44 rounded-md border border-slate-300 bg-white px-2 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Any</option>
              {CORE_COMPLIANCE_NOTE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
        </div>
      }
    >
      {deleteErr && (
        <ErrorState title="Delete failed" message={deleteErr} />
      )}
      {deleteOk && <SuccessState title="Action completed" message={deleteOk} />}
      {loading && items.length === 0 && (
        <LoadingState
          title="Loading compliance notes"
          message="Fetching the latest records..."
        />
      )}
      {!loading && !error && items.length === 0 && (
        <EmptyState
          icon={ClipboardCheck}
          title="No compliance notes found"
          message="Try adjusting filters or create a new note."
        />
      )}
      {error && (
        <ErrorState title="Could not load compliance notes" message={error} />
      )}

      <CoreComplianceNoteTable
        items={items}
        loading={loading}
        error={error}
        onRefresh={refetch}
        onDelete={(id) => {
          if (deleting) return;
          void onDelete(id);
        }}
      />

      <p className="text-xs text-slate-500">
        Showing {items.length} of {total} total.
      </p>
    </VeraPageLayout>
  );
}
