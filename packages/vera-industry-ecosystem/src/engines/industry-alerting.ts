import type { AlertSeverity, IndustryAlert, IndustryContextInput, IndustryPrediction, IndustryRisk } from "../types";

let alertId = 0;

export class IndustryAlertingEngine {
  generate(ctx: IndustryContextInput, prediction: IndustryPrediction, risk: IndustryRisk): IndustryAlert[] {
    const alerts: IndustryAlert[] = [];
    const now = new Date().toISOString();

    const push = (severity: AlertSeverity, domain: string, title: string, message: string) => {
      alertId += 1;
      alerts.push({ id: `ialert-${alertId}`, severity, domain, title, message, at: now });
    };

    for (const a of prediction.alerts) {
      push(risk.industryScore > 60 ? "high" : "medium", "prediction", "Industry forecast", a);
    }
    if (risk.industryScore > 70) {
      push("critical", "risk", "Industry risk threshold", `Industry risk score ${risk.industryScore}`);
    }
    if (risk.sifRisk > 50) {
      push("high", "safety", "SIF industry signal", "Elevated SIF risk across participating organizations");
    }
    if ((ctx.participants?.length ?? 0) > 1 && prediction.forecasts.some((f) => f.probability > 0.6)) {
      push("medium", "workforce", "High-probability forecast", "Multiple industry forecasts exceed 60% probability");
    }

    const rank: Record<AlertSeverity, number> = { critical: 4, high: 3, medium: 2, low: 1 };
    return alerts.sort((a, b) => rank[b.severity] - rank[a.severity]);
  }
}
