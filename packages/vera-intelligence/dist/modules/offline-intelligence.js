"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeOffline = analyzeOffline;
exports.mergeOfflineWithBundle = mergeOfflineWithBundle;
const risk_engine_1 = require("../engines/risk-engine");
const auto_engines_1 = require("../engines/auto-engines");
const anomaly_engine_1 = require("../engines/anomaly-engine");
/** Lightweight intelligence for field/offline mode (no server round-trip required). */
function analyzeOffline(ctx) {
    const risk = new risk_engine_1.RiskEngine();
    const classify = new auto_engines_1.AutoClassificationEngine();
    const summarize = new auto_engines_1.AutoSummarizationEngine();
    const anomaly = new anomaly_engine_1.AnomalyDetectionEngine();
    const readiness = ctx.readinessFactors?.length
        ? risk.score(ctx.readinessFactors.map((f, i) => ({ id: `f${i}`, label: f.label, weight: 1, value: f.value })))
        : risk.readinessScore({
            compliant: ctx.complianceOk ?? false,
            gaps: 0,
            expiringSoon: false,
            failures: 0,
        });
    if (!ctx.complianceOk) {
        anomaly.report({
            module: "offline",
            code: "OFFLINE_COMPLIANCE_FAIL",
            message: "Offline compliance check failed",
            severity: "high",
        });
    }
    return {
        qrIntelligence: ctx.qrPayload ? { payload: ctx.qrPayload, verified: true } : null,
        complianceCheck: { ok: ctx.complianceOk ?? false },
        riskScore: readiness,
        readiness,
        anomalies: anomaly.getAll(),
        summary: summarize.summarize("Offline snapshot", [
            `Readiness ${readiness.score}/100`,
            ctx.complianceOk ? "Compliant" : "Non-compliant",
        ]),
        classification: ctx.qrPayload
            ? classify.classifyTraining({ id: "qr", title: ctx.qrPayload, isValid: true })
            : undefined,
    };
}
function mergeOfflineWithBundle(offline, bundle) {
    return {
        ...bundle,
        anomalies: [...bundle.anomalies, ...offline.anomalies],
        recommendations: bundle.recommendations,
    };
}
//# sourceMappingURL=offline-intelligence.js.map