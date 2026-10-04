import type { ControlSeed, HazardSeed } from './jha-library-seed';

/** Extended cross-industry hazard & control catalog. */

export const CONSTRUCTION_HAZARDS: HazardSeed[] = [
  {
    category: 'Fall',
    subcategory: 'Elevated',
    description: 'Fall from roof edge during roofing or membrane work',
    defaultEnergyTypes: ['gravity'],
    keywords: ['roof', 'roofing', 'membrane', 'leading edge'],
  },
  {
    category: 'Fall',
    description: 'Fall through fragile roof surface or skylight',
    defaultEnergyTypes: ['gravity'],
    keywords: ['fragile', 'skylight', 'roof'],
  },
  {
    category: 'Fall',
    description: 'Fall from aerial lift or scissor lift basket',
    defaultEnergyTypes: ['gravity', 'mechanical'],
    keywords: ['aerial lift', 'scissor lift', 'MEWP', 'boom'],
  },
  {
    category: 'Excavation',
    description: 'Utility strike during directional drill or bore',
    defaultEnergyTypes: ['electrical', 'pressure'],
    keywords: ['directional drill', 'bore', ' HDD'],
  },
  {
    category: 'Excavation',
    description: 'Soil collapse in unsupported trench or pit',
    defaultEnergyTypes: ['gravity'],
    keywords: ['trench', 'collapse', 'cave-in', 'excavation'],
  },
  {
    category: 'Struck-by',
    description: 'Struck by concrete pump hose whip or line failure',
    defaultEnergyTypes: ['pressure', 'mechanical'],
    keywords: ['concrete pump', 'hose whip', 'pump line'],
  },
  {
    category: 'Struck-by',
    description: 'Struck by nail gun discharge or ricochet',
    defaultEnergyTypes: ['mechanical'],
    keywords: ['nail gun', 'fastener', 'ricochet'],
  },
  {
    category: 'Electrical',
    description: 'Contact with overhead power lines during crane or formwork',
    defaultEnergyTypes: ['electrical'],
    keywords: ['overhead line', 'power line', 'crane', 'formwork'],
  },
  {
    category: 'Electrical',
    description: 'Temporary power distribution — damaged cords or missing GFCI',
    defaultEnergyTypes: ['electrical'],
    keywords: ['temp power', 'extension cord', 'GFCI'],
  },
  {
    category: 'Lifting',
    description: 'Structural collapse during concrete pour or shoring failure',
    defaultEnergyTypes: ['gravity'],
    keywords: ['concrete pour', 'shoring', 'formwork collapse'],
  },
  {
    category: 'Confined space',
    description: 'Atmospheric hazard in manhole, vault, or crawl space',
    defaultEnergyTypes: ['chemical', 'biological'],
    keywords: ['manhole', 'vault', 'crawl space'],
  },
  {
    category: 'Silica',
    description:
      'Respirable crystalline silica from cutting, grinding, or sweeping',
    defaultEnergyTypes: ['chemical'],
    keywords: ['silica', 'concrete cut', 'grinding', 'sawcut'],
  },
  {
    category: 'Mobile equipment',
    description: 'Backhoe or excavator swing radius strike',
    defaultEnergyTypes: ['mechanical'],
    keywords: ['excavator', 'swing radius', 'backhoe'],
  },
  {
    category: 'Thermal',
    description: 'Asphalt burn or hot bitumen splash during paving',
    defaultEnergyTypes: ['thermal'],
    keywords: ['asphalt', 'bitumen', 'paving', 'hot'],
  },
  {
    category: 'Weather',
    description: 'Lightning exposure during open-field construction',
    defaultEnergyTypes: ['electrical', 'gravity'],
    keywords: ['lightning', 'storm', 'open field'],
  },
];

export const CONSTRUCTION_CONTROLS: ControlSeed[] = [
  {
    controlType: 'engineering',
    description:
      'Guardrails, mid-rails, and toe boards at roof and leading edges',
    hazardCategories: ['Fall'],
    energyTypes: ['gravity'],
    controlClass: 'direct',
  },
  {
    controlType: 'engineering',
    description:
      'Fragile roof covers, warning signs, and controlled access routes',
    hazardCategories: ['Fall'],
    energyTypes: ['gravity'],
    controlClass: 'direct',
  },
  {
    controlType: 'engineering',
    description:
      'Trench box, sloping, or benching per competent person assessment',
    hazardCategories: ['Excavation'],
    energyTypes: ['gravity'],
    controlClass: 'direct',
  },
  {
    controlType: 'administrative',
    description: 'One-Call locate before any excavation or HDD bore',
    hazardCategories: ['Excavation', 'Utility strike'],
    controlClass: 'alternative',
  },
  {
    controlType: 'engineering',
    description:
      'Line-of-fire exclusion zones and hose whip restraints on concrete pumps',
    hazardCategories: ['Struck-by', 'Line of fire'],
    energyTypes: ['pressure'],
    controlClass: 'direct',
  },
  {
    controlType: 'engineering',
    description: 'GFCI protection and cord inspection on all temporary power',
    hazardCategories: ['Electrical'],
    energyTypes: ['electrical'],
    controlClass: 'direct',
  },
  {
    controlType: 'administrative',
    description:
      '10-foot minimum approach distance or line de-energization for overhead lines',
    hazardCategories: ['Electrical'],
    energyTypes: ['electrical'],
    controlClass: 'alternative',
  },
  {
    controlType: 'engineering',
    description:
      'Wet cutting, local exhaust ventilation, or vacuum for silica-generating tasks',
    hazardCategories: ['Silica'],
    energyTypes: ['chemical'],
    controlClass: 'direct',
  },
  {
    controlType: 'administrative',
    description:
      'Swing radius barricades and dedicated spotter for excavator operations',
    hazardCategories: ['Mobile equipment', 'Struck-by'],
    controlClass: 'alternative',
  },
  {
    controlType: 'ppe',
    description:
      'Full-face respirator (P100) when silica controls cannot reduce below PEL',
    hazardCategories: ['Silica'],
    ppeRequired: true,
    controlClass: 'alternative',
  },
];

export const OIL_GAS_HAZARDS: HazardSeed[] = [
  {
    category: 'Well control',
    description: 'Kick or blowout during drilling or workover',
    defaultEnergyTypes: ['pressure', 'chemical'],
    keywords: ['kick', 'blowout', 'drilling', 'workover', 'BOP'],
  },
  {
    category: 'Well control',
    description: 'Hydrogen sulfide (H2S) release at wellhead or tank',
    defaultEnergyTypes: ['chemical'],
    keywords: ['H2S', 'sour gas', 'wellhead', 'tank'],
  },
  {
    category: 'Pressure',
    description: 'High-pressure flowline or manifold leak',
    defaultEnergyTypes: ['pressure', 'chemical'],
    keywords: ['flowline', 'manifold', 'high pressure', 'leak'],
  },
  {
    category: 'Fire',
    description: 'Fire or explosion at tank battery or separator',
    defaultEnergyTypes: ['chemical', 'thermal'],
    keywords: ['tank battery', 'separator', 'fire', 'explosion'],
  },
  {
    category: 'Confined space',
    description: 'Atmospheric hazard in vessel, tank, or frac tank cleaning',
    defaultEnergyTypes: ['chemical'],
    keywords: ['tank cleaning', 'vessel', 'frac tank', 'confined space'],
  },
  {
    category: 'Mechanical',
    description: 'Rotating equipment — pump jack, rotating head, or top drive',
    defaultEnergyTypes: ['mechanical'],
    keywords: ['pump jack', 'rotating head', 'top drive', 'rig floor'],
  },
  {
    category: 'Lifting',
    description: 'Derrick or mast erection / lowering incident',
    defaultEnergyTypes: ['gravity', 'mechanical'],
    keywords: ['derrick', 'mast', 'rig up', 'rig down'],
  },
  {
    category: 'Chemical',
    description: 'Exposure to drilling mud, diesel, or chemical additives',
    defaultEnergyTypes: ['chemical'],
    keywords: ['drilling mud', 'diesel', 'additive', 'chemical'],
  },
  {
    category: 'Environmental',
    description: 'Spill to soil or watercourse during transfer operations',
    defaultEnergyTypes: ['chemical'],
    keywords: ['spill', 'transfer', 'watercourse', 'containment'],
  },
  {
    category: 'Driving',
    description: 'Vehicle rollover on lease road or remote access',
    defaultEnergyTypes: ['gravity', 'mechanical'],
    keywords: ['lease road', 'rollover', 'driving', 'remote'],
  },
  {
    category: 'Pressure',
    description: 'Unexpected release during well testing or flaring',
    defaultEnergyTypes: ['pressure', 'thermal', 'chemical'],
    keywords: ['well test', 'flaring', 'release'],
  },
  {
    category: 'Electrical',
    description: 'Arc flash in MCC room or classified area electrical work',
    defaultEnergyTypes: ['electrical'],
    keywords: ['MCC', 'classified area', 'arc flash', 'Zone'],
  },
];

export const OIL_GAS_CONTROLS: ControlSeed[] = [
  {
    controlType: 'engineering',
    description:
      'Functional BOP tested per policy; trip sheets and pit volume monitoring',
    hazardCategories: ['Well control'],
    energyTypes: ['pressure'],
    controlClass: 'direct',
  },
  {
    controlType: 'engineering',
    description:
      'Fixed H2S detection with audible alarm and wind sock at wellsite',
    hazardCategories: ['Well control', 'Chemical'],
    energyTypes: ['chemical'],
    controlClass: 'direct',
  },
  {
    controlType: 'administrative',
    description:
      'Sour gas contingency plan and muster points briefed before entry',
    hazardCategories: ['Well control'],
    controlClass: 'alternative',
  },
  {
    controlType: 'engineering',
    description: 'Secondary containment and spill kits at transfer manifolds',
    hazardCategories: ['Environmental', 'Pressure'],
    controlClass: 'direct',
  },
  {
    controlType: 'administrative',
    description:
      'Hot work permit with gas test and fire watch in classified areas',
    hazardCategories: ['Fire'],
    energyTypes: ['chemical', 'thermal'],
    controlClass: 'alternative',
  },
  {
    controlType: 'engineering',
    description: 'LOTO and zero energy verification on all process equipment',
    hazardCategories: ['Mechanical', 'Pressure', 'Electrical'],
    energyTypes: ['mechanical', 'pressure'],
    controlClass: 'direct',
  },
  {
    controlType: 'administrative',
    description:
      'Journey management and rollover-capable restraint for lease roads',
    hazardCategories: ['Driving'],
    controlClass: 'alternative',
  },
  {
    controlType: 'ppe',
    description:
      'SCBA or supplied air when H2S cannot be reduced below action level',
    hazardCategories: ['Well control', 'Confined space'],
    ppeRequired: true,
    controlClass: 'alternative',
  },
];

export const FORESTRY_HAZARDS: HazardSeed[] = [
  {
    category: 'Struck-by',
    description: 'Struck by falling tree or limb during felling',
    defaultEnergyTypes: ['gravity'],
    keywords: ['felling', 'tree', 'limb', 'forestry'],
  },
  {
    category: 'Struck-by',
    description: 'Struck by snag or hung-up tree during bucking or skidding',
    defaultEnergyTypes: ['gravity'],
    keywords: ['snag', 'hung-up', 'bucking', 'skidding'],
  },
  {
    category: 'Mechanical',
    description: 'Chain saw kickback or binding during cutting',
    defaultEnergyTypes: ['mechanical'],
    keywords: ['chainsaw', 'kickback', 'cutting'],
  },
  {
    category: 'Mobile equipment',
    description: 'Skidder or feller-buncher rollover on slope',
    defaultEnergyTypes: ['gravity', 'mechanical'],
    keywords: ['skidder', 'feller-buncher', 'rollover', 'slope'],
  },
  {
    category: 'Environmental',
    description: 'Insect sting, bear, or wildlife encounter in remote block',
    defaultEnergyTypes: ['biological'],
    keywords: ['wildlife', 'bear', 'insect', 'remote'],
  },
  {
    category: 'Ergonomic',
    description: 'Manual handling of choker cables and heavy logs',
    defaultEnergyTypes: ['motion'],
    keywords: ['choker', 'log', 'manual handling'],
  },
  {
    category: 'Utility strike',
    description: 'Contact with overhead power line during yarding or loading',
    defaultEnergyTypes: ['electrical'],
    keywords: ['power line', 'yarding', 'loading', 'overhead'],
  },
  {
    category: 'Fire',
    description: 'Wildfire ignition from equipment exhaust or hot work',
    defaultEnergyTypes: ['thermal', 'chemical'],
    keywords: ['wildfire', 'exhaust', 'fire season'],
  },
];

export const FORESTRY_CONTROLS: ControlSeed[] = [
  {
    controlType: 'administrative',
    description:
      'Directional felling plan, escape routes, and stump height verification',
    hazardCategories: ['Struck-by'],
    energyTypes: ['gravity'],
    controlClass: 'alternative',
  },
  {
    controlType: 'administrative',
    description: 'Hung-up tree procedure — no worker under suspended stem',
    hazardCategories: ['Struck-by'],
    controlClass: 'alternative',
  },
  {
    controlType: 'engineering',
    description:
      'Chain brake, low-kickback bar, and proper sharpening/maintenance',
    hazardCategories: ['Mechanical'],
    controlClass: 'direct',
  },
  {
    controlType: 'administrative',
    description:
      'Steep-slope assessment and rollover restraint / seat belt policy',
    hazardCategories: ['Mobile equipment'],
    controlClass: 'alternative',
  },
  {
    controlType: 'administrative',
    description:
      'Power line exclusion zone and spotter during yarding near lines',
    hazardCategories: ['Utility strike', 'Electrical'],
    controlClass: 'alternative',
  },
  {
    controlType: 'administrative',
    description:
      'Fire weather index check and fire suppression tools on equipment',
    hazardCategories: ['Fire'],
    controlClass: 'alternative',
  },
];

export const UTILITIES_HAZARDS: HazardSeed[] = [
  {
    category: 'Electrical',
    description:
      'Contact with energized distribution or transmission conductor',
    defaultEnergyTypes: ['electrical'],
    keywords: ['distribution', 'transmission', 'energized', 'conductor'],
  },
  {
    category: 'Electrical',
    description: 'Step and touch potential near ground fault or MGN',
    defaultEnergyTypes: ['electrical'],
    keywords: ['step potential', 'touch potential', 'ground fault', 'MGN'],
  },
  {
    category: 'Electrical',
    description: 'Arc flash during switching, racking breaker, or terminations',
    defaultEnergyTypes: ['electrical', 'thermal'],
    keywords: ['arc flash', 'switching', 'breaker', 'termination'],
  },
  {
    category: 'Fall',
    description: 'Fall from pole, bucket, or structure during line work',
    defaultEnergyTypes: ['gravity'],
    keywords: ['pole', 'bucket', 'linework', 'structure'],
  },
  {
    category: 'Pressure',
    description: 'Gas line rupture during main tie-in or service connection',
    defaultEnergyTypes: ['pressure', 'chemical'],
    keywords: ['gas main', 'tie-in', 'service', 'rupture'],
  },
  {
    category: 'Confined space',
    description: 'Atmospheric hazard in vault, manhole, or padmount enclosure',
    defaultEnergyTypes: ['chemical', 'electrical'],
    keywords: ['vault', 'manhole', 'padmount', 'confined space'],
  },
  {
    category: 'Struck-by',
    description: 'Struck by falling conductor or hardware during change-out',
    defaultEnergyTypes: ['gravity', 'electrical'],
    keywords: ['conductor', 'hardware', 'change-out', 'falling'],
  },
  {
    category: 'Mobile equipment',
    description: 'Dig-in to buried electric or gas during utility locate miss',
    defaultEnergyTypes: ['electrical', 'pressure'],
    keywords: ['dig-in', 'locate', 'buried utility'],
  },
];

export const UTILITIES_CONTROLS: ControlSeed[] = [
  {
    controlType: 'engineering',
    description:
      'De-energization, grounding, and verification before contact work',
    hazardCategories: ['Electrical'],
    energyTypes: ['electrical'],
    controlClass: 'direct',
  },
  {
    controlType: 'engineering',
    description: 'Equipotential grounding (EPZ) mat and bonding for linework',
    hazardCategories: ['Electrical'],
    energyTypes: ['electrical'],
    controlClass: 'direct',
  },
  {
    controlType: 'administrative',
    description:
      'Arc flash study labels and PPE category matched to incident energy',
    hazardCategories: ['Electrical'],
    controlClass: 'alternative',
  },
  {
    controlType: 'engineering',
    description:
      'Fall restraint or fall arrest with rated anchor on poles/structures',
    hazardCategories: ['Fall'],
    energyTypes: ['gravity'],
    controlClass: 'direct',
  },
  {
    controlType: 'administrative',
    description: 'Gas line isolation, purge, and LEL monitoring before tie-in',
    hazardCategories: ['Pressure'],
    energyTypes: ['pressure', 'chemical'],
    controlClass: 'alternative',
  },
  {
    controlType: 'administrative',
    description:
      'Mandatory One-Call / utility locate with hand expose in tolerance zone',
    hazardCategories: ['Mobile equipment', 'Utility strike'],
    controlClass: 'alternative',
  },
];

export const GENERAL_EXTENDED_HAZARDS: HazardSeed[] = [
  {
    category: 'Working alone',
    description: 'Working alone in remote area without timely communication',
    defaultEnergyTypes: ['motion'],
    keywords: ['alone', 'remote', 'lone worker', 'isolated'],
  },
  {
    category: 'Drowning',
    description: 'Drowning or immersion in water during marine or flood work',
    defaultEnergyTypes: ['gravity'],
    keywords: ['drowning', 'water', 'marine', 'flood', 'boat'],
  },
  {
    category: 'Explosion',
    description: 'Explosion in classified area or dust-laden space',
    defaultEnergyTypes: ['chemical', 'pressure'],
    keywords: ['explosion', 'classified', 'combustible dust'],
  },
  {
    category: 'Cold stress',
    description: 'Cold stress or hypothermia during winter outdoor work',
    defaultEnergyTypes: ['thermal'],
    keywords: ['cold', 'hypothermia', 'winter', 'frostbite'],
  },
  {
    category: 'Aviation',
    description: 'Rotor wash or helicopter landing zone incident',
    defaultEnergyTypes: ['gravity', 'mechanical'],
    keywords: ['helicopter', 'rotor', 'LZ', 'aviation'],
  },
  {
    category: 'Material handling',
    description: 'Load shift or tip during forklift or telehandler operation',
    defaultEnergyTypes: ['gravity', 'mechanical'],
    keywords: ['forklift', 'telehandler', 'load shift', 'tip'],
  },
  {
    category: 'Process safety',
    description: 'Runaway reaction or exotherm during batch mixing',
    defaultEnergyTypes: ['thermal', 'chemical'],
    keywords: ['runaway', 'exotherm', 'batch', 'reaction'],
  },
  {
    category: 'Biosafety',
    description: 'Needlestick or sharps injury during medical/waste handling',
    defaultEnergyTypes: ['biological'],
    keywords: ['needlestick', 'sharps', 'medical waste'],
  },
  {
    category: 'Psychosocial',
    description: 'Stress or distraction from concurrent production pressure',
    defaultEnergyTypes: ['motion'],
    keywords: ['stress', 'distraction', 'production pressure'],
  },
  {
    category: 'COVID/Biological',
    description:
      'Infectious disease transmission in shared crew transport or camp',
    defaultEnergyTypes: ['biological'],
    keywords: ['infectious', 'camp', 'crew transport'],
  },
];

export const GENERAL_EXTENDED_CONTROLS: ControlSeed[] = [
  {
    controlType: 'administrative',
    description: 'Lone worker check-in protocol with escalation (30/60 min)',
    hazardCategories: ['Working alone'],
    controlClass: 'alternative',
  },
  {
    controlType: 'engineering',
    description: 'Life jacket / PFD required within 3 m of water or on vessels',
    hazardCategories: ['Drowning'],
    energyTypes: ['gravity'],
    controlClass: 'direct',
  },
  {
    controlType: 'engineering',
    description:
      'Intrinsically safe tools and hot work ban in classified zones',
    hazardCategories: ['Explosion', 'Fire'],
    energyTypes: ['chemical'],
    controlClass: 'direct',
  },
  {
    controlType: 'administrative',
    description: 'Cold exposure work/rest schedule and heated shelter breaks',
    hazardCategories: ['Cold stress', 'Weather'],
    controlClass: 'alternative',
  },
  {
    controlType: 'administrative',
    description:
      'Helicopter LZ certified, rotor wash exclusion, and passenger briefing',
    hazardCategories: ['Aviation'],
    controlClass: 'alternative',
  },
  {
    controlType: 'administrative',
    description:
      'Forklift pre-use inspection, load capacity chart, and seat belt use',
    hazardCategories: ['Material handling', 'Mobile equipment'],
    controlClass: 'alternative',
  },
  {
    controlType: 'administrative',
    description:
      'Two-person verification for batch chemistry and reaction monitoring',
    hazardCategories: ['Process safety', 'Chemical'],
    controlClass: 'alternative',
  },
  {
    controlType: 'engineering',
    description:
      'Sharps containers and engineered needleless systems where feasible',
    hazardCategories: ['Biosafety'],
    controlClass: 'direct',
  },
  {
    controlType: 'administrative',
    description:
      'Stop-work authority when production pressure compromises safety',
    hazardCategories: ['Psychosocial'],
    controlClass: 'alternative',
  },
  {
    controlType: 'administrative',
    description:
      'Direct control verification checklist (CSRA) before high-energy task start',
    hazardCategories: [],
    controlClass: 'alternative',
  },
  {
    controlType: 'engineering',
    description:
      'Physical machine interlock or guard that prevents access while energized',
    hazardCategories: ['Mechanical', 'Caught-in'],
    energyTypes: ['mechanical'],
    controlClass: 'direct',
  },
  {
    controlType: 'engineering',
    description:
      'Self-retracting lifeline (SRL) to rated anchor — error-tolerant fall protection',
    hazardCategories: ['Fall'],
    energyTypes: ['gravity'],
    controlClass: 'direct',
  },
  {
    controlType: 'engineering',
    description:
      'Double-block-and-bleed with verified zero energy before line break',
    hazardCategories: ['Pressure', 'Line of fire'],
    energyTypes: ['pressure'],
    controlClass: 'direct',
  },
  {
    controlType: 'administrative',
    description:
      'Alternative control plan when direct control is infeasible (CSRA documented)',
    hazardCategories: [],
    controlClass: 'alternative',
  },
];

export const EXTENDED_HAZARDS: HazardSeed[] = [
  ...CONSTRUCTION_HAZARDS,
  ...OIL_GAS_HAZARDS,
  ...FORESTRY_HAZARDS,
  ...UTILITIES_HAZARDS,
  ...GENERAL_EXTENDED_HAZARDS,
];

export const EXTENDED_CONTROLS: ControlSeed[] = [
  ...CONSTRUCTION_CONTROLS,
  ...OIL_GAS_CONTROLS,
  ...FORESTRY_CONTROLS,
  ...UTILITIES_CONTROLS,
  ...GENERAL_EXTENDED_CONTROLS,
];
