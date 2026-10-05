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
exports.PmUnifiedHazardControlService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
const pm_project_safety_context_service_1 = require("../pm-project-safety-context/pm-project-safety-context.service");
const pm_company_safety_context_service_1 = require("../pm-company-safety-context/pm-company-safety-context.service");
const pm_worker_safety_profile_service_1 = require("../pm-worker-safety-profile/pm-worker-safety-profile.service");
const pm_unified_hazard_control_cail_service_1 = require("./pm-unified-hazard-control-cail.service");
const energy_wheel_engine_1 = require("./energy-wheel.engine");
const sif_heca_scoring_engine_1 = require("./sif-heca-scoring.engine");
const hazard_ingestion_engine_1 = require("./hazard-ingestion.engine");
const control_suggestion_engine_1 = require("./control-suggestion.engine");
const hazard_control_mapping_engine_1 = require("./hazard-control-mapping.engine");
const publish_workflow_engine_1 = require("./publish-workflow.engine");
const enforcement_engine_1 = require("./enforcement.engine");
let PmUnifiedHazardControlService = class PmUnifiedHazardControlService {
    constructor(prisma, cail, projectContext, companyContext, workerSafety) {
        this.prisma = prisma;
        this.cail = cail;
        this.projectContext = projectContext;
        this.companyContext = companyContext;
        this.workerSafety = workerSafety;
        this.energyWheel = new energy_wheel_engine_1.EnergyWheelEngine();
        this.sifHeca = new sif_heca_scoring_engine_1.SifHecaScoringEngine();
        this.ingestion = new hazard_ingestion_engine_1.HazardIngestionEngine();
        this.controlSuggestion = new control_suggestion_engine_1.ControlSuggestionEngine();
        this.mapping = new hazard_control_mapping_engine_1.HazardControlMappingEngine();
        this.publishWorkflow = new publish_workflow_engine_1.PublishWorkflowEngine();
        this.enforcement = new enforcement_engine_1.EnforcementEngine();
    }
    async hazardAudit(companyId, entityType, entityId, eventType, projectId, hazardId, actorId, payload) {
        await this.prisma.pmUnifiedHazardAudit.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                companyId,
                projectId,
                hazardId,
                entityType,
                entityId,
                eventType,
                actorId,
                payload: payload,
            },
        });
    }
    async controlAudit(companyId, entityType, entityId, eventType, projectId, controlId, actorId, payload) {
        await this.prisma.pmUnifiedControlAudit.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                companyId,
                projectId,
                controlId,
                entityType,
                entityId,
                eventType,
                actorId,
                payload: payload,
            },
        });
    }
    async getDashboard(filters) {
        var _a;
        const hazardWhere = Object.assign({ companyId: filters.companyId, deletedAt: null }, (filters.projectId ? { projectId: filters.projectId } : {}));
        const [hazardCount, controlCount, publishedHazards, sifCount, unmapped, energyRows,] = await Promise.all([
            this.prisma.pmUnifiedHazard.count({ where: hazardWhere }),
            this.prisma.pmUnifiedControl.count({
                where: Object.assign({ companyId: filters.companyId, deletedAt: null }, (filters.projectId ? { projectId: filters.projectId } : {})),
            }),
            this.prisma.pmUnifiedHazard.count({
                where: Object.assign(Object.assign({}, hazardWhere), { status: 'published' }),
            }),
            this.prisma.pmUnifiedHazard.count({
                where: Object.assign(Object.assign({}, hazardWhere), { sifPotential: true }),
            }),
            this.prisma.pmUnifiedHazard.count({
                where: Object.assign(Object.assign({}, hazardWhere), { status: 'published', controlLinks: { none: {} } }),
            }),
            this.prisma.pmUnifiedHazardEnergy.groupBy({
                by: ['energyType'],
                where: { hazard: hazardWhere },
                _count: true,
            }),
        ]);
        const companyScore = this.cail.companyHazardScore({
            publishedHazards,
            unmappedHazards: unmapped,
            sifCount,
            chronicCount: 0,
        });
        const insights = await this.cail.insights(filters);
        return {
            companyId: filters.companyId,
            projectId: (_a = filters.projectId) !== null && _a !== void 0 ? _a : null,
            metrics: {
                hazardCount,
                controlCount,
                publishedHazards,
                sifCount,
                unmappedPublished: unmapped,
                companyHazardScore: companyScore,
            },
            energyExposure: energyRows.map((e) => ({
                energyType: e.energyType,
                count: e._count,
            })),
            cail: { insights, companyScore },
        };
    }
    async getHazard(hazardId) {
        const hazard = await this.prisma.pmUnifiedHazard.findFirst({
            where: { id: hazardId, deletedAt: null },
            include: {
                energySources: true,
                controlLinks: {
                    include: { control: { include: { verifications: true } } },
                },
                trainingReqs: true,
                equipmentReqs: true,
                ppeReqs: true,
                versions: { orderBy: { version: 'desc' }, take: 5 },
            },
        });
        if (!hazard)
            throw new common_1.NotFoundException('Hazard not found');
        return hazard;
    }
    async getControl(controlId) {
        const control = await this.prisma.pmUnifiedControl.findFirst({
            where: { id: controlId, deletedAt: null },
            include: {
                verifications: { orderBy: { stepOrder: 'asc' } },
                hazardLinks: { include: { hazard: true } },
                trainingReqs: true,
                ppeReqs: true,
                versions: { orderBy: { version: 'desc' }, take: 5 },
            },
        });
        if (!control)
            throw new common_1.NotFoundException('Control not found');
        return control;
    }
    async listHazards(filters) {
        return this.prisma.pmUnifiedHazard.findMany({
            where: Object.assign(Object.assign(Object.assign({ companyId: filters.companyId, deletedAt: null }, (filters.projectId ? { projectId: filters.projectId } : {})), (filters.scopeLevel ? { scopeLevel: filters.scopeLevel } : {})), (filters.status ? { status: filters.status } : {})),
            include: {
                energySources: true,
                controlLinks: { include: { control: true } },
                ppeReqs: true,
                trainingReqs: true,
            },
            orderBy: { updatedAt: 'desc' },
            take: 200,
        });
    }
    async createHazard(companyId, body, actorId) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        const severity = (_a = body.severity) !== null && _a !== void 0 ? _a : 3;
        const likelihood = (_b = body.likelihood) !== null && _b !== void 0 ? _b : 3;
        const energies = (_d = (_c = body.energyTypes) === null || _c === void 0 ? void 0 : _c.map((e) => ({
            energyType: e,
            exposureLevel: 2,
            highEnergyFlag: ['electrical', 'pressure', 'chemical'].includes(e),
            severityScore: 3,
            autoDetected: false,
        }))) !== null && _d !== void 0 ? _d : this.energyWheel.detectFromText(body.description);
        const sifResult = this.sifHeca.score({
            severity,
            likelihood,
            highEnergyCount: energies.filter((e) => e.highEnergyFlag).length,
            openCapaCount: 0,
            priorIncidentCount: 0,
        });
        const hazard = await this.prisma.pmUnifiedHazard.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                companyId,
                projectId: body.projectId,
                workPackageId: body.workPackageId,
                taskId: body.taskId,
                workerId: body.workerId,
                parentHazardId: body.parentHazardId,
                scopeLevel: (_e = body.scopeLevel) !== null && _e !== void 0 ? _e : (body.projectId ? 'project' : 'company'),
                hazardType: (_f = body.hazardType) !== null && _f !== void 0 ? _f : 'physical',
                category: (_g = body.category) !== null && _g !== void 0 ? _g : 'energy',
                title: body.title,
                description: body.description,
                severity,
                likelihood,
                riskScore: sifResult.riskScore,
                sifPotential: sifResult.sifPotential,
                sifScore: sifResult.sifScore,
                hecaCategoryKey: sifResult.hecaCategoryKey,
                supervisorReviewRequired: sifResult.supervisorReviewRequired,
                requiredTraining: ((_h = body.trainingCodes) !== null && _h !== void 0 ? _h : []),
                requiredPpe: ((_j = body.ppeTypes) !== null && _j !== void 0 ? _j : []),
                sourceType: 'manual',
                clientSyncId: body.clientSyncId,
                energySources: {
                    create: energies.map((e) => ({
                        id: (0, crypto_1.randomUUID)(),
                        energyType: e.energyType,
                        exposureLevel: e.exposureLevel,
                        highEnergyFlag: e.highEnergyFlag,
                        severityScore: e.severityScore,
                        autoDetected: e.autoDetected,
                    })),
                },
                trainingReqs: {
                    create: ((_k = body.trainingCodes) !== null && _k !== void 0 ? _k : []).map((code) => ({
                        id: (0, crypto_1.randomUUID)(),
                        trainingCode: code,
                    })),
                },
                ppeReqs: {
                    create: ((_l = body.ppeTypes) !== null && _l !== void 0 ? _l : []).map((ppe) => ({
                        id: (0, crypto_1.randomUUID)(),
                        ppeType: ppe,
                    })),
                },
            },
            include: { energySources: true, controlLinks: true },
        });
        await this.hazardAudit(companyId, 'hazard', hazard.id, 'created', body.projectId, hazard.id, actorId);
        return { hazard, sifHeca: sifResult };
    }
    async publishHazard(hazardId, actorId) {
        var _a;
        const hazard = await this.prisma.pmUnifiedHazard.findUnique({
            where: { id: hazardId },
            include: { controlLinks: true, ppeReqs: true, trainingReqs: true },
        });
        if (!hazard || hazard.deletedAt)
            throw new common_1.NotFoundException('Hazard not found');
        const mappingResult = this.mapping.validateMapping({
            hazardTitle: hazard.title,
            linkedControlCount: hazard.controlLinks.length,
            ppeCount: hazard.ppeReqs.length,
            trainingCount: hazard.trainingReqs.length,
            weakIssues: this.controlSuggestion.detectWeakControls(hazard.controlLinks),
            sifPotential: hazard.sifPotential,
        });
        const pub = this.publishWorkflow.evaluateHazard({
            status: hazard.status,
            mappingComplete: mappingResult.complete,
            sifPotential: hazard.sifPotential,
            supervisorReviewRequired: hazard.supervisorReviewRequired,
            linkedControlCount: hazard.controlLinks.length,
        });
        if (!pub.canPublish)
            throw new common_1.BadRequestException(pub.violations.join('; '));
        await this.prisma.pmUnifiedHazardVersion.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                hazardId,
                version: hazard.version,
                snapshotJson: hazard,
            },
        });
        const updated = await this.prisma.pmUnifiedHazard.update({
            where: { id: hazardId },
            data: {
                status: 'published',
                version: { increment: 1 },
                publishedAt: new Date(),
            },
        });
        await this.hazardAudit(hazard.companyId, 'hazard', hazardId, 'published', (_a = hazard.projectId) !== null && _a !== void 0 ? _a : undefined, hazardId, actorId);
        return updated;
    }
    async listControls(filters) {
        return this.prisma.pmUnifiedControl.findMany({
            where: Object.assign(Object.assign({ companyId: filters.companyId, deletedAt: null }, (filters.projectId ? { projectId: filters.projectId } : {})), (filters.controlType ? { controlType: filters.controlType } : {})),
            include: { verifications: true, hazardLinks: true },
            orderBy: { updatedAt: 'desc' },
            take: 200,
        });
    }
    async createControl(companyId, body, actorId) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        const control = await this.prisma.pmUnifiedControl.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                companyId,
                projectId: body.projectId,
                scopeLevel: (_a = body.scopeLevel) !== null && _a !== void 0 ? _a : (body.projectId ? 'project' : 'company'),
                controlType: (_b = body.controlType) !== null && _b !== void 0 ? _b : 'administrative',
                title: body.title,
                description: body.description,
                controlStrength: (_c = body.controlStrength) !== null && _c !== void 0 ? _c : 3,
                hierarchyLevel: (_d = body.hierarchyLevel) !== null && _d !== void 0 ? _d : this.mapping.hierarchyRank((_e = body.controlType) !== null && _e !== void 0 ? _e : 'administrative'),
                requiredTraining: ((_f = body.trainingCodes) !== null && _f !== void 0 ? _f : []),
                requiredPpe: ((_g = body.ppeTypes) !== null && _g !== void 0 ? _g : []),
                sourceType: 'manual',
                clientSyncId: body.clientSyncId,
                verifications: {
                    create: ((_h = body.verificationSteps) !== null && _h !== void 0 ? _h : ['Field verify control implemented']).map((desc, i) => ({
                        id: (0, crypto_1.randomUUID)(),
                        stepOrder: i,
                        description: desc,
                    })),
                },
                trainingReqs: {
                    create: ((_j = body.trainingCodes) !== null && _j !== void 0 ? _j : []).map((code) => ({
                        id: (0, crypto_1.randomUUID)(),
                        trainingCode: code,
                    })),
                },
                ppeReqs: {
                    create: ((_k = body.ppeTypes) !== null && _k !== void 0 ? _k : []).map((ppe) => ({
                        id: (0, crypto_1.randomUUID)(),
                        ppeType: ppe,
                    })),
                },
            },
            include: { verifications: true },
        });
        await this.controlAudit(companyId, 'control', control.id, 'created', body.projectId, control.id, actorId);
        return control;
    }
    async linkHazardControl(hazardId, controlId, effectivenessScore, actorId) {
        var _a;
        const hazard = await this.prisma.pmUnifiedHazard.findUnique({
            where: { id: hazardId },
        });
        const control = await this.prisma.pmUnifiedControl.findUnique({
            where: { id: controlId },
        });
        if (!hazard || !control)
            throw new common_1.NotFoundException('Hazard or control not found');
        const link = await this.prisma.pmUnifiedHazardControlLink.upsert({
            where: { hazardId_controlId: { hazardId, controlId } },
            create: {
                id: (0, crypto_1.randomUUID)(),
                hazardId,
                controlId,
                effectivenessScore: effectivenessScore !== null && effectivenessScore !== void 0 ? effectivenessScore : 3,
            },
            update: { effectivenessScore },
        });
        await this.hazardAudit(hazard.companyId, 'mapping', link.id, 'linked', (_a = hazard.projectId) !== null && _a !== void 0 ? _a : undefined, hazardId, actorId);
        return link;
    }
    async publishControl(controlId, actorId) {
        var _a;
        const control = await this.prisma.pmUnifiedControl.findUnique({
            where: { id: controlId },
            include: { verifications: true },
        });
        if (!control || control.deletedAt)
            throw new common_1.NotFoundException('Control not found');
        const pub = this.publishWorkflow.evaluateControl({
            status: control.status,
            verificationStepCount: control.verifications.length,
        });
        if (!pub.canPublish)
            throw new common_1.BadRequestException(pub.violations.join('; '));
        await this.prisma.pmUnifiedControlVersion.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                controlId,
                version: control.version,
                snapshotJson: control,
            },
        });
        const updated = await this.prisma.pmUnifiedControl.update({
            where: { id: controlId },
            data: {
                status: 'published',
                version: { increment: 1 },
                publishedAt: new Date(),
            },
        });
        await this.controlAudit(control.companyId, 'control', controlId, 'published', (_a = control.projectId) !== null && _a !== void 0 ? _a : undefined, controlId, actorId);
        return updated;
    }
    async getEnergyWheel(hazardId) {
        const hazard = await this.prisma.pmUnifiedHazard.findUnique({
            where: { id: hazardId },
            include: {
                energySources: true,
                controlLinks: { include: { control: true } },
            },
        });
        if (!hazard)
            throw new common_1.NotFoundException('Hazard not found');
        const detected = this.energyWheel.detectFromText(hazard.description);
        const suggested = this.energyWheel.suggestControlDescriptions(hazard.energySources.map((e) => e.energyType));
        return {
            hazardId,
            energies: hazard.energySources,
            autoDetected: detected,
            suggestedControls: suggested,
            aggregateSeverity: this.energyWheel.aggregateEnergySeverity(hazard.energySources.map((e) => ({
                energyType: e.energyType,
                exposureLevel: e.exposureLevel,
                highEnergyFlag: e.highEnergyFlag,
                severityScore: e.severityScore,
                autoDetected: e.autoDetected,
            }))),
        };
    }
    async scoreHazardSifHeca(hazardId) {
        const hazard = await this.prisma.pmUnifiedHazard.findUnique({
            where: { id: hazardId },
            include: { energySources: true },
        });
        if (!hazard)
            throw new common_1.NotFoundException('Hazard not found');
        const openCapa = hazard.projectId
            ? await this.prisma.pmCorrectiveAction.count({
                where: {
                    projectId: hazard.projectId,
                    status: { in: ['open', 'in_progress'] },
                },
            })
            : 0;
        const result = this.sifHeca.score({
            severity: hazard.severity,
            likelihood: hazard.likelihood,
            sifPotential: hazard.sifPotential,
            highEnergyCount: hazard.energySources.filter((e) => e.highEnergyFlag)
                .length,
            openCapaCount: openCapa,
            priorIncidentCount: hazard.sourceType === 'incident' ? 1 : 0,
        });
        await this.prisma.pmUnifiedHazard.update({
            where: { id: hazardId },
            data: {
                riskScore: result.riskScore,
                sifScore: result.sifScore,
                sifPotential: result.sifPotential,
                hecaCategoryKey: result.hecaCategoryKey,
                supervisorReviewRequired: result.supervisorReviewRequired,
            },
        });
        return result;
    }
    async ingestBatch(companyId, source, projectId, actorId) {
        var _a;
        const created = [];
        const skipped = [];
        const existing = await this.prisma.pmUnifiedHazard.findMany({
            where: Object.assign({ companyId, deletedAt: null }, (projectId ? { projectId } : {})),
            select: {
                id: true,
                title: true,
                description: true,
                sourceType: true,
                sourceId: true,
            },
        });
        const keys = new Set(existing.map((e) => this.ingestion.normalizeKey(e.title, e.description)));
        const push = async (norm) => {
            var _a;
            const key = this.ingestion.normalizeKey(norm.title, norm.description);
            if ([...keys].some((k) => this.ingestion.isDuplicate(k, key))) {
                skipped.push((_a = norm.sourceId) !== null && _a !== void 0 ? _a : norm.title);
                return;
            }
            const { hazard } = await this.createHazard(companyId, {
                title: norm.title,
                description: norm.description,
                category: norm.category,
                severity: norm.severity,
                likelihood: norm.likelihood,
                projectId: norm.projectId,
                scopeLevel: norm.scopeLevel,
                taskId: norm.taskId,
                workPackageId: norm.workPackageId,
                workerId: norm.workerId,
            }, actorId);
            keys.add(key);
            created.push(hazard.id);
        };
        if (source === 'jha_flha' && projectId) {
            const jhaHazards = await this.prisma.jhaFlhaHazard.findMany({
                where: { jhaFlha: { projectId } },
                take: 100,
            });
            for (const h of jhaHazards) {
                await push(this.ingestion.fromJhaHazard(h, { companyId, projectId }));
            }
        }
        if (source === 'company_library') {
            const rows = await this.prisma.pmCompanyHazard.findMany({
                where: { companyId, deletedAt: null, active: true },
                take: 100,
            });
            for (const h of rows) {
                await push(this.ingestion.fromCompanyLibrary(Object.assign(Object.assign({}, h), { category: String(h.category) }), companyId));
            }
        }
        if (source === 'project_library' && projectId) {
            const rows = await this.prisma.pmProjectHazard.findMany({
                where: { projectId, deletedAt: null, active: true },
                take: 100,
            });
            for (const h of rows) {
                await push(this.ingestion.fromProjectLibrary(Object.assign(Object.assign({}, h), { category: String(h.category) }), { companyId, projectId }));
            }
        }
        if (source === 'inspection' && projectId) {
            const defs = await this.prisma.pmInspectionDeficiency.findMany({
                where: { inspection: { projectId } },
                take: 50,
            });
            for (const d of defs) {
                await push(this.ingestion.fromInspectionDeficiency(d, { companyId, projectId }));
            }
        }
        if (source === 'pm_task' && projectId) {
            const tasks = await this.prisma.pmPmTask.findMany({
                where: { projectId, status: 'blocked', deletedAt: null },
                take: 50,
            });
            for (const t of tasks) {
                await push(this.ingestion.fromPmTask(t, { companyId, projectId }));
            }
        }
        if (source === 'incident') {
            const events = await this.prisma.pmSafetyEvent.findMany({
                where: Object.assign({ companyId }, (projectId ? { projectId } : {})),
                take: 50,
                orderBy: { occurredAt: 'desc' },
            });
            for (const e of events) {
                await push(this.ingestion.fromIncident(e, { companyId, projectId }));
            }
        }
        if (source === 'equipment_failure' && projectId) {
            const failures = await this.prisma.pmEquipmentFailure.findMany({
                where: { projectId },
                take: 30,
            });
            for (const f of failures) {
                await push({
                    title: f.title,
                    description: (_a = f.description) !== null && _a !== void 0 ? _a : f.title,
                    category: 'equipment',
                    hazardType: 'equipment',
                    severity: 4,
                    likelihood: 3,
                    sourceType: 'equipment_failure',
                    sourceId: f.id,
                    scopeLevel: 'project',
                    projectId,
                });
            }
        }
        await this.hazardAudit(companyId, 'ingestion', source, 'batch_complete', projectId, undefined, actorId, {
            created: created.length,
            skipped: skipped.length,
        });
        return { source, created, skipped, count: created.length };
    }
    async suggestControlsForHazard(hazardId) {
        const hazard = await this.prisma.pmUnifiedHazard.findUnique({
            where: { id: hazardId },
            include: { energySources: true, controlLinks: true },
        });
        if (!hazard)
            throw new common_1.NotFoundException('Hazard not found');
        return this.controlSuggestion.suggest({
            category: hazard.category,
            energyTypes: hazard.energySources.map((e) => e.energyType),
            sifPotential: hazard.sifPotential,
            missingControlCount: hazard.controlLinks.length === 0 ? 1 : 0,
        });
    }
    async applySuggestedControls(hazardId, actorId) {
        var _a;
        const suggestions = await this.suggestControlsForHazard(hazardId);
        const hazard = await this.prisma.pmUnifiedHazard.findUnique({
            where: { id: hazardId },
        });
        if (!hazard)
            throw new common_1.NotFoundException('Hazard not found');
        const controlIds = [];
        for (const s of suggestions) {
            const c = await this.createControl(hazard.companyId, {
                title: s.title,
                description: s.description,
                controlType: s.controlType,
                controlStrength: s.controlStrength,
                hierarchyLevel: s.hierarchyLevel,
                projectId: (_a = hazard.projectId) !== null && _a !== void 0 ? _a : undefined,
                trainingCodes: s.trainingCodes,
                ppeTypes: s.ppeTypes,
            }, actorId);
            await this.linkHazardControl(hazardId, c.id, s.controlStrength, actorId);
            controlIds.push(c.id);
        }
        return { hazardId, controlIds, suggestions };
    }
    async syncCompanyToProject(companyId, projectId, actorId) {
        var _a;
        const companyHazards = await this.prisma.pmUnifiedHazard.findMany({
            where: {
                companyId,
                scopeLevel: 'company',
                status: 'published',
                deletedAt: null,
            },
            include: { energySources: true, controlLinks: true },
        });
        const inherited = [];
        for (const parent of companyHazards) {
            const child = await this.prisma.pmUnifiedHazard.create({
                data: {
                    id: (0, crypto_1.randomUUID)(),
                    companyId,
                    projectId,
                    parentHazardId: parent.id,
                    scopeLevel: 'project',
                    hazardType: parent.hazardType,
                    category: parent.category,
                    subcategory: parent.subcategory,
                    title: parent.title,
                    description: parent.description,
                    severity: parent.severity,
                    likelihood: parent.likelihood,
                    riskScore: parent.riskScore,
                    sifPotential: parent.sifPotential,
                    hecaCategoryKey: parent.hecaCategoryKey,
                    sifScore: parent.sifScore,
                    supervisorReviewRequired: parent.supervisorReviewRequired,
                    requiredTraining: parent.requiredTraining,
                    requiredPpe: parent.requiredPpe,
                    sourceType: 'company_library',
                    sourceId: parent.id,
                    status: 'draft',
                    energySources: {
                        create: parent.energySources.map((e) => ({
                            id: (0, crypto_1.randomUUID)(),
                            energyType: e.energyType,
                            exposureLevel: e.exposureLevel,
                            highEnergyFlag: e.highEnergyFlag,
                            severityScore: e.severityScore,
                            autoDetected: true,
                        })),
                    },
                },
            });
            inherited.push(child.id);
            for (const link of parent.controlLinks) {
                let projectControl = await this.prisma.pmUnifiedControl.findFirst({
                    where: {
                        companyId,
                        projectId,
                        parentControlId: link.controlId,
                    },
                });
                if (!projectControl) {
                    const parentCtrl = await this.prisma.pmUnifiedControl.findUnique({
                        where: { id: link.controlId },
                    });
                    if (parentCtrl) {
                        projectControl = await this.prisma.pmUnifiedControl.create({
                            data: {
                                id: (0, crypto_1.randomUUID)(),
                                companyId,
                                projectId,
                                parentControlId: parentCtrl.id,
                                scopeLevel: 'project',
                                controlType: parentCtrl.controlType,
                                title: parentCtrl.title,
                                description: parentCtrl.description,
                                controlStrength: parentCtrl.controlStrength,
                                hierarchyLevel: parentCtrl.hierarchyLevel,
                                sourceType: 'company_library',
                                sourceId: parentCtrl.id,
                                status: 'draft',
                            },
                        });
                    }
                }
                if (projectControl) {
                    await this.linkHazardControl(child.id, projectControl.id, (_a = link.effectivenessScore) !== null && _a !== void 0 ? _a : 3, actorId);
                }
            }
        }
        if (this.projectContext) {
            await this.projectContext.autoGenerateProfile(projectId, actorId);
        }
        await this.hazardAudit(companyId, 'sync', String(projectId), 'company_to_project', projectId, undefined, actorId, {
            inherited: inherited.length,
        });
        return {
            projectId,
            inheritedCount: inherited.length,
            hazardIds: inherited,
        };
    }
    async enforcementGate(filters) {
        var _a, _b;
        const hazardWhere = Object.assign({ companyId: filters.companyId, deletedAt: null, status: 'published' }, (filters.projectId ? { projectId: filters.projectId } : {}));
        const unmapped = await this.prisma.pmUnifiedHazard.count({
            where: Object.assign(Object.assign({}, hazardWhere), { controlLinks: { none: {} } }),
        });
        const chemical = await this.prisma.pmUnifiedHazard.count({
            where: Object.assign(Object.assign({}, hazardWhere), { category: 'chemical' }),
        });
        let sdsAcknowledged = chemical === 0;
        if (filters.workerId && chemical > 0 && this.companyContext) {
            const ack = await this.companyContext.policyAckCheck(filters.workerId);
            sdsAcknowledged = ack.satisfied;
        }
        let trainingComplete = true;
        if (filters.workerId && this.workerSafety) {
            const w = await this.workerSafety.enforcementGate(filters.workerId, (_a = filters.projectId) !== null && _a !== void 0 ? _a : 0);
            trainingComplete = w.allowed;
        }
        const emergencyLocked = filters.projectId
            ? !!(await this.prisma.pmSiteEmergencyLock.findFirst({
                where: { projectId: filters.projectId, active: true },
            }))
            : false;
        const overrides = await this.prisma.pmUnifiedHcOverride.findMany({
            where: {
                companyId: filters.companyId,
                active: true,
                expiresAt: { gt: new Date() },
                OR: [
                    { projectId: null },
                    { projectId: (_b = filters.projectId) !== null && _b !== void 0 ? _b : undefined },
                ],
            },
        });
        const result = this.enforcement.evaluate({
            publishedHazardCount: await this.prisma.pmUnifiedHazard.count({
                where: hazardWhere,
            }),
            unmappedPublishedHazards: unmapped,
            sdsAckRequired: chemical > 0,
            sdsAcknowledged,
            trainingComplete,
            controlsVerified: unmapped === 0,
            emergencyLocked,
            activeOverrides: overrides.map((o) => ({
                ruleType: o.ruleType,
                ruleKey: o.ruleKey,
            })),
        });
        return result;
    }
    async recordWorkerExposure(workerId, hazardId, projectId) {
        var _a;
        const hazard = await this.prisma.pmUnifiedHazard.findUnique({
            where: { id: hazardId },
        });
        if (!hazard)
            throw new common_1.NotFoundException('Hazard not found');
        const profile = this.workerSafety
            ? await this.workerSafety.getOrCreateProfile(workerId)
            : await this.prisma.pmWorkerSafetyProfile.findUnique({
                where: { workerId },
            });
        await this.prisma.pmWorkerHazardExposure.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                workerId,
                profileId: profile === null || profile === void 0 ? void 0 : profile.id,
                projectId,
                sourceType: 'project_library',
                sourceId: hazardId,
                hazardType: hazard.hazardType,
                severity: hazard.severity,
                likelihood: hazard.likelihood,
                sifPotential: hazard.sifPotential,
                hecaCategoryKey: (_a = hazard.hecaCategoryKey) !== null && _a !== void 0 ? _a : undefined,
            },
        });
        if (this.workerSafety) {
            await this.workerSafety.rebuildProfile(workerId, projectId);
        }
        return { workerId, hazardId, recorded: true };
    }
    async addAttachment(body) {
        return this.prisma.pmUnifiedHcAttachment.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                companyId: body.companyId,
                hazardId: body.hazardId,
                controlId: body.controlId,
                entityType: body.entityType,
                fileName: body.fileName,
                mimeType: body.mimeType,
                dataUrl: body.dataUrl,
                clientSyncId: body.clientSyncId,
            },
        });
    }
    async buildOfflineBundle(filters) {
        const [hazards, controls] = await Promise.all([
            this.listHazards({
                companyId: filters.companyId,
                projectId: filters.projectId,
            }),
            this.listControls({
                companyId: filters.companyId,
                projectId: filters.projectId,
            }),
        ]);
        const cacheKey = filters.projectId
            ? `project:${filters.projectId}:hc_bundle`
            : `company:${filters.companyId}:hc_bundle`;
        const bundle = {
            syncedAt: new Date().toISOString(),
            hazards,
            controls,
            energyWheel: hazards.flatMap((h) => { var _a; return ((_a = h.energySources) !== null && _a !== void 0 ? _a : []).map((e) => (Object.assign({ hazardId: h.id }, e))); }),
            projectSafety: filters.projectId && this.projectContext
                ? await this.projectContext.buildOfflineBundle(filters.projectId)
                : null,
        };
        await this.prisma.pmUnifiedHcOfflineCache.upsert({
            where: { cacheKey },
            create: {
                id: (0, crypto_1.randomUUID)(),
                companyId: filters.companyId,
                projectId: filters.projectId,
                cacheKey,
                payload: bundle,
                syncedAt: new Date(),
            },
            update: {
                payload: bundle,
                cacheVersion: { increment: 1 },
                syncedAt: new Date(),
            },
        });
        return bundle;
    }
    async applyOfflineSync(filters, payload, actorId) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        const results = { hazards: 0, controls: 0, mappings: 0 };
        for (const h of (_a = payload.hazards) !== null && _a !== void 0 ? _a : []) {
            const clientSyncId = h.clientSyncId;
            if (clientSyncId) {
                const existing = await this.prisma.pmUnifiedHazard.findUnique({
                    where: { clientSyncId },
                });
                if (existing) {
                    await this.prisma.pmUnifiedHazard.update({
                        where: { id: existing.id },
                        data: {
                            title: (_b = h.title) !== null && _b !== void 0 ? _b : undefined,
                            description: (_c = h.description) !== null && _c !== void 0 ? _c : undefined,
                            severity: (_d = h.severity) !== null && _d !== void 0 ? _d : undefined,
                            likelihood: (_e = h.likelihood) !== null && _e !== void 0 ? _e : undefined,
                        },
                    });
                    results.hazards++;
                    continue;
                }
            }
            if (h.title && h.description) {
                await this.createHazard(filters.companyId, Object.assign(Object.assign({}, h), { projectId: (_f = filters.projectId) !== null && _f !== void 0 ? _f : h.projectId, clientSyncId }), actorId);
                results.hazards++;
            }
        }
        for (const c of (_g = payload.controls) !== null && _g !== void 0 ? _g : []) {
            const clientSyncId = c.clientSyncId;
            if (clientSyncId) {
                const existing = await this.prisma.pmUnifiedControl.findUnique({
                    where: { clientSyncId },
                });
                if (existing) {
                    await this.prisma.pmUnifiedControl.update({
                        where: { id: existing.id },
                        data: {
                            title: (_h = c.title) !== null && _h !== void 0 ? _h : undefined,
                            description: (_j = c.description) !== null && _j !== void 0 ? _j : undefined,
                        },
                    });
                    results.controls++;
                    continue;
                }
            }
            if (c.title && c.description) {
                await this.createControl(filters.companyId, Object.assign(Object.assign({}, c), { projectId: (_k = filters.projectId) !== null && _k !== void 0 ? _k : c.projectId, clientSyncId }), actorId);
                results.controls++;
            }
        }
        for (const m of (_l = payload.mappings) !== null && _l !== void 0 ? _l : []) {
            if (m.hazardId && m.controlId) {
                await this.linkHazardControl(m.hazardId, m.controlId, m.effectivenessScore, actorId);
                results.mappings++;
            }
        }
        await this.hazardAudit(filters.companyId, 'offline_sync', String((_m = filters.projectId) !== null && _m !== void 0 ? _m : filters.companyId), 'applied', filters.projectId, undefined, actorId, results);
        return {
            ok: true,
            applied: results,
            serverState: await this.buildOfflineBundle(filters),
        };
    }
    async getCailBundle(filters) {
        const [insights, predictions, correlations, projectScore, companyScore] = await Promise.all([
            this.cail.insights(filters),
            this.cail.predictHazardDetection(filters),
            this.cail.hazardIncidentCorrelation(filters),
            filters.projectId
                ? this.cail.projectHazardScore(filters.projectId)
                : Promise.resolve(null),
            this.cail.companyHazardScoreFromDb(filters.companyId, filters.projectId),
        ]);
        return {
            insights,
            predictions,
            correlations,
            projectHazardScore: projectScore,
            companyHazardScore: companyScore,
        };
    }
    async getAnalytics(filters) {
        const dashboard = await this.getDashboard(filters);
        const [hazardTrend, controlTrend, energyTrend, sifTrend] = await Promise.all([
            this.prisma.pmUnifiedHazard.groupBy({
                by: ['status'],
                where: Object.assign({ companyId: filters.companyId, deletedAt: null }, (filters.projectId ? { projectId: filters.projectId } : {})),
                _count: true,
            }),
            this.prisma.pmUnifiedControl.groupBy({
                by: ['status'],
                where: Object.assign({ companyId: filters.companyId, deletedAt: null }, (filters.projectId ? { projectId: filters.projectId } : {})),
                _count: true,
            }),
            this.prisma.pmUnifiedHazardEnergy.groupBy({
                by: ['energyType'],
                where: {
                    hazard: Object.assign({ companyId: filters.companyId, deletedAt: null }, (filters.projectId ? { projectId: filters.projectId } : {})),
                },
                _count: true,
            }),
            this.prisma.pmUnifiedHazard.groupBy({
                by: ['sifPotential'],
                where: Object.assign({ companyId: filters.companyId, deletedAt: null, status: 'published' }, (filters.projectId ? { projectId: filters.projectId } : {})),
                _count: true,
            }),
        ]);
        const projectScore = filters.projectId
            ? await this.cail.projectHazardScore(filters.projectId)
            : null;
        return Object.assign(Object.assign({}, dashboard), { hazardStatusTrend: hazardTrend, controlStatusTrend: controlTrend, energyExposureTrend: energyTrend, sifHecaTrend: sifTrend, projectHazardScore: projectScore, leadingIndicators: {
                unmappedPublished: dashboard.metrics.unmappedPublished,
                sifCount: dashboard.metrics.sifCount,
                companyHazardScore: dashboard.metrics.companyHazardScore,
            } });
    }
};
exports.PmUnifiedHazardControlService = PmUnifiedHazardControlService;
exports.PmUnifiedHazardControlService = PmUnifiedHazardControlService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Optional)()),
    __param(3, (0, common_1.Optional)()),
    __param(4, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pm_unified_hazard_control_cail_service_1.PmUnifiedHazardControlCailService,
        pm_project_safety_context_service_1.PmProjectSafetyContextService,
        pm_company_safety_context_service_1.PmCompanySafetyContextService,
        pm_worker_safety_profile_service_1.PmWorkerSafetyProfileService])
], PmUnifiedHazardControlService);
//# sourceMappingURL=pm-unified-hazard-control.service.js.map