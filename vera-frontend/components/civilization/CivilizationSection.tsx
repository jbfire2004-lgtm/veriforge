"use client";

import { useEffect, useState } from "react";
import {
  Landmark,
  Scale,
  TrendingUp,
  Leaf,
  BookOpen,
  Network,
  LineChart,
  Gavel,
  Brain,
  Globe,
  Shield,
} from "lucide-react";
import { useCivilization } from "@/lib/civilization";
import { WidgetContainer } from "@/components/dashboard/engine/WidgetContainer";

type Props = { companyId?: number };

type Tab =
  | "map"
  | "stability"
  | "growth"
  | "sustainability"
  | "ethics"
  | "knowledge"
  | "coordination"
  | "simulation"
  | "decisions";

export function CivilizationSection({ companyId }: Props) {
  const { report, loading, error, govern } = useCivilization(companyId);
  const [tab, setTab] = useState<Tab>("map");

  useEffect(() => {
    void govern();
  }, [govern]);

  const d = report?.dashboard;

  const tabs: { id: Tab; label: string }[] = [
    { id: "map", label: "Civilization map" },
    { id: "stability", label: "Stability" },
    { id: "growth", label: "Growth" },
    { id: "sustainability", label: "Sustainability" },
    { id: "ethics", label: "Ethics" },
    { id: "knowledge", label: "Knowledge" },
    { id: "coordination", label: "Coordination" },
    { id: "simulation", label: "Simulation" },
    { id: "decisions", label: "Decisions" },
  ];

  return (
    <section className="space-y-6 border-b border-vera-charcoal/10 pb-8">
      <div>
        <h2 className="text-xl font-semibold text-vera-charcoal flex items-center gap-2">
          <Landmark className="h-6 w-6 text-amber-700" />
          Universal Civilization Engine (UCE)
        </h2>
        <p className="text-sm text-vera-muted mt-1">
          Self-governing intelligence for multi-system civilization: ethics, stability, growth, and memory.
        </p>
      </div>

      {loading && <p className="text-sm text-vera-muted">Governing civilization…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {d && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <WidgetContainer title="Scopes" icon={Globe}>
            <p className="text-2xl font-semibold">{d.scopeCount}</p>
          </WidgetContainer>
          <WidgetContainer title="Stability" icon={Shield}>
            <p className="text-2xl font-semibold">{d.stabilityScore}</p>
          </WidgetContainer>
          <WidgetContainer title="Sustainability" icon={Leaf}>
            <p className="text-2xl font-semibold">{d.sustainabilityScore}</p>
          </WidgetContainer>
          <WidgetContainer title="Ethics alignment" icon={Scale}>
            <p className="text-2xl font-semibold">{d.ethicsAlignment}</p>
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
            <WidgetContainer title="Multi-star civilization map" icon={Globe}>
              <ul className="text-sm space-y-1">
                {(report.context.scopes ?? []).map((s) => (
                  <li key={s.id}>
                    {s.name} ({s.type}) — stability {s.stability ?? "—"}
                  </li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "stability" && (
            <WidgetContainer title="Stability dashboard" icon={Shield}>
              <p className="text-lg font-semibold">Score {report.stability.stabilityScore}</p>
              <ul className="text-sm mt-2 space-y-1">
                {report.stability.forecasts.map((f) => (
                  <li key={f.label}>
                    {f.label}: {(f.probability * 100).toFixed(0)}% ({f.horizon})
                  </li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "growth" && (
            <WidgetContainer title="Growth dashboard" icon={TrendingUp}>
              <ul className="text-sm space-y-1">
                {report.growth.forecasts.map((f) => (
                  <li key={f.domain}>
                    {f.domain}: {f.rate}%/yr ({f.horizon})
                  </li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "sustainability" && (
            <WidgetContainer title="Sustainability dashboard" icon={Leaf}>
              <p className="text-lg font-semibold">Score {report.sustainability.sustainabilityScore}</p>
              <ul className="text-sm mt-2 list-disc pl-4">
                {report.sustainability.recommendations.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "ethics" && (
            <WidgetContainer title="Ethics dashboard" icon={Scale}>
              <p className="text-sm">Alignment: {report.ethics.alignmentScore}</p>
              <ul className="text-sm mt-2 space-y-1">
                {report.ethics.rules.map((r) => (
                  <li key={r.id} className={r.violation ? "text-red-700" : ""}>
                    [{r.framework}] {r.rule}
                  </li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "knowledge" && (
            <WidgetContainer title="Knowledge dashboard" icon={BookOpen}>
              <p className="text-sm text-vera-muted">
                Graph: {report.knowledge.graphNodes} nodes · {report.knowledge.graphEdges} edges
              </p>
              <p className="text-sm mt-2">Memory span: {report.memory.centurySpan} years</p>
            </WidgetContainer>
          )}

          {tab === "coordination" && (
            <WidgetContainer title="Coordination dashboard" icon={Network}>
              <ul className="text-sm list-disc pl-4 space-y-1">
                {report.coordination.logistics.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "simulation" && (
            <WidgetContainer title="Simulation dashboard" icon={LineChart}>
              <ul className="text-sm space-y-2">
                {report.simulations.map((s) => (
                  <li key={s.id}>
                    {s.scenario} (impact {s.impact})
                  </li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "decisions" && (
            <WidgetContainer title="Decision dashboard" icon={Gavel}>
              <ul className="text-sm space-y-2">
                {report.decisions.map((dec) => (
                  <li key={dec.id}>
                    <span className="font-medium">{dec.kind}</span> — {dec.title}
                    <p className="text-xs text-vera-muted">{dec.rationale}</p>
                  </li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {report.memory.records.length > 0 && tab === "knowledge" && (
            <WidgetContainer title="Civilization memory" icon={Brain}>
              <p className="text-sm">{report.memory.records.length} archived records</p>
            </WidgetContainer>
          )}
        </>
      )}
    </section>
  );
}
