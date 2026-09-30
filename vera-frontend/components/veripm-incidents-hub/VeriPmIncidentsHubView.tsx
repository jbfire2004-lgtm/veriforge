"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import type {
  IncidentAccessPlane,
  IncidentSeverity,
  IncidentStatus,
  IncidentType,
  IncidentsHubDashboard,
} from "@/lib/veripm-incidents-hub";
import { resolveIncidentPlane } from "@/lib/veripm-incidents-hub";
import {
  ComparisonPanel,
  InsightStrip,
  KpiTile,
  RootCauseActionFlow,
  SeverityBars,
  TrendPanel,
  VsDashboardShell,
  VsSection,
  VsStatusBadge,
} from "@/components/verisuite-intelligence-ui";
import type { ComparisonRow } from "@/components/verisuite-intelligence-ui";
import { VS_COLORS, type VsTone } from "@/lib/verisuite-intelligence-ui/tokens";
import { useCachedAggregate } from "@/lib/verisuite-intelligence-ui/useCachedAggregate";
import { Skeleton } from "@/components/ui/skeleton";
import { SmsAiIntegrationPanel } from "@/components/verisuite-sms-ai/SmsAiIntegrationPanel";
import { SmsInteractionFlowPanel } from "@/components/verisuite-sms-ai/SmsInteractionFlowPanel";
import { VeriPmAiIntelligencePanel } from "@/components/veripm-ai-intelligence";
import { SmartIncidentLogPanel } from "@/components/veripm-incidents-hub/SmartIncidentLogPanel";

type Tab = "dashboard" | "investigate" | "history";

function parseTab(raw: string | null | undefined): Tab {
  if (raw === "investigate") return "investigate";
  if (raw === "history" || raw === "log" || raw === "incident-log") return "history";
  return "dashboard";
}

function fmt(n: number, digits = 2) {
  return n.toFixed(digits);
}

function statusTone(s: IncidentStatus): VsTone {
  if (s === "closed") return "positive";
  if (s === "open" || s === "investigating" || s === "pending_review")
    return "caution";
  return "neutral";
}

function severityColor(s: IncidentSeverity): string {
  if (s === "Fatality") return VS_COLORS.critical;
  if (s === "LT") return VS_COLORS.orange;
  if (s === "MA") return VS_COLORS.blue;
  return VS_COLORS.emerald;
}

function typeLabel(t: IncidentType) {
  return t.replace(/_/g, " ");
}

export function VeriPmIncidentsHubView({
  projectId = 1,
  companyId = 1,
  initialTab,
}: {
  projectId?: number;
  companyId?: number;
  initialTab?: string | null;
}) {
  const { data: session } = useSession();
  const role = session?.user?.role ?? null;
  const defaultPlane = resolveIncidentPlane(role);

  const [planeOverride, setPlaneOverride] = useState<IncidentAccessPlane | null>(
    null,
  );
  const [tab, setTab] = useState<Tab>(() => parseTab(initialTab));
  const [helperDesc, setHelperDesc] = useState("");

  const plane = planeOverride ?? defaultPlane;
  const canSwitchPlane =
    role === "SUPER_ADMIN" ||
    role === "ADMIN" ||
    role === "COMPANY_ADMIN" ||
    role === "PROJECT_MANAGER";

  const url = useMemo(() => {
    const q = new URLSearchParams({
      projectId: String(projectId),
      companyId: String(companyId),
      plane,
      months: "24",
    });
    if (role) q.set("role", role);
    return `/api/v1/veripm-incidents-hub?${q}`;
  }, [projectId, companyId, plane, role]);

  const { data: dash, loading, error, fromCache } =
    useCachedAggregate<IncidentsHubDashboard>(url);

  const comparisonRows: ComparisonRow[] = useMemo(() => {
    if (!dash) return [];
    return dash.industryComparison.rows.map((r) => ({
      label: r.label,
      left: r.entity,
      right: r.industry,
      unit: r.unit,
    }));
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
          id: "rate",
          label: "Rate /200k",
          value: fmt(dash.overview.incidentRatePer200k),
          tone:
            dash.overview.deltas.incidentRatePer200k < 0
              ? ("positive" as const)
              : ("caution" as const),
        },
        {
          id: "open",
          label: "Open",
          value: String(dash.overview.openCount),
          tone:
            dash.overview.openCount > 5
              ? ("caution" as const)
              : ("neutral" as const),
        },
        {
          id: "bench",
          label: "vs industry",
          value: dash.industryComparison.rows[0]?.betterThanIndustry
            ? "Below avg"
            : "Above avg",
          tone: dash.industryComparison.rows[0]?.betterThanIndustry
            ? ("positive" as const)
            : ("alert" as const),
        },
      ]
    : [];

  return (
    <VsDashboardShell
      eyebrow="VeriPM · Incidents"
      title="Incident intelligence"
      description="Dashboard-first overview, open investigations, trends, industry benchmarks, AI investigation support, and a smart incident log with full drill-down across project, company, and subcontractor scopes."
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
              ["dashboard", "Dashboard"],
              ["investigate", "Investigation"],
              ["history", "Incident log"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className="rounded px-3 py-1.5 text-xs font-semibold uppercase tracking-wide"
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

          {canSwitchPlane ? (
            <div className="ml-2 flex gap-1">
              {(["project", "company", "subcontractor"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  className="rounded px-2 py-1 text-[10px] font-semibold uppercase"
                  style={{
                    background: plane === p ? VS_COLORS.slate : "transparent",
                    color: plane === p ? VS_COLORS.blue : VS_COLORS.muted,
                    border: `1px solid ${VS_COLORS.border}`,
                  }}
                  onClick={() => setPlaneOverride(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          ) : null}

          <button
            type="button"
            className="ml-auto rounded px-3 py-1.5 text-xs font-semibold"
            style={{
              background: VS_COLORS.slate,
              color: VS_COLORS.white,
              border: `1px solid ${VS_COLORS.border}`,
            }}
            onClick={() => setTab("history")}
          >
            Incident log
          </button>
          <Link
            href={dash?.links.reportNew ?? `/pm/incidents/new?projectId=${projectId}&companyId=${companyId}`}
            className="rounded px-3 py-1.5 text-xs font-semibold"
            style={{
              background: VS_COLORS.blue,
              color: VS_COLORS.navy,
            }}
          >
            Report incident
          </Link>
        </div>
      </VsSection>

      {error ? (
        <p className="text-sm" style={{ color: VS_COLORS.critical }}>
          {error}
        </p>
      ) : null}

      {loading && !dash ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded" />
          ))}
        </div>
      ) : null}

      {dash ? (
        <>
          <InsightStrip chips={chips} cachedHint={fromCache} />

          {tab === "dashboard" ? (
            <>
              <VsSection band="kpi" label="Incident overview">
                <KpiTile
                  label="Total incidents (period)"
                  value={dash.overview.totalIncidents}
                  delta={dash.overview.deltas.totalIncidents}
                  tone="info"
                />
                <KpiTile
                  label="Incident rate /200,000 hrs"
                  value={fmt(dash.overview.incidentRatePer200k)}
                  delta={dash.overview.deltas.incidentRatePer200k}
                  tone={
                    dash.overview.deltas.incidentRatePer200k < 0
                      ? "positive"
                      : "caution"
                  }
                  sparkline={dash.trends.incidents.map((p) => p.value)}
                />
                <KpiTile
                  label="Near misses"
                  value={dash.overview.nearMissCount}
                  delta={dash.overview.deltas.nearMissCount}
                  tone="caution"
                />
                <KpiTile
                  label="Open investigations"
                  value={dash.overview.openCount}
                  tone="caution"
                />
              </VsSection>

              <VsSection band="trend" label="Trend panels">
                <TrendPanel
                  title="Incident trend (rate /200k)"
                  series={dash.trends.incidents}
                  rangeLabel={dash.periodLabel}
                />
                <TrendPanel
                  title={`Type trend — ${typeLabel(dash.trends.byType[0]?.type ?? "injury")}`}
                  series={dash.trends.byType[0]?.series ?? []}
                  rangeLabel="12 mo"
                />
                <TrendPanel
                  title={`Root cause — ${dash.trends.byRootCause[0]?.cause ?? "Guarding"}`}
                  series={dash.trends.byRootCause[0]?.series ?? []}
                  rangeLabel="12 mo"
                />
              </VsSection>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                  {dash.trends.byType.slice(1).map((t) => (
                    <TrendPanel
                      key={t.type}
                      title={`Type — ${typeLabel(t.type)}`}
                      series={t.series}
                      rangeLabel="12 mo"
                    />
                  ))}
                </div>
                <div className="space-y-2">
                  {dash.trends.byRootCause.slice(1).map((t) => (
                    <TrendPanel
                      key={t.cause}
                      title={`Root cause — ${t.cause}`}
                      series={t.series}
                      rangeLabel="12 mo"
                    />
                  ))}
                </div>
              </div>

              <VsSection band="detail" label="Severity & open queue">
                <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
                  <SeverityBars
                    title="Severity distribution (FA · MA · LT · Fatality)"
                    segments={dash.overview.severity.map((s) => ({
                      label: `${s.label} (${s.count})`,
                      share: s.count,
                      color: s.color,
                    }))}
                  />
                  <div className="vs-panel overflow-x-auto p-0">
                    <table className="w-full min-w-[560px] text-left text-sm">
                      <thead>
                        <tr style={{ color: VS_COLORS.muted }}>
                          <th className="p-3 font-medium">Incident</th>
                          <th className="p-3 font-medium">Status</th>
                          <th className="p-3 font-medium">Severity</th>
                          <th className="p-3 font-medium">Days open</th>
                          <th className="p-3 font-medium">Investigator</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dash.openIncidents.map((row) => (
                          <tr
                            key={row.id}
                            style={{ borderTop: `1px solid ${VS_COLORS.border}` }}
                          >
                            <td className="p-3">
                              <Link
                                href={row.href}
                                style={{ color: VS_COLORS.white }}
                                className="hover:underline"
                              >
                                {row.title}
                              </Link>
                            </td>
                            <td className="p-3">
                              <VsStatusBadge tone={statusTone(row.status)}>
                                {row.status.replace(/_/g, " ")}
                              </VsStatusBadge>
                            </td>
                            <td className="p-3">
                              <span
                                className="text-xs font-semibold"
                                style={{ color: severityColor(row.severity) }}
                              >
                                {row.severity}
                              </span>
                            </td>
                            <td
                              className="p-3 tabular-nums"
                              style={{
                                color:
                                  row.daysOpen > 21
                                    ? VS_COLORS.critical
                                    : VS_COLORS.muted,
                              }}
                            >
                              {row.daysOpen}
                            </td>
                            <td className="p-3" style={{ color: VS_COLORS.muted }}>
                              {row.investigator}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </VsSection>

              <VsSection band="detail" label="Industry comparison">
                <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
                  <ComparisonPanel
                    mode={dash.industryComparison.mode}
                    rows={comparisonRows}
                    title={`${dash.scopeLabel} vs industry`}
                  />
                  <div className="space-y-3">
                    <div
                      className="vs-panel p-4 text-sm"
                      style={{ color: VS_COLORS.muted }}
                    >
                      <p
                        className="text-xs font-semibold uppercase"
                        style={{ color: VS_COLORS.blue }}
                      >
                        Benchmark signal
                      </p>
                      <p className="mt-2" style={{ color: VS_COLORS.white }}>
                        {dash.industryComparison.summary}
                      </p>
                      <ul className="mt-3 space-y-2">
                        {dash.industryComparison.rows.map((r) => (
                          <li
                            key={r.label}
                            className="flex items-center justify-between gap-2 text-xs"
                          >
                            <span>{r.label}</span>
                            <span
                              className="font-semibold uppercase"
                              style={{
                                color: r.betterThanIndustry
                                  ? VS_COLORS.emerald
                                  : VS_COLORS.critical,
                              }}
                            >
                              {r.betterThanIndustry
                                ? "At / below industry"
                                : "Above industry"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <SmsAiIntegrationPanel
                      page="incidents"
                      companyId={companyId}
                      projectId={projectId}
                      title="AI signals"
                      fallbackInsights={dash.insights}
                      defaultAcceptAction="create_action"
                    />
                    <SmsInteractionFlowPanel
                      page="incidents"
                      companyId={companyId}
                      projectId={projectId}
                      title="Incident flows"
                      showCrossLinks={false}
                    />
                  </div>
                </div>
              </VsSection>

              <VsSection band="detail" label="Root cause → Action Management">
                <RootCauseActionFlow flows={dash.rootCauseFlows} />
                <div className="mt-3 flex flex-wrap gap-4 text-xs">
                  <Link href={dash.links.correctiveActions} style={{ color: VS_COLORS.blue }}>
                    Action Management →
                  </Link>
                  <Link href={dash.links.safetyMeetings} style={{ color: VS_COLORS.blue }}>
                    Safety meetings →
                  </Link>
                  <Link href={dash.links.inspections} style={{ color: VS_COLORS.blue }}>
                    Inspections →
                  </Link>
                </div>
              </VsSection>
            </>
          ) : null}

          {tab === "investigate" ? (
            <>
              <VsSection band="detail" label="AI Investigation Helper">
                <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
                  <div className="vs-panel space-y-3 p-4">
                    <p className="vs-eyebrow">Describe the incident</p>
                    <textarea
                      className="min-h-[120px] w-full rounded border bg-transparent p-3 text-sm"
                      style={{
                        borderColor: VS_COLORS.border,
                        color: VS_COLORS.white,
                      }}
                      placeholder={dash.aiHelper.sampleDescription}
                      value={helperDesc}
                      onChange={(e) => setHelperDesc(e.target.value)}
                    />
                    <p className="text-[11px]" style={{ color: VS_COLORS.muted }}>
                      Suggestions update from the sample pattern when the field is
                      empty; paste a real description to frame your investigation.
                    </p>
                    <p
                      className="rounded border px-3 py-2 text-xs"
                      style={{
                        borderColor: VS_COLORS.border,
                        color: VS_COLORS.muted,
                        background: VS_COLORS.slate,
                      }}
                    >
                      {(helperDesc.trim() || dash.aiHelper.sampleDescription).slice(
                        0,
                        220,
                      )}
                      …
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="vs-panel p-4">
                      <p className="vs-eyebrow">Suggested root causes</p>
                      <ul className="mt-3 space-y-3">
                        {dash.aiHelper.suggestedRootCauses.map((rc) => (
                          <li key={rc.label}>
                            <div className="flex items-baseline justify-between gap-2">
                              <span
                                className="text-sm font-medium"
                                style={{ color: VS_COLORS.white }}
                              >
                                {rc.label}
                              </span>
                              <span
                                className="text-xs tabular-nums"
                                style={{ color: VS_COLORS.blue }}
                              >
                                {Math.round(rc.confidence * 100)}%
                              </span>
                            </div>
                            <p
                              className="mt-1 text-xs"
                              style={{ color: VS_COLORS.muted }}
                            >
                              {rc.rationale}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="vs-panel p-4">
                        <p className="vs-eyebrow">Corrective actions</p>
                        <ul
                          className="mt-2 list-disc space-y-1 pl-4 text-xs"
                          style={{ color: VS_COLORS.muted }}
                        >
                          {dash.aiHelper.suggestedCorrectiveActions.map((a) => (
                            <li key={a}>{a}</li>
                          ))}
                        </ul>
                        <Link
                          href={dash.links.correctiveActions}
                          className="mt-3 inline-block text-xs font-semibold"
                          style={{ color: VS_COLORS.blue }}
                        >
                          Open Action Management →
                        </Link>
                      </div>
                      <div className="vs-panel p-4">
                        <p className="vs-eyebrow">Preventive actions</p>
                        <ul
                          className="mt-2 list-disc space-y-1 pl-4 text-xs"
                          style={{ color: VS_COLORS.muted }}
                        >
                          {dash.aiHelper.suggestedPreventiveActions.map((a) => (
                            <li key={a}>{a}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="vs-panel p-4">
                        <p className="vs-eyebrow">Related safety meeting topics</p>
                        <ul className="mt-2 space-y-2 text-xs">
                          {dash.aiHelper.suggestedMeetingTopics.map((t) => (
                            <li key={t.title}>
                              <Link href={t.href} style={{ color: VS_COLORS.blue }}>
                                {t.title} →
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="vs-panel p-4">
                        <p className="vs-eyebrow">Inspection focus areas</p>
                        <ul className="mt-2 space-y-2 text-xs">
                          {dash.aiHelper.suggestedInspectionFocus.map((t) => (
                            <li key={t.title}>
                              <Link href={t.href} style={{ color: VS_COLORS.blue }}>
                                {t.title} →
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </VsSection>

              <VsSection band="detail" label="Investigation workflow (Intelex / ISN class)">
                <p className="mb-3 text-xs" style={{ color: VS_COLORS.muted }}>
                  Open any incident from the dashboard queue to run the five-stage
                  investigation: Information → Evidence → Root cause (5-Why /
                  Fishbone / TapRooT) → Corrective actions → Final review.
                </p>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {dash.howTo.map((step, i) => (
                    <div
                      key={step.id}
                      className="vs-panel p-4"
                      style={{ borderTop: `2px solid ${VS_COLORS.blue}` }}
                    >
                      <p
                        className="text-[10px] font-semibold uppercase tracking-wide"
                        style={{ color: VS_COLORS.muted }}
                      >
                        Step {i + 1}
                      </p>
                      <h3
                        className="mt-1 text-sm font-semibold"
                        style={{ color: VS_COLORS.white }}
                      >
                        {step.title}
                      </h3>
                      <p
                        className="mt-2 text-xs leading-relaxed"
                        style={{ color: VS_COLORS.muted }}
                      >
                        {step.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </VsSection>
            </>
          ) : null}

          {tab === "history" ? (
            <>
              <SmartIncidentLogPanel log={dash.smartLog} />
              <VsSection band="trend" label="Historical trends">
                <TrendPanel
                  title="Historical incident rate /200k"
                  series={dash.historicalTrends.ratePer200k}
                  rangeLabel="24 mo"
                />
                <TrendPanel
                  title="Closed investigations"
                  series={dash.historicalTrends.closedInvestigations}
                  rangeLabel="24 mo"
                />
              </VsSection>
            </>
          ) : null}

          <VeriPmAiIntelligencePanel
            page="incidents"
            projectId={projectId}
            companyId={companyId}
            plane={plane}
            showForecast={tab === "dashboard"}
          />
        </>
      ) : null}
    </VsDashboardShell>
  );
}
