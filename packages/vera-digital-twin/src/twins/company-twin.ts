import type { CompanyTwinState } from "../types";
import { scoreFromFactors, readinessFromRisk } from "../engines/scoring";
import { PredictiveStateEngine } from "../engines/predictive-state-engine";

export type CompanyTwinInput = {
  id: string;
  name: string;
  complianceRate?: number;
  workerCount?: number;
  equipmentCount?: number;
  projectCount?: number;
  providerCount?: number;
  unionHallIds?: string[];
};

export function buildCompanyTwin(input: CompanyTwinInput): CompanyTwinState {
  const predictive = new PredictiveStateEngine();
  const rate = input.complianceRate ?? 80;
  const risk = scoreFromFactors([{ weight: 100, value: 100 - rate }]);
  const compliance = scoreFromFactors([{ weight: 100, value: rate }]);
  const readiness = readinessFromRisk(risk.score);

  return {
    id: input.id,
    type: "company",
    name: input.name,
    updatedAt: new Date().toISOString(),
    workerCount: input.workerCount ?? 0,
    equipmentCount: input.equipmentCount ?? 0,
    projectCount: input.projectCount ?? 0,
    providerCount: input.providerCount ?? 0,
    unionHallIds: input.unionHallIds ?? [],
    compliance,
    risk,
    readiness,
    predictions: [
      predictive.forecastFailure(input.id, "Compliance decline", (100 - rate) / 100),
    ],
    offline: { pending: false, queuedEvents: 0 },
    timeline: [
      {
        id: "tl_init",
        at: new Date().toISOString(),
        event: "twin.created",
        summary: `Company twin initialized for ${input.name}`,
      },
    ],
  };
}
