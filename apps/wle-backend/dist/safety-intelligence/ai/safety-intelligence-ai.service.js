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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SafetyIntelligenceAiService = void 0;
const common_1 = require("@nestjs/common");
const vsi_copilot_engine_service_1 = require("./copilot/vsi-copilot-engine.service");
const vsi_copilot_mappers_1 = require("./copilot/vsi-copilot.mappers");
let SafetyIntelligenceAiService = class SafetyIntelligenceAiService {
    constructor(copilot) {
        this.copilot = copilot;
    }
    async buildInvestigationPack(input) {
        const run = await this.copilot.investigateIncident(Object.assign(Object.assign({}, input), { relatedCail: input.relatedCailTitles }));
        const incident = run.output;
        return {
            generatedAt: run.generatedAt,
            engine: 'copilot',
            rootCauses: [
                {
                    category: 'primary',
                    description: incident.root_cause_primary,
                    confidence: 0.85,
                },
                ...(incident.root_cause_secondary
                    ? [
                        {
                            category: 'secondary',
                            description: incident.root_cause_secondary,
                            confidence: 0.65,
                        },
                    ]
                    : []),
            ],
            capaSuggestions: [
                ...incident.corrective_actions.map((action) => ({
                    title: action.slice(0, 120),
                    description: action,
                    actionType: 'corrective',
                    priority: incident.sif_potential === 'critical' ||
                        incident.sif_potential === 'high'
                        ? 'high'
                        : 'medium',
                })),
                ...incident.preventive_actions.map((action) => ({
                    title: action.slice(0, 120),
                    description: action,
                    actionType: 'preventive',
                    priority: 'medium',
                })),
            ],
            similarPatterns: incident.predictive_risk_flags,
            summary: incident.lessons_learned,
            interventions: incident.preventive_actions.map((message) => ({
                type: 'preventive',
                message,
            })),
        };
    }
    async classifyInspectionPhoto(caption) {
        return this.classifyInspectionPhotoFull({ caption });
    }
    async classifyInspectionPhotoFull(input) {
        const run = await this.copilot.inspectPhoto(input);
        const out = run.output;
        return {
            engines: run.engine,
            suggestedPolarity: out.classification,
            suggestedSeverity: (0, vsi_copilot_mappers_1.scoreToSeverity)(out.severity_score),
            suggestedCaption: out.recommended_corrective_action ||
                out.positive_observation ||
                input.caption,
            riskCategory: out.risk_category,
            hazardPatterns: out.tags,
            hazardSummary: out.hazard_type,
            copilot: out,
            cailEnvelope: run.cailEnvelope,
        };
    }
    async buildLessonInsights(input) {
        var _a;
        const run = await this.copilot.generateLesson(Object.assign(Object.assign({}, input), { companyId: input.companyId, projectId: input.projectId }));
        const lesson = run.output;
        return {
            engine: run.engine.join('+'),
            summary: lesson.summary,
            rootCause: lesson.what_went_wrong,
            correctiveAction: lesson.what_fixed_it,
            keyTakeaways: [
                lesson.how_to_prevent_recurrence,
                lesson.recommended_toolbox_talk,
                ...lesson.recommended_training_topics,
            ].filter(Boolean),
            riskLevel: (_a = input.severity) !== null && _a !== void 0 ? _a : 'medium',
            copilot: lesson,
            cailEnvelope: run.cailEnvelope,
        };
    }
    async analyzeCailEntry(input) {
        const run = await this.copilot.analyzeCail(Object.assign(Object.assign({}, input), { openCailCount: input.openCailCount }));
        const envelope = run.cailEnvelope;
        return {
            generatedAt: run.generatedAt,
            engine: run.engine.join('+'),
            summary: envelope.root_cause_explanation || envelope.lessons_learned,
            rootCauseSuggestions: [
                {
                    category: envelope.root_cause_category,
                    description: envelope.root_cause_explanation,
                    confidence: 0.8,
                },
            ],
            correctiveActionSuggestions: envelope.recommended_corrective_actions.map((description) => ({
                title: description.slice(0, 120),
                description,
                actionType: 'corrective',
                priority: 'medium',
            })),
            similarPatterns: envelope.predictive_risk_flags,
            interventions: envelope.recommended_preventive_actions.map((message) => ({
                type: 'preventive',
                message,
            })),
            cailEnvelope: envelope,
            copilot: run.output,
            copilotRun: run,
        };
    }
    async buildPredictiveRisk(input) {
        const run = await this.copilot.predictRisk(Object.assign(Object.assign({}, input), { companyHotspots: input.companyHotspots.map((c) => {
                var _a;
                return `Company ${c.companyId}: ${c.count} items (${(_a = c.topCategory) !== null && _a !== void 0 ? _a : 'mixed'})`;
            }) }));
        const out = run.output;
        const score = Math.min(100, 40 +
            input.overdueCailCount * 3 +
            input.incidentCount * 8 +
            input.atRiskBboCount * 2);
        const predictedLevel = score >= 80
            ? 'critical'
            : score >= 65
                ? 'high'
                : score >= 45
                    ? 'elevated'
                    : 'low';
        return {
            engine: run.engine.join('+'),
            predictedLevel,
            score,
            precursors: [...out.emerging_risks, ...out.early_warning_flags],
            interventions: out.recommended_preventive_actions.map((message) => ({
                type: 'preventive',
                message,
                urgency: predictedLevel === 'critical' ? 'immediate' : 'this_week',
            })),
            copilot: out,
            cailEnvelope: run.cailEnvelope,
        };
    }
};
exports.SafetyIntelligenceAiService = SafetyIntelligenceAiService;
exports.SafetyIntelligenceAiService = SafetyIntelligenceAiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [vsi_copilot_engine_service_1.VsiCopilotEngineService])
], SafetyIntelligenceAiService);
//# sourceMappingURL=safety-intelligence-ai.service.js.map