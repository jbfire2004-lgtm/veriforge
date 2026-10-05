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
var PmSafetyWorkflowService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PmSafetyWorkflowService = exports.EVENT_TYPES = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const pm_safety_workflow_actor_policy_1 = require("./pm-safety-workflow.actor-policy");
const pm_safety_workflow_errors_1 = require("./pm-safety-workflow.errors");
const pm_safety_workflow_types_1 = require("./pm-safety-workflow.types");
const pm_safety_workflow_pdf_1 = require("./pm-safety-workflow.pdf");
exports.EVENT_TYPES = {
    STATUS_CHANGE: 'STATUS_CHANGE',
    NOTIFICATION: 'NOTIFICATION',
    PDF_EXPORT: 'PDF_EXPORT',
    WORKER_SIGNATURE: 'WORKER_SIGNATURE',
};
let PmSafetyWorkflowService = PmSafetyWorkflowService_1 = class PmSafetyWorkflowService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(PmSafetyWorkflowService_1.name);
    }
    getDefinition() {
        return {
            version: 1,
            workflow: 'VERA_PM_SAFETY',
            kinds: [
                'PERMIT_TO_WORK',
                'JOB_SAFETY_ANALYSIS',
                'JHA',
                'FLHA',
                'SIF',
                'HECA',
                'ENERGY_WHEEL',
                'INSPECTION',
            ],
            statuses: [
                'DRAFT',
                'SUBMITTED',
                'UNDER_REVIEW',
                'APPROVED',
                'REJECTED',
                'CLOSED',
                'CANCELLED',
            ],
            kindsRequiringWorkerSignBeforeSubmit: pm_safety_workflow_types_1.PM_SAFETY_KINDS_REQUIRING_WORKER_SIGN,
            transitions: pm_safety_workflow_types_1.PM_SAFETY_TRANSITIONS,
            notificationChannels: ['EMAIL_STUB', 'SMS_STUB', 'IN_APP_STUB'],
            permissionHints: {
                workerSignRoles: ['WORKER', 'ADMIN'],
                supervisorRoles: ['SUPERVISOR', 'ADMIN'],
                projectManagerRoles: ['PROJECT_MANAGER', 'ADMIN'],
                actorHeaders: ['x-pm-actor-user-id', 'x-pm-actor-role'],
            },
        };
    }
    async list(params) {
        return this.prisma.pmSafetyWorkflow.findMany({
            where: {
                companyId: params === null || params === void 0 ? void 0 : params.companyId,
                status: params === null || params === void 0 ? void 0 : params.status,
            },
            orderBy: { updatedAt: 'desc' },
            include: {
                company: { select: { id: true, name: true } },
                site: { select: { id: true, name: true, code: true } },
                workerUser: { select: { id: true, username: true } },
                supervisorUser: { select: { id: true, username: true } },
            },
        });
    }
    async create(dto) {
        var _a, _b, _c;
        this.logger.log(JSON.stringify({
            type: 'pm_safety.create.start',
            title: dto.title,
            kind: (_a = dto.kind) !== null && _a !== void 0 ? _a : 'PERMIT_TO_WORK',
            companyId: (_b = dto.companyId) !== null && _b !== void 0 ? _b : null,
            siteId: (_c = dto.siteId) !== null && _c !== void 0 ? _c : null,
        }));
        const validFrom = dto.validFrom ? new Date(dto.validFrom) : undefined;
        const validTo = dto.validTo ? new Date(dto.validTo) : undefined;
        if (validFrom && Number.isNaN(validFrom.getTime())) {
            throw new common_1.BadRequestException('validFrom is not a valid date');
        }
        if (validTo && Number.isNaN(validTo.getTime())) {
            throw new common_1.BadRequestException('validTo is not a valid date');
        }
        if (validFrom && validTo && validFrom.getTime() > validTo.getTime()) {
            throw new common_1.BadRequestException('validFrom must be before validTo');
        }
        const taskSteps = this.parseTaskStepsJson(dto.taskStepsJson);
        return this.prisma.$transaction(async (tx) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
            const wf = await tx.pmSafetyWorkflow.create({
                data: {
                    title: dto.title.trim(),
                    kind: (_a = dto.kind) !== null && _a !== void 0 ? _a : 'PERMIT_TO_WORK',
                    companyId: (_b = dto.companyId) !== null && _b !== void 0 ? _b : null,
                    siteId: (_c = dto.siteId) !== null && _c !== void 0 ? _c : null,
                    workDescription: (_e = (_d = dto.workDescription) === null || _d === void 0 ? void 0 : _d.trim()) !== null && _e !== void 0 ? _e : null,
                    hazardSummary: (_g = (_f = dto.hazardSummary) === null || _f === void 0 ? void 0 : _f.trim()) !== null && _g !== void 0 ? _g : null,
                    controlMeasures: (_j = (_h = dto.controlMeasures) === null || _h === void 0 ? void 0 : _h.trim()) !== null && _j !== void 0 ? _j : null,
                    jobLocation: (_l = (_k = dto.jobLocation) === null || _k === void 0 ? void 0 : _k.trim()) !== null && _l !== void 0 ? _l : null,
                    taskStepsJson: taskSteps !== null && taskSteps !== void 0 ? taskSteps : undefined,
                    validFrom: validFrom !== null && validFrom !== void 0 ? validFrom : null,
                    validTo: validTo !== null && validTo !== void 0 ? validTo : null,
                },
            });
            await this.appendEventTx(tx, wf.id, exports.EVENT_TYPES.STATUS_CHANGE, null, {
                initial: true,
                status: wf.status,
            });
            await this.createAuditLogTx(tx, {
                action: 'pm_safety.created',
                entity: 'PmSafetyWorkflow',
                entityId: wf.id,
                metadata: {
                    status: wf.status,
                    kind: wf.kind,
                    companyId: wf.companyId,
                    siteId: wf.siteId,
                },
            });
            return wf;
        });
    }
    async findOne(id) {
        const wf = await this.prisma.pmSafetyWorkflow.findUnique({
            where: { id },
            include: {
                company: { select: { id: true, name: true } },
                site: { select: { id: true, name: true, code: true } },
                workerUser: { select: { id: true, username: true } },
                supervisorUser: { select: { id: true, username: true } },
            },
        });
        if (!wf)
            throw new common_1.NotFoundException('Workflow not found');
        return wf;
    }
    async getState(id) {
        const wf = await this.findOne(id);
        const next = pm_safety_workflow_types_1.PM_SAFETY_TRANSITIONS.filter((t) => t.from === wf.status).map((t) => ({
            action: t.action,
            to: t.to,
            label: t.label,
        }));
        return { workflow: wf, availableActions: next };
    }
    async signWorker(id, dto, actor) {
        this.logger.log(JSON.stringify({
            type: 'pm_safety.sign_worker.start',
            workflowId: id,
            actorUserId: actor.userId,
            actorRole: actor.role,
        }));
        this.assertWorkerSignRole(actor);
        const wf = await this.prisma.pmSafetyWorkflow.findUnique({ where: { id } });
        if (!wf)
            throw new common_1.NotFoundException('Workflow not found');
        if (wf.status !== 'DRAFT') {
            throw new common_1.BadRequestException('Worker signature is only allowed while the workflow is in DRAFT');
        }
        const now = new Date();
        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.pmSafetyWorkflow.update({
                where: { id },
                data: {
                    workerUserId: actor.userId,
                    workerSignedAt: now,
                    workerSignatureText: dto.attestationText.trim(),
                },
            });
            await this.appendEventTx(tx, wf.id, exports.EVENT_TYPES.WORKER_SIGNATURE, null, {
                userId: actor.userId,
                signedAt: now.toISOString(),
            });
            await this.createAuditLogTx(tx, {
                action: 'pm_safety.worker_signed',
                entity: 'PmSafetyWorkflow',
                entityId: wf.id,
                metadata: { actorUserId: actor.userId, actorRole: actor.role },
            });
            await this.appendEventTx(tx, wf.id, exports.EVENT_TYPES.NOTIFICATION, 'IN_APP_STUB', {
                template: 'PM_SAFETY_WORKER_SIGNED',
                workflowId: wf.id,
                title: wf.title,
                note: 'Stub: notify responsible party that the worker signed the assessment.',
            });
            return updated;
        });
    }
    async transition(id, action, actor, note) {
        this.logger.log(JSON.stringify({
            type: 'pm_safety.transition.start',
            workflowId: id,
            action,
            actorUserId: actor.userId,
            actorRole: actor.role,
        }));
        const wf = await this.prisma.pmSafetyWorkflow.findUnique({
            where: { id },
        });
        if (!wf)
            throw new common_1.NotFoundException('Workflow not found');
        const edge = (0, pm_safety_workflow_types_1.findTransition)(wf.status, action);
        if (!edge) {
            throw (0, pm_safety_workflow_errors_1.pmSafetyInvalidTransition)({ status: wf.status, action });
        }
        (0, pm_safety_workflow_actor_policy_1.assertActorMayPerformAction)(action, actor.role);
        if (action === 'submit') {
            if (pm_safety_workflow_types_1.PM_SAFETY_KINDS_REQUIRING_WORKER_SIGN.includes(wf.kind) &&
                !wf.workerSignedAt) {
                throw new common_1.BadRequestException({
                    code: 'PM_SAFETY_WORKER_SIGN_REQUIRED',
                    message: `Workflow kind ${wf.kind} requires a worker signature before submit`,
                    kind: wf.kind,
                });
            }
        }
        const now = new Date();
        const extraData = {};
        if (action === 'approve' || action === 'reject') {
            extraData.supervisorUser = { connect: { id: actor.userId } };
            extraData.supervisorApprovedAt = now;
            extraData.supervisorSignatureText =
                (note === null || note === void 0 ? void 0 : note.trim()) ||
                    (action === 'approve'
                        ? 'Supervisor approval recorded in VERA PM'
                        : 'Supervisor rejection recorded in VERA PM');
        }
        return this.prisma.$transaction(async (tx) => {
            var _a;
            const updated = await tx.pmSafetyWorkflow.update({
                where: { id },
                data: Object.assign({ status: edge.to }, extraData),
            });
            await this.appendEventTx(tx, wf.id, exports.EVENT_TYPES.STATUS_CHANGE, null, {
                from: wf.status,
                to: edge.to,
                action,
                note: (_a = note === null || note === void 0 ? void 0 : note.trim()) !== null && _a !== void 0 ? _a : null,
                actorUserId: actor.userId,
                actorRole: actor.role,
            });
            await this.createAuditLogTx(tx, {
                action: 'pm_safety.transition',
                entity: 'PmSafetyWorkflow',
                entityId: wf.id,
                metadata: {
                    from: wf.status,
                    to: edge.to,
                    action,
                    actorUserId: actor.userId,
                    actorRole: actor.role,
                },
            });
            await this.emitNotificationStubTx(tx, updated, edge.to, action);
            return updated;
        });
    }
    async listEvents(workflowId) {
        await this.ensureExists(workflowId);
        return this.prisma.pmSafetyWorkflowEvent.findMany({
            where: { workflowId },
            orderBy: [{ id: 'asc' }, { createdAt: 'asc' }],
        });
    }
    async exportPdfBuffer(id) {
        const wf = await this.findOne(id);
        const buffer = (0, pm_safety_workflow_pdf_1.buildPmSafetyWorkflowPdfBuffer)({
            id: wf.id,
            title: wf.title,
            status: wf.status,
            kind: wf.kind,
        });
        await this.prisma.$transaction(async (tx) => {
            await this.appendEventTx(tx, wf.id, exports.EVENT_TYPES.PDF_EXPORT, null, {
                format: 'application/pdf',
                bytes: buffer.length,
                workflowId: wf.id,
            });
            await this.createAuditLogTx(tx, {
                action: 'pm_safety.export_pdf',
                entity: 'PmSafetyWorkflow',
                entityId: wf.id,
                metadata: { bytes: buffer.length },
            });
        });
        return buffer;
    }
    assertWorkerSignRole(actor) {
        if (actor.role !== 'WORKER' && actor.role !== 'ADMIN') {
            throw new common_1.ForbiddenException({
                code: 'PM_SAFETY_ACTOR_FORBIDDEN',
                message: 'Only WORKER or ADMIN may record the worker signature',
                action: 'sign_worker',
                role: actor.role,
            });
        }
    }
    parseTaskStepsJson(raw) {
        if (raw == null || raw.trim() === '')
            return null;
        try {
            return JSON.parse(raw);
        }
        catch (_a) {
            throw new common_1.BadRequestException('taskStepsJson must be valid JSON');
        }
    }
    async ensureExists(id) {
        const n = await this.prisma.pmSafetyWorkflow.count({ where: { id } });
        if (!n)
            throw new common_1.NotFoundException('Workflow not found');
    }
    async appendEventTx(tx, workflowId, eventType, channel, payload) {
        await tx.pmSafetyWorkflowEvent.create({
            data: {
                workflowId,
                eventType,
                channel,
                payload: payload,
            },
        });
    }
    async createAuditLogTx(tx, data) {
        await tx.auditLog.create({
            data: {
                action: data.action,
                entityType: data.entity,
                entityId: String(data.entityId),
                metadataJson: data.metadata,
            },
        });
    }
    async emitNotificationStubTx(tx, wf, newStatus, _action) {
        var _a;
        const notify = [
            'SUBMITTED',
            'APPROVED',
            'REJECTED',
            'CANCELLED',
        ];
        if (!notify.includes(newStatus)) {
            return;
        }
        const templates = {
            SUBMITTED: 'PM_SAFETY_SUBMITTED',
            APPROVED: 'PM_SAFETY_APPROVED',
            REJECTED: 'PM_SAFETY_REJECTED',
            CANCELLED: 'PM_SAFETY_CANCELLED',
        };
        await this.appendEventTx(tx, wf.id, exports.EVENT_TYPES.NOTIFICATION, 'EMAIL_STUB', {
            template: (_a = templates[newStatus]) !== null && _a !== void 0 ? _a : `PM_SAFETY_${newStatus}`,
            workflowId: wf.id,
            title: wf.title,
            status: newStatus,
            recipients: [],
            channel: 'EMAIL_STUB',
            dispatchedAt: null,
            note: 'Replace with real notification service',
        });
    }
};
exports.PmSafetyWorkflowService = PmSafetyWorkflowService;
exports.PmSafetyWorkflowService = PmSafetyWorkflowService = PmSafetyWorkflowService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PmSafetyWorkflowService);
//# sourceMappingURL=pm-safety-workflow.service.js.map