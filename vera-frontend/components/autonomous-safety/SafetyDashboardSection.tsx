"use client";

import { useEffect } from "react";
import { AlertOctagon, Flame, Shield, Zap } from "lucide-react";
import { useAutonomousSafety } from "@/lib/autonomous-safety";
import { WidgetContainer } from "@/components/dashboard/engine/WidgetContainer";

type Props = { companyId?: number; projectId?: number };

export function SafetyDashboardSection({ companyId, projectId }: Props) {
  const { report, loading, error, analyze } = useAutonomousSafety(companyId, projectId);

  useEffect(() => {
    if (companyId) void analyze();
  }, [companyId, projectId, analyze]);

  const d = report?.dashboard;
  const sif = report?.sif;
  const heca = report?.heca;
  const ew = report?.energyWheel;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-vera-charcoal">Autonomous safety (VASE)</h2>
      {loading && <p className="text-sm text-vera-muted">Running SIF, HECA, and Energy Wheel analysis…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <WidgetContainer title="SIF risk" subtitle="Serious injury & fatality" icon={AlertOctagon} tone="danger">
          <p className="text-2xl font-semibold">{sif?.riskScore.score ?? "—"}</p>
          <p className="text-xs text-muted-foreground capitalize">{sif?.riskScore.level ?? ""} · {d?.sif.precursorCount ?? 0} precursors</p>
        </WidgetContainer>
        <WidgetContainer title="HECA risk" subtitle="Critical activities" icon={Shield} tone="warning">
          <p className="text-2xl font-semibold">{heca?.riskScore.score ?? "—"}</p>
          <p className="text-xs text-muted-foreground">{d?.heca.deviationCount ?? 0} deviations</p>
        </WidgetContainer>
        <WidgetContainer title="Energy Wheel" subtitle="Missing controls" icon={Zap}>
          <p className="text-2xl font-semibold">{d?.energyWheel.missingControlCount ?? 0}</p>
          <p className="text-xs text-muted-foreground">{d?.energyWheel.conflictCount ?? 0} conflicts</p>
        </WidgetContainer>
        <WidgetContainer title="Interventions" subtitle="Auto-triggered" icon={Flame} tone="danger">
          <p className="text-2xl font-semibold">{d?.interventions.length ?? 0}</p>
        </WidgetContainer>
      </div>
      {report && report.interventions.length > 0 && (
        <div className="rounded-lg border p-4 text-sm" style={{ borderColor: "var(--vera-border)" }}>
          <p className="font-semibold">Active interventions</p>
          <ul className="mt-2 space-y-1">
            {report.interventions.slice(0, 6).map((i) => (
              <li key={i.id}>
                <span className="font-medium">{i.title}</span> — {i.reason}
              </li>
            ))}
          </ul>
        </div>
      )}
      {report?.automation.alerts && report.automation.alerts.length > 0 && (
        <p className="text-sm text-amber-800">{report.automation.alerts.join(" · ")}</p>
      )}
    </section>
  );
}
