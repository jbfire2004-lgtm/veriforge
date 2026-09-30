"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  LineChart,
  FolderKanban,
  ShieldAlert,
  Wrench,
} from "lucide-react";
import type {
  SifHecaAccessPlane,
  SifHecaHubDashboard,
} from "@/lib/veripm-sif-heca-hub";
import { resolveVeriPmPlane } from "@/lib/veripm-ai-intelligence";
import {
  FlhaEnergyWheel,
  InsightStrip,
  KpiTile,
  SmsCoreIntegrationGrid,
  TrendPanel,
  VsDashboardShell,
  VsSection,
  VsStatusBadge,
} from "@/components/verisuite-intelligence-ui";
import { smsCoreSiblingIntegrations } from "@/lib/sms-core-integrations";
import { VS_COLORS, type VsTone } from "@/lib/verisuite-intelligence-ui/tokens";
import { useCachedAggregate } from "@/lib/verisuite-intelligence-ui/useCachedAggregate";
import { Skeleton } from "@/components/ui/skeleton";
import { SmsAiIntegrationPanel } from "@/components/verisuite-sms-ai/SmsAiIntegrationPanel";
import { SmsInteractionFlowPanel } from "@/components/verisuite-sms-ai/SmsInteractionFlowPanel";
import { SifHecaAiAssessmentPanel } from "@/components/veripm-sif-heca-hub/SifHecaAiAssessmentPanel";

const STATUS_TONE: Record<string, VsTone> = {
  completed: "positive",
  closed: "positive",
  approved: "positive",
  open: "caution",
  in_progress: "caution",
  review_required: "critical",
  draft: "neutral",
};

const SIF_TONE: Record<string, VsTone> = {
  low: "positive",
  medium: "info",
  high: "caution",
  critical: "critical",
};

export function VeriPmSifHecaHubView({
  projectId = 1,
  companyId = 1,
}: {
  projectId?: number;
  companyId?: number;
}) {
  const { data: session } = useSession();
  const role = session?.user?.role ?? null;
  const defaultPlane = resolveVeriPmPlane(role) as SifHecaAccessPlane;
  const [planeOverride, setPlaneOverride] =
    useState<SifHecaAccessPlane | null>(null);
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
    if (role) q.set("role", role);
    return `/api/v1/veripm-sif-heca-hub?${q}`;
  }, [projectId, companyId, plane, role]);

  const { data: dash, loading, error, fromCache } =
    useCachedAggregate<SifHecaHubDashboard>(url);

  const chips = dash
    ? [
        {
          id: "scope",
          label: "Scope",
          value: dash.scopeLabel,
          tone: "info" as const,
        },
        {
          id: "sif",
          label: "SIF exposures",
          value: String(dash.kpis.sifExposures),
          tone: "alert" as const,
          href: dash.links.evaluate,
        },
        {
          id: "heca",
          label: "HECA completed",
          value: String(dash.kpis.hecaCompleted),
          tone: "positive" as const,
        },
        {
          id: "ccv",
          label: "CCV rate",
          value: `${dash.kpis.criticalControlVerificationRate}%`,
          tone:
            dash.kpis.criticalControlVerificationRate >= 80
              ? ("positive" as const)
              : ("caution" as const),
        },
      ]
    : [];

  const energyWheelItems =
    dash?.energyBreakdown.map((e) => ({
      key: e.key,
      label: e.label,
      score: e.controlScore,
      flagged: e.highEnergy && e.controlScore < 75,
    })) ?? [];

  return (
    <VsDashboardShell
      eyebrow="VeriPM · SIF / HECA"
      title="Serious injury & fatality · HECA"
      description="Unified SIF exposure tracking, high-energy control analysis, critical control verification, and AI-assisted HECA assessment — linked to Action Management, FieldOS, Safety Intelligence, and Projects."
      meta={
        dash
          ? `${dash.scopeLabel} · ${dash.periodLabel} · rev ${dash.revision}${
              fromCache ? " · cached" : ""
            }`
          : undefined
      }
    >
      <VsSection band="controls" label="Controls" icon={ShieldAlert}>
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
          {dash ? (
            <>
              <Link
                href={dash.links.evaluate}
                className="rounded px-3 py-1.5 text-xs font-semibold"
                style={{ background: VS_COLORS.blue, color: VS_COLORS.navy }}
              >
                New HECA assessment
              </Link>
              <Link
                href={dash.links.jhaFlha}
                className="rounded px-3 py-1.5 text-xs font-semibold"
                style={{
                  background: VS_COLORS.slate,
                  color: VS_COLORS.white,
                  border: `1px solid ${VS_COLORS.border}`,
                }}
              >
                JHA / FLHA
              </Link>
            </>
          ) : null}
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

          <VsSection
            band="kpi"
            label="SIF / HECA overview"
            description="Exposures, completed assessments, open actions, and critical control verification."
            icon={Activity}
          >
            <KpiTile
              label="SIF exposures"
              value={dash.kpis.sifExposures}
              delta={dash.kpis.deltas.sifExposures}
              tone="critical"
              sparkline={dash.sifTrend.slice(-8).map((p) => p.value)}
            />
            <KpiTile
              label="HECA completed"
              value={dash.kpis.hecaCompleted}
              delta={dash.kpis.deltas.hecaCompleted}
              tone="positive"
            />
            <KpiTile
              label="Open actions"
              value={dash.kpis.openActions}
              delta={dash.kpis.deltas.openActions}
              tone="caution"
            />
            <KpiTile
              label="Critical control verification"
              value={dash.kpis.criticalControlVerificationRate}
              unit="%"
              delta={dash.kpis.deltas.criticalControlVerificationRate}
              tone={
                dash.kpis.criticalControlVerificationRate >= 80
                  ? "positive"
                  : "caution"
              }
              sparkline={dash.verificationTrend.slice(-8).map((p) => p.value)}
            />
          </VsSection>

          <VsSection
            band="trend"
            label="Verification & exposure trends"
            icon={LineChart}
          >
            <TrendPanel
              title="Critical control verification %"
              series={dash.verificationTrend}
              rangeLabel="12 mo"
            />
            <TrendPanel
              title="SIF exposure index"
              series={dash.sifTrend}
              rangeLabel="12 mo"
            />
          </VsSection>

          <VsSection
            band="detail"
            label="Energy exposure breakdown"
            description="Gravity, motion, electrical, pressure, chemical, thermal, and radiation."
            icon={AlertTriangle}
          >
            <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
              <FlhaEnergyWheel
                title="Energy wheel · control coverage"
                energies={energyWheelItems}
              />
              <div className="space-y-2">
                {dash.energyBreakdown.map((e) => (
                  <div
                    key={e.key}
                    className="vs-panel flex flex-wrap items-center justify-between gap-3 p-3"
                    style={{
                      borderLeft: `3px solid ${
                        e.highEnergy && e.controlScore < 75
                          ? VS_COLORS.critical
                          : e.highEnergy
                            ? VS_COLORS.orange
                            : VS_COLORS.blue
                      }`,
                    }}
                  >
                    <div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: VS_COLORS.white }}
                      >
                        {e.label}
                      </p>
                      <p className="mt-0.5 text-xs" style={{ color: VS_COLORS.muted }}>
                        Exposure {e.exposurePct}% · {e.openExposures} open
                        {e.highEnergy ? " · high energy" : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <VsStatusBadge
                        tone={
                          e.controlScore >= 80
                            ? "positive"
                            : e.controlScore >= 65
                              ? "caution"
                              : "critical"
                        }
                      >
                        CCV {e.controlScore}%
                      </VsStatusBadge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </VsSection>

          <VsSection
            band="detail"
            label="SIF / HECA queue"
            description="Active assessments requiring review or field verification."
            icon={ClipboardCheck}
          >
            <div className="vs-panel overflow-x-auto p-0">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr style={{ color: VS_COLORS.muted }}>
                    <th className="p-3 font-medium">Assessment</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">SIF</th>
                    <th className="p-3 font-medium">HECA</th>
                  </tr>
                </thead>
                <tbody>
                  {dash.queue.map((row) => (
                    <tr
                      key={row.id}
                      style={{ borderTop: `1px solid ${VS_COLORS.border}` }}
                    >
                      <td className="p-3">
                        <Link
                          href={row.href}
                          className="hover:underline"
                          style={{ color: VS_COLORS.white }}
                        >
                          {row.title}
                        </Link>
                        {row.highEnergy ? (
                          <span
                            className="ml-2 text-[10px] font-semibold uppercase"
                            style={{ color: VS_COLORS.critical }}
                          >
                            High energy
                          </span>
                        ) : null}
                      </td>
                      <td className="p-3">
                        <VsStatusBadge
                          tone={STATUS_TONE[row.status] ?? "neutral"}
                        >
                          {row.status.replace(/_/g, " ")}
                        </VsStatusBadge>
                      </td>
                      <td className="p-3">
                        <VsStatusBadge
                          tone={SIF_TONE[row.sifCategory] ?? "neutral"}
                        >
                          {row.sifCategory}
                        </VsStatusBadge>
                      </td>
                      <td className="p-3" style={{ color: VS_COLORS.muted }}>
                        {row.hecaLabel}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </VsSection>

          <VsSection
            band="detail"
            label="Open actions from HECA / SIF"
            description="Linked into Action Management for ownership and verification."
            icon={Wrench}
          >
            <ul className="space-y-2">
              {dash.openActions.map((a) => (
                <li key={a.id}>
                  <Link
                    href={a.href}
                    className="vs-panel flex flex-wrap items-center justify-between gap-2 p-4 transition hover:opacity-95"
                  >
                    <div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: VS_COLORS.white }}
                      >
                        {a.title}
                      </p>
                      <p className="mt-1 text-xs" style={{ color: VS_COLORS.muted }}>
                        {a.source}
                      </p>
                    </div>
                    <VsStatusBadge tone={a.overdue ? "critical" : "caution"}>
                      {a.dueLabel}
                    </VsStatusBadge>
                  </Link>
                </li>
              ))}
            </ul>
          </VsSection>

          <VsSection
            band="detail"
            label="AI-powered HECA assessment"
            description="Describe the work scope — infer energy types, HECA category, and SIF protocol."
            icon={CheckCircle2}
          >
            <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
              <SifHecaAiAssessmentPanel
                companyId={companyId}
                projectId={projectId}
              />
              <div className="space-y-4">
                <SmsAiIntegrationPanel
                  page="sif-heca"
                  companyId={companyId}
                  projectId={projectId}
                  plane={plane === "company" ? "company" : "project"}
                  title="SIF / HECA AI signals"
                  fallbackInsights={dash.insights}
                  defaultAcceptAction="create_action"
                />
                <SmsInteractionFlowPanel
                  page="sif-heca"
                  companyId={companyId}
                  projectId={projectId}
                  plane={plane === "company" ? "company" : "project"}
                  title="SIF / HECA flows"
                />
              </div>
            </div>
          </VsSection>

          <VsSection
            band="narrative"
            label="SMS Core federation"
            description="SIF/HECA shares scope with SMS Core, Projects, FieldOS, ERP, and Safety Hub."
            icon={FolderKanban}
          >
            <SmsCoreIntegrationGrid
              items={smsCoreSiblingIntegrations("sif-heca", {
                companyId,
                projectId,
              })}
            />
          </VsSection>
        </>
      ) : null}
    </VsDashboardShell>
  );
}
