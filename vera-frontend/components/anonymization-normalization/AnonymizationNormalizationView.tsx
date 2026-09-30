"use client";

import { useState } from "react";
import type { AnonNormEngineStatus } from "@/lib/anonymization-normalization-engine/types";
import { Skeleton } from "@/components/ui/skeleton";
import {
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

export function AnonymizationNormalizationView() {
  const [actionError, setActionError] = useState<string | null>(null);
  const [lastMsg, setLastMsg] = useState<string | null>(null);

  const {
    data: status,
    loading,
    error,
    fromCache,
    reload,
  } = useCachedAggregate<AnonNormEngineStatus>("/api/v1/anonymization-normalization");

  async function ingestDemo() {
    const res = await fetch("/api/v1/anonymization-normalization", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "ingest",
        record: {
          plane: "project",
          projectId: `LIVE-${Date.now()}`,
          companyId: "CO-LIVE-1",
          projectName: "Should Be Stripped",
          workerName: "Alex Sensitive",
          siteAddress: "999 Secret Lane",
          email: "alex@secret.example",
          industry: "mining",
          period: "2026-Q2",
          regionCode: "US-NV",
          hours: 120000,
          recordables: 2,
          lostTimeInjuries: 1,
          nearMisses: 8,
          severityWeight: 2.1,
          categories: { gravity: 30, electrical: 15, observations: 66 },
        },
      }),
    });
    if (!res.ok) {
      setActionError(await res.text());
      return;
    }
    const data = (await res.json()) as {
      strippedFields: string[];
      fact: { token: string; incidentRatePer200k: number };
      status: AnonNormEngineStatus;
    };
    setLastMsg(
      `Ingested ${data.fact.token} · stripped [${data.strippedFields.join(", ")}] · rate ${data.fact.incidentRatePer200k}/200k`,
    );
    setActionError(null);
    invalidateClientAggregate("/api/v1/anonymization-normalization");
    await reload({ bust: true });
  }

  const aggregateA = status?.recentAggregates.find((a) => !a.suppressed);
  const aggregateB = status?.recentAggregates.find(
    (a) =>
      !a.suppressed &&
      (a.key.plane !== aggregateA?.key.plane ||
        a.key.industryBand !== aggregateA?.key.industryBand ||
        a.key.regionBand !== aggregateA?.key.regionBand),
  );
  const comparisonRows =
    aggregateA && aggregateB
      ? [
          {
            label: "Incident",
            left: aggregateA.incidentRatePer200k,
            right: aggregateB.incidentRatePer200k,
            unit: "/200k",
          },
          {
            label: "Lost-time",
            left: aggregateA.lostTimeRatePer200k,
            right: aggregateB.lostTimeRatePer200k,
            unit: "/200k",
          },
          {
            label: "Severity",
            left: aggregateA.severityIndex,
            right: aggregateB.severityIndex,
          },
        ]
      : [];
  const insightChips = status
    ? [
        {
          id: "anon-facts",
          label: "Facts",
          value: String(status.factCount),
          tone: "info" as const,
          href: "#vs-comparison",
        },
        {
          id: "anon-strip",
          label: "Strip fields",
          value: `${status.stripFieldCatalog.length}`,
          tone: "positive" as const,
          href: "#vs-normalized",
        },
        {
          id: "anon-aggregates",
          label: "Blind aggregates",
          value: `${status.recentAggregates.length}`,
          tone: "neutral" as const,
          href: "#vs-aggregates",
        },
      ]
    : [];

  return (
    <VsDashboardShell
      eyebrow="Anonymization & Normalization Engine"
      title="Privacy-preserving safety metrics"
      description="Tokenize company and project IDs, strip names / locations / identifiers, normalize incidents per 200,000 hours and severity, standardize categories, and enforce blind aggregation with a minimum sample threshold."
      meta={
        status
          ? `Rev ${status.revision} · facts ${status.factCount} · n≥${status.rules.minSample} · /${status.rules.hoursDenominator.toLocaleString()} hours${fromCache ? " · cached aggregate" : ""}`
          : undefined
      }
    >
      <VsSection band="controls">
        <div className="flex flex-wrap gap-2">
        <button type="button" className="vs-btn" onClick={() => void reload()}>
          Refresh
        </button>
        <button type="button" className="vs-btn vs-btn-primary" onClick={() => void ingestDemo()}>
          Ingest sensitive record
        </button>
        </div>
      </VsSection>

      {lastMsg ? <p className="text-sm" style={{ color: VS_COLORS.blue }}>{lastMsg}</p> : null}
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

          <VsSection band="kpi" label="Engine status">
            <KpiTile label="Facts" value={status.factCount} tone="neutral" />
            <KpiTile label="Min sample" value={status.rules.minSample} tone="caution" />
            <KpiTile label="Hours denominator" value={status.rules.hoursDenominator.toLocaleString()} tone="positive" />
          </VsSection>

          <VsSection band="trend" label="Pipeline demo">
            <ComparisonPanel
              mode="entity-vs-industry"
              title="Blind aggregate comparison"
              leftLabel={
                aggregateA
                  ? `${aggregateA.key.plane} · ${aggregateA.key.regionBand}`
                  : "Aggregate A"
              }
              rightLabel={
                aggregateB
                  ? `${aggregateB.key.plane} · ${aggregateB.key.regionBand}`
                  : "Aggregate B"
              }
              rows={comparisonRows}
            />
            <div className="vs-panel p-4">
              <p className="vs-eyebrow">Engine rules</p>
              <ul className="mt-3 grid gap-2 text-sm vs-muted sm:grid-cols-2">
              <li>✓ Tokenize company & project IDs</li>
              <li>✓ Strip names, locations, identifiers</li>
              <li>✓ Incidents per 200,000 hours</li>
              <li>✓ Severity index normalization</li>
              <li>✓ Standardized categories</li>
              <li>✓ Blind aggregation</li>
              <li>✓ Min sample n≥{status.rules.minSample} (hide below)</li>
            </ul>
            </div>

            <div className="vs-panel p-4">
              <p className="vs-eyebrow">Pipeline demo</p>
              <div className="mt-3 space-y-2">
              {status.demo.steps.map((s) => (
                <div
                  key={s.step}
                  className="flex gap-3 border-b border-[var(--vs-border)] py-2 text-sm"
                >
                  <span style={{ color: s.ok ? VS_COLORS.emerald : VS_COLORS.orange }}>
                    {s.ok ? "✓" : "!"}
                  </span>
                  <div>
                    <p className="font-medium" style={{ color: VS_COLORS.white }}>{s.step}</p>
                    <p className="vs-muted">{s.detail}</p>
                  </div>
                </div>
              ))}
            </div>
            </div>
          </VsSection>

          <VsSection band="detail" label="Normalization detail">
            <div className="vs-panel p-4">
              <p className="vs-eyebrow">Raw input (sensitive)</p>
              <pre className="mt-3 overflow-x-auto rounded-[3px] border border-[var(--vs-border)] bg-[var(--vs-panel)] p-3 text-xs" style={{ color: VS_COLORS.orange }}>
                {JSON.stringify(status.demo.input, null, 2)}
              </pre>
            </div>
            <div className="vs-panel p-4" id="vs-normalized">
              <p className="vs-eyebrow">After strip + tokenize + normalize</p>
              <pre className="mt-3 overflow-x-auto rounded-[3px] border border-[var(--vs-border)] bg-[var(--vs-panel)] p-3 text-xs" style={{ color: VS_COLORS.emerald }}>
                {JSON.stringify(
                  {
                    strippedFields: status.demo.strip.strippedFields,
                    tokens: status.demo.strip.tokens,
                    fact: status.demo.fact,
                  },
                  null,
                  2,
                )}
              </pre>
            </div>

            <div className="vs-panel p-4 md:col-span-2" id="vs-aggregates">
              <p className="vs-eyebrow">Blind aggregates</p>
              <div className="mt-3 overflow-x-auto">
              <table className="min-w-[640px]">
                <thead>
                  <tr>
                    <th>Plane</th>
                    <th>Industry</th>
                    <th>Region</th>
                    <th>Incident /200k</th>
                    <th>Severity</th>
                    <th>n</th>
                    <th>Rule</th>
                  </tr>
                </thead>
                <tbody>
                  {status.recentAggregates.map((a, i) => (
                    <tr
                      key={`${a.key.plane}-${a.key.industryBand}-${a.key.regionBand}-${i}`}
                    >
                      <td>{a.key.plane}</td>
                      <td>{a.key.industryBand}</td>
                      <td>{a.key.regionBand}</td>
                      <td className="tabular-nums">
                        {a.suppressed ? "hidden" : fmt(a.incidentRatePer200k)}
                      </td>
                      <td className="tabular-nums">
                        {a.suppressed ? "—" : fmt(a.severityIndex, 1)}
                      </td>
                      <td className="tabular-nums vs-muted">
                        {a.suppressed ? `<${status.rules.minSample}` : a.entityCount}
                      </td>
                      <td>{a.rule}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          </VsSection>

          <VsSection band="narrative" label="Catalogs">
            <div className="vs-panel p-4">
              <p className="vs-eyebrow">Strip field catalog</p>
              <p className="mt-3 text-sm vs-muted">
              {status.stripFieldCatalog.join(" · ")}
            </p>
            </div>
            <div className="vs-panel p-4">
              <p className="vs-eyebrow">Standardized categories</p>
              <p className="mt-3 text-sm vs-muted">
              {status.standardizedCategories.join(" · ")}
            </p>
            </div>
          </VsSection>
        </>
      ) : null}
    </VsDashboardShell>
  );
}
