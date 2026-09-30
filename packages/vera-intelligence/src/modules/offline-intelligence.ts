import type { IntelligenceBundle, IntelligenceContext } from "../types";
import { RiskEngine } from "../engines/risk-engine";
import { AutoClassificationEngine, AutoSummarizationEngine } from "../engines/auto-engines";
import { AnomalyDetectionEngine } from "../engines/anomaly-engine";

/** Lightweight intelligence for field/offline mode (no server round-trip required). */
export function analyzeOffline(ctx: IntelligenceContext & {
  qrPayload?: string;
  complianceOk?: boolean;
  readinessFactors?: { label: string; value: number }[];
}) {
  const risk = new RiskEngine();
  const classify = new AutoClassificationEngine();
  const summarize = new AutoSummarizationEngine();
  const anomaly = new AnomalyDetectionEngine();

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

export function mergeOfflineWithBundle(
  offline: ReturnType<typeof analyzeOffline>,
  bundle: IntelligenceBundle
): IntelligenceBundle {
  return {
    ...bundle,
    anomalies: [...bundle.anomalies, ...offline.anomalies],
    recommendations: bundle.recommendations,
  };
}
