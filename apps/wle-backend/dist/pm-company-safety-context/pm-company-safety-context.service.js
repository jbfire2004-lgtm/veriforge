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
exports.PmCompanySafetyContextService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
const publish_workflow_engine_1 = require("../pm-project-safety-context/publish-workflow.engine");
const pm_project_safety_context_service_1 = require("../pm-project-safety-context/pm-project-safety-context.service");
const company_profile_generator_engine_1 = require("./company-profile-generator.engine");
const company_enforcement_engine_1 = require("./company-enforcement.engine");
const company_project_sync_engine_1 = require("./company-project-sync.engine");
const pm_company_safety_cail_intelligence_service_1 = require("./pm-company-safety-cail-intelligence.service");
let PmCompanySafetyContextService = class PmCompanySafetyContextService {
    constructor(prisma, cail, pmProjectContext) {
        this.prisma = prisma;
        this.cail = cail;
        this.pmProjectContext = pmProjectContext;
        this.profileGenerator = new company_profile_generator_engine_1.CompanyProfileGeneratorEngine();
        this.enforcementEngine = new company_enforcement_engine_1.CompanyEnforcementEngine();
        this.projectSync = new company_project_sync_engine_1.CompanyProjectSyncEngine();
        this.publishWorkflow = new publish_workflow_engine_1.PublishWorkflowEngine();
    }
    async audit(companyId, entityType, entityId, eventType, profileId, actorId, payload) {
        await this.prisma.pmCompanySafetyAuditLog.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                companyId,
                profileId,
                entityType,
                entityId,
                eventType,
                actorId,
                payload: payload,
            },
        });
    }
    async getCompanyContext(companyId) {
        const company = await this.prisma.company.findUnique({
            where: { id: companyId },
            select: { id: true, name: true },
        });
        if (!company)
            throw new common_1.NotFoundException('Company not found');
        const profile = await this.prisma.pmCompanySafetyProfile.findUnique({
            where: { companyId },
        });
        const [hazardCount, controlCount, trainingCount, policyCount, sdsCount, planCount, zoneCount, projectCount, cailInsights,] = await Promise.all([
            this.prisma.pmCompanyHazard.count({
                where: { companyId, status: 'published', deletedAt: null },
            }),
            this.prisma.pmCompanyControl.count({
                where: { companyId, status: 'published', deletedAt: null },
            }),
            this.prisma.pmCompanyTrainingMatrix.count({
                where: { companyId, status: 'published', active: true },
            }),
            this.prisma.pmCompanyPolicy.count({
                where: { companyId, status: 'published', deletedAt: null },
            }),
            this.prisma.pmCompanySdsLibrary.count({
                where: { companyId, active: true },
            }),
            this.prisma.pmCompanyEmergencyPlan.count({
                where: { companyId, active: true },
            }),
            this.prisma.pmCompanyZoneTemplate.count({
                where: { companyId, status: 'published', active: true },
            }),
            this.prisma.project.count({ where: { companyId, status: 'ACTIVE' } }),
            this.cail.companyInsights(companyId),
        ]);
        return {
            companyId,
            companyName: company.name,
            profile,
            counts: {
                hazards: hazardCount,
                controls: controlCount,
                trainingRules: trainingCount,
                policies: policyCount,
                sds: sdsCount,
                emergencyPlans: planCount,
                zoneTemplates: zoneCount,
                activeProjects: projectCount,
            },
            cailInsights,
        };
    }
    mapWorkflowState(profile) {
        var _a;
        const status = (_a = profile === null || profile === void 0 ? void 0 : profile.status) !== null && _a !== void 0 ? _a : 'draft';
        return this.publishWorkflow.mapWorkflowState(status, status === 'published', status === 'published');
    }
    async updateProfile(companyId, data, actorId) {
        const profile = await this.getOrCreateProfile(companyId, actorId);
        const updated = await this.prisma.pmCompanySafetyProfile.update({
            where: { id: profile.id },
            data: {
                corporateRiskLevel: data.corporateRiskLevel,
                policiesJson: data.policiesJson,
                ppeStandardsJson: data.ppeStandardsJson,
                enforcementRulesJson: data.enforcementRulesJson,
                status: 'draft',
            },
        });
        await this.audit(companyId, 'profile', profile.id, 'updated', profile.id, actorId);
        return updated;
    }
    async getOrCreateProfile(companyId, actorId) {
        const existing = await this.prisma.pmCompanySafetyProfile.findUnique({
            where: { companyId },
        });
        if (existing)
            return existing;
        const row = await this.prisma.pmCompanySafetyProfile.create({
            data: { id: (0, crypto_1.randomUUID)(), companyId },
        });
        await this.audit(companyId, 'profile', row.id, 'created', row.id, actorId);
        return row;
    }
    async autoGenerateProfile(companyId, actorId) {
        const since = new Date(Date.now() - 365 * 86400000);
        const [projectCount, workerCount, incidentCount, sifCount] = await Promise.all([
            this.prisma.project.count({ where: { companyId } }),
            this.prisma.worker.count({ where: { companyId } }),
            this.prisma.pmSafetyEvent.count({
                where: { companyId, occurredAt: { gte: since } },
            }),
            this.prisma.sifHecaEvent.count({
                where: { companyId, createdAt: { gte: since } },
            }),
        ]);
        const generated = this.profileGenerator.generate({
            projectCount,
            workerCount,
            incidentCount12m: incidentCount,
            sifCount12m: sifCount,
        });
        const profile = await this.getOrCreateProfile(companyId, actorId);
        const updated = await this.prisma.pmCompanySafetyProfile.update({
            where: { id: profile.id },
            data: {
                corporateRiskLevel: generated.corporateRiskLevel,
                ppeStandardsJson: generated.ppeStandards,
                enforcementRulesJson: generated.enforcementRules,
                autoGenerated: true,
                status: 'draft',
            },
        });
        for (const t of generated.defaultTrainingMatrix) {
            await this.prisma.pmCompanyTrainingMatrix.upsert({
                where: {
                    companyId_roleType_trainingCode: {
                        companyId,
                        roleType: t.roleType,
                        trainingCode: t.trainingCode,
                    },
                },
                create: {
                    id: (0, crypto_1.randomUUID)(),
                    companyId,
                    profileId: profile.id,
                    roleType: t.roleType,
                    category: t.category,
                    trainingCode: t.trainingCode,
                    trainingName: t.trainingName,
                    expiresInDays: t.expiresInDays,
                    status: 'draft',
                },
                update: {
                    trainingName: t.trainingName,
                    expiresInDays: t.expiresInDays,
                },
            });
        }
        await this.seedDefaultZoneTemplates(companyId, profile.id, generated.corporateRiskLevel);
        await this.audit(companyId, 'profile', profile.id, 'auto_generated', profile.id, actorId);
        return updated;
    }
    async seedDefaultZoneTemplates(companyId, profileId, risk) {
        const templates = [
            {
                templateCode: 'SITE',
                zoneType: 'general_work',
                title: 'General work area',
                requiresJha: false,
                highRisk: false,
            },
            {
                templateCode: 'HIGH_RISK',
                zoneType: 'high_risk',
                title: 'High-risk zone',
                requiresJha: true,
                highRisk: true,
            },
            {
                templateCode: 'SIF_ZONE',
                zoneType: 'sif_high_energy',
                title: 'SIF high-energy zone',
                requiresJha: true,
                highRisk: true,
            },
        ];
        if (risk === 'critical' || risk === 'high') {
            templates.push({
                templateCode: 'CONFINED',
                zoneType: 'confined_space',
                title: 'Confined space',
                requiresJha: true,
                highRisk: true,
            });
        }
        for (const t of templates) {
            await this.prisma.pmCompanyZoneTemplate.upsert({
                where: {
                    companyId_templateCode: { companyId, templateCode: t.templateCode },
                },
                create: {
                    id: (0, crypto_1.randomUUID)(),
                    companyId,
                    profileId,
                    templateCode: t.templateCode,
                    zoneType: t.zoneType,
                    title: t.title,
                    requiresJha: t.requiresJha,
                    highRisk: t.highRisk,
                    requiresFlhaHours: risk === 'critical' ? 8 : 24,
                    status: 'draft',
                },
                update: {
                    title: t.title,
                    requiresJha: t.requiresJha,
                    highRisk: t.highRisk,
                },
            });
        }
    }
    async publishProfile(companyId, actorId) {
        const profile = await this.getOrCreateProfile(companyId);
        const transition = this.publishWorkflow.profilePublish(profile.status, true);
        if (!transition.allowed) {
            throw new common_1.BadRequestException(transition.errors.join('; '));
        }
        const snapshot = await this.prisma.pmCompanySafetyProfile.findUnique({
            where: { id: profile.id },
        });
        const nextVersion = profile.version + 1;
        const updated = await this.prisma.$transaction(async (tx) => {
            const row = await tx.pmCompanySafetyProfile.update({
                where: { id: profile.id },
                data: {
                    status: 'published',
                    version: nextVersion,
                    publishedAt: new Date(),
                    publishedById: actorId,
                },
            });
            await tx.pmCompanySafetyProfileVersion.create({
                data: {
                    id: (0, crypto_1.randomUUID)(),
                    profileId: profile.id,
                    version: nextVersion,
                    snapshotJson: snapshot,
                    publishedById: actorId,
                },
            });
            return row;
        });
        await this.syncPublishedAssetsToProjects(companyId, actorId);
        await this.audit(companyId, 'profile', profile.id, 'published', profile.id, actorId, {
            version: nextVersion,
        });
        return updated;
    }
    async syncPublishedAssetsToProjects(companyId, actorId) {
        const projects = await this.prisma.project.findMany({
            where: { companyId, status: 'ACTIVE' },
            select: { id: true },
        });
        const hazards = await this.prisma.pmCompanyHazard.findMany({
            where: {
                companyId,
                status: 'published',
                syncToProjects: true,
                deletedAt: null,
            },
        });
        const templates = await this.prisma.pmCompanyZoneTemplate.findMany({
            where: { companyId, status: 'published', active: true },
        });
        for (const project of projects) {
            for (const h of hazards) {
                const existing = await this.prisma.pmProjectHazard.findFirst({
                    where: {
                        projectId: project.id,
                        sourceType: 'company_library',
                        sourceId: h.id,
                    },
                });
                if (!existing) {
                    await this.prisma.pmProjectHazard.create({
                        data: {
                            id: (0, crypto_1.randomUUID)(),
                            companyId,
                            projectId: project.id,
                            category: this.projectSync.mapHazardCategory(h.category),
                            title: h.title,
                            description: `[Corporate] ${h.description}`,
                            severity: h.severity,
                            likelihood: h.likelihood,
                            sifPotential: h.sifPotential,
                            hecaCategoryKey: h.hecaCategoryKey,
                            sourceType: 'company_library',
                            sourceId: h.id,
                            status: 'published',
                            publishedAt: new Date(),
                        },
                    });
                }
            }
            for (const t of templates) {
                const rule = this.projectSync.zoneTemplateToAccessRule(t);
                await this.prisma.siteAccessRule.upsert({
                    where: {
                        projectId_zoneCode: {
                            projectId: project.id,
                            zoneCode: rule.zoneCode,
                        },
                    },
                    create: {
                        id: (0, crypto_1.randomUUID)(),
                        companyId,
                        projectId: project.id,
                        zoneCode: rule.zoneCode,
                        zoneType: rule.zoneType,
                        requiresFlhaHours: rule.requiresFlhaHours,
                        requiresJha: rule.requiresJha,
                        requiresSdsAck: rule.requiresSdsAck,
                        highRisk: rule.highRisk,
                        requiredPpe: rule.requiredPpe,
                        requiresTrainingCodes: rule.requiresTrainingCodes,
                        active: true,
                    },
                    update: {
                        requiresFlhaHours: rule.requiresFlhaHours,
                        requiresJha: rule.requiresJha,
                        requiresSdsAck: rule.requiresSdsAck,
                        highRisk: rule.highRisk,
                        requiredPpe: rule.requiredPpe,
                    },
                });
            }
            if (this.pmProjectContext) {
                await this.pmProjectContext
                    .autoGenerateProfile(project.id, actorId)
                    .catch(() => undefined);
            }
        }
        await this.audit(companyId, 'sync', String(companyId), 'projects_synced', undefined, actorId, {
            projectCount: projects.length,
        });
        return { projectsSynced: projects.length };
    }
    async listHazards(companyId, status) {
        return this.prisma.pmCompanyHazard.findMany({
            where: { companyId, deletedAt: null, status: status },
            orderBy: { title: 'asc' },
        });
    }
    async createHazard(companyId, data, actorId) {
        var _a, _b, _c, _d;
        const profile = await this.getOrCreateProfile(companyId);
        const row = await this.prisma.pmCompanyHazard.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                companyId,
                profileId: profile.id,
                category: data.category,
                title: data.title,
                description: data.description,
                severity: (_a = data.severity) !== null && _a !== void 0 ? _a : 3,
                likelihood: (_b = data.likelihood) !== null && _b !== void 0 ? _b : 3,
                sifPotential: (_c = data.sifPotential) !== null && _c !== void 0 ? _c : false,
                hecaCategoryKey: data.hecaCategoryKey,
                requiredTraining: ((_d = data.requiredTraining) !== null && _d !== void 0 ? _d : []),
                status: 'draft',
            },
        });
        await this.audit(companyId, 'hazard', row.id, 'created', profile.id, actorId);
        return row;
    }
    async publishHazard(hazardId, actorId) {
        var _a;
        const h = await this.prisma.pmCompanyHazard.findUnique({
            where: { id: hazardId },
        });
        if (!h)
            throw new common_1.NotFoundException('Hazard not found');
        const t = this.publishWorkflow.hazardPublish(h.status, h.title, h.description);
        if (!t.allowed)
            throw new common_1.BadRequestException(t.errors.join('; '));
        const updated = await this.prisma.pmCompanyHazard.update({
            where: { id: hazardId },
            data: {
                status: 'published',
                version: h.version + 1,
                publishedAt: new Date(),
            },
        });
        await this.prisma.hazardLibraryEntry.create({
            data: {
                companyId: h.companyId,
                category: h.category,
                subcategory: h.subcategory,
                description: h.description,
                defaultSeverity: h.severity,
                defaultLikelihood: h.likelihood,
                active: true,
            },
        });
        if (h.syncToProjects)
            await this.syncPublishedAssetsToProjects(h.companyId, actorId);
        await this.audit(h.companyId, 'hazard', hazardId, 'published', (_a = h.profileId) !== null && _a !== void 0 ? _a : undefined, actorId);
        return updated;
    }
    async listControls(companyId) {
        return this.prisma.pmCompanyControl.findMany({
            where: { companyId, deletedAt: null },
            orderBy: { title: 'asc' },
        });
    }
    async createControl(companyId, data, actorId) {
        var _a;
        const profile = await this.getOrCreateProfile(companyId);
        const row = await this.prisma.pmCompanyControl.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                companyId,
                profileId: profile.id,
                controlType: data.controlType,
                title: data.title,
                description: data.description,
                controlStrength: (_a = data.controlStrength) !== null && _a !== void 0 ? _a : 3,
                status: 'draft',
            },
        });
        await this.audit(companyId, 'control', row.id, 'created', profile.id, actorId);
        return row;
    }
    async publishControl(controlId, actorId) {
        var _a;
        const c = await this.prisma.pmCompanyControl.findUnique({
            where: { id: controlId },
        });
        if (!c)
            throw new common_1.NotFoundException('Control not found');
        const t = this.publishWorkflow.controlPublish(c.status, c.title, c.description);
        if (!t.allowed)
            throw new common_1.BadRequestException(t.errors.join('; '));
        const updated = await this.prisma.pmCompanyControl.update({
            where: { id: controlId },
            data: {
                status: 'published',
                version: c.version + 1,
                publishedAt: new Date(),
            },
        });
        await this.prisma.controlLibraryEntry.create({
            data: {
                companyId: c.companyId,
                controlType: c.controlType,
                description: c.description,
                ppeRequired: false,
                active: true,
            },
        });
        await this.audit(c.companyId, 'control', controlId, 'published', (_a = c.profileId) !== null && _a !== void 0 ? _a : undefined, actorId);
        return updated;
    }
    async listTrainingMatrix(companyId) {
        return this.prisma.pmCompanyTrainingMatrix.findMany({
            where: { companyId, active: true },
            orderBy: [{ roleType: 'asc' }, { trainingCode: 'asc' }],
        });
    }
    async upsertTrainingRule(companyId, data, actorId) {
        var _a, _b;
        const profile = await this.getOrCreateProfile(companyId);
        return this.prisma.pmCompanyTrainingMatrix.upsert({
            where: {
                companyId_roleType_trainingCode: {
                    companyId,
                    roleType: data.roleType,
                    trainingCode: data.trainingCode,
                },
            },
            create: Object.assign(Object.assign({ id: (0, crypto_1.randomUUID)(), companyId, profileId: profile.id }, data), { expiresInDays: (_a = data.expiresInDays) !== null && _a !== void 0 ? _a : 365, status: 'draft' }),
            update: {
                trainingName: data.trainingName,
                category: data.category,
                expiresInDays: (_b = data.expiresInDays) !== null && _b !== void 0 ? _b : 365,
            },
        });
    }
    async workerTrainingCheck(workerId, roleType = 'worker') {
        var _a, _b;
        const worker = await this.prisma.worker.findUnique({
            where: { id: workerId },
        });
        if (!(worker === null || worker === void 0 ? void 0 : worker.companyId))
            return { complete: true, missing: [] };
        const rules = await this.prisma.pmCompanyTrainingMatrix.findMany({
            where: {
                companyId: worker.companyId,
                roleType,
                status: 'published',
                active: true,
            },
        });
        const missing = [];
        const now = new Date();
        for (const rule of rules) {
            const record = await this.prisma.trainingRecord.findFirst({
                where: {
                    workerId,
                    certification: {
                        name: {
                            contains: rule.trainingCode,
                            mode: 'insensitive',
                        },
                    },
                },
                include: { certification: true },
                orderBy: { issuedAt: 'desc' },
            });
            if (!record) {
                missing.push(rule.trainingCode);
                continue;
            }
            const base = (_b = (_a = record.expiresAt) !== null && _a !== void 0 ? _a : record.completedAt) !== null && _b !== void 0 ? _b : record.issuedAt;
            if (base && base < now)
                missing.push(rule.trainingCode);
            else if (!record.expiresAt) {
                const syntheticExpiry = new Date(record.issuedAt.getTime() + rule.expiresInDays * 86400000);
                if (syntheticExpiry < now)
                    missing.push(rule.trainingCode);
            }
        }
        return { complete: missing.length === 0, missing };
    }
    async listPolicies(companyId) {
        return this.prisma.pmCompanyPolicy.findMany({
            where: { companyId, deletedAt: null },
            orderBy: { title: 'asc' },
        });
    }
    async createPolicy(companyId, data, actorId) {
        var _a, _b;
        const profile = await this.getOrCreateProfile(companyId);
        const row = await this.prisma.pmCompanyPolicy.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                companyId,
                profileId: profile.id,
                policyType: data.policyType,
                title: data.title,
                requiresAck: (_a = data.requiresAck) !== null && _a !== void 0 ? _a : true,
                requiresAckForAccess: (_b = data.requiresAckForAccess) !== null && _b !== void 0 ? _b : false,
                status: 'draft',
            },
        });
        await this.audit(companyId, 'policy', row.id, 'created', profile.id, actorId);
        return row;
    }
    async publishPolicy(policyId, actorId) {
        var _a;
        const p = await this.prisma.pmCompanyPolicy.findUnique({
            where: { id: policyId },
        });
        if (!p)
            throw new common_1.NotFoundException('Policy not found');
        const updated = await this.prisma.$transaction(async (tx) => {
            const row = await tx.pmCompanyPolicy.update({
                where: { id: policyId },
                data: {
                    status: 'published',
                    version: p.version + 1,
                    publishedAt: new Date(),
                },
            });
            await tx.pmCompanyPolicyVersion.create({
                data: {
                    id: (0, crypto_1.randomUUID)(),
                    policyId,
                    version: p.version + 1,
                    snapshotJson: {
                        title: p.title,
                        policyType: p.policyType,
                    },
                },
            });
            const legacy = await tx.policyDocument.create({
                data: {
                    companyId: p.companyId,
                    title: p.title,
                    category: p.policyType,
                    requiresAck: p.requiresAck,
                    requiresAckForAccess: p.requiresAckForAccess,
                    status: 'published',
                    publishedAt: new Date(),
                },
            });
            await tx.pmCompanyPolicy.update({
                where: { id: policyId },
                data: { legacyPolicyId: legacy.id },
            });
            return row;
        });
        await this.audit(p.companyId, 'policy', policyId, 'published', (_a = p.profileId) !== null && _a !== void 0 ? _a : undefined, actorId);
        return updated;
    }
    async policyAckCheck(workerId) {
        const worker = await this.prisma.worker.findUnique({
            where: { id: workerId },
        });
        if (!(worker === null || worker === void 0 ? void 0 : worker.companyId))
            return { satisfied: true, missing: 0 };
        const required = await this.prisma.pmCompanyPolicy.findMany({
            where: {
                companyId: worker.companyId,
                requiresAckForAccess: true,
                status: 'published',
                deletedAt: null,
            },
        });
        let missing = 0;
        for (const p of required) {
            const ack = await this.prisma.pmCompanyPolicyAcknowledgment.findUnique({
                where: { policyId_workerId: { policyId: p.id, workerId } },
            });
            if (!ack) {
                const legacyAck = p.legacyPolicyId
                    ? await this.prisma.policyAcknowledgment.findUnique({
                        where: {
                            policyDocumentId_workerId: {
                                policyDocumentId: p.legacyPolicyId,
                                workerId,
                            },
                        },
                    })
                    : null;
                if (!legacyAck)
                    missing++;
            }
        }
        return { satisfied: missing === 0, missing };
    }
    async importSdsFromLegacy(companyId) {
        const docs = await this.prisma.sdsDocument.findMany({
            where: { companyId, projectId: null, deletedAt: null },
            take: 500,
        });
        let count = 0;
        for (const d of docs) {
            const cas = Array.isArray(d.casNumbers)
                ? d.casNumbers[0]
                : null;
            const existing = await this.prisma.pmCompanySdsLibrary.findFirst({
                where: { legacySdsId: d.id },
            });
            if (existing) {
                await this.prisma.pmCompanySdsLibrary.update({
                    where: { id: existing.id },
                    data: { productName: d.productName, expiresAt: d.expiresAt },
                });
            }
            else {
                await this.prisma.pmCompanySdsLibrary.create({
                    data: {
                        id: (0, crypto_1.randomUUID)(),
                        companyId,
                        legacySdsId: d.id,
                        productName: d.productName,
                        manufacturer: d.manufacturer,
                        casNumber: cas,
                        expiresAt: d.expiresAt,
                        status: d.status === 'published' ? 'published' : 'draft',
                        publishedAt: d.publishedAt,
                    },
                });
            }
            count++;
        }
        return { imported: count };
    }
    async listSds(companyId) {
        return this.prisma.pmCompanySdsLibrary.findMany({
            where: { companyId, active: true },
            orderBy: { productName: 'asc' },
        });
    }
    async importEmergencyFromLegacy(companyId) {
        const plans = await this.prisma.emergencyPlan.findMany({
            where: { companyId, projectId: null, deletedAt: null },
        });
        let count = 0;
        for (const p of plans) {
            await this.prisma.pmCompanyEmergencyPlan.create({
                data: {
                    id: (0, crypto_1.randomUUID)(),
                    companyId,
                    planType: p.planType,
                    title: p.title,
                    contentJson: p.contentJson,
                    requiresAck: p.requiresAck,
                    requiresAckForAccess: p.requiresAckForAccess,
                    legacyPlanId: p.id,
                    status: p.status === 'published' ? 'published' : 'draft',
                    publishedAt: p.publishedAt,
                },
            });
            count++;
        }
        return { imported: count };
    }
    async listEmergencyPlans(companyId) {
        return this.prisma.pmCompanyEmergencyPlan.findMany({
            where: { companyId, active: true },
        });
    }
    async listEquipmentRules(companyId) {
        return this.prisma.pmCompanyEquipmentRule.findMany({
            where: { companyId, active: true },
        });
    }
    async upsertEquipmentRule(companyId, data, actorId) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        const profile = await this.getOrCreateProfile(companyId);
        const row = await this.prisma.pmCompanyEquipmentRule.upsert({
            where: { companyId_ruleKey: { companyId, ruleKey: data.ruleKey } },
            create: {
                id: (0, crypto_1.randomUUID)(),
                companyId,
                profileId: profile.id,
                ruleKey: data.ruleKey,
                requiredCerts: ((_a = data.requiredCerts) !== null && _a !== void 0 ? _a : []),
                requiredInspections: ((_b = data.requiredInspections) !== null && _b !== void 0 ? _b : []),
                requiredTraining: ((_c = data.requiredTraining) !== null && _c !== void 0 ? _c : []),
                requiredControls: ((_d = data.requiredControls) !== null && _d !== void 0 ? _d : []),
                operatorAuthRequired: (_e = data.operatorAuthRequired) !== null && _e !== void 0 ? _e : true,
                enforcementAction: (_f = data.enforcementAction) !== null && _f !== void 0 ? _f : 'block_access',
                status: 'draft',
            },
            update: {
                requiredCerts: ((_g = data.requiredCerts) !== null && _g !== void 0 ? _g : []),
                requiredInspections: ((_h = data.requiredInspections) !== null && _h !== void 0 ? _h : []),
                requiredTraining: ((_j = data.requiredTraining) !== null && _j !== void 0 ? _j : []),
                requiredControls: ((_k = data.requiredControls) !== null && _k !== void 0 ? _k : []),
                operatorAuthRequired: data.operatorAuthRequired,
                enforcementAction: data.enforcementAction,
            },
        });
        await this.audit(companyId, 'equipment_rule', row.id, 'upserted', profile.id, actorId);
        return row;
    }
    async listZoneTemplates(companyId) {
        return this.prisma.pmCompanyZoneTemplate.findMany({
            where: { companyId, active: true },
        });
    }
    async upsertZoneTemplate(companyId, data, actorId) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        const profile = await this.getOrCreateProfile(companyId);
        const row = await this.prisma.pmCompanyZoneTemplate.upsert({
            where: {
                companyId_templateCode: { companyId, templateCode: data.templateCode },
            },
            create: {
                id: (0, crypto_1.randomUUID)(),
                companyId,
                profileId: profile.id,
                templateCode: data.templateCode,
                zoneType: data.zoneType,
                title: data.title,
                requiredTraining: ((_a = data.requiredTraining) !== null && _a !== void 0 ? _a : []),
                requiredPpe: ((_b = data.requiredPpe) !== null && _b !== void 0 ? _b : []),
                requiresJha: (_c = data.requiresJha) !== null && _c !== void 0 ? _c : false,
                requiresFlhaHours: (_d = data.requiresFlhaHours) !== null && _d !== void 0 ? _d : 24,
                requiresPermits: ((_e = data.requiresPermits) !== null && _e !== void 0 ? _e : []),
                requiresSdsAck: (_f = data.requiresSdsAck) !== null && _f !== void 0 ? _f : false,
                highRisk: (_g = data.highRisk) !== null && _g !== void 0 ? _g : false,
                status: 'draft',
            },
            update: {
                title: data.title,
                zoneType: data.zoneType,
                requiredTraining: ((_h = data.requiredTraining) !== null && _h !== void 0 ? _h : []),
                requiredPpe: ((_j = data.requiredPpe) !== null && _j !== void 0 ? _j : []),
                requiresJha: data.requiresJha,
                requiresFlhaHours: data.requiresFlhaHours,
                requiresPermits: ((_k = data.requiresPermits) !== null && _k !== void 0 ? _k : []),
                requiresSdsAck: data.requiresSdsAck,
                highRisk: data.highRisk,
            },
        });
        await this.audit(companyId, 'zone_template', row.id, 'upserted', profile.id, actorId);
        return row;
    }
    async createSds(companyId, data, actorId) {
        var _a;
        const row = await this.prisma.pmCompanySdsLibrary.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                companyId,
                productName: data.productName,
                casNumber: data.casNumber,
                whmisClass: data.whmisClass,
                manufacturer: data.manufacturer,
                ppeRequirements: ((_a = data.ppeRequirements) !== null && _a !== void 0 ? _a : []),
                expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
                status: 'draft',
            },
        });
        await this.audit(companyId, 'sds', row.id, 'created', undefined, actorId);
        return row;
    }
    async createEmergencyPlan(companyId, data, actorId) {
        var _a, _b;
        const row = await this.prisma.pmCompanyEmergencyPlan.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                companyId,
                planType: data.planType,
                title: data.title,
                contentJson: ((_a = data.contentJson) !== null && _a !== void 0 ? _a : {}),
                requiresAckForAccess: (_b = data.requiresAckForAccess) !== null && _b !== void 0 ? _b : false,
                status: 'draft',
            },
        });
        await this.audit(companyId, 'emergency_plan', row.id, 'created', undefined, actorId);
        return row;
    }
    async validatePublishReadiness(companyId) {
        const publishedHazards = await this.prisma.pmCompanyHazard.findMany({
            where: { companyId, status: 'published', deletedAt: null },
            select: { id: true, requiredControlIds: true },
        });
        const hazardsWithoutControls = publishedHazards.filter((h) => {
            const ids = h.requiredControlIds;
            return !Array.isArray(ids) || ids.length === 0;
        }).length;
        const requiredPolicies = await this.prisma.pmCompanyPolicy.count({
            where: {
                companyId,
                requiresAckForAccess: true,
                status: 'published',
                deletedAt: null,
            },
        });
        const expiredSds = await this.prisma.pmCompanySdsLibrary.count({
            where: { companyId, active: true, expiresAt: { lt: new Date() } },
        });
        const roleTypes = await this.prisma.pmCompanyTrainingMatrix.groupBy({
            by: ['roleType'],
            where: { companyId, active: true },
            _count: true,
        });
        const errors = [];
        if (publishedHazards.length > 0 && hazardsWithoutControls > 0) {
            errors.push(`${hazardsWithoutControls} published hazard(s) missing linked controls`);
        }
        if (requiredPolicies > 0) {
            const acks = await this.prisma.pmCompanyPolicyAcknowledgment.count({
                where: { policy: { companyId, requiresAckForAccess: true } },
            });
            if (acks === 0) {
                errors.push('No policy acknowledgments recorded for access-required policies');
            }
        }
        if (expiredSds > 0) {
            errors.push(`${expiredSds} SDS entries expired`);
        }
        if (roleTypes.length < 1) {
            errors.push('Training matrix must define at least one role');
        }
        return { valid: errors.length === 0, errors };
    }
    async createOverride(companyId, data, actorId) {
        var _a;
        const profile = await this.getOrCreateProfile(companyId);
        const highRisk = data.overrideType === 'zone' && data.ruleKey.includes('SIF');
        if (highRisk && !data.safetySig) {
            throw new common_1.BadRequestException('Safety signature required for high-risk override');
        }
        if (!((_a = data.reason) === null || _a === void 0 ? void 0 : _a.trim()))
            throw new common_1.BadRequestException('Override reason required');
        if (!data.expiresAt)
            throw new common_1.BadRequestException('Override expiry required');
        const row = await this.prisma.pmCompanySafetyOverride.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                companyId,
                profileId: profile.id,
                overrideType: data.overrideType,
                ruleKey: data.ruleKey,
                reason: data.reason,
                expiresAt: new Date(data.expiresAt),
                supervisorSig: data.supervisorSig,
                safetySig: data.safetySig,
                approvedById: actorId,
            },
        });
        await this.audit(companyId, 'override', row.id, 'created', profile.id, actorId);
        return row;
    }
    async listOverrides(companyId) {
        return this.prisma.pmCompanySafetyOverride.findMany({
            where: {
                companyId,
                active: true,
                OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
            },
        });
    }
    async enforcementGate(workerId, workerChecks) {
        var _a, _b;
        const worker = await this.prisma.worker.findUnique({
            where: { id: workerId },
        });
        if (!(worker === null || worker === void 0 ? void 0 : worker.companyId))
            return { allowed: true, reasons: [], action: 'block_access' };
        const profile = await this.prisma.pmCompanySafetyProfile.findUnique({
            where: { companyId: worker.companyId },
        });
        const [training, policies, overrides] = await Promise.all([
            this.workerTrainingCheck(workerId),
            this.policyAckCheck(workerId),
            this.listOverrides(worker.companyId),
        ]);
        const expiredSds = await this.prisma.pmCompanySdsLibrary.count({
            where: {
                companyId: worker.companyId,
                expiresAt: { lt: new Date() },
                active: true,
            },
        });
        const result = this.enforcementEngine.evaluate({
            profilePublished: (profile === null || profile === void 0 ? void 0 : profile.status) === 'published',
            corporateRiskLevel: (_a = profile === null || profile === void 0 ? void 0 : profile.corporateRiskLevel) !== null && _a !== void 0 ? _a : 'medium',
            enforcementRules: (_b = profile === null || profile === void 0 ? void 0 : profile.enforcementRulesJson) !== null && _b !== void 0 ? _b : {},
            workerChecks,
            missingPolicyAcks: policies.missing,
            missingTraining: training.missing,
            expiredSds,
            activeOverrides: overrides.map((o) => ({
                overrideType: o.overrideType,
                ruleKey: o.ruleKey,
            })),
        });
        return {
            allowed: result.allowed,
            reasons: result.violations,
            waived: result.waived,
            action: result.action,
        };
    }
    async buildOfflineBundle(companyId) {
        const context = await this.getCompanyContext(companyId);
        const bundle = {
            context,
            hazards: await this.listHazards(companyId, 'published'),
            controls: await this.listControls(companyId),
            training: await this.listTrainingMatrix(companyId),
            policies: await this.listPolicies(companyId),
            sds: await this.listSds(companyId),
            emergency: await this.listEmergencyPlans(companyId),
            equipmentRules: await this.listEquipmentRules(companyId),
            zoneTemplates: await this.listZoneTemplates(companyId),
            overrides: await this.listOverrides(companyId),
            syncedAt: new Date().toISOString(),
        };
        await this.prisma.pmCompanySafetyOfflineCache.upsert({
            where: { companyId_cacheKey: { companyId, cacheKey: 'full_context' } },
            create: {
                id: (0, crypto_1.randomUUID)(),
                companyId,
                cacheKey: 'full_context',
                payload: bundle,
            },
            update: {
                payload: bundle,
                cacheVersion: { increment: 1 },
                syncedAt: new Date(),
            },
        });
        return bundle;
    }
    async getCompanySafetyScore(companyId) {
        const company = await this.prisma.company.findUnique({
            where: { id: companyId },
            select: { id: true, name: true },
        });
        if (!company)
            throw new common_1.NotFoundException('Company not found');
        const score = await this.cail.generateCorporateSafetyScore(companyId);
        const forecast = await this.cail.hazardForecast(companyId);
        const profile = await this.prisma.pmCompanySafetyProfile.findUnique({
            where: { companyId },
        });
        return Object.assign(Object.assign({ companyId, companyName: company.name }, score), { workflowState: this.mapWorkflowState(profile), hazardForecast: forecast });
    }
    async applyOfflineSync(companyId, payload, actorId) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        const company = await this.prisma.company.findUnique({
            where: { id: companyId },
        });
        if (!company)
            throw new common_1.NotFoundException('Company not found');
        let applied = 0;
        if (payload.profile) {
            await this.updateProfile(companyId, payload.profile, actorId);
            applied++;
        }
        for (const h of (_a = payload.hazards) !== null && _a !== void 0 ? _a : []) {
            if (h.id) {
                await this.prisma.pmCompanyHazard.updateMany({
                    where: { id: h.id, companyId },
                    data: {
                        title: (_b = h.title) !== null && _b !== void 0 ? _b : undefined,
                        description: (_c = h.description) !== null && _c !== void 0 ? _c : undefined,
                    },
                });
            }
            else if (h.title && h.description && h.category) {
                await this.createHazard(companyId, h, actorId);
            }
            applied++;
        }
        for (const c of (_d = payload.controls) !== null && _d !== void 0 ? _d : []) {
            if (c.id) {
                await this.prisma.pmCompanyControl.updateMany({
                    where: { id: c.id, companyId },
                    data: {
                        title: (_e = c.title) !== null && _e !== void 0 ? _e : undefined,
                        description: (_f = c.description) !== null && _f !== void 0 ? _f : undefined,
                    },
                });
            }
            else if (c.title && c.description && c.controlType) {
                await this.createControl(companyId, c, actorId);
            }
            applied++;
        }
        for (const t of (_g = payload.training) !== null && _g !== void 0 ? _g : []) {
            if (t.roleType && t.trainingCode && t.trainingName && t.category) {
                await this.upsertTrainingRule(companyId, t, actorId);
                applied++;
            }
        }
        for (const p of (_h = payload.policies) !== null && _h !== void 0 ? _h : []) {
            if (p.title && p.policyType) {
                await this.createPolicy(companyId, p, actorId);
                applied++;
            }
        }
        for (const s of (_j = payload.sds) !== null && _j !== void 0 ? _j : []) {
            if (s.productName) {
                await this.createSds(companyId, s, actorId);
                applied++;
            }
        }
        for (const e of (_k = payload.emergency) !== null && _k !== void 0 ? _k : []) {
            if (e.title && e.planType) {
                await this.createEmergencyPlan(companyId, e, actorId);
                applied++;
            }
        }
        for (const r of (_l = payload.equipmentRules) !== null && _l !== void 0 ? _l : []) {
            if (r.ruleKey) {
                await this.upsertEquipmentRule(companyId, r, actorId);
                applied++;
            }
        }
        for (const z of (_m = payload.zoneTemplates) !== null && _m !== void 0 ? _m : []) {
            if (z.templateCode && z.zoneType && z.title) {
                await this.upsertZoneTemplate(companyId, z, actorId);
                applied++;
            }
        }
        for (const o of (_o = payload.overrides) !== null && _o !== void 0 ? _o : []) {
            if (o.overrideType && o.ruleKey && o.reason && o.expiresAt) {
                await this.createOverride(companyId, o, actorId);
                applied++;
            }
        }
        const bundle = await this.buildOfflineBundle(companyId);
        await this.audit(companyId, 'offline_sync', String(companyId), 'applied', undefined, actorId, {
            applied,
        });
        return { ok: true, applied, serverState: bundle };
    }
    async analytics(companyId) {
        const since30 = new Date(Date.now() - 30 * 86400000);
        const since90 = new Date(Date.now() - 90 * 86400000);
        const [denials, attempts, scoreBundle, hazardTrend, controlTrend] = await Promise.all([
            this.prisma.pmAccessAttempt.count({
                where: {
                    companyId,
                    decision: { in: ['denied', 'denied_with_reason'] },
                    createdAt: { gte: since30 },
                },
            }),
            this.prisma.pmAccessAttempt.count({
                where: { companyId, createdAt: { gte: since30 } },
            }),
            this.getCompanySafetyScore(companyId),
            this.prisma.pmCompanyHazard.groupBy({
                by: ['status'],
                where: { companyId, deletedAt: null },
                _count: true,
            }),
            this.prisma.pmCompanyControl.groupBy({
                by: ['status'],
                where: { companyId, deletedAt: null },
                _count: true,
            }),
        ]);
        const policyAcks = await this.prisma.pmCompanyPolicyAcknowledgment.findMany({
            where: { policy: { companyId }, acknowledgedAt: { gte: since90 } },
            select: { acknowledgedAt: true },
            orderBy: { acknowledgedAt: 'asc' },
        });
        const denialRate = attempts > 0 ? denials / attempts : 0;
        const forecast = this.cail.predictCorporateRisk(await this.prisma.pmSafetyEvent.count({
            where: { companyId, occurredAt: { gte: since30 } },
        }), denialRate);
        const trainingRoles = await this.prisma.pmCompanyTrainingMatrix.groupBy({
            by: ['roleType'],
            where: { companyId, status: 'published', active: true },
            _count: true,
        });
        return {
            companyId,
            safetyScore: scoreBundle.score,
            scoreBand: scoreBundle.band,
            predictedRisk: scoreBundle.predictedRisk,
            denialRate30d: Math.round(denialRate * 100),
            hazardTrend: hazardTrend.map((h) => ({
                status: h.status,
                count: h._count,
            })),
            controlTrend: controlTrend.map((c) => ({
                status: c.status,
                count: c._count,
            })),
            policyAcknowledgmentTrend: policyAcks.map((a) => a.acknowledgedAt.toISOString()),
            trainingCompliance: {
                roles: trainingRoles.map((r) => ({
                    roleType: r.roleType,
                    ruleCount: r._count,
                })),
            },
            leadingIndicators: {
                weakControls: scoreBundle.weakControls,
                expiredSdsFlag: scoreBundle.components.some((c) => c.key === 'expired_sds' && c.deduction > 0),
                profilePublished: scoreBundle.workflowState !== 'draft',
            },
            corporateRiskForecast: forecast,
            cailInsights: await this.cail.companyInsights(companyId),
        };
    }
};
exports.PmCompanySafetyContextService = PmCompanySafetyContextService;
exports.PmCompanySafetyContextService = PmCompanySafetyContextService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pm_company_safety_cail_intelligence_service_1.PmCompanySafetyCailIntelligenceService,
        pm_project_safety_context_service_1.PmProjectSafetyContextService])
], PmCompanySafetyContextService);
//# sourceMappingURL=pm-company-safety-context.service.js.map