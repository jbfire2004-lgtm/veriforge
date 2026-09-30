"use client";

import { useMemo, useState } from "react";
import type {
  DualScaleSnapshot,
  FocusIndustry,
} from "@/lib/dual-scale-dashboards/types";
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

const INDUSTRIES: FocusIndustry[] = ["mining", "construction", "manufacturing"];
const PERIODS = ["2025-Q4", "2026-Q1", "2026-Q2"];

function fmt(n: number | null | undefined, digits = 2) {
  if (n == null) return "—";
  return n.toFixed(digits);
}

function bandColor(band: string | null) {
  if (band === "critical") return VS_COLORS.critical;
  if (band === "elevated") return VS_COLORS.orange;
  if (band === "moderate") return VS_COLORS.blue;
  return VS_COLORS.emerald;
}

export function DualScaleDashboardsView() {
  const [industry, setIndustry] = useState<FocusIndustry>("construction");
  const [period, setPeriod] = useState("2026-Q2");
  const [regionCode, setRegionCode] = useState("GLB");
  const [crossPlaneOptIn, setCrossPlaneOptIn] = useState(false);

  const url = useMemo(() => {
    const q = new URLSearchParams({
      industry,
      period,
      regionCode,
      crossPlaneOptIn: crossPlaneOptIn ? "1" : "0",
    });
    return `/api/v1/dual-scale-dashboards?${q}`;
  }, [industry, period, regionCode, crossPlaneOptIn]);

  const { data: snap, loading, error, fromCache, reload } =
    useCachedAggregate<DualScaleSnapshot>(url);

  const project = snap?.project;
  const company = snap?.company;
  const comparisonRows =
    project && company
      ? [
          {
            label: "TRIF",
            left: project.rates.trif,
            right: company.rates.trif,
            unit: "/200k",
            suppressed: project.rates.suppressed || company.rates.suppressed,
          },
          {
            label: "LTIF",
            left: project.rates.ltif,
            right: company.rates.ltif,
            unit: "/200k",
            suppressed: project.rates.suppressed || company.rates.suppressed,
          },
          {
            label: "Severity",
            left: project.rates.severityIndex,
            right: company.rates.severityIndex,
            suppressed: project.rates.suppressed || company.rates.suppressed,
          },
        ]
      : [];
  const insightChips =
    snap && project && company
      ? [
          {
            id: "dual-project",
            label: "Project TRIF",
            value: project.rates.suppressed ? "hidden" : fmt(project.rates.trif),
            tone: "info" as const,
            href: "#vs-comparison",
          },
          {
            id: "dual-company",
            label: "Company TRIF",
            value: company.rates.suppressed ? "hidden" : fmt(company.rates.trif),
            tone: "neutral" as const,
            href: "#vs-comparison",
          },
          {
            id: "dual-regions",
            label: "Regional rows",
            value: `${company.regionalPerformance.length}`,
            tone: "positive" as const,
            href: "#vs-regional-performance",
          },
        ]
      : [];

  return (
    <VsDashboardShell
      eyebrow="Dual-scale analytics"
      title="Project · Company dashboards"
      description="Side-by-side project-scale and company-scale intelligence. Planes stay isolated unless you explicitly opt in to cross-plane comparison. Categories with fewer than 5 entities are hidden."
      meta={
        snap
          ? `Rev ${snap.revision} · n≥${snap.rules.minSample} · ${
              snap.rules.planesIsolated ? "planes isolated" : "cross-plane opted in"
            } · /${snap.rules.hoursDenominator.toLocaleString()} hours${fromCache ? " · cached aggregate" : ""}`
          : undefined
      }
    >
      <VsSection band="controls">
        <div className="flex flex-wrap items-center gap-2">
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
        <select
          value={regionCode}
          onChange={(e) => setRegionCode(e.target.value)}
        >
          <option value="GLB">Global</option>
          <option value="CA-AB">Alberta</option>
          <option value="CA-BC">British Columbia</option>
          <option value="CA-ON">Ontario</option>
          <option value="US-TX">Texas</option>
          <option value="US-NV">Nevada</option>
        </select>
        <label className="flex items-center gap-2 text-sm vs-muted">
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
        </div>
      </VsSection>

      {error ? <p className="text-sm" style={{ color: VS_COLORS.critical }}>{error}</p> : null}
      {loading && !snap ? (
        <div className="space-y-3">
          <Skeleton className="h-40 w-full bg-[var(--vs-slate)]" />
          <Skeleton className="h-40 w-full bg-[var(--vs-slate)]" />
        </div>
      ) : null}

      {snap?.blended ? (
        <VsSection band="kpi" label="Cross-plane blend">
          <div className="vs-panel col-span-full p-4">
          <p className="vs-eyebrow">Cross-plane blend (opt-in)</p>
          <p className="mt-3 text-sm vs-muted">{snap.blended.note}</p>
          <p className="mt-2 text-sm tabular-nums" style={{ color: VS_COLORS.orange }}>
            Blended TRIF {fmt(snap.blended.rates.trif)} · LTIF{" "}
            {fmt(snap.blended.rates.ltif)} · n=
            {snap.blended.rates.suppressed
              ? "hidden"
              : snap.blended.rates.entityCount}
          </p>
          </div>
        </VsSection>
      ) : null}

      {project && company ? (
        <>
          <InsightStrip chips={insightChips} cachedHint={fromCache} />

          <VsSection band="kpi" label="Project dashboard">
            <p className="col-span-full text-xs vs-muted">Plane: project · tokens proj_*</p>
              {project.rates.suppressed ? (
                <p className="col-span-full text-sm" style={{ color: VS_COLORS.orange }}>
                  Hidden — n&lt;{snap.rules.minSample}
                </p>
              ) : (
                <>
                  <KpiTile label="Project TRIF" value={fmt(project.rates.trif)} tone="neutral" />
                  <KpiTile label="Project LTIF" value={fmt(project.rates.ltif)} tone="neutral" />
                  <KpiTile label="Project severity" value={fmt(project.rates.severityIndex, 1)} tone="caution" />
                </>
              )}
          </VsSection>

          <VsSection band="kpi" label="Company dashboard">
            <p className="col-span-full text-xs vs-muted">Plane: company · tokens co_*</p>
              {company.rates.suppressed ? (
                <p className="col-span-full text-sm" style={{ color: VS_COLORS.orange }}>
                  Hidden — n&lt;{snap.rules.minSample}
                </p>
              ) : (
                <>
                  <KpiTile label="Company TRIF" value={fmt(company.rates.trif)} tone="neutral" />
                  <KpiTile label="Company LTIF" value={fmt(company.rates.ltif)} tone="neutral" />
                  <KpiTile label="Company severity" value={fmt(company.rates.severityIndex, 1)} tone="caution" />
                </>
              )}
          </VsSection>

          <VsSection band="trend" label="Leading indicators & comparison">
            <ComparisonPanel
              mode="project-vs-company"
              title="Project vs company rates"
              rows={comparisonRows}
            />
            <div className="vs-panel p-4">
              <p className="vs-eyebrow">Project leading indicators</p>
              <div className="mt-3 space-y-2">
                {project.leading.map((l) => (
                  <div key={l.key} className="flex items-center gap-3 text-sm">
                    <span className="w-40 shrink-0 vs-muted">{l.label}</span>
                    {l.suppressed ? (
                      <span className="text-xs" style={{ color: VS_COLORS.orange }}>hidden</span>
                    ) : (
                      <>
                        <div className="h-2 flex-1 rounded-sm bg-[var(--vs-panel)]">
                          <div
                            className="h-2 rounded-sm"
                            style={{ width: `${Math.min(100, l.score ?? 0)}%`, background: VS_COLORS.blue }}
                          />
                        </div>
                        <span className="w-12 tabular-nums text-right">{fmt(l.score, 0)}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="vs-panel p-4">
              <p className="vs-eyebrow">Company leading maturity</p>
              <div className="mt-3 space-y-2">
                {company.leadingMaturity.map((l) => (
                  <div key={l.key} className="flex items-center gap-3 text-sm">
                    <span className="w-40 shrink-0 vs-muted">{l.label}</span>
                    {l.suppressed ? (
                      <span className="text-xs" style={{ color: VS_COLORS.orange }}>hidden</span>
                    ) : (
                      <>
                        <div className="h-2 flex-1 rounded-sm bg-[var(--vs-panel)]">
                          <div
                            className="h-2 rounded-sm"
                            style={{ width: `${Math.min(100, l.score ?? 0)}%`, background: VS_COLORS.blue }}
                          />
                        </div>
                        <span className="w-12 tabular-nums text-right">{fmt(l.score, 0)}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </VsSection>

          <VsSection band="detail" label="Project and company detail">
            <div className="vs-panel p-4">
              <p className="vs-eyebrow">Project HECA</p>
              {!project.hecaSuppressed ? (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {project.heca.map((h) => (
                    <div key={h.category} className="text-sm">
                      <span className="capitalize vs-muted">{h.category}</span>
                      <span className="ml-2 tabular-nums font-medium">
                        {fmt(h.ratePct, 1)}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="vs-panel p-4">
              <p className="vs-eyebrow">Corrective actions</p>
              {project.correctiveActions.suppressed ? (
                <p className="mt-3 text-sm" style={{ color: VS_COLORS.orange }}>
                  Hidden — n&lt;{snap.rules.minSample}
                </p>
              ) : (
                <>
                  <p className="mt-3 text-sm vs-muted">
                    Open avg {fmt(project.correctiveActions.openAvg, 1)} · overdue{" "}
                    {fmt(project.correctiveActions.overdueAvg, 1)} · on-time{" "}
                    {fmt(project.correctiveActions.onTimeClosurePct, 1)}%
                  </p>
                  <div className="mt-3 grid grid-cols-5 gap-2">
                    {project.correctiveActions.aging.map((b) => (
                      <div key={b.bucket} className="border-b border-[var(--vs-border)] py-1">
                        <p className="text-[10px] uppercase vs-muted">{b.bucket}</p>
                        <p className="tabular-nums font-semibold">{b.count}</p>
                        <p className="text-[10px] vs-muted">{fmt(b.ratePer200k, 1)}/200k</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="vs-panel p-4">
              <p className="vs-eyebrow">Risk profile</p>
              {project.riskProfile.suppressed ? (
                <p className="mt-3 text-sm" style={{ color: VS_COLORS.orange }}>
                  Hidden — n&lt;{snap.rules.minSample}
                </p>
              ) : (
                <>
                  <p
                    className="mt-3 text-3xl font-semibold tabular-nums"
                    style={{ color: bandColor(project.riskProfile.band) }}
                  >
                    {project.riskProfile.score}
                    <span className="ml-2 text-base font-normal capitalize">
                      {project.riskProfile.band}
                    </span>
                  </p>
                  <ul className="mt-2 space-y-1 text-sm vs-muted">
                    {project.riskProfile.drivers.map((d) => (
                      <li key={d.code}>
                        <span className="font-medium" style={{ color: VS_COLORS.white }}>{d.label}</span>
                        {" · "}
                        {fmt(d.weight, 1)}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            <div className="vs-panel p-4">
              <p className="vs-eyebrow">Company HECA</p>
              {!company.hecaSuppressed ? (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {company.heca.map((h) => (
                    <div key={h.category} className="text-sm">
                      <span className="capitalize vs-muted">{h.category}</span>
                      <span className="ml-2 tabular-nums font-medium">
                        {fmt(h.ratePct, 1)}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="vs-panel p-4">
              <p className="vs-eyebrow">Competency trends</p>
              <table className="mt-3 w-full">
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Current %</th>
                    <th>Gap %</th>
                  </tr>
                </thead>
                <tbody>
                  {company.competencyTrends.map((t) => (
                    <tr key={t.period}>
                      <td>{t.period}</td>
                      <td className="tabular-nums">
                        {t.suppressed ? "hidden" : fmt(t.currentPct, 1)}
                      </td>
                      <td className="tabular-nums">{t.suppressed ? "—" : fmt(t.gapPct, 1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="vs-panel p-4 md:col-span-2" id="vs-regional-performance">
              <p className="vs-eyebrow">Regional performance</p>
              <table className="mt-3 w-full">
                <thead>
                  <tr>
                    <th>Region</th>
                    <th>TRIF</th>
                    <th>LTIF</th>
                    <th>Leading</th>
                    <th>n</th>
                  </tr>
                </thead>
                <tbody>
                  {company.regionalPerformance.map((r) => (
                    <tr key={r.regionCode}>
                      <td>{r.label}</td>
                      <td className="tabular-nums">{r.suppressed ? "hidden" : fmt(r.trif)}</td>
                      <td className="tabular-nums">{r.suppressed ? "—" : fmt(r.ltif)}</td>
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
          </VsSection>

          <VsSection band="narrative" label="Narrative">
            <div className="vs-panel p-4">
              <p className="vs-eyebrow">Plane isolation</p>
              <p className="mt-3 text-sm vs-muted">
                Project and company dashboards remain isolated unless cross-plane comparison is explicitly opted in.
              </p>
            </div>
          </VsSection>
        </>
      ) : null}
    </VsDashboardShell>
  );
}
