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
exports.ProjectComplianceController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const roles_decorator_1 = require("../../auth/roles.decorator");
const roles_guard_1 = require("../../auth/roles.guard");
const audit_log_service_1 = require("../../audit/audit-log.service");
const routes_registry_1 = require("../../config/routes.registry");
const rbac_1 = require("../../security/rbac");
const api_success_decorator_1 = require("../api-platform/decorators/api-success.decorator");
const api_success_interceptor_1 = require("../api-platform/interceptors/api-success.interceptor");
const project_scope_guard_1 = require("../api-platform/guards/project-scope.guard");
const scoped_decorator_1 = require("../api-platform/decorators/scoped.decorator");
const project_compliance_alerts_service_1 = require("./project-compliance-alerts.service");
const project_compliance_service_1 = require("./project-compliance.service");
const create_compliance_rule_dto_1 = require("./dto/create-compliance-rule.dto");
let ProjectComplianceController = class ProjectComplianceController {
    constructor(compliance, alerts, audit) {
        this.compliance = compliance;
        this.alerts = alerts;
        this.audit = audit;
    }
    projectCompliance(id) {
        return this.compliance.evaluateProject(id);
    }
    workerCompliance(id, workerId) {
        return this.compliance.evaluateWorkerOnProject(id, workerId);
    }
    async listAlerts(id, includeResolved) {
        await this.alerts.syncAlertsForProject(id);
        return this.alerts.listAlerts(id, {
            includeResolved: includeResolved === 'true',
        });
    }
    async resolveAlert(id, alertId, req) {
        var _a, _b, _c;
        const result = await this.alerts.resolveAlert(id, alertId);
        await this.audit.logAudit(req.user
            ? { id: req.user.id, companyId: (_a = req.user.companyId) !== null && _a !== void 0 ? _a : undefined }
            : null, 'project_compliance.alert.resolve', {
            type: 'ProjectComplianceAlert',
            id: alertId,
            tenantId: (_c = (_b = req.user) === null || _b === void 0 ? void 0 : _b.companyId) !== null && _c !== void 0 ? _c : undefined,
        }, { projectId: id });
        return result;
    }
    listRules(id) {
        return this.compliance.listRules(id);
    }
    async createRule(id, body, req) {
        var _a, _b, _c;
        const result = await this.compliance.createRule(id, body);
        await this.audit.logAudit(req.user
            ? { id: req.user.id, companyId: (_a = req.user.companyId) !== null && _a !== void 0 ? _a : undefined }
            : null, 'project_compliance.rule.create', {
            type: 'ProjectComplianceRule',
            id: result.id,
            tenantId: (_c = (_b = req.user) === null || _b === void 0 ? void 0 : _b.companyId) !== null && _c !== void 0 ? _c : undefined,
        }, { projectId: id, ruleType: body.ruleType });
        return result;
    }
};
exports.ProjectComplianceController = ProjectComplianceController;
__decorate([
    (0, common_1.Get)(':id/compliance'),
    (0, roles_decorator_1.Roles)(...(0, rbac_1.rolesFor)('viewProjectCompliance')),
    (0, api_success_decorator_1.ApiSuccess)(),
    (0, scoped_decorator_1.ProjectScoped)('id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProjectComplianceController.prototype, "projectCompliance", null);
__decorate([
    (0, common_1.Get)(':id/workers/:workerId/compliance'),
    (0, roles_decorator_1.Roles)(...(0, rbac_1.rolesFor)('viewProjectCompliance')),
    (0, api_success_decorator_1.ApiSuccess)(),
    (0, scoped_decorator_1.ProjectScoped)('id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('workerId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], ProjectComplianceController.prototype, "workerCompliance", null);
__decorate([
    (0, common_1.Get)(':id/compliance/alerts'),
    (0, roles_decorator_1.Roles)(...(0, rbac_1.rolesFor)('viewProjectCompliance')),
    (0, api_success_decorator_1.ApiSuccess)(),
    (0, scoped_decorator_1.ProjectScoped)('id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('includeResolved')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], ProjectComplianceController.prototype, "listAlerts", null);
__decorate([
    (0, common_1.Post)(':id/compliance/alerts/:alertId/resolve'),
    (0, roles_decorator_1.Roles)(...(0, rbac_1.rolesFor)('manageProjectCompliance')),
    (0, api_success_decorator_1.ApiSuccess)(),
    (0, scoped_decorator_1.ProjectScoped)('id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('alertId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], ProjectComplianceController.prototype, "resolveAlert", null);
__decorate([
    (0, common_1.Get)(':id/compliance/rules'),
    (0, roles_decorator_1.Roles)(...(0, rbac_1.rolesFor)('viewProjectCompliance')),
    (0, api_success_decorator_1.ApiSuccess)(),
    (0, scoped_decorator_1.ProjectScoped)('id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProjectComplianceController.prototype, "listRules", null);
__decorate([
    (0, common_1.Post)(':id/compliance/rules'),
    (0, roles_decorator_1.Roles)(...(0, rbac_1.rolesFor)('manageProjectCompliance')),
    (0, api_success_decorator_1.ApiSuccess)(),
    (0, scoped_decorator_1.ProjectScoped)('id'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_compliance_rule_dto_1.CreateComplianceRuleDto, Object]),
    __metadata("design:returntype", Promise)
], ProjectComplianceController.prototype, "createRule", null);
exports.ProjectComplianceController = ProjectComplianceController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, project_scope_guard_1.ProjectScopeGuard),
    (0, common_1.UseInterceptors)(api_success_interceptor_1.ApiSuccessInterceptor),
    (0, common_1.Controller)(routes_registry_1.V1_ROUTES.projects),
    __metadata("design:paramtypes", [project_compliance_service_1.ProjectComplianceService,
        project_compliance_alerts_service_1.ProjectComplianceAlertsService,
        audit_log_service_1.AuditLogService])
], ProjectComplianceController);
//# sourceMappingURL=project-compliance.controller.js.map