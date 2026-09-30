"use client";

import { useState } from "react";
import type { EngineStatus } from "@/lib/verisuite-aggregation-engine/types";
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

function fmt(n: number | null | undefined, digits = 2) {
  if (n == null) return "—";
  return n.toFixed(digits);
}

export function AggregationEngineView() {
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const {
    data: status,
    loading,
    error,
    fromCache,
    reload,
  } = useCachedAggregate<EngineStatus>("/api/v1/verisuite-aggregation");

  async function run(action: "search" | "extract" | "daily") {
    setBusy(action);
    setActionError(null);
    try {
      const res = await fetch("/api/v1/verisuite-aggregation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as {
        status: EngineStatus;
        sourcesDiscovered?: number;
        factsNormalized?: number;
        searchRuns?: number;
      };
      setLastAction(
        action === "daily"
          ? `Daily update · discovered ${data.sourcesDiscovered ?? 0} · normalized ${data.factsNormalized ?? 0}`
          : action === "search"
            ? `Search cycle · ${data.searchRuns ?? 0} queries · discovered ${data.sourcesDiscovered ?? 0}`
            : "Extraction pass complete",
      );
      invalidateClientAggregate("/api/v1/verisuite-aggregation");
      await reload({ bust: true });
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusy(null);
    }
  }

  const benchmarkA = status?.benchmarks.find((b) => !b.suppressed);
  const benchmarkB = status?.benchmarks.find(
    (b) => !b.suppressed && b.industry !== benchmarkA?.industry,
  );
  const comparisonRows =
    benchmarkA && benchmarkB
      ? [
          {
            label: "TRIF",
            left: benchmarkA.trif,
            right: benchmarkB.trif,
            unit: "/200k",
          },
          {
            label: "LTIF",
            left: benchmarkA.ltif,
            right: benchmarkB.ltif,
            unit: "/200k",
          },
          {
            label: "Severity",
            left: benchmarkA.severityIndex,
            right: benchmarkB.severityIndex,
          },
          {
            label: "Leading",
            left: benchmarkA.leadingMaturity,
            right: benchmarkB.leadingMaturity,
          },
        ]
      : [];
  const insightChips = status
    ? [
        {
          id: "agg-facts",
          label: "Facts",
          value: String(status.factCount),
          tone: "info" as const,
          href: "#vs-comparison",
        },
        {
          id: "agg-benchmarks",
          label: "Benchmarks",
          value: `${status.benchmarks.length}`,
          tone: "positive" as const,
          href: "#vs-benchmarks",
        },
        {
          id: "agg-narratives",
          label: "AI narratives",
          value: `${status.narratives.length}`,
          tone: "neutral" as const,
          href: "#vs-narratives",
        },
      ]
    : [];

  return (
    <VsDashboardShell
      eyebrow="VeriSuite AI Aggregation Engine"
      title="Industry data aggregation"
      description="Continuously search the web for safety dashboards, incident databases, regulatory reports, and industry KPIs across mining, construction, and manufacturing — extract with LLM + vision + scrape, normalize, tokenize & anonymize, refresh benchmarks daily, and generate AI narratives."
      meta={
        status
          ? `Rev ${status.revision} · facts ${status.factCount} · sources ${
              status.sources.length
            } · n≥${status.rules.minSample} · continuous search on · next daily ${new Date(
              status.nextDailyUpdateAt,
            ).toLocaleString()}${fromCache ? " · cached aggregate" : ""}`
          : undefined
      }
    >
      <VsSection band="controls">
        <div className="flex flex-wrap gap-2">
          <button type="button" className="vs-btn" disabled={!!busy} onClick={() => void reload()}>
            Refresh status
          </button>
          <button
            type="button"
            className="vs-btn"
            disabled={!!busy}
            onClick={() => void run("search")}
          >
            {busy === "search" ? "Searching…" : "Run continuous search"}
          </button>
          <button
            type="button"
            className="vs-btn"
            disabled={!!busy}
            onClick={() => void run("extract")}
          >
            {busy === "extract" ? "Extracting…" : "Run AI extract"}
          </button>
          <button
            type="button"
            className="vs-btn vs-btn-primary"
            disabled={!!busy}
            onClick={() => void run("daily")}
          >
            {busy === "daily" ? "Updating…" : "Run daily update"}
          </button>
        </div>
      </VsSection>

      {lastAction ? <p className="text-sm" style={{ color: VS_COLORS.blue }}>{lastAction}</p> : null}
      {error || actionError ? (
        <p className="text-sm" style={{ color: VS_COLORS.critical }}>
          {error ?? actionError}
        </p>
      ) : null}
      {loading && !status ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full bg-[var(--vs-slate)]" />
          <Skeleton className="h-40 w-full bg-[var(--vs-slate)]" />
        </div>
      ) : null}

      {status ? (
        <>
          <InsightStrip chips={insightChips} cachedHint={fromCache} />

          <VsSection band="kpi" label="Pipeline">
            <KpiTile label="Facts" value={status.factCount} tone="neutral" />
            <KpiTile label="Sources" value={status.sources.length} tone="positive" />
            <KpiTile label="Min sample" value={status.rules.minSample} tone="caution" />
            <KpiTile label="Benchmarks" value={status.benchmarks.length} tone="neutral" />
            <div className="vs-panel col-span-full p-4">
              <p className="vs-eyebrow">Pipeline</p>
              <div className="mt-3 flex flex-wrap gap-3 text-sm vs-muted">
              <span>Search: {status.pipeline.search}</span>
              <span>·</span>
              <span>Extract: {status.pipeline.extract.join(" + ")}</span>
              <span>·</span>
              <span>Normalize ✓</span>
              <span>·</span>
              <span>Tokenize / anonymize ✓</span>
              <span>·</span>
              <span>Daily benchmarks ✓</span>
              <span>·</span>
              <span>AI narratives ✓</span>
              </div>
            </div>
          </VsSection>

          <VsSection band="trend" label="Industry benchmarks (daily)">
            <ComparisonPanel
              mode="entity-vs-industry"
              title="Benchmark comparison"
              leftLabel={benchmarkA?.industry ?? "Industry A"}
              rightLabel={benchmarkB?.industry ?? "Industry B"}
              rows={comparisonRows}
            />
            <div className="vs-panel p-4 md:col-span-2">
              <div id="vs-benchmarks" />
              <p className="vs-eyebrow">Daily benchmark table</p>
              <div className="mt-3 overflow-x-auto">
              <table className="min-w-[640px]">
                <thead>
                  <tr>
                    <th>Industry</th>
                    <th>TRIF</th>
                    <th>LTIF</th>
                    <th>Near-miss</th>
                    <th>Severity</th>
                    <th>Leading</th>
                    <th>Δ TRIF</th>
                    <th>n</th>
                  </tr>
                </thead>
                <tbody>
                  {status.benchmarks.map((b) => (
                    <tr key={b.industry}>
                      <td className="capitalize">{b.industry}</td>
                      <td className="tabular-nums">{b.suppressed ? "hidden" : fmt(b.trif)}</td>
                      <td className="tabular-nums">{b.suppressed ? "—" : fmt(b.ltif)}</td>
                      <td className="tabular-nums">
                        {b.suppressed ? "—" : fmt(b.nearMissRate)}
                      </td>
                      <td className="tabular-nums">
                        {b.suppressed ? "—" : fmt(b.severityIndex, 1)}
                      </td>
                      <td className="tabular-nums">
                        {b.suppressed ? "—" : fmt(b.leadingMaturity, 1)}
                      </td>
                      <td className="tabular-nums">
                        {b.suppressed || b.deltaTrifVsPrior == null
                          ? "—"
                          : `${b.deltaTrifVsPrior > 0 ? "+" : ""}${fmt(b.deltaTrifVsPrior)}`}
                      </td>
                      <td className="tabular-nums vs-muted">
                        {b.suppressed ? `<${status.rules.minSample}` : b.entityCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
              <p className="mt-2 text-xs vs-muted">
                As of {status.benchmarks[0]?.asOfDate ?? "—"} · last update{" "}
                {status.lastDailyUpdateAt ? new Date(status.lastDailyUpdateAt).toLocaleString() : "never"}
              </p>
            </div>
          </VsSection>

          <VsSection band="detail" label="Details">
            <div className="vs-panel p-4">
              <p className="vs-eyebrow">Continuous search intents</p>
              <ul className="mt-3 space-y-2 text-sm vs-muted">
              {status.queries.map((q) => (
                <li key={q.id}>
                  <span className="font-medium capitalize" style={{ color: VS_COLORS.white }}>
                    {q.industry}
                  </span>
                  {" · "}
                  {q.kind.replace(/_/g, " ")} · {q.status}
                  <span className="block text-xs vs-muted">{q.query}</span>
                </li>
              ))}
            </ul>
            </div>

            <div className="vs-panel p-4">
              <p className="vs-eyebrow">Discovered sources</p>
              <div className="mt-3 overflow-x-auto">
              <table className="min-w-[640px]">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Kind</th>
                    <th>Industry</th>
                    <th>Modalities</th>
                    <th>Conf.</th>
                  </tr>
                </thead>
                <tbody>
                  {status.sources.slice(0, 20).map((s) => (
                    <tr key={s.id}>
                      <td>
                        <div className="font-medium" style={{ color: VS_COLORS.white }}>{s.title}</div>
                        <div className="text-xs vs-muted">{s.url}</div>
                      </td>
                      <td>{s.kind.replace(/_/g, " ")}</td>
                      <td className="capitalize">{s.industry}</td>
                      <td>{s.modalities.join(" + ")}</td>
                      <td className="tabular-nums">{fmt(s.confidence, 2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>

            <div className="vs-panel p-4 md:col-span-2">
              <p className="vs-eyebrow">Recent extractions</p>
              <ul className="mt-3 space-y-1 text-sm vs-muted">
              {status.recentExtractions.slice(0, 12).map((e, i) => (
                <li key={`${e.sourceId}-${i}`}>
                  <span className="font-medium" style={{ color: VS_COLORS.white }}>{e.status}</span>
                  {" · "}
                  {e.sourceId} · {e.factsAdded} facts · stripped{" "}
                  {e.strippedFields.join(", ") || "none"} · {e.durationMs}ms
                </li>
              ))}
            </ul>
            </div>
          </VsSection>

          <VsSection band="narrative" label="Narrative">
            <div id="vs-narratives" />
            <AiInsightPanel
              title="AI narratives"
              items={status.narratives.map((n) => ({
                id: n.id,
                tone: n.tone as "neutral" | "positive" | "caution" | "alert",
                headline: `${n.category} · ${n.industry} · ${n.headline}`,
                body: `${n.body}\n${n.evidence.join(" · ")}`,
              }))}
            />
          </VsSection>
        </>
      ) : null}
    </VsDashboardShell>
  );
}
