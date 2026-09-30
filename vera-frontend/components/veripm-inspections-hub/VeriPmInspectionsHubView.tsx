"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import type {
  InspectionAccessPlane,
  InspectionsHubDashboard,
} from "@/lib/veripm-inspections-hub";
import { resolveVeriPmPlane } from "@/lib/veripm-ai-intelligence";
import {
  InsightStrip,
  InspectionGrid,
  KpiTile,
  TrendPanel,
  VsDashboardShell,
  VsSection,
  VsStatusBadge,
} from "@/components/verisuite-intelligence-ui";
import { SmsAiIntegrationPanel } from "@/components/verisuite-sms-ai/SmsAiIntegrationPanel";
import { SmsInteractionFlowPanel } from "@/components/verisuite-sms-ai/SmsInteractionFlowPanel";
import { VS_COLORS, type VsTone } from "@/lib/verisuite-intelligence-ui/tokens";
import { useCachedAggregate } from "@/lib/verisuite-intelligence-ui/useCachedAggregate";
import { Skeleton } from "@/components/ui/skeleton";
import { InspectionLaunchGrid } from "@/components/inspections/InspectionLaunchGrid";
import { VeriPmAiIntelligencePanel } from "@/components/veripm-ai-intelligence";

const SOURCE_COLOR: Record<string, string> = {
  incident: VS_COLORS.critical,
  action: VS_COLORS.orange,
  meeting: VS_COLORS.blue,
  ai: VS_COLORS.emerald,
  industry: VS_COLORS.muted,
};

function severityTone(severity: string): VsTone {
  const s = severity.toLowerCase();
  if (s === "critical" || s === "high" || s === "fatality") return "critical";
  if (s === "medium" || s === "lt" || s === "ma") return "caution";
  if (s === "low" || s === "fa") return "positive";
  return "neutral";
}

export function VeriPmInspectionsHubView({
  projectId = 1,
  companyId = 1,
  initialFocus,
}: {
  projectId?: number;
  companyId?: number;
  initialFocus?: string | null;
}) {
  const { data: session } = useSession();
  const role = session?.user?.role ?? null;
  const defaultPlane = resolveVeriPmPlane(role) as InspectionAccessPlane;
  const [planeOverride, setPlaneOverride] =
    useState<InspectionAccessPlane | null>(null);
  const plane = planeOverride ?? defaultPlane;
  const canSwitch =
    role === "SUPER_ADMIN" ||
    role === "ADMIN" ||
    role === "COMPANY_ADMIN" ||
    role === "PROJECT_MANAGER";

  const url = useMemo(() => {
    const q = new URLSearchParams({
      projectId: String(projectId),
      companyId: String(companyId),
      plane,
    });
    if (initialFocus) q.set("focus", initialFocus);
    if (role) q.set("role", role);
    return `/api/v1/veripm-inspections-hub?${q}`;
  }, [projectId, companyId, plane, initialFocus, role]);

  const { data: dash, loading, error, fromCache } =
    useCachedAggregate<InspectionsHubDashboard>(url);

  const chips = dash
    ? [
        {
          id: "scope",
          label: "Scope",
          value: dash.scopeLabel,
          tone: "info" as const,
        },
        {
          id: "comp",
          label: "Completion",
          value: `${dash.kpis.completionRate}%`,
          tone: "positive" as const,
        },
        {
          id: "find",
          label: "Open findings",
          value: String(dash.kpis.findingsOpen),
          tone: "caution" as const,
        },
        {
          id: "focus",
          label: "AI focus areas",
          value: String(dash.focusAreas.length),
          tone: "info" as const,
        },
      ]
    : [];

  const launchLinks = {
    smartSite:
      dash?.links.smartSite ??
      `/pm/inspections/smart-site?projectId=${projectId}&companyId=${companyId}`,
    focusAudits:
      dash?.links.focusAudits ??
      `/pm/inspections/focus-audits?projectId=${projectId}&companyId=${companyId}`,
    equipment:
      dash?.links.equipment ??
      `/pm/inspections/new?group=equipment&projectId=${projectId}&companyId=${companyId}`,
    equipmentSafety:
      dash?.links.equipmentSafety ??
      `/pm/equipment-safety?projectId=${projectId}&companyId=${companyId}`,
    ppe:
      dash?.links.ppe ??
      `/pm/inspections/ppe-preuse/new?projectId=${projectId}&companyId=${companyId}`,
    ppeSpotCheck:
      dash?.links.ppeSpotCheck ??
      `/pm/inspections/new?group=ppe&projectId=${projectId}&companyId=${companyId}`,
    safetyDevices:
      dash?.links.safetyDevices ??
      `/pm/inspections/new?group=safety_devices&projectId=${projectId}&companyId=${companyId}`,
    bboNew:
      dash?.links.bboNew ??
      `/pm/safety-intelligence/bbo/new?projectId=${projectId}&companyId=${companyId}`,
    newInspection:
      dash?.links.newInspection ??
      `/pm/inspections/new?projectId=${projectId}&companyId=${companyId}`,
  };

  return (
    <VsDashboardShell
      eyebrow="VeriPM · Inspections"
      title="Smart inspections"
      description="AI focus areas from incidents, Action Management, and safety meetings — with clear dashboards, next steps, and cross-page links into training."
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
          {canSwitch
            ? (["project", "company", "subcontractor"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  className="rounded px-3 py-1.5 text-xs font-semibold uppercase"
                  style={{
                    background: plane === p ? VS_COLORS.blue : VS_COLORS.slate,
                    color: plane === p ? VS_COLORS.navy : VS_COLORS.white,
                    border: `1px solid ${VS_COLORS.border}`,
                  }}
                  onClick={() => setPlaneOverride(p)}
                >
                  {p}
                </button>
              ))
            : null}
          <Link
            href={launchLinks.smartSite}
            className="ml-auto rounded px-3 py-1.5 text-xs font-semibold"
            style={{ background: VS_COLORS.blue, color: VS_COLORS.navy }}
          >
            Start smart site
          </Link>
          <Link
            href={launchLinks.newInspection}
            className="rounded px-3 py-1.5 text-xs font-semibold"
            style={{
              background: VS_COLORS.slate,
              color: VS_COLORS.white,
              border: `1px solid ${VS_COLORS.border}`,
            }}
          >
            All checklists
          </Link>
        </div>
      </VsSection>

      <VsSection band="detail" label="Start an inspection">
        <InspectionLaunchGrid links={launchLinks} />
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

          <VsSection band="kpi" label="Inspection overview">
            <KpiTile
              label="Completion rate"
              value={dash.kpis.completionRate}
              unit="%"
              delta={dash.kpis.deltas.completionRate}
              tone="positive"
              sparkline={dash.completionTrend.map((p) => p.value)}
            />
            <KpiTile
              label="Open findings"
              value={dash.kpis.findingsOpen}
              delta={dash.kpis.deltas.findingsOpen}
              tone="caution"
            />
            <KpiTile
              label="BBO observations"
              value={dash.kpis.bboCount}
              delta={dash.kpis.deltas.bboCount}
              tone="info"
            />
            <KpiTile
              label="Focus audits due"
              value={dash.kpis.focusAuditsDue}
              tone="info"
            />
            <KpiTile
              label="Leading coverage"
              value={dash.kpis.leadingCoverage}
              unit="/100"
              delta={dash.kpis.deltas.leadingCoverage}
              tone="positive"
            />
            <KpiTile
              label="Inspection quality"
              value={dash.kpis.qualityScore}
              unit="/100"
              tone={dash.kpis.qualityScore >= 80 ? "positive" : "caution"}
            />
          </VsSection>

          <VsSection band="trend" label="Completion · BBO · focus audits">
            <TrendPanel
              title="Inspection completion %"
              series={dash.completionTrend}
              rangeLabel="12 mo"
            />
            <TrendPanel
              title="BBO trend"
              series={dash.bboTrend}
              rangeLabel="12 mo"
            />
            <TrendPanel
              title="Focus audit trend"
              series={dash.focusAuditTrend}
              rangeLabel="12 mo"
            />
            <TrendPanel
              title="Findings (indexed)"
              series={dash.findingsTrend}
              rangeLabel="12 mo"
            />
          </VsSection>

          <VsSection band="detail" label="Findings this week · recurring">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="vs-panel p-4">
                <p className="vs-eyebrow">Top findings this week</p>
                <ul className="mt-3 space-y-3">
                  {dash.topFindingsThisWeek.map((f) => (
                    <li key={f.id}>
                      <div className="flex justify-between gap-2 text-sm">
                        <span style={{ color: VS_COLORS.white }}>{f.title}</span>
                        <span className="tabular-nums" style={{ color: VS_COLORS.orange }}>
                          ×{f.count}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-2 text-[11px]">
                        <Link href={f.linkedActionHref} style={{ color: VS_COLORS.blue }}>
                          Action →
                        </Link>
                        <Link href={f.linkedMeetingHref} style={{ color: VS_COLORS.blue }}>
                          Meeting →
                        </Link>
                        <Link href={f.linkedJhaHref} style={{ color: VS_COLORS.blue }}>
                          JHA update →
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="vs-panel p-4">
                <p className="vs-eyebrow">Recurring findings</p>
                <ul className="mt-3 space-y-3">
                  {dash.recurringFindings.map((f) => (
                    <li key={f.id}>
                      <div className="flex justify-between gap-2 text-sm">
                        <span style={{ color: VS_COLORS.white }}>{f.title}</span>
                        <VsStatusBadge tone={severityTone(f.severity)}>
                          {f.severity}
                        </VsStatusBadge>
                      </div>
                      <p className="mt-1 text-[11px]" style={{ color: VS_COLORS.muted }}>
                        Seen {f.count}× — escalate to Action Management + meeting topic
                      </p>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs" style={{ color: VS_COLORS.muted }}>
                  {dash.quality.narrative}
                </p>
              </div>
            </div>
          </VsSection>

          <VsSection band="detail" label="AI inspection focus areas">
            <div className="grid gap-3 md:grid-cols-2">
              {dash.focusAreas.map((f) => (
                <div
                  key={f.id}
                  className="vs-panel p-4"
                  style={{
                    borderLeft: `3px solid ${SOURCE_COLOR[f.source] ?? VS_COLORS.blue}`,
                  }}
                >
                  <p
                    className="text-[10px] font-semibold uppercase"
                    style={{ color: VS_COLORS.muted }}
                  >
                    {f.source} · priority {f.priority} · {f.relatedIncidents}{" "}
                    related incidents
                  </p>
                  <h3
                    className="mt-1 text-sm font-semibold"
                    style={{ color: VS_COLORS.white }}
                  >
                    {f.title}
                  </h3>
                  <p className="mt-2 text-xs" style={{ color: VS_COLORS.muted }}>
                    {f.reason}
                  </p>
                  <Link
                    href={f.href}
                    className="mt-3 inline-block text-xs font-semibold"
                    style={{ color: VS_COLORS.blue }}
                  >
                    Start focused inspection →
                  </Link>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <SmsAiIntegrationPanel
                page="inspections"
                companyId={companyId}
                projectId={projectId}
                plane={plane === "company" ? "company" : "project"}
                title="Inspection intelligence (AI-08 / AI-09)"
                defaultAcceptAction="create_inspection_focus"
                fallbackInsights={dash.focusAreas.slice(0, 3).map((f) => ({
                  id: f.id,
                  tone: "caution" as const,
                  headline: f.title,
                  body: f.reason,
                  confidence: 0.75,
                  href: f.href,
                }))}
              />
              <div className="mt-4">
                <SmsInteractionFlowPanel
                  page="inspections"
                  companyId={companyId}
                  projectId={projectId}
                  plane={plane === "company" ? "company" : "project"}
                  title="Inspection completion flow"
                  showCrossLinks={false}
                />
              </div>
            </div>
          </VsSection>

          <VsSection band="detail" label="Open inspection queue">
            <InspectionGrid
              title="Open queue"
              rows={dash.openQueue.map((row) => ({
                id: row.id,
                date: row.dueDate,
                type: row.title.toLowerCase().includes("bbo")
                  ? "bbo"
                  : row.title.toLowerCase().includes("focus")
                    ? "focus"
                    : "standard",
                location: row.assignee,
                findingsOpen: row.findingsOpen,
                qualityScore: null,
                status:
                  row.status === "overdue"
                    ? "in_review"
                    : row.status === "completed"
                      ? "complete"
                      : row.status,
              }))}
              onSelect={(id) => {
                const row = dash.openQueue.find((r) => r.id === id);
                if (row?.href) window.location.href = row.href;
              }}
            />
            <div className="mt-3 flex flex-wrap gap-4 text-xs">
              <Link href={dash.links.actions} style={{ color: VS_COLORS.blue }}>
                Findings → Action Management →
              </Link>
              <Link href={dash.links.meetings} style={{ color: VS_COLORS.blue }}>
                Safety meetings →
              </Link>
              <Link href={dash.links.jhaFlha} style={{ color: VS_COLORS.blue }}>
                JHA updates →
              </Link>
              <Link href={dash.links.training} style={{ color: VS_COLORS.blue }}>
                Training gaps →
              </Link>
              <Link href={dash.links.bbo} style={{ color: VS_COLORS.blue }}>
                BBO list →
              </Link>
              <Link href={dash.links.focusAudits} style={{ color: VS_COLORS.blue }}>
                Focus audits →
              </Link>
            </div>
          </VsSection>

          <VeriPmAiIntelligencePanel
            page="inspections"
            projectId={projectId}
            companyId={companyId}
            plane={plane}
          />
        </>
      ) : null}
    </VsDashboardShell>
  );
}
