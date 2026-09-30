"use client";

import { useEffect, useState } from "react";
import {
  Sparkles,
  Globe,
  Rocket,
  Satellite,
  Bot,
  Droplets,
  Snowflake,
  AlertTriangle,
  Zap,
  LineChart,
  Gavel,
  Network,
  Clock,
} from "lucide-react";
import { useInterstellar } from "@/lib/interstellar";
import { WidgetContainer } from "@/components/dashboard/engine/WidgetContainer";

type Props = { companyId?: number };

type Tab =
  | "starmap"
  | "navigation"
  | "colony"
  | "terraform"
  | "robotics"
  | "lifesupport"
  | "cryosleep"
  | "risk"
  | "automation"
  | "timeline"
  | "generation"
  | "probes"
  | "replication"
  | "delay"
  | "policies"
  | "simulation"
  | "graph";

export function InterstellarSection({ companyId }: Props) {
  const { report, loading, error, expand } = useInterstellar(companyId);
  const [tab, setTab] = useState<Tab>("starmap");

  useEffect(() => {
    void expand();
  }, [expand]);

  const d = report?.dashboard;

  const tabs: { id: Tab; label: string }[] = [
    { id: "starmap", label: "Star map" },
    { id: "navigation", label: "Navigation" },
    { id: "colony", label: "Colony" },
    { id: "terraform", label: "Terraforming" },
    { id: "robotics", label: "Robotics" },
    { id: "lifesupport", label: "Life support" },
    { id: "cryosleep", label: "Cryosleep" },
    { id: "risk", label: "Risk" },
    { id: "automation", label: "Automation" },
    { id: "timeline", label: "Mission timeline" },
    { id: "generation", label: "Generation ships" },
    { id: "probes", label: "Probes" },
    { id: "replication", label: "Replication" },
    { id: "delay", label: "Light-year AI" },
    { id: "policies", label: "Policies" },
    { id: "simulation", label: "Simulation" },
    { id: "graph", label: "Knowledge graph" },
  ];

  return (
    <section className="space-y-6 border-b border-vera-charcoal/10 pb-8">
      <div>
        <h2 className="text-xl font-semibold text-vera-charcoal flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-violet-600" />
          Interstellar Expansion (VIOE-X)
        </h2>
        <p className="text-sm text-vera-muted mt-1">
          Multi-star-system, delay-tolerant, self-replicating operations across generations.
        </p>
      </div>

      {loading && <p className="text-sm text-vera-muted">Expanding interstellar operations…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {d && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <WidgetContainer title="Assets" icon={Globe}>
            <p className="text-2xl font-semibold">{d.assetCount}</p>
          </WidgetContainer>
          <WidgetContainer title="Star systems" icon={Sparkles}>
            <p className="text-2xl font-semibold">{d.systemCount}</p>
          </WidgetContainer>
          <WidgetContainer title="Avg delay" icon={Clock}>
            <p className="text-2xl font-semibold">{d.avgDelayYears}y</p>
          </WidgetContainer>
          <WidgetContainer title="Mission integrity" icon={Rocket}>
            <p className="text-2xl font-semibold">{d.missionIntegrity}</p>
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

          {tab === "starmap" && (
            <WidgetContainer title="Star system map" icon={Globe}>
              <ul className="text-sm space-y-1">
                {report.starSystems.links.map((l) => (
                  <li key={l.id}>
                    {l.from} ↔ {l.to}: {l.delayYears}y ({l.status})
                  </li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "navigation" && (
            <WidgetContainer title="Interstellar navigation" icon={Rocket}>
              <ul className="text-sm list-disc pl-4">
                {report.probes.navigation.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "colony" && (
            <WidgetContainer title="Colony dashboard" icon={Globe}>
              <ul className="text-sm">
                {(report.context.assets ?? [])
                  .filter((a) => a.kind === "colony" || a.kind === "habitat")
                  .map((a) => (
                    <li key={a.id}>
                      {a.name} ({a.system})
                    </li>
                  ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "terraform" && (
            <WidgetContainer title="Terraforming" icon={Globe}>
              <ul className="text-sm list-disc pl-4">
                {report.automation.terraformingTasks.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "robotics" && (
            <WidgetContainer title="Robotics fleet" icon={Bot}>
              <ul className="text-sm list-disc pl-4">
                {report.automation.roboticsAssignments.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "lifesupport" && (
            <WidgetContainer title="Life support" icon={Droplets}>
              <ul className="text-sm list-disc pl-4">
                {report.generationShips.lifeSupportPlans.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "cryosleep" && (
            <WidgetContainer title="Cryosleep" icon={Snowflake}>
              <p className="text-sm">Risk score: {report.safety.cryosleepRisk}</p>
              <ul className="text-sm mt-2 list-disc pl-4">
                {report.automation.cryosleepCycles.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "risk" && (
            <WidgetContainer title="Interstellar risk" icon={AlertTriangle}>
              <p className="text-lg font-semibold">{d?.interstellarRiskScore}</p>
              <ul className="text-sm mt-2 space-y-1">
                {report.safety.hazards.slice(0, 8).map((h) => (
                  <li key={h.id}>
                    [{h.system}] {h.type} ({h.severity})
                  </li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "automation" && (
            <WidgetContainer title="Automation" icon={Zap}>
              <ul className="text-sm space-y-1">
                {report.automation.actions.map((a) => (
                  <li key={a.id}>
                    {a.trigger} → {a.target}
                  </li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "timeline" && (
            <WidgetContainer title="Mission timeline" icon={Clock}>
              <ul className="text-sm space-y-1">
                {report.lightYearDelay.predictedStates.map((p) => (
                  <li key={p.assetId}>
                    {p.assetId}: {p.horizon} — {p.prediction}
                  </li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "generation" && (
            <WidgetContainer title="Generation ships" icon={Rocket}>
              <ul className="text-sm list-disc pl-4">
                {report.generationShips.missionPlans.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "probes" && (
            <WidgetContainer title="Interstellar probes" icon={Satellite}>
              <ul className="text-sm list-disc pl-4">
                {report.probes.replication.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "replication" && (
            <WidgetContainer title="Self-replicating colonies" icon={Bot}>
              <ul className="text-sm list-disc pl-4">
                {report.replicatingColonies.vonNeumannProbes.map((v) => (
                  <li key={v}>{v}</li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "delay" && (
            <WidgetContainer title="Light-year delay AI" icon={Clock}>
              <p className="text-sm">Autonomous: {report.lightYearDelay.autonomousMode ? "ON" : "OFF"}</p>
              <ul className="text-xs mt-2 space-y-1">
                {report.lightYearDelay.prePlannedActions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "policies" && (
            <WidgetContainer title="Policies" icon={Gavel}>
              <ul className="text-sm space-y-1">
                {report.policies.map((p) => (
                  <li key={p.id} className={p.violation ? "text-red-700" : ""}>
                    [{p.domain}] {p.rule}
                  </li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "simulation" && (
            <WidgetContainer title="Simulations" icon={LineChart}>
              <ul className="text-sm space-y-2">
                {report.simulations.map((s) => (
                  <li key={s.id}>
                    {s.scenario} (impact {s.impact})
                  </li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "graph" && (
            <WidgetContainer title="Knowledge graph" icon={Network}>
              <p className="text-sm text-vera-muted">
                {report.knowledgeGraph.nodes.length} nodes · {report.knowledgeGraph.edges.length} edges
              </p>
            </WidgetContainer>
          )}
        </>
      )}
    </section>
  );
}
