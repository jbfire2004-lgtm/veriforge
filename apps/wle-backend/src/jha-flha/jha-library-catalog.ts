import type { ControlSeed, HazardSeed } from './jha-library-seed';
import { inferControlClass } from './jha-control-class';
import {
  CONSTRUCTION_CONTROLS,
  CONSTRUCTION_HAZARDS,
  EXTENDED_CONTROLS,
  EXTENDED_HAZARDS,
  FORESTRY_CONTROLS,
  FORESTRY_HAZARDS,
  OIL_GAS_CONTROLS,
  OIL_GAS_HAZARDS,
  UTILITIES_CONTROLS,
  UTILITIES_HAZARDS,
} from './jha-library-seed-extended';
import { FULL_CONTROL_SEED, FULL_HAZARD_SEED } from './jha-library-seed';
import { JHA_INDUSTRY_PACKS } from './jha-industry-packs';

function dedupeHazards(list: HazardSeed[]): HazardSeed[] {
  const seen = new Set<string>();
  const out: HazardSeed[] = [];
  for (const h of list) {
    const key = h.description.toLowerCase().trim();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(h);
  }
  return out;
}

function normalizeControl(c: ControlSeed): ControlSeed {
  return {
    ...c,
    controlClass:
      c.controlClass ??
      inferControlClass(c.controlType, c.energyTypes, c.hazardCategories),
  };
}

function dedupeControls(list: ControlSeed[]): ControlSeed[] {
  const seen = new Set<string>();
  const out: ControlSeed[] = [];
  for (const c of list) {
    const key = c.description.toLowerCase().trim();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(normalizeControl(c));
  }
  return out;
}

/** Complete master catalog — base + all industry packs + extended (always seed entire library). */
export function getCompleteCatalog(): {
  hazards: HazardSeed[];
  controls: ControlSeed[];
} {
  const hazards: HazardSeed[] = [
    ...FULL_HAZARD_SEED,
    ...JHA_INDUSTRY_PACKS.flatMap((p) => p.hazards),
    ...EXTENDED_HAZARDS,
    ...CONSTRUCTION_HAZARDS,
    ...OIL_GAS_HAZARDS,
    ...FORESTRY_HAZARDS,
    ...UTILITIES_HAZARDS,
  ];
  const controls: ControlSeed[] = [
    ...FULL_CONTROL_SEED,
    ...JHA_INDUSTRY_PACKS.flatMap((p) => p.controls),
    ...EXTENDED_CONTROLS,
    ...CONSTRUCTION_CONTROLS,
    ...OIL_GAS_CONTROLS,
    ...FORESTRY_CONTROLS,
    ...UTILITIES_CONTROLS,
  ];
  return {
    hazards: dedupeHazards(hazards),
    controls: dedupeControls(controls),
  };
}

export const CONTROL_CLASS_LOOKUP: Map<string, ControlSeed['controlClass']> =
  (() => {
    const map = new Map<string, ControlSeed['controlClass']>();
    for (const c of getCompleteCatalog().controls) {
      map.set(
        c.description.toLowerCase().trim(),
        c.controlClass ?? 'alternative',
      );
    }
    return map;
  })();

export const TASK_HAZARD_PROFILES: Array<{
  id: string;
  label: string;
  tokens: string[];
  hazardCategories: string[];
  hazardKeywords: string[];
  energyTypes: string[];
  requiredControlCategories: string[];
  minDirectControls?: number;
}> = [
  {
    id: 'hot_work',
    label: 'Hot work / welding',
    tokens: [
      'weld',
      'welding',
      'cutting',
      'grinding',
      'hot work',
      'torch',
      'brazing',
    ],
    hazardCategories: ['Fire', 'Thermal'],
    hazardKeywords: ['hot work', 'fire', 'welding', 'burn', 'fume'],
    energyTypes: ['thermal', 'chemical'],
    requiredControlCategories: ['Fire'],
    minDirectControls: 1,
  },
  {
    id: 'height',
    label: 'Work at height',
    tokens: [
      'height',
      'ladder',
      'scaffold',
      'roof',
      'platform',
      'elevated',
      'leading edge',
    ],
    hazardCategories: ['Fall'],
    hazardKeywords: ['fall', 'ladder', 'scaffold', 'height', 'edge'],
    energyTypes: ['gravity'],
    requiredControlCategories: ['Fall'],
    minDirectControls: 1,
  },
  {
    id: 'excavation',
    label: 'Excavation / trenching',
    tokens: ['excavat', 'trench', 'dig', 'shoring', 'bore', 'hdd'],
    hazardCategories: ['Excavation', 'Utility strike'],
    hazardKeywords: ['trench', 'excavation', 'collapse', 'utility', 'strike'],
    energyTypes: ['gravity', 'pressure', 'electrical'],
    requiredControlCategories: ['Excavation'],
    minDirectControls: 1,
  },
  {
    id: 'confined_space',
    label: 'Confined space entry',
    tokens: [
      'confined',
      'manhole',
      'vault',
      'vessel entry',
      'tank entry',
      'enclosed',
    ],
    hazardCategories: ['Confined space'],
    hazardKeywords: ['confined space', 'atmospheric', 'oxygen', 'entry'],
    energyTypes: ['chemical', 'biological'],
    requiredControlCategories: ['Confined space'],
    minDirectControls: 1,
  },
  {
    id: 'lifting',
    label: 'Crane / rigging / lifting',
    tokens: ['crane', 'rigging', 'lift', 'hoist', 'load', 'suspended'],
    hazardCategories: ['Lifting', 'Struck-by'],
    hazardKeywords: ['crane', 'rigging', 'lift', 'load', 'suspended'],
    energyTypes: ['gravity', 'mechanical'],
    requiredControlCategories: ['Lifting'],
    minDirectControls: 1,
  },
  {
    id: 'electrical',
    label: 'Electrical work',
    tokens: [
      'electrical',
      'energized',
      'voltage',
      'switchgear',
      'panel',
      'linework',
      'arc flash',
    ],
    hazardCategories: ['Electrical'],
    hazardKeywords: ['electrical', 'energized', 'arc', 'conductor'],
    energyTypes: ['electrical'],
    requiredControlCategories: ['Electrical'],
    minDirectControls: 1,
  },
  {
    id: 'pressure',
    label: 'Line breaking / pressure work',
    tokens: [
      'line break',
      'hydrotest',
      'pressure',
      'hydraulic',
      'pneumatic',
      'blind',
      'isolation',
    ],
    hazardCategories: ['Pressure', 'Line of fire'],
    hazardKeywords: ['pressure', 'hydraulic', 'line break', 'release'],
    energyTypes: ['pressure'],
    requiredControlCategories: ['Pressure'],
    minDirectControls: 1,
  },
  {
    id: 'chemical',
    label: 'Chemical handling',
    tokens: [
      'chemical',
      'sds',
      'h2s',
      'benzene',
      'solvent',
      'drum',
      'transfer',
      'mixing',
    ],
    hazardCategories: ['Chemical'],
    hazardKeywords: ['chemical', 'vapor', 'h2s', 'sds', 'corrosive'],
    energyTypes: ['chemical'],
    requiredControlCategories: ['Chemical'],
  },
  {
    id: 'mobile_equipment',
    label: 'Mobile equipment / traffic',
    tokens: [
      'forklift',
      'excavator',
      'loader',
      'haul',
      'traffic',
      'vehicle',
      'pedestrian',
    ],
    hazardCategories: ['Mobile equipment', 'Struck-by'],
    hazardKeywords: ['vehicle', 'equipment', 'pedestrian', 'traffic', 'struck'],
    energyTypes: ['mechanical'],
    requiredControlCategories: ['Mobile equipment'],
  },
  {
    id: 'drilling',
    label: 'Drilling / wellsite',
    tokens: ['drill', 'rig', 'well', 'workover', 'bop', 'wellsite', 'frac'],
    hazardCategories: ['Well control', 'Pressure'],
    hazardKeywords: ['drill', 'kick', 'blowout', 'h2s', 'well'],
    energyTypes: ['pressure', 'chemical'],
    requiredControlCategories: ['Well control'],
    minDirectControls: 1,
  },
  {
    id: 'pipeline',
    label: 'Pipeline / midstream',
    tokens: [
      'pipeline',
      'pig',
      'launcher',
      'receiver',
      'midstream',
      'row',
      'hydrotest',
    ],
    hazardCategories: ['Pressure', 'Excavation'],
    hazardKeywords: ['pipeline', 'line break', 'hydrocarbon', 'release'],
    energyTypes: ['pressure', 'chemical'],
    requiredControlCategories: ['Pressure'],
    minDirectControls: 1,
  },
  {
    id: 'mining',
    label: 'Mining / underground',
    tokens: [
      'mine',
      'underground',
      'stope',
      'blast',
      'ground control',
      'highwall',
    ],
    hazardCategories: ['Ground control', 'Blasting'],
    hazardKeywords: ['ground control', 'blast', 'underground', 'rock fall'],
    energyTypes: ['gravity', 'mechanical'],
    requiredControlCategories: ['Ground control'],
    minDirectControls: 1,
  },
  {
    id: 'turnaround',
    label: 'Turnaround / outage',
    tokens: [
      'turnaround',
      'outage',
      'shutdown',
      'tar',
      'vessel entry',
      'simops',
    ],
    hazardCategories: ['Simultaneous operations', 'Confined space'],
    hazardKeywords: ['turnaround', 'vessel', 'simops', 'decontamination'],
    energyTypes: ['pressure', 'chemical', 'thermal'],
    requiredControlCategories: ['Confined space', 'Pressure'],
  },
  {
    id: 'silica',
    label: 'Silica / concrete cutting',
    tokens: ['silica', 'concrete cut', 'sawcut', 'grinding', 'masonry'],
    hazardCategories: ['Silica'],
    hazardKeywords: ['silica', 'concrete', 'grinding', 'cutting'],
    energyTypes: ['chemical'],
    requiredControlCategories: ['Silica'],
    minDirectControls: 1,
  },
  {
    id: 'forestry',
    label: 'Forestry / tree work',
    tokens: ['felling', 'tree', 'chainsaw', 'skidder', 'forestry', 'logging'],
    hazardCategories: ['Struck-by'],
    hazardKeywords: ['felling', 'tree', 'chainsaw', 'snag'],
    energyTypes: ['gravity', 'mechanical'],
    requiredControlCategories: ['Struck-by'],
  },
];
