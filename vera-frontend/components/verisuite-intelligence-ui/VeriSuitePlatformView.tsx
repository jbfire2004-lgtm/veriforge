"use client";

import { useState } from "react";
import Link from "next/link";
import "@/lib/verisuite-intelligence-ui/tokens.css";
import { VS_COLORS } from "@/lib/verisuite-intelligence-ui/tokens";
import {
  AiInsightPanel,
  ComparisonPanel,
  InsightStrip,
  InspectionTrendCard,
  KpiTile,
  LeadingHeatmap,
  RegionalMapPanel,
  RiskGauge,
  SeverityBars,
  TrendPanel,
  VsDashboardShell,
  VsSection,
} from "@/components/verisuite-intelligence-ui";
import type { SmartDashboardSnapshot } from "@/lib/smart-dashboard-engine/types";
import { useCachedAggregate } from "@/lib/verisuite-intelligence-ui/useCachedAggregate";

const MODULES = [
  {
    name: "VeriHub",
    href: "/hub/industry-intelligence",
    desc: "Industry HECA, TRIF/LTIF, regional heatmaps, AI narratives",
  },
  {
    name: "VeriPM",
    href: "/pm/project-safety",
    desc: "Project leading/lagging, audits, Action Management, risk vs industry",
  },
  {
    name: "FieldOS",
    href: "/field/operations",
    desc: "Field inspections, hazards, near-miss, equipment, anomalies",
  },
  {
    name: "VeriCore",
    href: "/core/training-competency",
    desc: "Training completion, competency gaps, expiry heatmaps",
  },
];

const ENGINES = [
  { name: "AI Aggregation", href: "/hub/verisuite-aggregation" },
  { name: "Regional Drilldown", href: "/hub/regional-drilldown" },
  { name: "Dual-scale", href: "/hub/dual-scale-dashboards" },
  { name: "Action Management", href: "/pm/action-management" },
  { name: "Anon & Norm", href: "/hub/anonymization-normalization" },
  { name: "Selector System", href: "/hub/selector-system" },
  { name: "Smart Dashboard AI", href: "/hub/smart-dashboard" },
];

export function VeriSuitePlatformView() {
  const [region, setRegion] = useState("GLB");
  const { data: smart, fromCache } = useCachedAggregate<SmartDashboardSnapshot>(
    "/api/v1/smart-dashboard?industry=construction",
  );

  const trif = smart?.series.trif ?? [];
  const forecast = trif.slice(-2).map((p, i) => ({
    period: `F${i + 1}`,
    value: Math.round((p.value + 0.1 * (i + 1)) * 100) / 100,
  }));
  const regionalChildren = [
    { code: "NA", label: "North America", level: "continent" },
    { code: "EU", label: "Europe", level: "continent" },
    { code: "CA", label: "Canada", level: "country" },
    { code: "US", label: "United States", level: "country" },
  ];
  const latestTrif = trif[trif.length - 1]?.value ?? null;
  const latestLtif = smart?.series.ltif[smart.series.ltif.length - 1]?.value ?? null;
  const latestCompetency =
    smart?.series.competency_pct[smart.series.competency_pct.length - 1]?.value ?? null;
  const risk90 = smart?.forecasts.find((f) => f.horizon === "90d");
  const insightChips = [
    {
      id: "platform-trif",
      label: "Peer TRIF",
      value: latestTrif?.toFixed(2) ?? "—",
      tone: "info" as const,
      href: "#vs-comparison",
    },
    {
      id: "platform-risk",
      label: "90d risk",
      value: risk90 ? `${risk90.riskScore} · ${risk90.band}` : "—",
      tone:
        risk90?.band === "critical"
          ? ("alert" as const)
          : risk90?.band === "elevated"
            ? ("caution" as const)
            : ("neutral" as const),
      href: "#vs-risk",
    },
    {
      id: "platform-modules",
      label: "Modules",
      value: `${MODULES.length}`,
      tone: "positive" as const,
      href: "#vs-modules",
    },
  ];

  return (
    <VsDashboardShell
      eyebrow="VeriSuite Intelligence Platform"
      title="Industrial AI for mining, construction & manufacturing"
      description="Unified architecture across VeriHub, VeriPM, FieldOS, and VeriCore — ingestion, anonymization, dual-plane analytics, regional drilldown, and smart AI under one dark industrial design system."
      meta={`Spec: docs/VERISUITE-INTELLIGENCE-PLATFORM.md · n≥5 · /200k · planes isolated by default${fromCache ? " · cached aggregate" : ""}`}
    >
        <InsightStrip chips={insightChips} cachedHint={fromCache} />

        <VsSection band="kpi" label="Platform signals">
          <KpiTile
            label="Peer TRIF"
            value={latestTrif?.toFixed(2) ?? "—"}
            unit="/200k"
            delta={
              trif.length > 1
                ? Math.round(
                    ((trif[trif.length - 1]!.value - trif[trif.length - 2]!.value) *
                      100) /
                      100,
                  )
                : null
            }
            sparkline={trif.map((p) => p.value)}
            tone="info"
          />
          <KpiTile
            label="Risk (90d)"
            value={risk90?.riskScore ?? "—"}
            tone="caution"
          />
          <KpiTile
            label="Competency"
            value={latestCompetency?.toFixed(0) ?? "—"}
            unit="%"
            tone="positive"
            sparkline={smart?.series.competency_pct.map((p) => p.value)}
          />
          <KpiTile
            label="Anomalies"
            value={smart?.anomalies.length ?? 0}
            tone={
              (smart?.anomalies.length ?? 0) > 2 ? "critical" : "neutral"
            }
          />
        </VsSection>

        <VsSection band="trend" label="Trend">
          <div className="lg:col-span-2 space-y-4">
            <TrendPanel
              title="TRIF trend + forecast"
              series={trif}
              forecast={forecast}
              anomalies={(smart?.anomalies ?? [])
                .filter((a) => a.metric === "trif")
                .map((a) => ({ period: a.period }))}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <SeverityBars
                title="Severity distribution"
                segments={[
                  { label: "Low", share: 42 },
                  { label: "Moderate", share: 28 },
                  { label: "High", share: 18 },
                  { label: "Critical", share: 12 },
                ]}
              />
              <InspectionTrendCard
                title="Intelligent inspections"
                completionPct={
                  smart?.series.inspection_completion_pct[
                    smart.series.inspection_completion_pct.length - 1
                  ]?.value ?? 86
                }
                ratePer200k={14.2}
                aiFlagged={smart?.anomalies.length ?? 0}
                period="2026-Q2"
              />
            </div>
          </div>
          <div className="space-y-4">
            <ComparisonPanel
              title="Platform signal vs industry"
              mode="entity-vs-industry"
              leftLabel="Platform signal"
              rightLabel="Industry target"
              rows={[
                {
                  label: "TRIF",
                  left: latestTrif,
                  right: 2.1,
                  unit: "/200k",
                },
                {
                  label: "LTIF",
                  left: latestLtif,
                  right: 0.9,
                  unit: "/200k",
                },
                {
                  label: "Competency",
                  left: latestCompetency,
                  right: 82,
                  unit: "%",
                },
              ]}
            />
            <RiskGauge
              label="Workforce risk"
              score={risk90?.riskScore ?? 42}
              band={risk90?.band}
            />
            <div id="vs-risk" />
            <AiInsightPanel
              items={(smart?.narratives ?? []).slice(0, 3).map((n) => ({
                id: n.id,
                tone: n.tone,
                headline: n.headline,
                body: n.body,
              }))}
            />
          </div>
        </VsSection>

        <VsSection band="detail" label="Detail">
          <RegionalMapPanel
            activeCode={region}
            breadcrumbs={[
              { code: "GLB", label: "Global" },
              ...(region !== "GLB"
                ? [{ code: region, label: region }]
                : []),
            ]}
            onSelect={setRegion}
            {...{ children: regionalChildren }}
          />

        <LeadingHeatmap
          title="Leading indicator heatmap"
          rows={["Observations", "Toolbox", "Training", "Permits"]}
          cols={["Q1", "Q2", "Q3", "Q4"]}
          cells={["Observations", "Toolbox", "Training", "Permits"].flatMap(
            (row, ri) =>
              ["Q1", "Q2", "Q3", "Q4"].map((col, ci) => ({
                row,
                col,
                value: 55 + ri * 5 + ci * 7,
                intensity: (55 + ri * 5 + ci * 7) / 100,
              })),
          )}
        />

        {/* Modules */}
        <div className="vs-panel p-4 md:col-span-2" id="vs-modules">
          <p className="vs-eyebrow">Module dashboards</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {MODULES.map((m) => (
              <Link
                key={m.href}
                href={m.href}
                className="vs-panel block p-4 transition-colors hover:border-[var(--vs-blue)]"
                style={{ borderColor: VS_COLORS.border }}
              >
                <p className="text-lg font-semibold" style={{ color: VS_COLORS.blue }}>
                  {m.name}
                </p>
                <p className="mt-1 text-sm" style={{ color: VS_COLORS.muted }}>
                  {m.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>

        <div className="vs-panel p-4 md:col-span-2">
          <p className="vs-eyebrow">Platform engines</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {ENGINES.map((e) => (
              <Link
                key={e.href}
                href={e.href}
                className="rounded-[3px] border px-3 py-1.5 text-sm"
                style={{ borderColor: VS_COLORS.border, color: VS_COLORS.white }}
              >
                {e.name}
              </Link>
            ))}
          </div>
        </div>
        </VsSection>

        <VsSection band="narrative" label="Narrative">
        <p className="text-xs" style={{ color: VS_COLORS.muted }}>
          Spec: docs/VERISUITE-INTELLIGENCE-PLATFORM.md · Design tokens:
          lib/verisuite-intelligence-ui · n≥5 · /200k · planes isolated by default
        </p>
        </VsSection>
    </VsDashboardShell>
  );
}
