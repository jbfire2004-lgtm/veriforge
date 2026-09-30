import type { PvsProgramCategory } from '@prisma/client';

export type SafetyMatrixElementDef = {
  key: string;
  label: string;
  required: boolean;
};

export type ProgramCategoryDef = {
  category: PvsProgramCategory;
  label: string;
  description: string;
  /** Required for full PVS coverage score */
  required: boolean;
  elements: SafetyMatrixElementDef[];
};

/**
 * Safety matrix: program category → required elements.
 */
export const PVS_SAFETY_MATRIX: Record<PvsProgramCategory, ProgramCategoryDef> = {
  hazard_assessment: {
    category: 'hazard_assessment',
    label: 'Hazard assessment',
    description: 'Field-level hazard identification and control',
    required: true,
    elements: [
      { key: 'policy', label: 'Written hazard assessment policy', required: true },
      { key: 'forms', label: 'FLHA / JSA forms', required: true },
      { key: 'hierarchy', label: 'Hierarchy of controls referenced', required: true },
      { key: 'training', label: 'Worker training on hazard ID', required: true },
    ],
  },
  emergency_response: {
    category: 'emergency_response',
    label: 'Emergency response',
    description: 'Site emergency plans and drills',
    required: true,
    elements: [
      { key: 'plan', label: 'Written ERP', required: true },
      { key: 'contacts', label: 'Emergency contacts & muster', required: true },
      { key: 'drills', label: 'Drill schedule / records', required: false },
      { key: 'first_aid', label: 'First aid coverage', required: true },
    ],
  },
  incident_investigation: {
    category: 'incident_investigation',
    label: 'Incident investigation',
    description: 'Reporting and root-cause investigation',
    required: true,
    elements: [
      { key: 'policy', label: 'Investigation policy', required: true },
      { key: 'forms', label: 'Incident / near-miss forms', required: true },
      { key: 'corrective', label: 'Corrective action process', required: true },
    ],
  },
  ppe: {
    category: 'ppe',
    label: 'PPE',
    description: 'Personal protective equipment program',
    required: true,
    elements: [
      { key: 'policy', label: 'PPE policy', required: true },
      { key: 'matrix', label: 'Task–PPE matrix', required: true },
      { key: 'fit', label: 'Fit / inspection process', required: false },
    ],
  },
  working_at_heights: {
    category: 'working_at_heights',
    label: 'Working at heights',
    description: 'Fall protection program',
    required: false,
    elements: [
      { key: 'policy', label: 'Fall protection policy', required: true },
      { key: 'rescue', label: 'Rescue plan', required: true },
      { key: 'training', label: 'Competency / training records', required: true },
    ],
  },
  confined_space: {
    category: 'confined_space',
    label: 'Confined space',
    description: 'Entry permits and atmospheric monitoring',
    required: false,
    elements: [
      { key: 'policy', label: 'Confined space policy', required: true },
      { key: 'permit', label: 'Entry permit process', required: true },
      { key: 'rescue', label: 'Rescue capability', required: true },
    ],
  },
  lockout_tagout: {
    category: 'lockout_tagout',
    label: 'Lockout / tagout',
    description: 'Energy isolation program',
    required: false,
    elements: [
      { key: 'policy', label: 'LOTO policy', required: true },
      { key: 'devices', label: 'Device inventory', required: false },
      { key: 'training', label: 'Authorized worker training', required: true },
    ],
  },
  substance_abuse: {
    category: 'substance_abuse',
    label: 'Substance abuse',
    description: 'Drug & alcohol policy',
    required: true,
    elements: [
      { key: 'policy', label: 'Written D&A policy', required: true },
      { key: 'testing', label: 'Testing protocol (if applicable)', required: false },
      { key: 'awareness', label: 'Worker awareness', required: true },
    ],
  },
  orientation_training: {
    category: 'orientation_training',
    label: 'Orientation & training',
    description: 'New-hire and site orientation',
    required: true,
    elements: [
      { key: 'orientation', label: 'Orientation checklist', required: true },
      { key: 'records', label: 'Training records retention', required: true },
      { key: 'competency', label: 'Competency verification', required: true },
    ],
  },
  environmental: {
    category: 'environmental',
    label: 'Environmental',
    description: 'Spill response and environmental controls',
    required: false,
    elements: [
      { key: 'policy', label: 'Environmental policy', required: true },
      { key: 'spill', label: 'Spill response plan', required: true },
    ],
  },
  other: {
    category: 'other',
    label: 'Other program',
    description: 'Custom written program',
    required: false,
    elements: [
      { key: 'scope', label: 'Program scope defined', required: true },
      { key: 'owner', label: 'Program owner assigned', required: true },
      { key: 'review', label: 'Periodic review cadence', required: false },
    ],
  },
};

export const PVS_CATEGORIES = Object.keys(
  PVS_SAFETY_MATRIX,
) as PvsProgramCategory[];

export function getProgramCategoryDef(
  category: PvsProgramCategory,
): ProgramCategoryDef {
  return PVS_SAFETY_MATRIX[category];
}

export function requiredProgramCategories(): PvsProgramCategory[] {
  return PVS_CATEGORIES.filter((c) => PVS_SAFETY_MATRIX[c].required);
}
