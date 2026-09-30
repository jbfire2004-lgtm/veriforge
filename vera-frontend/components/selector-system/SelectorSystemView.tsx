"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  DashboardContent,
  EntityType,
  Industry,
  Scale,
  SelectorState,
  Subtype,
} from "@/lib/selector-system/types";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ComparisonPanel,
  InsightStrip,
  KpiTile,
  VsDashboardShell,
  VsSection,
} from "@/components/verisuite-intelligence-ui";
import { VS_COLORS } from "@/lib/verisuite-intelligence-ui/tokens";
import { useCachedAggregate } from "@/lib/verisuite-intelligence-ui/useCachedAggregate";

function fmt(n: number | null | undefined, digits = 2) {
  if (n == null) return "—";
  return n.toFixed(digits);
}

export function SelectorSystemView() {
  const [industry, setIndustry] = useState<Industry>("construction");
  const [entityType, setEntityType] = useState<EntityType>("project");
  const [subtype, setSubtype] = useState<Subtype | "">("");
  const [scale, setScale] = useState<Scale>("large");
  const [regionCode, setRegionCode] = useState("GLB");

  const url = useMemo(() => {
    const state: Partial<SelectorState> = {
      industry,
      entityType,
      scale,
      regionCode,
    };
    if (subtype) state.subtype = subtype;
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(state)) {
      if (v != null && v !== "") q.set(k, String(v));
    }
    return `/api/v1/selector-system?${q}`;
  }, [industry, entityType, subtype, scale, regionCode]);

  const { data: dash, loading, error, fromCache, reload } =
    useCachedAggregate<DashboardContent>(url);

  useEffect(() => {
    if (!dash) return;
    setIndustry(dash.selectors.industry);
    setEntityType(dash.selectors.entityType);
    setSubtype(dash.selectors.subtype);
    setScale(dash.selectors.scale);
    setRegionCode(dash.selectors.regionCode);
  }, [dash]);

  const filter = dash?.filter;
  const m = dash?.metrics;
  const comparisonRows =
    dash && m
      ? [
          {
            label: "Visible sample",
            left: m.entityCount,
            right: dash.rules.minSample,
          },
          {
            label: "TRIF",
            left: m.trif,
            right: null,
            unit: "/200k",
            suppressed: m.suppressed,
          },
          {
            label: "LTIF",
            left: m.ltif,
            right: null,
            unit: "/200k",
            suppressed: m.suppressed,
          },
        ]
      : [];
  const insightChips =
    dash && m
      ? [
          {
            id: "selector-sample",
            label: "Sample",
            value: m.suppressed ? `<${dash.rules.minSample}` : String(m.entityCount ?? "—"),
            tone: m.suppressed ? ("caution" as const) : ("positive" as const),
            href: "#vs-comparison",
          },
          {
            id: "selector-context",
            label: "Resolved cohort",
            value: `${dash.context.plane} · ${dash.context.regionLabel}`,
            tone: "info" as const,
            href: "#vs-resolution",
          },
          {
            id: "selector-guard",
            label: "Guard messages",
            value: `${filter?.contamination.messages.length ?? 0}`,
            tone: filter?.contamination.messages.length ? ("caution" as const) : ("neutral" as const),
            href: "#vs-contamination",
          },
        ]
      : [];

  return (
    <VsDashboardShell
      eyebrow="Selector System"
      title="Industry · Entity · Subtype · Scale · Region"
      description="Dynamic filtering with plane isolation — project and company data never mix. Dashboard content auto-updates from the resolved selector state."
      meta={
        dash
          ? `Rev ${dash.revision} · n≥${dash.rules.minSample} · dynamic filtering · cross-contamination blocked · auto-update on${fromCache ? " · cached aggregate" : ""}`
          : undefined
      }
    >
      <VsSection band="controls">
        <div className="col-span-full space-y-4">
        <div className="flex flex-wrap gap-2">
          <label className="self-center vs-eyebrow">
            1. Industry
          </label>
          <select
            value={industry}
            onChange={(e) => {
              const v = e.target.value as Industry;
              setIndustry(v);
            }}
          >
            {(filter?.industries ?? []).map((o) => (
              <option key={o.id} value={o.id} disabled={!o.available}>
                {o.label}
                {!o.available ? " (unavailable)" : ""}
              </option>
            ))}
            {!filter ? (
              <>
                <option value="mining">Mining</option>
                <option value="construction">Construction</option>
                <option value="manufacturing">Manufacturing</option>
              </>
            ) : null}
          </select>

          <label className="ml-2 self-center vs-eyebrow">
            2. Entity
          </label>
          <select
            value={entityType}
            onChange={(e) => {
              const v = e.target.value as EntityType;
              setEntityType(v);
              setSubtype("");
            }}
          >
            <option value="project">Project</option>
            <option value="company">Company</option>
          </select>

          <label className="ml-2 self-center vs-eyebrow">
            3. Subtype
          </label>
          <select
            value={subtype}
            onChange={(e) => {
              const v = e.target.value as Subtype;
              setSubtype(v);
            }}
          >
            {(filter?.subtypes ?? []).map((o) => (
              <option key={o.id} value={o.id} disabled={!o.available}>
                {o.label}
                {!o.available ? " (unavailable)" : ""}
              </option>
            ))}
          </select>

          <label className="ml-2 self-center vs-eyebrow">
            4. Scale
          </label>
          <select
            value={scale}
            onChange={(e) => {
              const v = e.target.value as Scale;
              setScale(v);
            }}
          >
            {(filter?.scales ?? []).map((o) => (
              <option key={o.id} value={o.id} disabled={!o.available}>
                {o.label}
                {!o.available ? " (unavailable)" : ""}
              </option>
            ))}
            {!filter ? (
              <>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="mega">Mega</option>
              </>
            ) : null}
          </select>
        </div>

        <div className="space-y-2">
          <p className="vs-eyebrow">
            5. Region
          </p>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {(filter?.regions.breadcrumbs ?? [{ code: "GLB", label: "Global" }]).map(
              (b, i) => (
                <span key={b.code} className="flex items-center gap-2">
                  {i > 0 ? <span className="vs-muted">/</span> : null}
                  <button
                    type="button"
                    className={b.code === regionCode ? "vs-drill-crumb vs-drill-crumb-active" : "vs-drill-crumb"}
                    onClick={() => {
                      setRegionCode(b.code);
                    }}
                  >
                    {b.label}
                  </button>
                </span>
              ),
            )}
          </div>
          {filter?.regions.children?.length ? (
            <div className="flex flex-wrap gap-2">
              {filter.regions.children.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  disabled={!c.available}
                  className={c.available ? "vs-btn" : "vs-btn cursor-not-allowed opacity-50"}
                  onClick={() => {
                    setRegionCode(c.code);
                  }}
                >
                  {c.label}
                  <span className="ml-1 text-[10px] uppercase vs-muted">
                    {c.level}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs vs-muted">End of region hierarchy.</p>
          )}
        </div>

        <button type="button" className="vs-btn" onClick={() => void reload()}>
          Refresh
        </button>
        </div>
      </VsSection>

      {filter?.contamination.messages.length ? (
        <VsSection band="narrative" label="Contamination guard">
          <div className="vs-panel col-span-full p-4" id="vs-contamination">
          <p className="vs-eyebrow">Contamination guard</p>
          <ul className="mt-1 list-disc pl-5">
            {filter.contamination.messages.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
          </div>
        </VsSection>
      ) : null}

      {error ? <p className="text-sm" style={{ color: VS_COLORS.critical }}>{error}</p> : null}
      {loading && !dash ? <Skeleton className="h-32 w-full bg-[var(--vs-slate)]" /> : null}

      {dash && m ? (
        <>
        <InsightStrip chips={insightChips} cachedHint={fromCache} />

        <VsSection band="kpi" label="Dashboard (auto-updated)">
          <p className="col-span-full text-sm vs-muted">
            {dash.context.industryLabel} · {dash.context.plane} ·{" "}
            {dash.context.subtypeLabel} · {dash.context.scaleLabel} ·{" "}
            {dash.context.regionLabel} ({dash.context.regionLevel})
          </p>
          {m.suppressed ? (
            <p className="col-span-full text-sm" style={{ color: VS_COLORS.orange }}>
              Metrics hidden — fewer than {dash.rules.minSample} entities match this
              selector combination.
            </p>
          ) : (
            <>
              <KpiTile label="TRIF" value={fmt(m.trif)} tone="neutral" />
              <KpiTile label="LTIF" value={fmt(m.ltif)} tone="neutral" />
              <KpiTile label="Leading maturity" value={fmt(m.leadingMaturity, 1)} tone="positive" />
              <KpiTile label="Severity" value={fmt(m.severityIndex, 1)} tone="caution" />
            </>
          )}
          {!m.suppressed ? (
            <p className="col-span-full text-xs vs-muted">n = {m.entityCount}</p>
          ) : null}
        </VsSection>
        <VsSection band="trend" label="Selector resolution">
          <ComparisonPanel
            mode={dash.context.plane === "project" ? "project-vs-industry" : "company-vs-industry"}
            title="Selector cohort visibility"
            leftLabel={dash.context.plane}
            rightLabel="Publish threshold"
            rows={comparisonRows}
          />
          <div className="vs-panel p-4">
            <div id="vs-resolution" />
            <p className="vs-eyebrow">Resolved state</p>
            <p className="mt-3 text-sm vs-muted">
              {dash.context.industryLabel} selectors are resolved server-side before dashboard metrics are returned.
            </p>
          </div>
        </VsSection>
        <VsSection band="detail" label="Isolation detail">
          <div className="vs-panel p-4">
            <p className="vs-eyebrow">Plane isolation</p>
            <p className="mt-3 text-sm vs-muted">
              Project and company selector changes clear incompatible subtype state to prevent cross-contamination.
            </p>
          </div>
        </VsSection>
        </>
      ) : null}
    </VsDashboardShell>
  );
}
