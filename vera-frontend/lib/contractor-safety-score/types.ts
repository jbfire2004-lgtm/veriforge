/**
 * Contractor Safety Score (CSS) — types.
 * Spec: docs/VERIFORGE-CONTRACTOR-SAFETY-SCORE.md
 */

export type ContractorGrade = "A" | "B" | "C" | "D";

export type ContractorScoreStatus =
  | "current"
  | "stale"
  | "insufficient_data"
  | "suspended";

export type PillarId =
  | "program_completeness"
  | "performance"
  | "responsiveness"
  | "training_competency"
  | "audit_inspection";

export type EvidenceType =
  | "policy_doc"
  | "procedure_doc"
  | "training_record"
  | "incident"
  | "near_miss"
  | "capa"
  | "inspection"
  | "audit"
  | "toolbox_talk"
  | "safety_meeting"
  | "permit_performance"
  | "metric";

export type PillarDto = {
  id: PillarId;
  label: string;
  score: number;
  weight: number;
  weightedContribution: number;
  formula: string;
  formulaId: string;
  inputs: Record<string, number | null>;
};

export type DataSource = {
  id: string;
  label: string;
  count?: number;
};

export type GateTriggered = {
  code: string;
  label: string;
  effect: string;
};

export type ScoreEvidence = {
  id: string;
  pillar: PillarId;
  evidenceType: EvidenceType;
  title: string;
  subtitle?: string;
  weightContribution?: number;
  metricKey?: string;
  metricValue?: number | null;
  documentId?: string;
  entityType?: string;
  entityId?: string;
  href?: string;
  status?: string;
  occurredAt?: string;
};

export type ContractorSafetyScoreDto = {
  id: string;
  primeCompanyId: number;
  contractorCompanyId: number;
  contractorName: string;
  projectId: number | null;
  scope: "prime_contractor" | "project_overlay";
  overallScore: number;
  grade: ContractorGrade;
  status: ContractorScoreStatus;
  pillars: Record<PillarId, PillarDto>;
  scoredAt: string;
  period: { start: string; end: string };
  dataSources: DataSource[];
  gatesTriggered: GateTriggered[];
  revision: number;
  href: string;
};

export type ScoreHistoryPoint = {
  id: string;
  overallScore: number;
  grade: ContractorGrade;
  pillars: Record<PillarId, number>;
  scoredAt: string;
  triggerEvent?: string;
};

export type RubricWeights = Record<PillarId, number>;

export const DEFAULT_WEIGHTS: RubricWeights = {
  program_completeness: 0.25,
  performance: 0.25,
  responsiveness: 0.2,
  training_competency: 0.2,
  audit_inspection: 0.1,
};

export const PILLAR_LABELS: Record<PillarId, string> = {
  program_completeness: "Program completeness",
  performance: "Incident performance",
  responsiveness: "Corrective action responsiveness",
  training_competency: "Training compliance",
  audit_inspection: "Audit performance",
};
