"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RcaEngine = exports.TAPROOT_PATHWAYS = void 0;
const common_1 = require("@nestjs/common");
exports.TAPROOT_PATHWAYS = [
    'human_factors',
    'equipment_failure',
    'procedures',
    'training_gaps',
    'management_systems',
    'environmental_conditions',
];
const QUESTIONS_BY_TYPE = {
    incident_injury: [
        {
            id: 'injury_mechanism',
            prompt: 'Describe the injury mechanism and body part affected.',
            required: true,
        },
        {
            id: 'ppe_worn',
            prompt: 'Was required PPE worn and in good condition?',
            pathway: 'human_factors',
        },
        {
            id: 'task_training',
            prompt: 'Was the worker trained and authorized for this task?',
            pathway: 'training_gaps',
        },
        {
            id: 'equipment_involved',
            prompt: 'Did equipment failure or defect contribute?',
            pathway: 'equipment_failure',
        },
        {
            id: 'procedure_followed',
            prompt: 'Were procedures/JHA followed?',
            pathway: 'procedures',
        },
        {
            id: 'supervision',
            prompt: 'Was adequate supervision and oversight present?',
            pathway: 'management_systems',
        },
        {
            id: 'environment',
            prompt: 'Did weather, lighting, or site conditions contribute?',
            pathway: 'environmental_conditions',
        },
    ],
    near_miss: [
        { id: 'what_almost', prompt: 'What almost happened?', required: true },
        {
            id: 'barrier_failed',
            prompt: 'Which barrier or control failed?',
            pathway: 'procedures',
        },
        {
            id: 'human_factor',
            prompt: 'Describe any human performance factors.',
            pathway: 'human_factors',
        },
        {
            id: 'equipment',
            prompt: 'Was equipment involved or defective?',
            pathway: 'equipment_failure',
        },
    ],
    incident_property: [
        {
            id: 'damage_desc',
            prompt: 'Describe property/equipment damage.',
            required: true,
        },
        {
            id: 'equipment_condition',
            prompt: 'Equipment maintenance and inspection status?',
            pathway: 'equipment_failure',
        },
        {
            id: 'procedure',
            prompt: 'Operating procedures followed?',
            pathway: 'procedures',
        },
    ],
    incident_environmental: [
        {
            id: 'release_desc',
            prompt: 'Describe the environmental release or impact.',
            required: true,
        },
        {
            id: 'controls',
            prompt: 'Were environmental controls in place?',
            pathway: 'procedures',
        },
        {
            id: 'conditions',
            prompt: 'Environmental/site conditions at time of event?',
            pathway: 'environmental_conditions',
        },
    ],
    equipment_failure: [
        {
            id: 'equip_desc',
            prompt: 'Describe the equipment involved and failure mode.',
            required: true,
        },
        {
            id: 'maintenance',
            prompt: 'Was the equipment on a current maintenance and inspection schedule?',
            pathway: 'equipment_failure',
        },
        {
            id: 'operator_training',
            prompt: 'Was the operator trained and authorized?',
            pathway: 'training_gaps',
        },
    ],
};
const DEFAULT_QUESTIONS = [
    { id: 'event_summary', prompt: 'Summarize what happened.', required: true },
    {
        id: 'immediate_causes',
        prompt: 'What were the immediate causes?',
        pathway: 'human_factors',
    },
    {
        id: 'equipment_role',
        prompt: 'Did equipment play a role?',
        pathway: 'equipment_failure',
    },
    {
        id: 'procedure_gaps',
        prompt: 'Were procedures adequate and followed?',
        pathway: 'procedures',
    },
    {
        id: 'training',
        prompt: 'Were training/competency requirements met?',
        pathway: 'training_gaps',
    },
    {
        id: 'management',
        prompt: 'Were management systems (planning, oversight) adequate?',
        pathway: 'management_systems',
    },
    {
        id: 'environment',
        prompt: 'Did environmental conditions contribute?',
        pathway: 'environmental_conditions',
    },
];
let RcaEngine = class RcaEngine {
    taprootPathways() {
        return exports.TAPROOT_PATHWAYS.map((key) => ({
            key,
            label: pathwayLabel(key),
            description: pathwayDescription(key),
        }));
    }
    guidedQuestions(eventType) {
        var _a;
        const typed = eventType;
        return (_a = QUESTIONS_BY_TYPE[typed]) !== null && _a !== void 0 ? _a : DEFAULT_QUESTIONS;
    }
    suggestRootCauses(input) {
        var _a, _b, _c;
        const text = [
            input.description,
            ...input.contributingFactors,
            ...Object.values((_a = input.guidedAnswers) !== null && _a !== void 0 ? _a : {}),
        ]
            .join(' ')
            .toLowerCase();
        const suggestions = [];
        for (const entry of input.library) {
            let score = 0;
            const label = entry.label.toLowerCase();
            if (text.includes((_b = label.split(' ')[0]) !== null && _b !== void 0 ? _b : ''))
                score += 2;
            if (input.contributingFactors.some((f) => { var _a; return f.toLowerCase().includes((_a = entry.category) !== null && _a !== void 0 ? _a : ''); })) {
                score += 1;
            }
            if ((_c = input.historicalCodes) === null || _c === void 0 ? void 0 : _c.includes(entry.code))
                score += 2;
            if (score > 0) {
                suggestions.push({
                    code: entry.code,
                    label: entry.label,
                    category: entry.category,
                    pathway: mapCategoryToPathway(entry.category),
                    score,
                    method: 'taproot',
                });
            }
        }
        for (const pathway of exports.TAPROOT_PATHWAYS) {
            const hints = pathwayKeywords(pathway);
            if (hints.some((h) => text.includes(h))) {
                suggestions.push({
                    code: `pathway_${pathway}`,
                    label: pathwayLabel(pathway),
                    category: pathway,
                    pathway,
                    score: 3,
                    method: 'taproot',
                });
            }
        }
        const seen = new Set();
        return suggestions
            .filter((s) => {
            const k = `${s.pathway}:${s.label}`;
            if (seen.has(k))
                return false;
            seen.add(k);
            return true;
        })
            .sort((a, b) => b.score - a.score)
            .slice(0, 8);
    }
    suggestContributingFactors(input) {
        var _a;
        const text = [
            input.description,
            ...Object.values((_a = input.guidedAnswers) !== null && _a !== void 0 ? _a : {}),
        ]
            .join(' ')
            .toLowerCase();
        const factors = [];
        for (const pathway of exports.TAPROOT_PATHWAYS) {
            const hits = pathwayKeywords(pathway).filter((k) => text.includes(k));
            if (hits.length) {
                factors.push({
                    label: `${pathwayLabel(pathway)}: ${hits.slice(0, 2).join(', ')}`,
                    pathway,
                    confidence: Math.min(0.95, 0.4 + hits.length * 0.15),
                });
            }
        }
        return factors.sort((a, b) => b.confidence - a.confidence);
    }
    buildTaprootPathway(input) {
        var _a, _b;
        return {
            pathway: input.pathway,
            label: pathwayLabel(input.pathway),
            causalFactors: (_a = input.contributingFactors) !== null && _a !== void 0 ? _a : [],
            rootCauseStatement: input.description,
            snapCharT: {
                sequenceOfEvents: [],
                changeAnalysis: (_b = input.contributingFactors) !== null && _b !== void 0 ? _b : [],
                correctiveActions: [],
            },
        };
    }
    buildFiveWhyChain(problemStatement, rootCause) {
        return [
            `Problem: ${problemStatement}`,
            'Why 1: Event occurred',
            'Why 2: Control or barrier failed',
            'Why 3: Underlying process gap',
            `Why 4/5 (root): ${rootCause}`,
        ];
    }
    fishboneCategories() {
        return exports.TAPROOT_PATHWAYS.map((p) => ({
            key: p,
            label: pathwayLabel(p),
        }));
    }
    buildCausalTree(input) {
        var _a, _b, _c, _d, _e, _f, _g;
        const pathways = new Map();
        for (const p of exports.TAPROOT_PATHWAYS) {
            pathways.set(p, {
                id: `pathway_${p}`,
                label: pathwayLabel(p),
                type: 'pathway',
                pathway: p,
                children: [],
            });
        }
        for (const f of input.contributingFactors) {
            const pathway = (_a = mapCategoryToPathway(f.category)) !== null && _a !== void 0 ? _a : 'human_factors';
            (_c = (_b = pathways.get(pathway)) === null || _b === void 0 ? void 0 : _b.children) === null || _c === void 0 ? void 0 : _c.push({
                id: `factor_${f.label.slice(0, 12)}`,
                label: f.label,
                type: 'contributing',
                pathway,
            });
        }
        for (const rc of input.rootCauses) {
            const pathway = (_e = (_d = rc.pathway) !== null && _d !== void 0 ? _d : mapCategoryToPathway(rc.category)) !== null && _e !== void 0 ? _e : 'human_factors';
            (_g = (_f = pathways.get(pathway)) === null || _f === void 0 ? void 0 : _f.children) === null || _g === void 0 ? void 0 : _g.push({
                id: rc.id,
                label: rc.description,
                type: 'root',
                pathway,
            });
        }
        return {
            id: 'event_root',
            label: input.eventTitle,
            type: 'event',
            children: [...pathways.values()].filter((n) => { var _a, _b; return ((_b = (_a = n.children) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) > 0; }),
        };
    }
};
exports.RcaEngine = RcaEngine;
exports.RcaEngine = RcaEngine = __decorate([
    (0, common_1.Injectable)()
], RcaEngine);
function pathwayLabel(key) {
    const labels = {
        human_factors: 'Human factors',
        equipment_failure: 'Equipment failure',
        procedures: 'Procedures',
        training_gaps: 'Training gaps',
        management_systems: 'Management systems',
        environmental_conditions: 'Environmental conditions',
    };
    return labels[key];
}
function pathwayDescription(key) {
    const d = {
        human_factors: 'Performance, fatigue, communication, PPE, ergonomics',
        equipment_failure: 'Defects, maintenance, design, inspection gaps',
        procedures: 'JHA, permits, SWP, work planning',
        training_gaps: 'Competency, authorization, orientation',
        management_systems: 'Oversight, planning, culture, resources',
        environmental_conditions: 'Weather, lighting, housekeeping, site layout',
    };
    return d[key];
}
function pathwayKeywords(pathway) {
    const map = {
        human_factors: [
            'ppe',
            'fatigue',
            'human',
            'behavior',
            'distraction',
            'harness',
        ],
        equipment_failure: [
            'equipment',
            'defect',
            'broken',
            'maintenance',
            'crane',
            'tool',
        ],
        procedures: [
            'procedure',
            'permit',
            'jha',
            'plan',
            'work instruction',
            'bypass',
        ],
        training_gaps: [
            'training',
            'untrained',
            'competency',
            'orientation',
            'certification',
        ],
        management_systems: [
            'supervision',
            'management',
            'oversight',
            'culture',
            'resource',
        ],
        environmental_conditions: [
            'weather',
            'lighting',
            'housekeeping',
            'slip',
            'wind',
            'heat',
        ],
    };
    return map[pathway];
}
function mapCategoryToPathway(category) {
    if (!category)
        return undefined;
    const c = category.toLowerCase();
    if (exports.TAPROOT_PATHWAYS.includes(c))
        return c;
    if (/human|ppe|behavior/.test(c))
        return 'human_factors';
    if (/equip|machine/.test(c))
        return 'equipment_failure';
    if (/proc|process|plan/.test(c))
        return 'procedures';
    if (/train|compet/.test(c))
        return 'training_gaps';
    if (/manage|super/.test(c))
        return 'management_systems';
    if (/env|weather|house/.test(c))
        return 'environmental_conditions';
    return undefined;
}
//# sourceMappingURL=rca.engine.js.map