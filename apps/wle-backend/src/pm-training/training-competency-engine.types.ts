export type WorkerProfile = {
  role?: string;
  trade?: string;
  experience_years?: number;
  certifications?: string[];
  past_incidents?: Array<{ date?: string; type?: string; summary?: string }>;
};

export type TrainingRecord = {
  course: string;
  date?: string;
  expiry?: string;
  provider?: string;
  status?: 'valid' | 'expired' | 'missing' | string;
};

export type MatrixRequirement = {
  role?: string;
  task?: string;
  required_courses: string[];
  frequency?: string;
};

export type ProjectScope = {
  tasks?: string[];
  equipment?: string[];
  critical_risks?: string[];
};

export type TrainingCompetencyEngineInput = {
  worker_profile: WorkerProfile;
  current_training_records?: TrainingRecord[];
  required_training_matrix?: MatrixRequirement[];
  project_scope: ProjectScope;
  client_additional_training_requirements?: string[];
  workerId?: number;
  companyId?: number;
  projectId?: number;
};

export type TrainingGap = {
  course: string;
  linked_task?: string;
  linked_risk?: string;
  status: 'missing' | 'expired';
  priority_score: number;
  priority_tier: 'immediate' | 'short_term' | 'development';
  drivers: string[];
  remediation: string;
};

export type TrainingPlanItem = {
  course: string;
  reason: string;
  due_window: string;
  priority: 'high' | 'medium' | 'low';
};

export type PrioritizedTrainingPlan = {
  immediate_required_training: TrainingPlanItem[];
  short_term_training: TrainingPlanItem[];
  development_training: TrainingPlanItem[];
};

export type TrainingCompetencyEngineOutput = {
  gaps: TrainingGap[];
  prioritized_training_plan: PrioritizedTrainingPlan;
  field_summary: string;
};
