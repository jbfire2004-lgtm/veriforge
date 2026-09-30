"use client";

import { useEffect } from "react";
import {
  AlertTriangle,
  Bot,
  FileWarning,
  Gauge,
  MapPin,
  Shield,
  Users,
  Wrench,
  Clock,
  Activity,
  Truck,
  GraduationCap,
} from "lucide-react";
import { useCommandCenter } from "@/lib/command-center";
import { WidgetContainer } from "@/components/dashboard/engine/WidgetContainer";

type Props = {
  companyId?: number;
  projectId?: number;
  unionHallId?: number;
};

const severityClass: Record<string, string> = {
  critical: "text-red-700 bg-red-50 border-red-200",
  high: "text-orange-800 bg-orange-50 border-orange-200",
  medium: "text-amber-800 bg-amber-50 border-amber-200",
  low: "text-slate-600 bg-slate-50 border-slate-200",
};

export function CommandCenterSection({ companyId, projectId, unionHallId }: Props) {
  const { report, loading, error, refresh } = useCommandCenter(companyId, projectId, unionHallId);

  useEffect(() => {
    if (companyId) void refresh();
  }, [companyId, projectId, unionHallId, refresh]);

  const d = report?.dashboard;

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-vera-charcoal">
          Safety &amp; Operations Command Center
        </h2>
        <p className="text-sm text-vera-muted mt-1">
          Real-time risk, readiness, automation, twins, and alerts — unified across VASE, VPSE, VAOE, and VEAO.
        </p>
      </div>

      {loading && <p className="text-sm text-vera-muted">Refreshing real-time intelligence…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {d && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <WidgetContainer title="Real-time risk" subtitle="Enterprise avg" icon={AlertTriangle} tone="danger">
            <p className="text-2xl font-semibold">{d.risk.avg}</p>
            <p className="text-xs text-muted-foreground">{d.risk.critical} critical entities</p>
          </WidgetContainer>
          <WidgetContainer title="Real-time readiness" subtitle="Operational readiness" icon={Gauge}>
            <p className="text-2xl font-semibold">{d.readiness.avg}</p>
            <p className="text-xs text-muted-foreground">{d.readiness.failures} failures</p>
          </WidgetContainer>
          <WidgetContainer title="Compliance" subtitle="Training & competency" icon={Shield} tone="warning">
            <p className="text-2xl font-semibold">{d.compliance.rate}%</p>
            <p className="text-xs text-muted-foreground">{d.compliance.gaps} gaps</p>
          </WidgetContainer>
          <WidgetContainer title="Staffing" subtitle="Shortages" icon={Users}>
            <p className="text-2xl font-semibold">{d.staffing.shortages}</p>
          </WidgetContainer>
          <WidgetContainer title="Equipment" subtitle="Lockouts / downtime" icon={Truck}>
            <p className="text-2xl font-semibold">{d.equipment.lockouts}</p>
          </WidgetContainer>
          <WidgetContainer title="Safety" subtitle="SIF / HECA / Energy" icon={AlertTriangle} tone="danger">
            <p className="text-2xl font-semibold">
              {(d.safety.sifAlerts ?? 0) + (d.safety.hecaAlerts ?? 0)}
            </p>
            <p className="text-xs text-muted-foreground">{d.safety.energyAlerts} energy conflicts</p>
          </WidgetContainer>
          <WidgetContainer title="Automation" subtitle="Executed / queued" icon={Bot}>
            <p className="text-2xl font-semibold">{d.automation.executed}</p>
            <p className="text-xs text-muted-foreground">{d.automation.queued} queued</p>
          </WidgetContainer>
          <WidgetContainer title="Documents" subtitle="Fraud signals" icon={FileWarning}>
            <p className="text-2xl font-semibold">{d.documents.fraud}</p>
          </WidgetContainer>
          <WidgetContainer title="Digital twins" subtitle="Updated this cycle" icon={Activity}>
            <p className="text-2xl font-semibold">{d.twins.updated}</p>
          </WidgetContainer>
        </div>
      )}

      {report && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border p-4 space-y-3" style={{ borderColor: "var(--vera-border)" }}>
            <h3 className="font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Real-time map
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs max-h-48 overflow-y-auto">
              {report.map.slice(0, 12).map((m) => (
                <div
                  key={m.id}
                  className="rounded border px-2 py-1.5"
                  style={{ borderColor: "var(--vera-border)" }}
                >
                  <span className="font-medium">{m.label}</span>
                  <span className="text-muted-foreground block capitalize">
                    {m.type.replace("_", " ")} · {m.riskLevel}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border p-4 space-y-3" style={{ borderColor: "var(--vera-border)" }}>
            <h3 className="font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Alerts
            </h3>
            <ul className="space-y-2 max-h-48 overflow-y-auto text-sm">
              {report.alerts.slice(0, 8).map((a) => (
                <li
                  key={a.id}
                  className={`rounded border px-2 py-1.5 ${severityClass[a.severity] ?? severityClass.low}`}
                >
                  <span className="font-medium">{a.title}</span>
                  <span className="block text-xs opacity-90">{a.message}</span>
                </li>
              ))}
              {report.alerts.length === 0 && (
                <li className="text-muted-foreground">No active alerts</li>
              )}
            </ul>
          </div>

          <div className="rounded-lg border p-4 space-y-3" style={{ borderColor: "var(--vera-border)" }}>
            <h3 className="font-semibold flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Automation panel
            </h3>
            <ul className="text-sm space-y-1 max-h-40 overflow-y-auto text-muted-foreground">
              {report.automation.recent.map((a) => (
                <li key={a.id}>
                  <span className="text-foreground font-medium">{a.title}</span> — {a.status}
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground">
              {report.automation.executed} executed · {report.automation.failed} failed ·{" "}
              {report.automation.overridden} overridden
            </p>
          </div>

          <div className="rounded-lg border p-4 space-y-3" style={{ borderColor: "var(--vera-border)" }}>
            <h3 className="font-semibold flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              AI agents
            </h3>
            <ul className="space-y-2 text-sm max-h-40 overflow-y-auto">
              {report.agents.map((agent) => (
                <li key={agent.agent}>
                  <p className="font-medium">{agent.agent}</p>
                  <p className="text-xs text-muted-foreground">{agent.summary}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border p-4 space-y-3 lg:col-span-2" style={{ borderColor: "var(--vera-border)" }}>
            <h3 className="font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Timeline
            </h3>
            <ul className="text-sm space-y-1 max-h-36 overflow-y-auto">
              {report.timeline.slice(0, 10).map((t) => (
                <li key={t.id} className="flex gap-2 text-muted-foreground">
                  <span className="shrink-0 text-xs">{new Date(t.at).toLocaleTimeString()}</span>
                  <span className="capitalize text-xs font-medium text-foreground">{t.category}</span>
                  <span>{t.summary}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border p-4 space-y-3 lg:col-span-2" style={{ borderColor: "var(--vera-border)" }}>
            <h3 className="font-semibold flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Digital twin snapshot
            </h3>
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 text-xs">
              {report.twins.slice(0, 9).map((t) => (
                <div
                  key={`${t.entityType}-${t.entityId}`}
                  className="rounded border p-2"
                  style={{ borderColor: "var(--vera-border)" }}
                >
                  <span className="font-medium capitalize">{t.entityType}</span> {t.entityId}
                  <span className="block text-muted-foreground">
                    risk {t.risk} · readiness {t.readiness}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
