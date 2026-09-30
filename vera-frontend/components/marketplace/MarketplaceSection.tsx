"use client";

import { useEffect, useState } from "react";
import type { CategoryMarketplace } from "@vera/marketplace";
import {
  Store,
  Users,
  GitMerge,
  DollarSign,
  Gavel,
  Star,
  LineChart,
} from "lucide-react";
import { useMarketplace } from "@/lib/marketplace";
import { WidgetContainer } from "@/components/dashboard/engine/WidgetContainer";

type Props = { companyId?: number };

type Tab =
  | "workforce"
  | "equipment"
  | "training"
  | "providers"
  | "safety"
  | "compliance"
  | "automation"
  | "matching"
  | "pricing"
  | "policies"
  | "reputation"
  | "simulation";

export function MarketplaceSection({ companyId }: Props) {
  const { report, loading, error, run } = useMarketplace(companyId);
  const [tab, setTab] = useState<Tab>("workforce");

  useEffect(() => {
    void run();
  }, [run]);

  const d = report?.dashboard;

  const tabs: { id: Tab; label: string }[] = [
    { id: "workforce", label: "Workforce" },
    { id: "equipment", label: "Equipment" },
    { id: "training", label: "Training" },
    { id: "providers", label: "Providers" },
    { id: "safety", label: "Safety services" },
    { id: "compliance", label: "Compliance" },
    { id: "automation", label: "Automation" },
    { id: "matching", label: "Matching" },
    { id: "pricing", label: "Pricing" },
    { id: "policies", label: "Policies" },
    { id: "reputation", label: "Reputation" },
    { id: "simulation", label: "Simulation" },
  ];

  const categoryPanel = (title: string, cat: CategoryMarketplace) => (
    <WidgetContainer title={title} icon={Store}>
      <p className="text-sm text-vera-muted mb-2">{cat.matches.length} matches</p>
      <ul className="text-sm space-y-1">
        {cat.availabilityMap.map((a) => (
          <li key={a.region}>
            {a.region}: supply {a.supply} / demand {a.demand}
          </li>
        ))}
      </ul>
      {cat.shortagePredictions.length > 0 && (
        <p className="text-xs text-amber-700 mt-2">
          Shortages: {cat.shortagePredictions.map((s) => `${s.region} (-${s.deficit})`).join(", ")}
        </p>
      )}
    </WidgetContainer>
  );

  return (
    <section className="space-y-6 border-b border-vera-charcoal/10 pb-8">
      <div>
        <h2 className="text-xl font-semibold text-vera-charcoal flex items-center gap-2">
          <Store className="h-6 w-6 text-emerald-700" />
          Global Autonomous Marketplace (VGAME)
        </h2>
        <p className="text-sm text-vera-muted mt-1">
          AI-driven exchange of workforce, equipment, training, safety, and compliance resources.
        </p>
      </div>

      {loading && <p className="text-sm text-vera-muted">Running autonomous marketplace…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {d && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <WidgetContainer title="Listings" icon={Store}>
            <p className="text-2xl font-semibold">{d.listingCount}</p>
          </WidgetContainer>
          <WidgetContainer title="Demands" icon={Users}>
            <p className="text-2xl font-semibold">{d.demandCount}</p>
          </WidgetContainer>
          <WidgetContainer title="Matches" icon={GitMerge}>
            <p className="text-2xl font-semibold">{d.matchCount}</p>
          </WidgetContainer>
          <WidgetContainer title="Ready to transact" icon={DollarSign}>
            <p className="text-2xl font-semibold">{d.transactionReady}</p>
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

          {tab === "workforce" && categoryPanel("Workforce marketplace", report.workforce)}
          {tab === "equipment" && categoryPanel("Equipment marketplace", report.equipment)}
          {tab === "training" && categoryPanel("Training marketplace", report.training)}
          {tab === "providers" && categoryPanel("Provider marketplace", report.providers)}
          {tab === "safety" && categoryPanel("Safety services", report.safetyServices)}
          {tab === "compliance" && categoryPanel("Compliance services", report.complianceServices)}
          {tab === "automation" && categoryPanel("Automation marketplace", report.automation)}

          {tab === "matching" && (
            <WidgetContainer title="Matching engine" icon={GitMerge}>
              <p className="text-sm">Avg score: {report.dashboard.avgMatchScore}</p>
              <ul className="text-sm mt-2 space-y-1">
                {report.matching.matches.slice(0, 8).map((m) => (
                  <li key={m.id}>
                    {m.category}: score {m.score} ({m.factors.slice(0, 3).join(", ")})
                  </li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "pricing" && (
            <WidgetContainer title="Pricing engine" icon={DollarSign}>
              <p className="text-sm">Dynamic multiplier: {report.pricing.dynamicMultiplier.toFixed(2)}x</p>
              <ul className="text-sm mt-2 space-y-1">
                {report.pricing.quotes.slice(0, 6).map((q) => (
                  <li key={q.id}>
                    {q.matchId}: ${q.basePrice} → ${q.adjustedPrice}
                  </li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "policies" && (
            <WidgetContainer title="Marketplace policies" icon={Gavel}>
              <ul className="text-sm space-y-1">
                {report.policies.map((p) => (
                  <li key={p.id} className={p.violation ? "text-red-700" : ""}>
                    [{p.domain}] {p.rule}
                    {p.violation ? " — VIOLATION" : ""}
                  </li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "reputation" && (
            <WidgetContainer title="Reputation scores" icon={Star}>
              <ul className="text-sm space-y-1">
                {report.reputation.slice(0, 10).map((r) => (
                  <li key={r.entityHash}>
                    {r.entityType}: {r.score} (reliability {r.reliability})
                  </li>
                ))}
              </ul>
            </WidgetContainer>
          )}

          {tab === "simulation" && (
            <WidgetContainer title="Market simulations" icon={LineChart}>
              <ul className="text-sm space-y-2">
                {report.simulations.map((s) => (
                  <li key={s.id}>
                    {s.scenario}: gap {s.gap} — {s.recommendation}
                  </li>
                ))}
              </ul>
            </WidgetContainer>
          )}
        </>
      )}
    </section>
  );
}
