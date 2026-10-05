"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsraHecaEngine = void 0;
const common_1 = require("@nestjs/common");
const sif_heca_constants_1 = require("./sif-heca.constants");
const jha_control_class_1 = require("../jha-flha/jha-control-class");
const PROXIMITY_SCORE = {
    contact: 5,
    near: 4,
    zone: 3,
    remote: 1,
};
const ENERGY_PATTERNS = [
    {
        type: 'gravity',
        patterns: /fall|height|ladder|scaffold|roof|edge|elevation|drop|overhead load/i,
        magnitudeBoost: 1,
    },
    {
        type: 'motion',
        patterns: /ergonomic|strain|lift(ing)?|awkward|repetitive|manual handl/i,
        magnitudeBoost: 0,
    },
    {
        type: 'mechanical',
        patterns: /rotat|pinch|caught|conveyor|gear|machine guard|moving part/i,
        magnitudeBoost: 1,
    },
    {
        type: 'electrical',
        patterns: /electrical|arc|energiz|voltage|shock|loto|lockout|panel/i,
        magnitudeBoost: 2,
    },
    {
        type: 'pressure',
        patterns: /pressure|pneumatic|hydraulic|stored energy|vessel|blowout/i,
        magnitudeBoost: 2,
    },
    {
        type: 'chemical',
        patterns: /chemical|corrosive|toxic|h2s|solvent|spill|fume/i,
        magnitudeBoost: 1,
    },
    {
        type: 'thermal',
        patterns: /thermal|heat|hot work|weld|burn|steam|cryogenic/i,
        magnitudeBoost: 1,
    },
    {
        type: 'radiation',
        patterns: /radiation|x-?ray|radiograph|nuclear|laser/i,
        magnitudeBoost: 2,
    },
];
const PROXIMITY_PATTERNS = [
    {
        proximity: 'contact',
        patterns: /in contact|hands.?on|touching|body.?in|inside|enter(ing)?/i,
    },
    {
        proximity: 'near',
        patterns: /within arm|beside|adjacent|next to|close to|immediate/i,
    },
    {
        proximity: 'zone',
        patterns: /exclusion|zone|barricade|spotter|stand.?off|perimeter/i,
    },
    {
        proximity: 'remote',
        patterns: /remote|from cab|from ground|outside|away from/i,
    },
];
const DIRECT_CONTROL_LIBRARY = {
    gravity: [
        {
            controlType: 'engineering',
            description: 'Install guardrails / hole covers / fall-arrest anchorage',
        },
        {
            controlType: 'elimination',
            description: 'Eliminate work at height (prefab / ground-level assembly)',
        },
    ],
    mechanical: [
        {
            controlType: 'engineering',
            description: 'Machine guarding / interlocks on moving parts',
        },
        {
            controlType: 'engineering',
            description: 'LOTO / energy isolation before contact with machinery',
        },
    ],
    electrical: [
        {
            controlType: 'engineering',
            description: 'Verified LOTO / zero-energy state before panel work',
        },
        {
            controlType: 'engineering',
            description: 'Insulated barriers / arc-rated enclosure',
        },
    ],
    pressure: [
        {
            controlType: 'engineering',
            description: 'Depressurize / isolate and verify zero energy',
        },
        {
            controlType: 'engineering',
            description: 'Pressure relief / whip checks / rated fittings',
        },
    ],
    chemical: [
        {
            controlType: 'engineering',
            description: 'Local exhaust ventilation / closed transfer',
        },
        {
            controlType: 'substitution',
            description: 'Substitute lower-hazard chemical or process',
        },
    ],
    thermal: [
        {
            controlType: 'engineering',
            description: 'Heat shields / cool-down / isolation of hot surfaces',
        },
    ],
    radiation: [
        {
            controlType: 'engineering',
            description: 'Shielding / exclusion zone with dose monitoring',
        },
    ],
    motion: [
        {
            controlType: 'engineering',
            description: 'Mechanical lift assist / ergonomic fixture',
        },
    ],
};
const ALTERNATIVE_CONTROL_LIBRARY = {
    gravity: [
        {
            controlType: 'administrative',
            description: '100% tie-off procedure and competent person check',
        },
        { controlType: 'ppe', description: 'Full-body harness with SRL' },
    ],
    electrical: [
        {
            controlType: 'administrative',
            description: 'Energized work permit and two-person rule',
        },
        { controlType: 'ppe', description: 'Arc-rated PPE / insulated gloves' },
    ],
    pressure: [
        {
            controlType: 'administrative',
            description: 'Line-break permit and bleed-down checklist',
        },
    ],
    mechanical: [
        {
            controlType: 'administrative',
            description: 'Spotter / exclusion during equipment motion',
        },
    ],
    chemical: [
        { controlType: 'ppe', description: 'Chemical-resistant PPE / respirator' },
    ],
    thermal: [
        { controlType: 'ppe', description: 'Heat-resistant gloves / face shield' },
    ],
    radiation: [
        {
            controlType: 'administrative',
            description: 'Time-distance-shielding work plan',
        },
    ],
    motion: [
        {
            controlType: 'administrative',
            description: 'Job rotation and lift technique briefing',
        },
    ],
};
let CsraHecaEngine = class CsraHecaEngine {
    assess(input) {
        var _a, _b;
        const text = [
            input.title,
            input.description,
            input.workScope,
            input.locationNote,
            input.environmentNote,
            input.equipmentNote,
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
        const highEnergySources = this.identifyHighEnergySources(text, (_a = input.energyTypes) !== null && _a !== void 0 ? _a : []);
        const exposure = this.evaluateExposure(text, input);
        const controls = this.classifyControls((_b = input.controls) !== null && _b !== void 0 ? _b : [], highEnergySources);
        const sifPotential = this.assessSifPotential(text, highEnergySources, exposure, controls, input.sifHint);
        const recommendations = this.recommendMissingControls(highEnergySources, controls, sifPotential);
        const document = this.buildDocument(input, highEnergySources, exposure, controls, sifPotential, recommendations);
        return {
            methodology: 'CSRA',
            highEnergySources,
            exposure,
            controls,
            sifPotential,
            recommendations,
            document,
        };
    }
    identifyHighEnergySources(text, explicit) {
        var _a, _b, _c;
        const byType = new Map();
        for (const seg of sif_heca_constants_1.SIF_ENERGY_WHEEL) {
            byType.set(seg.type, {
                type: seg.type,
                label: seg.label,
                highEnergy: seg.highEnergy || sif_heca_constants_1.HIGH_ENERGY_TYPES.has(seg.type),
                magnitude: 0,
                evidence: [],
            });
        }
        for (const et of explicit) {
            const key = et.toLowerCase();
            const existing = byType.get(key);
            if (existing) {
                existing.magnitude = Math.max(existing.magnitude, 3);
                existing.evidence.push('Declared on assessment input');
                if (sif_heca_constants_1.HIGH_ENERGY_TYPES.has(key))
                    existing.highEnergy = true;
            }
            else {
                byType.set(key, {
                    type: key,
                    label: key,
                    highEnergy: sif_heca_constants_1.HIGH_ENERGY_TYPES.has(key),
                    magnitude: 3,
                    evidence: ['Declared on assessment input'],
                });
            }
        }
        for (const rule of ENERGY_PATTERNS) {
            if (rule.patterns.test(text)) {
                const existing = (_a = byType.get(rule.type)) !== null && _a !== void 0 ? _a : {
                    type: rule.type,
                    label: (_c = (_b = sif_heca_constants_1.SIF_ENERGY_WHEEL.find((s) => s.type === rule.type)) === null || _b === void 0 ? void 0 : _b.label) !== null && _c !== void 0 ? _c : rule.type,
                    highEnergy: sif_heca_constants_1.HIGH_ENERGY_TYPES.has(rule.type),
                    magnitude: 0,
                    evidence: [],
                };
                existing.magnitude = Math.min(5, Math.max(existing.magnitude, 3 + rule.magnitudeBoost));
                existing.evidence.push(`Text match: ${rule.patterns.source.slice(0, 48)}`);
                if (sif_heca_constants_1.HIGH_ENERGY_TYPES.has(rule.type) || existing.magnitude >= 4) {
                    existing.highEnergy = true;
                }
                byType.set(rule.type, existing);
            }
        }
        return Array.from(byType.values())
            .filter((s) => s.magnitude > 0 || explicit.includes(s.type))
            .sort((a, b) => b.magnitude - a.magnitude || Number(b.highEnergy) - Number(a.highEnergy));
    }
    evaluateExposure(text, input) {
        var _a, _b;
        let proximity = (_a = input.proximity) !== null && _a !== void 0 ? _a : 'zone';
        if (!input.proximity) {
            for (const rule of PROXIMITY_PATTERNS) {
                if (rule.patterns.test(text)) {
                    proximity = rule.proximity;
                    break;
                }
            }
            if (/height|scaffold|ladder|energiz|live|hot work/i.test(text)) {
                proximity = proximity === 'remote' ? 'near' : proximity;
            }
        }
        let level = (_b = input.exposureLevel) !== null && _b !== void 0 ? _b : 3;
        if (!input.exposureLevel) {
            if (/continuous|all day|prolonged|repeated/i.test(text))
                level = 5;
            else if (/frequent|multiple times|throughout/i.test(text))
                level = 4;
            else if (/brief|momentary|spot check/i.test(text))
                level = 2;
            else if (/unlikely|rare|one.?time/i.test(text))
                level = 1;
        }
        const score = Math.min(25, level * 3 + PROXIMITY_SCORE[proximity] * 2);
        const narrative = `Exposure level ${level}/5 with ${proximity} proximity (CSRA exposure score ${score}).`;
        return { level, proximity, score, narrative };
    }
    classifyControls(controls, energies) {
        const energyKeys = energies.map((e) => e.type);
        const classified = controls.map((c) => {
            var _a, _b, _c, _d;
            const controlClass = (0, jha_control_class_1.inferControlClass)(c.controlType, ((_a = c.energyTypes) === null || _a === void 0 ? void 0 : _a.length) ? c.energyTypes : energyKeys);
            return {
                description: (_b = c.description) !== null && _b !== void 0 ? _b : `${c.controlType} control`,
                controlType: c.controlType,
                controlClass,
                adequate: c.adequate !== false && ((_c = c.effectivenessScore) !== null && _c !== void 0 ? _c : 4) >= 3,
                verified: Boolean(c.verified),
                linkedEnergies: ((_d = c.energyTypes) === null || _d === void 0 ? void 0 : _d.length) ? c.energyTypes : energyKeys,
            };
        });
        const directCount = classified.filter((c) => c.controlClass === 'direct')
            .length;
        const alternativeCount = classified.filter((c) => c.controlClass === 'alternative').length;
        const highEnergy = energies.filter((e) => e.highEnergy);
        const hasDirectForHighEnergy = highEnergy.length === 0 ||
            highEnergy.every((he) => classified.some((c) => c.controlClass === 'direct' &&
                (c.linkedEnergies.includes(he.type) || c.linkedEnergies.length === 0))) ||
            (directCount > 0 && highEnergy.length > 0);
        const findings = [];
        if (highEnergy.length > 0 && directCount === 0) {
            findings.push('CSRA: High-energy source(s) present without a Direct control — Direct control required before work');
        }
        if (highEnergy.length > 0 &&
            directCount === 0 &&
            alternativeCount > 0) {
            findings.push('CSRA: Only Alternative controls (admin/PPE) applied to high-energy work — insufficient under CSRA');
        }
        for (const c of classified) {
            if (!c.verified && c.controlClass === 'direct') {
                findings.push(`Unverified Direct control: ${c.description}`);
            }
            if (!c.adequate) {
                findings.push(`Inadequate control: ${c.description}`);
            }
        }
        const adequate = (highEnergy.length === 0 || directCount > 0) &&
            findings.filter((f) => f.includes('without a Direct')).length === 0;
        return {
            classified,
            directCount,
            alternativeCount,
            hasDirectForHighEnergy,
            adequate,
            findings,
        };
    }
    assessSifPotential(text, energies, exposure, controls, sifHint) {
        var _a, _b;
        const indicators = [];
        for (const ind of sif_heca_constants_1.SIF_INDICATORS) {
            const hit = text.includes(ind.code.toLowerCase().replace(/_/g, ' ')) ||
                (ind.code === 'FALL_HEIGHT' && /fall|height|scaffold|ladder/i.test(text)) ||
                (ind.code === 'STRUCK_BY' && /struck|crane|overhead|swing/i.test(text)) ||
                (ind.code === 'CAUGHT_IN' && /caught|pinch|between/i.test(text)) ||
                (ind.code === 'ELECTRICAL_CONTACT' &&
                    /electrical|arc|shock|energiz/i.test(text)) ||
                (ind.code === 'CONFINED_SPACE' && /confined|vessel|tank|manhole/i.test(text)) ||
                (ind.code === 'HEAVY_LIFT' && /critical lift|heavy lift|rigging/i.test(text)) ||
                (ind.code === 'VEHICLE_STRIKE' &&
                    /vehicle|forklift|excavator|mobile equipment/i.test(text));
            if (hit)
                indicators.push(ind.label);
        }
        for (const hint of (_a = sifHint === null || sifHint === void 0 ? void 0 : sifHint.indicators) !== null && _a !== void 0 ? _a : []) {
            if (!indicators.includes(hint))
                indicators.push(hint);
        }
        const highEnergy = energies.some((e) => e.highEnergy);
        let score = ((_b = sifHint === null || sifHint === void 0 ? void 0 : sifHint.score) !== null && _b !== void 0 ? _b : 0) ||
            exposure.score +
                (highEnergy ? 25 : 8) +
                indicators.length * 8 +
                (controls.directCount === 0 && highEnergy ? 20 : 0) +
                (controls.adequate ? 0 : 10);
        score = Math.min(100, Math.round(score));
        const category = (sifHint === null || sifHint === void 0 ? void 0 : sifHint.category) ||
            (0, sif_heca_constants_1.categoryFromScore)(score);
        const applies = highEnergy ||
            indicators.length > 0 ||
            category === 'high' ||
            category === 'critical' ||
            exposure.level >= 4;
        const requiresSupervisorReview = applies &&
            (category === 'high' ||
                category === 'critical' ||
                !controls.hasDirectForHighEnergy ||
                highEnergy);
        const narrative = applies
            ? `SIF potential ${category} (score ${score}) — CSRA indicates elevated serious-injury risk from ${highEnergy
                ? energies
                    .filter((e) => e.highEnergy)
                    .map((e) => e.label)
                    .join(', ')
                : 'exposure profile'}.`
            : `SIF potential ${category} (score ${score}) — CSRA does not indicate elevated SIF protocol from current energy/exposure/control profile.`;
        return {
            applies,
            category,
            score,
            indicators,
            narrative,
            requiresSupervisorReview,
        };
    }
    recommendMissingControls(energies, controls, sif) {
        var _a, _b, _c, _d;
        const recs = [];
        let n = 0;
        const presentDescriptions = new Set(controls.classified.map((c) => c.description.toLowerCase()));
        for (const energy of energies.filter((e) => e.highEnergy || e.magnitude >= 3)) {
            const hasDirect = controls.classified.some((c) => c.controlClass === 'direct' &&
                (c.linkedEnergies.includes(energy.type) ||
                    controls.directCount > 0));
            if (!hasDirect || controls.directCount === 0) {
                for (const cand of (_a = DIRECT_CONTROL_LIBRARY[energy.type]) !== null && _a !== void 0 ? _a : []) {
                    if (presentDescriptions.has(cand.description.toLowerCase()))
                        continue;
                    n += 1;
                    recs.push({
                        id: `rec-d-${n}`,
                        priority: sif.applies ? 'critical' : 'high',
                        controlClass: 'direct',
                        controlType: cand.controlType,
                        description: cand.description,
                        energyType: energy.type,
                        reason: `CSRA: missing Direct control for ${energy.label} high-energy source`,
                    });
                }
            }
            const hasAlt = controls.classified.some((c) => c.controlClass === 'alternative');
            if (!hasAlt || controls.alternativeCount === 0) {
                for (const cand of ((_b = ALTERNATIVE_CONTROL_LIBRARY[energy.type]) !== null && _b !== void 0 ? _b : []).slice(0, 1)) {
                    if (presentDescriptions.has(cand.description.toLowerCase()))
                        continue;
                    n += 1;
                    recs.push({
                        id: `rec-a-${n}`,
                        priority: 'medium',
                        controlClass: 'alternative',
                        controlType: cand.controlType,
                        description: cand.description,
                        energyType: energy.type,
                        reason: `CSRA: Alternative control to reinforce ${energy.label} defenses`,
                    });
                }
            }
        }
        if (controls.classified.some((c) => c.controlClass === 'direct' && !c.verified)) {
            n += 1;
            recs.push({
                id: `rec-v-${n}`,
                priority: 'high',
                controlClass: 'direct',
                controlType: 'administrative',
                description: 'Field-verify Direct controls before task start (CSRA check)',
                energyType: (_d = (_c = energies[0]) === null || _c === void 0 ? void 0 : _c.type) !== null && _d !== void 0 ? _d : 'general',
                reason: 'Direct control present but not verified',
            });
        }
        const priorityRank = { critical: 0, high: 1, medium: 2, low: 3 };
        return recs
            .sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority])
            .slice(0, 12);
    }
    buildDocument(input, energies, exposure, controls, sif, recommendations) {
        const missingDirect = recommendations.filter((r) => r.controlClass === 'direct' && r.priority !== 'low').length;
        const highEnergy = energies.some((e) => e.highEnergy);
        const readyForWork = controls.adequate &&
            missingDirect === 0 &&
            (!sif.requiresSupervisorReview || controls.hasDirectForHighEnergy);
        const sections = [
            {
                id: 'scope',
                title: '1. Work scope',
                body: [
                    input.title,
                    input.description,
                    input.workScope,
                    input.locationNote ? `Location: ${input.locationNote}` : null,
                    input.equipmentNote ? `Equipment: ${input.equipmentNote}` : null,
                    input.environmentNote
                        ? `Environment: ${input.environmentNote}`
                        : null,
                ]
                    .filter(Boolean)
                    .join('\n'),
            },
            {
                id: 'high_energy',
                title: '2. High-energy sources (CSRA step 1)',
                body: highEnergy
                    ? 'The following high-energy sources were identified for this activity.'
                    : 'No high-energy sources identified above CSRA threshold; monitor for field changes.',
                bullets: energies.map((e) => `${e.label} — magnitude ${e.magnitude}/5${e.highEnergy ? ' · HIGH ENERGY' : ''}${e.evidence.length ? ` (${e.evidence[0]})` : ''}`),
            },
            {
                id: 'exposure',
                title: '3. Exposure & proximity (CSRA step 2)',
                body: exposure.narrative,
                bullets: [
                    `Exposure level: ${exposure.level}/5`,
                    `Proximity: ${exposure.proximity}`,
                    `Exposure score: ${exposure.score}`,
                ],
            },
            {
                id: 'controls',
                title: '4. Direct vs Alternative controls (CSRA step 3)',
                body: controls.adequate
                    ? 'Control set meets CSRA Direct-control expectations for identified energies.'
                    : 'Control set does not yet meet CSRA Direct-control expectations.',
                bullets: [
                    `Direct controls: ${controls.directCount}`,
                    `Alternative controls: ${controls.alternativeCount}`,
                    ...controls.classified.map((c) => `[${c.controlClass === 'direct' ? 'Direct' : 'Alternative'}] ${c.description} (${c.controlType}${c.verified ? ', verified' : ', unverified'})`),
                    ...controls.findings,
                ],
            },
            {
                id: 'sif',
                title: '5. SIF potential (CSRA step 4)',
                body: sif.narrative,
                bullets: [
                    `Applies: ${sif.applies ? 'Yes' : 'No'}`,
                    `Category: ${sif.category}`,
                    `Score: ${sif.score}`,
                    `Supervisor review: ${sif.requiresSupervisorReview ? 'Required' : 'Not required'}`,
                    ...(sif.indicators.length
                        ? sif.indicators.map((i) => `Indicator: ${i}`)
                        : ['No SIF indicator codes matched']),
                ],
            },
            {
                id: 'recommendations',
                title: '6. AI / CSRA recommendations for missing controls (step 5)',
                body: recommendations.length > 0
                    ? 'Implement the following controls before authorizing work.'
                    : 'No additional controls recommended under current CSRA profile.',
                bullets: recommendations.map((r) => `[${r.priority.toUpperCase()} · ${r.controlClass === 'direct' ? 'Direct' : 'Alternative'}] ${r.description} — ${r.reason}`),
            },
            {
                id: 'authorization',
                title: '7. Authorization',
                body: readyForWork
                    ? 'CSRA assessment indicates controls are adequate to proceed pending standard field verification.'
                    : 'CSRA assessment indicates work should not proceed until Direct controls are implemented/verified and supervisor review is complete where required.',
                bullets: [
                    'Assessor signature: ________________________  Date: __________',
                    'Supervisor signature: _____________________  Date: __________',
                    sif.requiresSupervisorReview
                        ? 'Supervisor review REQUIRED before work'
                        : 'Supervisor review not required by CSRA',
                ],
            },
        ];
        return {
            documentType: 'HECA_CSRA',
            title: `HECA Assessment (CSRA) — ${input.title}`,
            generatedAt: new Date().toISOString(),
            methodology: 'CSRA',
            revision: `CSRA-${Date.now().toString(36).toUpperCase()}`,
            summary: {
                highEnergy,
                sifApplies: sif.applies,
                sifCategory: sif.category,
                sifScore: sif.score,
                directControlCount: controls.directCount,
                alternativeControlCount: controls.alternativeCount,
                missingDirectControls: missingDirect,
                supervisorReviewRequired: sif.requiresSupervisorReview,
                readyForWork,
            },
            sections,
        };
    }
};
exports.CsraHecaEngine = CsraHecaEngine;
exports.CsraHecaEngine = CsraHecaEngine = __decorate([
    (0, common_1.Injectable)()
], CsraHecaEngine);
//# sourceMappingURL=csra-heca.engine.js.map