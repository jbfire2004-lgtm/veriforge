"use client";

import type { ReactNode } from "react";
import { HubSection } from "@/components/hub/sections/HubSection";
import type { CompanySelfVsIndustryResponse } from "@/lib/hub/industry-safety/types";
import { ProjectMetricCard } from "./ProjectMetricCard";
import {
  CompanyCapaAgingChart,
  CompanyHecaPanel,
  CompetencyTrendChart,
  LeadingMaturityPanel,
} from "./CompanyAnalyticsPanels";
import { CompareMetricBlock, DualSeriesChart } from "./visi-charts";
import {
  visiCardClass,
  visiEyebrowClass,
  visiMutedClass,
  visiPillClass,
  visiPillWarnClass,
} from "./visi-ui";

function DeltaBadge({
  value,
  invert,
  suffix = "",
}: {
  value: number | null | undefined;
  /** When true, lower is better (TRIF/LTIF/HECA) */
  invert?: boolean;
  suffix?: string;
}) {
  if (value == null || !Number.isFinite(value)) {
    return (
      <span className="text-xs font-medium text-[#94a3b8]">vs industry —</span>
    );
  }
  const better = invert ? value < 0 : value > 0;
  const worse = invert ? value > 0 : value < 0;
  const tone = better
    ? "text-teal-800 bg-teal-50/80 border-teal-200/70"
    : worse
      ? "text-amber-900 bg-amber-50/80 border-amber-200/70"
      : "text-[#5a6b7c] bg-[#f8fafc] border-[#2A2E33]/10";
  const sign = value > 0 ? "+" : "";
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium tabular-nums ${tone}`}
    >
      Δ {sign}
      {value.toFixed(Math.abs(value) >= 1 ? 2 : 3)}
      {suffix}
    </span>
  );
}

function PlaneLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#94a3b8]">
      {children}
    </p>
  );
}

type Props = {
  comparison: CompanySelfVsIndustryResponse;
  crossCategory: boolean;
  crossScale: boolean;
};

/**
 * Side-by-side Your company vs Industry cohort panels.
 * Company-plane only — never mixes project-scale data.
 */
export function CompanyVsIndustryPanels({
  comparison,
  crossCategory,
  crossScale,
}: Props) {
  const { data, meta } = comparison;
  const self = data.self.metrics;
  const industrySuppressed = data.industry.suppressed || meta.industrySuppressed;
  const c = data.comparisons;
  const home = data.home;
  const bench = data.benchmark;

  const seasonalPoints = c.seasonal.self.map((row, i) => ({
    period: row.period,
    self: row.value,
    industry: c.seasonal.industry[i]?.value ?? null,
  }));

  return (
    <div className="space-y-6">
      <div className={visiCardClass}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className={visiEyebrowClass}>Benchmark comparison</p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-[#2A2E33]">
              {home.companyName}
              <span className="font-normal text-[#94a3b8]"> vs </span>
              industry
            </h2>
            <p className={`mt-1.5 text-sm leading-relaxed ${visiMutedClass}`}>
              Your metrics for{" "}
              <span className="font-medium text-[#2A2E33]">{home.industry}</span>
              {" · "}
              <span className="font-medium text-[#2A2E33]">
                {home.companyType.replace(/_/g, " ")}
              </span>
              {" · "}
              <span className="font-medium text-[#2A2E33]">{home.scale}</span>
              . Change type or scale in the selector for cross-category /
              cross-scale comparison. Industry side is anonymized (n≥5).
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={crossCategory ? visiPillWarnClass : visiPillClass}>
              {crossCategory ? "Cross-category" : "Matched type"}
            </span>
            <span className={crossScale ? visiPillWarnClass : visiPillClass}>
              {crossScale ? "Cross-scale" : "Matched scale"}
            </span>
          </div>
        </div>
        {(!meta.alignment.sameType || !meta.alignment.sameScale) && (
          <p className="mt-4 rounded-lg border border-amber-200/70 bg-amber-50/50 px-3 py-2 text-sm text-[#5a6b7c]">
            Benchmark differs from home profile
            {!meta.alignment.sameType
              ? ` · type ${home.companyType} → ${bench.companyType}`
              : ""}
            {!meta.alignment.sameScale
              ? ` · scale ${home.scale} → ${bench.scale}`
              : ""}
          </p>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <ProjectMetricCard
            label="Your HECA rate"
            value={`${(self.heca.companyHecaRate * 100).toFixed(1)}%`}
            tone={
              c.heca.deltaHecaRate != null && c.heca.deltaHecaRate < 0
                ? "ok"
                : "default"
            }
          />
          <DeltaBadge value={c.heca.deltaHecaRate} invert />
        </div>
        <div className="space-y-2">
          <ProjectMetricCard
            label="Your TRIF"
            value={self.trif.toFixed(2)}
            hint="Per 200,000 hours"
            tone={
              c.trifLtif.deltaTrif != null && c.trifLtif.deltaTrif < 0
                ? "ok"
                : "default"
            }
          />
          <DeltaBadge value={c.trifLtif.deltaTrif} invert />
        </div>
        <div className="space-y-2">
          <ProjectMetricCard
            label="Your LTIF"
            value={self.ltif.toFixed(2)}
            hint="Per 200,000 hours"
            tone={
              c.trifLtif.deltaLtif != null && c.trifLtif.deltaLtif < 0
                ? "ok"
                : "default"
            }
          />
          <DeltaBadge value={c.trifLtif.deltaLtif} invert />
        </div>
        <div className="space-y-2">
          <ProjectMetricCard
            label="Your leading maturity"
            value={String(self.leadingMaturity.score)}
            hint={self.leadingMaturity.band}
            tone={
              c.leadingMaturity.deltaScore != null &&
              c.leadingMaturity.deltaScore > 0
                ? "ok"
                : "default"
            }
          />
          <DeltaBadge value={c.leadingMaturity.deltaScore} />
        </div>
      </div>

      {industrySuppressed ? (
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 px-4 py-3 text-sm text-amber-950">
          Industry cohort hidden — fewer than 5 companies in this segment. Your
          company metrics remain visible; benchmarks are suppressed.
        </div>
      ) : null}

      <HubSection
        title="Company vs Industry HECA"
        description="Side-by-side HECA rates (company plane only)."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <PlaneLabel>Your company</PlaneLabel>
            <CompanyHecaPanel heca={c.heca.self} />
          </div>
          <div>
            <PlaneLabel>Industry cohort</PlaneLabel>
            {c.heca.industry ? (
              <CompanyHecaPanel heca={c.heca.industry} />
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
          </div>
        </div>
      </HubSection>

      <HubSection
        title="Company vs Industry TRIF / LTIF"
        description="Normalized per 200,000 hours."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <CompareMetricBlock
            label="TRIF"
            unit="per 200k hours"
            selfValue={c.trifLtif.self.trif.toFixed(2)}
            industryValue={
              c.trifLtif.industry
                ? c.trifLtif.industry.trif.toFixed(2)
                : null
            }
          />
          <CompareMetricBlock
            label="LTIF"
            unit="per 200k hours"
            selfValue={c.trifLtif.self.ltif.toFixed(2)}
            industryValue={
              c.trifLtif.industry
                ? c.trifLtif.industry.ltif.toFixed(2)
                : null
            }
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          <DeltaBadge value={c.trifLtif.deltaTrif} invert suffix=" TRIF" />
          <DeltaBadge value={c.trifLtif.deltaLtif} invert suffix=" LTIF" />
        </div>
      </HubSection>

      <HubSection
        title="Company vs Industry leading maturity"
        description="Leading indicator maturity comparison."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <PlaneLabel>Your company</PlaneLabel>
            <LeadingMaturityPanel maturity={c.leadingMaturity.self} />
          </div>
          <div>
            <PlaneLabel>Industry cohort</PlaneLabel>
            {c.leadingMaturity.industry ? (
              <LeadingMaturityPanel maturity={c.leadingMaturity.industry} />
            ) : (
              <LeadingMaturityPanel
                maturity={{ score: 0, band: "nascent", dimensions: [] }}
                suppressed
              />
            )}
          </div>
        </div>
        <div className="mt-3">
          <DeltaBadge value={c.leadingMaturity.deltaScore} suffix=" pts" />
        </div>
      </HubSection>

      <div className="grid gap-4 lg:grid-cols-2">
        <HubSection
          title="Company vs Industry CAPA aging"
          description="Corrective action aging."
        >
          <div className="space-y-4">
            <div>
              <PlaneLabel>Your company</PlaneLabel>
              <CompanyCapaAgingChart corrective={c.correctiveActions.self} />
            </div>
            <div>
              <PlaneLabel>Industry cohort</PlaneLabel>
              {c.correctiveActions.industry ? (
                <CompanyCapaAgingChart
                  corrective={c.correctiveActions.industry}
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
            </div>
            <DeltaBadge value={c.correctiveActions.deltaOnTimeRate} />
          </div>
        </HubSection>

        <HubSection
          title="Company vs Industry competency"
          description="Competency currency trends."
        >
          <div className="space-y-4">
            <div>
              <PlaneLabel>Your company</PlaneLabel>
              <CompetencyTrendChart trend={c.competency.selfTrend} />
            </div>
            <div>
              <PlaneLabel>Industry cohort</PlaneLabel>
              <CompetencyTrendChart
                trend={c.competency.industryTrend}
                suppressed={industrySuppressed}
              />
            </div>
            <DeltaBadge value={c.competency.deltaCurrentRate} />
          </div>
        </HubSection>
      </div>

      <HubSection
        title="Company vs Industry seasonal risk"
        description="TRIF seasonal pattern — company plane only."
      >
        <div className="rounded-2xl border border-[#2A2E33]/10 bg-white p-5 shadow-sm">
          {seasonalPoints.length > 0 ? (
            <DualSeriesChart points={seasonalPoints} />
          ) : (
            <p className={visiMutedClass}>No seasonal points available.</p>
          )}
        </div>
      </HubSection>
    </div>
  );
}
