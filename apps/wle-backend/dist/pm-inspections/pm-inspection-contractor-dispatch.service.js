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
exports.PmInspectionContractorDispatchService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const event_bus_service_1 = require("../modules/api-platform/events/event-bus.service");
const domain_events_1 = require("../modules/api-platform/events/domain-events");
const inspection_notification_templates_1 = require("./inspection-notification.templates");
let PmInspectionContractorDispatchService = class PmInspectionContractorDispatchService {
    constructor(prisma, notifications, eventBus) {
        this.prisma = prisma;
        this.notifications = notifications;
        this.eventBus = eventBus;
    }
    async dispatchForCorrectiveAction(correctiveActionId, actorId, clientSyncId) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const action = await this.prisma.pmCorrectiveAction.findFirst({
            where: { id: correctiveActionId, deletedAt: null },
            include: {
                project: { select: { name: true } },
                attachments: true,
            },
        });
        if (!action)
            throw new common_1.NotFoundException('Corrective action not found');
        if (!action.subcontractorCompanyId) {
            throw new common_1.NotFoundException('Corrective action has no subcontractor assigned');
        }
        const finding = await this.prisma.pmInspectionPhotoFinding.findFirst({
            where: { correctiveActionId },
            include: { attachment: true, inspection: true },
        });
        const subcontractor = await this.prisma.company.findUnique({
            where: { id: action.subcontractorCompanyId },
            select: { id: true, name: true },
        });
        const packageJson = {
            correctiveActionId: action.id,
            title: action.title,
            description: action.description,
            severity: action.severityLevel,
            dueAt: (_a = action.dueAt) === null || _a === void 0 ? void 0 : _a.toISOString(),
            evidenceRequirements: action.evidenceRequirementsJson,
            photos: [
                ...((finding === null || finding === void 0 ? void 0 : finding.attachment)
                    ? [
                        {
                            id: finding.attachment.id,
                            dataUrl: finding.attachment.dataUrl,
                            fileName: finding.attachment.fileName,
                        },
                    ]
                    : []),
                ...action.attachments.map((a) => ({
                    id: a.id,
                    storageKey: a.storageKey,
                    fileName: a.fileName,
                })),
            ],
            inspectionId: (_b = finding === null || finding === void 0 ? void 0 : finding.inspectionId) !== null && _b !== void 0 ? _b : action.sourceId,
            dispatchedByUserId: actorId,
            dispatchedAt: new Date().toISOString(),
        };
        const existing = await this.prisma.pmInspectionContractorDispatch.findFirst({
            where: {
                correctiveActionId,
                status: { notIn: ['cancelled', 'completed'] },
            },
        });
        const dispatch = existing
            ? await this.prisma.pmInspectionContractorDispatch.update({
                where: { id: existing.id },
                data: {
                    packageJson: packageJson,
                    status: client_1.PmContractorDispatchStatus.sent,
                    sentAt: new Date(),
                    overdueAt: action.dueAt,
                },
            })
            : await this.prisma.pmInspectionContractorDispatch.create({
                data: {
                    correctiveActionId,
                    subcontractorCompanyId: action.subcontractorCompanyId,
                    status: client_1.PmContractorDispatchStatus.sent,
                    packageJson: packageJson,
                    sentAt: new Date(),
                    overdueAt: action.dueAt,
                    clientSyncId,
                },
            });
        const notificationIds = await this.notifyContractorUsers(action.subcontractorCompanyId, inspection_notification_templates_1.INSPECTION_NOTIFICATION_TEMPLATES.contractorDispatchSent({
            inspectionId: (_c = finding === null || finding === void 0 ? void 0 : finding.inspectionId) !== null && _c !== void 0 ? _c : action.sourceId,
            projectName: (_d = action.project) === null || _d === void 0 ? void 0 : _d.name,
            findingTitle: action.title,
            severity: action.severityLevel,
            dueAt: (_e = action.dueAt) === null || _e === void 0 ? void 0 : _e.toISOString(),
            correctiveActionId: action.id,
            dispatchId: dispatch.id,
            contractorName: (_f = subcontractor === null || subcontractor === void 0 ? void 0 : subcontractor.name) !== null && _f !== void 0 ? _f : 'Contractor',
        }));
        if (notificationIds.length) {
            await this.prisma.pmInspectionContractorDispatch.update({
                where: { id: dispatch.id },
                data: { notificationIds: notificationIds },
            });
        }
        await this.prisma.pmCorrectiveAction.update({
            where: { id: action.id },
            data: { status: 'assigned' },
        });
        (_g = this.eventBus) === null || _g === void 0 ? void 0 : _g.emit({
            name: domain_events_1.DomainEvent.CONTRACTOR_DISPATCH_SENT,
            occurredAt: new Date().toISOString(),
            actorId,
            companyId: action.companyId,
            projectId: (_h = action.projectId) !== null && _h !== void 0 ? _h : undefined,
            entityType: 'contractor_dispatch',
            entityId: dispatch.id,
            data: {
                correctiveActionId: action.id,
                subcontractorCompanyId: action.subcontractorCompanyId,
            },
        });
        return { dispatch, package: packageJson };
    }
    async acknowledge(dispatchId, userId) {
        const row = await this.prisma.pmInspectionContractorDispatch.update({
            where: { id: dispatchId },
            data: {
                status: client_1.PmContractorDispatchStatus.acknowledged,
                acknowledgedAt: new Date(),
            },
        });
        await this.prisma.pmCorrectiveActionAuditLog.create({
            data: {
                actionId: row.correctiveActionId,
                eventType: 'contractor.acknowledged',
                actorId: userId,
                payload: { dispatchId },
            },
        });
        return row;
    }
    async complete(dispatchId, userId, proof) {
        var _a, _b, _c, _d, _e, _f, _g;
        const dispatch = await this.prisma.pmInspectionContractorDispatch.findUnique({
            where: { id: dispatchId },
            include: {
                correctiveAction: {
                    include: { project: { select: { name: true } } },
                },
            },
        });
        if (!dispatch)
            throw new common_1.NotFoundException('Dispatch not found');
        const finding = await this.prisma.pmInspectionPhotoFinding.findFirst({
            where: { correctiveActionId: dispatch.correctiveActionId },
            include: {
                attachment: true,
                inspection: {
                    select: {
                        id: true,
                        inspectorUserId: true,
                        title: true,
                        projectId: true,
                        companyId: true,
                    },
                },
            },
        });
        const row = await this.prisma.pmInspectionContractorDispatch.update({
            where: { id: dispatchId },
            data: {
                status: client_1.PmContractorDispatchStatus.completed,
                completedAt: new Date(),
                packageJson: Object.assign(Object.assign({}, dispatch.packageJson), { completionNotes: proof === null || proof === void 0 ? void 0 : proof.notes, completedByUserId: userId }),
            },
            include: { correctiveAction: true },
        });
        if ((proof === null || proof === void 0 ? void 0 : proof.storageKey) || (proof === null || proof === void 0 ? void 0 : proof.dataUrl)) {
            await this.prisma.pmCorrectiveActionAttachment.create({
                data: {
                    actionId: row.correctiveActionId,
                    storageKey: proof.storageKey,
                    dataUrl: proof.dataUrl,
                    fileName: (_a = proof.fileName) !== null && _a !== void 0 ? _a : 'contractor_completion_proof.jpg',
                    mimeType: (_b = proof.mimeType) !== null && _b !== void 0 ? _b : 'image/jpeg',
                    phase: 'completion_proof',
                },
            });
        }
        if ((finding === null || finding === void 0 ? void 0 : finding.inspection) && finding.attachment && (proof === null || proof === void 0 ? void 0 : proof.dataUrl)) {
            await this.prisma.pmInspectionAttachment.create({
                data: {
                    inspectionId: finding.inspection.id,
                    dataUrl: proof.dataUrl,
                    fileName: (_c = proof.fileName) !== null && _c !== void 0 ? _c : 'correction-proof.jpg',
                    mimeType: (_d = proof.mimeType) !== null && _d !== void 0 ? _d : 'image/jpeg',
                    annotationJson: {
                        kind: 'correction_proof',
                        originalAttachmentId: finding.attachment.id,
                        dispatchId,
                        correctiveActionId: row.correctiveActionId,
                        submittedByUserId: userId,
                        notes: proof.notes,
                    },
                },
            });
            await this.prisma.pmInspectionAuditLog.create({
                data: {
                    inspectionId: finding.inspection.id,
                    eventType: 'correction_proof_received',
                    actorId: userId,
                    payload: {
                        dispatchId,
                        originalAttachmentId: finding.attachment.id,
                        correctiveActionId: row.correctiveActionId,
                    },
                },
            });
            const inspector = await this.prisma.user.findUnique({
                where: { id: finding.inspection.inspectorUserId },
                select: { id: true, username: true, email: true },
            });
            if (inspector && this.notifications) {
                await this.notifications.notifyUsers({
                    userIds: [inspector.id],
                    type: inspection_notification_templates_1.INSPECTION_NOTIFICATION_TEMPLATES.correctionProofReceived({
                        inspectionId: finding.inspection.id,
                        projectName: (_e = dispatch.correctiveAction.project) === null || _e === void 0 ? void 0 : _e.name,
                        findingTitle: row.correctiveAction.title,
                        severity: row.correctiveAction.severityLevel,
                        correctiveActionId: row.correctiveActionId,
                        dispatchId,
                    }).type,
                    title: inspection_notification_templates_1.INSPECTION_NOTIFICATION_TEMPLATES.correctionProofReceived({
                        inspectionId: finding.inspection.id,
                        projectName: (_f = dispatch.correctiveAction.project) === null || _f === void 0 ? void 0 : _f.name,
                        findingTitle: row.correctiveAction.title,
                        severity: row.correctiveAction.severityLevel,
                        correctiveActionId: row.correctiveActionId,
                        dispatchId,
                    }).title,
                    body: inspection_notification_templates_1.INSPECTION_NOTIFICATION_TEMPLATES.correctionProofReceived({
                        inspectionId: finding.inspection.id,
                        projectName: (_g = dispatch.correctiveAction.project) === null || _g === void 0 ? void 0 : _g.name,
                        findingTitle: row.correctiveAction.title,
                        severity: row.correctiveAction.severityLevel,
                        correctiveActionId: row.correctiveActionId,
                        dispatchId,
                    }).body,
                    payload: {
                        inspectionId: finding.inspection.id,
                        dispatchId,
                        correctiveActionId: row.correctiveActionId,
                    },
                    dedupeKey: `correction-proof:${dispatchId}`,
                });
            }
        }
        await this.prisma.pmCorrectiveAction.update({
            where: { id: row.correctiveActionId },
            data: { status: 'verification_pending' },
        });
        await this.prisma.pmCorrectiveActionAuditLog.create({
            data: {
                actionId: row.correctiveActionId,
                eventType: 'contractor.completed',
                actorId: userId,
                payload: {
                    dispatchId,
                    proof: { notes: proof === null || proof === void 0 ? void 0 : proof.notes, hasPhoto: !!(proof === null || proof === void 0 ? void 0 : proof.dataUrl) },
                },
            },
        });
        return row;
    }
    async listForContractorCompany(projectId, companyId) {
        return this.prisma.pmInspectionContractorDispatch.findMany({
            where: {
                subcontractorCompanyId: companyId,
                correctiveAction: { projectId },
                status: { not: 'cancelled' },
            },
            include: {
                correctiveAction: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        status: true,
                        dueAt: true,
                        severityLevel: true,
                        sourceId: true,
                    },
                },
                subcontractorCompany: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
    }
    async markOverdueDispatches() {
        var _a;
        const now = new Date();
        const overdue = await this.prisma.pmInspectionContractorDispatch.findMany({
            where: {
                status: { in: ['sent', 'acknowledged', 'in_progress'] },
                overdueAt: { lt: now },
            },
            include: {
                correctiveAction: { include: { project: { select: { name: true } } } },
                subcontractorCompany: { select: { id: true, name: true } },
            },
            take: 50,
        });
        for (const d of overdue) {
            await this.prisma.pmInspectionContractorDispatch.update({
                where: { id: d.id },
                data: { status: client_1.PmContractorDispatchStatus.overdue },
            });
            await this.notifyContractorUsers(d.subcontractorCompanyId, inspection_notification_templates_1.INSPECTION_NOTIFICATION_TEMPLATES.contractorDispatchOverdue({
                inspectionId: d.correctiveAction.sourceId,
                projectName: (_a = d.correctiveAction.project) === null || _a === void 0 ? void 0 : _a.name,
                findingTitle: d.correctiveAction.title,
                severity: d.correctiveAction.severityLevel,
                correctiveActionId: d.correctiveActionId,
                dispatchId: d.id,
                contractorName: d.subcontractorCompany.name,
            }));
        }
        return { marked: overdue.length };
    }
    async notifyContractorUsers(companyId, template) {
        var _a;
        if (!this.notifications)
            return [];
        const admins = await this.prisma.user.findMany({
            where: {
                companyId,
                role: {
                    in: [
                        'COMPANY_ADMIN',
                        'SUPERVISOR',
                        'PROJECT_MANAGER',
                        'CONTRACTOR_ADMIN',
                        'CONTRACTOR_USER',
                    ],
                },
            },
            select: { id: true },
            take: 20,
        });
        if (!admins.length)
            return [];
        const result = await this.notifications.notifyUsers({
            userIds: admins.map((u) => u.id),
            type: template.type,
            title: template.title,
            body: template.body,
            payload: template.metadata,
            dedupeKey: `inspection-dispatch:${(_a = template.metadata) === null || _a === void 0 ? void 0 : _a.dispatchId}`,
        });
        return result.created > 0 ? admins.map((u) => u.id) : [];
    }
};
exports.PmInspectionContractorDispatchService = PmInspectionContractorDispatchService;
exports.PmInspectionContractorDispatchService = PmInspectionContractorDispatchService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Optional)()),
    __param(2, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService,
        event_bus_service_1.EventBusService])
], PmInspectionContractorDispatchService);
//# sourceMappingURL=pm-inspection-contractor-dispatch.service.js.map