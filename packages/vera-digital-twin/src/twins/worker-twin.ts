import type { WorkerTwinState } from "../types";
import { scoreFromFactors, readinessFromRisk } from "../engines/scoring";
import { PredictiveStateEngine } from "../engines/predictive-state-engine";

export type WorkerTwinInput = {
  id: string;
  name: string;
  companyId?: string;
  unionHallId?: string;
  projectIds?: string[];
  isCompliant?: boolean;
  expiringSoon?: boolean;
  expiredCount?: number;
  competencyGaps?: number;
  dispatchStatus?: WorkerTwinState["dispatchStatus"];
  walletItems?: number;
  visionDocs?: number;
  daysToExpiry?: number;
};

export function buildWorkerTwin(input: WorkerTwinInput): WorkerTwinState {
  const predictive = new PredictiveStateEngine();
  const risk = scoreFromFactors([
    { weight: 40, value: input.isCompliant ? 10 : 85 },
    { weight: 25, value: Math.min(100, (input.expiredCount ?? 0) * 30) },
    { weight: 20, value: input.expiringSoon ? 55 : 5 },
    { weight: 15, value: Math.min(100, (input.competencyGaps ?? 0) * 20) },
  ]);
  const compliance = scoreFromFactors([
    { weight: 100, value: input.isCompliant ? 95 : 30 },
  ]);
  const readiness = readinessFromRisk(risk.score);

  return {
    id: input.id,
    type: "worker",
    name: input.name,
    updatedAt: new Date().toISOString(),
    companyId: input.companyId,
    unionHallId: input.unionHallId,
    projectIds: input.projectIds ?? [],
    trainingCount: 0,
    expiringTraining: input.expiringSoon ? 1 : 0,
    competencyGaps: input.competencyGaps ?? 0,
    dispatchStatus: input.dispatchStatus ?? "available",
    walletItemCount: input.walletItems ?? 0,
    visionDocuments: input.visionDocs ?? 0,
    compliance,
    risk,
    readiness,
    predictions: [
      ...predictive.forecastExpiry(input.id, "Training", input.daysToExpiry),
      predictive.forecastFailure(input.id, "Compliance failure", input.isCompliant ? 0.1 : 0.65),
    ],
    offline: { pending: false, queuedEvents: 0 },
    timeline: [
      {
        id: "tl_init",
        at: new Date().toISOString(),
        event: "twin.created",
        summary: `Worker twin initialized for ${input.name}`,
      },
    ],
  };
}
