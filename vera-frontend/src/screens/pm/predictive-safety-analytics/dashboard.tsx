"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  getPredictiveSafetyBundle,
  runPredictiveSafetyPipeline,
  RISK_LEVEL_COLORS,
  type PredictiveAnalyticsBundle,
  type EntityRiskScore,
} from "@/lib/pm-predictive-safety-analytics";
import { WorkspaceHero, WorkspaceMetricCard, WorkspaceSection } from "@/components/theme/workspace";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AnalyticsSafetyCultureEnginePanel } from "@/src/components/pm/AnalyticsSafetyCultureEnginePanel";
import { PredictiveSafetyAnalyticsAiPanel } from "@/src/components/pm/PredictiveSafetyAnalyticsAiPanel";
import { ComplianceCalendarPanel } from "@/src/components/pm/ComplianceCalendarPanel";

function RiskList({
  title,
  items,
  empty,
}: {
  title: string;
  items: EntityRiskScore[];
  empty: string;
}) {
  return (
    <WorkspaceSection title={title}>
      {items.length ? (
        <ul className="divide-y divide-[#2A2E33]/10">
          {items.map((e) => (
            <li key={`${e.entityType}-${e.entityId}`} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-[#2A2E33]">{e.label}</p>
                <p className="text-xs text-[#64748b]">
                  {e.factors.slice(0, 2).join(" · ") || "—"}
                </p>
              </div>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${RISK_LEVEL_COLORS[e.riskLevel]}`}
              >
                {e.riskScore}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-[#64748b]">{empty}</p>
      )}
    </WorkspaceSection>
  );
}

function ForecastChart({ bundle }: { bundle: PredictiveAnalyticsBundle }) {
  const days = bundle.weeklyForecast.days;
  const max = Math.max(...days.map((d) => d.riskIndex), 1);

  return (
    <WorkspaceSection
      title="Weekly risk forecast"
      description={`${bundle.weeklyForecast.weekStart} → ${bundle.weeklyForecast.weekEnd} · trend ${bundle.weeklyForecast.trend}`}
    >
      <div className="flex h-40 items-end gap-2">
        {days.map((d) => (
          <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
            <div
              className={`w-full rounded-t-md transition-all ${
                d.riskLevel === "critical"
                  ? "bg-red-500"
                  : d.riskLevel === "high"
                    ? "bg-orange-400"
                    : d.riskLevel === "medium"
                      ? "bg-amber-400"
                      : "bg-[#2F8F8C]"
              }`}
              style={{ height: `${(d.riskIndex / max) * 100}%`, minHeight: 4 }}
              title={`${d.riskIndex}/100`}
            />
            <span className="text-[10px] text-[#64748b]">{d.dayOfWeek}</span>
          </div>
        ))}
      </div>
      {days[0]?.drivers.length ? (
        <p className="mt-3 text-xs text-[#64748b]">
          Drivers: {days[0].drivers.join(", ")}
        </p>
      ) : null}
    </WorkspaceSection>
  );
}

export default function PredictiveSafetyAnalyticsDashboard({
  companyId = 1,
  projectId = 1,
}: {
  companyId?: number;
  projectId?: number;
}) {
  const [bundle, setBundle] = useState<PredictiveAnalyticsBundle | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    void getPredictiveSafetyBundle(companyId, projectId).then(setBundle);
  }, [companyId, projectId]);

  useEffect(() => {
    load();
  }, [load]);

  async function refresh(sendAlerts: boolean) {
    setBusy(true);
    try {
      const b = await runPredictiveSafetyPipeline(companyId, projectId, sendAlerts);
      setBundle(b);
    } finally {
      setBusy(false);
    }
  }

  if (!bundle) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

  const s = bundle.summary;

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <WorkspaceHero
        title="Predictive Safety Analytics"
        description={`Model ${bundle.modelKey} v${bundle.modelVersion} · ${bundle.dataQuality.recordsIngested} features ingested from ${bundle.dataQuality.modules.length} modules (${bundle.dataQuality.windowDays}d window)`}
        actions={
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => void refresh(false)}>
              {busy ? "Running…" : "Refresh"}
            </Button>
            <Button type="button" size="sm" disabled={busy} onClick={() => void refresh(true)}>
              Run & alert
            </Button>
          </div>
        }
      />

      <div
        className={`rounded-2xl border p-6 ${RISK_LEVEL_COLORS[s.overallRiskLevel]}`}
      >
        <p className="text-xs font-bold uppercase tracking-widest opacity-70">Overall project risk</p>
        <p className="text-4xl font-bold">{s.overallRiskIndex}<span className="text-lg font-normal">/100</span></p>
        <p className="mt-1 text-sm capitalize">{s.overallRiskLevel} · {bundle.weeklyForecast.trend}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <WorkspaceMetricCard label="High-risk workers" value={s.highRiskWorkers} accent={s.highRiskWorkers > 0 ? "warning" : undefined} />
        <WorkspaceMetricCard label="High-risk contractors" value={s.highRiskContractors} />
        <WorkspaceMetricCard label="High-risk tasks" value={s.highRiskTasks} />
        <WorkspaceMetricCard label="High-risk locations" value={s.highRiskLocations} />
      </div>

      <ForecastChart bundle={bundle} />

      <div className="grid gap-6 lg:grid-cols-2">
        <RiskList title="High-risk workers" items={bundle.highRiskWorkers} empty="No elevated worker risk." />
        <RiskList title="High-risk contractors" items={bundle.highRiskContractors} empty="No elevated contractor risk." />
        <RiskList title="High-risk tasks (JHA/FLHA)" items={bundle.highRiskTasks} empty="No elevated task risk." />
        <RiskList title="High-risk locations" items={bundle.highRiskLocations} empty="No elevated site risk." />
      </div>

      <PredictiveSafetyAnalyticsAiPanel companyId={companyId} projectId={projectId} />

      <ComplianceCalendarPanel companyId={companyId} projectId={projectId} />

      <AnalyticsSafetyCultureEnginePanel companyId={companyId} projectId={projectId} />

      <WorkspaceSection
        title="Recommended preventive actions"
        description="Auto-generated from predictive risk scores"
      >
        {bundle.preventiveActions.length ? (
          <ul className="space-y-3">
            {bundle.preventiveActions.map((a) => (
              <li
                key={a.id}
                className="rounded-xl border border-[#2A2E33]/10 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-[#2A2E33]">{a.title}</p>
                  <span className="shrink-0 rounded bg-[#f1f5f9] px-2 py-0.5 text-[10px] font-bold uppercase text-[#64748b]">
                    {a.priority}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[#5a6b7c]">{a.description}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[#64748b]">No preventive actions recommended.</p>
        )}
      </WorkspaceSection>

      <p className="text-xs text-[#94a3b8]">
        Generated {new Date(bundle.generatedAt).toLocaleString()} ·{" "}
        <Link href="/pm/unified-safety-intelligence" className="text-[#2F8F8C] hover:underline">
          Unified CAIL intelligence →
        </Link>
      </p>
    </div>
  );
}
