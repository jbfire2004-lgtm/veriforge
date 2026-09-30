"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import type {
  TrainingAccessPlane,
  TrainingHubDashboard,
} from "@/lib/veripm-training-hub";
import { resolveVeriPmPlane } from "@/lib/veripm-ai-intelligence";
import {
  InsightStrip,
  KpiTile,
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

const URGENCY_BORDER: Record<string, string> = {
  low: VS_COLORS.emerald,
  medium: VS_COLORS.orange,
  high: VS_COLORS.critical,
};

const URGENCY_TONE: Record<string, VsTone> = {
  low: "positive",
  medium: "caution",
  high: "critical",
};

export function VeriPmTrainingHubView({
  projectId = 1,
  companyId = 1,
}: {
  projectId?: number;
  companyId?: number;
}) {
  const searchParams = useSearchParams();
  const focusParam = searchParams.get("focus");
  const { data: session } = useSession();
  const role = session?.user?.role ?? null;
  const defaultPlane = resolveVeriPmPlane(role) as TrainingAccessPlane;
  const [planeOverride, setPlaneOverride] =
    useState<TrainingAccessPlane | null>(null);
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
    if (focusParam) q.set("focus", focusParam);
    if (role) q.set("role", role);
    return `/api/v1/veripm-training-hub?${q}`;
  }, [projectId, companyId, plane, focusParam, role]);

  const { data: dash, loading, error, fromCache } =
    useCachedAggregate<TrainingHubDashboard>(url);

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
          label: "Compliance",
          value: `${dash.kpis.complianceRate}%`,
          tone: "positive" as const,
        },
        {
          id: "gaps",
          label: "Open gaps",
          value: String(dash.kpis.openGaps),
          tone: "caution" as const,
        },
        {
          id: "exp",
          label: "Expiring soon",
          value: String(dash.kpis.expiringSoon),
          tone: "alert" as const,
        },
      ]
    : [];

  return (
    <VsDashboardShell
      eyebrow="VeriPM · Training"
      title="Competency intelligence"
      description="Training gaps linked from incidents, Action Management, meetings, and inspections — close the loop with clear next steps."
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
            href={dash?.links.coreTraining ?? "/core/training-competency"}
            className="ml-auto rounded px-3 py-1.5 text-xs font-semibold"
            style={{ background: VS_COLORS.blue, color: VS_COLORS.navy }}
          >
            Open Training module
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

          <VsSection band="kpi" label="Training overview">
            <KpiTile
              label="Compliance rate"
              value={dash.kpis.complianceRate}
              unit="%"
              delta={dash.kpis.deltas.complianceRate}
              tone="positive"
              sparkline={dash.complianceTrend.map((p) => p.value)}
            />
            <KpiTile
              label="Open competency gaps"
              value={dash.kpis.openGaps}
              delta={dash.kpis.deltas.openGaps}
              tone="caution"
            />
            <KpiTile
              label="Expiring soon"
              value={dash.kpis.expiringSoon}
              tone="critical"
            />
            <KpiTile
              label="Refreshers assigned"
              value={dash.kpis.refreshersAssigned}
              tone="info"
            />
          </VsSection>

          <VsSection band="trend" label="Compliance trend">
            <TrendPanel
              title="Training compliance %"
              series={dash.complianceTrend}
              rangeLabel="12 mo"
            />
          </VsSection>

          <VsSection band="detail" label="AI-linked competency gaps">
            <div className="grid gap-3 md:grid-cols-2">
              {dash.gaps.map((g) => (
                <div
                  key={g.id}
                  className="vs-panel p-4"
                  style={{
                    borderLeft: `3px solid ${URGENCY_BORDER[g.urgency]}`,
                  }}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <VsStatusBadge tone={URGENCY_TONE[g.urgency] ?? "neutral"}>
                      {g.urgency} urgency
                    </VsStatusBadge>
                    <span
                      className="text-[10px]"
                      style={{ color: VS_COLORS.muted }}
                    >
                      {g.peopleAffected} people
                    </span>
                  </div>
                  <h3
                    className="mt-1 text-sm font-semibold"
                    style={{ color: VS_COLORS.white }}
                  >
                    {g.title}
                  </h3>
                  <p className="mt-2 text-xs" style={{ color: VS_COLORS.muted }}>
                    {g.reason}
                  </p>
                  <p className="mt-1 text-xs" style={{ color: VS_COLORS.blue }}>
                    Root cause: {g.linkedRootCause}
                  </p>
                  <Link
                    href={g.href}
                    className="mt-3 inline-block text-xs font-semibold"
                    style={{ color: VS_COLORS.blue }}
                  >
                    Assign training →
                  </Link>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-xs">
              <Link href={dash.links.incidents} style={{ color: VS_COLORS.blue }}>
                From incidents →
              </Link>
              <Link href={dash.links.inspections} style={{ color: VS_COLORS.blue }}>
                From inspections →
              </Link>
              <Link href={dash.links.meetings} style={{ color: VS_COLORS.blue }}>
                Safety meetings →
              </Link>
            </div>
          </VsSection>

          <VsSection band="narrative" label="SMS AI · competency (AI-15)">
            <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
              <SmsAiIntegrationPanel
                page="training"
                companyId={companyId}
                projectId={projectId}
                plane={plane === "company" ? "company" : "project"}
                title="Competency risk forecasting"
                defaultAcceptAction="create_action"
              />
              <SmsInteractionFlowPanel
                page="training"
                companyId={companyId}
                projectId={projectId}
                plane={plane === "company" ? "company" : "project"}
                title="Dashboard & competency flows"
              />
            </div>
          </VsSection>

          <VeriPmAiIntelligencePanel
            page="training"
            projectId={projectId}
            companyId={companyId}
            plane={plane}
          />
        </>
      ) : null}
    </VsDashboardShell>
  );
}
