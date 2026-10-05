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
exports.VsiDashboardsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const roles_guard_1 = require("../../auth/roles.guard");
const roles_decorator_1 = require("../../auth/roles.decorator");
const routes_1 = require("../../config/routes");
const dashboards_service_1 = require("./dashboards.service");
const cail_scope_service_1 = require("../cail/cail-scope.service");
const predictive_risk_service_1 = require("../predictive/predictive-risk.service");
const PM_ROLES = [
    client_1.UserRole.WORKER,
    client_1.UserRole.SUPERVISOR,
    client_1.UserRole.ADMIN,
    client_1.UserRole.SUPER_ADMIN,
    client_1.UserRole.COMPANY_ADMIN,
    client_1.UserRole.PROJECT_MANAGER,
];
let VsiDashboardsController = class VsiDashboardsController {
    constructor(dashboards, scope, predictive) {
        this.dashboards = dashboards;
        this.scope = scope;
        this.predictive = predictive;
    }
    revision(projectId) {
        return this.dashboards.getRevision(parseInt(projectId, 10));
    }
    async project(projectId, req) {
        const actor = await this.scope.resolveActor(req.user.id, req.user.role);
        return this.dashboards.projectDashboard(parseInt(projectId, 10), actor);
    }
    async company(req, ownerCompanyId) {
        const actor = await this.scope.resolveActor(req.user.id, req.user.role);
        const companyId = ownerCompanyId
            ? parseInt(ownerCompanyId, 10)
            : actor.companyId;
        if (!companyId)
            return { total: 0, overdue: 0, byProject: [] };
        return this.dashboards.companyDashboard(companyId, actor);
    }
    async predictiveRisk(projectId) {
        const id = parseInt(projectId, 10);
        const latest = await this.predictive.latestSnapshot(id);
        return (latest !== null && latest !== void 0 ? latest : { projectId: id, message: 'No snapshot yet; run compute.' });
    }
    async computePredictiveRisk(projectId) {
        return this.predictive.computeAndStore(parseInt(projectId, 10));
    }
};
exports.VsiDashboardsController = VsiDashboardsController;
__decorate([
    (0, common_1.Get)('project/:projectId/revision'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VsiDashboardsController.prototype, "revision", null);
__decorate([
    (0, common_1.Get)('project/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VsiDashboardsController.prototype, "project", null);
__decorate([
    (0, common_1.Get)('company'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('ownerCompanyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], VsiDashboardsController.prototype, "company", null);
__decorate([
    (0, common_1.Get)('project/:projectId/predictive-risk'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VsiDashboardsController.prototype, "predictiveRisk", null);
__decorate([
    (0, common_1.Post)('project/:projectId/predictive-risk/compute'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN, client_1.UserRole.PROJECT_MANAGER),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VsiDashboardsController.prototype, "computePredictiveRisk", null);
exports.VsiDashboardsController = VsiDashboardsController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/pm/safety-intelligence/dashboards`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    __metadata("design:paramtypes", [dashboards_service_1.VsiDashboardsService,
        cail_scope_service_1.CailScopeService,
        predictive_risk_service_1.PredictiveRiskService])
], VsiDashboardsController);
//# sourceMappingURL=dashboards.controller.js.map