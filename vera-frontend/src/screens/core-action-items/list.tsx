"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ListChecks } from "lucide-react";
import { CoreActionItemsTable } from "@/src/components/core-action-items/CoreActionItemsTable";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  SuccessState,
} from "@/src/components/core/AsyncViewState";
import { CORE_ACTION_STATUSES } from "@/src/components/core-action-items/core-action-item.schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCoreActionItems } from "@/src/hooks/useCoreActionItems";
import { useCoreActionItemMutations } from "@/src/hooks/useCoreActionItemMutations";
import { VeraPageLayout } from "@/src/components/navigation";
import { buttonStyles } from "@/components/ui";

export default function CoreActionItemsListPage() {
  const [companyId, setCompanyId] = useState("");
  const [meetingRecordId, setMeetingRecordId] = useState("");
  const [dailyLogId, setDailyLogId] = useState("");
  const [status, setStatus] = useState<string>("");

  const params = useMemo(() => {
    const cid = parseInt(companyId, 10);
    const mid = parseInt(meetingRecordId, 10);
    const dlid = parseInt(dailyLogId, 10);
    return {
      companyId: Number.isFinite(cid) && cid >= 1 ? cid : undefined,
      coreMeetingRecordId: Number.isFinite(mid) && mid >= 1 ? mid : undefined,
      coreDailyLogId: Number.isFinite(dlid) && dlid >= 1 ? dlid : undefined,
      status: status || undefined,
      take: 50,
    };
  }, [companyId, meetingRecordId, dailyLogId, status]);

  const { items, total, loading, error, refetch } =
    useCoreActionItems(params);
  const {
    busy: deleting,
    error: deleteErr,
    success: deleteOk,
    clearMessages,
    remove,
  } = useCoreActionItemMutations();

  async function onDelete(id: string) {
    if (typeof globalThis.confirm === "function" && !globalThis.confirm("Delete this action item?")) {
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
      title="Action items"
      description={
        <>
          Safety and compliance follow-ups via{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">GET /api/v1/core-action-items</code>
          <span className="text-slate-500"> · {total} total</span>
        </>
      }
      actions={
        <Link href="/core/action-items/new" className={buttonStyles({ variant: "teal", size: "sm" })}>
          New action item
        </Link>
      }
      filters={
        <div className="flex flex-wrap gap-4 rounded-lg border border-slate-200 bg-slate-50/80 p-4">
        <div className="space-y-1.5">
          <Label htmlFor="filter-company">Company ID</Label>
          <Input
            id="filter-company"
            inputMode="numeric"
            placeholder="Any"
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="filter-meeting-record">Meeting record ID</Label>
          <Input
            id="filter-meeting-record"
            inputMode="numeric"
            placeholder="Any"
            value={meetingRecordId}
            onChange={(e) => setMeetingRecordId(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="filter-daily-log">Daily log ID</Label>
          <Input
            id="filter-daily-log"
            inputMode="numeric"
            placeholder="Any"
            value={dailyLogId}
            onChange={(e) => setDailyLogId(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="filter-status">Status</Label>
          <select
            id="filter-status"
            className="border-input bg-background flex h-10 w-44 rounded-md border px-3 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Any</option>
            {CORE_ACTION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        </div>
      }
    >
      {deleteErr ? (
        <ErrorState title="Delete failed" message={deleteErr} />
      ) : null}
      {deleteOk ? <SuccessState title="Action completed" message={deleteOk} /> : null}
      {loading && items.length === 0 ? (
        <LoadingState
          title="Loading action items"
          message="Fetching the latest records..."
        />
      ) : null}
      {!loading && !error && items.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="No action items found"
          message="Try clearing filters or create a new action item."
        />
      ) : null}
      {error ? <ErrorState title="Could not load action items" message={error} /> : null}

      <CoreActionItemsTable
        items={items}
        loading={loading}
        error={error}
        onRefresh={() => void refetch()}
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
