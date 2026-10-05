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
exports.PmContractorPortalInboxService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const pm_inspection_contractor_dispatch_service_1 = require("../pm-inspections/pm-inspection-contractor-dispatch.service");
const pm_corrective_actions_service_1 = require("../pm-corrective-actions/pm-corrective-actions.service");
const pm_contractor_portal_access_service_1 = require("./pm-contractor-portal-access.service");
const safety_ecosystem_events_service_1 = require("../pm-safety-ecosystem/safety-ecosystem-events.service");
let PmContractorPortalInboxService = class PmContractorPortalInboxService {
    constructor(prisma, access, dispatch, capa, ecosystem) {
        this.prisma = prisma;
        this.access = access;
        this.dispatch = dispatch;
        this.capa = capa;
        this.ecosystem = ecosystem;
    }
    async listInbox(actor, opts) {
        const contractorCompanyId = this.access.requireContractorCompany(actor);
        const dispatches = await this.prisma.pmInspectionContractorDispatch.findMany({
            where: Object.assign(Object.assign({ subcontractorCompanyId: contractorCompanyId }, ((opts === null || opts === void 0 ? void 0 : opts.status)
                ? { status: opts.status }
                : { status: { notIn: ['cancelled'] } })), ((opts === null || opts === void 0 ? void 0 : opts.overdueOnly)
                ? {
                    overdueAt: { lt: new Date() },
                    status: {
                        in: ['sent', 'acknowledged', 'in_progress', 'overdue'],
                    },
                }
                : {})),
            include: {
                correctiveAction: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        status: true,
                        severityLevel: true,
                        dueAt: true,
                        projectId: true,
                        project: { select: { id: true, name: true } },
                        attachments: { orderBy: { createdAt: 'desc' }, take: 5 },
                    },
                },
                subcontractorCompany: { select: { id: true, name: true } },
            },
            orderBy: [{ overdueAt: 'asc' }, { sentAt: 'desc' }],
            take: 100,
        });
        const now = new Date();
        const summary = {
            total: dispatches.length,
            overdue: dispatches.filter((d) => d.overdueAt &&
                d.overdueAt < now &&
                !['completed', 'cancelled'].includes(d.status)).length,
            pendingAck: dispatches.filter((d) => d.status === 'sent').length,
        };
        const capaIds = dispatches.map((d) => d.correctiveActionId);
        const riskContexts = capaIds.length > 0
            ? await this.prisma.pmSmsRiskContext.findMany({
                where: {
                    entityType: 'corrective_action',
                    entityId: { in: capaIds },
                },
            })
            : [];
        const riskByCapa = new Map(riskContexts.map((r) => [r.entityId, r]));
        const items = dispatches.map((d) => {
            var _a, _b, _c;
            const pkg = d.packageJson;
            return Object.assign(Object.assign({}, d), { inspectionId: (_a = pkg === null || pkg === void 0 ? void 0 : pkg.inspectionId) !== null && _a !== void 0 ? _a : null, sourcePhotos: (_b = pkg === null || pkg === void 0 ? void 0 : pkg.photos) !== null && _b !== void 0 ? _b : [], smsRiskContext: (_c = riskByCapa.get(d.correctiveActionId)) !== null && _c !== void 0 ? _c : null });
        });
        return { summary, items };
    }
    async acknowledgeDispatch(actor, dispatchId) {
        var _a, _b;
        const row = await this.access.assertDispatchAccess(actor, dispatchId);
        const result = await this.dispatch.acknowledge(dispatchId, actor.userId);
        const capa = row.correctiveAction;
        (_a = this.ecosystem) === null || _a === void 0 ? void 0 : _a.emitContractorPortalActivity({
            dispatchId,
            companyId: capa.companyId,
            projectId: (_b = capa.projectId) !== null && _b !== void 0 ? _b : undefined,
            activity: 'acknowledged',
            actorId: actor.userId,
        });
        return result;
    }
    async uploadEvidence(actor, dispatchId, body) {
        var _a, _b;
        const row = await this.access.assertDispatchAccess(actor, dispatchId);
        const attachment = await this.capa.addAttachment(row.correctiveActionId, {
            dataUrl: body.dataUrl,
            storageKey: body.storageKey,
            fileName: (_a = body.fileName) !== null && _a !== void 0 ? _a : 'contractor_evidence',
            mimeType: (_b = body.mimeType) !== null && _b !== void 0 ? _b : 'image/jpeg',
            phase: 'contractor_evidence',
        }, actor.userId);
        if (row.status === 'sent' || row.status === 'acknowledged') {
            await this.prisma.pmInspectionContractorDispatch.update({
                where: { id: dispatchId },
                data: { status: client_1.PmContractorDispatchStatus.in_progress },
            });
        }
        if (body.notes) {
            await this.prisma.pmCorrectiveActionAuditLog.create({
                data: {
                    actionId: row.correctiveActionId,
                    eventType: 'contractor.evidence_uploaded',
                    actorId: actor.userId,
                    payload: {
                        dispatchId,
                        notes: body.notes,
                        attachmentId: attachment.id,
                    },
                },
            });
        }
        return attachment;
    }
    async completeDispatch(actor, dispatchId, proof) {
        var _a, _b, _c, _d;
        const row = await this.access.assertDispatchAccess(actor, dispatchId);
        const result = await this.dispatch.complete(dispatchId, actor.userId, {
            storageKey: proof === null || proof === void 0 ? void 0 : proof.storageKey,
            dataUrl: proof === null || proof === void 0 ? void 0 : proof.dataUrl,
            fileName: proof === null || proof === void 0 ? void 0 : proof.fileName,
            mimeType: proof === null || proof === void 0 ? void 0 : proof.mimeType,
            notes: proof === null || proof === void 0 ? void 0 : proof.notes,
        });
        const action = await this.prisma.pmCorrectiveAction.findUnique({
            where: { id: row.correctiveActionId },
            select: { companyId: true, projectId: true },
        });
        if (action) {
            (_a = this.ecosystem) === null || _a === void 0 ? void 0 : _a.emitContractorPortalActivity({
                dispatchId,
                companyId: action.companyId,
                projectId: (_b = action.projectId) !== null && _b !== void 0 ? _b : undefined,
                activity: 'completed',
                actorId: actor.userId,
            });
            (_c = this.ecosystem) === null || _c === void 0 ? void 0 : _c.emitCapaStatusChanged({
                actionId: row.correctiveActionId,
                companyId: action.companyId,
                projectId: (_d = action.projectId) !== null && _d !== void 0 ? _d : undefined,
                status: 'verification_pending',
                actorId: actor.userId,
            });
        }
        return result;
    }
};
exports.PmContractorPortalInboxService = PmContractorPortalInboxService;
exports.PmContractorPortalInboxService = PmContractorPortalInboxService = __decorate([
    (0, common_1.Injectable)(),
    __param(4, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pm_contractor_portal_access_service_1.PmContractorPortalAccessService,
        pm_inspection_contractor_dispatch_service_1.PmInspectionContractorDispatchService,
        pm_corrective_actions_service_1.PmCorrectiveActionsService,
        safety_ecosystem_events_service_1.SafetyEcosystemEventsService])
], PmContractorPortalInboxService);
//# sourceMappingURL=pm-contractor-portal-inbox.service.js.map