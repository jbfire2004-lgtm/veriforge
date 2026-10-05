"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JhaFlhaEngineService = void 0;
const common_1 = require("@nestjs/common");
const jha_flha_constants_1 = require("./jha-flha.constants");
const jha_library_catalog_1 = require("./jha-library-catalog");
const CRITICAL_RISK_MAP = {
    'line-of-fire': {
        hazards: [
            'Workers in line of fire from moving loads, tools, or pressurized release',
        ],
        energies: ['mechanical', 'pressure'],
        controls: [
            'Establish exclusion zones and barricades',
            'Use tag lines and controlled lowering',
        ],
        sif: true,
    },
    'line of fire': {
        hazards: [
            'Workers in line of fire from moving loads, tools, or pressurized release',
        ],
        energies: ['mechanical', 'pressure'],
        controls: [
            'Establish exclusion zones and barricades',
            'Use tag lines and controlled lowering',
        ],
        sif: true,
    },
    'dropped objects': {
        hazards: ['Dropped objects from height striking workers below'],
        energies: ['gravity'],
        controls: [
            '100% tie-off for tools and materials at height',
            'Hard-barricaded drop zones below work',
        ],
        sif: true,
    },
    'energized systems': {
        hazards: ['Contact with energized electrical or mechanical systems'],
        energies: ['electrical', 'mechanical'],
        controls: [
            'LOTO and verified zero energy before work',
            'Qualified electrical worker and arc-flash PPE if live work',
        ],
        sif: true,
    },
    lifting: {
        hazards: ['Rigging failure or load swing striking workers'],
        energies: ['gravity', 'mechanical'],
        controls: [
            'Certified rigging, lift plan, and exclusion zone',
            'Pre-lift inspection and competent rigger sign-off',
        ],
        sif: true,
    },
    excavation: {
        hazards: ['Trench collapse or utility strike'],
        energies: ['gravity', 'electrical', 'pressure'],
        controls: [
            'Competent person assessment, shoring/sloping/boxing',
            'Utility locate and hand expose',
        ],
        sif: true,
    },
};
const SIF_CATEGORIES = new Set([
    'Fall',
    'Lifting',
    'Electrical',
    'Pressure',
    'Line of fire',
    'Confined space',
    'Well control',
    'Excavation',
]);
let JhaFlhaEngineService = class JhaFlhaEngineService {
    generate(input) {
        var _a, _b, _c, _d, _e, _f, _g;
        const catalog = (0, jha_library_catalog_1.getCompleteCatalog)();
        const steps = this.normalizeSteps(input);
        const contextText = this.buildContextText(input);
        const matchedProfiles = jha_library_catalog_1.TASK_HAZARD_PROFILES.filter((p) => p.tokens.some((t) => contextText.includes(t.toLowerCase())));
        const energySet = new Set();
        const jha_steps = [];
        for (const step of steps) {
            const stepText = `${step} ${contextText}`.toLowerCase();
            const hazards = [];
            const controls = [];
            let stepSif = false;
            for (const profile of matchedProfiles) {
                if (!profile.tokens.some((t) => stepText.includes(t.toLowerCase())))
                    continue;
                for (const e of profile.energyTypes)
                    energySet.add(e);
                const hazardDesc = (_a = profile.hazardKeywords[0]) !== null && _a !== void 0 ? _a : profile.label;
                const sif = SIF_CATEGORIES.has((_b = profile.hazardCategories[0]) !== null && _b !== void 0 ? _b : '');
                stepSif = stepSif || sif;
                hazards.push({
                    category: this.hazardCategory((_c = profile.hazardCategories[0]) !== null && _c !== void 0 ? _c : ''),
                    description: `${profile.label}: ${hazardDesc}`,
                    sif_potential: sif,
                });
                const profileControls = catalog.controls
                    .filter((c) => profile.hazardCategories.some((cat) => { var _a; return (_a = c.hazardCategories) === null || _a === void 0 ? void 0 : _a.includes(cat); }) || profile.energyTypes.some((e) => { var _a; return (_a = c.energyTypes) === null || _a === void 0 ? void 0 : _a.includes(e); }))
                    .slice(0, 3);
                for (const c of profileControls) {
                    controls.push({
                        hierarchy: this.hierarchyFromControlType(c.controlType),
                        description: c.description,
                        sif_verification: sif,
                    });
                }
            }
            this.applyEnvironmentHazards(input.environment, hazards, controls, energySet);
            this.applyEquipmentHazards(input.equipment_and_tools, stepText, hazards, controls, energySet);
            this.applyCriticalRisks(input.known_critical_risks, hazards, controls, energySet, () => {
                stepSif = true;
            });
            if (((_d = input.workforce) === null || _d === void 0 ? void 0 : _d.experience_level) === 'new' ||
                ((_f = (_e = input.workforce) === null || _e === void 0 ? void 0 : _e.crew_size) !== null && _f !== void 0 ? _f : 0) > 6) {
                hazards.push({
                    category: 'people',
                    description: 'Competency / coordination — new workers or large crew increase miscommunication risk',
                });
                controls.push({
                    hierarchy: 'administrative',
                    description: 'Toolbox talk, role clarity, and experienced worker pairing for new crew members',
                });
            }
            if (hazards.length === 0) {
                hazards.push({
                    category: 'people',
                    description: 'General task injury — slips, strains, or contact with tools',
                });
                controls.push({
                    hierarchy: 'administrative',
                    description: 'Maintain situational awareness and stop work if conditions change',
                });
            }
            jha_steps.push({
                step,
                hazards: this.dedupeHazards(hazards),
                controls: this.dedupeControls(controls),
                sif_potential: stepSif,
            });
        }
        const energy_wheel = this.buildEnergyWheel(energySet, input, catalog.controls.map((c) => c.description));
        const field_summary = this.buildFieldSummary(input, jha_steps, energy_wheel);
        const verification_questions = this.buildVerificationQuestions(input, jha_steps, energy_wheel);
        if ((_g = input.client_rules) === null || _g === void 0 ? void 0 : _g.length) {
            verification_questions.push(...input.client_rules
                .slice(0, 3)
                .map((r) => `Client rule confirmed: ${r}?`));
        }
        return {
            jha_steps,
            energy_wheel,
            field_summary,
            verification_questions: verification_questions.slice(0, 10),
        };
    }
    normalizeSteps(input) {
        var _a, _b;
        const raw = (_b = (_a = input.task_steps) === null || _a === void 0 ? void 0 : _a.filter((s) => s.trim())) !== null && _b !== void 0 ? _b : input.task_description
            .split(/\n|;|\.(?=\s)/)
            .map((s) => s.trim())
            .filter((s) => s.length > 3);
        if (raw.length) {
            return raw.map((s, i) => (s.match(/^\d+[\).\]]/) ? s : `${i + 1}. ${s}`));
        }
        return [`1. ${input.task_description.trim() || 'Perform assigned work'}`];
    }
    buildContextText(input) {
        var _a, _b, _c, _d, _e, _f, _g;
        return [
            input.task_description,
            ...((_a = input.task_steps) !== null && _a !== void 0 ? _a : []),
            (_b = input.environment) === null || _b === void 0 ? void 0 : _b.location,
            (_c = input.environment) === null || _c === void 0 ? void 0 : _c.weather,
            (_d = input.environment) === null || _d === void 0 ? void 0 : _d.ground_conditions,
            ...((_e = input.equipment_and_tools) !== null && _e !== void 0 ? _e : []),
            ...((_f = input.materials) !== null && _f !== void 0 ? _f : []),
            ...((_g = input.known_critical_risks) !== null && _g !== void 0 ? _g : []),
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
    }
    hazardCategory(cat) {
        if (['Fall', 'Line of fire', 'Ergonomic'].some((c) => cat.includes(c)))
            return 'people';
        if (['Mobile equipment', 'Mechanical', 'Lifting', 'Caught-in'].some((c) => cat.includes(c)))
            return 'equipment';
        if (['Weather', 'Excavation', 'Utility strike', 'Environmental'].some((c) => cat.includes(c)))
            return 'environment';
        return 'energy';
    }
    hierarchyFromControlType(controlType) {
        const t = controlType.toLowerCase();
        if (t === 'elimination')
            return 'elimination';
        if (t === 'substitution')
            return 'substitution';
        if (t === 'engineering')
            return 'engineering';
        if (t === 'ppe')
            return 'ppe';
        return 'administrative';
    }
    applyEnvironmentHazards(env, hazards, controls, energySet) {
        if (!env)
            return;
        if (env.heights) {
            energySet.add('gravity');
            hazards.push({
                category: 'environment',
                description: 'Work at height — fall to lower level',
                sif_potential: true,
            });
            controls.push({
                hierarchy: 'engineering',
                description: 'Fall protection and 100% tie-off above threshold',
                sif_verification: true,
            });
        }
        if (env.confined_space) {
            energySet.add('chemical');
            hazards.push({
                category: 'environment',
                description: 'Confined space — atmospheric or engulfment',
                sif_potential: true,
            });
            controls.push({
                hierarchy: 'administrative',
                description: 'Confined space permit, gas test, attendant, and rescue plan',
                sif_verification: true,
            });
        }
        if (env.traffic) {
            energySet.add('mechanical');
            hazards.push({
                category: 'environment',
                description: 'Vehicle / equipment traffic interface with workers',
            });
            controls.push({
                hierarchy: 'engineering',
                description: 'Barricades, spotters, and designated pedestrian routes',
            });
        }
        if (env.weather) {
            hazards.push({
                category: 'environment',
                description: `Weather exposure: ${env.weather}`,
            });
            controls.push({
                hierarchy: 'administrative',
                description: 'Monitor weather triggers and suspend work per site policy',
            });
        }
        if (env.underground_utilities) {
            energySet.add('electrical');
            energySet.add('pressure');
            hazards.push({
                category: 'environment',
                description: 'Underground utility strike',
                sif_potential: true,
            });
            controls.push({
                hierarchy: 'administrative',
                description: 'Utility locate, hand expose, and permit to dig',
                sif_verification: true,
            });
        }
    }
    applyEquipmentHazards(equipment, stepText, hazards, controls, energySet) {
        var _a;
        for (const item of equipment !== null && equipment !== void 0 ? equipment : []) {
            const lower = item.toLowerCase();
            if (!stepText.includes((_a = lower.split(' ')[0]) !== null && _a !== void 0 ? _a : lower) &&
                equipment.length > 3)
                continue;
            if (/crane|hoist|rigging|lift/.test(lower)) {
                energySet.add('gravity');
                hazards.push({
                    category: 'equipment',
                    description: `Lifting with ${item}`,
                    sif_potential: true,
                });
                controls.push({
                    hierarchy: 'engineering',
                    description: 'Lift plan, certified rigging, and exclusion zone',
                    sif_verification: true,
                });
            }
            else if (/grinder|saw|drill|press/.test(lower)) {
                energySet.add('mechanical');
                hazards.push({
                    category: 'equipment',
                    description: `Moving parts / pinch points — ${item}`,
                });
                controls.push({
                    hierarchy: 'engineering',
                    description: 'Guards in place, LOTO before maintenance, and correct tooling',
                });
            }
            else if (/welder|torch|generator/.test(lower)) {
                energySet.add('thermal');
                energySet.add('electrical');
                hazards.push({
                    category: 'equipment',
                    description: `Hot work / electrical — ${item}`,
                    sif_potential: true,
                });
                controls.push({
                    hierarchy: 'administrative',
                    description: 'Hot work permit, fire watch, and GFCI power supply',
                    sif_verification: true,
                });
            }
        }
    }
    applyCriticalRisks(risks, hazards, controls, energySet, onSif) {
        for (const risk of risks !== null && risks !== void 0 ? risks : []) {
            const key = risk.toLowerCase().trim();
            const mapped = CRITICAL_RISK_MAP[key];
            if (!mapped) {
                hazards.push({
                    category: 'people',
                    description: risk,
                    sif_potential: true,
                });
                onSif();
                continue;
            }
            for (const h of mapped.hazards) {
                hazards.push({
                    category: 'energy',
                    description: h,
                    sif_potential: mapped.sif,
                });
            }
            for (const e of mapped.energies)
                energySet.add(e);
            for (const c of mapped.controls) {
                controls.push({
                    hierarchy: 'engineering',
                    description: c,
                    sif_verification: mapped.sif,
                });
            }
            if (mapped.sif)
                onSif();
        }
    }
    buildEnergyWheel(energySet, input, allControlDescriptions) {
        const types = energySet.size ? [...energySet] : ['mechanical'];
        return types.map((energy_type) => {
            var _a, _b;
            const wheel = jha_flha_constants_1.ENERGY_WHEEL.find((w) => w.type === energy_type);
            const label = (_a = wheel === null || wheel === void 0 ? void 0 : wheel.label) !== null && _a !== void 0 ? _a : energy_type;
            const failure_modes = this.failureModesForEnergy(energy_type, input);
            const controls = allControlDescriptions
                .filter((d) => d.toLowerCase().includes(energy_type) ||
                d.toLowerCase().includes(label.split('/')[0].trim().toLowerCase()))
                .slice(0, 4);
            if (!controls.length) {
                controls.push(`Isolate ${label} energy — LOTO and verification`, `Physical barriers preventing unintended ${energy_type} release`);
            }
            return {
                energy_type,
                description: `${label} present in task${((_b = input.environment) === null || _b === void 0 ? void 0 : _b.location) ? ` at ${input.environment.location}` : ''}`,
                failure_modes,
                controls,
            };
        });
    }
    failureModesForEnergy(energy, input) {
        var _a, _b;
        const map = {
            gravity: [
                'Fall from height',
                'Dropped object',
                'Trench or structure collapse',
            ],
            mechanical: [
                'Pinch / crush from moving equipment',
                'Struck-by moving load',
            ],
            electrical: [
                'Arc flash or shock from energized conductor',
                'Induced voltage from nearby lines',
            ],
            pressure: [
                'Hose whip or line break',
                'Unexpected release from stored pressure',
            ],
            chemical: [
                'Toxic inhalation or oxygen deficiency',
                'Fire from flammable release',
            ],
            thermal: [
                'Burn from hot surfaces or sparks',
                'Fire from ignition source',
            ],
            biological: ['Exposure to biological agent or wastewater'],
            radiation: ['Exposure beyond permitted dose'],
            motion: ['Repetitive strain or overexertion'],
        };
        const base = (_a = map[energy]) !== null && _a !== void 0 ? _a : ['Uncontrolled energy release'];
        if (((_b = input.environment) === null || _b === void 0 ? void 0 : _b.confined_space) && energy === 'chemical') {
            base.push('Atmospheric accumulation in enclosed space');
        }
        return base.slice(0, 4);
    }
    buildFieldSummary(input, steps, wheel) {
        var _a;
        const sifSteps = steps.filter((s) => s.sif_potential).length;
        const energies = wheel.map((w) => w.energy_type).join(', ');
        const kind = input.kind === 'FLHA' ? 'FLHA' : 'JHA';
        return [
            `${kind} — ${input.task_description.trim()}.`,
            `${steps.length} work step(s); ${sifSteps
                ? `${sifSteps} step(s) with SIF potential — extra verification required. `
                : ''}`,
            `Primary energies: ${energies || 'general mechanical'}.`,
            `Before starting: confirm controls, permits, and crew understanding.`,
            ((_a = input.environment) === null || _a === void 0 ? void 0 : _a.weather)
                ? `Weather: ${input.environment.weather} — adjust pace and controls.`
                : '',
        ]
            .filter(Boolean)
            .join(' ');
    }
    buildVerificationQuestions(input, steps, wheel) {
        var _a, _b, _c, _d;
        const qs = [
            'Can each crew member describe the task steps and their role?',
            'Are all required permits and isolations in place and verified?',
            'Do we have the right PPE for the energies present today?',
        ];
        if (steps.some((s) => s.sif_potential)) {
            qs.push('Which steps have SIF potential and what extra controls are in place?');
            qs.push('Who is the competent person for this task and how do we reach them?');
        }
        for (const w of wheel.slice(0, 3)) {
            qs.push(`How is ${w.energy_type} energy isolated and how was zero energy verified?`);
        }
        if ((_a = input.environment) === null || _a === void 0 ? void 0 : _a.heights) {
            qs.push('Fall protection anchors inspected and 100% tie-off plan understood?');
        }
        if ((_b = input.environment) === null || _b === void 0 ? void 0 : _b.confined_space) {
            qs.push('Confined space atmospheric tests current and attendant in place?');
        }
        if ((_d = (_c = input.workforce) === null || _c === void 0 ? void 0 : _c.subcontractors) === null || _d === void 0 ? void 0 : _d.length) {
            qs.push('Have all subcontractor crews signed onto this assessment and understand controls?');
        }
        qs.push('What conditions would cause us to stop work and re-assess?');
        return qs;
    }
    dedupeHazards(hazards) {
        const seen = new Set();
        return hazards.filter((h) => {
            const k = h.description.toLowerCase();
            if (seen.has(k))
                return false;
            seen.add(k);
            return true;
        });
    }
    dedupeControls(controls) {
        const seen = new Set();
        return controls.filter((c) => {
            const k = c.description.toLowerCase();
            if (seen.has(k))
                return false;
            seen.add(k);
            return true;
        });
    }
};
exports.JhaFlhaEngineService = JhaFlhaEngineService;
exports.JhaFlhaEngineService = JhaFlhaEngineService = __decorate([
    (0, common_1.Injectable)()
], JhaFlhaEngineService);
//# sourceMappingURL=jha-flha-engine.service.js.map