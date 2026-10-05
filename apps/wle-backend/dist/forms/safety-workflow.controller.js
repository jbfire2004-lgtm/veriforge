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
exports.SafetyWorkflowController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
const audit_log_service_1 = require("../audit/audit-log.service");
const routes_1 = require("../config/routes");
const rbac_1 = require("../security/rbac");
const safety_forms_dto_1 = require("./dto/safety-forms.dto");
const safety_form_transition_dto_1 = require("./dto/safety-form-transition.dto");
const safety_workflow_dto_1 = require("./dto/safety-workflow.dto");
const safety_workflow_engine_service_1 = require("./workflows/safety-workflow-engine.service");
let SafetyWorkflowController = class SafetyWorkflowController {
    constructor(engine, audit) {
        this.engine = engine;
        this.audit = audit;
    }
    list(companyId, projectId, workerId, formType, status, awaitingReview) {
        const parse = (v) => {
            const n = v ? parseInt(v, 10) : NaN;
            return Number.isFinite(n) ? n : undefined;
        };
        return this.engine.listForms({
            companyId: parse(companyId),
            projectId: parse(projectId),
            workerId: parse(workerId),
            formType,
            status,
            awaitingReview: awaitingReview === 'true',
        });
    }
    getOne(formId) {
        return this.engine.getForm(formId);
    }
    create(body, req) {
        return this.engine.createForm(body, {
            id: req.user.id,
            role: req.user.role,
        });
    }
    saveDraft(formId, body, req) {
        return this.engine.saveDraft(formId, body.formData, {
            id: req.user.id,
            role: req.user.role,
        });
    }
    submit(formId, body, req) {
        return this.engine.submit(formId, body.formData, {
            id: req.user.id,
            role: req.user.role,
        }, body.signatures);
    }
    async transition(formId, body, req) {
        var _a;
        const result = await this.engine.transition(formId, body.status, {
            id: req.user.id,
            role: req.user.role,
        }, body.note);
        if (['APPROVED', 'REJECTED', 'CLOSED'].includes(body.status)) {
            await this.audit.logAudit({ id: req.user.id }, 'safety_form.transition', { type: 'SafetyForm', id: formId }, { status: body.status, note: (_a = body.note) !== null && _a !== void 0 ? _a : null });
        }
        return result;
    }
    listAttachments(formId) {
        return this.engine.listAttachments(formId);
    }
    addAttachment(formId, dto, req) {
        return this.engine.addAttachment(formId, dto, {
            id: req.user.id,
            role: req.user.role,
        });
    }
    removeAttachment(formId, attachmentId, req) {
        return this.engine.removeAttachment(formId, attachmentId, {
            id: req.user.id,
            role: req.user.role,
        });
    }
};
exports.SafetyWorkflowController = SafetyWorkflowController;
__decorate([
    (0, common_1.Get)('forms'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Query)('workerId')),
    __param(3, (0, common_1.Query)('formType')),
    __param(4, (0, common_1.Query)('status')),
    __param(5, (0, common_1.Query)('awaitingReview')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], SafetyWorkflowController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('forms/:formId'),
    __param(0, (0, common_1.Param)('formId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SafetyWorkflowController.prototype, "getOne", null);
__decorate([
    (0, common_1.Post)('forms'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [safety_workflow_dto_1.CreateSafetyWorkflowFormDto, Object]),
    __metadata("design:returntype", void 0)
], SafetyWorkflowController.prototype, "create", null);
__decorate([
    (0, common_1.Put)('forms/:formId/draft'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __param(0, (0, common_1.Param)('formId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, safety_workflow_dto_1.SaveSafetyWorkflowDraftDto, Object]),
    __metadata("design:returntype", void 0)
], SafetyWorkflowController.prototype, "saveDraft", null);
__decorate([
    (0, common_1.Post)('forms/:formId/submit'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __param(0, (0, common_1.Param)('formId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, safety_workflow_dto_1.SubmitSafetyWorkflowFormDto, Object]),
    __metadata("design:returntype", void 0)
], SafetyWorkflowController.prototype, "submit", null);
__decorate([
    (0, common_1.Post)('forms/:formId/transition'),
    (0, roles_decorator_1.Roles)(...(0, rbac_1.rolesFor)('approveSafetyForms')),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __param(0, (0, common_1.Param)('formId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, safety_form_transition_dto_1.SafetyFormTransitionDto, Object]),
    __metadata("design:returntype", Promise)
], SafetyWorkflowController.prototype, "transition", null);
__decorate([
    (0, common_1.Get)('forms/:formId/attachments'),
    __param(0, (0, common_1.Param)('formId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SafetyWorkflowController.prototype, "listAttachments", null);
__decorate([
    (0, common_1.Post)('forms/:formId/attachments'),
    __param(0, (0, common_1.Param)('formId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, safety_forms_dto_1.AddAttachmentDto, Object]),
    __metadata("design:returntype", void 0)
], SafetyWorkflowController.prototype, "addAttachment", null);
__decorate([
    (0, common_1.Delete)('forms/:formId/attachments/:attachmentId'),
    __param(0, (0, common_1.Param)('formId')),
    __param(1, (0, common_1.Param)('attachmentId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], SafetyWorkflowController.prototype, "removeAttachment", null);
exports.SafetyWorkflowController = SafetyWorkflowController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...(0, rbac_1.rolesFor)('submitSafetyForms')),
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/safety`),
    __metadata("design:paramtypes", [safety_workflow_engine_service_1.SafetyWorkflowEngineService,
        audit_log_service_1.AuditLogService])
], SafetyWorkflowController);
//# sourceMappingURL=safety-workflow.controller.js.map