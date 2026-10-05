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
exports.PmProjectSafetyContextService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
const profile_generator_engine_1 = require("./profile-generator.engine");
const hazard_import_engine_1 = require("./hazard-import.engine");
const publish_workflow_engine_1 = require("./publish-workflow.engine");
const enforcement_engine_1 = require("./enforcement.engine");
const pm_project_safety_cail_intelligence_service_1 = require("./pm-project-safety-cail-intelligence.service");
let PmProjectSafetyContextService = class PmProjectSafetyContextService {
    constructor(prisma, cail) {
        this.prisma = prisma;
        this.cail = cail;
        this.profileGenerator = new profile_generator_engine_1.ProfileGeneratorEngine();
        this.hazardImport = new hazard_import_engine_1.HazardImportEngine();
        this.publishWorkflow = new publish_workflow_engine_1.PublishWorkflowEngine();
        this.enforcement = new enforcement_engine_1.EnforcementEngine();
    }
    async audit(projectId, entityType, entityId, eventType, profileId, actorId, payload) {
        await this.prisma.pmProjectSafetyContextAudit.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                projectId,
                profileId,
                entityType,
                entityId,
                eventType,
                actorId,
                payload: payload,
            },
        });
    }
    async getProjectContext(projectId) {
        var _a, _b, _c, _d;
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            include: { site: true, company: { select: { id: true, name: true } } },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        const profile = await this.prisma.pmProjectSafetyProfile.findUnique({
            where: { projectId },
            include: {
                hazards: {
                    where: { active: true, deletedAt: null, status: 'published' },
                    take: 20,
                },
                controls: {
                    where: { active: true, deletedAt: null, status: 'published' },
                    take: 20,
                },
                overrides: { where: { active: true } },
            },
        });
        const [openCail, riskSnapshot, zoneRules, publishedHazardCount, publishedControlCount,] = await Promise.all([
            this.prisma.cailEntry.count({
                where: {
                    projectId,
                    status: { in: ['open', 'in_progress', 'overdue'] },
                },
            }),
            this.prisma.projectSafetyRiskSnapshot.findFirst({
                where: { projectId },
                orderBy: { computedAt: 'desc' },
            }),
            this.prisma.siteAccessRule.findMany({
                where: { projectId, active: true },
            }),
            this.prisma.pmProjectHazard.count({
                where: { projectId, status: 'published', deletedAt: null },
            }),
            this.prisma.pmProjectControl.count({
                where: { projectId, status: 'published', deletedAt: null },
            }),
        ]);
        const cailInsights = await this.cail.projectInsights(projectId);
        return {
            projectId,
            ownerCompanyId: project.companyId,
            companyName: project.company.name,
            siteIds: project.siteId ? [project.siteId] : [],
            siteName: (_b = (_a = project.site) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : null,
            profile: profile
                ? {
                    id: profile.id,
                    version: profile.version,
                    status: profile.status,
                    riskLevel: profile.riskLevel,
                    requiredJhaTypes: profile.requiredJhaTypes,
                    requiredTraining: profile.requiredTraining,
                    enforcementRules: profile.enforcementRulesJson,
                    publishedAt: (_d = (_c = profile.publishedAt) === null || _c === void 0 ? void 0 : _c.toISOString()) !== null && _d !== void 0 ? _d : null,
                    completenessScore: this.cail.profileCompletenessScore({
                        requiredJhaTypes: profile.requiredJhaTypes,
                        requiredTraining: profile.requiredTraining,
                        zoneRulesJson: profile.zoneRulesJson,
                        status: profile.status,
                    }),
                }
                : null,
            hazardLibraryCount: publishedHazardCount,
            controlLibraryCount: publishedControlCount,
            zoneRules,
            openCailCount: openCail,
            riskSnapshot: riskSnapshot
                ? {
                    score: riskSnapshot.score,
                    band: riskSnapshot.predictedLevel,
                    computedAt: riskSnapshot.computedAt.toISOString(),
                }
                : null,
            cailInsights,
            integrations: {
                jhaFlha: true,
                siteAccess: zoneRules.length > 0,
                safetyStations: true,
                emergency: true,
            },
        };
    }
    async getOrCreateProfile(projectId, actorId) {
        const existing = await this.prisma.pmProjectSafetyProfile.findUnique({
            where: { projectId },
        });
        if (existing)
            return existing;
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        const profile = await this.prisma.pmProjectSafetyProfile.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                companyId: project.companyId,
                projectId,
            },
        });
        await this.audit(projectId, 'profile', profile.id, 'created', profile.id, actorId);
        return profile;
    }
    async updateProfile(projectId, data, actorId) {
        const profile = await this.getOrCreateProfile(projectId, actorId);
        const updated = await this.prisma.pmProjectSafetyProfile.update({
            where: { id: profile.id },
            data: {
                riskLevel: data.riskLevel,
                projectType: data.projectType,
                scopeOfWorkJson: data.scopeOfWorkJson,
                requiredJhaTypes: data.requiredJhaTypes,
                requiredInspections: data.requiredInspections,
                requiredTraining: data.requiredTraining,
                requiredEquipmentCerts: data.requiredEquipmentCerts,
                requiredPpe: data.requiredPpe,
                requiredEmergencyPlans: data.requiredEmergencyPlans,
                requiredSdsAcks: data.requiredSdsAcks,
                requiredToolboxTalks: data.requiredToolboxTalks,
                enforcementRulesJson: data.enforcementRulesJson,
                zoneRulesJson: data.zoneRulesJson,
                equipmentRulesJson: data.equipmentRulesJson,
                trainingRulesJson: data.trainingRulesJson,
                emergencyRulesJson: data.emergencyRulesJson,
                environmentalJson: data.environmentalJson,
                subcontractorIds: data.subcontractorIds,
                status: 'draft',
            },
        });
        await this.audit(projectId, 'profile', profile.id, 'updated', profile.id, actorId);
        return updated;
    }
    async autoGenerateProfile(projectId, actorId) {
        var _a;
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        const since = new Date(Date.now() - 365 * 86400000);
        const [equipmentCount, incidentCount, sifCount, subcontractorCount] = await Promise.all([
            this.prisma.equipmentProjectAssignment.count({
                where: { projectId, endedAt: null },
            }),
            this.prisma.pmSafetyEvent.count({
                where: { projectId, occurredAt: { gte: since } },
            }),
            this.prisma.sifHecaEvent.count({
                where: { projectId, createdAt: { gte: since } },
            }),
            this.prisma.pmInspectionDeficiency
                .findMany({
                where: {
                    inspection: { projectId },
                    subcontractorCompanyId: { not: null },
                },
                distinct: ['subcontractorCompanyId'],
                select: { subcontractorCompanyId: true },
            })
                .then((r) => r.length),
        ]);
        const generated = this.profileGenerator.generate({
            projectType: (_a = project.code) !== null && _a !== void 0 ? _a : undefined,
            equipmentCount,
            incidentCount12m: incidentCount,
            sifEventCount12m: sifCount,
            subcontractorCount,
        });
        const profile = await this.getOrCreateProfile(projectId, actorId);
        const updated = await this.prisma.pmProjectSafetyProfile.update({
            where: { id: profile.id },
            data: {
                riskLevel: generated.riskLevel,
                requiredJhaTypes: generated.requiredJhaTypes,
                requiredInspections: generated.requiredInspections,
                requiredTraining: generated.requiredTraining,
                requiredEquipmentCerts: generated.requiredEquipmentCerts,
                requiredPpe: generated.requiredPpe,
                requiredEmergencyPlans: generated.requiredEmergencyPlans,
                requiredSdsAcks: generated.requiredSdsAcks,
                requiredToolboxTalks: generated.requiredToolboxTalks,
                enforcementRulesJson: generated.enforcementRules,
                zoneRulesJson: generated.zoneRules,
                equipmentRulesJson: generated.equipmentRules,
                trainingRulesJson: generated.trainingRules,
                emergencyRulesJson: generated.emergencyRules,
                autoGenerated: true,
                status: 'draft',
            },
        });
        await this.syncZoneRulesFromProfile(projectId, generated.zoneRules, actorId);
        await this.audit(projectId, 'profile', profile.id, 'auto_generated', profile.id, actorId, {
            riskLevel: generated.riskLevel,
        });
        return updated;
    }
    async syncZoneRulesFromProfile(projectId, zoneRules, actorId) {
        var _a, _b, _c;
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project)
            return;
        for (const z of zoneRules) {
            const zoneCode = (_a = z.zoneCode) !== null && _a !== void 0 ? _a : 'SITE';
            await this.prisma.siteAccessRule.upsert({
                where: {
                    projectId_zoneCode: { projectId, zoneCode },
                },
                create: {
                    id: (0, crypto_1.randomUUID)(),
                    projectId,
                    companyId: project.companyId,
                    zoneCode,
                    requiresFlhaHours: (_b = z.requiresFlhaHours) !== null && _b !== void 0 ? _b : 24,
                    requiresJha: !!z.requiresJha,
                    highRisk: !!z.highRisk,
                    active: true,
                },
                update: {
                    requiresFlhaHours: (_c = z.requiresFlhaHours) !== null && _c !== void 0 ? _c : 24,
                    requiresJha: !!z.requiresJha,
                    highRisk: !!z.highRisk,
                    active: true,
                },
            });
        }
        await this.audit(projectId, 'zone_rules', String(projectId), 'synced_from_profile', undefined, actorId);
    }
    async publishProfile(projectId, actorId) {
        const profile = await this.getOrCreateProfile(projectId);
        const transition = this.publishWorkflow.profilePublish(profile.status, Array.isArray(profile.requiredJhaTypes) &&
            profile.requiredJhaTypes.length > 0);
        if (!transition.allowed) {
            throw new common_1.BadRequestException(transition.errors.join('; '));
        }
        const nextVersion = profile.version + 1;
        const snapshot = await this.prisma.pmProjectSafetyProfile.findUnique({
            where: { id: profile.id },
        });
        const updated = await this.prisma.$transaction(async (tx) => {
            const row = await tx.pmProjectSafetyProfile.update({
                where: { id: profile.id },
                data: {
                    status: 'published',
                    version: nextVersion,
                    publishedAt: new Date(),
                    publishedById: actorId,
                },
            });
            await tx.pmProjectSafetyProfileVersion.create({
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
        const zoneRules = Array.isArray(profile.zoneRulesJson)
            ? profile.zoneRulesJson
            : [];
        await this.syncZoneRulesFromProfile(projectId, zoneRules, actorId);
        const legacyPlan = await this.prisma.projectSafetyPlan.findUnique({
            where: { projectId },
        });
        const formIds = ['daily-flha'];
        if (legacyPlan) {
            await this.prisma.projectSafetyPlan.update({
                where: { projectId },
                data: { requiredDefinitionIds: formIds },
            });
        }
        else {
            await this.prisma.projectSafetyPlan.create({
                data: {
                    projectId,
                    requiredDefinitionIds: formIds,
                },
            });
        }
        await this.audit(projectId, 'profile', profile.id, 'published', profile.id, actorId, {
            version: nextVersion,
        });
        return updated;
    }
    async listHazards(projectId, status) {
        return this.prisma.pmProjectHazard.findMany({
            where: {
                projectId,
                deletedAt: null,
                status: status,
            },
            orderBy: [{ category: 'asc' }, { title: 'asc' }],
        });
    }
    async createHazard(projectId, data, actorId) {
        var _a, _b, _c;
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        const profile = await this.getOrCreateProfile(projectId);
        const row = await this.prisma.pmProjectHazard.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                companyId: project.companyId,
                projectId,
                profileId: profile.id,
                category: data.category,
                title: data.title,
                description: data.description,
                severity: (_a = data.severity) !== null && _a !== void 0 ? _a : 3,
                likelihood: (_b = data.likelihood) !== null && _b !== void 0 ? _b : 3,
                sifPotential: (_c = data.sifPotential) !== null && _c !== void 0 ? _c : false,
                hecaCategoryKey: data.hecaCategoryKey,
                subcategory: data.subcategory,
                status: 'draft',
            },
        });
        await this.audit(projectId, 'hazard', row.id, 'created', profile.id, actorId);
        return row;
    }
    async publishHazard(hazardId, actorId) {
        var _a;
        const hazard = await this.prisma.pmProjectHazard.findUnique({
            where: { id: hazardId },
        });
        if (!hazard)
            throw new common_1.NotFoundException('Hazard not found');
        const transition = this.publishWorkflow.hazardPublish(hazard.status, hazard.title, hazard.description);
        if (!transition.allowed)
            throw new common_1.BadRequestException(transition.errors.join('; '));
        const updated = await this.prisma.pmProjectHazard.update({
            where: { id: hazardId },
            data: {
                status: 'published',
                version: hazard.version + 1,
                publishedAt: new Date(),
            },
        });
        await this.audit(hazard.projectId, 'hazard', hazardId, 'published', (_a = hazard.profileId) !== null && _a !== void 0 ? _a : undefined, actorId);
        return updated;
    }
    async importHazards(projectId, sources, actorId) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        const profile = await this.getOrCreateProfile(projectId);
        const imported = [];
        const seen = new Set();
        if (sources.includes('company_library')) {
            const entries = await this.prisma.hazardLibraryEntry.findMany({
                where: {
                    OR: [
                        { companyId: project.companyId, projectId: null },
                        { projectId },
                    ],
                    active: true,
                },
                take: 100,
            });
            for (const e of entries) {
                const h = this.hazardImport.mapCompanyLibrary(e);
                const key = this.hazardImport.dedupeKey(h);
                if (seen.has(key))
                    continue;
                seen.add(key);
                await this.prisma.pmProjectHazard.create({
                    data: {
                        id: (0, crypto_1.randomUUID)(),
                        companyId: project.companyId,
                        projectId,
                        profileId: profile.id,
                        category: h.category,
                        title: h.title,
                        description: h.description,
                        severity: h.severity,
                        likelihood: h.likelihood,
                        sifPotential: h.sifPotential,
                        sourceType: h.sourceType,
                        status: 'draft',
                    },
                });
                imported.push(key);
            }
        }
        if (sources.includes('jha_flha')) {
            const jhas = await this.prisma.jhaFlha.findMany({
                where: { projectId },
                include: { hazards: true },
                take: 20,
            });
            for (const j of jhas) {
                for (const h of j.hazards) {
                    const mapped = this.hazardImport.mapJhaHazard({
                        id: h.id,
                        description: h.description,
                        severity: h.severity,
                        likelihood: h.likelihood,
                    });
                    const key = this.hazardImport.dedupeKey(mapped);
                    if (seen.has(key))
                        continue;
                    seen.add(key);
                    await this.prisma.pmProjectHazard.create({
                        data: {
                            id: (0, crypto_1.randomUUID)(),
                            companyId: project.companyId,
                            projectId,
                            profileId: profile.id,
                            category: mapped.category,
                            title: mapped.title,
                            description: mapped.description,
                            severity: mapped.severity,
                            likelihood: mapped.likelihood,
                            sifPotential: mapped.sifPotential,
                            sourceType: mapped.sourceType,
                            sourceId: mapped.sourceId,
                            status: 'draft',
                        },
                    });
                    imported.push(key);
                }
            }
        }
        if (sources.includes('inspection')) {
            const defs = await this.prisma.pmInspectionDeficiency.findMany({
                where: { inspection: { projectId } },
                take: 50,
            });
            for (const d of defs) {
                const mapped = this.hazardImport.mapInspectionDeficiency({
                    id: d.id,
                    title: d.title,
                    description: d.description,
                    severity: d.severity,
                });
                const key = this.hazardImport.dedupeKey(mapped);
                if (seen.has(key))
                    continue;
                seen.add(key);
                await this.prisma.pmProjectHazard.create({
                    data: {
                        id: (0, crypto_1.randomUUID)(),
                        companyId: project.companyId,
                        projectId,
                        profileId: profile.id,
                        category: mapped.category,
                        title: mapped.title,
                        description: mapped.description,
                        severity: mapped.severity,
                        likelihood: mapped.likelihood,
                        sifPotential: mapped.sifPotential,
                        sourceType: mapped.sourceType,
                        sourceId: mapped.sourceId,
                        status: 'draft',
                    },
                });
                imported.push(key);
            }
        }
        if (sources.includes('incident')) {
            const events = await this.prisma.pmSafetyEvent.findMany({
                where: { projectId },
                take: 30,
            });
            for (const e of events) {
                const mapped = this.hazardImport.mapIncident({
                    id: e.id,
                    title: e.title,
                    description: e.description,
                });
                const key = this.hazardImport.dedupeKey(mapped);
                if (seen.has(key))
                    continue;
                seen.add(key);
                await this.prisma.pmProjectHazard.create({
                    data: {
                        id: (0, crypto_1.randomUUID)(),
                        companyId: project.companyId,
                        projectId,
                        profileId: profile.id,
                        category: mapped.category,
                        title: mapped.title,
                        description: mapped.description,
                        severity: mapped.severity,
                        likelihood: mapped.likelihood,
                        sifPotential: mapped.sifPotential,
                        sourceType: mapped.sourceType,
                        sourceId: mapped.sourceId,
                        status: 'draft',
                    },
                });
                imported.push(key);
            }
        }
        if (sources.includes('equipment_failure')) {
            const failures = await this.prisma.pmEquipmentFailure.findMany({
                where: { projectId },
                take: 30,
            });
            for (const f of failures) {
                const mapped = this.hazardImport.mapEquipmentFailure({
                    id: f.id,
                    title: f.title,
                    description: f.description,
                    failureType: f.failureType,
                });
                const key = this.hazardImport.dedupeKey(mapped);
                if (seen.has(key))
                    continue;
                seen.add(key);
                await this.prisma.pmProjectHazard.create({
                    data: {
                        id: (0, crypto_1.randomUUID)(),
                        companyId: project.companyId,
                        projectId,
                        profileId: profile.id,
                        category: mapped.category,
                        title: mapped.title,
                        description: mapped.description,
                        severity: mapped.severity,
                        likelihood: mapped.likelihood,
                        sifPotential: mapped.sifPotential,
                        sourceType: mapped.sourceType,
                        sourceId: mapped.sourceId,
                        status: 'draft',
                    },
                });
                imported.push(key);
            }
        }
        await this.audit(projectId, 'hazard_import', String(projectId), 'imported', profile.id, actorId, {
            count: imported.length,
            sources,
        });
        return { importedCount: imported.length };
    }
    async listControls(projectId) {
        return this.prisma.pmProjectControl.findMany({
            where: { projectId, deletedAt: null },
            orderBy: { controlType: 'asc' },
        });
    }
    async createControl(projectId, data, actorId) {
        var _a, _b;
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        const profile = await this.getOrCreateProfile(projectId);
        const row = await this.prisma.pmProjectControl.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                companyId: project.companyId,
                projectId,
                profileId: profile.id,
                controlType: data.controlType,
                title: data.title,
                description: data.description,
                ppeRequired: (_a = data.ppeRequired) !== null && _a !== void 0 ? _a : false,
                hazardCategoryKeys: ((_b = data.hazardCategoryKeys) !== null && _b !== void 0 ? _b : []),
                status: 'draft',
            },
        });
        await this.audit(projectId, 'control', row.id, 'created', profile.id, actorId);
        return row;
    }
    async publishControl(controlId, actorId) {
        var _a;
        const control = await this.prisma.pmProjectControl.findUnique({
            where: { id: controlId },
        });
        if (!control)
            throw new common_1.NotFoundException('Control not found');
        const transition = this.publishWorkflow.controlPublish(control.status, control.title, control.description);
        if (!transition.allowed)
            throw new common_1.BadRequestException(transition.errors.join('; '));
        const updated = await this.prisma.pmProjectControl.update({
            where: { id: controlId },
            data: {
                status: 'published',
                version: control.version + 1,
                publishedAt: new Date(),
            },
        });
        await this.audit(control.projectId, 'control', controlId, 'published', (_a = control.profileId) !== null && _a !== void 0 ? _a : undefined, actorId);
        return updated;
    }
    async importControlsFromCompanyLibrary(projectId, actorId) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        const profile = await this.getOrCreateProfile(projectId);
        const entries = await this.prisma.controlLibraryEntry.findMany({
            where: {
                OR: [{ companyId: project.companyId, projectId: null }, { projectId }],
                active: true,
            },
            take: 100,
        });
        let count = 0;
        for (const e of entries) {
            const type = e.controlType === 'engineering'
                ? 'engineering'
                : e.controlType === 'ppe'
                    ? 'ppe'
                    : e.controlType === 'equipment'
                        ? 'equipment'
                        : 'administrative';
            await this.prisma.pmProjectControl.create({
                data: {
                    id: (0, crypto_1.randomUUID)(),
                    companyId: project.companyId,
                    projectId,
                    profileId: profile.id,
                    controlType: type,
                    title: e.controlType,
                    description: e.description,
                    ppeRequired: e.ppeRequired,
                    hazardCategoryKeys: e.hazardCategories,
                    status: 'draft',
                },
            });
            count++;
        }
        await this.audit(projectId, 'control_import', String(projectId), 'imported', profile.id, actorId, { count });
        return { importedCount: count };
    }
    async createOverride(projectId, data, actorId) {
        var _a;
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        const profile = await this.getOrCreateProfile(projectId);
        const row = await this.prisma.pmProjectSafetyOverride.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                companyId: project.companyId,
                projectId,
                profileId: profile.id,
                ruleType: data.ruleType,
                ruleKey: data.ruleKey,
                reason: data.reason,
                overrideJson: ((_a = data.overrideJson) !== null && _a !== void 0 ? _a : {}),
                expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
                approvedById: actorId,
            },
        });
        await this.audit(projectId, 'override', row.id, 'created', profile.id, actorId);
        return row;
    }
    async listOverrides(projectId) {
        return this.prisma.pmProjectSafetyOverride.findMany({
            where: { projectId, active: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async evaluateEnforcement(projectId, workerChecks, zoneCode) {
        var _a, _b;
        const profile = await this.prisma.pmProjectSafetyProfile.findUnique({
            where: { projectId },
        });
        const overrides = await this.prisma.pmProjectSafetyOverride.findMany({
            where: {
                projectId,
                active: true,
                OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
            },
        });
        return this.enforcement.evaluate({
            profilePublished: (profile === null || profile === void 0 ? void 0 : profile.status) === 'published',
            riskLevel: (_a = profile === null || profile === void 0 ? void 0 : profile.riskLevel) !== null && _a !== void 0 ? _a : 'medium',
            enforcementRules: (_b = profile === null || profile === void 0 ? void 0 : profile.enforcementRulesJson) !== null && _b !== void 0 ? _b : {},
            zoneCode,
            workerChecks,
            activeOverrides: overrides.map((o) => ({
                ruleType: o.ruleType,
                ruleKey: o.ruleKey,
            })),
        });
    }
    async buildOfflineBundle(projectId) {
        const context = await this.getProjectContext(projectId);
        const profile = await this.prisma.pmProjectSafetyProfile.findUnique({
            where: { projectId },
        });
        const hazards = await this.listHazards(projectId, 'published');
        const controls = await this.listControls(projectId);
        const overrides = await this.listOverrides(projectId);
        const zoneRules = await this.prisma.siteAccessRule.findMany({
            where: { projectId, active: true },
        });
        const bundle = {
            context,
            profile,
            hazards,
            controls: controls.filter((c) => c.status === 'published'),
            overrides,
            zoneRules,
            syncedAt: new Date().toISOString(),
        };
        await this.prisma.pmProjectSafetyOfflineCache.upsert({
            where: {
                projectId_cacheKey: { projectId, cacheKey: 'full_context' },
            },
            create: {
                id: (0, crypto_1.randomUUID)(),
                projectId,
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
    async enforcementGate(projectId, workerChecks) {
        const result = await this.evaluateEnforcement(projectId, workerChecks);
        return {
            allowed: result.enforced,
            reasons: result.violations,
            waived: result.waivedByOverride,
        };
    }
    mapWorkflowState(projectId, profile) {
        var _a;
        const status = ((_a = profile === null || profile === void 0 ? void 0 : profile.status) !== null && _a !== void 0 ? _a : 'draft');
        return this.publishWorkflow.mapWorkflowState(status, status === 'published', status === 'published');
    }
    async validatePublishReadiness(projectId) {
        var _a, _b, _c;
        const profile = await this.prisma.pmProjectSafetyProfile.findUnique({
            where: { projectId },
        });
        const publishedHazards = await this.prisma.pmProjectHazard.findMany({
            where: { projectId, status: 'published', deletedAt: null },
            select: { id: true, requiredControlIds: true },
        });
        const hazardsWithoutControls = publishedHazards.filter((h) => {
            const ids = h.requiredControlIds;
            return !Array.isArray(ids) || ids.length === 0;
        }).length;
        const zoneRules = Array.isArray(profile === null || profile === void 0 ? void 0 : profile.zoneRulesJson)
            ? profile.zoneRulesJson.length
            : await this.prisma.siteAccessRule.count({
                where: { projectId, active: true },
            });
        const equipmentRules = (_a = profile === null || profile === void 0 ? void 0 : profile.equipmentRulesJson) !== null && _a !== void 0 ? _a : {};
        const trainingRules = (_b = profile === null || profile === void 0 ? void 0 : profile.trainingRulesJson) !== null && _b !== void 0 ? _b : {};
        const emergencyRules = (_c = profile === null || profile === void 0 ? void 0 : profile.emergencyRulesJson) !== null && _c !== void 0 ? _c : {};
        return this.publishWorkflow.validatePublishReadiness({
            publishedHazardCount: publishedHazards.length,
            hazardsWithoutControls,
            zoneRuleCount: zoneRules,
            equipmentRuleKeys: Object.keys(equipmentRules).length,
            trainingRuleKeys: Object.keys(trainingRules).length,
            emergencyRuleKeys: Object.keys(emergencyRules).length,
        });
    }
    async upsertZoneRules(projectId, zones, actorId) {
        await this.updateProfile(projectId, { zoneRulesJson: zones }, actorId);
        await this.syncZoneRulesFromProfile(projectId, zones, actorId);
        const profile = await this.getOrCreateProfile(projectId);
        return { projectId, zoneRulesJson: profile.zoneRulesJson, synced: true };
    }
    async upsertEquipmentRules(projectId, equipmentRules, actorId) {
        return this.updateProfile(projectId, { equipmentRulesJson: equipmentRules }, actorId);
    }
    async upsertTrainingRequirements(projectId, trainingRules, actorId) {
        return this.updateProfile(projectId, { trainingRulesJson: trainingRules }, actorId);
    }
    async upsertEmergencyRequirements(projectId, emergencyRules, actorId) {
        return this.updateProfile(projectId, { emergencyRulesJson: emergencyRules }, actorId);
    }
    async getProjectSafetyScore(projectId) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        const score = await this.cail.generateProjectSafetyScore(projectId);
        const forecast = await this.cail.hazardForecast(projectId);
        const profile = await this.prisma.pmProjectSafetyProfile.findUnique({
            where: { projectId },
        });
        await this.prisma.projectSafetyRiskSnapshot.create({
            data: {
                projectId,
                predictedLevel: score.band,
                score: score.score,
                precursors: score.weakControls,
                interventions: forecast.map((f) => ({
                    type: 'hazard_forecast',
                    message: f.title,
                    urgency: f.confidence > 0.7 ? 'high' : 'medium',
                })),
                companyHotspots: [],
                engine: 'pm_project_safety_context',
            },
        });
        return Object.assign(Object.assign({ projectId }, score), { workflowState: this.mapWorkflowState(projectId, profile), hazardForecast: forecast });
    }
    async analytics(projectId) {
        var _a, _b, _c, _d;
        const since90 = new Date(Date.now() - 90 * 86400000);
        const [profile, hazardTrend, controlTrend, zoneRules, scoreNow] = await Promise.all([
            this.getOrCreateProfile(projectId),
            this.prisma.pmProjectHazard.groupBy({
                by: ['status'],
                where: { projectId, deletedAt: null },
                _count: true,
            }),
            this.prisma.pmProjectControl.groupBy({
                by: ['status'],
                where: { projectId, deletedAt: null },
                _count: true,
            }),
            this.prisma.siteAccessRule.findMany({
                where: { projectId, active: true },
            }),
            this.cail.generateProjectSafetyScore(projectId),
        ]);
        const snapshots = await this.prisma.projectSafetyRiskSnapshot.findMany({
            where: { projectId, computedAt: { gte: since90 } },
            orderBy: { computedAt: 'asc' },
            take: 30,
        });
        const trainingCodes = Array.isArray(profile.requiredTraining)
            ? profile.requiredTraining
            : [];
        return {
            projectId,
            scoreTrend: snapshots.map((s) => ({
                score: s.score,
                band: s.predictedLevel,
                at: s.computedAt.toISOString(),
            })),
            currentScore: scoreNow.score,
            hazardTrend: hazardTrend.map((h) => ({
                status: h.status,
                count: h._count,
            })),
            controlTrend: controlTrend.map((c) => ({
                status: c.status,
                count: c._count,
            })),
            zoneCompliance: {
                zones: zoneRules.length,
                highRiskZones: zoneRules.filter((z) => z.highRisk).length,
            },
            equipmentCompliance: {
                ruleCount: Object.keys((_a = profile.equipmentRulesJson) !== null && _a !== void 0 ? _a : {}).length,
            },
            trainingCompliance: {
                requiredCourses: trainingCodes.length,
                rolesDefined: Object.keys((_b = profile.trainingRulesJson) !== null && _b !== void 0 ? _b : {}).length,
            },
            leadingIndicators: {
                profilePublished: profile.status === 'published',
                draftHazardBacklog: (_d = (_c = hazardTrend.find((h) => h.status === 'draft')) === null || _c === void 0 ? void 0 : _c._count) !== null && _d !== void 0 ? _d : 0,
                weakControlFlags: scoreNow.weakControls.length,
                predictedRisk: scoreNow.predictedRisk,
            },
        };
    }
    async applyOfflineSync(projectId, payload, actorId) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        let applied = 0;
        if (payload.profile) {
            await this.updateProfile(projectId, payload.profile, actorId);
            applied++;
        }
        if ((_a = payload.zoneRules) === null || _a === void 0 ? void 0 : _a.length) {
            await this.upsertZoneRules(projectId, payload.zoneRules, actorId);
            applied += payload.zoneRules.length;
        }
        for (const h of (_b = payload.hazards) !== null && _b !== void 0 ? _b : []) {
            const existingId = h.id;
            if (existingId) {
                await this.prisma.pmProjectHazard.updateMany({
                    where: { id: existingId, projectId },
                    data: {
                        title: (_c = h.title) !== null && _c !== void 0 ? _c : undefined,
                        description: (_d = h.description) !== null && _d !== void 0 ? _d : undefined,
                        severity: (_e = h.severity) !== null && _e !== void 0 ? _e : undefined,
                        likelihood: (_f = h.likelihood) !== null && _f !== void 0 ? _f : undefined,
                    },
                });
            }
            else if (h.title && h.description && h.category) {
                await this.createHazard(projectId, h, actorId);
            }
            applied++;
        }
        for (const c of (_g = payload.controls) !== null && _g !== void 0 ? _g : []) {
            const existingId = c.id;
            if (existingId) {
                await this.prisma.pmProjectControl.updateMany({
                    where: { id: existingId, projectId },
                    data: {
                        title: (_h = c.title) !== null && _h !== void 0 ? _h : undefined,
                        description: (_j = c.description) !== null && _j !== void 0 ? _j : undefined,
                    },
                });
            }
            else if (c.title && c.description && c.controlType) {
                await this.createControl(projectId, c, actorId);
            }
            applied++;
        }
        for (const o of (_k = payload.overrides) !== null && _k !== void 0 ? _k : []) {
            if (!o.ruleType || !o.ruleKey || !o.reason)
                continue;
            await this.createOverride(projectId, o, actorId);
            applied++;
        }
        const bundle = await this.buildOfflineBundle(projectId);
        await this.audit(projectId, 'offline_sync', String(projectId), 'applied', undefined, actorId, {
            applied,
        });
        return { ok: true, applied, serverState: bundle };
    }
};
exports.PmProjectSafetyContextService = PmProjectSafetyContextService;
exports.PmProjectSafetyContextService = PmProjectSafetyContextService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pm_project_safety_cail_intelligence_service_1.PmProjectSafetyCailIntelligenceService])
], PmProjectSafetyContextService);
//# sourceMappingURL=pm-project-safety-context.service.js.map