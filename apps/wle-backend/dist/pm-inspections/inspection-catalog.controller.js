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
exports.InspectionCatalogController = void 0;
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
const inspection_catalog_service_1 = require("./inspection-catalog.service");
const PM_ROLES = [
    client_1.UserRole.WORKER,
    client_1.UserRole.SUPERVISOR,
    client_1.UserRole.ADMIN,
    client_1.UserRole.SUPER_ADMIN,
    client_1.UserRole.COMPANY_ADMIN,
    client_1.UserRole.PROJECT_MANAGER,
];
let InspectionCatalogController = class InspectionCatalogController {
    constructor(catalog, tenant) {
        this.catalog = catalog;
        this.tenant = tenant;
    }
    listTemplates(req, companyId, projectId, kind, status, autoSeed) {
        const actor = req.user;
        const effectiveCompanyId = this.tenant.effectiveCompanyId(actor, companyId ? parseInt(companyId, 10) : undefined);
        return this.catalog.listPmTemplates(effectiveCompanyId, projectId ? parseInt(projectId, 10) : undefined, {
            kind,
            status,
            autoSeed: autoSeed !== 'false',
        });
    }
    getSmart(req, companyId, projectId) {
        const actor = req.user;
        const effectiveCompanyId = this.tenant.effectiveCompanyId(actor, companyId ? parseInt(companyId, 10) : undefined);
        return this.catalog.getSmartCatalog(effectiveCompanyId, projectId ? parseInt(projectId, 10) : undefined);
    }
    listPmChecklists(req, companyId, projectId) {
        const actor = req.user;
        const effectiveCompanyId = this.tenant.effectiveCompanyId(actor, companyId ? parseInt(companyId, 10) : undefined);
        return this.catalog.listUnifiedChecklists(effectiveCompanyId, projectId ? parseInt(projectId, 10) : undefined);
    }
};
exports.InspectionCatalogController = InspectionCatalogController;
__decorate([
    (0, common_1.Get)('templates'),
    (0, tenant_scoped_decorator_1.TenantScoped)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Query)('projectId')),
    __param(3, (0, common_1.Query)('kind')),
    __param(4, (0, common_1.Query)('status')),
    __param(5, (0, common_1.Query)('autoSeed')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], InspectionCatalogController.prototype, "listTemplates", null);
__decorate([
    (0, common_1.Get)('smart'),
    (0, tenant_scoped_decorator_1.TenantScoped)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], InspectionCatalogController.prototype, "getSmart", null);
__decorate([
    (0, common_1.Get)('checklists/pm'),
    (0, tenant_scoped_decorator_1.TenantScoped)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], InspectionCatalogController.prototype, "listPmChecklists", null);
exports.InspectionCatalogController = InspectionCatalogController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/inspections`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    (0, require_permission_decorator_1.RequirePermission)(security_types_1.Permission.PM_ACCESS),
    __metadata("design:paramtypes", [inspection_catalog_service_1.InspectionCatalogService,
        tenant_scope_service_1.TenantScopeService])
], InspectionCatalogController);
//# sourceMappingURL=inspection-catalog.controller.js.map