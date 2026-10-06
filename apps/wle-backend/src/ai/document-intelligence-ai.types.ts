export type DocumentIntelligenceType =
  | 'training_certificate'
  | 'training_proof'
  | 'permit'
  | 'inspection'
  | 'insurance'
  | 'wcb_clearance'
  | 'sds'
  | 'policy'
  | 'safety_program'
  | 'jha_flha'
  | 'sif_heca'
  | 'incident_report'
  | 'equipment_manual'
  | 'other';

export type DocumentIntelligenceMetadata = {
  worker_name?: string;
  company?: string;
  training_type?: string;
  certification_code?: string;
  issue_date?: string;
  expiry_date?: string;
  provider?: string;
  certificate_number?: string;
  product_name?: string;
  policy_type?: string;
  permit_type?: string;
  file_name?: string;
  mime_type?: string;
};

export type DocumentAutoLink = {
  entity_type:
    | 'worker'
    | 'training_record'
    | 'project'
    | 'jha_flha'
    | 'company'
    | 'sds'
    | 'permit'
    | 'certification';
  entity_id: string | number;
  label: string;
  confidence: number;
  method: string;
};

export type DocumentRecommendedAction = {
  action: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
};

export type AuthenticityIndicator = {
  signal: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
};

export type DocumentIntelligenceAiInput = {
  documentId?: number;
  ocrText?: string;
  fileName?: string;
  mimeType?: string;
  companyId?: number;
  projectId?: number;
  workerId?: number;
  hints?: Partial<DocumentIntelligenceMetadata>;
};

/** Core JSON contract for document intelligence. */
export type DocumentIntelligenceAiJson = {
  document_type: DocumentIntelligenceType;
  metadata: DocumentIntelligenceMetadata;
  authenticity_score: number;
  auto_links: DocumentAutoLink[];
  recommended_actions: DocumentRecommendedAction[];
};

export type DocumentIntelligenceAiResult = DocumentIntelligenceAiJson & {
  intelligence_id: string;
  confidence_score: number;
  authenticity_indicators: AuthenticityIndicator[];
  field_summary: string;
  source: 'rule_engine';
  model: null;
  document_id?: number;
};
