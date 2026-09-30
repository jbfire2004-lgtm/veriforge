export interface AuthJwtPayload {
  user_id: string;
  company_id: string;
  email?: string;
  roles?: string[];
}

export const SCORE_TYPES = [
  'worker_safety',
  'equipment_safety',
  'project_safety',
  'company_safety',
  'hazard_severity',
  'control_strength',
  'jha_quality',
  'inspection_quality',
  'corrective_action_priority',
  'emergency_readiness',
  'access_compliance',
] as const;

export type ScoreTypeName = (typeof SCORE_TYPES)[number];

export const ENTITY_TYPES = [
  'worker',
  'equipment',
  'project',
  'company',
  'hazard',
  'control',
  'jha',
  'inspection',
  'corrective_action',
  'emergency',
  'access',
] as const;

export type EntityTypeName = (typeof ENTITY_TYPES)[number];

export interface ScoreComponent {
  key: string;
  weight: number;
  value: number;
  deduction: number;
}

export interface ScoreResult {
  score: number;
  maxScore: number;
  components: ScoreComponent[];
}

export interface ScoreSignals {
  profileScore?: number;
  overdueCapa?: number;
  denials30d?: number;
  sifExposures?: number;
  safetyStatus?: string;
  lockoutStatus?: string;
  openCapa?: number;
  failures90d?: number;
  criticalHazards?: number;
  openIncidents?: number;
  closureRate?: number;
  projectScores?: number[];
  severity?: number;
  sifPotential?: boolean;
  controlCount?: number;
  effectiveness?: number;
  mapped?: boolean;
  verified?: boolean;
  signatureCompleteness?: number;
  hazardCoverage?: number;
  supervisorReview?: boolean;
  deficiencyCount?: number;
  repeatFindings?: number;
  capaSeverity?: number;
  daysOpen?: number;
  escalationLevel?: number;
  planCompleteness?: number;
  drillRecencyDays?: number;
  activeEmergencies?: number;
  grantRate?: number;
  denialRate?: number;
  overdueTraining?: number;
}

export interface ScoreRequest {
  companyId: string;
  scoreType: ScoreTypeName;
  entityType: EntityTypeName;
  entityId: string;
  projectId?: string;
  workerId?: string;
  equipmentId?: string;
  signals?: ScoreSignals;
}

export interface ScoreRecord {
  id: string;
  companyId: string;
  projectId: string | null;
  workerId: string | null;
  equipmentId: string | null;
  entityType: string;
  entityId: string;
  scoreType: string;
  scoreValue: number;
  contributingFactors: {
    components: ScoreComponent[];
    maxScore: number;
  };
  createdAt: string;
}
