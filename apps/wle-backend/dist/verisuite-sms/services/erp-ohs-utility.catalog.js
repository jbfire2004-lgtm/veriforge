"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UTILITY_CONTACT_CATALOG = exports.DANGEROUS_OCCURRENCE_RULES = void 0;
exports.detectDangerousOccurrences = detectDangerousOccurrences;
exports.utilityContactsFor = utilityContactsFor;
exports.ohsReportingGuidance = ohsReportingGuidance;
exports.appendixStepsFor = appendixStepsFor;
exports.normalizeRegion = normalizeRegion;
exports.DANGEROUS_OCCURRENCE_RULES = [
    {
        code: 'gas_line_strike',
        label: 'Gas / pipeline strike or release',
        keywords: [
            'gas',
            'saskenergy',
            'pipeline',
            'natural gas',
            'line strike',
            'hit line',
            'odor',
            'hissing',
        ],
        reportingByRegion: {
            'CA-SK': 'Saskatchewan: report dangerous occurrences / gas releases per OHS regulations; notify SaskEnergy immediately for gas infrastructure.',
            'CA-AB': 'Alberta OHS: report serious incidents / gas releases; notify ATCO Gas / utility owner and 911 if release uncontrolled.',
            'CA-BC': 'BC OHS: report dangerous occurrences involving gas; contact FortisBC / utility and emergency services.',
            'CA-MB': 'Manitoba Workplace Safety: report serious incidents; notify Manitoba Hydro / gas utility as applicable.',
            'CA-ON': 'Ontario OHSA: notify MOL for critical injuries; contact Enbridge / local gas utility for line strikes.',
        },
        defaultUtilityAgencies: ['gas', 'one_call', 'pipeline'],
        erpAppendices: [
            'Evacuate upwind / uphill from gas release',
            'Do not operate switches, vehicles, or ignition sources',
            'Call utility emergency line then 911 if fire/injury',
            'Secure perimeter; wait for utility clearance before re-entry',
        ],
    },
    {
        code: 'electrical_contact',
        label: 'Electrical contact / arc flash / power line',
        keywords: [
            'electrical',
            'arc',
            'power line',
            'energized',
            'hydro',
            'voltage',
            'shock',
        ],
        reportingByRegion: {
            'CA-SK': 'Saskatchewan OHS: electrical contact / serious injury — report; notify SaskPower for electrical infrastructure.',
            'CA-AB': 'Alberta OHS: serious electrical incidents reportable; notify ATCO Electric / EPCOR as applicable.',
            'CA-BC': 'BC OHS: report electrical contact; notify BC Hydro.',
        },
        defaultUtilityAgencies: ['electric', 'one_call'],
        erpAppendices: [
            'Assume lines energized until utility confirms',
            'Keep personnel clear of downed conductors',
            'Coordinate rescue with utility / fire rescue',
        ],
    },
    {
        code: 'excavation_cave_in',
        label: 'Excavation / trench cave-in',
        keywords: ['trench', 'excavation', 'cave-in', 'cave in', 'shoring', 'engulf'],
        reportingByRegion: {
            'CA-SK': 'Saskatchewan OHS: cave-in / engulfment — dangerous occurrence reporting may apply.',
            'CA-AB': 'Alberta OHS: trench cave-in with injury/potential fatality — reportable.',
            'CA-BC': 'BC OHS: excavation collapse — report serious injuries / dangerous occurrences.',
        },
        defaultUtilityAgencies: ['one_call'],
        erpAppendices: [
            'Do not enter trench to rescue without competent rescue plan',
            'Account personnel at trench muster',
            'Stabilize only under competent person direction',
        ],
    },
    {
        code: 'chemical_release',
        label: 'Chemical / hazardous substance release',
        keywords: ['chemical', 'spill', 'release', 'hazmat', 'toxic', 'sds'],
        reportingByRegion: {
            'CA-SK': 'Saskatchewan: report dangerous chemical releases per OHS / environmental rules.',
            'CA-AB': 'Alberta: report serious chemical exposures / releases to OHS and environment as required.',
            'CA-BC': 'BC: report dangerous chemical occurrences; follow SDS emergency procedures.',
        },
        defaultUtilityAgencies: [],
        erpAppendices: [
            'Evacuate upwind; consult SDS',
            'Contain only if trained and safe',
            'Notify EMS / fire hazmat as required',
        ],
    },
    {
        code: 'crane_failure',
        label: 'Crane / lifting failure',
        keywords: ['crane', 'rigging', 'critical lift', 'dropped load', 'overturn'],
        reportingByRegion: {
            'CA-SK': 'Saskatchewan OHS: serious equipment failure / near fatality may be reportable.',
            'CA-AB': 'Alberta OHS: crane incidents with injury or structural risk — reportable.',
        },
        defaultUtilityAgencies: [],
        erpAppendices: [
            'Establish exclusion zone around load path',
            'Account signalperson / operator',
            'Do not attempt recovery until competent person clears',
        ],
    },
    {
        code: 'fire_explosion',
        label: 'Fire / explosion',
        keywords: ['fire', 'explosion', 'blast', 'smoke', 'burn'],
        reportingByRegion: {
            'CA-SK': 'Saskatchewan: fires/explosions with injury or structural risk — OHS reporting may apply.',
            'CA-AB': 'Alberta: workplace fires/explosions — report serious injuries; call 911.',
        },
        defaultUtilityAgencies: ['gas', 'electric'],
        erpAppendices: [
            'Activate alarm; evacuate to muster',
            'Fight fire only if trained and escape path clear',
            'Account all personnel before re-entry',
        ],
    },
    {
        code: 'fatality_or_critical_injury',
        label: 'Fatality or critical injury',
        keywords: ['fatality', 'critical injury', 'life threatening', 'death'],
        reportingByRegion: {
            'CA-SK': 'Saskatchewan OHS: immediately report fatalities / critical injuries to ministry.',
            'CA-AB': 'Alberta OHS: immediately report fatalities / serious injuries.',
            'CA-BC': 'WorkSafeBC: immediately report fatalities / serious injuries.',
            'CA-ON': 'Ontario MOL: immediately report fatalities / critical injuries.',
            'CA-MB': 'Manitoba: immediately report fatalities / serious incidents.',
        },
        defaultUtilityAgencies: [],
        erpAppendices: [
            'Preserve scene except to prevent further harm',
            'Notify OHS regulator per provincial rules',
            'Notify next of kin via company protocol only',
        ],
    },
    {
        code: 'structural_collapse',
        label: 'Structural collapse',
        keywords: ['collapse', 'structural', 'scaffold failure', 'building failure'],
        reportingByRegion: {
            'CA-SK': 'Saskatchewan OHS: structural collapse — dangerous occurrence reporting may apply.',
            'CA-AB': 'Alberta OHS: structural failure with risk of serious injury — reportable.',
        },
        defaultUtilityAgencies: ['gas', 'electric', 'water'],
        erpAppendices: [
            'Establish collapse zone; account personnel',
            'Utility shutoffs as directed by responders',
            'Specialized rescue only',
        ],
    },
    {
        code: 'worker_entrapment',
        label: 'Worker entrapment / confined space',
        keywords: ['entrap', 'confined', 'caught in', 'trapped'],
        reportingByRegion: {
            'CA-SK': 'Saskatchewan OHS: entrapment / confined-space incidents may be reportable.',
            'CA-AB': 'Alberta OHS: confined-space / entrapment with injury — reportable.',
        },
        defaultUtilityAgencies: [],
        erpAppendices: [
            'Do not enter without rescue-rated team',
            'Maintain air monitoring / ventilation plan',
            'Coordinate with fire rescue',
        ],
    },
];
exports.UTILITY_CONTACT_CATALOG = [
    {
        id: 'util-sk-saskenergy',
        region: 'CA-SK',
        agency: 'gas',
        name: 'SaskEnergy Emergency',
        phone: '1-888-700-0421',
        triggers: ['gas_line_strike', 'fire_explosion'],
        notes: 'Primary gas utility for Saskatchewan line strikes / gas emergencies.',
        verifiedAt: '2026-01-15T00:00:00.000Z',
    },
    {
        id: 'util-sk-saskpower',
        region: 'CA-SK',
        agency: 'electric',
        name: 'SaskPower Emergency',
        phone: '310-2220',
        triggers: ['electrical_contact', 'fire_explosion', 'structural_collapse'],
        notes: 'Saskatchewan electrical infrastructure emergencies.',
        verifiedAt: '2026-01-15T00:00:00.000Z',
    },
    {
        id: 'util-sk-sask911',
        region: 'CA-SK',
        agency: 'one_call',
        name: 'Sask 1st Call (locate / damage)',
        phone: '1-866-828-4888',
        triggers: ['gas_line_strike', 'electrical_contact', 'excavation_cave_in'],
        notes: 'Use for locate coordination; emergency releases still call utility + 911.',
        verifiedAt: '2026-01-15T00:00:00.000Z',
    },
    {
        id: 'util-ab-atco-gas',
        region: 'CA-AB',
        agency: 'gas',
        name: 'ATCO Gas Emergency',
        phone: '1-800-511-3447',
        triggers: ['gas_line_strike', 'fire_explosion'],
        notes: 'Alberta ATCO Gas emergency line.',
        verifiedAt: '2026-01-15T00:00:00.000Z',
    },
    {
        id: 'util-ab-atco-electric',
        region: 'CA-AB',
        agency: 'electric',
        name: 'ATCO Electric Emergency',
        phone: '1-800-668-5506',
        triggers: ['electrical_contact', 'fire_explosion', 'structural_collapse'],
        notes: 'Alberta ATCO Electric 24h emergency — outages, downed lines, electrical strikes (electric.atco.com).',
        verifiedAt: '2026-07-19T00:00:00.000Z',
    },
    {
        id: 'util-ab-clickbeforeyoudig',
        region: 'CA-AB',
        agency: 'one_call',
        name: 'Alberta One-Call',
        phone: '1-800-242-3447',
        triggers: ['gas_line_strike', 'electrical_contact', 'excavation_cave_in'],
        notes: 'Alberta click-before-you-dig / damage reporting coordination.',
        verifiedAt: '2026-01-15T00:00:00.000Z',
    },
    {
        id: 'util-bc-fortis',
        region: 'CA-BC',
        agency: 'gas',
        name: 'FortisBC Gas Emergency',
        phone: '1-800-663-9911',
        triggers: ['gas_line_strike', 'fire_explosion'],
        notes: 'BC gas utility emergency.',
        verifiedAt: '2026-01-15T00:00:00.000Z',
    },
    {
        id: 'util-bc-bchydro',
        region: 'CA-BC',
        agency: 'electric',
        name: 'BC Hydro Emergency',
        phone: '1-800-224-9376',
        triggers: ['electrical_contact', 'fire_explosion'],
        notes: 'BC electrical emergencies.',
        verifiedAt: '2026-01-15T00:00:00.000Z',
    },
    {
        id: 'util-on-enbridge',
        region: 'CA-ON',
        agency: 'gas',
        name: 'Enbridge Gas Emergency',
        phone: '1-866-763-5427',
        triggers: ['gas_line_strike', 'fire_explosion'],
        notes: 'Ontario Enbridge gas emergency.',
        verifiedAt: '2026-01-15T00:00:00.000Z',
    },
];
function detectDangerousOccurrences(text) {
    var _a, _b;
    const lower = (text || '').toLowerCase();
    const phraseMap = [
        {
            code: 'gas_line_strike',
            phrases: [
                'gas line',
                'gas strike',
                'natural gas',
                'pipeline strike',
                'saskenergy',
                'line strike',
                'hit gas',
                'gas odor',
                'gas odour',
            ],
        },
        {
            code: 'electrical_contact',
            phrases: [
                'arc flash',
                'electrical contact',
                'power line',
                'electric shock',
                'electrocution',
                'energized',
            ],
        },
        {
            code: 'excavation_cave_in',
            phrases: ['cave-in', 'cave in', 'trench collapse', 'excavation collapse'],
        },
        {
            code: 'chemical_release',
            phrases: ['chemical spill', 'chemical release', 'hazmat', 'toxic release'],
        },
        {
            code: 'crane_failure',
            phrases: [
                'crane failure',
                'dropped load',
                'rigging failure',
                'crane overturn',
            ],
        },
        {
            code: 'fire_explosion',
            phrases: ['explosion', 'on fire', 'caught fire', 'flash fire', 'blast'],
            neg: ['fire extinguisher', 'fire drill', 'fire watch', 'fire warden'],
        },
        {
            code: 'fatality_or_critical_injury',
            phrases: [
                'fatality',
                'critical injury',
                'life threatening',
                'life-threatening',
            ],
        },
        {
            code: 'structural_collapse',
            phrases: [
                'structural collapse',
                'scaffold collapse',
                'scaffold failure',
            ],
        },
        {
            code: 'worker_entrapment',
            phrases: [
                'entrapment',
                'worker trapped',
                'confined space rescue',
                'caught between',
            ],
        },
    ];
    const hits = [];
    for (const rule of phraseMap) {
        const hit = rule.phrases.some((p) => lower.includes(p));
        if (!hit)
            continue;
        if (((_a = rule.neg) === null || _a === void 0 ? void 0 : _a.some((n) => lower.includes(n))) && !rule.phrases.some((p) => lower.includes(p))) {
            continue;
        }
        if (rule.code === 'fire_explosion' &&
            ((_b = rule.neg) === null || _b === void 0 ? void 0 : _b.some((n) => lower.includes(n))) &&
            !['explosion', 'on fire', 'caught fire', 'flash fire', 'blast'].some((p) => lower.includes(p))) {
            continue;
        }
        hits.push(rule.code);
    }
    if (!hits.length) {
        for (const rule of exports.DANGEROUS_OCCURRENCE_RULES) {
            if (!rule.keywords.some((k) => lower.includes(k)))
                continue;
            if (rule.code === 'fire_explosion' &&
                /fire\s+(extinguisher|drill|watch|warden)/i.test(lower) &&
                !/(explosion|on fire|caught fire|blast)/i.test(lower)) {
                continue;
            }
            hits.push(rule.code);
        }
    }
    return hits.length ? hits : ['none'];
}
function utilityContactsFor(regionCode, occurrences) {
    const region = normalizeRegion(regionCode);
    return exports.UTILITY_CONTACT_CATALOG.filter((c) => {
        const regionMatch = c.region === region ||
            region.startsWith(c.region) ||
            c.region.startsWith(region.slice(0, 5));
        if (!regionMatch)
            return false;
        if (occurrences.includes('none')) {
            return c.agency === 'one_call';
        }
        return c.triggers.some((t) => occurrences.includes(t));
    });
}
function ohsReportingGuidance(regionCode, occurrences) {
    var _a, _b;
    const region = normalizeRegion(regionCode);
    const out = [];
    for (const code of occurrences) {
        if (code === 'none')
            continue;
        const rule = exports.DANGEROUS_OCCURRENCE_RULES.find((r) => r.code === code);
        if (!rule)
            continue;
        const guidance = (_b = (_a = rule.reportingByRegion[region]) !== null && _a !== void 0 ? _a : rule.reportingByRegion['CA-AB']) !== null && _b !== void 0 ? _b : `Report serious / dangerous occurrences per ${region} OHS requirements and notify the asset owner.`;
        out.push({ code, label: rule.label, guidance });
    }
    return out;
}
function appendixStepsFor(occurrences) {
    const steps = [];
    for (const code of occurrences) {
        if (code === 'none')
            continue;
        const rule = exports.DANGEROUS_OCCURRENCE_RULES.find((r) => r.code === code);
        if (rule)
            steps.push(...rule.erpAppendices);
    }
    return [...new Set(steps)];
}
function normalizeRegion(regionCode) {
    const r = (regionCode || 'CA-AB').toUpperCase();
    if (r.includes('SK') || r === 'SASKATCHEWAN')
        return 'CA-SK';
    if (r.includes('AB') || r === 'ALBERTA')
        return 'CA-AB';
    if (r.includes('BC') || r.includes('BRITISH'))
        return 'CA-BC';
    if (r.includes('MB') || r === 'MANITOBA')
        return 'CA-MB';
    if (r.includes('ON') || r === 'ONTARIO')
        return 'CA-ON';
    if (r.includes('TX'))
        return 'US-TX';
    if (r.includes('NV'))
        return 'US-NV';
    return r;
}
//# sourceMappingURL=erp-ohs-utility.catalog.js.map