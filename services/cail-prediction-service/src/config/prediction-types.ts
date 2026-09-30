import type { EntityTypeName, PredictionTypeName } from '../types';

export const VALID_PREDICTION_TYPES: PredictionTypeName[] = [
  'incident_likelihood',
  'equipment_failure',
  'hazard_emergence',
  'sif_heca_potential',
  'training_lapse',
  'capa_overdue',
  'access_denial',
  'emergency_likelihood',
];

export const PREDICTION_TO_ENTITY: Record<PredictionTypeName, EntityTypeName> = {
  incident_likelihood: 'worker',
  equipment_failure: 'equipment',
  hazard_emergence: 'hazard',
  sif_heca_potential: 'hazard',
  training_lapse: 'worker',
  capa_overdue: 'corrective_action',
  access_denial: 'access',
  emergency_likelihood: 'project',
};

export const PREDICTION_TO_MODULE: Record<PredictionTypeName, string> = {
  incident_likelihood: 'incidents',
  equipment_failure: 'equipment',
  hazard_emergence: 'hazard_control',
  sif_heca_potential: 'sif_heca',
  training_lapse: 'training',
  capa_overdue: 'corrective_action',
  access_denial: 'site_access',
  emergency_likelihood: 'emergency',
};

export const ENTITY_TYPES: EntityTypeName[] = [
  'worker',
  'equipment',
  'project',
  'company',
  'hazard',
  'corrective_action',
  'access',
  'emergency',
  'training',
];
