"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { HubSection } from "@/components/hub/sections/HubSection";
import {
  fetchCompanyBenchmarkProfile,
  fetchCompanyScaleCohort,
  fetchCompanySelfVsIndustry,
  fetchProjectScaleCohort,
} from "@/lib/hub/industry-safety/api";
import type {
  CompanySelfVsIndustryResponse,
  VisiCompanyResponse,
  VisiProjectResponse,
} from "@/lib/hub/industry-safety/types";
import {
  DEFAULT_INDUSTRY_SELECTOR,
  useIndustrySelectorSystem,
} from "@/lib/hub/industry-safety/useIndustrySelectorSystem";
import { IndustrySelectorSystem } from "./IndustrySelectorSystem";
import { ProjectMetricCard } from "./ProjectMetricCard";
import { HecaTrendChart } from "./HecaTrendChart";
import { LeadingIndicatorHeatmap } from "./LeadingIndicatorHeatmap";
import {
  CorrectiveActionAgingChart,
  RootCauseDistribution,
  SeasonalRiskChart,
} from "./ProjectAnalyticsCharts";
import { ProjectRiskProfileCard } from "./ProjectRiskProfileCard";
import {
  CompanyCapaAgingChart,
  CompanyHecaPanel,
  CompetencyTrendChart,
  LeadingMaturityPanel,
  RegionalPerformancePanel,
  WorkforceStabilityPanel,
} from "./CompanyAnalyticsPanels";
import { CompanyVsIndustryPanels } from "./CompanyVsIndustryPanels";

type Props = {
  initialEntityType?: "project" | "company";
};

export function IndustrySafetyShell({
  initialEntityType = "project",
}: Props) {
  const selector = useIndustrySelectorSystem({
    ...DEFAULT_INDUSTRY_SELECTOR,
    entityType: initialEntityType,
    subtype: initialEntityType === "project" ? "transmission" : "utility",
  });

  const [projectRes, setProjectRes] = useState<VisiProjectResponse | null>(null);
  const [companyRes, setCompanyRes] = useState<VisiCompanyResponse | null>(null);
  const [selfVsIndustry, setSelfVsIndustry] =
    useState<CompanySelfVsIndustryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [crossCategory, setCrossCategory] = useState(false);
  const [crossScale, setCrossScale] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [homeType, setHomeType] = useState<string | null>(null);
  const [homeScale, setHomeScale] = useState<string | null>(null);

  // Auto-load signed-in company profile into selectors (company plane)
  useEffect(() => {
    if (selector.state.entityType !== "company" || profileLoaded) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchCompanyBenchmarkProfile();
        if (cancelled) return;
        setHomeType(res.data.companyType);
        setHomeScale(res.data.scale);
        selector.patch({
          industry: res.data.industry,
          entityType: "company",
          subtype: res.data.companyType,
          scale: res.data.scale,
          period: res.data.period,
        });
        setProfileLoaded(true);
      } catch {
        setProfileLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once per company plane entry
  }, [selector.state.entityType, profileLoaded]);

  // Keep isolation consent in sync with selector vs home profile
  useEffect(() => {
    if (selector.state.entityType !== "company" || !homeType || !homeScale) return;
    const typeDiffers = selector.state.subtype !== homeType;
    const scaleDiffers = selector.state.scale !== homeScale;
    setCrossCategory(typeDiffers);
    setCrossScale(scaleDiffers);
  }, [
    selector.state.entityType,
    selector.state.subtype,
    selector.state.scale,
    homeType,
    homeScale,
  ]);

  const load = useCallback(() => {
    startTransition(async () => {
      setError(null);
      try {
        if (selector.state.entityType === "project" && selector.projectSelectors) {
          const res = await fetchProjectScaleCohort(selector.projectSelectors);
          setProjectRes(res);
          setCompanyRes(null);
          setSelfVsIndustry(null);
        } else if (
          selector.state.entityType === "company" &&
          selector.companySelectors
        ) {
          const [cohort, compare] = await Promise.all([
            fetchCompanyScaleCohort(selector.companySelectors),
            fetchCompanySelfVsIndustry({
              industry: selector.companySelectors.industry,
              companyType: selector.companySelectors.companyType,
              scale: selector.companySelectors.scale,
              period: selector.companySelectors.period,
              crossCategory,
              crossScale,
            }).catch((e) => {
              // No company link → still show industry cohort
              if (
                e &&
                typeof e === "object" &&
                "response" in e &&
                (e as { response?: { status?: number } }).response?.status ===
                  403
              ) {
                return null;
              }
              throw e;
            }),
          ]);
          setCompanyRes(cohort);
          setSelfVsIndustry(compare);
          setProjectRes(null);
        }
      } catch (e) {
        setProjectRes(null);
        setCompanyRes(null);
        setSelfVsIndustry(null);
        setError(
          e instanceof Error ? e.message : "Unable to load industry cohort",
        );
      }
    });
  }, [
    selector.state.entityType,
    selector.projectSelectors,
    selector.companySelectors,
    crossCategory,
    crossScale,
  ]);

  useEffect(() => {
    load();
  }, [load]);

  const isProject = selector.state.entityType === "project";
  const suppressed = isProject
    ? (projectRes?.meta.suppressed ?? false)
    : (companyRes?.meta.suppressed ?? false);
  const projectMetrics = projectRes?.data.metrics ?? null;
  const companyMetrics = companyRes?.data.metrics ?? null;
  const n = isProject
    ? projectRes?.meta.entityCount
    : companyRes?.meta.entityCount;

  return (
    <div className="space-y-6">
      <IndustrySelectorSystem
        state={selector.state}
        onPatch={selector.patch}
        availableIndustries={selector.availableIndustries}
        availableSubtypes={selector.availableSubtypes}
        availableScales={selector.availableScales}
        sampleForCurrent={selector.sampleForCurrent}
        loadingAvailability={selector.loadingAvailability}
        disabled={pending}
        planeWarning={selector.planeWarning}
        onConfirmPlaneSwitch={selector.confirmEntityTypeChange}
        onCancelPlaneSwitch={selector.cancelEntityTypeChange}
        onRequestEntityType={selector.requestEntityTypeChange}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#2A2E33]/08 bg-[#f8fafc] px-4 py-2.5 text-sm text-[#5a6b7c]">
        {pending ? (
          <span>Updating dashboard…</span>
        ) : suppressed ? (
          <span className="font-medium text-amber-800">
            Insufficient sample — fewer than 5{" "}
            {isProject ? "projects" : "companies"} in this segment.
          </span>
        ) : (
          <span>
            <span className="font-medium text-[#2A2E33]">
              {selector.state.entityType}
            </span>{" "}
            plane · cohort{" "}
            <span className="font-semibold tabular-nums text-[#2A2E33]">
              {n ?? "—"}
            </span>
            {!isProject && selfVsIndustry
              ? ` · ${selfVsIndustry.data.home.companyName} vs industry`
              : ""}
          </span>
        )}
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200/80 bg-rose-50/60 px-4 py-3 text-sm text-rose-900">
          {error}
        </div>
      ) : null}

      {isProject ? (
        <ProjectDashboardBody
          suppressed={suppressed}
          metrics={projectMetrics}
        />
      ) : (
        <>
          {selfVsIndustry ? (
            <CompanyVsIndustryPanels
              comparison={selfVsIndustry}
              crossCategory={crossCategory}
              crossScale={crossScale}
            />
          ) : (
            <div className="rounded-2xl border border-[#2A2E33]/10 bg-[#f8fafc] px-4 py-3 text-sm text-[#5a6b7c]">
              Sign in with a company-linked account to compare your metrics to
              industry. The anonymized cohort below remains available.
            </div>
          )}
          <CompanyDashboardBody
            suppressed={suppressed}
            metrics={companyMetrics}
          />
        </>
      )}
    </div>
  );
}

function ProjectDashboardBody({
  suppressed,
  metrics,
}: {
  suppressed: boolean;
  metrics: VisiProjectResponse["data"]["metrics"];
}) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ProjectMetricCard
          label="TRIF"
          value={metrics ? metrics.trif.toFixed(2) : "—"}
          hint="Per 200,000 hours"
          suppressed={suppressed}
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
        />
        <ProjectMetricCard
          label="Workforce incident rate"
          value={
            metrics
              ? metrics.workforceNormalized.incidentRatePer200k.toFixed(2)
              : "—"
          }
          suppressed={suppressed}
        />
      </div>

      <HubSection title="HECA trends" description="Project-plane HECA patterns.">
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
        <HubSection title="Leading indicators" description="Project heatmap.">
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
        <HubSection title="Seasonal risk" description="Project seasonal TRIF.">
          <SeasonalRiskChart
            seasonal={metrics?.seasonal ?? []}
            suppressed={suppressed || !metrics}
          />
        </HubSection>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <HubSection title="Root causes" description="Project cohort distribution.">
          <RootCauseDistribution
            rootCause={metrics?.rootCause ?? []}
            suppressed={suppressed || !metrics}
          />
        </HubSection>
        <HubSection title="Corrective actions" description="CAPA aging.">
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

      <HubSection title="Project risk profile" description="Cohort scoring.">
        {metrics ? (
          <ProjectRiskProfileCard
            profile={metrics.riskProfile}
            suppressed={suppressed}
          />
        ) : (
          <ProjectRiskProfileCard
            profile={{ score: 0, band: "low", drivers: [], confidence: 0 }}
            suppressed
          />
        )}
      </HubSection>
    </>
  );
}

function CompanyDashboardBody({
  suppressed,
  metrics,
}: {
  suppressed: boolean;
  metrics: VisiCompanyResponse["data"]["metrics"];
}) {
  return (
    <>
      <HubSection
        title="Industry cohort detail"
        description="Anonymized company-plane industry averages for the selected segment."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ProjectMetricCard
            label="Industry HECA rate"
            value={
              metrics
                ? `${(metrics.heca.companyHecaRate * 100).toFixed(1)}%`
                : "—"
            }
            suppressed={suppressed}
          />
          <ProjectMetricCard
            label="Industry TRIF"
            value={metrics ? metrics.trif.toFixed(2) : "—"}
            hint="Per 200,000 total hours"
            suppressed={suppressed}
          />
          <ProjectMetricCard
            label="Industry LTIF"
            value={metrics ? metrics.ltif.toFixed(2) : "—"}
            suppressed={suppressed}
          />
          <ProjectMetricCard
            label="Industry leading maturity"
            value={metrics ? String(metrics.leadingMaturity.score) : "—"}
            hint={metrics?.leadingMaturity.band}
            suppressed={suppressed}
          />
        </div>
      </HubSection>

      <HubSection title="Company HECA (industry)" description="Company-plane HECA.">
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
        title="Leading indicator maturity (industry)"
        description="Company maturity scoring."
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
        <HubSection title="Corrective action aging (industry)" description="CAPA.">
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
        <HubSection title="Competency trends (industry)" description="Competency.">
          <CompetencyTrendChart
            trend={metrics?.competency.trend ?? []}
            suppressed={suppressed || !metrics}
          />
        </HubSection>
      </div>

      <HubSection title="Regional performance" description="Company regions.">
        <RegionalPerformancePanel
          regional={metrics?.regional ?? []}
          suppressed={suppressed || !metrics}
        />
      </HubSection>

      <HubSection title="Workforce stability" description="Company workforce.">
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
    </>
  );
}
