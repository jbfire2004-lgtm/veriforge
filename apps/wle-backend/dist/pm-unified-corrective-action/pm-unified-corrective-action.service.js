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
exports.PmUnifiedCorrectiveActionService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
const pm_corrective_actions_service_1 = require("../pm-corrective-actions/pm-corrective-actions.service");
const pm_capa_auto_generate_service_1 = require("../pm-corrective-actions/pm-capa-auto-generate.service");
const pm_unified_hazard_control_service_1 = require("../pm-unified-hazard-control/pm-unified-hazard-control.service");
const pm_worker_safety_profile_service_1 = require("../pm-worker-safety-profile/pm-worker-safety-profile.service");
const pm_unified_corrective_action_cail_service_1 = require("./pm-unified-corrective-action-cail.service");
const capa_generation_engine_1 = require("./capa-generation.engine");
const capa_enforcement_engine_1 = require("./capa-enforcement.engine");
const capa_publish_engine_1 = require("./capa-publish.engine");
const cross_module_integration_engine_1 = require("./cross-module-integration.engine");
const capa_assignment_engine_1 = require("../pm-corrective-actions/capa-assignment.engine");
const safety_ecosystem_events_service_1 = require("../pm-safety-ecosystem/safety-ecosystem-events.service");
let PmUnifiedCorrectiveActionService = class PmUnifiedCorrectiveActionService {
    constructor(prisma, capa, auto, cail, hazardControl, workerSafety, ecosystem) {
        this.prisma = prisma;
        this.capa = capa;
        this.auto = auto;
        this.cail = cail;
        this.hazardControl = hazardControl;
        this.workerSafety = workerSafety;
        this.ecosystem = ecosystem;
        this.generation = new capa_generation_engine_1.CapaGenerationEngine();
        this.enforcement = new capa_enforcement_engine_1.CapaEnforcementEngine();
        this.publish = new capa_publish_engine_1.CapaPublishEngine();
        this.crossModule = new cross_module_integration_engine_1.CrossModuleIntegrationEngine();
        this.assignmentRules = new capa_assignment_engine_1.CapaAssignmentEngine();
    }
    async unifiedAudit(actionId, eventType, actorId, payload) {
        const action = await this.prisma.pmCorrectiveAction.findUnique({
            where: { id: actionId },
            select: { companyId: true, projectId: true },
        });
        await this.prisma.pmCorrectiveActionAuditLog.create({
            data: {
                actionId,
                eventType: `unified_${eventType}`,
                actorId,
                payload: Object.assign(Object.assign({}, payload), { companyId: action === null || action === void 0 ? void 0 : action.companyId, projectId: action === null || action === void 0 ? void 0 : action.projectId }),
            },
        });
    }
    async getDashboard(filters) {
        var _a, _b;
        const where = Object.assign({ companyId: filters.companyId, deletedAt: null }, (filters.projectId ? { projectId: filters.projectId } : {}));
        const now = new Date();
        const [total, open, overdue, critical, escalated] = await Promise.all([
            this.prisma.pmCorrectiveAction.count({ where }),
            this.prisma.pmCorrectiveAction.count({
                where: Object.assign(Object.assign({}, where), { status: { notIn: ['verified', 'closed', 'cancelled'] } }),
            }),
            this.prisma.pmCorrectiveAction.count({
                where: Object.assign(Object.assign({}, where), { dueAt: { lt: now }, status: { notIn: ['verified', 'closed', 'cancelled'] } }),
            }),
            this.prisma.pmCorrectiveAction.count({
                where: Object.assign(Object.assign({}, where), { severityScore: { gte: 75 }, status: { notIn: ['verified', 'closed', 'cancelled'] } }),
            }),
            this.prisma.pmCorrectiveAction.count({
                where: Object.assign(Object.assign({}, where), { escalationLevel: { gte: 2 } }),
            }),
        ]);
        const analytics = filters.projectId
            ? await this.capa.analytics(filters.projectId)
            : { closureRate: 100 };
        const companyScore = this.cail.companyCapaScore({
            open,
            overdue,
            closureRate: (_a = analytics.closureRate) !== null && _a !== void 0 ? _a : 100,
            criticalOpen: critical,
        });
        const insights = await this.cail.insights(filters);
        return {
            companyId: filters.companyId,
            projectId: (_b = filters.projectId) !== null && _b !== void 0 ? _b : null,
            metrics: {
                total,
                open,
                overdue,
                critical,
                escalated,
                companyCapaScore: companyScore,
            },
            cail: { insights },
        };
    }
    async createUnified(input, actorId) {
        var _a, _b, _c, _d, _e;
        const trigger = this.generation.buildTrigger({
            sourceModule: input.sourceModule,
            sourceId: input.sourceId,
            sourceItemId: input.sourceItemId,
            title: input.title,
            description: input.description,
            severity: ((_a = input.severity) !== null && _a !== void 0 ? _a : 'medium'),
            hazardId: input.hazardId,
            controlId: input.controlId,
            equipmentId: input.equipmentId,
            workerId: input.workerId,
            linkTypes: ((_b = input.links) !== null && _b !== void 0 ? _b : []).map((l) => ({
                linkType: l.linkType,
                linkedId: l.linkedId,
            })),
        });
        const action = await this.capa.create({
            companyId: input.companyId,
            projectId: input.projectId,
            siteId: input.siteId,
            sourceModule: input.sourceModule,
            sourceId: input.sourceId,
            sourceItemId: input.sourceItemId,
            title: input.title,
            description: input.description,
            severity: (_c = input.severity) !== null && _c !== void 0 ? _c : trigger.severity,
            actionType: trigger.actionType,
            createdByUserId: input.createdByUserId,
            assignUserId: input.assignUserId,
            equipmentId: input.equipmentId,
            workerId: input.workerId,
            sifLinked: trigger.sifLinked,
            hecaLinked: trigger.hecaLinked,
            clientSyncId: input.clientSyncId,
            publish: false,
        });
        await this.prisma.pmCorrectiveAction.update({
            where: { id: action.id },
            data: {
                hazardId: input.hazardId,
                controlId: input.controlId,
                rootCauseId: input.rootCauseId,
                severityLevel: trigger.severity,
                priorityLevel: this.generation.classify({ severity: trigger.severity })
                    .priority,
                actionType: trigger.actionType,
                verificationRequirementsJson: {
                    requiredRole: trigger.verificationRole,
                    steps: [
                        'review_evidence',
                        'validate_completion',
                        'confirm_effectiveness',
                        'close',
                    ],
                },
                evidenceRequirementsJson: {
                    photos: true,
                    signatures: trigger.severity === 'critical',
                },
            },
        });
        for (const link of (_d = input.links) !== null && _d !== void 0 ? _d : []) {
            await this.addLink(action.id, link.linkType, link.linkedId);
        }
        if (input.hazardId) {
            await this.addLink(action.id, 'hazard', input.hazardId);
        }
        if (input.controlId) {
            await this.addLink(action.id, 'control', input.controlId);
        }
        if (input.publish !== false) {
            await this.publishAction(action.id, actorId !== null && actorId !== void 0 ? actorId : input.createdByUserId);
        }
        await this.unifiedAudit(action.id, 'created', actorId);
        (_e = this.ecosystem) === null || _e === void 0 ? void 0 : _e.emitCapaCreated({
            actionId: action.id,
            companyId: input.companyId,
            projectId: input.projectId,
            title: input.title,
            actorId,
            sourceModule: input.sourceModule,
        });
        return this.capa.get(action.id);
    }
    async publishAction(actionId, actorId) {
        var _a, _b;
        const action = await this.prisma.pmCorrectiveAction.findUnique({
            where: { id: actionId },
            include: { assignees: true },
        });
        if (!action)
            throw new common_1.NotFoundException('Corrective action not found');
        const pub = this.publish.evaluate({
            status: action.status,
            title: action.title,
            hasPrimaryAssignee: action.assignees.some((a) => a.role === 'primary'),
            verificationRequirements: action.verificationRequirementsJson,
        });
        if (!pub.canPublish)
            throw new common_1.BadRequestException(pub.violations.join('; '));
        await this.prisma.pmCorrectiveActionVersion.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                actionId,
                version: action.publishVersion,
                snapshotJson: action,
                publishedById: actorId,
            },
        });
        await this.prisma.pmCorrectiveAction.update({
            where: { id: actionId },
            data: {
                status: pub.nextStatus,
                publishVersion: { increment: 1 },
                publishedAt: new Date(),
            },
        });
        await this.unifiedAudit(actionId, 'published', actorId);
        (_a = this.ecosystem) === null || _a === void 0 ? void 0 : _a.emitCapaStatusChanged({
            actionId,
            companyId: action.companyId,
            projectId: (_b = action.projectId) !== null && _b !== void 0 ? _b : undefined,
            status: pub.nextStatus,
            actorId,
        });
        return this.capa.get(actionId);
    }
    async addLink(actionId, linkType, linkedId, meta) {
        return this.prisma.pmCorrectiveActionLink.upsert({
            where: {
                actionId_linkType_linkedId: { actionId, linkType, linkedId },
            },
            create: {
                id: (0, crypto_1.randomUUID)(),
                actionId,
                linkType,
                linkedId,
                linkedMeta: (meta !== null && meta !== void 0 ? meta : {}),
            },
            update: { linkedMeta: (meta !== null && meta !== void 0 ? meta : {}) },
        });
    }
    async generateFromAllModules(projectId, actorId) {
        var _a;
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        const latestJha = await this.prisma.jhaFlha.findFirst({
            where: { projectId },
            orderBy: { updatedAt: 'desc' },
        });
        const results = {
            jha: latestJha ? await this.auto.fromJhaFlha(latestJha.id, actorId) : [],
            inspection: await this.auto.syncOpenFromModules(projectId, actorId),
            sif: [],
            hazardControl: [],
            pmTasks: [],
            training: [],
            equipment: [],
            emergency: [],
            sds: [],
            access: [],
        };
        if (this.hazardControl) {
            const unmapped = await this.prisma.pmUnifiedHazard.count({
                where: {
                    projectId,
                    status: 'published',
                    deletedAt: null,
                    controlLinks: { none: {} },
                },
            });
            if (unmapped > 0) {
                const created = await this.createUnified({
                    companyId: project.companyId,
                    projectId,
                    sourceModule: 'unified_hazard_control',
                    sourceId: String(projectId),
                    title: `Map controls for ${unmapped} published hazards`,
                    description: 'Auto-generated from weak/missing control mapping',
                    severity: 'high',
                    createdByUserId: actorId,
                    publish: true,
                }, actorId);
                results.hazardControl = [created.id];
            }
        }
        const blockedTasks = await this.prisma.pmPmTask.findMany({
            where: { projectId, status: 'blocked', deletedAt: null },
            take: 10,
        });
        for (const t of blockedTasks) {
            const row = await this.createUnified({
                companyId: project.companyId,
                projectId,
                sourceModule: 'pm_task',
                sourceId: t.id,
                title: `Resolve safety blocker: ${t.title}`,
                description: (_a = t.blockedReason) !== null && _a !== void 0 ? _a : undefined,
                severity: 'high',
                createdByUserId: actorId,
                links: [{ linkType: 'pm_task', linkedId: t.id }],
            }, actorId);
            results.pmTasks.push(row.id);
        }
        const failures = await this.prisma.pmEquipmentFailure.findMany({
            where: {
                projectId,
                status: { notIn: ['closed', 'verified'] },
                correctiveActionId: null,
            },
            take: 10,
        });
        for (const f of failures) {
            const a = await this.auto.fromEquipmentFailure(f.id, actorId);
            if (a)
                results.equipment.push(a.id);
        }
        const emergencies = await this.prisma.pmEmergencyEvent.findMany({
            where: {
                projectId,
                status: { in: ['declared', 'active', 'all_clear'] },
                closedAt: null,
            },
            take: 5,
        });
        for (const e of emergencies) {
            const a = await this.auto.fromEmergencyEvent(e.id, actorId);
            if (a)
                results.emergency.push(a.id);
        }
        const now = new Date();
        const expiredTraining = await this.prisma.pmWorkerSafetyTraining.findMany({
            where: {
                required: true,
                OR: [
                    { status: { in: ['expired', 'missing', 'invalid'] } },
                    { expiresAt: { lt: now } },
                ],
                worker: {
                    projectAssignments: { some: { projectId, status: 'ACTIVE' } },
                },
            },
            take: 10,
        });
        for (const t of expiredTraining) {
            const a = await this.auto.fromTrainingGap(t.workerId, projectId, t.trainingCode, actorId);
            if (a)
                results.training.push(a.id);
        }
        const deniedAccess = await this.prisma.pmAccessAttempt.findMany({
            where: {
                projectId,
                decision: { in: ['denied', 'denied_with_reason'] },
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
        });
        for (const att of deniedAccess) {
            if (!att.workerId)
                continue;
            const reasons = Array.isArray(att.denialReasons)
                ? att.denialReasons.join('; ')
                : 'Access denied';
            const a = await this.auto.fromAccessDenial(att.workerId, projectId, reasons, actorId);
            if (a)
                results.access.push(a.id);
        }
        return { projectId, results };
    }
    async generateFromSource(source, sourceId, actorId, extras) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        switch (source) {
            case 'jha_flha':
                return this.auto.fromJhaFlha(sourceId, actorId);
            case 'inspection':
                return this.auto.fromInspectionDeficiency((_a = extras === null || extras === void 0 ? void 0 : extras.deficiencyId) !== null && _a !== void 0 ? _a : sourceId, actorId);
            case 'incident':
                return this.auto.fromSafetyEvent(sourceId, (_b = extras === null || extras === void 0 ? void 0 : extras.rootCauseId) !== null && _b !== void 0 ? _b : '', actorId);
            case 'sif_heca':
                return this.auto.fromSifHecaEvent(sourceId, actorId);
            case 'equipment':
                return this.auto.fromEquipmentFailure(sourceId, actorId);
            case 'emergency':
                return this.auto.fromEmergencyEvent(sourceId, actorId);
            case 'training':
                return this.auto.fromTrainingGap(parseInt((_c = extras === null || extras === void 0 ? void 0 : extras.rootCauseId) !== null && _c !== void 0 ? _c : sourceId, 10), parseInt((_d = extras === null || extras === void 0 ? void 0 : extras.deficiencyId) !== null && _d !== void 0 ? _d : '0', 10) || 0, sourceId, actorId);
            case 'sds':
                return this.auto.fromSdsGap(parseInt((_e = extras === null || extras === void 0 ? void 0 : extras.rootCauseId) !== null && _e !== void 0 ? _e : '1', 10), parseInt((_f = extras === null || extras === void 0 ? void 0 : extras.deficiencyId) !== null && _f !== void 0 ? _f : '0', 10) || 0, sourceId, actorId);
            case 'site_access':
                return this.auto.fromAccessDenial(parseInt(sourceId, 10), parseInt((_g = extras === null || extras === void 0 ? void 0 : extras.deficiencyId) !== null && _g !== void 0 ? _g : '0', 10) || 0, (_h = extras === null || extras === void 0 ? void 0 : extras.rootCauseId) !== null && _h !== void 0 ? _h : 'Access denied', actorId);
            default:
                throw new common_1.BadRequestException(`Unknown source ${source}`);
        }
    }
    async updateUnified(actionId, body, actorId) {
        const action = await this.prisma.pmCorrectiveAction.findUnique({
            where: { id: actionId },
        });
        if (!action || action.deletedAt)
            throw new common_1.NotFoundException('Corrective action not found');
        if (['verified', 'closed', 'cancelled'].includes(action.status)) {
            throw new common_1.BadRequestException('Cannot update closed corrective action');
        }
        const updated = await this.prisma.pmCorrectiveAction.update({
            where: { id: actionId },
            data: {
                title: body.title,
                description: body.description,
                severityLevel: body.severityLevel,
                priorityLevel: body.priorityLevel,
                dueAt: body.dueAt ? new Date(body.dueAt) : undefined,
                hazardId: body.hazardId,
                controlId: body.controlId,
                equipmentId: body.equipmentId,
                workerId: body.workerId,
            },
        });
        await this.unifiedAudit(actionId, 'updated', actorId, body);
        return this.capa.get(updated.id);
    }
    async autoAssign(actionId, actorId) {
        var _a, _b;
        const action = await this.prisma.pmCorrectiveAction.findUnique({
            where: { id: actionId },
            include: { project: { include: { projectSafetyRoles: true } } },
        });
        if (!action)
            throw new common_1.NotFoundException('Corrective action not found');
        const safetyLead = (_b = (_a = action.project) === null || _a === void 0 ? void 0 : _a.projectSafetyRoles) === null || _b === void 0 ? void 0 : _b.find((r) => r.role === 'company_safety_manager' || r.role === 'supervisor');
        const suggestions = this.assignmentRules.suggest({
            severity: action.severityLevel,
            sourceModule: action.sourceModule,
            sifLinked: action.sourceModule === 'sif_heca',
            projectSafetyLeadId: safetyLead === null || safetyLead === void 0 ? void 0 : safetyLead.userId,
        });
        for (const s of suggestions) {
            if (s.userId) {
                await this.capa.assign(actionId, { userId: s.userId, role: s.role }, actorId);
            }
        }
        return { actionId, suggestions };
    }
    submitForVerification(actionId, actorId) {
        return this.capa.submitForVerification(actionId, actorId);
    }
    markInProgress(actionId, actorId) {
        return this.capa.markInProgress(actionId, actorId);
    }
    addSignature(actionId, data, actorId) {
        return this.capa.addSignature(actionId, data, actorId);
    }
    async jhaApprovalGate(jhaFlhaId) {
        const openCapa = await this.prisma.pmCorrectiveAction.count({
            where: {
                deletedAt: null,
                status: { notIn: ['verified', 'closed', 'cancelled'] },
                OR: [
                    { sourceModule: 'jha_flha', sourceId: jhaFlhaId },
                    {
                        moduleLinks: {
                            some: { linkType: 'jha_flha', linkedId: jhaFlhaId },
                        },
                    },
                ],
            },
        });
        const sifOpen = await this.prisma.pmCorrectiveAction.count({
            where: {
                deletedAt: null,
                status: { notIn: ['verified', 'closed', 'cancelled'] },
                sourceModule: 'sif_heca',
                moduleLinks: { some: { linkType: 'jha_flha', linkedId: jhaFlhaId } },
            },
        });
        return this.crossModule.jhaApprovalGate(openCapa, sifOpen);
    }
    async pmTaskStartGate(projectId, workerId) {
        const enforcement = await this.unifiedEnforcement({
            companyId: (await this.prisma.project.findUnique({
                where: { id: projectId },
            })).companyId,
            projectId,
            workerId,
        });
        return this.crossModule.pmTaskStartGate(enforcement.blocks.pmScheduling ? 1 : 0, enforcement.blocks.workerAccess ? 1 : 0);
    }
    async revokeExpiredOverrides() {
        const result = await this.prisma.pmCorrectiveActionOverride.updateMany({
            where: { active: true, expiresAt: { lt: new Date() } },
            data: { active: false },
        });
        return { revoked: result.count };
    }
    getAction(actionId) {
        return this.capa.get(actionId);
    }
    async applyOfflineSync(companyId, projectId, payload, actorId) {
        var _a, _b, _c, _d, _e, _f, _g;
        const applied = [];
        for (const row of (_a = payload.actions) !== null && _a !== void 0 ? _a : []) {
            const syncId = String((_b = row.clientSyncId) !== null && _b !== void 0 ? _b : '');
            if (!syncId)
                continue;
            const existing = await this.prisma.pmCorrectiveAction.findUnique({
                where: { clientSyncId: syncId },
            });
            if (existing) {
                if (row.status === 'verification_pending') {
                    await this.capa.submitForVerification(existing.id, actorId);
                }
                applied.push(existing.id);
                continue;
            }
            const created = await this.capa.syncOffline({
                clientSyncId: syncId,
                companyId,
                projectId,
                createdByUserId: actorId,
                title: String(row.title),
                description: row.description,
                sourceModule: String((_c = row.sourceModule) !== null && _c !== void 0 ? _c : 'manual'),
                sourceId: String((_d = row.sourceId) !== null && _d !== void 0 ? _d : syncId),
                severity: String((_e = row.severity) !== null && _e !== void 0 ? _e : 'medium'),
                publish: row.publish !== false,
            });
            applied.push(created.id);
        }
        for (const v of (_f = payload.verifications) !== null && _f !== void 0 ? _f : []) {
            if (!v.actionId)
                continue;
            await this.verify(v.actionId, v, actorId);
            if (v.outcome === 'approve') {
                await this.closeDeficiencyOnVerify(v.actionId);
            }
            applied.push(v.actionId);
        }
        for (const att of (_g = payload.attachments) !== null && _g !== void 0 ? _g : []) {
            if (!att.actionId)
                continue;
            await this.capa.addAttachment(att.actionId, {
                fileName: att.fileName,
                mimeType: att.mimeType,
                dataUrl: att.dataUrl,
                phase: att.phase,
                clientSyncId: att.clientSyncId,
            }, actorId);
            applied.push(att.actionId);
        }
        return {
            ok: true,
            applied: [...new Set(applied)],
            serverState: await this.buildOfflineBundle({ companyId, projectId }),
        };
    }
    async getCailBundle(filters) {
        var _a, _b, _c;
        const dashboard = await this.getDashboard(filters);
        const metrics = dashboard.metrics;
        const [insights, predictions, workerRiskScores, equipmentRiskScores, chronicDeficiencies, weakControls,] = await Promise.all([
            this.cail.insights(filters),
            this.cail.predictCapaGeneration(filters),
            this.cail.workerRiskScoring(filters),
            this.cail.equipmentRiskScoring(filters),
            this.cail.chronicDeficiencyDetection(filters),
            this.cail.weakControlDetection(filters),
        ]);
        const projectCapaScore = filters.projectId
            ? await this.cail.projectCapaScore(filters.projectId)
            : null;
        return {
            insights,
            predictions,
            workerRiskScores,
            equipmentRiskScores,
            chronicDeficiencies,
            weakControls,
            companyCapaScore: (_a = metrics.companyCapaScore) !== null && _a !== void 0 ? _a : null,
            projectCapaScore,
            overdueRiskScore: this.cail.overdueRiskScore({
                openCount: (_b = metrics.open) !== null && _b !== void 0 ? _b : 0,
                overdueCount: (_c = metrics.overdue) !== null && _c !== void 0 ? _c : 0,
                avgDaysToDue: 7,
                escalationLevelMax: 3,
            }),
        };
    }
    async getAnalyticsTrends(filters) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const base = await this.getAnalytics(filters);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
        const where = Object.assign({ companyId: filters.companyId, deletedAt: null, createdAt: { gte: thirtyDaysAgo } }, (filters.projectId ? { projectId: filters.projectId } : {}));
        const [created, closed, escalations] = await Promise.all([
            this.prisma.pmCorrectiveAction.count({ where }),
            this.prisma.pmCorrectiveAction.count({
                where: Object.assign(Object.assign({}, where), { status: { in: ['verified', 'closed'] } }),
            }),
            this.prisma.pmCorrectiveActionEscalation.count({
                where: {
                    triggeredAt: { gte: thirtyDaysAgo },
                    action: filters.projectId ? { projectId: filters.projectId } : {},
                },
            }),
        ]);
        const overdueRisk = this.cail.overdueRiskScore({
            openCount: (_b = (_a = base.metrics) === null || _a === void 0 ? void 0 : _a.open) !== null && _b !== void 0 ? _b : 0,
            overdueCount: (_d = (_c = base.metrics) === null || _c === void 0 ? void 0 : _c.overdue) !== null && _d !== void 0 ? _d : 0,
            avgDaysToDue: 7,
            escalationLevelMax: 3,
        });
        return Object.assign(Object.assign({}, base), { trends: {
                created30d: created,
                closed30d: closed,
                escalations30d: escalations,
            }, overdueRiskScore: overdueRisk, leadingIndicators: {
                overdueRate: created > 0
                    ? Math.round((((_f = (_e = base.metrics) === null || _e === void 0 ? void 0 : _e.overdue) !== null && _f !== void 0 ? _f : 0) /
                        created) *
                        100)
                    : 0,
                criticalOpen: (_h = (_g = base.metrics) === null || _g === void 0 ? void 0 : _g.critical) !== null && _h !== void 0 ? _h : 0,
            } });
    }
    workerCapaList(workerId, projectId) {
        return this.capa
            .list({
            projectId,
            overdueOnly: false,
        })
            .then((rows) => rows.filter((r) => {
            var _a;
            return r.workerId === workerId ||
                ((_a = r.assignees) === null || _a === void 0 ? void 0 : _a.some((a) => a.workerId === workerId));
        }));
    }
    equipmentCapaList(equipmentId, projectId) {
        return this.capa
            .list({ projectId })
            .then((rows) => rows.filter((r) => r.equipmentId === equipmentId));
    }
    async unifiedEnforcement(filters) {
        var _a, _b;
        const openWhere = Object.assign({ companyId: filters.companyId, deletedAt: null, status: {
                notIn: [
                    'verified',
                    'closed',
                    'cancelled',
                ],
            } }, (filters.projectId ? { projectId: filters.projectId } : {}));
        let workerOpen = 0;
        let workerOverdue = 0;
        let workerCritical = 0;
        if (filters.workerId) {
            const w = await this.capa.workerAccessCheck(filters.workerId, (_a = filters.projectId) !== null && _a !== void 0 ? _a : 0);
            workerOpen = w.openAssigned;
            workerOverdue = w.overdueCount;
            workerCritical = w.criticalOpen;
        }
        const equipmentOpen = filters.equipmentId
            ? await this.prisma.pmCorrectiveAction.count({
                where: Object.assign(Object.assign({}, openWhere), { equipmentId: filters.equipmentId }),
            })
            : 0;
        const projectCriticalOpen = await this.prisma.pmCorrectiveAction.count({
            where: Object.assign(Object.assign({}, openWhere), { severityScore: { gte: 75 } }),
        });
        const emergencyActive = filters.projectId
            ? !!(await this.prisma.pmSiteEmergencyLock.findFirst({
                where: { projectId: filters.projectId, active: true },
            }))
            : false;
        const overrides = await this.prisma.pmCorrectiveActionOverride.findMany({
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
        return this.enforcement.evaluate({
            workerOpen,
            workerOverdue,
            workerCritical,
            equipmentOpen,
            projectCriticalOpen,
            emergencyActive,
            activeOverrides: overrides.map((o) => ({
                ruleType: o.ruleType,
                ruleKey: o.ruleKey,
            })),
        });
    }
    async createOverride(body, actorId) {
        return this.prisma.pmCorrectiveActionOverride.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                companyId: body.companyId,
                projectId: body.projectId,
                actionId: body.actionId,
                ruleType: body.ruleType,
                ruleKey: body.ruleKey,
                reason: body.reason,
                expiresAt: new Date(body.expiresAt),
                approvedById: actorId,
            },
        });
    }
    runEscalationSweep(projectId) {
        return this.capa.runEscalations(projectId);
    }
    assign(actionId, data, actorId) {
        return this.capa.assign(actionId, data, actorId);
    }
    verify(actionId, input, verifierUserId) {
        return this.capa.verify(actionId, input, verifierUserId);
    }
    async closeDeficiencyOnVerify(actionId) {
        const action = await this.prisma.pmCorrectiveAction.findUnique({
            where: { id: actionId },
            include: { moduleLinks: true },
        });
        if (!action || action.status !== 'verified')
            return;
        const inspLink = action.moduleLinks.find((l) => l.linkType === 'inspection');
        if (inspLink && action.deficiencyId) {
            await this.prisma.pmInspectionDeficiency.update({
                where: { id: action.deficiencyId },
                data: { status: 'closed', closedAt: new Date() },
            });
        }
    }
    async buildOfflineBundle(filters) {
        const actions = await this.capa.list({
            companyId: filters.companyId,
            projectId: filters.projectId,
        });
        const cacheKey = filters.projectId
            ? `project:${filters.projectId}:capa_bundle`
            : `company:${filters.companyId}:capa_bundle`;
        const bundle = {
            syncedAt: new Date().toISOString(),
            actions,
            hazardControl: this.hazardControl
                ? await this.hazardControl.buildOfflineBundle({
                    companyId: filters.companyId,
                    projectId: filters.projectId,
                })
                : null,
        };
        await this.prisma.pmCorrectiveActionOfflineCache.upsert({
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
    async getAnalytics(filters) {
        const dashboard = await this.getDashboard(filters);
        if (filters.projectId) {
            const projectAnalytics = await this.capa.analytics(filters.projectId);
            return Object.assign(Object.assign({}, dashboard), { projectAnalytics });
        }
        return dashboard;
    }
};
exports.PmUnifiedCorrectiveActionService = PmUnifiedCorrectiveActionService;
exports.PmUnifiedCorrectiveActionService = PmUnifiedCorrectiveActionService = __decorate([
    (0, common_1.Injectable)(),
    __param(4, (0, common_1.Optional)()),
    __param(5, (0, common_1.Optional)()),
    __param(6, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pm_corrective_actions_service_1.PmCorrectiveActionsService,
        pm_capa_auto_generate_service_1.PmCapaAutoGenerateService,
        pm_unified_corrective_action_cail_service_1.PmUnifiedCorrectiveActionCailService,
        pm_unified_hazard_control_service_1.PmUnifiedHazardControlService,
        pm_worker_safety_profile_service_1.PmWorkerSafetyProfileService,
        safety_ecosystem_events_service_1.SafetyEcosystemEventsService])
], PmUnifiedCorrectiveActionService);
//# sourceMappingURL=pm-unified-corrective-action.service.js.map