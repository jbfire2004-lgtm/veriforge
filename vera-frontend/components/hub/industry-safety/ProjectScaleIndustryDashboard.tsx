"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { HubSection } from "@/components/hub/sections/HubSection";
import { fetchProjectScaleCohort } from "@/lib/hub/industry-safety/api";
import type {
  ProjectScaleSelectors,
  VisiProjectResponse,
} from "@/lib/hub/industry-safety/types";
import { ProjectScaleSelectorBar } from "./ProjectScaleSelectorBar";
import { ProjectMetricCard } from "./ProjectMetricCard";
import { HecaTrendChart } from "./HecaTrendChart";
import { LeadingIndicatorHeatmap } from "./LeadingIndicatorHeatmap";
import {
  CorrectiveActionAgingChart,
  RootCauseDistribution,
  SeasonalRiskChart,
} from "./ProjectAnalyticsCharts";
import { ProjectRiskProfileCard } from "./ProjectRiskProfileCard";
import { visiMutedClass, visiStatusBarClass } from "./visi-ui";

const DEFAULT_SELECTORS: ProjectScaleSelectors = {
  industry: "energy",
  projectType: "transmission",
  scale: "large",
  period: "2026-Q2",
};

export function ProjectScaleIndustryDashboard() {
  const [selectors, setSelectors] =
    useState<ProjectScaleSelectors>(DEFAULT_SELECTORS);
  const [response, setResponse] = useState<VisiProjectResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [optInCompany, setOptInCompany] = useState(false);
  const [pending, startTransition] = useTransition();

  const load = useCallback((next: ProjectScaleSelectors) => {
    startTransition(async () => {
      setError(null);
      try {
        const res = await fetchProjectScaleCohort(next);
        setResponse(res);
      } catch (e) {
        setResponse(null);
        setError(
          e instanceof Error
            ? e.message
            : "Unable to load project-scale industry cohort",
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
      <ProjectScaleSelectorBar
        value={selectors}
        onChange={setSelectors}
        disabled={pending}
      />

      <div className={visiStatusBarClass}>
        <div>
          {pending ? (
            <span>Loading project cohort…</span>
          ) : suppressed ? (
            <span className="font-medium text-amber-800">
              Insufficient sample — categories with fewer than 5 projects are
              hidden.
            </span>
          ) : (
            <span>
              Cohort size:{" "}
              <strong className="tabular-nums text-[#2A2E33]">{n ?? "—"}</strong>{" "}
              tokenized projects · plane{" "}
              <strong className="text-[#2A2E33]">project</strong> · TRIF/LTIF per
              200,000 hours
            </span>
          )}
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-xs text-[#5a6b7c]">
          <input
            type="checkbox"
            className="rounded border-[#2A2E33]/20 text-teal-700 focus:ring-teal-600/20"
            checked={optInCompany}
            onChange={(e) => setOptInCompany(e.target.checked)}
          />
          Opt in to company-level comparison (not mixed into this view)
        </label>
      </div>

      {optInCompany ? (
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 px-4 py-3 text-sm text-amber-950">
          Cross-category comparison stays off this dashboard. Company aggregates
          are not loaded here. Use an explicit Cross-Category Comparison flow when
          available — project metrics above remain project-only.
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-rose-200/80 bg-rose-50/70 px-4 py-3 text-sm text-rose-950">
          {error}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ProjectMetricCard
          label="TRIF"
          value={metrics ? metrics.trif.toFixed(2) : "—"}
          hint="Per 200,000 hours"
          suppressed={suppressed}
          tone={metrics && metrics.trif > 2 ? "warn" : "default"}
        />
        <ProjectMetricCard
          label="LTIF"
          value={metrics ? metrics.ltif.toFixed(2) : "—"}
          hint="Per 200,000 hours"
          suppressed={suppressed}
        />
        <ProjectMetricCard
          label="HECA high-energy rate"
          value={
            metrics ? `${(metrics.heca.highEnergyRate * 100).toFixed(1)}%` : "—"
          }
          suppressed={suppressed}
          tone={
            metrics && metrics.heca.highEnergyRate > 0.15 ? "critical" : "default"
          }
        />
        <ProjectMetricCard
          label="Workforce incident rate"
          value={
            metrics
              ? metrics.workforceNormalized.incidentRatePer200k.toFixed(2)
              : "—"
          }
          hint="Normalized per 200,000 hours"
          suppressed={suppressed}
        />
      </div>

      <HubSection
        title="HECA trends"
        description="High-energy control assessment patterns for similar projects."
      >
        {metrics ? (
          <HecaTrendChart heca={metrics.heca} suppressed={suppressed} />
        ) : (
          <HecaTrendChart
            heca={{
              highEnergyRate: 0,
              controlsVerifiedRate: 0,
              distribution: {},
              trend: [],
            }}
            suppressed
          />
        )}
      </HubSection>

      <div className="grid gap-4 lg:grid-cols-2">
        <HubSection title="Leading indicators" description="Heatmap of proactive signals.">
          {metrics ? (
            <LeadingIndicatorHeatmap
              leading={metrics.leading}
              suppressed={suppressed}
            />
          ) : (
            <LeadingIndicatorHeatmap
              leading={{
                nearMissRate: 0,
                observationRate: 0,
                inspectionCompletion: 0,
                trainingCurrency: 0,
                heatmap: [],
              }}
              suppressed
            />
          )}
        </HubSection>

        <HubSection
          title="Seasonal risk"
          description="Seasonal TRIF patterns for this project cohort."
        >
          <SeasonalRiskChart
            seasonal={metrics?.seasonal ?? []}
            suppressed={suppressed || !metrics}
          />
        </HubSection>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <HubSection
          title="Root causes"
          description="Distribution across the anonymized project cohort."
        >
          <RootCauseDistribution
            rootCause={metrics?.rootCause ?? []}
            suppressed={suppressed || !metrics}
          />
        </HubSection>

        <HubSection
          title="Corrective actions"
          description="Closure aging buckets for CAPA discipline."
        >
          {metrics ? (
            <CorrectiveActionAgingChart
              corrective={metrics.correctiveActions}
              suppressed={suppressed}
            />
          ) : (
            <CorrectiveActionAgingChart
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
      </div>

      <HubSection
        title="Project risk profile"
        description="Cohort risk scoring with predictive model hooks — no raw project IDs."
      >
        {metrics ? (
          <ProjectRiskProfileCard
            profile={metrics.riskProfile}
            suppressed={suppressed}
          />
        ) : (
          <ProjectRiskProfileCard
            profile={{
              score: 0,
              band: "low",
              drivers: [],
              confidence: 0,
            }}
            suppressed
          />
        )}
      </HubSection>

      <p className={visiMutedClass}>
        Privacy: project IDs are tokenized as{" "}
        <code className="font-mono text-[#2A2E33]/80">proj_*</code> before
        aggregation. Exact tokens are never rendered. Company-level data is not
        included in these metrics.
      </p>
    </div>
  );
}
