import type { EntityTypeName, ScoreTypeName } from '../types';

export const SCORE_TYPE_TO_ENTITY: Record<ScoreTypeName, EntityTypeName> = {
  worker_safety: 'worker',
  equipment_safety: 'equipment',
  project_safety: 'project',
  company_safety: 'company',
  hazard_severity: 'hazard',
  control_strength: 'control',
  jha_quality: 'jha',
  inspection_quality: 'inspection',
  corrective_action_priority: 'corrective_action',
  emergency_readiness: 'emergency',
  access_compliance: 'access',
};

export const VALID_SCORE_TYPES = Object.keys(SCORE_TYPE_TO_ENTITY) as ScoreTypeName[];
