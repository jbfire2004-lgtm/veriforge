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
exports.SifHecaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const sif_scoring_engine_1 = require("./sif-scoring.engine");
const heca_classification_engine_1 = require("./heca-classification.engine");
const control_effectiveness_engine_1 = require("./control-effectiveness.engine");
const csra_heca_engine_1 = require("./csra-heca.engine");
const sif_heca_cail_service_1 = require("./sif-heca-cail.service");
const sif_heca_scope_analysis_service_1 = require("./sif-heca-scope-analysis.service");
const pm_capa_auto_generate_service_1 = require("../pm-corrective-actions/pm-capa-auto-generate.service");
const sif_heca_constants_1 = require("./sif-heca.constants");
let SifHecaService = class SifHecaService {
    constructor(prisma, sifEngine, hecaEngine, controlEngine, csraEngine, cail, scopeAnalysis, capaAuto) {
        this.prisma = prisma;
        this.sifEngine = sifEngine;
        this.hecaEngine = hecaEngine;
        this.controlEngine = controlEngine;
        this.csraEngine = csraEngine;
        this.cail = cail;
        this.scopeAnalysis = scopeAnalysis;
        this.capaAuto = capaAuto;
    }
    async audit(eventId, eventType, actorId, payload) {
        await this.prisma.sifHecaAuditLog.create({
            data: {
                eventId,
                eventType,
                actorId,
                payload: payload,
            },
        });
    }
    async ensureLibraries(companyId, projectId) {
        for (const ind of sif_heca_constants_1.SIF_INDICATORS) {
            const exists = await this.prisma.sifIndicatorLibrary.findFirst({
                where: { companyId, code: ind.code, projectId: projectId !== null && projectId !== void 0 ? projectId : null },
            });
            if (!exists) {
                await this.prisma.sifIndicatorLibrary.create({
                    data: {
                        companyId,
                        projectId,
                        code: ind.code,
                        label: ind.label,
                        weight: ind.weight,
                    },
                });
            }
        }
        for (const cat of sif_heca_constants_1.HECA_CATEGORIES) {
            const exists = await this.prisma.hecaCategoryLibrary.findFirst({
                where: { companyId, code: cat.code, projectId: projectId !== null && projectId !== void 0 ? projectId : null },
            });
            if (!exists) {
                await this.prisma.hecaCategoryLibrary.create({
                    data: {
                        companyId,
                        projectId,
                        code: cat.code,
                        label: cat.label,
                        keywordPatterns: cat.keywords,
                        energyTypes: cat.energyTypes,
                    },
                });
            }
        }
    }
    async evaluateDryRun(input) {
        var _a, _b, _c;
        await this.ensureLibraries(input.companyId, input.projectId);
        const hazardRisk = input.scoringInput.hazardSeverity * input.scoringInput.hazardLikelihood;
        const controlEval = this.controlEngine.evaluate(hazardRisk, (_a = input.scoringInput.controls) !== null && _a !== void 0 ? _a : []);
        const sifOut = this.sifEngine.score({
            hazardSeverity: input.scoringInput.hazardSeverity,
            hazardLikelihood: input.scoringInput.hazardLikelihood,
            energyTypes: input.scoringInput.energyTypes,
            controlStrength: controlEval.controlStrength,
            workerCompetencyGap: false,
            equipmentConditionPoor: false,
            environmentRisk: false,
            historicalIncidents12mo: 0,
            missingControls: controlEval.missingControls,
            weakControls: controlEval.weakControls,
        });
        const hecaOut = this.hecaEngine.classify({
            description: (_b = input.description) !== null && _b !== void 0 ? _b : input.title,
            energyTypes: input.scoringInput.energyTypes,
            categories: sif_heca_constants_1.HECA_CATEGORIES.map((c) => ({
                code: c.code,
                label: c.label,
                keywordPatterns: [...c.keywords],
                energyTypes: [...c.energyTypes],
                severityDefault: 3,
            })),
        });
        const csra = this.csraEngine.assess({
            title: input.title,
            description: input.description,
            energyTypes: input.scoringInput.energyTypes,
            exposureLevel: Math.min(5, Math.max(1, input.scoringInput.hazardLikelihood)),
            controls: ((_c = input.scoringInput.controls) !== null && _c !== void 0 ? _c : []).map((c) => ({
                controlType: c.controlType,
                adequate: c.adequate,
                effectivenessScore: c.effectivenessScore,
                verified: c.verified,
                energyTypes: input.scoringInput.energyTypes,
            })),
            sifHint: {
                score: sifOut.sifScore,
                category: sifOut.sifCategory,
            },
        });
        return {
            sif_score: sifOut.sifScore,
            sif_category: sifOut.sifCategory,
            heca_category: hecaOut.hecaCategoryCode,
            heca_category_label: hecaOut.hecaCategoryLabel,
            heca_risk_score: hecaOut.hecaRiskScore,
            high_energy_flag: hecaOut.highEnergyFlag || csra.highEnergySources.some((e) => e.highEnergy),
            requires_supervisor_review: sifOut.requiresSupervisorReview ||
                csra.sifPotential.requiresSupervisorReview,
            required_controls: [
                ...sifOut.requiredControls,
                ...hecaOut.requiredControls,
                ...csra.recommendations
                    .filter((r) => r.controlClass === 'direct')
                    .map((r) => r.description),
            ],
            required_corrective_actions: [
                ...sifOut.requiredActions,
                ...hecaOut.requiredCorrective,
            ],
            explainability: {
                sif: sifOut.explainability,
                heca: hecaOut.explainability,
                csra: csra.controls.findings.map((detail) => ({
                    rule: 'csra',
                    detail,
                })),
            },
            control_findings: [
                ...controlEval.findings,
                ...csra.controls.findings,
            ],
            csra,
        };
    }
    async assessCsra(input) {
        await this.ensureLibraries(input.companyId, input.projectId);
        const csra = this.csraEngine.assess({
            title: input.title,
            description: input.description,
            workScope: input.workScope,
            locationNote: input.locationNote,
            environmentNote: input.environmentNote,
            equipmentNote: input.equipmentNote,
            energyTypes: input.energyTypes,
            exposureLevel: input.exposureLevel,
            proximity: input.proximity,
            controls: input.controls,
        });
        return csra;
    }
    async analyzeScope(input) {
        const analysis = await this.scopeAnalysis.analyze(input);
        const controls = analysis.inferred_controls.map((c) => ({
            controlType: c.control_type,
            adequate: true,
            effectivenessScore: 4,
            verified: false,
            ppeRequired: c.control_type === 'ppe',
        }));
        const evaluation = await this.evaluateDryRun({
            companyId: input.companyId,
            projectId: input.projectId,
            title: input.title,
            description: [
                input.jobDescription,
                input.workScope,
                input.locationNote,
                input.environmentNote,
            ]
                .filter(Boolean)
                .join(' — '),
            scoringInput: {
                hazardSeverity: analysis.max_severity,
                hazardLikelihood: analysis.max_likelihood,
                energyTypes: analysis.energy_types,
                controls,
            },
        });
        const csra = this.csraEngine.assess({
            title: input.title,
            description: input.jobDescription,
            workScope: input.workScope,
            locationNote: input.locationNote,
            environmentNote: input.environmentNote,
            equipmentNote: input.equipmentNote,
            energyTypes: analysis.energy_types,
            exposureLevel: Math.min(5, Math.max(1, analysis.max_likelihood)),
            controls: analysis.inferred_controls.map((c) => ({
                description: c.description,
                controlType: c.control_type,
                adequate: true,
                effectivenessScore: 4,
                verified: false,
                energyTypes: analysis.energy_types,
            })),
            sifHint: {
                score: evaluation.sif_score,
                category: evaluation.sif_category,
                indicators: analysis.sif_protocol.indicators,
            },
        });
        return {
            analysis,
            evaluation: Object.assign(Object.assign({}, evaluation), { csra }),
            csra,
        };
    }
    async ingest(input) {
        var _a, _b;
        await this.ensureLibraries(input.companyId, input.projectId);
        const sourceItemId = (_a = input.sourceItemId) !== null && _a !== void 0 ? _a : '';
        let event = await this.prisma.sifHecaEvent.findUnique({
            where: {
                sourceType_sourceId_sourceItemId: {
                    sourceType: input.sourceType,
                    sourceId: input.sourceId,
                    sourceItemId,
                },
            },
        });
        if (!event) {
            event = await this.prisma.sifHecaEvent.create({
                data: {
                    companyId: input.companyId,
                    projectId: input.projectId,
                    siteId: input.siteId,
                    workerId: input.workerId,
                    equipmentId: input.equipmentId,
                    sourceType: input.sourceType,
                    sourceId: input.sourceId,
                    sourceItemId,
                    title: input.title,
                    description: input.description,
                    rawPayload: ((_b = input.rawPayload) !== null && _b !== void 0 ? _b : {}),
                },
            });
            await this.audit(event.id, 'ingested', input.actorId);
        }
        return this.scoreEvent(event.id, input.scoringInput, input.actorId);
    }
    async scoreEvent(eventId, scoringInput, actorId) {
        var _a, _b, _c;
        const event = await this.getEvent(eventId);
        const hazardRisk = scoringInput.hazardSeverity * scoringInput.hazardLikelihood;
        const controlEval = this.controlEngine.evaluate(hazardRisk, (_a = scoringInput.controls) !== null && _a !== void 0 ? _a : []);
        const incidentCount = event.workerId
            ? await this.prisma.incident.count({
                where: {
                    workerId: event.workerId,
                    createdAt: {
                        gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
                    },
                },
            })
            : 0;
        const env = (_b = event.rawPayload) === null || _b === void 0 ? void 0 : _b.environmentalJson;
        const environmentRisk = !!env &&
            ['ice', 'storm', 'extreme', 'wind'].some((w) => {
                var _a;
                return String((_a = env.weather) !== null && _a !== void 0 ? _a : '')
                    .toLowerCase()
                    .includes(w);
            });
        const sifOut = this.sifEngine.score({
            hazardSeverity: scoringInput.hazardSeverity,
            hazardLikelihood: scoringInput.hazardLikelihood,
            energyTypes: scoringInput.energyTypes,
            controlStrength: controlEval.controlStrength,
            workerCompetencyGap: false,
            equipmentConditionPoor: false,
            environmentRisk,
            historicalIncidents12mo: incidentCount,
            missingControls: controlEval.missingControls,
            weakControls: controlEval.weakControls,
        });
        const hecaCats = await this.prisma.hecaCategoryLibrary.findMany({
            where: {
                active: true,
                OR: [
                    { companyId: event.companyId, projectId: null },
                    { companyId: event.companyId, projectId: event.projectId },
                ],
            },
        });
        const hecaOut = this.hecaEngine.classify({
            description: (_c = event.description) !== null && _c !== void 0 ? _c : event.title,
            energyTypes: scoringInput.energyTypes,
            categories: hecaCats.map((c) => ({
                code: c.code,
                label: c.label,
                keywordPatterns: c.keywordPatterns,
                energyTypes: c.energyTypes,
                severityDefault: c.severityDefault,
            })),
        });
        await this.prisma.sifScore.upsert({
            where: { eventId },
            create: {
                eventId,
                sifScore: sifOut.sifScore,
                sifCategory: sifOut.sifCategory,
                severityComponent: sifOut.severityComponent,
                likelihoodComponent: sifOut.likelihoodComponent,
                energyComponent: sifOut.energyComponent,
                controlComponent: sifOut.controlComponent,
                competencyComponent: sifOut.competencyComponent,
                equipmentComponent: sifOut.equipmentComponent,
                environmentComponent: sifOut.environmentComponent,
                historyComponent: sifOut.historyComponent,
                requiresSupervisorReview: sifOut.requiresSupervisorReview,
                requiredControls: sifOut.requiredControls,
                requiredActions: sifOut.requiredActions,
                explainability: sifOut.explainability,
            },
            update: {
                version: { increment: 1 },
                sifScore: sifOut.sifScore,
                sifCategory: sifOut.sifCategory,
                severityComponent: sifOut.severityComponent,
                likelihoodComponent: sifOut.likelihoodComponent,
                energyComponent: sifOut.energyComponent,
                controlComponent: sifOut.controlComponent,
                competencyComponent: sifOut.competencyComponent,
                equipmentComponent: sifOut.equipmentComponent,
                environmentComponent: sifOut.environmentComponent,
                historyComponent: sifOut.historyComponent,
                requiresSupervisorReview: sifOut.requiresSupervisorReview,
                requiredControls: sifOut.requiredControls,
                requiredActions: sifOut.requiredActions,
                explainability: sifOut.explainability,
                computedAt: new Date(),
            },
        });
        await this.prisma.hecaScore.upsert({
            where: { eventId },
            create: {
                eventId,
                hecaCategoryCode: hecaOut.hecaCategoryCode,
                hecaCategoryLabel: hecaOut.hecaCategoryLabel,
                severity: hecaOut.severity,
                likelihood: hecaOut.likelihood,
                hecaRiskScore: hecaOut.hecaRiskScore,
                highEnergyFlag: hecaOut.highEnergyFlag,
                requiredControls: hecaOut.requiredControls,
                requiredCorrective: hecaOut.requiredCorrective,
                explainability: hecaOut.explainability,
            },
            update: {
                version: { increment: 1 },
                hecaCategoryCode: hecaOut.hecaCategoryCode,
                hecaCategoryLabel: hecaOut.hecaCategoryLabel,
                severity: hecaOut.severity,
                likelihood: hecaOut.likelihood,
                hecaRiskScore: hecaOut.hecaRiskScore,
                highEnergyFlag: hecaOut.highEnergyFlag,
                requiredControls: hecaOut.requiredControls,
                requiredCorrective: hecaOut.requiredCorrective,
                explainability: hecaOut.explainability,
                computedAt: new Date(),
            },
        });
        const status = sifOut.requiresSupervisorReview
            ? 'review_required'
            : 'scored';
        await this.prisma.sifHecaEvent.update({
            where: { id: eventId },
            data: { status },
        });
        if (sifOut.sifCategory === 'high' ||
            sifOut.sifCategory === 'critical' ||
            controlEval.missingControls > 0) {
            const full = await this.getEvent(eventId);
            let pmCapaId;
            if (this.capaAuto &&
                (sifOut.sifCategory === 'high' || sifOut.sifCategory === 'critical')) {
                const capa = await this.capaAuto.fromSifHecaEvent(eventId, actorId !== null && actorId !== void 0 ? actorId : 0);
                pmCapaId = capa === null || capa === void 0 ? void 0 : capa.id;
            }
            await this.generateCorrectiveActions(full, sifOut, hecaOut, actorId, pmCapaId);
        }
        await this.audit(eventId, 'scored', actorId, {
            sifScore: sifOut.sifScore,
            hecaCategory: hecaOut.hecaCategoryCode,
        });
        return this.getEvent(eventId);
    }
    async getEvent(id) {
        const event = await this.prisma.sifHecaEvent.findFirst({
            where: { id, deletedAt: null },
            include: {
                sifScore: true,
                hecaScore: true,
                correctiveActions: true,
                auditLogs: { orderBy: { createdAt: 'desc' }, take: 20 },
            },
        });
        if (!event)
            throw new common_1.NotFoundException('SIF/HECA event not found');
        return event;
    }
    async list(filters) {
        return this.prisma.sifHecaEvent.findMany({
            where: {
                deletedAt: null,
                projectId: filters.projectId,
                companyId: filters.companyId,
                status: filters.status,
                workerId: filters.workerId,
            },
            include: { sifScore: true, hecaScore: true },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
    }
    async supervisorReview(eventId, action, actorId, notes) {
        const event = await this.getEvent(eventId);
        if (event.status !== 'review_required' && event.status !== 'scored') {
            throw new common_1.BadRequestException('Event not in review state');
        }
        const status = action === 'approve'
            ? 'approved'
            : action === 'reject'
                ? 'rejected'
                : 'ingested';
        await this.prisma.sifHecaEvent.update({
            where: { id: eventId },
            data: { status },
        });
        await this.audit(eventId, `review_${action}`, actorId, { notes });
        return this.getEvent(eventId);
    }
    async workerAccessCheck(workerId, projectId) {
        const openCritical = await this.prisma.sifHecaEvent.count({
            where: {
                workerId,
                projectId,
                status: { in: ['review_required', 'scored'] },
                sifScore: { sifCategory: { in: ['high', 'critical'] } },
            },
        });
        const openCapa = await this.prisma.sifHecaCorrectiveAction.count({
            where: {
                event: { workerId, projectId },
                status: 'open',
            },
        });
        return {
            allowed: openCritical === 0 && openCapa === 0,
            openCriticalEvents: openCritical,
            openCorrectiveActions: openCapa,
        };
    }
    async listIndicators(companyId, projectId) {
        await this.ensureLibraries(companyId, projectId);
        return this.prisma.sifIndicatorLibrary.findMany({
            where: {
                active: true,
                OR: [
                    { companyId, projectId: null },
                    { companyId, projectId: projectId !== null && projectId !== void 0 ? projectId : undefined },
                ],
            },
        });
    }
    getEnergyWheel() {
        return { segments: sif_heca_constants_1.SIF_ENERGY_WHEEL };
    }
    async listHecaCategories(companyId, projectId) {
        await this.ensureLibraries(companyId, projectId);
        return this.prisma.hecaCategoryLibrary.findMany({
            where: {
                active: true,
                OR: [
                    { companyId, projectId: null },
                    { companyId, projectId: projectId !== null && projectId !== void 0 ? projectId : undefined },
                ],
            },
        });
    }
    async projectAnalytics(projectId) {
        var _a, _b, _c, _d, _e, _f, _g;
        const since90 = new Date(Date.now() - 90 * 86400000);
        const events = await this.prisma.sifHecaEvent.findMany({
            where: { projectId, deletedAt: null },
            include: { sifScore: true, hecaScore: true },
            take: 500,
        });
        const recent = events.filter((e) => e.createdAt >= since90);
        const byCategory = {};
        let sifHigh = 0;
        let highEnergy = 0;
        for (const e of events) {
            if (((_a = e.sifScore) === null || _a === void 0 ? void 0 : _a.sifCategory) === 'high' ||
                ((_b = e.sifScore) === null || _b === void 0 ? void 0 : _b.sifCategory) === 'critical') {
                sifHigh++;
            }
            if ((_c = e.hecaScore) === null || _c === void 0 ? void 0 : _c.highEnergyFlag)
                highEnergy++;
            const code = (_e = (_d = e.hecaScore) === null || _d === void 0 ? void 0 : _d.hecaCategoryCode) !== null && _e !== void 0 ? _e : 'unknown';
            byCategory[code] = ((_f = byCategory[code]) !== null && _f !== void 0 ? _f : 0) + 1;
        }
        const avgSif = events.length > 0
            ? Math.round(events.reduce((s, e) => { var _a, _b; return s + ((_b = (_a = e.sifScore) === null || _a === void 0 ? void 0 : _a.sifScore) !== null && _b !== void 0 ? _b : 0); }, 0) /
                events.length)
            : 0;
        const bySource = {};
        for (const e of events) {
            bySource[e.sourceType] = ((_g = bySource[e.sourceType]) !== null && _g !== void 0 ? _g : 0) + 1;
        }
        return {
            projectId,
            totalEvents: events.length,
            events90d: recent.length,
            sifHighCount: sifHigh,
            highEnergyCount: highEnergy,
            averageSifScore: avgSif,
            hecaDistribution: byCategory,
            sourceDistribution: bySource,
            projectSifScore: Math.min(100, avgSif + sifHigh * 5),
            leadingIndicators: {
                sifRatePct: events.length > 0 ? Math.round((sifHigh / events.length) * 100) : 0,
                highEnergyRatePct: events.length > 0
                    ? Math.round((highEnergy / events.length) * 100)
                    : 0,
                events90d: recent.length,
            },
            laggingIndicators: {
                reviewRequired: events.filter((e) => e.status === 'review_required')
                    .length,
                openCorrective: await this.prisma.sifHecaCorrectiveAction.count({
                    where: { event: { projectId }, status: 'open' },
                }),
            },
        };
    }
    async syncOffline(payload) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        const hazards = (_a = payload.hazards) !== null && _a !== void 0 ? _a : [];
        const hazardSeverity = (_c = (_b = payload.scoringInput) === null || _b === void 0 ? void 0 : _b.hazardSeverity) !== null && _c !== void 0 ? _c : (hazards.length ? Math.max(...hazards.map((h) => { var _a; return (_a = h.severity) !== null && _a !== void 0 ? _a : 3; })) : 3);
        const hazardLikelihood = (_e = (_d = payload.scoringInput) === null || _d === void 0 ? void 0 : _d.hazardLikelihood) !== null && _e !== void 0 ? _e : (hazards.length ? Math.max(...hazards.map((h) => { var _a; return (_a = h.likelihood) !== null && _a !== void 0 ? _a : 3; })) : 3);
        const energyFromHazards = hazards.flatMap((h) => { var _a; return (_a = h.energyTypes) !== null && _a !== void 0 ? _a : []; });
        const energyTypes = (_g = (_f = payload.scoringInput) === null || _f === void 0 ? void 0 : _f.energyTypes) !== null && _g !== void 0 ? _g : (((_h = payload.energyTypes) === null || _h === void 0 ? void 0 : _h.length)
            ? payload.energyTypes
            : energyFromHazards.length
                ? [...new Set(energyFromHazards)]
                : ['mechanical']);
        const description = (_j = payload.description) !== null && _j !== void 0 ? _j : [
            payload.jobDescription,
            payload.workScope,
            payload.locationNote,
            payload.environmentNote,
            payload.equipmentNote,
        ]
            .filter(Boolean)
            .join(' — ');
        const mappedControls = ((_l = (_k = payload.scoringInput) === null || _k === void 0 ? void 0 : _k.controls) !== null && _l !== void 0 ? _l : ((_m = payload.controls) !== null && _m !== void 0 ? _m : []).map((c) => {
            var _a, _b, _c, _d;
            return ({
                controlType: (_a = c.controlType) !== null && _a !== void 0 ? _a : 'engineering',
                adequate: (_b = c.adequate) !== null && _b !== void 0 ? _b : true,
                effectivenessScore: (_c = c.effectivenessScore) !== null && _c !== void 0 ? _c : 4,
                verified: false,
                ppeRequired: ((_d = c.controlType) !== null && _d !== void 0 ? _d : '').toLowerCase() === 'ppe',
            });
        })).map((c) => {
            var _a, _b, _c, _d;
            return ({
                controlType: c.controlType,
                adequate: (_a = c.adequate) !== null && _a !== void 0 ? _a : true,
                effectivenessScore: (_b = c.effectivenessScore) !== null && _b !== void 0 ? _b : 4,
                verified: (_c = c.verified) !== null && _c !== void 0 ? _c : false,
                ppeRequired: (_d = c.ppeRequired) !== null && _d !== void 0 ? _d : false,
            });
        });
        const rawPayload = {
            clientSyncId: payload.clientSyncId,
            assessmentKind: payload.assessmentKind,
            jobDescription: payload.jobDescription,
            workScope: payload.workScope,
            locationNote: payload.locationNote,
            environmentNote: payload.environmentNote,
            equipmentNote: payload.equipmentNote,
            hazards: payload.hazards,
            controls: payload.controls,
            energyTypes,
            source: 'field_offline',
        };
        return this.ingest({
            companyId: payload.companyId,
            projectId: payload.projectId,
            siteId: payload.siteId,
            workerId: payload.workerId,
            sourceType: (_o = payload.sourceType) !== null && _o !== void 0 ? _o : 'general',
            sourceId: (_p = payload.sourceId) !== null && _p !== void 0 ? _p : payload.clientSyncId,
            sourceItemId: (_q = payload.sourceItemId) !== null && _q !== void 0 ? _q : payload.clientSyncId,
            title: payload.title,
            description: description || payload.title,
            rawPayload,
            scoringInput: {
                hazardSeverity,
                hazardLikelihood,
                energyTypes,
                controls: mappedControls,
            },
            actorId: payload.actorId,
        });
    }
    async generateCorrectiveActions(event, sifOut, hecaOut, actorId, pmCorrectiveActionId) {
        var _a, _b, _c, _d;
        const titles = [...sifOut.requiredActions, ...hecaOut.requiredCorrective];
        if (!titles.length)
            return;
        const project = await this.prisma.project.findUnique({
            where: { id: event.projectId },
            select: { companyId: true },
        });
        const ownerCompanyId = (_a = project === null || project === void 0 ? void 0 : project.companyId) !== null && _a !== void 0 ? _a : event.companyId;
        const cailEntries = await this.cail.emitCorrectiveActions(event.id, event.projectId, ownerCompanyId, titles.map((t) => ({
            title: t,
            severity: sifOut.sifCategory === 'critical'
                ? 'critical'
                : 'high',
        })), actorId, (_b = event.siteId) !== null && _b !== void 0 ? _b : undefined, (_c = event.workerId) !== null && _c !== void 0 ? _c : undefined);
        for (let i = 0; i < titles.length; i++) {
            await this.prisma.sifHecaCorrectiveAction.create({
                data: {
                    eventId: event.id,
                    title: titles[i].slice(0, 120),
                    description: titles[i],
                    cailEntryId: (_d = cailEntries[i]) === null || _d === void 0 ? void 0 : _d.id,
                    correctiveActionId: i === 0 ? pmCorrectiveActionId : undefined,
                    status: 'open',
                    dueAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
                },
            });
        }
    }
};
exports.SifHecaService = SifHecaService;
exports.SifHecaService = SifHecaService = __decorate([
    (0, common_1.Injectable)(),
    __param(7, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        sif_scoring_engine_1.SifScoringEngine,
        heca_classification_engine_1.HecaClassificationEngine,
        control_effectiveness_engine_1.ControlEffectivenessEngine,
        csra_heca_engine_1.CsraHecaEngine,
        sif_heca_cail_service_1.SifHecaCailService,
        sif_heca_scope_analysis_service_1.SifHecaScopeAnalysisService,
        pm_capa_auto_generate_service_1.PmCapaAutoGenerateService])
], SifHecaService);
//# sourceMappingURL=sif-heca.service.js.map