import type { EquipmentTwinState } from "../types";
import { scoreFromFactors, readinessFromRisk } from "../engines/scoring";
import { PredictiveStateEngine } from "../engines/predictive-state-engine";

export type EquipmentTwinInput = {
  id: string;
  name: string;
  companyId?: string;
  projectIds?: string[];
  lockedOut?: boolean;
  overdueInspection?: boolean;
  failedInspections?: number;
  competencyRequired?: boolean;
  visionPlates?: number;
};

export function buildEquipmentTwin(input: EquipmentTwinInput): EquipmentTwinState {
  const predictive = new PredictiveStateEngine();
  const risk = scoreFromFactors([
    { weight: 45, value: input.lockedOut ? 95 : 10 },
    { weight: 35, value: input.overdueInspection ? 80 : 5 },
    { weight: 20, value: Math.min(100, (input.failedInspections ?? 0) * 25) },
  ]);
  const compliance = scoreFromFactors([
    { weight: 100, value: input.lockedOut || input.overdueInspection ? 25 : 90 },
  ]);
  const readiness = readinessFromRisk(risk.score);

  return {
    id: input.id,
    type: "equipment",
    name: input.name,
    updatedAt: new Date().toISOString(),
    companyId: input.companyId,
    projectIds: input.projectIds ?? [],
    lockedOut: input.lockedOut ?? false,
    overdueInspection: input.overdueInspection ?? false,
    inspectionCount: 0,
    competencyRequired: input.competencyRequired ?? false,
    visionPlates: input.visionPlates ?? 0,
    compliance,
    risk,
    readiness,
    predictions: [
      predictive.forecastFailure(
        input.id,
        "Inspection failure",
        (input.failedInspections ?? 0) / 10
      ),
      predictive.forecastFailure(
        input.id,
        "Lockout trigger",
        input.lockedOut ? 0.9 : 0.15
      ),
    ],
    offline: { pending: false, queuedEvents: 0 },
    timeline: [
      {
        id: "tl_init",
        at: new Date().toISOString(),
        event: "twin.created",
        summary: `Equipment twin initialized for ${input.name}`,
      },
    ],
  };
}
