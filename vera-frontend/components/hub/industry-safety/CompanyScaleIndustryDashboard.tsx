"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { HubSection } from "@/components/hub/sections/HubSection";
import { fetchCompanyScaleCohort } from "@/lib/hub/industry-safety/api";
import type {
  CompanyScaleSelectors,
  VisiCompanyResponse,
} from "@/lib/hub/industry-safety/types";
import { CompanyScaleSelectorBar } from "./CompanyScaleSelectorBar";
import { ProjectMetricCard } from "./ProjectMetricCard";
import {
  CompanyCapaAgingChart,
  CompanyHecaPanel,
  CompetencyTrendChart,
  LeadingMaturityPanel,
  RegionalPerformancePanel,
  WorkforceStabilityPanel,
} from "./CompanyAnalyticsPanels";
import { visiMutedClass, visiStatusBarClass } from "./visi-ui";

const DEFAULT_SELECTORS: CompanyScaleSelectors = {
  industry: "energy",
  companyType: "utility",
  scale: "large",
  period: "2026-Q2",
};

export function CompanyScaleIndustryDashboard() {
  const [selectors, setSelectors] =
    useState<CompanyScaleSelectors>(DEFAULT_SELECTORS);
  const [response, setResponse] = useState<VisiCompanyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [optInProject, setOptInProject] = useState(false);
  const [pending, startTransition] = useTransition();

  const load = useCallback((next: CompanyScaleSelectors) => {
    startTransition(async () => {
      setError(null);
      try {
        const res = await fetchCompanyScaleCohort(next);
        setResponse(res);
      } catch (e) {
        setResponse(null);
        setError(
          e instanceof Error
            ? e.message
            : "Unable to load company-scale industry cohort",
        );
      }
    });
  }, []);

  useEffect(() => {
    load(selectors);
  }, [selectors, load]);

  const suppressed = response?.meta.suppressed ?? false;
  const metrics = response?.data.metrics ?? null;
  const n = response?.meta.entityCount;

  return (
    <div className="space-y-6">
      <CompanyScaleSelectorBar
        value={selectors}
        onChange={setSelectors}
        disabled={pending}
      />

      <div className={visiStatusBarClass}>
        <div>
          {pending ? (
            <span>Loading company cohort…</span>
          ) : suppressed ? (
            <span className="font-medium text-amber-800">
              Insufficient sample — categories with fewer than 5 companies are
              hidden.
            </span>
          ) : (
            <span>
              Cohort size:{" "}
              <strong className="tabular-nums text-[#2A2E33]">{n ?? "—"}</strong>{" "}
              tokenized companies · plane{" "}
              <strong className="text-[#2A2E33]">company</strong> · TRIF/LTIF per
              200,000 hours
            </span>
          )}
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-xs text-[#5a6b7c]">
          <input
            type="checkbox"
            className="rounded border-[#2A2E33]/20 text-teal-700 focus:ring-teal-600/20"
            checked={optInProject}
            onChange={(e) => setOptInProject(e.target.checked)}
          />
          Opt in to project-level comparison (not mixed into this view)
        </label>
      </div>

      {optInProject ? (
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 px-4 py-3 text-sm text-amber-950">
          Cross-category comparison stays off this dashboard. Project aggregates
          are not loaded here. Use an explicit Cross-Category Comparison flow when
          available — company metrics above remain company-only.
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-rose-200/80 bg-rose-50/70 px-4 py-3 text-sm text-rose-950">
          {error}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ProjectMetricCard
          label="Company HECA rate"
          value={
            metrics ? `${(metrics.heca.companyHecaRate * 100).toFixed(1)}%` : "—"
          }
          suppressed={suppressed}
          tone={
            metrics && metrics.heca.companyHecaRate > 0.15 ? "critical" : "default"
          }
        />
        <ProjectMetricCard
          label="TRIF"
          value={metrics ? metrics.trif.toFixed(2) : "—"}
          hint="Per 200,000 total hours"
          suppressed={suppressed}
          tone={metrics && metrics.trif > 2 ? "warn" : "default"}
        />
        <ProjectMetricCard
          label="LTIF"
          value={metrics ? metrics.ltif.toFixed(2) : "—"}
          hint="Per 200,000 total hours"
          suppressed={suppressed}
        />
        <ProjectMetricCard
          label="Leading maturity"
          value={metrics ? String(metrics.leadingMaturity.score) : "—"}
          hint={metrics?.leadingMaturity.band}
          suppressed={suppressed}
          tone="ok"
        />
      </div>

      <HubSection
        title="Company HECA"
        description="High-energy control assessment rate for similar companies."
      >
        {metrics ? (
          <CompanyHecaPanel heca={metrics.heca} suppressed={suppressed} />
        ) : (
          <CompanyHecaPanel
            heca={{
              companyHecaRate: 0,
              controlsVerifiedRate: 0,
              distribution: {},
            }}
            suppressed
          />
        )}
      </HubSection>

      <HubSection
        title="Leading indicator maturity"
        description="Maturity scoring across proactive safety systems."
      >
        {metrics ? (
          <LeadingMaturityPanel
            maturity={metrics.leadingMaturity}
            suppressed={suppressed}
          />
        ) : (
          <LeadingMaturityPanel
            maturity={{ score: 0, band: "nascent", dimensions: [] }}
            suppressed
          />
        )}
      </HubSection>

      <div className="grid gap-4 lg:grid-cols-2">
        <HubSection
          title="Corrective action aging"
          description="CAPA aging buckets for the company cohort."
        >
          {metrics ? (
            <CompanyCapaAgingChart
              corrective={metrics.correctiveActions}
              suppressed={suppressed}
            />
          ) : (
            <CompanyCapaAgingChart
              corrective={{
                onTimeRate: 0,
                openAvg: 0,
                overdueCountAvg: 0,
                aging: [],
              }}
              suppressed
            />
          )}
        </HubSection>

        <HubSection
          title="Competency trends"
          description="Currency and near-term expiry pressure over the period."
        >
          <CompetencyTrendChart
            trend={metrics?.competency.trend ?? []}
            suppressed={suppressed || !metrics}
          />
        </HubSection>
      </div>

      <HubSection
        title="Regional performance"
        description="Anonymized regional rollups within the company cohort."
      >
        <RegionalPerformancePanel
          regional={metrics?.regional ?? []}
          suppressed={suppressed || !metrics}
        />
      </HubSection>

      <HubSection
        title="Workforce stability"
        description="Turnover, tenure, contractor mix, and retention signals."
      >
        {metrics ? (
          <WorkforceStabilityPanel
            stability={metrics.workforceStability}
            suppressed={suppressed}
          />
        ) : (
          <WorkforceStabilityPanel
            stability={{
              turnoverRate: 0,
              tenureMedianYears: 0,
              contractorRatio: 0,
              overtimePressure: 0,
              retentionScore: 0,
            }}
            suppressed
          />
        )}
      </HubSection>

      <p className={visiMutedClass}>
        Privacy: company IDs are tokenized as{" "}
        <code className="font-mono text-[#2A2E33]/80">co_*</code> before
        aggregation. Exact tokens are never rendered. Project-level data is not
        included in these metrics.
      </p>
    </div>
  );
}
