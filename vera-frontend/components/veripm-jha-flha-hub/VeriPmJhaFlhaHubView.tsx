"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import type {
  JhaFlhaHubDashboard,
  JhaIndustry,
} from "@/lib/veripm-jha-flha-hub";
import { resolveVeriPmPlane } from "@/lib/veripm-ai-intelligence";
import {
  FlhaEnergyWheel,
  InsightStrip,
  JhaHazardBlocks,
  KpiTile,
  LeadingHeatmap,
  RiskGauge,
  TrendPanel,
  VsDashboardShell,
  VsSection,
  VsStatusBadge,
} from "@/components/verisuite-intelligence-ui";
import { VS_COLORS, type VsTone } from "@/lib/verisuite-intelligence-ui/tokens";
import { useCachedAggregate } from "@/lib/verisuite-intelligence-ui/useCachedAggregate";
import { Skeleton } from "@/components/ui/skeleton";
import { SmsAiIntegrationPanel } from "@/components/verisuite-sms-ai/SmsAiIntegrationPanel";
import { SmsInteractionFlowPanel } from "@/components/verisuite-sms-ai/SmsInteractionFlowPanel";
import { VeriPmAiIntelligencePanel } from "@/components/veripm-ai-intelligence";

type Tab = "flha" | "jha";

const INDUSTRIES: JhaIndustry[] = [
  "mining",
  "construction",
  "manufacturing",
  "utilities",
];

function bandTone(
  band: "low" | "moderate" | "elevated" | "critical",
): VsTone {
  if (band === "critical") return "critical";
  if (band === "elevated") return "caution";
  if (band === "moderate") return "info";
  return "positive";
}

export function VeriPmJhaFlhaHubView({
  projectId = 1,
  companyId = 1,
}: {
  projectId?: number;
  companyId?: number;
}) {
  const { data: session } = useSession();
  const role = session?.user?.role ?? null;
  const plane = resolveVeriPmPlane(role);
  const [tab, setTab] = useState<Tab>("flha");
  const [industry, setIndustry] = useState<JhaIndustry>("construction");
  const [energyWindow, setEnergyWindow] = useState<"week" | "month" | "year">(
    "month",
  );
  const [workType, setWorkType] = useState("General construction");
  const [region, setRegion] = useState("CA-AB");

  const url = useMemo(() => {
    const q = new URLSearchParams({
      projectId: String(projectId),
      companyId: String(companyId),
      plane,
      industry,
      workType,
      region,
    });
    if (role) q.set("role", role);
    return `/api/v1/veripm-jha-flha-hub?${q}`;
  }, [projectId, companyId, plane, industry, workType, region, role]);

  const { data: dash, loading, error, fromCache } =
    useCachedAggregate<JhaFlhaHubDashboard>(url);

  const energyHeat = useMemo(() => {
    if (!dash)
      return {
        rows: [] as string[],
        cols: [] as string[],
        cells: [] as Array<{
          row: string;
          col: string;
          value: number;
          intensity: number;
        }>,
      };
    const cols = ["Week", "Month", "Year"];
    const rows = dash.flha.energyFrequency.slice(0, 8).map((e) => e.energy);
    const max = Math.max(
      1,
      ...dash.flha.energyFrequency.flatMap((e) => [e.week, e.month, e.year]),
    );
    const cells = dash.flha.energyFrequency.slice(0, 8).flatMap((e) => [
      {
        row: e.energy,
        col: "Week",
        value: e.week,
        intensity: e.week / max,
      },
      {
        row: e.energy,
        col: "Month",
        value: e.month,
        intensity: e.month / max,
      },
      {
        row: e.energy,
        col: "Year",
        value: e.year,
        intensity: e.year / max,
      },
    ]);
    return { rows, cols, cells };
  }, [dash]);

  const chips = dash
    ? [
        {
          id: "scope",
          label: "Scope",
          value: dash.scopeLabel,
          tone: "info" as const,
        },
        {
          id: "q",
          label: "FLHA quality",
          value: String(dash.flha.quality.overall),
          tone:
            dash.flha.quality.overall >= 80
              ? ("positive" as const)
              : ("caution" as const),
        },
        {
          id: "top",
          label: "Top energy",
          value: dash.flha.topEnergies[0]?.energy ?? "—",
          tone: "caution" as const,
        },
        {
          id: "tmpl",
          label: "JHA templates",
          value: String(dash.jha.templates.length),
          tone: "info" as const,
        },
      ]
    : [];

  return (
    <VsDashboardShell
      eyebrow="VeriPM · JHA / FLHA"
      title="Field hazard intelligence"
      description="FLHA Energy Wheel frequency, direct controls, AI hazard prediction, and quality scoring — plus industry JHA templates, smart builder, and risk ranking."
      meta={
        dash
          ? `${dash.scopeLabel} · ${dash.periodLabel} · rev ${dash.revision}${
              fromCache ? " · cached" : ""
            }`
          : undefined
      }
    >
      <VsSection band="controls">
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              ["flha", "FLHA dashboard"],
              ["jha", "JHA templates & builder"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className="rounded px-3 py-1.5 text-xs font-semibold uppercase"
              style={{
                background: tab === id ? VS_COLORS.blue : VS_COLORS.slate,
                color: tab === id ? VS_COLORS.navy : VS_COLORS.white,
                border: `1px solid ${VS_COLORS.border}`,
              }}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value as JhaIndustry)}
            className="rounded border bg-transparent px-2 py-1.5 text-xs"
            style={{ borderColor: VS_COLORS.border, color: VS_COLORS.white }}
          >
            {INDUSTRIES.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="rounded border bg-transparent px-2 py-1.5 text-xs"
            style={{ borderColor: VS_COLORS.border, color: VS_COLORS.white }}
          >
            <option value="CA-AB">Alberta</option>
            <option value="CA-BC">British Columbia</option>
            <option value="US-TX">Texas</option>
            <option value="US-NV">Nevada</option>
          </select>
          <input
            value={workType}
            onChange={(e) => setWorkType(e.target.value)}
            className="min-w-[140px] rounded border bg-transparent px-2 py-1.5 text-xs"
            style={{ borderColor: VS_COLORS.border, color: VS_COLORS.white }}
            placeholder="Work type"
          />
          <Link
            href={dash?.links.newFlha ?? `/pm/jha-flha/new/flha?projectId=${projectId}`}
            className="ml-auto rounded px-3 py-1.5 text-xs font-semibold"
            style={{ background: VS_COLORS.blue, color: VS_COLORS.navy }}
          >
            New FLHA
          </Link>
          <Link
            href={dash?.links.newJha ?? `/pm/jha-flha/new/jha?projectId=${projectId}`}
            className="rounded px-3 py-1.5 text-xs font-semibold"
            style={{
              background: VS_COLORS.slate,
              color: VS_COLORS.white,
              border: `1px solid ${VS_COLORS.border}`,
            }}
          >
            New JHA
          </Link>
        </div>
      </VsSection>

      {error ? (
        <p className="text-sm" style={{ color: VS_COLORS.critical }}>
          {error}
        </p>
      ) : null}

      {loading && !dash ? (
        <div className="grid gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded" />
          ))}
        </div>
      ) : null}

      {dash ? (
        <>
          <InsightStrip chips={chips} cachedHint={fromCache} />

          {tab === "flha" ? (
            <>
              <VsSection band="kpi" label="FLHA overview">
                <KpiTile
                  label="FLHA quality score"
                  value={dash.flha.quality.overall}
                  unit="/100"
                  tone={dash.flha.quality.overall >= 80 ? "positive" : "caution"}
                />
                <KpiTile
                  label="Control coverage"
                  value={dash.flha.quality.controlCoverage}
                  unit="%"
                  tone="info"
                />
                <KpiTile
                  label="Energy accuracy"
                  value={dash.flha.quality.energyAccuracy}
                  unit="%"
                  tone="info"
                />
                <KpiTile
                  label="Top energy (month)"
                  value={dash.flha.topEnergies[0]?.count ?? 0}
                  tone="caution"
                />
              </VsSection>

              <VsSection band="detail" label="Energy Wheel frequency">
                <div className="mb-3 flex flex-wrap gap-2">
                  {(["week", "month", "year"] as const).map((w) => (
                    <button
                      key={w}
                      type="button"
                      className="rounded px-2.5 py-1 text-[11px] font-semibold uppercase"
                      style={{
                        background:
                          energyWindow === w ? VS_COLORS.blue : VS_COLORS.slate,
                        color:
                          energyWindow === w ? VS_COLORS.navy : VS_COLORS.white,
                        border: `1px solid ${VS_COLORS.border}`,
                      }}
                      onClick={() => setEnergyWindow(w)}
                    >
                      {w}
                    </button>
                  ))}
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <FlhaEnergyWheel
                    title={`Energy Wheel · ${energyWindow}`}
                    energies={dash.flha.energyFrequency.slice(0, 8).map((e) => {
                      const max = Math.max(
                        ...dash.flha.energyFrequency.map((x) => x[energyWindow]),
                        1,
                      );
                      const val = e[energyWindow];
                      return {
                        key: e.energy.toLowerCase().replace(/\s+/g, "-"),
                        label: e.energy,
                        score: Math.round((val / max) * 100),
                        flagged: e.energy.toLowerCase().includes("pressure"),
                      };
                    })}
                  />
                  <LeadingHeatmap
                    title="Energy × period heatmap"
                    rows={energyHeat.rows}
                    cols={energyHeat.cols}
                    cells={energyHeat.cells}
                  />
                </div>
              </VsSection>

              <VsSection band="detail" label="Direct controls">
                <div className="mb-3 flex flex-wrap gap-2 text-xs">
                  <span style={{ color: VS_COLORS.critical }}>
                    {dash.flha.controlsTrendingDown.length} trending downward
                  </span>
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {dash.flha.directControls.slice(0, 8).map((c) => (
                    <div
                      key={c.control}
                      className="vs-panel p-3"
                      style={{
                        borderTop: c.trendingDown
                          ? `2px solid ${VS_COLORS.critical}`
                          : undefined,
                      }}
                    >
                      <p
                        className="text-xs font-semibold"
                        style={{ color: VS_COLORS.white }}
                      >
                        {c.control}
                      </p>
                      <p className="mt-2 text-[11px]" style={{ color: VS_COLORS.emerald }}>
                        Applied {c.applied}
                      </p>
                      <p className="text-[11px]" style={{ color: VS_COLORS.critical }}>
                        Missed {c.missed}
                        {c.trendingDown ? " · trending ↓" : ""}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <TrendPanel
                    title="Control application trend (sample)"
                    series={dash.flha.directControls[0]?.trend ?? []}
                    rangeLabel="8 weeks"
                  />
                </div>
              </VsSection>

              <VsSection band="detail" label="FLHA AI Reviewer">
                <div className="grid gap-3 md:grid-cols-3">
                  {dash.flha.aiReviewer.map((f) => (
                    <div
                      key={f.id}
                      className="vs-panel p-4"
                      style={{
                        borderLeft: `3px solid ${
                          f.severity === "alert"
                            ? VS_COLORS.critical
                            : f.severity === "caution"
                              ? VS_COLORS.orange
                              : VS_COLORS.blue
                        }`,
                      }}
                    >
                      <p
                        className="text-[10px] font-semibold uppercase"
                        style={{ color: VS_COLORS.muted }}
                      >
                        {f.category.replace(/_/g, " ")}
                      </p>
                      <h3
                        className="mt-1 text-sm font-semibold"
                        style={{ color: VS_COLORS.white }}
                      >
                        {f.title}
                      </h3>
                      <p className="mt-2 text-xs" style={{ color: VS_COLORS.muted }}>
                        {f.detail}
                      </p>
                      <p className="mt-2 text-xs" style={{ color: VS_COLORS.blue }}>
                        Fix: {f.suggestedFix}
                      </p>
                      <Link
                        href={f.href}
                        className="mt-3 inline-block text-xs font-semibold"
                        style={{ color: VS_COLORS.blue }}
                      >
                        Open linked view →
                      </Link>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs" style={{ color: VS_COLORS.muted }}>
                  Quality: completeness {dash.flha.quality.completeness}% · control
                  adequacy {dash.flha.quality.controlAdequacy}% · repetition{" "}
                  {dash.flha.quality.repetitionScore}/100
                </p>
              </VsSection>

              <VsSection band="detail" label="AI hazard predictor & quality">
                <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
                  <RiskGauge
                    label="FLHA quality"
                    score={dash.flha.quality.overall}
                    band={
                      dash.flha.quality.overall >= 85
                        ? "low"
                        : dash.flha.quality.overall >= 70
                          ? "moderate"
                          : "elevated"
                    }
                  />
                  <div className="space-y-3">
                    {dash.flha.hazardPredictions.map((p) => (
                      <div
                        key={p.id}
                        className="vs-panel p-4"
                        style={{ borderLeft: `3px solid ${VS_COLORS.orange}` }}
                      >
                        <div className="flex justify-between gap-2">
                          <h3
                            className="text-sm font-semibold"
                            style={{ color: VS_COLORS.white }}
                          >
                            {p.hazard}
                          </h3>
                          <span
                            className="text-xs font-semibold tabular-nums"
                            style={{ color: VS_COLORS.critical }}
                          >
                            S×L {p.riskScore}
                          </span>
                        </div>
                        <p className="mt-1 text-xs" style={{ color: VS_COLORS.muted }}>
                          {p.rationale}
                        </p>
                        <p className="mt-2 text-[11px]" style={{ color: VS_COLORS.blue }}>
                          Controls: {p.suggestedControls.join(" · ")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </VsSection>
            </>
          ) : null}

          {tab === "jha" ? (
            <>
              <VsSection band="detail" label="Industry template library">
                <div className="grid gap-3 md:grid-cols-2">
                  {dash.jha.templates
                    .filter(
                      (t) => t.industry === industry || industry === "construction",
                    )
                    .slice(0, 6)
                    .map((t) => (
                      <div
                        key={t.id}
                        className="vs-panel p-4"
                        style={{ borderLeft: `3px solid ${VS_COLORS.blue}` }}
                      >
                        <p
                          className="text-[10px] font-semibold uppercase"
                          style={{ color: VS_COLORS.muted }}
                        >
                          {t.industry} · risk rank {t.riskRank}
                        </p>
                        <h3
                          className="mt-1 text-sm font-semibold"
                          style={{ color: VS_COLORS.white }}
                        >
                          {t.title}
                        </h3>
                        <p className="mt-1 text-xs" style={{ color: VS_COLORS.muted }}>
                          {t.description}
                        </p>
                        <p className="mt-2 text-[11px]" style={{ color: VS_COLORS.blue }}>
                          {t.tasks.length} tasks · {t.hazards.length} hazards ·{" "}
                          {t.ppe.length} PPE · quality {t.qualityScore} · {t.currentVersion}
                        </p>
                        <Link
                          href={`${dash.links.newJha}&template=${encodeURIComponent(t.title)}`}
                          className="mt-3 inline-block text-xs font-semibold"
                          style={{ color: VS_COLORS.blue }}
                        >
                          Use in smart builder →
                        </Link>
                      </div>
                    ))}
                </div>
              </VsSection>

              <VsSection band="detail" label="Smart JHA builder suggestions">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {dash.jha.smartSuggestions.map((s) => (
                    <div key={s.id} className="vs-panel p-3">
                      <p
                        className="text-[10px] font-semibold uppercase"
                        style={{ color: VS_COLORS.blue }}
                      >
                        {s.kind} · {Math.round(s.confidence * 100)}%
                      </p>
                      <p
                        className="mt-1 text-sm font-medium"
                        style={{ color: VS_COLORS.white }}
                      >
                        {s.label}
                      </p>
                      <p className="mt-1 text-[11px]" style={{ color: VS_COLORS.muted }}>
                        {s.reason}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs" style={{ color: VS_COLORS.muted }}>
                  Seed: {dash.jha.builderSeed.suggestedTitle} ·{" "}
                  {dash.jha.builderSeed.region}
                </p>
              </VsSection>

              <VsSection band="detail" label="AI risk ranking (severity × likelihood)">
                <div className="grid gap-4 lg:grid-cols-2">
                  <JhaHazardBlocks
                    title="Hazards · risk bands"
                    hazards={dash.jha.riskRanking.map((r, i) => ({
                      id: `risk-${i}`,
                      label: r.hazard,
                      severity: r.band,
                      likelihood: String(r.likelihood),
                      source: "ai",
                      confidence: Math.min(0.95, 0.55 + r.score / 200),
                    }))}
                  />
                  <div className="vs-panel overflow-x-auto p-0">
                    <table className="w-full min-w-[320px] text-left text-sm">
                      <thead>
                        <tr style={{ color: VS_COLORS.muted }}>
                          <th className="p-3 font-medium">Hazard</th>
                          <th className="p-3 font-medium">Score</th>
                          <th className="p-3 font-medium">Band</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dash.jha.riskRanking.map((r) => (
                          <tr
                            key={r.hazard}
                            style={{ borderTop: `1px solid ${VS_COLORS.border}` }}
                          >
                            <td className="p-3" style={{ color: VS_COLORS.white }}>
                              {r.hazard}
                            </td>
                            <td className="p-3 tabular-nums font-semibold">{r.score}</td>
                            <td className="p-3">
                              <VsStatusBadge tone={bandTone(r.band)}>
                                {r.band}
                              </VsStatusBadge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </VsSection>

              <VsSection band="detail" label="JHA quality & versioning">
                <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
                  <div className="vs-panel p-4">
                    <p className="vs-eyebrow">JHA quality score</p>
                    <p
                      className="mt-2 text-3xl font-semibold tabular-nums"
                      style={{ color: VS_COLORS.blue }}
                    >
                      {dash.jha.quality.overall}
                      <span className="text-base font-normal">/100</span>
                    </p>
                    <ul className="mt-3 space-y-1 text-xs" style={{ color: VS_COLORS.muted }}>
                      <li>Completeness {dash.jha.quality.completeness}%</li>
                      <li>Control adequacy {dash.jha.quality.controlAdequacy}%</li>
                      <li>Industry alignment {dash.jha.quality.industryAlignment}%</li>
                    </ul>
                    <p className="mt-3 text-xs" style={{ color: VS_COLORS.muted }}>
                      {dash.jha.quality.narrative}
                    </p>
                  </div>
                  <div className="vs-panel overflow-x-auto p-0">
                    <table className="w-full min-w-[480px] text-left text-sm">
                      <thead>
                        <tr style={{ color: VS_COLORS.muted }}>
                          <th className="p-3 font-medium">Version</th>
                          <th className="p-3 font-medium">Changed</th>
                          <th className="p-3 font-medium">Summary</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dash.jha.versions.map((v) => (
                          <tr
                            key={v.id}
                            style={{ borderTop: `1px solid ${VS_COLORS.border}` }}
                          >
                            <td className="p-3" style={{ color: VS_COLORS.blue }}>
                              {v.version}
                            </td>
                            <td className="p-3 tabular-nums" style={{ color: VS_COLORS.muted }}>
                              {v.changedAt}
                            </td>
                            <td className="p-3" style={{ color: VS_COLORS.white }}>
                              {v.summary}
                              <p className="text-[11px]" style={{ color: VS_COLORS.muted }}>
                                {v.authorRole}
                              </p>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </VsSection>
            </>
          ) : null}

          <VsSection band="narrative" label="Insights & links">
            <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
              <SmsAiIntegrationPanel
                page="jha-flha"
                companyId={companyId}
                projectId={projectId}
                title="AI insights"
                fallbackInsights={dash.insights}
                defaultAcceptAction="apply_flha_flag"
              />
              <SmsInteractionFlowPanel
                page="jha-flha"
                companyId={companyId}
                projectId={projectId}
                title="JHA / FLHA flows"
                showCrossLinks={false}
              />
              <div className="vs-panel space-y-2 p-4 text-xs">
                <p className="vs-eyebrow">Cross-page links</p>
                <Link href={dash.links.inspections} style={{ color: VS_COLORS.blue }} className="block">
                  Inspections →
                </Link>
                <Link href={dash.links.meetings} style={{ color: VS_COLORS.blue }} className="block">
                  Safety meetings →
                </Link>
                <Link href={dash.links.actions} style={{ color: VS_COLORS.blue }} className="block">
                  Action Management →
                </Link>
                <Link href={dash.links.emergency} style={{ color: VS_COLORS.blue }} className="block">
                  Emergency Response / ERP →
                </Link>
                <Link href={dash.links.training} style={{ color: VS_COLORS.blue }} className="block">
                  Training modules →
                </Link>
                <Link href={dash.links.incidents} style={{ color: VS_COLORS.blue }} className="block">
                  Incidents →
                </Link>
              </div>
            </div>
          </VsSection>

          <VeriPmAiIntelligencePanel
            page="jha-flha"
            projectId={projectId}
            companyId={companyId}
            plane={plane}
          />
        </>
      ) : null}
    </VsDashboardShell>
  );
}
