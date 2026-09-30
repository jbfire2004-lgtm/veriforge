"use client";



import { useCallback, useEffect, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import {

  fetchCoreReadinessSummary,

  type CoreReadinessSummary,

} from "@/lib/core/vera-core-platform";

import { getCompaniesReadinessList } from "@/lib/api/reporting";

import { CompanyAssessmentReadinessPanel } from "@/components/core/CompanyAssessmentReadinessPanel";

import {

  CompanySelectField,

  type CompanyOption,

} from "@/src/components/core/CompanySelectField";

import { Button } from "@/components/ui/button";

import {

  READINESS_STATE_LABELS,

  readinessStateStyles,

  type ReadinessDimension,

  type ReadinessVisualState,

} from "@/lib/readiness-display";



function resolveInitialCompanyId(

  companies: CompanyOption[],

  fromQuery?: string | null,

): string {

  if (fromQuery && /^\d+$/.test(fromQuery)) return fromQuery;

  if (companies.length === 1) return String(companies[0]!.id);

  return "";

}



export function CoreReadinessDashboard() {

  const router = useRouter();

  const searchParams = useSearchParams();

  const [companies, setCompanies] = useState<CompanyOption[]>([]);

  const [companyId, setCompanyId] = useState("");

  const [data, setData] = useState<CoreReadinessSummary | null>(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);



  useEffect(() => {

    void getCompaniesReadinessList()

      .then((res) => {

        const rows = (res.rows ?? []).map((row) => ({

          id: row.companyId,

          name: row.companyName,

        }));

        setCompanies(rows);

        setCompanyId((current) =>

          current || resolveInitialCompanyId(rows, searchParams?.get("companyId")),

        );

      })

      .catch(() => setCompanies([]));

  }, [searchParams]);



  const syncCompanyQuery = useCallback(
    (nextCompanyId: string) => {
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      const trimmed = nextCompanyId.trim();
      if (trimmed) params.set("companyId", trimmed);
      else params.delete("companyId");
      const qs = params.toString();
      const nextPath = qs ? `/core/readiness?${qs}` : "/core/readiness";
      const currentQs = searchParams?.toString() ?? "";
      const currentPath = currentQs ? `/core/readiness?${currentQs}` : "/core/readiness";
      if (nextPath !== currentPath) {
        router.replace(nextPath, { scroll: false });
      }
    },
    [router, searchParams],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cid = companyId.trim() ? Number(companyId) : undefined;
      setData(await fetchCoreReadinessSummary(cid));
    } catch {
      setError("Could not load readiness summary.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCompanyChange = useCallback(
    (nextCompanyId: string) => {
      setCompanyId(nextCompanyId);
      syncCompanyQuery(nextCompanyId);
    },
    [syncCompanyQuery],
  );



  const selectedCompanyId = companyId.trim() ? Number(companyId) : null;

  const dimensions = data?.dimensions ?? buildFallbackDimensions(data);



  return (

    <div className="space-y-6" data-testid="core-readiness-dashboard">

      <div className="flex flex-wrap items-end gap-3">

        <div className="min-w-[220px]">

          <CompanySelectField

            id="readiness-company"

            companies={companies}

            value={companyId}

            onChange={handleCompanyChange}

            disabled={loading}

          />

        </div>

        <Button type="button" onClick={() => void load()} disabled={loading}>

          Refresh

        </Button>

      </div>



      {error ? (

        <p className="text-sm text-amber-700" role="alert">

          {error}

        </p>

      ) : null}

      {loading && !data ? <p className="text-sm text-slate-500">Loading…</p> : null}



      {data ? (

        <>

          <p className="text-xs text-slate-500">

            Generated {new Date(data.generatedAt).toLocaleString()}

            {data.companyId

              ? ` · Company ${data.companyId}`

              : " · Select a company for engine rollups"}

          </p>



          <section>

            <h2 className="mb-3 text-lg font-semibold text-slate-900">Readiness overview</h2>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

              {dimensions.map((dim) => (

                <ReadinessDimensionCard key={dim.key} dimension={dim} />

              ))}

            </div>

          </section>



          {data.predictiveSafety && !data.predictiveSafety.tierAllowed ? (

            <p className="text-sm text-slate-500" data-testid="predictive-tier-locked">

              Predictive safety analytics require a Predictive tier subscription.

            </p>

          ) : null}



          <CompanyAssessmentReadinessPanel

            companyId={selectedCompanyId}

            spce={data.companyAssessments?.spce ?? null}

            smartGap={data.companyAssessments?.smartGap ?? null}

          />



          {data.workers.topIssues.length > 0 ? (

            <section className="rounded-xl border border-slate-200 bg-white p-4">

              <h2 className="font-semibold text-slate-900">Top worker issues</h2>

              <ul className="mt-2 space-y-1">

                {data.workers.topIssues.map((issue) => (

                  <li key={issue.label} className="text-sm text-slate-600">

                    {issue.label}: {issue.count}

                  </li>

                ))}

              </ul>

            </section>

          ) : null}

        </>

      ) : null}

    </div>

  );

}



function ReadinessDimensionCard({ dimension }: { dimension: ReadinessDimension }) {

  const styles = readinessStateStyles(dimension.state);

  const metricLines = Object.entries(dimension.metrics)

    .filter(([, value]) => value > 0)

    .map(([key, value]) => `${formatMetricKey(key)}: ${value}`);



  return (

    <article

      className={`rounded-2xl border p-5 shadow-sm ${styles.card}`}

      data-testid={`readiness-dimension-${dimension.key}`}

    >

      <div className="flex items-start justify-between gap-2">

        <h3 className="text-sm font-semibold text-slate-800">{dimension.label}</h3>

        <ReadinessStateBadge state={dimension.state} />

      </div>

      <p className={`mt-2 text-3xl font-bold ${styles.score}`}>{dimension.score}%</p>

      {dimension.evaluatedAt ? (

        <p className="mt-1 text-xs text-slate-500">

          Evaluated {new Date(dimension.evaluatedAt).toLocaleDateString()}

        </p>

      ) : null}

      {metricLines.length ? (

        <ul className="mt-2 space-y-0.5">

          {metricLines.map((line) => (

            <li key={line} className="text-xs text-slate-600">

              {line}

            </li>

          ))}

        </ul>

      ) : null}

    </article>

  );

}



export function ReadinessStateBadge({ state }: { state: ReadinessVisualState }) {

  const styles = readinessStateStyles(state);

  return (

    <span

      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${styles.badge}`}

      data-testid={`readiness-state-${state}`}

    >

      {READINESS_STATE_LABELS[state]}

    </span>

  );

}



function formatMetricKey(key: string) {

  return key

    .replace(/([A-Z])/g, " $1")

    .replace(/_/g, " ")

    .trim();

}



function buildFallbackDimensions(data: CoreReadinessSummary | null): ReadinessDimension[] {

  if (!data) return [];

  const rows: ReadinessDimension[] = [

    {

      key: "workers",

      label: "Worker compliance",

      score: data.workers.complianceRate,

      state: data.workers.state ?? "AT_RISK",

      metrics: {

        compliant: data.workers.compliant,

        nonCompliant: data.workers.nonCompliant,

        expiringSoon: data.workers.expiringSoon,

      },

    },

    {

      key: "equipment",

      label: "Equipment compliance",

      score: data.equipment.complianceRate,

      state: data.equipment.state ?? "AT_RISK",

      metrics: {

        compliant: data.equipment.compliant,

        nonCompliant: data.equipment.nonCompliant,

        overdueInspection: data.equipment.overdueInspection,

      },

    },

  ];

  if (data.training) {

    rows.push({

      key: "training_expiry",

      label: "Training expiry",

      score: data.training.score ?? 0,

      state: data.training.state ?? "AT_RISK",

      metrics: {

        expired: data.training.expired,

        expiring30: data.training.expiring30,

        gaps: data.training.gaps,

      },

    });

  }

  return rows;

}


