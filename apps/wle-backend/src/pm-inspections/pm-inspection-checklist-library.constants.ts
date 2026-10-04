import {
  PmInspectionScoringMode,
  PmInspectionTemplateCategory,
} from '@prisma/client';
import type { ChecklistItemDef } from './pm-inspections.constants';
import type { SystemTemplateDef } from './pm-inspection-focus-audits.constants';

const pf = (
  id: string,
  label: string,
  opts?: Partial<ChecklistItemDef>,
): ChecklistItemDef => ({
  id,
  label,
  type: 'pass_fail',
  required: true,
  weight: 10,
  ...opts,
});

function checklist(
  name: string,
  category: PmInspectionTemplateCategory,
  scoringMode: PmInspectionScoringMode,
  description: string,
  items: ChecklistItemDef[],
  libraryGroup: string,
  extras?: Partial<SystemTemplateDef>,
): SystemTemplateDef {
  return {
    name,
    category,
    scoringMode,
    description,
    scoringRules: {
      inspectionKind: 'checklist',
      libraryGroup,
    },
    items,
    ...extras,
  };
}

/** Published checklist library — company-wide templates for field inspections. */
export const CHECKLIST_LIBRARY_TEMPLATES: SystemTemplateDef[] = [
  // Equipment & vehicles
  checklist(
    'PME — Pre-use inspection',
    'PME',
    'weighted',
    'Daily mobile equipment walk-around before operation.',
    [
      pf('walkaround', 'Visual walk-around complete', { weight: 10 }),
      pf('guards', 'Guards and shields in place', {
        weight: 15,
        energyType: 'mechanical',
      }),
      pf('hydraulic', 'Hydraulic / fluid leaks none observed', {
        weight: 15,
        energyType: 'hydraulic',
      }),
      pf('controls', 'Operational controls responsive', { weight: 20 }),
      pf('fire_ext', 'Fire extinguisher present & charged', { weight: 10 }),
      pf('operator_competency', 'Operator competency verified', { weight: 15 }),
      { id: 'notes', label: 'Additional notes', type: 'text', required: false },
      {
        id: 'photo_evidence',
        label: 'Equipment photo',
        type: 'photo',
        required: false,
      },
    ],
    'equipment',
    { equipmentTypeKeys: ['pme', 'mobile_equipment'] },
  ),
  checklist(
    'Aerial lift — Pre-use',
    'PME',
    'weighted',
    'Scissor/boom lift inspection before elevating personnel.',
    [
      pf('platform', 'Platform guardrails and gate functional', { weight: 20 }),
      pf('controls_al', 'Ground and basket controls operational', {
        weight: 15,
      }),
      pf('outriggers_al', 'Outriggers / stabilizers deployed per manual', {
        weight: 15,
      }),
      pf('fall_protection_al', 'Harness / lanyard tie-off available', {
        weight: 20,
        energyType: 'gravitational',
      }),
      pf('wind_al', 'Wind within manufacturer limits', { weight: 10 }),
      pf('surface', 'Ground surface stable and level', { weight: 10 }),
      { id: 'photo_al', label: 'Lift photo', type: 'photo' },
    ],
    'equipment',
    { equipmentTypeKeys: ['aerial_lift', 'pme'] },
  ),
  checklist(
    'Forklift — Pre-shift',
    'VEHICLE',
    'weighted',
    'Powered industrial truck inspection and operator verification.',
    [
      pf('forks', 'Forks, mast, and chains free of damage', { weight: 15 }),
      pf('brakes', 'Brakes and steering responsive', { weight: 20 }),
      pf('horn_fl', 'Horn, lights, and backup alarm working', { weight: 10 }),
      pf('propane', 'Battery / propane / fuel system secure', { weight: 10 }),
      pf('cert_fl', 'Operator certification current', {
        weight: 20,
        critical: true,
      }),
      pf('pedestrian', 'Pedestrian separation maintained in work area', {
        weight: 15,
      }),
    ],
    'equipment',
    { equipmentTypeKeys: ['forklift', 'vehicle'] },
  ),
  checklist(
    'Crane / lifting — Daily',
    'CRANE',
    'weighted',
    'Daily crane and rigging readiness before lifts.',
    [
      pf('wire_rope', 'Wire rope condition acceptable', {
        weight: 20,
        energyType: 'gravitational',
      }),
      pf('hooks', 'Hooks, latches, swivels OK', { weight: 15 }),
      pf('outriggers', 'Outriggers / cribbing per lift plan', { weight: 15 }),
      pf('zone', 'Lift zone barricaded', { weight: 15 }),
      pf('operator_cert', 'Operator certification current', {
        weight: 20,
        critical: true,
      }),
      pf('wind', 'Wind within limits', { weight: 10 }),
      { id: 'notes_crane', label: 'Notes', type: 'text' },
    ],
    'equipment',
  ),
  checklist(
    'Power tools & hand tools',
    'TOOL',
    'pass_fail',
    'Condition, guarding, and GFCI for corded tools on site.',
    [
      pf('guards_tool', 'Guards and safety devices in place', {
        energyType: 'mechanical',
      }),
      pf('cords_tool', 'Cords and plugs free of damage', {
        energyType: 'electrical',
      }),
      pf('gfci_tool', 'GFCI protection in use for corded tools', {
        critical: true,
      }),
      pf('tagout', 'Damaged tools tagged out of service'),
      pf('training_tool', 'Users trained on tool-specific hazards'),
    ],
    'equipment',
  ),

  // Construction & site programs
  checklist(
    'Site housekeeping',
    'HOUSEKEEPING',
    'pass_fail',
    'Walkways, storage, waste, and slip/trip controls.',
    [
      pf('walkways', 'Walkways clear'),
      pf('materials', 'Materials stored properly'),
      pf('waste', 'Waste containers available'),
      pf('spills', 'No uncontrolled spills', { energyType: 'chemical' }),
      pf('lighting', 'Adequate lighting'),
      { id: 'photo', label: 'Area photo', type: 'photo' },
    ],
    'site',
  ),
  checklist(
    'Fall protection — Work at height',
    'FALL_PROTECTION',
    'weighted',
    'Anchors, harnesses, tie-off, and opening protection.',
    [
      pf('anchor', 'Anchorage points rated & tagged', {
        weight: 25,
        energyType: 'gravitational',
      }),
      pf('harness', 'Harness / lanyard inspection current', { weight: 25 }),
      pf('100_percent', '100% tie-off where required', {
        weight: 25,
        critical: true,
      }),
      pf('holes', 'Floor/wall openings protected', { weight: 15 }),
      pf('rescue', 'Rescue plan communicated', { weight: 10 }),
    ],
    'construction',
  ),
  checklist(
    'Scaffolding — Daily tag inspection',
    'SCAFFOLDING',
    'weighted',
    'Competent person tag, access, guardrails, and base stability.',
    [
      pf('tag_sc', 'Current scaffold tag displayed', { weight: 20 }),
      pf('guardrails_sc', 'Guardrails and toe boards complete', {
        weight: 25,
        critical: true,
      }),
      pf('base_sc', 'Base plates and mud sills sound', { weight: 15 }),
      pf('access_sc', 'Safe ladder or stair access', { weight: 15 }),
      pf('load_sc', 'Scaffold not overloaded', { weight: 10 }),
    ],
    'construction',
  ),
  checklist(
    'Excavation — Daily competent person',
    'EXCAVATION',
    'weighted',
    'Utilities, protection systems, access, and atmospheric checks.',
    [
      pf('competent_ex', 'Competent person on site', { weight: 15 }),
      pf('locates_ex', 'Utility locates documented', {
        weight: 20,
        critical: true,
      }),
      pf('protection_ex', 'Sloping, benching, or shoring in place', {
        weight: 25,
      }),
      pf('access_ex', 'Ladder or ramp within 25 ft', { weight: 15 }),
      pf('atmosphere_ex', 'Atmospheric testing when required', { weight: 10 }),
    ],
    'construction',
  ),
  checklist(
    'Ladder safety',
    'ACCESS_EGRESS',
    'pass_fail',
    'Selection, setup angle, tie-off, and load limits.',
    [
      pf('type', 'Correct ladder type for task'),
      pf('condition', 'Ladder free of damage / defects'),
      pf('setup', 'Set up on stable surface at proper angle'),
      pf('tie', 'Ladder secured or held when required'),
      pf('3_points', 'Three points of contact maintained'),
    ],
    'construction',
  ),
  checklist(
    'Hot work permit verification',
    'HOT_WORK',
    'weighted',
    'Permit, fire watch, combustible clearance, and PPE.',
    [
      pf('permit_hw', 'Hot work permit issued and posted', {
        weight: 25,
        critical: true,
      }),
      pf('fire_watch_hw', 'Fire watch assigned', { weight: 20 }),
      pf('clearance_hw', 'Combustibles cleared within 35 ft', { weight: 20 }),
      pf('ext_hw', 'Fire extinguisher ready', { weight: 15 }),
      pf('ppe_hw', 'Welding PPE in use', { weight: 10 }),
    ],
    'construction',
  ),
  checklist(
    'Confined space — Pre-entry',
    'CONFINED_SPACE',
    'weighted',
    'Permit, isolation, atmospheric testing, attendant, and rescue.',
    [
      pf('permit_cs', 'Entry permit complete', { weight: 25, critical: true }),
      pf('isolation_cs', 'Energy isolation verified', { weight: 20 }),
      pf('atmo_cs', 'Atmospheric tests recorded', { weight: 25 }),
      pf('attendant_cs', 'Attendant at entry point', { weight: 15 }),
      pf('rescue_cs', 'Rescue plan and equipment ready', { weight: 10 }),
    ],
    'construction',
  ),
  checklist(
    'Temporary electrical — Site power',
    'TEMPORARY_POWER',
    'weighted',
    'GFCI, cord condition, panel labeling, and wet locations.',
    [
      pf('gfci_tp', 'GFCI protection in use', {
        weight: 25,
        energyType: 'electrical',
        critical: true,
      }),
      pf('cords_tp', 'Cords and cables undamaged', { weight: 15 }),
      pf('panels_tp', 'Panels labeled and closed', { weight: 15 }),
      pf('wet_tp', 'Wet-location covers in place', { weight: 15 }),
      pf('lockout_tp', 'Lockout devices available', { weight: 10 }),
    ],
    'construction',
  ),
  checklist(
    'Silica / dust exposure controls',
    'ENVIRONMENTAL',
    'pass_fail',
    'Water, ventilation, enclosures, and respiratory protection.',
    [
      pf('plan_silica', 'Silica exposure control plan on site'),
      pf('water', 'Water delivery or dust collection in use'),
      pf('barriers', 'Enclosures / barriers where required'),
      pf('resp', 'Respiratory protection per assessment'),
      pf('housekeeping_silica', 'Debris cleaned without dry sweeping'),
    ],
    'environmental',
  ),

  // Environmental & fire
  checklist(
    'Environmental — Spill prevention',
    'ENVIRONMENTAL',
    'pass_fail',
    'Containment, SDS, spill kits, and drain protection.',
    [
      pf('secondary', 'Secondary containment in place'),
      pf('sds', 'SDS available for chemicals on site'),
      pf('spill_kit', 'Spill kit stocked'),
      pf('drains', 'Drains protected'),
    ],
    'environmental',
  ),
  checklist(
    'Fire protection — Extinguishers & exits',
    'FIRE_PROTECTION',
    'pass_fail',
    'Extinguisher service, access, and exit routes.',
    [
      pf('ext_fp', 'Fire extinguishers serviced and accessible'),
      pf('exits_fp', 'Exits unobstructed'),
      pf('alarm_fp', 'Fire alarm / detection functional where installed'),
      pf('assembly_fp', 'Assembly area identified'),
    ],
    'safety_devices',
  ),

  checklist(
    'Safety devices inspection',
    'TOOL',
    'pass_fail',
    'Guards, interlocks, E-stops, eyewash, extinguishers, and alarms.',
    [
      pf('guards_sd', 'Machine guards and safety devices in place', {
        energyType: 'mechanical',
        critical: true,
      }),
      pf('interlocks_sd', 'Interlocks functional — not bypassed', {
        energyType: 'mechanical',
        critical: true,
      }),
      pf('estop_sd', 'Emergency stops accessible and tested', {
        critical: true,
      }),
      pf('eyewash_sd', 'Eyewash / safety shower accessible and clear'),
      pf('ext_sd', 'Fire extinguishers present and inspected'),
      pf('alarm_sd', 'Area alarms / horns functional where installed'),
      pf('tagout_sd', 'Defective devices tagged out of service'),
    ],
    'safety_devices',
  ),

  // General programs
  checklist(
    'Emergency preparedness',
    'ACCESS_EGRESS',
    'pass_fail',
    'Muster, alarms, wardens, and first aid readiness.',
    [
      pf('muster_ep', 'Muster points marked and known'),
      pf('alarm_ep', 'Alarms audible in work area'),
      pf('warden_ep', 'Emergency wardens assigned'),
      pf('first_aid_ep', 'First aid / AED locations known'),
      pf('drill_ep', 'Recent drill within policy interval'),
    ],
    'emergency',
  ),
  checklist(
    'PPE spot check',
    'SITE',
    'pass_fail',
    'Hazard assessment alignment, issuance, and proper use.',
    [
      pf('assessment_ppe', 'Area PPE requirements posted'),
      pf('issued_ppe', 'Required PPE available and worn'),
      pf('condition_ppe', 'PPE in serviceable condition'),
      pf('training_ppe', 'Workers trained on PPE for task'),
    ],
    'ppe',
  ),
  checklist(
    'Contractor / visitor orientation',
    'SITE',
    'weighted',
    'Orientation, site rules, emergency info, and scope briefing.',
    [
      pf('orientation_co', 'Orientation completed before work', {
        weight: 25,
        critical: true,
      }),
      pf('rules_co', 'Site-specific rules communicated', { weight: 15 }),
      pf('emergency_co', 'Emergency contacts understood', { weight: 15 }),
      pf('scope_co', 'Scope and interface hazards reviewed', { weight: 15 }),
      pf('certs_co', 'Required certs verified in Vera', { weight: 10 }),
    ],
    'general',
  ),
  checklist(
    'Weekly site safety walk',
    'SITE',
    'weighted',
    'Supervisor-led general hazard hunt across active work areas.',
    [
      pf('housekeeping_wk', 'Housekeeping acceptable in active areas', {
        weight: 15,
      }),
      pf('barricades_wk', 'Barricades and signage for hazards', {
        weight: 15,
      }),
      pf('ppe_wk', 'PPE compliance observed', { weight: 15 }),
      pf('equipment_wk', 'Equipment and tools in safe condition', {
        weight: 15,
      }),
      pf('behaviors_wk', 'Safe work practices observed', { weight: 15 }),
      pf('followup_wk', 'Prior deficiencies closed or re-assigned', {
        weight: 15,
      }),
      { id: 'notes_wk', label: 'Walk notes / focus areas', type: 'text' },
    ],
    'general',
  ),
];

export const CHECKLIST_LIBRARY_GROUPS: Record<string, string> = {
  equipment: 'Equipment & vehicles',
  ppe: 'PPE',
  safety_devices: 'Safety devices',
  site: 'Site conditions',
  construction: 'Construction programs',
  environmental: 'Environmental',
  emergency: 'Emergency readiness',
  general: 'General programs',
};
