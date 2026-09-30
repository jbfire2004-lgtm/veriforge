"use client";

import { useEffect, useState } from "react";
import {
  Rocket,
  Globe,
  Orbit,
  Radio,
  ShieldAlert,
  Bot,
  Zap,
  Droplets,
  AlertTriangle,
  Network,
  Gavel,
  LineChart,
} from "lucide-react";
import { useInterplanetary } from "@/lib/interplanetary";
import { WidgetContainer } from "@/components/dashboard/engine/WidgetContainer";

type Props = { companyId?: number };

type Tab =
  | "planetary"
  | "orbital"
  | "deepspace"
  | "delay"
  | "safety"
  | "automation"
  | "twins"
  | "habitat"
  | "eva"
  | "robotics"
  | "lifesupport"
  | "power"
  | "risk"
  | "policies"
  | "simulation"
  | "graph";

export function InterplanetarySection({ companyId }: Props) {
  const { report, loading, error, operate } = useInterplanetary(companyId);
  const [tab, setTab] = useState<Tab>("planetary");

  useEffect(() => {
    void operate();
  }, [operate]);

  const d = report?.dashboard;

  const tabs: { id: Tab; label: string }[] = [
    { id: "planetary", label: "Planetary map" },
    { id: "orbital", label: "Orbital" },
    { id: "deepspace", label: "Deep space" },
    { id: "delay", label: "Delay-tolerant AI" },
    { id: "safety", label: "Safety" },
    { id: "automation", label: "Automation" },
    { id: "twins", label: "Digital twins" },
    { id: "habitat", label: "Habitat" },
    { id: "eva", label: "EVA" },
    { id: "robotics", label: "Robotics" },
    { id: "lifesupport", label: "Life support" },
    { id: "power", label: "Power grid" },
    { id: "risk", label: "Risk" },
    { id: "policies", label: "Policies" },
    { id: "simulation", label: "Simulation" },
    { id: "graph", label: "Knowledge graph" },
  ];

  return (
    <section className="space-y-6 border-b border-vera-charcoal/10 pb-8">
      <div>
        <h2 className="text-xl font-semibold text-vera-charcoal flex items-center gap-2">
          <Rocket className="h-6 w-6 text-sky-700" />
          Interplanetary Operations (VIOE)
        </h2>
        <p className="text-sm text-vera-muted mt-1">
          Delay-tolerant, self-healing coordination across Earth, Moon, Mars, orbit, and deep space.
        </p>
      </div>

      {loading && <p className="text-sm text-vera-muted">Operating interplanetary systems…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {d && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <WidgetContainer title="Sites" icon={Globe}>
            <p className="text-2xl font-semibold">{d.siteCount}</p>
          </WidgetContainer>
          <WidgetContainer title="Comm delay (avg)" icon={Radio}>
            <p className="text-2xl font-semibold">{d.avgCommDelayMinutes}m</p>
          </WidgetContainer>
          <WidgetContainer title="Hazards" icon={AlertTriangle}>
            <p className="text-2xl font-semibold">{d.hazardCount}</p>
          </WidgetContainer>
          <WidgetContainer title="IP risk score" icon={ShieldAlert}>
            <p className="text-2xl font-semibold">{d.interplanetaryRiskScore}</p>
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

          {tab === "planetary" && (
            <WidgetContainer title="Planetary coordination" icon={Globe}>
              <ul className="text-sm space-y-1">
                {report.planetary.links.map((l) => (
                  <li key={l.id}>
                    {l.from} ↔ {l.to}: {l.delayMinutes}m delay ({l.status})
                  </li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "orbital" && (
            <WidgetContainer title="Orbital operations" icon={Orbit}>
              <ul className="text-sm space-y-1">
                {report.orbital.evaSchedule.map((e) => (
                  <li key={e.id}>
                    {e.station}: {e.window} (risk {e.risk})
                  </li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "deepspace" && (
            <WidgetContainer title="Deep-space coordination" icon={Rocket}>
              <ul className="text-sm list-disc pl-4">
                {report.deepSpace.missionPlans.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "delay" && (
            <WidgetContainer title="Delay-tolerant AI" icon={Radio}>
              <p className="text-sm">Autonomous mode: {report.delayTolerant.autonomousMode ? "ON" : "OFF"}</p>
              <p className="text-sm mt-1">Sync pending: {report.delayTolerant.syncPending}</p>
              <ul className="text-xs mt-2 space-y-1">
                {report.delayTolerant.prePlannedActions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "safety" && (
            <WidgetContainer title="Interplanetary safety" icon={ShieldAlert}>
              <ul className="text-sm space-y-1">
                {report.safety.hazards.map((h) => (
                  <li key={h.id}>
                    [{h.body}] {h.type}: {(h.probability * 100).toFixed(0)}% ({h.severity})
                  </li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "automation" && (
            <WidgetContainer title="Automation" icon={Bot}>
              <ul className="text-sm space-y-1">
                {report.automation.actions.map((a) => (
                  <li key={a.id}>
                    {a.trigger} → {a.target}
                  </li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "twins" && (
            <WidgetContainer title="Digital twins" icon={Network}>
              <ul className="text-xs max-h-40 overflow-y-auto space-y-0.5">
                {report.twins.slice(0, 12).map((t, i) => (
                  <li key={`${t.siteId}-${t.twinType}-${i}`}>
                    {t.twinType} @ {t.siteId}: health {t.health}
                  </li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "habitat" && (
            <WidgetContainer title="Habitat dashboard" icon={Globe}>
              <ul className="text-sm">
                {(report.context.sites ?? [])
                  .filter((s) => s.facilityType === "habitat")
                  .map((s) => (
                    <li key={s.id}>
                      {s.name}: life support {s.lifeSupportOk ? "OK" : "ALERT"}
                    </li>
                  ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "eva" && (
            <WidgetContainer title="EVA dashboard" icon={Orbit}>
              <p className="text-sm">EVA risk: {report.safety.evaRiskScore}</p>
              <ul className="text-sm mt-2">
                {report.orbital.evaSchedule.map((e) => (
                  <li key={e.id}>{e.station}</li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "robotics" && (
            <WidgetContainer title="Robotics" icon={Bot}>
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
                {report.automation.lifeSupportAdjustments.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "power" && (
            <WidgetContainer title="Power grid" icon={Zap}>
              <ul className="text-sm list-disc pl-4">
                {report.automation.powerRedistribution.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "risk" && (
            <WidgetContainer title="Interplanetary risk" icon={AlertTriangle}>
              <p className="text-lg font-semibold">Score {d?.interplanetaryRiskScore}</p>
              <p className="text-sm text-vera-muted">Habitat {report.safety.habitatRiskScore} · EVA {report.safety.evaRiskScore}</p>
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
