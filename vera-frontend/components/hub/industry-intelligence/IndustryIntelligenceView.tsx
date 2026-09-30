"use client";

import { useMemo, useState } from "react";
import type {
  DataPlane,
  FocusIndustry,
  IndustryIntelligenceDashboard,
} from "@/lib/hub/industry-intelligence/types";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AiInsightPanel,
  ComparisonPanel,
  InsightStrip,
  KpiTile,
  TrendPanel,
  VsDashboardShell,
  VsSection,
} from "@/components/verisuite-intelligence-ui";
import { VS_COLORS } from "@/lib/verisuite-intelligence-ui/tokens";
import {
  invalidateClientAggregate,
  useCachedAggregate,
} from "@/lib/verisuite-intelligence-ui/useCachedAggregate";

const INDUSTRIES: FocusIndustry[] = ["mining", "construction", "manufacturing"];
const PERIODS = ["2025-Q4", "2026-Q1", "2026-Q2"];

function fmt(n: number | null | undefined, digits = 2) {
  if (n == null) return "—";
  return n.toFixed(digits);
}

function bandColor(band: string) {
  if (band === "critical") return VS_COLORS.critical;
  if (band === "elevated") return VS_COLORS.orange;
  if (band === "moderate") return VS_COLORS.blue;
  return VS_COLORS.emerald;
}

function mean(vals: Array<number | null | undefined>) {
  const n = vals.filter((v): v is number => v != null);
  if (!n.length) return null;
  return n.reduce((a, b) => a + b, 0) / n.length;
}

export function IndustryIntelligenceView() {
  const [plane, setPlane] = useState<DataPlane>("company");
  const [industry, setIndustry] = useState<FocusIndustry>("construction");
  const [period, setPeriod] = useState("2026-Q2");
  const [regionCode, setRegionCode] = useState("GLB");
  const [crossPlaneOptIn, setCrossPlaneOptIn] = useState(false);

  const url = useMemo(() => {
    const q = new URLSearchParams({
      plane,
      industry,
      period,
      regionCode,
      crossPlaneOptIn: crossPlaneOptIn ? "1" : "0",
    });
    return `/api/v1/industry-intelligence?${q}`;
  }, [plane, industry, period, regionCode, crossPlaneOptIn]);

  const { data: dash, loading, error, fromCache, reload } =
    useCachedAggregate<IndustryIntelligenceDashboard>(url);

  async function ingest() {
    const res = await fetch("/api/v1/industry-intelligence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plane,
        industry,
        period,
        regionCode,
        crossPlaneOptIn,
        sourceKind: "regulator",
      }),
    });
    if (res.ok) {
      invalidateClientAggregate("/api/v1/industry-intelligence");
      await reload({ bust: true });
    }
  }

  const b = dash?.benchmark;
  const trifSeries =
    dash?.trifLtifSeries.map((r) => ({ period: r.period, value: r.trif ?? 0 })) ?? [];

  const selected = dash?.industryComparisons.find((r) => r.industry === industry);
  const peers = dash?.industryComparisons.filter((r) => r.industry !== industry) ?? [];
  const compareRows = selected
    ? [
        {
          label: "TRIF",
          left: selected.suppressed ? null : selected.trif,
          right: mean(peers.map((p) => (p.suppressed ? null : p.trif))),
          unit: "/200k",
          suppressed: selected.suppressed,
        },
        {
          label: "LTIF",
          left: selected.suppressed ? null : selected.ltif,
          right: mean(peers.map((p) => (p.suppressed ? null : p.ltif))),
          unit: "/200k",
          suppressed: selected.suppressed,
        },
        {
          label: "Severity",
          left: selected.suppressed ? null : selected.severityIndex,
          right: mean(peers.map((p) => (p.suppressed ? null : p.severityIndex))),
          suppressed: selected.suppressed,
        },
        {
          label: "Leading maturity",
          left: selected.suppressed ? null : selected.leadingMaturityAvg,
          right: mean(peers.map((p) => (p.suppressed ? null : p.leadingMaturityAvg))),
          suppressed: selected.suppressed,
        },
      ]
    : [];

  const topNarrative = dash?.narratives[0];
  const topRisk = dash?.predictive[0];
  const insightChips = dash
    ? [
        {
          id: "trif",
          label: "Peer TRIF",
          value: b?.suppressed ? "hidden" : fmt(b?.trif),
          tone: "info" as const,
          href: "#vs-comparison",
        },
        {
          id: "risk",
          label: `Risk ${topRisk?.horizon ?? ""}`,
          value: topRisk ? `${topRisk.riskScore} · ${topRisk.band}` : "—",
          tone:
            topRisk?.band === "critical"
              ? ("alert" as const)
              : topRisk?.band === "elevated"
                ? ("caution" as const)
                : ("neutral" as const),
          href: "#vs-predictive",
        },
        {
          id: "narrative",
          label: "Top insight",
          value: topNarrative?.headline?.slice(0, 48) ?? "—",
          tone: (topNarrative?.tone === "alert"
            ? "alert"
            : topNarrative?.tone === "caution"
              ? "caution"
              : topNarrative?.tone === "positive"
                ? "positive"
                : "neutral") as "alert" | "caution" | "positive" | "neutral",
          href: "#vs-narrative",
        },
        {
          id: "compare",
          label: `${industry} vs peers`,
          value:
            compareRows[0] && compareRows[0].left != null && compareRows[0].right != null
              ? `Δ ${(compareRows[0].left - compareRows[0].right).toFixed(2)} TRIF`
              : "—",
          tone: "info" as const,
          href: "#vs-comparison",
        },
      ]
    : [];

  return (
    <VsDashboardShell
      eyebrow="VeriHub Industry Intelligence"
      title="Mining · Construction · Manufacturing"
      description="AI ingestion of external industry sources, normalized HECA / TRIF / LTIF / leading indicators, tokenized anonymization, and predictive peer risk — with strict plane isolation and n≥5 suppression."
      meta={
        dash
          ? `Rev ${dash.revision} · n≥${dash.rules.minSample} · ${
              dash.rules.planesIsolated ? "planes isolated" : "cross-plane opted in"
            } · ${fromCache ? "cached aggregate · " : ""}normalized before analytics`
          : undefined
      }
    >
      <VsSection band="controls">
        <div className="flex flex-wrap items-center gap-2">
          <select value={plane} onChange={(e) => setPlane(e.target.value as DataPlane)}>
            <option value="company">Company plane</option>
            <option value="project">Project plane</option>
          </select>
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value as FocusIndustry)}
          >
            {INDUSTRIES.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            {PERIODS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select value={regionCode} onChange={(e) => setRegionCode(e.target.value)}>
            <option value="GLB">Global</option>
            <option value="CA-AB">Alberta</option>
            <option value="CA-BC">British Columbia</option>
            <option value="CA-ON">Ontario</option>
            <option value="US-TX">Texas</option>
            <option value="US-NV">Nevada</option>
          </select>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={crossPlaneOptIn}
              onChange={(e) => setCrossPlaneOptIn(e.target.checked)}
            />
            Opt in cross-plane mix
          </label>
          <button type="button" className="vs-btn" onClick={() => void reload()}>
            Refresh
          </button>
          <button type="button" className="vs-btn vs-btn-primary" onClick={() => void ingest()}>
            AI ingest
          </button>
        </div>
      </VsSection>

      {error ? (
        <p className="mb-4 text-sm" style={{ color: VS_COLORS.critical }}>
          {error}
        </p>
      ) : null}

      {loading && !dash ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full bg-[var(--vs-slate)]" />
          <Skeleton className="h-40 w-full bg-[var(--vs-slate)]" />
        </div>
      ) : null}

      {dash && b ? (
        <>
          <InsightStrip chips={insightChips} cachedHint={fromCache} />

          <VsSection band="kpi" label="Industry benchmarks">
            {b.suppressed ? (
              <p className="text-sm" style={{ color: VS_COLORS.orange }}>
                Category hidden — fewer than {dash.rules.minSample} anonymized entities in
                this plane / period / region.
              </p>
            ) : (
              <>
                <KpiTile label="TRIF" value={fmt(b.trif)} tone="neutral" />
                <KpiTile label="LTIF" value={fmt(b.ltif)} tone="neutral" />
                <KpiTile label="Severity" value={fmt(b.severityIndex, 1)} tone="caution" />
                <KpiTile
                  label="HECA high-energy %"
                  value={fmt(b.hecaHighEnergyPct, 1)}
                  tone="critical"
                />
                <KpiTile
                  label="Leading maturity"
                  value={fmt(b.leadingMaturityAvg, 1)}
                  tone="positive"
                />
              </>
            )}
            {!b.suppressed && b.entityCount != null ? (
              <p className="col-span-full text-xs vs-muted">
                n = {b.entityCount} anonymized entities · {industry} · {plane}
              </p>
            ) : null}
          </VsSection>

          <VsSection band="trend" label="Trend & comparison">
            <TrendPanel title="TRIF trend" series={trifSeries} rangeLabel="Industry TRIF" />
            <ComparisonPanel
              mode={plane === "company" ? "company-vs-industry" : "entity-vs-industry"}
              title={`${industry} vs peer industries`}
              leftLabel={industry}
              rightLabel="Peer mean"
              rows={compareRows}
            />
          </VsSection>

          <VsSection band="detail" label="Detail">
            <div className="vs-panel p-4">
              <p className="vs-eyebrow">Industry HECA</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {(
                  ["gravity", "electrical", "mechanical", "pressure", "chemical", "thermal"] as const
                ).map((cat) => {
                  const pts = dash.hecaTrends.filter((h) => h.category === cat);
                  const latest = pts[pts.length - 1];
                  return (
                    <div key={cat} className="border-b border-[var(--vs-border)] py-2">
                      <p className="text-[11px] uppercase tracking-wide vs-muted">{cat}</p>
                      <p className="text-lg font-semibold tabular-nums">
                        {latest ? `${fmt(latest.ratePct, 1)}%` : "—"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="vs-panel p-4">
              <p className="vs-eyebrow">Leading indicator maturity</p>
              <div className="mt-3 space-y-2">
                {dash.leadingIndicators.map((l) => (
                  <div key={l.key} className="flex items-center gap-3 text-sm">
                    <span className="w-40 shrink-0 vs-muted">{l.label}</span>
                    <div className="h-2 flex-1 rounded-sm bg-[var(--vs-panel)]">
                      <div
                        className="h-2 rounded-sm"
                        style={{
                          width: `${Math.min(100, l.score)}%`,
                          background: VS_COLORS.blue,
                        }}
                      />
                    </div>
                    <span className="w-12 text-right tabular-nums">{fmt(l.score, 0)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="vs-panel p-4 md:col-span-2">
              <p className="vs-eyebrow">Regional safety trends</p>
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-[480px]">
                  <thead>
                    <tr>
                      <th>Region</th>
                      <th>TRIF</th>
                      <th>LTIF</th>
                      <th>n</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dash.regionalTrends.map((r) => (
                      <tr key={r.regionCode}>
                        <td>{r.label}</td>
                        <td className="tabular-nums">
                          {r.suppressed ? "hidden" : fmt(r.trif)}
                        </td>
                        <td className="tabular-nums">{r.suppressed ? "—" : fmt(r.ltif)}</td>
                        <td className="tabular-nums vs-muted">
                          {r.suppressed ? `<${dash.rules.minSample}` : r.entityCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="vs-panel p-4 md:col-span-2" id="vs-predictive">
              <p className="vs-eyebrow">Predictive risk</p>
              <div className="mt-3 grid gap-4 sm:grid-cols-3">
                {dash.predictive.map((p) => (
                  <div key={p.horizon} className="border-b border-[var(--vs-border)] py-2">
                    <p className="text-[11px] uppercase tracking-wide vs-muted">
                      Horizon {p.horizon}
                    </p>
                    <p
                      className="mt-1 text-2xl font-semibold tabular-nums"
                      style={{ color: bandColor(p.band) }}
                    >
                      {p.riskScore}
                      <span className="ml-2 text-sm font-normal capitalize">{p.band}</span>
                    </p>
                    <p className="mt-1 text-xs vs-muted">
                      Projected TRIF {fmt(p.projectedTrif)} · confidence{" "}
                      {Math.round(p.confidence * 100)}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </VsSection>

          <VsSection band="narrative" label="Narrative">
            <div id="vs-narrative">
              <AiInsightPanel
                title="AI narratives"
                items={dash.narratives.map((n) => ({
                  id: n.id,
                  tone: n.tone as "neutral" | "positive" | "caution" | "alert",
                  headline: n.headline,
                  body: `${n.body}\n${n.sources.join(" · ")}`,
                }))}
              />
            </div>
          </VsSection>
        </>
      ) : null}
    </VsDashboardShell>
  );
}
