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
var SafetyFormSubmissionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SafetyFormSubmissionsService = void 0;
const common_1 = require("@nestjs/common");
function toJson(data) {
    return data;
}
const prisma_service_1 = require("../../prisma/prisma.service");
const form_engine_service_1 = require("../engine/form-engine.service");
const definitions_loader_1 = require("../definitions/definitions.loader");
const validation_service_1 = require("../validation/validation.service");
const workflows_service_1 = require("../workflows/workflows.service");
const corrective_actions_service_1 = require("../corrective-actions/corrective-actions.service");
const signatures_service_1 = require("../signatures/signatures.service");
const site_access_service_1 = require("../../safety-management/site-access/site-access.service");
const sif_heca_ingestion_service_1 = require("../../sif-heca/sif-heca-ingestion.service");
const resolve_safety_form_links_1 = require("./resolve-safety-form-links");
const form_type_registry_1 = require("../engine/form-type.registry");
let SafetyFormSubmissionsService = SafetyFormSubmissionsService_1 = class SafetyFormSubmissionsService {
    constructor(prisma, loader, engine, validation, workflows, correctiveActions, signatures, siteAccess, sifIngestion) {
        this.prisma = prisma;
        this.loader = loader;
        this.engine = engine;
        this.validation = validation;
        this.workflows = workflows;
        this.correctiveActions = correctiveActions;
        this.signatures = signatures;
        this.siteAccess = siteAccess;
        this.sifIngestion = sifIngestion;
        this.logger = new common_1.Logger(SafetyFormSubmissionsService_1.name);
    }
    async list(filters) {
        var _a, _b, _c, _d;
        const started = Date.now();
        const rows = await this.prisma.safetyForm.findMany({
            where: {
                companyId: filters.companyId,
                projectId: filters.projectId,
                definitionId: filters.definitionId,
                formType: filters.formType,
                status: filters.status,
                workerId: filters.workerId,
            },
            include: {
                formDefinition: { select: { id: true, name: true, category: true } },
                worker: { select: { id: true, firstName: true, lastName: true } },
                project: { select: { id: true, name: true } },
            },
            orderBy: { updatedAt: 'desc' },
            take: 100,
        });
        this.logger.log(JSON.stringify({
            type: 'safety_forms.list.query',
            companyId: (_a = filters.companyId) !== null && _a !== void 0 ? _a : null,
            projectId: (_b = filters.projectId) !== null && _b !== void 0 ? _b : null,
            status: (_c = filters.status) !== null && _c !== void 0 ? _c : null,
            formType: (_d = filters.formType) !== null && _d !== void 0 ? _d : null,
            rows: rows.length,
            durationMs: Date.now() - started,
        }));
        return rows;
    }
    async getById(id) {
        const started = Date.now();
        const form = await this.prisma.safetyForm.findUnique({
            where: { id },
            include: {
                formDefinition: true,
                worker: { select: { id: true, firstName: true, lastName: true } },
                project: { select: { id: true, name: true, code: true } },
                equipment: { select: { id: true, name: true, assetTag: true } },
                signatures: true,
                attachments: true,
                actions: true,
                submissions: { orderBy: { versionNumber: 'desc' }, take: 5 },
                auditLogs: { orderBy: { createdAt: 'desc' }, take: 20 },
            },
        });
        if (!form)
            throw new common_1.NotFoundException('Safety form not found');
        this.logger.log(JSON.stringify({
            type: 'safety_forms.detail.query',
            formId: id,
            durationMs: Date.now() - started,
        }));
        return form;
    }
    async create(input) {
        var _a, _b, _c, _d;
        const def = this.loader.get(input.definitionId);
        if (!def)
            throw new common_1.NotFoundException('Form definition not found');
        const data = (_a = input.formData) !== null && _a !== void 0 ? _a : {};
        const flags = this.engine.evaluateFlags(def, data);
        const formDataProjectId = typeof data.projectId === 'number'
            ? data.projectId
            : typeof data.projectId === 'string' && /^\d+$/.test(data.projectId)
                ? parseInt(data.projectId, 10)
                : undefined;
        const formDataWorkerId = typeof data.workerId === 'number'
            ? data.workerId
            : typeof data.workerId === 'string' && /^\d+$/.test(data.workerId)
                ? parseInt(data.workerId, 10)
                : undefined;
        const links = await (0, resolve_safety_form_links_1.resolveSafetyFormLinks)(this.prisma, {
            companyId: input.companyId,
            projectId: (_b = input.projectId) !== null && _b !== void 0 ? _b : formDataProjectId,
            siteId: input.siteId,
            workerId: (_c = input.workerId) !== null && _c !== void 0 ? _c : formDataWorkerId,
            equipmentId: input.equipmentId,
        }, { strict: false });
        if (input.clientSyncId) {
            const existing = await this.prisma.safetyForm.findUnique({
                where: { clientSyncId: input.clientSyncId },
            });
            if (existing)
                return existing;
        }
        const form = await this.prisma.safetyForm.create({
            data: {
                definitionId: def.id,
                definitionVersion: def.version,
                formType: (0, form_type_registry_1.resolveFormType)(def.id),
                title: (_d = input.title) !== null && _d !== void 0 ? _d : def.name,
                formData: toJson(data),
                companyId: links.companyId,
                projectId: links.projectId,
                siteId: links.siteId,
                workerId: links.workerId,
                equipmentId: links.equipmentId,
                createdById: input.createdById,
                clientSyncId: input.clientSyncId,
                sifFlag: flags.sifFlag,
                hecaFlag: flags.hecaFlag,
            },
        });
        await this.prisma.safetyFormAuditLog.create({
            data: {
                formId: form.id,
                eventType: 'created',
                actorId: input.createdById,
            },
        });
        return form;
    }
    async saveDraft(id, formData, actorId) {
        const form = await this.getById(id);
        if (form.status !== 'DRAFT' && form.status !== 'REJECTED') {
            throw new common_1.BadRequestException('Only draft or rejected forms can be edited');
        }
        const def = this.loader.get(form.definitionId);
        if (!def)
            throw new common_1.NotFoundException('Definition not found');
        const flags = this.engine.evaluateFlags(def, formData);
        const links = await this.linksFromFormData(form, formData);
        const updated = await this.prisma.safetyForm.update({
            where: { id },
            data: Object.assign({ formData: toJson(formData), sifFlag: flags.sifFlag, hecaFlag: flags.hecaFlag, clientVersion: { increment: 1 }, offlinePending: false }, links),
        });
        await this.prisma.safetyFormAuditLog.create({
            data: { formId: id, eventType: 'draft_saved', actorId },
        });
        return updated;
    }
    async submit(id, formData, actorId, signatures) {
        const form = await this.getById(id);
        const def = this.loader.get(form.definitionId);
        if (!def)
            throw new common_1.NotFoundException('Definition not found');
        const errors = this.validation.validateSubmission(def, formData);
        if (errors.length) {
            throw new common_1.BadRequestException({ message: 'Validation failed', errors });
        }
        const flags = this.engine.evaluateFlags(def, formData);
        const links = await this.linksFromFormData(form, formData, true);
        const versionNumber = (await this.prisma.safetyFormSubmission.count({
            where: { formId: id },
        })) + 1;
        await this.prisma.$transaction(async (tx) => {
            await tx.safetyForm.update({
                where: { id },
                data: Object.assign({ formData: toJson(formData), sifFlag: flags.sifFlag, hecaFlag: flags.hecaFlag, status: 'SUBMITTED', submittedAt: new Date(), submittedById: actorId, offlinePending: false }, links),
            });
            await tx.safetyFormSubmission.create({
                data: {
                    formId: id,
                    versionNumber,
                    formData: toJson(formData),
                    status: 'SUBMITTED',
                    submittedById: actorId,
                },
            });
            await tx.safetyFormAuditLog.create({
                data: { formId: id, eventType: 'submitted', actorId },
            });
        });
        if (signatures === null || signatures === void 0 ? void 0 : signatures.length) {
            for (const sig of signatures) {
                await this.signatures.capture(id, Object.assign(Object.assign({}, sig), { signerUserId: actorId }));
            }
        }
        await this.correctiveActions.generateFromForm(id, def, formData, form.companyId, actorId, form.projectId, form.siteId, form.workerId, form.equipmentId);
        if (form.definitionId === 'worker-site-access' &&
            form.projectId &&
            form.workerId) {
            await this.siteAccess.processWorkerSiteAccessForm({
                formId: id,
                workerId: form.workerId,
                projectId: form.projectId,
                formData,
                actorUserId: actorId,
            });
        }
        if (this.sifIngestion && (form.sifFlag || form.hecaFlag)) {
            await this.sifIngestion.ingestFromSafetyForm(id, actorId);
        }
        return this.getById(id);
    }
    async linksFromFormData(form, formData, strict = false) {
        var _a, _b, _c, _d, _e;
        const formDataProjectId = typeof formData.projectId === 'number'
            ? formData.projectId
            : typeof formData.projectId === 'string' &&
                /^\d+$/.test(formData.projectId)
                ? parseInt(formData.projectId, 10)
                : undefined;
        const formDataWorkerId = typeof formData.workerId === 'number'
            ? formData.workerId
            : typeof formData.workerId === 'string' &&
                /^\d+$/.test(formData.workerId)
                ? parseInt(formData.workerId, 10)
                : undefined;
        const resolved = await (0, resolve_safety_form_links_1.resolveSafetyFormLinks)(this.prisma, {
            companyId: (_a = form.companyId) !== null && _a !== void 0 ? _a : undefined,
            projectId: (_b = form.projectId) !== null && _b !== void 0 ? _b : formDataProjectId,
            siteId: (_c = form.siteId) !== null && _c !== void 0 ? _c : undefined,
            workerId: (_d = form.workerId) !== null && _d !== void 0 ? _d : formDataWorkerId,
            equipmentId: (_e = form.equipmentId) !== null && _e !== void 0 ? _e : undefined,
        }, { strict });
        const patch = {};
        if (resolved.companyId != null)
            patch.companyId = resolved.companyId;
        if (resolved.projectId != null)
            patch.projectId = resolved.projectId;
        if (resolved.siteId != null)
            patch.siteId = resolved.siteId;
        if (resolved.workerId != null)
            patch.workerId = resolved.workerId;
        if (resolved.equipmentId != null)
            patch.equipmentId = resolved.equipmentId;
        return patch;
    }
    async syncOffline(payload) {
        let form = await this.prisma.safetyForm.findUnique({
            where: { clientSyncId: payload.clientSyncId },
        });
        if (!form) {
            form = await this.create({
                definitionId: payload.definitionId,
                formData: payload.formData,
                companyId: payload.companyId,
                projectId: payload.projectId,
                siteId: payload.siteId,
                workerId: payload.workerId,
                createdById: payload.actorId,
                clientSyncId: payload.clientSyncId,
            });
        }
        else {
            form = await this.saveDraft(form.id, payload.formData, payload.actorId);
        }
        if (payload.submit) {
            return this.submit(form.id, payload.formData, payload.actorId, payload.signatures);
        }
        return form;
    }
    async patchMeta(id, data) {
        return this.prisma.safetyForm.update({
            where: { id },
            data,
        });
    }
};
exports.SafetyFormSubmissionsService = SafetyFormSubmissionsService;
exports.SafetyFormSubmissionsService = SafetyFormSubmissionsService = SafetyFormSubmissionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(8, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        definitions_loader_1.DefinitionsLoader,
        form_engine_service_1.FormEngineService,
        validation_service_1.SafetyFormValidationService,
        workflows_service_1.SafetyFormWorkflowsService,
        corrective_actions_service_1.SafetyFormCorrectiveActionsService,
        signatures_service_1.SafetyFormSignaturesService,
        site_access_service_1.SiteAccessService,
        sif_heca_ingestion_service_1.SifHecaIngestionService])
], SafetyFormSubmissionsService);
//# sourceMappingURL=submissions.service.js.map