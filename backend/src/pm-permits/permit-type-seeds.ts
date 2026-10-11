export type PermitRequiredField = {
  key: string;
  label: string;
  type: 'text' | 'boolean' | 'number';
  required?: boolean;
};

export type PermitWorkflowStep = {
  step: number;
  name: string;
  role: string;
  action: string;
};

export type PermitTypeSeed = {
  id: string;
  name: string;
  description: string;
  permitType: string;
  requiredFields: PermitRequiredField[];
  workflowSteps: PermitWorkflowStep[];
  defaultControlKeys: string[];
  defaultHazardKeys: string[];
  requiredTraining: string[];
};

const approvalSteps: PermitWorkflowStep[] = [
  { step: 1, name: 'Prepare', role: 'worker', action: 'complete' },
  { step: 2, name: 'Review', role: 'supervisor', action: 'approve' },
  { step: 3, name: 'Issue', role: 'issuer', action: 'activate' },
];

export const PERMIT_TYPE_SEEDS: PermitTypeSeed[] = [
  {
    id: 'permit-hot-work',
    name: 'Hot work',
    description: 'Welding, cutting, grinding, or other spark-producing work',
    permitType: 'hot_work',
    requiredFields: [
      { key: 'work_location', label: 'Work location', type: 'text', required: true },
      { key: 'combustibles_cleared', label: 'Combustibles cleared', type: 'boolean', required: true },
      { key: 'fire_watch', label: 'Fire watch', type: 'text', required: true },
      { key: 'extinguisher_ready', label: 'Extinguisher ready', type: 'boolean', required: true },
    ],
    workflowSteps: approvalSteps,
    defaultHazardKeys: ['hz.fire.ignition', 'hz.fire.combustibles'],
    defaultControlKeys: ['ctrl.admin.fire_watch', 'ctrl.ppe.extinguisher'],
    requiredTraining: ['Hot Work Safety'],
  },
  {
    id: 'permit-confined-space',
    name: 'Confined space',
    description: 'Entry into a space with limited access and atmospheric hazard',
    permitType: 'confined_space',
    requiredFields: [
      { key: 'attendant', label: 'Attendant', type: 'text', required: true },
      { key: 'atmospheric_tests', label: 'Atmospheric tests', type: 'text', required: true },
      { key: 'isolation_verified', label: 'Isolation verified', type: 'boolean', required: true },
    ],
    workflowSteps: approvalSteps,
    defaultHazardKeys: ['hz.atmosphere.oxygen', 'hz.atmosphere.toxic'],
    defaultControlKeys: ['ctrl.admin.attendant', 'ctrl.admin.atmospheric_test'],
    requiredTraining: ['Confined Space Entry'],
  },
  {
    id: 'permit-electrical',
    name: 'Electrical',
    description: 'Work on or near energized electrical equipment',
    permitType: 'electrical',
    requiredFields: [
      { key: 'voltage', label: 'Voltage', type: 'text', required: true },
      { key: 'isolation_verified', label: 'Isolation verified', type: 'boolean', required: true },
    ],
    workflowSteps: approvalSteps,
    defaultHazardKeys: ['hz.electrical.shock', 'hz.electrical.arc'],
    defaultControlKeys: ['ctrl.admin.isolation', 'ctrl.ppe.electrical'],
    requiredTraining: ['Electrical Safety'],
  },
  {
    id: 'permit-excavation',
    name: 'Excavation',
    description: 'Trenching or excavation that can expose workers to collapse or utilities',
    permitType: 'excavation',
    requiredFields: [
      { key: 'depth', label: 'Depth', type: 'number', required: true },
      { key: 'protection_system', label: 'Protection system', type: 'text', required: true },
      { key: 'utility_locate', label: 'Utility locate', type: 'text', required: true },
    ],
    workflowSteps: approvalSteps,
    defaultHazardKeys: ['hz.excavation.collapse', 'hz.excavation.utility'],
    defaultControlKeys: ['ctrl.admin.utility_locate', 'ctrl.eng.shoring'],
    requiredTraining: ['Excavation Safety'],
  },
  {
    id: 'permit-loto',
    name: 'Lockout / tagout',
    description: 'Isolation of hazardous energy before servicing equipment',
    permitType: 'loto',
    requiredFields: [
      { key: 'zero_energy_verified', label: 'Zero energy verified', type: 'boolean', required: true },
    ],
    workflowSteps: approvalSteps,
    defaultHazardKeys: ['hz.energy.stored', 'hz.energy.unexpected_start'],
    defaultControlKeys: ['ctrl.admin.loto', 'ctrl.admin.zero_energy'],
    requiredTraining: ['Lockout Tagout'],
  },
  {
    id: 'permit-chemical-handling',
    name: 'Chemical handling',
    description: 'Work with hazardous chemicals that requires exposure controls',
    permitType: 'chemical_handling',
    requiredFields: [
      { key: 'chemical_name', label: 'Chemical', type: 'text', required: true },
      { key: 'sds_reviewed', label: 'SDS reviewed', type: 'boolean', required: true },
    ],
    workflowSteps: approvalSteps,
    defaultHazardKeys: ['hz.chemical.exposure', 'hz.chemical.spill'],
    defaultControlKeys: ['ctrl.admin.sds', 'ctrl.ppe.chemical'],
    requiredTraining: ['WHMIS'],
  },
  {
    id: 'permit-crane-lift',
    name: 'Crane lift',
    description: 'Critical lift with a crane or hoisting equipment',
    permitType: 'crane_lift',
    requiredFields: [
      { key: 'load_weight', label: 'Load weight', type: 'number', required: true },
      { key: 'lift_plan', label: 'Lift plan', type: 'text', required: true },
    ],
    workflowSteps: approvalSteps,
    defaultHazardKeys: ['hz.lift.overload', 'hz.lift.swing'],
    defaultControlKeys: ['ctrl.admin.lift_plan', 'ctrl.admin.exclusion_zone'],
    requiredTraining: ['Crane and Hoisting'],
  },
  {
    id: 'permit-fall-protection',
    name: 'Fall protection',
    description: 'Work where a fall of more than the site threshold is possible',
    permitType: 'fall_protection',
    requiredFields: [
      { key: 'fall_distance', label: 'Fall distance', type: 'number', required: true },
      { key: 'rescue_plan', label: 'Rescue plan', type: 'boolean', required: true },
    ],
    workflowSteps: approvalSteps,
    defaultHazardKeys: ['hz.fall.height', 'hz.fall.opening'],
    defaultControlKeys: ['ctrl.ppe.harness', 'ctrl.admin.rescue_plan'],
    requiredTraining: ['Fall Protection'],
  },
  {
    id: 'permit-live-line',
    name: 'Live line',
    description: 'Work on energized lines that cannot be de-energized',
    permitType: 'live_line',
    requiredFields: [
      { key: 'voltage', label: 'Voltage', type: 'text', required: true },
      { key: 'minimum_approach', label: 'Minimum approach distance', type: 'text', required: true },
    ],
    workflowSteps: approvalSteps,
    defaultHazardKeys: ['hz.electrical.live_line', 'hz.electrical.arc'],
    defaultControlKeys: ['ctrl.ppe.live_line', 'ctrl.admin.approach_distance'],
    requiredTraining: ['Live Line Safety'],
  },
  {
    id: 'permit-open-hole',
    name: 'Open hole',
    description: 'Floor or roof opening that creates a fall exposure',
    permitType: 'open_hole',
    requiredFields: [
      { key: 'cover_inspected', label: 'Cover or guardrail inspected', type: 'boolean', required: true },
    ],
    workflowSteps: approvalSteps,
    defaultHazardKeys: ['hz.fall.opening'],
    defaultControlKeys: ['ctrl.eng.cover', 'ctrl.eng.guardrail'],
    requiredTraining: ['Fall Protection'],
  },
  {
    id: 'permit-custom',
    name: 'Custom',
    description: 'Site-specific permit that does not match a standard type',
    permitType: 'custom',
    requiredFields: [
      { key: 'work_description', label: 'Work description', type: 'text', required: true },
    ],
    workflowSteps: approvalSteps,
    defaultHazardKeys: [],
    defaultControlKeys: [],
    requiredTraining: [],
  },
];
