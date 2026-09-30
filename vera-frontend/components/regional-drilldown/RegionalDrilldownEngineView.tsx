"use client";

import { useMemo, useState } from "react";
import type {
  FocusIndustry,
  RegionalDrilldownSnapshot,
} from "@/lib/regional-drilldown-engine/types";
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

const PERIODS = ["2025-Q4", "2026-Q1", "2026-Q2"];
const INDUSTRIES: Array<FocusIndustry | "all"> = [
  "all",
  "mining",
  "construction",
  "manufacturing",
];

function fmt(n: number | null | undefined, digits = 2) {
  if (n == null) return "—";
  return n.toFixed(digits);
}

export function RegionalDrilldownEngineView() {
  const [regionCode, setRegionCode] = useState("GLB");
  const [industry, setIndustry] = useState<FocusIndustry | "all">("construction");
  const [period, setPeriod] = useState("2026-Q2");

  const url = useMemo(() => {
    const q = new URLSearchParams({ regionCode, industry, period });
    return `/api/v1/regional-drilldown?${q}`;
  }, [regionCode, industry, period]);

  const { data: snap, loading, error, fromCache, reload } =
    useCachedAggregate<RegionalDrilldownSnapshot>(url);

  const m = snap?.regionMetrics;
  const regionPeer = useMemo(() => {
    if (!snap || !m) return null;
    return (
      snap.regionsWithinIndustry.find((r) => r.regionCode !== m.regionCode) ??
      snap.regionsWithinIndustry[1] ??
      null
    );
  }, [snap, m]);
  const regionComparisonRows =
    m && regionPeer
      ? [
          {
            label: "TRIF",
            left: m.trif,
            right: regionPeer.trif,
            unit: "/200k",
            suppressed: m.suppressed || regionPeer.suppressed,
          },
          {
            label: "LTIF",
            left: m.ltif,
            right: regionPeer.ltif,
            unit: "/200k",
            suppressed: m.suppressed || regionPeer.suppressed,
          },
          {
            label: "Near-miss",
            left: m.nearMissRate,
            right: regionPeer.nearMissRate,
            unit: "/200k",
            suppressed: m.suppressed || regionPeer.suppressed,
          },
          {
            label: "Leading",
            left: m.leadingMaturity,
            right: regionPeer.leadingMaturity,
            suppressed: m.suppressed || regionPeer.suppressed,
          },
        ]
      : [];
  const insightChips =
    snap && m
      ? [
          {
            id: "regional-trif",
            label: "Region TRIF",
            value: m.suppressed ? "hidden" : fmt(m.trif),
            tone: "info" as const,
            href: "#vs-comparison",
          },
          {
            id: "regional-peer",
            label: "Peer region",
            value: regionPeer?.regionLabel ?? "—",
            tone: "neutral" as const,
            href: "#vs-comparison",
          },
          {
            id: "regional-industries",
            label: "Industry table",
            value: `${snap.industriesWithinRegion.length} rows`,
            tone: "positive" as const,
            href: "#vs-industries",
          },
        ]
      : [];

  return (
    <VsDashboardShell
      eyebrow="Regional Drilldown Engine"
      title="Global → Site hierarchy"
      description="Filter dashboards by region, normalize metrics by region band, compare regions within an industry, and compare industries within a region. Site level is tenant-scoped and excluded from industry pools."
      meta={
        snap
          ? `Rev ${snap.revision} · n≥${snap.rules.minSample} · per ${snap.rules.hoursDenominator.toLocaleString()} hours · site excluded from industry pool · ${snap.hierarchy.join(" → ")}${fromCache ? " · cached aggregate" : ""}`
          : undefined
      }
    >
      <VsSection band="controls">
        <div className="col-span-full space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="vs-eyebrow">
            Region
          </span>
          {(snap?.breadcrumbs ?? [{ code: "GLB", label: "Global" }]).map((b, i) => (
            <span key={b.code} className="flex items-center gap-2">
              {i > 0 ? <span className="vs-muted">/</span> : null}
              <button
                type="button"
                className={b.code === regionCode ? "vs-drill-crumb vs-drill-crumb-active" : "vs-drill-crumb"}
                onClick={() => setRegionCode(b.code)}
              >
                {b.label}
              </button>
            </span>
          ))}
        </div>
        {snap?.children?.length ? (
          <div className="flex flex-wrap gap-2">
            {snap.children.map((c) => (
              <button
                key={c.code}
                type="button"
                className="vs-btn"
                onClick={() => setRegionCode(c.code)}
              >
                {c.label}
                <span className="ml-1 text-[10px] uppercase vs-muted">
                  {c.level.replace("_", " ")}
                  {!c.industryPoolAllowed ? " · tenant" : ""}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs vs-muted">End of hierarchy (site).</p>
        )}
        <div className="flex flex-wrap gap-2">
          <select
            value={industry}
            onChange={(e) =>
              setIndustry(e.target.value as FocusIndustry | "all")
            }
          >
            {INDUSTRIES.map((i) => (
              <option key={i} value={i}>
                {i === "all" ? "All industries" : i}
              </option>
            ))}
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
          <button type="button" className="vs-btn" onClick={() => void reload()}>
            Refresh
          </button>
        </div>
        </div>
      </VsSection>

      {error ? <p className="text-sm" style={{ color: VS_COLORS.critical }}>{error}</p> : null}
      {loading && !snap ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full bg-[var(--vs-slate)]" />
          <Skeleton className="h-40 w-full bg-[var(--vs-slate)]" />
        </div>
      ) : null}

      {snap && m ? (
        <>
          <InsightStrip chips={insightChips} cachedHint={fromCache} />

          <VsSection band="kpi" label="Dashboard region filter">
            <p className="col-span-full text-sm vs-muted">
              Filter token{" "}
              <code style={{ color: VS_COLORS.white }}>{snap.filtered.filter.regionCode}</code>
              {" · "}
              include descendants · industry pool{" "}
              {snap.filtered.filter.industryPoolAllowed ? "allowed" : "blocked (site)"}
            </p>
            {m.suppressed ? (
              <p className="col-span-full text-sm" style={{ color: VS_COLORS.orange }}>
                Metrics hidden — fewer than {snap.rules.minSample} anonymized entities
                in this region band.
              </p>
            ) : (
              <>
                <KpiTile label="TRIF" value={fmt(m.trif)} tone="neutral" />
                <KpiTile label="LTIF" value={fmt(m.ltif)} tone="neutral" />
                <KpiTile label="Near-miss /200k" value={fmt(m.nearMissRate)} tone="caution" />
                <KpiTile label="Severity" value={fmt(m.severityIndex, 1)} tone="critical" />
                <KpiTile label="Leading" value={fmt(m.leadingMaturity, 1)} tone="positive" />
              </>
            )}
            {!m.suppressed && m.entityCount != null ? (
              <p className="col-span-full text-xs vs-muted">
                n = {m.entityCount} · {m.regionLabel} ({m.level}) · {m.industry}
              </p>
            ) : null}
          </VsSection>

          <VsSection band="trend" label={`Regions within industry${industry !== "all" ? ` · ${industry}` : " · construction"}`}>
            <ComparisonPanel
              mode="region-vs-region"
              title="Selected region vs peer"
              leftLabel={m.regionLabel}
              rightLabel={regionPeer?.regionLabel ?? "Peer region"}
              rows={regionComparisonRows}
            />
            <div className="vs-panel p-4 md:col-span-2">
              <div className="overflow-x-auto">
              <table className="min-w-[560px]">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Region</th>
                    <th>TRIF</th>
                    <th>LTIF</th>
                    <th>Near-miss</th>
                    <th>Leading</th>
                    <th>n</th>
                  </tr>
                </thead>
                <tbody>
                  {snap.regionsWithinIndustry.map((r) => (
                    <tr key={r.regionCode}>
                      <td className="tabular-nums vs-muted">{r.rankByTrif ?? "—"}</td>
                      <td>
                        <button
                          type="button"
                          className="vs-drill-crumb"
                          onClick={() => setRegionCode(r.regionCode)}
                        >
                          {r.regionLabel}
                        </button>
                        <span className="ml-2 text-[10px] uppercase vs-muted">
                          {r.level}
                        </span>
                      </td>
                      <td className="tabular-nums">{r.suppressed ? "hidden" : fmt(r.trif)}</td>
                      <td className="tabular-nums">{r.suppressed ? "—" : fmt(r.ltif)}</td>
                      <td className="tabular-nums">
                        {r.suppressed ? "—" : fmt(r.nearMissRate)}
                      </td>
                      <td className="tabular-nums">
                        {r.suppressed ? "—" : fmt(r.leadingMaturity, 1)}
                      </td>
                      <td className="tabular-nums vs-muted">
                        {r.suppressed ? `<${snap.rules.minSample}` : r.entityCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          </VsSection>

          <VsSection band="detail" label={`Industries within region · ${m.regionLabel}`}>
            <div className="vs-panel p-4 md:col-span-2">
              <div id="vs-industries" />
              <div className="overflow-x-auto">
              <table className="min-w-[520px]">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Industry</th>
                    <th>TRIF</th>
                    <th>LTIF</th>
                    <th>Near-miss</th>
                    <th>Leading</th>
                    <th>n</th>
                  </tr>
                </thead>
                <tbody>
                  {snap.industriesWithinRegion.map((r) => (
                    <tr
                      key={r.industry}
                      style={r.industry === industry ? { background: "rgba(0, 163, 255, 0.08)" } : undefined}
                    >
                      <td className="tabular-nums vs-muted">{r.rankByTrif ?? "—"}</td>
                      <td className="capitalize">
                        <button
                          type="button"
                          className="vs-drill-crumb"
                          onClick={() => setIndustry(r.industry)}
                        >
                          {r.industry}
                        </button>
                      </td>
                      <td className="tabular-nums">{r.suppressed ? "hidden" : fmt(r.trif)}</td>
                      <td className="tabular-nums">{r.suppressed ? "—" : fmt(r.ltif)}</td>
                      <td className="tabular-nums">
                        {r.suppressed ? "—" : fmt(r.nearMissRate)}
                      </td>
                      <td className="tabular-nums">
                        {r.suppressed ? "—" : fmt(r.leadingMaturity, 1)}
                      </td>
                      <td className="tabular-nums vs-muted">
                        {r.suppressed ? `<${snap.rules.minSample}` : r.entityCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          </VsSection>

          <VsSection band="narrative" label="Narrative">
            <div className="vs-panel p-4">
              <p className="vs-eyebrow">Regional scope</p>
              <p className="mt-3 text-sm vs-muted">
                {m.regionLabel} is filtered as {m.level}; site bands remain tenant-scoped and excluded from industry pools.
              </p>
            </div>
          </VsSection>
        </>
      ) : null}
    </VsDashboardShell>
  );
}
