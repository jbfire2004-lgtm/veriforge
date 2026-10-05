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
exports.DashboardWidgetsController = void 0;
exports.resolveWidgetScope = resolveWidgetScope;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const roles_decorator_1 = require("../../auth/roles.decorator");
const roles_guard_1 = require("../../auth/roles.guard");
const routes_1 = require("../../config/routes");
const roles_1 = require("../vera-core/roles");
const dashboard_widgets_service_1 = require("./dashboard-widgets.service");
const dashboard_widgets_query_dto_1 = require("./dto/dashboard-widgets-query.dto");
let DashboardWidgetsController = class DashboardWidgetsController {
    constructor(widgets) {
        this.widgets = widgets;
    }
    widgetsBundle(query, req) {
        var _a, _b;
        const role = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== null && _b !== void 0 ? _b : '';
        const scope = resolveWidgetScope(role, query.companyId, query.unionHallId);
        return this.widgets.getBundle(scope);
    }
};
exports.DashboardWidgetsController = DashboardWidgetsController;
__decorate([
    (0, common_1.Get)('widgets'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES, ...roles_1.UNION_HALL_ROLES, ...roles_1.TRAINING_PROVIDER_ADMIN_ROLES, ...roles_1.TRAINING_INSTRUCTOR_ROLES),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_widgets_query_dto_1.DashboardWidgetsQueryDto, Object]),
    __metadata("design:returntype", void 0)
], DashboardWidgetsController.prototype, "widgetsBundle", null);
exports.DashboardWidgetsController = DashboardWidgetsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/dashboard`),
    __metadata("design:paramtypes", [dashboard_widgets_service_1.DashboardWidgetsService])
], DashboardWidgetsController);
function resolveWidgetScope(role, companyId, unionHallId) {
    const isSuperAdmin = role === 'SUPER_ADMIN' || role === 'ADMIN';
    const isCompanyAdmin = role === 'COMPANY_ADMIN' || isSuperAdmin;
    const isSupervisor = role === 'SUPERVISOR' || role === 'PROJECT_MANAGER' || isCompanyAdmin;
    const isUnionHall = role === 'UNION_HALL_ADMIN' || isSuperAdmin;
    const isProviderAdmin = role === 'TRAINING_PROVIDER_ADMIN' || isSuperAdmin;
    const isInstructor = role === 'TRAINING_INSTRUCTOR';
    if (isInstructor && !isProviderAdmin) {
        return {
            companyId,
            includeTrainingExpiry: true,
            includeProviderApprovals: true,
        };
    }
    if (isProviderAdmin && !isSuperAdmin) {
        return {
            companyId,
            includeTrainingExpiry: true,
            includeProviderApprovals: true,
        };
    }
    if (isUnionHall && !isSuperAdmin) {
        return {
            companyId,
            unionHallId,
            includeWorkerCompliance: true,
            includeTrainingExpiry: true,
            includeUnionDispatch: true,
        };
    }
    if (isSupervisor && !isCompanyAdmin) {
        return {
            companyId,
            includeWorkerCompliance: true,
            includeEquipmentCompliance: true,
            includeProjectReadiness: true,
            includeAssignments: true,
        };
    }
    if (isCompanyAdmin && !isSuperAdmin) {
        return {
            companyId,
            includeWorkerCompliance: true,
            includeEquipmentCompliance: true,
            includeProjectReadiness: true,
            includeTrainingExpiry: true,
        };
    }
    return {
        companyId,
        unionHallId,
        includeWorkerCompliance: true,
        includeEquipmentCompliance: true,
        includeTrainingExpiry: true,
        includeProjectReadiness: true,
        includeProviderApprovals: true,
        includeUnionDispatch: true,
        includeSystemHealth: true,
        includeAssignments: true,
    };
}
//# sourceMappingURL=dashboard-widgets.controller.js.map