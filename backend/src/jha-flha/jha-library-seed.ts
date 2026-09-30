/** Industry-standard hazard & control catalog for JHA / FLHA (O&G, construction, industrial). */

export type ControlClass = 'direct' | 'alternative';

export type HazardSeed = {
  category: string;
  subcategory?: string;
  description: string;
  defaultSeverity?: number;
  defaultLikelihood?: number;
  defaultEnergyTypes: string[];
  taskTypes?: string[];
  keywords?: string[];
};

export type ControlSeed = {
  controlType: string;
  description: string;
  hazardCategories: string[];
  energyTypes?: string[];
  ppeRequired?: boolean;
  /** CSRA: direct = energy-targeted, error-tolerant; alternative = indirect / admin / PPE */
  controlClass?: ControlClass;
};

export const FULL_HAZARD_SEED: HazardSeed[] = [
  // Falls
  {
    category: 'Fall',
    subcategory: 'Elevated',
    description: 'Fall from ladder, scaffold, or platform',
    defaultEnergyTypes: ['gravity'],
    keywords: ['ladder', 'scaffold', 'platform', 'height'],
  },
  {
    category: 'Fall',
    subcategory: 'Elevated',
    description: 'Fall through opening or unprotected edge',
    defaultEnergyTypes: ['gravity'],
    keywords: ['opening', 'edge', 'guardrail'],
  },
  {
    category: 'Fall',
    subcategory: 'Same level',
    description: 'Slip, trip, or fall on same level',
    defaultEnergyTypes: ['gravity', 'motion'],
    keywords: ['slip', 'trip', 'housekeeping'],
  },
  {
    category: 'Fall',
    subcategory: 'Elevated',
    description: 'Falling objects from overhead work',
    defaultEnergyTypes: ['gravity'],
    keywords: ['overhead', 'dropped object'],
  },
  // Struck-by / caught
  {
    category: 'Struck-by',
    description: 'Struck by moving equipment or vehicle',
    defaultEnergyTypes: ['mechanical'],
    keywords: ['vehicle', 'forklift', 'traffic'],
  },
  {
    category: 'Struck-by',
    description: 'Struck by swinging load or crane hook',
    defaultEnergyTypes: ['gravity', 'mechanical'],
    keywords: ['crane', 'rigging', 'lift'],
  },
  {
    category: 'Struck-by',
    description: 'Struck by flying particles (grinding, cutting)',
    defaultEnergyTypes: ['mechanical'],
    keywords: ['grinding', 'cutting', 'debris'],
  },
  {
    category: 'Caught-in',
    description: 'Caught in/between pinch points or rotating equipment',
    defaultEnergyTypes: ['mechanical'],
    keywords: ['pinch', 'rotating', 'conveyor'],
  },
  {
    category: 'Line of fire',
    description:
      'Worker in line of fire — pressurized release or stored energy',
    defaultEnergyTypes: ['pressure', 'mechanical'],
    keywords: ['line of fire', 'stored energy'],
  },
  // Electrical
  {
    category: 'Electrical',
    description: 'Contact with energized conductors or equipment',
    defaultEnergyTypes: ['electrical'],
    keywords: ['electrical', 'energized', 'arc'],
  },
  {
    category: 'Electrical',
    description: 'Arc flash / arc blast exposure',
    defaultEnergyTypes: ['electrical', 'thermal'],
    keywords: ['arc flash', 'switchgear'],
  },
  {
    category: 'Electrical',
    description: 'Static discharge or induction in hazardous area',
    defaultEnergyTypes: ['electrical'],
    keywords: ['static', 'classified area'],
  },
  // Mechanical / pressure
  {
    category: 'Mechanical',
    description: 'Uncontrolled release of mechanical energy',
    defaultEnergyTypes: ['mechanical'],
    keywords: ['machine', 'guarding'],
  },
  {
    category: 'Pressure',
    description: 'Hydraulic or pneumatic hose failure',
    defaultEnergyTypes: ['pressure'],
    keywords: ['hydraulic', 'pneumatic', 'hose'],
  },
  {
    category: 'Pressure',
    description: 'Over-pressurization of vessel or line',
    defaultEnergyTypes: ['pressure'],
    keywords: ['pressure test', 'vessel'],
  },
  // Thermal / fire
  {
    category: 'Thermal',
    description: 'Burn from hot surfaces or steam',
    defaultEnergyTypes: ['thermal'],
    keywords: ['burn', 'steam', 'hot surface'],
  },
  {
    category: 'Fire',
    description: 'Fire during hot work (welding, cutting, grinding)',
    defaultEnergyTypes: ['thermal', 'chemical'],
    keywords: ['hot work', 'welding', 'fire watch'],
  },
  {
    category: 'Fire',
    description: 'Flammable atmosphere in work area',
    defaultEnergyTypes: ['chemical'],
    keywords: ['flammable', 'LEL', 'vapor'],
  },
  // Chemical / biological
  {
    category: 'Chemical',
    description: 'Inhalation of toxic vapors or gases',
    defaultEnergyTypes: ['chemical'],
    keywords: ['H2S', 'vapor', 'fume', 'SDS'],
  },
  {
    category: 'Chemical',
    description: 'Skin/eye contact with corrosive or irritant',
    defaultEnergyTypes: ['chemical'],
    keywords: ['corrosive', 'irritant', 'chemical'],
  },
  {
    category: 'Chemical',
    description: 'Unexpected chemical reaction or mixing',
    defaultEnergyTypes: ['chemical'],
    keywords: ['incompatible', 'mixing'],
  },
  {
    category: 'Biological',
    description: 'Bloodborne pathogen or biological exposure',
    defaultEnergyTypes: ['biological'],
    keywords: ['blood', 'needle', 'sewage'],
  },
  // Ergonomic / motion
  {
    category: 'Ergonomic',
    description: 'Manual handling — strain from lifting or carrying',
    defaultEnergyTypes: ['motion'],
    keywords: ['lift', 'carry', 'manual handling'],
  },
  {
    category: 'Ergonomic',
    description: 'Awkward posture or repetitive motion',
    defaultEnergyTypes: ['motion'],
    keywords: ['repetitive', 'posture', 'ergonomic'],
  },
  {
    category: 'Ergonomic',
    description: 'Overexertion pushing or pulling loads',
    defaultEnergyTypes: ['motion'],
    keywords: ['push', 'pull', 'overexertion'],
  },
  // Environment
  {
    category: 'Weather',
    description: 'Ice, snow, or wet surfaces increasing slip/fall risk',
    defaultEnergyTypes: ['gravity', 'thermal'],
    keywords: ['ice', 'snow', 'wet', 'weather'],
  },
  {
    category: 'Weather',
    description: 'Extreme heat — heat stress or dehydration',
    defaultEnergyTypes: ['thermal'],
    keywords: ['heat', 'hydration', 'sun'],
  },
  {
    category: 'Weather',
    description: 'High wind affecting lifts or elevated work',
    defaultEnergyTypes: ['gravity', 'mechanical'],
    keywords: ['wind', 'crane'],
  },
  {
    category: 'Environmental',
    description: 'Noise exposure above action level',
    defaultEnergyTypes: ['mechanical'],
    keywords: ['noise', 'hearing'],
  },
  {
    category: 'Environmental',
    description: 'Poor visibility or inadequate lighting',
    defaultEnergyTypes: ['gravity'],
    keywords: ['lighting', 'visibility', 'dark'],
  },
  // Site-specific high risk
  {
    category: 'Excavation',
    description: 'Trench collapse or engulfment',
    defaultEnergyTypes: ['gravity'],
    keywords: ['trench', 'excavation', 'shoring'],
  },
  {
    category: 'Confined space',
    description: 'Oxygen deficiency or toxic atmosphere in confined space',
    defaultEnergyTypes: ['chemical', 'biological'],
    keywords: ['confined space', 'entry', 'atmospheric'],
  },
  {
    category: 'Lifting',
    description: 'Rigging failure or unbalanced load',
    defaultEnergyTypes: ['gravity', 'mechanical'],
    keywords: ['rigging', 'crane', 'load chart'],
  },
  {
    category: 'Lifting',
    description: 'Working under suspended load',
    defaultEnergyTypes: ['gravity'],
    keywords: ['suspended load', 'lift zone'],
  },
  {
    category: 'Mobile equipment',
    description: 'Pedestrian struck by mobile plant in work zone',
    defaultEnergyTypes: ['mechanical'],
    keywords: ['pedestrian', 'spotter', 'exclusion zone'],
  },
  {
    category: 'Mobile equipment',
    description: 'Rollover or tip-over on uneven ground',
    defaultEnergyTypes: ['gravity', 'mechanical'],
    keywords: ['rollover', 'tip-over', 'grade'],
  },
  {
    category: 'Radiation',
    description: 'Ionizing radiation (NDT, gauges, sources)',
    defaultEnergyTypes: ['radiation'],
    keywords: ['radiation', 'NDT', 'gauge'],
  },
  {
    category: 'Utility strike',
    description: 'Contact with buried or overhead utility',
    defaultEnergyTypes: ['electrical', 'pressure'],
    keywords: ['utility', 'locate', 'one-call'],
  },
  {
    category: 'Violence',
    description: 'Workplace violence or aggressive third party',
    defaultEnergyTypes: ['mechanical'],
    keywords: ['violence', 'security', 'public'],
  },
  {
    category: 'Fatigue',
    description: 'Fatigue or impaired alertness (long shift, night work)',
    defaultEnergyTypes: ['motion'],
    keywords: ['fatigue', 'night', 'hours'],
  },
];

export const FULL_CONTROL_SEED: ControlSeed[] = [
  {
    controlType: 'elimination',
    description:
      'Eliminate the hazard — perform work differently or defer until conditions improve',
    hazardCategories: [],
  },
  {
    controlType: 'substitution',
    description: 'Substitute less hazardous materials, tools, or methods',
    hazardCategories: ['Chemical', 'Fire', 'Thermal'],
  },
  {
    controlType: 'engineering',
    description:
      'Install guardrails, covers, or fall protection anchors at exposed edges',
    hazardCategories: ['Fall'],
    energyTypes: ['gravity'],
  },
  {
    controlType: 'engineering',
    description:
      'Use physical barriers and exclusion zones around mobile equipment',
    hazardCategories: ['Struck-by', 'Mobile equipment', 'Line of fire'],
    energyTypes: ['mechanical'],
  },
  {
    controlType: 'engineering',
    description:
      'Machine guarding and interlocks on rotating/pinch point equipment',
    hazardCategories: ['Caught-in', 'Mechanical'],
    energyTypes: ['mechanical'],
  },
  {
    controlType: 'engineering',
    description: 'Lockout/tagout and verified zero energy before maintenance',
    hazardCategories: ['Electrical', 'Mechanical', 'Pressure'],
    energyTypes: ['electrical', 'mechanical', 'pressure'],
  },
  {
    controlType: 'engineering',
    description:
      'Ground fault protection and insulated tools for electrical work',
    hazardCategories: ['Electrical'],
    energyTypes: ['electrical'],
  },
  {
    controlType: 'engineering',
    description: 'Ventilation, gas detection, and atmospheric monitoring',
    hazardCategories: ['Chemical', 'Confined space', 'Fire'],
    energyTypes: ['chemical'],
  },
  {
    controlType: 'engineering',
    description: 'Shoring, sloping, or trench box for excavations',
    hazardCategories: ['Excavation'],
    energyTypes: ['gravity'],
  },
  {
    controlType: 'engineering',
    description: 'Certified rigging, lift plan, and load-tested equipment',
    hazardCategories: ['Lifting', 'Struck-by'],
    energyTypes: ['gravity', 'mechanical'],
  },
  {
    controlType: 'engineering',
    description: 'Hydraulic hose inspection and whip checks / pressure relief',
    hazardCategories: ['Pressure'],
    energyTypes: ['pressure'],
  },
  {
    controlType: 'administrative',
    description:
      'Permit to work (hot work, confined space, excavation, electrical)',
    hazardCategories: ['Fire', 'Confined space', 'Excavation', 'Electrical'],
  },
  {
    controlType: 'administrative',
    description: 'Job briefing / toolbox talk with crew before starting task',
    hazardCategories: [],
  },
  {
    controlType: 'administrative',
    description: 'Spotter and communication protocol for equipment movement',
    hazardCategories: ['Mobile equipment', 'Struck-by'],
    energyTypes: ['mechanical'],
  },
  {
    controlType: 'administrative',
    description: 'Utility locate (One-Call) and hand expose before digging',
    hazardCategories: ['Utility strike', 'Excavation'],
  },
  {
    controlType: 'administrative',
    description: 'Weather monitoring and stop-work criteria for wind/heat/ice',
    hazardCategories: ['Weather', 'Lifting'],
  },
  {
    controlType: 'administrative',
    description: 'Competency verification and supervision for high-risk tasks',
    hazardCategories: ['Lifting', 'Confined space', 'Electrical'],
  },
  {
    controlType: 'administrative',
    description: 'SDS review and chemical compatibility check before use',
    hazardCategories: ['Chemical'],
  },
  {
    controlType: 'administrative',
    description:
      'Housekeeping — clear walkways and secure materials from falling',
    hazardCategories: ['Fall', 'Struck-by'],
  },
  {
    controlType: 'administrative',
    description: 'Rest breaks and hydration plan for heat stress',
    hazardCategories: ['Weather', 'Fatigue'],
  },
  {
    controlType: 'administrative',
    description: 'Buddy system and emergency rescue plan for confined space',
    hazardCategories: ['Confined space'],
  },
  {
    controlType: 'ppe',
    description:
      'Hard hat, safety glasses, and steel-toe boots (minimum site PPE)',
    hazardCategories: [],
    ppeRequired: true,
  },
  {
    controlType: 'ppe',
    description: 'Fall arrest harness with 100% tie-off at height',
    hazardCategories: ['Fall'],
    energyTypes: ['gravity'],
    ppeRequired: true,
  },
  {
    controlType: 'ppe',
    description: 'Arc-rated clothing and insulated gloves for electrical work',
    hazardCategories: ['Electrical'],
    energyTypes: ['electrical'],
    ppeRequired: true,
  },
  {
    controlType: 'ppe',
    description: 'Respiratory protection per SDS / atmospheric testing',
    hazardCategories: ['Chemical', 'Confined space'],
    energyTypes: ['chemical'],
    ppeRequired: true,
  },
  {
    controlType: 'ppe',
    description: 'Hearing protection in noise-exposed areas',
    hazardCategories: ['Environmental'],
    ppeRequired: true,
  },
  {
    controlType: 'ppe',
    description: 'Cut-resistant gloves and face shield for grinding/cutting',
    hazardCategories: ['Struck-by', 'Mechanical'],
    ppeRequired: true,
  },
  {
    controlType: 'ppe',
    description: 'Fire-resistant coveralls and fire watch for hot work',
    hazardCategories: ['Fire', 'Thermal'],
    ppeRequired: true,
  },
  {
    controlType: 'ppe',
    description: 'Chemical-resistant gloves and splash goggles',
    hazardCategories: ['Chemical'],
    ppeRequired: true,
  },
  {
    controlType: 'ppe',
    description: 'High-visibility vest in traffic or equipment zones',
    hazardCategories: ['Mobile equipment', 'Struck-by'],
    ppeRequired: true,
  },
  {
    controlType: 'administrative',
    description: 'Fire extinguisher and fire watch posted during hot work',
    hazardCategories: ['Fire'],
  },
  {
    controlType: 'engineering',
    description: 'Bonding and grounding for flammable atmosphere work',
    hazardCategories: ['Fire', 'Chemical'],
    energyTypes: ['chemical'],
  },
  {
    controlType: 'administrative',
    description: 'Manual handling aids and team lift for heavy loads',
    hazardCategories: ['Ergonomic'],
    energyTypes: ['motion'],
  },
  {
    controlType: 'administrative',
    description: 'Emergency eyewash / shower accessible within 10 seconds',
    hazardCategories: ['Chemical'],
  },
];
