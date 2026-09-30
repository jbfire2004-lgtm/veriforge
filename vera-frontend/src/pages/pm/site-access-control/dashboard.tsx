"use client";

import { VeraPageLayout } from "@/src/components/navigation";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  createAccessOverride,
  fetchSiteAccessAnalytics,
  fetchSiteAccessIntelligence,
  listAccessOverrides,
  listAccessPoints,
  listZoneRules,
  validateSiteAccess,
  type AccessValidationResult,
} from "@/lib/pm-site-access-control";
import { SfButton, SfCard, SfInput } from "@/src/components/safety-forms/ui";
import { SiteAccessTrainingVeraSection } from "@/src/components/verification/SiteAccessTrainingVeraSection";

type Tab = "validate" | "zones" | "overrides" | "insights";

export default function PmSiteAccessDashboardPage({
  projectId = 1,
  companyId = 1,
}: {
  projectId?: number;
  companyId?: number;
}) {
  const [tab, setTab] = useState<Tab>("validate");
  const [workerId, setWorkerId] = useState("1");
  const [zoneCode, setZoneCode] = useState("SITE");
  const [result, setResult] = useState<AccessValidationResult | null>(null);
  const [zones, setZones] = useState<Array<Record<string, unknown>>>([]);
  const [points, setPoints] = useState<Array<Record<string, unknown>>>([]);
  const [overrides, setOverrides] = useState<Array<Record<string, unknown>>>([]);
  const [analytics, setAnalytics] = useState<Record<string, unknown> | null>(null);
  const [insights, setInsights] = useState<Array<Record<string, unknown>>>([]);

  const reload = useCallback(() => {
    void listZoneRules(projectId).then(setZones).catch(() => undefined);
    void listAccessPoints(companyId, projectId).then(setPoints).catch(() => undefined);
    void listAccessOverrides(projectId).then(setOverrides).catch(() => undefined);
    void fetchSiteAccessAnalytics(projectId).then(setAnalytics).catch(() => undefined);
    void fetchSiteAccessIntelligence(projectId).then(setInsights).catch(() => undefined);
  }, [projectId, companyId]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function runValidation() {
    const wid = parseInt(workerId, 10);
    if (!wid) return;
    const r = await validateSiteAccess({
      workerId: wid,
      projectId,
      zoneCode: zoneCode.trim() || "SITE",
    });
    setResult(r);
    reload();
  }

  return (
    <VeraPageLayout
      title="Site access control"
      description={`Unified validation across training, JHA, CAPA, equipment, SDS, emergency — project #${projectId}`}
    >
      {analytics ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">Compliance (30d)</p>
            <p className="text-2xl font-semibold">{String(analytics.compliancePct)}%</p>
          </SfCard>
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">Denials</p>
            <p className="text-2xl font-semibold text-red-600">
              {String(analytics.denials30d)}
            </p>
          </SfCard>
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">Overrides</p>
            <p className="text-2xl font-semibold">{String(analytics.overrides30d)}</p>
          </SfCard>
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">Project score</p>
            <p className="text-2xl font-semibold">{String(analytics.projectAccessScore)}</p>
          </SfCard>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2 border-b pb-2">
        {(
          [
            ["validate", "Validate access"],
            ["zones", "Zone rules"],
            ["overrides", "Overrides"],
            ["insights", "CAIL insights"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={
              tab === id
                ? "rounded-md bg-[var(--sf-primary)] px-3 py-1.5 text-sm text-white"
                : "rounded-md px-3 py-1.5 text-sm text-[var(--sf-text-muted)]"
            }
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "validate" ? (
        <SfCard className="space-y-3 p-5">
          <h2 className="font-medium">Access validation</h2>
          <div className="flex flex-wrap gap-2">
            <SfInput
              placeholder="Worker ID"
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
            />
            <SfInput
              placeholder="Zone code"
              value={zoneCode}
              onChange={(e) => setZoneCode(e.target.value)}
            />
            <SfButton type="button" onClick={() => void runValidation()}>
              Validate
            </SfButton>
          </div>
          {result ? (
            <div
              className={
                result.granted
                  ? "rounded border border-green-200 bg-green-50 p-3 text-sm"
                  : "rounded border border-red-200 bg-red-50 p-3 text-sm"
              }
            >
              <p className="font-medium">
                {result.granted ? "Access granted" : result.decision}
              </p>
              {result.denialReasons.length > 0 ? (
                <ul className="mt-2 list-disc pl-5">
                  {result.denialReasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              ) : null}
              <SiteAccessTrainingVeraSection
                workerId={parseInt(workerId, 10) || null}
                className="mt-4 border-t border-slate-200 pt-4"
              />
            </div>
          ) : null}
        </SfCard>
      ) : null}

      {tab === "zones" ? (
        <SfCard className="p-5">
          <h2 className="mb-3 font-medium">
            Zone rules ({zones.length}) · Access points ({points.length})
          </h2>
          <ul className="divide-y text-sm">
            {zones.map((z) => (
              <li key={String(z.id)} className="py-2">
                <span className="font-medium">{String(z.zoneCode)}</span>
                <span className="text-[var(--sf-text-muted)]">
                  {" "}
                  · {String(z.zoneType)}
                  {z.highRisk ? " · high risk" : ""}
                  {z.requiresJha ? " · JHA required" : ""}
                </span>
              </li>
            ))}
          </ul>
        </SfCard>
      ) : null}

      {tab === "overrides" ? (
        <SfCard className="space-y-3 p-5">
          <h2 className="font-medium">Active overrides ({overrides.length})</h2>
          <SfButton
            type="button"
            variant="secondary"
            onClick={() =>
              void createAccessOverride({
                companyId,
                projectId,
                workerId: parseInt(workerId, 10) || 1,
                overrideType: "temporary",
                reason: "Supervisor authorized temporary entry",
                expiresAt: new Date(Date.now() + 4 * 3600000).toISOString(),
              }).then(reload)
            }
          >
            Create sample override
          </SfButton>
          <ul className="divide-y text-sm">
            {overrides.map((o) => (
              <li key={String(o.id)} className="py-2">
                Worker {String(o.workerId)} · {String(o.overrideType)} · exp{" "}
                {o.expiresAt
                  ? new Date(String(o.expiresAt)).toLocaleString()
                  : "—"}
              </li>
            ))}
          </ul>
        </SfCard>
      ) : null}

      {tab === "insights" ? (
        <SfCard className="space-y-3 p-5">
          <h2 className="font-medium">CAIL access intelligence</h2>
          <ul className="space-y-2 text-sm">
            {insights.map((i, idx) => (
              <li key={idx} className="rounded border p-3">
                <p className="font-medium">{String(i.title)}</p>
                <p className="text-[var(--sf-text-muted)]">{String(i.explanation)}</p>
              </li>
            ))}
          </ul>
        </SfCard>
      ) : null}
    </VeraPageLayout>
  );
}
