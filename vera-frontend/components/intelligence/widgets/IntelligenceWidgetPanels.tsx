"use client";

import { AlertTriangle, Brain, Lightbulb, TrendingUp } from "lucide-react";
import type { IntelligenceBundle } from "@vera/intelligence";
import { WidgetContainer } from "@/components/dashboard/engine/WidgetContainer";
import { ProgressBar } from "@/components/vera-core/status";

type Props = { bundle: IntelligenceBundle | null; role: string | null };

export function PredictiveCompliancePanel({ bundle }: Props) {
  const w = bundle?.dashboard?.widgets?.predictiveCompliance;
  const pct = w ? Math.round(w.probability * 100) : 0;
  return (
    <WidgetContainer
      title="Predictive compliance"
      subtitle="30-day failure risk forecast"
      icon={TrendingUp}
      tone={pct > 60 ? "danger" : pct > 35 ? "warning" : "success"}
    >
      <ProgressBar value={100 - pct} label={`Readiness buffer ${100 - pct}%`} />
      <p className="mt-2 text-xs text-muted-foreground">{w?.label ?? "Loading…"}</p>
    </WidgetContainer>
  );
}

export function PredictiveRiskPanel({ bundle }: Props) {
  const r = bundle?.dashboard?.widgets?.predictiveRisk;
  return (
    <WidgetContainer
      title="Predictive risk"
      subtitle="Org-wide risk index"
      icon={AlertTriangle}
      tone={r?.level === "critical" || r?.level === "high" ? "danger" : "warning"}
    >
      <p className="text-2xl font-semibold">{r?.score ?? "—"}</p>
      <p className="text-sm capitalize text-muted-foreground">{r?.level ?? "—"} risk</p>
    </WidgetContainer>
  );
}

export function SmartRecommendationsPanel({ bundle }: Props) {
  const recs = bundle?.recommendations?.slice(0, 5) ?? [];
  return (
    <WidgetContainer title="Smart recommendations" subtitle="AI-prioritized actions" icon={Lightbulb}>
      <ul className="space-y-2 text-sm">
        {recs.length === 0 && <li className="text-muted-foreground">No recommendations</li>}
        {recs.map((r) => (
          <li key={r.id} className="border-b border-border/50 pb-2 last:border-0">
            <span className="font-medium">{r.title}</span>
            <p className="text-xs text-muted-foreground">{r.description}</p>
          </li>
        ))}
      </ul>
    </WidgetContainer>
  );
}

export function AnomalyDetectionPanel({ bundle }: Props) {
  const items = bundle?.anomalies?.slice(0, 5) ?? [];
  return (
    <WidgetContainer title="Anomaly detection" subtitle="Recent signals" icon={Brain} tone="warning">
      <ul className="space-y-2 text-sm">
        {items.length === 0 && <li className="text-muted-foreground">No anomalies</li>}
        {items.map((a) => (
          <li key={a.id}>
            <span className="font-medium capitalize">{a.severity}</span>: {a.message}
          </li>
        ))}
      </ul>
    </WidgetContainer>
  );
}
