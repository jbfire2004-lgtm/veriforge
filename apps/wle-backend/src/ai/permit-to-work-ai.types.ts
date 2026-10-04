export type PermitToWorkStatus =
  | 'APPROVED'
  | 'CONDITIONAL'
  | 'REJECTED'
  | 'PENDING';

export type PermitRequiredDocument = {
  document: string;
  status: 'present' | 'missing' | 'expired' | 'required';
  reason: string;
};

export type PermitConflict = {
  code: string;
  severity: 'critical' | 'warning' | 'info';
  description: string;
  mitigation?: string;
};

export type PermitRecommendedControl = {
  hierarchy:
    | 'elimination'
    | 'substitution'
    | 'engineering'
    | 'administrative'
    | 'ppe';
  description: string;
  reason: string;
  mandatory: boolean;
};

export type PermitToWorkAiInput = {
  companyId: number;
  projectId: number;
  permitType: string;
  jobScope: string;
  workerId?: number;
  equipmentIds?: number[];
  locationNote?: string;
  weatherNote?: string;
  fieldValues?: Record<string, unknown>;
  attendantAssigned?: boolean;
  jhaFlhaId?: string;
};

/** Core JSON contract for Permit-to-Work AI evaluation. */
export type PermitToWorkAiJson = {
  permit_type: string;
  required_documents: PermitRequiredDocument[];
  conflicts_detected: PermitConflict[];
  recommended_controls: PermitRecommendedControl[];
  final_permit_status: PermitToWorkStatus;
};

export type WorkerQualificationSummary = {
  worker_id?: number;
  worker_name?: string;
  training_valid: boolean;
  project_ready: boolean;
  blocking_items: string[];
};

export type PermitToWorkAiResult = PermitToWorkAiJson & {
  evaluation_id: string;
  worker_qualification: WorkerQualificationSummary;
  high_risk_flags: string[];
  field_summary: string;
  source: 'rule_engine';
  model: null;
};
