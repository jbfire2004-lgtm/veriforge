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
exports.SafetyFormsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
const routes_1 = require("../config/routes");
const rbac_1 = require("../security/rbac");
const definitions_service_1 = require("./definitions/definitions.service");
const submissions_service_1 = require("./submissions/submissions.service");
const workflows_service_1 = require("./workflows/workflows.service");
const attachments_service_1 = require("./attachments/attachments.service");
const analytics_service_1 = require("./analytics/analytics.service");
const auto_populate_service_1 = require("./integration/auto-populate.service");
const corrective_actions_service_1 = require("./corrective-actions/corrective-actions.service");
const safety_forms_dto_1 = require("./dto/safety-forms.dto");
let SafetyFormsController = class SafetyFormsController {
    constructor(definitions, submissions, workflows, attachments, analytics, autoPopulate, correctiveActions) {
        this.definitions = definitions;
        this.submissions = submissions;
        this.workflows = workflows;
        this.attachments = attachments;
        this.analytics = analytics;
        this.autoPopulate = autoPopulate;
        this.correctiveActions = correctiveActions;
    }
    workflowDefinition() {
        return this.workflows.getDefinition();
    }
    listDefinitions(category) {
        return this.definitions.listDefinitions(category);
    }
    getDefinition(id) {
        const def = this.definitions.getDefinition(id);
        if (!def)
            throw new common_1.NotFoundException(`Form definition "${id}" not found`);
        return def;
    }
    autoPopulateContext(workerId, projectId, companyId, equipmentId) {
        return this.autoPopulate.buildContext({
            workerId: workerId ? parseInt(workerId, 10) : undefined,
            projectId: projectId ? parseInt(projectId, 10) : undefined,
            companyId: companyId ? parseInt(companyId, 10) : undefined,
            equipmentId: equipmentId ? parseInt(equipmentId, 10) : undefined,
        });
    }
    dashboard(companyId) {
        const cid = companyId ? parseInt(companyId, 10) : undefined;
        return this.analytics.dashboard(Number.isFinite(cid) ? cid : undefined);
    }
    indicators(companyId) {
        const cid = companyId ? parseInt(companyId, 10) : undefined;
        return this.analytics.leadingLagging(Number.isFinite(cid) ? cid : undefined);
    }
    list(companyId, projectId, definitionId, status, workerId) {
        const parse = (v) => {
            const n = v ? parseInt(v, 10) : NaN;
            return Number.isFinite(n) ? n : undefined;
        };
        const st = Object.values(client_1.SafetyFormStatus).includes(status)
            ? status
            : undefined;
        return this.submissions.list({
            companyId: parse(companyId),
            projectId: parse(projectId),
            definitionId,
            status: st,
            workerId: parse(workerId),
        });
    }
    getOne(id) {
        return this.submissions.getById(id);
    }
    listActions(id) {
        return this.correctiveActions.listForForm(id);
    }
    create(dto, req) {
        var _a;
        return this.submissions.create(Object.assign(Object.assign({}, dto), { createdById: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id }));
    }
    offlineSync(dto, req) {
        var _a;
        return this.submissions.syncOffline(Object.assign(Object.assign({}, dto), { actorId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id }));
    }
    saveDraft(id, dto, req) {
        var _a;
        return this.submissions.saveDraft(id, dto.formData, (_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
    }
    submit(id, dto, req) {
        var _a;
        return this.submissions.submit(id, dto.formData, (_a = req.user) === null || _a === void 0 ? void 0 : _a.id, dto.signatures);
    }
    transition(id, dto, req) {
        var _a;
        return this.workflows.transition(id, dto.status, (_a = req.user) === null || _a === void 0 ? void 0 : _a.id, dto.note);
    }
    addAttachment(id, dto) {
        return this.attachments.add(id, dto);
    }
};
exports.SafetyFormsController = SafetyFormsController;
__decorate([
    (0, common_1.Get)('workflow/definition'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SafetyFormsController.prototype, "workflowDefinition", null);
__decorate([
    (0, common_1.Get)('definitions'),
    __param(0, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SafetyFormsController.prototype, "listDefinitions", null);
__decorate([
    (0, common_1.Get)('definitions/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SafetyFormsController.prototype, "getDefinition", null);
__decorate([
    (0, common_1.Get)('auto-populate'),
    __param(0, (0, common_1.Query)('workerId')),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Query)('companyId')),
    __param(3, (0, common_1.Query)('equipmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], SafetyFormsController.prototype, "autoPopulateContext", null);
__decorate([
    (0, common_1.Get)('analytics/dashboard'),
    __param(0, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SafetyFormsController.prototype, "dashboard", null);
__decorate([
    (0, common_1.Get)('analytics/indicators'),
    __param(0, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SafetyFormsController.prototype, "indicators", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Query)('definitionId')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('workerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], SafetyFormsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SafetyFormsController.prototype, "getOne", null);
__decorate([
    (0, common_1.Get)(':id/actions'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SafetyFormsController.prototype, "listActions", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [safety_forms_dto_1.CreateSafetyFormDto, Object]),
    __metadata("design:returntype", void 0)
], SafetyFormsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('sync'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [safety_forms_dto_1.OfflineSyncDto, Object]),
    __metadata("design:returntype", void 0)
], SafetyFormsController.prototype, "offlineSync", null);
__decorate([
    (0, common_1.Put)(':id/draft'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, safety_forms_dto_1.SaveSafetyFormDraftDto, Object]),
    __metadata("design:returntype", void 0)
], SafetyFormsController.prototype, "saveDraft", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, safety_forms_dto_1.SubmitSafetyFormDto, Object]),
    __metadata("design:returntype", void 0)
], SafetyFormsController.prototype, "submit", null);
__decorate([
    (0, common_1.Post)(':id/transition'),
    (0, roles_decorator_1.Roles)(...(0, rbac_1.rolesFor)('approveSafetyForms')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, safety_forms_dto_1.TransitionSafetyFormDto, Object]),
    __metadata("design:returntype", void 0)
], SafetyFormsController.prototype, "transition", null);
__decorate([
    (0, common_1.Post)(':id/attachments'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, safety_forms_dto_1.AddAttachmentDto]),
    __metadata("design:returntype", void 0)
], SafetyFormsController.prototype, "addAttachment", null);
exports.SafetyFormsController = SafetyFormsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.WORKER, client_1.UserRole.SUPERVISOR, client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN, client_1.UserRole.COMPANY_ADMIN, client_1.UserRole.PROJECT_MANAGER),
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/pm/safety-forms`),
    __metadata("design:paramtypes", [definitions_service_1.DefinitionsService,
        submissions_service_1.SafetyFormSubmissionsService,
        workflows_service_1.SafetyFormWorkflowsService,
        attachments_service_1.SafetyFormAttachmentsService,
        analytics_service_1.SafetyFormAnalyticsService,
        auto_populate_service_1.AutoPopulateService,
        corrective_actions_service_1.SafetyFormCorrectiveActionsService])
], SafetyFormsController);
//# sourceMappingURL=safety-forms.controller.js.map