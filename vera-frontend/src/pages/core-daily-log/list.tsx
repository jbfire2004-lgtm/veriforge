"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { deleteCoreDailyLog } from "@/src/api/core-daily-log";
import { unknownToErrorMessage } from "@/lib/core";
import {
  isMissingAuthTokenError,
  missingAuthTokenMessage,
} from "@/lib/core/auth-token-errors";
import { CoreDailyLogTable } from "@/src/components/core-daily-log/CoreDailyLogTable";
import { CoreAlert } from "@/src/components/core/CoreAlert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buttonStyles } from "@/components/ui";
import { useCoreDailyLog } from "@/src/hooks/useCoreDailyLog";
import { VeraPageLayout } from "@/src/components/navigation";
import type {
  DailyLogCompanyOption,
  DailyLogSiteOption,
} from "@/src/components/core-daily-log/CoreDailyLogForm";

export type CoreDailyLogListPageProps = {
  companies?: DailyLogCompanyOption[];
  sites?: DailyLogSiteOption[];
  defaultCompanyId?: number;
  defaultSiteId?: number;
  lockCompany?: boolean;
};

export default function CoreDailyLogListPage({
  companies = [],
  sites = [],
  defaultCompanyId,
  defaultSiteId,
  lockCompany = false,
}: CoreDailyLogListPageProps) {
  const resolvedDefaultSite =
    defaultSiteId ?? (sites.length === 1 ? sites[0]!.id : undefined);

  const [companyId, setCompanyId] = useState(
    defaultCompanyId != null ? String(defaultCompanyId) : "",
  );
  const [siteId, setSiteId] = useState(
    resolvedDefaultSite != null ? String(resolvedDefaultSite) : "",
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (defaultCompanyId != null && !companyId) {
      setCompanyId(String(defaultCompanyId));
    }
  }, [defaultCompanyId, companyId]);

  useEffect(() => {
    if (resolvedDefaultSite != null && !siteId) {
      setSiteId(String(resolvedDefaultSite));
    }
  }, [resolvedDefaultSite, siteId]);

  const params = useMemo(() => {
    const cid = Number(companyId);
    const sid = Number(siteId);
    return {
      companyId: Number.isSafeInteger(cid) && cid > 0 ? cid : undefined,
      siteId: Number.isSafeInteger(sid) && sid > 0 ? sid : undefined,
      take: 50,
    };
  }, [companyId, siteId]);

  const { items, total, loading, error, tokenReady, refetch } =
    useCoreDailyLog(params);

  async function onDelete(id: number) {
    if (
      typeof globalThis.confirm === "function" &&
      !globalThis.confirm("Delete this daily log?")
    ) {
      return;
    }
    setDeleteError(null);
    try {
      await deleteCoreDailyLog(id);
      await refetch();
    } catch (e) {
      setDeleteError(
        isMissingAuthTokenError(e)
          ? missingAuthTokenMessage("delete a daily log")
          : unknownToErrorMessage(e),
      );
    }
  }

  return (
    <VeraPageLayout
      title="Daily logs"
      description={
        <>
          Shift notes and site narrative via{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">
            GET /api/v1/core-daily-logs
          </code>
          <span className="text-slate-500"> · {total} total</span>
        </>
      }
      actions={
        <Link
          href="/core/daily-logs/new"
          className={buttonStyles({ variant: "teal", size: "sm" })}
        >
          New daily log
        </Link>
      }
      filters={
        <div className="flex flex-wrap gap-4 rounded-lg border border-slate-200 bg-slate-50/80 p-4">
          <div className="space-y-1.5">
            <Label htmlFor="cdl-filter-company">Company</Label>
            {companies.length > 0 && !lockCompany ? (
              <select
                id="cdl-filter-company"
                className="flex h-9 min-w-[12rem] rounded-md border border-slate-300 bg-white px-3 text-sm"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
              >
                <option value="">All / JWT default</option>
                {companies.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name} (#{c.id})
                  </option>
                ))}
              </select>
            ) : (
              <Input
                id="cdl-filter-company"
                inputMode="numeric"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                readOnly={lockCompany}
                placeholder="Auto from account"
                className="w-40"
              />
            )}
            {lockCompany ? (
              <p className="text-[10px] text-slate-500">Locked to your company</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cdl-filter-site">Site</Label>
            {sites.length > 0 ? (
              <select
                id="cdl-filter-site"
                className="flex h-9 min-w-[12rem] rounded-md border border-slate-300 bg-white px-3 text-sm"
                value={siteId}
                onChange={(e) => setSiteId(e.target.value)}
              >
                <option value="">Any site</option>
                {sites.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.name}
                    {s.code ? ` (${s.code})` : ""} #{s.id}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                id="cdl-filter-site"
                inputMode="numeric"
                value={siteId}
                onChange={(e) => setSiteId(e.target.value)}
                placeholder="Any"
                className="w-36"
              />
            )}
          </div>
        </div>
      }
    >
      {!tokenReady && error ? (
        <CoreAlert className="mb-4" role="alert">
          {error}{" "}
          <Link
            href="/login?callbackUrl=/core/daily-logs"
            className="font-medium underline"
          >
            Sign in
          </Link>
        </CoreAlert>
      ) : null}

      {deleteError ? (
        <p className="mb-3 text-sm text-red-700" role="alert">
          {deleteError}
        </p>
      ) : null}

      <CoreDailyLogTable
        items={items}
        loading={loading}
        error={tokenReady ? error : null}
        onRefresh={() => void refetch()}
        onDelete={(id) => void onDelete(id)}
      />
    </VeraPageLayout>
  );
}
