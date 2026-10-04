export type JhaFlhaEngineEnvironment = {
  weather?: string;
  location?: string;
  confined_space?: boolean;
  heights?: boolean;
  traffic?: boolean;
  ground_conditions?: string;
  overhead_hazards?: boolean;
  underground_utilities?: boolean;
  [key: string]: unknown;
};

export type JhaFlhaEngineWorkforce = {
  crew_size?: number;
  experience_level?: 'new' | 'mixed' | 'experienced';
  subcontractors?: string[];
};

export type JhaFlhaEngineInput = {
  task_description: string;
  task_steps?: string[];
  environment?: JhaFlhaEngineEnvironment;
  equipment_and_tools?: string[];
  materials?: string[];
  workforce?: JhaFlhaEngineWorkforce;
  known_critical_risks?: string[];
  client_rules?: string[];
  org_standards?: string[];
  kind?: 'FLHA' | 'JHA';
  companyId?: number;
  projectId?: number;
};

export type JhaFlhaEngineHazard = {
  category: 'people' | 'equipment' | 'environment' | 'energy';
  description: string;
  sif_potential?: boolean;
};

export type JhaFlhaEngineControl = {
  hierarchy:
    | 'elimination'
    | 'substitution'
    | 'engineering'
    | 'administrative'
    | 'ppe';
  description: string;
  sif_verification?: boolean;
};

export type JhaFlhaEngineStep = {
  step: string;
  hazards: JhaFlhaEngineHazard[];
  controls: JhaFlhaEngineControl[];
  sif_potential?: boolean;
};

export type JhaFlhaEngineEnergySegment = {
  energy_type: string;
  description: string;
  failure_modes: string[];
  controls: string[];
};

export type JhaFlhaEngineOutput = {
  jha_steps: JhaFlhaEngineStep[];
  energy_wheel: JhaFlhaEngineEnergySegment[];
  field_summary: string;
  verification_questions: string[];
};
