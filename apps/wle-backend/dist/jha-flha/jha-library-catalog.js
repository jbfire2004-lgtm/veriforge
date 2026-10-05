"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TASK_HAZARD_PROFILES = exports.CONTROL_CLASS_LOOKUP = void 0;
exports.getCompleteCatalog = getCompleteCatalog;
const jha_control_class_1 = require("./jha-control-class");
const jha_library_seed_extended_1 = require("./jha-library-seed-extended");
const jha_library_seed_1 = require("./jha-library-seed");
const jha_industry_packs_1 = require("./jha-industry-packs");
function dedupeHazards(list) {
    const seen = new Set();
    const out = [];
    for (const h of list) {
        const key = h.description.toLowerCase().trim();
        if (seen.has(key))
            continue;
        seen.add(key);
        out.push(h);
    }
    return out;
}
function normalizeControl(c) {
    var _a;
    return Object.assign(Object.assign({}, c), { controlClass: (_a = c.controlClass) !== null && _a !== void 0 ? _a : (0, jha_control_class_1.inferControlClass)(c.controlType, c.energyTypes, c.hazardCategories) });
}
function dedupeControls(list) {
    const seen = new Set();
    const out = [];
    for (const c of list) {
        const key = c.description.toLowerCase().trim();
        if (seen.has(key))
            continue;
        seen.add(key);
        out.push(normalizeControl(c));
    }
    return out;
}
function getCompleteCatalog() {
    const hazards = [
        ...jha_library_seed_1.FULL_HAZARD_SEED,
        ...jha_industry_packs_1.JHA_INDUSTRY_PACKS.flatMap((p) => p.hazards),
        ...jha_library_seed_extended_1.EXTENDED_HAZARDS,
        ...jha_library_seed_extended_1.CONSTRUCTION_HAZARDS,
        ...jha_library_seed_extended_1.OIL_GAS_HAZARDS,
        ...jha_library_seed_extended_1.FORESTRY_HAZARDS,
        ...jha_library_seed_extended_1.UTILITIES_HAZARDS,
    ];
    const controls = [
        ...jha_library_seed_1.FULL_CONTROL_SEED,
        ...jha_industry_packs_1.JHA_INDUSTRY_PACKS.flatMap((p) => p.controls),
        ...jha_library_seed_extended_1.EXTENDED_CONTROLS,
        ...jha_library_seed_extended_1.CONSTRUCTION_CONTROLS,
        ...jha_library_seed_extended_1.OIL_GAS_CONTROLS,
        ...jha_library_seed_extended_1.FORESTRY_CONTROLS,
        ...jha_library_seed_extended_1.UTILITIES_CONTROLS,
    ];
    return {
        hazards: dedupeHazards(hazards),
        controls: dedupeControls(controls),
    };
}
exports.CONTROL_CLASS_LOOKUP = (() => {
    var _a;
    const map = new Map();
    for (const c of getCompleteCatalog().controls) {
        map.set(c.description.toLowerCase().trim(), (_a = c.controlClass) !== null && _a !== void 0 ? _a : 'alternative');
    }
    return map;
})();
exports.TASK_HAZARD_PROFILES = [
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
//# sourceMappingURL=jha-library-catalog.js.map