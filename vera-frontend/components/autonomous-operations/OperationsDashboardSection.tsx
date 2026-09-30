"use client";

import { useEffect } from "react";
import {
  Bot,
  Lock,
  UserX,
  Users,
  Truck,
  Calendar,
  GitMerge,
  ShieldCheck,
  RefreshCw,
  Zap,
} from "lucide-react";
import { useAutonomousOperations } from "@/lib/autonomous-operations";
import { WidgetContainer } from "@/components/dashboard/engine/WidgetContainer";

type Props = {
  companyId?: number;
  projectId?: number;
  unionHallId?: number;
};

export function OperationsDashboardSection({ companyId, projectId, unionHallId }: Props) {
  const { report, loading, error, run } = useAutonomousOperations(
    companyId,
    projectId,
    unionHallId
  );

  useEffect(() => {
    if (companyId) void run();
  }, [companyId, projectId, unionHallId, run]);

  const d = report?.dashboard;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-vera-charcoal">
        Autonomous operations (VAOE)
      </h2>
      {loading && (
        <p className="text-sm text-vera-muted">Running auto-dispatch, assignments, lockouts…</p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <WidgetContainer title="Autonomous actions" subtitle="Executed / pending" icon={Bot}>
          <p className="text-2xl font-semibold">{d?.executedCount ?? "—"}</p>
          <p className="text-xs text-muted-foreground">
            executed · {d?.pendingCount ?? 0} pending · {d?.totalActions ?? 0} total
          </p>
        </WidgetContainer>

        <WidgetContainer title="Auto-dispatch" subtitle="Assign & recall" icon={Zap}>
          <p className="text-2xl font-semibold">{d?.dispatch.assign ?? "—"}</p>
          <p className="text-xs text-muted-foreground">
            assigns · {d?.dispatch.recall ?? 0} recalls · {d?.dispatch.conflicts ?? 0} conflicts
          </p>
        </WidgetContainer>

        <WidgetContainer title="Auto-assignment" subtitle="Workers & equipment" icon={Users}>
          <p className="text-2xl font-semibold">{d?.assignment.count ?? "—"}</p>
          <p className="text-xs text-muted-foreground">{d?.assignment.conflicts ?? 0} conflicts</p>
        </WidgetContainer>

        <WidgetContainer title="Auto-lockout" subtitle="Equipment safety" icon={Lock} tone="danger">
          <p className="text-2xl font-semibold">{d?.lockout.applied ?? "—"}</p>
          <p className="text-xs text-muted-foreground">{d?.lockout.released ?? 0} released</p>
        </WidgetContainer>

        <WidgetContainer title="Auto-restriction" subtitle="Worker limits" icon={UserX} tone="warning">
          <p className="text-2xl font-semibold">{d?.restriction.applied ?? "—"}</p>
          <p className="text-xs text-muted-foreground">{d?.restriction.lifted ?? 0} lifted</p>
        </WidgetContainer>

        <WidgetContainer title="Auto-roster" subtitle="Daily crews" icon={Calendar}>
          <p className="text-2xl font-semibold">{d?.roster.days ?? "—"}</p>
          <p className="text-xs text-muted-foreground">{d?.roster.corrections ?? 0} corrections</p>
        </WidgetContainer>

        <WidgetContainer title="Conflict resolution" subtitle="Auto-resolved" icon={GitMerge}>
          <p className="text-2xl font-semibold">{d?.conflicts.resolved ?? "—"}</p>
          <p className="text-xs text-muted-foreground">{d?.conflicts.unresolved ?? 0} unresolved</p>
        </WidgetContainer>

        <WidgetContainer title="Readiness automation" subtitle="Corrective actions" icon={ShieldCheck}>
          <p className="text-2xl font-semibold">{d?.readiness.corrections ?? "—"}</p>
          <p className="text-xs text-muted-foreground">{d?.readiness.failures ?? 0} failures</p>
        </WidgetContainer>

        <WidgetContainer title="Autonomous sync" subtitle="Offline queue" icon={RefreshCw}>
          <p className="text-2xl font-semibold">{d?.sync.queued ?? "—"}</p>
          <p className="text-xs text-muted-foreground">{d?.sync.synced ?? 0} synced</p>
        </WidgetContainer>
      </div>

      {report && report.execution.log.length > 0 && (
        <div
          className="rounded-lg border p-4 text-sm"
          style={{ borderColor: "var(--vera-border)" }}
        >
          <p className="font-semibold flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Recent autonomous actions
          </p>
          <ul className="mt-2 space-y-1 text-muted-foreground">
            {report.execution.log.slice(0, 6).map((a) => (
              <li key={a.id}>
                <span className="font-medium text-foreground">{a.title}</span> — {a.reason}
                {a.overrideable && (
                  <span className="ml-1 text-xs text-amber-700">(overrideable)</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
