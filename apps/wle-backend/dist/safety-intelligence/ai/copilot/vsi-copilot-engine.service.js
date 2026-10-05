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
var VsiCopilotEngineService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VsiCopilotEngineService = void 0;
const common_1 = require("@nestjs/common");
const autonomous_safety_1 = require("@vera/autonomous-safety");
const llm_safety_service_1 = require("../llm-safety.service");
const vsi_vision_bridge_service_1 = require("../vsi-vision-bridge.service");
const vsi_copilot_mappers_1 = require("./vsi-copilot.mappers");
let VsiCopilotEngineService = VsiCopilotEngineService_1 = class VsiCopilotEngineService {
    constructor(llm, vision) {
        this.llm = llm;
        this.vision = vision;
        this.logger = new common_1.Logger(VsiCopilotEngineService_1.name);
        this.vase = new autonomous_safety_1.VeraAutonomousSafetyEngine();
    }
    async run(request) {
        const engines = [];
        let output;
        const llmResult = await this.llm.runCopilotModule(request.module, request.context, {
            projectId: request.projectId,
            companyId: request.companyId,
            sourceType: request.sourceType,
            actor: request.actor,
        });
        if (llmResult) {
            engines.push('copilot-llm');
            output = llmResult;
        }
        else {
            output = await this.heuristicRun(request.module, request.context);
            engines.push('copilot-heuristic', 'vase');
        }
        return {
            module: request.module,
            engine: engines,
            output,
            cailEnvelope: (0, vsi_copilot_mappers_1.toCailEnvelope)(request.module, output),
            generatedAt: new Date().toISOString(),
        };
    }
    async inspectPhoto(context) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        const engines = [];
        let visionHints = null;
        try {
            const v = await this.vision.analyzeSafetyPhoto(context);
            engines.push('vera-vision');
            visionHints = {
                classification: v.suggestedPolarity,
                hazard_type: (_a = v.hazards[0]) !== null && _a !== void 0 ? _a : 'site_condition',
                risk_category: (_b = v.riskCategory) !== null && _b !== void 0 ? _b : 'other',
                severity_score: (0, vsi_copilot_mappers_1.severityToScore)(v.suggestedSeverity),
                recommended_corrective_action: (_d = (_c = v.suggestedCaption) !== null && _c !== void 0 ? _c : v.hazards.join('; ')) !== null && _d !== void 0 ? _d : '',
                tags: v.hazards,
                positive_observation: v.suggestedPolarity === 'safe'
                    ? (_e = v.suggestedCaption) !== null && _e !== void 0 ? _e : 'Observed safe work practice'
                    : undefined,
            };
        }
        catch (_m) {
        }
        if (this.llm.isConfigured() &&
            context.companyId != null &&
            context.companyId > 0) {
            try {
                const llmClass = await this.llm.classifySafetyPhoto({
                    caption: context.caption,
                    ocrText: context.ocrText,
                    imageUrl: context.imageUrl,
                    imageBase64: context.imageBase64,
                    imageMimeType: context.imageMimeType,
                    companyId: context.companyId,
                    projectId: context.projectId,
                });
                if (llmClass) {
                    engines.push('veri-agent-photo');
                    visionHints = {
                        classification: llmClass.suggestedPolarity,
                        hazard_type: llmClass.hazardSummary || (visionHints === null || visionHints === void 0 ? void 0 : visionHints.hazard_type) || 'site_condition',
                        risk_category: (_g = (_f = llmClass.riskCategory) !== null && _f !== void 0 ? _f : visionHints === null || visionHints === void 0 ? void 0 : visionHints.risk_category) !== null && _g !== void 0 ? _g : 'other',
                        severity_score: (0, vsi_copilot_mappers_1.severityToScore)(llmClass.suggestedSeverity),
                        recommended_corrective_action: (_j = (_h = llmClass.suggestedCaption) !== null && _h !== void 0 ? _h : visionHints === null || visionHints === void 0 ? void 0 : visionHints.recommended_corrective_action) !== null && _j !== void 0 ? _j : '',
                        tags: (_k = visionHints === null || visionHints === void 0 ? void 0 : visionHints.tags) !== null && _k !== void 0 ? _k : [],
                        positive_observation: llmClass.suggestedPolarity === 'safe'
                            ? (_l = llmClass.suggestedCaption) !== null && _l !== void 0 ? _l : visionHints === null || visionHints === void 0 ? void 0 : visionHints.positive_observation
                            : undefined,
                    };
                }
            }
            catch (_o) {
            }
        }
        const run = await this.run({
            module: 'inspection',
            context: Object.assign(Object.assign({}, context), { visionHints }),
            projectId: context.projectId,
            companyId: context.companyId,
        });
        return Object.assign(Object.assign({}, run), { engine: [...engines, ...run.engine], output: run.output });
    }
    async analyzeBbo(context) {
        return this.run({ module: 'bbo', context });
    }
    async investigateIncident(context) {
        return this.run({ module: 'incident', context });
    }
    async analyzeEquipment(context) {
        return this.run({ module: 'equipment', context });
    }
    async analyzeFormHazard(context) {
        return this.run({ module: 'form_hazard', context });
    }
    async analyzeSifHecaScope(context) {
        return this.run({
            module: 'sif_heca_assessment',
            context,
            projectId: context.projectId,
            companyId: context.companyId,
            sourceType: 'sif',
        });
    }
    async generateLesson(context) {
        return this.run({ module: 'lessons_learned', context });
    }
    async generatePresentation(context) {
        return this.run({ module: 'presentation', context });
    }
    async predictRisk(context) {
        return this.run({ module: 'predictive_risk', context });
    }
    async analyzeCail(context) {
        return this.run({ module: 'cail_analyze', context });
    }
    vaseContext(context, projectId, companyId) {
        var _a, _b;
        const caption = [
            context.title,
            context.description,
            context.narrative,
            context.behaviorDescription,
            context.caption,
        ]
            .filter(Boolean)
            .join(' ')
            .slice(0, 2000);
        return {
            companyId: companyId ? String(companyId) : undefined,
            projectId: projectId ? String(projectId) : undefined,
            trainingGaps: Number((_a = context.trainingGaps) !== null && _a !== void 0 ? _a : 0),
            inspectionFailures: Number((_b = context.inspectionFailures) !== null && _b !== void 0 ? _b : 0),
            visionHazards: caption ? [caption] : undefined,
        };
    }
    async heuristicRun(module, context) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2;
        const report = this.vase.analyze(this.vaseContext(context, context.projectId, context.companyId));
        const topCause = (_b = (_a = report.rootCause.likelyCauses[0]) === null || _a === void 0 ? void 0 : _a.cause) !== null && _b !== void 0 ? _b : 'Undetermined';
        const capa = (_c = report.rootCause.correctiveActions[0]) !== null && _c !== void 0 ? _c : 'Implement controls and verify';
        switch (module) {
            case 'inspection': {
                const visionHints = context.visionHints;
                if (visionHints)
                    return visionHints;
                const text = [context.caption, context.ocrText]
                    .filter(Boolean)
                    .join(' ');
                const atRisk = /unsafe|hazard|risk|violation|damage/i.test(String(text));
                return {
                    classification: atRisk ? 'at_risk' : 'safe',
                    hazard_type: atRisk ? 'site_hazard' : 'none',
                    risk_category: 'environment',
                    severity_score: atRisk ? 3 : 1,
                    recommended_corrective_action: atRisk ? capa : '',
                    positive_observation: atRisk ? undefined : 'Safe condition observed',
                    tags: report.hazards.precursors.slice(0, 5),
                };
            }
            case 'bbo': {
                const desc = String((_e = (_d = context.behaviorDescription) !== null && _d !== void 0 ? _d : context.description) !== null && _e !== void 0 ? _e : '');
                const atRisk = /unsafe|bypass|hazard|at.risk/i.test(desc);
                return {
                    behavior_type: atRisk ? 'at_risk_behavior' : 'safe_behavior',
                    classification: atRisk ? 'at_risk' : 'safe',
                    root_cause_category: atRisk ? 'behavior' : '',
                    root_cause_explanation: atRisk ? topCause : '',
                    recommended_actions: atRisk
                        ? report.rootCause.correctiveActions.slice(0, 3)
                        : [],
                    positive_reinforcement: atRisk
                        ? undefined
                        : 'Positive safety behavior observed',
                    tags: report.hazards.precursors.slice(0, 3),
                };
            }
            case 'incident':
                return {
                    root_cause_primary: topCause,
                    root_cause_secondary: (_g = (_f = report.rootCause.likelyCauses[1]) === null || _f === void 0 ? void 0 : _f.cause) !== null && _g !== void 0 ? _g : '',
                    five_whys: [
                        'Why did it happen? ' + topCause,
                        'Why was the control absent? See contributing factors',
                        'Why was it not caught earlier? Inspection or supervision gap',
                        'Why did systems allow it? Process or training gap',
                        'Why does it matter? Prevent recurrence across site',
                    ],
                    fishbone: {
                        people: report.rootCause.contributingFactors.filter((f) => /train|supervis|worker|crew/i.test(f)),
                        equipment: report.rootCause.contributingFactors.filter((f) => /equip|tool|machine/i.test(f)),
                        environment: report.rootCause.contributingFactors.filter((f) => /weather|site|house|env/i.test(f)),
                        process: report.rootCause.contributingFactors.filter((f) => /procedure|process|plan/i.test(f)),
                        materials: [],
                    },
                    corrective_actions: report.rootCause.correctiveActions.slice(0, 5),
                    preventive_actions: report.interventions
                        .map((i) => i.title)
                        .slice(0, 3),
                    sif_potential: report.sif.riskScore.level === 'critical'
                        ? 'critical'
                        : report.sif.riskScore.level === 'high'
                            ? 'high'
                            : 'medium',
                    lessons_learned: (_h = report.sif.patterns[0]) !== null && _h !== void 0 ? _h : '',
                    predictive_risk_flags: report.hazards.precursors,
                };
            case 'equipment':
                return {
                    failure_mode: String((_k = (_j = context.failureMode) !== null && _j !== void 0 ? _j : context.title) !== null && _k !== void 0 ? _k : 'equipment_defect'),
                    severity_score: (0, vsi_copilot_mappers_1.severityToScore)(String((_l = context.severity) !== null && _l !== void 0 ? _l : 'medium')),
                    risk_category: 'equipment',
                    recommended_corrective_actions: [capa],
                    recommended_preventive_actions: ['Increase inspection frequency'],
                    tags: ['equipment', 'inspection_fail'],
                };
            case 'form_hazard':
                return {
                    hazard_type: String((_o = (_m = context.hazardDescription) !== null && _m !== void 0 ? _m : context.title) !== null && _o !== void 0 ? _o : 'form_hazard'),
                    missing_controls: String((_p = context.missingControls) !== null && _p !== void 0 ? _p : '')
                        .split(/[,;]/)
                        .map((s) => s.trim())
                        .filter(Boolean),
                    severity_score: (0, vsi_copilot_mappers_1.severityToScore)(String((_q = context.severity) !== null && _q !== void 0 ? _q : 'medium')),
                    root_cause_category: 'process',
                    recommended_corrective_actions: report.rootCause.correctiveActions.slice(0, 3),
                    recommended_preventive_actions: report.interventions
                        .map((i) => i.title)
                        .slice(0, 2),
                    tags: ['form', 'hazard'],
                };
            case 'sif_heca_assessment': {
                const text = [
                    context.title,
                    context.jobDescription,
                    context.workScope,
                    context.locationNote,
                ]
                    .filter(Boolean)
                    .join(' ');
                const highEnergy = /fall|height|electrical|pressure|crane|rigging|confined/i.test(text);
                return {
                    job_steps: [String((_r = context.title) !== null && _r !== void 0 ? _r : 'Work activity')],
                    inferred_hazards: report.hazards.precursors.slice(0, 5).map((p) => ({
                        description: p,
                        category: 'Field',
                        severity: highEnergy ? 4 : 3,
                        likelihood: 3,
                        energy_types: highEnergy ? ['gravity'] : [],
                        reason: 'Inferred from VASE safety analysis',
                    })),
                    inferred_controls: report.rootCause.correctiveActions
                        .slice(0, 4)
                        .map((c) => {
                        var _a;
                        return ({
                            description: c,
                            control_type: 'administrative',
                            linked_hazard: (_a = report.hazards.precursors[0]) !== null && _a !== void 0 ? _a : 'General',
                            reason: 'Recommended from safety engine',
                        });
                    }),
                    energy_types: highEnergy ? ['gravity'] : [],
                    heca_assessment: {
                        primary_category: 'line_of_fire',
                        primary_label: 'Line of fire',
                        secondary_categories: [],
                        high_energy: highEnergy,
                        narrative: (_s = report.sif.patterns[0]) !== null && _s !== void 0 ? _s : 'Review high-energy exposures',
                    },
                    sif_protocol: {
                        applies: report.sif.riskScore.level === 'high' ||
                            report.sif.riskScore.level === 'critical',
                        category: report.sif.riskScore.level === 'critical'
                            ? 'critical'
                            : report.sif.riskScore.level === 'high'
                                ? 'high'
                                : 'medium',
                        indicators: report.hazards.precursors.slice(0, 3),
                        narrative: (_t = report.sif.patterns[0]) !== null && _t !== void 0 ? _t : '',
                        requires_supervisor_review: highEnergy,
                    },
                    scope_fit_summary: (_v = (_u = report.interventions[0]) === null || _u === void 0 ? void 0 : _u.title) !== null && _v !== void 0 ? _v : 'Review scope against SIF/HECA criteria',
                    warnings: report.hazards.precursors.slice(0, 3),
                };
            }
            case 'lessons_learned':
                return {
                    summary: `Lesson: ${(_w = context.title) !== null && _w !== void 0 ? _w : 'verified corrective action'}`,
                    what_went_wrong: String((_x = context.rootCauseNotes) !== null && _x !== void 0 ? _x : topCause),
                    what_fixed_it: String((_y = context.correctiveAction) !== null && _y !== void 0 ? _y : capa),
                    how_to_prevent_recurrence: (_0 = (_z = report.interventions[0]) === null || _z === void 0 ? void 0 : _z.title) !== null && _0 !== void 0 ? _0 : capa,
                    applicable_to: ['field_crews', 'supervisors'],
                    recommended_training_topics: report.interventions
                        .filter((i) => i.type === 'require_training')
                        .map((i) => i.title),
                    recommended_toolbox_talk: (_1 = report.sif.patterns[0]) !== null && _1 !== void 0 ? _1 : 'Review hazard controls',
                };
            case 'presentation':
                return {
                    executive_summary: `Project safety snapshot — ${report.sif.riskScore.level} risk level`,
                    key_trends: report.hazards.precursors,
                    top_risks: report.rootCause.systemicFailures,
                    positive_observations: [
                        'BBO and inspections provide leading indicators',
                    ],
                    company_performance_summary: 'See open CAIL closure rates and overdue items',
                    recommended_focus_areas: report.interventions.map((i) => i.title),
                    recommended_training: report.interventions
                        .filter((i) => i.type === 'require_training')
                        .map((i) => i.title),
                    recommended_actions_next_30_days: report.rootCause.correctiveActions.slice(0, 5),
                };
            case 'predictive_risk':
                return {
                    emerging_risks: report.hazards.precursors,
                    high_risk_companies: (_2 = context.companyHotspots) !== null && _2 !== void 0 ? _2 : [],
                    high_risk_tasks: report.rootCause.systemicFailures,
                    high_risk_equipment: [],
                    recommended_preventive_actions: report.interventions.map((i) => i.title),
                    early_warning_flags: report.sif.patterns,
                };
            case 'cail_analyze':
                return (0, vsi_copilot_mappers_1.toCailEnvelope)('incident', {
                    root_cause_primary: topCause,
                    corrective_actions: report.rootCause.correctiveActions,
                    preventive_actions: report.interventions.map((i) => i.title),
                    sif_potential: report.sif.riskScore.level,
                    lessons_learned: report.sif.patterns[0],
                    predictive_risk_flags: report.hazards.precursors,
                });
            default:
                return {};
        }
    }
};
exports.VsiCopilotEngineService = VsiCopilotEngineService;
exports.VsiCopilotEngineService = VsiCopilotEngineService = VsiCopilotEngineService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [llm_safety_service_1.LlmSafetyService,
        vsi_vision_bridge_service_1.VsiVisionBridgeService])
], VsiCopilotEngineService);
//# sourceMappingURL=vsi-copilot-engine.service.js.map