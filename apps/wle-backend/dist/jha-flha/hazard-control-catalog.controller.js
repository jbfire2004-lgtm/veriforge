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
exports.ControlCatalogController = exports.HazardCatalogController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const routes_1 = require("../config/routes");
const require_permission_decorator_1 = require("../security/decorators/require-permission.decorator");
const tenant_scoped_decorator_1 = require("../security/decorators/tenant-scoped.decorator");
const tenant_scope_service_1 = require("../security/tenant-scope.service");
const security_types_1 = require("../security/security.types");
const hazard_control_catalog_service_1 = require("./hazard-control-catalog.service");
const PM_ROLES = [
    client_1.UserRole.WORKER,
    client_1.UserRole.SUPERVISOR,
    client_1.UserRole.ADMIN,
    client_1.UserRole.SUPER_ADMIN,
    client_1.UserRole.COMPANY_ADMIN,
    client_1.UserRole.PROJECT_MANAGER,
];
let HazardCatalogController = class HazardCatalogController {
    constructor(catalog, tenant) {
        this.catalog = catalog;
        this.tenant = tenant;
    }
    listHazards(req, companyId, projectId, category, search, taskCode) {
        const actor = req.user;
        const effectiveCompanyId = this.tenant.effectiveCompanyId(actor, companyId ? parseInt(companyId, 10) : undefined);
        return this.catalog.listHazards(effectiveCompanyId, projectId ? parseInt(projectId, 10) : undefined, { category, search, taskCode });
    }
    suggestForTask(req, companyId, projectId, taskDescription, locationNote, weather, existingHazards) {
        const actor = req.user;
        const effectiveCompanyId = this.tenant.effectiveCompanyId(actor, companyId ? parseInt(companyId, 10) : undefined);
        return this.catalog.suggestHazardsForTask(effectiveCompanyId, projectId ? parseInt(projectId, 10) : undefined, {
            taskDescription: taskDescription !== null && taskDescription !== void 0 ? taskDescription : '',
            locationNote,
            weather,
            existingHazardDescriptions: existingHazards === null || existingHazards === void 0 ? void 0 : existingHazards.split('|').filter(Boolean),
        });
    }
    aiIdentify(req, companyId, body, projectId) {
        const actor = req.user;
        const effectiveCompanyId = this.tenant.effectiveCompanyId(actor, companyId ? parseInt(companyId, 10) : undefined);
        return this.catalog.aiIdentifyHazards(effectiveCompanyId, projectId ? parseInt(projectId, 10) : undefined, body);
    }
};
exports.HazardCatalogController = HazardCatalogController;
__decorate([
    (0, common_1.Get)(),
    (0, tenant_scoped_decorator_1.TenantScoped)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Query)('projectId')),
    __param(3, (0, common_1.Query)('category')),
    __param(4, (0, common_1.Query)('search')),
    __param(5, (0, common_1.Query)('taskCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], HazardCatalogController.prototype, "listHazards", null);
__decorate([
    (0, common_1.Get)('suggest'),
    (0, tenant_scoped_decorator_1.TenantScoped)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Query)('projectId')),
    __param(3, (0, common_1.Query)('taskDescription')),
    __param(4, (0, common_1.Query)('locationNote')),
    __param(5, (0, common_1.Query)('weather')),
    __param(6, (0, common_1.Query)('existingHazards')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], HazardCatalogController.prototype, "suggestForTask", null);
__decorate([
    (0, common_1.Post)('ai-identify'),
    (0, common_1.HttpCode)(200),
    (0, tenant_scoped_decorator_1.TenantScoped)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object, String]),
    __metadata("design:returntype", void 0)
], HazardCatalogController.prototype, "aiIdentify", null);
exports.HazardCatalogController = HazardCatalogController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/hazards`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    (0, require_permission_decorator_1.RequirePermission)(security_types_1.Permission.PM_ACCESS),
    __metadata("design:paramtypes", [hazard_control_catalog_service_1.HazardControlCatalogService,
        tenant_scope_service_1.TenantScopeService])
], HazardCatalogController);
let ControlCatalogController = class ControlCatalogController {
    constructor(catalog, tenant) {
        this.catalog = catalog;
        this.tenant = tenant;
    }
    listControls(req, companyId, projectId, hazardCategory, hazardCategories, search) {
        const actor = req.user;
        const effectiveCompanyId = this.tenant.effectiveCompanyId(actor, companyId ? parseInt(companyId, 10) : undefined);
        return this.catalog.listControls(effectiveCompanyId, projectId ? parseInt(projectId, 10) : undefined, {
            hazardCategory,
            hazardCategories: hazardCategories === null || hazardCategories === void 0 ? void 0 : hazardCategories.split(',').filter(Boolean),
            search,
        });
    }
    suggestForHazards(req, companyId, projectId, taskDescription, hazardCategories, hazardDescriptions, energyTypes, focusedHazardCategory, focusedHazardDescription, focusedHazardEnergyTypes, existingControls) {
        const actor = req.user;
        const effectiveCompanyId = this.tenant.effectiveCompanyId(actor, companyId ? parseInt(companyId, 10) : undefined);
        return this.catalog.suggestControlsForHazards(effectiveCompanyId, projectId ? parseInt(projectId, 10) : undefined, {
            taskDescription,
            hazardCategories: hazardCategories === null || hazardCategories === void 0 ? void 0 : hazardCategories.split(',').filter(Boolean),
            hazardDescriptions: hazardDescriptions === null || hazardDescriptions === void 0 ? void 0 : hazardDescriptions.split('|').filter(Boolean),
            energyTypes: energyTypes === null || energyTypes === void 0 ? void 0 : energyTypes.split(',').filter(Boolean),
            focusedHazardCategory,
            focusedHazardDescription,
            focusedHazardEnergyTypes: focusedHazardEnergyTypes === null || focusedHazardEnergyTypes === void 0 ? void 0 : focusedHazardEnergyTypes.split(',').filter(Boolean),
            existingControlDescriptions: existingControls === null || existingControls === void 0 ? void 0 : existingControls.split('|').filter(Boolean),
        });
    }
};
exports.ControlCatalogController = ControlCatalogController;
__decorate([
    (0, common_1.Get)(),
    (0, tenant_scoped_decorator_1.TenantScoped)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Query)('projectId')),
    __param(3, (0, common_1.Query)('hazardCategory')),
    __param(4, (0, common_1.Query)('hazardCategories')),
    __param(5, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], ControlCatalogController.prototype, "listControls", null);
__decorate([
    (0, common_1.Get)('suggest'),
    (0, tenant_scoped_decorator_1.TenantScoped)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Query)('projectId')),
    __param(3, (0, common_1.Query)('taskDescription')),
    __param(4, (0, common_1.Query)('hazardCategories')),
    __param(5, (0, common_1.Query)('hazardDescriptions')),
    __param(6, (0, common_1.Query)('energyTypes')),
    __param(7, (0, common_1.Query)('focusedHazardCategory')),
    __param(8, (0, common_1.Query)('focusedHazardDescription')),
    __param(9, (0, common_1.Query)('focusedHazardEnergyTypes')),
    __param(10, (0, common_1.Query)('existingControls')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], ControlCatalogController.prototype, "suggestForHazards", null);
exports.ControlCatalogController = ControlCatalogController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/controls`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    (0, require_permission_decorator_1.RequirePermission)(security_types_1.Permission.PM_ACCESS),
    __metadata("design:paramtypes", [hazard_control_catalog_service_1.HazardControlCatalogService,
        tenant_scope_service_1.TenantScopeService])
], ControlCatalogController);
//# sourceMappingURL=hazard-control-catalog.controller.js.map