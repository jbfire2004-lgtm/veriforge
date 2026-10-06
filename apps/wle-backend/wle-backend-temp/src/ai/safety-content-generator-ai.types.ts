export type SafetyContentType =
  | 'jha_template'
  | 'flha_template'
  | 'sif_heca_template'
  | 'toolbox_talk'
  | 'site_orientation'
  | 'sop'
  | 'emergency_response_plan';

export type SafetyContentHazard = {
  category: string;
  description: string;
  sif_potential: boolean;
};

export type SafetyContentControl = {
  hierarchy:
    | 'elimination'
    | 'substitution'
    | 'engineering'
    | 'administrative'
    | 'ppe';
  description: string;
  linked_hazard: string;
};

export type SafetyContentEvidencePlaceholder = {
  field: string;
  label: string;
  type: 'signature' | 'photo' | 'document' | 'checklist' | 'datetime' | 'text';
  required: boolean;
};

export type SafetyContentSection = {
  id: string;
  title: string;
  body: string;
  hazards?: SafetyContentHazard[];
  controls?: SafetyContentControl[];
  required_training?: string[];
  evidence_placeholders?: SafetyContentEvidencePlaceholder[];
};

export type SafetyContentGenerated = {
  content_type: SafetyContentType;
  title: string;
  summary: string;
  sections: SafetyContentSection[];
  hazards: SafetyContentHazard[];
  controls: SafetyContentControl[];
  required_training: string[];
  evidence_placeholders: SafetyContentEvidencePlaceholder[];
  metadata: {
    task?: string;
    trade?: string;
    industry?: string;
    company_id?: number;
    project_id?: number;
  };
};

export type SafetyContentGeneratorInput = {
  contentType: SafetyContentType;
  task: string;
  companyId: number;
  projectId?: number;
  trade?: string;
  industry?: string;
  locationNote?: string;
  equipment?: string[];
  environment?: Record<string, unknown>;
  knownCriticalRisks?: string[];
  audience?: string;
};

export type SafetyContentGeneratorResult = {
  content: SafetyContentGenerated;
  human_readable: string;
  generation_id: string;
  source: 'rule_engine';
  model: null;
};
