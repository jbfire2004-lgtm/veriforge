"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  ProjectSafetyDashboard,
  ProjectType,
  RegionCode,
  ScaleBand,
} from "@/lib/veripm-project-safety/types";
import {
  PROJECT_TYPE_LABELS,
  PROJECT_TYPES,
  REGION_CODES,
  REGION_LABELS,
  SCALE_BANDS,
  SCALE_LABELS,
} from "@/lib/veripm-project-safety/types";
import { Skeleton } from "@/components/ui/skeleton";
import { VeriPmAiIntelligencePanel } from "@/components/veripm-ai-intelligence";
import {
  ActionAgingHistogram,
  AiInsightPanel,
  ComparisonPanel,
  InspectionTrendCard,
  InsightStrip,
  KpiTile,
  RiskGauge,
  SeverityBars,
  TrendPanel,
  VsDashboardShell,
  VsSection,
} from "@/components/verisuite-intelligence-ui";
import { VS_COLORS } from "@/lib/verisuite-intelligence-ui/tokens";
import {
  invalidateClientAggregate,
  useCachedAggregate,
} from "@/lib/verisuite-intelligence-ui/useCachedAggregate";

const PERIODS = ["2025-Q4", "2026-Q1", "2026-Q2"];

function fmt(n: number | null | undefined, digits = 1) {
  if (n == null) return "—";
  return n.toFixed(digits);
}

function bandColor(band: string) {
  if (band === "critical") return VS_COLORS.critical;
  if (band === "elevated") return VS_COLORS.orange;
  if (band === "moderate") return VS_COLORS.blue;
  return VS_COLORS.emerald;
}

export function ProjectSafetyDashboardView() {
  const [projectToken, setProjectToken] = useState<string>("");
  const [projectType, setProjectType] = useState<ProjectType>("transmission");
  const [region, setRegion] = useState<RegionCode>("CA-AB");
  const [scale, setScale] = useState<ScaleBand>("medium");
  const [period, setPeriod] = useState("2026-Q2");
  const [crossCategoryOptIn, setCrossCategoryOptIn] = useState(false);

  const url = useMemo(() => {
    const q = new URLSearchParams({
      projectType,
      region,
      scale,
      period,
      crossCategoryOptIn: crossCategoryOptIn ? "1" : "0",
    });
    if (projectToken) q.set("projectToken", projectToken);
    return `/api/v1/veripm-project-safety?${q}`;
  }, [projectToken, projectType, region, scale, period, crossCategoryOptIn]);

  const { data: dash, loading, error, fromCache, reload } =
    useCachedAggregate<ProjectSafetyDashboard>(url);

  useEffect(() => {
    if (!dash) return;
    setProjectToken(dash.selectors.projectToken);
    setProjectType(dash.selectors.projectType);
    setRegion(dash.selectors.region);
    setScale(dash.selectors.scale);
  }, [dash]);

  const catalogForType = useMemo(
    () =>
      (dash?.catalog ?? []).filter((c) =>
        crossCategoryOptIn ? true : c.projectType === projectType,
      ),
    [dash?.catalog, projectType, crossCategoryOptIn],
  );

  async function refresh() {
    const res = await fetch("/api/v1/veripm-project-safety", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectToken,
        projectType,
        region,
        scale,
        period,
        crossCategoryOptIn,
      }),
    });
    if (res.ok) {
      invalidateClientAggregate("/api/v1/veripm-project-safety");
      await reload({ bust: true });
    }
  }

  const risk = dash?.riskProfile;
  const latestInspection =
    dash?.intelligentInspectionTrends[dash.intelligentInspectionTrends.length - 1];
  const comparisonRows =
    dash?.industryComparison.map((r) => ({
      label: r.label,
      left: r.projectValue,
      right: r.industryValue,
      unit: "/200k",
      suppressed: r.suppressed,
    })) ?? [];
  const firstComparison = comparisonRows.find((r) => r.left != null && r.right != null);
  const insightChips = dash
    ? [
        {
          id: "project-risk",
          label: "Risk",
          value: risk ? `${risk.score} · ${risk.band}` : "—",
          tone:
            risk?.band === "critical"
              ? ("alert" as const)
              : risk?.band === "elevated"
                ? ("caution" as const)
                : ("info" as const),
          href: "#vs-risk",
        },
        {
          id: "project-peer",
          label: "Project vs industry",
          value:
            firstComparison && firstComparison.left != null && firstComparison.right != null
              ? `Δ ${(firstComparison.left - firstComparison.right).toFixed(2)}`
              : "—",
          tone: "info" as const,
          href: "#vs-comparison",
        },
        {
          id: "project-inspections",
          label: "Inspection coverage",
          value: latestInspection ? `${fmt(latestInspection.coveragePct, 1)}%` : "—",
          tone: "positive" as const,
          href: "#vs-inspections",
        },
      ]
    : [];

  return (
    <VsDashboardShell
      eyebrow="VeriPM Project Safety"
      title="Project-level safety intelligence"
      description="Leading and lagging indicators, incident and audit trends, Action Management aging, risk profile, and project vs industry comparison — normalized per 200,000 hours with tokenized project IDs."
      meta={
        dash
          ? `Rev ${dash.revision} · token ${dash.selectors.projectToken} · per ${dash.rules.hoursDenominator.toLocaleString()} hours · ${
              dash.rules.projectLevelOnly
                ? "project-level only"
                : "cross-category comparison on"
            }${fromCache ? " · cached aggregate" : ""}`
          : undefined
      }
    >
      <VsSection band="controls">
        <div className="flex flex-wrap items-center gap-2">
        <select
          value={projectType}
          onChange={(e) => {
            setProjectToken("");
            setProjectType(e.target.value as ProjectType);
          }}
        >
          {PROJECT_TYPES.map((t) => (
            <option key={t} value={t}>
              {PROJECT_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
        <select
          value={region}
          onChange={(e) => {
            setProjectToken("");
            setRegion(e.target.value as RegionCode);
          }}
        >
          {REGION_CODES.map((r) => (
            <option key={r} value={r}>
              {REGION_LABELS[r]}
            </option>
          ))}
        </select>
        <select
          value={scale}
          onChange={(e) => {
            setProjectToken("");
            setScale(e.target.value as ScaleBand);
          }}
        >
          {SCALE_BANDS.map((s) => (
            <option key={s} value={s}>
              {SCALE_LABELS[s]}
            </option>
          ))}
        </select>
        <select
          value={projectToken}
          onChange={(e) => setProjectToken(e.target.value)}
        >
          {catalogForType.length === 0 ? (
            <option value="">Select project…</option>
          ) : (
            catalogForType.map((c) => (
              <option key={c.token} value={c.token}>
                {c.label} · {REGION_LABELS[c.region]} · {SCALE_LABELS[c.scale]}
              </option>
            ))
          )}
        </select>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          {PERIODS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm vs-muted">
          <input
            type="checkbox"
            checked={crossCategoryOptIn}
            onChange={(e) => setCrossCategoryOptIn(e.target.checked)}
          />
          Cross-category comparison
        </label>
        <button type="button" className="vs-btn" onClick={() => void reload()}>
          Load
        </button>
        <button type="button" className="vs-btn vs-btn-primary" onClick={() => void refresh()}>
          Refresh telemetry
        </button>
        </div>
      </VsSection>

      {error ? (
        <p className="text-sm" style={{ color: VS_COLORS.critical }}>
          {error}
        </p>
      ) : null}
      {loading && !dash ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full bg-[var(--vs-slate)]" />
          <Skeleton className="h-40 w-full bg-[var(--vs-slate)]" />
        </div>
      ) : null}

      {dash ? (
        <>
          <InsightStrip chips={insightChips} cachedHint={fromCache} />

          <VsSection band="kpi" label="Safety indicators">
            {Object.values(dash.leading).map((m) => (
              <KpiTile
                key={m.key}
                label={m.label}
                value={fmt(m.value, m.unit === "pct" ? 1 : 2)}
                unit={m.unit === "per_200k" ? "/200k" : m.unit === "pct" ? "%" : undefined}
                tone="info"
              />
            ))}
            {Object.values(dash.lagging).map((m) => (
              <KpiTile
                key={m.key}
                label={m.label}
                value={fmt(m.value, m.unit === "score" ? 1 : 2)}
                tone={m.unit === "score" ? "caution" : "neutral"}
              />
            ))}
          </VsSection>

          <VsSection band="trend" label="Trend & comparison">
            <ComparisonPanel
              mode="project-vs-industry"
              title="Project vs industry"
              leftLabel={dash.selectors.projectToken}
              rightLabel={crossCategoryOptIn ? "Cross-category industry" : "Project-type industry"}
              rows={comparisonRows}
            />
            <TrendPanel
              title="Recordables /200k"
              series={dash.incidentTrends.recordables.map((p) => ({
                period: p.period,
                value: p.value,
              }))}
              rangeLabel="Incident trend"
            />
            <TrendPanel
              title="Near-miss /200k"
              series={dash.incidentTrends.nearMisses.map((p) => ({
                period: p.period,
                value: p.value,
              }))}
              rangeLabel="Leading signal"
            />
            <TrendPanel
              title="Lost-time /200k"
              series={dash.incidentTrends.lostTime.map((p) => ({
                period: p.period,
                value: p.value,
              }))}
              rangeLabel="Lagging signal"
            />
            <div className="vs-panel overflow-x-auto p-4">
              <p className="vs-eyebrow">Incident trends</p>
              <table className="mt-3 w-full min-w-[420px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--vs-border)] text-[11px] uppercase vs-muted">
                    <th className="py-2 font-medium">Period</th>
                    <th className="py-2 font-medium">Recordables /200k</th>
                    <th className="py-2 font-medium">Near-miss /200k</th>
                    <th className="py-2 font-medium">Lost-time /200k</th>
                  </tr>
                </thead>
                <tbody>
                  {dash.incidentTrends.recordables.map((_, i) => (
                    <tr
                      key={dash.incidentTrends.recordables[i]!.period}
                      className="border-b border-[var(--vs-border)]"
                    >
                      <td className="py-2">
                        {dash.incidentTrends.recordables[i]!.period}
                      </td>
                      <td className="py-2 tabular-nums">
                        {fmt(dash.incidentTrends.recordables[i]!.value, 2)}
                      </td>
                      <td className="py-2 tabular-nums">
                        {fmt(dash.incidentTrends.nearMisses[i]?.value, 2)}
                      </td>
                      <td className="py-2 tabular-nums">
                        {fmt(dash.incidentTrends.lostTime[i]?.value, 2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </VsSection>

          <VsSection band="detail" label="Detail">
            <div className="vs-panel overflow-x-auto p-4">
              <p className="vs-eyebrow">Focus audit trends</p>
              <table className="mt-3 w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--vs-border)] text-[11px] uppercase vs-muted">
                    <th className="py-2 font-medium">Period</th>
                    <th className="py-2 font-medium">Audits</th>
                    <th className="py-2 font-medium">Findings /200k</th>
                    <th className="py-2 font-medium">Critical /200k</th>
                    <th className="py-2 font-medium">Closure %</th>
                  </tr>
                </thead>
                <tbody>
                  {dash.focusAuditTrends.map((r) => (
                    <tr key={r.period} className="border-b border-[var(--vs-border)]">
                      <td className="py-2">{r.period}</td>
                      <td className="py-2 tabular-nums">{r.auditsCompleted}</td>
                      <td className="py-2 tabular-nums">{fmt(r.findingsRate, 2)}</td>
                      <td className="py-2 tabular-nums">
                        {fmt(r.criticalFindingsRate, 2)}
                      </td>
                      <td className="py-2 tabular-nums">{fmt(r.closurePct, 1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {latestInspection ? (
              <InspectionTrendCard
                title="Intelligent inspections"
                completionPct={latestInspection.coveragePct}
                ratePer200k={latestInspection.aiFlaggedRate}
                aiFlagged={latestInspection.inspectionsCompleted}
                period={latestInspection.period}
              />
            ) : null}

            <div className="vs-panel overflow-x-auto p-4" id="vs-inspections">
              <p className="vs-eyebrow">Intelligent inspection trends</p>
              <table className="mt-3 w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--vs-border)] text-[11px] uppercase vs-muted">
                    <th className="py-2 font-medium">Period</th>
                    <th className="py-2 font-medium">Inspections</th>
                    <th className="py-2 font-medium">AI-flagged /200k</th>
                    <th className="py-2 font-medium">High-risk closure %</th>
                    <th className="py-2 font-medium">Coverage %</th>
                  </tr>
                </thead>
                <tbody>
                  {dash.intelligentInspectionTrends.map((r) => (
                    <tr key={r.period} className="border-b border-[var(--vs-border)]">
                      <td className="py-2">{r.period}</td>
                      <td className="py-2 tabular-nums">{r.inspectionsCompleted}</td>
                      <td className="py-2 tabular-nums">{fmt(r.aiFlaggedRate, 2)}</td>
                      <td className="py-2 tabular-nums">
                        {fmt(r.highRiskClosurePct, 1)}
                      </td>
                      <td className="py-2 tabular-nums">{fmt(r.coveragePct, 1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ActionAgingHistogram
              title="Action Management aging (days open)"
              bins={dash.correctiveActionAging.aging.map((b) => ({
                bucket: b.bucket,
                corrective: b.count,
                preventive: Math.max(0, Math.round(b.count * 0.35)),
              }))}
            />

            <div className="vs-panel p-4">
              <p className="vs-eyebrow">Action Management summary</p>
              <p className="mt-3 text-sm vs-muted">
                Open Corrective Actions {dash.correctiveActionAging.openCount} · overdue{" "}
                {dash.correctiveActionAging.overdueCount} · avg age{" "}
                {fmt(dash.correctiveActionAging.avgAgeDays, 1)}d · on-time closure{" "}
                {fmt(dash.correctiveActionAging.onTimeClosurePct, 1)}%
              </p>
              <a href="/pm/action-management" className="mt-3 inline-block text-sm">
                Open Action Management →
              </a>
            </div>

            {risk ? (
              <RiskGauge label="Project risk profile" score={risk.score} band={risk.band} />
            ) : null}

            <SeverityBars
              title="Action aging distribution"
              segments={dash.correctiveActionAging.aging.map((b) => ({
                label: b.bucket,
                share: b.count,
              }))}
            />

            <div className="vs-panel overflow-x-auto p-4 md:col-span-2">
              <p className="vs-eyebrow">Project vs industry</p>
              <p className="mt-2 text-xs vs-muted">
                {crossCategoryOptIn
                  ? "Comparing across all project categories (opt-in)."
                  : "Peers limited to same project type (project-level only)."}
              </p>
              <table className="mt-3 w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--vs-border)] text-[11px] uppercase vs-muted">
                    <th className="py-2 font-medium">Metric</th>
                    <th className="py-2 font-medium">Project</th>
                    <th className="py-2 font-medium">Industry</th>
                    <th className="py-2 font-medium">Δ</th>
                  </tr>
                </thead>
                <tbody>
                  {dash.industryComparison.map((r) => (
                    <tr key={r.metric} className="border-b border-[var(--vs-border)]">
                      <td className="py-2">{r.label}</td>
                      <td className="py-2 tabular-nums">{fmt(r.projectValue, 2)}</td>
                      <td className="py-2 tabular-nums">
                        {r.suppressed ? "hidden" : fmt(r.industryValue, 2)}
                      </td>
                      <td className="py-2 tabular-nums">
                        {r.suppressed || r.delta == null
                          ? "—"
                          : `${r.delta > 0 ? "+" : ""}${fmt(r.delta, 2)}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {risk ? (
              <div className="vs-panel p-4 md:col-span-2" id="vs-risk">
                <p className="vs-eyebrow">Risk drivers</p>
                <p
                  className="mt-3 text-3xl font-semibold tabular-nums"
                  style={{ color: bandColor(risk.band) }}
                >
                  {risk.score}
                  <span className="ml-2 text-base font-normal capitalize">{risk.band}</span>
                </p>
                <p className="mt-1 text-xs vs-muted">
                  Confidence {Math.round(risk.confidence * 100)}%
                </p>
                <ul className="mt-3 space-y-1 text-sm vs-muted">
                  {risk.drivers.map((d) => (
                    <li key={d.code}>
                      <span style={{ color: VS_COLORS.white }}>{d.label}</span>
                      {" · weight "}
                      {fmt(d.weight, 1)}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </VsSection>

          <VsSection band="narrative" label="Narrative">
            <AiInsightPanel
              title="Project intelligence summary"
              items={
                risk
                  ? risk.drivers.map((d) => ({
                      id: d.code,
                      tone:
                        risk.band === "critical"
                          ? "alert"
                          : risk.band === "elevated"
                            ? "caution"
                            : "neutral",
                      headline: d.label,
                      body: `Risk driver weight ${fmt(d.weight, 1)} for ${dash.selectors.projectToken}.`,
                      confidence: risk.confidence,
                    }))
                  : []
              }
            />
            <div className="vs-panel p-4">
              <p className="vs-eyebrow">Project context</p>
              <p className="mt-3 text-sm vs-muted">
                {PROJECT_TYPE_LABELS[dash.selectors.projectType]} ·{" "}
                {REGION_LABELS[dash.selectors.region]} · {SCALE_LABELS[dash.selectors.scale]} ·{" "}
                {period}
              </p>
            </div>
          </VsSection>

          <VeriPmAiIntelligencePanel page="project-safety" />
        </>
      ) : null}
    </VsDashboardShell>
  );
}
