"use client";

import { useEffect } from "react";
import {
  AlertTriangle,
  Calendar,
  GraduationCap,
  Truck,
  Users,
  Wrench,
  Layers,
  Route,
  Clock,
  Shuffle,
} from "lucide-react";
import { usePredictiveScheduling } from "@/lib/predictive-scheduling";
import { WidgetContainer } from "@/components/dashboard/engine/WidgetContainer";

type Props = {
  companyId?: number;
  projectId?: number;
  unionHallId?: number;
};

export function SchedulingDashboardSection({ companyId, projectId, unionHallId }: Props) {
  const { report, loading, error, optimize } = usePredictiveScheduling(
    companyId,
    projectId,
    unionHallId
  );

  useEffect(() => {
    if (companyId) void optimize();
  }, [companyId, projectId, unionHallId, optimize]);

  const d = report?.dashboard;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-vera-charcoal">
        Predictive scheduling (VPSE)
      </h2>
      {loading && (
        <p className="text-sm text-vera-muted">Optimizing workforce, equipment, and dispatch…</p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <WidgetContainer title="Workforce forecast" subtitle="Availability & readiness" icon={Users}>
          <p className="text-2xl font-semibold">{d?.workforce.availableCount ?? "—"}</p>
          <p className="text-xs text-muted-foreground">
            available · {d?.workforce.shortageCount ?? 0} shortages · avg readiness{" "}
            {d?.workforce.avgReadiness ?? "—"}
          </p>
        </WidgetContainer>

        <WidgetContainer title="Equipment forecast" subtitle="Downtime & allocation" icon={Truck}>
          <p className="text-2xl font-semibold">{d?.equipment.availableCount ?? "—"}</p>
          <p className="text-xs text-muted-foreground">
            available · {d?.equipment.downtimeAlerts ?? 0} downtime alerts
          </p>
        </WidgetContainer>

        <WidgetContainer title="Training forecast" subtitle="Expiry & gaps" icon={GraduationCap} tone="warning">
          <p className="text-2xl font-semibold">{d?.training.expiringCount ?? "—"}</p>
          <p className="text-xs text-muted-foreground">{d?.training.gapCount ?? 0} training gaps</p>
        </WidgetContainer>

        <WidgetContainer title="Staffing optimization" subtitle="Assignments & delay risk" icon={Wrench}>
          <p className="text-2xl font-semibold">{d?.staffing.assignmentCount ?? "—"}</p>
          <p className="text-xs text-muted-foreground">
            assignments · {d?.staffing.delayRiskCount ?? 0} delay risks
          </p>
        </WidgetContainer>

        <WidgetContainer title="Dispatch optimization" subtitle="Union hall matching" icon={Route}>
          <p className="text-2xl font-semibold">{d?.dispatch.optimizedCount ?? "—"}</p>
          <p className="text-xs text-muted-foreground">
            optimized · {d?.dispatch.conflictCount ?? 0} conflicts
          </p>
        </WidgetContainer>

        <WidgetContainer title="Shift optimization" subtitle="Overtime & fatigue" icon={Clock} tone="warning">
          <p className="text-2xl font-semibold">{d?.shift.overtimeAlerts ?? "—"}</p>
          <p className="text-xs text-muted-foreground">
            OT alerts · {d?.shift.fatigueAlerts ?? 0} fatigue
          </p>
        </WidgetContainer>

        <WidgetContainer title="Crew optimization" subtitle="Balanced crews" icon={Layers}>
          <p className="text-2xl font-semibold">{d?.crew.crewCount ?? "—"}</p>
          <p className="text-xs text-muted-foreground">crews · avg readiness {d?.crew.avgReadiness ?? "—"}</p>
        </WidgetContainer>

        <WidgetContainer title="Resource allocation" subtitle="Worker & equipment moves" icon={Shuffle}>
          <p className="text-2xl font-semibold">{d?.allocation.workerMoves ?? "—"}</p>
          <p className="text-xs text-muted-foreground">
            worker moves · {d?.allocation.equipmentMoves ?? 0} equipment
          </p>
        </WidgetContainer>

        <WidgetContainer
          title="Multi-project balancing"
          subtitle="Cross-project conflicts"
          icon={AlertTriangle}
          tone="danger"
        >
          <p className="text-2xl font-semibold">{d?.balancing.conflictCount ?? "—"}</p>
          <p className="text-xs text-muted-foreground">
            conflicts · {d?.balancing.rebalanceCount ?? 0} rebalance actions
          </p>
        </WidgetContainer>
      </div>

      {report?.automation.scheduleDrafts && report.automation.scheduleDrafts.length > 0 && (
        <div
          className="rounded-lg border p-4 text-sm"
          style={{ borderColor: "var(--vera-border)" }}
        >
          <p className="font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Auto-generated schedule drafts
          </p>
          <ul className="mt-2 space-y-1 text-muted-foreground">
            {report.automation.scheduleDrafts.slice(0, 5).map((s, i) => (
              <li key={i}>{s}</li>
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
