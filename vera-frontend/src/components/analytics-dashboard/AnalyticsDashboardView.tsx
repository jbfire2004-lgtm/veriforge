"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Input } from "@/components/ui";
import {
  fetchAnalyticsDashboard,
  type AnalyticsDashboard,
  type AnalyticsScope,
} from "@/lib/analytics-dashboard-api";
import { QuickCheckTrigger } from "@/src/components/quickcheck";
import {
  AnalyticsKpiCards,
  AuditTrendsChart,
  ComplianceBreakdownChart,
  ComplianceHistogramChart,
  DocumentExpiryChart,
  InsuranceChart,
  PvsCoverageChart,
  QuickCheckRiskChart,
} from "./AnalyticsCharts";

function defaultRange() {
  const to = new Date();
  const from = new Date(to.getTime() - 30 * 86_400_000);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

export function AnalyticsDashboardView({
  scope,
  endpoint,
  contractorId,
  showContractorTable = true,
  showQuickCheck = true,
}: {
  scope: AnalyticsScope;
  endpoint?: "dashboard" | "contractor" | "client" | "admin";
  contractorId?: string;
  showContractorTable?: boolean;
  showQuickCheck?: boolean;
}) {
  const initial = useMemo(() => defaultRange(), []);
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("");
  const [page, setPage] = useState(0);
  const take = 10;
  const [data, setData] = useState<AnalyticsDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const dash = await fetchAnalyticsDashboard({
        scope,
        endpoint: endpoint || "dashboard",
        from: new Date(from).toISOString(),
        to: new Date(`${to}T23:59:59.999Z`).toISOString(),
        skip: page * take,
        take,
        q: q.trim() || undefined,
        region: region.trim() || undefined,
        contractorId,
      });
      setData(dash);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setBusy(false);
    }
  }, [scope, endpoint, from, to, page, q, region, contractorId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const selfId = contractorId || data?.contractors.items[0]?.contractorId;

  return (
    <div className="space-y-8">
      <form
        className="flex flex-wrap items-end gap-3 border border-zinc-200 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(0);
          void reload();
        }}
      >
        <label className="space-y-1 text-sm">
          <span>From</span>
          <Input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span>To</span>
          <Input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
        {scope !== "contractor" ? (
          <>
            <label className="space-y-1 text-sm">
              <span>Search</span>
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Contractor name"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span>Region</span>
              <Input
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="Region"
              />
            </label>
          </>
        ) : null}
        <Button type="submit" disabled={busy}>
          {busy ? "Loading…" : "Apply filters"}
        </Button>
        {showQuickCheck && selfId ? (
          <QuickCheckTrigger
            contractorId={selfId}
            source="analytics"
            label="Run QuickCheck"
          />
        ) : null}
      </form>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {!data ? (
        <p className="text-sm text-zinc-500">
          {busy ? "Loading dashboard…" : "No data"}
        </p>
      ) : (
        <>
          <AnalyticsKpiCards kpis={data.kpis} />

          <div className="grid gap-4 lg:grid-cols-2">
            <ComplianceBreakdownChart
              data={data.charts.complianceBreakdown}
            />
            <QuickCheckRiskChart data={data.charts.quickCheckRisk} />
            <DocumentExpiryChart data={data.charts.documentExpiry} />
            <AuditTrendsChart data={data.charts.auditTrends} />
            <PvsCoverageChart data={data.charts.pvsCoverage} />
            <InsuranceChart data={data.charts.insuranceCompliance} />
            {data.charts.complianceHistogram ? (
              <ComplianceHistogramChart
                data={data.charts.complianceHistogram}
              />
            ) : null}
          </div>

          {showContractorTable ? (
            <section>
              <h3 className="mb-2 text-sm font-medium uppercase text-zinc-500">
                Contractors ({data.contractors.total})
              </h3>
              <div className="overflow-x-auto border border-zinc-200">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500">
                    <tr>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Score</th>
                      <th className="px-3 py-2">Insurance</th>
                      <th className="px-3 py-2">Region</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {data.contractors.items.map((c) => (
                      <tr key={c.contractorId}>
                        <td className="px-3 py-2 font-medium">
                          {c.tradeName || c.legalName}
                        </td>
                        <td className="px-3 py-2 tabular-nums">
                          {c.complianceScore}
                        </td>
                        <td className="px-3 py-2 capitalize">
                          {c.insuranceStatus}
                        </td>
                        <td className="px-3 py-2">{c.region || "—"}</td>
                      </tr>
                    ))}
                    {!data.contractors.items.length ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-3 py-6 text-center text-zinc-500"
                        >
                          No contractors in range.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
              {data.contractors.pageCount && data.contractors.pageCount > 1 ? (
                <div className="mt-2 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page <= 0 || busy}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                  >
                    Prev
                  </Button>
                  <span className="self-center text-sm text-zinc-600">
                    Page {(data.contractors.page ?? page + 1)} /{" "}
                    {data.contractors.pageCount}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={
                      busy ||
                      page + 1 >= (data.contractors.pageCount ?? 1)
                    }
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              ) : null}
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
