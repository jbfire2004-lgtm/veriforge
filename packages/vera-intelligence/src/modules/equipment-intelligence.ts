import type { EquipmentIntelInput } from "../types";
import { PredictiveEngine } from "../engines/predictive-engine";
import { RiskEngine } from "../engines/risk-engine";
import { AutoSummarizationEngine } from "../engines/auto-engines";
import { RecommendationEngine } from "../engines/recommendation-engine";
import { AnomalyDetectionEngine } from "../engines/anomaly-engine";

export function analyzeEquipment(
  input: EquipmentIntelInput,
  engines: {
    predictive: PredictiveEngine;
    risk: RiskEngine;
    summarize: AutoSummarizationEngine;
    recommend: RecommendationEngine;
    anomaly: AnomalyDetectionEngine;
  }
) {
  const lockoutRisk = engines.risk.score([
    { id: "locked", label: "Currently locked out", weight: 40, value: input.lockedOut ? 95 : 0 },
    { id: "failures", label: "Failed inspections", weight: 30, value: Math.min(100, input.failedInspections * 25) },
    { id: "overdue", label: "Overdue inspection", weight: 30, value: input.overdueInspection ? 80 : 0 },
  ]);

  const readiness = engines.risk.toReadiness(lockoutRisk);
  const inspectionFailure = engines.predictive.forecastFailure(
    input.id,
    "Inspection failure",
    input.failedInspections / Math.max(1, input.failedInspections + 5)
  );
  const maintenanceDue = engines.predictive.forecastExpiry(
    input.id,
    input.name,
    input.daysToInspection,
    [7, 14, 30]
  );

  if (input.lockoutCount >= 2) {
    engines.anomaly.report({
      module: "equipment",
      code: "REPEATED_LOCKOUT",
      message: `Repeated lockouts on ${input.name}`,
      severity: "critical",
      entityType: "equipment",
      entityId: input.id,
    });
  }
  if (input.usageAnomaly) {
    engines.anomaly.report({
      module: "equipment",
      code: "USAGE_ANOMALY",
      message: `Abnormal usage pattern on ${input.name}`,
      severity: "medium",
      entityId: input.id,
    });
  }
  if (input.overdueInspection) {
    engines.recommend.suggest({
      module: "equipment",
      title: "Complete overdue inspection",
      description: input.name,
      actionType: "inspection.submit",
      priority: 95,
      entityId: input.id,
    });
  }

  return {
    id: input.id,
    name: input.name,
    lockoutRisk,
    readiness,
    inspectionFailure,
    maintenanceSchedule: maintenanceDue,
    overdueInspection: input.overdueInspection,
    competencyGaps: input.competencyGaps,
    summary: engines.summarize.summarize(`Equipment ${input.name}`, [
      `Readiness ${readiness.score}/100`,
      input.lockedOut ? "LOCKED OUT" : "Operational",
      input.overdueInspection ? "Inspection overdue" : "Inspections current",
    ]),
    suggestedMaintenance: input.overdueInspection ? ["Schedule inspection", "Verify competency"] : [],
  };
}
