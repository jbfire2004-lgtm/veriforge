import type { EntityTypeName, RecommendationTypeName } from '../types';

export const VALID_RECOMMENDATION_TYPES: RecommendationTypeName[] = [
  'control',
  'training',
  'corrective_action',
  'equipment_maintenance',
  'jha_improvement',
  'inspection_focus',
  'pm_schedule_adjustment',
];

export const RECOMMENDATION_TO_ENTITY: Record<RecommendationTypeName, EntityTypeName> = {
  control: 'hazard',
  training: 'worker',
  corrective_action: 'corrective_action',
  equipment_maintenance: 'equipment',
  jha_improvement: 'jha',
  inspection_focus: 'inspection',
  pm_schedule_adjustment: 'schedule',
};

export const ENTITY_TYPES: EntityTypeName[] = [
  'worker',
  'equipment',
  'project',
  'company',
  'hazard',
  'control',
  'jha',
  'inspection',
  'corrective_action',
  'schedule',
];
