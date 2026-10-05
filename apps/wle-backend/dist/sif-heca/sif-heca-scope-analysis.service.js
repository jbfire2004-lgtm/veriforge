"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SifHecaScopeAnalysisService = void 0;
const common_1 = require("@nestjs/common");
const vsi_copilot_engine_service_1 = require("../safety-intelligence/ai/copilot/vsi-copilot-engine.service");
const jha_library_catalog_1 = require("../jha-flha/jha-library-catalog");
const jha_suggestion_engine_1 = require("../jha-flha/jha-suggestion.engine");
const sif_heca_constants_1 = require("./sif-heca.constants");
function scopeText(input) {
    return [
        input.title,
        input.jobDescription,
        input.workScope,
        input.locationNote,
        input.environmentNote,
        input.equipmentNote,
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
}
function tokenize(text) {
    return text
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((t) => t.length > 2);
}
function matchSifIndicators(text) {
    const hits = [];
    const rules = [
        {
            code: 'FALL_HEIGHT',
            patterns: /fall|height|ladder|scaffold|roof|elevation|leading edge/i,
        },
        {
            code: 'STRUCK_BY',
            patterns: /struck|swing|overhead|crane|load|line of fire/i,
        },
        { code: 'CAUGHT_IN', patterns: /caught|pinch|rotating|conveyor|between/i },
        {
            code: 'ELECTRICAL_CONTACT',
            patterns: /electrical|arc|energized|voltage|shock|linework/i,
        },
        {
            code: 'CONFINED_SPACE',
            patterns: /confined|tank|vessel|engulf|manhole|silo/i,
        },
        {
            code: 'HEAVY_LIFT',
            patterns: /lift|rigging|crane|hoist|critical lift|heavy/i,
        },
        {
            code: 'VEHICLE_STRIKE',
            patterns: /vehicle|forklift|excavator|mobile equipment|traffic/i,
        },
    ];
    for (const r of rules) {
        if (r.patterns.test(text))
            hits.push(r.code);
    }
    return hits;
}
function matchHecaCategories(text, energyTypes) {
    let best = sif_heca_constants_1.HECA_CATEGORIES[0];
    let bestScore = 0;
    const secondary = [];
    for (const cat of sif_heca_constants_1.HECA_CATEGORIES) {
        let score = 0;
        for (const kw of cat.keywords) {
            if (text.includes(kw.toLowerCase()))
                score += 3;
        }
        for (const et of energyTypes) {
            if (cat.energyTypes.includes(et))
                score += 4;
        }
        if (score > bestScore) {
            if (bestScore > 0 && best.code !== cat.code)
                secondary.push(best.code);
            bestScore = score;
            best = cat;
        }
        else if (score > 2) {
            secondary.push(cat.code);
        }
    }
    return {
        primary: best,
        secondary: [...new Set(secondary)],
        score: bestScore,
    };
}
let SifHecaScopeAnalysisService = class SifHecaScopeAnalysisService {
    constructor(copilot) {
        this.copilot = copilot;
    }
    async analyze(input) {
        var _a;
        const combined = scopeText(input);
        const engines = [];
        if (this.copilot) {
            const run = await this.copilot.analyzeSifHecaScope({
                title: input.title,
                jobDescription: input.jobDescription,
                workScope: input.workScope,
                locationNote: input.locationNote,
                environmentNote: input.environmentNote,
                equipmentNote: input.equipmentNote,
                projectId: input.projectId,
                companyId: input.companyId,
            });
            engines.push(...run.engine);
            const out = run.output;
            if ((_a = out === null || out === void 0 ? void 0 : out.inferred_hazards) === null || _a === void 0 ? void 0 : _a.length) {
                return this.finalize(out, engines, combined);
            }
        }
        engines.push('catalog-heuristic');
        const heuristic = this.heuristicAnalyze(input, combined);
        return this.finalize(heuristic, engines, combined);
    }
    heuristicAnalyze(input, combined) {
        var _a, _b, _c, _d, _e, _f;
        const catalog = (0, jha_library_catalog_1.getCompleteCatalog)();
        const taskText = [
            input.title,
            input.jobDescription,
            input.workScope,
            input.locationNote,
            input.environmentNote,
            input.equipmentNote,
        ]
            .filter(Boolean)
            .join(' ');
        const suggestions = (0, jha_suggestion_engine_1.suggestJhaLibrary)({
            taskDescription: taskText,
            locationNote: input.locationNote,
            weather: input.environmentNote,
            selectedHazardCategories: [],
            selectedEnergyTypes: [],
            existingHazardDescriptions: [],
            existingControlDescriptions: [],
            hazardLibrary: catalog.hazards,
            controlLibrary: catalog.controls,
        });
        const hazardPool = suggestions.suggestedHazards.length > 0
            ? suggestions.suggestedHazards
            : (_a = suggestions.missedHazards) !== null && _a !== void 0 ? _a : [];
        const inferred_hazards = hazardPool.slice(0, 8).map((h) => {
            var _a, _b, _c, _d, _e, _f;
            return ({
                description: h.description,
                category: (_a = h.category) !== null && _a !== void 0 ? _a : 'Field',
                severity: (_b = h.defaultSeverity) !== null && _b !== void 0 ? _b : 3,
                likelihood: (_c = h.defaultLikelihood) !== null && _c !== void 0 ? _c : 3,
                energy_types: (_d = h.defaultEnergyTypes) !== null && _d !== void 0 ? _d : [],
                sif_indicator: matchSifIndicators(h.description.toLowerCase())[0],
                heca_category: matchHecaCategories(h.description.toLowerCase(), (_e = h.defaultEnergyTypes) !== null && _e !== void 0 ? _e : []).primary.code,
                reason: (_f = h.reason) !== null && _f !== void 0 ? _f : 'Matched from industry hazard catalog',
            });
        });
        const controlPool = suggestions.suggestedControls.length > 0
            ? suggestions.suggestedControls
            : (_b = suggestions.missedControls) !== null && _b !== void 0 ? _b : [];
        const inferred_controls = controlPool.slice(0, 10).map((c) => {
            var _a, _b, _c, _d;
            return ({
                description: c.description,
                control_type: (_a = c.controlType) !== null && _a !== void 0 ? _a : 'administrative',
                linked_hazard: (_c = (_b = inferred_hazards[0]) === null || _b === void 0 ? void 0 : _b.description) !== null && _c !== void 0 ? _c : 'General',
                reason: (_d = c.reason) !== null && _d !== void 0 ? _d : 'Recommended control for identified hazards',
            });
        });
        const energySet = new Set();
        for (const h of inferred_hazards) {
            for (const e of h.energy_types)
                energySet.add(e);
        }
        for (const e of (_c = suggestions.requiredEnergyTypes) !== null && _c !== void 0 ? _c : [])
            energySet.add(e);
        const energy_types = Array.from(energySet);
        const hecaMatch = matchHecaCategories(combined, energy_types);
        const high_energy = energy_types.some((e) => sif_heca_constants_1.HIGH_ENERGY_TYPES.has(e));
        const sifIndicators = matchSifIndicators(combined);
        const maxSeverity = inferred_hazards.reduce((m, h) => Math.max(m, h.severity), high_energy ? 4 : 3);
        const maxLikelihood = inferred_hazards.reduce((m, h) => Math.max(m, h.likelihood), high_energy ? 4 : 3);
        const roughSif = maxSeverity * 5 +
            maxLikelihood * 4 +
            (high_energy ? 20 : 0) +
            sifIndicators.length * 8;
        const sifCategory = (0, sif_heca_constants_1.categoryFromScore)(Math.min(100, roughSif));
        const sifApplies = sifIndicators.length > 0 ||
            high_energy ||
            maxSeverity >= 4 ||
            maxLikelihood >= 4;
        const job_steps = tokenize(taskText).length > 5
            ? this.inferStepsFromText(input)
            : [input.title];
        return {
            job_steps,
            inferred_hazards,
            inferred_controls,
            energy_types,
            heca_assessment: {
                primary_category: hecaMatch.primary.code,
                primary_label: hecaMatch.primary.label,
                secondary_categories: hecaMatch.secondary,
                high_energy,
                narrative: high_energy
                    ? `High-energy work detected (${energy_types.filter((e) => sif_heca_constants_1.HIGH_ENERGY_TYPES.has(e)).join(', ') ||
                        'multiple sources'}). HECA focus: ${hecaMatch.primary.label}.`
                    : `Primary HECA category: ${hecaMatch.primary.label}. Review controls for ${hecaMatch.primary.label.toLowerCase()} exposures.`,
            },
            sif_protocol: {
                applies: sifApplies,
                category: sifCategory,
                indicators: sifIndicators.map((code) => { var _a, _b; return (_b = (_a = sif_heca_constants_1.SIF_INDICATORS.find((i) => i.code === code)) === null || _a === void 0 ? void 0 : _a.label) !== null && _b !== void 0 ? _b : code; }),
                narrative: sifApplies
                    ? `SIF protocol applies — ${sifIndicators.length
                        ? `indicators: ${sifIndicators.join(', ')}`
                        : 'high energy or elevated risk profile'}.`
                    : 'Routine work profile — standard hazard controls apply; elevated SIF protocol not indicated from scope alone.',
                requires_supervisor_review: sifCategory === 'high' || sifCategory === 'critical' || high_energy,
            },
            scope_fit_summary: sifApplies
                ? `Scope fits SIF review criteria (${sifCategory}) and HECA category "${hecaMatch.primary.label}". Complete formal controls before work.`
                : `Scope aligns with HECA "${hecaMatch.primary.label}" — routine controls sufficient unless field conditions change.`,
            warnings: [
                ...((_d = suggestions.warnings) !== null && _d !== void 0 ? _d : []),
                ...((_e = suggestions.hecaNotes) !== null && _e !== void 0 ? _e : []),
                ...((_f = suggestions.gapWarnings) !== null && _f !== void 0 ? _f : []),
            ].slice(0, 8),
        };
    }
    inferStepsFromText(input) {
        var _a, _b;
        const raw = (_b = (_a = input.workScope) !== null && _a !== void 0 ? _a : input.jobDescription) !== null && _b !== void 0 ? _b : input.title;
        const parts = raw
            .split(/[;\n]+|(?:\d+\.\s)|(?:\s+then\s+)/i)
            .map((s) => s.trim())
            .filter((s) => s.length > 8);
        return parts.length >= 2
            ? parts.slice(0, 8)
            : [
                input.title,
                ...(parts.length
                    ? parts
                    : ['Mobilize and set up', 'Execute work', 'Demobilize']),
            ];
    }
    finalize(out, engines, combined) {
        var _a;
        const max_severity = out.inferred_hazards.reduce((m, h) => { var _a; return Math.max(m, (_a = h.severity) !== null && _a !== void 0 ? _a : 3); }, 3);
        const max_likelihood = out.inferred_hazards.reduce((m, h) => { var _a; return Math.max(m, (_a = h.likelihood) !== null && _a !== void 0 ? _a : 3); }, 3);
        return Object.assign(Object.assign({}, out), { engine: engines, combined_text: combined, max_severity,
            max_likelihood, energy_types: ((_a = out.energy_types) === null || _a === void 0 ? void 0 : _a.length)
                ? out.energy_types
                : [
                    ...new Set(out.inferred_hazards.flatMap((h) => { var _a; return (_a = h.energy_types) !== null && _a !== void 0 ? _a : []; })),
                ] });
    }
};
exports.SifHecaScopeAnalysisService = SifHecaScopeAnalysisService;
exports.SifHecaScopeAnalysisService = SifHecaScopeAnalysisService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [vsi_copilot_engine_service_1.VsiCopilotEngineService])
], SifHecaScopeAnalysisService);
//# sourceMappingURL=sif-heca-scope-analysis.service.js.map