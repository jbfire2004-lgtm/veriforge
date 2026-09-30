"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndustryAlertingEngine = void 0;
let alertId = 0;
class IndustryAlertingEngine {
    generate(ctx, prediction, risk) {
        const alerts = [];
        const now = new Date().toISOString();
        const push = (severity, domain, title, message) => {
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
        const rank = { critical: 4, high: 3, medium: 2, low: 1 };
        return alerts.sort((a, b) => rank[b.severity] - rank[a.severity]);
    }
}
exports.IndustryAlertingEngine = IndustryAlertingEngine;
//# sourceMappingURL=industry-alerting.js.map