"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  emitPmDashboardEvent,
  fetchPmAssetDashboard,
  fetchPmAssets,
  fetchPmCompanyDashboard,
  fetchPmDrill,
  fetchPmProjectDashboard,
} from "@/lib/veripm-dashboard";
import type {
  Metric,
  VeriPmAssetDashboard,
  VeriPmCompanyDashboard,
  VeriPmDrillResponse,
  VeriPmProjectDashboard,
} from "@/lib/veripm-dashboard/types";
import { VeriCoreMetricCard } from "@/components/vericore-dashboard/VeriCoreMetricCard";
import { VeriCoreDrillSheet } from "@/components/vericore-dashboard/VeriCoreDrillSheet";
import type { DrillResponse } from "@/lib/vericore-dashboard/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ContractorScoreBadge } from "@/components/contractor-safety-score/ContractorScoreBadge";
import {
  SmsCard,
  SmsModuleLayout,
  SmsStatusBadge,
} from "@/src/components/sms/design-system";

function toCoreMetric(m: Metric): import("@/lib/vericore-dashboard/types").Metric {
  return {
    key: m.key,
    label: m.label,
    value: m.value,
    unit: m.unit,
    formula: m.formula,
    formulaId: m.formulaId,
    inputs: m.inputs,
    asOf: m.asOf,
    hoursBasis: m.hoursBasis,
    industry: m.industry
      ? {
          companyValue: m.value,
          industryMean: m.industry.industryValue,
          percentileRank: m.industry.industryPercentile,
          cohortSize: m.industry.cohortSize,
          sampleSuppressed: m.industry.sampleSuppressed,
          period: m.industry.period,
          direction: m.industry.direction,
        }
      : undefined,
  };
}

function toCoreDrill(d: VeriPmDrillResponse): DrillResponse {
  return {
    metricKey: d.metricKey,
    label: d.label,
    formula: `${d.formula}\n// ${d.sourceQuery}`,
    formulaId: d.formulaId,
    inputs: d.inputs,
    filters: d.filters,
    page: d.page,
    pageSize: d.pageSize,
    total: d.total,
    items: d.items.map((i) => ({
      id: i.id,
      title: i.title,
      subtitle: i.subtitle,
      status: i.status,
      dueAt: i.dueAt,
      href: i.href,
      documentId: i.documentId,
      documentType: i.documentType,
      meta: i.related as Record<string, string | number | null> | undefined,
    })),
  };
}

export function VeriPmDashboardView({
  initialProjectId = null,
  initialAssetId = null,
}: {
  initialProjectId?: number | null;
  initialAssetId?: string | null;
}) {
  const [projectId, setProjectId] = useState<number | null>(initialProjectId);
  const [assetId, setAssetId] = useState<string | null>(initialAssetId);
  const [assets, setAssets] = useState<Array<{ id: string; name: string }>>([]);
  const [dash, setDash] = useState<VeriPmCompanyDashboard | VeriPmProjectDashboard | null>(null);
  const [assetDash, setAssetDash] = useState<VeriPmAssetDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drill, setDrill] = useState<DrillResponse | null>(null);
  const [drillLoading, setDrillLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (assetId) {
        setAssetDash(await fetchPmAssetDashboard(assetId));
        setDash(null);
      } else {
        setAssetDash(null);
        setDash(
          projectId
            ? await fetchPmProjectDashboard(projectId)
            : await fetchPmCompanyDashboard({}),
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load VERIPM dashboard");
    } finally {
      setLoading(false);
    }
  }, [projectId, assetId]);

  useEffect(() => {
    void fetchPmAssets().then((r) => setAssets(r.items)).catch(() => undefined);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function openDrill(metric: import("@/lib/vericore-dashboard/types").Metric) {
    setDrillLoading(true);
    try {
      const d = await fetchPmDrill(metric.key, {
        projectId: projectId ?? undefined,
        assetId: assetId ?? undefined,
      });
      setDrill(toCoreDrill(d));
    } finally {
      setDrillLoading(false);
    }
  }

  const projectDash =
    dash && "relatedCompanies" in dash && "projectPermits" in dash
      ? (dash as import("@/lib/veripm-dashboard/types").VeriPmProjectDashboard)
      : dash && "relatedCompanies" in dash
        ? (dash as import("@/lib/veripm-dashboard/types").VeriPmProjectDashboard)
        : null;

  return (
    <SmsModuleLayout
      eyebrow="VERIPM · Preventive Maintenance / Assets"
      title="VERIPM Dashboard"
      description="PM completion, downtime, failures, maintenance-linked safety, contractors, and industry comparison — with drill-down on every metric."
      meta={
        dash
          ? `Rev ${dash.revision} · ${new Date(dash.freshness.lastRebuildAt).toLocaleString()}`
          : undefined
      }
      filters={
        <div className="flex flex-wrap gap-2">
          <select
            className="sms-tap-target h-9 rounded-[3px] border border-[var(--sf-border)] bg-[var(--sf-surface)] px-2 text-sm text-[var(--sf-text)]"
            value={projectId ?? ""}
            onChange={(e) => {
              setAssetId(null);
              setProjectId(e.target.value ? Number(e.target.value) : null);
            }}
          >
            <option value="">Company view</option>
            <option value="1">Project: Aurora North</option>
            <option value="2">Project: South Gate</option>
          </select>
          <select
            className="sms-tap-target h-9 rounded-[3px] border border-[var(--sf-border)] bg-[var(--sf-surface)] px-2 text-sm text-[var(--sf-text)]"
            value={assetId ?? ""}
            onChange={(e) => setAssetId(e.target.value || null)}
          >
            <option value="">All assets</option>
            {assets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      }
      actions={
        <>
          <Button type="button" size="sm" variant="outline" onClick={() => void load()}>
            Refresh
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void emitPmDashboardEvent("work_order.completed").then((d) => setDash(d))}
          >
            Simulate WO
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => void emitPmDashboardEvent("failure.reported").then((d) => setDash(d))}
          >
            Simulate failure
          </Button>
        </>
      }
    >
      {error ? (
        <div className="rounded-[3px] border border-[color-mix(in_srgb,var(--sf-warning)_50%,var(--sf-border))] bg-[color-mix(in_srgb,var(--sf-warning)_10%,var(--sf-surface))] px-4 py-3 text-sm text-[var(--sf-text)]">
          {error}
        </div>
      ) : null}
      {loading && !dash && !assetDash ? <Skeleton className="h-40 w-full rounded-[3px]" /> : null}

      {assetDash ? (
        <SmsCard
          title={`Asset: ${assetDash.asset.name}`}
          description="Work orders and linked safety for this asset"
          padding="lg"
        >
          <div className="sms-grid sms-grid-3 mb-[var(--sms-space-4)]">
            {assetDash.metrics.map((m) => (
              <VeriCoreMetricCard key={m.key} metric={toCoreMetric(m)} onOpen={openDrill} />
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[3px] border border-[var(--sf-border)] bg-[var(--sf-bg)] p-4">
              <p className="sms-text-label">Work orders</p>
              <ul className="mt-2 divide-y divide-[var(--sf-border)] text-sm">
                {assetDash.recentWorkOrders.map((w) => (
                  <li key={w.id} className="flex justify-between py-2">
                    <span>{w.title}</span>
                    <Link href={w.href} className="text-[var(--sf-accent)] hover:underline">
                      <SmsStatusBadge tone="info">{w.status}</SmsStatusBadge>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[3px] border border-[var(--sf-border)] bg-[var(--sf-bg)] p-4">
              <p className="sms-text-label">Linked safety</p>
              <ul className="mt-2 divide-y divide-[var(--sf-border)] text-sm">
                {assetDash.linkedSafety.map((s) => (
                  <li key={s.id} className="flex justify-between py-2">
                    <span>{s.title}</span>
                    <Link href={s.href} className="text-[var(--sf-accent)] hover:underline">
                      {s.type}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </SmsCard>
      ) : null}

      {dash ? (
        <>
          <SmsCard
            title="Company maintenance snapshot"
            description="Core PM and reliability metrics"
            padding="lg"
          >
            <div className="sms-grid sms-grid-3">
              <VeriCoreMetricCard
                metric={toCoreMetric(dash.maintenance.pmCompletionRate)}
                onOpen={openDrill}
                tone="teal"
              />
              <VeriCoreMetricCard
                metric={toCoreMetric(dash.maintenance.overduePmCount)}
                onOpen={openDrill}
                tone="amber"
              />
              <VeriCoreMetricCard
                metric={toCoreMetric(dash.maintenance.downtimeHours)}
                onOpen={openDrill}
              />
              <VeriCoreMetricCard
                metric={toCoreMetric(dash.maintenance.failureRate)}
                onOpen={openDrill}
              />
              <VeriCoreMetricCard
                metric={toCoreMetric(dash.maintenance.technicianWorkload)}
                onOpen={openDrill}
              />
              <VeriCoreMetricCard
                metric={toCoreMetric(dash.maintenance.warrantyExpiring)}
                onOpen={openDrill}
                tone="amber"
              />
              <VeriCoreMetricCard
                metric={toCoreMetric(dash.maintenance.downtimePct)}
                onOpen={openDrill}
              />
            </div>
          </SmsCard>

          <SmsCard
            title="Permits · FieldOS live status"
            description="Counts by status with drill-down to FieldOS activity, signatures, and safety links."
            padding="lg"
            className="relative"
          >
            <div className="mb-3 flex justify-end">
              <Link
                href="/field/permits"
                className="text-sm font-medium text-[var(--sf-accent)] hover:underline"
              >
                Open FieldOS permit tasks
              </Link>
            </div>
            <div className="sms-grid sms-grid-3">
              <VeriCoreMetricCard
                metric={toCoreMetric(dash.permits.activeOpen)}
                onOpen={openDrill}
                tone="teal"
              />
              <VeriCoreMetricCard
                metric={toCoreMetric(dash.permits.highRiskOpen)}
                onOpen={openDrill}
                tone="amber"
              />
              <VeriCoreMetricCard
                metric={toCoreMetric(dash.permits.fieldOsLinked)}
                onOpen={openDrill}
              />
              <div className="rounded-[3px] border border-[var(--sf-border)] bg-[var(--sf-bg)] p-4">
                <p className="sms-text-label">By status</p>
                <ul className="mt-3 space-y-1 text-sm text-[var(--sf-text)]">
                  {Object.entries(dash.permits.byStatus).map(([status, count]) => (
                    <li key={status} className="flex justify-between">
                      <span className="capitalize">{status.replace(/_/g, " ")}</span>
                      <span className="tabular-nums">{count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </SmsCard>

          <SmsCard title="Maintenance-linked safety (VERICore)" padding="lg">
            <div className="sms-grid sms-grid-3">
              <VeriCoreMetricCard
                metric={toCoreMetric(dash.safetyFromMaintenance.incidentCount)}
                onOpen={openDrill}
                tone="amber"
              />
              <VeriCoreMetricCard
                metric={toCoreMetric(dash.safetyFromMaintenance.incidentRate)}
                onOpen={openDrill}
              />
              <VeriCoreMetricCard
                metric={toCoreMetric(dash.safetyFromMaintenance.highRiskPm)}
                onOpen={openDrill}
                tone="amber"
              />
              <VeriCoreMetricCard
                metric={toCoreMetric(dash.safetyFromMaintenance.flhaJhaLinked)}
                onOpen={openDrill}
                tone="teal"
              />
            </div>
          </SmsCard>

          {projectDash && "projectPermits" in projectDash && projectDash.projectPermits ? (
            <SmsCard title="Project permit load" padding="lg">
              <div className="sms-grid sms-grid-3">
                <div className="rounded-[3px] border border-[var(--sf-border)] bg-[var(--sf-bg)] p-4">
                  <p className="sms-text-label">Open / total</p>
                  <p className="sms-stat-value mt-2">
                    {projectDash.projectPermits.open}/{projectDash.projectPermits.total}
                  </p>
                </div>
                <div className="rounded-[3px] border border-[var(--sf-border)] bg-[var(--sf-bg)] p-4">
                  <p className="sms-text-label">High-risk open</p>
                  <p className="sms-stat-value mt-2">
                    {projectDash.projectPermits.highRiskOpen}
                  </p>
                </div>
                <div className="rounded-[3px] border border-[var(--sf-border)] bg-[var(--sf-bg)] p-4">
                  <p className="sms-text-label">Contractor compliance</p>
                  <p className="sms-stat-value mt-2">
                    {projectDash.projectPermits.contractorCompliancePct != null
                      ? `${projectDash.projectPermits.contractorCompliancePct}%`
                      : "—"}
                  </p>
                </div>
                <div className="rounded-[3px] border border-[var(--sf-border)] bg-[var(--sf-bg)] p-4">
                  <p className="sms-text-label">PM readiness</p>
                  <p className="sms-stat-value mt-2">
                    {projectDash.projectPermits.pmReadiness.score}
                  </p>
                  <p className="sms-text-caption mt-1">
                    {projectDash.projectPermits.pmReadiness.ready
                      ? "Ready"
                      : projectDash.projectPermits.pmReadiness.blockers.join("; ")}
                  </p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-[3px] border border-[var(--sf-border)] bg-[var(--sf-bg)] p-4">
                  <p className="sms-text-label">Risk distribution</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {Object.entries(projectDash.projectPermits.byRisk).map(([k, v]) => (
                      <li key={k} className="flex justify-between capitalize">
                        <span>{k}</span>
                        <span className="tabular-nums">{v}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-[3px] border border-[var(--sf-border)] bg-[var(--sf-bg)] p-4">
                  <p className="sms-text-label">Permit-related incidents</p>
                  <p className="sms-stat-value mt-2">
                    {projectDash.projectPermits.permitRelatedIncidents}
                  </p>
                </div>
              </div>
            </SmsCard>
          ) : null}

          {projectDash ? (
            <SmsCard title="Related companies" padding="lg">
              <div className="sms-table-wrap">
                <table className="sms-table">
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Role</th>
                      <th>PM %</th>
                      <th>Downtime</th>
                      <th>Program</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectDash.relatedCompanies.map((c) => (
                      <tr key={`${c.companyId}-${c.linkRole}`}>
                        <td>
                          <Link href={c.href} className="text-[var(--sf-accent)] hover:underline">
                            {c.name}
                          </Link>
                        </td>
                        <td className="capitalize">{c.linkRole}</td>
                        <td className="tabular-nums">
                          {c.pmCompletionRate != null ? `${c.pmCompletionRate}%` : "—"}
                        </td>
                        <td className="tabular-nums">{c.downtimeHours ?? "—"}</td>
                        <td>
                          {c.programScore != null && c.grade ? (
                            <ContractorScoreBadge
                              overallScore={c.programScore}
                              grade={c.grade}
                              size="sm"
                            />
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SmsCard>
          ) : null}

          <SmsCard title="Contractors" padding="lg">
            <div className="sms-table-wrap">
              <table className="sms-table">
                <thead>
                  <tr>
                    <th>Contractor</th>
                    <th>CSS</th>
                    <th>PM %</th>
                    <th>Training</th>
                    <th>Failures</th>
                  </tr>
                </thead>
                <tbody>
                  {dash.contractors.map((c) => (
                    <tr key={c.contractorCompanyId}>
                      <td>
                        <Link href={c.href} className="text-[var(--sf-accent)] hover:underline">
                          {c.name}
                        </Link>
                      </td>
                      <td>
                        <ContractorScoreBadge
                          overallScore={c.programScore}
                          grade={c.grade}
                          size="sm"
                        />
                      </td>
                      <td className="tabular-nums">{c.pmCompletionRate}%</td>
                      <td className="tabular-nums">{c.trainingCompliantPct}%</td>
                      <td className="tabular-nums">{c.failureCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SmsCard>

          {!projectDash ? (
            <SmsCard title="Projects" padding="lg">
              <div className="sms-grid sms-grid-2">
                {dash.projectsSummary.map((p) => (
                  <button
                    key={p.projectId}
                    type="button"
                    onClick={() => setProjectId(p.projectId)}
                    className="rounded-[3px] border border-[var(--sf-border)] bg-[var(--sf-bg)] p-4 text-left hover:border-[var(--sf-accent)]"
                  >
                    <p className="font-medium text-[var(--sf-text)]">{p.name}</p>
                    <p className="sms-text-caption mt-1">
                      PM {p.pmCompletionRate}% · Overdue {p.overduePmCount} · Downtime{" "}
                      {p.downtimeHours}h · {p.contractorCount} contractors
                    </p>
                  </button>
                ))}
              </div>
            </SmsCard>
          ) : null}
        </>
      ) : null}

      <VeriCoreDrillSheet
        drill={drill}
        loading={drillLoading}
        onClose={() => setDrill(null)}
      />
    </SmsModuleLayout>
  );
}
