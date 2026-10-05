import {
  PmInspectionScoringMode,
  PmInspectionTemplateCategory,
} from '@prisma/client';

export type ShowIfCondition =
  | { itemId: string; equals: unknown }
  | { all: ShowIfCondition[] }
  | { any: ShowIfCondition[] };

export type ChecklistItemDef = {
  id: string;
  label: string;
  type: 'pass_fail' | 'numeric' | 'text' | 'select' | 'photo';
  required?: boolean;
  weight?: number;
  /** When true, a failed answer escalates to critical deficiency severity. */
  critical?: boolean;
  failValues?: unknown[];
  showIf?: ShowIfCondition;
  options?: string[];
  energyType?: string;
  controlHierarchy?: string;
};

export const DEFAULT_PM_TEMPLATES: Array<{
  name: string;
  category: PmInspectionTemplateCategory;
  scoringMode: PmInspectionScoringMode;
  equipmentTypeKeys?: string[];
  items: ChecklistItemDef[];
}> = [
  {
    name: 'PME — Pre-use inspection',
    category: 'PME',
    scoringMode: 'weighted',
    equipmentTypeKeys: ['pme', 'mobile_equipment'],
    items: [
      {
        id: 'walkaround',
        label: 'Visual walk-around complete',
        type: 'pass_fail',
        required: true,
        weight: 10,
      },
      {
        id: 'guards',
        label: 'Guards and shields in place',
        type: 'pass_fail',
        required: true,
        weight: 15,
        energyType: 'mechanical',
      },
      {
        id: 'hydraulic',
        label: 'Hydraulic / fluid leaks none observed',
        type: 'pass_fail',
        required: true,
        weight: 15,
        energyType: 'hydraulic',
      },
      {
        id: 'controls',
        label: 'Operational controls responsive',
        type: 'pass_fail',
        required: true,
        weight: 20,
      },
      {
        id: 'fire_ext',
        label: 'Fire extinguisher present & charged',
        type: 'pass_fail',
        weight: 10,
      },
      {
        id: 'operator_competency',
        label: 'Operator competency verified',
        type: 'pass_fail',
        required: true,
        weight: 15,
      },
      { id: 'notes', label: 'Additional notes', type: 'text', required: false },
      {
        id: 'photo_evidence',
        label: 'Equipment photo',
        type: 'photo',
        required: false,
      },
    ],
  },
  {
    name: 'Crane / lifting — Daily',
    category: 'CRANE',
    scoringMode: 'weighted',
    items: [
      {
        id: 'wire_rope',
        label: 'Wire rope condition acceptable',
        type: 'pass_fail',
        required: true,
        weight: 20,
        energyType: 'gravitational',
      },
      {
        id: 'hooks',
        label: 'Hooks, latches, swivels OK',
        type: 'pass_fail',
        required: true,
        weight: 15,
      },
      {
        id: 'outriggers',
        label: 'Outriggers / cribbing per lift plan',
        type: 'pass_fail',
        required: true,
        weight: 15,
      },
      {
        id: 'zone',
        label: 'Lift zone barricaded',
        type: 'pass_fail',
        required: true,
        weight: 15,
      },
      {
        id: 'operator_cert',
        label: 'Operator certification current',
        type: 'pass_fail',
        required: true,
        weight: 20,
      },
      {
        id: 'wind',
        label: 'Wind within limits',
        type: 'pass_fail',
        weight: 10,
      },
      { id: 'notes', label: 'Notes', type: 'text' },
    ],
  },
  {
    name: 'Site housekeeping',
    category: 'HOUSEKEEPING',
    scoringMode: 'pass_fail',
    items: [
      {
        id: 'walkways',
        label: 'Walkways clear',
        type: 'pass_fail',
        required: true,
      },
      {
        id: 'materials',
        label: 'Materials stored properly',
        type: 'pass_fail',
        required: true,
      },
      {
        id: 'waste',
        label: 'Waste containers available',
        type: 'pass_fail',
        required: true,
      },
      {
        id: 'spills',
        label: 'No uncontrolled spills',
        type: 'pass_fail',
        required: true,
        energyType: 'chemical',
      },
      { id: 'lighting', label: 'Adequate lighting', type: 'pass_fail' },
      { id: 'photo', label: 'Area photo', type: 'photo' },
    ],
  },
  {
    name: 'Fall protection — Work at height',
    category: 'FALL_PROTECTION',
    scoringMode: 'weighted',
    items: [
      {
        id: 'anchor',
        label: 'Anchorage points rated & tagged',
        type: 'pass_fail',
        required: true,
        weight: 25,
        energyType: 'gravitational',
      },
      {
        id: 'harness',
        label: 'Harness / lanyard inspection current',
        type: 'pass_fail',
        required: true,
        weight: 25,
      },
      {
        id: '100_percent',
        label: '100% tie-off where required',
        type: 'pass_fail',
        required: true,
        weight: 25,
      },
      {
        id: 'holes',
        label: 'Floor/wall openings protected',
        type: 'pass_fail',
        required: true,
        weight: 15,
      },
      {
        id: 'rescue',
        label: 'Rescue plan communicated',
        type: 'pass_fail',
        weight: 10,
      },
    ],
  },
  {
    name: 'Environmental — Spill prevention',
    category: 'ENVIRONMENTAL',
    scoringMode: 'pass_fail',
    items: [
      {
        id: 'secondary',
        label: 'Secondary containment in place',
        type: 'pass_fail',
        required: true,
      },
      {
        id: 'sds',
        label: 'SDS available for chemicals on site',
        type: 'pass_fail',
        required: true,
      },
      {
        id: 'spill_kit',
        label: 'Spill kit stocked',
        type: 'pass_fail',
        required: true,
      },
      { id: 'drains', label: 'Drains protected', type: 'pass_fail' },
    ],
  },
];

export const DEFICIENCY_ESCALATION_DAYS: Record<string, number> = {
  low: 30,
  medium: 14,
  high: 7,
  critical: 1,
};

/** ACP tenant feature flag — auto-draft safety meeting when an inspection fails. */
export const PM_INSPECTION_AUTO_FAILURE_MEETING_FLAG =
  'pm.inspections.auto_failure_meeting';

/** Inspection failed overall (score below threshold or required items failed). */
export function inspectionFailedForAutoMeeting(
  passed: boolean | null | undefined,
): boolean {
  return passed === false;
}
