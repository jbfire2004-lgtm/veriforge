import type { AlertSeverity, GlobalAlert, NetworkContextInput } from "../types";
import type { GlobalHazardIntelligence } from "../types";
import type { GlobalSafetyIntelligence } from "../types";

let alertId = 0;

export class GlobalAlertingEngine {
  generate(
    ctx: NetworkContextInput,
    hazards: GlobalHazardIntelligence,
    safety: GlobalSafetyIntelligence
  ): GlobalAlert[] {
    const alerts: GlobalAlert[] = [];
    const now = new Date().toISOString();

    const push = (
      severity: GlobalAlert["severity"],
      domain: string,
      title: string,
      message: string
    ) => {
      alertId += 1;
      alerts.push({ id: `galert-${alertId}`, severity, domain, title, message, at: now });
    };

    for (const a of hazards.alerts) {
      push(safety.globalRiskScore > 60 ? "high" : "medium", "hazard", "Global hazard", a);
    }
    if (safety.globalRiskScore > 70) {
      push("critical", "safety", "Network safety threshold", `Global risk score ${safety.globalRiskScore}`);
    }
    if ((ctx.companies?.length ?? 0) > 1 && safety.sifPrediction > 0.5) {
      push("high", "safety", "SIF network signal", "Elevated SIF probability across network");
    }

    const complianceGaps = (ctx.companies ?? []).reduce((s, c) => s + (c.nonCompliantWorkers ?? 0), 0);
    if (complianceGaps > 20) {
      push("medium", "compliance", "Compliance drift", `${complianceGaps} workers below threshold network-wide`);
    }

    const rank: Record<AlertSeverity, number> = { critical: 4, high: 3, medium: 2, low: 1 };
    return alerts.sort((a, b) => rank[b.severity] - rank[a.severity]);
  }
}
