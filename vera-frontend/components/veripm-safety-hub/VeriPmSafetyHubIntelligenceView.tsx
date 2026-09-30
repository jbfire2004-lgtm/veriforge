"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ClipboardCheck,
  GraduationCap,
  ShieldAlert,
  Siren,
  Wrench,
} from "lucide-react";
import type { SafetyHubIntelligenceDashboard } from "@/lib/pm-safety-hub-intelligence";
import { smsCoreSiblingIntegrations } from "@/lib/sms-core-integrations";
import {
  FlhaEnergyWheel,
  KpiTile,
  LeadingHeatmap,
  ModuleHubLayout,
  SmsCoreIntegrationGrid,
  TrendPanel,
} from "@/components/verisuite-intelligence-ui";
import { VS_COLORS } from "@/lib/verisuite-intelligence-ui/tokens";
import { useCachedAggregate } from "@/lib/verisuite-intelligence-ui/useCachedAggregate";
import { Skeleton } from "@/components/ui/skeleton";
import { SmsAiIntegrationPanel } from "@/components/verisuite-sms-ai/SmsAiIntegrationPanel";
import { Button } from "@/components/ui/button";

type Props = {
  companyId?: number;
  projectId?: number;
};

export function VeriPmSafetyHubIntelligenceView({
  companyId = 1,
  projectId = 1,
}: Props) {
  const router = useRouter();
  const url = useMemo(() => {
    const q = new URLSearchParams({
      projectId: String(projectId),
      companyId: String(companyId),
    });
    return `/api/v1/pm-safety-hub-intelligence?${q}`;
  }, [projectId, companyId]);

  const { data: dash, loading, error, fromCache, reload } =
    useCachedAggregate<SafetyHubIntelligenceDashboard>(url);

  const chips = dash
    ? [
        {
          id: "scope",
          label: "Scope",
          value: dash.scopeLabel,
          tone: "info" as const,
        },
        {
          id: "leading",
          label: "Leading score",
          value: `${dash.kpis.leadingIndicatorScore}`,
          tone:
            dash.kpis.leadingIndicatorScore >= 75
              ? ("positive" as const)
              : ("caution" as const),
        },
        {
          id: "sources",
          label: "Sources",
          value: dash.sources.join(" · "),
          tone: "neutral" as const,
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

  const federation = smsCoreSiblingIntegrations("safety-hub", {
    companyId,
    projectId,
  });

  return (
    <ModuleHubLayout
      eyebrow="VeriPM · Safety Hub"
      title="Unified safety intelligence"
      description="SIF trends, HECA verification, training compliance, ERP readiness, leading indicators, and high-energy exposure — federated across SMS Core, SIF/HECA, Training, and Emergency Response."
      meta={
        dash
          ? `${dash.scopeLabel} · ${dash.periodLabel} · rev ${dash.revision}${
              fromCache ? " · cached" : ""
            }`
          : undefined
      }
      controls={
        <div className="space-y-2">
          {error ? (
            <p className="text-sm" style={{ color: VS_COLORS.critical }}>
              {error}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-2">
          {dash ? (
            <>
              <Link
                href={dash.links.sifHeca}
                className="rounded px-3 py-1.5 text-xs font-semibold"
                style={{ background: VS_COLORS.blue, color: VS_COLORS.navy }}
              >
                SIF / HECA
              </Link>
              <Link
                href={dash.links.erp}
                className="rounded px-3 py-1.5 text-xs font-semibold"
                style={{
                  background: VS_COLORS.slate,
                  color: VS_COLORS.white,
                  border: `1px solid ${VS_COLORS.border}`,
                }}
              >
                Emergency / ERP
              </Link>
              <Link
                href={dash.links.sms}
                className="rounded px-3 py-1.5 text-xs font-semibold"
                style={{
                  background: VS_COLORS.slate,
                  color: VS_COLORS.white,
                  border: `1px solid ${VS_COLORS.border}`,
                }}
              >
                SMS Core
              </Link>
              <Link
                href={dash.links.training}
                className="rounded px-3 py-1.5 text-xs font-semibold"
                style={{
                  background: VS_COLORS.slate,
                  color: VS_COLORS.white,
                  border: `1px solid ${VS_COLORS.border}`,
                }}
              >
                Training
              </Link>
              <Link
                href={dash.links.actionManagement}
                className="rounded px-3 py-1.5 text-xs font-semibold"
                style={{
                  background: VS_COLORS.slate,
                  color: VS_COLORS.white,
                  border: `1px solid ${VS_COLORS.border}`,
                }}
              >
                Action Management
              </Link>
            </>
          ) : null}
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={loading}
            onClick={() => void reload({ bust: true })}
          >
            Refresh
          </Button>
          </div>
        </div>
      }
      insights={dash ? chips : undefined}
      insightsCached={fromCache}
      kpis={
        dash ? (
          <>
            <KpiTile
              label="SIF trend index"
              value={dash.kpis.sifTrendIndex}
              unit="%"
              delta={dash.kpis.deltas.sifTrendIndex}
              tone={dash.kpis.sifTrendIndex > 12 ? "critical" : "caution"}
              sparkline={dash.sifTrend.slice(-8).map((p) => p.value)}
              interactive
              onClick={() => router.push(dash.links.sifHeca)}
            />
            <KpiTile
              label="HECA verification rate"
              value={dash.kpis.hecaVerificationRate}
              unit="%"
              delta={dash.kpis.deltas.hecaVerificationRate}
              tone={
                dash.kpis.hecaVerificationRate >= 80 ? "positive" : "caution"
              }
              sparkline={dash.hecaVerificationTrend
                .slice(-8)
                .map((p) => p.value)}
              interactive
              onClick={() => router.push(dash.links.sifHeca)}
            />
            <KpiTile
              label="Training compliance"
              value={dash.kpis.trainingCompliancePct}
              unit="%"
              delta={dash.kpis.deltas.trainingCompliancePct}
              tone={
                dash.kpis.trainingCompliancePct >= 85 ? "positive" : "caution"
              }
              sparkline={dash.trainingTrend.slice(-8).map((p) => p.value)}
              interactive
              onClick={() => router.push(dash.links.training)}
            />
            <KpiTile
              label="ERP readiness"
              value={dash.kpis.erpReadinessPct}
              unit="%"
              delta={dash.kpis.deltas.erpReadinessPct}
              tone={dash.kpis.erpReadinessPct >= 75 ? "positive" : "caution"}
              sparkline={dash.erpReadinessTrend.slice(-8).map((p) => p.value)}
              interactive
              onClick={() => router.push(dash.links.erp)}
            />
            <KpiTile
              label="Leading indicators"
              value={dash.kpis.leadingIndicatorScore}
              delta={dash.kpis.deltas.leadingIndicatorScore}
              tone={
                dash.kpis.leadingIndicatorScore >= 75 ? "positive" : "caution"
              }
              interactive
              onClick={() => router.push(dash.links.sms)}
            />
            <KpiTile
              label="High-energy exposure"
              value={dash.kpis.highEnergyExposureRate}
              unit="%"
              delta={dash.kpis.deltas.highEnergyExposureRate}
              tone={
                dash.kpis.highEnergyExposureRate > 20 ? "critical" : "caution"
              }
              sparkline={dash.highEnergyTrend.slice(-8).map((p) => p.value)}
              interactive
              onClick={() => router.push(dash.links.sifHeca)}
            />
          </>
        ) : loading ? (
          <div className="col-span-full grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded" />
            ))}
          </div>
        ) : null
      }
      trends={
        dash ? (
          <>
            <TrendPanel title="SIF trend index (%)" series={dash.sifTrend} />
            <TrendPanel
              title="HECA verification rate (%)"
              series={dash.hecaVerificationTrend}
            />
            <TrendPanel
              title="Training compliance (%)"
              series={dash.trainingTrend}
            />
            <TrendPanel
              title="ERP readiness (%)"
              series={dash.erpReadinessTrend}
            />
            <TrendPanel
              title="High-energy exposure (%)"
              series={dash.highEnergyTrend}
            />
          </>
        ) : null
      }
      details={
        dash
          ? [
              {
                id: "leading-he",
                label: "Leading indicators & high-energy",
                description:
                  "SCL heat, energy control wheel, and program insights.",
                children: (
                  <>
                    <div className="grid gap-4 lg:grid-cols-2">
                      <LeadingHeatmap
                        title="Leading indicator heat"
                        rows={dash.leadingHeatmap.rows}
                        cols={dash.leadingHeatmap.cols}
                        cells={dash.leadingHeatmap.cells}
                      />
                      <div className="space-y-3">
                        <FlhaEnergyWheel energies={energyWheelItems} />
                        <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                          {Object.entries(dash.sclDistribution).map(
                            ([k, v]) => (
                              <div
                                key={k}
                                className="rounded border px-2 py-2"
                                style={{ borderColor: VS_COLORS.border }}
                              >
                                <p className="uppercase tracking-wide text-[10px] opacity-70">
                                  {k}
                                </p>
                                <p className="text-lg font-semibold tabular-nums">
                                  {v}
                                </p>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                    <ul className="mt-4 space-y-2">
                      {dash.insights.map((ins) => (
                        <li key={ins.id}>
                          <Link
                            href={ins.href ?? dash.links.sms}
                            className="block rounded border px-3 py-2 text-sm hover:bg-black/5"
                            style={{ borderColor: VS_COLORS.border }}
                          >
                            <span className="font-semibold">{ins.headline}</span>
                            {ins.detail ? (
                              <span className="mt-0.5 block text-xs opacity-70">
                                {ins.detail}
                              </span>
                            ) : null}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                ),
              },
              {
                id: "hub-ops",
                label: "Hub operations",
                description:
                  "Federated domain attention and Action Management queue.",
                children: (
                  <>
                    {dash.hubSummary ? (
                      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                        <MiniStat
                          icon={AlertTriangle}
                          label="Alert score"
                          value={dash.hubSummary.alertScore}
                        />
                        <MiniStat
                          icon={Wrench}
                          label="Open actions"
                          value={dash.hubSummary.openCapa}
                        />
                        <MiniStat
                          icon={ShieldAlert}
                          label="Open CAIL"
                          value={dash.hubSummary.openCail}
                        />
                        <MiniStat
                          icon={GraduationCap}
                          label="Evidence indexed"
                          value={dash.hubSummary.evidenceIndexed}
                        />
                        <MiniStat
                          icon={Siren}
                          label="Domains needing attention"
                          value={dash.hubSummary.domainsNeedingAttention}
                        />
                      </div>
                    ) : null}

                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      {dash.domainCards.map((d) => (
                        <Link
                          key={d.id}
                          href={d.href}
                          className="rounded border px-3 py-2 text-sm hover:bg-black/5"
                          style={{ borderColor: VS_COLORS.border }}
                        >
                          <span className="block font-semibold">{d.label}</span>
                          <span className="text-xs opacity-70">
                            {d.alertCount} signal
                            {d.alertCount === 1 ? "" : "s"}
                          </span>
                        </Link>
                      ))}
                    </div>

                    {dash.capaQueue.length > 0 ? (
                      <div className="mt-4">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-70">
                          Action queue
                        </p>
                        <ul className="space-y-1.5">
                          {dash.capaQueue.map((c) => (
                            <li key={c.id}>
                              <Link
                                href={c.href}
                                className="flex justify-between gap-2 rounded border px-2 py-1.5 text-sm hover:bg-black/5"
                                style={{ borderColor: VS_COLORS.border }}
                              >
                                <span className="font-medium">{c.title}</span>
                                <span className="shrink-0 text-xs opacity-70">
                                  {c.status}
                                  {c.severityLevel
                                    ? ` · ${c.severityLevel}`
                                    : ""}
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </>
                ),
              },
              {
                id: "federation",
                label: "SMS Core federation",
                description:
                  "Safety Hub shares scope with SMS Core, Projects, FieldOS, ERP, and SIF/HECA.",
                children: <SmsCoreIntegrationGrid items={federation} />,
              },
            ]
          : undefined
      }
      narrative={
        dash ? (
          <SmsAiIntegrationPanel
            page="home"
            projectId={projectId}
            companyId={companyId}
          />
        ) : null
      }
    />
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ClipboardCheck;
  label: string;
  value: number;
}) {
  return (
    <div
      className="flex items-center gap-2 rounded border px-3 py-2"
      style={{ borderColor: VS_COLORS.border }}
    >
      <Icon className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">
          {label}
        </p>
        <p className="text-lg font-semibold tabular-nums">{value}</p>
      </div>
    </div>
  );
}
