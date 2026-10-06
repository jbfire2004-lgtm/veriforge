export type ChecklistTemplateInput = {
  items?: Array<{
    id: string;
    label: string;
    category?: string;
    type?: string;
    required?: boolean;
    weight?: number;
    critical?: boolean;
    energyType?: string;
  }>;
  categories?: string[];
  scoring_rules?: Record<string, unknown>;
};

export type InspectionResponse = {
  item_id: string;
  status: 'pass' | 'fail' | 'concern' | 'na' | string;
  comments?: string;
  photos_summaries?: string[];
};

export type PreviousAudit = {
  date?: string;
  failed_items?: string[];
  summary?: string;
};

export type AuditInspectionCapaEngineInput = {
  checklist_template: ChecklistTemplateInput;
  responses: InspectionResponse[];
  site_risk_profile?: string;
  previous_audits?: PreviousAudit[];
  org_standards?: string[];
  inspectionId?: string;
  projectId?: number;
  companyId?: number;
};

export type AuditFinding = {
  item_id: string;
  description: string;
  related_standard: string;
  risk_rating: {
    likelihood: number;
    consequence: number;
    score: number;
    level: 'low' | 'medium' | 'high' | 'critical';
  };
  sif_relevance: 'yes' | 'no';
  category?: string;
};

export type AuditCapaItem = {
  finding_ref: string;
  corrective_action: string;
  preventive_action?: string;
  responsible_role: string;
  due_date_priority: 'high' | 'medium' | 'low';
};

export type AuditTrend = {
  issue: string;
  recurrence_count: number;
  note: string;
};

export type AuditInspectionCapaEngineOutput = {
  findings: AuditFinding[];
  capa_list: AuditCapaItem[];
  executive_summary: string[];
  field_brief: string[];
  trends: AuditTrend[];
};
