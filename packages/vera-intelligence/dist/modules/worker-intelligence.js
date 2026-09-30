"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeWorker = analyzeWorker;
function analyzeWorker(input, engines) {
    const complianceRisk = engines.risk.score([
        { id: "nonCompliant", label: "Non-compliant", weight: 35, value: input.isCompliant ? 0 : 90 },
        { id: "expired", label: "Expired training", weight: 25, value: Math.min(100, input.expiredTraining * 30) },
        { id: "expiring", label: "Expiring soon", weight: 20, value: input.expiringSoon ? 55 : 0 },
        { id: "failures", label: "Failures", weight: 20, value: Math.min(100, input.failedInspections * 20) },
    ]);
    const readiness = engines.risk.toReadiness(complianceRisk);
    const expiryForecast = engines.predictive.forecastExpiry(input.id, input.name, input.daysToNextExpiry);
    if (input.recentComplianceDrop) {
        engines.anomaly.report({
            module: "worker",
            code: "COMPLIANCE_DROP",
            message: `Sudden compliance drop detected for ${input.name}`,
            severity: "high",
            entityType: "worker",
            entityId: input.id,
        });
    }
    if ((input.repeatedFailures ?? 0) >= 2) {
        engines.anomaly.report({
            module: "worker",
            code: "REPEATED_FAILURES",
            message: `Repeated failures for ${input.name}`,
            severity: "high",
            entityType: "worker",
            entityId: input.id,
        });
    }
    if (input.trainingMismatch) {
        engines.recommend.suggest({
            module: "worker",
            title: "Resolve training mismatch",
            description: `Reconcile training records for ${input.name}`,
            actionType: "worker.trainingReview",
            actionHref: `/admin/workers/${input.id}?tab=training`,
            entityType: "worker",
            entityId: input.id,
            priority: 85,
        });
    }
    if (!input.isCompliant) {
        engines.recommend.suggest({
            module: "worker",
            title: "Restore compliance",
            description: `Upload missing training for ${input.name}`,
            actionType: "training.upload",
            priority: 90,
            entityId: input.id,
        });
    }
    const skillGaps = input.competencyGaps + input.expiredTraining;
    const summary = engines.summarize.summarize(`Worker ${input.name}`, [
        `Readiness ${readiness.score}/100`,
        `Compliance risk ${complianceRisk.level}`,
        skillGaps ? `${skillGaps} skill gaps` : "No skill gaps",
    ]);
    return {
        id: input.id,
        name: input.name,
        complianceRisk,
        readiness,
        expiryForecast,
        skillGaps,
        missingTraining: input.expiredTraining > 0,
        summary,
        suggestedTraining: skillGaps > 0 ? ["WHMIS refresh", "Site-specific orientation"] : [],
        suggestedProjects: input.isCompliant ? input.projectIds ?? [] : [],
    };
}
//# sourceMappingURL=worker-intelligence.js.map