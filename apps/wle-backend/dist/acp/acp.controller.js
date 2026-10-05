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
exports.AcpController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
const routes_1 = require("../config/routes");
const acp_access_guard_1 = require("./acp-access.guard");
const acp_access_service_1 = require("./acp-access.service");
const acp_service_1 = require("./acp.service");
const acp_permission_decorator_1 = require("./decorators/acp-permission.decorator");
const ACP_ADMIN_ROLES = [client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN];
let AcpController = class AcpController {
    constructor(acp, access) {
        this.acp = acp;
        this.access = access;
    }
    listTenants() {
        return this.acp.listTenants();
    }
    getTenant(id) {
        return this.acp.getTenant(id);
    }
    createTenant(body, req) {
        return this.acp.createTenant(body, req.user.id);
    }
    updateTenant(id, body, req) {
        return this.acp.updateTenant(id, body, req.user.id);
    }
    deleteTenant(id, req) {
        return this.acp.deleteTenant(id, req.user.id);
    }
    listUsers(tenantId) {
        return this.acp.listUsers(tenantId);
    }
    createUser(body, req) {
        return this.acp.createUser(body, req.user.id);
    }
    getUser(userId) {
        return this.acp.getUser(parseInt(userId, 10));
    }
    deleteUser(userId, req) {
        return this.acp.deleteUser(parseInt(userId, 10), req.user.id);
    }
    updateUser(userId, body, req) {
        return this.acp.updateUser(parseInt(userId, 10), body, req.user.id);
    }
    assignUserTenant(userId, body, req) {
        return this.acp.assignUserTenant(parseInt(userId, 10), body.tenantId, req.user.id);
    }
    setUserActive(userId, body, req) {
        return this.acp.setUserActive(parseInt(userId, 10), body.active, req.user.id);
    }
    listRoles(tenantId) {
        return this.acp.listRoles(tenantId);
    }
    createRole(body, req) {
        return this.acp.createRole(body, req.user.id);
    }
    updateRole(id, body, req) {
        return this.acp.updateRole(id, body, req.user.id);
    }
    deleteRole(id, req) {
        return this.acp.deleteRole(id, req.user.id);
    }
    assignRole(userId, body, req) {
        return this.acp.assignUserRole(parseInt(userId, 10), body.roleId, body.tenantId, req.user.id);
    }
    removeRole(userId, roleId, tenantId, req) {
        return this.acp.removeUserRole(parseInt(userId, 10), roleId, tenantId, req.user.id);
    }
    listPermissions() {
        return this.acp.listPermissions();
    }
    permissionMatrix() {
        return this.acp.getPermissionMatrix();
    }
    setRolePermissions(roleId, body, req) {
        return this.acp.setRolePermissions(roleId, body.permissionIds, req.user.id);
    }
    listTiers() {
        return this.acp.listTiers();
    }
    assignSubscription(tenantId, body, req) {
        return this.acp.assignTenantSubscription(tenantId, body.tierId, body.status, req.user.id);
    }
    assignAddons(tenantId, body, req) {
        var _a;
        return this.acp.setTenantFeatureKeys(tenantId, body.featureKeys, (_a = body.enabled) !== null && _a !== void 0 ? _a : true, req.user.id);
    }
    setTenantModules(tenantId, body, req) {
        return this.acp.setTenantModules(tenantId, body.featureKeys, req.user.id);
    }
    listFeatures() {
        return this.acp.listFeatureFlags();
    }
    toggleTenantFeature(tenantId, featureFlagId, body, req) {
        return this.acp.setTenantFeatureFlag(tenantId, featureFlagId, body.enabled, req.user.id);
    }
    updateFeatureDefault(id, body, req) {
        return this.acp.updateFeatureFlagDefault(id, body.defaultEnabled, req.user.id);
    }
    auditLogs(tenantId, limit) {
        return this.acp.listAuditLogs({
            tenantId,
            limit: limit ? parseInt(limit, 10) : undefined,
        });
    }
};
exports.AcpController = AcpController;
__decorate([
    (0, common_1.Get)('tenants'),
    (0, acp_permission_decorator_1.RequireAcpPermission)('acp.tenants.read'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AcpController.prototype, "listTenants", null);
__decorate([
    (0, common_1.Get)('tenants/:id'),
    (0, acp_permission_decorator_1.RequireAcpPermission)('acp.tenants.read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AcpController.prototype, "getTenant", null);
__decorate([
    (0, common_1.Post)('tenants'),
    (0, acp_permission_decorator_1.RequireAcpPermission)('acp.tenants.write'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AcpController.prototype, "createTenant", null);
__decorate([
    (0, common_1.Put)('tenants/:id'),
    (0, acp_permission_decorator_1.RequireAcpPermission)('acp.tenants.write'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], AcpController.prototype, "updateTenant", null);
__decorate([
    (0, common_1.Delete)('tenants/:id'),
    (0, acp_permission_decorator_1.RequireAcpPermission)('acp.tenants.write'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AcpController.prototype, "deleteTenant", null);
__decorate([
    (0, common_1.Get)('users'),
    (0, acp_permission_decorator_1.RequireAcpPermission)('acp.users.read'),
    __param(0, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AcpController.prototype, "listUsers", null);
__decorate([
    (0, common_1.Post)('users'),
    (0, acp_permission_decorator_1.RequireAcpPermission)('acp.users.write'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AcpController.prototype, "createUser", null);
__decorate([
    (0, common_1.Get)('users/:userId'),
    (0, acp_permission_decorator_1.RequireAcpPermission)('acp.users.read'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AcpController.prototype, "getUser", null);
__decorate([
    (0, common_1.Delete)('users/:userId'),
    (0, acp_permission_decorator_1.RequireAcpPermission)('acp.users.write'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AcpController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Put)('users/:userId'),
    (0, acp_permission_decorator_1.RequireAcpPermission)('acp.users.write'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], AcpController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Put)('users/:userId/tenant'),
    (0, acp_permission_decorator_1.RequireAcpPermission)('acp.users.write'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], AcpController.prototype, "assignUserTenant", null);
__decorate([
    (0, common_1.Put)('users/:userId/active'),
    (0, acp_permission_decorator_1.RequireAcpPermission)('acp.users.write'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], AcpController.prototype, "setUserActive", null);
__decorate([
    (0, common_1.Get)('roles'),
    (0, acp_permission_decorator_1.RequireAcpPermission)('acp.users.read'),
    __param(0, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AcpController.prototype, "listRoles", null);
__decorate([
    (0, common_1.Post)('roles'),
    (0, acp_permission_decorator_1.RequireAcpPermission)('acp.users.write'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AcpController.prototype, "createRole", null);
__decorate([
    (0, common_1.Put)('roles/:id'),
    (0, acp_permission_decorator_1.RequireAcpPermission)('acp.users.write'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], AcpController.prototype, "updateRole", null);
__decorate([
    (0, common_1.Delete)('roles/:id'),
    (0, acp_permission_decorator_1.RequireAcpPermission)('acp.users.write'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AcpController.prototype, "deleteRole", null);
__decorate([
    (0, common_1.Post)('users/:userId/roles'),
    (0, acp_permission_decorator_1.RequireAcpPermission)('acp.users.write'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], AcpController.prototype, "assignRole", null);
__decorate([
    (0, common_1.Delete)('users/:userId/roles/:roleId'),
    (0, acp_permission_decorator_1.RequireAcpPermission)('acp.users.write'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('roleId')),
    __param(2, (0, common_1.Query)('tenantId')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", void 0)
], AcpController.prototype, "removeRole", null);
__decorate([
    (0, common_1.Get)('permissions'),
    (0, acp_permission_decorator_1.RequireAcpPermission)('acp.manage'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AcpController.prototype, "listPermissions", null);
__decorate([
    (0, common_1.Get)('permissions/matrix'),
    (0, acp_permission_decorator_1.RequireAcpPermission)('acp.manage'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AcpController.prototype, "permissionMatrix", null);
__decorate([
    (0, common_1.Put)('roles/:roleId/permissions'),
    (0, acp_permission_decorator_1.RequireAcpPermission)('acp.manage'),
    __param(0, (0, common_1.Param)('roleId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], AcpController.prototype, "setRolePermissions", null);
__decorate([
    (0, common_1.Get)('subscriptions/tiers'),
    (0, acp_permission_decorator_1.RequireAcpPermission)('acp.tenants.read'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AcpController.prototype, "listTiers", null);
__decorate([
    (0, common_1.Put)('tenants/:tenantId/subscription'),
    (0, acp_permission_decorator_1.RequireAcpPermission)('acp.tenants.write'),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], AcpController.prototype, "assignSubscription", null);
__decorate([
    (0, common_1.Put)('tenants/:tenantId/addons'),
    (0, acp_permission_decorator_1.RequireAcpPermission)('acp.tenants.write'),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], AcpController.prototype, "assignAddons", null);
__decorate([
    (0, common_1.Put)('tenants/:tenantId/modules'),
    (0, acp_permission_decorator_1.RequireAcpPermission)('acp.tenants.write'),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], AcpController.prototype, "setTenantModules", null);
__decorate([
    (0, common_1.Get)('features'),
    (0, acp_permission_decorator_1.RequireAcpPermission)('acp.manage'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AcpController.prototype, "listFeatures", null);
__decorate([
    (0, common_1.Put)('tenants/:tenantId/features/:featureFlagId'),
    (0, acp_permission_decorator_1.RequireAcpPermission)('acp.tenants.write'),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('featureFlagId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", void 0)
], AcpController.prototype, "toggleTenantFeature", null);
__decorate([
    (0, common_1.Put)('features/:id/default'),
    (0, acp_permission_decorator_1.RequireAcpPermission)('acp.manage'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], AcpController.prototype, "updateFeatureDefault", null);
__decorate([
    (0, common_1.Get)('audit-logs'),
    (0, acp_permission_decorator_1.RequireAcpPermission)('acp.manage'),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AcpController.prototype, "auditLogs", null);
exports.AcpController = AcpController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, acp_access_guard_1.AcpAccessGuard),
    (0, roles_decorator_1.Roles)(...ACP_ADMIN_ROLES),
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/acp`),
    __metadata("design:paramtypes", [acp_service_1.AcpService,
        acp_access_service_1.AcpAccessService])
], AcpController);
//# sourceMappingURL=acp.controller.js.map