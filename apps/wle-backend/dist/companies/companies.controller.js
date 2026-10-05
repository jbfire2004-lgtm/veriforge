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
exports.CompaniesController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
const companies_service_1 = require("./companies.service");
const company_compliance_ui_service_1 = require("./company-compliance-ui.service");
const company_training_compliance_service_1 = require("./company-training-compliance.service");
const create_company_dto_1 = require("./dto/create-company.dto");
const update_company_dto_1 = require("./dto/update-company.dto");
const roles_1 = require("../modules/vera-core/roles");
let CompaniesController = class CompaniesController {
    constructor(companiesService, companyTrainingCompliance, companyComplianceUi) {
        this.companiesService = companiesService;
        this.companyTrainingCompliance = companyTrainingCompliance;
        this.companyComplianceUi = companyComplianceUi;
    }
    findAll(req) {
        return this.companiesService.findAll(req.user);
    }
    complianceOverview(id, req) {
        return this.companyComplianceUi.getComplianceOverview(id, req.user);
    }
    companyScore(id, req) {
        return this.companyComplianceUi.getCompanyScore(id, req.user);
    }
    compliance(id, req) {
        return this.companiesService.complianceSummary(id, req.user);
    }
    trainingCompliance(id, req) {
        return this.companyTrainingCompliance.getCompanyDashboard(id, req.user);
    }
    projectTrainingCompliance(id, projectId, req) {
        return this.companyTrainingCompliance.getProjectDashboard(id, projectId, req.user);
    }
    findOne(id, req) {
        return this.companiesService.findOne(id, req.user);
    }
    create(dto) {
        return this.companiesService.create(dto);
    }
    update(id, dto) {
        return this.companiesService.update(id, dto);
    }
    remove(id) {
        return this.companiesService.remove(id);
    }
};
exports.CompaniesController = CompaniesController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES, client_1.UserRole.UNION_HALL_ADMIN, client_1.UserRole.CONTRACTOR_ADMIN, client_1.UserRole.CONTRACTOR_USER),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CompaniesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id/compliance/overview'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPERVISOR, client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN, client_1.UserRole.COMPANY_ADMIN, client_1.UserRole.PROJECT_MANAGER, client_1.UserRole.WORKER),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], CompaniesController.prototype, "complianceOverview", null);
__decorate([
    (0, common_1.Get)(':id/score'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPERVISOR, client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN, client_1.UserRole.COMPANY_ADMIN, client_1.UserRole.PROJECT_MANAGER, client_1.UserRole.WORKER),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], CompaniesController.prototype, "companyScore", null);
__decorate([
    (0, common_1.Get)(':id/compliance'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPERVISOR, client_1.UserRole.ADMIN, client_1.UserRole.PROJECT_MANAGER, client_1.UserRole.WORKER),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], CompaniesController.prototype, "compliance", null);
__decorate([
    (0, common_1.Get)(':id/training-compliance'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPERVISOR, client_1.UserRole.ADMIN, client_1.UserRole.PROJECT_MANAGER, client_1.UserRole.WORKER),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], CompaniesController.prototype, "trainingCompliance", null);
__decorate([
    (0, common_1.Get)(':id/projects/:projectId/training-compliance'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPERVISOR, client_1.UserRole.ADMIN, client_1.UserRole.PROJECT_MANAGER, client_1.UserRole.WORKER),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('projectId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", void 0)
], CompaniesController.prototype, "projectTrainingCompliance", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERVISOR, client_1.UserRole.PROJECT_MANAGER, client_1.UserRole.WORKER),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], CompaniesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN, client_1.UserRole.COMPANY_ADMIN, client_1.UserRole.PROJECT_MANAGER),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_company_dto_1.CreateCompanyDto]),
    __metadata("design:returntype", void 0)
], CompaniesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_company_dto_1.UpdateCompanyDto]),
    __metadata("design:returntype", void 0)
], CompaniesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CompaniesController.prototype, "remove", null);
exports.CompaniesController = CompaniesController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('companies'),
    __metadata("design:paramtypes", [companies_service_1.CompaniesService,
        company_training_compliance_service_1.CompanyTrainingComplianceService,
        company_compliance_ui_service_1.CompanyComplianceUiService])
], CompaniesController);
//# sourceMappingURL=companies.controller.js.map