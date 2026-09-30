"use client";

import { useMemo, useState } from "react";
import type {
  Industry,
  SmartDashboardSnapshot,
} from "@/lib/smart-dashboard-engine/types";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AiInsightPanel,
  ComparisonPanel,
  InsightStrip,
  TrendPanel,
  VsDashboardShell,
  VsSection,
} from "@/components/verisuite-intelligence-ui";
import { VS_COLORS } from "@/lib/verisuite-intelligence-ui/tokens";
import {
  invalidateClientAggregate,
  useCachedAggregate,
} from "@/lib/verisuite-intelligence-ui/useCachedAggregate";

const INDUSTRIES: Industry[] = ["mining", "construction", "manufacturing"];

function fmt(n: number | null | undefined, digits = 2) {
  if (n == null) return "—";
  return n.toFixed(digits);
}

function severityColor(s: string) {
  if (s === "critical" || s === "high" || s === "alert") return VS_COLORS.critical;
  if (s === "medium" || s === "elevated" || s === "caution") return VS_COLORS.orange;
  if (s === "moderate") return VS_COLORS.blue;
  return VS_COLORS.emerald;
}

export function SmartDashboardEngineView() {
  const [industry, setIndustry] = useState<Industry>("construction");

  const url = useMemo(() => {
    const q = new URLSearchParams({ industry, period: "2026-Q2" });
    return `/api/v1/smart-dashboard?${q}`;
  }, [industry]);

  const { data: snap, loading, error, fromCache, reload } =
    useCachedAggregate<SmartDashboardSnapshot>(url);

  async function recompute() {
    const res = await fetch("/api/v1/smart-dashboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ industry, period: "2026-Q2" }),
    });
    if (res.ok) {
      invalidateClientAggregate("/api/v1/smart-dashboard");
      await reload({ bust: true });
    }
  }

  const latest = (metric: keyof SmartDashboardSnapshot["series"]) => {
    const series = snap?.series[metric] ?? [];
    return series[series.length - 1]?.value ?? null;
  };
  const comparisonRows = snap
    ? [
        {
          label: "TRIF",
          left: latest("trif"),
          right:
            snap.anomalies.find((a) => a.metric === "trif")?.baseline ??
            snap.forecasts.find((f) => f.horizon === "30d")?.projectedTrif ??
            null,
          unit: "/200k",
        },
        {
          label: "LTIF",
          left: latest("ltif"),
          right: snap.forecasts.find((f) => f.horizon === "30d")?.projectedLtif ?? null,
          unit: "/200k",
        },
        {
          label: "Risk",
          left: latest("risk_score"),
          right: snap.forecasts.find((f) => f.horizon === "90d")?.riskScore ?? null,
        },
      ]
    : [];
  const topForecast = snap?.forecasts.find((f) => f.horizon === "90d");
  const insightChips = snap
    ? [
        {
          id: "smart-trif",
          label: "TRIF signal",
          value: fmt(latest("trif")),
          tone: "info" as const,
          href: "#vs-comparison",
        },
        {
          id: "smart-risk",
          label: "90d risk",
          value: topForecast ? `${topForecast.riskScore} · ${topForecast.band}` : "—",
          tone:
            topForecast?.band === "critical"
              ? ("alert" as const)
              : topForecast?.band === "elevated"
                ? ("caution" as const)
                : ("neutral" as const),
          href: "#vs-forecast",
        },
        {
          id: "smart-anomalies",
          label: "Anomalies",
          value: `${snap.anomalies.length}`,
          tone: snap.anomalies.length > 2 ? ("alert" as const) : ("neutral" as const),
          href: "#vs-anomalies",
        },
      ]
    : [];

  return (
    <VsDashboardShell
      eyebrow="Smart Dashboard Engine"
      title="AI safety intelligence"
      description="Anomaly detection, trend detection, narrative generation, risk forecasting, and correlation analysis (competency → incidents, inspections → risk)."
      meta={
        snap
          ? `Rev ${snap.revision} · anomaly · trend · narrative · forecast · correlation${fromCache ? " · cached aggregate" : ""}`
          : undefined
      }
    >
      <VsSection band="controls">
        <div className="flex flex-wrap gap-2">
        <select
          value={industry}
          onChange={(e) => setIndustry(e.target.value as Industry)}
        >
          {INDUSTRIES.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
        <button type="button" className="vs-btn" onClick={() => void reload()}>
          Refresh
        </button>
        <button type="button" className="vs-btn vs-btn-primary" onClick={() => void recompute()}>
          Recompute AI
        </button>
        </div>
      </VsSection>

      {error ? <p className="text-sm" style={{ color: VS_COLORS.critical }}>{error}</p> : null}
      {loading && !snap ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full bg-[var(--vs-slate)]" />
          <Skeleton className="h-40 w-full bg-[var(--vs-slate)]" />
        </div>
      ) : null}

      {snap ? (
        <>
          <InsightStrip chips={insightChips} cachedHint={fromCache} />

          <VsSection band="kpi" label="AI summary">
            <TrendPanel
              title="TRIF trend"
              series={snap.series.trif.map((p) => ({ period: p.period, value: p.value ?? 0 }))}
              rangeLabel="Safety signal"
            />
            <TrendPanel
              title="Risk score"
              series={snap.series.risk_score.map((p) => ({ period: p.period, value: p.value ?? 0 }))}
              rangeLabel="Risk forecast base"
            />
          </VsSection>

          <VsSection band="trend" label="Anomaly detection">
            <ComparisonPanel
              mode="entity-vs-industry"
              title={`${industry} signal vs baseline`}
              leftLabel="Current signal"
              rightLabel="Baseline / forecast"
              rows={comparisonRows}
            />
            <div className="vs-panel p-4 md:col-span-2">
            <div id="vs-anomalies" />
            <p className="vs-eyebrow">Anomaly detection</p>
            {snap.anomalies.length === 0 ? (
              <p className="mt-3 text-sm vs-muted">No anomalies above threshold.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {snap.anomalies.slice(0, 8).map((a) => (
                  <li
                    key={a.id}
                    className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-[var(--vs-border)] py-2 text-sm"
                  >
                    <span className="font-semibold uppercase" style={{ color: severityColor(a.severity) }}>
                      {a.severity} · {a.kind}
                    </span>
                    <span>{a.headline}</span>
                    <span className="text-xs vs-muted">
                      z={fmt(a.zScore)} · conf {Math.round(a.confidence * 100)}%
                    </span>
                  </li>
                ))}
              </ul>
            )}
            </div>
          </VsSection>

          <VsSection band="detail" label="Detailed analytics">
            <div className="vs-panel p-4">
              <p className="vs-eyebrow">Trend detection</p>
              <div className="mt-3 overflow-x-auto">
              <table className="min-w-[520px]">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Direction</th>
                    <th>Slope</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {snap.trends.map((t) => (
                    <tr key={t.id}>
                      <td>{t.metric.replace(/_/g, " ")}</td>
                      <td className="capitalize" style={{ color: severityColor(t.direction === "worsening" ? "high" : t.direction === "improving" ? "low" : "moderate") }}>
                        {t.direction}
                      </td>
                      <td className="tabular-nums">{fmt(t.slope, 3)}</td>
                      <td className="tabular-nums">{Math.round(t.confidence * 100)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>

            <div className="vs-panel p-4" id="vs-forecast">
              <p className="vs-eyebrow">Risk forecasting</p>
              <div className="mt-3 grid gap-4 sm:grid-cols-3">
              {snap.forecasts.map((f) => (
                <div key={f.horizon} className="border-b border-[var(--vs-border)] py-2">
                  <p className="text-[11px] uppercase tracking-wide vs-muted">
                    Horizon {f.horizon}
                  </p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums" style={{ color: severityColor(f.band) }}>
                    {f.riskScore}
                    <span className="ml-2 text-sm font-normal capitalize">{f.band}</span>
                  </p>
                  <p className="mt-1 text-xs vs-muted">
                    TRIF {fmt(f.projectedTrif)} · LTIF {fmt(f.projectedLtif)} · conf{" "}
                    {Math.round(f.confidence * 100)}%
                  </p>
                  <p className="mt-1 text-[10px] vs-muted">{f.drivers.join(" · ")}</p>
                </div>
              ))}
              </div>
            </div>

            <div className="vs-panel p-4">
              <p className="vs-eyebrow">Correlation analysis</p>
              <div className="mt-3 space-y-3">
              {snap.correlations.map((c) => (
                <div
                  key={c.id}
                  className="rounded-[3px] border border-[var(--vs-border)] px-4 py-3"
                >
                  <div className="flex flex-wrap items-baseline gap-2">
                    <p className="text-sm font-semibold" style={{ color: VS_COLORS.white }}>{c.headline}</p>
                    <span className="text-xs tabular-nums vs-muted">
                      r={fmt(c.r, 3)} · {c.interpretation} · n={c.samplePoints}
                    </span>
                  </div>
                  <p className="mt-1 text-sm vs-muted">{c.detail}</p>
                </div>
              ))}
              </div>
            </div>

            <div className="vs-panel p-4">
              <p className="vs-eyebrow">Series (TRIF)</p>
              <div className="mt-3 overflow-x-auto">
              <table className="min-w-[420px]">
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>TRIF</th>
                    <th>Competency %</th>
                    <th>Inspection %</th>
                    <th>Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {snap.series.trif.map((_, i) => (
                    <tr
                      key={snap.series.trif[i]!.period}
                    >
                      <td>{snap.series.trif[i]!.period}</td>
                      <td className="tabular-nums">{fmt(snap.series.trif[i]!.value)}</td>
                      <td className="tabular-nums">
                        {fmt(snap.series.competency_pct[i]?.value, 1)}
                      </td>
                      <td className="tabular-nums">
                        {fmt(snap.series.inspection_completion_pct[i]?.value, 1)}
                      </td>
                      <td className="tabular-nums">{fmt(snap.series.risk_score[i]?.value, 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          </VsSection>

          <VsSection band="narrative" label="Narrative">
            <AiInsightPanel
              title="AI narratives"
              items={snap.narratives.map((n) => ({
                id: n.id,
                tone: n.tone as "neutral" | "positive" | "caution" | "alert",
                headline: `${n.category} · ${n.headline}`,
                body: `${n.body}\n${n.sources.join(" · ")}`,
              }))}
            />
          </VsSection>
        </>
      ) : null}
    </VsDashboardShell>
  );
}
