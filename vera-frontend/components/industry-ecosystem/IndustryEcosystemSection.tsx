"use client";

import { useEffect, useState } from "react";
import {
  Layers,
  AlertTriangle,
  Users,
  Wrench,
  ShieldCheck,
  Truck,
  Bot,
  Network,
  Map,
  Target,
  GitBranch,
  Gavel,
  LineChart,
} from "lucide-react";
import { useIndustryEcosystem } from "@/lib/industry-ecosystem";
import { WidgetContainer } from "@/components/dashboard/engine/WidgetContainer";

type Props = { companyId?: number };

type Tab =
  | "map"
  | "risk"
  | "readiness"
  | "workforce"
  | "equipment"
  | "safety"
  | "compliance"
  | "dispatch"
  | "automation"
  | "coordination"
  | "prediction"
  | "policies"
  | "simulation"
  | "graph"
  | "alerts";

export function IndustryEcosystemSection({ companyId }: Props) {
  const { report, loading, error, orchestrate } = useIndustryEcosystem(companyId);
  const [tab, setTab] = useState<Tab>("map");

  useEffect(() => {
    void orchestrate();
  }, [orchestrate]);

  const d = report?.dashboard;

  const tabs: { id: Tab; label: string }[] = [
    { id: "map", label: "Industry map" },
    { id: "risk", label: "Risk" },
    { id: "readiness", label: "Readiness" },
    { id: "workforce", label: "Workforce" },
    { id: "equipment", label: "Equipment" },
    { id: "safety", label: "Safety" },
    { id: "compliance", label: "Compliance" },
    { id: "dispatch", label: "Dispatch" },
    { id: "automation", label: "Automation" },
    { id: "coordination", label: "Coordination" },
    { id: "prediction", label: "Prediction" },
    { id: "policies", label: "Policies" },
    { id: "simulation", label: "Simulation" },
    { id: "graph", label: "Knowledge graph" },
    { id: "alerts", label: "Alerts" },
  ];

  return (
    <section className="space-y-6 border-b border-vera-charcoal/10 pb-8">
      <div>
        <h2 className="text-xl font-semibold text-vera-charcoal flex items-center gap-2">
          <Layers className="h-6 w-6 text-violet-700" />
          Autonomous Industry Ecosystem (VAIEE)
        </h2>
        <p className="text-sm text-vera-muted mt-1">
          Cross-company, cross-industry coordination, prediction, optimization, and autonomous action.
        </p>
      </div>

      {loading && <p className="text-sm text-vera-muted">Orchestrating industry ecosystem…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {d && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <WidgetContainer title="Participants" icon={Network}>
            <p className="text-2xl font-semibold">{d.participantCount}</p>
          </WidgetContainer>
          <WidgetContainer title="Industry risk" icon={AlertTriangle}>
            <p className="text-2xl font-semibold">{d.industryRiskScore}</p>
          </WidgetContainer>
          <WidgetContainer title="Industry readiness" icon={Target}>
            <p className="text-2xl font-semibold">{d.industryReadinessScore}</p>
          </WidgetContainer>
          <WidgetContainer title="Active alerts" icon={ShieldCheck}>
            <p className="text-2xl font-semibold">{d.alertCount}</p>
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

          {tab === "map" && (
            <WidgetContainer title="Industry map view" icon={Map}>
              <ul className="text-sm space-y-1">
                {report.risk.riskMap.map((r) => (
                  <li key={r.region}>
                    {r.region}: risk {r.score} — {r.hazards.join(", ")}
                  </li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "risk" && (
            <div className="grid gap-4 md:grid-cols-2">
              <WidgetContainer title="Industry risk score" icon={AlertTriangle}>
                <p className="text-2xl font-semibold">{report.risk.industryScore}</p>
                <p className="text-xs text-vera-muted mt-2">
                  SIF {report.risk.sifRisk} · HECA {report.risk.hecaRisk} · Energy {report.risk.energyWheelRisk}
                </p>
              </WidgetContainer>
              <WidgetContainer title="Recommendations" icon={LineChart}>
                <ul className="text-sm list-disc pl-4 space-y-1">
                  {report.risk.recommendations.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </WidgetContainer>
            </div>
          )}

          {tab === "readiness" && (
            <WidgetContainer title="Readiness dimensions" icon={Target}>
              <ul className="text-sm space-y-1">
                {report.readiness.dimensions.map((dim) => (
                  <li key={dim.dimension}>
                    {dim.dimension}: {dim.score} ({dim.trend})
                  </li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "workforce" && (
            <WidgetContainer title="Workforce coordination" icon={Users}>
              <ul className="text-sm list-disc pl-4">
                {report.coordination.workforceSharing.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "equipment" && (
            <WidgetContainer title="Equipment distribution" icon={Wrench}>
              <ul className="text-sm list-disc pl-4">
                {report.optimization.equipmentDistribution.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "safety" && (
            <WidgetContainer title="Safety coordination" icon={ShieldCheck}>
              <ul className="text-sm list-disc pl-4">
                {report.coordination.safetyCoordination.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "compliance" && (
            <WidgetContainer title="Compliance coordination" icon={Gavel}>
              <ul className="text-sm list-disc pl-4">
                {report.coordination.complianceCoordination.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "dispatch" && (
            <WidgetContainer title="Dispatch coordination" icon={Truck}>
              <ul className="text-sm list-disc pl-4">
                {report.coordination.dispatchCoordination.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "automation" && (
            <WidgetContainer title="Industry automation" icon={Bot}>
              <ul className="text-sm space-y-1">
                {report.automation.actions
                  .filter((a) => a.enabled)
                  .map((a) => (
                    <li key={a.id}>
                      {a.trigger}: {a.scope}
                    </li>
                  ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "coordination" && (
            <WidgetContainer title="Coordination actions" icon={GitBranch}>
              <ul className="text-sm space-y-2">
                {report.coordination.actions.map((a) => (
                  <li key={a.id}>
                    <span className="font-medium">{a.domain}</span> — {a.action} ({a.priority})
                  </li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "prediction" && (
            <WidgetContainer title="Industry forecasts" icon={LineChart}>
              <ul className="text-sm space-y-1">
                {report.prediction.forecasts.map((f) => (
                  <li key={f.label}>
                    {f.label}: {(f.probability * 100).toFixed(0)}% ({f.horizon})
                  </li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "policies" && (
            <WidgetContainer title="Industry policies" icon={Gavel}>
              <ul className="text-sm space-y-1">
                {report.policies.map((p) => (
                  <li key={p.id} className={p.violation ? "text-red-700" : ""}>
                    [{p.domain}] {p.rule} v{p.version}
                    {p.violation ? " — VIOLATION" : ""}
                  </li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "simulation" && (
            <WidgetContainer title="Industry simulations" icon={Target}>
              <ul className="text-sm space-y-2">
                {report.simulations.map((s) => (
                  <li key={s.id}>
                    {s.scenario} (impact {s.impact}) — {s.recommendation}
                  </li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "graph" && (
            <WidgetContainer title="Industry knowledge graph" icon={Network}>
              <p className="text-sm text-vera-muted">
                {report.knowledgeGraph.nodes.length} nodes · {report.knowledgeGraph.edges.length} edges
              </p>
            </WidgetContainer>
          )}

          {tab === "alerts" && (
            <WidgetContainer title="Industry alerts" icon={AlertTriangle}>
              {report.alerts.length === 0 ? (
                <p className="text-sm text-vera-muted">No active industry alerts.</p>
              ) : (
                <ul className="text-sm space-y-2">
                  {report.alerts.map((a) => (
                    <li key={a.id} className="border-l-2 border-violet-500 pl-2">
                      <span className="font-medium uppercase text-xs">{a.severity}</span> — {a.title}
                      <p className="text-vera-muted text-xs">{a.message}</p>
                    </li>
                  ))}
                </ul>
              )}
            </WidgetContainer>
          )}
        </>
      )}
    </section>
  );
}
