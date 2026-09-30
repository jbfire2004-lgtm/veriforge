"use client";

import { useEffect } from "react";
import {
  Activity,
  AlertTriangle,
  Bot,
  GitMerge,
  History,
  Layers,
  ListOrdered,
  RefreshCw,
  Shield,
  Undo2,
} from "lucide-react";
import { useEnterpriseAutomation } from "@/lib/enterprise-automation";
import { WidgetContainer } from "@/components/dashboard/engine/WidgetContainer";

type Props = {
  companyId?: number;
  projectId?: number;
  unionHallId?: number;
};

export function EnterpriseDashboardSection({ companyId, projectId, unionHallId }: Props) {
  const { report, loading, error, orchestrate } = useEnterpriseAutomation(
    companyId,
    projectId,
    unionHallId
  );

  useEffect(() => {
    if (companyId) void orchestrate();
  }, [companyId, projectId, unionHallId, orchestrate]);

  const d = report?.dashboard;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-vera-charcoal">
        Enterprise automation (VEAO)
      </h2>
      <p className="text-sm text-vera-muted">
        Unified orchestration across safety, scheduling, operations, compliance, twins, and data.
      </p>
      {loading && (
        <p className="text-sm text-vera-muted">Running enterprise automation orchestrator…</p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <WidgetContainer title="Automation queue" subtitle="Pending / queued" icon={ListOrdered}>
          <p className="text-2xl font-semibold">{d?.queueSize ?? "—"}</p>
          <p className="text-xs text-muted-foreground">{d?.actionCount ?? 0} total actions</p>
        </WidgetContainer>

        <WidgetContainer title="Automation actions" subtitle="Executed" icon={Bot}>
          <p className="text-2xl font-semibold">{d?.executedCount ?? "—"}</p>
          <p className="text-xs text-muted-foreground">health {d?.healthScore ?? "—"}</p>
        </WidgetContainer>

        <WidgetContainer title="Conflicts" subtitle="Resolved by priority" icon={GitMerge} tone="warning">
          <p className="text-2xl font-semibold">{d?.conflictCount ?? "—"}</p>
        </WidgetContainer>

        <WidgetContainer title="Overrides" subtitle="Supervisor actions" icon={Undo2}>
          <p className="text-2xl font-semibold">{report?.overrides.length ?? 0}</p>
        </WidgetContainer>

        <WidgetContainer title="Automation logs" subtitle="Recent execution" icon={History}>
          <p className="text-2xl font-semibold">{report?.execution.log.length ?? "—"}</p>
        </WidgetContainer>

        <WidgetContainer title="Automation insights" subtitle="Cross-module" icon={Layers}>
          <p className="text-2xl font-semibold">{d?.insights.length ?? "—"}</p>
        </WidgetContainer>

        <WidgetContainer title="Automation trends" subtitle="By phase" icon={Activity}>
          <p className="text-2xl font-semibold">{d?.trends[0]?.value ?? "—"}</p>
          <p className="text-xs text-muted-foreground">{d?.trends[0]?.label ?? ""}</p>
        </WidgetContainer>

        <WidgetContainer title="Automation health" subtitle="Enterprise score" icon={Shield}>
          <p className="text-2xl font-semibold">{d?.healthScore ?? "—"}</p>
        </WidgetContainer>

        <WidgetContainer title="Autonomous sync" subtitle="Offline → online" icon={RefreshCw}>
          <p className="text-2xl font-semibold">{d?.queueSize ?? "—"}</p>
          <p className="text-xs text-muted-foreground">queued for sync</p>
        </WidgetContainer>
      </div>

      {d?.insights && d.insights.length > 0 && (
        <div
          className="rounded-lg border p-4 text-sm"
          style={{ borderColor: "var(--vera-border)" }}
        >
          <p className="font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Insights
          </p>
          <ul className="mt-2 space-y-1 text-muted-foreground">
            {d.insights.slice(0, 5).map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      {report?.crossModule.chains && report.crossModule.chains.length > 0 && (
        <div
          className="rounded-lg border p-4 text-sm"
          style={{ borderColor: "var(--vera-border)" }}
        >
          <p className="font-semibold">Cross-module automation chains</p>
          <ul className="mt-2 space-y-2">
            {report.crossModule.chains.slice(0, 3).map((c) => (
              <li key={c.id}>
                <span className="font-medium">{c.trigger}</span>
                <ol className="ml-4 mt-1 list-decimal text-muted-foreground">
                  {c.steps.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
