"use client";

import { useMemo, useState } from "react";
import type { FieldOpsDashboard } from "@/lib/fieldos-operations/types";
import { Skeleton } from "@/components/ui/skeleton";
import {
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

function severityColor(s: string) {
  if (s === "critical" || s === "high") return VS_COLORS.critical;
  if (s === "warning" || s === "medium" || s === "elevated") return VS_COLORS.orange;
  if (s === "moderate") return VS_COLORS.blue;
  return VS_COLORS.emerald;
}

export function FieldOperationsDashboardView() {
  const [regionCode, setRegionCode] = useState("GLB");
  const [period, setPeriod] = useState("2026-Q2");

  const url = useMemo(() => {
    const q = new URLSearchParams({ regionCode, period });
    return `/api/v1/fieldos-operations?${q}`;
  }, [regionCode, period]);

  const { data: dash, loading, error, fromCache, reload } =
    useCachedAggregate<FieldOpsDashboard>(url);

  async function refresh() {
    const res = await fetch("/api/v1/fieldos-operations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ regionCode, period }),
    });
    if (res.ok) {
      invalidateClientAggregate("/api/v1/fieldos-operations");
      await reload({ bust: true });
    }
  }

  const latestInspection = dash?.inspectionTrends[dash.inspectionTrends.length - 1];
  const highestRisk = dash?.regionalRiskTrends.find((r) => !r.suppressed);
  const regionalPeers = dash?.regionalRiskTrends.filter((r) => !r.suppressed).slice(0, 2) ?? [];
  const regionA = regionalPeers[0];
  const regionB = regionalPeers[1];
  const comparisonRows =
    regionA && regionB
      ? [
          {
            label: "Risk score",
            left: regionA.riskScore,
            right: regionB.riskScore,
          },
          {
            label: "Findings",
            left: regionA.trifProxy,
            right: regionB.trifProxy,
            unit: "/200k",
          },
          {
            label: "Hazard",
            left: regionA.hazardRate,
            right: regionB.hazardRate,
            unit: "/200k",
          },
        ]
      : [];
  const insightChips = dash
    ? [
        {
          id: "field-inspections",
          label: "Inspection completion",
          value: latestInspection ? `${fmt(latestInspection.completionRatePct, 1)}%` : "—",
          tone: "positive" as const,
          href: "#vs-inspections",
        },
        {
          id: "field-risk",
          label: "Highest regional risk",
          value: highestRisk ? `${highestRisk.label} · ${highestRisk.riskScore}` : "—",
          tone:
            highestRisk?.band === "critical"
              ? ("alert" as const)
              : highestRisk?.band === "elevated"
                ? ("caution" as const)
                : ("info" as const),
          href: "#vs-comparison",
        },
        {
          id: "field-anomalies",
          label: "AI anomalies",
          value: `${dash.anomalies.length}`,
          tone: dash.anomalies.length > 2 ? ("alert" as const) : ("neutral" as const),
          href: "#vs-anomalies",
        },
      ]
    : [];

  return (
    <VsDashboardShell
      eyebrow="FieldOS Field Operations"
      title="Real-time field intelligence"
      description="Inspection trends, hazard patterns, near-miss analytics, equipment alerts, competency signals, regional risk, and AI anomaly detection — normalized and anonymized with Global→City regional drilldown."
      meta={
        dash
          ? `Rev ${dash.revision} · n≥${dash.rules.minSample} · per ${dash.rules.hoursDenominator.toLocaleString()} hours · anonymized · regional drilldown${fromCache ? " · cached aggregate" : ""}`
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
                <span className="ml-1 text-[10px] uppercase vs-muted">
                  {c.level.replace("_", " ")}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs vs-muted">End of drilldown (city band).</p>
        )}
        <div className="flex flex-wrap items-center gap-2">
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
            Pull live telemetry
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

          <VsSection band="kpi" label="Operational signals">
            <KpiTile
              label="Inspection completion"
              value={fmt(latestInspection?.completionRatePct, 1)}
              unit="%"
              tone="positive"
              sparkline={dash.inspectionTrends.map((r) => r.completionRatePct)}
            />
            <KpiTile
              label="Open findings"
              value={latestInspection?.openFindings ?? "—"}
              tone="caution"
              sparkline={dash.inspectionTrends.map((r) => r.openFindings)}
            />
            <KpiTile
              label="Near-miss rate"
              value={fmt(dash.nearMiss.totalRate, 2)}
              unit="/200k"
              tone="info"
            />
            <KpiTile
              label="High-potential near-miss"
              value={fmt(dash.nearMiss.highPotentialPct, 1)}
              unit="%"
              tone="critical"
            />
            <KpiTile
              label="Equipment alerts"
              value={dash.equipmentAlerts.length}
              tone={dash.equipmentAlerts.length ? "caution" : "positive"}
            />
            <KpiTile
              label="AI anomalies"
              value={dash.anomalies.length}
              tone={dash.anomalies.length > 2 ? "critical" : "neutral"}
            />
          </VsSection>

          <VsSection band="trend" label="Trend & regional comparison">
            <ComparisonPanel
              mode="region-vs-region"
              title="Top regional risk comparison"
              leftLabel={regionA?.label ?? "Region A"}
              rightLabel={regionB?.label ?? "Region B"}
              rows={comparisonRows}
            />
            <TrendPanel
              title="Inspection completion"
              series={dash.inspectionTrends.map((r) => ({
                period: r.period,
                value: r.completionRatePct,
              }))}
              rangeLabel="Completion %"
            />
            <TrendPanel
              title="Inspection rate"
              series={dash.inspectionTrends.map((r) => ({
                period: r.period,
                value: r.ratePer200k,
              }))}
              rangeLabel="Rate /200k"
            />
            <TrendPanel
              title="Near-miss trend"
              series={dash.nearMiss.trend.map((r) => ({
                period: r.period,
                value: r.ratePer200k,
              }))}
              rangeLabel="Rate /200k"
            />
            <div className="vs-panel overflow-x-auto p-4" id="vs-inspections">
              <p className="vs-eyebrow">Field inspection trends</p>
              <table className="mt-3 w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--vs-border)] text-[11px] uppercase vs-muted">
                    <th className="py-2 font-medium">Period</th>
                    <th className="py-2 font-medium">Completed</th>
                    <th className="py-2 font-medium">Open findings</th>
                    <th className="py-2 font-medium">Completion %</th>
                    <th className="py-2 font-medium">Rate /200k</th>
                  </tr>
                </thead>
                <tbody>
                  {dash.inspectionTrends.map((r) => (
                    <tr key={r.period} className="border-b border-[var(--vs-border)]">
                      <td className="py-2">{r.period}</td>
                      <td className="py-2 tabular-nums">{r.completed}</td>
                      <td className="py-2 tabular-nums">{r.openFindings}</td>
                      <td className="py-2 tabular-nums">{fmt(r.completionRatePct, 1)}</td>
                      <td className="py-2 tabular-nums">{fmt(r.ratePer200k, 2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </VsSection>

          <VsSection band="detail" label="Detail">
            {latestInspection ? (
              <InspectionTrendCard
                title="Latest inspection cycle"
                completionPct={latestInspection.completionRatePct}
                ratePer200k={latestInspection.ratePer200k}
                aiFlagged={latestInspection.openFindings}
                period={latestInspection.period}
              />
            ) : null}

            <SeverityBars
              title="Hazard share"
              segments={dash.hazardPatterns.map((h) => ({
                label: h.label,
                share: h.sharePct,
              }))}
            />

            {highestRisk ? (
              <RiskGauge
                label="Regional risk"
                score={highestRisk.riskScore}
                band={highestRisk.band}
              />
            ) : null}

            <div className="vs-panel p-4">
              <p className="vs-eyebrow">Hazard report patterns</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {dash.hazardPatterns.map((h) => (
                <div key={h.hazardClass} className="border-b border-[var(--vs-border)] py-2">
                  <p className="text-[11px] uppercase tracking-wide vs-muted">{h.label}</p>
                  <p className="mt-1 text-xl font-semibold tabular-nums">
                    {fmt(h.ratePer200k, 2)}
                    <span className="ml-1 text-xs font-normal vs-muted">/200k</span>
                  </p>
                  <p className="text-xs vs-muted">
                    {fmt(h.sharePct, 1)}% share · Δ {h.trendDelta >= 0 ? "+" : ""}
                    {fmt(h.trendDelta, 2)}
                  </p>
                </div>
              ))}
              </div>
            </div>

            <div className="vs-panel p-4 md:col-span-2">
              <p className="vs-eyebrow">Near-miss analytics</p>
              <p className="mt-3 text-sm vs-muted">
                Total rate {fmt(dash.nearMiss.totalRate, 2)}/200k · high-potential{" "}
                {fmt(dash.nearMiss.highPotentialPct, 1)}%
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {dash.nearMiss.byCategory.map((c) => (
                <div key={c.category} className="border-b border-[var(--vs-border)] py-2">
                  <p className="text-[11px] uppercase tracking-wide vs-muted">{c.label}</p>
                  <p className="text-lg font-semibold tabular-nums">
                    {fmt(c.ratePer200k, 2)}
                  </p>
                  <p className="text-xs vs-muted">{fmt(c.sharePct, 1)}%</p>
                </div>
              ))}
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[360px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--vs-border)] text-[11px] uppercase vs-muted">
                    <th className="py-2 font-medium">Period</th>
                    <th className="py-2 font-medium">Count</th>
                    <th className="py-2 font-medium">Rate /200k</th>
                  </tr>
                </thead>
                <tbody>
                  {dash.nearMiss.trend.map((t) => (
                    <tr key={t.period} className="border-b border-[var(--vs-border)]">
                      <td className="py-2">{t.period}</td>
                      <td className="py-2 tabular-nums">{t.value}</td>
                      <td className="py-2 tabular-nums">{fmt(t.ratePer200k, 2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>

            <div className="vs-panel p-4 md:col-span-2">
              <p className="vs-eyebrow">Equipment safety alerts</p>
            {dash.equipmentAlerts.length === 0 ? (
              <p className="mt-3 text-sm vs-muted">No active alerts in this region.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {dash.equipmentAlerts.slice(0, 12).map((a) => (
                  <li
                    key={a.token}
                    className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-[var(--vs-border)] py-2 text-sm"
                  >
                    <span
                      className="font-semibold uppercase"
                      style={{ color: severityColor(a.severity) }}
                    >
                      {a.severity}
                    </span>
                    <span>{a.message}</span>
                    <span className="text-xs vs-muted">
                      {a.equipmentClass} · {a.token} · {a.regionCode}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            </div>

            <div className="vs-panel p-4 md:col-span-2">
              <p className="vs-eyebrow">Worker competency signals</p>
              <div className="mt-3 space-y-2">
              {dash.competencySignals.map((c) => (
                <div key={c.skillBand} className="flex items-center gap-3 text-sm">
                  <span className="w-36 shrink-0 vs-muted">{c.label}</span>
                  <div className="h-2 flex-1 bg-[var(--vs-panel)]">
                    <div
                      className="h-2"
                      style={{ background: VS_COLORS.blue, width: `${Math.min(100, c.currentPct)}%` }}
                    />
                  </div>
                  <span className="w-16 tabular-nums text-right">
                    {fmt(c.currentPct, 0)}%
                  </span>
                  <span className="w-28 text-xs vs-muted">
                    {c.suppressed
                      ? `n<${dash.rules.minSample}`
                      : `n=${c.anonymizedWorkerCount}`}{" "}
                    · gap {c.gapScore}
                  </span>
                </div>
              ))}
              </div>
            </div>

            <div className="vs-panel overflow-x-auto p-4 md:col-span-2">
              <p className="vs-eyebrow">Region-specific risk trends</p>
              <table className="mt-3 w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--vs-border)] text-[11px] uppercase vs-muted">
                    <th className="py-2 font-medium">Region</th>
                    <th className="py-2 font-medium">Risk</th>
                    <th className="py-2 font-medium">Findings /200k</th>
                    <th className="py-2 font-medium">Hazard /200k</th>
                    <th className="py-2 font-medium">n</th>
                  </tr>
                </thead>
                <tbody>
                  {dash.regionalRiskTrends.map((r) => (
                    <tr key={r.regionCode} className="border-b border-[var(--vs-border)]">
                      <td className="py-2">
                        <button
                          type="button"
                          className="vs-drill-crumb"
                          onClick={() => setRegionCode(r.regionCode)}
                        >
                          {r.label}
                        </button>
                      </td>
                      <td
                        className="py-2 tabular-nums"
                        style={{ color: severityColor(r.band) }}
                      >
                        {r.suppressed ? "hidden" : `${r.riskScore} ${r.band}`}
                      </td>
                      <td className="py-2 tabular-nums">
                        {r.suppressed ? "—" : fmt(r.trifProxy, 2)}
                      </td>
                      <td className="py-2 tabular-nums">
                        {r.suppressed ? "—" : fmt(r.hazardRate, 2)}
                      </td>
                      <td className="py-2 tabular-nums vs-muted">
                        {r.suppressed ? `<${dash.rules.minSample}` : r.entityCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </VsSection>

          <VsSection band="narrative" label="Narrative">
            <div id="vs-anomalies" />
            <AiInsightPanel
              title="AI anomaly detection"
              items={dash.anomalies.map((a) => ({
                id: a.id,
                tone:
                  a.severity === "high"
                    ? "alert"
                    : a.severity === "medium"
                      ? "caution"
                      : "neutral",
                headline: `${a.severity} · ${a.kind} · ${a.headline}`,
                body: `${a.detail}\nscore ${a.score} · ${a.metric} · ${a.regionCode}`,
                confidence: a.confidence,
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
        </>
      ) : null}
    </VsDashboardShell>
  );
}
