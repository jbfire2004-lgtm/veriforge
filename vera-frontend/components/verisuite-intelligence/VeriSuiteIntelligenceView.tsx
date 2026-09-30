"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { IntelligenceSnapshot, ModuleLens, SelectorState } from "@/lib/verisuite-intelligence/types";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AiInsightPanel,
  ComparisonPanel,
  InsightStrip,
  KpiTile,
  VsDashboardShell,
  VsSection,
} from "@/components/verisuite-intelligence-ui";
import { VS_COLORS } from "@/lib/verisuite-intelligence-ui/tokens";
import {
  invalidateClientAggregate,
  useCachedAggregate,
} from "@/lib/verisuite-intelligence-ui/useCachedAggregate";

const INDUSTRIES = ["construction", "mining", "manufacturing", "energy"] as const;

export function VeriSuiteIntelligenceView() {
  const [selectors, setSelectors] = useState<Partial<SelectorState>>({
    plane: "company",
    industry: "construction",
    regionCode: "GLB",
    module: "hub",
  });

  const url = useMemo(() => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(selectors)) {
      if (v != null && v !== "") q.set(k, String(v));
    }
    return `/api/v1/verisuite-intelligence?${q}`;
  }, [selectors]);

  const { data: snap, loading, error, fromCache, reload } =
    useCachedAggregate<IntelligenceSnapshot>(url);

  async function ingest() {
    const res = await fetch("/api/v1/verisuite-intelligence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(selectors),
    });
    if (res.ok) {
      invalidateClientAggregate("/api/v1/verisuite-intelligence");
      await reload({ bust: true });
    }
  }

  const dual = snap?.dual;
  const regional = snap?.regional;
  const selectedModule =
    snap?.modules.find((mod) => mod.module === (selectors.module ?? snap.selectors.module)) ??
    snap?.modules[0];
  const comparisonRows = selectedModule
    ? [
        {
          label: "Module peer",
          left: selectedModule.industryCompare.companyValue,
          right: selectedModule.industryCompare.industryMean,
        },
      ]
    : [];
  const insightChips = snap
    ? [
        {
          id: "suite-module",
          label: selectedModule?.title ?? "Module",
          value:
            selectedModule?.industryCompare.companyValue != null
              ? String(selectedModule.industryCompare.companyValue)
              : "—",
          tone: "info" as const,
          href: "#vs-comparison",
        },
        {
          id: "suite-insights",
          label: "AI insights",
          value: `${snap.insights.length}`,
          tone: snap.insights.some((ins) => ins.severity === "critical" || ins.severity === "alert")
            ? ("alert" as const)
            : ("neutral" as const),
          href: "#vs-ai-insights",
        },
        {
          id: "suite-regions",
          label: "Regional children",
          value: `${regional?.children.length ?? 0}`,
          tone: "positive" as const,
          href: "#vs-regional",
        },
      ]
    : [];

  return (
    <VsDashboardShell
      eyebrow="VeriSuite Intelligence System"
      title="Industry · Regional · Module intelligence"
      description="Dual project/company dashboards, Global→City regional drilldown, anonymized cross-industry aggregation, and AI trend/anomaly/risk detection across VeriHub, VeriPM, FieldOS, and VeriCore."
      meta={
        snap
          ? `Rev ${snap.revision} · n≥${snap.anonymization.minSample} · planes isolated · site band excluded from industry pool${fromCache ? " · cached aggregate" : ""}`
          : undefined
      }
    >
      <VsSection band="controls">
        <div className="flex flex-wrap gap-2">
        <select
          value={selectors.plane ?? "company"}
          onChange={(e) =>
            setSelectors((s) => ({ ...s, plane: e.target.value as SelectorState["plane"] }))
          }
        >
          <option value="company">Company plane</option>
          <option value="project">Project plane</option>
        </select>
        <select
          value={selectors.industry ?? "construction"}
          onChange={(e) =>
            setSelectors((s) => ({
              ...s,
              industry: e.target.value as SelectorState["industry"],
            }))
          }
        >
          {INDUSTRIES.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
        <select
          value={selectors.module ?? "hub"}
          onChange={(e) =>
            setSelectors((s) => ({ ...s, module: e.target.value as ModuleLens }))
          }
        >
          <option value="hub">Lens: Hub</option>
          <option value="pm">Lens: VeriPM</option>
          <option value="fieldos">Lens: FieldOS</option>
          <option value="core">Lens: VeriCore</option>
        </select>
        <button type="button" className="vs-btn" onClick={() => void reload()}>
          Refresh
        </button>
        <button type="button" className="vs-btn vs-btn-primary" onClick={() => void ingest()}>
          Simulate industry ingest
        </button>
        </div>
      </VsSection>

      {error ? (
        <div className="vs-panel px-4 py-3 text-sm" style={{ color: VS_COLORS.critical }}>
          {error}
        </div>
      ) : null}

      {loading && !snap ? <Skeleton className="h-40 w-full rounded-[3px] bg-[var(--vs-slate)]" /> : null}

      {snap && dual ? (
        <>
          <InsightStrip chips={insightChips} cachedHint={fromCache} />

          <VsSection band="kpi" label="Dual dashboards">
              {(
                [
                  ["Project-scale", dual.project],
                  ["Company-scale", dual.company],
                ] as const
              ).map(([label, m]) => (
                <div key={label} className="contents">
                  {m.suppressed ? (
                    <KpiTile label={label} value="hidden" suppressed />
                  ) : (
                    <>
                      <KpiTile label={`${label} TRIF`} value={m.trif ?? "—"} tone="neutral" />
                      <KpiTile label={`${label} LTIF`} value={m.ltif ?? "—"} tone="neutral" />
                      <KpiTile label={`${label} training %`} value={m.trainingCompliantPct ?? "—"} tone="positive" />
                      <KpiTile label={`${label} entities`} value={m.entityCount ?? "—"} tone="caution" />
                    </>
                  )}
                </div>
              ))}
          </VsSection>

          {regional ? (
            <VsSection band="trend" label="Regional drilldown">
              <ComparisonPanel
                mode="company-vs-industry"
                title={`${selectedModule?.module ?? "Module"} vs industry`}
                leftLabel={selectedModule?.title ?? "Module"}
                rightLabel="Industry mean"
                rows={comparisonRows}
              />
              <div className="vs-panel col-span-full p-4">
              <div id="vs-regional" />
              <div className="flex flex-wrap gap-2 text-sm">
                {regional.breadcrumbs.map((b) => (
                  <button
                    key={b.code}
                    type="button"
                    className={(selectors.regionCode ?? "GLB") === b.code ? "vs-drill-crumb vs-drill-crumb-active" : "vs-drill-crumb"}
                    onClick={() => setSelectors((s) => ({ ...s, regionCode: b.code }))}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
              <div className="mt-3 overflow-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th>Region</th>
                      <th>Level</th>
                      <th>n</th>
                      <th>TRIF</th>
                      <th>Training</th>
                    </tr>
                  </thead>
                  <tbody>
                    {regional.children.map((c) => (
                      <tr key={c.code}>
                        <td>
                          <button
                            type="button"
                            className="vs-drill-crumb"
                            onClick={() =>
                              setSelectors((s) => ({ ...s, regionCode: c.code }))
                            }
                          >
                            {c.label}
                          </button>
                        </td>
                        <td>{c.level}</td>
                        <td className="tabular-nums">
                          {c.suppressed ? "—" : c.entityCount}
                        </td>
                        <td className="tabular-nums">
                          {c.suppressed ? "suppressed" : (c.metrics?.trif ?? "—")}
                        </td>
                        <td className="tabular-nums">
                          {c.suppressed
                            ? "—"
                            : c.metrics?.trainingCompliantPct != null
                              ? `${c.metrics.trainingCompliantPct}%`
                              : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </div>
            </VsSection>
          ) : null}

          <VsSection band="detail" label="Module dashboards">
              {snap.modules.map((mod) => (
                <Link
                  key={mod.module}
                  href={mod.href}
                  className="vs-panel p-4 transition hover:border-[var(--vs-blue)]"
                >
                  <p className="vs-eyebrow">
                    {mod.module}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold" style={{ color: VS_COLORS.white }}>{mod.title}</h3>
                  <ul className="mt-3 space-y-1 text-sm vs-muted">
                    {mod.kpis.map((k) => (
                      <li key={k.key} className="flex justify-between">
                        <span>{k.label}</span>
                        <span className="tabular-nums" style={{ color: VS_COLORS.white }}>
                          {k.value ?? "—"} {k.unit}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {mod.insights[0] ? (
                    <p className="mt-3 text-xs" style={{ color: VS_COLORS.critical }}>{mod.insights[0].summary}</p>
                  ) : null}
                </Link>
              ))}
          </VsSection>

          <VsSection band="narrative" label="AI insights">
            <div id="vs-ai-insights" />
            <AiInsightPanel
              title="AI insights"
              items={snap.insights.map((ins) => ({
                id: ins.insightId,
                tone:
                  ins.severity === "critical" || ins.severity === "alert"
                    ? "alert"
                    : ins.severity === "watch"
                      ? "caution"
                      : "neutral",
                headline: `${ins.kind} · ${ins.severity}`,
                body: `${ins.summary}\nconfidence ${(ins.confidence * 100).toFixed(0)}%${
                  ins.module ? ` · ${ins.module}` : ""
                }`,
                confidence: ins.confidence,
              }))}
            />
          </VsSection>
        </>
      ) : null}
    </VsDashboardShell>
  );
}
