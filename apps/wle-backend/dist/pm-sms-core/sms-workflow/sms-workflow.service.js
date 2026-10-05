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
var SmsWorkflowService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsWorkflowService = void 0;
const common_1 = require("@nestjs/common");
const jha_flha_service_1 = require("../../jha-flha/jha-flha.service");
const pm_inspections_service_1 = require("../../pm-inspections/pm-inspections.service");
const pm_inspection_kind_util_1 = require("../../pm-inspections/pm-inspection-kind.util");
const pm_corrective_actions_service_1 = require("../../pm-corrective-actions/pm-corrective-actions.service");
const pm_safety_events_investigation_service_1 = require("../../pm-safety-events/pm-safety-events-investigation.service");
const prisma_service_1 = require("../../prisma/prisma.service");
const sms_workflow_constants_1 = require("./sms-workflow.constants");
let SmsWorkflowService = SmsWorkflowService_1 = class SmsWorkflowService {
    constructor(jhaFlha, inspections, capa, investigation, prisma) {
        this.jhaFlha = jhaFlha;
        this.inspections = inspections;
        this.capa = capa;
        this.investigation = investigation;
        this.prisma = prisma;
        this.logger = new common_1.Logger(SmsWorkflowService_1.name);
    }
    parseEntity(entity) {
        return (0, sms_workflow_constants_1.parseSmsWorkflowEntity)(entity);
    }
    async list(entityInput, query) {
        const entity = this.parseEntity(entityInput);
        this.log('list', entity, { query });
        switch (entity) {
            case 'flha':
                return this.jhaFlha.list({
                    companyId: query.companyId,
                    projectId: query.projectId,
                    status: query.status,
                    kind: 'FLHA',
                });
            case 'jha':
                return this.jhaFlha.list({
                    companyId: query.companyId,
                    projectId: query.projectId,
                    status: query.status,
                    kind: 'JHA',
                });
            case 'inspection':
                return this.filterInspectionsByKind(query, 'inspection');
            case 'audit':
                return this.filterInspectionsByKind(query, 'focus_audit');
            case 'corrective-action':
                return this.capa.list({
                    companyId: query.companyId,
                    projectId: query.projectId,
                    status: query.status,
                });
            case 'investigation':
                return this.listInvestigations(query);
            default:
                return (0, sms_workflow_constants_1.notImplemented)(`list for ${entity}`);
        }
    }
    async create(entityInput, body, actorId) {
        const entity = this.parseEntity(entityInput);
        this.log('create', entity, {
            companyId: body.companyId,
            projectId: body.projectId,
            actorId,
        });
        switch (entity) {
            case 'flha':
                return this.createJhaFlha(body, 'FLHA', actorId);
            case 'jha':
                return this.createJhaFlha(body, 'JHA', actorId);
            case 'inspection':
            case 'audit':
                return this.createInspection(entity, body, actorId);
            case 'corrective-action':
                return this.createCapa(body, actorId);
            case 'investigation':
                return this.openInvestigation(body, actorId);
            default:
                return (0, sms_workflow_constants_1.notImplemented)(`create for ${entity}`);
        }
    }
    async getById(entityInput, id) {
        const entity = this.parseEntity(entityInput);
        this.log('get', entity, { id });
        switch (entity) {
            case 'flha':
            case 'jha': {
                const row = await this.jhaFlha.getById(id);
                if (entity === 'flha' && row.kind !== 'FLHA') {
                    throw new common_1.NotFoundException('FLHA record not found');
                }
                if (entity === 'jha' && row.kind !== 'JHA') {
                    throw new common_1.NotFoundException('JHA record not found');
                }
                return row;
            }
            case 'inspection':
            case 'audit': {
                const row = await this.inspections.get(id);
                const kind = (0, pm_inspection_kind_util_1.inspectionKind)(row.template);
                if (entity === 'audit' && kind !== 'focus_audit') {
                    throw new common_1.NotFoundException('Audit record not found');
                }
                if (entity === 'inspection' && kind === 'focus_audit') {
                    throw new common_1.NotFoundException('Inspection record not found');
                }
                return row;
            }
            case 'corrective-action':
                return this.capa.get(id);
            case 'investigation':
                return this.investigation.getOrCreate(id);
            default:
                return (0, sms_workflow_constants_1.notImplemented)(`get for ${entity}`);
        }
    }
    async patch(entityInput, id, body, actorId) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
        const entity = this.parseEntity(entityInput);
        this.log('patch', entity, { id, actorId });
        if (((_a = body.hazards) === null || _a === void 0 ? void 0 : _a.length) || ((_b = body.findings) === null || _b === void 0 ? void 0 : _b.length)) {
            throw new common_1.HttpException({
                code: 'NOT_IMPLEMENTED',
                message: 'Bulk hazards/findings updates via workflow PATCH are not supported. Use entity-specific endpoints (e.g. POST /pm/jha-flha/:id/hazards or inspection photo capture).',
            }, common_1.HttpStatus.NOT_IMPLEMENTED);
        }
        if (((_c = body.controls) === null || _c === void 0 ? void 0 : _c.length) || ((_d = body.actions) === null || _d === void 0 ? void 0 : _d.length)) {
            throw new common_1.HttpException({
                code: 'NOT_IMPLEMENTED',
                message: 'Bulk controls/actions updates via workflow PATCH are not supported. Use entity-specific CAPA or control endpoints.',
            }, common_1.HttpStatus.NOT_IMPLEMENTED);
        }
        if ((_e = body.signatures) === null || _e === void 0 ? void 0 : _e.length) {
            throw new common_1.HttpException({
                code: 'NOT_IMPLEMENTED',
                message: 'Bulk signatures via workflow PATCH are not supported. Use POST /pm/inspections/:id/signatures or JHA sign endpoints.',
            }, common_1.HttpStatus.NOT_IMPLEMENTED);
        }
        if ((_f = body.attachments) === null || _f === void 0 ? void 0 : _f.length) {
            throw new common_1.HttpException({
                code: 'NOT_IMPLEMENTED',
                message: 'Bulk attachments via workflow PATCH are not supported. Use entity attachment upload endpoints.',
            }, common_1.HttpStatus.NOT_IMPLEMENTED);
        }
        const overview = (_g = body.overview) !== null && _g !== void 0 ? _g : {};
        switch (entity) {
            case 'flha':
            case 'jha':
                return this.jhaFlha.updateDraft(id, {
                    taskDescription: (_h = body.taskDescription) !== null && _h !== void 0 ? _h : overview.taskDescription,
                    workScope: (_j = body.workScope) !== null && _j !== void 0 ? _j : overview.workScope,
                    locationNote: (_k = body.locationNote) !== null && _k !== void 0 ? _k : overview.locationNote,
                    environmentalJson: (_l = body.environmentalJson) !== null && _l !== void 0 ? _l : overview.environmentalJson,
                }, actorId);
            case 'inspection':
            case 'audit': {
                if (body.answers) {
                    await this.inspections.saveAnswers(id, body.answers, actorId);
                }
                const title = (_m = body.title) !== null && _m !== void 0 ? _m : overview.title;
                const locationNote = (_o = body.locationNote) !== null && _o !== void 0 ? _o : overview.locationNote;
                if (title != null || locationNote != null) {
                    await this.prisma.pmInspection.update({
                        where: { id },
                        data: Object.assign(Object.assign({}, (title != null ? { title } : {})), (locationNote != null ? { locationNote } : {})),
                    });
                }
                return this.getById(entity, id);
            }
            case 'corrective-action':
                return this.capa.updateDraft(id, {
                    title: (_p = body.title) !== null && _p !== void 0 ? _p : overview.title,
                    description: (_q = body.description) !== null && _q !== void 0 ? _q : overview.description,
                }, actorId);
            case 'investigation':
                return this.investigation.update(id, {
                    narrative: (_r = body.narrative) !== null && _r !== void 0 ? _r : overview.narrative,
                    immediateActions: (_s = body.immediateActions) !== null && _s !== void 0 ? _s : overview.immediateActions,
                    status: body.status,
                    currentStep: body.currentStep,
                    guidedAnswersJson: body.guidedAnswersJson,
                });
            default:
                return (0, sms_workflow_constants_1.notImplemented)(`patch for ${entity}`);
        }
    }
    async submit(entityInput, id, actorId) {
        const entity = this.parseEntity(entityInput);
        this.log('submit', entity, { id, actorId });
        switch (entity) {
            case 'flha':
            case 'jha':
                return this.jhaFlha.submit(id, actorId);
            case 'inspection':
            case 'audit':
                if (!actorId) {
                    throw new common_1.BadRequestException('Authenticated user required to submit');
                }
                return this.inspections.submit(id, actorId);
            case 'corrective-action':
                if (!actorId) {
                    throw new common_1.BadRequestException('Authenticated user required to submit');
                }
                return this.capa.submitForVerification(id, actorId);
            case 'investigation':
                return this.investigation.update(id, { status: 'review' });
            default:
                return (0, sms_workflow_constants_1.notImplemented)(`submit for ${entity}`);
        }
    }
    async createJhaFlha(body, kind, actorId) {
        var _a;
        if (!((_a = body.taskDescription) === null || _a === void 0 ? void 0 : _a.trim())) {
            throw new common_1.BadRequestException({
                code: 'VALIDATION_ERROR',
                message: 'taskDescription is required to create an FLHA/JHA draft',
                details: { field: 'taskDescription' },
            });
        }
        return this.jhaFlha.create({
            kind,
            companyId: body.companyId,
            projectId: body.projectId,
            taskDescription: body.taskDescription,
            workScope: body.workScope,
            locationNote: body.locationNote,
            siteId: body.siteId,
            createdByUserId: actorId,
            clientSyncId: body.clientSyncId,
        });
    }
    async createInspection(entity, body, actorId) {
        if (!body.templateId) {
            throw new common_1.BadRequestException({
                code: 'VALIDATION_ERROR',
                message: 'templateId is required to create an inspection or audit draft',
                details: { field: 'templateId' },
            });
        }
        if (!actorId) {
            throw new common_1.BadRequestException('Authenticated user required to create inspections');
        }
        const template = await this.prisma.pmInspectionTemplate.findUnique({
            where: { id: body.templateId },
        });
        if (!template) {
            throw new common_1.NotFoundException('Inspection template not found');
        }
        const kind = (0, pm_inspection_kind_util_1.inspectionKind)(template);
        if (entity === 'audit' && kind !== 'focus_audit') {
            throw new common_1.BadRequestException('templateId must reference a Focus Audit template');
        }
        if (entity === 'inspection' && kind === 'focus_audit') {
            throw new common_1.BadRequestException('Use entity audit for Focus Audit templates, or choose a checklist/smart-site template');
        }
        return this.inspections.createFromTemplate({
            templateId: body.templateId,
            companyId: body.companyId,
            projectId: body.projectId,
            inspectorUserId: actorId,
            siteId: body.siteId,
            equipmentId: body.equipmentId,
            workerId: body.workerId,
            title: body.title,
            locationNote: body.locationNote,
            clientSyncId: body.clientSyncId,
        });
    }
    async createCapa(body, actorId) {
        var _a, _b, _c;
        if (!((_a = body.title) === null || _a === void 0 ? void 0 : _a.trim())) {
            throw new common_1.BadRequestException({
                code: 'VALIDATION_ERROR',
                message: 'title is required to create a corrective action',
                details: { field: 'title' },
            });
        }
        if (!((_b = body.sourceModule) === null || _b === void 0 ? void 0 : _b.trim()) || !((_c = body.sourceId) === null || _c === void 0 ? void 0 : _c.trim())) {
            throw new common_1.BadRequestException({
                code: 'VALIDATION_ERROR',
                message: 'sourceModule and sourceId are required for corrective actions',
                details: { fields: ['sourceModule', 'sourceId'] },
            });
        }
        return this.capa.create({
            companyId: body.companyId,
            projectId: body.projectId,
            sourceModule: body.sourceModule,
            sourceId: body.sourceId,
            title: body.title,
            description: body.description,
            actionType: body.actionType,
            severity: body.severity,
            siteId: body.siteId,
            equipmentId: body.equipmentId,
            workerId: body.workerId,
            assignUserId: body.assignUserId,
            clientSyncId: body.clientSyncId,
            publish: body.publish,
            createdByUserId: actorId !== null && actorId !== void 0 ? actorId : 0,
        });
    }
    async openInvestigation(body, actorId) {
        var _a;
        const eventId = body.eventId;
        if (!eventId) {
            throw new common_1.BadRequestException({
                code: 'VALIDATION_ERROR',
                message: 'eventId is required to open an investigation',
                details: { field: 'eventId' },
            });
        }
        const event = await this.prisma.pmSafetyEvent.findFirst({
            where: { id: eventId, deletedAt: null },
        });
        if (!event) {
            throw new common_1.NotFoundException('Parent safety event not found');
        }
        return this.investigation.getOrCreate(eventId, (_a = body.leadInvestigatorId) !== null && _a !== void 0 ? _a : actorId);
    }
    async filterInspectionsByKind(query, expectedKind) {
        const rows = await this.inspections.list({
            companyId: query.companyId,
            projectId: query.projectId,
            status: query.status,
        });
        return rows.filter((row) => (0, pm_inspection_kind_util_1.inspectionKind)(row.template) === expectedKind);
    }
    async listInvestigations(query) {
        var _a;
        return this.prisma.pmSafetyEventInvestigation.findMany({
            where: Object.assign(Object.assign({}, (query.status
                ? { status: query.status }
                : {})), { event: Object.assign(Object.assign(Object.assign({ deletedAt: null }, (query.companyId ? { companyId: query.companyId } : {})), (query.projectId ? { projectId: query.projectId } : {})), (query.status && !this.isInvestigationStatus(query.status)
                    ? { status: query.status }
                    : {})) }),
            include: {
                event: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        companyId: true,
                        projectId: true,
                    },
                },
                leadInvestigator: { select: { id: true, username: true } },
            },
            orderBy: { updatedAt: 'desc' },
            take: (_a = query.limit) !== null && _a !== void 0 ? _a : 100,
        });
    }
    isInvestigationStatus(status) {
        return [
            'not_started',
            'evidence_gathering',
            'analysis',
            'root_cause',
            'capa_planning',
            'review',
            'closed',
        ].includes(status);
    }
    log(operation, entity, meta) {
        this.logger.log(JSON.stringify(Object.assign({ type: 'sms.workflow', operation,
            entity }, meta)));
    }
};
exports.SmsWorkflowService = SmsWorkflowService;
exports.SmsWorkflowService = SmsWorkflowService = SmsWorkflowService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jha_flha_service_1.JhaFlhaService,
        pm_inspections_service_1.PmInspectionsService,
        pm_corrective_actions_service_1.PmCorrectiveActionsService,
        pm_safety_events_investigation_service_1.PmSafetyEventsInvestigationService,
        prisma_service_1.PrismaService])
], SmsWorkflowService);
//# sourceMappingURL=sms-workflow.service.js.map