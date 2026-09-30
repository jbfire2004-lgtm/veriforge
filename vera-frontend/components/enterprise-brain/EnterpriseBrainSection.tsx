"use client";

import { useEffect, useState } from "react";
import { Brain, Target, GitBranch, LineChart, Zap, Gavel, Shield } from "lucide-react";
import { useEnterpriseBrain } from "@/lib/enterprise-brain";
import { WidgetContainer } from "@/components/dashboard/engine/WidgetContainer";

type Props = { companyId?: number; projectId?: number; unionHallId?: number };

type Tab = "reasoning" | "planning" | "predictions" | "optimization" | "simulation" | "decisions" | "memory" | "policies";

export function EnterpriseBrainSection({ companyId, projectId, unionHallId }: Props) {
  const { report, loading, error, think } = useEnterpriseBrain(companyId, projectId, unionHallId);
  const [tab, setTab] = useState<Tab>("reasoning");

  useEffect(() => {
    if (companyId) void think();
  }, [companyId, projectId, unionHallId, think]);

  const d = report?.dashboard;

  const tabs: { id: Tab; label: string }[] = [
    { id: "reasoning", label: "Reasoning" },
    { id: "planning", label: "Planning" },
    { id: "predictions", label: "Predictions" },
    { id: "optimization", label: "Optimization" },
    { id: "simulation", label: "Simulation" },
    { id: "decisions", label: "Decisions" },
    { id: "memory", label: "Memory" },
    { id: "policies", label: "Policies" },
  ];

  return (
    <section className="space-y-6 border-b border-vera-charcoal/10 pb-8">
      <div>
        <h2 className="text-xl font-semibold text-vera-charcoal flex items-center gap-2">
          <Brain className="h-6 w-6 text-teal-700" />
          Autonomous Enterprise Brain (AEB)
        </h2>
        <p className="text-sm text-vera-muted mt-1">
          Holistic reasoning, planning, prediction, and autonomous decisions across the entire enterprise.
        </p>
      </div>

      {loading && <p className="text-sm text-vera-muted">Thinking across all enterprise systems…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {d && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <WidgetContainer title="Brain health" icon={Brain}>
            <p className="text-2xl font-semibold">{d.healthScore}</p>
          </WidgetContainer>
          <WidgetContainer title="Reasoning steps" icon={GitBranch}>
            <p className="text-2xl font-semibold">{d.reasoningSteps}</p>
          </WidgetContainer>
          <WidgetContainer title="Predictions" icon={LineChart}>
            <p className="text-2xl font-semibold">{d.predictionCount}</p>
          </WidgetContainer>
          <WidgetContainer title="Decisions" icon={Gavel}>
            <p className="text-2xl font-semibold">{d.decisionCount}</p>
          </WidgetContainer>
        </div>
      )}

      {report && (
        <>
          <div className="flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium border ${
                  tab === t.id
                    ? "bg-vera-charcoal text-white border-vera-charcoal"
                    : "bg-white text-vera-charcoal border-vera-charcoal/20"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="rounded-lg border p-4 text-sm min-h-[200px]" style={{ borderColor: "var(--vera-border)" }}>
            {tab === "reasoning" && (
              <div className="space-y-3">
                <p className="font-medium">{report.reasoning.summary}</p>
                <ul className="space-y-2">
                  {report.reasoning.steps.map((s) => (
                    <li key={s.id}>
                      <span className="text-xs uppercase text-muted-foreground">{s.domain}</span> — {s.conclusion}
                      {s.safetyFirst && <span className="ml-1 text-red-600 text-xs">(safety-first)</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {tab === "planning" && (
              <div className="grid md:grid-cols-3 gap-4">
                {(["daily", "weekly", "monthly"] as const).map((h) => (
                  <div key={h}>
                    <p className="font-medium capitalize mb-2">{h}</p>
                    <ul className="space-y-1 text-muted-foreground">
                      {(h === "daily" ? report.planning.daily : h === "weekly" ? report.planning.weekly : report.planning.monthly).map((p) => (
                        <li key={p.id}>{p.action}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
            {tab === "predictions" && (
              <ul className="space-y-2">
                {report.predictions.map((p) => (
                  <li key={p.id}>
                    <span className="font-medium">{p.label}</span> — {(p.probability * 100).toFixed(0)}% in {p.horizonDays}d
                    {p.preventiveAction && <span className="block text-xs text-teal-800">{p.preventiveAction}</span>}
                  </li>
                ))}
              </ul>
            )}
            {tab === "optimization" && (
              <ul className="space-y-3">
                {report.optimization.map((o) => (
                  <li key={o.domain}>
                    <span className="font-medium capitalize">{o.domain}</span> score {o.score}
                    <ul className="text-xs text-muted-foreground ml-4 list-disc">
                      {o.recommendations.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
            {tab === "simulation" && (
              <ul className="space-y-2">
                {report.simulations.map((s) => (
                  <li key={s.id}>
                    <span className="font-medium">{s.name}</span> — {s.outcome}
                    <span className="block text-xs">→ {s.recommendedAction}</span>
                  </li>
                ))}
              </ul>
            )}
            {tab === "decisions" && (
              <ul className="space-y-2">
                {report.decisions.map((dec) => (
                  <li key={dec.id}>
                    <span className="font-medium">{dec.title}</span>
                    <span className="text-xs text-muted-foreground ml-2 capitalize">{dec.mode}</span>
                    <span className="block text-xs">{dec.reason}</span>
                  </li>
                ))}
              </ul>
            )}
            {tab === "memory" && (
              <ul className="space-y-1 max-h-64 overflow-y-auto">
                {report.memory.map((m) => (
                  <li key={m.id} className="text-muted-foreground">
                    <span className="text-xs font-medium text-foreground">{m.category}</span> — {m.content}
                  </li>
                ))}
              </ul>
            )}
            {tab === "policies" && (
              <ul className="space-y-2">
                {report.policies.map((p) => (
                  <li key={p.id}>
                    <span className="font-medium">{p.name}</span> v{p.version}
                    {p.violation && <span className="block text-red-600 text-xs">{p.violation}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {report.goals && (
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Target className="h-3 w-3" /> Safety {report.goals.safety}</span>
              <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Compliance {report.goals.compliance}</span>
              <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> Readiness {report.goals.readiness}</span>
            </div>
          )}
        </>
      )}
    </section>
  );
}
