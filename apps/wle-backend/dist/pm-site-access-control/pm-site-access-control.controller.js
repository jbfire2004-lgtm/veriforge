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
exports.PmSiteAccessControlController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const routes_1 = require("../config/routes");
const pm_site_access_control_service_1 = require("./pm-site-access-control.service");
const pm_site_access_cail_intelligence_service_1 = require("./pm-site-access-cail-intelligence.service");
const PM_ROLES = [
    client_1.UserRole.WORKER,
    client_1.UserRole.SUPERVISOR,
    client_1.UserRole.ADMIN,
    client_1.UserRole.SUPER_ADMIN,
    client_1.UserRole.COMPANY_ADMIN,
    client_1.UserRole.PROJECT_MANAGER,
];
const SUPERVISOR_ROLES = [
    client_1.UserRole.SUPERVISOR,
    client_1.UserRole.ADMIN,
    client_1.UserRole.SUPER_ADMIN,
    client_1.UserRole.COMPANY_ADMIN,
    client_1.UserRole.PROJECT_MANAGER,
];
let PmSiteAccessControlController = class PmSiteAccessControlController {
    constructor(access, cail) {
        this.access = access;
        this.cail = cail;
    }
    validate(body, req) {
        return this.access.validateAccess(Object.assign(Object.assign({}, body), { actorId: req.user.id, recordAttempt: true }));
    }
    listPoints(companyId, projectId) {
        return this.access.listAccessPoints(parseInt(companyId, 10), projectId ? parseInt(projectId, 10) : undefined);
    }
    createPoint(body, req) {
        return this.access.createAccessPoint(body, req.user.id);
    }
    listRules(projectId) {
        return this.access.listZoneRules(parseInt(projectId, 10));
    }
    upsertRule(body, req) {
        return this.access.upsertZoneRule(body, req.user.id);
    }
    createOverride(body, req) {
        return this.access.createOverride(body, req.user.id);
    }
    listOverrides(projectId) {
        return this.access.listOverrides(parseInt(projectId, 10));
    }
    revokeOverride(id, req) {
        return this.access.revokeOverride(id, req.user.id);
    }
    analytics(projectId) {
        return this.access.analytics(parseInt(projectId, 10));
    }
    intelligence(projectId) {
        return this.cail.projectInsights(parseInt(projectId, 10));
    }
    syncBundle(projectId) {
        return this.access.syncBundle(parseInt(projectId, 10));
    }
    stationValidate(body) {
        return this.access.stationValidate(body);
    }
    offlineSync(body, req) {
        return this.access.applyOfflineSync(body.projectId, body, req.user.id);
    }
};
exports.PmSiteAccessControlController = PmSiteAccessControlController;
__decorate([
    (0, common_1.Post)('validate'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmSiteAccessControlController.prototype, "validate", null);
__decorate([
    (0, common_1.Get)('access-points'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PmSiteAccessControlController.prototype, "listPoints", null);
__decorate([
    (0, common_1.Post)('access-points'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmSiteAccessControlController.prototype, "createPoint", null);
__decorate([
    (0, common_1.Get)('zone-rules'),
    __param(0, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmSiteAccessControlController.prototype, "listRules", null);
__decorate([
    (0, common_1.Post)('zone-rules'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmSiteAccessControlController.prototype, "upsertRule", null);
__decorate([
    (0, common_1.Post)('overrides'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmSiteAccessControlController.prototype, "createOverride", null);
__decorate([
    (0, common_1.Get)('overrides'),
    __param(0, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmSiteAccessControlController.prototype, "listOverrides", null);
__decorate([
    (0, common_1.Post)('overrides/:id/revoke'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmSiteAccessControlController.prototype, "revokeOverride", null);
__decorate([
    (0, common_1.Get)('analytics/project/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmSiteAccessControlController.prototype, "analytics", null);
__decorate([
    (0, common_1.Get)('intelligence/project/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmSiteAccessControlController.prototype, "intelligence", null);
__decorate([
    (0, common_1.Get)('sync/project/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmSiteAccessControlController.prototype, "syncBundle", null);
__decorate([
    (0, common_1.Post)('station/validate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PmSiteAccessControlController.prototype, "stationValidate", null);
__decorate([
    (0, common_1.Post)('offline/sync'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmSiteAccessControlController.prototype, "offlineSync", null);
exports.PmSiteAccessControlController = PmSiteAccessControlController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/pm/site-access-control`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    __metadata("design:paramtypes", [pm_site_access_control_service_1.PmSiteAccessControlService,
        pm_site_access_cail_intelligence_service_1.PmSiteAccessCailIntelligenceService])
], PmSiteAccessControlController);
//# sourceMappingURL=pm-site-access-control.controller.js.map