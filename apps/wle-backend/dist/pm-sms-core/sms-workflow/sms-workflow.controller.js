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
exports.SmsWorkflowController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const roles_guard_1 = require("../../auth/roles.guard");
const roles_decorator_1 = require("../../auth/roles.decorator");
const routes_1 = require("../../config/routes");
const sms_workflow_constants_1 = require("./sms-workflow.constants");
const sms_workflow_service_1 = require("./sms-workflow.service");
const sms_workflow_list_query_dto_1 = require("./dto/sms-workflow-list-query.dto");
const sms_workflow_create_dto_1 = require("./dto/sms-workflow-create.dto");
const sms_workflow_update_dto_1 = require("./dto/sms-workflow-update.dto");
const PM_ROLES = [
    client_1.UserRole.WORKER,
    client_1.UserRole.SUPERVISOR,
    client_1.UserRole.ADMIN,
    client_1.UserRole.SUPER_ADMIN,
    client_1.UserRole.COMPANY_ADMIN,
    client_1.UserRole.PROJECT_MANAGER,
    client_1.UserRole.CONTRACTOR_ADMIN,
    client_1.UserRole.CONTRACTOR_USER,
];
let SmsWorkflowController = class SmsWorkflowController {
    constructor(workflows) {
        this.workflows = workflows;
    }
    surface() {
        return sms_workflow_constants_1.SMS_WORKFLOW_API_SURFACE;
    }
    list(entity, query) {
        return this.workflows.list(entity, query);
    }
    create(entity, req, body) {
        var _a;
        return this.workflows.create(entity, body, (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
    }
    get(entity, id) {
        return this.workflows.getById(entity, id);
    }
    patch(entity, id, req, body) {
        var _a;
        return this.workflows.patch(entity, id, body, (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
    }
    submit(entity, id, req) {
        var _a;
        return this.workflows.submit(entity, id, (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
    }
};
exports.SmsWorkflowController = SmsWorkflowController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SmsWorkflowController.prototype, "surface", null);
__decorate([
    (0, common_1.Get)(':entity'),
    __param(0, (0, common_1.Param)('entity')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, sms_workflow_list_query_dto_1.SmsWorkflowListQueryDto]),
    __metadata("design:returntype", void 0)
], SmsWorkflowController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(':entity'),
    __param(0, (0, common_1.Param)('entity')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, sms_workflow_create_dto_1.SmsWorkflowCreateDto]),
    __metadata("design:returntype", void 0)
], SmsWorkflowController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':entity/:id'),
    __param(0, (0, common_1.Param)('entity')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SmsWorkflowController.prototype, "get", null);
__decorate([
    (0, common_1.Patch)(':entity/:id'),
    __param(0, (0, common_1.Param)('entity')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, sms_workflow_update_dto_1.SmsWorkflowUpdateDto]),
    __metadata("design:returntype", void 0)
], SmsWorkflowController.prototype, "patch", null);
__decorate([
    (0, common_1.Post)(':entity/:id/submit'),
    __param(0, (0, common_1.Param)('entity')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], SmsWorkflowController.prototype, "submit", null);
exports.SmsWorkflowController = SmsWorkflowController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/pm/sms/workflows`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    __metadata("design:paramtypes", [sms_workflow_service_1.SmsWorkflowService])
], SmsWorkflowController);
//# sourceMappingURL=sms-workflow.controller.js.map