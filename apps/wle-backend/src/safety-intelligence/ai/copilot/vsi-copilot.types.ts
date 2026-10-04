/** Vera Safety Intelligence — permanent Copilot engine contracts */

export const VSI_CAIL_SOURCE_TYPES = [
  'inspection',
  'bbo',
  'incident',
  'equipment',
  'jha',
  'flha',
  'heca',
  'sif',
  'training',
  'general',
] as const;

export type VsiCailSourceType = (typeof VSI_CAIL_SOURCE_TYPES)[number];

export type VsiCopilotModule =
  | 'inspection'
  | 'bbo'
  | 'incident'
  | 'equipment'
  | 'form_hazard'
  | 'sif_heca_assessment'
  | 'lessons_learned'
  | 'presentation'
  | 'predictive_risk'
  | 'cail_analyze';

export type VsiRiskCategory =
  | 'behavior'
  | 'equipment'
  | 'environment'
  | 'process'
  | 'ppe'
  | 'ergonomic'
  | 'other';

/** Unified CAIL intelligence envelope (written to CAIL JSON fields) */
export type CailIntelligenceEnvelope = {
  hazard_type: string;
  risk_category: VsiRiskCategory | string;
  severity_score: number;
  root_cause_category: string;
  root_cause_explanation: string;
  recommended_corrective_actions: string[];
  recommended_preventive_actions: string[];
  tags: string[];
  lessons_learned: string;
  predictive_risk_flags: string[];
};

export type InspectionCopilotOutput = {
  classification: 'safe' | 'at_risk';
  hazard_type: string;
  risk_category: VsiRiskCategory | string;
  severity_score: number;
  recommended_corrective_action: string;
  positive_observation?: string;
  tags: string[];
};

export type BboCopilotOutput = {
  behavior_type: string;
  classification: 'safe' | 'at_risk';
  root_cause_category: string;
  root_cause_explanation: string;
  recommended_actions: string[];
  positive_reinforcement?: string;
  tags: string[];
};

export type IncidentCopilotOutput = {
  root_cause_primary: string;
  root_cause_secondary: string;
  five_whys: string[];
  fishbone: {
    people: string[];
    equipment: string[];
    environment: string[];
    process: string[];
    materials: string[];
  };
  corrective_actions: string[];
  preventive_actions: string[];
  sif_potential: 'low' | 'medium' | 'high' | 'critical';
  lessons_learned: string;
  predictive_risk_flags: string[];
};

export type EquipmentCopilotOutput = {
  failure_mode: string;
  severity_score: number;
  risk_category: VsiRiskCategory | string;
  recommended_corrective_actions: string[];
  recommended_preventive_actions: string[];
  tags: string[];
};

export type FormHazardCopilotOutput = {
  hazard_type: string;
  missing_controls: string[];
  severity_score: number;
  root_cause_category: string;
  recommended_corrective_actions: string[];
  recommended_preventive_actions: string[];
  tags: string[];
};

/** SIF / HECA pre-work scope analysis — reverse-engineer hazards & controls from job scope */
export type SifHecaAssessmentCopilotOutput = {
  job_steps: string[];
  inferred_hazards: Array<{
    description: string;
    category: string;
    severity: number;
    likelihood: number;
    energy_types: string[];
    sif_indicator?: string;
    heca_category?: string;
    reason: string;
  }>;
  inferred_controls: Array<{
    description: string;
    control_type: string;
    linked_hazard: string;
    reason: string;
  }>;
  energy_types: string[];
  heca_assessment: {
    primary_category: string;
    primary_label: string;
    secondary_categories: string[];
    high_energy: boolean;
    narrative: string;
  };
  sif_protocol: {
    applies: boolean;
    category: 'low' | 'medium' | 'high' | 'critical';
    indicators: string[];
    narrative: string;
    requires_supervisor_review: boolean;
  };
  scope_fit_summary: string;
  warnings: string[];
};

export type LessonsLearnedCopilotOutput = {
  summary: string;
  what_went_wrong: string;
  what_fixed_it: string;
  how_to_prevent_recurrence: string;
  applicable_to: string[];
  recommended_training_topics: string[];
  recommended_toolbox_talk: string;
};

export type PresentationCopilotOutput = {
  executive_summary: string;
  key_trends: string[];
  top_risks: string[];
  positive_observations: string[];
  company_performance_summary: string;
  recommended_focus_areas: string[];
  recommended_training: string[];
  recommended_actions_next_30_days: string[];
};

export type PredictiveRiskCopilotOutput = {
  emerging_risks: string[];
  high_risk_companies: string[];
  high_risk_tasks: string[];
  high_risk_equipment: string[];
  recommended_preventive_actions: string[];
  early_warning_flags: string[];
};

export type CopilotRunRequest = {
  module: VsiCopilotModule;
  sourceType?: VsiCailSourceType;
  projectId?: number;
  companyId?: number;
  /** Set by controller from JWT — used for VeriAgent audit metadata. */
  actor?: {
    userId?: number;
    role?: string;
    companyId?: number;
  };
  context: Record<string, unknown>;
};

export type CopilotRunResponse = {
  module: VsiCopilotModule;
  engine: string[];
  output: unknown;
  cailEnvelope: CailIntelligenceEnvelope;
  generatedAt: string;
};
