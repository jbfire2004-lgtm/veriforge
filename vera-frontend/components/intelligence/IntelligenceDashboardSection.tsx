"use client";

import { useIntelligenceBundle } from "@/lib/intelligence";
import { AskVeraPanel } from "./AskVeraPanel";
import {
  AnomalyDetectionPanel,
  PredictiveCompliancePanel,
  PredictiveRiskPanel,
  SmartRecommendationsPanel,
} from "./widgets/IntelligenceWidgetPanels";

type Props = {
  role: string | null;
  companyId?: number;
};

export function IntelligenceDashboardSection({ role, companyId }: Props) {
  const { bundle, loading } = useIntelligenceBundle({ companyId }, !!companyId);

  if (!companyId) {
    return (
      <section className="space-y-4">
        <AskVeraPanel />
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-vera-charcoal">Intelligence</h2>
      {loading && (
        <p className="text-sm text-vera-muted">Loading predictive insights…</p>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <PredictiveCompliancePanel bundle={bundle} role={role} />
        <PredictiveRiskPanel bundle={bundle} role={role} />
        <SmartRecommendationsPanel bundle={bundle} role={role} />
        <AnomalyDetectionPanel bundle={bundle} role={role} />
      </div>
      <AskVeraPanel companyId={companyId} />
    </section>
  );
}
