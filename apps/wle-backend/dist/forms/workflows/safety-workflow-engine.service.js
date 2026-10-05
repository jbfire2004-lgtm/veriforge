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
exports.SafetyWorkflowEngineService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const attachments_service_1 = require("../attachments/attachments.service");
const definitions_loader_1 = require("../definitions/definitions.loader");
const form_type_registry_1 = require("../engine/form-type.registry");
const type_schemas_1 = require("../schemas/type-schemas");
const submissions_service_1 = require("../submissions/submissions.service");
const workflows_service_1 = require("../workflows/workflows.service");
const WORKER_ROLES = [
    client_1.UserRole.WORKER,
    client_1.UserRole.SUPERVISOR,
    client_1.UserRole.PROJECT_MANAGER,
    client_1.UserRole.COMPANY_ADMIN,
    client_1.UserRole.ADMIN,
    client_1.UserRole.SUPER_ADMIN,
];
const SUPERVISOR_ROLES = [
    client_1.UserRole.SUPERVISOR,
    client_1.UserRole.PROJECT_MANAGER,
    client_1.UserRole.COMPANY_ADMIN,
    client_1.UserRole.ADMIN,
    client_1.UserRole.SUPER_ADMIN,
];
const ADMIN_OVERRIDE_ROLES = [
    client_1.UserRole.ADMIN,
    client_1.UserRole.SUPER_ADMIN,
    client_1.UserRole.COMPANY_ADMIN,
];
let SafetyWorkflowEngineService = class SafetyWorkflowEngineService {
    constructor(submissions, workflows, attachments, loader) {
        this.submissions = submissions;
        this.workflows = workflows;
        this.attachments = attachments;
        this.loader = loader;
    }
    listForms(filters) {
        const definitionId = filters.formType
            ? form_type_registry_1.FORM_TYPE_TO_DEFINITION_ID[filters.formType]
            : undefined;
        const status = filters.awaitingReview
            ? client_1.SafetyFormStatus.SUBMITTED
            : filters.status;
        return this.submissions.list({
            companyId: filters.companyId,
            projectId: filters.projectId,
            workerId: filters.workerId,
            definitionId,
            formType: filters.formType,
            status,
        });
    }
    getForm(id) {
        return this.submissions.getById(id);
    }
    async createForm(input, actor) {
        var _a, _b;
        this.assertRole(actor.role, WORKER_ROLES, 'create safety forms');
        const definitionId = form_type_registry_1.FORM_TYPE_TO_DEFINITION_ID[input.formType];
        const def = this.loader.get(definitionId);
        if (!def)
            throw new common_1.NotFoundException(`No definition for ${input.formType}`);
        const formData = Object.assign(Object.assign(Object.assign(Object.assign({}, (0, form_type_registry_1.defaultFormData)(input.formType)), ((_a = input.formData) !== null && _a !== void 0 ? _a : {})), (input.projectId ? { projectId: input.projectId } : {})), (input.workerId ? { workerId: input.workerId } : {}));
        const form = await this.submissions.create({
            definitionId,
            title: (_b = input.title) !== null && _b !== void 0 ? _b : def.name,
            formData,
            companyId: input.companyId,
            projectId: input.projectId,
            siteId: input.siteId,
            workerId: input.workerId,
            equipmentId: input.equipmentId,
            createdById: actor.id,
        });
        if (input.supervisorId) {
            return this.submissions.patchMeta(form.id, {
                supervisorId: input.supervisorId,
                formType: input.formType,
            });
        }
        return this.submissions.patchMeta(form.id, { formType: input.formType });
    }
    async saveDraft(id, formData, actor) {
        var _a;
        const form = await this.getForm(id);
        this.assertCanEdit(form.status, actor);
        const typeErrors = (0, type_schemas_1.validateFormTypeData)((_a = form.formType) !== null && _a !== void 0 ? _a : (0, form_type_registry_1.resolveFormType)(form.definitionId), formData, true);
        if (typeErrors.length) {
            throw new common_1.BadRequestException({
                message: 'Validation failed',
                errors: typeErrors,
            });
        }
        return this.submissions.saveDraft(id, formData, actor.id);
    }
    async submit(id, formData, actor, signatures) {
        var _a;
        const form = await this.getForm(id);
        this.assertRole(actor.role, WORKER_ROLES, 'submit safety forms');
        this.assertCanEdit(form.status, actor);
        const formType = (_a = form.formType) !== null && _a !== void 0 ? _a : (0, form_type_registry_1.resolveFormType)(form.definitionId);
        const typeErrors = (0, type_schemas_1.validateFormTypeData)(formType, formData, false);
        if (typeErrors.length) {
            throw new common_1.BadRequestException({
                message: 'Validation failed',
                errors: typeErrors,
            });
        }
        return this.submissions.submit(id, formData, actor.id, signatures);
    }
    async transition(id, to, actor, note) {
        const form = await this.getForm(id);
        this.assertTransitionAllowed(form.status, to, actor);
        const updated = await this.workflows.transition(id, to, actor.id, note);
        if (to === client_1.SafetyFormStatus.APPROVED || to === client_1.SafetyFormStatus.REJECTED) {
            return this.submissions.patchMeta(id, { supervisorId: actor.id });
        }
        return updated;
    }
    addAttachment(formId, input, actor) {
        this.assertRole(actor.role, WORKER_ROLES, 'attach files');
        return this.attachments.add(formId, input);
    }
    listAttachments(formId) {
        return this.attachments.list(formId);
    }
    async removeAttachment(formId, attachmentId, actor) {
        const form = await this.getForm(formId);
        if (form.status !== client_1.SafetyFormStatus.DRAFT &&
            form.status !== client_1.SafetyFormStatus.REJECTED) {
            if (!ADMIN_OVERRIDE_ROLES.includes(actor.role)) {
                throw new common_1.BadRequestException('Attachments can only be removed on draft forms');
            }
        }
        return this.attachments.remove(formId, attachmentId);
    }
    assertCanEdit(status, actor) {
        if (status === client_1.SafetyFormStatus.DRAFT ||
            status === client_1.SafetyFormStatus.REJECTED) {
            return;
        }
        if (ADMIN_OVERRIDE_ROLES.includes(actor.role))
            return;
        throw new common_1.BadRequestException('Form is not editable in current status');
    }
    assertTransitionAllowed(from, to, actor) {
        if (from === client_1.SafetyFormStatus.DRAFT && to === client_1.SafetyFormStatus.SUBMITTED) {
            this.assertRole(actor.role, WORKER_ROLES, 'submit forms');
            return;
        }
        if (to === client_1.SafetyFormStatus.APPROVED || to === client_1.SafetyFormStatus.REJECTED) {
            if (ADMIN_OVERRIDE_ROLES.includes(actor.role))
                return;
            this.assertRole(actor.role, SUPERVISOR_ROLES, 'review forms');
            return;
        }
        if (to === client_1.SafetyFormStatus.CLOSED) {
            if (ADMIN_OVERRIDE_ROLES.includes(actor.role))
                return;
            this.assertRole(actor.role, SUPERVISOR_ROLES, 'close forms');
            return;
        }
        if (to === client_1.SafetyFormStatus.DRAFT && from === client_1.SafetyFormStatus.REJECTED) {
            this.assertRole(actor.role, WORKER_ROLES, 'revise forms');
            return;
        }
        if (ADMIN_OVERRIDE_ROLES.includes(actor.role))
            return;
        throw new common_1.ForbiddenException(`Role ${actor.role} cannot transition ${from} → ${to}`);
    }
    assertRole(role, allowed, action) {
        if (!allowed.includes(role)) {
            throw new common_1.ForbiddenException(`Your role cannot ${action}`);
        }
    }
};
exports.SafetyWorkflowEngineService = SafetyWorkflowEngineService;
exports.SafetyWorkflowEngineService = SafetyWorkflowEngineService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [submissions_service_1.SafetyFormSubmissionsService,
        workflows_service_1.SafetyFormWorkflowsService,
        attachments_service_1.SafetyFormAttachmentsService,
        definitions_loader_1.DefinitionsLoader])
], SafetyWorkflowEngineService);
//# sourceMappingURL=safety-workflow-engine.service.js.map