"use client";

import { useEffect } from "react";
import { Activity, Box, HardHat, Users } from "lucide-react";
import { useTwinDashboard, useTwinHydration } from "@/lib/digital-twin";
import { WidgetContainer } from "@/components/dashboard/engine/WidgetContainer";

type Props = { companyId?: number };

export function TwinDashboardSection({ companyId }: Props) {
  const { twins, loading: hydrating, hydrate } = useTwinHydration(companyId);
  const { dashboard, loading, refresh } = useTwinDashboard();

  useEffect(() => {
    if (companyId) void hydrate().then(() => refresh());
    else void refresh();
  }, [companyId, hydrate, refresh]);

  const d = dashboard;
  const showLoading = loading || hydrating;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-vera-charcoal">Digital twins</h2>
      {showLoading && (
        <p className="text-sm text-vera-muted">Syncing twin state…</p>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <WidgetContainer title="Worker twins" subtitle="Live roster twins" icon={Users}>
          <p className="text-2xl font-semibold">{d?.workers.total ?? twins.filter((t) => t.type === "worker").length}</p>
          <p className="text-xs text-muted-foreground">
            {d?.workers.atRisk ?? 0} at risk · avg readiness {d?.workers.avgReadiness ?? "—"}%
          </p>
        </WidgetContainer>
        <WidgetContainer title="Equipment twins" subtitle="Assets + lockouts" icon={HardHat}>
          <p className="text-2xl font-semibold">{d?.equipment.total ?? 0}</p>
          <p className="text-xs text-muted-foreground">
            {d?.equipment.lockedOut ?? 0} locked out
          </p>
        </WidgetContainer>
        <WidgetContainer title="Project twins" subtitle="Readiness" icon={Box} tone="warning">
          <p className="text-2xl font-semibold">{d?.projects.total ?? 0}</p>
          <p className="text-xs text-muted-foreground">
            {d?.projects.notReady ?? 0} not ready
          </p>
        </WidgetContainer>
        <WidgetContainer title="Twin anomalies" subtitle="Risk signals" icon={Activity} tone="danger">
          <p className="text-2xl font-semibold">{d?.anomalies.length ?? 0}</p>
        </WidgetContainer>
      </div>
      {d?.anomalies && d.anomalies.length > 0 && (
        <ul className="rounded-lg border p-3 text-sm" style={{ borderColor: "var(--vera-border)" }}>
          {d.anomalies.map((a) => (
            <li key={`${a.entityType}-${a.entityId}`}>{a.message}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
