"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import type {
  HomeAccessPlane,
  TrendWindowMonths,
  VeriPmHomeDashboard,
} from "@/lib/veripm-home-dashboard";
import { resolveHomePlane } from "@/lib/veripm-home-dashboard";
import {
  InsightStrip,
  KpiTile,
  TrendPanel,
  VsDashboardShell,
  VsSection,
} from "@/components/verisuite-intelligence-ui";
import { VS_COLORS } from "@/lib/verisuite-intelligence-ui/tokens";
import { useCachedAggregate } from "@/lib/verisuite-intelligence-ui/useCachedAggregate";
import { Skeleton } from "@/components/ui/skeleton";
import { VeriPmAiIntelligencePanel } from "@/components/veripm-ai-intelligence";
import { SmsAiIntegrationPanel } from "@/components/verisuite-sms-ai/SmsAiIntegrationPanel";
import { SmsInteractionFlowPanel } from "@/components/verisuite-sms-ai/SmsInteractionFlowPanel";
import { usePmSmsScope } from "@/hooks/usePmSmsScope";

function fmt(n: number, digits = 1) {
  return n.toFixed(digits);
}

const QUICK_TONE: Record<
  NonNullable<VeriPmHomeDashboard["quickLinks"][0]["tone"]>,
  string
> = {
  neutral: VS_COLORS.muted,
  positive: VS_COLORS.emerald,
  caution: VS_COLORS.orange,
  alert: VS_COLORS.critical,
  info: VS_COLORS.blue,
};

export function VeriPmHomeDashboardView() {
  const { data: session } = useSession();
  const role = session?.user?.role ?? null;
  const defaultPlane = resolveHomePlane(role);
  const smsScope = usePmSmsScope(1, 1);

  const [planeOverride, setPlaneOverride] = useState<HomeAccessPlane | null>(
    null,
  );
  const [months, setMonths] = useState<TrendWindowMonths>(24);

  const plane = planeOverride ?? defaultPlane;
  const companyId = smsScope.companyId ?? 1;
  const projectId = smsScope.projectId ?? undefined;
  const canSwitchPlane =
    role === "SUPER_ADMIN" ||
    role === "ADMIN" ||
    role === "COMPANY_ADMIN" ||
    role === "PROJECT_MANAGER";

  const url = useMemo(() => {
    const q = new URLSearchParams({
      plane,
      months: String(months),
    });
    return `/api/v1/veripm-home-dashboard?${q}`;
  }, [plane, months]);

  const { data: dash, loading, error, fromCache } =
    useCachedAggregate<VeriPmHomeDashboard>(url);

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
          value: fmt(dash.kpis.incidentRatePer200k, 2),
          tone:
            dash.kpis.deltas.incidentRatePer200k < 0
              ? ("positive" as const)
              : ("caution" as const),
          href: "/pm/incidents",
        },
        {
          id: "actions",
          label: "Open corrective",
          value: String(dash.kpis.openCorrectiveActions),
          tone:
            dash.kpis.correctiveMedianAgeDays > 21
              ? ("alert" as const)
              : ("caution" as const),
          href: "/pm/action-management",
        },
        {
          id: "leading",
          label: "Leading score",
          value: String(dash.kpis.leadingIndicatorScore),
          tone: "positive" as const,
          href: "/pm/inspections",
        },
      ]
    : [];

  return (
    <VsDashboardShell
      eyebrow="VeriPM · Safety hub"
      title="Project management safety overview"
      description="Dashboard-first landing for project, company, and subcontractor scopes — incidents, leading indicators, corrective action aging, and smart next steps. Rates normalized per 200,000 hours."
      meta={
        dash
          ? `${dash.scopeLabel} · ${dash.periodLabel} · /${dash.hoursDenominator.toLocaleString()} · rev ${dash.revision}${
              fromCache ? " · cached" : ""
            }`
          : undefined
      }
    >
      <VsSection band="controls">
        <div className="flex flex-wrap items-center gap-2">
          {canSwitchPlane ? (
            <>
              {(
                [
                  ["project", "Project"],
                  ["company", "Company"],
                  ["subcontractor", "Subcontractor"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className="rounded px-3 py-1.5 text-xs font-semibold uppercase tracking-wide"
                  style={{
                    background:
                      plane === id ? VS_COLORS.blue : VS_COLORS.slate,
                    color: plane === id ? VS_COLORS.navy : VS_COLORS.white,
                    border: `1px solid ${VS_COLORS.border}`,
                  }}
                  onClick={() => setPlaneOverride(id)}
                >
                  {label}
                </button>
              ))}
            </>
          ) : (
            <span
              className="rounded px-3 py-1.5 text-xs font-semibold uppercase tracking-wide"
              style={{
                background: VS_COLORS.slate,
                color: VS_COLORS.blue,
                border: `1px solid ${VS_COLORS.border}`,
              }}
            >
              {dash?.scopeLabel ?? defaultPlane}
            </span>
          )}

          <span className="mx-1 text-xs" style={{ color: VS_COLORS.muted }}>
            Trends
          </span>
          {([12, 24, 36] as TrendWindowMonths[]).map((m) => (
            <button
              key={m}
              type="button"
              className="rounded px-2.5 py-1 text-xs font-medium"
              style={{
                background: months === m ? "transparent" : VS_COLORS.panel,
                color: months === m ? VS_COLORS.blue : VS_COLORS.muted,
                border: `1px solid ${months === m ? VS_COLORS.blue : VS_COLORS.border}`,
              }}
              onClick={() => setMonths(m)}
            >
              {m} mo
            </button>
          ))}

          <Link
            href="/pm/projects"
            className="ml-auto text-xs font-medium underline-offset-2 hover:underline"
            style={{ color: VS_COLORS.blue }}
          >
            Manage projects
          </Link>
        </div>
      </VsSection>

      {error ? (
        <p className="text-sm" style={{ color: VS_COLORS.critical }}>
          {error}
        </p>
      ) : null}

      {loading && !dash ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded" />
          ))}
        </div>
      ) : null}

      {dash ? (
        <>
          <InsightStrip chips={chips} cachedHint={fromCache} />

          <VsSection band="kpi" label="Safety KPIs">
              <KpiTile
                label="Total incidents"
                value={dash.kpis.incidentCount}
                delta={dash.kpis.deltas.incidentCount}
                tone="caution"
                sparkline={dash.trends.incidents.slice(-8).map((p) => p.value)}
              />
              <KpiTile
                label="Incident rate"
                value={fmt(dash.kpis.incidentRatePer200k, 2)}
                unit="/200k"
                delta={dash.kpis.deltas.incidentRatePer200k}
                tone={
                  dash.kpis.deltas.incidentRatePer200k < 0
                    ? "positive"
                    : "caution"
                }
                sparkline={dash.trends.incidents.map((p) => p.value)}
              />
              <KpiTile
                label="Near-miss count"
                value={dash.kpis.nearMissCount}
                delta={dash.kpis.deltas.nearMissCount}
                tone="info"
                sparkline={dash.trends.nearMisses.slice(-8).map((p) => p.value)}
              />
              <KpiTile
                label="Leading indicator score"
                value={dash.kpis.leadingIndicatorScore}
                unit="/100"
                delta={dash.kpis.deltas.leadingIndicatorScore}
                tone="positive"
                sparkline={dash.trends.inspectionCompletion
                  .slice(-8)
                  .map((p) => p.value)}
              />
              <KpiTile
                label="Open corrective actions"
                value={dash.kpis.openCorrectiveActions}
                delta={dash.kpis.deltas.openCorrectiveActions}
                tone="caution"
              />
              <KpiTile
                label="Corrective aging (median)"
                value={dash.kpis.correctiveMedianAgeDays}
                unit="days"
                delta={dash.kpis.deltas.correctiveMedianAgeDays}
                tone={
                  dash.kpis.correctiveMedianAgeDays > 21 ? "critical" : "neutral"
                }
              />
          </VsSection>

          <VsSection band="trend" label="Trends">
              <TrendPanel
                title="Incident rate /200k"
                series={dash.trends.incidents}
                rangeLabel={`${dash.trendWindowMonths}-month`}
                anomalies={
                  dash.trends.incidents.length > 4
                    ? [
                        {
                          period:
                            dash.trends.incidents[
                              Math.floor(dash.trends.incidents.length * 0.6)
                            ]!.period,
                          label: "Anomaly",
                        },
                      ]
                    : []
                }
              />
              <TrendPanel
                title="Near-miss rate (indexed)"
                series={dash.trends.nearMisses}
                rangeLabel={`${dash.trendWindowMonths}-month`}
              />
              <TrendPanel
                title="Safety meeting frequency"
                series={dash.trends.safetyMeetingFrequency}
                rangeLabel="Meetings / week equiv."
              />
              <TrendPanel
                title="Inspection completion %"
                series={dash.trends.inspectionCompletion}
                rangeLabel={`${dash.trendWindowMonths}-month`}
              />
          </VsSection>

          <VsSection band="detail" label="Quick access">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {dash.quickLinks.map((link) => (
                <Link
                  key={link.id}
                  href={link.href}
                  className="vs-panel vs-panel-interactive block p-4 transition-transform hover:-translate-y-0.5"
                  style={{ borderLeft: `3px solid ${QUICK_TONE[link.tone]}` }}
                >
                  <p
                    className="text-[11px] font-semibold uppercase tracking-[0.08em]"
                    style={{ color: VS_COLORS.muted }}
                  >
                    {link.label}
                  </p>
                  <p
                    className="mt-2 text-sm font-medium"
                    style={{ color: VS_COLORS.white }}
                  >
                    {link.signal}
                  </p>
                  <p
                    className="mt-2 text-xs"
                    style={{ color: VS_COLORS.blue }}
                  >
                    Open →
                  </p>
                </Link>
              ))}
            </div>
          </VsSection>

          <VsSection band="narrative" label="Smart insights">
            <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
              <SmsAiIntegrationPanel
                page="home"
                companyId={companyId}
                projectId={projectId}
                plane={plane === "company" ? "company" : "project"}
                title="AI summary & emerging risks"
                fallbackInsights={dash.insights}
                defaultAcceptAction="create_action"
              />
              <SmsInteractionFlowPanel
                page="home"
                companyId={companyId}
                projectId={projectId}
                plane={plane === "company" ? "company" : "project"}
                title="Dashboard & intelligence flows"
              />
            </div>
            <div className="vs-panel mt-4 p-4">
                <p className="vs-eyebrow">Suggested focus</p>
                <ul className="mt-3 space-y-3">
                  {dash.focusAreas.map((f) => (
                    <li key={f.id}>
                      <Link
                        href={f.href}
                        className="block rounded border-l-2 pl-3 hover:opacity-90"
                        style={{ borderColor: VS_COLORS.blue }}
                      >
                        <p
                          className="text-sm font-semibold"
                          style={{ color: VS_COLORS.white }}
                        >
                          {f.title}
                        </p>
                        <p
                          className="mt-1 text-xs"
                          style={{ color: VS_COLORS.muted }}
                        >
                          {f.reason}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
          </VsSection>

          <VeriPmAiIntelligencePanel page="home" plane={plane} />
        </>
      ) : null}
    </VsDashboardShell>
  );
}
