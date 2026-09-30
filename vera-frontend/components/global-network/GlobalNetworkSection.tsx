"use client";

import { useEffect, useState } from "react";
import {
  Globe,
  AlertTriangle,
  Users,
  Wrench,
  GraduationCap,
  ShieldCheck,
  Truck,
  Bot,
  Network,
  GitBranch,
} from "lucide-react";
import { useGlobalNetwork } from "@/lib/global-network";
import { WidgetContainer } from "@/components/dashboard/engine/WidgetContainer";

type Props = { companyId?: number };

type Tab =
  | "safety"
  | "hazards"
  | "workforce"
  | "equipment"
  | "training"
  | "compliance"
  | "dispatch"
  | "automation"
  | "twins"
  | "graph"
  | "alerts";

export function GlobalNetworkSection({ companyId }: Props) {
  const { report, loading, error, analyze } = useGlobalNetwork(companyId);
  const [tab, setTab] = useState<Tab>("safety");

  useEffect(() => {
    void analyze();
  }, [analyze]);

  const d = report?.dashboard;

  const tabs: { id: Tab; label: string }[] = [
    { id: "safety", label: "Safety" },
    { id: "hazards", label: "Hazards" },
    { id: "workforce", label: "Workforce" },
    { id: "equipment", label: "Equipment" },
    { id: "training", label: "Training" },
    { id: "compliance", label: "Compliance" },
    { id: "dispatch", label: "Dispatch" },
    { id: "automation", label: "Automation" },
    { id: "twins", label: "Twin federation" },
    { id: "graph", label: "Knowledge graph" },
    { id: "alerts", label: "Alerts" },
  ];

  return (
    <section className="space-y-6 border-b border-vera-charcoal/10 pb-8">
      <div>
        <h2 className="text-xl font-semibold text-vera-charcoal flex items-center gap-2">
          <Globe className="h-6 w-6 text-indigo-700" />
          Global Network Intelligence (VGNIE)
        </h2>
        <p className="text-sm text-vera-muted mt-1">
          Privacy-preserving federated intelligence across companies, workers, equipment, and union halls.
        </p>
      </div>

      {loading && <p className="text-sm text-vera-muted">Analyzing global network signals…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {d && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <WidgetContainer title="Companies in network" icon={Network}>
            <p className="text-2xl font-semibold">{d.companiesInNetwork}</p>
          </WidgetContainer>
          <WidgetContainer title="Global safety" icon={ShieldCheck}>
            <p className="text-2xl font-semibold">{d.globalSafetyScore}</p>
          </WidgetContainer>
          <WidgetContainer title="Global compliance" icon={GraduationCap}>
            <p className="text-2xl font-semibold">{d.globalComplianceScore}</p>
          </WidgetContainer>
          <WidgetContainer title="Active alerts" icon={AlertTriangle}>
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

          {tab === "safety" && (
            <div className="grid gap-4 md:grid-cols-2">
              <WidgetContainer title="Global risk score" icon={AlertTriangle}>
                <p className="text-2xl font-semibold">{report.safety.globalRiskScore}</p>
                <p className="text-xs text-vera-muted mt-2">
                  SIF prediction: {(report.safety.sifPrediction * 100).toFixed(0)}%
                </p>
              </WidgetContainer>
              <WidgetContainer title="Recommendations" icon={ShieldCheck}>
                <ul className="text-sm space-y-1 list-disc pl-4">
                  {report.safety.recommendations.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </WidgetContainer>
            </div>
          )}

          {tab === "hazards" && (
            <WidgetContainer title="Hazard clusters" icon={AlertTriangle}>
              <ul className="text-sm space-y-2">
                {report.hazards.clusters.map((c) => (
                  <li key={c.id} className="flex justify-between border-b border-vera-charcoal/10 pb-1">
                    <span>{c.label}</span>
                    <span className="text-vera-muted">
                      {c.count} signals · {c.trend}
                    </span>
                  </li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "workforce" && (
            <WidgetContainer title="Availability map" icon={Users}>
              <ul className="text-sm space-y-1">
                {report.workforce.availabilityMap.map((a) => (
                  <li key={a.region}>
                    {a.region}: {a.availability}% availability
                  </li>
                ))}
              </ul>
              {report.workforce.mobilityRecommendations.length > 0 && (
                <p className="text-xs text-vera-muted mt-3">
                  {report.workforce.mobilityRecommendations.join(" · ")}
                </p>
              )}
            </WidgetContainer>
          )}

          {tab === "equipment" && (
            <WidgetContainer title="Equipment intelligence" icon={Wrench}>
              <p className="text-lg font-semibold">Reliability {report.equipment.reliabilityScore}</p>
              <p className="text-sm text-vera-muted">Risk {report.equipment.riskScore}</p>
            </WidgetContainer>
          )}

          {tab === "training" && (
            <WidgetContainer title="Training forecast" icon={GraduationCap}>
              <ul className="text-sm space-y-1">
                {report.training.forecast.map((f) => (
                  <li key={f.certification}>
                    {f.certification}: {f.demand} seats
                  </li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "compliance" && (
            <WidgetContainer title="Global compliance" icon={ShieldCheck}>
              <p className="text-2xl font-semibold">{report.compliance.globalScore}</p>
              <ul className="text-sm mt-2 list-disc pl-4">
                {report.compliance.recommendations.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "dispatch" && (
            <WidgetContainer title="Dispatch map" icon={Truck}>
              <ul className="text-sm space-y-1">
                {report.dispatch.dispatchMap.map((row) => (
                  <li key={row.region}>
                    {row.region}: demand {row.demand} / supply {row.supply}
                  </li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "automation" && (
            <WidgetContainer title="Automation intelligence" icon={Bot}>
              <p className="text-sm">{report.automation.patternsLearned} patterns learned</p>
              <ul className="text-sm mt-2 list-disc pl-4">
                {report.automation.recommendations.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "twins" && (
            <WidgetContainer title="Digital twin federation" icon={GitBranch}>
              <ul className="text-sm space-y-1">
                {report.twinFederation.map((s) => (
                  <li key={`${s.twinType}-${s.signal}`}>
                    {s.twinType}: {s.signal} ({(s.strength * 100).toFixed(0)}%)
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
              <ul className="text-xs mt-2 max-h-40 overflow-y-auto space-y-0.5">
                {report.knowledgeGraph.nodes.slice(0, 12).map((n) => (
                  <li key={n.id}>
                    [{n.type}] {n.label}
                  </li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "alerts" && (
            <WidgetContainer title="Global alerts" icon={AlertTriangle}>
              {report.alerts.length === 0 ? (
                <p className="text-sm text-vera-muted">No active global alerts.</p>
              ) : (
                <ul className="text-sm space-y-2">
                  {report.alerts.map((a) => (
                    <li key={a.id} className="border-l-2 border-amber-500 pl-2">
                      <span className="font-medium uppercase text-xs">{a.severity}</span> — {a.title}
                      <p className="text-vera-muted text-xs">{a.message}</p>
                    </li>
                  ))}
                </ul>
              )}
            </WidgetContainer>
          )}

          {report.privacy && (
            <p className="text-xs text-vera-muted">
              Privacy: ε={report.privacy.differentialPrivacyEpsilon}, federated round{" "}
              {report.privacy.federatedLearningRound}, {report.privacy.anonymizationLevel}
              {report.privacy.encryptedFederation ? ", encrypted federation" : ""}
            </p>
          )}
        </>
      )}
    </section>
  );
}
