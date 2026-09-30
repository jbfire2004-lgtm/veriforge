"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Eye } from "lucide-react";
import { SafetyObservationTable } from "@/src/components/safety-observation/SafetyObservationTable";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  SuccessState,
} from "@/src/components/core/AsyncViewState";
import {
  SAFETY_OBSERVATION_SEVERITIES,
  SAFETY_OBSERVATION_STATUSES,
} from "@/src/components/safety-observation/safety-observation.schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buttonStyles } from "@/components/ui";
import { useSafetyObservation } from "@/src/hooks/useSafetyObservation";
import { useSafetyObservationMutations } from "@/src/hooks/useSafetyObservationMutations";
import { VeraPageLayout } from "@/src/components/navigation";

export default function CoreSafetyObservationListPage() {
  const [companyId, setCompanyId] = useState("");
  const [siteId, setSiteId] = useState("");
  const [status, setStatus] = useState<string>("");
  const [severity, setSeverity] = useState<string>("");

  const params = useMemo(() => {
    const cid = parseInt(companyId, 10);
    const sid = parseInt(siteId, 10);
    return {
      companyId: Number.isFinite(cid) && cid >= 1 ? cid : undefined,
      siteId: Number.isFinite(sid) && sid >= 1 ? sid : undefined,
      status:
        status && SAFETY_OBSERVATION_STATUSES.includes(status as never)
          ? (status as (typeof SAFETY_OBSERVATION_STATUSES)[number])
          : undefined,
      severity:
        severity && SAFETY_OBSERVATION_SEVERITIES.includes(severity as never)
          ? (severity as (typeof SAFETY_OBSERVATION_SEVERITIES)[number])
          : undefined,
      take: 50,
    };
  }, [companyId, siteId, status, severity]);

  const { items, total, loading, error, refetch } =
    useSafetyObservation(params);
  const {
    busy: deleting,
    error: deleteErr,
    success: deleteOk,
    clearMessages,
    remove,
  } = useSafetyObservationMutations();

  async function onDelete(id: number) {
    if (
      typeof globalThis.confirm === "function" &&
      !globalThis.confirm("Delete this safety observation?")
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
      title="Safety observations"
      description={
        <>
          Field hazards and safety notes via{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">
            GET /api/v1/safety-observations
          </code>
          <span className="text-slate-500"> · {total} total</span>
        </>
      }
      actions={
        <Link href="/core/safety-observations/new" className={buttonStyles({ variant: "teal", size: "sm" })}>
          New observation
        </Link>
      }
      filters={
        <div className="flex flex-wrap gap-4 rounded-lg border border-slate-200 bg-slate-50/80 p-4">
          <div className="space-y-1.5">
            <Label htmlFor="so-filter-company">Company ID</Label>
            <Input
              id="so-filter-company"
              inputMode="numeric"
              placeholder="Any"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className="w-36"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="so-filter-site">Site ID</Label>
            <Input
              id="so-filter-site"
              inputMode="numeric"
              placeholder="Any"
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
              className="w-36"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="so-filter-status">Status</Label>
            <select
              id="so-filter-status"
              className="flex h-9 w-44 rounded-md border border-slate-300 bg-white px-2 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Any</option>
              {SAFETY_OBSERVATION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="so-filter-severity">Severity</Label>
            <select
              id="so-filter-severity"
              className="flex h-9 w-44 rounded-md border border-slate-300 bg-white px-2 text-sm"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
            >
              <option value="">Any</option>
              {SAFETY_OBSERVATION_SEVERITIES.map((s) => (
                <option key={s} value={s}>
                  {s}
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
          title="Loading safety observations"
          message="Fetching the latest records..."
        />
      )}
      {!loading && !error && items.length === 0 && (
        <EmptyState
          icon={Eye}
          title="No safety observations found"
          message="Try adjusting filters or create a new observation."
        />
      )}
      {error && (
        <ErrorState title="Could not load safety observations" message={error} />
      )}

      <SafetyObservationTable
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
