"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { deleteCoreMeetingRecord } from "@/src/api/core-meeting-record";
import { unknownToErrorMessage } from "@/lib/core";
import { CoreMeetingRecordTable } from "@/src/components/core-meeting-record/CoreMeetingRecordTable";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buttonStyles } from "@/components/ui";
import { useCoreMeetingRecord } from "@/src/hooks/useCoreMeetingRecord";
import { VeraPageLayout } from "@/src/components/navigation";

export default function CoreMeetingRecordListPage() {
  const [companyId, setCompanyId] = useState("");
  const [siteId, setSiteId] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const params = useMemo(() => {
    const cid = Number(companyId);
    const sid = Number(siteId);
    return {
      companyId: Number.isSafeInteger(cid) && cid > 0 ? cid : undefined,
      siteId: Number.isSafeInteger(sid) && sid > 0 ? sid : undefined,
      take: 50,
    };
  }, [companyId, siteId]);

  const { items, total, loading, error, refetch } = useCoreMeetingRecord(params);

  async function onDelete(id: number) {
    if (typeof globalThis.confirm === "function" && !globalThis.confirm("Delete this meeting record?")) {
      return;
    }
    setDeleteError(null);
    try {
      await deleteCoreMeetingRecord(id);
      await refetch();
    } catch (e) {
      setDeleteError(unknownToErrorMessage(e));
    }
  }

  return (
    <VeraPageLayout
      title="Meeting records"
      description={
        <>
          Toolbox talks and safety meetings via{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">GET /api/v1/core-meeting-records</code>
          <span className="text-slate-500"> · {total} total</span>
        </>
      }
      actions={
        <Link href="/core/meeting-records/new" className={buttonStyles({ variant: "teal", size: "sm" })}>
          New meeting record
        </Link>
      }
      filters={
        <div className="flex flex-wrap gap-4 rounded-lg border border-slate-200 bg-slate-50/80 p-4">
          <div className="space-y-1.5">
            <Label htmlFor="cmr-filter-company">Company ID</Label>
            <Input id="cmr-filter-company" inputMode="numeric" value={companyId} onChange={(e) => setCompanyId(e.target.value)} placeholder="Any" className="w-36" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cmr-filter-site">Site ID</Label>
            <Input id="cmr-filter-site" inputMode="numeric" value={siteId} onChange={(e) => setSiteId(e.target.value)} placeholder="Any" className="w-36" />
          </div>
        </div>
      }
    >
      {deleteError ? <p className="text-sm text-red-700">{deleteError}</p> : null}

      <CoreMeetingRecordTable
        items={items}
        loading={loading}
        error={error}
        onRefresh={() => void refetch()}
        onDelete={(id) => void onDelete(id)}
      />
    </VeraPageLayout>
  );
}

