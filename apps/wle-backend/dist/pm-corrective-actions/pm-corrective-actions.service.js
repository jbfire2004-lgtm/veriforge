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
exports.PmCorrectiveActionsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const prisma_errors_1 = require("../common/prisma-errors");
const cail_emitter_service_1 = require("../safety-intelligence/cail/cail-emitter.service");
const inactivation_service_1 = require("../modules/vera-core/inactivation.service");
const capa_priority_engine_1 = require("./capa-priority.engine");
const capa_due_date_engine_1 = require("./capa-due-date.engine");
const capa_assignment_engine_1 = require("./capa-assignment.engine");
const capa_escalation_engine_1 = require("./capa-escalation.engine");
const capa_verification_engine_1 = require("./capa-verification.engine");
const pm_capa_constants_1 = require("./pm-capa.constants");
const includeDetail = {
    cailEntry: {
        select: { id: true, status: true, severity: true, dueDate: true },
    },
    assignees: { include: { user: { select: { id: true, username: true } } } },
    escalations: { orderBy: { triggeredAt: 'desc' }, take: 10 },
    verifications: { orderBy: { verifiedAt: 'desc' }, take: 5 },
    attachments: true,
    project: { select: { id: true, name: true } },
    equipment: { select: { id: true, name: true } },
};
let PmCorrectiveActionsService = class PmCorrectiveActionsService {
    constructor(prisma, emitter, priority, dueDate, assignment, escalation, verification, inactivation) {
        this.prisma = prisma;
        this.emitter = emitter;
        this.priority = priority;
        this.dueDate = dueDate;
        this.assignment = assignment;
        this.escalation = escalation;
        this.verification = verification;
        this.inactivation = inactivation;
    }
    async audit(actionId, eventType, actorId, payload) {
        await this.prisma.pmCorrectiveActionAuditLog.create({
            data: {
                actionId,
                eventType,
                actorId,
                payload: payload,
            },
        });
    }
    async getCompanyConfig(companyId) {
        return this.prisma.pmCapaCompanyConfig.upsert({
            where: { companyId },
            create: { companyId },
            update: {},
        });
    }
    async list(filters) {
        const now = new Date();
        return this.prisma.pmCorrectiveAction.findMany({
            where: Object.assign(Object.assign(Object.assign(Object.assign({ deletedAt: null }, (filters.projectId ? { projectId: filters.projectId } : {})), (filters.companyId ? { companyId: filters.companyId } : {})), (filters.status ? { status: filters.status } : {})), (filters.overdueOnly
                ? {
                    dueAt: { lt: now },
                    status: {
                        notIn: ['closed', 'verified', 'cancelled'],
                    },
                }
                : {})),
            include: includeDetail,
            orderBy: [{ priorityScore: 'desc' }, { dueAt: 'asc' }],
            take: 200,
        });
    }
    async get(id) {
        const row = await this.prisma.pmCorrectiveAction.findFirst({
            where: { id, deletedAt: null },
            include: Object.assign(Object.assign({}, includeDetail), { auditLogs: { orderBy: { createdAt: 'desc' }, take: 50 } }),
        });
        if (!row)
            throw new common_1.NotFoundException('Corrective action not found');
        return row;
    }
    async create(input) {
        var _a, _b, _c, _d, _e;
        if (input.clientSyncId) {
            const existing = await this.prisma.pmCorrectiveAction.findUnique({
                where: { clientSyncId: input.clientSyncId },
            });
            if (existing)
                return this.get(existing.id);
        }
        const config = await this.getCompanyConfig(input.companyId);
        const severity = ((_a = input.severity) !== null && _a !== void 0 ? _a : 'medium');
        const actionType = (_b = input.actionType) !== null && _b !== void 0 ? _b : 'permanent';
        const scores = this.priority.score({
            severity,
            actionType,
            sifLinked: input.sifLinked,
            hecaLinked: input.hecaLinked,
            equipmentUnsafe: !!input.equipmentId && input.sourceModule === 'equipment',
        });
        const dueAt = this.dueDate.computeDueAt(severity, {
            dueDaysLow: config.dueDaysLow,
            dueDaysMedium: config.dueDaysMedium,
            dueDaysHigh: config.dueDaysHigh,
            dueDaysCritical: config.dueDaysCritical,
        });
        const cailSource = ((_c = pm_capa_constants_1.SOURCE_MODULE_TO_CAIL[input.sourceModule]) !== null && _c !== void 0 ? _c : 'general');
        const cailEntry = await this.emitter.emit({
            projectId: input.projectId,
            ownerCompanyId: input.companyId,
            sourceType: cailSource,
            sourceId: input.sourceId,
            sourceItemId: (_d = input.sourceItemId) !== null && _d !== void 0 ? _d : `pm-capa-${Date.now()}`,
            title: input.title.slice(0, 120),
            description: input.description,
            severity,
            createdByUserId: input.createdByUserId,
            assignedUserId: input.assignUserId,
            siteId: input.siteId,
            equipmentId: input.equipmentId,
            workerId: input.workerId,
            dueDate: dueAt,
            tags: ['pm-capa', input.sourceModule],
        });
        const status = input.publish === false
            ? 'draft'
            : input.assignUserId
                ? 'assigned'
                : 'open';
        let action;
        try {
            action = await this.prisma.pmCorrectiveAction.create({
                data: {
                    cailEntryId: cailEntry.id,
                    companyId: input.companyId,
                    projectId: input.projectId,
                    siteId: input.siteId,
                    sourceModule: input.sourceModule,
                    sourceId: input.sourceId,
                    sourceItemId: (_e = input.sourceItemId) !== null && _e !== void 0 ? _e : '',
                    deficiencyId: input.deficiencyId,
                    actionType,
                    status,
                    title: input.title,
                    description: input.description,
                    severityScore: scores.severityScore,
                    priorityScore: scores.priorityScore,
                    dueAt,
                    equipmentId: input.equipmentId,
                    workerId: input.workerId,
                    subcontractorCompanyId: input.subcontractorCompanyId,
                    createdByUserId: input.createdByUserId,
                    clientSyncId: input.clientSyncId,
                },
                include: includeDetail,
            });
        }
        catch (err) {
            const replayed = await (0, prisma_errors_1.replayOrConflict)(err, async () => {
                if (!input.clientSyncId)
                    return null;
                return this.prisma.pmCorrectiveAction.findUnique({
                    where: { clientSyncId: input.clientSyncId },
                });
            });
            return this.get(replayed.id);
        }
        if (input.assignUserId) {
            await this.assign(action.id, { userId: input.assignUserId, role: 'primary' }, input.createdByUserId);
        }
        await this.audit(action.id, 'created', input.createdByUserId, { scores });
        return this.get(action.id);
    }
    async assign(actionId, data, actorId) {
        var _a;
        const action = await this.get(actionId);
        await this.prisma.pmCorrectiveActionAssignee.create({
            data: {
                actionId,
                userId: data.userId,
                workerId: data.workerId,
                role: (_a = data.role) !== null && _a !== void 0 ? _a : 'primary',
            },
        });
        if (data.userId) {
            await this.prisma.cailEntry.update({
                where: { id: action.cailEntryId },
                data: { assignedUserId: data.userId, status: 'in_progress' },
            });
        }
        await this.prisma.pmCorrectiveAction.update({
            where: { id: actionId },
            data: { status: 'assigned' },
        });
        await this.audit(actionId, 'assigned', actorId, data);
        return this.get(actionId);
    }
    async delegate(actionId, toUserId, actorId) {
        return this.assign(actionId, { userId: toUserId, role: 'delegate' }, actorId);
    }
    async updateDraft(actionId, data, actorId) {
        const action = await this.get(actionId);
        if (!['draft', 'open', 'assigned', 'in_progress'].includes(action.status)) {
            throw new common_1.BadRequestException('Only open corrective actions can be edited');
        }
        await this.prisma.pmCorrectiveAction.update({
            where: { id: actionId },
            data: Object.assign(Object.assign({}, (data.title != null ? { title: data.title } : {})), (data.description != null ? { description: data.description } : {})),
        });
        await this.audit(actionId, 'draft_updated', actorId, data);
        return this.get(actionId);
    }
    async markInProgress(actionId, actorId) {
        await this.prisma.pmCorrectiveAction.update({
            where: { id: actionId },
            data: { status: 'in_progress' },
        });
        await this.prisma.cailEntry.update({
            where: { id: (await this.get(actionId)).cailEntryId },
            data: { status: 'in_progress' },
        });
        await this.audit(actionId, 'in_progress', actorId);
        return this.get(actionId);
    }
    async submitForVerification(actionId, actorId) {
        await this.prisma.pmCorrectiveAction.update({
            where: { id: actionId },
            data: { status: 'verification_pending' },
        });
        await this.audit(actionId, 'verification_requested', actorId);
        return this.get(actionId);
    }
    async verify(actionId, input, verifierUserId) {
        var _a;
        this.verification.assertRole(input.role);
        const action = await this.get(actionId);
        await this.prisma.pmCorrectiveActionVerification.create({
            data: {
                actionId,
                verifierUserId,
                role: input.role,
                outcome: input.outcome,
                notes: input.notes,
                evidenceJson: ((_a = input.evidenceJson) !== null && _a !== void 0 ? _a : []),
            },
        });
        const nextStatus = this.verification.nextStatus(input.outcome);
        if (input.outcome === 'approve') {
            await this.prisma.pmCorrectiveAction.update({
                where: { id: actionId },
                data: {
                    status: 'verified',
                    verifiedAt: new Date(),
                    verifiedByUserId: verifierUserId,
                    closedAt: new Date(),
                },
            });
            await this.prisma.cailEntry.update({
                where: { id: action.cailEntryId },
                data: {
                    status: 'verified',
                    verifiedAt: new Date(),
                    verifiedByUserId: verifierUserId,
                    closedAt: new Date(),
                },
            });
            if (action.deficiencyId) {
                await this.prisma.pmInspectionDeficiency.update({
                    where: { id: action.deficiencyId },
                    data: {
                        status: 'closed',
                        verifiedAt: new Date(),
                        closedAt: new Date(),
                    },
                });
            }
            if (action.equipmentId) {
                await this.tryUnblockEquipment(action.equipmentId, verifierUserId);
            }
        }
        else {
            await this.prisma.pmCorrectiveAction.update({
                where: { id: actionId },
                data: { status: 'in_progress' },
            });
            await this.prisma.cailEntry.update({
                where: { id: action.cailEntryId },
                data: { status: 'in_progress' },
            });
        }
        await this.audit(actionId, `verify_${input.outcome}`, verifierUserId, input);
        return this.get(actionId);
    }
    async tryUnblockEquipment(equipmentId, userId) {
        const openCapa = await this.prisma.pmCorrectiveAction.count({
            where: {
                equipmentId,
                status: { notIn: ['verified', 'closed', 'cancelled'] },
            },
        });
        if (openCapa > 0)
            return;
        const equipment = await this.prisma.equipment.findUnique({
            where: { id: equipmentId },
        });
        if (!(equipment === null || equipment === void 0 ? void 0 : equipment.lockedOutAt))
            return;
        await this.prisma.equipment.update({
            where: { id: equipmentId },
            data: {
                safetyStatus: client_1.EquipmentSafetyStatus.OK,
                lockedOutAt: null,
                lockoutReason: null,
            },
        });
        await this.prisma.equipmentLockout.updateMany({
            where: { equipmentId, unlockedAt: null },
            data: { unlockedAt: new Date(), unlockedByUserId: userId },
        });
    }
    async runEscalations(projectId) {
        const open = await this.prisma.pmCorrectiveAction.findMany({
            where: {
                projectId,
                deletedAt: null,
                status: { notIn: ['closed', 'verified', 'cancelled', 'draft'] },
            },
        });
        const triggered = [];
        for (const action of open) {
            const trig = this.escalation.evaluate({
                dueAt: action.dueAt,
                severity: action.severityScore >= 75
                    ? 'critical'
                    : action.severityScore >= 50
                        ? 'high'
                        : 'medium',
                sifLinked: action.sourceModule === 'sif_heca',
                hecaLinked: !!action.sourceModule,
                equipmentUnsafe: !!action.equipmentId,
                currentLevel: action.escalationLevel,
                status: action.status,
            });
            if (!trig || trig.level <= action.escalationLevel)
                continue;
            await this.prisma.pmCorrectiveActionEscalation.create({
                data: {
                    actionId: action.id,
                    level: trig.level,
                    reason: trig.reason,
                },
            });
            await this.prisma.pmCorrectiveAction.update({
                where: { id: action.id },
                data: {
                    escalationLevel: trig.level,
                    overdueAt: action.dueAt && action.dueAt < new Date()
                        ? new Date()
                        : action.overdueAt,
                },
            });
            await this.prisma.cailEntry.update({
                where: { id: action.cailEntryId },
                data: { status: 'overdue' },
            });
            if (action.equipmentId && trig.level >= 3) {
                await this.inactivation.lockoutEquipment(action.equipmentId, `Overdue CAPA: ${action.title}`);
            }
            triggered.push(Object.assign({ actionId: action.id }, trig));
        }
        return triggered;
    }
    async addAttachment(actionId, data, actorId) {
        await this.get(actionId);
        const att = await this.prisma.pmCorrectiveActionAttachment.create({
            data: Object.assign({ actionId }, data),
        });
        await this.audit(actionId, 'attachment_added', actorId, {
            attachmentId: att.id,
        });
        return att;
    }
    async addSignature(actionId, data, actorId) {
        var _a;
        await this.get(actionId);
        const sig = await this.prisma.pmCorrectiveActionSignature.create({
            data: {
                actionId,
                role: data.role,
                signatureData: data.signatureData,
                signerUserId: (_a = data.signerUserId) !== null && _a !== void 0 ? _a : actorId,
            },
        });
        await this.audit(actionId, 'signature_added', actorId);
        return sig;
    }
    async workerAccessCheck(workerId, projectId) {
        const openWhere = {
            projectId,
            deletedAt: null,
            status: {
                notIn: [
                    'verified',
                    'closed',
                    'cancelled',
                ],
            },
        };
        const openAssigned = await this.prisma.pmCorrectiveAction.count({
            where: Object.assign(Object.assign({}, openWhere), { OR: [{ workerId }, { assignees: { some: { workerId } } }] }),
        });
        const criticalOpen = await this.prisma.pmCorrectiveAction.count({
            where: Object.assign(Object.assign({}, openWhere), { severityScore: { gte: 75 }, OR: [{ workerId }, { assignees: { some: { workerId } } }] }),
        });
        const overdue = await this.prisma.pmCorrectiveAction.count({
            where: Object.assign(Object.assign({}, openWhere), { dueAt: { lt: new Date() }, OR: [{ workerId }, { assignees: { some: { workerId } } }] }),
        });
        const allowed = openAssigned === 0 && criticalOpen === 0 && overdue === 0;
        return {
            allowed,
            openAssigned,
            criticalOpen,
            overdueCount: overdue,
        };
    }
    async analytics(projectId) {
        const [total, open, overdue, verified] = await Promise.all([
            this.prisma.pmCorrectiveAction.count({
                where: { projectId, deletedAt: null },
            }),
            this.prisma.pmCorrectiveAction.count({
                where: {
                    projectId,
                    deletedAt: null,
                    status: { notIn: ['verified', 'closed', 'cancelled'] },
                },
            }),
            this.prisma.pmCorrectiveAction.count({
                where: {
                    projectId,
                    deletedAt: null,
                    dueAt: { lt: new Date() },
                    status: { notIn: ['verified', 'closed', 'cancelled'] },
                },
            }),
            this.prisma.pmCorrectiveAction.count({
                where: { projectId, status: { in: ['verified', 'closed'] } },
            }),
        ]);
        const byType = await this.prisma.pmCorrectiveAction.groupBy({
            by: ['actionType'],
            where: { projectId, deletedAt: null },
            _count: true,
        });
        return {
            total,
            open,
            overdue,
            verified,
            closureRate: total > 0 ? Math.round((verified / total) * 100) : 100,
            byType,
            leadingIndicatorScore: Math.max(0, 100 - overdue * 5 - open),
        };
    }
    async syncOffline(payload) {
        var _a;
        const existing = await this.prisma.pmCorrectiveAction.findUnique({
            where: { clientSyncId: payload.clientSyncId },
        });
        if (existing)
            return this.get(existing.id);
        return this.create(Object.assign(Object.assign({}, payload), { publish: (_a = payload.publish) !== null && _a !== void 0 ? _a : true }));
    }
};
exports.PmCorrectiveActionsService = PmCorrectiveActionsService;
exports.PmCorrectiveActionsService = PmCorrectiveActionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cail_emitter_service_1.CailEmitterService,
        capa_priority_engine_1.CapaPriorityEngine,
        capa_due_date_engine_1.CapaDueDateEngine,
        capa_assignment_engine_1.CapaAssignmentEngine,
        capa_escalation_engine_1.CapaEscalationEngine,
        capa_verification_engine_1.CapaVerificationEngine,
        inactivation_service_1.InactivationService])
], PmCorrectiveActionsService);
//# sourceMappingURL=pm-corrective-actions.service.js.map