"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { CoreSiteRiskTable } from "@/src/components/core-site-risk/CoreSiteRiskTable";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  SuccessState,
} from "@/src/components/core/AsyncViewState";
import {
  CORE_SITE_RISK_CATEGORIES,
  CORE_SITE_RISK_SEVERITIES,
  CORE_SITE_RISK_STATUSES,
} from "@/src/components/core-site-risk/core-site-risk.schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buttonStyles } from "@/components/ui";
import { useCoreSiteRisk } from "@/src/hooks/useCoreSiteRisk";
import { useCoreSiteRiskMutations } from "@/src/hooks/useCoreSiteRiskMutations";
import { VeraPageLayout } from "@/src/components/navigation";

export default function CoreSiteRiskListPage() {
  const [companyId, setCompanyId] = useState("");
  const [siteId, setSiteId] = useState("");
  const [status, setStatus] = useState<string>("");
  const [severity, setSeverity] = useState<string>("");
  const [category, setCategory] = useState<string>("");

  const params = useMemo(() => {
    const cid = parseInt(companyId, 10);
    const sid = parseInt(siteId, 10);
    return {
      companyId: Number.isFinite(cid) && cid >= 1 ? cid : undefined,
      siteId: Number.isFinite(sid) && sid >= 1 ? sid : undefined,
      status:
        status && CORE_SITE_RISK_STATUSES.includes(status as never)
          ? (status as (typeof CORE_SITE_RISK_STATUSES)[number])
          : undefined,
      severity:
        severity && CORE_SITE_RISK_SEVERITIES.includes(severity as never)
          ? (severity as (typeof CORE_SITE_RISK_SEVERITIES)[number])
          : undefined,
      category:
        category && CORE_SITE_RISK_CATEGORIES.includes(category as never)
          ? (category as (typeof CORE_SITE_RISK_CATEGORIES)[number])
          : undefined,
      take: 50,
    };
  }, [companyId, siteId, status, severity, category]);

  const { items, total, loading, error, refetch } = useCoreSiteRisk(params);
  const {
    busy: deleting,
    error: deleteErr,
    success: deleteOk,
    clearMessages,
    remove,
  } = useCoreSiteRiskMutations();

  async function onDelete(id: number) {
    if (
      typeof globalThis.confirm === "function" &&
      !globalThis.confirm("Delete this site risk?")
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
      title="Site risks"
      description={
        <>
          Site hazard register via{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">
            GET /api/v1/core-site-risks
          </code>
          <span className="text-slate-500"> · {total} total</span>
        </>
      }
      actions={
        <Link href="/core/site-risks/new" className={buttonStyles({ variant: "teal", size: "sm" })}>
          New site risk
        </Link>
      }
      filters={
        <div className="flex flex-wrap gap-4 rounded-lg border border-slate-200 bg-slate-50/80 p-4">
          <div className="space-y-1.5">
            <Label htmlFor="csr-filter-company">Company ID</Label>
            <Input
              id="csr-filter-company"
              inputMode="numeric"
              placeholder="Any"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className="w-36"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="csr-filter-site">Site ID</Label>
            <Input
              id="csr-filter-site"
              inputMode="numeric"
              placeholder="Any"
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
              className="w-36"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="csr-filter-category">Category</Label>
            <select
              id="csr-filter-category"
              className="flex h-9 w-44 rounded-md border border-slate-300 bg-white px-2 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Any</option>
              {CORE_SITE_RISK_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="csr-filter-status">Status</Label>
            <select
              id="csr-filter-status"
              className="flex h-9 w-44 rounded-md border border-slate-300 bg-white px-2 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Any</option>
              {CORE_SITE_RISK_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="csr-filter-severity">Severity</Label>
            <select
              id="csr-filter-severity"
              className="flex h-9 w-44 rounded-md border border-slate-300 bg-white px-2 text-sm"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
            >
              <option value="">Any</option>
              {CORE_SITE_RISK_SEVERITIES.map((s) => (
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
          title="Loading site risks"
          message="Fetching the latest records..."
        />
      )}
      {!loading && !error && items.length === 0 && (
        <EmptyState
          icon={ShieldAlert}
          title="No site risks found"
          message="Try adjusting filters or create a new risk."
        />
      )}
      {error && <ErrorState title="Could not load site risks" message={error} />}

      <CoreSiteRiskTable
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
