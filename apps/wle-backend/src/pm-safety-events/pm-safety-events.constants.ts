import { PmSafetyEventType } from '@prisma/client';

export const DEFAULT_ROOT_CAUSES = [
  {
    code: 'inadequate_training',
    label: 'Inadequate training',
    category: 'human',
  },
  {
    code: 'procedure_not_followed',
    label: 'Procedure not followed',
    category: 'human',
  },
  {
    code: 'equipment_failure',
    label: 'Equipment failure',
    category: 'equipment',
  },
  { code: 'maintenance_gap', label: 'Maintenance gap', category: 'equipment' },
  {
    code: 'hazard_not_identified',
    label: 'Hazard not identified in planning',
    category: 'process',
  },
  {
    code: 'inadequate_controls',
    label: 'Inadequate controls',
    category: 'process',
  },
  {
    code: 'environmental_factor',
    label: 'Environmental factor',
    category: 'environment',
  },
];

export const DEFAULT_CONTRIBUTING_FACTORS = [
  { code: 'rushing', label: 'Rushing / time pressure', category: 'human' },
  { code: 'fatigue', label: 'Fatigue', category: 'human' },
  { code: 'weather', label: 'Weather', category: 'environment' },
  { code: 'poor_lighting', label: 'Poor lighting', category: 'environment' },
  { code: 'housekeeping', label: 'Poor housekeeping', category: 'environment' },
  {
    code: 'communication',
    label: 'Communication breakdown',
    category: 'process',
  },
];

export const EVENT_TYPE_KEYWORDS: Record<PmSafetyEventType, string[]> = {
  incident_injury: [
    'injury',
    'hurt',
    'cut',
    'fracture',
    'hospital',
    'first aid',
    'medical',
  ],
  incident_property: ['damage', 'property', 'structural', 'collision'],
  incident_environmental: [
    'spill',
    'release',
    'environmental',
    'contamination',
  ],
  incident_equipment: ['equipment damage', 'breakdown', 'failure'],
  near_miss: ['near miss', 'almost', 'close call', 'could have'],
  hazard_observation: ['hazard', 'unsafe condition', 'at risk'],
  positive_observation: [
    'positive',
    'good catch',
    'well done',
    'safe behavior',
  ],
  behavioral_observation: ['behavior', 'bbo', 'at-risk behavior'],
  equipment_failure: ['equipment failure', 'malfunction', 'lockout'],
  security_event: ['security', 'theft', 'trespass', 'unauthorized'],
  custom: [],
};

export const SEVERITY_MATRIX: Record<
  string,
  { severity: 'low' | 'medium' | 'high' | 'critical'; likelihood: number }
> = {
  '1-1': { severity: 'low', likelihood: 1 },
  '2-2': { severity: 'medium', likelihood: 2 },
  '3-3': { severity: 'high', likelihood: 3 },
  '4-5': { severity: 'critical', likelihood: 4 },
};
