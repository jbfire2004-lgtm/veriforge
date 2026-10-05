"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JHA_INDUSTRY_PACKS = exports.TURNAROUND_CONTROLS = exports.TURNAROUND_HAZARDS = exports.PIPELINE_CONTROLS = exports.PIPELINE_HAZARDS = exports.MINING_CONTROLS = exports.MINING_HAZARDS = void 0;
exports.resolveIndustryPacks = resolveIndustryPacks;
exports.seedsForPacks = seedsForPacks;
exports.packLabels = packLabels;
const jha_library_seed_extended_1 = require("./jha-library-seed-extended");
exports.MINING_HAZARDS = [
    {
        category: 'Ground control',
        description: 'Rock fall or ground instability in underground workings',
        defaultEnergyTypes: ['gravity'],
        keywords: ['underground', 'ground control', 'rock fall', 'mining'],
    },
    {
        category: 'Ground control',
        description: 'Highwall or bench failure at open pit',
        defaultEnergyTypes: ['gravity'],
        keywords: ['open pit', 'highwall', 'bench', 'mining'],
    },
    {
        category: 'Mobile equipment',
        description: 'Haul truck / loader interaction in pit or haul road',
        defaultEnergyTypes: ['mechanical'],
        keywords: ['haul truck', 'loader', 'pit', 'mining'],
    },
    {
        category: 'Mobile equipment',
        description: 'Underground mobile equipment in restricted headings',
        defaultEnergyTypes: ['mechanical'],
        keywords: ['heading', 'underground', 'mobile equipment'],
    },
    {
        category: 'Blasting',
        description: 'Flyrock, misfire, or premature detonation during blast',
        defaultEnergyTypes: ['mechanical', 'pressure'],
        keywords: ['blast', 'flyrock', 'detonation', 'mining'],
    },
    {
        category: 'Blasting',
        description: 'Toxic fumes from blasting in confined headings',
        defaultEnergyTypes: ['chemical'],
        keywords: ['blast fumes', 'NO2', 'underground blast'],
    },
    {
        category: 'Confined space',
        description: 'Oxygen deficiency in stopes, raises, or sumps',
        defaultEnergyTypes: ['chemical', 'biological'],
        keywords: ['stope', 'raise', 'sump', 'underground'],
    },
    {
        category: 'Electrical',
        description: 'Contact with trailing cables or underground distribution',
        defaultEnergyTypes: ['electrical'],
        keywords: ['trailing cable', 'underground electrical'],
    },
    {
        category: 'Dust',
        description: 'Respirable silica or coal dust overexposure',
        defaultEnergyTypes: ['chemical'],
        keywords: ['silica', 'coal dust', 'respirable', 'mining'],
    },
    {
        category: 'Water',
        description: 'Inrush of water or uncontrolled dewatering',
        defaultEnergyTypes: ['pressure', 'gravity'],
        keywords: ['inrush', 'dewatering', 'water', 'mining'],
    },
    {
        category: 'Lifting',
        description: 'Shaft conveyance or cage operation failure',
        defaultEnergyTypes: ['gravity', 'mechanical'],
        keywords: ['shaft', 'cage', 'conveyance', 'hoist'],
    },
    {
        category: 'Thermal',
        description: 'Heat stress in deep or hot underground environments',
        defaultEnergyTypes: ['thermal'],
        keywords: ['deep mine', 'heat', 'underground heat'],
    },
];
exports.MINING_CONTROLS = [
    {
        controlType: 'engineering',
        description: 'Ground support — bolts, mesh, shotcrete per ground control plan',
        hazardCategories: ['Ground control'],
        energyTypes: ['gravity'],
    },
    {
        controlType: 'engineering',
        description: 'Highwall monitoring and geotechnical trigger-action-response plan',
        hazardCategories: ['Ground control'],
    },
    {
        controlType: 'administrative',
        description: 'Blast area exclusion, misfire procedure, and licensed blaster',
        hazardCategories: ['Blasting'],
    },
    {
        controlType: 'engineering',
        description: 'Ventilation plan with gas monitoring and airflow verification',
        hazardCategories: ['Confined space', 'Dust', 'Blasting'],
        energyTypes: ['chemical'],
    },
    {
        controlType: 'administrative',
        description: 'Traffic management plan for haul roads and pit interactions',
        hazardCategories: ['Mobile equipment'],
    },
    {
        controlType: 'administrative',
        description: 'Tag-in/tag-out and lone worker check-in for underground',
        hazardCategories: ['Confined space', 'Mobile equipment'],
    },
    {
        controlType: 'ppe',
        description: 'Approved P100 / dust respirator for silica or coal dust',
        hazardCategories: ['Dust'],
        ppeRequired: true,
    },
    {
        controlType: 'engineering',
        description: 'Dewatering controls and inrush barriers per mine plan',
        hazardCategories: ['Water'],
        energyTypes: ['pressure'],
    },
    {
        controlType: 'administrative',
        description: 'Shaft inspection and conveyance lockout before maintenance',
        hazardCategories: ['Lifting'],
        energyTypes: ['gravity'],
    },
];
exports.PIPELINE_HAZARDS = [
    {
        category: 'Pressure',
        description: 'Uncontrolled release from live pipeline or facility piping',
        defaultEnergyTypes: ['pressure', 'chemical'],
        keywords: ['pipeline', 'live line', 'hydrocarbon', 'release'],
    },
    {
        category: 'Pressure',
        description: 'Over-pressurization during hydrotest or commissioning',
        defaultEnergyTypes: ['pressure'],
        keywords: ['hydrotest', 'commissioning', 'pipeline'],
    },
    {
        category: 'Excavation',
        description: 'Third-party or operator pipeline strike during excavation',
        defaultEnergyTypes: ['pressure', 'electrical'],
        keywords: ['line strike', 'excavation', 'one-call', 'pipeline'],
    },
    {
        category: 'Fire',
        description: 'Ignition of hydrocarbon release during maintenance',
        defaultEnergyTypes: ['chemical', 'thermal'],
        keywords: ['hydrocarbon', 'ignition', 'pipeline', 'hot work'],
    },
    {
        category: 'Confined space',
        description: 'Atmospheric hazard inside valve pit, launcher, or receiver',
        defaultEnergyTypes: ['chemical'],
        keywords: ['valve pit', 'pig launcher', 'confined space', 'pipeline'],
    },
    {
        category: 'Chemical',
        description: 'H2S or benzene exposure during line breaking or venting',
        defaultEnergyTypes: ['chemical'],
        keywords: ['H2S', 'benzene', 'line break', 'venting'],
    },
    {
        category: 'Mechanical',
        description: 'Pinch points during pipe handling, bending, or welding',
        defaultEnergyTypes: ['mechanical'],
        keywords: ['pipe handling', 'welding', 'pipeline'],
    },
    {
        category: 'Lifting',
        description: 'Rigging failure during valve or spool lift',
        defaultEnergyTypes: ['gravity', 'mechanical'],
        keywords: ['valve lift', 'spool', 'rigging', 'pipeline'],
    },
    {
        category: 'Environmental',
        description: 'Erosion or watercourse crossing disturbance',
        defaultEnergyTypes: ['gravity'],
        keywords: ['watercourse', 'crossing', 'erosion', 'pipeline'],
    },
    {
        category: 'Utility strike',
        description: 'Parallel or crossing utility conflict during ROW work',
        defaultEnergyTypes: ['electrical', 'pressure'],
        keywords: ['ROW', 'utility', 'crossing', 'pipeline'],
    },
    {
        category: 'Cold work',
        description: 'Static ignition during fuel transfer or gauging',
        defaultEnergyTypes: ['electrical', 'chemical'],
        keywords: ['static', 'fuel transfer', 'gauging'],
    },
    {
        category: 'Integrity',
        description: 'Coating damage leading to external corrosion',
        defaultEnergyTypes: ['chemical'],
        keywords: ['coating', 'corrosion', 'CP', 'pipeline'],
    },
];
exports.PIPELINE_CONTROLS = [
    {
        controlType: 'administrative',
        description: 'Isolation, zero energy verification, and line break permit',
        hazardCategories: ['Pressure', 'Chemical', 'Fire'],
        energyTypes: ['pressure', 'chemical'],
    },
    {
        controlType: 'administrative',
        description: 'One-Call / line locate and hand expose within tolerance',
        hazardCategories: ['Excavation', 'Utility strike'],
    },
    {
        controlType: 'engineering',
        description: 'Blind flanges, spades, and double-block-and-bleed for isolation',
        hazardCategories: ['Pressure'],
        energyTypes: ['pressure'],
    },
    {
        controlType: 'engineering',
        description: 'Gas detection and continuous atmospheric monitoring at openings',
        hazardCategories: ['Confined space', 'Chemical', 'Fire'],
        energyTypes: ['chemical'],
    },
    {
        controlType: 'administrative',
        description: 'Hot work permit with fire watch and LEL monitoring',
        hazardCategories: ['Fire'],
        energyTypes: ['chemical', 'thermal'],
    },
    {
        controlType: 'administrative',
        description: 'Hydrotest procedure with pressure relief and exclusion zone',
        hazardCategories: ['Pressure'],
    },
    {
        controlType: 'administrative',
        description: 'ERP and spill kit staged for hydrocarbon release scenarios',
        hazardCategories: ['Pressure', 'Fire', 'Environmental'],
    },
    {
        controlType: 'engineering',
        description: 'Bonding, grounding, and approved tools in classified areas',
        hazardCategories: ['Cold work', 'Fire'],
        energyTypes: ['electrical'],
    },
    {
        controlType: 'administrative',
        description: 'Coating inspection and holiday testing before backfill',
        hazardCategories: ['Integrity'],
    },
    {
        controlType: 'ppe',
        description: 'Supplied-air or SCBA for H2S potential above action level',
        hazardCategories: ['Chemical', 'Confined space'],
        ppeRequired: true,
    },
];
exports.TURNAROUND_HAZARDS = [
    {
        category: 'Simultaneous operations',
        description: 'SIMOPS conflict — overlapping hot work, lifting, and vessel entry',
        defaultEnergyTypes: ['thermal', 'mechanical'],
        keywords: ['SIMOPS', 'turnaround', 'TAR', 'overlap'],
    },
    {
        category: 'Pressure',
        description: 'Opening equipment before verified decontamination and isolation',
        defaultEnergyTypes: ['pressure', 'chemical'],
        keywords: ['opening', 'decontamination', 'isolation', 'turnaround'],
    },
    {
        category: 'Confined space',
        description: 'Vessel or column entry with residual hydrocarbon or nitrogen purge',
        defaultEnergyTypes: ['chemical'],
        keywords: ['vessel entry', 'column', 'purge', 'turnaround'],
    },
    {
        category: 'Lifting',
        description: 'Critical lift of exchanger, vessel, or module during outage',
        defaultEnergyTypes: ['gravity', 'mechanical'],
        keywords: ['critical lift', 'exchanger', 'module', 'turnaround'],
    },
    {
        category: 'Fire',
        description: 'Hot work on live adjacent equipment during outage',
        defaultEnergyTypes: ['thermal', 'chemical'],
        keywords: ['hot work', 'adjacent', 'turnaround', 'TAR'],
    },
    {
        category: 'Chemical',
        description: 'Unexpected chemical release during line breaking or blind removal',
        defaultEnergyTypes: ['chemical', 'pressure'],
        keywords: ['line break', 'blind', 'release', 'turnaround'],
    },
    {
        category: 'Electrical',
        description: 'LOTO boundary failure across multi-contractor work fronts',
        defaultEnergyTypes: ['electrical'],
        keywords: ['LOTO', 'multi-contractor', 'turnaround'],
    },
    {
        category: 'Fall',
        description: 'Work at height on scaffolding around columns and towers',
        defaultEnergyTypes: ['gravity'],
        keywords: ['scaffold', 'tower', 'height', 'turnaround'],
    },
    {
        category: 'Fatigue',
        description: 'Extended shifts and fatigue during 24/7 outage schedule',
        defaultEnergyTypes: ['motion'],
        keywords: ['fatigue', '24/7', 'outage', 'turnaround'],
    },
    {
        category: 'Mechanical',
        description: 'Stored energy in spring-loaded valves or tensioned systems',
        defaultEnergyTypes: ['mechanical', 'pressure'],
        keywords: ['spring-loaded', 'stored energy', 'valve', 'turnaround'],
    },
    {
        category: 'Environmental',
        description: 'Noise exposure from multiple concurrent impact tools',
        defaultEnergyTypes: ['mechanical'],
        keywords: ['noise', 'impact tools', 'turnaround'],
    },
    {
        category: 'Mobile equipment',
        description: 'Crane and manlift congestion in limited laydown areas',
        defaultEnergyTypes: ['mechanical'],
        keywords: ['crane', 'manlift', 'laydown', 'turnaround'],
    },
];
exports.TURNAROUND_CONTROLS = [
    {
        controlType: 'administrative',
        description: 'SIMOPS matrix and daily coordination meeting with all contractors',
        hazardCategories: ['Simultaneous operations'],
    },
    {
        controlType: 'administrative',
        description: 'Master LOTO plan with group lockbox and shift handover log',
        hazardCategories: ['Electrical', 'Pressure', 'Mechanical'],
        energyTypes: ['electrical', 'pressure'],
    },
    {
        controlType: 'administrative',
        description: 'Vessel entry permit with continuous gas monitoring and attendant',
        hazardCategories: ['Confined space', 'Chemical'],
        energyTypes: ['chemical'],
    },
    {
        controlType: 'engineering',
        description: 'Verified decontamination, flushing, and blind list before opening',
        hazardCategories: ['Pressure', 'Chemical'],
        energyTypes: ['pressure', 'chemical'],
    },
    {
        controlType: 'administrative',
        description: 'Critical lift plan reviewed by engineer and rigging supervisor',
        hazardCategories: ['Lifting'],
        energyTypes: ['gravity'],
    },
    {
        controlType: 'administrative',
        description: 'Hot work barricade with fire watch and adjacent equipment protection',
        hazardCategories: ['Fire', 'Simultaneous operations'],
        energyTypes: ['thermal'],
    },
    {
        controlType: 'administrative',
        description: 'Fatigue management — max hours, rest breaks, and night work limits',
        hazardCategories: ['Fatigue'],
    },
    {
        controlType: 'engineering',
        description: 'Scaffold tag system and 100% tie-off above 1.8 m',
        hazardCategories: ['Fall'],
        energyTypes: ['gravity'],
    },
    {
        controlType: 'administrative',
        description: 'Turnaround traffic and laydown plan with spotters and one-way routes',
        hazardCategories: ['Mobile equipment'],
    },
    {
        controlType: 'administrative',
        description: 'Line breaking checklist with zero energy and PPE for residual product',
        hazardCategories: ['Chemical', 'Pressure'],
    },
];
exports.JHA_INDUSTRY_PACKS = [
    {
        id: 'mining',
        label: 'Mining',
        industryMatchers: [
            'mining',
            'mine',
            'underground',
            'open pit',
            'quarry',
            'coal',
            'mineral',
        ],
        hazards: exports.MINING_HAZARDS,
        controls: exports.MINING_CONTROLS,
    },
    {
        id: 'pipeline',
        label: 'Pipeline & midstream',
        industryMatchers: [
            'pipeline',
            'midstream',
            'transmission',
            'gathering',
            'pipe',
            'integrity',
        ],
        hazards: exports.PIPELINE_HAZARDS,
        controls: exports.PIPELINE_CONTROLS,
    },
    {
        id: 'turnaround',
        label: 'Turnaround / outage',
        industryMatchers: [
            'turnaround',
            'tar',
            'outage',
            'shutdown',
            'maintenance outage',
            'refinery turnaround',
        ],
        hazards: exports.TURNAROUND_HAZARDS,
        controls: exports.TURNAROUND_CONTROLS,
    },
    {
        id: 'construction',
        label: 'Construction',
        industryMatchers: [
            'construction',
            'contractor',
            'civil',
            'building',
            'commercial',
            'industrial build',
        ],
        hazards: jha_library_seed_extended_1.CONSTRUCTION_HAZARDS,
        controls: jha_library_seed_extended_1.CONSTRUCTION_CONTROLS,
    },
    {
        id: 'oil_gas',
        label: 'Oil & gas',
        industryMatchers: [
            'oil',
            'gas',
            'petroleum',
            'upstream',
            'downstream',
            'wellsite',
            'drilling',
            'production',
        ],
        hazards: jha_library_seed_extended_1.OIL_GAS_HAZARDS,
        controls: jha_library_seed_extended_1.OIL_GAS_CONTROLS,
    },
    {
        id: 'forestry',
        label: 'Forestry & logging',
        industryMatchers: [
            'forestry',
            'logging',
            'silviculture',
            'tree',
            'wood',
            'lumber',
        ],
        hazards: jha_library_seed_extended_1.FORESTRY_HAZARDS,
        controls: jha_library_seed_extended_1.FORESTRY_CONTROLS,
    },
    {
        id: 'utilities',
        label: 'Utilities & electrical',
        industryMatchers: [
            'utility',
            'utilities',
            'electric',
            'linework',
            'distribution',
            'transmission',
            'power',
        ],
        hazards: jha_library_seed_extended_1.UTILITIES_HAZARDS,
        controls: jha_library_seed_extended_1.UTILITIES_CONTROLS,
    },
];
function resolveIndustryPacks(industry) {
    if (!(industry === null || industry === void 0 ? void 0 : industry.trim()))
        return exports.JHA_INDUSTRY_PACKS.map((p) => p.id);
    const normalized = industry.toLowerCase();
    const matched = exports.JHA_INDUSTRY_PACKS.filter((p) => p.industryMatchers.some((m) => normalized.includes(m))).map((p) => p.id);
    return matched.length > 0 ? matched : exports.JHA_INDUSTRY_PACKS.map((p) => p.id);
}
function seedsForPacks(packIds) {
    const hazards = [];
    const controls = [];
    const hazardDesc = new Set();
    const controlDesc = new Set();
    for (const pack of exports.JHA_INDUSTRY_PACKS.filter((p) => packIds.includes(p.id))) {
        for (const h of pack.hazards) {
            if (!hazardDesc.has(h.description)) {
                hazardDesc.add(h.description);
                hazards.push(h);
            }
        }
        for (const c of pack.controls) {
            if (!controlDesc.has(c.description)) {
                controlDesc.add(c.description);
                controls.push(c);
            }
        }
    }
    return { hazards, controls };
}
function packLabels(packIds) {
    return exports.JHA_INDUSTRY_PACKS.filter((p) => packIds.includes(p.id)).map((p) => p.label);
}
//# sourceMappingURL=jha-industry-packs.js.map