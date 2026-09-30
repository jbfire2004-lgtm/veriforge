"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { TrainingCompetencyDashboard } from "@/lib/vericore-training-competency/types";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AiInsightPanel,
  ComparisonPanel,
  CompetencyHeatmap,
  InsightStrip,
  KpiTile,
  RiskGauge,
  TrendPanel,
  VsDashboardShell,
  VsSection,
} from "@/components/verisuite-intelligence-ui";
import { VS_COLORS } from "@/lib/verisuite-intelligence-ui/tokens";
import {
  invalidateClientAggregate,
  useCachedAggregate,
} from "@/lib/verisuite-intelligence-ui/useCachedAggregate";
import { VeriPmAiIntelligencePanel } from "@/components/veripm-ai-intelligence";
import { SmsAiIntegrationPanel } from "@/components/verisuite-sms-ai/SmsAiIntegrationPanel";

const PERIODS = ["2025-Q4", "2026-Q1", "2026-Q2"];
const BUCKETS = ["0-30d", "31-60d", "61-90d", "91-180d", "expired"] as const;

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

export function TrainingCompetencyDashboardView() {
  const [regionCode, setRegionCode] = useState("GLB");
  const [period, setPeriod] = useState("2026-Q2");

  const url = useMemo(() => {
    const q = new URLSearchParams({ regionCode, period });
    return `/api/v1/vericore-training-competency?${q}`;
  }, [regionCode, period]);

  const { data: dash, loading, error, fromCache, reload } =
    useCachedAggregate<TrainingCompetencyDashboard>(url);

  async function refresh() {
    const res = await fetch("/api/v1/vericore-training-competency", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ regionCode, period }),
    });
    if (res.ok) {
      invalidateClientAggregate("/api/v1/vericore-training-competency");
      await reload({ bust: true });
    }
  }

  const heatSkills = useMemo(() => {
    if (!dash) return [];
    const seen = new Map<string, string>();
    for (const c of dash.expiryHeatmap) seen.set(c.skillCode, c.skillLabel);
    return [...seen.entries()];
  }, [dash]);

  const regionLabels = useMemo(() => {
    if (!dash) return [] as string[];
    const seen = new Map<string, string>();
    for (const s of dash.skillByRegion) seen.set(s.regionCode, s.regionLabel);
    return [...seen.entries()];
  }, [dash]);

  const risk = dash?.workforceRisk;
  const latestCompletion = dash?.completionTrends[dash.completionTrends.length - 1];
  const regionSummaries = useMemo(() => {
    if (!dash) return [];
    return [...new Map(dash.skillByRegion.map((s) => [s.regionCode, s.regionLabel])).entries()]
      .map(([code, label]) => {
        const rows = dash.skillByRegion.filter((s) => s.regionCode === code && !s.suppressed);
        const avg =
          rows.length > 0
            ? rows.reduce((sum, row) => sum + row.currentPct, 0) / rows.length
            : null;
        return { code, label, avg, count: rows.length };
      })
      .filter((r) => r.avg != null)
      .slice(0, 2);
  }, [dash]);
  const regionA = regionSummaries[0];
  const regionB = regionSummaries[1];
  const comparisonRows =
    regionA && regionB
      ? [
          {
            label: "Avg competency",
            left: regionA.avg,
            right: regionB.avg,
            unit: "%",
          },
          {
            label: "Skills visible",
            left: regionA.count,
            right: regionB.count,
          },
        ]
      : [];
  const insightChips = dash
    ? [
        {
          id: "core-completion",
          label: "Completion",
          value: latestCompletion ? `${fmt(latestCompletion.completionPct, 1)}%` : "—",
          tone: "positive" as const,
          href: "#vs-comparison",
        },
        {
          id: "core-risk",
          label: "Workforce risk",
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
          id: "core-gaps",
          label: "Competency gaps",
          value: `${dash.competencyGaps.length}`,
          tone: "caution" as const,
          href: "#vs-gaps",
        },
      ]
    : [];

  return (
    <VsDashboardShell
      eyebrow="VeriCore Training & Competency"
      title="Workforce training intelligence"
      description="Completion trends, competency gaps, certification expiry heatmaps, regional skill distribution, AI competency–incident correlation, and workforce risk — fully anonymized with regional drilldown."
      meta={
        dash
          ? `Rev ${dash.revision} · n≥${dash.rules.minSample} · anonymized · regional drilldown · rates / ${dash.rules.hoursDenominator.toLocaleString()} hours${fromCache ? " · cached aggregate" : ""}`
          : undefined
      }
    >
      <VsSection band="controls">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="vs-eyebrow">Region</span>
          {(dash?.breadcrumbs ?? [{ code: "GLB", label: "Global" }]).map((b, i) => (
            <span key={b.code} className="flex items-center gap-2">
              {i > 0 ? <span className="vs-muted">/</span> : null}
              <button
                type="button"
                className="vs-drill-crumb"
                style={{ color: b.code === regionCode ? VS_COLORS.blue : VS_COLORS.muted }}
                onClick={() => setRegionCode(b.code)}
              >
                {b.label}
              </button>
            </span>
          ))}
        </div>
        {dash?.children?.length ? (
          <div className="flex flex-wrap gap-2">
            {dash.children.map((c) => (
              <button
                key={c.code}
                type="button"
                className="vs-btn"
                onClick={() => setRegionCode(c.code)}
              >
                {c.label}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs vs-muted">End of drilldown (city band).</p>
        )}
        <div className="flex flex-wrap gap-2">
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
          <button type="button" className="vs-btn" onClick={() => void reload()}>
            Refresh
          </button>
          <button type="button" className="vs-btn vs-btn-primary" onClick={() => void refresh()}>
            Sync training feed
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

          <VsSection band="kpi" label="Competency indicators">
            <KpiTile
              label="Completion"
              value={fmt(latestCompletion?.completionPct, 1)}
              unit="%"
              tone="positive"
              sparkline={dash.completionTrends.map((r) => r.completionPct)}
            />
            <KpiTile
              label="Overdue"
              value={fmt(latestCompletion?.overduePct, 1)}
              unit="%"
              tone="caution"
              sparkline={dash.completionTrends.map((r) => r.overduePct)}
            />
            <KpiTile
              label="Assigned"
              value={latestCompletion?.assigned ?? "—"}
              tone="neutral"
            />
            <KpiTile
              label="Completed"
              value={latestCompletion?.completed ?? "—"}
              tone="info"
            />
            <KpiTile
              label="Competency gaps"
              value={dash.competencyGaps.length}
              tone="caution"
            />
            <KpiTile
              label="Correlations"
              value={dash.correlations.length}
              tone="info"
            />
          </VsSection>

          <VsSection band="trend" label="Trend & regional comparison">
            <ComparisonPanel
              mode="region-vs-region"
              title="Top region competency comparison"
              leftLabel={regionA?.label ?? "Region A"}
              rightLabel={regionB?.label ?? "Region B"}
              rows={comparisonRows}
            />
            <TrendPanel
              title="Training completion"
              series={dash.completionTrends.map((r) => ({
                period: r.period,
                value: r.completionPct,
              }))}
              rangeLabel="Completion %"
            />
            <TrendPanel
              title="Overdue trend"
              series={dash.completionTrends.map((r) => ({
                period: r.period,
                value: r.overduePct,
              }))}
              rangeLabel="Overdue %"
            />
            <div className="vs-panel overflow-x-auto p-4">
              <p className="vs-eyebrow">Training completion trends</p>
              <table className="mt-3 w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--vs-border)] text-[11px] uppercase vs-muted">
                    <th className="py-2 font-medium">Period</th>
                    <th className="py-2 font-medium">Assigned</th>
                    <th className="py-2 font-medium">Completed</th>
                    <th className="py-2 font-medium">Completion %</th>
                    <th className="py-2 font-medium">Overdue %</th>
                  </tr>
                </thead>
                <tbody>
                  {dash.completionTrends.map((r) => (
                    <tr key={r.period} className="border-b border-[var(--vs-border)]">
                      <td className="py-2">{r.period}</td>
                      <td className="py-2 tabular-nums">{r.assigned}</td>
                      <td className="py-2 tabular-nums">{r.completed}</td>
                      <td className="py-2 tabular-nums">{fmt(r.completionPct, 1)}</td>
                      <td className="py-2 tabular-nums">{fmt(r.overduePct, 1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </VsSection>

          <VsSection band="detail" label="Detail">
            <div className="vs-panel p-4 md:col-span-2" id="vs-gaps">
              <p className="vs-eyebrow">Competency gaps</p>
              <div className="mt-3 space-y-2">
              {dash.competencyGaps.map((g) => (
                <div key={g.skillCode} className="flex items-center gap-3 text-sm">
                  <span className="w-40 shrink-0 vs-muted">{g.label}</span>
                  <div className="h-2 flex-1 bg-[var(--vs-panel)]">
                    <div
                      className="h-2"
                      style={{
                        width: `${Math.min(100, g.currentPct)}%`,
                        background: VS_COLORS.blue,
                      }}
                    />
                  </div>
                  <span className="w-20 tabular-nums text-right">
                    {fmt(g.currentPct, 0)}%
                  </span>
                  <span className="w-28 text-xs vs-muted">
                    gap {fmt(g.gapPct, 1)} ·{" "}
                    {g.suppressed ? `n<${dash.rules.minSample}` : `n=${g.anonymizedWorkerCount}`}
                  </span>
                </div>
              ))}
              </div>
            </div>

            <CompetencyHeatmap
              title="Certification expiry heatmap"
              rows={heatSkills.map(([, label]) => label)}
              cols={[...BUCKETS]}
              cells={heatSkills.flatMap(([code, label]) =>
                BUCKETS.map((bucket) => {
                  const cell = dash.expiryHeatmap.find(
                    (c) => c.skillCode === code && c.bucket === bucket,
                  );
                  return {
                    row: label,
                    col: bucket,
                    value: cell?.count ?? 0,
                    intensity: cell?.intensity ?? 0,
                  };
                }),
              )}
            />

            <div className="vs-panel overflow-x-auto p-4 md:col-span-2">
              <p className="vs-eyebrow">Skill distribution by region</p>
              <table className="mt-3 w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--vs-border)] text-[11px] uppercase vs-muted">
                    <th className="py-2 font-medium">Skill</th>
                    {regionLabels.map(([code, label]) => (
                      <th key={code} className="py-2 font-medium">
                        <button
                          type="button"
                          className="vs-drill-crumb"
                          onClick={() => setRegionCode(code)}
                        >
                          {label}
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...new Set(dash.skillByRegion.map((s) => s.skillCode))].map(
                    (skillCode) => {
                      const label =
                        dash.skillByRegion.find((s) => s.skillCode === skillCode)
                          ?.skillLabel ?? skillCode;
                      return (
                        <tr key={skillCode} className="border-b border-[var(--vs-border)]">
                          <td className="py-2">{label}</td>
                          {regionLabels.map(([code]) => {
                            const cell = dash.skillByRegion.find(
                              (s) =>
                                s.skillCode === skillCode && s.regionCode === code,
                            );
                            return (
                              <td key={code} className="py-2 tabular-nums">
                                {cell?.suppressed
                                  ? "hidden"
                                  : `${fmt(cell?.currentPct, 0)}%`}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>

            <div className="vs-panel p-4 md:col-span-2">
              <p className="vs-eyebrow">AI competency ↔ incident correlation</p>
              <div className="mt-3 space-y-3">
              {dash.correlations.map((c) => (
                <div
                  key={c.skillCode}
                  className="rounded-[3px] border border-[var(--vs-border)] px-4 py-3"
                >
                  <div className="flex flex-wrap items-baseline gap-3">
                    <p className="text-sm font-semibold">{c.skillLabel}</p>
                    <span className="text-xs tabular-nums vs-muted">
                      competency {fmt(c.competencyPct, 1)}% · incidents{" "}
                      {fmt(c.incidentRatePer200k, 2)}/200k · r=
                      {fmt(c.correlationStrength, 2)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm vs-muted">{c.insight}</p>
                </div>
              ))}
              </div>
            </div>

            {risk ? (
              <RiskGauge label="Workforce risk scoring" score={risk.score} band={risk.band} />
            ) : null}
            {risk ? (
              <div className="vs-panel p-4" id="vs-risk">
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
              title="Competency intelligence summary"
              items={dash.correlations.map((c) => ({
                id: c.skillCode,
                tone: c.correlationStrength < -0.5 ? "alert" : "caution",
                headline: c.skillLabel,
                body: `${c.insight}\ncompetency ${fmt(c.competencyPct, 1)}% · incidents ${fmt(
                  c.incidentRatePer200k,
                  2,
                )}/200k · r=${fmt(c.correlationStrength, 2)}`,
              }))}
            />
            <div className="vs-panel p-4">
              <p className="vs-eyebrow">Regional drilldown state</p>
              <p className="mt-3 text-sm vs-muted">
                Active region {regionCode} · period {period} ·{" "}
                {dash.children.length ? `${dash.children.length} child regions` : "city band"}
              </p>
            </div>
          </VsSection>

          <VsSection band="trend" label="Competency risk forecast">
            <TrendPanel
              title="Predicted incident rate /200k from competency gaps"
              series={dash.riskForecast.map((p) => ({
                period: p.period,
                value: p.predictedIncidentRate,
              }))}
              rangeLabel="Next 6 mo"
            />
            <div className="vs-panel p-4 text-xs" style={{ color: VS_COLORS.muted }}>
              <p className="vs-eyebrow">Primary gap driver</p>
              <p className="mt-2" style={{ color: VS_COLORS.white }}>
                {dash.riskForecast[0]?.primaryGapSkill ?? "—"}
              </p>
              <p className="mt-2">
                Forecast bands use competency gaps + incident correlation to estimate
                likelihood pressure.
              </p>
            </div>
          </VsSection>

          <VsSection band="narrative" label="Cross-page intelligence">
            <div className="flex flex-wrap gap-4 text-xs">
              <Link href={dash.links.jhaFlha} style={{ color: VS_COLORS.blue }}>
                JHA updates →
              </Link>
              <Link href={dash.links.meetings} style={{ color: VS_COLORS.blue }}>
                Safety Meetings →
              </Link>
              <Link href={dash.links.training} style={{ color: VS_COLORS.blue }}>
                Training modules →
              </Link>
              <Link href={dash.links.incidents} style={{ color: VS_COLORS.blue }}>
                Incidents →
              </Link>
              <Link href={dash.links.inspections} style={{ color: VS_COLORS.blue }}>
                Inspections →
              </Link>
            </div>
          </VsSection>

          <VsSection band="narrative" label="SMS AI · competency (AI-15)">
            <SmsAiIntegrationPanel
              page="training"
              companyId={1}
              projectId={1}
              title="Competency risk forecasting"
              defaultAcceptAction="create_action"
            />
          </VsSection>

          <VeriPmAiIntelligencePanel page="training" />
        </>
      ) : null}
    </VsDashboardShell>
  );
}
