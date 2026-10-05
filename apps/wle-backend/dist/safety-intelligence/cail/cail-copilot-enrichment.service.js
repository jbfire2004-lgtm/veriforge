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
var CailCopilotEnrichmentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CailCopilotEnrichmentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const vsi_copilot_engine_service_1 = require("../ai/copilot/vsi-copilot-engine.service");
const vsi_copilot_mappers_1 = require("../ai/copilot/vsi-copilot.mappers");
const CAIL_RISK_CATEGORIES = new Set([
    'behavior',
    'equipment',
    'environment',
    'process',
    'ppe',
    'ergonomic',
    'other',
]);
let CailCopilotEnrichmentService = CailCopilotEnrichmentService_1 = class CailCopilotEnrichmentService {
    constructor(prisma, copilot) {
        this.prisma = prisma;
        this.copilot = copilot;
        this.log = new common_1.Logger(CailCopilotEnrichmentService_1.name);
    }
    buildUpdateFromRun(run) {
        var _a;
        const env = run.cailEnvelope;
        const severity = (0, vsi_copilot_mappers_1.scoreToSeverity)(env.severity_score);
        const riskCategory = CAIL_RISK_CATEGORIES.has(String(env.risk_category))
            ? String(env.risk_category)
            : undefined;
        const summary = env.root_cause_explanation ||
            env.lessons_learned ||
            ((_a = env.recommended_corrective_actions[0]) !== null && _a !== void 0 ? _a : '');
        return Object.assign(Object.assign(Object.assign({ severity }, (riskCategory ? { riskCategory } : {})), (env.tags.length ? { tags: env.tags } : {})), { aiRootCauseSuggestions: env.root_cause_explanation
                ? [
                    {
                        category: env.root_cause_category || 'process',
                        description: env.root_cause_explanation,
                        confidence: 0.85,
                    },
                ]
                : undefined, aiCorrectiveActionSuggestions: [
                ...env.recommended_corrective_actions.map((description) => ({
                    title: description.slice(0, 120),
                    description,
                    actionType: 'corrective',
                    priority: severity === 'critical' || severity === 'high' ? 'high' : 'medium',
                })),
                ...env.recommended_preventive_actions.map((description) => ({
                    title: description.slice(0, 120),
                    description,
                    actionType: 'preventive',
                    priority: 'medium',
                })),
            ], aiClassification: {
                summary,
                similarPatterns: env.predictive_risk_flags,
                engine: run.engine.join('+'),
                module: run.module,
                generatedAt: run.generatedAt,
                cailEnvelope: env,
                copilotOutput: run.output,
            } });
    }
    async persistRun(cailId, run) {
        return this.prisma.cailEntry.update({
            where: { id: cailId },
            data: this.buildUpdateFromRun(run),
        });
    }
    scheduleEnrich(cailId, task) {
        void task()
            .then((run) => this.persistRun(cailId, run))
            .catch((err) => this.log.warn(`Copilot enrich failed for CAIL ${cailId}: ${err instanceof Error ? err.message : err}`));
    }
    async enrichBbo(bboId, cailId, context) {
        const run = await this.copilot.analyzeBbo(context);
        await this.prisma.bboObservation.update({
            where: { id: bboId },
            data: {
                aiAnalysis: {
                    copilot: run.output,
                    cailEnvelope: run.cailEnvelope,
                    engine: run.engine,
                    generatedAt: run.generatedAt,
                },
            },
        });
        if (cailId)
            await this.persistRun(cailId, run);
        return run;
    }
    scheduleBboEnrich(bboId, cailId, context) {
        void this.enrichBbo(bboId, cailId, context).catch((err) => this.log.warn(`BBO copilot enrich failed (${bboId}): ${err instanceof Error ? err.message : err}`));
    }
    scheduleEquipmentEnrich(cailId, context) {
        this.scheduleEnrich(cailId, () => this.copilot.analyzeEquipment(context));
    }
    scheduleFormHazardEnrich(cailId, context) {
        this.scheduleEnrich(cailId, () => this.copilot.analyzeFormHazard(context));
    }
    scheduleInspectionEnrich(cailId, context) {
        this.scheduleEnrich(cailId, () => this.copilot.inspectPhoto(context));
    }
    scheduleCailAnalyzeEnrich(cailId, context) {
        this.scheduleEnrich(cailId, () => this.copilot.analyzeCail(context));
    }
    persistInspectionRun(cailId, run) {
        this.scheduleEnrich(cailId, async () => run);
    }
};
exports.CailCopilotEnrichmentService = CailCopilotEnrichmentService;
exports.CailCopilotEnrichmentService = CailCopilotEnrichmentService = CailCopilotEnrichmentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        vsi_copilot_engine_service_1.VsiCopilotEngineService])
], CailCopilotEnrichmentService);
//# sourceMappingURL=cail-copilot-enrichment.service.js.map