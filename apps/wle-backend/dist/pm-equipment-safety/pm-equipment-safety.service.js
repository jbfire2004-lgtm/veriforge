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
exports.PmEquipmentSafetyService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const equipment_compliance_service_1 = require("../modules/equipment-compliance/equipment-compliance.service");
const pm_capa_auto_generate_service_1 = require("../pm-corrective-actions/pm-capa-auto-generate.service");
const equipment_condition_engine_1 = require("./equipment-condition.engine");
const equipment_assignment_engine_1 = require("./equipment-assignment.engine");
const loto_workflow_engine_1 = require("./loto-workflow.engine");
const failure_workflow_engine_1 = require("./failure-workflow.engine");
const pm_equipment_cail_intelligence_service_1 = require("./pm-equipment-cail-intelligence.service");
let PmEquipmentSafetyService = class PmEquipmentSafetyService {
    constructor(prisma, compliance, cail, capaAuto) {
        this.prisma = prisma;
        this.compliance = compliance;
        this.cail = cail;
        this.capaAuto = capaAuto;
        this.conditionEngine = new equipment_condition_engine_1.EquipmentConditionEngine();
        this.assignmentEngine = new equipment_assignment_engine_1.EquipmentAssignmentEngine();
        this.lotoWorkflow = new loto_workflow_engine_1.LotoWorkflowEngine();
        this.failureWorkflow = new failure_workflow_engine_1.FailureWorkflowEngine();
    }
    async audit(entityType, entityId, eventType, actorId, payload) {
        await this.prisma.pmEquipmentSafetyAudit.create({
            data: {
                entityType,
                entityId,
                eventType,
                actorId,
                payload: payload,
            },
        });
    }
    mapOperationalStatus(status) {
        return status === 'in_service'
            ? 'in_service'
            : status === 'out_of_service'
                ? 'out_of_service'
                : status === 'locked_out'
                    ? 'locked_out'
                    : 'active';
    }
    async registerEquipment(data, actorId) {
        if (data.clientSyncId) {
            const existing = await this.prisma.equipment.findFirst({
                where: {
                    companyId: data.companyId,
                    deletedAt: null,
                    pmSafetyMetadataJson: {
                        path: ['clientSyncId'],
                        equals: data.clientSyncId,
                    },
                },
            });
            if (existing)
                return existing;
        }
        const eq = await this.prisma.equipment.create({
            data: {
                name: data.name,
                serialNumber: data.serialNumber,
                manufacturer: data.manufacturer,
                model: data.model,
                companyId: data.companyId,
                typeId: data.typeId,
                categoryId: data.categoryId,
                safetyCategory: data.safetyCategory,
                operationalStatus: 'active',
                safetyStatus: client_1.EquipmentSafetyStatus.OK,
                pmSafetyMetadataJson: data.clientSyncId
                    ? { clientSyncId: data.clientSyncId }
                    : {},
            },
        });
        if (data.projectId) {
            await this.prisma.equipmentProjectAssignment.create({
                data: {
                    equipmentId: eq.id,
                    projectId: data.projectId,
                    companyId: data.companyId,
                    assignedAt: new Date(),
                },
            });
        }
        await this.audit('equipment', String(eq.id), 'registered', actorId);
        await this.recalculateCondition(eq.id, data.projectId);
        return eq;
    }
    async getEquipmentScore(equipmentId, projectId) {
        const condition = await this.recalculateCondition(equipmentId, projectId);
        const eq = await this.prisma.equipment.findUnique({
            where: { id: equipmentId },
            select: {
                operationalStatus: true,
                lockoutStatus: true,
                complianceStatus: true,
                nextInspectionAt: true,
                lastInspectionAt: true,
            },
        });
        return {
            equipmentId,
            conditionScore: condition.score,
            riskBand: condition.riskBand,
            factors: condition.factors,
            status: eq ? this.mapOperationalStatus(eq.operationalStatus) : 'active',
            nextInspectionDue: eq === null || eq === void 0 ? void 0 : eq.nextInspectionAt,
            lastInspectionDate: eq === null || eq === void 0 ? void 0 : eq.lastInspectionAt,
            lockoutStatus: eq === null || eq === void 0 ? void 0 : eq.lockoutStatus,
            complianceStatus: eq === null || eq === void 0 ? void 0 : eq.complianceStatus,
        };
    }
    async recordEquipmentInspection(data) {
        var _a, _b;
        const row = await this.registerEquipmentInspection({
            companyId: data.companyId,
            projectId: data.projectId,
            equipmentId: data.equipmentId,
            pmInspectionId: data.pmInspectionId,
            cadence: (_a = data.cadence) !== null && _a !== void 0 ? _a : 'pre_use',
            conditionScore: data.conditionScore,
            passed: data.passed,
            items: data.items,
            clientSyncId: data.clientSyncId,
        });
        if (data.passed === false) {
            await this.createLoto({
                companyId: data.companyId,
                equipmentId: data.equipmentId,
                reason: (_b = data.notes) !== null && _b !== void 0 ? _b : 'Failed equipment inspection',
                stepsJson: [{ step: 'Tag out — failed inspection', completed: true }],
            }, data.inspectorUserId);
        }
        else {
            await this.prisma.equipment.update({
                where: { id: data.equipmentId },
                data: {
                    lastInspectionAt: new Date(),
                    operationalStatus: 'in_service',
                },
            });
        }
        await this.audit('equipment_inspection', row.id, 'recorded', data.inspectorUserId, {
            passed: data.passed,
            templateId: data.templateId,
        });
        return row;
    }
    async unlockEquipment(equipmentId, actorId) {
        const active = await this.prisma.pmEquipmentLoto.findMany({
            where: { equipmentId, status: { in: ['active', 'verified'] } },
        });
        if (active.length === 0) {
            throw new common_1.BadRequestException('No active lockout on equipment');
        }
        for (const loto of active) {
            await this.removeLoto(loto.id, actorId !== null && actorId !== void 0 ? actorId : 0);
        }
        return { equipmentId, lockoutsRemoved: active.length };
    }
    async listProfiles(filters) {
        const projectEquipmentIds = filters.projectId
            ? (await this.prisma.equipmentProjectAssignment.findMany({
                where: { projectId: filters.projectId, endedAt: null },
                select: { equipmentId: true },
            })).map((a) => a.equipmentId)
            : null;
        return this.prisma.equipment.findMany({
            where: Object.assign({ companyId: filters.companyId, deletedAt: null, safetyCategory: filters.safetyCategory, operationalStatus: filters.operationalStatus }, (projectEquipmentIds ? { id: { in: projectEquipmentIds } } : {})),
            include: {
                category: true,
                type: true,
                pmCertifications: { where: { deletedAt: null }, take: 5 },
                pmConditionScores: { orderBy: { scoredAt: 'desc' }, take: 1 },
            },
            orderBy: { name: 'asc' },
            take: 300,
        });
    }
    async getProfile(equipmentId) {
        const eq = await this.prisma.equipment.findFirst({
            where: { id: equipmentId, deletedAt: null },
            include: {
                category: true,
                type: true,
                attachments: { take: 20 },
                pmCertifications: { where: { deletedAt: null } },
                pmEquipmentInspections: { orderBy: { createdAt: 'desc' }, take: 10 },
                pmFailures: { orderBy: { createdAt: 'desc' }, take: 10 },
                pmLotoEvents: { where: { status: { in: ['active', 'verified'] } } },
                lockoutHistory: { orderBy: { lockedAt: 'desc' }, take: 5 },
                maintenanceRecords: { orderBy: { performedAt: 'desc' }, take: 5 },
                workerAuthorizations: { where: { active: true } },
            },
        });
        if (!eq)
            throw new common_1.NotFoundException('Equipment not found');
        return eq;
    }
    async updateProfile(equipmentId, data, actorId) {
        const updated = await this.prisma.equipment.update({
            where: { id: equipmentId },
            data: {
                name: data.name,
                serialNumber: data.serialNumber,
                manufacturer: data.manufacturer,
                model: data.model,
                yearMade: data.yearMade,
                capacity: data.capacity,
                safetyCategory: data.safetyCategory,
                operationalStatus: data.operationalStatus,
                loadChartJson: data.loadChartJson,
                pmSafetyMetadataJson: data.pmSafetyMetadataJson,
            },
        });
        await this.audit('equipment', String(equipmentId), 'profile_updated', actorId);
        return updated;
    }
    async recalculateCondition(equipmentId, projectId) {
        const eq = await this.getProfile(equipmentId);
        const now = new Date();
        const expiredCerts = eq.pmCertifications.filter((c) => c.status === 'approved' && c.expiresAt && c.expiresAt < now).length;
        const chronicFailures = await this.prisma.pmEquipmentFailure.count({
            where: {
                equipmentId,
                createdAt: { gte: new Date(now.getTime() - 90 * 86400000) },
            },
        });
        const openCritical = await this.prisma.pmInspectionDeficiency.count({
            where: {
                severity: 'critical',
                status: { not: 'closed' },
                inspection: { equipmentId },
            },
        });
        const lastInsp = eq.pmEquipmentInspections[0];
        const result = this.conditionEngine.score({
            complianceStatus: eq.complianceStatus,
            safetyStatus: eq.safetyStatus,
            lockoutStatus: eq.lockoutStatus,
            operationalStatus: eq.operationalStatus,
            lastInspectionScore: lastInsp === null || lastInsp === void 0 ? void 0 : lastInsp.conditionScore,
            openCriticalDeficiencies: openCritical,
            expiredCertifications: expiredCerts,
            chronicFailureCount: chronicFailures,
        });
        await this.prisma.pmEquipmentConditionScore.create({
            data: {
                equipmentId,
                projectId,
                score: result.score,
                riskBand: result.riskBand,
                factorsJson: result.factors,
            },
        });
        if (result.riskBand === 'critical') {
            await this.prisma.equipment.update({
                where: { id: equipmentId },
                data: { safetyStatus: client_1.EquipmentSafetyStatus.UNSAFE },
            });
        }
        return result;
    }
    async listCertifications(equipmentId) {
        return this.prisma.pmEquipmentCertification.findMany({
            where: { equipmentId, deletedAt: null },
            orderBy: { expiresAt: 'asc' },
        });
    }
    async createCertification(data, actorId) {
        const cert = await this.prisma.pmEquipmentCertification.create({
            data: Object.assign(Object.assign({}, data), { status: 'draft' }),
        });
        await this.audit('certification', cert.id, 'created', actorId);
        return cert;
    }
    async approveCertification(id, actorId) {
        const cert = await this.prisma.pmEquipmentCertification.findUnique({
            where: { id },
        });
        if (!cert)
            throw new common_1.NotFoundException('Certification not found');
        const updated = await this.prisma.pmEquipmentCertification.update({
            where: { id },
            data: {
                status: 'approved',
                approvedAt: new Date(),
                approvedByUserId: actorId,
            },
        });
        await this.compliance.recalculate(cert.equipmentId, {
            trigger: 'MANUAL',
            assessedByUserId: actorId,
        });
        await this.audit('certification', id, 'approved', actorId);
        return updated;
    }
    async flagExpiredCertifications(companyId) {
        const now = new Date();
        const expired = await this.prisma.pmEquipmentCertification.findMany({
            where: {
                companyId,
                status: 'approved',
                expiresAt: { lt: now },
                deletedAt: null,
            },
        });
        for (const c of expired) {
            await this.prisma.pmEquipmentCertification.update({
                where: { id: c.id },
                data: { status: 'expired' },
            });
            await this.prisma.equipment.update({
                where: { id: c.equipmentId },
                data: {
                    operationalStatus: 'out_of_service',
                    safetyStatus: client_1.EquipmentSafetyStatus.UNSAFE,
                },
            });
            await this.compliance.recalculate(c.equipmentId, {
                trigger: 'MANUAL',
                forceStatus: 'NON_COMPLIANT',
            });
        }
        return { expiredCount: expired.length };
    }
    async registerEquipmentInspection(data) {
        var _a, _b;
        const row = await this.prisma.pmEquipmentInspection.create({
            data: Object.assign(Object.assign({ companyId: data.companyId, projectId: data.projectId, equipmentId: data.equipmentId }, (data.pmInspectionId ? { pmInspectionId: data.pmInspectionId } : {})), { cadence: data.cadence, conditionScore: data.conditionScore, passed: data.passed, requiresSupervisorReview: (_a = data.requiresSupervisorReview) !== null && _a !== void 0 ? _a : false, clientSyncId: data.clientSyncId, items: ((_b = data.items) === null || _b === void 0 ? void 0 : _b.length)
                    ? {
                        create: data.items.map((i) => ({
                            itemKey: i.itemKey,
                            label: i.label,
                            passed: i.passed,
                            score: i.score,
                            notes: i.notes,
                            deficiencySeverity: i.deficiencySeverity,
                        })),
                    }
                    : undefined }),
            include: { items: true },
        });
        await this.recalculateCondition(data.equipmentId, data.projectId);
        return row;
    }
    async reportFailure(data, actorId) {
        var _a, _b;
        const failure = await this.prisma.pmEquipmentFailure.create({
            data: {
                companyId: data.companyId,
                projectId: data.projectId,
                equipmentId: data.equipmentId,
                failureType: data.failureType,
                title: data.title,
                description: data.description,
                hazardCreated: (_a = data.hazardCreated) !== null && _a !== void 0 ? _a : false,
                reportedByUserId: (_b = data.reportedByUserId) !== null && _b !== void 0 ? _b : actorId,
                clientSyncId: data.clientSyncId,
                status: 'reported',
            },
        });
        if (data.autoLockout !== false) {
            await this.createLoto({
                companyId: data.companyId,
                equipmentId: data.equipmentId,
                reason: `Failure: ${data.title}`,
                stepsJson: [{ step: 'Isolate energy', completed: true }],
                authorizedWorkerIds: [],
            }, actorId);
            await this.prisma.pmEquipmentFailure.update({
                where: { id: failure.id },
                data: { status: 'locked_out', lockedOutAt: new Date() },
            });
        }
        if (this.capaAuto) {
            const capa = await this.capaAuto.fromDocumentDeficiency({
                companyId: data.companyId,
                projectId: data.projectId,
                sourceModule: 'equipment_failure',
                sourceId: failure.id,
                title: `Equipment failure: ${data.title}`,
                description: data.description,
                severity: 'high',
                actorId: actorId !== null && actorId !== void 0 ? actorId : 1,
            });
            if (capa) {
                await this.prisma.pmEquipmentFailure.update({
                    where: { id: failure.id },
                    data: { status: 'capa_open', correctiveActionId: capa.id },
                });
            }
        }
        await this.audit('failure', failure.id, 'reported', actorId);
        return failure;
    }
    async transitionFailure(id, to, actorId) {
        const row = await this.prisma.pmEquipmentFailure.findUnique({
            where: { id },
        });
        if (!row)
            throw new common_1.NotFoundException('Failure not found');
        this.failureWorkflow.assertTransition(row.status, to);
        const update = { status: to };
        if (to === 'supervisor_review')
            update.supervisorReviewedAt = new Date();
        if (to === 'owner_review')
            update.ownerReviewedAt = new Date();
        if (to === 'closed')
            update.updatedAt = new Date();
        const updated = await this.prisma.pmEquipmentFailure.update({
            where: { id },
            data: update,
        });
        await this.audit('failure', id, `status_${to}`, actorId);
        return updated;
    }
    async listActiveLoto(equipmentId) {
        return this.prisma.pmEquipmentLoto.findMany({
            where: { equipmentId, status: { in: ['active', 'verified'] } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createLoto(data, actorId) {
        var _a, _b;
        const legacy = await this.prisma.equipmentLockout.create({
            data: {
                equipmentId: data.equipmentId,
                companyId: data.companyId,
                reason: data.reason,
                lockedByUserId: actorId,
            },
        });
        const loto = await this.prisma.pmEquipmentLoto.create({
            data: {
                companyId: data.companyId,
                equipmentId: data.equipmentId,
                reason: data.reason,
                stepsJson: ((_a = data.stepsJson) !== null && _a !== void 0 ? _a : []),
                authorizedWorkerIds: ((_b = data.authorizedWorkerIds) !== null && _b !== void 0 ? _b : []),
                legacyLockoutId: legacy.id,
                clientSyncId: data.clientSyncId,
                status: 'active',
            },
        });
        await this.prisma.equipment.update({
            where: { id: data.equipmentId },
            data: {
                lockedOutAt: new Date(),
                lockoutReason: data.reason,
                lockoutStatus: 'LOCKED_OUT',
                operationalStatus: 'locked_out',
                safetyStatus: client_1.EquipmentSafetyStatus.UNSAFE,
            },
        });
        await this.compliance.recalculate(data.equipmentId, {
            trigger: 'LOCKOUT',
            assessedByUserId: actorId,
            forceStatus: 'LOCKED_OUT',
        });
        await this.audit('loto', loto.id, 'created', actorId);
        return loto;
    }
    async verifyLoto(id, actorId) {
        const loto = await this.prisma.pmEquipmentLoto.findUnique({
            where: { id },
        });
        if (!loto)
            throw new common_1.NotFoundException('LOTO not found');
        this.lotoWorkflow.assertTransition(loto.status, 'verified');
        return this.prisma.pmEquipmentLoto.update({
            where: { id },
            data: {
                status: 'verified',
                verifiedAt: new Date(),
                verifiedByUserId: actorId,
            },
        });
    }
    async removeLoto(id, actorId) {
        const loto = await this.prisma.pmEquipmentLoto.findUnique({
            where: { id },
        });
        if (!loto)
            throw new common_1.NotFoundException('LOTO not found');
        this.lotoWorkflow.assertTransition(loto.status, 'removed');
        await this.prisma.pmEquipmentLoto.update({
            where: { id },
            data: {
                status: 'removed',
                removedAt: new Date(),
                removedByUserId: actorId,
            },
        });
        if (loto.legacyLockoutId) {
            await this.prisma.equipmentLockout.update({
                where: { id: loto.legacyLockoutId },
                data: { unlockedAt: new Date(), unlockedByUserId: actorId },
            });
        }
        const activeCount = await this.prisma.pmEquipmentLoto.count({
            where: {
                equipmentId: loto.equipmentId,
                status: { in: ['active', 'verified'] },
            },
        });
        if (activeCount === 0) {
            await this.prisma.equipment.update({
                where: { id: loto.equipmentId },
                data: {
                    lockedOutAt: null,
                    lockoutReason: null,
                    lockoutStatus: 'CLEAR',
                    operationalStatus: 'active',
                    safetyStatus: client_1.EquipmentSafetyStatus.OK,
                },
            });
            await this.compliance.recalculate(loto.equipmentId, {
                trigger: 'UNLOCK',
                assessedByUserId: actorId,
            });
        }
        await this.audit('loto', id, 'removed', actorId);
        return { removed: true };
    }
    async listAuthorizations(filters) {
        return this.prisma.pmWorkerEquipmentAuthorization.findMany({
            where: {
                companyId: filters.companyId,
                workerId: filters.workerId,
                equipmentId: filters.equipmentId,
                active: true,
            },
            include: {
                worker: { select: { id: true, firstName: true, lastName: true } },
                equipment: { select: { id: true, name: true } },
            },
        });
    }
    async grantAuthorization(data, actorId) {
        const auth = await this.prisma.pmWorkerEquipmentAuthorization.create({
            data: Object.assign(Object.assign({}, data), { issuedByUserId: actorId }),
        });
        await this.audit('authorization', auth.id, 'granted', actorId);
        return auth;
    }
    async validateWorkerAuthorization(workerId, equipmentId) {
        const eq = await this.prisma.equipment.findUnique({
            where: { id: equipmentId },
        });
        if (!eq)
            return { authorized: false, reason: 'Equipment not found' };
        const now = new Date();
        const auth = await this.prisma.pmWorkerEquipmentAuthorization.findFirst({
            where: {
                workerId,
                active: true,
                OR: [{ equipmentId }, { equipmentId: null }],
                AND: [
                    {
                        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
                    },
                ],
            },
        });
        return {
            authorized: !!auth,
            authId: auth === null || auth === void 0 ? void 0 : auth.id,
            expiresAt: auth === null || auth === void 0 ? void 0 : auth.expiresAt,
        };
    }
    async validateAssignment(input) {
        const eq = await this.getProfile(input.equipmentId);
        const auth = await this.validateWorkerAuthorization(input.workerId, input.equipmentId);
        const now = new Date();
        const certValid = (await this.prisma.pmEquipmentCertification.count({
            where: {
                equipmentId: input.equipmentId,
                status: 'approved',
                OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
            },
        })) > 0 || eq.pmCertifications.length === 0;
        const inspectionCurrent = !eq.nextInspectionAt || eq.nextInspectionAt >= now;
        const underLoto = (await this.prisma.pmEquipmentLoto.count({
            where: {
                equipmentId: input.equipmentId,
                status: { in: ['active', 'verified'] },
            },
        })) > 0;
        const condition = await this.recalculateCondition(input.equipmentId, input.projectId);
        const result = this.assignmentEngine.validate({
            workerId: input.workerId,
            equipmentId: input.equipmentId,
            hasAuthorization: auth.authorized,
            authorizationExpired: false,
            certificationValid: certValid,
            inspectionCurrent,
            conditionScore: condition.score,
            underLoto,
        });
        await this.prisma.pmEquipmentAssignmentAudit.create({
            data: {
                equipmentId: input.equipmentId,
                workerId: input.workerId,
                projectId: input.projectId,
                action: 'validate',
                passedRules: result.allowed,
                ruleFailuresJson: result.failures,
                actorId: input.actorId,
            },
        });
        return result;
    }
    async workerAccessCheck(workerId, projectId) {
        const assignments = await this.prisma.equipmentAssignment.findMany({
            where: { workerId, endedAt: null, equipmentId: { not: null } },
            select: { equipmentId: true },
        });
        let blocked = 0;
        const reasons = [];
        for (const a of assignments) {
            if (!a.equipmentId)
                continue;
            const validation = await this.validateAssignment({
                workerId,
                equipmentId: a.equipmentId,
                projectId,
            });
            if (!validation.allowed) {
                blocked++;
                reasons.push(...validation.failures);
            }
        }
        return {
            allowed: blocked === 0,
            blockedEquipmentCount: blocked,
            reasons: [...new Set(reasons)].slice(0, 10),
        };
    }
    async analytics(projectId) {
        var _a, _b;
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        const equipmentIds = (await this.prisma.equipmentProjectAssignment.findMany({
            where: { projectId, endedAt: null },
            select: { equipmentId: true },
        })).map((a) => a.equipmentId);
        const now = new Date();
        const [total, lockedOut, overdueInspection, expiredCerts, openFailures, avgCondition, insights,] = await Promise.all([
            equipmentIds.length,
            this.prisma.equipment.count({
                where: {
                    id: { in: equipmentIds },
                    operationalStatus: 'locked_out',
                },
            }),
            this.prisma.equipment.count({
                where: {
                    id: { in: equipmentIds },
                    nextInspectionAt: { lt: now },
                },
            }),
            this.prisma.pmEquipmentCertification.count({
                where: {
                    equipmentId: { in: equipmentIds },
                    status: 'expired',
                },
            }),
            this.prisma.pmEquipmentFailure.count({
                where: {
                    equipmentId: { in: equipmentIds },
                    status: { notIn: ['closed', 'verified'] },
                },
            }),
            this.prisma.pmEquipmentConditionScore.aggregate({
                where: { equipmentId: { in: equipmentIds } },
                _avg: { score: true },
            }),
            this.cail.projectInsights(projectId),
        ]);
        const projectScore = (_a = avgCondition._avg.score) !== null && _a !== void 0 ? _a : 100;
        const since90 = new Date(now.getTime() - 90 * 86400000);
        const failures90d = await this.prisma.pmEquipmentFailure.count({
            where: {
                equipmentId: { in: equipmentIds },
                createdAt: { gte: since90 },
            },
        });
        const failureByType = await this.prisma.pmEquipmentFailure.groupBy({
            by: ['failureType'],
            where: { equipmentId: { in: equipmentIds }, createdAt: { gte: since90 } },
            _count: true,
        });
        return {
            equipmentCount: total,
            lockedOut,
            overdueInspection,
            expiredCerts,
            openFailures,
            avgConditionScore: Math.round((_b = avgCondition._avg.score) !== null && _b !== void 0 ? _b : 0),
            projectEquipmentScore: Math.round(projectScore),
            certificationCompliancePct: total > 0 ? Math.round(((total - expiredCerts) / total) * 100) : 100,
            inspectionCompliancePct: total > 0
                ? Math.round(((total - overdueInspection) / total) * 100)
                : 100,
            equipmentComplianceScore: Math.round(projectScore),
            trends: {
                failures90d,
                failureByType,
                lockoutRate90d: total > 0 ? lockedOut / total : 0,
            },
            leadingIndicators: {
                failureRate: total > 0 ? openFailures / total : 0,
                lockoutRate: total > 0 ? lockedOut / total : 0,
                inspectionCompliancePct: total > 0
                    ? Math.round(((total - overdueInspection) / total) * 100)
                    : 100,
            },
            cailInsights: insights,
        };
    }
    async syncBundle(projectId) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        const equipment = await this.listProfiles({
            companyId: project.companyId,
            projectId,
        });
        const authorizations = await this.listAuthorizations({
            companyId: project.companyId,
        });
        return {
            syncedAt: new Date().toISOString(),
            projectId,
            equipment,
            authorizations,
        };
    }
    async applyOfflineSync(projectId, payload, actorId) {
        var _a, _b;
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        const counts = { inspections: 0, loto: 0, failures: 0, auths: 0 };
        for (const f of (_a = payload.failures) !== null && _a !== void 0 ? _a : []) {
            const clientSyncId = f.clientSyncId;
            if (clientSyncId) {
                const exists = await this.prisma.pmEquipmentFailure.findUnique({
                    where: { clientSyncId },
                });
                if (exists)
                    continue;
            }
            await this.reportFailure({
                companyId: project.companyId,
                projectId,
                equipmentId: f.equipmentId,
                failureType: f.failureType,
                title: f.title,
                description: f.description,
                clientSyncId,
            }, actorId);
            counts.failures++;
        }
        for (const l of (_b = payload.lotoCreates) !== null && _b !== void 0 ? _b : []) {
            const clientSyncId = l.clientSyncId;
            if (clientSyncId) {
                const exists = await this.prisma.pmEquipmentLoto.findUnique({
                    where: { clientSyncId },
                });
                if (exists)
                    continue;
            }
            await this.createLoto({
                companyId: project.companyId,
                equipmentId: l.equipmentId,
                reason: l.reason,
                stepsJson: l.stepsJson,
                clientSyncId,
            }, actorId);
            counts.loto++;
        }
        return counts;
    }
    async stationPayload(companyId) {
        const equipment = await this.prisma.equipment.findMany({
            where: { companyId, deletedAt: null },
            select: {
                id: true,
                name: true,
                operationalStatus: true,
                lockoutStatus: true,
                nextInspectionAt: true,
                complianceStatus: true,
            },
            take: 500,
        });
        const activeLoto = await this.prisma.pmEquipmentLoto.findMany({
            where: { companyId, status: { in: ['active', 'verified'] } },
            take: 100,
        });
        return {
            generatedAt: new Date().toISOString(),
            equipment,
            activeLoto,
            inspectionReminders: equipment.filter((e) => e.nextInspectionAt &&
                e.nextInspectionAt < new Date(Date.now() + 7 * 86400000)),
        };
    }
};
exports.PmEquipmentSafetyService = PmEquipmentSafetyService;
exports.PmEquipmentSafetyService = PmEquipmentSafetyService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        equipment_compliance_service_1.EquipmentComplianceService,
        pm_equipment_cail_intelligence_service_1.PmEquipmentCailIntelligenceService,
        pm_capa_auto_generate_service_1.PmCapaAutoGenerateService])
], PmEquipmentSafetyService);
//# sourceMappingURL=pm-equipment-safety.service.js.map