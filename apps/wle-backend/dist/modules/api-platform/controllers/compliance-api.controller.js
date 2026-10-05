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
exports.ComplianceApiController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../../auth/jwt-auth.guard");
const roles_decorator_1 = require("../../../auth/roles.decorator");
const roles_guard_1 = require("../../../auth/roles.guard");
const roles_1 = require("../../vera-core/roles");
const routes_registry_1 = require("../../../config/routes.registry");
const compliance_api_service_1 = require("../services/compliance-api.service");
const api_success_decorator_1 = require("../decorators/api-success.decorator");
const api_success_interceptor_1 = require("../interceptors/api-success.interceptor");
let ComplianceApiController = class ComplianceApiController {
    constructor(compliance) {
        this.compliance = compliance;
    }
    worker(id) {
        return this.compliance.workerCompliance(id);
    }
    equipment(companyId) {
        return this.compliance.equipmentCompliance(companyId ? Number(companyId) : undefined);
    }
    project(id, companyId) {
        return this.compliance.projectReadiness(companyId ? Number(companyId) : undefined, id);
    }
    trainingExpiry(companyId) {
        return this.compliance.trainingExpiry(companyId ? Number(companyId) : undefined);
    }
};
exports.ComplianceApiController = ComplianceApiController;
__decorate([
    (0, common_1.Get)('worker/:id'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    (0, api_success_decorator_1.ApiSuccess)(),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ComplianceApiController.prototype, "worker", null);
__decorate([
    (0, common_1.Get)('equipment'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    (0, api_success_decorator_1.ApiSuccess)(),
    __param(0, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ComplianceApiController.prototype, "equipment", null);
__decorate([
    (0, common_1.Get)('project/:id'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    (0, api_success_decorator_1.ApiSuccess)(),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", void 0)
], ComplianceApiController.prototype, "project", null);
__decorate([
    (0, common_1.Get)('training-expiry'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    (0, api_success_decorator_1.ApiSuccess)(),
    __param(0, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ComplianceApiController.prototype, "trainingExpiry", null);
exports.ComplianceApiController = ComplianceApiController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.UseInterceptors)(api_success_interceptor_1.ApiSuccessInterceptor),
    (0, common_1.Controller)(routes_registry_1.V1_ROUTES.compliance),
    __metadata("design:paramtypes", [compliance_api_service_1.ComplianceApiService])
], ComplianceApiController);
//# sourceMappingURL=compliance-api.controller.js.map